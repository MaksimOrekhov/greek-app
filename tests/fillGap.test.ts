import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createMemoryHistory, createRouter } from 'vue-router'
import { trainerFillGapQuestions, completeFillGapSentence, validateFillGapQuestionBank } from '../src/data/trainers/fillGapQuestions.ts'
import type { FillGapQuestion } from '../src/data/trainers/fillGapQuestions.ts'
import { trainerMultiSelectQuestions } from '../src/data/trainers/multiSelectQuestions.ts'
import { trainerTopics } from '../src/data/trainers/topics.ts'
import { trainerRoutes } from '../src/data/trainers/routes.ts'
import { createTrainerSession } from '../src/lib/trainers/session.ts'
import { createMultiSelectSession } from '../src/lib/trainers/multiSelectSession.ts'
import {
  loadRecentQuestionSignatures,
  rememberGeneratedQuestions,
  type MultiSelectHistoryStorage,
} from '../src/lib/trainers/generation/questionHistory.ts'
import { generateMultiSelectQuestions } from '../src/lib/trainers/generation/multiSelectGenerator.ts'
import {
  advanceFillGapSession,
  checkFillGapAnswer,
  createFillGapSession,
  getFillGapSessionResults,
  restartFillGapSession,
  selectFillGapOption,
  FILL_GAP_QUESTIONS_PER_ROUND,
  FILL_GAP_ROUND_COUNT,
  FILL_GAP_SESSION_QUESTION_COUNT,
} from '../src/lib/trainers/fillGap/fillGapSession.ts'
import {
  availableNumberSequences,
  generateFillGapQuestions,
  generatedFillGapTemplates,
} from '../src/lib/trainers/fillGap/fillGapGenerator.ts'
import {
  fillGapQuestionSignature,
  loadRecentFillGapSignatures,
  rememberFillGapQuestions,
  FILL_GAP_HISTORY_LIMIT_PER_TEMPLATE,
  type FillGapHistoryStorage,
} from '../src/lib/trainers/fillGap/questionHistory.ts'

function seededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

const pronounVerbForms: Record<string, string[]> = {
  εγώ: ['είμαι'], εσύ: ['είσαι'], αυτός: ['είναι'], αυτή: ['είναι'], αυτό: ['είναι'],
  εμείς: ['είμαστε'], εσείς: ['είστε', 'είσαστε'], αυτοί: ['είναι'], αυτές: ['είναι'], αυτά: ['είναι'],
}
const pronounByHint: Array<[string, string]> = [
  ['я ', 'Εγώ'], ['ты ', 'Εσύ'], ['он ', 'Αυτός'], ['она ', 'Αυτή'], ['этот предмет ', 'Αυτό'], ['эта вещь ', 'Αυτό'],
  ['мы ', 'Εμείς'], ['вы ', 'Εσείς'], ['эти мужчины ', 'Αυτοί'], ['эти женщины ', 'Αυτές'], ['эти вещи ', 'Αυτά'],
  ['иван из сербии', 'Αυτός'], ['линда из албании', 'Αυτή'], ['иван и линда здесь', 'Αυτοί'],
  ['подруги дома', 'Αυτές'], ['книга здесь', 'Αυτό'],
]
const dialoguePronounByHint: Record<string, string> = {
  'я здесь. а ты': 'εσύ',
  'ты дома. а я': 'εγώ',
  'мы здесь. а вы': 'εσείς',
  'я из сербии. а ты': 'εσύ',
}

