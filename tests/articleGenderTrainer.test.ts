import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createRenderer, createSSRApp, defineComponent, h, nextTick, reactive } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { compileScript, parse } from '@vue/compiler-sfc'
import ts from 'typescript'
import { articleGenderNouns, verifiedArticleNounRecords } from '../src/data/trainers/verifiedArticleNouns.ts'
import { words } from '../src/data/words.ts'
import { useArticleGenderSession } from '../src/composables/useArticleGenderSession.ts'
import { trainerRoutes } from '../src/data/trainers/routes.ts'
import {
  ARTICLE_GENDER_HISTORY_KEY,
  ARTICLE_GENDER_MAX_ERROR_QUEUE,
  createArticleGenderHistory,
  loadArticleGenderHistory,
  reconcileArticleGenderHistory,
  recordArticleGenderAnswer,
  type ArticleGenderStorage,
} from '../src/lib/trainers/articleGender/articleGenderHistory.ts'
import {
  ARTICLE_GENDER_MAX_ERROR_REPEATS,
  ARTICLE_GENDER_ROUND_COUNT,
  ARTICLE_GENDER_SESSION_SIZE,
  advanceArticleGenderQuestion,
  answerArticleGenderQuestion,
  createArticleGenderSession,
  currentArticleGenderQuestion,
  getArticleGenderResults,
} from '../src/lib/trainers/articleGender/articleGenderSession.ts'
import { NOMINATIVE_ARTICLES } from '../src/lib/trainers/articleGender/articleGenderTypes.ts'
import { ARTICLE_GENDER_REFERENCE } from './fixtures/articleGenderReference.ts'

function seeded(seed: number): () => number {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 0x100000000
  }
}

class MemoryStorage implements ArticleGenderStorage {
  values = new Map<string, string>()
  unavailable = false

  getItem(key: string): string | null {
    if (this.unavailable) throw new Error('Storage unavailable')
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    if (this.unavailable) throw new Error('Storage unavailable')
    this.values.set(key, value)
  }
}

function flatQuestions(session: ReturnType<typeof createArticleGenderSession>) {
  return session.rounds.flatMap((round) => round.questions)
}

interface TestRendererNode {
  tag: string
  props: Record<string, unknown>
  children: TestRendererNode[]
  parent: TestRendererNode | null
  text: string
  focus: () => void
}

function createAccessibilityRenderer() {
  let focusedNode: TestRendererNode | null = null
  const renderer = createRenderer<TestRendererNode, TestRendererNode>({
    createElement(tag) {
      const node: TestRendererNode = {
        tag,
        props: {},
        children: [],
        parent: null,
        text: '',
        focus() { focusedNode = node },
      }
      return node
    },
    createText(text) {
      return { tag: '#text', props: {}, children: [], parent: null, text, focus() {} }
    },
    createComment(text) {
      return { tag: '#comment', props: {}, children: [], parent: null, text, focus() {} }
    },
    setText(node, text) { node.text = text },
    setElementText(node, text) {
      node.children = []
      node.text = text
    },
    patchProp(node, key, _previous, next) {
      if (next === null || next === undefined) delete node.props[key]
      else node.props[key] = next
    },
    insert(node, parent, anchor = null) {
      if (node.parent) {
        const previousIndex = node.parent.children.indexOf(node)
        if (previousIndex >= 0) node.parent.children.splice(previousIndex, 1)
      }
      const anchorIndex = anchor ? parent.children.indexOf(anchor) : -1
      if (anchorIndex < 0) parent.children.push(node)
      else parent.children.splice(anchorIndex, 0, node)
      node.parent = parent
    },
    remove(node) {
      if (!node.parent) return
      const index = node.parent.children.indexOf(node)
      if (index >= 0) node.parent.children.splice(index, 1)
      node.parent = null
    },
    parentNode: (node) => node.parent,
    nextSibling(node) {
      if (!node.parent) return null
      return node.parent.children[node.parent.children.indexOf(node) + 1] ?? null
    },
  })

  return { renderer, getFocusedNode: () => focusedNode }
}

function findRendererNodes(root: TestRendererNode, predicate: (node: TestRendererNode) => boolean): TestRendererNode[] {
  const matches = predicate(root) ? [root] : []
  return root.children.reduce((all, child) => all.concat(findRendererNodes(child, predicate)), matches)
}

