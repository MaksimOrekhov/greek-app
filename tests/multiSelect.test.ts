import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createMemoryHistory, createRouter } from 'vue-router'
import { trainerMultiSelectQuestions, validateMultiSelectQuestionBank } from '../src/data/trainers/multiSelectQuestions.ts'
import { trainerTopics, validateTrainerRegistry } from '../src/data/trainers/topics.ts'
import { trainerRoutes } from '../src/data/trainers/routes.ts'
import {
  advanceMultiSelectSession,
  createMultiSelectSession,
  getMultiSelectSessionResults,
  MULTI_SELECT_QUESTIONS_PER_ROUND,
  MULTI_SELECT_ROUND_COUNT,
  MULTI_SELECT_SESSION_QUESTION_COUNT,
  submitMultiSelectAnswer,
  toggleMultiSelectOption,
} from '../src/lib/trainers/multiSelectSession.ts'
import type { MultiSelectQuestion } from '../src/data/trainers/multiSelectQuestions.ts'

function seededRandom(seed: number): () => number {
  let value = seed
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296
    return value / 4294967296
  }
}

function currentQuestion(session: ReturnType<typeof createMultiSelectSession>) {
  return session.rounds[session.currentRoundIndex]!.questions[session.currentQuestionIndex]!
}

function answerCurrentCorrectly(session: ReturnType<typeof createMultiSelectSession>) {
  let current = session
  for (const option of currentQuestion(current).question.options.filter((item) => item.correct)) {
    current = toggleMultiSelectOption(current, option.id).session
  }
  current = submitMultiSelectAnswer(current).session
  return current
}

test('all four topics expose at least 12 beginner-friendly multiple-selection questions', () => {
  assert.deepEqual(validateTrainerRegistry(), [])
  assert.deepEqual(validateMultiSelectQuestionBank(), [])
  for (const topic of trainerTopics) {
    assert.ok(topic.availableExercises.includes('multi-select'))
    assert.ok(trainerMultiSelectQuestions.filter((item) => item.topicId === topic.id).length >= 12)
    assert.equal(createMultiSelectSession(topic.id, trainerMultiSelectQuestions, seededRandom(71)).rounds.length, 5)
  }
  assert.ok(trainerMultiSelectQuestions.length >= 48)
  assert.ok(trainerMultiSelectQuestions.every((item) => item.options.filter((option) => option.correct).length >= 2))
  assert.ok(trainerMultiSelectQuestions.every((item) => item.options.some((option) => !option.correct)))

  const prompts = trainerMultiSelectQuestions.map((item) => item.prompt).join('\n')
  assert.doesNotMatch(prompts, /третье лицо|родительн\w* падеж|винительн\w* падеж|множественн\w* число|грамматическ\w* лиц/iu)
})

test('number comparisons require reading Greek and explain every option numerically', () => {
  const rangeIds = [
    'numbers-over-fifty',
    'numbers-under-twenty',
    'numbers-twenty-to-fifty',
    'numbers-over-hundred',
    'numbers-round-tens',
    'numbers-between-fifty-and-one-hundred',
    'numbers-below-fifty',
  ]
  const rangeQuestions = trainerMultiSelectQuestions.filter((item) => rangeIds.includes(item.id))
  assert.equal(rangeQuestions.length, rangeIds.length)

  for (const item of rangeQuestions) {
    for (const option of item.options) {
      assert.doesNotMatch(option.text, /\d/u)
      assert.match(option.text, /^[\p{Script=Greek}\s]+$/u)
      assert.match(item.explanation, new RegExp(option.text + '\\s+—\\s+\\d+', 'u'))
    }
  }
})

test('pronoun questions clarify polite εσείς and avoid treating people as possessions', () => {
  const groupQuestion = trainerMultiSelectQuestions.find((item) => item.id === 'pronouns-in-groups')!
  assert.match(groupQuestion.explanation, /вежливым «Вы» при обращении к одному человеку/u)

  const genitiveOptions = trainerMultiSelectQuestions
    .filter((item) => item.topicId === 'personal-pronouns-genitive')
    .flatMap((item) => item.options.map((option) => option.text))
  assert.ok(genitiveOptions.every((option) => !/οι φίλοι|η φίλη|ο πατέρας/u.test(option)))
  assert.ok(trainerMultiSelectQuestions.some((item) => item.id === 'genitive-plural-before-verb'))
})

