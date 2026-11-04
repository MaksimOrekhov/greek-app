import type { MultiSelectOption, MultiSelectQuestion } from '../../../data/trainers/multiSelectQuestions.ts'
import {
  EIMAI_PREDICATES,
  EIMAI_SUBJECTS,
  PERSONAL_PRONOUNS,
  POSSESSION_EXAMPLES,
  RECIPIENT_EXAMPLES,
  VERIFIED_COUNTING_NUMBERS,
} from '../../../data/trainers/generation/verifiedContent.ts'
import type { RecentQuestionSignatures } from './questionHistory.ts'
import { multiSelectQuestionSignature } from './questionHistory.ts'

export const GENERATED_QUESTIONS_PER_SESSION = 6
export const GENERATED_QUESTIONS_PER_TEMPLATE = 2
export const BANK_QUESTIONS_PER_SESSION = 4

type Choice = { text: string; correct: boolean }
type QuestionBuilder = (slot: number, random: () => number) => MultiSelectQuestion

function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[result[index], result[target]] = [result[target]!, result[index]!]
  }
  return result
}

function sample<T>(items: T[], count: number, random: () => number): T[] {
  return shuffle(items, random).slice(0, count)
}

function optionsFrom(choices: Choice[], id: string): MultiSelectOption[] {
  return choices.map((choice, index) => ({ ...choice, id: `${id}-option-${index + 1}` }))
}

function question(
  topicId: string,
  templateId: string,
  slot: number,
  prompt: string,
  choices: Choice[],
  explanation: string,
): MultiSelectQuestion {
  const id = `generated-${topicId}-${templateId}-${slot + 1}`
  return {
    id,
    topicId,
    type: 'multi-select',
    prompt,
    options: optionsFrom(choices, id),
    explanation,
    templateId,
  }
}

function translatedChoices<T extends { greek: string; russian: string }>(
  records: T[],
  random: () => number,
  render = (record: T) => `${record.greek} — ${record.russian}`,
): Choice[] {
  const selected = sample(records, 6, random)
  const correctRecords = selected.slice(0, 3)
  const incorrectRecords = selected.slice(3)
  const correct = correctRecords.map((record) => ({ text: render(record), correct: true }))
  const incorrect = incorrectRecords.map((record) => {
    const alternatives = records.filter((other) => other.greek !== record.greek && other.russian !== record.russian)
    const wrongTranslation = sample(alternatives, 1, random)[0]!
    return { text: `${record.greek} — ${wrongTranslation.russian}`, correct: false }
  })
  return shuffle([...correct, ...incorrect], random)
}

const personalTranslationOptions: Choice[] = PERSONAL_PRONOUNS.flatMap((pronoun) => {
  const meanings = [...new Set(PERSONAL_PRONOUNS.map((item) => item.russian))]
  return meanings.map((russian) => ({
    text: `${pronoun.greek} — ${russian}`,
    correct: pronoun.russian === russian,
  }))
})

const pronounGroups = [
  { label: '«я», «ты» или «мы»', words: ['εγώ', 'εσύ', 'εμείς'] },
  { label: '«он», «она» или «оно»', words: ['αυτός', 'αυτή', 'αυτό'] },
  { label: '«они»', words: ['αυτοί', 'αυτές', 'αυτά'] },
  { label: '«ты» или «вы»', words: ['εσύ', 'εσείς'] },
]

const pronounSentenceSubjects = [
  { greek: 'Εγώ', verb: 'είμαι', russian: 'Я' },
  { greek: 'Εσύ', verb: 'είσαι', russian: 'Ты' },
  { greek: 'Αυτός', verb: 'είναι', russian: 'Он' },
  { greek: 'Αυτή', verb: 'είναι', russian: 'Она' },
  { greek: 'Εμείς', verb: 'είμαστε', russian: 'Мы' },
  { greek: 'Εσείς', verb: 'είστε', russian: 'Вы' },
  { greek: 'Αυτοί', verb: 'είναι', russian: 'Они' },
  { greek: 'Αυτές', verb: 'είναι', russian: 'Они' },
]

const pronounSentenceRecords = pronounSentenceSubjects.flatMap((subject) => EIMAI_PREDICATES.map((predicate) => ({
  greek: `${subject.greek} ${subject.verb} ${predicate.greek}.`,
  russian: `${subject.russian} ${predicate.russian}.`,
  subject,
})))

