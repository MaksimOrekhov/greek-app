import type { DialogueOption, DialogueQuestion } from '../../../data/trainers/dialogueTypes.ts'
import { dialogueCategories } from '../../../data/trainers/dialogueQuestions.ts'
import {
  dialogueExactQuestionSignature,
  type DialogueQuestionHistory,
} from './dialogueHistory.ts'

export const DIALOGUE_ROUND_COUNT = 5
export const DIALOGUE_QUESTIONS_PER_ROUND = 2
export const DIALOGUE_SESSION_QUESTION_COUNT = DIALOGUE_ROUND_COUNT * DIALOGUE_QUESTIONS_PER_ROUND

export interface DialogueQuestionState {
  question: DialogueQuestion
  optionOrder: string[]
  selectedOptionId: string | null
  checked: boolean
  isCorrect: boolean | null
}

export interface DialogueRound {
  number: number
  questions: DialogueQuestionState[]
  completed: boolean
}

export interface DialogueSession {
  rounds: DialogueRound[]
  currentRoundIndex: number
  currentQuestionIndex: number
  completed: boolean
}

export interface DialogueSessionResults {
  totalQuestions: number
  correctAnswers: number
  errors: number
  accuracyPercent: number
  completedRounds: number
  totalRounds: number
}

export type DialogueActionOutcome =
  | 'selected'
  | 'checked'
  | 'advanced'
  | 'no-selection'
  | 'already-checked'
  | 'invalid'
  | 'not-checked'
  | 'session-completed'

export interface DialogueActionResult {
  session: DialogueSession
  outcome: DialogueActionOutcome
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    const current = result[index]!
    result[index] = result[target]!
    result[target] = current
  }
  return result
}

function activeQuestion(session: DialogueSession): DialogueQuestionState | undefined {
  return session.rounds[session.currentRoundIndex]?.questions[session.currentQuestionIndex]
}

function pickPreferredQuestion(
  candidates: readonly DialogueQuestion[],
  history: DialogueQuestionHistory,
  random: () => number,
): DialogueQuestion | undefined {
  const seenExact = new Set(history.exactQuestionSignatures)
  const seenSituations = new Set(history.situationIds)
  const seenIntents = new Set(history.intentIds)
  const randomized = shuffle(candidates, random)
  randomized.sort((left, right) => {
    const leftScore = Number(seenSituations.has(left.situationId)) * 4
      + Number(seenIntents.has(left.intentId)) * 2
      + Number(seenExact.has(dialogueExactQuestionSignature(left)))
    const rightScore = Number(seenSituations.has(right.situationId)) * 4
      + Number(seenIntents.has(right.intentId)) * 2
      + Number(seenExact.has(dialogueExactQuestionSignature(right)))
    return leftScore - rightScore
  })
  return randomized[0]
}

function chooseQuestions(
  questions: readonly DialogueQuestion[],
  history: DialogueQuestionHistory,
  random: () => number,
): DialogueQuestion[] {
  const selected: DialogueQuestion[] = []
  const selectedIds = new Set<string>()
  const selectedSituations = new Set<string>()
  const categoryIds = shuffle(dialogueCategories.map((category) => category.id), random)

  // A first pass through all available categories guarantees broad session coverage.
  for (const categoryId of categoryIds) {
    const candidates = questions.filter((question) =>
      question.categoryId === categoryId && !selectedIds.has(question.id) && !selectedSituations.has(question.situationId),
    )
    const chosen = pickPreferredQuestion(candidates, history, random)
    if (!chosen) continue
    selected.push(chosen)
    selectedIds.add(chosen.id)
    selectedSituations.add(chosen.situationId)
  }

  while (selected.length < DIALOGUE_SESSION_QUESTION_COUNT) {
    const candidates = questions.filter((question) =>
      !selectedIds.has(question.id) && !selectedSituations.has(question.situationId),
    )
    const chosen = pickPreferredQuestion(candidates, history, random)
    if (!chosen) break
    selected.push(chosen)
    selectedIds.add(chosen.id)
    selectedSituations.add(chosen.situationId)
  }

  // A deliberately bounded fallback keeps the session usable if future bank metadata is duplicated.
  if (selected.length < DIALOGUE_SESSION_QUESTION_COUNT) {
    const unused = questions.filter((question) => !selectedIds.has(question.id))
    selected.push(...shuffle(unused, random).slice(0, DIALOGUE_SESSION_QUESTION_COUNT - selected.length))
  }
  return selected.slice(0, DIALOGUE_SESSION_QUESTION_COUNT)
}

