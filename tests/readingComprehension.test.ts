import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { compileScript, parse } from '@vue/compiler-sfc'
import ts from 'typescript'
import { useReadingComprehensionSession } from '../src/composables/useReadingComprehensionSession.ts'
import { READING_TEXT_COUNT, readingTexts, readingGenreLabels } from '../src/data/trainers/readingTexts.ts'
import { trainerRoutes } from '../src/data/trainers/routes.ts'
import {
  emptyReadingHistory,
  loadReadingHistory,
  reconcileReadingHistory,
  rememberReadingRound,
  READING_HISTORY_KEY,
  READING_HISTORY_VERSION,
  saveReadingHistory,
  type ReadingHistoryStorage,
} from '../src/lib/trainers/readingComprehension/readingHistory.ts'
import {
  advanceReadingSession,
  checkReadingRound,
  createReadingSession,
  getReadingSessionResults,
  selectReadingOption,
} from '../src/lib/trainers/readingComprehension/readingSession.ts'

function seeded(seed: number): () => number {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 0x100000000
  }
}

class MemoryStorage implements ReadingHistoryStorage {
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

test('T7 bank contains 15 reviewed texts, 45 questions, and evidence inside each passage', () => {
  assert.equal(readingTexts.length, 15)
  assert.equal(readingTexts.filter((text) => text.level === 'A1').length, 6)
  assert.equal(readingTexts.filter((text) => text.level === 'A2').length, 9)
  assert.equal(new Set(readingTexts.map((text) => text.id)).size, 15)
  assert.equal(new Set(readingTexts.map((text) => text.genreId)).size, 14)
  assert.equal(Object.keys(readingGenreLabels).length, 14)
  assert.equal(readingTexts.flatMap((text) => text.questions).length, 45)
  assert.equal(new Set(readingTexts.flatMap((text) => text.questions.map((question) => question.id))).size, 45)

  const textSignatures = new Set<string>()
  const questionSignatures = new Set<string>()
  for (const text of readingTexts) {
    assert.ok(text.greek.trim() && text.translationRu.trim(), text.id)
    const wordCount = text.greek.trim().split(/\s+/).length
    if (text.level === 'A1') assert.ok(wordCount >= 30 && wordCount <= 65, `${text.id}: ${wordCount}`)
    else assert.ok(wordCount >= 65 && wordCount <= 120, `${text.id}: ${wordCount}`)
    const textSignature = text.greek.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase()
    assert.ok(!textSignatures.has(textSignature), text.id)
    textSignatures.add(textSignature)
    assert.equal(text.questions.length, 3, text.id)

    for (const question of text.questions) {
      assert.ok(question.promptRu.trim() && question.explanationRu.trim(), question.id)
      assert.equal(question.options.length, 3, question.id)
      assert.equal(new Set(question.options.map((option) => option.id)).size, 3, question.id)
      assert.equal(new Set(question.options.map((option) => option.textRu.trim().toLocaleLowerCase())).size, 3, question.id)
      assert.equal(question.options.filter((option) => option.id === question.correctOptionId).length, 1, question.id)
      assert.ok(question.options.every((option) => option.textRu.trim() && option.feedbackRu.trim()), question.id)
      assert.ok(question.evidenceEl.length > 0 && question.evidenceEl.every((evidence) => text.greek.includes(evidence)), question.id)
      const questionSignature = question.promptRu.normalize('NFC').trim().toLocaleLowerCase()
      assert.ok(!questionSignatures.has(questionSignature), question.id)
      questionSignatures.add(questionSignature)
    }
  }
})

test('T7 sessions build five distinct rounds, rising from two A1 texts to three A2 texts', () => {
  const signatures = new Set<string>()
  for (let seed = 0; seed < 100; seed += 1) {
    const session = createReadingSession(readingTexts, seeded(seed))
    assert.equal(session.rounds.length, 5)
    assert.deepEqual(session.rounds.map((round) => round.questions.length), [2, 2, 2, 2, 2])
    assert.deepEqual(session.rounds.map((round) => round.text.level), ['A1', 'A1', 'A2', 'A2', 'A2'])
    assert.equal(new Set(session.rounds.map((round) => round.text.id)).size, 5)
    const selected = session.rounds.flatMap((round) => round.questions)
    assert.equal(selected.length, 10)
    assert.equal(new Set(selected.map((item) => item.question.id)).size, 10)
    assert.ok(session.rounds.every((round) => round.questions.every((item) =>
      item.optionOrder.length === 3 && new Set(item.optionOrder).size === 3,
    )))
    signatures.add(JSON.stringify(session.rounds.map((round) => [
      round.text.id,
      round.questions.map((item) => [item.question.id, item.optionOrder]),
    ])))
  }
  assert.ok(signatures.size >= 95, `Only ${signatures.size} distinct seeded sessions`)
})

test('both answers are required and checked together; selections lock only after round check', () => {
  let session = createReadingSession(readingTexts, seeded(27))
  const round = session.rounds[0]!
  assert.equal(checkReadingRound(session).outcome, 'no-selection')
  assert.equal(advanceReadingSession(session).outcome, 'not-checked')

  const first = round.questions[0]!
  const second = round.questions[1]!
  const firstWrong = first.question.options.find((option) => option.id !== first.question.correctOptionId)!
  const secondCorrect = second.question.correctOptionId
  session = selectReadingOption(session, first.question.id, firstWrong.id).session
  assert.equal(checkReadingRound(session).outcome, 'no-selection')
  assert.equal(session.rounds[0]!.questions.every((item) => !item.checked), true)
  session = selectReadingOption(session, first.question.id, first.question.correctOptionId).session
  session = selectReadingOption(session, second.question.id, secondCorrect).session
  assert.equal(session.rounds[0]!.questions[0]!.selectedOptionId, first.question.correctOptionId)
  assert.equal(checkReadingRound(session).outcome, 'checked')
  session = checkReadingRound(session).session
  assert.equal(session.rounds[0]!.checked, true)
  assert.equal(session.rounds[0]!.questions.every((item) => item.checked), true)
  assert.equal(session.rounds[0]!.questions.every((item) => item.isCorrect !== null), true)
  assert.equal(selectReadingOption(session, first.question.id, firstWrong.id).outcome, 'already-checked')
  assert.equal(checkReadingRound(session).outcome, 'already-checked')
  assert.equal(advanceReadingSession(session).outcome, 'advanced')
  session = advanceReadingSession(session).session
  assert.equal(session.currentRoundIndex, 1)
})

test('a text round can score zero, one, or two correct and a full session reports ten questions', () => {
  const scoreRound = (correctCount: number) => {
    let session = createReadingSession(readingTexts, seeded(31))
    const round = session.rounds[0]!
    round.questions.forEach((item, index) => {
      const optionId = index < correctCount
        ? item.question.correctOptionId
        : item.question.options.find((option) => option.id !== item.question.correctOptionId)!.id
      session = selectReadingOption(session, item.question.id, optionId).session
    })
    session = checkReadingRound(session).session
    return session.rounds[0]!.questions.filter((item) => item.isCorrect).length
  }
  assert.equal(scoreRound(0), 0)
  assert.equal(scoreRound(1), 1)
  assert.equal(scoreRound(2), 2)

  let session = createReadingSession(readingTexts, seeded(39))
  for (let index = 0; index < 5; index += 1) {
    const round = session.rounds[session.currentRoundIndex]!
    for (const item of round.questions) session = selectReadingOption(session, item.question.id, item.question.correctOptionId).session
    session = checkReadingRound(session).session
    session = advanceReadingSession(session).session
  }
  assert.equal(session.completed, true)
  assert.deepEqual(getReadingSessionResults(session), {
    textsRead: 5,
    totalTexts: 5,
    totalQuestions: 10,
    correctAnswers: 10,
    errors: 0,
    accuracyPercent: 100,
    completedRounds: 5,
    totalRounds: 5,
  })
  assert.equal(advanceReadingSession(session).outcome, 'session-completed')
})

test('T7 history records only checked rounds, once each, and leaves unfinished texts unseen', () => {
  const storage = new MemoryStorage()
  const exercise = useReadingComprehensionSession({ storage, random: seeded(12) })
  exercise.start()
  assert.equal(storage.values.size, 0)
  const round = exercise.currentRound.value!
  exercise.selectOption(round.questions[0]!.question.id, round.questions[0]!.question.correctOptionId)
  exercise.checkRound()
  assert.equal(storage.values.size, 0)
  exercise.selectOption(round.questions[1]!.question.id, round.questions[1]!.question.correctOptionId)
  exercise.checkRound()
  const firstSaved = storage.getItem(READING_HISTORY_KEY)
  let history = loadReadingHistory(readingTexts, storage)
  assert.deepEqual(history.recentTextIds, [round.text.id])
  assert.deepEqual(new Set(history.recentQuestionIds), new Set(round.questions.map((item) => item.question.id)))
  exercise.checkRound()
  assert.equal(storage.getItem(READING_HISTORY_KEY), firstSaved)
  exercise.advance()
  const nextTextId = exercise.currentRound.value!.text.id
  const reentry = useReadingComprehensionSession({ storage, random: seeded(12) })
  reentry.start()
  history = loadReadingHistory(readingTexts, storage)
  assert.equal(history.recentTextIds.includes(nextTextId), false)
  assert.equal(history.recentTextIds.length, 1)

  const fullStorage = new MemoryStorage()
  const full = useReadingComprehensionSession({ storage: fullStorage, random: seeded(44) })
  full.start()
  for (let index = 0; index < 5; index += 1) {
    const current = full.currentRound.value!
    for (const item of current.questions) full.selectOption(item.question.id, item.question.correctOptionId)
    full.checkRound()
    full.advance()
  }
  assert.equal(loadReadingHistory(readingTexts, fullStorage).recentTextIds.length, 5)
  assert.equal(loadReadingHistory(readingTexts, fullStorage).recentQuestionIds.length, 10)
  assert.doesNotThrow(() => { full.start(); full.checkRound() })
})

test('T7 history is versioned, bounded, reconciles removed content, and tolerates unavailable storage', () => {
  const storage = new MemoryStorage()
  saveReadingHistory(emptyReadingHistory(), storage)
  assert.equal(JSON.parse(storage.getItem(READING_HISTORY_KEY)!).version, READING_HISTORY_VERSION)
  const firstText = readingTexts[0]!
  let history = emptyReadingHistory()
  for (let index = 0; index < 90; index += 1) {
    history = rememberReadingRound(history, { ...firstText, id: `text-${index}` }, [
      { ...firstText.questions[0]!, id: `question-${index}` },
    ])
  }
  assert.equal(history.recentTextIds.length, 60)
  assert.equal(history.recentQuestionIds.length, 90)
  const reconciled = reconcileReadingHistory({
    version: READING_HISTORY_VERSION,
    recentTextIds: [firstText.id, 'removed-text'],
    recentQuestionIds: [firstText.questions[0]!.id, 'removed-question'],
  }, readingTexts)
  assert.deepEqual(reconciled.recentTextIds, [firstText.id])
  assert.deepEqual(reconciled.recentQuestionIds, [firstText.questions[0]!.id])
  storage.values.set(READING_HISTORY_KEY, '{bad json')
  assert.deepEqual(loadReadingHistory(readingTexts, storage), emptyReadingHistory())
  storage.unavailable = true
  assert.deepEqual(loadReadingHistory(readingTexts, storage), emptyReadingHistory())
  assert.doesNotThrow(() => saveReadingHistory(history, storage))
  assert.doesNotThrow(() => createReadingSession(readingTexts, seeded(5), emptyReadingHistory()))
})

test('100 fixed seeds and ten history-backed sessions cover the bank without within-session repeats', () => {
  for (let seed = 0; seed < 100; seed += 1) {
    const session = createReadingSession(readingTexts, seeded(seed + 1000))
    assert.equal(new Set(session.rounds.map((round) => round.text.id)).size, 5)
    assert.equal(new Set(session.rounds.flatMap((round) => round.questions.map((item) => item.question.id))).size, 10)
  }

  let history = emptyReadingHistory()
  const random = seeded(20261105)
  const textOccurrences = new Map<string, number>()
  const questionIds = new Set<string>()
  let repeatsInsideSession = 0
  const levelCoverage = new Set<string>()
  const genreCoverage = new Set<string>()
  for (let launch = 0; launch < 10; launch += 1) {
    let session = createReadingSession(readingTexts, random, history)
    const selectedTextIds = session.rounds.map((round) => round.text.id)
    repeatsInsideSession += selectedTextIds.length - new Set(selectedTextIds).size
    for (const round of session.rounds) {
      textOccurrences.set(round.text.id, (textOccurrences.get(round.text.id) ?? 0) + 1)
      levelCoverage.add(round.text.level)
      genreCoverage.add(round.text.genreId)
    }
    for (let index = 0; index < 5; index += 1) {
      const round = session.rounds[session.currentRoundIndex]!
      for (const item of round.questions) {
        questionIds.add(item.question.id)
        session = selectReadingOption(session, item.question.id, item.question.correctOptionId).session
      }
      session = checkReadingRound(session).session
      history = rememberReadingRound(history, round.text, round.questions.map((item) => item.question))
      session = advanceReadingSession(session).session
    }
  }
  assert.equal(textOccurrences.size, 15)
  assert.equal(questionIds.size, 45)
  assert.deepEqual(levelCoverage, new Set(['A1', 'A2']))
  assert.equal(genreCoverage.size, 14)
  assert.equal(repeatsInsideSession, 0)
  assert.equal([...textOccurrences.values()].reduce((sum, count) => sum + count - 1, 0), 35)
})

test('history rotation covers all 15 texts in the first three sessions across 100 fixed seeds', () => {
  for (let seed = 0; seed < 100; seed += 1) {
    let history = emptyReadingHistory()
    const random = seeded(seed + 7000)
    const seenTextIds = new Set<string>()

    for (let launch = 0; launch < 3; launch += 1) {
      let session = createReadingSession(readingTexts, random, history)
      for (let roundIndex = 0; roundIndex < 5; roundIndex += 1) {
        const round = session.rounds[session.currentRoundIndex]!
        seenTextIds.add(round.text.id)
        for (const item of round.questions) {
          session = selectReadingOption(session, item.question.id, item.question.correctOptionId).session
        }
        session = checkReadingRound(session).session
        history = rememberReadingRound(history, round.text, round.questions.map((item) => item.question))
        session = advanceReadingSession(session).session
      }
    }

    assert.equal(seenTextIds.size, READING_TEXT_COUNT, `Seed ${seed} did not cover every text in three sessions`)
  }
})

test('the T7 route and UI keep both answers together and hide the translation until checking', async () => {
  assert.equal(trainerRoutes.find((route) => route.path === '/trainers/reading-comprehension')?.name, 'trainer-reading-comprehension')
  const filename = new URL('../src/components/trainers/ReadingComprehensionExercise.vue', import.meta.url)
  const source = readFileSync(filename, 'utf8')
  assert.match(source, /<fieldset[^>]*:disabled="round\.checked"/)
  assert.match(source, /aria-pressed="item\.selectedOptionId === option\.id"/)
  assert.match(source, /role="status" aria-live="polite"/)
  assert.match(source, /lang="el"/)
  assert.match(source, /@media \(max-width: 520px\)/)
  assert.match(source, /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(source, /Проверить ответы/)
  assert.doesNotMatch(source, /<input\b/)

  const { descriptor } = parse(source, { filename: filename.pathname })
  const compiled = compileScript(descriptor, { id: 'reading-comprehension-regression', inlineTemplate: true })
  let code = ts.transpileModule(compiled.content, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText
  code = code
    .replaceAll('"vue"', JSON.stringify(import.meta.resolve('vue')))
    .replaceAll("'vue'", JSON.stringify(import.meta.resolve('vue')))
    .replaceAll("'../../data/trainers/readingTexts.ts'", JSON.stringify(new URL('../src/data/trainers/readingTexts.ts', import.meta.url).href))
    .replaceAll("'../../lib/trainers/readingComprehension/readingSession.ts'", JSON.stringify(new URL('../src/lib/trainers/readingComprehension/readingSession.ts', import.meta.url).href))
  const component = (await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)).default
  const session = createReadingSession(readingTexts, seeded(18))
  const round = session.rounds[0]!
  const props = { round, totalRounds: 5 }
  const before = await renderToString(createSSRApp(component, props))
  assert.ok(before.includes(round.text.greek))
  assert.ok(before.includes('<h2 class="reading-title" tabindex="-1">Прочитай текст</h2>'))
  assert.ok(!before.includes(round.text.translationRu))
  for (const item of round.questions) {
    assert.ok(!before.includes(item.question.explanationRu))
    for (const option of item.question.options) assert.ok(!before.includes(option.feedbackRu))
  }
  assert.ok(!before.includes(session.rounds[1]!.text.greek))
  for (const item of round.questions) item.selectedOptionId = item.question.correctOptionId
  const cannotPartiallyCheck = await renderToString(createSSRApp(component, props))
  assert.ok(!cannotPartiallyCheck.includes(round.text.translationRu))
  round.questions.forEach((item) => { item.checked = true; item.isCorrect = true })
  round.checked = true
  const after = await renderToString(createSSRApp(component, props))
  assert.ok(after.includes(round.text.translationRu))
  for (const item of round.questions) {
    assert.ok(after.includes(item.question.explanationRu))
    for (const evidence of item.question.evidenceEl) assert.ok(after.includes(evidence))
  }
})
