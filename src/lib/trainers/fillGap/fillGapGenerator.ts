import {
  FILL_GAP_CAPITALIZED_RECIPIENT_FORMS,
  FILL_GAP_EIMAI_FAMILY_CONTEXTS,
  FILL_GAP_EIMAI_INTRODUCTIONS,
  FILL_GAP_NUMBER_PRICE_CONTEXTS,
  FILL_GAP_PERSONAL_PRONOUNS,
  FILL_GAP_POSSESSOR_FORMS,
  FILL_GAP_PRONOUN_DIALOGUES,
  FILL_GAP_PRONOUN_REFERENCE_CONTEXTS,
} from '../../../data/trainers/generation/fillGapContent.ts'
import {
  EIMAI_PREDICATES,
  EIMAI_SUBJECTS,
  POSSESSION_EXAMPLES,
  RECIPIENT_EXAMPLES,
  VERIFIED_COUNTING_NUMBERS,
} from '../../../data/trainers/generation/verifiedContent.ts'
import type { FillGapQuestion } from '../../../data/trainers/fillGapQuestions.ts'
import { fillGapQuestionSignature, type RecentFillGapSignatures } from './questionHistory.ts'

export const FILL_GAP_GENERATED_QUESTIONS_PER_TEMPLATE = 2
export const FILL_GAP_TEMPLATE_COUNT = 3
export const FILL_GAP_GENERATED_QUESTIONS_PER_SESSION = FILL_GAP_GENERATED_QUESTIONS_PER_TEMPLATE * FILL_GAP_TEMPLATE_COUNT
export const FILL_GAP_FIXED_QUESTIONS_PER_SESSION = 4
export const FILL_GAP_SESSION_QUESTION_COUNT = FILL_GAP_GENERATED_QUESTIONS_PER_SESSION + FILL_GAP_FIXED_QUESTIONS_PER_SESSION

type RandomSource = () => number
type QuestionBuilder = (slot: number, random: RandomSource) => FillGapQuestion

interface Template {
  id: string
  build: QuestionBuilder
}

type GeneratedQuestionInput = Omit<FillGapQuestion, 'id' | 'topicId' | 'type' | 'templateId' | 'options' | 'correctOptionId'> & {
  choices: string[]
  correct: string
}

function shuffle<T>(items: T[], random: RandomSource): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[result[index], result[target]] = [result[target]!, result[index]!]
  }
  return result
}

function sample<T>(items: readonly T[], count: number, random: RandomSource): T[] {
  if (items.length < count) throw new Error(`Для задания не хватает вариантов: нужно ${count}, доступно ${items.length}.`)
  return shuffle([...items], random).slice(0, count)
}

function choose<T>(items: readonly T[], random: RandomSource): T {
  return items[Math.floor(random() * items.length)]!
}

function optionsWithAnswer(answer: string, distractors: readonly string[], random: RandomSource): string[] {
  const uniqueDistractors = [...new Set(distractors)].filter((item) => item !== answer)
  return shuffle([answer, ...sample(uniqueDistractors, 2, random)], random)
}

function capitalize(value: string): string {
  return `${value[0]!.toLocaleUpperCase('ru')}${value.slice(1)}`
}

function makeQuestion(topicId: string, templateId: string, slot: number, input: GeneratedQuestionInput): FillGapQuestion {
  const id = `generated-${topicId}-${templateId}-${slot + 1}`
  const options = input.choices.map((text, index) => ({ id: `${id}-option-${index + 1}`, text }))
  const correctOption = options.find((option) => option.text === input.correct)
  if (!correctOption) throw new Error(`В генеративном задании ${id} нет правильного варианта.`)
  const { choices: _choices, correct: _correct, ...content } = input
  return {
    id,
    topicId,
    type: 'fill-gaps',
    templateId,
    ...content,
    options,
    correctOptionId: correctOption.id,
  }
}

