import type { ReadingQuestion, ReadingText } from '../../../data/trainers/readingTypes.ts'

export const READING_HISTORY_KEY = 'greek-app:t7-reading-comprehension:history:v1'
export const READING_HISTORY_VERSION = 1
const MAX_RECENT_TEXTS = 60
const MAX_RECENT_QUESTIONS = 180

export interface ReadingHistory {
  version: typeof READING_HISTORY_VERSION
  recentTextIds: string[]
  recentQuestionIds: string[]
}

export interface ReadingHistoryStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

function validIds(value: unknown, allowed: ReadonlySet<string>, limit: number): string[] {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((item): item is string =>
    typeof item === 'string' && allowed.has(item),
  ))].slice(-limit)
}

export function emptyReadingHistory(): ReadingHistory {
  return { version: READING_HISTORY_VERSION, recentTextIds: [], recentQuestionIds: [] }
}

export function reconcileReadingHistory(value: unknown, texts: readonly ReadingText[]): ReadingHistory {
  if (!value || typeof value !== 'object') return emptyReadingHistory()
  const record = value as Record<string, unknown>
  if (record.version !== READING_HISTORY_VERSION) return emptyReadingHistory()
  const textIds = new Set(texts.map((text) => text.id))
  const questionIds = new Set(texts.flatMap((text) => text.questions.map((question) => question.id)))
  return {
    version: READING_HISTORY_VERSION,
    recentTextIds: validIds(record.recentTextIds, textIds, MAX_RECENT_TEXTS),
    recentQuestionIds: validIds(record.recentQuestionIds, questionIds, MAX_RECENT_QUESTIONS),
  }
}

export function loadReadingHistory(
  texts: readonly ReadingText[],
  storage?: ReadingHistoryStorage,
): ReadingHistory {
  try {
    const saved = storage?.getItem(READING_HISTORY_KEY)
    return reconcileReadingHistory(saved ? JSON.parse(saved) as unknown : null, texts)
  } catch {
    return emptyReadingHistory()
  }
}

export function rememberReadingRound(
  history: ReadingHistory,
  text: ReadingText,
  questions: readonly ReadingQuestion[],
): ReadingHistory {
  const questionIds = new Set(questions.map((question) => question.id))
  const allTexts = [...history.recentTextIds.filter((id) => id !== text.id), text.id]
  const allQuestions = [
    ...history.recentQuestionIds.filter((id) => !questionIds.has(id)),
    ...questionIds,
  ]
  return {
    version: READING_HISTORY_VERSION,
    recentTextIds: allTexts.slice(-MAX_RECENT_TEXTS),
    recentQuestionIds: allQuestions.slice(-MAX_RECENT_QUESTIONS),
  }
}

export function saveReadingHistory(history: ReadingHistory, storage?: ReadingHistoryStorage): void {
  try {
    storage?.setItem(READING_HISTORY_KEY, JSON.stringify(history))
  } catch {
    // A browser storage failure must not stop a local trainer session.
  }
}