const possessionNouns: Record<string, { russian: string; gender: 'masculine' | 'feminine' | 'plural' }> = {
  'το σπίτι': { russian: 'дом', gender: 'masculine' },
  'το βιβλίο': { russian: 'книга', gender: 'feminine' },
  'η μουσική': { russian: 'музыка', gender: 'feminine' },
  'τα βιβλία': { russian: 'книги', gender: 'plural' },
  'τα σπίτια': { russian: 'дома', gender: 'plural' },
}
const possessiveTranslations: Record<string, Record<'masculine' | 'feminine' | 'plural', string>> = {
  μου: { masculine: 'мой', feminine: 'моя', plural: 'мои' },
  σου: { masculine: 'твой', feminine: 'твоя', plural: 'твои' },
  του: { masculine: 'его', feminine: 'его', plural: 'его' },
  της: { masculine: 'её', feminine: 'её', plural: 'её' },
  μας: { masculine: 'наш', feminine: 'наша', plural: 'наши' },
  σας: { masculine: 'ваш', feminine: 'ваша', plural: 'ваши' },
  τους: { masculine: 'их', feminine: 'их', plural: 'их' },
}
const recipientTranslations: Record<string, string> = {
  μου: 'мне', σου: 'тебе', του: 'ему', της: 'ей', μας: 'нам', σας: 'вам', τους: 'им',
}
const numberByWord: Record<string, number> = {
  μηδέν: 0, ένα: 1, δύο: 2, τρία: 3, τέσσερα: 4, πέντε: 5, έξι: 6, επτά: 7, οκτώ: 8, εννέα: 9,
  δέκα: 10, έντεκα: 11, δώδεκα: 12, δεκατρία: 13, δεκατέσσερα: 14, δεκαπέντε: 15, δεκαέξι: 16,
  δεκαεπτά: 17, δεκαοκτώ: 18, δεκαεννέα: 19, είκοσι: 20, 'είκοσι ένα': 21, 'είκοσι δύο': 22,
  'είκοσι τρία': 23, 'είκοσι τέσσερα': 24, 'είκοσι πέντε': 25, 'είκοσι οκτώ': 28, τριάντα: 30,
  'τριάντα ένα': 31, 'τριάντα τέσσερα': 34, σαράντα: 40, 'σαράντα τρία': 43, πενήντα: 50,
  'πενήντα τρία': 53, εξήντα: 60, 'εξήντα τρία': 63, εβδομήντα: 70, 'εβδομήντα τρία': 73,
  ογδόντα: 80, 'ογδόντα τρία': 83, 'ογδόντα εννέα': 89, ενενήντα: 90, 'ενενήντα τέσσερα': 94,
  εκατό: 100, 'εκατόν ένα': 101, 'εκατόν δύο': 102, 'εκατόν επτά': 107, 'εκατόν είκοσι': 120,
  'εκατόν είκοσι πέντε': 125, 'εκατόν σαράντα': 140, 'εκατόν εβδομήντα οκτώ': 178,
  'εκατόν ενενήντα εννέα': 199, διακόσια: 200,
}

function correctOption(question: FillGapQuestion): FillGapQuestion['options'][number] {
  return question.options.find((option) => option.id === question.correctOptionId)!
}

function normalized(value: string): string {
  return value.normalize('NFC').trim().replace(/[.!?;]+$/u, '').toLocaleLowerCase('ru')
}

function personalExpected(hint: string, templateId: string | undefined): string | undefined {
  if (templateId === 'pronoun-dialogue') return dialoguePronounByHint[normalized(hint)]
  const clue = normalized(hint)
  return pronounByHint.find(([prefix]) => clue.startsWith(prefix))?.[1]
}