function personalPronounTemplates(): Template[] {
  const options = FILL_GAP_PERSONAL_PRONOUNS.map((item) => item.word)
  return [
    {
      id: 'pronoun-agreement',
      build: (slot, random) => {
        const subject = choose(FILL_GAP_PERSONAL_PRONOUNS, random)
        const predicate = choose(EIMAI_PREDICATES, random)
        const meaning = capitalize(subject.meaning)
        return makeQuestion('personal-pronouns', 'pronoun-agreement', slot, {
          instruction: 'Вставь слово, которое подходит к подсказке.',
          sentenceBefore: '',
          sentenceAfter: ` ${subject.verb} ${predicate.greek}.`,
          hint: `${meaning} ${predicate.russian}.`,
          choices: optionsWithAnswer(subject.word, options, random),
          correct: subject.word,
          explanation: `Подсказка говорит «${subject.meaning}». Здесь подходит ${subject.word}: ${subject.word} ${subject.verb} ${predicate.greek}.`,
        })
      },
    },
    {
      id: 'pronoun-reference',
      build: (slot, random) => {
        const context = choose(FILL_GAP_PRONOUN_REFERENCE_CONTEXTS, random)
        return makeQuestion('personal-pronouns', 'pronoun-reference', slot, {
          instruction: 'Вставь слово, которое подходит по смыслу.',
          sentenceBefore: context.before,
          sentenceAfter: context.after,
          hint: context.hint,
          choices: optionsWithAnswer(context.pronoun, options, random),
          correct: context.pronoun,
          explanation: `${context.pronoun} здесь заменяет имя или слово из подсказки.`,
        })
      },
    },
    {
      id: 'pronoun-dialogue',
      build: (slot, random) => {
        const context = choose(FILL_GAP_PRONOUN_DIALOGUES, random)
        const lowercasePronouns = FILL_GAP_PERSONAL_PRONOUNS.map((item) => item.word.toLocaleLowerCase('el'))
        return makeQuestion('personal-pronouns', 'pronoun-dialogue', slot, {
          instruction: 'Вставь слово в короткий диалог.',
          sentenceBefore: context.before,
          sentenceAfter: context.after,
          hint: context.hint,
          choices: optionsWithAnswer(context.answer, lowercasePronouns, random),
          correct: context.answer,
          explanation: context.answer === 'εσύ'
            ? 'В реплике спрашивают собеседника: «А ты?», поэтому подходит εσύ.'
            : context.answer === 'εγώ'
              ? 'В реплике говорящий отвечает о себе: «А я?», поэтому подходит εγώ.'
              : 'В реплике спрашивают «А вы?», поэтому подходит εσείς.',
        })
      },
    },
  ]
}

function possessionTemplates(): Template[] {
  return [
    {
      id: 'possessive-after-noun',
      build: (slot, random) => {
        const example = choose(POSSESSION_EXAMPLES, random)
        const possessor = example.possessor
        const nounPhrase = example.greek.slice(0, -possessor.length).trimEnd()
        const hint = capitalize(example.russian)
        return makeQuestion('personal-pronouns-genitive', 'possessive-after-noun', slot, {
          instruction: 'Вставь форму, которая показывает владельца предмета.',
          sentenceBefore: `${capitalize(nounPhrase)} `,
          sentenceAfter: '.',
          hint,
          choices: optionsWithAnswer(possessor, FILL_GAP_POSSESSOR_FORMS, random),
          correct: possessor,
          explanation: `После названия предмета ${possessor} показывает, кому он принадлежит: «${example.greek}» — «${example.russian}».`,
        })
      },
    },
    {
      id: 'recipient-like-verb',
      build: (slot, random) => {
        const examples = RECIPIENT_EXAMPLES.filter((item) => item.greek.toLocaleLowerCase('el').includes('αρέσει'))
        const example = choose(examples, random)
        const [answer, ...rest] = example.greek.split(' ')
        const correct = answer!
        return makeQuestion('personal-pronouns-genitive', 'recipient-like-verb', slot, {
          instruction: 'Вставь слово, которое подходит к смыслу фразы.',
          sentenceBefore: '',
          sentenceAfter: ` ${rest.join(' ')}`,
          hint: example.russian,
          choices: optionsWithAnswer(correct, FILL_GAP_CAPITALIZED_RECIPIENT_FORMS, random),
          correct,
          explanation: `Перед αρέσει эта форма показывает, кому что-то нравится. ${example.russian}`,
        })
      },
    },
    {
      id: 'recipient-give-verb',
      build: (slot, random) => {
        const examples = RECIPIENT_EXAMPLES.filter((item) => /\s(?:δίνω|δίνουν)\s/u.test(item.greek))
        const example = choose(examples, random)
        const [answer, ...rest] = example.greek.split(' ')
        const correct = answer!
        return makeQuestion('personal-pronouns-genitive', 'recipient-give-verb', slot, {
          instruction: 'Вставь слово, которое показывает, кому дают или кому передают предмет.',
          sentenceBefore: '',
          sentenceAfter: ` ${rest.join(' ')}`,
          hint: example.russian,
          choices: optionsWithAnswer(correct, FILL_GAP_CAPITALIZED_RECIPIENT_FORMS, random),
          correct,
          explanation: `Перед глаголом эта форма показывает, кому дают книгу: ${example.russian}`,
        })
      },
    },
  ]
}

