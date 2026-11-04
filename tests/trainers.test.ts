import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createMemoryHistory, createRouter } from 'vue-router'
import { trainerPairSets } from '../src/data/trainers/pairSets.ts'
import { getTrainerTopic, trainerTopics, validateTrainerRegistry } from '../src/data/trainers/topics.ts'
import { trainerRoutes } from '../src/data/trainers/routes.ts'
import {
  advanceTrainerSession,
  createTrainerSession,
  getTrainerSessionResults,
  submitTrainerMatch,
} from '../src/lib/trainers/session.ts'

function seededRandom(seed: number): () => number {
  let value = seed
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296
    return value / 4294967296
  }
}

function completeCurrentRound(session: ReturnType<typeof createTrainerSession>) {
  let current = session
  for (const pair of current.rounds[current.currentRoundIndex]!.pairs) {
    current = submitTrainerMatch(current, pair.id, pair.id).session
  }
  return current
}

function assertRoundHasUniquePromptsAndAnswers(round: ReturnType<typeof createTrainerSession>['rounds'][number]) {
  assert.equal(new Set(round.pairs.map((pair) => pair.prompt.trim())).size, round.pairs.length)
  assert.equal(new Set(round.pairs.map((pair) => pair.answer.trim())).size, round.pairs.length)
}

test('four trainer topics and all their pair sets are registered', () => {
  assert.deepEqual(validateTrainerRegistry(), [])
  assert.deepEqual(trainerTopics.map((topic) => topic.id), [
    'personal-pronouns',
    'personal-pronouns-genitive',
    'verb-eimai',
    'numbers',
  ])
  assert.deepEqual(trainerTopics.map((topic) => topic.availableExercises), [
    ['match-pairs', 'multi-select'], ['match-pairs', 'multi-select'], ['match-pairs', 'multi-select'], ['match-pairs', 'multi-select'],
  ])
  assert.equal(trainerPairSets['personal-pronouns']?.pairs.length, 10)
  assert.equal(trainerPairSets['personal-pronouns-genitive']?.pairs.length, 7)
  assert.equal(trainerPairSets['verb-eimai']?.pairs.length, 6)
  assert.equal(trainerPairSets.numbers?.pairs.length, 20)
  assert.deepEqual(trainerPairSets['personal-pronouns']?.pairs.map((pair) => pair.answer), [
    'εγώ', 'εσύ', 'αυτός', 'αυτή', 'αυτό', 'εμείς', 'εσείς', 'αυτοί', 'αυτές', 'αυτά',
  ])
  assert.deepEqual(trainerPairSets['personal-pronouns-genitive']?.pairs.map((pair) => pair.answer), [
    'μου', 'σου', 'του', 'της', 'μας', 'σας', 'τους',
  ])
  assert.deepEqual(trainerPairSets['personal-pronouns-genitive']?.pairs.map((pair) => pair.prompt), [
    'мой', 'твой', 'его', 'её', 'наш', 'ваш', 'их',
  ])
  assert.deepEqual(trainerPairSets['verb-eimai']?.pairs.map((pair) => pair.answer), [
    'είμαι', 'είσαι', 'είναι', 'είμαστε', 'είστε', 'είναι',
  ])
  assert.deepEqual(
    trainerPairSets.numbers?.pairs.filter((pair) => ['12', '40', '73', '125'].includes(pair.prompt)).map((pair) => [pair.prompt, pair.answer]),
    [['12', 'δώδεκα'], ['40', 'σαράντα'], ['73', 'εβδομήντα τρία'], ['125', 'εκατόν είκοσι πέντε']],
  )
  assert.ok(trainerPairSets.numbers?.pairs.every((pair) => Number(pair.prompt) >= 0 && Number(pair.prompt) <= 200))
  assert.ok(getTrainerTopic('numbers'))
  assert.equal(getTrainerTopic('not-a-topic'), undefined)
})