function personalPronounTemplates(): Array<{ id: string; build: QuestionBuilder }> {
  return [
    {
      id: 'pronoun-translation',
      build: (slot, random) => {
        const correctChoices = sample(personalTranslationOptions.filter((item) => item.correct), 3, random)
        const choices = shuffle([
          ...correctChoices,
          ...sample(personalTranslationOptions.filter((item) => !item.correct), 3, random),
        ], random)
        return question(
          'personal-pronouns', 'pronoun-translation', slot,
          'Отметь все верные переводы греческих местоимений.', choices,
          `Сверь каждое слово с переводом. Например, ${correctChoices[0]!.text.replace(' — ', ' — «')}» — верная пара.`,
        )
      },
    },
    {
      id: 'pronoun-groups',
      build: (slot, random) => {
        const group = sample(pronounGroups, 1, random)[0]!
        const correctWords = group.words
        const distractors = sample(PERSONAL_PRONOUNS.map((item) => item.greek).filter((word) => !correctWords.includes(word)), 6 - correctWords.length, random)
        const choices = shuffle([
          ...correctWords.map((word) => ({ text: word, correct: true })),
          ...distractors.map((word) => ({ text: word, correct: false })),
        ], random)
        return question(
          'personal-pronouns', 'pronoun-groups', slot,
          `Какие слова могут означать ${group.label}?`, choices,
          `${correctWords.join(', ')} подходят к указанным значениям.${correctWords.includes('εσείς') ? ' εσείς может относиться к группе или быть вежливым обращением к одному человеку.' : ''}`,
        )
      },
    },
    {
      id: 'pronoun-sentence-translation',
      build: (slot, random) => {
        const selected = sample(pronounSentenceRecords, 3, random)
        const correct = selected.map((record) => ({ text: `${record.greek} — ${record.russian}`, correct: true }))
        const incorrect = selected.map((record) => {
          const wrongTranslations = pronounSentenceRecords.filter((other) => other.russian !== record.russian)
          const wrong = sample(wrongTranslations, 1, random)[0]!
          return { text: `${record.greek} — ${wrong.russian}`, correct: false }
        })
        return question(
          'personal-pronouns', 'pronoun-sentence-translation', slot,
          'Какие короткие фразы и переводы совпадают по смыслу?', shuffle([...correct, ...incorrect], random),
          `Проверь местоимение и перевод: например, «${correct[0]!.text}» — верная пара.`,
        )
      },
    },
  ]
}

function genitiveTemplates(): Array<{ id: string; build: QuestionBuilder }> {
  return [
    {
      id: 'genitive-ownership',
      build: (slot, random) => {
        const selected = sample(POSSESSION_EXAMPLES, 6, random)
        const correct = selected.slice(0, 3).map((item) => ({ text: `${item.greek} — ${item.russian}`, correct: true }))
        const incorrect = selected.slice(3).map((item) => {
          const alternatives = POSSESSION_EXAMPLES.filter((other) => other.greek.split(' ').slice(0, -1).join(' ') === item.greek.split(' ').slice(0, -1).join(' ')
            && other.russian !== item.russian)
          const wrong = sample(alternatives, 1, random)[0]!
          return { text: `${item.greek} — ${wrong.russian}`, correct: false }
        })
        const example = selected[0]!
        return question(
          'personal-pronouns-genitive', 'genitive-ownership', slot,
          'Какие сочетания правильно показывают, кому принадлежат дом, книга или музыка?',
          shuffle([...correct, ...incorrect], random),
          `В «${example.greek}» слово ${example.possessor} показывает, кому принадлежит предмет. Сверь его с русским «${example.russian}».`,
        )
      },
    },
    {
      id: 'genitive-recipient',
      build: (slot, random) => {
        const choices = translatedChoices(RECIPIENT_EXAMPLES, random)
        return question(
          'personal-pronouns-genitive', 'genitive-recipient', slot,
          'Какие фразы верно говорят, кому что-то нравится или кому что-то дают?', choices,
          'Перед глаголом μου, σου, της, του, μας, σας и τους указывают, кому нравится или кому дают что-то. Сверяй всё предложение, а не только местоимение.',
        )
      },
    },
    {
      id: 'genitive-mou-meaning',
      build: (slot, random) => {
        const recipient = RECIPIENT_EXAMPLES.filter((item) => item.greek.startsWith('Μου '))
        const possession = POSSESSION_EXAMPLES.filter((item) => item.possessor === 'μου')
        const recipientChoices = sample(recipient, 3, random)
        const choices = shuffle([
          ...recipientChoices.map((item) => ({ text: item.greek, correct: true })),
          ...sample(possession, 3, random).map((item) => ({ text: item.greek, correct: false })),
        ], random)
        const example = recipientChoices[0]!
        return question(
          'personal-pronouns-genitive', 'genitive-mou-meaning', slot,
          'В каких фразах μου означает «мне»?', choices,
          `В «${example.greek}» μου стоит перед глаголом и означает «мне». После названия предмета, как в το σπίτι μου, оно говорит о принадлежности: «мой дом».`,
        )
      },
    },
  ]
}

