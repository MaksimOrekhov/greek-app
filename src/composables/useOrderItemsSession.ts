import { computed, shallowRef } from 'vue'
import { getTrainerTopic } from '../data/trainers/topics.ts'
import {
  advanceOrderItemsSession,
  checkOrderItemsAnswer,
  createOrderItemsSession,
  getOrderItemsSessionResults,
  resetOrderItemsAnswer,
  removeOrderItemsCard,
  selectOrderItemsCard,
  type OrderItemsSession,
} from '../lib/trainers/orderItems/orderItemsSession.ts'
import { generateOrderItemsQuestionSet } from '../lib/trainers/orderItems/orderItemsGenerator.ts'
import { loadRecentOrderItemsHistory, rememberOrderItemsQuestions } from '../lib/trainers/orderItems/orderItemsHistory.ts'

export function useOrderItemsSession(random: () => number = Math.random) {
  const state = shallowRef<OrderItemsSession | null>(null)
  const sessionVersion = shallowRef(0)
  const session = computed(() => state.value)
  const currentRound = computed(() => state.value?.rounds[state.value.currentRoundIndex] ?? null)
  const currentQuestion = computed(() => currentRound.value?.questions[state.value!.currentQuestionIndex] ?? null)
  const results = computed(() => state.value?.completed ? getOrderItemsSessionResults(state.value) : null)
  const questionNumber = computed(() => state.value
    ? state.value.currentRoundIndex * 2 + state.value.currentQuestionIndex + 1
    : 0)
  const questionKey = computed(() => state.value && currentQuestion.value
    ? `${sessionVersion.value}:${state.value.currentRoundIndex}:${state.value.currentQuestionIndex}:${currentQuestion.value.question.id}`
    : '')

  function start(topicId: string): boolean {
    const topic = getTrainerTopic(topicId)
    if (!topic?.availableExercises.includes('order-items')) {
      state.value = null
      return false
    }

    const questionSet = generateOrderItemsQuestionSet(topicId, random, loadRecentOrderItemsHistory())
    state.value = createOrderItemsSession(topicId, questionSet.fixed, questionSet.generated, random)
    sessionVersion.value += 1
    rememberOrderItemsQuestions(state.value.rounds.flatMap((round) => round.questions.map((question) => question.question)))
    return true
  }

  function selectCard(itemId: string): void {
    if (state.value) state.value = selectOrderItemsCard(state.value, itemId).session
  }

  function removeCard(itemId: string): void {
    if (state.value) state.value = removeOrderItemsCard(state.value, itemId).session
  }

  function resetAnswer(): void {
    if (state.value) state.value = resetOrderItemsAnswer(state.value).session
  }

  function checkAnswer(): void {
    if (state.value) state.value = checkOrderItemsAnswer(state.value).session
  }

  function advance(): void {
    if (state.value) state.value = advanceOrderItemsSession(state.value)
  }

  function restart(): void {
    if (state.value) start(state.value.topicId)
  }

  return {
    session,
    currentRound,
    currentQuestion,
    questionNumber,
    questionKey,
    results,
    start,
    selectCard,
    removeCard,
    resetAnswer,
    checkAnswer,
    advance,
    restart,
  }
}
