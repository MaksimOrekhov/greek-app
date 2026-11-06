import test from 'node:test'
import assert from 'node:assert/strict'
import { approximateReading } from '../src/data/approximateReading.ts'
import { validateVocabularyData, words } from '../src/data/words.ts'
import { validateVerbData, verbs } from '../src/data/verbs.ts'
import { theoryTopics, validateTheoryTopics } from '../src/data/theory/topics.ts'
import { canImportAnonymousProgress, formatInterval, introducedTodayCount, mergeProgressSnapshots, nextInterval, normalizeIntroductionIds, normalizeProgressIds, selectSessionWords } from '../src/lib/studyRules.ts'
import { nextPosition, sessionProgress } from '../src/lib/studySession.ts'

test('review intervals preserve rating order, handle first reviews and cap growth', () => {
  assert.equal(nextInterval('again', 100), 0)
  assert.equal(nextInterval('hard', 0), 1)
  assert.equal(nextInterval('hard', 100), 80)
  assert.equal(nextInterval('good', 0), 3)
  assert.equal(nextInterval('easy', 0), 7)
  assert.equal(nextInterval('easy', 200), 365)
})

test('Russian interval labels use correct day forms', () => {
  assert.equal(formatInterval(1), '1 день')
  assert.equal(formatInterval(2), '2 дня')
  assert.equal(formatInterval(5), '5 дней')
  assert.equal(formatInterval(11), '11 дней')
  assert.equal(formatInterval(21), '21 день')
  assert.equal(formatInterval(24), '24 дня')
  assert.equal(formatInterval(0), '10 мин')
})

test('progress merge keeps the newest review and earliest introduction', () => {
  const local = { слово: { dueAt: 50, intervalDays: 4, repetitions: 2, lapses: 0, lastReviewedAt: 20, introducedAt: 10 } }
  const remote = { слово: { dueAt: 90, intervalDays: 8, repetitions: 3, lapses: 1, lastReviewedAt: 30, introducedAt: 15 } }
  assert.deepEqual(mergeProgressSnapshots(local, remote).слово, { ...remote.слово, introducedAt: 10 })
  assert.equal(mergeProgressSnapshots(remote, local).слово.dueAt, 90)
  const simultaneous = mergeProgressSnapshots(
    { слово: { ...local.слово, reviewId: '00000000-0000-4000-8000-000000000001' } },
    { слово: { ...remote.слово, lastReviewedAt: 20, reviewId: '00000000-0000-4000-8000-000000000002' } },
  )
  assert.equal(simultaneous.слово.dueAt, remote.слово.dueAt)
})

test('legacy coffee progress migrates to the dictionary lemma without losing review history', () => {
  const legacy = { dueAt: 500, intervalDays: 7, repetitions: 3, lapses: 1, lastReviewedAt: 200, introducedAt: 100 }
  const migrated = normalizeProgressIds({ 'καφέ': legacy })
  assert.deepEqual(migrated, { 'καφές': legacy })
  assert.deepEqual(mergeProgressSnapshots({}, { 'καφέ': legacy }), { 'καφές': legacy })
  assert.deepEqual(normalizeIntroductionIds({ 'καφέ': 100 }), { 'καφές': 100 })
  const collision = normalizeProgressIds({
    'καφέ': legacy,
    'καφές': { ...legacy, dueAt: 800, intervalDays: 14, repetitions: 4, lastReviewedAt: 300, introducedAt: 150 },
  })
  assert.deepEqual(collision['καφές'], { ...legacy, dueAt: 800, intervalDays: 14, repetitions: 4, lastReviewedAt: 300, introducedAt: 100 })
})

test('anonymous progress import is repeatable only for its owner', () => {
  assert.equal(canImportAnonymousProgress(null, 'account-a'), true)
  assert.equal(canImportAnonymousProgress('pending', 'account-a'), true)
  assert.equal(canImportAnonymousProgress('account-a', 'account-a'), true)
  assert.equal(canImportAnonymousProgress('account-a', 'account-b'), false)
  assert.equal(canImportAnonymousProgress('true', 'account-a'), false)
})

