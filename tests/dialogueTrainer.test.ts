import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { useDialogueSession } from '../src/composables/useDialogueSession.ts'
import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { parse, compileScript } from '@vue/compiler-sfc'
import ts from 'typescript'
import { dialogueCategories, dialogueQuestions } from '../src/data/trainers/dialogueQuestions.ts'
import { words } from '../src/data/words.ts'
import { trainerRoutes } from '../src/data/trainers/routes.ts'
import {
  DIALOGUE_HISTORY_KEY,
  DIALOGUE_HISTORY_VERSION,
  dialogueExactQuestionSignature,
  dialogueSituationSignature,
  emptyDialogueQuestionHistory,
  loadDialogueQuestionHistory,
  rememberDialogueQuestions,
  reconcileDialogueQuestionHistory,
  saveDialogueQuestionHistory,
  type DialogueHistoryStorage,
} from '../src/lib/trainers/dialogue/dialogueHistory.ts'
import {
  advanceDialogueSession,
  checkDialogueAnswer,
  createDialogueSession,
  getDialogueSessionResults,
  selectDialogueOption,
} from '../src/lib/trainers/dialogue/dialogueSession.ts'

function seeded(seed: number): () => number {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 0x100000000
  }
}

class MemoryStorage implements DialogueHistoryStorage {
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

test('dialogue bank meets its reviewed structure and coverage targets', () => {
  assert.ok(dialogueQuestions.length >= 36)
  assert.ok(dialogueQuestions.filter((question) => question.level === 'A1').length >= 13)
  assert.ok(dialogueQuestions.filter((question) => question.level === 'A2').length >= 23)
  assert.equal(new Set(dialogueQuestions.map((question) => question.id)).size, dialogueQuestions.length)
  assert.equal(new Set(dialogueQuestions.map((question) => question.situationId)).size, dialogueQuestions.length)
  assert.ok(new Set(dialogueQuestions.map((question) => question.intentId)).size >= 10)
  assert.ok(dialogueQuestions.filter((question) => question.level === 'A2').length >= 10)
  assert.ok(dialogueQuestions.filter((question) => question.context.length >= 2).length >= 26)

  for (const category of dialogueCategories) {
    assert.ok(dialogueQuestions.filter((question) => question.categoryId === category.id).length >= 5, category.id)
  }

  for (const question of dialogueQuestions) {
    assert.ok(question.context.length > 0, question.id)
    assert.ok(question.explanation.trim(), question.id)
    assert.equal(question.options.length, 3, question.id)
    assert.equal(new Set(question.options.map((option) => option.id)).size, 3, question.id)
    assert.equal(new Set(question.options.map((option) => option.greek.normalize('NFC').trim())).size, 3, question.id)
    assert.equal(question.options.filter((option) => option.id === question.correctOptionId).length, 1, question.id)
    assert.ok(question.context.every((line) => line.greek.trim() && line.translation.trim()), question.id)
    assert.ok(question.options.every((option) => option.greek.trim() && option.translation.trim() && option.explanation.trim()), question.id)
  }
})

test('page 53 kiosk dialogue uses only studied vocabulary for purchase and small change', () => {
  const question = dialogueQuestions.find((item) => item.id === 'd-everyday-07')
  assert.ok(question)
  assert.equal(question.level, 'A1')
  assert.equal(question.situationId, 'kiosk-small-change')
  assert.match(question.context[0]!.greek, /πακέτο τσιγάρα/)
  assert.match(question.context[0]!.greek, /Έχω πέντε ευρώ/)
  assert.match(question.context[1]!.greek, /ρέστα.*ψιλά/)
  assert.match(question.options.find((option) => option.id === question.correctOptionId)!.greek, /έχω δύο ευρώ/i)
  assert.doesNotMatch(question.context.map((line) => line.greek).join(' '), /και είκοσι λεπτά|τριάντα λεπτά/)
  assert.doesNotMatch(question.context.map((line) => line.greek).join(' ') + question.options.map((option) => option.greek).join(' '), /χαρτονόμισμα|κέρμα/)
  const dictionaryKeys = new Set(words.map((word) => word.greek))
  for (const studiedWord of ['πακέτο', 'τσιγάρο', 'δύο', 'ευρώ', 'ρέστα', 'ψιλά']) assert.ok(dictionaryKeys.has(studiedWord), studiedWord)
  assert.equal(new Set(question.options.map((option) => option.greek)).size, 3)
})

test('the three T6.2 revisions have one context-supported continuation each', () => {
  const byId = (id: string) => dialogueQuestions.find((question) => question.id === id)!
  const siblings = byId('d-self-02')
  assert.equal(siblings.replySpeaker, 'Εσύ')
  assert.match(siblings.context.at(-1)!.greek, /Πόσα αδέλφια/)
  const siblingsAnswer = siblings.options.find((option) => option.id === siblings.correctOptionId)!
  assert.equal(siblingsAnswer.greek, 'Έχω έναν αδελφό και μία αδελφή.')
  const siblingDistractors = siblings.options.filter((option) => option.id !== siblings.correctOptionId)
  assert.deepEqual(siblingDistractors.map((option) => option.greek), [
    'Ο αδελφός μου σπουδάζει ιατρική.',
    'Η αδελφή μου εργάζεται σε ένα σχολείο.',
  ])
  const siblingCountReply = /έχω.*(?:αδελφ|αδέλφ)|είμαι\s+μοναχοπαίδι/i
  assert.match(siblingsAnswer.greek, siblingCountReply)
  assert.ok(siblingDistractors.every((option) => !siblingCountReply.test(option.greek)))
  assert.ok(siblingDistractors.every((option) => /αδελφός|αδελφή/i.test(option.greek)))
  assert.ok(siblingDistractors.every((option) => /не отвечает на вопрос о (?:числе|количестве)/i.test(option.explanation)))

  const bread = byId('d-everyday-04')
  assert.equal(bread.replySpeaker, 'Μαρία')
  assert.equal(bread.intentId, 'explain-unavailable-item')
  assert.equal(bread.context[0]!.speaker, 'Μαρία')
  assert.match(bread.context[0]!.greek, /ανοιχτό/)
  assert.match(bread.context[0]!.greek, /ράφι με το ψωμί.*άδειο/)
  assert.match(bread.context.at(-1)!.greek, /Γιατί.*ψωμί/)
  const breadAnswer = bread.options.find((option) => option.id === bread.correctOptionId)!
  assert.equal(breadAnswer.greek, 'Δεν υπήρχε πια ψωμί.')
  assert.ok(!/^Όχι\b/.test(breadAnswer.greek))
  assert.match(breadAnswer.explanation, /полке с хлебом было пусто/)
  assert.match(bread.explanation, /полка с хлебом была пустой/)
  assert.deepEqual(bread.options.filter((option) => option.id !== bread.correctOptionId).map((option) => option.greek), [
    'Το κατάστημα ήταν ήδη κλειστό.',
    'Δεν υπήρχαν πια μήλα.',
  ])
  assert.match(bread.options.find((option) => option.id === 'store-closed')!.explanation, /магазин был открыт/)
  assert.match(bread.options.find((option) => option.id === 'apples')!.explanation, /хлебе/)

  const route = byId('d-place-05')
  assert.equal(route.replySpeaker, 'Μαρία')
  assert.match(route.context[0]!.greek, /χάρτης της άσκησης/)
  assert.match(route.context[0]!.greek, /γραμμή 3.*Κύπρου.*όχι.*Αθηνάς/)
  assert.match(route.context.at(-1)!.greek, /άλλη γραμμή.*ραντεβού σου/)
  assert.match(route.context[0]!.translation, /маршрут № 3 показан на улице Кипру, а не на улице Афинас/)
  const routeAnswer = route.options.find((option) => option.id === route.correctOptionId)!
  assert.equal(routeAnswer.greek, 'Ναι, καλύτερα να κοιτάξουμε άλλη γραμμή για την οδό Αθηνάς.')
  assert.match(routeAnswer.explanation, /карте задания линия 3 проходит по улице Кипру/)
  assert.match(route.explanation, /карте учебного задания линия 3 проходит по Кипру, а не по Афинас/)
  assert.equal(route.options.find((option) => option.id === 'appointment')!.greek, 'Το ραντεβού μου είναι αύριο το πρωί.')
  assert.equal(route.options.find((option) => option.id === 'wrong-street')!.greek, 'Όχι, πάρε τη γραμμή 3 για την οδό Αθηνάς.')
  assert.match(route.options.find((option) => option.id === 'wrong-street')!.explanation, /карте учебного задания/)
})

test('T6 creates five rounds of two unique questions with broad topic coverage', () => {
  for (let seed = 0; seed < 100; seed += 1) {
    const session = createDialogueSession(dialogueQuestions, seeded(seed))
    assert.equal(session.rounds.length, 5)
    assert.ok(session.rounds.every((round) => round.questions.length === 2))
    const questions = session.rounds.flatMap((round) => round.questions)
    assert.equal(questions.length, 10)
    assert.equal(new Set(questions.map((item) => item.question.id)).size, 10)
    assert.equal(new Set(questions.map((item) => item.question.situationId)).size, 10)
    assert.ok(new Set(questions.map((item) => item.question.categoryId)).size >= 4)
    assert.ok(new Set(questions.map((item) => item.question.intentId)).size >= 7)
    assert.ok(questions.every((item) => item.optionOrder.length === 3))
  }
})

test('d-everyday-07 is a role-correct kiosk exchange about payment, not a change calculation', () => {
  const question = dialogueQuestions.find((item) => item.id === 'd-everyday-07')!
  assert.ok(question)
  assert.equal(question.level, 'A1')
  assert.equal(question.categoryId, 'everyday-talk')
  assert.equal(question.situationId, 'kiosk-small-change')
  assert.equal(question.intentId, 'respond-to-change-request')
  assert.equal(question.replySpeaker, 'Πελάτης')
  assert.deepEqual(question.context.map(({ speaker, greek, translation }) => ({ speaker, greek, translation })), [
    {
      speaker: 'Πελάτης',
      greek: 'Ένα πακέτο τσιγάρα, παρακαλώ. Έχω πέντε ευρώ.',
      translation: 'Пачку сигарет, пожалуйста. У меня есть пять евро.',
    },
    {
      speaker: 'Περιπτεράς',
      greek: 'Το πακέτο κάνει δύο ευρώ. Δεν έχω ρέστα για πέντε ευρώ. Μήπως έχετε ψιλά;',
      translation: 'Пачка стоит 2 евро. У меня нет сдачи с 5 евро. У вас случайно есть мелочь?',
    },
  ])
  assert.equal(question.options.length, 3)
  assert.equal(question.options.filter((option) => option.id === question.correctOptionId).length, 1)
  assert.equal(question.correctOptionId, 'two-euro-cash')
  assert.equal(question.options.find((option) => option.id === question.correctOptionId)!.greek, 'Ναι, έχω δύο ευρώ. Ορίστε.')
  assert.match(question.options.find((option) => option.id === 'change-reversed')!.explanation, /сдачу/i)
  assert.match(question.options.find((option) => option.id === 'repeat-price')!.explanation, /уже назвал цену/)
  assert.match(question.explanation, /у него есть 2 евро/)
})

test('answer can change until check, then locks and advances only after feedback', () => {
  let session = createDialogueSession(dialogueQuestions, seeded(7))
  let active = session.rounds[0]!.questions[0]!
  assert.equal(checkDialogueAnswer(session).outcome, 'no-selection')

  const wrongId = active.question.options.find((option) => option.id !== active.question.correctOptionId)!.id
  assert.equal(selectDialogueOption(session, wrongId).outcome, 'selected')
  session = selectDialogueOption(session, wrongId).session
  assert.equal(advanceDialogueSession(session).outcome, 'not-checked')
  session = selectDialogueOption(session, active.question.correctOptionId).session
  assert.equal(session.rounds[0]!.questions[0]!.selectedOptionId, active.question.correctOptionId)
  assert.equal(checkDialogueAnswer(session).outcome, 'checked')
  session = checkDialogueAnswer(session).session
  assert.equal(session.rounds[0]!.questions[0]!.isCorrect, true)
  assert.equal(selectDialogueOption(session, wrongId).outcome, 'already-checked')
  assert.equal(checkDialogueAnswer(session).outcome, 'already-checked')

  session = advanceDialogueSession(session).session
  assert.equal(session.currentQuestionIndex, 1)
  session = selectDialogueOption(session, session.rounds[0]!.questions[1]!.question.correctOptionId).session
  session = checkDialogueAnswer(session).session
  session = advanceDialogueSession(session).session
  assert.equal(session.rounds[0]!.completed, true)
  assert.equal(session.currentRoundIndex, 1)
  assert.equal(session.currentQuestionIndex, 0)
})

test('results are recorded once and the completed session cannot advance again', () => {
  let session = createDialogueSession(dialogueQuestions, seeded(19))
  for (let count = 0; count < 10; count += 1) {
    const question = session.rounds[session.currentRoundIndex]!.questions[session.currentQuestionIndex]!
    const answerId = count === 0
      ? question.question.options.find((option) => option.id !== question.question.correctOptionId)!.id
      : question.question.correctOptionId
    session = selectDialogueOption(session, answerId).session
    session = checkDialogueAnswer(session).session
    session = advanceDialogueSession(session).session
  }

  assert.equal(session.completed, true)
  const result = getDialogueSessionResults(session)
  assert.deepEqual(result, {
    totalQuestions: 10,
    correctAnswers: 9,
    errors: 1,
    accuracyPercent: 90,
    completedRounds: 5,
    totalRounds: 5,
  })
  assert.equal(advanceDialogueSession(session).outcome, 'session-completed')
  assert.deepEqual(getDialogueSessionResults(session), result)
})

test('ten launches rotate through the full bank and never repeat a situation within a session', () => {
  let history = emptyDialogueQuestionHistory()
  const rng = seeded(20261105)
  const seenIds = new Set<string>()
  const seenSituations = new Set<string>()
  const seenIntents = new Set<string>()
  let withinSessionRepeats = 0

  for (let launch = 0; launch < 10; launch += 1) {
    const session = createDialogueSession(dialogueQuestions, rng, history)
    const selected = session.rounds.flatMap((round) => round.questions.map((item) => item.question))
    const situationIds = selected.map((question) => question.situationId)
    withinSessionRepeats += situationIds.length - new Set(situationIds).size
    selected.forEach((question) => {
      seenIds.add(question.id)
      seenSituations.add(question.situationId)
      seenIntents.add(question.intentId)
    })
    history = rememberDialogueQuestions(history, selected)
  }

  assert.equal(seenIds.size, dialogueQuestions.length)
  assert.equal(seenSituations.size, dialogueQuestions.length)
  assert.equal(seenIntents.size, new Set(dialogueQuestions.map((question) => question.intentId)).size)
  assert.equal(withinSessionRepeats, 0)
  assert.equal(history.exactQuestionSignatures.length, dialogueQuestions.length)
  assert.equal(history.situationIds.length, dialogueQuestions.length)
})

test('T6 history is versioned, bounded, reconciles changed banks, and tolerates broken storage', () => {
  const storage = new MemoryStorage()
  const sample = dialogueQuestions.slice(0, 10)
  const remembered = rememberDialogueQuestions(emptyDialogueQuestionHistory(), sample)
  saveDialogueQuestionHistory(remembered, storage)
  assert.equal(JSON.parse(storage.getItem(DIALOGUE_HISTORY_KEY)!).version, DIALOGUE_HISTORY_VERSION)
  assert.equal(loadDialogueQuestionHistory(dialogueQuestions, storage).situationIds.length, 10)

  const stale = {
    ...remembered,
    exactQuestionSignatures: [...remembered.exactQuestionSignatures, 'removed-question'],
    situationIds: [...remembered.situationIds, 'removed-situation'],
    intentIds: [...remembered.intentIds, 'removed-intent'],
  }
  const reconciled = reconcileDialogueQuestionHistory(stale, dialogueQuestions)
  assert.equal(reconciled.exactQuestionSignatures.includes('removed-question'), false)
  assert.equal(reconciled.situationIds.includes('removed-situation'), false)
  assert.equal(reconciled.intentIds.includes('removed-intent'), false)

  const legacyKioskHistory = reconcileDialogueQuestionHistory({
    version: DIALOGUE_HISTORY_VERSION,
    exactQuestionSignatures: [],
    situationIds: ['calculate-kiosk-change'],
    intentIds: ['respond-to-change-request'],
  }, dialogueQuestions)
  assert.equal(legacyKioskHistory.situationIds.includes('calculate-kiosk-change'), false)
  assert.equal(legacyKioskHistory.situationIds.includes('kiosk-small-change'), false)
  const updatedKioskHistory = rememberDialogueQuestions(legacyKioskHistory, [dialogueQuestions.find((question) => question.id === 'd-everyday-07')!])
  assert.equal(updatedKioskHistory.situationIds.includes('kiosk-small-change'), true)

  storage.values.set(DIALOGUE_HISTORY_KEY, '{bad json')
  assert.deepEqual(loadDialogueQuestionHistory(dialogueQuestions, storage), emptyDialogueQuestionHistory())
  storage.unavailable = true
  assert.deepEqual(loadDialogueQuestionHistory(dialogueQuestions, storage), emptyDialogueQuestionHistory())
  assert.doesNotThrow(() => saveDialogueQuestionHistory(remembered, storage))
  assert.deepEqual(loadDialogueQuestionHistory(dialogueQuestions), emptyDialogueQuestionHistory())
  assert.doesNotThrow(() => saveDialogueQuestionHistory(remembered))

  const extendedBank = Array.from({ length: 150 }, (_, index) => {
    const question = dialogueQuestions[index % dialogueQuestions.length]!
    return {
      ...question,
      situationId: `${question.situationId}-${index}`,
      intentId: `${question.intentId}-${index}`,
      context: [...question.context, { speaker: `speaker-${index}`, greek: `item-${index}`, translation: '' }],
    }
  })
  const bounded = rememberDialogueQuestions(emptyDialogueQuestionHistory(), extendedBank)
  assert.equal(bounded.exactQuestionSignatures.length, 120)
  assert.equal(bounded.situationIds.length, 120)
  assert.equal(bounded.intentIds.length, 120)
})

test('exact question signatures ignore answer order while situation signatures ignore answer edits', () => {
  const question = dialogueQuestions[0]!
  const reordered = { ...question, options: [...question.options].reverse() }
  assert.equal(dialogueExactQuestionSignature(question), dialogueExactQuestionSignature(reordered))
  assert.notEqual(dialogueExactQuestionSignature(question), dialogueExactQuestionSignature({ ...question, replySpeaker: "Другой участник" }))

  const editedDistractor = {
    ...question,
    options: question.options.map((option, index) => index === 1 ? { ...option, greek: 'Είμαι από την Κύπρο.' } : option),
  }
  assert.notEqual(dialogueExactQuestionSignature(question), dialogueExactQuestionSignature(editedDistractor))
  assert.equal(dialogueSituationSignature(question), dialogueSituationSignature(editedDistractor))
})

test('T6 route and controls expose keyboard and screen-reader states with a mobile layout', () => {
  assert.equal(trainerRoutes.find((route) => route.path === '/trainers/dialogues')?.name, 'trainer-dialogues')
  const panel = readFileSync(new URL('../src/components/trainers/DialogueQuestionPanel.vue', import.meta.url), 'utf8')
  const page = readFileSync(new URL('../src/pages/TrainerDialoguePage.vue', import.meta.url), 'utf8')
  assert.match(panel, /<fieldset[^>]*:disabled="questionState\.checked"/)
  assert.match(panel, /aria-pressed="questionState\.selectedOptionId === option\.id"/)
  assert.match(panel, /aria-live="polite"/)
  assert.match(panel, /@media \(max-width: 520px\)/)
  assert.match(panel, /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(page, /exercise\.value\?\.focusQuestion\(\)/)
  assert.match(page, /resultsView\.value\?\.focusHeading\(\)/)
  assert.doesNotMatch(panel, /<input\b/)
})


test('history records only checked answers across early exit and re-entry', () => {
  const storage = new MemoryStorage()
  const first = useDialogueSession({ storage, random: seeded(12) })
  first.start()
  assert.equal(storage.values.size, 0)
  first.checkAnswer()
  assert.equal(storage.values.size, 0)
  const question = first.currentQuestion.value!.question
  first.selectOption(question.correctOptionId)
  first.checkAnswer()
  const saved = storage.getItem(DIALOGUE_HISTORY_KEY)
  assert.equal(loadDialogueQuestionHistory(dialogueQuestions, storage).situationIds.length, 1)
  first.checkAnswer()
  assert.equal(storage.getItem(DIALOGUE_HISTORY_KEY), saved)
  const reentered = useDialogueSession({ storage, random: seeded(12) })
  reentered.start()
  assert.equal(storage.getItem(DIALOGUE_HISTORY_KEY), saved)
  assert.ok(!reentered.session.value!.rounds.flatMap(r => r.questions).some(q => q.question.id === question.id))
  const completeStorage = new MemoryStorage()
  const full = useDialogueSession({ storage: completeStorage, random: seeded(3) })
  full.start()
  for (let i = 0; i < 10; i++) {
    full.selectOption(full.currentQuestion.value!.question.correctOptionId)
    full.checkAnswer()
    full.advance()
  }
  assert.equal(loadDialogueQuestionHistory(dialogueQuestions, completeStorage).situationIds.length, 10)
  storage.unavailable = true
  assert.doesNotThrow(() => { reentered.start(); reentered.selectOption(reentered.currentQuestion.value!.question.correctOptionId); reentered.checkAnswer() })
})

test('reply roles match reviewed participants rather than a blanket user label', () => {
  const roles = [ 'Άννα','Εσύ','Εσύ','Άννα','Ελένη','Άννα','Εσύ','Εσύ','Ελένη','Νίκος','Άννα','Μαρία','Νίκος','Άννα','Ελένη','Μαρία','Νίκος','Άννα','Νίκος','Εσύ','Οδηγός','Εσύ','Μαρία','Εσύ','Μαρία','Ελένη','Ελένη','Νίκος','Άννα','Ελένη','Εσύ','Άννα','Νίκος','Άννα','Εσύ','Εσύ','Πελάτης' ]
  assert.deepEqual(dialogueQuestions.map(q => q.replySpeaker), roles)
})

test('rendered panel names the reply speaker before answering and reveals every translation only after checking', async () => {
  const filename = new URL('../src/components/trainers/DialogueQuestionPanel.vue', import.meta.url)
  const { descriptor } = parse(readFileSync(filename, 'utf8'))
  const compiled = compileScript(descriptor, { id: 'dialogue-regression', inlineTemplate: true })
  let code = ts.transpileModule(compiled.content, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText
  code = code.replaceAll('"vue"', JSON.stringify(import.meta.resolve('vue')))
    .replaceAll("'vue'", JSON.stringify(import.meta.resolve('vue')))
    .replaceAll("'../../lib/trainers/dialogue/dialogueSession.ts'", JSON.stringify(new URL('../src/lib/trainers/dialogue/dialogueSession.ts', import.meta.url).href))
  const component = (await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)).default
  const session = createDialogueSession(dialogueQuestions, seeded(8))
  const item = session.rounds[0]!.questions[0]!
  item.question = dialogueQuestions.find(q => q.id === 'd-place-05')!
  item.optionOrder = item.question.options.map(o => o.id)
  const props = { questionState: item, roundNumber: 1, totalRounds: 5, questionNumber: 1, totalQuestions: 10 }
  const before = await renderToString(createSSRApp(component, props))
  assert.ok(before.includes('Μαρία'))
  assert.ok(!before.includes('На карте в задании маршрут № 3 показан на улице Кипру, а не на улице Афинас.'))
  assert.ok(!before.includes('Переводы и разбор'))
  for (const option of item.question.options) assert.ok(!before.includes(option.translation))
  item.checked = true
  item.selectedOptionId = item.question.correctOptionId
  item.isCorrect = true
  const after = await renderToString(createSSRApp(component, props))
  for (const option of item.question.options) assert.ok(after.includes(option.translation))
  assert.ok(after.includes('Переводы и разбор всех вариантов'))
  assert.ok(!after.includes('dialogue-speaker">Ты'))
})
