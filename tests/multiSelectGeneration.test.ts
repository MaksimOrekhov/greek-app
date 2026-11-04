import test from 'node:test'
import assert from 'node:assert/strict'
import {
  trainerMultiSelectQuestions,
  validateMultiSelectQuestionBank,
} from '../src/data/trainers/multiSelectQuestions.ts'
import type { MultiSelectQuestion } from '../src/data/trainers/multiSelectQuestions.ts'
import { VERIFIED_COUNTING_NUMBERS } from '../src/data/trainers/generation/verifiedContent.ts'
import { trainerTopics } from '../src/data/trainers/topics.ts'
import {
  generateMultiSelectQuestions,
  generatedQuestionTemplates,
} from '../src/lib/trainers/generation/multiSelectGenerator.ts'
import {
  loadRecentQuestionSignatures,
  multiSelectQuestionSignature,
  MULTI_SELECT_HISTORY_LIMIT_PER_TEMPLATE,
  rememberGeneratedQuestions,
  type MultiSelectHistoryStorage,
} from '../src/lib/trainers/generation/questionHistory.ts'
import {
  advanceMultiSelectSession,
  createMultiSelectSession,
  getMultiSelectSessionResults,
  submitMultiSelectAnswer,
  toggleMultiSelectOption,
} from '../src/lib/trainers/multiSelectSession.ts'

function seededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

const pronounMeaning: Record<string, string> = {
  εγώ: 'я', εσύ: 'ты', αυτός: 'он', αυτή: 'она', αυτό: 'оно',
  εμείς: 'мы', εσείς: 'вы', αυτοί: 'они', αυτές: 'они', αυτά: 'они',
}
const pronounVerb: Record<string, string> = {
  Εγώ: 'είμαι', Εσύ: 'είσαι', Αυτός: 'είναι', Αυτή: 'είναι',
  Εμείς: 'είμαστε', Εσείς: 'είστε', Αυτοί: 'είναι', Αυτές: 'είναι',
}
const pronounRussian: Record<string, string> = {
  Εγώ: 'Я', Εσύ: 'Ты', Αυτός: 'Он', Αυτή: 'Она', Εμείς: 'Мы', Εσείς: 'Вы', Αυτοί: 'Они', Αυτές: 'Они',
}
const predicateRussian: Record<string, string> = {
  εδώ: 'здесь', 'στο σπίτι': 'дома', 'στην Ελλάδα': 'в Греции', 'από τη Σερβία': 'из Сербии',
}
const possessiveRussian: Record<string, { masculine: string; feminine: string; plural: string }> = {
  μου: { masculine: 'мой', feminine: 'моя', plural: 'мои' },
  σου: { masculine: 'твой', feminine: 'твоя', plural: 'твои' },
  του: { masculine: 'его', feminine: 'его', plural: 'его' },
  της: { masculine: 'её', feminine: 'её', plural: 'её' },
  μας: { masculine: 'наш', feminine: 'наша', plural: 'наши' },
  σας: { masculine: 'ваш', feminine: 'ваша', plural: 'ваши' },
  τους: { masculine: 'их', feminine: 'их', plural: 'их' },
}
const recipientTranslations: Record<string, string> = {
  'Μου αρέσει ο καφές.': 'Мне нравится кофе.',
  'Μου αρέσει η μουσική.': 'Мне нравится музыка.',
  'Μου δίνουν ένα βιβλίο.': 'Мне дают книгу.',
  'Σου αρέσει ο καφές;': 'Тебе нравится кофе?',
  'Της αρέσει η μουσική.': 'Ей нравится музыка.',
  'Του δίνω το βιβλίο.': 'Я даю ему книгу.',
  'Μας δίνουν ένα βιβλίο.': 'Нам дают книгу.',
  'Σας δίνω το βιβλίο.': 'Я даю вам книгу.',
  'Τους δίνω το βιβλίο.': 'Я даю им книгу.',
}
const numberByWord: Record<string, number> = {
  μηδέν: 0, ένα: 1, δύο: 2, τρία: 3, τέσσερα: 4, πέντε: 5, έξι: 6, επτά: 7, οκτώ: 8, εννέα: 9,
  δέκα: 10, έντεκα: 11, δώδεκα: 12, δεκατρία: 13, δεκατέσσερα: 14, δεκαπέντε: 15, δεκαέξι: 16,
  δεκαεπτά: 17, δεκαοκτώ: 18, δεκαεννέα: 19, είκοσι: 20, 'είκοσι ένα': 21, 'είκοσι δύο': 22,
  'είκοσι τρία': 23, 'είκοσι τέσσερα': 24, 'είκοσι πέντε': 25, 'είκοσι οκτώ': 28, τριάντα: 30,
  'τριάντα ένα': 31, 'τριάντα τέσσερα': 34, σαράντα: 40, 'σαράντα τρία': 43, πενήντα: 50,
  'πενήντα τρία': 53, εξήντα: 60, 'εξήντα τρία': 63, εβδομήντα: 70, 'εβδομήντα τρία': 73,
  ογδόντα: 80, 'ογδόντα τρία': 83, 'ογδόντα εννέα': 89, ενενήντα: 90, 'ενενήντα τέσσερα': 94,
  εκατό: 100, 'εκατόν ένα': 101, 'εκατόν δύο': 102, 'εκατόν επτά': 107, 'εκατόν είκοσι': 120,
  'εκατόν είκοσι πέντε': 125, 'εκατόν σαράντα': 140, 'εκατόν εβδομήντα οκτώ': 178,
  'εκατόν ενενήντα εννέα': 199, διακόσια: 200,
}

