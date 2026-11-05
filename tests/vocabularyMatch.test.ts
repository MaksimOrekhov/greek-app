import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { createMemoryHistory, createRouter } from 'vue-router'
import { trainerRoutes } from '../src/data/trainers/routes.ts'
import { words } from '../src/data/words.ts'
import {
  advanceTrainerSession,
  createTrainerSession,
  getTrainerSessionResults,
  submitTrainerMatch,
} from '../src/lib/trainers/session.ts'
import {
  adaptWordsToTrainerPairs,
  areVocabularyPairsAmbiguous,
  selectVocabularyMatchPairs,
  VOCABULARY_MATCH_CONFLICT_GROUPS,
  VOCABULARY_MATCH_SESSION_PAIR_COUNT,
} from '../src/lib/trainers/vocabularyMatch.ts'
import {
  completeVocabularyMatchCycleItems,
  createVocabularyMatchHistory,
  loadVocabularyMatchHistory,
  reconcileVocabularyMatchHistory,
  saveVocabularyMatchHistory,
  VOCABULARY_MATCH_HISTORY_KEY,
} from '../src/lib/trainers/vocabularyMatchHistory.ts'
import type { TrainerPair } from '../src/data/trainers/types.ts'
import type { WordCard } from '../src/data/words.ts'

function seededRandom(seed: number): () => number {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

function normalize(value: string): string {
  return value.normalize('NFKC').trim().toLocaleLowerCase('ru').replace(/ё/g, 'е').replace(/\s+/g, ' ')
}

// Independent reference cases: the generator's own conflict table is not used
// to validate session pairings.
const reviewedConflicts: readonly (readonly string[])[] = [
  ['καλά', 'εντάξει'],
  ['στο', 'στην'],
  ['είστε', 'είσαστε'],
  ['ώρα', 'καιρός', 'χρόνος'],
  ['μα', 'αλλά'],
  ['χάρτης', 'κάρτα'],
  ['λέω', 'μιλάω'],
  ['κινηματογράφος', 'σινεμά'],
]

function independentlyAmbiguous(left: TrainerPair, right: TrainerPair): boolean {
  return normalize(left.prompt) === normalize(right.prompt)
    || normalize(left.answer) === normalize(right.answer)
    || reviewedConflicts.some((group) => group.includes(left.answer) && group.includes(right.answer))
}

function completeSession(session: ReturnType<typeof createTrainerSession>) {
  let current = session
  for (let roundIndex = 0; roundIndex < current.rounds.length; roundIndex += 1) {
    const round = current.rounds[current.currentRoundIndex]!
    for (const pair of round.pairs) current = submitTrainerMatch(current, pair.id, pair.id).session
    current = advanceTrainerSession(current)
  }
  return current
}

function syntheticWord(greek: string, russian: string): WordCard {
  return { greek, russian, transliteration: 'не используется', category: 'Тест', partOfSpeech: ['noun'], examples: [] }
}

test('the vocabulary pool is adapted directly from all valid dictionary records', () => {
  const pairs = adaptWordsToTrainerPairs(words)
  assert.equal(pairs.length, words.filter((word) => word.greek.trim() && word.russian.trim()).length)
  assert.equal(pairs.length, words.length)
  assert.deepEqual(pairs[0], { id: `dictionary:${words[0]!.greek}`, prompt: words[0]!.russian, answer: words[0]!.greek })
  assert.equal(new Set(pairs.map((pair) => pair.id)).size, pairs.length)
  assert.deepEqual(adaptWordsToTrainerPairs([syntheticWord('γειά', 'привет')]), [
    { id: 'dictionary:γειά', prompt: 'привет', answer: 'γειά' },
  ])
  assert.deepEqual(adaptWordsToTrainerPairs([syntheticWord('γειά', 'привет')]), adaptWordsToTrainerPairs([syntheticWord('γειά', 'привет')]))
})

test('only a small ambiguity layer blocks reviewed synonyms and exact duplicate labels', () => {
  assert.deepEqual(VOCABULARY_MATCH_CONFLICT_GROUPS, reviewedConflicts)
  assert.equal(VOCABULARY_MATCH_CONFLICT_GROUPS.flat().length, 17)
  for (const group of reviewedConflicts) {
    const groupPairs = adaptWordsToTrainerPairs(words).filter((pair) => group.includes(pair.answer))
    assert.equal(groupPairs.length, group.length)
    for (let leftIndex = 0; leftIndex < groupPairs.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < groupPairs.length; rightIndex += 1) {
        assert.equal(areVocabularyPairsAmbiguous(groupPairs[leftIndex]!, groupPairs[rightIndex]!), true)
      }
    }
  }

  assert.equal(areVocabularyPairsAmbiguous(
    { id: 'same-russian-1', prompt: 'Добро   утро', answer: 'α' },
    { id: 'same-russian-2', prompt: 'добро утро', answer: 'β' },
  ), true)
  assert.equal(areVocabularyPairsAmbiguous(
    { id: 'context-a', prompt: 'быть (он / она / оно / они)', answer: 'είναι' },
    { id: 'context-b', prompt: 'он', answer: 'αυτός' },
  ), false)
})