const eimaiForms = ['είμαι', 'είσαι', 'είναι', 'είμαστε', 'είστε', 'είσαστε']

function verbOptions(correctForms: readonly string[], random: RandomSource): string[] {
  const correct = choose(correctForms, random)
  const incorrectForms = eimaiForms.filter((form) => !correctForms.includes(form))
  return optionsWithAnswer(correct, incorrectForms, random)
}

function eimaiTemplates(): Template[] {
  return [
    {
      id: 'eimai-pronoun-context',
      build: (slot, random) => {
        const subject = choose(EIMAI_SUBJECTS, random)
        const predicate = choose(EIMAI_PREDICATES, random)
        const validForms = subject.greek === 'Εσείς' ? ['είστε', 'είσαστε'] : [subject.verb]
        const choices = verbOptions(validForms, random)
        const correct = choices.find((form) => validForms.includes(form))!
        return makeQuestion('verb-eimai', 'eimai-pronoun-context', slot, {
          instruction: 'Вставь форму είμαι, которая подходит к предложению.',
          sentenceBefore: `${subject.greek} `,
          sentenceAfter: ` ${predicate.greek}.`,
          hint: `${capitalize(subject.russian)} ${predicate.russian}.`,
          choices,
          correct,
          explanation: `После ${subject.greek} используется форма ${subject.greek === 'Εσείς' ? 'είστε или είσαστε' : subject.verb}.`,
        })
      },
    },
    {
      id: 'eimai-introduction',
      build: (slot, random) => {
        const context = choose(FILL_GAP_EIMAI_INTRODUCTIONS, random)
        const correctForms: readonly string[] = context.correctForms
        const options = verbOptions(correctForms, random)
        return makeQuestion('verb-eimai', 'eimai-introduction', slot, {
          instruction: 'Вставь форму глагола в фразу о знакомстве или профессии.',
          sentenceBefore: context.before,
          sentenceAfter: context.after,
          hint: context.hint,
          choices: options,
          correct: options.find((form) => correctForms.includes(form))!,
          explanation: `Сверь форму с началом фразы: ${context.before.trim()} ${correctForms.join(' / ')}${context.after}`,
        })
      },
    },
    {
      id: 'eimai-family-and-people',
      build: (slot, random) => {
        const context = choose(FILL_GAP_EIMAI_FAMILY_CONTEXTS, random)
        return makeQuestion('verb-eimai', 'eimai-family-and-people', slot, {
          instruction: 'Вставь форму глагола, которая подходит к фразе о человеке или семье.',
          sentenceBefore: `${context.subject} `,
          sentenceAfter: context.after,
          hint: context.hint,
          choices: verbOptions(['είναι'], random),
          correct: 'είναι',
          explanation: `После «${context.subject}» здесь используется форма είναι.`,
        })
      },
    },
  ]
}

const numberByValue = new Map(VERIFIED_COUNTING_NUMBERS.map((item) => [item.value, item]))

interface NumberSequence {
  values: [number, number, number, number]
  step: number
}

const numberSequences: NumberSequence[] = []
for (const first of VERIFIED_COUNTING_NUMBERS) {
  for (let step = 1; step <= 200; step += 1) {
    const values: [number, number, number, number] = [
      first.value,
      first.value + step,
      first.value + step * 2,
      first.value + step * 3,
    ]
    if (values[3] > 200 || values.some((value) => !numberByValue.has(value))) continue
    numberSequences.push({ values, step })
  }
}