function rendererText(node: TestRendererNode): string {
  return node.text + node.children.map(rendererText).join('')
}

test('T10 bank contains reviewed dictionary nouns with balanced article counts', async () => {
  const candidateCount = words.filter((word) => word.partOfSpeech.includes('noun')).length
  assert.ok(candidateCount >= verifiedArticleNounRecords.length)
  assert.equal(verifiedArticleNounRecords.length, 100)
  assert.equal(verifiedArticleNounRecords.length, Object.keys(ARTICLE_GENDER_REFERENCE).length)
  assert.ok(verifiedArticleNounRecords.length >= 90)
  assert.equal(articleGenderNouns.length, verifiedArticleNounRecords.length)
  assert.deepEqual(articleGenderNouns.map((noun) => noun.wordId), verifiedArticleNounRecords.map((noun) => noun.wordId))
  assert.equal(new Set(verifiedArticleNounRecords.map((noun) => noun.wordId)).size, verifiedArticleNounRecords.length)

  for (const noun of articleGenderNouns) {
    const word = words.find((entry) => entry.greek === noun.wordId)
    assert.ok(word, noun.wordId)
    assert.ok(word.partOfSpeech.includes('noun'), noun.wordId)
    assert.equal(noun.greek, word.greek)
    assert.equal(noun.russian, word.russian)
    assert.ok(noun.greek.trim() && !/\s/.test(noun.greek), noun.wordId)
    assert.ok(NOMINATIVE_ARTICLES.includes(noun.article), noun.wordId)
    const source = new URL(noun.sourceUrl)
    assert.equal(source.hostname, 'www.greek-language.gr')
    assert.match(source.pathname, /triantafyllides\/search\.html$/)
    assert.ok(source.searchParams.get('lq')?.trim(), noun.wordId)
  }

  const distribution = Object.fromEntries(NOMINATIVE_ARTICLES.map((article) => [
    article,
    articleGenderNouns.filter((noun) => noun.article === article).length,
  ]))
  assert.deepEqual(distribution, { ο: 31, η: 33, το: 36 })
  assert.ok(Object.values(distribution).every((count) => count >= 25))
  assert.deepEqual(
    Object.fromEntries(Object.entries(ARTICLE_GENDER_REFERENCE).sort()),
    Object.fromEntries(verifiedArticleNounRecords.map(({ wordId, article }) => [wordId, article]).sort(([a], [b]) => a.localeCompare(b, 'el'))),
  )
  assert.equal(Object.keys(ARTICLE_GENDER_REFERENCE).length, articleGenderNouns.length)
  assert.equal(articleGenderNouns.find((noun) => noun.wordId === 'περιπτεράς')?.article, 'ο')
  assert.equal(articleGenderNouns.find((noun) => noun.wordId === 'καφετζής')?.article, 'ο')
  assert.equal(articleGenderNouns.find((noun) => noun.wordId === 'στάδιο')?.article, 'το')
  assert.equal(articleGenderNouns.find((noun) => noun.wordId === 'μαθητής')?.article, 'ο')
  assert.equal(articleGenderNouns.find((noun) => noun.wordId === 'σκύλος')?.article, 'ο')
  assert.equal(articleGenderNouns.find((noun) => noun.wordId === 'πιρούνι')?.article, 'το')
  const audit = await readFile(new URL('../docs/t10-content-audit.md', import.meta.url), 'utf8')
  assert.equal((audit.match(/^\| [^|]+ \| [^|]+ \| (?:ο|η|το) \|/gm) ?? []).length, articleGenderNouns.length)
  for (const noun of articleGenderNouns) {
    assert.ok(audit.includes(noun.greek), noun.wordId)
    assert.ok(audit.includes(noun.sourceUrl), noun.wordId)
  }
  assert.equal(ARTICLE_GENDER_REFERENCE['περίοδος'], 'η')
  assert.equal(ARTICLE_GENDER_REFERENCE['παράγραφος'], 'η')
  assert.equal(ARTICLE_GENDER_REFERENCE['πρόβλημα'], 'το')
  assert.equal(ARTICLE_GENDER_REFERENCE['τηλεκάρτα'], 'η')
  assert.equal(ARTICLE_GENDER_REFERENCE['τσιγάρο'], 'το')
  assert.equal(ARTICLE_GENDER_REFERENCE['πακέτο'], 'το')
  assert.equal(ARTICLE_GENDER_REFERENCE['πανεπιστήμιο'], 'το')
  assert.ok(articleGenderNouns.find((noun) => noun.wordId === 'ταξί')?.sourceUrl.includes('lq=%CF%84%CE%B1%CE%BE%CE%AF'))

  const excluded = new Set(verifiedArticleNounRecords.map((noun) => noun.wordId))
  for (const ambiguous of ['κύριε', 'γιατρός', 'ξένος', 'αγγλικά', 'ελληνικά', 'μαθηματικά', 'αθλητικά', 'ναρκωτικά', 'χρονών', 'Έλληνας', 'Ελληνίδα', 'Αμερικανός', 'Αμερικανίδα', 'Γάλλος', 'Γαλλίδα']) {
    assert.equal(excluded.has(ambiguous), false, `${ambiguous} must not be included`)
  }
})

