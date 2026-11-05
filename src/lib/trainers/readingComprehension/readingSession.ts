import type { ReadingOption, ReadingQuestion, ReadingText } from '../../../data/trainers/readingTypes.ts'
import {
  READING_QUESTIONS_PER_ROUND,
  READING_ROUND_COUNT,
  READING_TEXT_COUNT,
} from '../../../data/trainers/readingTexts.ts'
import type { ReadingHistory } from './readingHistory.ts'

export interface ReadingQuestionState {
  question: ReadingQuestion
  optionOrder: string[]
  selectedOptionId: string | null
  checked: boolean
  isCorrect: boolean | null
}

export interface ReadingRound {
  number: number
  text: ReadingText
  questions: ReadingQuestionState[]
  checked: boolean
  completed: boolean
}

export interface ReadingSession {
  rounds: ReadingRound[]
  currentRoundIndex: number
  completed: boolean
}

export interface ReadingSessionResults {
  textsRead: number
  totalTexts: number
  totalQuestions: number
  correctAnswers: number
  errors: number
  accuracyPercent: number
  completedRounds: number
  totalRounds: number
}

export type ReadingActionOutcome =
  | 'selected'
  | 'checked'
  | 'advanced'
  | 'no-selection'
  | 'already-checked'
  | 'invalid'
  | 'not-checked'
  | 'session-completed'

