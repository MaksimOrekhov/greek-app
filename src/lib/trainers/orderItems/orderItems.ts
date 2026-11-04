export const ORDER_ITEMS_TEMPLATE_IDS = ['ascending', 'descending', 'prices'] as const
export type OrderItemsTemplateId = typeof ORDER_ITEMS_TEMPLATE_IDS[number]
export type OrderItemsDirection = 'ascending' | 'descending'

export interface OrderItemsItem {
  id: string
  greek: string
  /** Plain number for number items, cents for price items. */
  value: number
  kind: 'number' | 'price'
}

export interface OrderItemsQuestion {
  id: string
  templateId: OrderItemsTemplateId
  instruction: string
  direction: OrderItemsDirection
  items: OrderItemsItem[]
  explanation: string
}

export function getOrderItemsCorrectOrder(question: OrderItemsQuestion): OrderItemsItem[] {
  const sign = question.direction === 'ascending' ? 1 : -1
  return [...question.items].sort((left, right) => (left.value - right.value) * sign)
}

/** Checks the learner's chosen IDs against numeric values, never Greek text. */
export function isOrderItemsOrderCorrect(question: OrderItemsQuestion, chosenIds: readonly string[]): boolean {
  if (chosenIds.length !== question.items.length || new Set(chosenIds).size !== question.items.length) return false
  if (question.items.some((item) => !chosenIds.includes(item.id))) return false
  const expectedIds = getOrderItemsCorrectOrder(question).map((item) => item.id)
  return expectedIds.every((id, index) => id === chosenIds[index])
}

export function formatOrderItemsValue(item: OrderItemsItem): string {
  if (item.kind === 'number') return String(item.value)
  if (item.value < 100) return `${item.value} центов`
  const euros = Math.floor(item.value / 100)
  const cents = item.value % 100
  return cents === 0 ? `${euros} евро` : `${euros} евро ${cents} центов`
}

export function buildOrderItemsExplanation(question: OrderItemsQuestion): string {
  const ordered = getOrderItemsCorrectOrder(question)
  const values = ordered.map((item) => `${item.greek} = ${formatOrderItemsValue(item)}`).join(', ')
  return question.templateId === 'prices'
    ? `Сравниваем полную стоимость: ${values}.`
    : `Числовые значения: ${values}. ${question.direction === 'ascending' ? 'От меньшего к большему.' : 'От большего к меньшему.'}`
}

export function orderItemsValueSetSignature(question: OrderItemsQuestion): string {
  const kind = question.items[0]?.kind ?? 'number'
  return JSON.stringify({ kind, values: question.items.map((item) => item.value).sort((left, right) => left - right) })
}

/** Includes direction and correct sequence, but ignores random card display order. */
export function orderItemsQuestionSignature(question: OrderItemsQuestion): string {
  return JSON.stringify({
    templateId: question.templateId,
    instruction: question.instruction.normalize('NFC').trim().replace(/\s+/gu, ' '),
    correctOrder: getOrderItemsCorrectOrder(question).map(({ id, greek, value, kind }) => ({ id, greek, value, kind })),
  })
}
