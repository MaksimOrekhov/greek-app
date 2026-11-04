import { computed, shallowRef } from 'vue'
import { trainerFillGapQuestions } from '../data/trainers/fillGapQuestions.ts'
import { getTrainerTopic } from '../data/trainers/topics.ts'
import {
  advanceFillGapSession,
  checkFillGapAnswer,
  createFillGapSession,
  getFillGapSessionResults,
  restartFillGapSession,
  selectFillGapOption,
  type FillGapSession,
} from '../lib/trainers/fillGap/fillGapSession.ts'
import { generateFillGapQuestions } from '../lib/trainers/fillGap/fillGapGenerator.ts'
import {
  loadRecentFillGapContextSignatures,
  loadRecentFillGapSignatures,
  rememberFillGapQuestions,
} from '../lib/trainers/fillGap/questionHistory.ts'

export function useFillGapSession() {
  const state = shallowRef<FillGapSession | null>(null)
  const session = computed(() => state.value)
  const currentRound = computed(() => state.value?.rounds[state.value.currentRoundIndex] ?? null)
  const currentQuestion = computed(() => currentRound.value?.questions[state.value!.currentQuestionIndex] ?? null)
  const results = computed(() => state.value?.completed ? getFillGapSessionResults(state.value) : null)
  const questionKey = computed(() => currentQuestion.value?.question.id ?? '')

  function start(topicId: string): boolean {
    const topic = getTrainerTopic(topicId)
    const fixedQuestions = trainerFillGapQuestions.filter((question) => question.topicId === topicId)
    if (!topic?.availableExercises.includes('fill-gaps') || fixedQuestions.length === 0) {
      state.value = null
      return false
    }

    const previous = state.value?.topicId === topicId ? state.value : null
    const generated = generateFillGapQuestions(
      topicId,
      Math.random,
      loadRecentFillGapSignatures(topicId),
      loadRecentFillGapContextSignatures(topicId),
    )
    state.value = previous
      ? restartFillGapSession(previous, trainerFillGapQuestions, generated)
      : createFillGapSession(topicId, trainerFillGapQuestions, Math.random, generated)
    rememberFillGapQuestions(topicId, generated)
    return true
  }

  function selectOption(optionId: string): void {
    if (state.value) state.value = selectFillGapOption(state.value, optionId).session
  }

  function checkAnswer(): void {
    if (state.value) state.value = checkFillGapAnswer(state.value).session
  }

  function advance(): void {
    if (state.value) state.value = advanceFillGapSession(state.value)
  }

  function restart(): void {
    if (state.value) start(state.value.topicId)
  }

  return {
    session,
    currentRound,
    currentQuestion,
    results,
    questionKey,
    start,
    selectOption,
    checkAnswer,
    advance,
    restart,
  }
}