test('Serbia introduction uses the correct final nu form and keeps translations aligned', () => {
  const introductions = trainerMultiSelectQuestions.find((item) => item.id === 'eimai-introductions')!
  const serbiaOptions = introductions.options.filter((option) => option.text.includes('Σερβία'))

  assert.equal(serbiaOptions.length, 3)
  assert.ok(serbiaOptions.every((option) => option.text.includes('από τη Σερβία')))
  assert.ok(serbiaOptions.every((option) => !option.text.includes('από την Σερβία')))
  assert.equal(serbiaOptions.filter((option) => option.correct).length, 1)
  assert.match(serbiaOptions.find((option) => option.correct)!.text, /Я Иван из Сербии/u)
})

test('είμαι explanations distinguish the verb from the pronoun «я»', () => {
  const eimaiQuestions = trainerMultiSelectQuestions.filter((item) => item.topicId === 'verb-eimai')
  assert.ok(eimaiQuestions.every((item) => !/είμαι\s+(?:значит|означает)\s+«я»/iu.test(item.explanation)))
  const professions = eimaiQuestions.find((item) => item.id === 'eimai-professions')!
  assert.match(professions.explanation, /глагола «быть»/u)
})

test('grammar-focused είμαι questions use full Greek sentences and contrast multiple forms', () => {
  const grammarQuestionIds = ['eimai-we-location', 'eimai-you-location', 'eimai-they-location']
  const grammarQuestions = trainerMultiSelectQuestions.filter((item) => grammarQuestionIds.includes(item.id))
  assert.equal(grammarQuestions.length, grammarQuestionIds.length)

  for (const item of grammarQuestions) {
    assert.ok(item.options.filter((option) => option.correct).length >= 2)
    assert.ok(item.options.some((option) => !option.correct))
    assert.ok(item.options.every((option) => !option.text.includes(' — ')))
    const verbForms = new Set(item.options.map((option) => option.text.match(/είμαι|είσαι|είναι|είμαστε|είστε/u)?.[0]))
    assert.ok(verbForms.size >= 2)
    assert.ok(item.options.every((option) => /είμαι|είσαι|είναι|είμαστε|είστε/u.test(option.text)))
  }
})

test('question bank validator reports duplicate, empty, missing, and unknown data', () => {
  const goodQuestion = trainerMultiSelectQuestions[0]!
  const malformed = {
    ...goodQuestion,
    id: 'bad-question',
    topicId: 'missing-topic',
    prompt: '',
    explanation: '',
    options: [
      { id: 'same', text: 'εγώ', correct: true },
      { id: 'same', text: 'εγώ', correct: true },
      { id: 'third', text: 'εμείς', correct: true },
      { id: 'fourth', text: 'εσύ', correct: true },
    ],
  } satisfies MultiSelectQuestion
  const oneCorrect = {
    ...goodQuestion,
    id: 'one-correct',
    options: goodQuestion.options.map((option, index) => ({ ...option, id: `one-${index}`, correct: index === 0 })),
  }
  const tooFewOptions = { ...goodQuestion, id: 'too-few-options', options: goodQuestion.options.slice(0, 3) }

  const errors = validateMultiSelectQuestionBank([malformed, malformed, oneCorrect, tooFewOptions])
  assert.ok(errors.some((error) => error.includes('Повторяется вопрос')))
  assert.ok(errors.some((error) => error.includes('не найдена тема')))
  assert.ok(errors.some((error) => error.includes('Неполные данные')))
  assert.ok(errors.some((error) => error.includes('Повторяется вариант')))
  assert.ok(errors.some((error) => error.includes('Повторяется текст')))
  assert.ok(errors.some((error) => error.includes('неправильный вариант')))
  assert.ok(errors.some((error) => error.includes('не меньше двух правильных')))
  assert.ok(errors.some((error) => error.includes('меньше четырёх вариантов')))
})