test('daily new-word quota counts first exposure, survives the next day, and keeps unrated exposures available', () => {
  const today = new Date(2026, 9, 8, 12).getTime()
  const tomorrow = new Date(2026, 9, 9, 12).getTime()
  const exposures = { viewed: new Date(2026, 9, 8, 8).getTime() }
  assert.equal(introducedTodayCount(exposures, today), 1)
  assert.equal(introducedTodayCount(exposures, tomorrow), 0)
  assert.deepEqual(selectSessionWords(['viewed', 'fresh1', 'fresh2'], {}, exposures, today, 1, 'today'), ['viewed', 'fresh1'])
  assert.deepEqual(selectSessionWords(['viewed', 'fresh1', 'fresh2'], {}, exposures, today, 1, 'new'), ['viewed', 'fresh1'])
  assert.deepEqual(selectSessionWords(['viewed', 'fresh1'], { viewed: { dueAt: today - 1, intervalDays: 0, repetitions: 0, lapses: 0, lastReviewedAt: today - 10 } }, exposures, today, 10, 'review'), ['viewed'])
})

test('session progress counts rated cards only and skip can complete the last card', () => {
  assert.deepEqual(sessionProgress(0, 3), { completed: 0, total: 3, percent: 0 })
  assert.equal(sessionProgress(1, 3).completed, 1)
  assert.ok(Math.abs(sessionProgress(1, 3).percent - 100 / 3) < Number.EPSILON * 100)
  assert.equal(nextPosition(1, 2), 2)
  assert.equal(sessionProgress(0, 0).percent, 100)
})

test('approximate reading handles accented αυ/ευ and nasal consonant pairs', () => {
  assert.equal(approximateReading('εύκολος'), 'э́фколос')
  assert.equal(approximateReading('αύξηση'), 'а́фксиси')
  assert.equal(approximateReading('αύριο'), 'а́врио')
  assert.equal(approximateReading('μπίρα'), 'би́ра')
  assert.equal(approximateReading('λάμπα'), 'ла́мба')
  assert.equal(approximateReading('ντομάτα'), 'дома́та')
  assert.equal(approximateReading('πέντε'), 'пэ́ндэ')
  assert.equal(approximateReading('αγκαλιά'), 'ангаля́')
  assert.equal(approximateReading('άγχος'), 'а́нхос')
  assert.equal(approximateReading('σφίγξ'), 'сфи́нкс')
  assert.equal(approximateReading('γεια σου'), 'я су')
  assert.equal(approximateReading('γιατί'), 'яти́')
  assert.equal(approximateReading('γέλιο'), 'йэ́лио')
  assert.equal(approximateReading('θέλω'), 'сэ́ло')
  assert.equal(approximateReading('δεν'), 'зэн')
  assert.equal(approximateReading('δουλεύω'), 'зулэ́во')
  assert.equal(approximateReading('κόκκινη'), 'ко́кини')
})