test('five rounds contain twenty unique words and balanced, round-level gender coverage', () => {
  const history = createArticleGenderHistory(articleGenderNouns.map((noun) => noun.wordId), seeded(31))
  const session = createArticleGenderSession(articleGenderNouns, history, seeded(32))
  const questions = flatQuestions(session)
  assert.equal(session.rounds.length, ARTICLE_GENDER_ROUND_COUNT)
  assert.ok(session.rounds.every((round) => round.questions.length === 4))
  assert.equal(questions.length, ARTICLE_GENDER_SESSION_SIZE)
  assert.equal(new Set(questions.map((question) => question.noun.wordId)).size, 20)
  assert.deepEqual(
    Object.fromEntries(NOMINATIVE_ARTICLES.map((article) => [article, questions.filter((question) => question.noun.article === article).length])),
    { ο: 7, η: 7, το: 6 },
  )
  assert.ok(session.rounds.every((round) => new Set(round.questions.map((question) => question.noun.article)).size === 3))
  assert.ok(questions.every((question) => question.optionOrder.length === 3))
  assert.ok(questions.every((question) => new Set(question.optionOrder).size === 3))
  assert.ok(questions.every((question) => NOMINATIVE_ARTICLES.every((article) => question.optionOrder.includes(article))))
})

test('first answer is locked; advancement is explicit; result scoring uses only first choices', () => {
  let session = createArticleGenderSession(
    articleGenderNouns,
    createArticleGenderHistory(articleGenderNouns.map((noun) => noun.wordId), seeded(33)),
    seeded(34),
  )
  assert.equal(advanceArticleGenderQuestion(session).outcome, 'not-answered')
  let expectedCorrect = 0
  for (let index = 0; index < ARTICLE_GENDER_SESSION_SIZE; index += 1) {
    const current = currentArticleGenderQuestion(session)!
    const selected = index % 2 === 0
      ? current.noun.article
      : NOMINATIVE_ARTICLES.find((article) => article !== current.noun.article)!
    const result = answerArticleGenderQuestion(session, selected)
    assert.equal(result.outcome, 'answered')
    assert.equal(result.isCorrect, selected === current.noun.article)
    expectedCorrect += Number(result.isCorrect)
    assert.equal(answerArticleGenderQuestion(result.session, current.noun.article).outcome, 'already-answered')
    if (index < ARTICLE_GENDER_SESSION_SIZE - 1) {
      const advanced = advanceArticleGenderQuestion(result.session)
      assert.equal(advanced.outcome, 'answered')
      session = advanced.session
    } else {
      const completed = advanceArticleGenderQuestion(result.session)
      assert.equal(completed.outcome, 'session-completed')
      session = completed.session
    }
  }
  assert.equal(session.completed, true)
  assert.equal(answerArticleGenderQuestion(session, 'το').outcome, 'session-completed')
  const results = getArticleGenderResults(session)
  assert.equal(results.totalWords, 20)
  assert.equal(results.correctAnswers, expectedCorrect)
  assert.equal(results.errors, 10)
  assert.equal(results.accuracyPercent, 50)
  assert.equal(results.mistakes.length, 10)
  assert.ok(results.mistakes.every((mistake) => mistake.selectedArticle !== mistake.correctArticle))
})

