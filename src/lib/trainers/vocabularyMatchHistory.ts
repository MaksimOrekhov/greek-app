export const VOCABULARY_MATCH_HISTORY_KEY = 'greek-app:vocabulary-match:cycle:v1'
export const VOCABULARY_MATCH_HISTORY_VERSION = 1

export interface VocabularyMatchHistory {
  version: typeof VOCABULARY_MATCH_HISTORY_VERSION
  cycle: number
  order: string[]
  completedIds: string[]
}

export interface VocabularyMatchStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

function uniqueIds(ids: readonly string[]): string[] {
  return [...new Set(ids.filter((id) => typeof id === 'string' && id.length > 0))]
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[target]] = [shuffled[target]!, shuffled[index]!]
  }
  return shuffled
}

export function createVocabularyMatchHistory(
  pairIds: readonly string[],
  random: () => number = Math.random,
  cycle = 0,
): VocabularyMatchHistory {
  return {
    version: VOCABULARY_MATCH_HISTORY_VERSION,
    cycle: Math.max(0, Math.floor(cycle)),
    order: shuffle(uniqueIds(pairIds), random),
    completedIds: [],
  }
}

function isHistoryRecord(value: unknown): value is {
  version: number
  cycle: number
  order: unknown[]
  completedIds: unknown[]
} {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return record.version === VOCABULARY_MATCH_HISTORY_VERSION
    && Number.isSafeInteger(record.cycle)
    && Array.isArray(record.order)
    && Array.isArray(record.completedIds)
}

/** Removes stale dictionary IDs and appends new words without losing this cycle's progress. */
export function reconcileVocabularyMatchHistory(
  value: unknown,
  pairIds: readonly string[],
  random: () => number = Math.random,
): VocabularyMatchHistory {
  const ids = uniqueIds(pairIds)
  if (!isHistoryRecord(value)) return createVocabularyMatchHistory(ids, random)

  const available = new Set(ids)
  const seenOrder = new Set<string>()
  const order = value.order.filter((id): id is string => {
    if (typeof id !== 'string' || !available.has(id) || seenOrder.has(id)) return false
    seenOrder.add(id)
    return true
  })
  const newIds = ids.filter((id) => !seenOrder.has(id))
  order.push(...shuffle(newIds, random))

  const completedIds = uniqueIds(value.completedIds.filter((id): id is string =>
    typeof id === 'string' && available.has(id),
  ))
  const history: VocabularyMatchHistory = {
    version: VOCABULARY_MATCH_HISTORY_VERSION,
    cycle: Math.max(0, value.cycle),
    order,
    completedIds,
  }

  if (ids.length > 0 && completedIds.length === ids.length) {
    return createVocabularyMatchHistory(ids, random, history.cycle + 1)
  }
  return history
}

/** Reads best-effort; malformed or unavailable browser storage falls back to an in-memory cycle. */
export function loadVocabularyMatchHistory(
  pairIds: readonly string[],
  random: () => number = Math.random,
  storage?: VocabularyMatchStorage,
): VocabularyMatchHistory {
  try {
    const saved = storage?.getItem(VOCABULARY_MATCH_HISTORY_KEY)
    return reconcileVocabularyMatchHistory(saved === null || saved === undefined ? null : JSON.parse(saved), pairIds, random)
  } catch {
    return createVocabularyMatchHistory(pairIds, random)
  }
}

export function saveVocabularyMatchHistory(
  history: VocabularyMatchHistory,
  storage?: VocabularyMatchStorage,
): void {
  try {
    storage?.setItem(VOCABULARY_MATCH_HISTORY_KEY, JSON.stringify(history))
  } catch {
    // Storage is optional; session state remains usable in memory.
  }
}

/** Progress is recorded only by the caller after all five rounds have completed. */
export function completeVocabularyMatchCycleItems(
  history: VocabularyMatchHistory,
  completedPairIds: readonly string[],
  availablePairIds: readonly string[],
  random: () => number = Math.random,
): VocabularyMatchHistory {
  const current = reconcileVocabularyMatchHistory(history, availablePairIds, random)
  const available = new Set(current.order)
  const completed = new Set(current.completedIds)
  for (const id of completedPairIds) {
    if (available.has(id)) completed.add(id)
  }

  if (available.size > 0 && completed.size === available.size) {
    return createVocabularyMatchHistory([...available], random, current.cycle + 1)
  }

  return { ...current, completedIds: current.order.filter((id) => completed.has(id)) }
}
