import { computed, shallowRef } from 'vue'
import { dialogueQuestions } from '../data/trainers/dialogueQuestions.ts'
import {
  loadDialogueQuestionHistory,
  rememberDialogueQuestions,
  saveDialogueQuestionHistory,
  type DialogueHistoryStorage,
} from '../lib/trainers/dialogue/dialogueHistory.ts'
import {
  advanceDialogueSession,
  checkDialogueAnswer,
  createDialogueSession,
  getDialogueSessionResults,
  selectDialogueOption,
  type DialogueSession,
} from '../lib/trainers/dialogue/dialogueSession.ts'

function browserStorage(): DialogueHistoryStorage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}

export function useDialogueSession() {
  const state = shallowRef<DialogueSession | null>(null)
  const session = computed(() => state.value)
  const currentRound = computed(() => state.value?.rounds[state.value.currentRoundIndex] ?? null)
  const currentQuestion = computed(() => currentRound.value?.questions[state.value!.currentQuestionIndex] ?? null)
  const results = computed(() => state.value?.completed ? getDialogueSessionResults(state.value) : null)

  function start(): void {
    const storage = browserStorage()
    const history = loadDialogueQuestionHistory(dialogueQuestions, storage)
    const next = createDialogueSession(dialogueQuestions, Math.random, history)
    state.value = next
    const selectedQuestions = next.rounds.flatMap((round) => round.questions.map((item) => item.question))
    saveDialogueQuestionHistory(rememberDialogueQuestions(history, selectedQuestions), storage)
  }

  function selectOption(optionId: string): void {
    if (state.value) state.value = selectDialogueOption(state.value, optionId).session
  }

  function checkAnswer(): void {
    if (state.value) state.value = checkDialogueAnswer(state.value).session
  }

  function advance(): void {
    if (state.value) state.value = advanceDialogueSession(state.value).session
  }

  return { session, currentRound, currentQuestion, results, start, selectOption, checkAnswer, advance }
}