export function createDialogueSession(
  questions: readonly DialogueQuestion[],
  random: () => number = Math.random,
  history: DialogueQuestionHistory = { version: 1, exactQuestionSignatures: [], situationIds: [], intentIds: [] },
): DialogueSession {
  if (questions.length < DIALOGUE_SESSION_QUESTION_COUNT) {
    throw new Error('Для тренировки «Продолжи диалог» нужно не меньше десяти заданий.')
  }

  const selected = shuffle(chooseQuestions(questions, history, random), random)
  if (selected.length < DIALOGUE_SESSION_QUESTION_COUNT) {
    throw new Error('Не удалось собрать десять заданий для тренировки «Продолжи диалог».')
  }

  const states = selected.map((question): DialogueQuestionState => ({
    question,
    optionOrder: shuffle(question.options.map((option) => option.id), random),
    selectedOptionId: null,
    checked: false,
    isCorrect: null,
  }))
  const rounds = Array.from({ length: DIALOGUE_ROUND_COUNT }, (_, index): DialogueRound => ({
    number: index + 1,
    questions: states.slice(index * DIALOGUE_QUESTIONS_PER_ROUND, (index + 1) * DIALOGUE_QUESTIONS_PER_ROUND),
    completed: false,
  }))
  return { rounds, currentRoundIndex: 0, currentQuestionIndex: 0, completed: false }
}

export function selectDialogueOption(session: DialogueSession, optionId: string): DialogueActionResult {
  if (session.completed) return { session, outcome: 'session-completed' }
  const active = activeQuestion(session)
  if (!active) return { session, outcome: 'invalid' }
  if (active.checked) return { session, outcome: 'already-checked' }
  if (!active.optionOrder.includes(optionId)) return { session, outcome: 'invalid' }

  const rounds = session.rounds.map((round, roundIndex) => roundIndex !== session.currentRoundIndex
    ? round
    : {
      ...round,
      questions: round.questions.map((question, questionIndex) => questionIndex !== session.currentQuestionIndex
        ? question
        : { ...question, selectedOptionId: optionId }),
    })
  return { session: { ...session, rounds }, outcome: 'selected' }
}

export function checkDialogueAnswer(session: DialogueSession): DialogueActionResult {
  if (session.completed) return { session, outcome: 'session-completed' }
  const active = activeQuestion(session)
  if (!active) return { session, outcome: 'invalid' }
  if (active.checked) return { session, outcome: 'already-checked' }
  if (!active.selectedOptionId) return { session, outcome: 'no-selection' }

  const rounds = session.rounds.map((round, roundIndex) => roundIndex !== session.currentRoundIndex
    ? round
    : {
      ...round,
      questions: round.questions.map((question, questionIndex) => questionIndex !== session.currentQuestionIndex
        ? question
        : {
          ...question,
          checked: true,
          isCorrect: question.selectedOptionId === question.question.correctOptionId,
        }),
    })
  return { session: { ...session, rounds }, outcome: 'checked' }
}

export function advanceDialogueSession(session: DialogueSession): DialogueActionResult {
  if (session.completed) return { session, outcome: 'session-completed' }
  const active = activeQuestion(session)
  if (!active) return { session, outcome: 'invalid' }
  if (!active.checked) return { session, outcome: 'not-checked' }

  const round = session.rounds[session.currentRoundIndex]!
  if (session.currentQuestionIndex < round.questions.length - 1) {
    return {
      session: { ...session, currentQuestionIndex: session.currentQuestionIndex + 1 },
      outcome: 'advanced',
    }
  }

  const rounds = session.rounds.map((item, index) => index === session.currentRoundIndex ? { ...item, completed: true } : item)
  if (session.currentRoundIndex === rounds.length - 1) {
    return { session: { ...session, rounds, completed: true }, outcome: 'advanced' }
  }
  return {
    session: { ...session, rounds, currentRoundIndex: session.currentRoundIndex + 1, currentQuestionIndex: 0 },
    outcome: 'advanced',
  }
}

export function dialogueQuestionCorrectOption(question: DialogueQuestion): DialogueOption | undefined {
  return question.options.find((option) => option.id === question.correctOptionId)
}

export function getDialogueSessionResults(session: DialogueSession): DialogueSessionResults {
  const questions = session.rounds.flatMap((round) => round.questions)
  const correctAnswers = questions.filter((question) => question.checked && question.isCorrect).length
  const totalQuestions = questions.length
  return {
    totalQuestions,
    correctAnswers,
    errors: questions.filter((question) => question.checked && question.isCorrect === false).length,
    accuracyPercent: totalQuestions === 0 ? 0 : Math.round(correctAnswers / totalQuestions * 100),
    completedRounds: session.rounds.filter((round) => round.completed).length,
    totalRounds: session.rounds.length,
  }
}