test('each generated session has five rounds of four different, unambiguous pairs', () => {
  const pairs = adaptWordsToTrainerPairs(words)
  const history = createVocabularyMatchHistory(pairs.map((pair) => pair.id), seededRandom(19))
  const selected = selectVocabularyMatchPairs(pairs, history, seededRandom(42))
  const session = createTrainerSession('vocabulary-match', selected, seededRandom(501))
  assert.equal(selected.length, VOCABULARY_MATCH_SESSION_PAIR_COUNT)
  assert.equal(session.rounds.length, 5)

  const sessionPairs = session.rounds.flatMap((round) => round.pairs)
  assert.equal(sessionPairs.length, 20)
  assert.equal(new Set(sessionPairs.map((pair) => pair.id)).size, 20)
  for (const round of session.rounds) {
    assert.equal(round.pairs.length, 4)
    assert.equal(new Set(round.pairs.map((pair) => normalize(pair.prompt))).size, 4)
    assert.equal(new Set(round.pairs.map((pair) => normalize(pair.answer))).size, 4)
    for (let leftIndex = 0; leftIndex < round.pairs.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < round.pairs.length; rightIndex += 1) {
        assert.equal(independentlyAmbiguous(round.pairs[leftIndex]!, round.pairs[rightIndex]!), false)
      }
    }
  }
})

test('the shared T1 engine accepts correct pairs, rejects wrong pairs and reports accurate results', () => {
  const pairs = selectVocabularyMatchPairs(
    adaptWordsToTrainerPairs(words),
    createVocabularyMatchHistory(adaptWordsToTrainerPairs(words).map((pair) => pair.id), seededRandom(3)),
    seededRandom(4),
  )
  let session = createTrainerSession('vocabulary-match', pairs, seededRandom(5))
  const firstRound = session.rounds[0]!
  const [first, second] = firstRound.pairs
  assert.ok(first && second)
  const wrong = submitTrainerMatch(session, first.id, second.id)
  assert.equal(wrong.outcome, 'incorrect')
  assert.equal(wrong.session.rounds[0]!.errors, 1)
  session = wrong.session
  session = completeSession(session)
  assert.equal(session.completed, true)
  assert.deepEqual(getTrainerSessionResults(session), {
    completedRounds: 5,
    totalRounds: 5,
    foundPairs: 20,
    totalPairs: 20,
    errors: 1,
    firstTryCorrect: 18,
  })
})

test('completed sessions rotate through every dictionary entry before a new cycle', () => {
  const pairs = adaptWordsToTrainerPairs(words)
  const pairIds = pairs.map((pair) => pair.id)
  let history = createVocabularyMatchHistory(pairIds, seededRandom(100))
  const visited = new Set<string>()
  let sessionCount = 0

  while (visited.size < pairs.length && sessionCount < 30) {
    const selected = selectVocabularyMatchPairs(pairs, history, seededRandom(1000 + sessionCount))
    const session = createTrainerSession('vocabulary-match', selected, seededRandom(2000 + sessionCount))
    const completedIds = session.rounds.flatMap((round) => round.pairs.map((pair) => pair.id))
    assert.equal(new Set(completedIds).size, 20)
    for (const id of completedIds) visited.add(id)
    history = completeVocabularyMatchCycleItems(history, completedIds, pairIds, seededRandom(3000 + sessionCount))
    sessionCount += 1
  }

  assert.equal(visited.size, pairs.length)
  assert.ok(sessionCount <= Math.ceil(pairs.length / 20) + 2)
})

