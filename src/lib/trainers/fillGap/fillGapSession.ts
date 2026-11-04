import type { FillGapQuestion } from '../../../data/trainers/fillGapQuestions.ts'
import {
  FILL_GAP_FIXED_QUESTIONS_PER_SESSION,
  FILL_GAP_GENERATED_QUESTIONS_PER_SESSION,
} from './fillGapGenerator.ts'
import {
  FILL_GAP_ROUND_COUNT,
  FILL_GAP_QUESTIONS_PER_ROUND,
  FILL_GAP_SESSION_QUESTION_COUNT,
} from './sessionConstants.ts'

export { FILL_GAP_ROUND_COUNT, FILL_GAP_QUESTIONS_PER_ROUND, FILL_GAP_SESSION_QUESTION_COUNT } from './sessionConstants.ts'

export interface FillGapQuestionState {
  question: FillGapQuestion
  optionOrder: string[]
  selectedOptionId: string | null
  checked: boolean
  isCorrect: boolean | null
}

export interface FillGapRound {
  number: number
  questions: FillGapQuestionState[]
  completed: boolean
}

export interface FillGapSession {
  topicId: string
  rounds: FillGapRound[]
  currentRoundIndex: number
  currentQuestionIndex: number
  completed: boolean
}

export interface FillGapSessionResults {
  totalQuestions: number
  correctAnswers: number
  errors: number
  accuracyPercent: number
  completedRounds: number
  totalRounds: number
}

export type FillGapActionOutcome =
  | 'selected'
  | 'checked'
  | 'no-selection'
  | 'already-checked'
  | 'invalid'
  | 'session-completed'

export interface FillGapActionResult {
  session: FillGapSession
  outcome: FillGapActionOutcome
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[result[index], result[target]] = [result[target]!, result[index]!]
  }
  return result
}

function currentQuestion(session: FillGapSession): FillGapQuestionState | undefined {
  return session.rounds[session.currentRoundIndex]?.questions[session.currentQuestionIndex]
}

function assertQuestionIdsAreUnique(questions: FillGapQuestion[], topicId: string): void {
  const ids = new Set<string>()
  for (const question of questions) {
    if (question.topicId !== topicId) continue
    if (!question.id || ids.has(question.id)) {
      throw new Error(`Нельзя начать тренировку «${topicId}»: идентификатор задания повторяется.`)
    }
    ids.add(question.id)
    if (!question.instruction.trim() || !question.explanation.trim() || question.options.length < 3) {
      throw new Error(`Нельзя начать тренировку «${topicId}»: найдено неполное задание.`)
    }
  }
}

export function createFillGapSession(
  topicId: string,
  sourceQuestions: FillGapQuestion[],
  random: () => number = Math.random,
  generatedQuestions: FillGapQuestion[] = [],
): FillGapSession {
  const fixed = sourceQuestions.filter((question) => question.topicId === topicId)
  const generated = generatedQuestions.filter((question) => question.topicId === topicId)
  if (fixed.length === 0) throw new Error(`Нельзя начать тренировку «${topicId}»: нет фиксированных заданий.`)
  assertQuestionIdsAreUnique([...fixed, ...generated], topicId)

  const balancedSet = generated.length >= FILL_GAP_GENERATED_QUESTIONS_PER_SESSION
    && fixed.length >= FILL_GAP_FIXED_QUESTIONS_PER_SESSION
    ? [
      ...shuffle(generated, random).slice(0, FILL_GAP_GENERATED_QUESTIONS_PER_SESSION),
      ...shuffle(fixed, random).slice(0, FILL_GAP_FIXED_QUESTIONS_PER_SESSION),
    ]
    : shuffle(fixed, random).slice(0, FILL_GAP_SESSION_QUESTION_COUNT)

  if (balancedSet.length < FILL_GAP_SESSION_QUESTION_COUNT) {
    throw new Error(`Нельзя начать тренировку «${topicId}»: нужно не меньше десяти фиксированных заданий.`)
  }

  const questionStates = shuffle(balancedSet, random).map((question): FillGapQuestionState => ({
    question,
    optionOrder: shuffle(question.options.map((option) => option.id), random),
    selectedOptionId: null,
    checked: false,
    isCorrect: null,
  }))
  const rounds = Array.from({ length: FILL_GAP_ROUND_COUNT }, (_, index): FillGapRound => ({
    number: index + 1,
    questions: questionStates.slice(index * FILL_GAP_QUESTIONS_PER_ROUND, (index + 1) * FILL_GAP_QUESTIONS_PER_ROUND),
    completed: false,
  }))

  return { topicId, rounds, currentRoundIndex: 0, currentQuestionIndex: 0, completed: false }
}

