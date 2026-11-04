import type { MultiSelectQuestion } from '../../data/trainers/multiSelectQuestions.ts'
import { multiSelectQuestionSignature } from './generation/questionHistory.ts'
import {
  BANK_QUESTIONS_PER_SESSION,
  GENERATED_QUESTIONS_PER_SESSION,
} from './generation/multiSelectGenerator.ts'

export const MULTI_SELECT_ROUND_COUNT = 5
export const MULTI_SELECT_QUESTIONS_PER_ROUND = 2
export const MULTI_SELECT_SESSION_QUESTION_COUNT = MULTI_SELECT_ROUND_COUNT * MULTI_SELECT_QUESTIONS_PER_ROUND

export interface MultiSelectQuestionState {
  question: MultiSelectQuestion
  optionOrder: string[]
  selectedOptionIds: string[]
  checked: boolean
  isCorrect: boolean | null
  missedOptionIds: string[]
  incorrectOptionIds: string[]
}

export interface MultiSelectRound {
  number: number
  questions: MultiSelectQuestionState[]
  completed: boolean
}

export interface MultiSelectSession {
  topicId: string
  rounds: MultiSelectRound[]
  currentRoundIndex: number
  currentQuestionIndex: number
  completed: boolean
}

export interface MultiSelectSessionResults {
  completedRounds: number
  totalRounds: number
  totalQuestions: number
  correctAnswers: number
  questionsWithErrors: number
  missedCorrectOptions: number
  incorrectlySelectedOptions: number
}

export type MultiSelectActionOutcome = 'updated' | 'checked' | 'no-selection' | 'already-checked' | 'invalid' | 'session-completed'

export interface MultiSelectActionResult {
  session: MultiSelectSession
  outcome: MultiSelectActionOutcome
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[result[index], result[target]] = [result[target]!, result[index]!]
  }
  return result
}

function currentQuestion(session: MultiSelectSession): MultiSelectQuestionState | undefined {
  return session.rounds[session.currentRoundIndex]?.questions[session.currentQuestionIndex]
}

function questionOrderSignature(session: MultiSelectSession): string {
  return session.rounds.map((round) => round.questions
    .map((item) => `${multiSelectQuestionSignature(item.question)}:${item.optionOrder.join(',')}`)
    .join('|'))
    .join(';')
}

function guaranteeRestartVariation(session: MultiSelectSession, previous: MultiSelectSession | undefined): MultiSelectSession {
  if (!previous || questionOrderSignature(session) !== questionOrderSignature(previous)) return session

  const firstRound = session.rounds[0]
  const firstQuestion = firstRound?.questions[0]
  if (firstQuestion && firstQuestion.optionOrder.length > 1) {
    firstQuestion.optionOrder = [...firstQuestion.optionOrder.slice(1), firstQuestion.optionOrder[0]!]
  }
  return session
}

export function createMultiSelectSession(
  topicId: string,
  sourceQuestions: MultiSelectQuestion[],
  random: () => number = Math.random,
  previous?: MultiSelectSession,
  generatedQuestions?: MultiSelectQuestion[],
): MultiSelectSession {
  const questions = sourceQuestions.filter((item) => item.topicId === topicId)
  if (questions.length === 0) throw new Error(`Нельзя начать тренировку «${topicId}»: нет вопросов.`)
  const generated = generatedQuestions?.filter((item) => item.topicId === topicId) ?? []

  const questionIds = new Set<string>()
  for (const item of [...questions, ...generated]) {
    if (!item.id || !item.prompt.trim() || !item.explanation.trim() || item.options.length < 4) {
      throw new Error(`Нельзя начать тренировку «${topicId}»: найден неполный вопрос.`)
    }
    if (questionIds.has(item.id)) throw new Error(`Нельзя начать тренировку «${topicId}»: идентификатор вопроса повторяется.`)
    questionIds.add(item.id)
  }

  const useGeneratedBalance = generated.length >= GENERATED_QUESTIONS_PER_SESSION
    && questions.length >= BANK_QUESTIONS_PER_SESSION
  const orderedQuestions = useGeneratedBalance
    ? shuffle([
      ...shuffle(generated, random).slice(0, GENERATED_QUESTIONS_PER_SESSION),
      ...shuffle(questions, random).slice(0, BANK_QUESTIONS_PER_SESSION),
    ], random)
    : shuffle(questions, random).slice(0, MULTI_SELECT_SESSION_QUESTION_COUNT)
  while (orderedQuestions.length < MULTI_SELECT_SESSION_QUESTION_COUNT) {
    orderedQuestions.push(questions[orderedQuestions.length % questions.length]!)
  }

  const questionStates = orderedQuestions.map((question): MultiSelectQuestionState => ({
    question,
    optionOrder: shuffle(question.options.map((option) => option.id), random),
    selectedOptionIds: [],
    checked: false,
    isCorrect: null,
    missedOptionIds: [],
    incorrectOptionIds: [],
  }))
  const rounds = Array.from({ length: MULTI_SELECT_ROUND_COUNT }, (_, index): MultiSelectRound => ({
    number: index + 1,
    questions: questionStates.slice(index * MULTI_SELECT_QUESTIONS_PER_ROUND, (index + 1) * MULTI_SELECT_QUESTIONS_PER_ROUND),
    completed: false,
  }))

  return guaranteeRestartVariation({
    topicId,
    rounds,
    currentRoundIndex: 0,
    currentQuestionIndex: 0,
    completed: false,
  }, previous)
}