test('history reconciles added and removed words and tolerates invalid or inaccessible storage', () => {
  const originalIds = ['dictionary:α', 'dictionary:β', 'dictionary:γ']
  const original = createVocabularyMatchHistory(originalIds, seededRandom(7))
  const partiallyCompleted = completeVocabularyMatchCycleItems(original, ['dictionary:α'], originalIds, seededRandom(8))
  const changed = reconcileVocabularyMatchHistory(
    partiallyCompleted,
    ['dictionary:α', 'dictionary:γ', 'dictionary:νέο'],
    seededRandom(9),
  )
  assert.equal(changed.order.length, 3)
  assert.ok(changed.order.includes('dictionary:νέο'))
  assert.ok(!changed.order.includes('dictionary:β'))
  assert.deepEqual(changed.completedIds, ['dictionary:α'])

  const corrupt = loadVocabularyMatchHistory(originalIds, seededRandom(10), {
    getItem: () => '{broken json',
    setItem: () => undefined,
  })
  assert.equal(corrupt.order.length, originalIds.length)
  const inaccessible = loadVocabularyMatchHistory(originalIds, seededRandom(11), {
    getItem: () => { throw new Error('storage denied') },
    setItem: () => { throw new Error('storage denied') },
  })
  assert.equal(inaccessible.order.length, originalIds.length)
  assert.doesNotThrow(() => saveVocabularyMatchHistory(inaccessible, {
    getItem: () => null,
    setItem: () => { throw new Error('quota exceeded') },
  }))
})

test('history is persisted under its own versioned key only after a session is completed', () => {
  const ids = ['dictionary:α', 'dictionary:β']
  const storage = new Map<string, string>()
  const browserStorage = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => { storage.set(key, value) },
  }
  const history = loadVocabularyMatchHistory(ids, seededRandom(20), browserStorage)
  assert.equal(storage.size, 0)
  const completed = completeVocabularyMatchCycleItems(history, ['dictionary:α'], ids, seededRandom(21))
  saveVocabularyMatchHistory(completed, browserStorage)
  assert.ok(storage.has(VOCABULARY_MATCH_HISTORY_KEY))
  const restored = loadVocabularyMatchHistory(ids, seededRandom(22), browserStorage)
  assert.deepEqual(restored.completedIds, ['dictionary:α'])
})

test('a small dictionary gives finite rounds and starts a new cycle after all its words are completed', () => {
  const smallPairs = [
    { id: 'dictionary:α', prompt: 'альфа', answer: 'α' },
    { id: 'dictionary:β', prompt: 'бета', answer: 'β' },
    { id: 'dictionary:γ', prompt: 'гамма', answer: 'γ' },
  ]
  const history = createVocabularyMatchHistory(smallPairs.map((pair) => pair.id), seededRandom(30))
  const selected = selectVocabularyMatchPairs(smallPairs, history, seededRandom(31))
  const session = createTrainerSession('vocabulary-match', selected, seededRandom(32))
  assert.equal(selected.length, 3)
  assert.equal(session.rounds.length, 5)
  assert.ok(session.rounds.every((round) => round.pairs.length === 3))
  const completed = completeVocabularyMatchCycleItems(history, selected.map((pair) => pair.id), selected.map((pair) => pair.id), seededRandom(33))
  assert.equal(completed.cycle, history.cycle + 1)
  assert.deepEqual(completed.completedIds, [])
})

test('the dedicated route resolves outside the ordinary topic route and the page keeps both columns separate', async () => {
  const router = createRouter({ history: createMemoryHistory(), routes: trainerRoutes })
  assert.equal(router.resolve('/trainers/vocabulary/match-pairs').name, 'trainer-vocabulary-match-pairs')
  assert.equal(trainerRoutes.filter((route) => route.path === '/trainers/:topicId').length, 1)

  const page = await readFile(new URL('../src/pages/TrainerVocabularyMatchPage.vue', import.meta.url), 'utf8')
  const exercise = await readFile(new URL('../src/components/trainers/MatchPairsExercise.vue', import.meta.url), 'utf8')
  const results = await readFile(new URL('../src/components/trainers/TrainerSessionResults.vue', import.meta.url), 'utf8')
  const catalog = await readFile(new URL('../src/pages/TrainersPage.vue', import.meta.url), 'utf8')
  assert.match(page, /MatchPairsExercise/)
  assert.match(page, /currentRound\.leftOrder/)
  assert.match(page, /currentRound\.rightOrder/)
  assert.doesNotMatch(page, /transliteration/i)
  assert.match(exercise, /role="group" aria-label="Подсказки"/)
  assert.match(exercise, /aria-label="Ответы на греческом"/)
  assert.match(exercise, /@media \(max-width: 460px\)/)
  assert.match(exercise, /prefers-reduced-motion: reduce/)
  assert.match(exercise, /defineExpose\(\{ focusFirstAvailable \}\)/)
  assert.match(exercise, /emit\('roundComplete'\)/)
  assert.match(results, /tabindex="-1"/)
  assert.match(results, /resultTitle\.value\?\.focus\(\)/)
  assert.match(catalog, /Тренировка словаря/)
  assert.match(catalog, /Начать тренировку/)
})