test('history changes only for answered nouns, prioritizes at most four queued errors, and clears corrected errors', () => {
  const ids = articleGenderNouns.map((noun) => noun.wordId)
  const history = createArticleGenderHistory(ids, seeded(35))
  const errors = articleGenderNouns.slice(0, 10).map((noun) => noun.wordId)
  const pending: typeof history = { ...history, completedIds: errors, mistakeQueue: errors }
  const selected = flatQuestions(createArticleGenderSession(articleGenderNouns, pending, seeded(36)))
  assert.equal(selected.filter((question) => errors.includes(question.noun.wordId)).length, ARTICLE_GENDER_MAX_ERROR_REPEATS)
  assert.ok(selected.filter((question) => errors.includes(question.noun.wordId)).length <= ARTICLE_GENDER_MAX_ERROR_REPEATS)
  assert.equal(selected.filter((question) => !errors.includes(question.noun.wordId)).length, 20 - ARTICLE_GENDER_MAX_ERROR_REPEATS)
  assert.equal(new Set(selected.map((question) => question.noun.wordId)).size, 20)

  const word = articleGenderNouns[4]!
  const wrong = recordArticleGenderAnswer(history, word.wordId, false, articleGenderNouns, { random: seeded(37), beginsSession: true })
  assert.deepEqual(wrong.completedIds, [word.wordId])
  assert.deepEqual(wrong.mistakeQueue, [word.wordId])
  assert.equal(wrong.sessionCount, history.sessionCount + 1)
  const corrected = recordArticleGenderAnswer(wrong, word.wordId, true, articleGenderNouns, { random: seeded(38) })
  assert.equal(corrected.mistakeQueue.includes(word.wordId), false)
  assert.ok(corrected.completedIds.includes(word.wordId))

  let bounded = history
  for (const noun of articleGenderNouns.slice(0, ARTICLE_GENDER_MAX_ERROR_QUEUE + 3)) {
    bounded = recordArticleGenderAnswer(bounded, noun.wordId, false, articleGenderNouns, { random: seeded(39) })
  }
  assert.equal(bounded.mistakeQueue.length, ARTICLE_GENDER_MAX_ERROR_QUEUE)
})

test('versioned history tolerates invalid or unavailable storage and reconciles dictionary changes', () => {
  const storage = new MemoryStorage()
  const first = loadArticleGenderHistory(articleGenderNouns, seeded(40), storage)
  assert.equal(first.order.length, articleGenderNouns.length)
  assert.equal(storage.values.size, 0)
  storage.values.set(ARTICLE_GENDER_HISTORY_KEY, '{broken')
  assert.doesNotThrow(() => loadArticleGenderHistory(articleGenderNouns, seeded(41), storage))

  const expanded = [...articleGenderNouns, { ...articleGenderNouns[0]!, wordId: 'νέο', greek: 'νέο' }]
  const reconciled = reconcileArticleGenderHistory({
    ...first,
    order: [...first.order, 'removed', 'καφές'],
    completedIds: [first.order[0]!, 'removed'],
    mistakeQueue: [first.order[1]!, 'removed'],
  }, expanded.map((noun) => noun.wordId), seeded(42))
  assert.equal(new Set(reconciled.order).size, expanded.length)
  assert.ok(reconciled.order.includes('νέο'))
  assert.ok(!reconciled.order.includes('removed'))
  assert.ok(!reconciled.completedIds.includes('removed'))
  assert.ok(!reconciled.mistakeQueue.includes('removed'))
  storage.unavailable = true
  assert.doesNotThrow(() => {
    const unavailable = loadArticleGenderHistory(articleGenderNouns, seeded(43), storage)
    recordArticleGenderAnswer(unavailable, articleGenderNouns[0]!.wordId, false, articleGenderNouns)
  })
})