function matchesReference(question: FillGapQuestion, candidate: string): boolean {
  const value = candidate.toLocaleLowerCase('el')
  if (question.topicId === 'personal-pronouns') {
    const expected = personalExpected(question.hint, question.templateId)
    if (!expected || candidate !== expected && value !== expected.toLocaleLowerCase('el')) return false
    if (question.templateId === 'pronoun-dialogue') return true
    const form = question.sentenceAfter.trim().split(/\s+/u)[0]
    return pronounVerbForms[value]?.includes(form) ?? false
  }

  if (question.topicId === 'personal-pronouns-genitive') {
    if (question.sentenceBefore.trim()) {
      const nounPhrase = question.sentenceBefore.trim().toLocaleLowerCase('el')
      const noun = possessionNouns[nounPhrase]
      const possessor = possessiveTranslations[value]
      if (!noun || !possessor) return false
      return `${possessor[noun.gender]} ${noun.russian}` === normalized(question.hint)
    }

    const recipient = recipientTranslations[value]
    if (!recipient) return false
    const after = question.sentenceAfter.trim().replace(/[.!?;]+$/u, '')
    let russian: string | undefined
    if (after === 'αρέσει ο καφές') russian = `${recipient} нравится кофе`
    else if (after === 'αρέσει η μουσική') russian = `${recipient} нравится музыка`
    else if (after === 'δίνω το βιβλίο') russian = `я даю ${recipient} книгу`
    else if (after === 'δίνουν ένα βιβλίο') russian = `${recipient} дают книгу`
    return russian === normalized(question.hint)
  }

  if (question.topicId === 'verb-eimai') {
    const subject = question.sentenceBefore.trim().split(/\s+/u)[0]!.toLocaleLowerCase('el')
    const pronoun = pronounVerbForms[subject]
    const allowed = pronoun ?? (subject ? ['είναι'] : [])
    return allowed.includes(value)
  }

  if (question.topicId === 'numbers') {
    if (/^\d+\s*=\s*$/u.test(question.sentenceBefore)) {
      return numberByWord[value] === Number(question.sentenceBefore.match(/^\d+/u)![0])
    }
    if (/^(?:Ο καφές|Το εισιτήριο)/u.test(question.sentenceBefore)) {
      return numberByWord[value] === Number(question.hint.match(/\d+/u)![0])
    }
    const values = question.sentenceBefore.split(',').map((word) => numberByWord[word.trim().toLocaleLowerCase('el')]).filter((item) => item !== undefined)
    if (values.length !== 3) return false
    const step = values[1]! - values[0]!
    return step > 0 && values[2]! - values[1]! === step && numberByWord[value] === values[2]! + step
  }
  return false
}

function assertOneAnswer(question: FillGapQuestion): void {
  const semanticallyValid = question.options.filter((option) => matchesReference(question, option.text))
  assert.equal(semanticallyValid.length, 1, `${question.id}: hint=${question.hint}; before=${question.sentenceBefore}; after=${question.sentenceAfter}; valid=${semanticallyValid.map((item) => item.text).join(', ')}`)
  assert.equal(semanticallyValid[0]!.id, question.correctOptionId, question.id)
}

function answerCurrent(session: ReturnType<typeof createFillGapSession>, correct: boolean) {
  const active = session.rounds[session.currentRoundIndex]!.questions[session.currentQuestionIndex]!
  const option = correct
    ? correctOption(active.question)
    : active.question.options.find((item) => item.id !== active.question.correctOptionId)!
  const selected = selectFillGapOption(session, option.id)
  assert.equal(selected.outcome, 'selected')
  const checked = checkFillGapAnswer(selected.session)
  assert.equal(checked.outcome, 'checked')
  return advanceFillGapSession(checked.session)
}

class MemoryStorage implements FillGapHistoryStorage, MultiSelectHistoryStorage {
  readonly values = new Map<string, string>()
  getItem(key: string): string | null { return this.values.get(key) ?? null }
  setItem(key: string, value: string): void { this.values.set(key, value) }
}

const bankForTopic = (topicId: string) => trainerFillGapQuestions.filter((question) => question.topicId === topicId)

test('fixed fill-gap bank is valid, expandable, and has at least twelve questions per topic', () => {
  assert.deepEqual(validateFillGapQuestionBank(), [])
  for (const topic of trainerTopics) {
    assert.ok(topic.availableExercises.includes('fill-gaps'))
    const bank = bankForTopic(topic.id)
    assert.ok(bank.length >= 12, topic.id)
    assert.ok(bank.every((question) => question.templateId === undefined), topic.id)
    assert.equal(new Set(bank.map((question) => question.id)).size, bank.length)
    for (const question of bank) {
      assert.ok(question.instruction.trim())
      assert.ok(question.hint.trim())
      assert.ok(question.explanation.trim())
      assert.ok(question.options.length >= 3 && question.options.length <= 4)
      assert.equal(new Set(question.options.map((option) => option.id)).size, question.options.length)
      assert.equal(new Set(question.options.map((option) => normalized(option.text))).size, question.options.length)
      assert.equal(question.options.filter((option) => option.id === question.correctOptionId).length, 1)
      assert.doesNotMatch(question.sentenceBefore + question.sentenceAfter, /_{2,}|□/u)
      assert.ok(completeFillGapSentence(question).trim())
      assertOneAnswer(question)
    }
  }
})

