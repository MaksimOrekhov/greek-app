import { computed, shallowRef } from 'vue'

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy'

export interface WordProgress {
  dueAt: number
  intervalDays: number
  repetitions: number
  lapses: number
  lastReviewedAt: number
}

export type ProgressByWord = Record<string, WordProgress>

const STORAGE_KEY = 'greek-flashcards:spaced-repetition:v1'
const ANONYMOUS_IMPORT_KEY = 'greek-flashcards:spaced-repetition:anonymous-imported'
const MINUTE = 60_000
const DAY = 24 * 60 * MINUTE

function readProgress(key: string): ProgressByWord {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) as ProgressByWord : {}
  } catch {
    return {}
  }
}

const progress = shallowRef<ProgressByWord>(readProgress(STORAGE_KEY))
let activeStorageKey = STORAGE_KEY

function calculateInterval(rating: ReviewRating, previousInterval: number) {
  if (rating === 'again') return 0
  if (rating === 'hard') return Math.min(365, Math.max(1, Math.ceil(previousInterval * 1.2)))
  if (rating === 'good') return Math.min(365, Math.max(3, Math.ceil(previousInterval * 2.2)))
  return Math.min(365, Math.max(7, Math.ceil(previousInterval * 2.8)))
}

function saveProgress(nextProgress: ProgressByWord) {
  progress.value = nextProgress
  try {
    localStorage.setItem(activeStorageKey, JSON.stringify(nextProgress))
  } catch {
    // Keep the current session usable when browser storage is unavailable.
  }
}

export function getProgressSnapshot(): ProgressByWord {
  return { ...progress.value }
}

export function activateProgressScope(userId: string | null): ProgressByWord {
  if (!userId) {
    activeStorageKey = STORAGE_KEY
    progress.value = readProgress(STORAGE_KEY)
    return getProgressSnapshot()
  }

  const accountStorageKey = `${STORAGE_KEY}:user:${userId}`
  let accountProgress = readProgress(accountStorageKey)
  try {
    const accountHasLocalData = localStorage.getItem(accountStorageKey) !== null
    const anonymousWasImported = localStorage.getItem(ANONYMOUS_IMPORT_KEY) === 'true'
    if (!accountHasLocalData && !anonymousWasImported) {
      accountProgress = getProgressSnapshot()
      localStorage.setItem(ANONYMOUS_IMPORT_KEY, 'true')
      localStorage.setItem(accountStorageKey, JSON.stringify(accountProgress))
    }
  } catch {
    // If storage is unavailable, keep the in-memory progress for this session.
  }

  activeStorageKey = accountStorageKey
  progress.value = accountProgress
  return getProgressSnapshot()
}

export function mergeProgress(remoteProgress: ProgressByWord): ProgressByWord {
  const merged = { ...progress.value }
  for (const [wordId, remoteItem] of Object.entries(remoteProgress)) {
    const localItem = merged[wordId]
    if (!localItem || remoteItem.lastReviewedAt > localItem.lastReviewedAt) {
      merged[wordId] = remoteItem
    }
  }
  saveProgress(merged)
  return getProgressSnapshot()
}

export function useSpacedRepetition() {
  const dueCount = computed(() => Object.values(progress.value).filter((item) => item.dueAt <= Date.now()).length)

  function getSessionWords(wordIds: string[], includeAll = false) {
    const now = Date.now()
    return wordIds.filter((id) => {
      const item = progress.value[id]
      return includeAll || !item || item.dueAt <= now
    })
  }

  function getNextIntervalDays(wordId: string, rating: ReviewRating) {
    if (rating === 'again') return 0
    return calculateInterval(rating, progress.value[wordId]?.intervalDays ?? 0)
  }

  function rateWord(wordId: string, rating: ReviewRating) {
    const now = Date.now()
    const previous = progress.value[wordId]
    const intervalDays = calculateInterval(rating, previous?.intervalDays ?? 0)
    const dueAt = rating === 'again' ? now + 10 * MINUTE : now + intervalDays * DAY

    saveProgress({
      ...progress.value,
      [wordId]: {
        dueAt,
        intervalDays,
        repetitions: rating === 'again' ? 0 : (previous?.repetitions ?? 0) + 1,
        lapses: (previous?.lapses ?? 0) + Number(rating === 'again'),
        lastReviewedAt: now,
      },
    })
  }

  function nextDueDate() {
    const futureDates = Object.values(progress.value)
      .map((item) => item.dueAt)
      .filter((dueAt) => dueAt > Date.now())
    return futureDates.length ? Math.min(...futureDates) : null
  }

  return {
    progress,
    dueCount,
    getSessionWords,
    getNextIntervalDays,
    rateWord,
    nextDueDate,
    getProgressSnapshot,
    activateProgressScope,
    mergeProgress,
  }
}

export function formatInterval(days: number) {
  if (days === 0) return '10 мин'
  if (days === 1) return '1 день'
  if (days < 5) return `${days} дня`
  return `${days} дней`
}
