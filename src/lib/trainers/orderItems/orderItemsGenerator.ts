import { VERIFIED_COUNTING_NUMBERS } from '../../../data/trainers/generation/verifiedContent.ts'
import { orderItemsQuestions } from '../../../data/trainers/orderItemsQuestions.ts'
import { VERIFIED_ORDER_PRICES } from '../../../data/trainers/orderItemsContent.ts'
import type { RecentOrderItemsHistory } from './orderItemsHistory.ts'
import { buildOrderItemsExplanation, orderItemsQuestionSignature, orderItemsValueSetSignature, type OrderItemsItem, type OrderItemsQuestion, type OrderItemsTemplateId } from './orderItems.ts'

export const ORDER_ITEMS_GENERATED_PER_TEMPLATE = 2
export const ORDER_ITEMS_TEMPLATE_COUNT = 3
export const ORDER_ITEMS_GENERATED_PER_SESSION = ORDER_ITEMS_GENERATED_PER_TEMPLATE * ORDER_ITEMS_TEMPLATE_COUNT
export const ORDER_ITEMS_FIXED_PER_SESSION = 4
export const ORDER_ITEMS_SESSION_QUESTION_COUNT = 10

type RandomSource = () => number
type NumberProfile = 'any' | 'nearby' | 'mixed-range' | 'hundreds'
type PriceProfile = { cents: number; euros: number }

const PRICE_PROFILES: readonly PriceProfile[] = [
  { cents: 4, euros: 0 },
  { cents: 3, euros: 1 },
  { cents: 2, euros: 2 },
  { cents: 1, euros: 3 },
  { cents: 0, euros: 4 },
]

const EMPTY_HISTORY: RecentOrderItemsHistory = { full: {}, situations: { numbers: [], prices: [] } }

function shuffled<T>(items: readonly T[], random: RandomSource): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[result[index], result[target]] = [result[target]!, result[index]!]
  }
  return result
}

function choose<T>(items: readonly T[], random: RandomSource): T {
  return items[Math.floor(random() * items.length)]!
}

function combinations<T>(items: readonly T[], count: number, visit: (selected: T[]) => boolean): boolean {
  const selected: T[] = []
  function walk(start: number): boolean {
    if (selected.length === count) return visit([...selected])
    for (let index = start; index <= items.length - (count - selected.length); index += 1) {
      selected.push(items[index]!)
      if (walk(index + 1)) return true
      selected.pop()
    }
    return false
  }
  return walk(0)
}

function makeItem(id: string, greek: string, value: number, kind: OrderItemsItem['kind']): OrderItemsItem {
  return { id, greek, value, kind }
}

function buildNumberQuestion(templateId: Extract<OrderItemsTemplateId, 'ascending' | 'descending'>, values: readonly number[], id: string): OrderItemsQuestion {
  const items = values.map((value) => {
    const entry = VERIFIED_COUNTING_NUMBERS.find((candidate) => candidate.value === value)
    if (!entry) throw new Error(`Не найдено проверенное греческое числительное ${value}.`)
    return makeItem(`number-${value}`, entry.greek, value, 'number')
  })
  return {
    id,
    templateId,
    instruction: templateId === 'ascending'
      ? 'Расставь числа от меньшего к большему.'
      : 'Расставь числа от большего к меньшему.',
    direction: templateId,
    items,
    explanation: '',
  }
}

function profileFor(random: RandomSource): NumberProfile {
  return choose(['any', 'nearby', 'mixed-range', 'hundreds'] as const, random)
}

function fitsNumberProfile(values: readonly number[], profile: NumberProfile): boolean {
  if (profile === 'any') return true
  if (profile === 'nearby') return Math.max(...values) - Math.min(...values) <= 30
  if (profile === 'mixed-range') return values.some((value) => value < 10)
    && values.some((value) => value >= 10 && value < 100)
    && values.some((value) => value >= 100)
  return values.filter((value) => value >= 100).length >= 2 && values.some((value) => value < 100)
}

