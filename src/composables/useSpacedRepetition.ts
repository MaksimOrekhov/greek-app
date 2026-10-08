import { computed, onMounted, onUnmounted, shallowRef } from 'vue'
import { canImportAnonymousProgress, formatInterval, introducedTodayCount, mergeProgressSnapshots, nextInterval, selectSessionWords, type IntroductionsByWord, type ProgressByWord, type ReviewRating, type StudyMode, type WordProgress } from '../lib/studyRules'

export { formatInterval, nextInterval }
export type { ProgressByWord, ReviewRating, WordProgress }
export type WordLearningStatus = 'new' | 'learning' | 'due' | 'learned'
export type { StudyMode }
export const NEW_WORDS_PER_DAY = 10

const STORAGE_KEY = 'greek-flashcards:spaced-repetition:v1'
const ANONYMOUS_IMPORT_KEY = 'greek-flashcards:spaced-repetition:anonymous-imported'
const INTRODUCTIONS_KEY = 'greek-flashcards:word-introductions:v1'
const MINUTE = 60_000
const DAY = 24 * 60 * MINUTE

function isWordProgress(value: unknown): value is WordProgress {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<WordProgress>
  return Number.isFinite(item.dueAt)
    && Number.isFinite(item.intervalDays)
    && Number.isFinite(item.repetitions)
    && Number.isFinite(item.lapses)
    && Number.isFinite(item.lastReviewedAt)
    && item.intervalDays! >= 0
    && item.repetitions! >= 0
    && item.lapses! >= 0
    && (item.introducedAt === undefined || Number.isFinite(item.introducedAt))
    && (item.reviewId === undefined || typeof item.reviewId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(item.reviewId))
}

function readProgress(key: string): ProgressByWord {
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return {}
    const parsed: unknown = JSON.parse(stored)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return Object.fromEntries(Object.entries(parsed).filter(([, item]) => isWordProgress(item)))
  } catch {
    return {}
  }
}

const progress = shallowRef<ProgressByWord>(readProgress(STORAGE_KEY))
function readIntroductions(key: string): IntroductionsByWord {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? '{}')
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => Number.isFinite(value) && Number(value) > 0)) as IntroductionsByWord
  } catch { return {} }
}
function introductionsFromProgress(snapshot: ProgressByWord): IntroductionsByWord {
  return Object.fromEntries(Object.entries(snapshot).flatMap(([id, item]) => item.introducedAt ? [[id, item.introducedAt]] : []))
}
function mergeIntroductionMaps(...maps: IntroductionsByWord[]): IntroductionsByWord {
  const merged: IntroductionsByWord = {}
  for (const map of maps) for (const [id, timestamp] of Object.entries(map)) merged[id] = Math.min(merged[id] ?? timestamp, timestamp)
  return merged
}
const introductions = shallowRef<IntroductionsByWord>(mergeIntroductionMaps(introductionsFromProgress(progress.value), readIntroductions(INTRODUCTIONS_KEY)))
let activeStorageKey = STORAGE_KEY
let activeIntroductionsKey = INTRODUCTIONS_KEY
let scopedUserId: string | null = null

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
  const previousUserId = scopedUserId
  if (!userId && previousUserId) {
    try { localStorage.setItem(ANONYMOUS_IMPORT_KEY, previousUserId) } catch { /* scope isolation still applies in memory */ }
  }
  scopedUserId = userId
  if (!userId) {
    activeStorageKey = STORAGE_KEY
    activeIntroductionsKey = INTRODUCTIONS_KEY
    progress.value = readProgress(STORAGE_KEY)
    introductions.value = mergeIntroductionMaps(introductionsFromProgress(progress.value), readIntroductions(INTRODUCTIONS_KEY))
    return getProgressSnapshot()
  }

  const accountStorageKey = `${STORAGE_KEY}:user:${userId}`
  const accountIntroductionsKey = `${INTRODUCTIONS_KEY}:user:${userId}`
  let accountProgress = readProgress(accountStorageKey)
  let accountIntroductions = readIntroductions(accountIntroductionsKey)
  accountIntroductions = mergeIntroductionMaps(accountIntroductions, introductionsFromProgress(accountProgress))
  try {
    const importOwner = localStorage.getItem(ANONYMOUS_IMPORT_KEY)
    if (canImportAnonymousProgress(importOwner, userId)) {
      const anonymousProgress = getProgressSnapshot()
      for (const [wordId, item] of Object.entries(anonymousProgress)) {
        const existing = accountProgress[wordId]
        if (!existing || item.lastReviewedAt > existing.lastReviewedAt) accountProgress[wordId] = item
        else if (item.introducedAt !== undefined) accountProgress[wordId] = {
          ...existing,
          introducedAt: existing.introducedAt === undefined ? item.introducedAt : Math.min(existing.introducedAt, item.introducedAt),
        }
      }
      for (const [wordId, timestamp] of Object.entries(introductions.value)) {
        accountIntroductions[wordId] = Math.min(accountIntroductions[wordId] ?? timestamp, timestamp)
      }
      localStorage.setItem(accountStorageKey, JSON.stringify(accountProgress))
      localStorage.setItem(accountIntroductionsKey, JSON.stringify(accountIntroductions))
      localStorage.setItem(ANONYMOUS_IMPORT_KEY, userId)
    }
  } catch {
    // If storage is unavailable, keep the in-memory progress for this session.
  }

  activeStorageKey = accountStorageKey
  activeIntroductionsKey = accountIntroductionsKey
  progress.value = accountProgress
  introductions.value = accountIntroductions
  return getProgressSnapshot()
}

