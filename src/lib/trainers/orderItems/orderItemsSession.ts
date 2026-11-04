import type { OrderItemsQuestion } from './orderItems.ts'
import { isOrderItemsOrderCorrect } from './orderItems.ts'
import {
  ORDER_ITEMS_FIXED_PER_SESSION,
  ORDER_ITEMS_GENERATED_PER_SESSION,
  ORDER_ITEMS_SESSION_QUESTION_COUNT,
} from './orderItemsGenerator.ts'

export const ORDER_ITEMS_ROUND_COUNT = 5
export const ORDER_ITEMS_QUESTIONS_PER_ROUND = 2

export interface OrderItemsQuestionState {
  question: OrderItemsQuestion
  cardOrder: string[]
  selectedOrder: string[]
  checked: boolean
  isCorrect: boolean | null
}

export interface OrderItemsRound {
  number: number
  questions: OrderItemsQuestionState[]
  completed: boolean
}

export interface OrderItemsSession {
  topicId: string
  rounds: OrderItemsRound[]
  currentRoundIndex: number
  currentQuestionIndex: number
  completed: boolean
}

export interface OrderItemsSessionResults {
  totalQuestions: number
  correctAnswers: number
  errors: number
  accuracyPercent: number
  completedRounds: number
  totalRounds: number
}

export type OrderItemsActionOutcome =
  | 'selected'
  | 'removed'
  | 'reset'
  | 'checked'
  | 'incomplete'
  | 'already-checked'
  | 'invalid'
  | 'session-completed'

export interface OrderItemsActionResult {
  session: OrderItemsSession
  outcome: OrderItemsActionOutcome
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[result[index], result[target]] = [result[target]!, result[index]!]
  }
  return result
}

function currentQuestion(session: OrderItemsSession): OrderItemsQuestionState | undefined {
  return session.rounds[session.currentRoundIndex]?.questions[session.currentQuestionIndex]
}

function updateCurrentQuestion(
  session: OrderItemsSession,
  update: (question: OrderItemsQuestionState) => OrderItemsQuestionState,
): OrderItemsSession {
  const rounds = session.rounds.map((round, roundIndex) => roundIndex !== session.currentRoundIndex
    ? round
    : {
      ...round,
      questions: round.questions.map((question, questionIndex) => questionIndex !== session.currentQuestionIndex
        ? question
        : update(question)),
    })
  return { ...session, rounds }
}

function randomCardOrder(question: OrderItemsQuestion, random: () => number): string[] {
  const order = shuffle(question.items.map((item) => item.id), random)
  const correctOrder = [...question.items]
    .sort((left, right) => (left.value - right.value) * (question.direction === 'ascending' ? 1 : -1))
    .map((item) => item.id)
  if (order.every((id, index) => id === correctOrder[index])) return [...order.slice(1), order[0]!]
  return order
}

function validateQuestion(question: OrderItemsQuestion): void {
  if (!question.id || !question.instruction.trim() || !question.explanation.trim() || question.items.length !== 4) {
    throw new Error('Нельзя начать тренировку: найдено неполное задание T4.')
  }
  const ids = new Set(question.items.map((item) => item.id))
  const greek = new Set(question.items.map((item) => item.greek))
  const values = new Set(question.items.map((item) => item.value))
  if (ids.size !== 4 || greek.size !== 4 || values.size !== 4) {
    throw new Error(`Нельзя начать тренировку: элементы задания ${question.id} должны быть уникальны.`)
  }
}

export function createOrderItemsSession(
  topicId: string,
  fixedQuestions: readonly OrderItemsQuestion[],
  generatedQuestions: readonly OrderItemsQuestion[],
  random: () => number = Math.random,
): OrderItemsSession {
  if (topicId !== 'numbers') throw new Error('Упражнение «Расставь по порядку» доступно только для темы «Числа 0–200».')
  if (fixedQuestions.length < ORDER_ITEMS_FIXED_PER_SESSION || generatedQuestions.length !== ORDER_ITEMS_GENERATED_PER_SESSION) {
    throw new Error('Для сессии T4 нужны шесть генеративных и не менее четырёх фиксированных заданий.')
  }

  const selected = [...generatedQuestions, ...fixedQuestions.slice(0, ORDER_ITEMS_FIXED_PER_SESSION)]
  const ids = new Set<string>()
  for (const question of selected) {
    validateQuestion(question)
    if (ids.has(question.id)) throw new Error(`Идентификатор задания T4 повторяется: ${question.id}.`)
    ids.add(question.id)
  }

  const questionStates = shuffle(selected, random).map((question): OrderItemsQuestionState => ({
    question,
    cardOrder: randomCardOrder(question, random),
    selectedOrder: [],
    checked: false,
    isCorrect: null,
  }))
  const rounds = Array.from({ length: ORDER_ITEMS_ROUND_COUNT }, (_, index): OrderItemsRound => ({
    number: index + 1,
    questions: questionStates.slice(index * ORDER_ITEMS_QUESTIONS_PER_ROUND, (index + 1) * ORDER_ITEMS_QUESTIONS_PER_ROUND),
    completed: false,
  }))
  return { topicId, rounds, currentRoundIndex: 0, currentQuestionIndex: 0, completed: false }
}