test('vocabulary and verb data have complete, unique references and forms', () => {
  assert.deepEqual(validateVocabularyData(), [])
  assert.deepEqual(validateVerbData(), [])
  assert.ok(validateVocabularyData([words[0], words[0]]).some((error) => error.includes('Duplicate')))
  assert.ok(validateVerbData([verbs[0], verbs[0]]).some((error) => error.includes('Duplicate')))
  const brokenVerb = { ...verbs[0], future: [{ ...verbs[0].future[0], forms: ['θα'] }] }
  assert.ok(validateVerbData([brokenVerb]).some((error) => error.includes('Invalid future')))
  const coffee = words.find((word) => word.greek === 'καφές')
  assert.ok(coffee)
  assert.deepEqual(coffee.partOfSpeech, ['noun'])
  assert.ok(coffee.examples.some((example) => example.greek === 'Ο καφές είναι ζεστός.'))
  assert.ok(coffee.examples.some((example) => example.greek === 'Έναν καφέ, παρακαλώ.'))
  assert.equal(words.some((word) => word.greek === 'καφέ'), false)
  assert.equal(words.find((word) => word.greek === 'καταλαβαίνω')?.transliteration, 'каталавэ́но')
  assert.equal(words.find((word) => word.greek === 'θέλω')?.transliteration.includes('*'), false)
  assert.equal(words.find((word) => word.greek === 'δεν')?.transliteration.includes('*'), false)
  for (const [greek, transliteration] of [
    ['πώς τον λένε;', 'по́с тон лэ́нэ?'],
    ['πώς τη λένε;', 'по́с ти лэ́нэ?'],
    ['πώς το λένε;', 'по́с то лэ́нэ?'],
  ]) {
    const word = words.find((entry) => entry.greek === greek)
    assert.ok(word)
    assert.equal(word.transliteration, transliteration)
    assert.ok(word.examples.some((example) => example.transliteration === transliteration))
  }
  assert.equal(words.find((word) => word.greek === 'έτοιμη')?.russian, 'готова (женский род)')
  assert.deepEqual(verbs.find((verb) => verb.lemma === 'πηγαίνω')?.future[1].forms, ['θα πάω', 'θα πας', 'θα πάει', 'θα πάμε', 'θα πάτε', 'θα πάνε'])
  assert.deepEqual(verbs.find((verb) => verb.lemma === 'έρχομαι')?.forms.past, ['ήρθα', 'ήρθες', 'ήρθε', 'ήρθαμε', 'ήρθατε', 'ήρθαν'])
  assert.deepEqual(verbs.find((verb) => verb.lemma === 'τρώω')?.future[1].forms, ['θα φάω', 'θα φας', 'θα φάει', 'θα φάμε', 'θα φάτε', 'θα φάνε'])
  assert.deepEqual(verbs.find((verb) => verb.lemma === 'πίνω')?.forms.past, ['ήπια', 'ήπιες', 'ήπιε', 'ήπιαμε', 'ήπιατε', 'ήπιαν'])
  assert.deepEqual(verbs.find((verb) => verb.lemma === 'βλέπω')?.future[1].forms, ['θα δω', 'θα δεις', 'θα δει', 'θα δούμε', 'θα δείτε', 'θα δουν'])
  assert.deepEqual(verbs.find((verb) => verb.lemma === 'λέω')?.forms.past, ['είπα', 'είπες', 'είπε', 'είπαμε', 'είπατε', 'είπαν'])
  assert.deepEqual(verbs.find((verb) => verb.lemma === 'παίρνω')?.forms.past, ['πήρα', 'πήρες', 'πήρε', 'πήραμε', 'πήρατε', 'πήραν'])
  assert.deepEqual(verbs.find((verb) => verb.lemma === 'δίνω')?.forms.past, ['έδωσα', 'έδωσες', 'έδωσε', 'δώσαμε', 'δώσατε', 'έδωσαν'])
})

test('lesson vocabulary and theory through page 55 are registered', () => {
  assert.deepEqual(validateTheoryTopics(), [])
  assert.ok(theoryTopics.some((topic) => topic.id === 'numbers-100-200'))
  assert.ok(theoryTopics.some((topic) => topic.id === 'numbers-200-plus'))

  const word = (greek: string) => {
    const found = words.find((entry) => entry.greek === greek)
    assert.ok(found, `Missing lesson word: ${greek}`)
    assert.ok(found.examples.length, `Missing example: ${greek}`)
    return found
  }
  for (const greek of ['αρέσω', 'αργώ', 'έτσι κι έτσι', 'συμφωνία', 'θέατρο', 'μεγάλος', 'κόρη', 'Νέα Υόρκη', 'μπαμπάς', 'κορίτσι', 'ντίσκο', 'μπάσκετ', 'ταχυδρομείο', 'φαρμακείο', 'Ακρόπολη', 'γαλλικά', 'γερμανικά', 'μιλάω', 'πηγαίνω']) word(greek)
  assert.equal(word('γιος').transliteration, 'йос')

  assert.deepEqual(verbs.find((verb) => verb.lemma === 'αρέσω')?.forms.present, ['αρέσω', 'αρέσεις', 'αρέσει', 'αρέσουμε', 'αρέσετε', 'αρέσουν'])
  assert.deepEqual(verbs.find((verb) => verb.lemma === 'αργώ')?.forms.past, ['άργησα', 'άργησες', 'άργησε', 'αργήσαμε', 'αργήσατε', 'άργησαν'])
})

