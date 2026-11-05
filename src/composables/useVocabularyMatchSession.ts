import { computed, shallowRef } from 'vue'
import { words } from '../data/words.ts'
import type { TrainerTopic } from '../data/trainers/types.ts'
import {
  advanceTrainerSession,
  createTrainerSession,
  getTrainerSessionResults,
  submitTrainerMatch,
} from '../lib/trainers/session.ts'
import type { TrainerSession } from '../lib/trainers/session.ts'
import { adaptWordsToTrainerPairs, selectVocabularyMatchPairs } from '../lib/trainers/vocabularyMatch.ts'
import {
  completeVocabularyMatchCycleItems,
  loadVocabularyMatchHistory,
  saveVocabularyMatchHistory,
} from '../lib/trainers/vocabularyMatchHistory.ts'
import type { VocabularyMatchHistory } from '../lib/trainers/vocabularyMatchHistory.ts'

export const vocabularyMatchTopic: TrainerTopic = {
  id: 'vocabulary-match',
  title: 'Соедини пары: весь словарь',
  description: 'Находите соответствия между греческими словами и русскими переводами.',
  pairSetId: 'vocabulary-match',
  availableExercises: ['match-pairs'],
}

const dictionaryPairs = adaptWordsToTrainerPairs(words)
const dictionaryPairIds = dictionaryPairs.map((pair) => pair.id)

function getLocalStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}

export function useVocabularyMatchSession() {
  const storage = getLocalStorage()
  const history = shallowRef<VocabularyMatchHistory>(loadVocabularyMatchHistory(dictionaryPairIds, Math.random, storage))
  const session = shallowRef<TrainerSession | null>(null)
  const sessionVersion = shallowRef(0)
  const activePairIds = shallowRef<string[]>([])
  const currentRound = computed(() => {
    const currentSession = session.value
    return currentSession?.rounds[currentSession.currentRoundIndex] ?? null
  })
  const results = computed(() => session.value ? getTrainerSessionResults(session.value) : null)
  const roundKey = computed(() => `${sessionVersion.value}:${session.value?.currentRoundIndex ?? 0}`)

  function start(avoidIds: ReadonlySet<string> = new Set()): void {
    saveVocabularyMatchHistory(history.value, storage)
    const pairs = selectVocabularyMatchPairs(dictionaryPairs, history.value, Math.random, undefined, avoidIds)
    const next = createTrainerSession(vocabularyMatchTopic.id, pairs, Math.random, session.value ?? undefined)
    session.value = next
    activePairIds.value = [...new Set(next.rounds.flatMap((round) => round.pairs.map((pair) => pair.id)))]
    sessionVersion.value += 1
  }

  function attempt(leftPairId: string, rightPairId: string): void {
    const current = session.value
    if (!current) return
    session.value = submitTrainerMatch(current, leftPairId, rightPairId).session
  }

  function advance(): void {
    const current = session.value
    if (!current) return
    const next = advanceTrainerSession(current)
    session.value = next
    if (!current.completed && next.completed) {
      history.value = completeVocabularyMatchCycleItems(
        history.value,
        activePairIds.value,
        dictionaryPairIds,
      )
      saveVocabularyMatchHistory(history.value, storage)
    }
  }

  function restart(): void {
    start(new Set(activePairIds.value))
  }

  return { session, currentRound, results, roundKey, start, attempt, advance, restart }
}
