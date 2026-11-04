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

function pairGroups(pairs: TrainerPair[]): TrainerPair[][] {
  const grouped = new Map<string, TrainerPair[]>()
  for (const pair of pairs) {
    const group = grouped.get(pair.answer) ?? []
    group.push(pair)
    grouped.set(pair.answer, group)
  }
  return [...grouped.values()]
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

  const groups = pairGroups(sourcePairs)
  let groupQueue = shuffle(groups, random)
  const pairQueues = new Map(groups.map((group) => [group, shuffle(group, random)]))
  const rounds = Array.from({ length: TRAINER_ROUND_COUNT }, (_, index): TrainerRound => {
    const selectedGroups: TrainerPair[][] = []
    const pairsPerRound = Math.min(TRAINER_ROUND_PAIR_LIMIT, groups.length)

    while (selectedGroups.length < pairsPerRound) {
      if (groupQueue.length === 0) {
        groupQueue = shuffle(groups.filter((group) => !selectedGroups.includes(group)), random)
      }

      const group = groupQueue.shift()
      if (!group || selectedGroups.includes(group)) continue
      selectedGroups.push(group)
    }

    const selectedPairs = selectedGroups.map((group) => {
      let pairQueue = pairQueues.get(group)!
      if (pairQueue.length === 0) {
        pairQueue = shuffle(group, random)
        pairQueues.set(group, pairQueue)
      }
      const [pair, ...remainingPairs] = pairQueue
      pairQueues.set(group, remainingPairs)
      return pair!
    })
    const pairs = shuffle(selectedPairs, random)
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