function numberOptions(correctValue: number, excluded: number[], random: RandomSource): string[] {
  const distractors = VERIFIED_COUNTING_NUMBERS
    .filter((item) => !excluded.includes(item.value) && item.value !== correctValue)
    .map((item) => item.greek)
  return optionsWithAnswer(numberByValue.get(correctValue)!.greek, distractors, random)
}

function numberTemplates(): Template[] {
  return [
    {
      id: 'number-from-digits',
      build: (slot, random) => {
        const number = choose(VERIFIED_COUNTING_NUMBERS, random)
        return makeQuestion('numbers', 'number-from-digits', slot, {
          instruction: 'Вставь греческую запись числа.',
          sentenceBefore: `${number.value} = `,
          sentenceAfter: '',
          hint: 'Прочитай число по-гречески.',
          choices: numberOptions(number.value, [number.value], random),
          correct: number.greek,
          explanation: `${number.value} по-гречески — ${number.greek}.`,
        })
      },
    },
    {
      id: 'number-in-price',
      build: (slot, random) => {
        const context = choose(FILL_GAP_NUMBER_PRICE_CONTEXTS, random)
        const number = numberByValue.get(context.value)!
        return makeQuestion('numbers', 'number-in-price', slot, {
          instruction: 'Вставь число, которое подходит к контексту.',
          sentenceBefore: context.before,
          sentenceAfter: context.after,
          hint: context.hint,
          choices: numberOptions(context.value, [context.value], random),
          correct: number.greek,
          explanation: `${number.value} по-гречески — ${number.greek}. Слово после числа помогает понять цену.`,
        })
      },
    },
    {
      id: 'number-sequence',
      build: (slot, random) => {
        const sequence = choose(numberSequences, random)
        const words = sequence.values.map((value) => numberByValue.get(value)!.greek)
        const nextValue = sequence.values[3]
        return makeQuestion('numbers', 'number-sequence', slot, {
          instruction: 'Прочитай числа и продолжи ряд.',
          sentenceBefore: `${words[0]}, ${words[1]}, ${words[2]}, `,
          sentenceAfter: '.',
          hint: `Каждое следующее число больше на ${sequence.step}.`,
          choices: numberOptions(nextValue, sequence.values.slice(0, 3), random),
          correct: numberByValue.get(nextValue)!.greek,
          explanation: `${words[0]}, ${words[1]}, ${words[2]} — это ${sequence.values.slice(0, 3).join(', ')}. Следующее число — ${nextValue}: ${numberByValue.get(nextValue)!.greek}.`,
        })
      },
    },
  ]
}

function templatesFor(topicId: string): Template[] {
  switch (topicId) {
    case 'personal-pronouns': return personalPronounTemplates()
    case 'personal-pronouns-genitive': return possessionTemplates()
    case 'verb-eimai': return eimaiTemplates()
    case 'numbers': return numberTemplates()
    default: return []
  }
}

/** Builds two distinct questions per reviewed template with bounded retries. */
export function generateFillGapQuestions(
  topicId: string,
  random: RandomSource = Math.random,
  recent: RecentFillGapSignatures = {},
): FillGapQuestion[] {
  const templates = templatesFor(topicId)
  if (templates.length === 0) return []

  const generated: FillGapQuestion[] = []
  for (const template of templates) {
    const sessionSignatures = new Set<string>()
    const recentSignatures = recent[template.id] ?? []
    for (let slot = 0; slot < FILL_GAP_GENERATED_QUESTIONS_PER_TEMPLATE; slot += 1) {
      let chosen: FillGapQuestion | undefined
      let oldest: FillGapQuestion | undefined
      let oldestRank = -1
      for (let attempt = 0; attempt < 40; attempt += 1) {
        const phase = (attempt * 0.6180339887498949) % 1
        const variedRandom = () => (random() + phase) % 1
        const candidate = template.build(slot, variedRandom)
        const signature = fillGapQuestionSignature(candidate)
        if (sessionSignatures.has(signature)) continue
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
      chosen ??= oldest ?? template.build(slot, random)
      sessionSignatures.add(fillGapQuestionSignature(chosen))
      generated.push(chosen)
    }
  }
  return shuffle(generated, random)
}

export function generatedFillGapTemplates(topicId: string): string[] {
  return templatesFor(topicId).map((template) => template.id)
}

export function availableNumberSequences(): ReadonlyArray<NumberSequence> {
  return numberSequences
}