test('targeted vocabulary clarifications preserve existing Greek keys and examples', () => {
  const word = (greek: string) => {
    const found = words.find((entry) => entry.greek === greek)
    assert.ok(found, `Missing vocabulary key: ${greek}`)
    return found
  }

  assert.equal(word('δέμα').russian, 'посылка / свёрток')
  assert.equal(word('πορτοκαλάδα').russian, 'апельсиновый лимонад / напиток')
  assert.equal(word('γιατρός').transliteration, 'ятро́с')
  assert.equal(word('γιατρός').examples[0].transliteration, 'о ятро́с и́нэ эзо́')
  assert.deepEqual(word('μαγαζί').examples[0], {
    greek: 'Το μαγαζί είναι εδώ.', transliteration: 'то магази́ и́нэ эзо́', russian: 'Магазин здесь.',
  })
  assert.equal(word('σνομπ').transliteration, 'сноб')
  assert.deepEqual(word('σνομπ').examples[0], {
    greek: 'Είναι σνομπ.', transliteration: 'и́нэ сноб', russian: 'Он / она сноб.',
  })
  assert.deepEqual(word('γαλοπούλα').examples[0], {
    greek: 'Τρώω γαλοπούλα.', transliteration: 'тро́о галопу́ла', russian: 'Я ем индейку.',
  })
  assert.deepEqual(word('γύρος').examples[0], {
    greek: 'Μια πίτα με γύρο, παρακαλώ.',
    transliteration: 'мья пи́та мэ йи́ро, паракало́',
    russian: 'Питу с гиросом, пожалуйста.',
  })
  assert.deepEqual(word('φούρνος').examples[0], {
    greek: 'Θέλω ένα ψωμί από τον φούρνο, παρακαλώ.',
    transliteration: 'сэ́ло э́на псоми́ апо́ тон фу́рно, паракало́',
    russian: 'Хочу буханку хлеба из пекарни, пожалуйста.',
  })
  assert.equal(word('καφές').examples.some((example) => example.greek === 'Ο καφές είναι ζεστός.'), true)
  for (const greek of ['αδελφός', 'γιαγιά', 'δωμάτιο', 'θείος', 'θεία', 'της', 'τους', 'πόσων', 'χρονών', 'ενός', 'Πλάκα', 'Πόσων χρονών είσαι;', 'Πόσων χρονών είναι;', 'Ο πατέρας μου', 'Η μητέρα της', 'Ο αδελφός του', 'Το σπίτι τους', 'Είμαι είκοσι ενός χρονών']) {
    assert.ok(word(greek).examples.length, `Missing examples for: ${greek}`)
  }
})

test('μου αρέσει and μου αρέσουν examples agree with the grammatical number of what is liked', () => {
  const singular = words.find((word) => word.greek === 'μου αρέσει')
  const plural = words.find((word) => word.greek === 'μου αρέσουν')
  assert.ok(singular)
  assert.ok(plural)

  assert.equal(singular.russian, 'мне нравится')
  assert.deepEqual(singular.examples[0], {
    greek: 'Μου αρέσει η μουσική.',
    transliteration: 'му арэ́си и мусики́',
    russian: 'Мне нравится музыка.',
  })
  assert.equal(plural.russian, 'мне нравятся')
  assert.equal(approximateReading('βιβλία'), 'вивли́а')
  assert.deepEqual(plural.examples[0], {
    greek: 'Μου αρέσουν τα βιβλία.',
    transliteration: 'му арэ́сун та вивли́а',
    russian: 'Мне нравятся книги.',
  })
})

