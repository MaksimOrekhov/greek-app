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
    instruction, sentenceBefore: 'Το βιβλίο; ', sentenceAfter: ' είναι εδώ.', hint: 'Книга здесь.',
    choices: ['Αυτό', 'Αυτή', 'Αυτοί'], correct: 'Αυτό',
    explanation: 'Перед пропуском названо Το βιβλίο — «книга». Здесь это слово заменяет Αυτό: Αυτό είναι εδώ.',
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
    instruction, sentenceBefore: 'Τα βιβλία; ', sentenceAfter: ' είναι στο σπίτι.', hint: 'Книги дома.',
    choices: ['Αυτά', 'Αυτές', 'Αυτοί'], correct: 'Αυτά',
    explanation: 'Перед пропуском названы Τα βιβλία — «книги». Здесь эти слова заменяет Αυτά: Αυτά είναι στο σπίτι.',
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
  fixedQuestion('acc-see-friend-masculine-os', 'noun-accusative', {
    instruction, sentenceBefore: 'Βλέπω ', sentenceAfter: ' φίλο.', hint: 'Я вижу друга.',
    choices: ['ο', 'τον', 'του'], correct: 'τον',
    explanation: 'Полное предложение: Βλέπω τον φίλο. Друг здесь тот, кого видят, поэтому нужны винительный падеж и форма τον φίλο.',
  }),
  fixedQuestion('acc-wait-father-masculine-as', 'noun-accusative', {
    instruction, sentenceBefore: 'Η Μαρία περιμένει ', sentenceAfter: '.', hint: 'Мария ждёт отца.',
    choices: ['ο πατέρας', 'τον πατέρα', 'του πατέρα'], correct: 'τον πατέρα',
    explanation: 'Полное предложение: Η Μαρία περιμένει τον πατέρα. Отец — тот, кого ждёт Мария, поэтому выбираем τον πατέρα.',
  }),
  fixedQuestion('acc-ask-student-masculine-is', 'noun-accusative', {
    instruction, sentenceBefore: 'Ο δάσκαλος ρωτάει ', sentenceAfter: '.', hint: 'Учитель спрашивает ученика.',
    choices: ['ο μαθητής', 'τον μαθητή', 'του μαθητή'], correct: 'τον μαθητή',
    explanation: 'Полное предложение: Ο δάσκαλος ρωτάει τον μαθητή. Ученик — тот, кого спрашивает учитель: ο μαθητής становится τον μαθητή.',
  }),
  fixedQuestion('acc-see-friend-feminine-i', 'noun-accusative', {
    instruction, sentenceBefore: 'Βλέπω ', sentenceAfter: ' φίλη.', hint: 'Я вижу подругу.',
    choices: ['η', 'τη', 'της'], correct: 'τη',
    explanation: 'Полное предложение: Βλέπω τη φίλη. Перед согласной φ в женском винительном падеже пишется τη.',
  }),
  fixedQuestion('acc-wait-sister-feminine-vowel', 'noun-accusative', {
    instruction, sentenceBefore: 'Η Ελένη περιμένει ', sentenceAfter: '.', hint: 'Элени ждёт сестру.',
    choices: ['τη αδελφή', 'την αδελφή', 'της αδελφής'], correct: 'την αδελφή',
    explanation: 'Полное предложение: Η Ελένη περιμένει την αδελφή. Перед гласной в женском винительном артикле сохраняется ν.',
  }),
  fixedQuestion('acc-read-newspaper-feminine-vowel', 'noun-accusative', {
    instruction, sentenceBefore: 'Διαβάζω ', sentenceAfter: ' κάθε πρωί.', hint: 'Я читаю газету каждое утро.',
    choices: ['τη εφημερίδα', 'την εφημερίδα', 'της εφημερίδας'], correct: 'την εφημερίδα',
    explanation: 'Полное предложение: Διαβάζω την εφημερίδα κάθε πρωί. Перед гласной ε женский артикль пишется с ν.',
  }),
  fixedQuestion('acc-buy-shirt-neuter-o', 'noun-accusative', {
    instruction, sentenceBefore: 'Αγοράζω ', sentenceAfter: '.', hint: 'Я покупаю рубашку.',
    choices: ['το πουκάμισο', 'τον πουκάμισο', 'του πουκάμισου'], correct: 'το πουκάμισο',
    explanation: 'Полное предложение: Αγοράζω το πουκάμισο. Рубашка здесь — то, что покупают, поэтому нужна форма винительного падежа το πουκάμισο. Του πουκάμισου — нормативная форма родительного падежа, но в этом предложении она не подходит.',
  }),
  fixedQuestion('acc-see-dog-masculine-os', 'noun-accusative', {
    instruction, sentenceBefore: 'Το αγόρι βλέπει ', sentenceAfter: '.', hint: 'Мальчик видит собаку.',
    choices: ['ο σκύλος', 'τον σκύλο', 'του σκύλου'], correct: 'τον σκύλο',
    explanation: 'Полное предложение: Το αγόρι βλέπει τον σκύλο. Собака — прямое дополнение; для этой модели нужны τον и форма σκύλο.',
  }),
  fixedQuestion('acc-read-book-neuter-i', 'noun-accusative', {
    instruction, sentenceBefore: 'Ο φίλος διαβάζει ', sentenceAfter: '.', hint: 'Друг читает книгу.',
    choices: ['το βιβλίο', 'τον βιβλίο', 'του βιβλίου'], correct: 'το βιβλίο',
    explanation: 'Полное предложение: Ο φίλος διαβάζει το βιβλίο. В этой форме среднего рода артикль и существительное не меняются.',
  }),
  fixedQuestion('acc-see-teacher-masculine-os', 'noun-accusative', {
    instruction, sentenceBefore: 'Η μαθήτρια βλέπει ', sentenceAfter: '.', hint: 'Ученица видит учителя.',
    choices: ['ο δάσκαλος', 'τον δάσκαλο', 'του δασκάλου'], correct: 'τον δάσκαλο',
    explanation: 'Полное предложение: Η μαθήτρια βλέπει τον δάσκαλο. Учитель — тот, кого видит ученица; выбираем винительный падеж.',
  }),
  fixedQuestion('acc-student-form-masculine-is', 'noun-accusative', {
    instruction, sentenceBefore: 'Περιμένω ', sentenceAfter: '.', hint: 'Я жду ученика.',
    choices: ['ο μαθητής', 'τον μαθητή', 'του μαθητή'], correct: 'τον μαθητή',
    explanation: 'Полное предложение: Περιμένω τον μαθητή. После «жду» ученик — прямое дополнение: ο μαθητής → τον μαθητή.',
  }),
  fixedQuestion('acc-see-elena-feminine-proper-vowel', 'noun-accusative', {
    instruction, sentenceBefore: 'Ο φίλος βλέπει ', sentenceAfter: '.', hint: 'Друг видит Элени.',
    choices: ['η Ελένη', 'την Ελένη', 'της Ελένης'], correct: 'την Ελένη',
    explanation: 'Полное предложение: Ο φίλος βλέπει την Ελένη. Имя — прямое дополнение; перед гласной артикль пишется как την.',
  }),
  fixedQuestion('acc-ask-teacher-feminine-a', 'noun-accusative', {
    instruction, sentenceBefore: 'Η μαθήτρια ρωτάει ', sentenceAfter: '.', hint: 'Ученица спрашивает учительницу.',
    choices: ['η δασκάλα', 'τη δασκάλα', 'της δασκάλας'], correct: 'τη δασκάλα',
    explanation: 'Полное предложение: Η μαθήτρια ρωτάει τη δασκάλα. Действие направлено на учительницу; перед согласной δ пишется женский артикль τη.',
  }),
  fixedQuestion('acc-see-mother-feminine-a', 'noun-accusative', {
    instruction, sentenceBefore: 'Η Ελένη βλέπει ', sentenceAfter: '.', hint: 'Элени видит мать.',
    choices: ['η μητέρα', 'τη μητέρα', 'της μητέρας'], correct: 'τη μητέρα',
    explanation: 'Полное предложение: Η Ελένη βλέπει τη μητέρα. Перед согласной μ у женского артикля здесь нет ν; της μητέρας было бы родительным падежом.',
  }),
  fixedQuestion('acc-drink-juice-masculine-os', 'noun-accusative', {
    instruction, sentenceBefore: 'Ο φίλος πίνει ', sentenceAfter: '.', hint: 'Друг пьёт сок.',
    choices: ['ο χυμός', 'τον χυμό', 'το χυμό'], correct: 'τον χυμό',
    explanation: 'Полное предложение: Ο φίλος πίνει τον χυμό. Это существительное мужского рода: в винительном артикль пишется τον, а окончание меняется на -ό.',
  }),
  fixedQuestion('acc-buy-bread-neuter-i', 'noun-accusative', {
    instruction, sentenceBefore: 'Ο φίλος αγοράζει ', sentenceAfter: '.', hint: 'Друг покупает хлеб.',
    choices: ['το ψωμί', 'τον ψωμί', 'του ψωμιού'], correct: 'το ψωμί',
    explanation: 'Полное предложение: Ο φίλος αγοράζει το ψωμί. Το ψωμί — средний род; форма винительного совпадает с именительным.',
  }),
  fixedQuestion('acc-read-letter-neuter-ma', 'noun-accusative', {
    instruction, sentenceBefore: 'Ο μαθητής γράφει ', sentenceAfter: '.', hint: 'Ученик пишет письмо.',
    choices: ['το γράμμα', 'τον γράμμα', 'του γράμματος'], correct: 'το γράμμα',
    explanation: 'Полное предложение: Ο μαθητής γράφει το γράμμα. Существительное среднего рода на -μα остаётся в этой форме; артикль — το.',
  }),
  fixedQuestion('acc-read-exercise-feminine-i', 'noun-accusative', {
    instruction, sentenceBefore: 'Ο δάσκαλος διαβάζει ', sentenceAfter: '.', hint: 'Учитель читает упражнение.',
    choices: ['τη άσκηση', 'την άσκηση', 'της άσκησης'], correct: 'την άσκηση',
    explanation: 'Полное предложение: Ο δάσκαλος διαβάζει την άσκηση. Перед начальной гласной α женский артикль сохраняет ν.',
  }),
  fixedQuestion('acc-teacher-sees-student-subject', 'noun-accusative', {
    instruction, sentenceBefore: '', sentenceAfter: ' βλέπει τον μαθητή.', hint: 'Учитель видит ученика.',
    choices: ['Ο δάσκαλος', 'Τον δάσκαλο', 'Του δασκάλου'], correct: 'Ο δάσκαλος',
    explanation: 'Полное предложение: Ο δάσκαλος βλέπει τον μαθητή. Учитель выполняет действие, поэтому в начале предложения нужен именительный падеж.',
  }),
  fixedQuestion('acc-father-waits-bus-subject', 'noun-accusative', {
    instruction, sentenceBefore: '', sentenceAfter: ' περιμένει το λεωφορείο.', hint: 'Отец ждёт автобус.',
    choices: ['Ο πατέρας', 'Τον πατέρα', 'Του πατέρα'], correct: 'Ο πατέρας',
    explanation: 'Полное предложение: Ο πατέρας περιμένει το λεωφορείο. Отец ждёт, то есть выполняет действие; здесь нужна форма ο πατέρας.',
  }),
  fixedQuestion('acc-student-asks-teacher-object', 'noun-accusative', {
    instruction, sentenceBefore: 'Η μαθήτρια ρωτάει ', sentenceAfter: '.', hint: 'Ученица спрашивает учителя.',
    choices: ['ο δάσκαλος', 'τον δάσκαλο', 'του δασκάλου'], correct: 'τον δάσκαλο',
    explanation: 'Полное предложение: Η μαθήτρια ρωτάει τον δάσκαλο. Учитель — тот, кому задают вопрос; нужен винительный падеж.',
  }),
  fixedQuestion('acc-baby-sees-canary-neuter-i', 'noun-accusative', {
    instruction, sentenceBefore: 'Το μωρό βλέπει ', sentenceAfter: '.', hint: 'Малыш видит канарейку.',
    choices: ['το καναρίνι', 'τον καναρίνι', 'του καναρινιού'], correct: 'το καναρίνι',
    explanation: 'Полное предложение: Το μωρό βλέπει το καναρίνι. Слово среднего рода, поэтому артикль остаётся το.',
  }),
  fixedQuestion('acc-student-buys-dress-subject', 'noun-accusative', {
    instruction, sentenceBefore: '', sentenceAfter: ' αγοράζει το φόρεμα.', hint: 'Ученица покупает платье.',
    choices: ['Η μαθήτρια', 'Τη μαθήτρια', 'Της μαθήτριας'], correct: 'Η μαθήτρια',
    explanation: 'Полное предложение: Η μαθήτρια αγοράζει το φόρεμα. Ученица выполняет действие, поэтому используется именительный падеж.',
  }),
  fixedQuestion('acc-father-sees-student-object', 'noun-accusative', {
    instruction, sentenceBefore: 'Ο πατέρας βλέπει ', sentenceAfter: '.', hint: 'Отец видит ученика.',
    choices: ['ο μαθητής', 'τον μαθητή', 'του μαθητή'], correct: 'τον μαθητή',
    explanation: 'Полное предложение: Ο πατέρας βλέπει τον μαθητή. Отец выполняет действие, а ученик — тот, кого он видит: ο μαθητής → τον μαθητή.',
  }),
  fixedQuestion('object-pronouns-dog', 'object-pronouns', {
    instruction, sentenceBefore: 'Βλέπεις τον σκύλο; — Ναι, ', sentenceAfter: ' βλέπω.', hint: 'Видишь собаку? — Да, вижу её.',
    choices: ['τον', 'τη', 'το'], correct: 'τον',
    explanation: 'Ο σκύλος — мужского рода, хотя по-русски «собака» женского.',
  }),
  fixedQuestion('object-pronouns-newspaper', 'object-pronouns', {
    instruction, sentenceBefore: 'Διαβάζεις την εφημερίδα; — Ναι, ', sentenceAfter: ' διαβάζω.', hint: 'Читаешь газету? — Да, читаю её.',
    choices: ['τη', 'τον', 'το'], correct: 'τη',
    explanation: 'Η εφημερίδα — женского рода. Перед δ пишем τη.',
  }),
  fixedQuestion('object-pronouns-shirt', 'object-pronouns', {
    instruction, sentenceBefore: 'Έχεις το πουκάμισο; — Όχι, δεν ', sentenceAfter: ' έχω.', hint: 'У тебя есть рубашка? — Нет, её у меня нет.',
    choices: ['τον', 'το', 'την'], correct: 'το',
    explanation: 'Το πουκάμισο — среднего рода. После δεν местоимение остаётся перед глаголом.',
  }),
  fixedQuestion('object-pronouns-teacher', 'object-pronouns', {
    instruction, sentenceBefore: 'Καταλαβαίνεις τον καθηγητή; — Όχι, δεν ', sentenceAfter: ' καταλαβαίνω.', hint: 'Ты понимаешь преподавателя? — Нет, я его не понимаю.',
    choices: ['την', 'το', 'τον'], correct: 'τον',
    explanation: 'Ο καθηγητής — мужского рода. В ответе τον стоит перед καταλαβαίνω.',
  }),
  fixedQuestion('object-pronouns-maria', 'object-pronouns', {
    instruction, sentenceBefore: 'Περιμένεις τη Μαρία; — Ναι, ', sentenceAfter: ' περιμένω.', hint: 'Ждёшь Марию? — Да, жду её.',
    choices: ['το', 'τον', 'την'], correct: 'την',
    explanation: 'Η Μαρία — женского рода. Перед π пишем την.',
  }),
  fixedQuestion('object-pronouns-pencil', 'object-pronouns', {
    instruction, sentenceBefore: 'Θέλεις το μολύβι; — Ναι, ', sentenceAfter: ' θέλω.', hint: 'Хочешь карандаш? — Да, хочу его.',
    choices: ['τη', 'το', 'τον'], correct: 'το',
    explanation: 'Το μολύβι — среднего рода, хотя по-русски «карандаш» мужского.',
  }),
  fixedQuestion('object-pronouns-father', 'object-pronouns', {
    instruction, sentenceBefore: 'Ξέρεις τον πατέρα μου; — Ναι, ', sentenceAfter: ' ξέρω.', hint: 'Знаешь моего отца? — Да, знаю его.',
    choices: ['την', 'τον', 'το'], correct: 'τον',
    explanation: 'Ο πατέρας — мужского рода, поэтому в ответе τον.',
  }),
  fixedQuestion('object-pronouns-aspirin', 'object-pronouns', {
    instruction, sentenceBefore: 'Έχεις την ασπιρίνη; — Ναι, ', sentenceAfter: ' έχω.', hint: 'У тебя есть аспирин? — Да, он у меня.',
    choices: ['την', 'τον', 'το'], correct: 'την',
    explanation: 'Η ασπιρίνη — женского рода, а έχω начинается с гласной. Нужна форма την.',
  }),
  fixedQuestion('object-pronouns-lesson', 'object-pronouns', {
    instruction, sentenceBefore: 'Μαθαίνεις το μάθημα; — Ναι, ', sentenceAfter: ' μαθαίνω.', hint: 'Ты учишь урок? — Да, учу его.',
    choices: ['τη', 'τον', 'το'], correct: 'το',
    explanation: 'Το μάθημα — среднего рода. Его заменяет το.',
  }),
  fixedQuestion('object-pronouns-brother', 'object-pronouns', {
    instruction, sentenceBefore: 'Βλέπεις τον αδερφό σου; — Όχι, δεν ', sentenceAfter: ' βλέπω.', hint: 'Видишь своего брата? — Нет, я его не вижу.',
    choices: ['τον', 'τη', 'το'], correct: 'τον',
    explanation: 'Ο αδερφός — мужского рода. Отрицание не убирает ν из τον.',
  }),
  fixedQuestion('object-pronouns-coffee', 'object-pronouns', {
    instruction, sentenceBefore: 'Πληρώνεις τον καφέ; — Ναι, ', sentenceAfter: ' πληρώνω.', hint: 'Ты платишь за кофе? — Да, плачу за него.',
    choices: ['τον', 'την', 'το'], correct: 'τον',
    explanation: 'Ο καφές — мужского рода. Короткая форма относится к кофе.',
  }),
  fixedQuestion('object-pronouns-blouse', 'object-pronouns', {
    instruction, sentenceBefore: 'Θέλεις την μπλούζα; — Όχι, δεν ', sentenceAfter: ' θέλω.', hint: 'Хочешь блузку? — Нет, я её не хочу.',
    choices: ['τον', 'το', 'τη'], correct: 'τη',
    explanation: 'Перед μπλούζα в вопросе стоит την, а перед θέλω в ответе — τη. Род тот же.',
  }),
  fixedQuestion('object-pronouns-gift', 'object-pronouns', {
    instruction, sentenceBefore: 'Παίρνεις το δώρο; — Ναι, ', sentenceAfter: ' παίρνω.', hint: 'Берёшь подарок? — Да, беру его.',
    choices: ['την', 'τον', 'το'], correct: 'το',
    explanation: 'Το δώρο — среднего рода. Здесь το заменяет подарок.',
  }),
  fixedQuestion('object-pronouns-song', 'object-pronouns', {
    instruction, sentenceBefore: 'Ξέρεις το τραγούδι; — Ναι, ', sentenceAfter: ' ξέρω.', hint: 'Знаешь песню? — Да, я её знаю.',
    choices: ['την', 'το', 'τον'], correct: 'το',
    explanation: 'Το τραγούδι — среднего рода даже при переводе «песня».',
  }),
  fixedQuestion('object-pronouns-juice', 'object-pronouns', {
    instruction, sentenceBefore: 'Πίνεις τον χυμό; — Όχι, δεν ', sentenceAfter: ' πίνω.', hint: 'Пьёшь сок? — Нет, я его не пью.',
    choices: ['το', 'τον', 'την'], correct: 'τον',
    explanation: 'Ο χυμός — мужского рода. В ответе τον ставится перед πίνω.',
  }),
  fixedQuestion('object-pronouns-skirt', 'object-pronouns', {
    instruction, sentenceBefore: 'Αγοράζεις τη φούστα; — Ναι, ', sentenceAfter: ' αγοράζω.', hint: 'Покупаешь юбку? — Да, покупаю её.',
    choices: ['τον', 'το', 'την'], correct: 'την',
    explanation: 'Перед φ в вопросе пишем τη, перед гласной в αγοράζω — την.',
  }),
  fixedQuestion('object-pronouns-daughter', 'object-pronouns', {
    instruction, sentenceBefore: 'Ξέρεις την κόρη της; — Όχι, δεν ', sentenceAfter: ' ξέρω.', hint: 'Знаешь её дочь? — Нет, я её не знаю.',
    choices: ['το', 'την', 'τον'], correct: 'την',
    explanation: 'Η κόρη — женского рода. Перед ξ остаётся ν.',
  }),
  fixedQuestion('object-pronouns-key-question', 'object-pronouns', {
    instruction, sentenceBefore: 'Το κλειδί είναι εδώ. — ', sentenceAfter: ' βλέπεις;', hint: 'Ключ здесь. — Видишь его?',
    choices: ['Τη', 'Τον', 'Το'], correct: 'Το',
    explanation: 'В начале вопроса Το заменяет το κλειδί и стоит перед βλέπεις.',
  }),
  fixedQuestion('object-pronouns-dress', 'object-pronouns', {
    instruction, sentenceBefore: 'Βλέπεις το φόρεμα; — Ναι, ', sentenceAfter: ' βλέπω.', hint: 'Видишь платье? — Да, вижу его.',
    choices: ['το', 'τη', 'τον'], correct: 'το',
    explanation: 'Το φόρεμα — среднего рода. Форма το сама заменяет название платья.',
  }),
  fixedQuestion('object-pronouns-price', 'object-pronouns', {
    instruction, sentenceBefore: 'Γράφεις την τιμή; — Όχι, δεν ', sentenceAfter: ' γράφω.', hint: 'Ты записываешь цену? — Нет, не записываю её.',
    choices: ['τη', 'τον', 'το'], correct: 'τη',
    explanation: 'Η τιμή — женского рода. Перед γ в γράφω пишем τη.',
  }),
  fixedQuestion('se-article-floor', 'se-article', {
    instruction, sentenceBefore: 'Το δωμάτιό σας είναι ', sentenceAfter: ' τέταρτο όροφο.', hint: 'Ваш номер на четвёртом этаже.',
    choices: ['στον', 'στην', 'στο'], correct: 'στον',
    explanation: 'Όροφος — мужского рода. Σε + τον даёт στον.',
  }),
  fixedQuestion('se-article-piraeus', 'se-article', {
    instruction, sentenceBefore: 'Αύριο πάμε ', sentenceAfter: ' Πειραιά.', hint: 'Завтра мы едем в Пирей.',
    choices: ['στο', 'στον', 'στην'], correct: 'στον',
    explanation: 'Ο Πειραιάς — мужского рода. Направление к городу: στον Πειραιά.',
  }),
  fixedQuestion('se-article-home', 'se-article', {
    instruction, sentenceBefore: 'Τώρα είμαι ', sentenceAfter: ' σπίτι.', hint: 'Сейчас я дома.',
    choices: ['στη', 'στον', 'στο'], correct: 'στο',
    explanation: 'Το σπίτι — среднего рода. Σε + το даёт στο.',
  }),
  fixedQuestion('se-article-office', 'se-article', {
    instruction, sentenceBefore: 'Ο πατέρας μου δουλεύει ', sentenceAfter: ' γραφείο.', hint: 'Мой отец работает в офисе.',
    choices: ['στο', 'στη', 'στον'], correct: 'στο',
    explanation: 'Το γραφείο — среднего рода, поэтому στο γραφείο.',
  }),
  fixedQuestion('se-article-athens', 'se-article', {
    instruction, sentenceBefore: 'Η Άννα μένει ', sentenceAfter: ' Αθήνα.', hint: 'Анна живёт в Афинах.',
    choices: ['στο', 'στην', 'στον'], correct: 'στην',
    explanation: 'Η Αθήνα — женского рода. Перед гласной Α сохраняется ν.',
  }),
  fixedQuestion('se-article-sea', 'se-article', {
    instruction, sentenceBefore: 'Το Σάββατο πάμε ', sentenceAfter: ' θάλασσα.', hint: 'В субботу мы едем к морю.',
    choices: ['στο', 'στον', 'στη'], correct: 'στη',
    explanation: 'Η θάλασσα — женского рода. Перед θ пишем στη.',
  }),
  fixedQuestion('se-article-room', 'se-article', {
    instruction, sentenceBefore: 'Το κρεβάτι είναι ', sentenceAfter: ' δωμάτιο.', hint: 'Кровать находится в комнате.',
    choices: ['στη', 'στον', 'στο'], correct: 'στο',
    explanation: 'Το δωμάτιο — среднего рода, по-гречески στο δωμάτιο.',
  }),
  fixedQuestion('se-article-tavern', 'se-article', {
    instruction, sentenceBefore: 'Απόψε τρώμε ', sentenceAfter: ' ταβέρνα.', hint: 'Сегодня вечером мы едим в таверне.',
    choices: ['στο', 'στον', 'στην'], correct: 'στην',
    explanation: 'Η ταβέρνα — женского рода. Перед τ сохраняется ν.',
  }),
  fixedQuestion('se-article-museum', 'se-article', {
    instruction, sentenceBefore: 'Πηγαίνουμε ', sentenceAfter: ' μουσείο με το λεωφορείο.', hint: 'Мы едем в музей на автобусе.',
    choices: ['στο', 'στη', 'στον'], correct: 'στο',
    explanation: 'Το μουσείο — среднего рода. Здесь στο показывает направление вместе с πηγαίνουμε.',
  }),
  fixedQuestion('se-article-fridge', 'se-article', {
    instruction, sentenceBefore: 'Το τυρί είναι ', sentenceAfter: ' ψυγείο.', hint: 'Сыр в холодильнике.',
    choices: ['στον', 'στο', 'στην'], correct: 'στο',
    explanation: 'Το ψυγείο — среднего рода, поэтому στο. Здесь речь о месте.',
  }),
  fixedQuestion('se-article-square', 'se-article', {
    instruction, sentenceBefore: 'Ο φίλος μου με περιμένει ', sentenceAfter: ' πλατεία.', hint: 'Друг ждёт меня на площади.',
    choices: ['στον', 'στην', 'στο'], correct: 'στην',
    explanation: 'Η πλατεία — женского рода. Перед π пишем στην.',
  }),
  fixedQuestion('se-article-street', 'se-article', {
    instruction, sentenceBefore: 'Βλέπω τον Νίκο ', sentenceAfter: ' δρόμο.', hint: 'Я вижу Никоса на улице.',
    choices: ['στον', 'στη', 'στο'], correct: 'στον',
    explanation: 'Ο δρόμος — мужского рода. Σε + τον даёт στον.',
  }),
  fixedQuestion('se-article-bus-stop', 'se-article', {
    instruction, sentenceBefore: 'Το λεωφορείο σταματά ', sentenceAfter: ' στάση.', hint: 'Автобус останавливается на остановке.',
    choices: ['στον', 'στη', 'στο'], correct: 'στη',
    explanation: 'Η στάση — женского рода. Перед σ по школьной норме пишем στη.',
  }),
  fixedQuestion('se-article-bakery', 'se-article', {
    instruction, sentenceBefore: 'Αγοράζω ψωμί ', sentenceAfter: ' φούρνο.', hint: 'Я покупаю хлеб в пекарне.',
    choices: ['στο', 'στον', 'στη'], correct: 'στον',
    explanation: 'Ο φούρνος — мужского рода. В στον конечное ν сохраняется.',
  }),
  fixedQuestion('se-article-beach', 'se-article', {
    instruction, sentenceBefore: 'Πίνουμε καφέ ', sentenceAfter: ' παραλία.', hint: 'Мы пьём кофе на пляже.',
    choices: ['στο', 'στην', 'στον'], correct: 'στην',
    explanation: 'Η παραλία — женского рода. Перед π пишем στην.',
  }),
  fixedQuestion('se-article-balcony', 'se-article', {
    instruction, sentenceBefore: 'Το πρωί πίνω νερό ', sentenceAfter: ' μπαλκόνι.', hint: 'Утром я пью воду на балконе.',
    choices: ['στην', 'στον', 'στο'], correct: 'στο',
    explanation: 'Το μπαλκόνι — среднего рода. Для среднего рода используется στο.',
  }),
  fixedQuestion('se-article-school', 'se-article', {
    instruction, sentenceBefore: 'Τα παιδιά πηγαίνουν ', sentenceAfter: ' σχολείο.', hint: 'Дети идут в школу.',
    choices: ['στη', 'στον', 'στο'], correct: 'στο',
    explanation: 'Το σχολείο — среднего рода. Направление понятно из πηγαίνουν.',
  }),
  fixedQuestion('se-article-a-restaurant', 'se-article', {
    instruction, sentenceBefore: 'Για φαγητό πάμε ', sentenceAfter: ' ένα εστιατόριο.', hint: 'Поесть мы идём в один ресторан (не названный раньше).',
    choices: ['στην', 'σε', 'στο'], correct: 'σε',
    explanation: 'Перед уже написанным ένα оставляем отдельное σε. Στο включало бы определённый артикль.',
  }),
  fixedQuestion('se-article-a-house', 'se-article', {
    instruction, sentenceBefore: 'Το καλοκαίρι μένουμε ', sentenceAfter: ' ένα μικρό σπίτι.', hint: 'Летом мы живём в небольшом доме.',
    choices: ['στο', 'στον', 'σε'], correct: 'σε',
    explanation: 'В предложении уже есть ένα. С ним пишем σε ένα раздельно.',
  }),
  fixedQuestion('se-article-crete', 'se-article', {
    instruction, sentenceBefore: 'Ο Νίκος δουλεύει ', sentenceAfter: ' Κρήτη.', hint: 'Никос работает на Крите.',
    choices: ['στο', 'στην', 'στον'], correct: 'στην',
    explanation: 'Η Κρήτη — женского рода. Перед κ сохраняется ν.',
  }),
  fixedQuestion('adjective-agreement-shirt', 'adjective-agreement', {
    instruction, sentenceBefore: 'Θέλω ένα ', sentenceAfter: ' πουκάμισο.', hint: 'Я хочу белую рубашку.',
    choices: ['άσπρο', 'άσπρη', 'άσπρος'], correct: 'άσπρο',
    explanation: 'Το πουκάμισο — среднего рода. После ένα здесь подходит άσπρο.',
  }),
  fixedQuestion('adjective-agreement-blouse', 'adjective-agreement', {
    instruction, sentenceBefore: 'Η ', sentenceAfter: ' μπλούζα κάνει δέκα ευρώ.', hint: 'Красная блузка стоит десять евро.',
    choices: ['κόκκινος', 'κόκκινη', 'κόκκινο'], correct: 'κόκκινη',
    explanation: 'Η μπλούζα — женского рода. С η подходит κόκκινη.',
  }),
  fixedQuestion('adjective-agreement-trousers', 'adjective-agreement', {
    instruction, sentenceBefore: 'Αγοράζω το ', sentenceAfter: ' παντελόνι.', hint: 'Я покупаю чёрные брюки.',
    choices: ['μαύρη', 'μαύρος', 'μαύρο'], correct: 'μαύρο',
    explanation: 'Το παντελόνι — единственное число среднего рода, даже если по-русски «брюки».',
  }),
  fixedQuestion('adjective-agreement-belt', 'adjective-agreement', {
    instruction, sentenceBefore: 'Βλέπω την ', sentenceAfter: ' ζώνη.', hint: 'Я вижу зелёный ремень.',
    choices: ['πράσινος', 'πράσινη', 'πράσινο'], correct: 'πράσινη',
    explanation: 'Η ζώνη — женского рода. После βλέπω форма πράσινη сохраняется, а перед π пишется την.',
  }),
  fixedQuestion('adjective-agreement-suitcase', 'adjective-agreement', {
    instruction, sentenceBefore: 'Ψάχνω τη ', sentenceAfter: ' βαλίτσα μου.', hint: 'Я ищу свой голубой чемодан.',
    choices: ['γαλάζιος', 'γαλάζια', 'γαλάζιο'], correct: 'γαλάζια',
    explanation: 'Η βαλίτσα — женского рода. Слово γαλάζια начинается с γ, поэтому перед ним τη.',
  }),
  fixedQuestion('adjective-agreement-dress', 'adjective-agreement', {
    instruction, sentenceBefore: 'Η Άννα φοράει ένα ', sentenceAfter: ' φόρεμα.', hint: 'Анна носит жёлтое платье.',
    choices: ['κίτρινη', 'κίτρινος', 'κίτρινο'], correct: 'κίτρινο',
    explanation: 'Το φόρεμα — среднего рода. Его описывает κίτρινο.',
  }),
  fixedQuestion('adjective-agreement-ancient', 'adjective-agreement', {
    instruction, sentenceBefore: 'Στο μουσείο βλέπω ένα ', sentenceAfter: ' άγαλμα.', hint: 'В музее я вижу древнюю статую.',
    choices: ['αρχαίο', 'αρχαία', 'αρχαίος'], correct: 'αρχαίο',
    explanation: 'Το άγαλμα — среднего рода. После ένα нужно αρχαίο.',
  }),
  fixedQuestion('adjective-agreement-gift', 'adjective-agreement', {
    instruction, sentenceBefore: 'Δίνω στον φίλο μου ένα ', sentenceAfter: ' δώρο.', hint: 'Я дарю другу дорогой подарок.',
    choices: ['ακριβή', 'ακριβός', 'ακριβό'], correct: 'ακριβό',
    explanation: 'Το δώρο — среднего рода. Подходит ακριβό.',
  }),
  fixedQuestion('adjective-agreement-tall', 'adjective-agreement', {
    instruction, sentenceBefore: 'Ο ', sentenceAfter: ' άντρας περιμένει το λεωφορείο.', hint: 'Высокий мужчина ждёт автобус.',
    choices: ['ψηλός', 'ψηλή', 'ψηλό'], correct: 'ψηλός',
    explanation: 'Ожидает мужчина, поэтому ο ψηλός άντρας.',
  }),
  fixedQuestion('adjective-agreement-tourist', 'adjective-agreement', {
    instruction, sentenceBefore: 'Στην πλατεία βλέπω έναν ', sentenceAfter: ' άντρα.', hint: 'На площади я вижу невысокого мужчину.',
    choices: ['κοντός', 'κοντή', 'κοντό'], correct: 'κοντό',
    explanation: 'После βλέπω нужен винительный. Έναν κοντό άντρα — невысокого мужчину.',
  }),
  fixedQuestion('adjective-agreement-student', 'adjective-agreement', {
    instruction, sentenceBefore: 'Ο ', sentenceAfter: ' μαθητής γράφει το όνομά του.', hint: 'Умный ученик пишет своё имя.',
    choices: ['έξυπνη', 'έξυπνο', 'έξυπνος'], correct: 'έξυπνος',
    explanation: 'Пишет ученик. Здесь ο έξυπνος μαθητής — подлежащее.',
  }),
  fixedQuestion('adjective-agreement-friend', 'adjective-agreement', {
    instruction, sentenceBefore: 'Περιμένουμε την ', sentenceAfter: ' φίλη της Μαρίας.', hint: 'Мы ждём новую подругу Марии.',
    choices: ['καινούργια', 'καινούργιο', 'καινούργιος'], correct: 'καινούργια',
    explanation: 'Η φίλη — женского рода. После περιμένουμε форма καινούργια сохраняется. Перед κ пишем την.',
  }),
  fixedQuestion('adjective-agreement-soup', 'adjective-agreement', {
    instruction, sentenceBefore: 'Τρώω ', sentenceAfter: ' σούπα.', hint: 'Я ем вкусный суп.',
    choices: ['νόστιμη', 'νόστιμο', 'νόστιμος'], correct: 'νόστιμη',
    explanation: 'Η σούπα — женского рода. Подходит νόστιμη.',
  }),
  fixedQuestion('adjective-agreement-water', 'adjective-agreement', {
    instruction, sentenceBefore: 'Το νερό είναι ', sentenceAfter: '.', hint: 'Вода холодная.',
    choices: ['κρύος', 'κρύο', 'κρύα'], correct: 'κρύο',
    explanation: 'Το νερό — среднего рода. Даже после είναι выбираем κρύο по роду слова νερό.',
  }),
  fixedQuestion('adjective-agreement-man-tired', 'adjective-agreement', {
    instruction, sentenceBefore: 'Ο πατέρας μου είναι ', sentenceAfter: ' μετά τη δουλειά.', hint: 'Мой отец устал после работы.',
    choices: ['κουρασμένο', 'κουρασμένος', 'κουρασμένη'], correct: 'κουρασμένος',
    explanation: 'Ο πατέρας — мужского рода. Его состояние описывает κουρασμένος.',
  }),
  fixedQuestion('adjective-agreement-woman-rich', 'adjective-agreement', {
    instruction, sentenceBefore: 'Η γιαγιά του είναι ', sentenceAfter: '.', hint: 'Его бабушка богата.',
    choices: ['πλούσιο', 'πλούσιος', 'πλούσια'], correct: 'πλούσια',
    explanation: 'Η γιαγιά — женского рода, поэтому πλούσια.',
  }),
  fixedQuestion('adjective-agreement-store', 'adjective-agreement', {
    instruction, sentenceBefore: 'Βλέπω τον ', sentenceAfter: ' φούρνο από το μπαλκόνι.', hint: 'Я вижу старую пекарню с балкона.',
    choices: ['παλιός', 'παλιά', 'παλιό'], correct: 'παλιό',
    explanation: 'Ο φούρνος — мужского рода. После βλέπω сочетание становится τον παλιό φούρνο.',
  }),
  fixedQuestion('adjective-agreement-day', 'adjective-agreement', {
    instruction, sentenceBefore: 'Σήμερα είναι μια ', sentenceAfter: ' μέρα.', hint: 'Сегодня прекрасный день.',
    choices: ['ωραίος', 'ωραία', 'ωραίο'], correct: 'ωραία',
    explanation: 'Η μέρα — женского рода. С μια выбираем ωραία.',
  }),
  fixedQuestion('adjective-agreement-street', 'adjective-agreement', {
    instruction, sentenceBefore: 'Από το παράθυρο βλέπω τον ', sentenceAfter: ' δρόμο.', hint: 'Из окна я вижу большую улицу.',
    choices: ['μεγάλη', 'μεγάλος', 'μεγάλο'], correct: 'μεγάλο',
    explanation: 'Ο δρόμος — мужского рода. После βλέπω подходит винительный τον μεγάλο δρόμο.',
  }),
  fixedQuestion('adjective-agreement-story', 'adjective-agreement', {
    instruction, sentenceBefore: 'Η γιαγιά λέει μια ', sentenceAfter: ' ιστορία.', hint: 'Бабушка рассказывает забавную историю.',
    choices: ['αστείος', 'αστεία', 'αστείο'], correct: 'αστεία',
    explanation: 'Η ιστορία — женского рода. Подходит αστεία.',
  }),
  fixedQuestion('adjective-agreement-restaurant', 'adjective-agreement', {
    instruction, sentenceBefore: 'Το ', sentenceAfter: ' εστιατόριο είναι δίπλα στο ξενοδοχείο.', hint: 'Китайский ресторан рядом с гостиницей.',
    choices: ['κινέζικος', 'κινέζικο', 'κινέζικη'], correct: 'κινέζικο',
    explanation: 'Το εστιατόριο — среднего рода. В разговорной форме из урока подойдёт κινέζικο.',
  }),
  fixedQuestion('adjective-agreement-pullover', 'adjective-agreement', {
    instruction, sentenceBefore: 'Φοράω ', sentenceAfter: ' πουλόβερ.', hint: 'Я в синем свитере.',
    choices: ['το μπλε', 'την μπλε', 'τον μπλε'], correct: 'το μπλε',
    explanation: 'Πουλόβερ среднего рода. Подходит το μπλε πουλόβερ. Цвет μπλε не изменяется.',
  }),
  fixedQuestion('adjective-agreement-skirt', 'adjective-agreement', {
    instruction, sentenceBefore: 'Θέλω ', sentenceAfter: ' φούστα.', hint: 'Я хочу фиолетовую юбку.',
    choices: ['τη μοβ', 'το μοβ', 'τον μοβ'], correct: 'τη μοβ',
    explanation: 'Φούστα женского рода. Перед μ пишем τη, поэтому подходит τη μοβ φούστα. Цвет μοβ не изменяется.',
  }),
  fixedQuestion('adjective-agreement-brown-dog', 'adjective-agreement', {
    instruction, sentenceBefore: '', sentenceAfter: ' σκύλος είναι στο σπίτι.', hint: 'Коричневая собака дома.',
    choices: ['Ο καφέ', 'Η καφέ', 'Το καφέ'], correct: 'Ο καφέ',
    explanation: 'Σκύλος мужского рода, хотя русское «собака» женского. Подходит Ο καφέ σκύλος. Цвет καφέ не изменяется.',
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
