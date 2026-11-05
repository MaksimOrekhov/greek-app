import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { dialogueCategories, dialogueQuestions } from '../src/data/trainers/dialogueQuestions.ts'
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
  assert.equal(dialogueQuestions.length, 36)
  assert.equal(dialogueQuestions.filter((question) => question.level === 'A1').length, 13)
  assert.equal(dialogueQuestions.filter((question) => question.level === 'A2').length, 23)
  assert.equal(new Set(dialogueQuestions.map((question) => question.id)).size, dialogueQuestions.length)
  assert.equal(new Set(dialogueQuestions.map((question) => question.situationId)).size, dialogueQuestions.length)
  assert.ok(new Set(dialogueQuestions.map((question) => question.intentId)).size >= 24)
  assert.ok(dialogueQuestions.filter((question) => question.level === 'A2').length >= 10)
  assert.equal(dialogueQuestions.filter((question) => question.context.length >= 2).length, 31)

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
    assert.ok(questions.every((item) => item.optionOrder.length === 3))
  }
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

  assert.equal(seenIds.size, 36)
  assert.equal(seenSituations.size, 36)
  assert.equal(seenIntents.size, 36)
  assert.equal(withinSessionRepeats, 0)
  assert.equal(history.exactQuestionSignatures.length, 36)
  assert.equal(history.situationIds.length, 36)
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