test('latest lesson vocabulary is available with examples', () => {
  for (const greek of ['συγγνώμη', 'διαβάζω', 'μαχαίρι', 'σκέτος', 'εισιτήριο']) {
    const found = words.find((entry) => entry.greek === greek)
    assert.ok(found, `Missing latest lesson word: ${greek}`)
    assert.ok(found.examples.length, `Missing example for latest lesson word: ${greek}`)
  }
})

test('εισιτήριο has the correct Russian stress in its card and every example', () => {
  const ticket = words.find((entry) => entry.greek === 'εισιτήριο')
  assert.ok(ticket)
  assert.equal(ticket.transliteration, 'исити́рио')

  const examples = words.flatMap((entry) => entry.examples).filter((example) => example.greek.includes('εισιτήριο'))
  assert.ok(examples.length)
  for (const example of examples) {
    assert.ok(example.transliteration.includes('исити́рио'), `Incorrect ticket reading in: ${example.greek}`)
    assert.ok(!example.transliteration.includes('иситири́о'), `Old ticket stress remains in: ${example.greek}`)
  }
})

test('new textbook vocabulary stays complete, uniquely keyed, and connected to spaced repetition', () => {
  const expected = [
    ['μαθαίνω', 'масэ́но'], ['αγοράζω', 'агора́зо'], ['πληρώνω', 'плиро́но'], ['σπουδάζω', 'спуза́зо'],
    ['τσιγάρο', 'цига́ро'], ['πακέτο', 'пакэ́то'], ['τηλεκάρτα', 'тилэка́рта'], ['πανεπιστήμιο', 'панэписти́мио'],
    ['ρέστα', 'рэ́ста'], ['ψιλά', 'псила́'], ['μπράβο', 'бра́во'], ['μετά', 'мэта́'],
    ['περιπτεράς', 'пэриптэра́с'], ['καφετζής', 'кафэдзи́с'],
    ['Θέλετε τίποτα άλλο;', 'сэ́лэтэ ти́пота а́ло?'], ['Πόσο κάνουν όλα;', 'по́со ка́нун о́ла?'],
    ['Μήπως έχετε ψιλά;', 'ми́пос э́хэтэ псила́?'],
    ['Πω, πω!', 'по, по!'], ['στάδιο', 'ста́зио'], ['μαθητής', 'масити́с'],
    ['πιρούνι', 'пиру́ни'], ['σκύλος', 'ски́лос'],
  ] as const
  assert.equal(words.length, 385)
  assert.equal(new Set(words.map((word) => word.greek)).size, words.length)
  for (const [greek, transliteration] of expected) {
    const word = words.find((item) => item.greek === greek)
    assert.ok(word, greek)
    assert.equal(word.transliteration, transliteration, greek)
    assert.ok(word.russian.trim(), greek)
    assert.ok(word.examples.length > 0, greek)
    assert.ok(word.examples.every((example) => example.greek.trim() && example.transliteration.trim() && example.russian.trim()), greek)
  }
})