test('ten sequential sessions cover the whole bank; 100 fixed seeds preserve balance and option variety', () => {
  const ids = articleGenderNouns.map((noun) => noun.wordId)
  let history = createArticleGenderHistory(ids, seeded(44))
  const seen = new Set<string>()
  for (let run = 0; run < 10; run += 1) {
    const session = createArticleGenderSession(articleGenderNouns, history, seeded(100 + run))
    for (const question of flatQuestions(session)) {
      seen.add(question.noun.wordId)
      history = recordArticleGenderAnswer(history, question.noun.wordId, true, articleGenderNouns, {
        random: seeded(200 + run),
        beginsSession: question === session.rounds[0]!.questions[0],
      })
    }
    if (run === 5) assert.equal(seen.size, ids.length, 'six sessions should complete one full cycle')
  }
  assert.equal(seen.size, ids.length)
  assert.ok(history.sessionCount >= 10)
  assert.ok(history.cycle >= 1)

  const optionOrders = new Set<string>()
  for (let seed = 0; seed < 100; seed += 1) {
    const seededHistory = createArticleGenderHistory(ids, seeded(seed))
    const session = createArticleGenderSession(articleGenderNouns, seededHistory, seeded(seed + 1000))
    const questions = flatQuestions(session)
    assert.equal(new Set(questions.map((question) => question.noun.wordId)).size, 20, `seed ${seed}`)
    assert.ok(session.rounds.every((round) => round.questions.length === 4 && new Set(round.questions.map((question) => question.noun.article)).size === 3), `seed ${seed}`)
    for (const question of questions) optionOrders.add(question.optionOrder.join(''))
  }
  assert.ok(optionOrders.size >= 6, `only ${optionOrders.size} option permutations appeared`)

  const rotatingCounts = [
    { ο: 7, η: 7, το: 6 },
    { ο: 6, η: 7, το: 7 },
    { ο: 7, η: 6, το: 7 },
  ]
  for (let sessionCount = 0; sessionCount < rotatingCounts.length; sessionCount += 1) {
    const rotationHistory = { ...createArticleGenderHistory(ids, seeded(150 + sessionCount)), sessionCount }
    const rotated = createArticleGenderSession(articleGenderNouns, rotationHistory, seeded(160 + sessionCount))
    assert.deepEqual(
      Object.fromEntries(NOMINATIVE_ARTICLES.map((article) => [article, flatQuestions(rotated).filter((question) => question.noun.article === article).length])),
      rotatingCounts[sessionCount],
    )
  }
})

test('starting a composable session does not save progress; each accepted answer is persisted once', () => {
  const storage = new MemoryStorage()
  const trainer = useArticleGenderSession({ storage, random: seeded(45) })
  trainer.start()
  assert.equal(storage.values.size, 0)
  const first = trainer.currentQuestion.value!
  trainer.answer(first.noun.article)
  const saved = storage.values.get(ARTICLE_GENDER_HISTORY_KEY)!
  const afterFirst = JSON.parse(saved)
  assert.deepEqual(afterFirst.completedIds, [first.noun.wordId])
  trainer.answer(first.noun.article === 'ο' ? 'η' : 'ο')
  assert.equal(storage.values.get(ARTICLE_GENDER_HISTORY_KEY), saved)
  trainer.advance()
  const second = trainer.currentQuestion.value!
  trainer.answer(second.noun.article === 'ο' ? 'η' : 'ο')
  const afterSecond = JSON.parse(storage.values.get(ARTICLE_GENDER_HISTORY_KEY)!)
  assert.equal(afterSecond.completedIds.length, 2)
  assert.equal(afterSecond.mistakeQueue.length, 1)
  trainer.start()
  assert.equal(JSON.parse(storage.values.get(ARTICLE_GENDER_HISTORY_KEY)!).completedIds.length, 2)
  assert.doesNotThrow(() => {
    storage.unavailable = true
    const memoryOnly = useArticleGenderSession({ storage, random: seeded(46) })
    memoryOnly.start()
    memoryOnly.answer(memoryOnly.currentQuestion.value!.noun.article)
  })
})