const sentenceRecords = EIMAI_SUBJECTS.flatMap((subject) => EIMAI_PREDICATES.map((predicate) => ({
  greek: `${subject.greek} ${subject.verb} ${predicate.greek}.`,
  russian: `${subject.russian[0]!.toLocaleUpperCase('ru')}${subject.russian.slice(1)} ${predicate.russian}.`,
  subject,
})))

const forms = [...new Set(EIMAI_SUBJECTS.map((subject) => subject.verb))]

function eimaiTemplates(): Array<{ id: string; build: QuestionBuilder }> {
  return [
    {
      id: 'eimai-agreement',
      build: (slot, random) => {
        const correctRecords = sample(sentenceRecords, 3, random)
        const correct = correctRecords.map((item) => ({ text: item.greek, correct: true }))
        const incorrect = correctRecords.map((item) => {
          const wrongForm = sample(forms.filter((form) => form !== item.subject.verb), 1, random)[0]!
          return { text: `${item.subject.greek} ${wrongForm} ${item.greek.slice(`${item.subject.greek} ${item.subject.verb}`.length).trimStart()}`, correct: false }
        })
        const item = correctRecords[0]!
        const wrong = incorrect[0]!.text
        return question(
          'verb-eimai', 'eimai-agreement', slot,
          'Какие греческие предложения составлены правильно?', shuffle([...correct, ...incorrect], random),
          `После «${item.subject.greek}» нужна форма «${item.subject.verb}»: «${item.greek}». В «${wrong}» после этого слова нужна та же форма.`,
        )
      },
    },
    {
      id: 'eimai-explicit-translation',
      build: (slot, random) => {
        const choices = translatedChoices(sentenceRecords, random)
        const example = choices.find((item) => item.correct)!
        return question(
          'verb-eimai', 'eimai-explicit-translation', slot,
          'Какие предложения и русские переводы совпадают по смыслу?', choices,
          `Смотри на подлежащее и форму глагола. Например, правильная пара здесь: ${example.text}.`,
        )
      },
    },
    {
      id: 'eimai-omitted-pronoun',
      build: (slot, random) => {
        const records = sentenceRecords.filter((item) => ['Εγώ', 'Εσύ', 'Εμείς', 'Εσείς'].includes(item.subject.greek))
        const selected = sample(records, 3, random)
        const correct = selected.map((item) => ({ text: `${item.subject.verb[0]!.toLocaleUpperCase('el')}${item.subject.verb.slice(1)} ${item.greek.slice(`${item.subject.greek} ${item.subject.verb} `.length)} — ${item.russian}`, correct: true }))
        const incorrect = selected.map((item) => {
          const alternatives = records.filter((other) => other.russian !== item.russian)
          const wrong = sample(alternatives, 1, random)[0]!
          return { text: `${item.subject.verb[0]!.toLocaleUpperCase('el')}${item.subject.verb.slice(1)} ${item.greek.slice(`${item.subject.greek} ${item.subject.verb} `.length)} — ${wrong.russian}`, correct: false }
        })
        const example = selected[0]!
        return question(
          'verb-eimai', 'eimai-omitted-pronoun', slot,
          'Какие фразы без отдельного местоимения правильно передают смысл?', shuffle([...correct, ...incorrect], random),
          `В греческом местоимение можно опустить: форма глагола подсказывает, о ком речь. Например, ${example.subject.verb} соответствует «${example.subject.russian}».`,
        )
      },
    },
  ]
}

const numberRecords = VERIFIED_COUNTING_NUMBERS
const numberExplanation = (records: typeof numberRecords) => records.map((item) => `${item.greek} — ${item.value}`).join('; ')