test('fill-gap validator catches incomplete, duplicated, ambiguous-structure, and unregistered questions', () => {
  const good = trainerFillGapQuestions[0]!
  const malformed: FillGapQuestion = {
    ...good,
    id: 'bad-fill-gap',
    topicId: 'unknown-topic',
    instruction: '',
    hint: '',
    explanation: '',
    sentenceBefore: '_____ ',
    sentenceAfter: ' _____',
    correctOptionId: 'missing-option',
    options: [
      { id: 'same', text: 'εγώ' },
      { id: 'same', text: 'εγώ' },
    ],
  }
  const errors = validateFillGapQuestionBank([malformed, malformed])
  assert.ok(errors.some((error) => error.includes('Повторяется задание')))
  assert.ok(errors.some((error) => error.includes('Неполные данные')))
  assert.ok(errors.some((error) => error.includes('не зарегистрирована тема')))
  assert.ok(errors.some((error) => error.includes('больше одного места')))
  assert.ok(errors.some((error) => error.includes('от трёх до четырёх')))
  assert.ok(errors.some((error) => error.includes('Повторяется вариант')))
  assert.ok(errors.some((error) => error.includes('Повторяется текст')))
  assert.ok(errors.some((error) => error.includes('не найден правильный вариант')))
})

test('each topic has three distinct templates with independently checked answers', () => {
  for (const topic of trainerTopics) {
    const templates = generatedFillGapTemplates(topic.id)
    assert.equal(templates.length, 3, topic.id)
    assert.equal(new Set(templates).size, 3, topic.id)
    const generated = generateFillGapQuestions(topic.id, seededRandom(54))
    assert.equal(generated.length, 6, topic.id)
    assert.deepEqual(validateFillGapQuestionBank(generated), [])
    assert.deepEqual(Object.values(generated.reduce<Record<string, number>>((counts, question) => {
      counts[question.templateId!] = (counts[question.templateId!] ?? 0) + 1
      return counts
    }, {})).sort(), [2, 2, 2])
    for (const question of generated) assert.doesNotMatch(question.instruction, /местоимени|падеж|грамматическ/iu)
    generated.forEach(assertOneAnswer)
  }
  assert.ok(availableNumberSequences().length >= 100)
})

test('all four generators stay valid and unambiguous across two hundred fixed seeds', () => {
  for (const [topicIndex, topic] of trainerTopics.entries()) {
    for (let seed = 0; seed < 200; seed += 1) {
      const generated = generateFillGapQuestions(topic.id, seededRandom(topicIndex * 10_000 + seed))
      assert.equal(generated.length, 6, `${topic.id}: ${seed}`)
      assert.equal(new Set(generated.map((question) => question.id)).size, 6, `${topic.id}: ${seed}`)
      assert.equal(new Set(generated.map(fillGapQuestionSignature)).size, 6, `${topic.id}: ${seed}`)
      for (const question of generated) {
        assert.ok(question.options.length >= 3 && question.options.length <= 4)
        assert.equal(new Set(question.options.map((option) => option.id)).size, question.options.length)
        assert.equal(new Set(question.options.map((option) => normalized(option.text))).size, question.options.length)
        assert.ok(question.options.some((option) => option.id === question.correctOptionId))
        assertOneAnswer(question)
      }
    }
  }
})

test('seeded training and recent history change sentence content over ten starts', () => {
  for (const topic of trainerTopics) {
    const storage = new MemoryStorage()
    const byTemplate = new Map<string, Set<string>>()
    for (let run = 0; run < 10; run += 1) {
      const generated = generateFillGapQuestions(topic.id, seededRandom(2400 + run), loadRecentFillGapSignatures(topic.id, storage))
      const signaturesByTemplate = new Map<string, Set<string>>()
      for (const question of generated) {
        const signature = fillGapQuestionSignature(question)
        const seen = byTemplate.get(question.templateId!) ?? new Set<string>()
        seen.add(signature)
        byTemplate.set(question.templateId!, seen)
        const sessionSignatures = signaturesByTemplate.get(question.templateId!) ?? new Set<string>()
        sessionSignatures.add(signature)
        signaturesByTemplate.set(question.templateId!, sessionSignatures)
      }
      assert.ok([...signaturesByTemplate.values()].every((signatures) => signatures.size === 2), topic.id)
      rememberFillGapQuestions(topic.id, generated, storage)
    }
    assert.ok([...byTemplate.values()].every((signatures) => signatures.size >= 10), topic.id)
  }
})

