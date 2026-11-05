import type { ArticleGenderNoun } from './articleGenderTypes.ts'

export const ARTICLE_GENDER_HISTORY_KEY = 'greek-app:t10-article-gender:history:v1'
export const ARTICLE_GENDER_HISTORY_VERSION = 1
export const ARTICLE_GENDER_MAX_ERROR_QUEUE = 24

export interface ArticleGenderHistory {
  version: typeof ARTICLE_GENDER_HISTORY_VERSION
  cycle: number
  sessionCount: number
  order: string[]
  completedIds: string[]
  mistakeQueue: string[]
}

export interface ArticleGenderStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

function unique(values: readonly unknown[], allowed: ReadonlySet<string>): string[] {
  return [...new Set(values.filter((value): value is string =>
    typeof value === 'string' && allowed.has(value),
  ))]
}

function shuffle<T>(values: readonly T[], random: () => number): T[] {
  const result = [...values]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    const current = result[index]!
    result[index] = result[target]!
    result[target] = current
  }
  return result
}

export function createArticleGenderHistory(
  wordIds: readonly string[],
  random: () => number = Math.random,
  cycle = 0,
  sessionCount = 0,
  mistakeQueue: readonly string[] = [],
): ArticleGenderHistory {
  const ids = [...new Set(wordIds)]
  const allowed = new Set(ids)
  return {
    version: ARTICLE_GENDER_HISTORY_VERSION,
    cycle: Math.max(0, Math.floor(cycle)),
    sessionCount: Math.max(0, Math.floor(sessionCount)),
    order: shuffle(ids, random),
    completedIds: [],
    mistakeQueue: unique(mistakeQueue, allowed).slice(-ARTICLE_GENDER_MAX_ERROR_QUEUE),
  }
}

function isHistoryRecord(value: unknown): value is {
  version: number
  cycle: number
  sessionCount: number
  order: unknown[]
  completedIds: unknown[]
  mistakeQueue: unknown[]
} {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return record.version === ARTICLE_GENDER_HISTORY_VERSION
    && Number.isSafeInteger(record.cycle)
    && Number.isSafeInteger(record.sessionCount)
    && Array.isArray(record.order)
    && Array.isArray(record.completedIds)
    && Array.isArray(record.mistakeQueue)
}

export function reconcileArticleGenderHistory(
  value: unknown,
  wordIds: readonly string[],
  random: () => number = Math.random,
): ArticleGenderHistory {
  const ids = [...new Set(wordIds)]
  const available = new Set(ids)
  if (!isHistoryRecord(value)) return createArticleGenderHistory(ids, random)

  const order = unique(value.order, available)
  const existing = new Set(order)
  order.push(...shuffle(ids.filter((id) => !existing.has(id)), random))
  const completedIds = unique(value.completedIds, available)
  const mistakeQueue = unique(value.mistakeQueue, available).slice(-ARTICLE_GENDER_MAX_ERROR_QUEUE)
  const cycle = Math.max(0, value.cycle as number)
  const sessionCount = Math.max(0, value.sessionCount as number)

  if (ids.length > 0 && completedIds.length === ids.length) {
    return createArticleGenderHistory(ids, random, cycle + 1, sessionCount, mistakeQueue)
  }

  return { version: ARTICLE_GENDER_HISTORY_VERSION, cycle, sessionCount, order, completedIds, mistakeQueue }
}

export function loadArticleGenderHistory(
  nouns: readonly ArticleGenderNoun[],
  random: () => number = Math.random,
  storage?: ArticleGenderStorage,
): ArticleGenderHistory {
  try {
    const saved = storage?.getItem(ARTICLE_GENDER_HISTORY_KEY)
    return reconcileArticleGenderHistory(saved ? JSON.parse(saved) as unknown : null, nouns.map((noun) => noun.wordId), random)
  } catch {
    return createArticleGenderHistory(nouns.map((noun) => noun.wordId), random)
  }
}

export function recordArticleGenderAnswer(
  history: ArticleGenderHistory,
  wordId: string,
  isCorrect: boolean,
  nouns: readonly ArticleGenderNoun[],
  options: { random?: () => number; beginsSession?: boolean } = {},
): ArticleGenderHistory {
  const random = options.random ?? Math.random
  const current = reconcileArticleGenderHistory(history, nouns.map((noun) => noun.wordId), random)
  if (!nouns.some((noun) => noun.wordId === wordId)) return current

  const completed = new Set(current.completedIds)
  completed.add(wordId)
  const mistakeQueue = current.mistakeQueue.filter((id) => id !== wordId)
  if (!isCorrect) mistakeQueue.push(wordId)
  const sessionCount = current.sessionCount + (options.beginsSession ? 1 : 0)
  const allIds = nouns.map((noun) => noun.wordId)
  if (completed.size === allIds.length) {
    return createArticleGenderHistory(allIds, random, current.cycle + 1, sessionCount, mistakeQueue)
  }

  return {
    ...current,
    sessionCount,
    completedIds: current.order.filter((id) => completed.has(id)),
    mistakeQueue: mistakeQueue.slice(-ARTICLE_GENDER_MAX_ERROR_QUEUE),
  }
}

export function saveArticleGenderHistory(history: ArticleGenderHistory, storage?: ArticleGenderStorage): void {
  try {
    storage?.setItem(ARTICLE_GENDER_HISTORY_KEY, JSON.stringify(history))
  } catch {
    // The trainer remains usable without persistent browser storage.
  }
}