function numberTemplates(): Array<{ id: string; build: QuestionBuilder }> {
  return [
    {
      id: 'numbers-above',
      build: (slot, random) => {
        const threshold = sample([20, 50, 80, 100, 150], 1, random)[0]!
        const correctRecords = sample(numberRecords.filter((item) => item.value > threshold), 3, random)
        const incorrectRecords = sample(numberRecords.filter((item) => item.value <= threshold), 3, random)
        const selected = shuffle([
          ...correctRecords.map((item) => ({ text: item.greek, correct: true })),
          ...incorrectRecords.map((item) => ({ text: item.greek, correct: false })),
        ], random)
        return question(
          'numbers', 'numbers-above', slot,
          `Найди все числа больше ${threshold}.`, selected,
          `Сравни значения: ${numberExplanation([...correctRecords, ...incorrectRecords])}.`,
        )
      },
    },
    {
      id: 'numbers-between',
      build: (slot, random) => {
        const range = sample([{ min: 20, max: 50 }, { min: 50, max: 100 }, { min: 100, max: 200 }], 1, random)[0]!
        const correctRecords = sample(numberRecords.filter((item) => item.value > range.min && item.value < range.max), 3, random)
        const incorrectRecords = sample(numberRecords.filter((item) => item.value <= range.min || item.value >= range.max), 3, random)
        const selected = shuffle([
          ...correctRecords.map((item) => ({ text: item.greek, correct: true })),
          ...incorrectRecords.map((item) => ({ text: item.greek, correct: false })),
        ], random)
        return question(
          'numbers', 'numbers-between', slot,
          `Выбери числа больше ${range.min}, но меньше ${range.max}.`, selected,
          `Границы не входят в диапазон. Для проверки: ${numberExplanation([...correctRecords, ...incorrectRecords])}.`,
        )
      },
    },
    {
      id: 'numbers-ending',
      build: (slot, random) => {
        const ending = sample([0, 3, 4, 5, 8], 1, random)[0]!
        const correctRecords = sample(numberRecords.filter((item) => item.value % 10 === ending), 3, random)
        const incorrectRecords = sample(numberRecords.filter((item) => item.value % 10 !== ending), 3, random)
        const selected = shuffle([
          ...correctRecords.map((item) => ({ text: item.greek, correct: true })),
          ...incorrectRecords.map((item) => ({ text: item.greek, correct: false })),
        ], random)
        return question(
          'numbers', 'numbers-ending', slot,
          `Какие числа оканчиваются на ${ending}?`, selected,
          `У этих чисел последняя цифра — ${ending}: ${numberExplanation([...correctRecords, ...incorrectRecords])}.`,
        )
      },
    },
  ]
}

function templatesFor(topicId: string): Array<{ id: string; build: QuestionBuilder }> {
  switch (topicId) {
    case 'personal-pronouns': return personalPronounTemplates()
    case 'personal-pronouns-genitive': return genitiveTemplates()
    case 'verb-eimai': return eimaiTemplates()
    case 'numbers': return numberTemplates()
    default: return []
  }
}

/**
 * Builds six reviewed, content-varying questions: two from each of three
 * topic-specific templates. Bounded retries prefer unseen signatures; on
 * exhaustion they choose the least-recent distinct candidate sampled.
 */
export function generateMultiSelectQuestions(
  topicId: string,
  random: () => number = Math.random,
  recent: RecentQuestionSignatures = {},
): MultiSelectQuestion[] {
  const templates = templatesFor(topicId)
  if (templates.length === 0) return []

  const generated: MultiSelectQuestion[] = []
  const selectedByTemplate = new Map<string, Set<string>>()
  for (const template of templates) {
    const seen = selectedByTemplate.get(template.id) ?? new Set<string>()
    selectedByTemplate.set(template.id, seen)
    const recentSignatures = recent[template.id] ?? []
    let slot = 0
    while (slot < GENERATED_QUESTIONS_PER_TEMPLATE) {
      let chosen: MultiSelectQuestion | undefined
      let oldest: MultiSelectQuestion | undefined
      let oldestRank = -1
      for (let attempt = 0; attempt < 40; attempt += 1) {
        const phase = (attempt * 0.6180339887498949) % 1
        const variedRandom = () => (random() + phase) % 1
        const candidate = template.build(slot, variedRandom)
        const signature = multiSelectQuestionSignature(candidate)
        if (seen.has(signature)) continue
        const historyIndex = recentSignatures.indexOf(signature)
        if (historyIndex < 0) {
          chosen = candidate
          break
        }
        if (historyIndex > oldestRank) {
          oldest = candidate
          oldestRank = historyIndex
        }
      }
      chosen ??= oldest
      if (!chosen) throw new Error(`Не удалось создать разные вопросы для шаблона ${template.id}.`)
      seen.add(multiSelectQuestionSignature(chosen))
      generated.push(chosen)
      slot += 1
    }
  }
  return shuffle(generated, random)
}

export function generatedQuestionTemplates(topicId: string): string[] {
  return templatesFor(topicId).map((template) => template.id)
}