function independentCorrectness(question: MultiSelectQuestion, text: string): boolean {
  if (question.templateId === 'pronoun-translation') {
    const [greek, russian] = text.split(' — ')
    return pronounMeaning[greek!] === russian
  }
  if (question.templateId === 'pronoun-groups') {
    const meanings = [...question.prompt.matchAll(/«([^»]+)»/gu)].map((match) => match[1])
    return meanings.includes(pronounMeaning[text!]!)
  }
  if (question.templateId === 'pronoun-sentence-translation') {
    const [greek, russian] = text.split(' — ')
    const sentence = greek!.match(/^(Εγώ|Εσύ|Αυτός|Αυτή|Εμείς|Εσείς|Αυτοί|Αυτές) (είμαι|είσαι|είναι|είμαστε|είστε) (.+)\.$/u)
    if (!sentence) return false
    const [, subject, verb, predicate] = sentence
    return pronounVerb[subject!] === verb && russian === `${pronounRussian[subject!]} ${predicateRussian[predicate!]}.`
  }
  if (question.templateId === 'genitive-ownership') {
    const [greek, russian] = text.split(' — ')
    const [nounPhrase, possessor] = greek!.match(/^(.*) (μου|σου|του|της|μας|σας|τους)$/u)!.slice(1)
    const russianNoun = nounPhrase === 'το σπίτι' ? 'дом'
      : nounPhrase === 'το βιβλίο' ? 'книга'
        : nounPhrase === 'η μουσική' ? 'музыка'
          : nounPhrase === 'τα βιβλία' ? 'книги' : 'дома'
    const owner = possessiveRussian[possessor!]!
    const gender = russianNoun === 'дом' ? 'masculine' : ['книги', 'дома'].includes(russianNoun) ? 'plural' : 'feminine'
    const adjective = owner[gender]
    return russian === `${adjective} ${russianNoun}`
  }
  if (question.templateId === 'genitive-recipient') {
    const [greek, russian] = text.split(' — ')
    return recipientTranslations[greek!] === russian
  }
  if (question.templateId === 'genitive-mou-meaning') return text.startsWith('Μου ')
  if (question.templateId === 'eimai-agreement') {
    const sentence = text.match(/^(Εγώ|Εσύ|Αυτός|Αυτή|Εμείς|Εσείς|Αυτοί|Αυτές) (είμαι|είσαι|είναι|είμαστε|είστε) /u)
    return !!sentence && pronounVerb[sentence[1]!] === sentence[2]
  }
  if (question.templateId === 'eimai-explicit-translation') {
    const [greek, russian] = text.split(' — ')
    const sentence = greek!.match(/^(Εγώ|Εσύ|Αυτός|Αυτή|Εμείς|Εσείς|Αυτοί|Αυτές) (είμαι|είσαι|είναι|είμαστε|είστε) (.+)\.$/u)
    if (!sentence) return false
    const [, subject, verb, predicate] = sentence
    return pronounVerb[subject!] === verb && russian === `${pronounRussian[subject!]} ${predicateRussian[predicate!]}.`
  }
  if (question.templateId === 'eimai-omitted-pronoun') {
    const [greek, russian] = text.split(' — ')
    const sentence = greek!.match(/^(Είμαι|Είσαι|Είμαστε|Είστε) (.+)\.$/u)
    if (!sentence) return false
    const subjectByForm: Record<string, string> = { Είμαι: 'Я', Είσαι: 'Ты', Είμαστε: 'Мы', Είστε: 'Вы' }
    return russian === `${subjectByForm[sentence[1]!]} ${predicateRussian[sentence[2]!]}.`
  }
  if (question.templateId?.startsWith('numbers-')) {
    const value = numberByWord[text!]
    assert.notEqual(value, undefined, `Unreviewed number form: ${text}`)
    if (question.templateId === 'numbers-above') {
      const threshold = Number(question.prompt.match(/больше (\d+)/u)![1])
      return value! > threshold
    }
    if (question.templateId === 'numbers-between') {
      const [, min, max] = question.prompt.match(/больше (\d+), но меньше (\d+)/u)!
      return value! > Number(min) && value! < Number(max)
    }
    const ending = Number(question.prompt.match(/на (\d+)\?$/u)![1])
    return value! % 10 === ending
  }
  assert.fail(`No independent oracle for ${question.templateId}`)
}