test('three shop expressions have contextual examples rather than echoing their headwords', () => {
  const expected = [
    {
      greek: 'Θέλετε τίποτα άλλο;',
      example: 'Ο περιπτεράς δίνει το πακέτο τσιγάρα. Θέλετε τίποτα άλλο;',
      transliteration: 'о пэриптэра́с зи́ни то пакэ́то цига́ра. сэ́лэтэ ти́пота а́ло?',
      russian: 'Киоскёр передаёт пачку сигарет. Хотите что-нибудь ещё?',
    },
    {
      greek: 'Πόσο κάνουν όλα;',
      example: 'Αγοράζω ένα πακέτο τσιγάρα και μία τηλεκάρτα. Πόσο κάνουν όλα;',
      transliteration: 'агора́зо э́на пакэ́то цига́ра кэ ми́а тилэка́рта. по́со ка́нун о́ла?',
      russian: 'Я покупаю пачку сигарет и телефонную карту. Сколько всё вместе стоит?',
    },
    {
      greek: 'Μήπως έχετε ψιλά;',
      example: 'Ο περιπτεράς δεν έχει ρέστα. Μήπως έχετε ψιλά;',
      transliteration: 'о пэриптэра́с зэн э́хи рэ́ста. ми́пос э́хэтэ псила́?',
      russian: 'У киоскёра нет сдачи. У вас случайно есть мелочь?',
    },
  ]

  for (const expectedExample of expected) {
    const card = words.find((item) => item.greek === expectedExample.greek)
    assert.ok(card, expectedExample.greek)
    assert.equal(card.examples.length, 1, expectedExample.greek)
    assert.notEqual(card.examples[0]!.greek, card.greek)
    assert.deepEqual(card.examples[0], {
      greek: expectedExample.example,
      transliteration: expectedExample.transliteration,
      russian: expectedExample.russian,
    })
  }
})

test('new textbook verbs match independently checked present, aorist, and future reference forms', () => {
  const reference = [
    {
      lemma: 'αγοράζω',
      present: ['αγοράζω', 'αγοράζεις', 'αγοράζει', 'αγοράζουμε', 'αγοράζετε', 'αγοράζουν'],
      past: ['αγόρασα', 'αγόρασες', 'αγόρασε', 'αγοράσαμε', 'αγοράσατε', 'αγόρασαν'],
      continuous: ['θα αγοράζω', 'θα αγοράζεις', 'θα αγοράζει', 'θα αγοράζουμε', 'θα αγοράζετε', 'θα αγοράζουν'],
      simple: ['θα αγοράσω', 'θα αγοράσεις', 'θα αγοράσει', 'θα αγοράσουμε', 'θα αγοράσετε', 'θα αγοράσουν'],
    },
    {
      lemma: 'πληρώνω',
      present: ['πληρώνω', 'πληρώνεις', 'πληρώνει', 'πληρώνουμε', 'πληρώνετε', 'πληρώνουν'],
      past: ['πλήρωσα', 'πλήρωσες', 'πλήρωσε', 'πληρώσαμε', 'πληρώσατε', 'πλήρωσαν'],
      continuous: ['θα πληρώνω', 'θα πληρώνεις', 'θα πληρώνει', 'θα πληρώνουμε', 'θα πληρώνετε', 'θα πληρώνουν'],
      simple: ['θα πληρώσω', 'θα πληρώσεις', 'θα πληρώσει', 'θα πληρώσουμε', 'θα πληρώσετε', 'θα πληρώσουν'],
    },
    {
      lemma: 'σπουδάζω',
      present: ['σπουδάζω', 'σπουδάζεις', 'σπουδάζει', 'σπουδάζουμε', 'σπουδάζετε', 'σπουδάζουν'],
      past: ['σπούδασα', 'σπούδασες', 'σπούδασε', 'σπουδάσαμε', 'σπουδάσατε', 'σπούδασαν'],
      continuous: ['θα σπουδάζω', 'θα σπουδάζεις', 'θα σπουδάζει', 'θα σπουδάζουμε', 'θα σπουδάζετε', 'θα σπουδάζουν'],
      simple: ['θα σπουδάσω', 'θα σπουδάσεις', 'θα σπουδάσει', 'θα σπουδάσουμε', 'θα σπουδάσετε', 'θα σπουδάσουν'],
    },
  ]
  for (const expected of reference) {
    const verb = verbs.find((item) => item.lemma === expected.lemma)
    assert.ok(verb, expected.lemma)
    assert.deepEqual(verb.forms.present, expected.present)
    assert.deepEqual(verb.forms.past, expected.past)
    assert.deepEqual(verb.future.find((tense) => tense.aspect === 'continuous')?.forms, expected.continuous)
    assert.deepEqual(verb.future.find((tense) => tense.aspect === 'simple')?.forms, expected.simple)
    assert.equal(verb.pastLabel, 'Прошедшее (аорист)')
  }
})
