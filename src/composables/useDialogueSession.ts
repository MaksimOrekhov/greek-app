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

export function useDialogueSession(options: { storage?: DialogueHistoryStorage; random?: () => number } = {}) {
  const storage = options.storage ?? browserStorage()
  const state = shallowRef<DialogueSession | null>(null)
  const session = computed(() => state.value)
  const currentRound = computed(() => state.value?.rounds[state.value.currentRoundIndex] ?? null)
  const currentQuestion = computed(() => currentRound.value?.questions[state.value!.currentQuestionIndex] ?? null)
  const results = computed(() => state.value?.completed ? getDialogueSessionResults(state.value) : null)

  function start(): void {
    const history = loadDialogueQuestionHistory(dialogueQuestions, storage)
    const next = createDialogueSession(dialogueQuestions, options.random ?? Math.random, history)
    state.value = next
  }

  function selectOption(optionId: string): void {
    if (state.value) state.value = selectDialogueOption(state.value, optionId).session
  }

  function checkAnswer(): void {
    if (!state.value) return
    const question = currentQuestion.value?.question
    const result = checkDialogueAnswer(state.value)
    state.value = result.session
    if (result.outcome === 'checked' && question) {
      const history = loadDialogueQuestionHistory(dialogueQuestions, storage)
      saveDialogueQuestionHistory(rememberDialogueQuestions(history, [question]), storage)
    }
  }

  function advance(): void {
    if (state.value) state.value = advanceDialogueSession(state.value).session
  }

  return { session, currentRound, currentQuestion, results, start, selectOption, checkAnswer, advance }
}
