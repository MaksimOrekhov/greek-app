import type { MultiSelectQuestion } from '../../../data/trainers/multiSelectQuestions.ts'

export const MULTI_SELECT_HISTORY_VERSION = 1
export const MULTI_SELECT_HISTORY_LIMIT_PER_TEMPLATE = 24
const HISTORY_STORAGE_KEY = 'greek-app:multi-select-question-history'

export interface MultiSelectHistoryStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export type RecentQuestionSignatures = Record<string, string[]>

interface StoredHistory {
  version: number
  topics: Record<string, RecentQuestionSignatures>
}

function browserStorage(): MultiSelectHistoryStorage | undefined {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}

function normalize(value: string): string {
  return value.normalize('NFC').trim().replace(/\s+/gu, ' ').toLocaleLowerCase('ru')
}

/** Ignores option display order but includes prompt, content, and answer key. */
export function multiSelectQuestionSignature(question: MultiSelectQuestion): string {
  const options = question.options
    .map((option) => [normalize(option.text), option.correct] as const)
    .sort(([leftText, leftCorrect], [rightText, rightCorrect]) =>
      (leftText < rightText ? -1 : leftText > rightText ? 1 : 0)
        || Number(leftCorrect) - Number(rightCorrect),
    )
  return JSON.stringify({
    prompt: normalize(question.prompt),
    options,
  })
}

function parseStoredHistory(raw: string | null): StoredHistory {
  if (!raw) return { version: MULTI_SELECT_HISTORY_VERSION, topics: {} }
  try {
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== 'object') return { version: MULTI_SELECT_HISTORY_VERSION, topics: {} }
    const stored = value as Partial<StoredHistory>
    if (stored.version !== MULTI_SELECT_HISTORY_VERSION || !stored.topics || typeof stored.topics !== 'object') {
      return { version: MULTI_SELECT_HISTORY_VERSION, topics: {} }
    }

    const topics: StoredHistory['topics'] = {}
    for (const [topicId, templatesValue] of Object.entries(stored.topics)) {
      if (!topicId || !templatesValue || typeof templatesValue !== 'object') continue
      const templates: RecentQuestionSignatures = {}
      for (const [templateId, signatures] of Object.entries(templatesValue)) {
        if (!templateId || !Array.isArray(signatures)) continue
        templates[templateId] = signatures
          .filter((signature): signature is string => typeof signature === 'string' && signature.length < 100_000)
          .slice(0, MULTI_SELECT_HISTORY_LIMIT_PER_TEMPLATE)
      }
      topics[topicId] = templates
    }
    return { version: MULTI_SELECT_HISTORY_VERSION, topics }
  } catch {
    return { version: MULTI_SELECT_HISTORY_VERSION, topics: {} }
  }
}

export function loadRecentQuestionSignatures(
  topicId: string,
  storage: MultiSelectHistoryStorage | undefined = browserStorage(),
): RecentQuestionSignatures {
  if (!storage) return {}
  try {
    return parseStoredHistory(storage.getItem(HISTORY_STORAGE_KEY)).topics[topicId] ?? {}
  } catch {
    return {}
  }
}

export function rememberGeneratedQuestions(
  topicId: string,
  questions: MultiSelectQuestion[],
  storage: MultiSelectHistoryStorage | undefined = browserStorage(),
): void {
  if (!storage) return
  try {
    const history = parseStoredHistory(storage.getItem(HISTORY_STORAGE_KEY))
    const templates = history.topics[topicId] ?? {}
    for (const question of questions) {
      if (question.topicId !== topicId || !question.templateId) continue
      const signature = multiSelectQuestionSignature(question)
      templates[question.templateId] = [
        signature,
        ...(templates[question.templateId] ?? []).filter((item) => item !== signature),
      ].slice(0, MULTI_SELECT_HISTORY_LIMIT_PER_TEMPLATE)
    }
    history.topics[topicId] = templates
    storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
  } catch {
    // Storage may be disabled, full, or unavailable in private browsing.
  }
}
