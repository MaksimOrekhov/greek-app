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
    related: ['indefinite-article', 'noun-gender', 'noun-masculine'],
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
    related: ['definite-article', 'indefinite-article', 'noun-cases', 'noun-masculine', 'noun-feminine', 'noun-neuter'],
  },
  {
    id: 'noun-cases',
    title: 'Падежи существительных',
    greekTitle: 'Οι πτώσεις των ουσιαστικών',
    category: 'Грамматика',
    description: 'Как падеж и артикль показывают роль существительного в предложении.',
    order: 4,
    keywords: ['падеж', 'падежи', 'именительный', 'родительный', 'винительный', 'звательный', 'πτώσεις', 'ονομαστική', 'γενική', 'αιτιατική', 'κλητική', 'артикль', 'склонение'],
    summary: 'content/noun-cases/summary.md',
    explanation: 'content/noun-cases/explanation.md',
    related: ['definite-article', 'indefinite-article', 'noun-gender', 'noun-masculine', 'noun-feminine', 'noun-neuter'],
  },
  {
    id: 'noun-masculine',
    title: 'Склонение существительных мужского рода',
    greekTitle: 'Κλίση αρσενικών ουσιαστικών',
    category: 'Грамматика',
    description: 'Основные падежные формы мужских существительных на -ος, -ας, -ης и -ές.',
    order: 5,
    keywords: ['мужской род', 'мужские существительные', 'мужских существительных', 'склонение мужских', 'склонение', 'падежи', 'окончания', '-ος', '-ας', '-ης', '-ές', 'φίλος', 'άντρας', 'μαθητής', 'καφές'],
    summary: 'content/noun-masculine/summary.md',
    explanation: 'content/noun-masculine/explanation.md',
    related: ['noun-cases', 'noun-gender', 'definite-article', 'noun-feminine', 'noun-neuter'],
  },
  {
    id: 'noun-feminine',
    title: 'Склонение существительных женского рода',
    greekTitle: 'Κλίση θηλυκών ουσιαστικών',
    category: 'Грамматика',
    description: 'Падежные формы женских существительных на -α и -η, а также особые модели.',
    order: 6,
    keywords: ['женский род', 'женские существительные', 'склонение женских', 'падежи', 'окончания', '-α', '-η', '-εις', '-ος', '-ού', 'γυναίκα', 'θάλασσα', 'φωνή', 'φίλη', 'πόλη', 'οδός', 'αλεπού'],
    summary: 'content/noun-feminine/summary.md',
    explanation: 'content/noun-feminine/explanation.md',
    related: ['noun-cases', 'noun-gender', 'noun-masculine', 'noun-neuter'],
  },
  {
    id: 'noun-neuter',
    title: 'Склонение существительных среднего рода',
    greekTitle: 'Κλίση ουδέτερων ουσιαστικών',
    category: 'Грамматика',
    description: 'Основные модели среднего рода на -ο, -ι и -μα, падежные формы и ударение.',
    order: 7,
    keywords: ['средний род', 'средние существительные', 'склонение средних', 'склонение существительных среднего рода', 'падежи', 'родительный', '-ο', '-ι', '-μα', 'βιβλίο', 'σπίτι', 'παιδί', 'όνομα', 'πρόβλημα', 'μέρος', 'φως'],
    summary: 'content/noun-neuter/summary.md',
    explanation: 'content/noun-neuter/explanation.md',
    related: ['noun-cases', 'noun-gender', 'noun-masculine', 'noun-feminine'],
  },
  {
    id: 'personal-pronouns-genitive',
    title: 'Личные местоимения в родительном падеже',
    greekTitle: 'Αδύνατοι τύποι προσωπικών αντωνυμιών',
    category: 'Грамматика',
    description: 'Слабые формы μου, σου, του, της, μας, σας и τους: принадлежность и дополнение.',
    order: 8,
    keywords: ['местоимения', 'личные местоимения', 'слабые формы', 'родительный падеж', 'принадлежность', 'μου', 'σου', 'του', 'της', 'μας', 'σας', 'τους'],
    summary: 'content/personal-pronouns-genitive/summary.md',
    explanation: 'content/personal-pronouns-genitive/explanation.md',
    related: ['noun-cases', 'definite-article'],
  },
  {
    id: 'numbers-0-20',
    title: 'Числительные от 0 до 20',
    greekTitle: 'Αριθμοί από το 0 έως το 20',
    category: 'Числительные',
    description: 'Названия чисел, варианты произношения и согласование с существительными.',
    order: 1,
    keywords: ['числительные', 'числа', 'счёт', '0', '20', 'μηδέν', 'ένα', 'δύο', 'τρία', 'τέσσερα', 'δεκατρία', 'δεκατέσσερα', 'род', 'падеж'],
    summary: 'content/numbers-0-20/summary.md',
    explanation: 'content/numbers-0-20/explanation.md',
    related: ['indefinite-article', 'noun-gender'],
  },
  {
    id: 'numbers-20-100',
    title: 'Числительные от 20 до 100',
    greekTitle: 'Αριθμοί από το 20 έως το 100',
    category: 'Числительные',
    description: 'Десятки, составные числа и согласование последней части с существительным.',
    order: 2,
    keywords: ['числительные', 'числа', 'десятки', '100', 'είκοσι', 'τριάντα', 'σαράντα', 'πενήντα', 'εξήντα', 'εβδομήντα', 'ογδόντα', 'ενενήντα', 'εκατό', 'согласование'],
    summary: 'content/numbers-20-100/summary.md',
    explanation: 'content/numbers-20-100/explanation.md',
    related: ['numbers-0-20', 'noun-gender'],
  },
  {
    id: 'numbers-100-200',
    title: 'Числительные от 100 до 200',
    greekTitle: 'Αριθμοί από το 100 έως το 200',
    category: 'Числительные',
    description: 'Формы εκατόν в числах 101–199 и согласование слова διακόσια.',
    order: 3,
    keywords: ['числительные', 'числа', '100', '101', '200', 'εκατό', 'εκατόν', 'διακόσια', 'διακόσιοι', 'диакосиа'],
    summary: 'content/numbers-100-200/summary.md',
    explanation: 'content/numbers-100-200/explanation.md',
    related: ['numbers-20-100', 'noun-gender'],
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
