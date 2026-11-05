import type { DialogueQuestion } from '../../../data/trainers/dialogueTypes.ts'

export const DIALOGUE_HISTORY_KEY = 'greek-app:t6-dialogue:history:v1'
export const DIALOGUE_HISTORY_VERSION = 1
const MAX_HISTORY_ENTRIES = 120

export interface DialogueQuestionHistory {
  version: typeof DIALOGUE_HISTORY_VERSION
  exactQuestionSignatures: string[]
  situationIds: string[]
  intentIds: string[]
}

export interface DialogueHistoryStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

function unique(values: readonly string[], allowed?: ReadonlySet<string>): string[] {
  return [...new Set(values.filter((value) =>
    typeof value === 'string' && value.length > 0 && (!allowed || allowed.has(value)),
  ))].slice(-MAX_HISTORY_ENTRIES)
}

function normalize(value: string): string {
  return value.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase()
}

/** Includes the full prompt and correctness mapping, independent of display order. */
export function dialogueExactQuestionSignature(question: DialogueQuestion): string {
  const correct = question.options.find((option) => option.id === question.correctOptionId)
  const options = question.options
    .map((option) => `${normalize(option.greek)}:${option.id === question.correctOptionId ? '1' : '0'}`)
    .sort()
  return JSON.stringify([
    question.context.map((line) => [normalize(line.speaker), normalize(line.greek)]),
    correct ? normalize(correct.greek) : '',
    options,
  ])
}

/** The checked content signature does not include option order or distractor wording. */
export function dialogueSituationSignature(question: DialogueQuestion): string {
  return question.situationId
}

export function emptyDialogueQuestionHistory(): DialogueQuestionHistory {
  return { version: DIALOGUE_HISTORY_VERSION, exactQuestionSignatures: [], situationIds: [], intentIds: [] }
}

function parseHistory(value: unknown): DialogueQuestionHistory | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  if (record.version !== DIALOGUE_HISTORY_VERSION
    || !Array.isArray(record.exactQuestionSignatures)
    || !Array.isArray(record.situationIds)
    || !Array.isArray(record.intentIds)) return null

  return {
    version: DIALOGUE_HISTORY_VERSION,
    exactQuestionSignatures: unique(record.exactQuestionSignatures as string[]),
    situationIds: unique(record.situationIds as string[]),
    intentIds: unique(record.intentIds as string[]),
  }
}

export function reconcileDialogueQuestionHistory(
  value: unknown,
  questions: readonly DialogueQuestion[],
): DialogueQuestionHistory {
  const parsed = parseHistory(value)
  if (!parsed) return emptyDialogueQuestionHistory()

  const currentQuestions = new Set(questions.map(dialogueExactQuestionSignature))
  const currentSituations = new Set(questions.map(dialogueSituationSignature))
  const currentIntents = new Set(questions.map((question) => question.intentId))
  return {
    version: DIALOGUE_HISTORY_VERSION,
    exactQuestionSignatures: unique(parsed.exactQuestionSignatures, currentQuestions),
    situationIds: unique(parsed.situationIds, currentSituations),
    intentIds: unique(parsed.intentIds, currentIntents),
  }
}

export function loadDialogueQuestionHistory(
  questions: readonly DialogueQuestion[],
  storage?: DialogueHistoryStorage,
): DialogueQuestionHistory {
  try {
    const saved = storage?.getItem(DIALOGUE_HISTORY_KEY)
    return reconcileDialogueQuestionHistory(saved ? JSON.parse(saved) as unknown : null, questions)
  } catch {
    return emptyDialogueQuestionHistory()
  }
}

export function rememberDialogueQuestions(
  history: DialogueQuestionHistory,
  questions: readonly DialogueQuestion[],
): DialogueQuestionHistory {
  return {
    version: DIALOGUE_HISTORY_VERSION,
    exactQuestionSignatures: unique([
      ...history.exactQuestionSignatures,
      ...questions.map(dialogueExactQuestionSignature),
    ]),
    situationIds: unique([...history.situationIds, ...questions.map(dialogueSituationSignature)]),
    intentIds: unique([...history.intentIds, ...questions.map((question) => question.intentId)]),
  }
}

export function saveDialogueQuestionHistory(
  history: DialogueQuestionHistory,
  storage?: DialogueHistoryStorage,
): void {
  try {
    storage?.setItem(DIALOGUE_HISTORY_KEY, JSON.stringify(history))
  } catch {
    // Sessions continue in memory when browser storage is unavailable.
  }
}