function chooseNumberValues(
  templateId: Extract<OrderItemsTemplateId, 'ascending' | 'descending'>,
  profile: NumberProfile,
  random: RandomSource,
  recent: readonly string[],
  used: ReadonlySet<string>,
): number[] {
  const entries = VERIFIED_COUNTING_NUMBERS
  const seen = new Set(recent)
  const tryValues = (values: number[], respectHistory: boolean): boolean => {
    if (!fitsNumberProfile(values, profile)) return false
    const question = buildNumberQuestion(templateId, values, 'candidate')
    const signature = orderItemsValueSetSignature(question)
    if (used.has(signature) || (respectHistory && seen.has(signature))) return false
    return true
  }

  for (let attempt = 0; attempt < 256; attempt += 1) {
    const values = shuffled(entries, random).slice(0, 4).map((entry) => entry.value)
    if (tryValues(values, true)) return values
  }

  let selected: number[] | undefined
  combinations(entries, 4, (items) => {
    const values = items.map((item) => item.value)
    if (!fitsNumberProfile(values, profile)) return false
    const signature = orderItemsValueSetSignature(buildNumberQuestion(templateId, values, 'candidate'))
    if (used.has(signature) || seen.has(signature)) return false
    selected = values
    return true
  })
  if (selected) return selected

  // If all recent contexts are exhausted, preserve within-session uniqueness first.
  combinations(entries, 4, (items) => {
    const values = items.map((item) => item.value)
    if (!fitsNumberProfile(values, profile)) return false
    const signature = orderItemsValueSetSignature(buildNumberQuestion(templateId, values, 'candidate'))
    if (used.has(signature)) return false
    selected = values
    return true
  })
  if (selected) return selected

  // Last-resort fallback only applies when the eligible source pool is exhausted.
  combinations(entries, 4, (items) => {
    selected = items.map((item) => item.value)
    return true
  })
  if (!selected) throw new Error('Не удалось составить вопрос из проверенной таблицы числительных.')
  return selected
}

function choosePrices(
  random: RandomSource,
  recent: readonly string[],
  used: ReadonlySet<string>,
): OrderItemsItem[] {
  const cents = VERIFIED_ORDER_PRICES.filter((item) => item.value < 100)
  const euroPrices = VERIFIED_ORDER_PRICES.filter((item) => item.value >= 100)
  const recentSet = new Set(recent)
  const preferredProfile = choose(PRICE_PROFILES, random)

  const candidateItems = (selectedCents: readonly typeof cents[number][], selectedEuros: readonly typeof euroPrices[number][]) => [
    ...selectedCents.map((item) => makeItem(`price-${item.id}`, item.greek, item.value, 'price')),
    ...selectedEuros.map((item) => makeItem(`price-${item.id}`, item.greek, item.value, 'price')),
  ]
  const isAvailable = (items: OrderItemsItem[], ignoreHistory = false) => {
    const signature = orderItemsValueSetSignature({ items } as OrderItemsQuestion)
    return !used.has(signature) && (ignoreHistory || !recentSet.has(signature))
  }

  const findAvailableItems = (profiles: readonly PriceProfile[], ignoreHistory = false): OrderItemsItem[] | undefined => {
    for (const profile of profiles) {
      let selected: OrderItemsItem[] | undefined
      combinations(cents, profile.cents, (selectedCents) => combinations(euroPrices, profile.euros, (selectedEuros) => {
        const items = candidateItems(selectedCents, selectedEuros)
        if (!isAvailable(items, ignoreHistory)) return false
        selected = items
        return true
      }))
      if (selected) return selected
    }
    return undefined
  }

  for (let attempt = 0; attempt < 256; attempt += 1) {
    const selectedCents = shuffled(cents, random).slice(0, preferredProfile.cents)
    const selectedEuros = shuffled(euroPrices, random).slice(0, preferredProfile.euros)
    const items = candidateItems(selectedCents, selectedEuros)
    if (isAvailable(items)) return items
  }

  const otherProfiles = shuffled(PRICE_PROFILES.filter((profile) => profile !== preferredProfile), random)
  const profileOrder = [preferredProfile, ...otherProfiles]
  let selected = findAvailableItems([preferredProfile])
  if (selected) return selected

  selected = findAvailableItems(otherProfiles)
  if (selected) return selected

  // When recent history covers every candidate, reuse a checked combination while
  // still avoiding a duplicate elsewhere in the current session.
  selected = findAvailableItems(profileOrder, true)
  if (selected) return selected

  // The verified pool has a finite set of four-price combinations; only repeat
  // after all 2,380 distinct contexts have been used in this session.
  return candidateItems(cents.slice(0, 4), [])
}

