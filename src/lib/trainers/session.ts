import type { TrainerPair } from '../../data/trainers/types.ts'

export const TRAINER_ROUND_COUNT = 5
export const TRAINER_ROUND_PAIR_LIMIT = 4

export interface TrainerRound {
  number: number
  pairs: TrainerPair[]
  leftOrder: string[]
  rightOrder: string[]
  foundPairIds: string[]
  mistakesByPair: Record<string, number>
  errors: number
  firstTryCorrect: number
  completed: boolean
}

export interface TrainerSession {
  topicId: string
  rounds: TrainerRound[]
  currentRoundIndex: number
  completed: boolean
}

export interface TrainerSessionResults {
  completedRounds: number
  totalRounds: number
  foundPairs: number
  totalPairs: number
  errors: number
  firstTryCorrect: number
}

export type MatchAttemptOutcome = 'correct' | 'incorrect' | 'already-found' | 'invalid' | 'session-completed'

export interface MatchAttemptResult {
  session: TrainerSession
  outcome: MatchAttemptOutcome
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[target]] = [shuffled[target]!, shuffled[index]!]
  }
  return shuffled
}

function usageOf(pair: TrainerPair, pairUsage: Map<string, number>): number {
  return pairUsage.get(pair.id) ?? 0
}

function selectRoundPairs(
  sourcePairs: TrainerPair[],
  pairUsage: Map<string, number>,
  random: () => number,
): TrainerPair[] {
  const candidatePairs = shuffle(sourcePairs, random)
    .sort((left, right) => usageOf(left, pairUsage) - usageOf(right, pairUsage))
  const pairsByPrompt = new Map<string, TrainerPair[]>()

  for (const pair of candidatePairs) {
    const prompt = pair.prompt.trim()
    const candidates = pairsByPrompt.get(prompt) ?? []
    candidates.push(pair)
    pairsByPrompt.set(prompt, candidates)
  }

  const prompts = shuffle([...pairsByPrompt.keys()], random)
    .sort((left, right) => {
      const leftUsage = Math.min(...pairsByPrompt.get(left)!.map((pair) => usageOf(pair, pairUsage)))
      const rightUsage = Math.min(...pairsByPrompt.get(right)!.map((pair) => usageOf(pair, pairUsage)))
      return leftUsage - rightUsage
    })
  const pairByAnswer = new Map<string, TrainerPair>()

  function assignPrompt(prompt: string, seenPrompts: Set<string>, seenAnswers: Set<string>): boolean {
    if (seenPrompts.has(prompt)) return false
    seenPrompts.add(prompt)

    for (const pair of pairsByPrompt.get(prompt) ?? []) {
      const answer = pair.answer.trim()
      if (seenAnswers.has(answer)) continue
      seenAnswers.add(answer)

      const previousPair = pairByAnswer.get(answer)
      if (!previousPair || assignPrompt(previousPair.prompt.trim(), seenPrompts, seenAnswers)) {
        pairByAnswer.set(answer, pair)
        return true
      }
    }

    return false
  }

  for (const prompt of prompts) assignPrompt(prompt, new Set(), new Set())

  return shuffle([...pairByAnswer.values()], random)
    .sort((left, right) => usageOf(left, pairUsage) - usageOf(right, pairUsage))
    .slice(0, TRAINER_ROUND_PAIR_LIMIT)
}

function sessionOrderSignature(session: TrainerSession): string {
  return session.rounds
    .map((round) => `${round.leftOrder.join(',')}|${round.rightOrder.join(',')}`)
    .join(';')
}

function guaranteeRestartVariation(session: TrainerSession, previous: TrainerSession | undefined): TrainerSession {
  if (!previous || sessionOrderSignature(session) !== sessionOrderSignature(previous)) return session

  const firstRound = session.rounds[0]
  if (firstRound && firstRound.rightOrder.length > 1) {
    firstRound.rightOrder = [...firstRound.rightOrder.slice(1), firstRound.rightOrder[0]!]
  }
  return session
}