function assertGeneratedContent(question: MultiSelectQuestion): void {
  assert.ok(question.templateId)
  assert.ok(question.id.startsWith('generated-'))
  assert.ok(question.prompt.trim())
  assert.ok(question.explanation.trim())
  assert.ok(question.options.length >= 4)
  assert.equal(new Set(question.options.map((item) => item.id)).size, question.options.length)
  assert.equal(new Set(question.options.map((item) => item.text.normalize('NFC').toLocaleLowerCase('ru'))).size, question.options.length)
  assert.ok(question.options.filter((item) => item.correct).length >= 2)
  assert.ok(question.options.some((item) => !item.correct))
  for (const option of question.options) {
    if (question.templateId?.startsWith('numbers-')) assert.doesNotMatch(option.text, /\d/u)
    assert.equal(option.correct, independentCorrectness(question, option.text), `${question.id}: ${option.text}`)
  }
}

class MemoryStorage implements MultiSelectHistoryStorage {
  value: string | null = null
  getItem(): string | null { return this.value }
  setItem(_key: string, value: string): void { this.value = value }
}

test('each topic generates six questions from three distinct templates and keeps four bank questions', () => {
  assert.ok(trainerMultiSelectQuestions.length >= 49)
  for (const topic of trainerTopics) {
    assert.ok(trainerMultiSelectQuestions.filter((item) => item.topicId === topic.id).length >= 12, topic.id)
    assert.equal(generatedQuestionTemplates(topic.id).length, 3)

    const generated = generateMultiSelectQuestions(topic.id, seededRandom(54))
    assert.equal(generated.length, 6)
    assert.deepEqual(Object.values(generated.reduce<Record<string, number>>((counts, item) => {
      counts[item.templateId!] = (counts[item.templateId!] ?? 0) + 1
      return counts
    }, {})).sort(), [2, 2, 2])
    generated.forEach(assertGeneratedContent)

    const session = createMultiSelectSession(topic.id, trainerMultiSelectQuestions, seededRandom(89), undefined, generated)
    const questions = session.rounds.flatMap((round) => round.questions.map((item) => item.question))
    assert.equal(session.rounds.length, 5)
    assert.equal(questions.length, 10)
    assert.equal(questions.filter((item) => item.templateId).length, 6)
    assert.equal(questions.filter((item) => !item.templateId).length, 4)
    assert.equal(new Set(questions.map((item) => item.id)).size, 10)

    let answered = session
    for (let index = 0; index < 10; index += 1) {
      const active = answered.rounds[answered.currentRoundIndex]!.questions[answered.currentQuestionIndex]!
      assert.ok(active.optionOrder.every((id) => active.question.options.some((option) => option.id === id)))
      for (const option of active.question.options.filter((item) => item.correct)) {
        answered = toggleMultiSelectOption(answered, option.id).session
      }
      answered = submitMultiSelectAnswer(answered).session
      answered = advanceMultiSelectSession(answered)
    }
    assert.equal(answered.completed, true)
    assert.equal(getMultiSelectSessionResults(answered).correctAnswers, 10)
  }
})

