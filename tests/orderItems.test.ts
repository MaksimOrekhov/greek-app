import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { VERIFIED_COUNTING_NUMBERS } from '../src/data/trainers/generation/verifiedContent.ts'
import { orderItemsQuestions } from '../src/data/trainers/orderItemsQuestions.ts'
import { VERIFIED_ORDER_PRICES } from '../src/data/trainers/orderItemsContent.ts'
import { getTrainerTopic, trainerTopics } from '../src/data/trainers/topics.ts'
import { trainerRoutes } from '../src/data/trainers/routes.ts'
import {
  ORDER_ITEMS_HISTORY_LIMIT,
  ORDER_ITEMS_HISTORY_STORAGE_KEY,
  ORDER_ITEMS_HISTORY_VERSION,
  loadRecentOrderItemsHistory,
  rememberOrderItemsQuestions,
  type OrderItemsHistoryStorage,
  type RecentOrderItemsHistory,
} from '../src/lib/trainers/orderItems/orderItemsHistory.ts'
import {
  getOrderItemsCorrectOrder,
  isOrderItemsOrderCorrect,
  orderItemsQuestionSignature,
  orderItemsValueSetSignature,
  formatOrderItemsValue,
  type OrderItemsQuestion,
  type OrderItemsTemplateId,
} from '../src/lib/trainers/orderItems/orderItems.ts'
import {
  generateOrderItemsQuestion,
  generateOrderItemsQuestionSet,
  ORDER_ITEMS_FIXED_PER_SESSION,
  ORDER_ITEMS_GENERATED_PER_SESSION,
  ORDER_ITEMS_SESSION_QUESTION_COUNT,
} from '../src/lib/trainers/orderItems/orderItemsGenerator.ts'
import {
  advanceOrderItemsSession,
  checkOrderItemsAnswer,
  createOrderItemsSession,
  getOrderItemsSessionQuestions,
  getOrderItemsSessionResults,
  removeOrderItemsCard,
  resetOrderItemsAnswer,
  selectOrderItemsCard,
  type OrderItemsSession,
} from '../src/lib/trainers/orderItems/orderItemsSession.ts'

const REFERENCE_NUMBER_WORDS: Array<{ value: number; greek: string }> = [
  { value: 0, greek: 'μηδέν' }, { value: 1, greek: 'ένα' }, { value: 2, greek: 'δύο' },
  { value: 3, greek: 'τρία' }, { value: 4, greek: 'τέσσερα' }, { value: 5, greek: 'πέντε' },
  { value: 6, greek: 'έξι' }, { value: 7, greek: 'επτά' }, { value: 8, greek: 'οκτώ' },
  { value: 9, greek: 'εννέα' }, { value: 10, greek: 'δέκα' }, { value: 11, greek: 'έντεκα' },
  { value: 12, greek: 'δώδεκα' }, { value: 13, greek: 'δεκατρία' }, { value: 14, greek: 'δεκατέσσερα' },
  { value: 15, greek: 'δεκαπέντε' }, { value: 16, greek: 'δεκαέξι' }, { value: 17, greek: 'δεκαεπτά' },
  { value: 18, greek: 'δεκαοκτώ' }, { value: 19, greek: 'δεκαεννέα' }, { value: 20, greek: 'είκοσι' },
  { value: 21, greek: 'είκοσι ένα' }, { value: 22, greek: 'είκοσι δύο' }, { value: 23, greek: 'είκοσι τρία' },
  { value: 24, greek: 'είκοσι τέσσερα' }, { value: 25, greek: 'είκοσι πέντε' }, { value: 28, greek: 'είκοσι οκτώ' },
  { value: 30, greek: 'τριάντα' }, { value: 31, greek: 'τριάντα ένα' }, { value: 34, greek: 'τριάντα τέσσερα' },
  { value: 40, greek: 'σαράντα' }, { value: 43, greek: 'σαράντα τρία' }, { value: 50, greek: 'πενήντα' },
  { value: 53, greek: 'πενήντα τρία' }, { value: 60, greek: 'εξήντα' }, { value: 63, greek: 'εξήντα τρία' },
  { value: 70, greek: 'εβδομήντα' }, { value: 73, greek: 'εβδομήντα τρία' }, { value: 80, greek: 'ογδόντα' },
  { value: 83, greek: 'ογδόντα τρία' }, { value: 89, greek: 'ογδόντα εννέα' }, { value: 90, greek: 'ενενήντα' },
  { value: 94, greek: 'ενενήντα τέσσερα' }, { value: 100, greek: 'εκατό' }, { value: 101, greek: 'εκατόν ένα' },
  { value: 102, greek: 'εκατόν δύο' }, { value: 107, greek: 'εκατόν επτά' }, { value: 120, greek: 'εκατόν είκοσι' },
  { value: 125, greek: 'εκατόν είκοσι πέντε' }, { value: 140, greek: 'εκατόν σαράντα' },
  { value: 178, greek: 'εκατόν εβδομήντα οκτώ' }, { value: 199, greek: 'εκατόν ενενήντα εννέα' },
  { value: 200, greek: 'διακόσια' },
]

