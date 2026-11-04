import { trainerTopics } from './topics.ts'
import type { TrainerExerciseType } from './types.ts'

export interface FillGapOption {
  id: string
  text: string
}

export interface FillGapQuestion {
  id: string
  topicId: string
  type: Extract<TrainerExerciseType, 'fill-gaps'>
  templateId?: string
  instruction: string
  sentenceBefore: string
  sentenceAfter: string
  hint: string
  options: FillGapOption[]
  correctOptionId: string
  explanation: string
}

type StaticQuestionInput = Omit<FillGapQuestion, 'id' | 'topicId' | 'type' | 'options' | 'correctOptionId'> & {
  choices: string[]
  correct: string
}

function fixedQuestion(id: string, topicId: string, input: StaticQuestionInput): FillGapQuestion {
  const options = input.choices.map((text, index) => ({ id: `${id}-option-${index + 1}`, text }))
  const correct = options.find((option) => option.text === input.correct)
  if (!correct) throw new Error(`В фиксированном задании ${id} нет правильного варианта.`)
  const { choices: _choices, correct: _correct, ...question } = input
  return { id, topicId, type: 'fill-gaps', ...question, options, correctOptionId: correct.id }
}

const instruction = 'Вставь в пропуск подходящее слово.'

export const trainerFillGapQuestions: FillGapQuestion[] = [
  fixedQuestion('pronouns-i-here', 'personal-pronouns', {
    instruction, sentenceBefore: '', sentenceAfter: ' είμαι εδώ.', hint: 'Я здесь.',
    choices: ['Εγώ', 'Εσύ', 'Εμείς'], correct: 'Εγώ',
    explanation: 'Подсказка говорит о себе: «я» — это εγώ. С ним используется είμαι.',
  }),
  fixedQuestion('pronouns-i-from-greece', 'personal-pronouns', {
    instruction, sentenceBefore: '', sentenceAfter: ' είμαι από την Ελλάδα.', hint: 'Я из Греции.',
    choices: ['Εγώ', 'Εσύ', 'Εσείς'], correct: 'Εγώ',
    explanation: 'Здесь человек говорит о себе: εγώ είμαι από την Ελλάδα — «Я из Греции».',
  }),
  fixedQuestion('pronouns-you-home', 'personal-pronouns', {
    instruction, sentenceBefore: '', sentenceAfter: ' είσαι στο σπίτι.', hint: 'Ты дома.',
    choices: ['Εσύ', 'Εγώ', 'Εμείς'], correct: 'Εσύ',
    explanation: 'Форма είσαι подходит к εσύ: Εσύ είσαι στο σπίτι — «Ты дома».',
  }),
  fixedQuestion('pronouns-you-from-serbia', 'personal-pronouns', {
    instruction, sentenceBefore: '', sentenceAfter: ' είσαι από τη Σερβία.', hint: 'Ты из Сербии.',
    choices: ['Εσύ', 'Εσείς', 'Εμείς'], correct: 'Εσύ',
    explanation: 'В подсказке говорится о собеседнике: «ты» по-гречески εσύ.',
  }),
  fixedQuestion('pronouns-we-home', 'personal-pronouns', {
    instruction, sentenceBefore: '', sentenceAfter: ' είμαστε στο σπίτι.', hint: 'Мы дома.',
    choices: ['Εμείς', 'Εσείς', 'Εγώ'], correct: 'Εμείς',
    explanation: 'С είμαστε подходит εμείς: Εμείς είμαστε στο σπίτι — «Мы дома».',
  }),
  fixedQuestion('pronouns-we-here', 'personal-pronouns', {
    instruction, sentenceBefore: '', sentenceAfter: ' είμαστε εδώ.', hint: 'Мы здесь.',
    choices: ['Εμείς', 'Εσύ', 'Εσείς'], correct: 'Εμείς',
    explanation: 'Εμείς значит «мы»; это местоимение подходит к είμαστε.',
  }),
  fixedQuestion('pronouns-polite-you-here', 'personal-pronouns', {
    instruction, sentenceBefore: '', sentenceAfter: ' είστε εδώ.', hint: 'Вы здесь; я вежливо обращаюсь к одному человеку.',
    choices: ['Εσείς', 'Εσύ', 'Εμείς'], correct: 'Εσείς',
    explanation: 'При вежливом обращении к одному человеку используют εσείς и είστε.',
  }),
  fixedQuestion('pronouns-polite-you-home', 'personal-pronouns', {
    instruction, sentenceBefore: '', sentenceAfter: ' είσαστε στο σπίτι.', hint: 'Вы дома; я вежливо обращаюсь к одному человеку.',
    choices: ['Εσείς', 'Εσύ', 'Αυτοί'], correct: 'Εσείς',
    explanation: 'εσείς подходит к είσαστε. Эта форма, как и είστε, используется с «вы».',
  }),
  fixedQuestion('pronouns-he-from-serbia', 'personal-pronouns', {
    instruction, sentenceBefore: '', sentenceAfter: ' είναι από τη Σερβία.', hint: 'Он из Сербии.',
    choices: ['Αυτός', 'Αυτή', 'Αυτοί'], correct: 'Αυτός',
    explanation: 'Подсказка говорит об одном мужчине: αυτός значит «он».',
  }),
  fixedQuestion('pronouns-she-home', 'personal-pronouns', {
    instruction, sentenceBefore: '', sentenceAfter: ' είναι στο σπίτι.', hint: 'Она дома.',
    choices: ['Αυτή', 'Αυτός', 'Αυτές'], correct: 'Αυτή',
    explanation: 'Подсказка говорит об одной женщине: αυτή значит «она».',
  }),
  fixedQuestion('pronouns-this-here', 'personal-pronouns', {
    instruction, sentenceBefore: '', sentenceAfter: ' είναι εδώ.', hint: 'Этот предмет здесь.',
    choices: ['Αυτό', 'Αυτή', 'Αυτοί'], correct: 'Αυτό',
    explanation: 'Для одного предмета в такой фразе подходит αυτό: «это здесь».',
  }),
  fixedQuestion('pronouns-men-here', 'personal-pronouns', {
    instruction, sentenceBefore: '', sentenceAfter: ' είναι εδώ.', hint: 'Эти мужчины здесь.',
    choices: ['Αυτοί', 'Αυτές', 'Αυτά'], correct: 'Αυτοί',
    explanation: 'Подсказка говорит о мужчинах: αυτοί значит «они» о мужчинах или смешанной группе.',
  }),
  fixedQuestion('pronouns-women-home', 'personal-pronouns', {
    instruction, sentenceBefore: '', sentenceAfter: ' είναι στο σπίτι.', hint: 'Эти женщины дома.',
    choices: ['Αυτές', 'Αυτοί', 'Αυτά'], correct: 'Αυτές',
    explanation: 'Подсказка говорит о женщинах: αυτές значит «они» о группе женщин.',
  }),
  fixedQuestion('pronouns-things-home', 'personal-pronouns', {
    instruction, sentenceBefore: '', sentenceAfter: ' είναι στο σπίτι.', hint: 'Эти вещи дома.',
    choices: ['Αυτά', 'Αυτές', 'Αυτοί'], correct: 'Αυτά',
    explanation: 'Подсказка говорит о нескольких предметах: αυτά значит «они» о предметах среднего рода.',
  }),

  fixedQuestion('genitive-our-house', 'personal-pronouns-genitive', {
    instruction, sentenceBefore: 'Το σπίτι ', sentenceAfter: '.', hint: 'Наш дом.',
    choices: ['μου', 'σου', 'μας'], correct: 'μας',
    explanation: 'После названия предмета μας показывает владельцев: το σπίτι μας — «наш дом».',
  }),
  fixedQuestion('genitive-your-book', 'personal-pronouns-genitive', {
    instruction, sentenceBefore: 'Το βιβλίο ', sentenceAfter: '.', hint: 'Твоя книга.',
    choices: ['του', 'σου', 'της'], correct: 'σου',
    explanation: 'После существительного σου показывает, что книга принадлежит собеседнику.',
  }),
  fixedQuestion('genitive-his-music', 'personal-pronouns-genitive', {
    instruction, sentenceBefore: 'Η μουσική ', sentenceAfter: '.', hint: 'Его музыка.',
    choices: ['του', 'της', 'σας'], correct: 'του',
    explanation: 'После существительного του показывает, что музыка принадлежит ему.',
  }),
  fixedQuestion('genitive-their-books', 'personal-pronouns-genitive', {
    instruction, sentenceBefore: 'Τα βιβλία ', sentenceAfter: '.', hint: 'Их книги.',
    choices: ['τους', 'μας', 'σας'], correct: 'τους',
    explanation: 'После существительного τους показывает, что книги принадлежат им.',
  }),
  fixedQuestion('genitive-your-houses', 'personal-pronouns-genitive', {
    instruction, sentenceBefore: 'Τα σπίτια ', sentenceAfter: '.', hint: 'Ваши дома.',
    choices: ['σας', 'τους', 'μου'], correct: 'σας',
    explanation: 'После существительного σας показывает, что дома принадлежат вам.',
  }),
  fixedQuestion('genitive-her-book', 'personal-pronouns-genitive', {
    instruction, sentenceBefore: 'Το βιβλίο ', sentenceAfter: '.', hint: 'Её книга.',
    choices: ['του', 'της', 'μου'], correct: 'της',
    explanation: 'После существительного της показывает, что книга принадлежит ей.',
  }),
  fixedQuestion('genitive-my-music', 'personal-pronouns-genitive', {
    instruction, sentenceBefore: 'Η μουσική ', sentenceAfter: '.', hint: 'Моя музыка.',
    choices: ['μου', 'σου', 'τους'], correct: 'μου',
    explanation: 'После существительного μου показывает, что музыка принадлежит мне.',
  }),
  fixedQuestion('genitive-our-books', 'personal-pronouns-genitive', {
    instruction, sentenceBefore: 'Τα βιβλία ', sentenceAfter: '.', hint: 'Наши книги.',
    choices: ['μας', 'σας', 'της'], correct: 'μας',
    explanation: 'После существительного μας показывает, что книги принадлежат нам.',
  }),
  fixedQuestion('genitive-me-coffee', 'personal-pronouns-genitive', {
    instruction, sentenceBefore: '', sentenceAfter: ' αρέσει ο καφές.', hint: 'Мне нравится кофе.',
    choices: ['Μου', 'Σου', 'Μας'], correct: 'Μου',
    explanation: 'Перед глаголом Μου здесь означает «мне». После существительного эта же форма может показывать принадлежность.',
  }),
  fixedQuestion('genitive-her-music', 'personal-pronouns-genitive', {
    instruction, sentenceBefore: '', sentenceAfter: ' αρέσει η μουσική.', hint: 'Ей нравится музыка.',
    choices: ['Της', 'Του', 'Σας'], correct: 'Της',
    explanation: 'Перед αρέσει форма Της показывает, кому нравится музыка: ей.',
  }),
  fixedQuestion('genitive-you-coffee', 'personal-pronouns-genitive', {
    instruction, sentenceBefore: '', sentenceAfter: ' αρέσει ο καφές;', hint: 'Тебе нравится кофе?',
    choices: ['Σου', 'Μου', 'Του'], correct: 'Σου',
    explanation: 'Перед αρέσει форма Σου отвечает на вопрос «кому?» и значит «тебе».',
  }),
  fixedQuestion('genitive-him-book', 'personal-pronouns-genitive', {
    instruction, sentenceBefore: '', sentenceAfter: ' δίνω το βιβλίο.', hint: 'Я даю ему книгу.',
    choices: ['Του', 'Της', 'Μας'], correct: 'Του',
    explanation: 'Перед δίνω форма Του указывает, кому я даю книгу: ему.',
  }),
  fixedQuestion('genitive-us-book', 'personal-pronouns-genitive', {
    instruction, sentenceBefore: '', sentenceAfter: ' δίνουν ένα βιβλίο.', hint: 'Нам дают книгу.',
    choices: ['Μας', 'Σας', 'Τους'], correct: 'Μας',
    explanation: 'Перед δίνουν форма Μας указывает, кому дают книгу: нам.',
  }),
  fixedQuestion('genitive-you-book', 'personal-pronouns-genitive', {
    instruction, sentenceBefore: '', sentenceAfter: ' δίνω το βιβλίο.', hint: 'Я даю вам книгу.',
    choices: ['Σας', 'Μου', 'Της'], correct: 'Σας',
    explanation: 'Перед δίνω форма Σας указывает, кому я даю книгу: вам.',
  }),
  fixedQuestion('genitive-them-book', 'personal-pronouns-genitive', {
    instruction, sentenceBefore: '', sentenceAfter: ' δίνω το βιβλίο.', hint: 'Я даю им книгу.',
    choices: ['Τους', 'Του', 'Σου'], correct: 'Τους',
    explanation: 'Перед δίνω форма Τους указывает, кому я даю книгу: им.',
  }),

  fixedQuestion('eimai-we-home', 'verb-eimai', {
    instruction, sentenceBefore: 'Εμείς ', sentenceAfter: ' στο σπίτι.', hint: 'Мы дома.',
    choices: ['είμαστε', 'είστε', 'είσαστε'], correct: 'είμαστε',
    explanation: 'После Εμείς подходит είμαστε: Εμείς είμαστε στο σπίτι — «Мы дома».',
  }),
  fixedQuestion('eimai-we-here', 'verb-eimai', {
    instruction, sentenceBefore: 'Εμείς ', sentenceAfter: ' εδώ.', hint: 'Мы здесь.',
    choices: ['είμαστε', 'είμαι', 'είναι'], correct: 'είμαστε',
    explanation: 'С «мы» используется είμαστε.',
  }),
  fixedQuestion('eimai-you-home', 'verb-eimai', {
    instruction, sentenceBefore: 'Εσύ ', sentenceAfter: ' στο σπίτι.', hint: 'Ты дома.',
    choices: ['είσαι', 'είμαι', 'είμαστε'], correct: 'είσαι',
    explanation: 'С «ты» используется είσαι: Εσύ είσαι στο σπίτι.',
  }),
  fixedQuestion('eimai-you-greece', 'verb-eimai', {
    instruction, sentenceBefore: 'Εσύ ', sentenceAfter: ' από την Ελλάδα.', hint: 'Ты из Греции.',
    choices: ['είσαι', 'είστε', 'είσαστε'], correct: 'είσαι',
    explanation: 'После Εσύ нужна форма είσαι; είστε и είσαστε используются с εσείς.',
  }),
  fixedQuestion('eimai-i-serbia', 'verb-eimai', {
    instruction, sentenceBefore: 'Εγώ ', sentenceAfter: ' από τη Σερβία.', hint: 'Я из Сербии.',
    choices: ['είμαι', 'είσαι', 'είμαστε'], correct: 'είμαι',
    explanation: 'С «я» используется είμαι.',
  }),
  fixedQuestion('eimai-i-doctor', 'verb-eimai', {
    instruction, sentenceBefore: 'Εγώ ', sentenceAfter: ' γιατρός.', hint: 'Я врач.',
    choices: ['είμαι', 'είναι', 'είμαστε'], correct: 'είμαι',
    explanation: 'В Εγώ είμαι γιατρός форма είμαι говорит о себе; по-русски слово «быть» опускается.',
  }),
  fixedQuestion('eimai-he-serbia', 'verb-eimai', {
    instruction, sentenceBefore: 'Αυτός ', sentenceAfter: ' από τη Σερβία.', hint: 'Он из Сербии.',
    choices: ['είναι', 'είσαι', 'είμαι'], correct: 'είναι',
    explanation: 'С αυτός используется είναι: Αυτός είναι από τη Σερβία.',
  }),
  fixedQuestion('eimai-she-home', 'verb-eimai', {
    instruction, sentenceBefore: 'Αυτή ', sentenceAfter: ' στο σπίτι.', hint: 'Она дома.',
    choices: ['είναι', 'είμαστε', 'είσαι'], correct: 'είναι',
    explanation: 'С αυτή используется είναι.',
  }),
  fixedQuestion('eimai-child-here', 'verb-eimai', {
    instruction, sentenceBefore: 'Το παιδί ', sentenceAfter: ' εδώ.', hint: 'Ребёнок здесь.',
    choices: ['είναι', 'είμαστε', 'είσαι'], correct: 'είναι',
    explanation: 'В фразе о ребёнке используется форма είναι: Το παιδί είναι εδώ.',
  }),
  fixedQuestion('eimai-father-home', 'verb-eimai', {
    instruction, sentenceBefore: 'Ο πατέρας ', sentenceAfter: ' στο σπίτι.', hint: 'Отец дома.',
    choices: ['είναι', 'είστε', 'είσαστε'], correct: 'είναι',
    explanation: 'В фразе об отце используется είναι: Ο πατέρας είναι στο σπίτι.',
  }),
  fixedQuestion('eimai-friends-here', 'verb-eimai', {
    instruction, sentenceBefore: 'Οι φίλοι ', sentenceAfter: ' εδώ.', hint: 'Друзья здесь.',
    choices: ['είναι', 'είμαι', 'είστε'], correct: 'είναι',
    explanation: 'В фразе о φίλοι используется форма είναι: Οι φίλοι είναι εδώ.',
  }),
  fixedQuestion('eimai-polite-you', 'verb-eimai', {
    instruction, sentenceBefore: 'Εσείς ', sentenceAfter: ' εδώ.', hint: 'Вы здесь; я вежливо обращаюсь к одному человеку.',
    choices: ['είσαστε', 'είναι', 'είμαστε'], correct: 'είσαστε',
    explanation: 'С εσείς верны είστε и είσαστε; здесь выбрана форма είσαστε.',
  }),

  fixedQuestion('numbers-zero', 'numbers', {
    instruction, sentenceBefore: '0 = ', sentenceAfter: '', hint: 'Прочитай число по-гречески.',
    choices: ['μηδέν', 'δέκα', 'ένα'], correct: 'μηδέν',
    explanation: '0 по-гречески — μηδέν.',
  }),
  fixedQuestion('numbers-one', 'numbers', {
    instruction, sentenceBefore: '1 = ', sentenceAfter: '', hint: 'Прочитай число по-гречески.',
    choices: ['ένα', 'δύο', 'δέκα'], correct: 'ένα',
    explanation: '1 записывается как ένα.',
  }),
  fixedQuestion('numbers-twenty-four', 'numbers', {
    instruction, sentenceBefore: '24 = ', sentenceAfter: '', hint: 'Прочитай число по-гречески.',
    choices: ['είκοσι τέσσερα', 'είκοσι τρία', 'τέσσερα'], correct: 'είκοσι τέσσερα',
    explanation: '24 — это 20 и 4: είκοσι τέσσερα.',
  }),
  fixedQuestion('numbers-seventy-three', 'numbers', {
    instruction, sentenceBefore: '73 = ', sentenceAfter: '', hint: 'Прочитай число по-гречески.',
    choices: ['εβδομήντα τρία', 'εβδομήντα', 'εξήντα τρία'], correct: 'εβδομήντα τρία',
    explanation: '73 состоит из 70 и 3: εβδομήντα τρία.',
  }),
  fixedQuestion('numbers-hundred', 'numbers', {
    instruction, sentenceBefore: '100 = ', sentenceAfter: '', hint: 'Прочитай число по-гречески.',
    choices: ['εκατό', 'εκατόν ένα', 'διακόσια'], correct: 'εκατό',
    explanation: '100 по-гречески — εκατό.',
  }),
  fixedQuestion('numbers-coffee-two-euros', 'numbers', {
    instruction, sentenceBefore: 'Ο καφές κάνει ', sentenceAfter: ' ευρώ.', hint: 'Кофе стоит 2 евро.',
    choices: ['δύο', 'τρία', 'πέντε'], correct: 'δύο',
    explanation: 'δύο означает 2: Ο καφές κάνει δύο ευρώ — «Кофе стоит 2 евро».',
  }),
  fixedQuestion('numbers-coffee-four-euros', 'numbers', {
    instruction, sentenceBefore: 'Ο καφές κάνει ', sentenceAfter: ' ευρώ.', hint: 'Кофе стоит 4 евро.',
    choices: ['τέσσερα', 'τρία', 'πέντε'], correct: 'τέσσερα',
    explanation: '4 по-гречески — τέσσερα; слово ευρώ не меняется.',
  }),
  fixedQuestion('numbers-ticket-seventy-cents', 'numbers', {
    instruction, sentenceBefore: 'Το εισιτήριο κάνει ', sentenceAfter: ' λεπτά.', hint: 'Билет стоит 70 центов.',
    choices: ['εβδομήντα', 'ογδόντα', 'εξήντα'], correct: 'εβδομήντα',
    explanation: '70 по-гречески — εβδομήντα; здесь это 70 λεπτά, то есть 70 центов.',
  }),
  fixedQuestion('numbers-ticket-eighty-cents', 'numbers', {
    instruction, sentenceBefore: 'Το εισιτήριο κάνει ', sentenceAfter: ' λεπτά.', hint: 'Билет стоит 80 центов.',
    choices: ['ογδόντα', 'εβδομήντα', 'ενενήντα'], correct: 'ογδόντα',
    explanation: '80 по-гречески — ογδόντα; здесь это 80 λεπτά, то есть 80 центов.',
  }),
  fixedQuestion('numbers-sequence-two', 'numbers', {
    instruction, sentenceBefore: 'δύο, τέσσερα, έξι, ', sentenceAfter: '.', hint: 'Продолжи ряд; каждое число увеличивается на два.',
    choices: ['οκτώ', 'επτά', 'εννέα'], correct: 'οκτώ',
    explanation: 'δύο, τέσσερα, έξι — это 2, 4, 6. Следующее число — 8, οκτώ.',
  }),
  fixedQuestion('numbers-sequence-five', 'numbers', {
    instruction, sentenceBefore: 'πέντε, δέκα, δεκαπέντε, ', sentenceAfter: '.', hint: 'Продолжи ряд; каждый раз прибавляется пять.',
    choices: ['είκοσι', 'δεκαοκτώ', 'είκοσι πέντε'], correct: 'είκοσι',
    explanation: 'Это 5, 10, 15; после прибавления ещё пяти получится 20 — είκοσι.',
  }),
  fixedQuestion('numbers-sequence-ten', 'numbers', {
    instruction, sentenceBefore: 'δέκα, είκοσι, τριάντα, ', sentenceAfter: '.', hint: 'Продолжи ряд; каждый раз прибавляется десять.',
    choices: ['σαράντα', 'πενήντα', 'τριάντα τέσσερα'], correct: 'σαράντα',
    explanation: 'Это 10, 20, 30; следующее число — 40, σαράντα.',
  }),
  fixedQuestion('numbers-sequence-ten-starting-twenty', 'numbers', {
    instruction, sentenceBefore: 'είκοσι, τριάντα, σαράντα, ', sentenceAfter: '.', hint: 'Продолжи ряд; каждый раз прибавляется десять.',
    choices: ['πενήντα', 'εξήντα', 'σαράντα τρία'], correct: 'πενήντα',
    explanation: 'Это 20, 30, 40; следующее число — 50, πενήντα.',
  }),
]