test('every generated round has up to four compatible pairs with unique prompts and answers', () => {
  for (const topic of trainerTopics) {
    const pairSet = trainerPairSets[topic.pairSetId]!
    const session = createTrainerSession(topic.id, pairSet.pairs, seededRandom(17))
    assert.equal(session.rounds.length, 5)

    for (const round of session.rounds) {
      assert.equal(round.pairs.length, 4)
      assertRoundHasUniquePromptsAndAnswers(round)
      assert.equal(new Set(round.pairs.map((pair) => pair.id)).size, round.pairs.length)
      assert.deepEqual(new Set(round.leftOrder), new Set(round.pairs.map((pair) => pair.id)))
      assert.deepEqual(new Set(round.rightOrder), new Set(round.pairs.map((pair) => pair.id)))
      for (const pair of round.pairs) {
        assert.deepEqual(pairSet.pairs.find((candidate) => candidate.id === pair.id), pair)
      }
    }
  }

  const numbers = createTrainerSession('numbers', trainerPairSets.numbers!.pairs, seededRandom(42))
  const usedNumbers = numbers.rounds.flatMap((round) => round.pairs.map((pair) => pair.id))
  assert.equal(usedNumbers.length, 20)
  assert.equal(new Set(usedNumbers).size, 20)
})

test('repeated prompts are separated across rounds while both choices remain usable', () => {
  const pairs = [
    { id: 'you-pronoun', prompt: 'Вы', answer: 'εσείς' },
    { id: 'you-verb', prompt: 'Вы', answer: 'είστε' },
  ]
  const session = createTrainerSession('same-prompt', pairs, seededRandom(12))

  assert.equal(session.rounds.length, 5)
  assert.ok(session.rounds.every((round) => round.pairs.length === 1))
  session.rounds.forEach(assertRoundHasUniquePromptsAndAnswers)
  assert.deepEqual(new Set(session.rounds.flatMap((round) => round.pairs.map((pair) => pair.id))), new Set(pairs.map((pair) => pair.id)))
})

test('repeated answers are separated across rounds while both prompts remain usable', () => {
  const pairs = [
    { id: 'he-is', prompt: 'Он', answer: 'είναι' },
    { id: 'they-are', prompt: 'Они', answer: 'είναι' },
  ]
  const session = createTrainerSession('same-answer', pairs, seededRandom(19))

  assert.equal(session.rounds.length, 5)
  assert.ok(session.rounds.every((round) => round.pairs.length === 1))
  session.rounds.forEach(assertRoundHasUniquePromptsAndAnswers)
  assert.deepEqual(new Set(session.rounds.flatMap((round) => round.pairs.map((pair) => pair.id))), new Set(pairs.map((pair) => pair.id)))
})

test('augmenting matches avoid greedy losses when prompt and answer conflicts overlap', () => {
  const pairs = [
    { id: 'a-x', prompt: 'A', answer: 'X' },
    { id: 'a-y', prompt: 'A', answer: 'Y' },
    { id: 'b-x', prompt: 'B', answer: 'X' },
    { id: 'c-z', prompt: 'C', answer: 'Z' },
  ]
  for (let seed = 0; seed < 20; seed += 1) {
    const session = createTrainerSession('overlapping-conflicts', pairs, seededRandom(seed))
    assert.equal(session.rounds.length, 5)
    for (const round of session.rounds) {
      assert.equal(round.pairs.length, 3)
      assertRoundHasUniquePromptsAndAnswers(round)
      assert.ok(round.pairs.every((pair) => pairs.some((sourcePair) => sourcePair.id === pair.id)))
    }
  }
})

test('small compatible sets make five finite rounds and reuse pairs when needed', () => {
  const pairs = [
    { id: 'one', prompt: 'A', answer: 'X' },
    { id: 'two', prompt: 'B', answer: 'Y' },
  ]
  const session = createTrainerSession('small-compatible-set', pairs, seededRandom(7))

  assert.equal(session.rounds.length, 5)
  assert.ok(session.rounds.every((round) => round.pairs.length === 2))
  session.rounds.forEach(assertRoundHasUniquePromptsAndAnswers)
  assert.equal(session.rounds.flatMap((round) => round.pairs).length, 10)
})

