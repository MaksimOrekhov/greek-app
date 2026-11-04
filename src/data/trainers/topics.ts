import { trainerPairSets } from './pairSets.ts'
import type { TrainerExerciseType, TrainerPairSet, TrainerTopic } from './types.ts'

const supportedTrainerExercises = new Set<TrainerExerciseType>(['match-pairs', 'multi-select', 'fill-gaps'])

export const trainerTopics: TrainerTopic[] = [
  {
    id: 'personal-pronouns',
    title: 'Личные местоимения',
    description: 'Формы, которые обозначают говорящего, собеседника и тех, о ком говорят.',
    pairSetId: 'personal-pronouns',
    availableExercises: ['match-pairs', 'multi-select', 'fill-gaps'],
  },
  {
    id: 'personal-pronouns-genitive',
    title: 'Личные местоимения в родительном падеже',
    description: 'Сопоставьте русские притяжательные местоимения с греческими формами принадлежности.',
    pairSetId: 'personal-pronouns-genitive',
    availableExercises: ['match-pairs', 'multi-select', 'fill-gaps'],
  },
  {
    id: 'verb-eimai',
    title: 'Глагол είμαι',
    description: 'Формы настоящего времени для шести грамматических лиц.',
    pairSetId: 'verb-eimai',
    availableExercises: ['match-pairs', 'multi-select', 'fill-gaps'],
  },
  {
    id: 'numbers',
    title: 'Числа 0–200',
    description: 'Сопоставление чисел с их греческими названиями в счётной форме.',
    pairSetId: 'numbers',
    availableExercises: ['match-pairs', 'multi-select', 'fill-gaps'],
  },
]

export function getTrainerTopic(id: string): TrainerTopic | undefined {
  return trainerTopics.find((topic) => topic.id === id)
}

export function getTrainerPairSet(topic: TrainerTopic): TrainerPairSet | undefined {
  return trainerPairSets[topic.pairSetId]
}

export function validateTrainerRegistry(
  topics: TrainerTopic[] = trainerTopics,
  pairSets: Record<string, TrainerPairSet> = trainerPairSets,
): string[] {
  const errors: string[] = []
  const topicIds = new Set<string>()

  for (const topic of topics) {
    if (topicIds.has(topic.id)) errors.push(`Повторяется тема тренажёра: ${topic.id}`)
    topicIds.add(topic.id)

    if (!topic.id || !topic.title || !topic.description || !topic.pairSetId) {
      errors.push(`Неполные данные темы тренажёра: ${topic.id}`)
    }
    if (topic.availableExercises.length === 0) {
      errors.push(`Для темы ${topic.id} не зарегистрировано ни одного упражнения`)
    }
    const exerciseTypes = new Set<string>()
    for (const exercise of topic.availableExercises) {
      if (!supportedTrainerExercises.has(exercise)) {
        errors.push(`Неизвестный тип упражнения ${exercise} в теме ${topic.id}`)
      }
      if (exerciseTypes.has(exercise)) errors.push(`Тип упражнения ${exercise} повторяется в теме ${topic.id}`)
      exerciseTypes.add(exercise)
    }

    const pairSet = pairSets[topic.pairSetId]
    if (!pairSet) {
      errors.push(`Для темы ${topic.id} не найден набор пар ${topic.pairSetId}`)
      continue
    }
    if (pairSet.id !== topic.pairSetId) {
      errors.push(`Идентификатор набора пар ${pairSet.id} не совпадает с темой ${topic.id}`)
    }
    if (pairSet.pairs.length === 0) errors.push(`Пустой набор пар: ${pairSet.id}`)

    const pairIds = new Set<string>()
    for (const pair of pairSet.pairs) {
      if (pairIds.has(pair.id)) errors.push(`Повторяется пара ${pair.id} в наборе ${pairSet.id}`)
      pairIds.add(pair.id)
      if (!pair.id || !pair.prompt.trim() || !pair.answer.trim()) {
        errors.push(`Неполная пара в наборе ${pairSet.id}`)
      }
    }
  }

  return errors
}
