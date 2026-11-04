export type TrainerExerciseType = 'match-pairs' | 'multi-select' | 'fill-gaps' | 'order-items'

export interface TrainerTopic {
  id: string
  title: string
  description: string
  pairSetId: string
  availableExercises: TrainerExerciseType[]
}

export interface TrainerPair {
  id: string
  prompt: string
  answer: string
}

export interface TrainerPairSet {
  id: string
  pairs: TrainerPair[]
}