export function getIntroductionsSnapshot(): IntroductionsByWord { return { ...introductions.value } }

export function mergeIntroductions(remote: IntroductionsByWord): IntroductionsByWord {
  const merged = { ...introductions.value }
  for (const [wordId, timestamp] of Object.entries(remote)) {
    if (Number.isFinite(timestamp) && timestamp > 0) merged[wordId] = Math.min(merged[wordId] ?? timestamp, timestamp)
  }
  introductions.value = merged
  try { localStorage.setItem(activeIntroductionsKey, JSON.stringify(merged)) } catch { /* local session remains usable */ }
  return { ...merged }
}

export function markWordIntroduced(wordId: string, timestamp = Date.now()) {
  if (introductions.value[wordId] !== undefined) return
  const next = { ...introductions.value, [wordId]: timestamp }
  introductions.value = next
  try {
    localStorage.setItem(activeIntroductionsKey, JSON.stringify(next))
    if (scopedUserId === null && localStorage.getItem(ANONYMOUS_IMPORT_KEY) === null) localStorage.setItem(ANONYMOUS_IMPORT_KEY, 'pending')
  } catch { /* local session remains usable */ }
}

export function mergeProgress(remoteProgress: ProgressByWord): ProgressByWord {
  const merged = mergeProgressSnapshots(progress.value, remoteProgress)
  saveProgress(merged)
  mergeIntroductions(Object.fromEntries(Object.entries(merged).flatMap(([id, item]) => item.introducedAt ? [[id, item.introducedAt]] : [])))
  return getProgressSnapshot()
}

export function useSpacedRepetition() {
  const now = shallowRef(Date.now())
  let clock: number | undefined
  const dueCount = computed(() => Object.values(progress.value).filter((item) => item.dueAt <= now.value).length)
  const newWordsIntroducedToday = computed(() => introducedTodayCount(introductions.value, now.value))
  const newWordsRemainingToday = computed(() => Math.max(0, NEW_WORDS_PER_DAY - newWordsIntroducedToday.value))
  const refreshNow = () => { now.value = Date.now() }

  onMounted(() => {
    clock = window.setInterval(refreshNow, 30_000)
    window.addEventListener('focus', refreshNow)
    document.addEventListener('visibilitychange', refreshNow)
  })

  onUnmounted(() => {
    if (clock !== undefined) window.clearInterval(clock)
    window.removeEventListener('focus', refreshNow)
    document.removeEventListener('visibilitychange', refreshNow)
  })

  function getSessionWords(wordIds: string[], mode: StudyMode = 'today') {
    return selectSessionWords(wordIds, progress.value, introductions.value, now.value, newWordsRemainingToday.value, mode)
  }

  function getAvailableNewWordCount(wordIds: string[]) {
    const viewedButUnrated = wordIds.filter((id) => !progress.value[id] && introductions.value[id] !== undefined).length
    const neverIntroduced = wordIds.filter((id) => !progress.value[id] && introductions.value[id] === undefined).length
    return viewedButUnrated + Math.min(neverIntroduced, newWordsRemainingToday.value)
  }

  function getNewWordCount(wordIds: string[]) {
    return wordIds.filter((id) => !progress.value[id]).length
  }

  function getWordLearningStatus(wordId: string): WordLearningStatus {
    const item = progress.value[wordId]
    if (!item) return 'new'
    if (item.dueAt <= now.value) return 'due'
    if (item.intervalDays >= 21) return 'learned'
    return 'learning'
  }

  function getNextIntervalDays(wordId: string, rating: ReviewRating) {
    if (rating === 'again') return 0
    return nextInterval(rating, progress.value[wordId]?.intervalDays ?? 0)
  }

  function rateWord(wordId: string, rating: ReviewRating) {
    const now = Date.now()
    const previous = progress.value[wordId]
    markWordIntroduced(wordId, previous?.introducedAt ?? now)
    const intervalDays = nextInterval(rating, previous?.intervalDays ?? 0)
    const dueAt = rating === 'again' ? now + 10 * MINUTE : now + intervalDays * DAY

    saveProgress({
      ...progress.value,
      [wordId]: {
        dueAt,
        intervalDays,
        repetitions: rating === 'again' ? 0 : (previous?.repetitions ?? 0) + 1,
        lapses: (previous?.lapses ?? 0) + Number(rating === 'again'),
        lastReviewedAt: now,
        introducedAt: introductions.value[wordId] ?? previous?.introducedAt ?? now,
        reviewId: globalThis.crypto?.randomUUID?.(),
      },
    })
  }

  function nextDueDate(wordIds?: string[]) {
    const items = wordIds
      ? wordIds.map((wordId) => progress.value[wordId]).filter((item) => item !== undefined)
      : Object.values(progress.value)
    const futureDates = items
      .map((item) => item.dueAt)
      .filter((dueAt) => dueAt > now.value)
    return futureDates.length ? Math.min(...futureDates) : null
  }

  return {
    progress,
    dueCount,
    newWordsIntroducedToday,
    newWordsRemainingToday,
    getSessionWords,
    getAvailableNewWordCount,
    getNewWordCount,
    getWordLearningStatus,
    getNextIntervalDays,
    rateWord,
    nextDueDate,
    getProgressSnapshot,
    activateProgressScope,
    mergeProgress,
    introductions,
    markWordIntroduced,
    getIntroductionsSnapshot,
    mergeIntroductions,
  }
}