const REFERENCE_PRICES = [
  ['50-cent', 'πενήντα λεπτά', 50], ['60-cent', 'εξήντα λεπτά', 60], ['70-cent', 'εβδομήντα λεπτά', 70],
  ['80-cent', 'ογδόντα λεπτά', 80], ['90-cent', 'ενενήντα λεπτά', 90], ['100-cent', 'ένα ευρώ', 100],
  ['120-cent', 'ένα ευρώ και είκοσι λεπτά', 120], ['150-cent', 'ένα ευρώ και πενήντα λεπτά', 150],
  ['180-cent', 'ένα ευρώ και ογδόντα λεπτά', 180], ['200-cent', 'δύο ευρώ', 200],
  ['220-cent', 'δύο ευρώ και είκοσι λεπτά', 220], ['250-cent', 'δύο ευρώ και πενήντα λεπτά', 250],
  ['300-cent', 'τρία ευρώ', 300], ['350-cent', 'τρία ευρώ και πενήντα λεπτά', 350],
  ['400-cent', 'τέσσερα ευρώ', 400], ['450-cent', 'τέσσερα ευρώ και πενήντα λεπτά', 450], ['500-cent', 'πέντε ευρώ', 500],
] as const

function seededRandom(seed: number): () => number {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

function memoryStorage(initial?: string): OrderItemsHistoryStorage & { value: string | null } {
  return {
    value: initial ?? null,
    getItem() { return this.value },
    setItem(_key, value) { this.value = value },
  }
}

function permutations<T>(items: readonly T[]): T[][] {
  if (items.length <= 1) return [[...items]]
  return items.flatMap((item, index) => permutations([...items.slice(0, index), ...items.slice(index + 1)]).map((rest) => [item, ...rest]))
}

function emptyHistory(): RecentOrderItemsHistory {
  return { full: {}, situations: { numbers: [], prices: [] } }
}

function completeQuestion(session: OrderItemsSession): OrderItemsSession {
  const state = session.rounds[session.currentRoundIndex]!.questions[session.currentQuestionIndex]!
  let current = session
  for (const item of getOrderItemsCorrectOrder(state.question)) current = selectOrderItemsCard(current, item.id).session
  return checkOrderItemsAnswer(current).session
}

function assertQuestionValid(question: OrderItemsQuestion): void {
  assert.equal(question.items.length, 4)
  assert.equal(new Set(question.items.map((item) => item.id)).size, 4)
  assert.equal(new Set(question.items.map((item) => item.greek)).size, 4)
  assert.equal(new Set(question.items.map((item) => item.value)).size, 4)
  assert.ok(question.explanation.length > 0)
  assert.ok(question.items.every((item) => Number.isFinite(item.value)))
  const correctOrders = permutations(question.items.map((item) => item.id))
    .filter((order) => isOrderItemsOrderCorrect(question, order))
  assert.equal(correctOrders.length, 1)
}

test('fixed questions use independent checked number and price reference tables', () => {
  assert.deepEqual(VERIFIED_COUNTING_NUMBERS, REFERENCE_NUMBER_WORDS)
  assert.deepEqual(VERIFIED_ORDER_PRICES.map(({ id, greek, value }) => [id, greek, value]), REFERENCE_PRICES)
  assert.equal(VERIFIED_COUNTING_NUMBERS[0]?.value, 0)
  assert.equal(VERIFIED_COUNTING_NUMBERS.at(-1)?.value, 200)
  assert.ok(VERIFIED_COUNTING_NUMBERS.every(({ value }) => value >= 0 && value <= 200))
  assert.ok(VERIFIED_ORDER_PRICES.every(({ value }) => value >= 50 && value <= 500))

  assert.equal(orderItemsQuestions.length, 12)
  const expectedCounts = { ascending: 4, descending: 4, prices: 4 }
  for (const templateId of Object.keys(expectedCounts) as OrderItemsTemplateId[]) {
    const questions = orderItemsQuestions.filter((question) => question.templateId === templateId)
    assert.equal(questions.length, expectedCounts[templateId])
    for (const question of questions) assertQuestionValid(question)
  }

  for (const question of orderItemsQuestions) {
    const ordered = getOrderItemsCorrectOrder(question)
    for (const item of ordered) {
      assert.ok(question.explanation.includes(item.greek), `${question.id} explanation includes ${item.greek}`)
      assert.ok(question.explanation.includes(formatOrderItemsValue(item)), `${question.id} explanation includes ${formatOrderItemsValue(item)}`)
    }
  }
})

test('numeric verification sorts numbers by value rather than Greek spelling', () => {
  const question = orderItemsQuestions.find((item) => item.id === 'fixed-ascending-1')!
  assert.deepEqual(getOrderItemsCorrectOrder(question).map((item) => item.value), [5, 12, 21, 40])
  assert.equal(isOrderItemsOrderCorrect(question, ['number-5', 'number-12', 'number-21', 'number-40']), true)
  assert.equal(isOrderItemsOrderCorrect(question, ['number-12', 'number-21', 'number-5', 'number-40']), false)
  assert.equal(isOrderItemsOrderCorrect(question, ['number-5', 'number-5', 'number-21', 'number-40']), false)
})

test('each template generates deterministic, unique, checked questions across 200 seeds', () => {
  for (const templateId of ['ascending', 'descending', 'prices'] as const) {
    const full = new Set<string>()
    const situations = new Set<string>()
    let sawCloseNumbers = false
    let sawLowNumber = false
    let sawLargeNumber = false

    for (let seed = 0; seed < 200; seed += 1) {
      const question = generateOrderItemsQuestion(templateId, seededRandom((seed + 700) * 7919), 0)
      const repeat = generateOrderItemsQuestion(templateId, seededRandom((seed + 700) * 7919), 0)
      assert.deepEqual(question, repeat, `${templateId} seed ${seed} is reproducible`)
      assertQuestionValid(question)
      full.add(orderItemsQuestionSignature(question))
      situations.add(orderItemsValueSetSignature(question))

      if (templateId === 'prices') {
        assert.ok(question.items.every((item) => REFERENCE_PRICES.some(([id, greek, value]) => item.id === `price-${id}` && item.greek === greek && item.value === value)))
        assert.equal(question.items.filter((item) => item.value < 100).length, 2)
        assert.equal(question.items.filter((item) => item.value >= 100).length, 2)
      } else {
        assert.ok(question.items.every((item) => REFERENCE_NUMBER_WORDS.some((entry) => item.value === entry.value && item.greek === entry.greek)))
        assert.ok(question.items.every((item) => item.value >= 0 && item.value <= 200))
        const values = question.items.map((item) => item.value)
        sawCloseNumbers ||= Math.max(...values) - Math.min(...values) <= 30
        sawLowNumber ||= values.some((value) => value < 10)
        sawLargeNumber ||= values.some((value) => value >= 100)
      }
    }

    assert.ok(full.size >= 150, `${templateId} should have diverse full combinations (${full.size})`)
    assert.ok(situations.size >= 150, `${templateId} should have diverse value sets (${situations.size})`)
    if (templateId !== 'prices') {
      assert.ok(sawCloseNumbers)
      assert.ok(sawLowNumber)
      assert.ok(sawLargeNumber)
    }
  }
})

test('sessions contain six generated and four fixed questions in five rounds and avoid repeated situations', () => {
  const set = generateOrderItemsQuestionSet('numbers', seededRandom(81))
  assert.equal(set.generated.length, ORDER_ITEMS_GENERATED_PER_SESSION)
  assert.equal(set.fixed.length, ORDER_ITEMS_FIXED_PER_SESSION)
  assert.deepEqual(
    ['ascending', 'descending', 'prices'].map((templateId) => set.generated.filter((question) => question.templateId === templateId).length),
    [2, 2, 2],
  )

  const session = createOrderItemsSession('numbers', set.fixed, set.generated, seededRandom(82))
  assert.equal(session.rounds.length, 5)
  assert.ok(session.rounds.every((round) => round.questions.length === 2))
  assert.equal(getOrderItemsSessionQuestions(session).length, ORDER_ITEMS_SESSION_QUESTION_COUNT)
  assert.equal(getOrderItemsSessionQuestions(session).filter((question) => question.id.startsWith('generated-')).length, 6)
  assert.equal(getOrderItemsSessionQuestions(session).filter((question) => question.id.startsWith('fixed-')).length, 4)
  assert.equal(new Set(getOrderItemsSessionQuestions(session).map(orderItemsValueSetSignature)).size, 10)
  for (const state of session.rounds.flatMap((round) => round.questions)) {
    assert.notEqual(isOrderItemsOrderCorrect(state.question, state.cardOrder), true)
  }
  assert.throws(() => createOrderItemsSession('personal-pronouns', set.fixed, set.generated, seededRandom(1)), /только для темы/)
  assert.deepEqual(generateOrderItemsQuestionSet('verb-eimai', seededRandom(1)), { generated: [], fixed: [] })
})

test('ten sequential runs preserve full-combination and learning-situation diversity per template', () => {
  const storage = memoryStorage()
  const metrics: Record<OrderItemsTemplateId, { full: Set<string>; situations: Set<string> }> = {
    ascending: { full: new Set(), situations: new Set() },
    descending: { full: new Set(), situations: new Set() },
    prices: { full: new Set(), situations: new Set() },
  }

  for (let run = 0; run < 10; run += 1) {
    const set = generateOrderItemsQuestionSet('numbers', seededRandom(900 + run), loadRecentOrderItemsHistory(storage))
    for (const question of set.generated) {
      metrics[question.templateId].full.add(orderItemsQuestionSignature(question))
      metrics[question.templateId].situations.add(orderItemsValueSetSignature(question))
    }
    rememberOrderItemsQuestions([...set.fixed, ...set.generated], storage)
  }

  for (const templateId of ['ascending', 'descending', 'prices'] as const) {
    assert.equal(metrics[templateId].full.size, 20)
    assert.equal(metrics[templateId].situations.size, 20)
  }
  assert.equal(metrics.ascending.situations.size + metrics.descending.situations.size, 40)
})

test('fixed questions prefer situations absent from the previous run', () => {
  const storage = memoryStorage()
  const first = generateOrderItemsQuestionSet('numbers', seededRandom(123))
  rememberOrderItemsQuestions([...first.fixed, ...first.generated], storage)
  const second = generateOrderItemsQuestionSet('numbers', seededRandom(123), loadRecentOrderItemsHistory(storage))
  const firstContexts = new Set(first.fixed.map(orderItemsValueSetSignature))
  assert.equal(second.fixed.length, 4)
  assert.ok(second.fixed.every((question) => !firstContexts.has(orderItemsValueSetSignature(question))))
})

test('history is versioned, bounded, isolated, and tolerates corrupt or unavailable storage', () => {
  const storage = memoryStorage('{broken json')
  assert.deepEqual(loadRecentOrderItemsHistory(storage), emptyHistory())
  rememberOrderItemsQuestions(orderItemsQuestions, storage)
  const stored = JSON.parse(storage.value!) as { version: number; full: Record<string, string[]>; situations: { numbers: string[]; prices: string[] } }
  assert.equal(stored.version, ORDER_ITEMS_HISTORY_VERSION)
  assert.ok(Object.values(stored.full).every((items) => items.length <= ORDER_ITEMS_HISTORY_LIMIT))
  assert.ok(stored.situations.numbers.length <= ORDER_ITEMS_HISTORY_LIMIT)
  assert.ok(stored.situations.prices.length <= ORDER_ITEMS_HISTORY_LIMIT)
  assert.equal(ORDER_ITEMS_HISTORY_STORAGE_KEY, 'greek-app:order-items-history:v1')
  assert.doesNotThrow(() => rememberOrderItemsQuestions(orderItemsQuestions, {
    getItem() { throw new Error('storage unavailable') },
    setItem() { throw new Error('storage unavailable') },
  }))
  assert.deepEqual(loadRecentOrderItemsHistory({ getItem: () => '{"version":2}', setItem() {} }), emptyHistory())

  const question = orderItemsQuestions[0]!
  const reordered = { ...question, items: [...question.items].reverse() }
  assert.equal(orderItemsQuestionSignature(question), orderItemsQuestionSignature(reordered))
  const descendingSameSet = {
    ...question,
    templateId: 'descending' as const,
    direction: 'descending' as const,
    instruction: 'Расставь числа от большего к меньшему.',
  }
  assert.equal(orderItemsValueSetSignature(question), orderItemsValueSetSignature(descendingSameSet))
  assert.notEqual(orderItemsQuestionSignature(question), orderItemsQuestionSignature(descendingSameSet))
})

test('finite price pool exhaustion degrades to a valid bounded fallback', () => {
  const cents = REFERENCE_PRICES.filter(([, , value]) => value < 100)
  const euros = REFERENCE_PRICES.filter(([, , value]) => value >= 100)
  const allPriceContexts: string[] = []
  for (let first = 0; first < cents.length; first += 1) {
    for (let second = first + 1; second < cents.length; second += 1) {
      for (let third = 0; third < euros.length; third += 1) {
        for (let fourth = third + 1; fourth < euros.length; fourth += 1) {
          allPriceContexts.push(JSON.stringify({
            kind: 'price',
            values: [cents[first]![2], cents[second]![2], euros[third]![2], euros[fourth]![2]].sort((left, right) => left - right),
          }))
        }
      }
    }
  }
  const history = { ...emptyHistory(), situations: { numbers: [], prices: allPriceContexts } }
  const question = generateOrderItemsQuestion('prices', seededRandom(77), 0, history)
  assertQuestionValid(question)
  assert.equal(question.items.filter((item) => item.value < 100).length, 2)
})

test('selection, removal, reset, check, locking, advance, restart, and results follow the session rules', () => {
  const set = generateOrderItemsQuestionSet('numbers', seededRandom(51))
  let session = createOrderItemsSession('numbers', set.fixed, set.generated, seededRandom(52))
  const initial = session.rounds[0]!.questions[0]!
  assert.equal(checkOrderItemsAnswer(session).outcome, 'incomplete')

  const firstCard = initial.cardOrder[0]!
  session = selectOrderItemsCard(session, firstCard).session
  assert.equal(session.rounds[0]!.questions[0]!.selectedOrder[0], firstCard)
  assert.equal(selectOrderItemsCard(session, firstCard).outcome, 'invalid')
  assert.equal(removeOrderItemsCard(session, firstCard).outcome, 'removed')
  session = removeOrderItemsCard(session, firstCard).session
  session = selectOrderItemsCard(session, initial.cardOrder[1]!).session
  session = resetOrderItemsAnswer(session).session
  assert.deepEqual(session.rounds[0]!.questions[0]!.selectedOrder, [])

  const currentQuestion = session.rounds[0]!.questions[0]!.question
  const wrong = [...getOrderItemsCorrectOrder(currentQuestion).map((item) => item.id)].reverse()
  for (const itemId of wrong) session = selectOrderItemsCard(session, itemId).session
  assert.equal(checkOrderItemsAnswer(session).outcome, 'checked')
  session = checkOrderItemsAnswer(session).session
  assert.equal(session.rounds[0]!.questions[0]!.isCorrect, false)
  assert.equal(selectOrderItemsCard(session, wrong[0]!).outcome, 'already-checked')
  assert.equal(removeOrderItemsCard(session, wrong[0]!).outcome, 'already-checked')
  assert.equal(resetOrderItemsAnswer(session).outcome, 'already-checked')
  assert.equal(checkOrderItemsAnswer(session).outcome, 'already-checked')
  assert.equal(getOrderItemsSessionResults(session).errors, 1)

  session = advanceOrderItemsSession(session)
  assert.equal(session.currentQuestionIndex, 1)
  session = advanceOrderItemsSession(completeQuestion(session))
  assert.equal(session.currentRoundIndex, 1)
  assert.equal(session.currentQuestionIndex, 0)

  while (!session.completed) {
    session = advanceOrderItemsSession(completeQuestion(session))
  }
  assert.equal(session.rounds.filter((round) => round.completed).length, 5)
  assert.equal(getOrderItemsSessionResults(session).completedRounds, 5)
  assert.equal(getOrderItemsSessionResults(session).totalQuestions, 10)
  assert.equal(getOrderItemsSessionResults(session).errors, 1)
  assert.equal(getOrderItemsSessionResults(session).correctAnswers, 9)
  assert.equal(getOrderItemsSessionResults(session).accuracyPercent, 90)
  assert.equal(advanceOrderItemsSession(session), session)
  assert.equal(selectOrderItemsCard(session, 'number-1').outcome, 'session-completed')

  const restarted = createOrderItemsSession('numbers', set.fixed, generateOrderItemsQuestionSet('numbers', seededRandom(53)).generated, seededRandom(54))
  assert.equal(restarted.currentRoundIndex, 0)
  assert.equal(restarted.completed, false)
  assert.ok(restarted.rounds.flatMap((round) => round.questions).every((question) => !question.checked && question.selectedOrder.length === 0))
})

test('T4 is registered only for numbers, uses the hash-compatible route, and keeps the UI accessible', async () => {
  assert.deepEqual(trainerTopics.filter((topic) => topic.availableExercises.includes('order-items')).map((topic) => topic.id), ['numbers'])
  assert.ok(getTrainerTopic('numbers')?.availableExercises.includes('order-items'))
  assert.ok(!getTrainerTopic('verb-eimai')?.availableExercises.includes('order-items'))
  const route = trainerRoutes.find((item) => item.name === 'trainer-order-items')
  assert.equal(route?.path, '/trainers/:topicId/order-items')

  const exercise = await readFile('src/components/trainers/OrderItemsExercise.vue', 'utf8')
  assert.match(exercise, /const slots = \[1, 2, 3, 4\]/)
  assert.doesNotMatch(exercise, /<(?:input|textarea)\b/i)
  assert.match(exercise, /<button[\s\S]*?@click="emit\('selectCard'/)
  assert.match(exercise, /role="status" aria-live="polite"/)
  assert.match(exercise, /focus-visible/)
  assert.match(exercise, /prefers-reduced-motion/)
  assert.match(exercise, /formatOrderItemsValue\(selectedItems\[slot - 1\]!\)/)

  const page = await readFile('src/pages/TrainerOrderItemsPage.vue', 'utf8')
  assert.match(page, /Упражнение недоступно/)
  assert.match(page, /includes\('order-items'\)/)
  assert.doesNotMatch(page, /currentQuestion\.question\.items[\s\S]*?aria-label="[^"]*value/i)
  assert.doesNotMatch(page, /\$supabase|useSpacedRepetition/)
})
