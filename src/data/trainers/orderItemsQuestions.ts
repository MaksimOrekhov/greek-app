import { VERIFIED_COUNTING_NUMBERS } from './generation/verifiedContent.ts'
import { VERIFIED_ORDER_PRICES } from './orderItemsContent.ts'
import type { OrderItemsQuestion, OrderItemsTemplateId } from '../../lib/trainers/orderItems/orderItems.ts'

function numbers(values: number[]): OrderItemsQuestion['items'] {
  return values.map((value) => {
    const number = VERIFIED_COUNTING_NUMBERS.find((item) => item.value === value)
    if (!number) throw new Error(`Не найдено проверенное греческое числительное ${value}.`)
    return { id: `number-${value}`, greek: number.greek, value, kind: 'number' }
  })
}

function prices(ids: string[]): OrderItemsQuestion['items'] {
  return ids.map((id) => {
    const price = VERIFIED_ORDER_PRICES.find((item) => item.id === id)
    if (!price) throw new Error(`Не найдена проверенная цена ${id}.`)
    return { id: `price-${price.id}`, greek: price.greek, value: price.value, kind: 'price' }
  })
}

function numberQuestion(
  id: string,
  templateId: Extract<OrderItemsTemplateId, 'ascending' | 'descending'>,
  values: number[],
  explanation: string,
): OrderItemsQuestion {
  return {
    id,
    templateId,
    instruction: templateId === 'ascending'
      ? 'Расставь числа от меньшего к большему.'
      : 'Расставь числа от большего к меньшему.',
    direction: templateId,
    items: numbers(values),
    explanation,
  }
}

function priceQuestion(id: string, priceIds: string[], explanation: string): OrderItemsQuestion {
  return {
    id,
    templateId: 'prices',
    instruction: 'Расставь цены от самой дешёвой до самой дорогой.',
    direction: 'ascending',
    items: prices(priceIds),
    explanation,
  }
}

/** Fixed, manually reviewed T4 bank: four questions for each template. */
export const orderItemsQuestions: OrderItemsQuestion[] = [
  numberQuestion('fixed-ascending-1', 'ascending', [40, 5, 21, 12], 'πέντε = 5, δώδεκα = 12, είκοσι ένα = 21, σαράντα = 40. Числа идут от меньшего к большему.'),
  numberQuestion('fixed-ascending-2', 'ascending', [100, 83, 94, 89], 'ογδόντα τρία = 83, ογδόντα εννέα = 89, ενενήντα τέσσερα = 94, εκατό = 100. Сравнивай точные значения.'),
  numberQuestion('fixed-ascending-3', 'ascending', [53, 50, 63, 43], 'σαράντα τρία = 43, πενήντα = 50, πενήντα τρία = 53, εξήντα τρία = 63.'),
  numberQuestion('fixed-ascending-4', 'ascending', [200, 178, 199, 140], 'εκατόν σαράντα = 140, εκατόν εβδομήντα οκτώ = 178, εκατόν ενενήντα εννέα = 199, διακόσια = 200.'),
  numberQuestion('fixed-descending-1', 'descending', [80, 120, 53, 100], 'εκατόν είκοσι = 120, εκατό = 100, ογδόντα = 80, πενήντα τρία = 53. Числа идут от большего к меньшему.'),
  numberQuestion('fixed-descending-2', 'descending', [31, 34, 30, 28], 'τριάντα τέσσερα = 34, τριάντα ένα = 31, τριάντα = 30, είκοσι οκτώ = 28.'),
  numberQuestion('fixed-descending-3', 'descending', [199, 200, 125, 140], 'διακόσια = 200, εκατόν ενενήντα εννέα = 199, εκατόν σαράντα = 140, εκατόν είκοσι πέντε = 125.'),
  numberQuestion('fixed-descending-4', 'descending', [24, 25, 23, 22], 'είκοσι πέντε = 25, είκοσι τέσσερα = 24, είκοσι τρία = 23, είκοσι δύο = 22.'),
  priceQuestion('fixed-prices-1', ['80-cent', '100-cent', '200-cent', '400-cent'], 'ογδόντα λεπτά = 80 центов, ένα ευρώ = 1 евро, δύο ευρώ = 2 евро, τέσσερα ευρώ = 4 евро.'),
  priceQuestion('fixed-prices-2', ['150-cent', '200-cent', '250-cent', '300-cent'], 'ένα ευρώ και πενήντα λεπτά = 1 евро 50 центов, δύο ευρώ = 2 евро, δύο ευρώ και πενήντα λεπτά = 2 евро 50 центов, τρία ευρώ = 3 евро.'),
  priceQuestion('fixed-prices-3', ['220-cent', '250-cent', '350-cent', '400-cent'], 'δύο ευρώ και είκοσι λεπτά = 2 евро 20 центов, δύο ευρώ και πενήντα λεπτά = 2 евро 50 центов, τρία ευρώ και πενήντα λεπτά = 3 евро 50 центов, τέσσερα ευρώ = 4 евро.'),
  priceQuestion('fixed-prices-4', ['60-cent', '90-cent', '120-cent', '180-cent'], 'εξήντα λεπτά = 60 центов, ενενήντα λεπτά = 90 центов, ένα ευρώ και είκοσι λεπτά = 1 евро 20 центов, ένα ευρώ και ογδόντα λεπτά = 1 евро 80 центов.'),
]