test('a five-round session uses ten distinct questions and shuffles options without changing answers', () => {
  const bank = trainerMultiSelectQuestions.filter((item) => item.topicId === 'personal-pronouns')
  const session = createMultiSelectSession('personal-pronouns', bank, seededRandom(17))
  const instances = session.rounds.flatMap((round) => round.questions)

  assert.equal(session.rounds.length, MULTI_SELECT_ROUND_COUNT)
  assert.ok(session.rounds.every((round) => round.questions.length === MULTI_SELECT_QUESTIONS_PER_ROUND))
  assert.equal(instances.length, MULTI_SELECT_SESSION_QUESTION_COUNT)
  assert.equal(new Set(instances.map((item) => item.question.id)).size, MULTI_SELECT_SESSION_QUESTION_COUNT)
  for (const instance of instances) {
    assert.deepEqual(new Set(instance.optionOrder), new Set(instance.question.options.map((option) => option.id)))
    const originalCorrectness = new Map(instance.question.options.map((option) => [option.id, option.correct]))
    const originalCorrectIds = [...originalCorrectness].filter(([, correct]) => correct).map(([id]) => id).sort()
    const shuffledCorrectIds = instance.optionOrder.filter((optionId) => originalCorrectness.get(optionId)).sort()
    assert.deepEqual(shuffledCorrectIds, originalCorrectIds)
  }
  assert.ok(instances.some((instance) => instance.optionOrder.some((id, index) => id !== instance.question.options[index]?.id)))

  const tiny = createMultiSelectSession('personal-pronouns', bank.slice(0, 1), seededRandom(19))
  assert.equal(tiny.rounds.flatMap((round) => round.questions).length, 10)
  assert.ok(tiny.rounds.flatMap((round) => round.questions).every((item) => item.question.id === bank[0]!.id))
})

test('options can be selected and deselected before checking; empty submission does nothing', () => {
  let session = createMultiSelectSession('personal-pronouns', trainerMultiSelectQuestions, seededRandom(2))
  const active = currentQuestion(session)
  const correctOption = active.question.options.find((option) => option.correct)!
  assert.equal(submitMultiSelectAnswer(session).outcome, 'no-selection')
  assert.equal(currentQuestion(session).checked, false)

  session = toggleMultiSelectOption(session, correctOption.id).session
  assert.deepEqual(currentQuestion(session).selectedOptionIds, [correctOption.id])
  session = toggleMultiSelectOption(session, correctOption.id).session
  assert.deepEqual(currentQuestion(session).selectedOptionIds, [])
  assert.equal(toggleMultiSelectOption(session, 'missing-option').outcome, 'invalid')
})

test('only an exact selection is fully correct and checking cannot be repeated', () => {
  let session = createMultiSelectSession('personal-pronouns', trainerMultiSelectQuestions, seededRandom(33))
  const active = currentQuestion(session)
  const correctOptions = active.question.options.filter((option) => option.correct)
  const incorrectOption = active.question.options.find((option) => !option.correct)!

  for (const option of correctOptions) session = toggleMultiSelectOption(session, option.id).session
  assert.equal(submitMultiSelectAnswer(session).outcome, 'checked')
  session = submitMultiSelectAnswer(session).session
  assert.equal(currentQuestion(session).isCorrect, true)
  assert.equal(submitMultiSelectAnswer(session).outcome, 'already-checked')
  assert.equal(toggleMultiSelectOption(session, incorrectOption.id).outcome, 'already-checked')

  session = advanceMultiSelectSession(session)
  const partialQuestion = currentQuestion(session)
  const partialCorrectOption = partialQuestion.question.options.find((option) => option.correct)!
  const expectedMissed = partialQuestion.question.options.filter((option) => option.correct).length - 1
  session = toggleMultiSelectOption(session, partialCorrectOption.id).session
  session = submitMultiSelectAnswer(session).session
  assert.equal(currentQuestion(session).isCorrect, false)
  assert.equal(currentQuestion(session).missedOptionIds.length, expectedMissed)
  assert.deepEqual(currentQuestion(session).incorrectOptionIds, [])

  session = advanceMultiSelectSession(session)
  const extraQuestion = currentQuestion(session)
  const extraOptions = [...extraQuestion.question.options.filter((option) => option.correct), extraQuestion.question.options.find((option) => !option.correct)!]
  for (const option of extraOptions) session = toggleMultiSelectOption(session, option.id).session
  session = submitMultiSelectAnswer(session).session
  assert.equal(currentQuestion(session).isCorrect, false)
  assert.equal(currentQuestion(session).missedOptionIds.length, 0)
  assert.equal(currentQuestion(session).incorrectOptionIds.length, 1)
  assert.deepEqual(getMultiSelectSessionResults(session), {
    completedRounds: 1,
    totalRounds: 5,
    totalQuestions: 10,
    correctAnswers: 1,
    questionsWithErrors: 2,
    missedCorrectOptions: expectedMissed,
    incorrectlySelectedOptions: 1,
  })
})

