import { computed, shallowRef } from 'vue'
import { readingTexts } from '../data/trainers/readingTexts.ts'
import {
  loadReadingHistory,
  rememberReadingRound,
  saveReadingHistory,
  type ReadingHistoryStorage,
} from '../lib/trainers/readingComprehension/readingHistory.ts'
import {
  advanceReadingSession,
  checkReadingRound,
  createReadingSession,
  getReadingSessionResults,
  selectReadingOption,
  type ReadingSession,
} from '../lib/trainers/readingComprehension/readingSession.ts'

function browserStorage(): ReadingHistoryStorage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}

export function useReadingComprehensionSession(
  options: { storage?: ReadingHistoryStorage; random?: () => number } = {},
) {
  const storage = options.storage ?? browserStorage()
  const state = shallowRef<ReadingSession | null>(null)
  const session = computed(() => state.value)
  const currentRound = computed(() => state.value?.rounds[state.value.currentRoundIndex] ?? null)
  const results = computed(() => state.value?.completed ? getReadingSessionResults(state.value) : null)

  function start(): void {
    const history = loadReadingHistory(readingTexts, storage)
    state.value = createReadingSession(readingTexts, options.random ?? Math.random, history)
  }

  function selectOption(questionId: string, optionId: string): void {
    if (state.value) state.value = selectReadingOption(state.value, questionId, optionId).session
  }

  function checkRound(): void {
    if (!state.value) return
    const round = currentRound.value
    const result = checkReadingRound(state.value)
    state.value = result.session
    if (result.outcome === 'checked' && round) {
      const history = loadReadingHistory(readingTexts, storage)
      saveReadingHistory(rememberReadingRound(
        history,
        round.text,
        round.questions.map((item) => item.question),
      ), storage)
    }
  }

  function advance(): void {
    if (state.value) state.value = advanceReadingSession(state.value).session
  }

  return { session, currentRound, results, start, selectOption, checkRound, advance }
}