test('the ten-question session keeps six generated and four fixed questions across five rounds', () => {
  for (const topic of trainerTopics) {
    const generated = generateFillGapQuestions(topic.id, seededRandom(89))
    const session = createFillGapSession(topic.id, trainerFillGapQuestions, seededRandom(90), generated)
    const questions = session.rounds.flatMap((round) => round.questions.map((item) => item.question))
    assert.equal(session.rounds.length, FILL_GAP_ROUND_COUNT)
    assert.ok(session.rounds.every((round) => round.questions.length === FILL_GAP_QUESTIONS_PER_ROUND))
    assert.equal(questions.length, FILL_GAP_SESSION_QUESTION_COUNT)
    assert.equal(questions.filter((question) => question.templateId).length, 6)
    assert.equal(questions.filter((question) => !question.templateId).length, 4)
    assert.equal(new Set(questions.map((question) => question.id)).size, 10)
    assert.ok(session.rounds.flatMap((round) => round.questions).every((item) => item.selectedOptionId === null && !item.checked))
  }
})

test('selection can change before checking; empty and repeated checks are blocked', () => {
  const session = createFillGapSession('personal-pronouns', trainerFillGapQuestions, seededRandom(17), generateFillGapQuestions('personal-pronouns', seededRandom(18)))
  const active = session.rounds[0]!.questions[0]!
  const noAnswer = checkFillGapAnswer(session)
  assert.equal(noAnswer.outcome, 'no-selection')
  assert.equal(noAnswer.session, session)

  const firstChoice = active.question.options.find((option) => option.id !== active.question.correctOptionId)!
  const selectedFirst = selectFillGapOption(session, firstChoice.id)
  assert.equal(selectedFirst.session.rounds[0]!.questions[0]!.selectedOptionId, firstChoice.id)
  assert.equal(session.rounds[0]!.questions[0]!.selectedOptionId, null)
  const selectedCorrect = selectFillGapOption(selectedFirst.session, active.question.correctOptionId)
  assert.equal(selectedCorrect.session.rounds[0]!.questions[0]!.selectedOptionId, active.question.correctOptionId)

  const checked = checkFillGapAnswer(selectedCorrect.session)
  assert.equal(checked.outcome, 'checked')
  assert.equal(checked.session.rounds[0]!.questions[0]!.isCorrect, true)
  assert.equal(checkFillGapAnswer(checked.session).outcome, 'already-checked')
  assert.equal(selectFillGapOption(checked.session, firstChoice.id).outcome, 'already-checked')
  assert.equal(advanceFillGapSession(session), session)
})

test('five rounds finish once and results report correct answers, errors, accuracy, and rounds', () => {
  const topicId = 'personal-pronouns-genitive'
  let session = createFillGapSession(topicId, trainerFillGapQuestions, seededRandom(22), generateFillGapQuestions(topicId, seededRandom(23)))
  for (let index = 0; index < 10; index += 1) session = answerCurrent(session, ![2, 5, 9].includes(index))

  assert.equal(session.completed, true)
  const result = getFillGapSessionResults(session)
  assert.deepEqual(result, {
    totalQuestions: 10,
    correctAnswers: 7,
    errors: 3,
    accuracyPercent: 70,
    completedRounds: 5,
    totalRounds: 5,
  })
  assert.equal(advanceFillGapSession(session), session)
  assert.equal(checkFillGapAnswer(session).outcome, 'session-completed')
})

