import type { FillGapQuestion } from '../../../data/trainers/fillGapQuestions.ts'

export const FILL_GAP_HISTORY_VERSION = 2
export const FILL_GAP_HISTORY_LIMIT_PER_TEMPLATE = 30
const HISTORY_STORAGE_KEY = 'greek-app:fill-gap-question-history'

export interface FillGapHistoryStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export type RecentFillGapSignatures = Record<string, string[]>

interface StoredTopicHistory {
  signatures: RecentFillGapSignatures
  contexts: RecentFillGapSignatures
}

interface StoredHistory {
  version: 2
  topics: Record<string, StoredTopicHistory>
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

/** Identifies the prompt context without counting distractor choices as new content. */
export function fillGapQuestionContextSignature(question: FillGapQuestion): string {
  return JSON.stringify({
    topicId: question.topicId,
    templateId: question.templateId ?? '',
    sentenceBefore: normalize(question.sentenceBefore),
    sentenceAfter: normalize(question.sentenceAfter),
    hint: normalize(question.hint),
  })
}

function cleanSignatureMap(value: unknown): RecentFillGapSignatures {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const signatures: RecentFillGapSignatures = {}
  for (const [templateId, rawSignatures] of Object.entries(value)) {
    if (!templateId || !Array.isArray(rawSignatures)) continue
    signatures[templateId] = rawSignatures
      .filter((signature): signature is string => typeof signature === 'string' && signature.length < 100_000)
      .slice(0, FILL_GAP_HISTORY_LIMIT_PER_TEMPLATE)
  }
  return signatures
}

function parseHistory(raw: string | null): StoredHistory {
  if (!raw) return { version: FILL_GAP_HISTORY_VERSION, topics: {} }
  try {
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return { version: FILL_GAP_HISTORY_VERSION, topics: {} }
    }
    const stored = value as { version?: unknown; topics?: unknown }
    if (!stored.topics || typeof stored.topics !== 'object' || Array.isArray(stored.topics)) {
      return { version: FILL_GAP_HISTORY_VERSION, topics: {} }
    }

    const topics: StoredHistory['topics'] = {}
    for (const [topicId, rawTopic] of Object.entries(stored.topics)) {
      if (!topicId || !rawTopic || typeof rawTopic !== 'object' || Array.isArray(rawTopic)) continue
      if (stored.version === 1) {
        topics[topicId] = { signatures: cleanSignatureMap(rawTopic), contexts: {} }
      } else if (stored.version === FILL_GAP_HISTORY_VERSION) {
        const current = rawTopic as Partial<StoredTopicHistory>
        topics[topicId] = {
          signatures: cleanSignatureMap(current.signatures),
          contexts: cleanSignatureMap(current.contexts),
        }
      }
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
    return parseHistory(storage.getItem(HISTORY_STORAGE_KEY)).topics[topicId]?.signatures ?? {}
  } catch {
    return {}
  }
}

export function loadRecentFillGapContextSignatures(
  topicId: string,
  storage: FillGapHistoryStorage | undefined = browserStorage(),
): RecentFillGapSignatures {
  if (!storage) return {}
  try {
    return parseHistory(storage.getItem(HISTORY_STORAGE_KEY)).topics[topicId]?.contexts ?? {}
  } catch {
    return {}
  }
}

function rememberSignature(signatures: RecentFillGapSignatures, templateId: string, signature: string): void {
  signatures[templateId] = [
    signature,
    ...(signatures[templateId] ?? []).filter((item) => item !== signature),
  ].slice(0, FILL_GAP_HISTORY_LIMIT_PER_TEMPLATE)
}

export function rememberFillGapQuestions(
  topicId: string,
  questions: FillGapQuestion[],
  storage: FillGapHistoryStorage | undefined = browserStorage(),
): void {
  if (!storage) return
  try {
    const history = parseHistory(storage.getItem(HISTORY_STORAGE_KEY))
    const topic = history.topics[topicId] ?? { signatures: {}, contexts: {} }
    for (const question of questions) {
      if (question.topicId !== topicId || !question.templateId) continue
      rememberSignature(topic.signatures, question.templateId, fillGapQuestionSignature(question))
      rememberSignature(topic.contexts, question.templateId, fillGapQuestionContextSignature(question))
    }
    history.topics[topicId] = topic
    storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
  } catch {
    // Storage may be disabled, full, or unavailable in private browsing.
  }
}