export function generateOrderItemsQuestion(
  templateId: OrderItemsTemplateId,
  random: RandomSource = Math.random,
  slot = 0,
  history: RecentOrderItemsHistory = EMPTY_HISTORY,
  usedSituations: ReadonlySet<string> = new Set(),
): OrderItemsQuestion {
  let question: OrderItemsQuestion
  if (templateId === 'prices') {
    question = {
      id: `generated-prices-${slot + 1}`,
      templateId,
      instruction: 'Расставь цены от самой дешёвой до самой дорогой.',
      direction: 'ascending',
      items: choosePrices(random, history.situations.prices, usedSituations),
      explanation: '',
    }
  } else {
    const values = chooseNumberValues(
      templateId,
      profileFor(random),
      random,
      history.situations.numbers,
      usedSituations,
    )
    question = buildNumberQuestion(templateId, values, `generated-${templateId}-${slot + 1}`)
  }
  question.explanation = buildOrderItemsExplanation(question)
  return question
}

export interface OrderItemsQuestionSet {
  generated: OrderItemsQuestion[]
  fixed: OrderItemsQuestion[]
}

function selectFixedQuestions(random: RandomSource, history: RecentOrderItemsHistory): OrderItemsQuestion[] {
  const candidates = shuffled(orderItemsQuestions, random)
  const recentSituations = new Set([...history.situations.numbers, ...history.situations.prices])
  const recentFull = new Set(Object.values(history.full).flat())
  const selected: OrderItemsQuestion[] = []
  const selectedSituations = new Set<string>()

  const append = (question: OrderItemsQuestion) => {
    const situation = orderItemsValueSetSignature(question)
    if (selected.length >= ORDER_ITEMS_FIXED_PER_SESSION || selectedSituations.has(situation)) return
    selected.push(question)
    selectedSituations.add(situation)
  }

  for (const question of candidates) {
    const situation = orderItemsValueSetSignature(question)
    if (recentSituations.has(situation) || recentFull.has(orderItemsQuestionSignature(question))) continue
    append(question)
  }
  for (const question of candidates) {
    if (recentSituations.has(orderItemsValueSetSignature(question))) continue
    append(question)
  }
  for (const question of candidates) append(question)
  return selected
}

export function generateOrderItemsQuestionSet(
  topicId: string,
  random: RandomSource = Math.random,
  history: RecentOrderItemsHistory = EMPTY_HISTORY,
): OrderItemsQuestionSet {
  if (topicId !== 'numbers') return { generated: [], fixed: [] }
  const fixed = selectFixedQuestions(random, history)
  const used = new Set(fixed.map(orderItemsValueSetSignature))
  const generated: OrderItemsQuestion[] = []

  for (const templateId of ['ascending', 'descending', 'prices'] as const) {
    for (let slot = 0; slot < ORDER_ITEMS_GENERATED_PER_TEMPLATE; slot += 1) {
      const question = generateOrderItemsQuestion(templateId, random, slot, history, used)
      generated.push(question)
      used.add(orderItemsValueSetSignature(question))
    }
  }

  return { generated, fixed }
}