export interface ReadingActionResult {
  session: ReadingSession
  outcome: ReadingActionOutcome
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

function recentScore(id: string, recentIds: readonly string[], unseenScore: number): number {
  const index = recentIds.indexOf(id)
  return index < 0 ? unseenScore : index
}

function chooseByRecency<T extends { id: string }>(
  candidates: readonly T[],
  recentIds: readonly string[],
  random: () => number,
): T[] {
  return shuffle(candidates, random).sort((left, right) =>
    recentScore(left.id, recentIds, -10000) - recentScore(right.id, recentIds, -10000),
  )
}

function selectTexts(
  texts: readonly ReadingText[],
  history: ReadingHistory,
  random: () => number,
): ReadingText[] {
  const selected = [
    ...chooseByRecency(texts.filter((text) => text.level === 'A1'), history.recentTextIds, random).slice(0, 2),
    ...chooseByRecency(texts.filter((text) => text.level === 'A2'), history.recentTextIds, random).slice(0, 3),
  ]
  return selected
}

function selectQuestions(text: ReadingText, history: ReadingHistory, random: () => number): ReadingQuestion[] {
  const unseen = text.questions.filter((question) => !history.recentQuestionIds.includes(question.id))
  if (unseen.length >= READING_QUESTIONS_PER_ROUND) {
    return shuffle(unseen, random).slice(0, READING_QUESTIONS_PER_ROUND)
  }
  const previouslySeen = chooseByRecency(
    text.questions.filter((question) => !unseen.includes(question)),
    history.recentQuestionIds,
    random,
  ).slice(0, READING_QUESTIONS_PER_ROUND - unseen.length)
  return shuffle([...unseen, ...previouslySeen], random)
}

function activeRound(session: ReadingSession): ReadingRound | undefined {
  return session.rounds[session.currentRoundIndex]
}

export function createReadingSession(
  texts: readonly ReadingText[],
  random: () => number = Math.random,
  history: ReadingHistory = { version: 1, recentTextIds: [], recentQuestionIds: [] },
): ReadingSession {
  const a1Count = texts.filter((text) => text.level === 'A1').length
  const a2Count = texts.filter((text) => text.level === 'A2').length
  if (a1Count < 6 || a2Count < 9 || texts.length < READING_TEXT_COUNT
    || texts.some((text) => text.questions.length < 3)) {
    throw new Error('Для тренировки «Прочитай и пойми» нужно 6 текстов A1, 9 текстов A2 и по три вопроса к каждому.')
  }

  const selectedTexts = selectTexts(texts, history, random)
  if (selectedTexts.length !== READING_ROUND_COUNT || new Set(selectedTexts.map((text) => text.id)).size !== READING_ROUND_COUNT) {
    throw new Error('Не удалось собрать пять разных текстов для тренировки «Прочитай и пойми».')
  }

  const rounds = selectedTexts.map((text, index): ReadingRound => ({
    number: index + 1,
    text,
    questions: shuffle(selectQuestions(text, history, random), random).map((question) => ({
      question,
      optionOrder: shuffle(question.options.map((option) => option.id), random),
      selectedOptionId: null,
      checked: false,
      isCorrect: null,
    })),
    checked: false,
    completed: false,
  }))
  return { rounds, currentRoundIndex: 0, completed: false }
}

export function selectReadingOption(session: ReadingSession, questionId: string, optionId: string): ReadingActionResult {
  if (session.completed) return { session, outcome: 'session-completed' }
  const round = activeRound(session)
  if (!round) return { session, outcome: 'invalid' }
  const target = round.questions.find((item) => item.question.id === questionId)
  if (!target || target.checked || !target.optionOrder.includes(optionId)) {
    return { session, outcome: target?.checked ? 'already-checked' : 'invalid' }
  }
  const rounds = session.rounds.map((item, index) => index !== session.currentRoundIndex ? item : {
    ...item,
    questions: item.questions.map((question) => question.question.id === questionId
      ? { ...question, selectedOptionId: optionId }
      : question),
  })
  return { session: { ...session, rounds }, outcome: 'selected' }
}

export function checkReadingRound(session: ReadingSession): ReadingActionResult {
  if (session.completed) return { session, outcome: 'session-completed' }
  const round = activeRound(session)
  if (!round) return { session, outcome: 'invalid' }
  if (round.checked) return { session, outcome: 'already-checked' }
  if (round.questions.some((question) => !question.selectedOptionId)) return { session, outcome: 'no-selection' }

  const rounds = session.rounds.map((item, index) => index !== session.currentRoundIndex ? item : ({
    ...item,
    checked: true,
    questions: item.questions.map((question) => ({
      ...question,
      checked: true,
      isCorrect: question.selectedOptionId === question.question.correctOptionId,
    })),
  }))
  return { session: { ...session, rounds }, outcome: 'checked' }
}

export function advanceReadingSession(session: ReadingSession): ReadingActionResult {
  if (session.completed) return { session, outcome: 'session-completed' }
  const round = activeRound(session)
  if (!round) return { session, outcome: 'invalid' }
  if (!round.checked) return { session, outcome: 'not-checked' }
  const rounds = session.rounds.map((item, index) => index === session.currentRoundIndex ? { ...item, completed: true } : item)
  if (session.currentRoundIndex === rounds.length - 1) {
    return { session: { ...session, rounds, completed: true }, outcome: 'advanced' }
  }
  return {
    session: { ...session, rounds, currentRoundIndex: session.currentRoundIndex + 1 },
    outcome: 'advanced',
  }
}

export function readingCorrectOption(question: ReadingQuestion): ReadingOption | undefined {
  return question.options.find((option) => option.id === question.correctOptionId)
}

export function getReadingSessionResults(session: ReadingSession): ReadingSessionResults {
  const questions = session.rounds.flatMap((round) => round.questions)
  const correctAnswers = questions.filter((question) => question.checked && question.isCorrect).length
  const totalQuestions = questions.length
  const completedRounds = session.rounds.filter((round) => round.completed).length
  return {
    textsRead: completedRounds,
    totalTexts: session.rounds.length,
    totalQuestions,
    correctAnswers,
    errors: questions.filter((question) => question.checked && question.isCorrect === false).length,
    accuracyPercent: totalQuestions === 0 ? 0 : Math.round(correctAnswers / totalQuestions * 100),
    completedRounds,
    totalRounds: session.rounds.length,
  }
}
