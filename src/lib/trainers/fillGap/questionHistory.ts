import type { FillGapQuestion } from '../../../data/trainers/fillGapQuestions.ts'

export const FILL_GAP_HISTORY_VERSION = 1
export const FILL_GAP_HISTORY_LIMIT_PER_TEMPLATE = 30
const HISTORY_STORAGE_KEY = 'greek-app:fill-gap-question-history'

export interface FillGapHistoryStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export type RecentFillGapSignatures = Record<string, string[]>

interface StoredHistory {
  version: number
  topics: Record<string, RecentFillGapSignatures>
}

function browserStorage(): FillGapHistoryStorage | undefined {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}

function normalize(value: string): string {
  return value.normalize('NFC').trim().replace(/\s+/gu, ' ').toLocaleLowerCase('ru')
}

/** Includes the content and answer key while ignoring option display order. */
export function fillGapQuestionSignature(question: FillGapQuestion): string {
  const options = question.options
    .map((option) => [normalize(option.text), option.id === question.correctOptionId] as const)
    .sort(([leftText, leftCorrect], [rightText, rightCorrect]) =>
      (leftText < rightText ? -1 : leftText > rightText ? 1 : 0)
        || Number(leftCorrect) - Number(rightCorrect),
    )
  return JSON.stringify({
    templateId: question.templateId ?? '',
    instruction: normalize(question.instruction),
    sentenceBefore: normalize(question.sentenceBefore),
    sentenceAfter: normalize(question.sentenceAfter),
    hint: normalize(question.hint),
    explanation: normalize(question.explanation),
    options,
  })
}

function parseHistory(raw: string | null): StoredHistory {
  if (!raw) return { version: FILL_GAP_HISTORY_VERSION, topics: {} }
  try {
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== 'object') return { version: FILL_GAP_HISTORY_VERSION, topics: {} }
    const stored = value as Partial<StoredHistory>
    if (stored.version !== FILL_GAP_HISTORY_VERSION || !stored.topics || typeof stored.topics !== 'object') {
      return { version: FILL_GAP_HISTORY_VERSION, topics: {} }
    }

    const topics: StoredHistory['topics'] = {}
    for (const [topicId, rawTemplates] of Object.entries(stored.topics)) {
      if (!topicId || !rawTemplates || typeof rawTemplates !== 'object') continue
      const templates: RecentFillGapSignatures = {}
      for (const [templateId, rawSignatures] of Object.entries(rawTemplates)) {
        if (!templateId || !Array.isArray(rawSignatures)) continue
        templates[templateId] = rawSignatures
          .filter((signature): signature is string => typeof signature === 'string' && signature.length < 100_000)
          .slice(0, FILL_GAP_HISTORY_LIMIT_PER_TEMPLATE)
      }
      topics[topicId] = templates
    }
    return { version: FILL_GAP_HISTORY_VERSION, topics }
  } catch {
    return { version: FILL_GAP_HISTORY_VERSION, topics: {} }
  }
}

export function loadRecentFillGapSignatures(
  topicId: string,
  storage: FillGapHistoryStorage | undefined = browserStorage(),
): RecentFillGapSignatures {
  if (!storage) return {}
  try {
    return parseHistory(storage.getItem(HISTORY_STORAGE_KEY)).topics[topicId] ?? {}
  } catch {
    return {}
  }
}

export function rememberFillGapQuestions(
  topicId: string,
  questions: FillGapQuestion[],
  storage: FillGapHistoryStorage | undefined = browserStorage(),
): void {
  if (!storage) return
  try {
    const history = parseHistory(storage.getItem(HISTORY_STORAGE_KEY))
    const templates = history.topics[topicId] ?? {}
    for (const question of questions) {
      if (question.topicId !== topicId || !question.templateId) continue
      const signature = fillGapQuestionSignature(question)
      templates[question.templateId] = [
        signature,
        ...(templates[question.templateId] ?? []).filter((item) => item !== signature),
      ].slice(0, FILL_GAP_HISTORY_LIMIT_PER_TEMPLATE)
    }
    history.topics[topicId] = templates
    storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
  } catch {
    // Storage may be disabled, full, or unavailable in private browsing.
  }
}