function normalize(value: string): string {
  return value.normalize('NFC').trim().replace(/\s+/gu, ' ').toLocaleLowerCase('ru')
}

export function completeFillGapSentence(question: FillGapQuestion): string {
  const answer = question.options.find((option) => option.id === question.correctOptionId)?.text ?? ''
  return `${question.sentenceBefore}${answer}${question.sentenceAfter}`
}

export function validateFillGapQuestionBank(
  questions: FillGapQuestion[] = trainerFillGapQuestions,
  topics = trainerTopics,
): string[] {
  const errors: string[] = []
  const questionIds = new Set<string>()
  const topicById = new Map(topics.map((topic) => [topic.id, topic]))

  for (const question of questions) {
    if (questionIds.has(question.id)) errors.push(`Повторяется задание с пропуском: ${question.id}`)
    questionIds.add(question.id)
    const topic = topicById.get(question.topicId)
    if (!question.id || !question.topicId || question.type !== 'fill-gaps'
      || !question.instruction.trim() || !question.hint.trim() || !question.explanation.trim()
      || (!question.sentenceBefore.trim() && !question.sentenceAfter.trim())) {
      errors.push(`Неполные данные задания с пропуском: ${question.id}`)
    }
    if (!topic || !topic.availableExercises.includes('fill-gaps')) {
      errors.push(`Для задания ${question.id} не зарегистрирована тема с упражнением fill-gaps`)
    }
    if (/_{2,}|□|\[\s*gap\s*\]/iu.test(`${question.sentenceBefore}${question.sentenceAfter}`)) {
      errors.push(`В задании ${question.id} найдено больше одного места для пропуска`)
    }
    if (question.options.length < 3 || question.options.length > 4) {
      errors.push(`В задании ${question.id} должно быть от трёх до четырёх вариантов`)
    }

    const optionIds = new Set<string>()
    const optionTexts = new Set<string>()
    for (const option of question.options) {
      if (optionIds.has(option.id)) errors.push(`Повторяется вариант ${option.id} в задании ${question.id}`)
      optionIds.add(option.id)
      const normalizedText = normalize(option.text)
      if (optionTexts.has(normalizedText)) errors.push(`Повторяется текст варианта в задании ${question.id}`)
      optionTexts.add(normalizedText)
      if (!option.id.trim() || !option.text.trim()) errors.push(`Пустой вариант ответа в задании ${question.id}`)
    }
    if (!optionIds.has(question.correctOptionId)) errors.push(`В задании ${question.id} не найден правильный вариант`)
    if (question.options.filter((option) => option.id === question.correctOptionId).length !== 1) {
      errors.push(`В задании ${question.id} должно быть ровно одно правильное поле ответа`)
    }
  }

  return errors
}
