import type { WordCard } from '../../data/words.ts'
import type { TrainerPair } from '../../data/trainers/types.ts'
import type { VocabularyMatchHistory } from './vocabularyMatchHistory.ts'

/**
 * Small, reviewed groups whose Russian glosses can still point to more than
 * one Greek item when shown without a sentence. This is intentionally not a
 * second vocabulary list; IDs and glosses always come from `words`.
 */
export const VOCABULARY_MATCH_CONFLICT_GROUPS: readonly (readonly string[])[] = [
  ['καλά', 'εντάξει'],
  ['στο', 'στην'],
  ['είστε', 'είσαστε'],
  ['ώρα', 'καιρός', 'χρόνος'],
  ['μα', 'αλλά'],
  ['χάρτης', 'κάρτα'],
  ['λέω', 'μιλάω'],
  ['κινηματογράφος', 'σινεμά'],
]

export const VOCABULARY_MATCH_SESSION_PAIR_COUNT = 20

export function adaptWordsToTrainerPairs(sourceWords: readonly WordCard[]): TrainerPair[] {
  return sourceWords
    .filter((word) => word.greek.trim().length > 0 && word.russian.trim().length > 0)
    .map((word) => ({
      id: `dictionary:${word.greek}`,
      prompt: word.russian,
      answer: word.greek,
    }))
}

function normalizeLabel(value: string): string {
  return value
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase('ru')
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
}

export function areVocabularyPairsAmbiguous(left: TrainerPair, right: TrainerPair): boolean {
  if (left.id === right.id) return true
  if (normalizeLabel(left.prompt) === normalizeLabel(right.prompt)) return true
  if (normalizeLabel(left.answer) === normalizeLabel(right.answer)) return true

  return VOCABULARY_MATCH_CONFLICT_GROUPS.some((group) =>
    group.includes(left.answer) && group.includes(right.answer),
  )
}

/** Picks unseen pairs first and only repeats previously completed words to fill a short final cycle. */
export function selectVocabularyMatchPairs(
  pairs: readonly TrainerPair[],
  history: VocabularyMatchHistory,
  random: () => number = Math.random,
  limit = VOCABULARY_MATCH_SESSION_PAIR_COUNT,
  avoidIds: ReadonlySet<string> = new Set(),
): TrainerPair[] {
  const pairById = new Map<string, TrainerPair>()
  for (const pair of pairs) {
    if (pair.id && pair.prompt.trim() && pair.answer.trim() && !pairById.has(pair.id)) {
      pairById.set(pair.id, pair)
    }
  }

  const completedIds = new Set(history.completedIds)
  const inOrder = history.order.map((id) => pairById.get(id)).filter((pair): pair is TrainerPair => Boolean(pair))
  const preferred = inOrder.filter((pair) => !completedIds.has(pair.id) && !avoidIds.has(pair.id))
  const completed = inOrder.filter((pair) => completedIds.has(pair.id) && !avoidIds.has(pair.id))
  const avoided = inOrder.filter((pair) => avoidIds.has(pair.id))
  const selected: TrainerPair[] = []

  function addCompatible(candidates: readonly TrainerPair[]): void {
    for (const pair of candidates) {
      if (selected.length >= limit) return
      if (selected.some((chosen) => areVocabularyPairsAmbiguous(chosen, pair))) continue
      selected.push(pair)
    }
  }

  // The random draw varies which compatible words share a session while the
  // persistent cycle order still guarantees eventual access to deferred words.
  addCompatible(shuffle(preferred, random))
  addCompatible(shuffle(completed, random))
  addCompatible(shuffle(avoided, random))
  return selected
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[target]] = [shuffled[target]!, shuffled[index]!]
  }
  return shuffled
}