test('registry allows repeated prompts and answers but checks pair-set identity', () => {
  const topic = { ...trainerTopics[0]!, id: 'repeat-test', pairSetId: 'repeat-test' }
  const pairSet = {
    id: 'repeat-test',
    pairs: [
      { id: 'same-prompt-one', prompt: 'Вы', answer: 'εσείς' },
      { id: 'same-prompt-two', prompt: 'Вы', answer: 'είστε' },
      { id: 'same-answer-one', prompt: 'Он', answer: 'είναι' },
      { id: 'same-answer', prompt: 'Они', answer: 'είναι' },
    ],
  }

  assert.deepEqual(validateTrainerRegistry([topic], { 'repeat-test': pairSet }), [])
  assert.ok(validateTrainerRegistry([topic], { 'repeat-test': { ...pairSet, id: 'wrong-id' } })
    .some((error) => error.includes('не совпадает')))
})

test('session shuffle changes ordering on restart without changing pair answers', () => {
  const pairSet = trainerPairSets['personal-pronouns']!
  const first = createTrainerSession('personal-pronouns', pairSet.pairs, seededRandom(5))
  const restarted = createTrainerSession('personal-pronouns', pairSet.pairs, seededRandom(5), first)
  const ordering = (session: typeof first) => session.rounds.map((round) => [round.leftOrder, round.rightOrder])
  assert.notDeepEqual(ordering(restarted), ordering(first))

  const expected = new Map(pairSet.pairs.map((pair) => [pair.id, pair.answer]))
  for (const round of restarted.rounds) {
    for (const pair of round.pairs) assert.equal(expected.get(pair.id), pair.answer)
  }
})

test('wrong matches count as errors, correct matches lock, and found pairs cannot be answered again', () => {
  const session = createTrainerSession('personal-pronouns', trainerPairSets['personal-pronouns']!.pairs, seededRandom(31))
  const [first, second] = session.rounds[0]!.pairs
  assert.ok(first && second)

  const wrong = submitTrainerMatch(session, first.id, second.id)
  assert.equal(wrong.outcome, 'incorrect')
  assert.equal(wrong.session.rounds[0]!.errors, 1)
  assert.equal(wrong.session.rounds[0]!.completed, false)

  const correctFirst = submitTrainerMatch(wrong.session, first.id, first.id)
  assert.equal(correctFirst.outcome, 'correct')
  assert.equal(correctFirst.session.rounds[0]!.firstTryCorrect, 0)
  assert.deepEqual(correctFirst.session.rounds[0]!.foundPairIds, [first.id])

  const duplicate = submitTrainerMatch(correctFirst.session, first.id, first.id)
  assert.equal(duplicate.outcome, 'already-found')
  assert.equal(duplicate.session, correctFirst.session)
  assert.equal(submitTrainerMatch(session, 'missing', second.id).outcome, 'invalid')

  const cleanFirstTry = submitTrainerMatch(correctFirst.session, second.id, second.id)
  assert.equal(cleanFirstTry.session.rounds[0]!.firstTryCorrect, 0)
  let fullyCompleted = cleanFirstTry.session
  for (const pair of fullyCompleted.rounds[0]!.pairs.slice(2)) {
    fullyCompleted = submitTrainerMatch(fullyCompleted, pair.id, pair.id).session
  }
  assert.equal(fullyCompleted.rounds[0]!.firstTryCorrect, fullyCompleted.rounds[0]!.pairs.length - 2)
})

test('rounds cannot be skipped; completed rounds advance exactly once', () => {
  const onePair = [{ id: 'only', prompt: 'один', answer: 'ένα' }]
  const session = createTrainerSession('small', onePair, seededRandom(3))
  assert.equal(advanceTrainerSession(session), session)

  const completed = submitTrainerMatch(session, 'only', 'only').session
  assert.equal(completed.rounds[0]!.completed, true)
  const next = advanceTrainerSession(completed)
  assert.equal(next.currentRoundIndex, 1)
  assert.equal(advanceTrainerSession(next), next)
  assert.equal(submitTrainerMatch(completed, 'only', 'only').outcome, 'already-found')
})