export function toggleMultiSelectOption(session: MultiSelectSession, optionId: string): MultiSelectActionResult {
  if (session.completed) return { session, outcome: 'session-completed' }
  const active = currentQuestion(session)
  if (!active) return { session, outcome: 'invalid' }
  if (active.checked) return { session, outcome: 'already-checked' }
  if (!active.optionOrder.includes(optionId)) return { session, outcome: 'invalid' }

  const selectedOptionIds = active.selectedOptionIds.includes(optionId)
    ? active.selectedOptionIds.filter((id) => id !== optionId)
    : [...active.selectedOptionIds, optionId]
  const rounds = session.rounds.map((round, roundIndex) => roundIndex !== session.currentRoundIndex
    ? round
    : {
      ...round,
      questions: round.questions.map((item, questionIndex) => questionIndex !== session.currentQuestionIndex
        ? item
        : { ...item, selectedOptionIds }),
    })

  return { session: { ...session, rounds }, outcome: 'updated' }
}

export function submitMultiSelectAnswer(session: MultiSelectSession): MultiSelectActionResult {
  if (session.completed) return { session, outcome: 'session-completed' }
  const active = currentQuestion(session)
  if (!active) return { session, outcome: 'invalid' }
  if (active.checked) return { session, outcome: 'already-checked' }
  if (active.selectedOptionIds.length === 0) return { session, outcome: 'no-selection' }

  const selected = new Set(active.selectedOptionIds)
  const correctOptionIds = active.question.options.filter((option) => option.correct).map((option) => option.id)
  const correct = correctOptionIds.every((id) => selected.has(id))
    && active.selectedOptionIds.every((id) => correctOptionIds.includes(id))
  const missedOptionIds = correctOptionIds.filter((id) => !selected.has(id))
  const incorrectOptionIds = active.selectedOptionIds.filter((id) => !correctOptionIds.includes(id))
  const rounds = session.rounds.map((round, roundIndex) => roundIndex !== session.currentRoundIndex
    ? round
    : {
      ...round,
      questions: round.questions.map((item, questionIndex) => questionIndex !== session.currentQuestionIndex
        ? item
        : { ...item, checked: true, isCorrect: correct, missedOptionIds, incorrectOptionIds }),
    })

  return { session: { ...session, rounds }, outcome: 'checked' }
}

export function advanceMultiSelectSession(session: MultiSelectSession): MultiSelectSession {
  if (session.completed) return session
  const active = currentQuestion(session)
  if (!active?.checked) return session

  const round = session.rounds[session.currentRoundIndex]!
  const isLastQuestionInRound = session.currentQuestionIndex === round.questions.length - 1
  if (!isLastQuestionInRound) {
    return { ...session, currentQuestionIndex: session.currentQuestionIndex + 1 }
  }

  const rounds = session.rounds.map((item, index) => index === session.currentRoundIndex ? { ...item, completed: true } : item)
  const isLastRound = session.currentRoundIndex === rounds.length - 1
  return isLastRound
    ? { ...session, rounds, completed: true }
    : { ...session, rounds, currentRoundIndex: session.currentRoundIndex + 1, currentQuestionIndex: 0 }
}

export function getMultiSelectSessionResults(session: MultiSelectSession): MultiSelectSessionResults {
  const questions = session.rounds.flatMap((round) => round.questions)
  const answered = questions.filter((item) => item.checked)
  return {
    completedRounds: session.rounds.filter((round) => round.completed).length,
    totalRounds: session.rounds.length,
    totalQuestions: questions.length,
    correctAnswers: answered.filter((item) => item.isCorrect).length,
    questionsWithErrors: answered.filter((item) => !item.isCorrect).length,
    missedCorrectOptions: answered.reduce((total, item) => total + item.missedOptionIds.length, 0),
    incorrectlySelectedOptions: answered.reduce((total, item) => total + item.incorrectOptionIds.length, 0),
  }
}