test('restart starts clean and receives varied generated content', () => {
  const topicId = 'verb-eimai'
  const firstGenerated = generateFillGapQuestions(topicId, seededRandom(330))
  const first = createFillGapSession(topicId, trainerFillGapQuestions, seededRandom(331), firstGenerated)
  const inProgress = answerCurrent(first, false)
  const secondGenerated = generateFillGapQuestions(topicId, seededRandom(332), {
    ...Object.fromEntries(firstGenerated.reduce<Map<string, string[]>>((history, question) => {
      const values = history.get(question.templateId!) ?? []
      history.set(question.templateId!, [...values, fillGapQuestionSignature(question)])
      return history
    }, new Map<string, string[]>())),
  })
  const restarted = restartFillGapSession(inProgress, trainerFillGapQuestions, secondGenerated, seededRandom(333))
  assert.equal(restarted.currentRoundIndex, 0)
  assert.equal(restarted.currentQuestionIndex, 0)
  assert.equal(restarted.completed, false)
  assert.ok(restarted.rounds.every((round) => !round.completed && round.questions.every((item) => !item.checked && item.selectedOptionId === null)))
  const previousSignatures = new Set(firstGenerated.map(fillGapQuestionSignature))
  assert.ok(secondGenerated.some((question) => !previousSignatures.has(fillGapQuestionSignature(question))))
})

test('adding one fixed question does not change session balance, rounds, IDs, or completion', () => {
  const original = trainerFillGapQuestions.find((question) => question.id === 'pronouns-i-here')!
  const extraId = 'test-extra-pronouns-question'
  const added: FillGapQuestion = {
    ...original,
    id: extraId,
    sentenceAfter: ' είμαι στο σπίτι.',
    hint: 'Я сейчас дома.',
    explanation: 'С «я» используется είμαι: Εγώ είμαι στο σπίτι — «Я дома».',
    options: original.options.map((option, index) => ({ ...option, id: `${extraId}-option-${index + 1}` })),
    correctOptionId: `${extraId}-option-${original.options.findIndex((option) => option.id === original.correctOptionId) + 1}`,
  }
  const extended = [...trainerFillGapQuestions, added]
  assert.deepEqual(validateFillGapQuestionBank(extended), [])
  assert.equal(trainerFillGapQuestions.some((question) => question.id === extraId), false)

  const topicId = 'personal-pronouns'
  const generated = generateFillGapQuestions(topicId, seededRandom(500))
  let session = createFillGapSession(topicId, extended, seededRandom(501), generated)
  const questions = session.rounds.flatMap((round) => round.questions.map((item) => item.question))
  assert.equal(session.rounds.length, 5)
  assert.equal(questions.length, 10)
  assert.equal(questions.filter((question) => question.templateId).length, 6)
  assert.equal(questions.filter((question) => !question.templateId).length, 4)
  assert.equal(new Set(questions.map((question) => question.id)).size, 10)
  for (let index = 0; index < 10; index += 1) session = answerCurrent(session, true)
  assert.equal(session.completed, true)
  assert.equal(getFillGapSessionResults(session).correctAnswers, 10)
})

test('T3 state and history stay independent from pair matching and T2', () => {
  const storage = new MemoryStorage()
  const oldMultiSelect = generateMultiSelectQuestions('numbers', seededRandom(600))
  rememberGeneratedQuestions('numbers', oldMultiSelect, storage)
  const beforeT2History = loadRecentQuestionSignatures('numbers', storage)
  assert.deepEqual(loadRecentFillGapSignatures('numbers', storage), {})

  const t1 = createTrainerSession('personal-pronouns', [{ id: 'pair-a', prompt: 'я', answer: 'εγώ' }, { id: 'pair-b', prompt: 'ты', answer: 'εσύ' }], seededRandom(61))
  const t2 = createMultiSelectSession(
    'numbers',
    trainerMultiSelectQuestions,
    seededRandom(62),
    undefined,
    generateMultiSelectQuestions('numbers', seededRandom(63)),
  )
  const t3 = createFillGapSession('numbers', trainerFillGapQuestions, seededRandom(64), generateFillGapQuestions('numbers', seededRandom(65)))
  const t3Question = t3.rounds[0]!.questions[0]!
  const t3Selected = selectFillGapOption(t3, t3Question.question.correctOptionId).session
  rememberFillGapQuestions('numbers', generateFillGapQuestions('numbers', seededRandom(66)), storage)

  assert.deepEqual(t1.rounds[0]!.foundPairIds, [])
  assert.ok(t2.rounds[0]!.questions.every((question) => !question.checked && question.selectedOptionIds.length === 0))
  assert.equal(t3Selected.rounds[0]!.questions[0]!.selectedOptionId, t3Question.question.correctOptionId)
  assert.deepEqual(loadRecentQuestionSignatures('numbers', storage), beforeT2History)
  assert.equal(storage.values.size, 2)
  assert.ok([...storage.values.keys()].some((key) => key.includes('multi-select')))
  assert.ok([...storage.values.keys()].some((key) => key.includes('fill-gap')))
})