test('session ends after five completed rounds and reports attempts and first-try accuracy', () => {
  let session = createTrainerSession('small', [{ id: 'only', prompt: 'один', answer: 'ένα' }], seededRandom(3))
  for (let index = 0; index < 5; index += 1) {
    session = completeCurrentRound(session)
    session = advanceTrainerSession(session)
  }

  assert.equal(session.completed, true)
  assert.equal(advanceTrainerSession(session), session)
  assert.equal(submitTrainerMatch(session, 'only', 'only').outcome, 'session-completed')
  assert.deepEqual(getTrainerSessionResults(session), {
    completedRounds: 5,
    totalRounds: 5,
    foundPairs: 5,
    totalPairs: 5,
    errors: 0,
    firstTryCorrect: 5,
  })
})

test('restarting clears round progress and changes the pair ordering', () => {
  const pairSet = trainerPairSets['personal-pronouns']!
  const started = createTrainerSession('personal-pronouns', pairSet.pairs, seededRandom(9))
  const [first, second] = started.rounds[0]!.pairs
  assert.ok(first && second)
  const inProgress = submitTrainerMatch(started, first.id, second.id).session
  assert.equal(inProgress.rounds[0]!.errors, 1)
  const restarted = createTrainerSession('personal-pronouns', pairSet.pairs, seededRandom(9), inProgress)

  assert.equal(restarted.currentRoundIndex, 0)
  assert.equal(restarted.completed, false)
  assert.ok(restarted.rounds.every((round) => !round.completed && round.errors === 0 && round.firstTryCorrect === 0 && round.foundPairIds.length === 0))
  assert.notDeepEqual(
    restarted.rounds.map((round) => [round.leftOrder, round.rightOrder]),
    started.rounds.map((round) => [round.leftOrder, round.rightOrder]),
  )
})

test('empty data is rejected and insufficient unique answers repeat without ambiguity', () => {
  assert.throws(() => createTrainerSession('empty', [], seededRandom(1)), /нет заданий/)
  const limited = createTrainerSession('limited', [
    { id: 'one-a', prompt: 'первый вариант', answer: 'ένα' },
    { id: 'one-b', prompt: 'второй вариант', answer: 'ένα' },
  ], seededRandom(2))
  assert.equal(limited.rounds.length, 5)
  assert.ok(limited.rounds.every((round) => round.pairs.length === 1))
  assert.ok(limited.rounds.every((round) => new Set(round.pairs.map((pair) => pair.answer)).size === round.pairs.length))
})

test('trainer routes resolve the catalog and a session using hash-compatible paths', async () => {
  const router = createRouter({ history: createMemoryHistory(), routes: trainerRoutes })
  const catalogRoute = router.resolve('/trainers')
  assert.equal(catalogRoute.name, 'trainers')
  const sessionRoute = router.resolve('/trainers/personal-pronouns')
  assert.equal(sessionRoute.name, 'trainer-session')
  assert.equal(sessionRoute.params.topicId, 'personal-pronouns')
  const multiSelectRoute = router.resolve('/trainers/personal-pronouns/multi-select')
  assert.equal(multiSelectRoute.name, 'trainer-multi-select')
  assert.equal(multiSelectRoute.params.topicId, 'personal-pronouns')

  const app = await readFile('src/App.vue', 'utf8')
  assert.match(app, /to="\/trainers"[^>]*>.*Тренажёры/s)
  const routerSource = await readFile('src/router.ts', 'utf8')
  assert.match(routerSource, /\.\.\.trainerRoutes/)
})

test('matching controls remain button-based and include screen-reader selection states', async () => {
  const component = await readFile('src/components/trainers/MatchPairsExercise.vue', 'utf8')
  assert.doesNotMatch(component, /<(?:input|textarea)\b/i)
  assert.match(component, /type="button"/)
  assert.match(component, /aria-pressed=/)
  assert.match(component, /role="status"/)
  assert.doesNotMatch(component, /Найдено/)
  assert.match(component, /errorLeftId\.value = leftPairId/)
  assert.match(component, /errorRightId\.value = rightPairId/)
  assert.match(component, /'is-error': errorLeftId === pair\.id/)
  assert.match(component, /'is-error': errorRightId === pair\.id/)
  assert.match(component, /\.match-option\.is-error:hover:not\(:disabled\)/)
  assert.doesNotMatch(component, /errorIds/)
  assert.match(component, /prefers-reduced-motion/)
})