export function createTrainerSession(
  topicId: string,
  sourcePairs: TrainerPair[],
  random: () => number = Math.random,
  previous?: TrainerSession,
): TrainerSession {
  if (sourcePairs.length === 0) throw new Error(`Нельзя начать тренировку «${topicId}»: нет заданий.`)

  const sourceIds = new Set<string>()
  for (const pair of sourcePairs) {
    if (!pair.id || !pair.prompt.trim() || !pair.answer.trim()) {
      throw new Error(`Нельзя начать тренировку «${topicId}»: найдено неполное задание.`)
    }
    if (sourceIds.has(pair.id)) throw new Error(`Нельзя начать тренировку «${topicId}»: идентификатор пары повторяется.`)
    sourceIds.add(pair.id)
  }

  const pairUsage = new Map<string, number>()
  const rounds = Array.from({ length: TRAINER_ROUND_COUNT }, (_, index): TrainerRound => {
    const pairs = selectRoundPairs(sourcePairs, pairUsage, random)
    for (const pair of pairs) pairUsage.set(pair.id, usageOf(pair, pairUsage) + 1)
    const pairIds = pairs.map((pair) => pair.id)

    return {
      number: index + 1,
      pairs,
      leftOrder: shuffle(pairIds, random),
      rightOrder: shuffle(pairIds, random),
      foundPairIds: [],
      mistakesByPair: {},
      errors: 0,
      firstTryCorrect: 0,
      completed: false,
    }
  })

  return guaranteeRestartVariation({ topicId, rounds, currentRoundIndex: 0, completed: false }, previous)
}

export function submitTrainerMatch(
  session: TrainerSession,
  leftPairId: string,
  rightPairId: string,
): MatchAttemptResult {
  if (session.completed) return { session, outcome: 'session-completed' }

  const currentRound = session.rounds[session.currentRoundIndex]
  if (!currentRound || currentRound.completed) return { session, outcome: 'already-found' }

  const leftPair = currentRound.pairs.find((pair) => pair.id === leftPairId)
  const rightPair = currentRound.pairs.find((pair) => pair.id === rightPairId)
  if (!leftPair || !rightPair) return { session, outcome: 'invalid' }
  if (currentRound.foundPairIds.includes(leftPairId) || currentRound.foundPairIds.includes(rightPairId)) {
    return { session, outcome: 'already-found' }
  }

  const rounds = session.rounds.map((round, index) => index === session.currentRoundIndex ? { ...round } : round)
  const round = rounds[session.currentRoundIndex]!
  let outcome: MatchAttemptOutcome

  if (leftPairId === rightPairId) {
    outcome = 'correct'
    round.foundPairIds = [...round.foundPairIds, leftPairId]
    if (!round.mistakesByPair[leftPairId]) round.firstTryCorrect += 1
    if (round.foundPairIds.length === round.pairs.length) round.completed = true
  } else {
    outcome = 'incorrect'
    round.errors += 1
    round.mistakesByPair = {
      ...round.mistakesByPair,
      [leftPairId]: (round.mistakesByPair[leftPairId] ?? 0) + 1,
      [rightPairId]: (round.mistakesByPair[rightPairId] ?? 0) + 1,
    }
  }

  return { session: { ...session, rounds }, outcome }
}

export function advanceTrainerSession(session: TrainerSession): TrainerSession {
  if (session.completed) return session

  const currentRound = session.rounds[session.currentRoundIndex]
  if (!currentRound?.completed) return session
  if (session.currentRoundIndex === session.rounds.length - 1) return { ...session, completed: true }

  return { ...session, currentRoundIndex: session.currentRoundIndex + 1 }
}

export function getTrainerSessionResults(session: TrainerSession): TrainerSessionResults {
  return {
    completedRounds: session.rounds.filter((round) => round.completed).length,
    totalRounds: session.rounds.length,
    foundPairs: session.rounds.reduce((sum, round) => sum + round.foundPairIds.length, 0),
    totalPairs: session.rounds.reduce((sum, round) => sum + round.pairs.length, 0),
    errors: session.rounds.reduce((sum, round) => sum + round.errors, 0),
    firstTryCorrect: session.rounds.reduce((sum, round) => sum + round.firstTryCorrect, 0),
  }
}
