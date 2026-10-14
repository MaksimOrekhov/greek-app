export interface TheoryTopic {
  id: string
  title: string
  greekTitle?: string
  category: string
  description: string
  order: number
  keywords: string[]
  summary: string
  explanation: string
  related: string[]
}

export const theoryTopics: TheoryTopic[] = [
  {
    id: 'definite-article',
    title: 'Определённый артикль',
    greekTitle: 'Οριστικό άρθρο',
    category: 'Грамматика',
    description: 'Формы артикля и его употребление в современном греческом.',
    order: 1,
    keywords: ['род', 'число', 'падеж', 'ο', 'η', 'το', 'артикли'],
    summary: 'content/definite-article/summary.md',
    explanation: 'content/definite-article/explanation.md',
    related: ['indefinite-article', 'noun-gender'],
  },
  {
    id: 'indefinite-article',
    title: 'Неопределённый артикль',
    greekTitle: 'Αόριστο άρθρο',
    category: 'Грамматика',
    description: 'Формы ένας, μία и ένα и их употребление в современном греческом.',
    order: 2,
    keywords: ['неопределённый артикль', 'артикль', 'один', 'ένας', 'έναν', 'ενός', 'μία', 'μια', 'ένα', 'падеж'],
    summary: 'content/indefinite-article/summary.md',
    explanation: 'content/indefinite-article/explanation.md',
    related: ['definite-article', 'noun-gender'],
  },
  {
    id: 'noun-gender',
    title: 'Род существительных',
    greekTitle: 'Γένος των ουσιαστικών',
    category: 'Грамматика',
    description: 'Три грамматических рода, типичные окончания и согласование слов.',
    order: 3,
    keywords: ['род', 'род существительных', 'мужской', 'женский', 'средний', 'ο', 'η', 'το', 'окончания', 'согласование'],
    summary: 'content/noun-gender/summary.md',
    explanation: 'content/noun-gender/explanation.md',
    related: ['definite-article', 'indefinite-article'],
  },
]

export interface TheoryResource {
  title: string
  category: string
  description: string
  keywords: string[]
  to: string
}

export const theoryResources: TheoryResource[] = [
  {
    title: 'Как читать по-гречески',
    category: 'Произношение',
    description: 'Буквы и сочетания букв: приблизительное чтение по-русски.',
    keywords: ['произношение', 'чтение', 'буквы', 'транскрипция'],
    to: '/theory/reading',
  },
]

export function getTheoryTopic(id: string): TheoryTopic | undefined {
  return theoryTopics.find((topic) => topic.id === id)
}

export function validateTheoryTopics(topics: TheoryTopic[] = theoryTopics): string[] {
  const errors: string[] = []
  const ids = new Set<string>()
  for (const topic of topics) {
    if (ids.has(topic.id)) errors.push(`Повторяется идентификатор: ${topic.id}`)
    ids.add(topic.id)
    if (!topic.id || !topic.title || !topic.category || !topic.description) errors.push(`Неполные метаданные темы: ${topic.id}`)
    if (!topic.summary || !topic.explanation) errors.push(`Не заданы Markdown-файлы темы: ${topic.id}`)
  }
  for (const topic of topics) {
    for (const relatedId of topic.related) {
      if (!ids.has(relatedId)) errors.push(`Тема ${topic.id} ссылается на неизвестную тему ${relatedId}`)
    }
  }
  return errors
}
