import { computed, shallowRef } from 'vue'
import { getTrainerPairSet, getTrainerTopic } from '../data/trainers/topics.ts'
import {
  advanceTrainerSession,
  createTrainerSession,
  getTrainerSessionResults,
  submitTrainerMatch,
  type MatchAttemptOutcome,
  type TrainerSession,
} from '../lib/trainers/session.ts'

export function useTrainerSession() {
  const session = shallowRef<TrainerSession | null>(null)
  const runNumber = shallowRef(0)
  const currentRound = computed(() => {
    const current = session.value
    return current ? current.rounds[current.currentRoundIndex] ?? null : null
  })
  const results = computed(() => session.value ? getTrainerSessionResults(session.value) : null)
  const roundKey = computed(() => `${runNumber.value}:${session.value?.currentRoundIndex ?? -1}`)

  function start(topicId: string): boolean {
    const topic = getTrainerTopic(topicId)
    const pairSet = topic ? getTrainerPairSet(topic) : undefined
    if (!topic || !pairSet) {
      session.value = null
      runNumber.value += 1
      return false
    }

    const previous = session.value?.topicId === topicId ? session.value : undefined
    session.value = createTrainerSession(topicId, pairSet.pairs, Math.random, previous)
    runNumber.value += 1
    return true
  }

  function attempt(leftPairId: string, rightPairId: string): MatchAttemptOutcome {
    if (!session.value) return 'invalid'
    const result = submitTrainerMatch(session.value, leftPairId, rightPairId)
    session.value = result.session
    return result.outcome
  }

  function advance(): void {
    if (session.value) session.value = advanceTrainerSession(session.value)
  }

  function restart(): boolean {
    return session.value ? start(session.value.topicId) : false
  }

  return { session, currentRound, results, roundKey, start, attempt, advance, restart }
}