test('history is bounded, ignores corruption, and tolerates unavailable storage', () => {
  const storage = new MemoryStorage()
  const first = generateFillGapQuestions('numbers', seededRandom(700))
  rememberFillGapQuestions('numbers', first, storage)
  assert.equal(Object.keys(loadRecentFillGapSignatures('numbers', storage)).length, 3)
  const repeat = generateFillGapQuestions('numbers', seededRandom(700), loadRecentFillGapSignatures('numbers', storage))
  assert.ok(repeat.some((question) => !first.some((prior) => fillGapQuestionSignature(prior) === fillGapQuestionSignature(question))))

  for (let seed = 0; seed < 40; seed += 1) {
    rememberFillGapQuestions('numbers', generateFillGapQuestions('numbers', seededRandom(800 + seed)), storage)
  }
  const bounded = loadRecentFillGapSignatures('numbers', storage)
  assert.ok(Object.values(bounded).every((signatures) => signatures.length <= FILL_GAP_HISTORY_LIMIT_PER_TEMPLATE))
  assert.equal(JSON.parse(storage.values.get('greek-app:fill-gap-question-history')!).version, 1)

  storage.values.set('greek-app:fill-gap-question-history', '{broken json')
  assert.deepEqual(loadRecentFillGapSignatures('numbers', storage), {})
  assert.doesNotThrow(() => rememberFillGapQuestions('numbers', first, storage))

  const failingStorage: FillGapHistoryStorage = {
    getItem() { throw new Error('storage blocked') },
    setItem() { throw new Error('storage blocked') },
  }
  assert.deepEqual(loadRecentFillGapSignatures('numbers', failingStorage), {})
  assert.doesNotThrow(() => rememberFillGapQuestions('numbers', first, failingStorage))
  assert.deepEqual(loadRecentFillGapSignatures('unknown', undefined), {})
  assert.deepEqual(generateFillGapQuestions('unknown-topic', seededRandom(1)), [])
})

test('routes and fill-gap controls keep the exercise button-based, accessible, and reduced-motion friendly', async () => {
  const router = createRouter({ history: createMemoryHistory(), routes: trainerRoutes })
  for (const topic of trainerTopics) {
    const route = router.resolve(`/trainers/${topic.id}/fill-gaps`)
    assert.equal(route.name, 'trainer-fill-gaps')
    assert.equal(route.params.topicId, topic.id)
  }

  const exercise = await readFile('src/components/trainers/FillGapExercise.vue', 'utf8')
  assert.doesNotMatch(exercise, /<(?:input|textarea)\b/i)
  assert.doesNotMatch(exercise, /v-html/)
  assert.match(exercise, /type="button"/)
  assert.match(exercise, /aria-pressed=/)
  assert.match(exercise, /aria-live="polite"/)
  assert.match(exercise, /sentence-gap/)
  assert.match(exercise, /selectedOption\?\.text/)
  assert.match(exercise, /completeFillGapSentence/)
  assert.match(exercise, /option\.id === question\.correctOptionId/)
  assert.match(exercise, /is-incorrect/)
  assert.match(exercise, /focus-visible/)
  assert.match(exercise, /prefers-reduced-motion/)
  assert.match(exercise, /\.fill-gap-exercise h2\s*\{[^}]*font: 600 14px/s)
  assert.match(exercise, /\.fill-gap-hint\s*\{[^}]*font-size: 17px/s)
  assert.match(exercise, /\.sentence-line\s*\{[^}]*clamp\(24px/s)
})