export function selectFillGapOption(session: FillGapSession, optionId: string): FillGapActionResult {
  if (session.completed) return { session, outcome: 'session-completed' }
  const active = currentQuestion(session)
  if (!active) return { session, outcome: 'invalid' }
  if (active.checked) return { session, outcome: 'already-checked' }
  if (!active.optionOrder.includes(optionId)) return { session, outcome: 'invalid' }

  const rounds = session.rounds.map((round, roundIndex) => roundIndex !== session.currentRoundIndex
    ? round
    : {
      ...round,
      questions: round.questions.map((question, questionIndex) => questionIndex !== session.currentQuestionIndex
        ? question
        : { ...question, selectedOptionId: optionId }),
    })
  return { session: { ...session, rounds }, outcome: 'selected' }
}

export function checkFillGapAnswer(session: FillGapSession): FillGapActionResult {
  if (session.completed) return { session, outcome: 'session-completed' }
  const active = currentQuestion(session)
  if (!active) return { session, outcome: 'invalid' }
  if (active.checked) return { session, outcome: 'already-checked' }
  if (!active.selectedOptionId) return { session, outcome: 'no-selection' }

  const rounds = session.rounds.map((round, roundIndex) => roundIndex !== session.currentRoundIndex
    ? round
    : {
      ...round,
      questions: round.questions.map((question, questionIndex) => questionIndex !== session.currentQuestionIndex
        ? question
        : {
          ...question,
          checked: true,
          isCorrect: question.selectedOptionId === question.question.correctOptionId,
        }),
    })
  return { session: { ...session, rounds }, outcome: 'checked' }
}

export function advanceFillGapSession(session: FillGapSession): FillGapSession {
  if (session.completed) return session
  const active = currentQuestion(session)
  if (!active?.checked) return session

  const round = session.rounds[session.currentRoundIndex]!
  if (session.currentQuestionIndex < round.questions.length - 1) {
    return { ...session, currentQuestionIndex: session.currentQuestionIndex + 1 }
  }

  const rounds = session.rounds.map((item, index) => index === session.currentRoundIndex ? { ...item, completed: true } : item)
  if (session.currentRoundIndex === rounds.length - 1) {
    return { ...session, rounds, completed: true }
  }
  return { ...session, rounds, currentRoundIndex: session.currentRoundIndex + 1, currentQuestionIndex: 0 }
}

export function restartFillGapSession(
  previous: FillGapSession,
  sourceQuestions: FillGapQuestion[],
  generatedQuestions: FillGapQuestion[],
  random: () => number = Math.random,
): FillGapSession {
  return createFillGapSession(previous.topicId, sourceQuestions, random, generatedQuestions)
}

export function getFillGapSessionResults(session: FillGapSession): FillGapSessionResults {
  const questions = session.rounds.flatMap((round) => round.questions)
  const correctAnswers = questions.filter((question) => question.checked && question.isCorrect).length
  const totalQuestions = questions.length
  return {
    totalQuestions,
    correctAnswers,
    errors: questions.filter((question) => question.checked && question.isCorrect === false).length,
    accuracyPercent: totalQuestions === 0 ? 0 : Math.round(correctAnswers / totalQuestions * 100),
    completedRounds: session.rounds.filter((round) => round.completed).length,
    totalRounds: session.rounds.length,
  }
}
