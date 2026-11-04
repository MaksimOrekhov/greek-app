import type { OrderItemsQuestion, OrderItemsTemplateId } from './orderItems.ts'
import { orderItemsQuestionSignature, orderItemsValueSetSignature } from './orderItems.ts'

export const ORDER_ITEMS_HISTORY_VERSION = 1
export const ORDER_ITEMS_HISTORY_LIMIT = 30
export const ORDER_ITEMS_HISTORY_STORAGE_KEY = 'greek-app:order-items-history:v1'

export interface OrderItemsHistoryStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export interface RecentOrderItemsHistory {
  full: Partial<Record<OrderItemsTemplateId, string[]>>
  situations: { numbers: string[]; prices: string[] }
}

interface StoredHistory {
  version: 1
  full: Partial<Record<OrderItemsTemplateId, string[]>>
  situations: { numbers: string[]; prices: string[] }
}

const EMPTY_HISTORY: StoredHistory = {
  version: ORDER_ITEMS_HISTORY_VERSION,
  full: {},
  situations: { numbers: [], prices: [] },
}

function browserStorage(): OrderItemsHistoryStorage | undefined {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}

function cleanSignatures(value: unknown): Partial<Record<OrderItemsTemplateId, string[]>> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const result: Partial<Record<OrderItemsTemplateId, string[]>> = {}
  for (const templateId of ['ascending', 'descending', 'prices'] as const) {
    const signatures = (value as Record<string, unknown>)[templateId]
    if (!Array.isArray(signatures)) continue
    result[templateId] = signatures
      .filter((signature): signature is string => typeof signature === 'string' && signature.length <= 20_000)
      .slice(-ORDER_ITEMS_HISTORY_LIMIT)
  }
  return result
}

function cleanSituationSignatures(value: unknown): StoredHistory['situations'] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { numbers: [], prices: [] }
  const raw = value as Record<string, unknown>
  const clean = (key: 'numbers' | 'prices') => Array.isArray(raw[key])
    ? (raw[key] as unknown[])
      .filter((signature): signature is string => typeof signature === 'string' && signature.length <= 20_000)
      .slice(-ORDER_ITEMS_HISTORY_LIMIT)
    : []
  return { numbers: clean('numbers'), prices: clean('prices') }
}

function readHistory(storage: OrderItemsHistoryStorage | undefined): StoredHistory {
  if (!storage) return EMPTY_HISTORY
  try {
    const raw = storage.getItem(ORDER_ITEMS_HISTORY_STORAGE_KEY)
    if (!raw) return EMPTY_HISTORY
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return EMPTY_HISTORY
    const value = parsed as Record<string, unknown>
    if (value.version !== ORDER_ITEMS_HISTORY_VERSION) return EMPTY_HISTORY
    return {
      version: ORDER_ITEMS_HISTORY_VERSION,
      full: cleanSignatures(value.full),
      situations: cleanSituationSignatures(value.situations),
    }
  } catch {
    return EMPTY_HISTORY
  }
}

export function loadRecentOrderItemsHistory(storage = browserStorage()): RecentOrderItemsHistory {
  const history = readHistory(storage)
  return { full: history.full, situations: history.situations }
}

export function rememberOrderItemsQuestions(
  questions: readonly OrderItemsQuestion[],
  storage = browserStorage(),
): void {
  if (!storage) return
  const previous = readHistory(storage)
  const full = { ...previous.full }
  const situations = { numbers: [...previous.situations.numbers], prices: [...previous.situations.prices] }

  for (const question of questions) {
    const signatures = full[question.templateId] ?? []
    full[question.templateId] = [...signatures.filter((signature) => signature !== orderItemsQuestionSignature(question)), orderItemsQuestionSignature(question)]
      .slice(-ORDER_ITEMS_HISTORY_LIMIT)
    const key = question.templateId === 'prices' ? 'prices' : 'numbers'
    const situation = orderItemsValueSetSignature(question)
    situations[key] = [...situations[key].filter((signature) => signature !== situation), situation]
      .slice(-ORDER_ITEMS_HISTORY_LIMIT)
  }

  try {
    storage.setItem(ORDER_ITEMS_HISTORY_STORAGE_KEY, JSON.stringify({
      version: ORDER_ITEMS_HISTORY_VERSION,
      full,
      situations,
    } satisfies StoredHistory))
  } catch {
    // History is a best-effort enhancement; generation still works without it.
  }
}