export function selectOrderItemsCard(session: OrderItemsSession, itemId: string): OrderItemsActionResult {
  if (session.completed) return { session, outcome: 'session-completed' }
  const active = currentQuestion(session)
  if (!active) return { session, outcome: 'invalid' }
  if (active.checked) return { session, outcome: 'already-checked' }
  if (!active.cardOrder.includes(itemId) || active.selectedOrder.includes(itemId) || active.selectedOrder.length >= 4) {
    return { session, outcome: 'invalid' }
  }
  return {
    session: updateCurrentQuestion(session, (question) => ({ ...question, selectedOrder: [...question.selectedOrder, itemId] })),
    outcome: 'selected',
  }
}

export function removeOrderItemsCard(session: OrderItemsSession, itemId: string): OrderItemsActionResult {
  if (session.completed) return { session, outcome: 'session-completed' }
  const active = currentQuestion(session)
  if (!active) return { session, outcome: 'invalid' }
  if (active.checked) return { session, outcome: 'already-checked' }
  if (!active.selectedOrder.includes(itemId)) return { session, outcome: 'invalid' }
  return {
    session: updateCurrentQuestion(session, (question) => ({
      ...question,
      selectedOrder: question.selectedOrder.filter((id) => id !== itemId),
    })),
    outcome: 'removed',
  }
}

export function resetOrderItemsAnswer(session: OrderItemsSession): OrderItemsActionResult {
  if (session.completed) return { session, outcome: 'session-completed' }
  const active = currentQuestion(session)
  if (!active) return { session, outcome: 'invalid' }
  if (active.checked) return { session, outcome: 'already-checked' }
  if (active.selectedOrder.length === 0) return { session, outcome: 'reset' }
  return {
    session: updateCurrentQuestion(session, (question) => ({ ...question, selectedOrder: [] })),
    outcome: 'reset',
  }
}

export function checkOrderItemsAnswer(session: OrderItemsSession): OrderItemsActionResult {
  if (session.completed) return { session, outcome: 'session-completed' }
  const active = currentQuestion(session)
  if (!active) return { session, outcome: 'invalid' }
  if (active.checked) return { session, outcome: 'already-checked' }
  if (active.selectedOrder.length !== 4) return { session, outcome: 'incomplete' }
  const isCorrect = isOrderItemsOrderCorrect(active.question, active.selectedOrder)
  return {
    session: updateCurrentQuestion(session, (question) => ({ ...question, checked: true, isCorrect })),
    outcome: 'checked',
  }
}

export function advanceOrderItemsSession(session: OrderItemsSession): OrderItemsSession {
  if (session.completed || !currentQuestion(session)?.checked) return session
  const round = session.rounds[session.currentRoundIndex]!
  if (session.currentQuestionIndex < round.questions.length - 1) {
    return { ...session, currentQuestionIndex: session.currentQuestionIndex + 1 }
  }

  const rounds = session.rounds.map((item, index) => index === session.currentRoundIndex ? { ...item, completed: true } : item)
  if (session.currentRoundIndex === rounds.length - 1) return { ...session, rounds, completed: true }
  return { ...session, rounds, currentRoundIndex: session.currentRoundIndex + 1, currentQuestionIndex: 0 }
}

export function getOrderItemsSessionQuestions(session: OrderItemsSession): OrderItemsQuestion[] {
  return session.rounds.flatMap((round) => round.questions.map((state) => state.question))
}

export function getOrderItemsSessionResults(session: OrderItemsSession): OrderItemsSessionResults {
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
