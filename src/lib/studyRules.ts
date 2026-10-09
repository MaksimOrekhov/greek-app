export type ReviewRating = 'again' | 'hard' | 'good' | 'easy'

export interface WordProgress {
  dueAt: number
  intervalDays: number
  repetitions: number
  lapses: number
  lastReviewedAt: number
  introducedAt?: number
  reviewId?: string
}

export type ProgressByWord = Record<string, WordProgress>
export type IntroductionsByWord = Record<string, number>
export type StudyMode = 'today' | 'review' | 'new' | 'all'

const LEGACY_WORD_IDS: Record<string, string> = { 'καφέ': 'καφές' }

export function canonicalWordId(wordId: string) {
  return LEGACY_WORD_IDS[wordId] ?? wordId
}

export function normalizeProgressIds(progress: ProgressByWord): ProgressByWord {
  const normalized: ProgressByWord = {}
  for (const [wordId, item] of Object.entries(progress)) {
    const canonicalId = canonicalWordId(wordId)
    const previous = normalized[canonicalId]
    if (!previous) {
      normalized[canonicalId] = item
      continue
    }
    const latest = item.lastReviewedAt > previous.lastReviewedAt
      || (item.lastReviewedAt === previous.lastReviewedAt
        && Boolean(item.reviewId)
        && (!previous.reviewId || item.reviewId! > previous.reviewId))
      ? item
      : previous
    const introductions = [previous.introducedAt, item.introducedAt].filter((value): value is number => value !== undefined)
    normalized[canonicalId] = introductions.length ? { ...latest, introducedAt: Math.min(...introductions) } : latest
  }
  return normalized
}

export function normalizeIntroductionIds(introductions: IntroductionsByWord): IntroductionsByWord {
  const normalized: IntroductionsByWord = {}
  for (const [wordId, timestamp] of Object.entries(introductions)) {
    const canonicalId = canonicalWordId(wordId)
    normalized[canonicalId] = Math.min(normalized[canonicalId] ?? timestamp, timestamp)
  }
  return normalized
}

export function nextInterval(rating: ReviewRating, previousInterval: number) {
  if (rating === 'again') return 0
  if (rating === 'hard') return Math.min(365, Math.max(1, Math.ceil(previousInterval * 0.8)))
  if (rating === 'good') return Math.min(365, Math.max(3, Math.ceil(previousInterval * 2.2)))
  return Math.min(365, Math.max(7, Math.ceil(previousInterval * 2.8)))
}

export function formatInterval(days: number) {
  if (days === 0) return '10 мин'
  const remainder100 = days % 100
  const remainder10 = days % 10
  const noun = remainder100 >= 11 && remainder100 <= 14 ? 'дней'
    : remainder10 === 1 ? 'день'
      : remainder10 >= 2 && remainder10 <= 4 ? 'дня' : 'дней'
  return `${days} ${noun}`
}

export function mergeProgressSnapshots(local: ProgressByWord, remote: ProgressByWord): ProgressByWord {
  const merged = normalizeProgressIds(local)
  for (const [wordId, remoteItem] of Object.entries(normalizeProgressIds(remote))) {
    const localItem = merged[wordId]
    if (!localItem) { merged[wordId] = remoteItem; continue }
    const remoteIsNewer = remoteItem.lastReviewedAt > localItem.lastReviewedAt
      || (remoteItem.lastReviewedAt === localItem.lastReviewedAt
        && Boolean(remoteItem.reviewId)
        && (!localItem.reviewId || remoteItem.reviewId! > localItem.reviewId))
    const latest = remoteIsNewer ? remoteItem : localItem
    const introductions = [localItem.introducedAt, remoteItem.introducedAt].filter((value): value is number => value !== undefined)
    merged[wordId] = introductions.length ? { ...latest, introducedAt: Math.min(...introductions) } : latest
  }
  return merged
}

export function introducedTodayCount(introductions: IntroductionsByWord, now: number) {
  const today = new Date(now)
  return Object.values(introductions).filter((timestamp) => {
    const date = new Date(timestamp)
    return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate()
  }).length
}

export function canImportAnonymousProgress(owner: string | null, userId: string) {
  return owner === null || owner === 'pending' || owner === userId
}

export function selectSessionWords(
  wordIds: string[], progress: ProgressByWord, introductions: IntroductionsByWord,
  now: number, remainingNewLimit: number, mode: StudyMode,
) {
  const fresh = wordIds.filter((id) => !progress[id] && introductions[id] === undefined).slice(0, remainingNewLimit)
  const introducedWithoutRating = wordIds.filter((id) => !progress[id] && introductions[id] !== undefined)
  const due = wordIds.filter((id) => progress[id] !== undefined && progress[id].dueAt <= now)
  if (mode === 'review') return due
  if (mode === 'new') return [...introducedWithoutRating, ...fresh]
  if (mode === 'all') return [...wordIds]
  return [...due, ...introducedWithoutRating, ...fresh]
}