test('adding a fixed question keeps the bank valid and preserves the session contract', () => {
  const sourceQuestion = trainerMultiSelectQuestions.find((item) => item.id === 'pronouns-self-and-other')!
  const addedQuestion: MultiSelectQuestion = {
    ...sourceQuestion,
    id: 'test-extra-pronouns-question',
    prompt: 'Отметь все греческие слова со значением «я», «ты» или «мы».',
    options: sourceQuestion.options.map((option, index) => ({
      ...option,
      id: `test-extra-pronouns-question-option-${index + 1}`,
    })),
  }
  const extendedBank = [...trainerMultiSelectQuestions, addedQuestion]

  assert.deepEqual(validateMultiSelectQuestionBank(extendedBank), [])
  assert.equal(trainerMultiSelectQuestions.some((item) => item.id === addedQuestion.id), false)

  const generated = generateMultiSelectQuestions('personal-pronouns', seededRandom(129))
  const session = createMultiSelectSession(
    'personal-pronouns',
    extendedBank,
    seededRandom(237),
    undefined,
    generated,
  )
  const questions = session.rounds.flatMap((round) => round.questions.map((item) => item.question))
  assert.equal(session.rounds.length, 5)
  assert.equal(questions.length, 10)
  assert.equal(questions.filter((item) => item.templateId).length, 6)
  assert.equal(questions.filter((item) => !item.templateId).length, 4)
  assert.equal(new Set(questions.map((item) => item.id)).size, 10)

  let answered = session
  for (let index = 0; index < 10; index += 1) {
    const active = answered.rounds[answered.currentRoundIndex]!.questions[answered.currentQuestionIndex]!
    for (const option of active.question.options.filter((item) => item.correct)) {
      answered = toggleMultiSelectOption(answered, option.id).session
    }
    answered = submitMultiSelectAnswer(answered).session
    answered = advanceMultiSelectSession(answered)
  }
  assert.equal(answered.completed, true)
  assert.equal(getMultiSelectSessionResults(answered).correctAnswers, 10)
})

test('fixed seeds reproduce results and different seeds change actual question content', () => {
  for (const topic of trainerTopics) {
    const first = generateMultiSelectQuestions(topic.id, seededRandom(420))
    const same = generateMultiSelectQuestions(topic.id, seededRandom(420))
    const different = generateMultiSelectQuestions(topic.id, seededRandom(421))
    assert.deepEqual(first, same)

    const firstSignatures = new Set(first.map(multiSelectQuestionSignature))
    const differentSignatures = new Set(different.map(multiSelectQuestionSignature))
    assert.ok([...firstSignatures].some((signature) => !differentSignatures.has(signature)), topic.id)
    assert.ok(first.some((question) => question.options.map((item) => item.text).join('|')
      !== different.find((item) => item.templateId === question.templateId && item.id === question.id)?.options.map((item) => item.text).join('|')))
    assert.equal(multiSelectQuestionSignature(first[0]!), multiSelectQuestionSignature({
      ...first[0]!,
      options: [...first[0]!.options].reverse(),
    }))
  }
})

test('ten seeded training starts change contents within every template and history does not increase repeats', () => {
  for (const topic of trainerTopics) {
    const storage = new MemoryStorage()
    const withHistory = new Set<string>()
    const withoutHistory = new Set<string>()
    const byTemplate = new Map<string, Set<string>>()
    for (let index = 0; index < 10; index += 1) {
      const randomSeed = 4450 + index
      const baseline = generateMultiSelectQuestions(topic.id, seededRandom(randomSeed))
      const recent = generateMultiSelectQuestions(topic.id, seededRandom(randomSeed), loadRecentQuestionSignatures(topic.id, storage))
      for (const question of baseline) withoutHistory.add(multiSelectQuestionSignature(question))
      for (const question of recent) {
        const signature = multiSelectQuestionSignature(question)
        withHistory.add(signature)
        const signatures = byTemplate.get(question.templateId!) ?? new Set<string>()
        signatures.add(signature)
        byTemplate.set(question.templateId!, signatures)
      }
      rememberGeneratedQuestions(topic.id, recent, storage)
    }
    assert.ok([...byTemplate.values()].every((signatures) => signatures.size >= 10), topic.id)
    assert.ok(withHistory.size >= withoutHistory.size, topic.id)
  }
})