test('rounds cannot be skipped and a completed session reports all requested result counts', () => {
  let session = createMultiSelectSession('numbers', trainerMultiSelectQuestions, seededRandom(8))
  assert.equal(advanceMultiSelectSession(session), session)

  for (let index = 0; index < MULTI_SELECT_SESSION_QUESTION_COUNT; index += 1) {
    session = answerCurrentCorrectly(session)
    assert.equal(currentQuestion(session).isCorrect, true)
    session = advanceMultiSelectSession(session)
    if (index % MULTI_SELECT_QUESTIONS_PER_ROUND === 1 && index < MULTI_SELECT_SESSION_QUESTION_COUNT - 1) {
      assert.equal(session.currentQuestionIndex, 0)
      assert.equal(session.currentRoundIndex, Math.ceil(index / MULTI_SELECT_QUESTIONS_PER_ROUND))
    }
  }

  assert.equal(session.completed, true)
  assert.equal(advanceMultiSelectSession(session), session)
  assert.equal(submitMultiSelectAnswer(session).outcome, 'session-completed')
  assert.deepEqual(getMultiSelectSessionResults(session), {
    completedRounds: 5,
    totalRounds: 5,
    totalQuestions: 10,
    correctAnswers: 10,
    questionsWithErrors: 0,
    missedCorrectOptions: 0,
    incorrectlySelectedOptions: 0,
  })
})

test('restart resets the session and varies the question or option order', () => {
  const bank = trainerMultiSelectQuestions.filter((item) => item.topicId === 'verb-eimai')
  const first = createMultiSelectSession('verb-eimai', bank, () => 0)
  const inProgress = answerCurrentCorrectly(first)
  const restarted = createMultiSelectSession('verb-eimai', bank, () => 0, inProgress)
  const signature = (session: typeof first) => session.rounds.map((round) => round.questions.map((item) => [item.question.id, item.optionOrder]))

  assert.equal(restarted.currentRoundIndex, 0)
  assert.equal(restarted.currentQuestionIndex, 0)
  assert.equal(restarted.completed, false)
  assert.ok(restarted.rounds.every((round) => !round.completed && round.questions.every((item) => !item.checked && item.selectedOptionIds.length === 0)))
  assert.notDeepEqual(signature(restarted), signature(first))
})

test('T2 route resolves separately while the pair-matching route remains available', () => {
  const router = createRouter({ history: createMemoryHistory(), routes: trainerRoutes })
  assert.equal(router.resolve('/trainers/numbers/multi-select').name, 'trainer-multi-select')
  assert.equal(router.resolve('/trainers/numbers').name, 'trainer-session')
  assert.equal(router.resolve('/trainers/numbers/fill-gaps').name, 'trainer-fill-gaps')
})

test('multiple-selection interface uses accessible buttons and hides correctness until checking', async () => {
  const component = await readFile('src/components/trainers/MultiSelectExercise.vue', 'utf8')
  assert.doesNotMatch(component, /<(?:input|textarea)\b/i)
  assert.match(component, /type="button"/)
  assert.match(component, /aria-pressed=/)
  assert.match(component, /role="status"/)
  assert.match(component, /checked && selectedOptionIds\.includes\(option\.id\) && option\.correct/)
  assert.match(component, /prefers-reduced-motion/)
})