test('T10 route, catalog entry, and button-only accessible UI are registered', async () => {
  const router = createRouter({ history: createMemoryHistory(), routes: trainerRoutes })
  assert.equal(router.resolve('/trainers/noun-articles').name, 'trainer-noun-articles')
  const catalog = await readFile(new URL('../src/pages/TrainersPage.vue', import.meta.url), 'utf8')
  assert.match(catalog, /Выбери правильный артикль/)
  assert.match(catalog, /to="\/trainers\/noun-articles"/)

  const exercisePath = new URL('../src/components/trainers/ArticleGenderExercise.vue', import.meta.url)
  const exerciseSource = await readFile(exercisePath, 'utf8')
  assert.doesNotMatch(exerciseSource, /<(?:input|textarea)\b/i)
  assert.match(exerciseSource, /role="status" aria-live="polite" aria-atomic="true"/)
  assert.match(exerciseSource, /lang="el"/)
  assert.match(exerciseSource, /:disabled="question\.answered"/)
  assert.match(exerciseSource, /@media \(max-width: 420px\)/)
  assert.match(exerciseSource, /@media \(prefers-reduced-motion: reduce\)/)

  const { descriptor } = parse(exerciseSource, { filename: exercisePath.pathname })
  const compiled = compileScript(descriptor, { id: 'article-gender-regression', inlineTemplate: true })
  let code = ts.transpileModule(compiled.content, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText
  code = code
    .replaceAll('"vue"', JSON.stringify(import.meta.resolve('vue')))
    .replaceAll("'vue'", JSON.stringify(import.meta.resolve('vue')))
    .replaceAll("'../../lib/trainers/articleGender/articleGenderTypes.ts'", JSON.stringify(new URL('../src/lib/trainers/articleGender/articleGenderTypes.ts', import.meta.url).href))
  const component = (await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)).default
  const session = createArticleGenderSession(
    articleGenderNouns,
    createArticleGenderHistory(articleGenderNouns.map((noun) => noun.wordId), seeded(47)),
    seeded(48),
  )
  const question = currentArticleGenderQuestion(session)!
  const props = { question, questionNumber: 1, roundNumber: 1, totalQuestions: 20, totalRounds: 5 }
  const before = await renderToString(createSSRApp(component, props))
  assert.ok(before.includes(question.noun.greek))
  assert.ok(before.includes(question.noun.russian))
  assert.ok(!before.includes(`${question.noun.article} ${question.noun.greek}`))
  assert.ok(!before.includes('Правильно. Это слово'))

  const wrong = NOMINATIVE_ARTICLES.find((article) => article !== question.noun.article)!
  question.answered = true
  question.selectedArticle = wrong
  question.isCorrect = false
  const after = await renderToString(createSSRApp(component, props))
  assert.ok(after.includes(`${question.noun.article} ${question.noun.greek}`))
  assert.ok(after.includes(wrong))
  assert.match(after, /disabled/)
  assert.match(after, /Правильный артикль/)

  const resultsPath = new URL('../src/components/trainers/ArticleGenderResults.vue', import.meta.url)
  const resultsSource = await readFile(resultsPath, 'utf8')
  const { descriptor: resultsDescriptor } = parse(resultsSource, { filename: resultsPath.pathname })
  const compiledResults = compileScript(resultsDescriptor, { id: 'article-gender-results-regression', inlineTemplate: true })
  let resultsCode = ts.transpileModule(compiledResults.content, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText
  resultsCode = resultsCode
    .replaceAll('"vue"', JSON.stringify(import.meta.resolve('vue')))
    .replaceAll("'vue'", JSON.stringify(import.meta.resolve('vue')))
  const resultsComponent = (await import(`data:text/javascript;base64,${Buffer.from(resultsCode).toString('base64')}`)).default
  const resultView = await renderToString(createSSRApp(resultsComponent, {
    results: {
      totalWords: 20,
      correctAnswers: 19,
      errors: 1,
      accuracyPercent: 95,
      mistakes: [{
        wordId: question.noun.wordId,
        greek: question.noun.greek,
        russian: question.noun.russian,
        selectedArticle: wrong,
        correctArticle: question.noun.article,
      }],
    },
  }))
  assert.ok(resultView.includes('Тренировка завершена'))
  assert.ok(resultView.includes(`${question.noun.article} ${question.noun.greek}`))
  assert.ok(resultView.includes(question.noun.russian))
  assert.ok(resultView.includes(wrong))
  assert.ok(resultView.includes('95%'))
})

test('article choice names separate Russian from Greek and focus moves to the available next action', async () => {
  const exercisePath = new URL('../src/components/trainers/ArticleGenderExercise.vue', import.meta.url)
  const exerciseSource = await readFile(exercisePath, 'utf8')
  const { descriptor } = parse(exerciseSource, { filename: exercisePath.pathname })
  const compiled = compileScript(descriptor, { id: 'article-gender-accessibility', inlineTemplate: true })
  let code = ts.transpileModule(compiled.content, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText
  code = code
    .replaceAll('"vue"', JSON.stringify(import.meta.resolve('vue')))
    .replaceAll("'vue'", JSON.stringify(import.meta.resolve('vue')))
    .replaceAll("'../../lib/trainers/articleGender/articleGenderTypes.ts'", JSON.stringify(new URL('../src/lib/trainers/articleGender/articleGenderTypes.ts', import.meta.url).href))
  const component = (await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)).default
  const session = createArticleGenderSession(
    articleGenderNouns,
    createArticleGenderHistory(articleGenderNouns.map((noun) => noun.wordId), seeded(71)),
    seeded(72),
  )
  const question = reactive({ ...currentArticleGenderQuestion(session)! })
  let answerCount = 0
  let advanceCount = 0
  const wrapper = defineComponent({
    setup: () => () => h(component, {
      question,
      questionNumber: 1,
      roundNumber: 1,
      totalQuestions: 20,
      totalRounds: 5,
      onAnswer: (article: typeof NOMINATIVE_ARTICLES[number]) => {
        answerCount += 1
        question.selectedArticle = article
        question.answered = true
        question.isCorrect = article === question.noun.article
      },
      onAdvance: () => { advanceCount += 1 },
    }),
  })
  const { renderer, getFocusedNode } = createAccessibilityRenderer()
  const root: TestRendererNode = { tag: 'root', props: {}, children: [], parent: null, text: '', focus() {} }
  const app = renderer.createApp(wrapper)
  app.mount(root)

  const optionButtons = () => findRendererNodes(root, (node) => node.tag === 'button' && String(node.props.class).includes('article-gender-option'))
  const options = optionButtons()
  assert.equal(options.length, 3)
  for (const option of options) {
    assert.equal(option.props.type, 'button')
    assert.equal(option.props.lang, undefined)
    assert.equal(option.props['aria-label'], undefined)
    const russianLabel = option.children.find((node) => String(node.props.class).includes('article-gender-visually-hidden'))
    const greekArticle = option.children.find((node) => node.props.lang === 'el')
    assert.ok(russianLabel)
    assert.equal(russianLabel.props.lang, 'ru')
    assert.equal(rendererText(russianLabel), 'Артикль ')
    assert.ok(greekArticle)
    const articleText = rendererText(greekArticle)
    assert.ok(NOMINATIVE_ARTICLES.includes(articleText as typeof NOMINATIVE_ARTICLES[number]))
    assert.equal(rendererText(option), `Артикль ${articleText}`)
  }
  assert.match(exerciseSource, /\.article-gender-visually-hidden\s*\{[^}]*clip-path:\s*inset\(50%\)/s)

  const wrongChoice = options.find((option) => {
    const article = option.children.find((node) => node.props.lang === 'el')
    return article && rendererText(article) !== question.noun.article
  })!
  const selectedArticleNode = wrongChoice.children.find((node) => node.props.lang === 'el')!
  const selectedArticle = rendererText(selectedArticleNode) as typeof NOMINATIVE_ARTICLES[number]
  const selectWrongAnswer = wrongChoice.props.onClick as () => void
  selectWrongAnswer()
  await nextTick()

  assert.equal(answerCount, 1)
  assert.equal(question.selectedArticle, selectedArticle)
  assert.equal(question.answered, true)
  const feedback = findRendererNodes(root, (node) => node.props.role === 'status')[0]
  assert.ok(feedback)
  assert.equal(feedback.props['aria-live'], 'polite')
  assert.match(rendererText(feedback), /Правильный артикль/)
  assert.ok(rendererText(feedback).includes(question.noun.article))

  const nextButton = findRendererNodes(root, (node) => node.tag === 'button' && String(node.props.class).includes('article-gender-next'))[0]
  assert.ok(nextButton)
  assert.equal(nextButton.props.type, 'button')
  assert.equal(nextButton.props.disabled, undefined)
  assert.equal(nextButton.props.tabindex, undefined)
  assert.equal(getFocusedNode(), nextButton)
  assert.equal(rendererText(nextButton), 'Следующее слово')
  assert.equal(nextButton.parent, feedback.parent, 'focus moves outside the live region while its announcement remains available')

  for (const option of optionButtons()) assert.equal(option.props.disabled, true)
  const originalSelection = question.selectedArticle
  const otherOption = optionButtons().find((option) => option.children.some((node) => node.props.lang === 'el' && rendererText(node) !== originalSelection))!
  const tryChangingAnswer = otherOption.props.onClick as () => void
  tryChangingAnswer()
  assert.equal(answerCount, 1)
  assert.equal(question.selectedArticle, originalSelection)

  const advance = nextButton.props.onClick as () => void
  advance()
  assert.equal(advanceCount, 1)
  app.unmount()
})