test('finite number spellings match independent references at the gender and range boundaries', () => {
  assert.equal(new Set(VERIFIED_COUNTING_NUMBERS.map((item) => item.value)).size, VERIFIED_COUNTING_NUMBERS.length)
  assert.equal(new Set(VERIFIED_COUNTING_NUMBERS.map((item) => item.greek)).size, VERIFIED_COUNTING_NUMBERS.length)
  for (const item of VERIFIED_COUNTING_NUMBERS) assert.equal(numberByWord[item.greek], item.value)
  assert.deepEqual([
    numberByWord['ένα'], numberByWord['τρία'], numberByWord['τέσσερα'],
    numberByWord['εκατό'], numberByWord['εκατόν ένα'], numberByWord['εκατόν ενενήντα εννέα'], numberByWord['διακόσια'],
  ], [1, 3, 4, 100, 101, 199, 200])
})

test('two hundred seeded generations per topic stay structurally and linguistically bounded', () => {
  for (const [topicIndex, topic] of trainerTopics.entries()) {
    for (let seed = 0; seed < 200; seed += 1) {
      const generated = generateMultiSelectQuestions(topic.id, seededRandom(topicIndex * 10_000 + seed))
      assert.equal(generated.length, 6)
      assert.equal(new Set(generated.map((item) => item.id)).size, 6)
      assert.equal(new Set(generated.map(multiSelectQuestionSignature)).size, 6)
      generated.forEach(assertGeneratedContent)
    }
  }
})

test('recent history reduces repeats, is versioned, bounded, and survives broken storage', () => {
  const storage = new MemoryStorage()
  const first = generateMultiSelectQuestions('numbers', seededRandom(700))
  rememberGeneratedQuestions('numbers', first, storage)
  const recent = loadRecentQuestionSignatures('numbers', storage)
  assert.equal(Object.keys(recent).length, 3)

  const next = generateMultiSelectQuestions('numbers', seededRandom(700), recent)
  const oldSignatures = new Set(first.map(multiSelectQuestionSignature))
  assert.ok(next.filter((item) => oldSignatures.has(multiSelectQuestionSignature(item))).length < first.length)

  for (let seed = 0; seed < 30; seed += 1) {
    rememberGeneratedQuestions('numbers', generateMultiSelectQuestions('numbers', seededRandom(900 + seed)), storage)
  }
  const bounded = loadRecentQuestionSignatures('numbers', storage)
  assert.ok(Object.values(bounded).every((items) => items.length <= MULTI_SELECT_HISTORY_LIMIT_PER_TEMPLATE))
  assert.equal(JSON.parse(storage.value!).version, 1)

  storage.value = '{broken json'
  assert.deepEqual(loadRecentQuestionSignatures('numbers', storage), {})
  rememberGeneratedQuestions('numbers', first, storage)
  assert.doesNotThrow(() => JSON.parse(storage.value!))

  const failingStorage: MultiSelectHistoryStorage = {
    getItem() { throw new Error('storage blocked') },
    setItem() { throw new Error('storage blocked') },
  }
  assert.deepEqual(loadRecentQuestionSignatures('numbers', failingStorage), {})
  assert.doesNotThrow(() => rememberGeneratedQuestions('numbers', first, failingStorage))
  assert.deepEqual(loadRecentQuestionSignatures('numbers', undefined), {})
  assert.doesNotThrow(() => rememberGeneratedQuestions('numbers', first, undefined))
})

test('an unknown topic returns no generated questions and finite seeds never require unbounded retries', () => {
  assert.deepEqual(generateMultiSelectQuestions('unknown-topic', seededRandom(3)), [])
  const constantRandom = () => 0
  for (const topic of trainerTopics) {
    const generated = generateMultiSelectQuestions(topic.id, constantRandom)
    assert.equal(generated.length, 6)
    assert.equal(new Set(generated.map(multiSelectQuestionSignature)).size, 6)
  }
})
