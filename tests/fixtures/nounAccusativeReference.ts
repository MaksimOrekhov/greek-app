export const NOUN_ACCUSATIVE_PAIR_REFERENCE = [
  { id: 'object-see-friend', prompt: 'Я вижу друга.', answer: 'Βλέπω τον φίλο.', meaning: 'speaker|see|male-friend' },
  { id: 'subject-friend-sees-maria', prompt: 'Друг видит Марию.', answer: 'Ο φίλος βλέπει τη Μαρία.', meaning: 'male-friend|see|Maria' },
  { id: 'elena-waits-father', prompt: 'Элени ждёт отца.', answer: 'Η Ελένη περιμένει τον πατέρα.', meaning: 'Elena|wait-for|father' },
  { id: 'father-reads-newspaper', prompt: 'Отец читает газету.', answer: 'Ο πατέρας διαβάζει την εφημερίδα.', meaning: 'father|read|newspaper' },
  { id: 'teacher-asks-student', prompt: 'Учитель спрашивает ученика.', answer: 'Ο δάσκαλος ρωτάει τον μαθητή.', meaning: 'teacher|ask|student' },
  { id: 'student-reads-book', prompt: 'Ученица читает книгу.', answer: 'Η μαθήτρια διαβάζει το βιβλίο.', meaning: 'female-student|read|book' },
  { id: 'boy-sees-dog', prompt: 'Мальчик видит собаку.', answer: 'Το αγόρι βλέπει τον σκύλο.', meaning: 'boy|see|dog' },
  { id: 'father-drinks-juice', prompt: 'Отец пьёт сок.', answer: 'Ο πατέρας πίνει τον χυμό.', meaning: 'father|drink|juice' },
  { id: 'buy-shirt', prompt: 'Я покупаю рубашку.', answer: 'Αγοράζω το πουκάμισο.', meaning: 'speaker|buy|shirt' },
  { id: 'maria-waits-friend', prompt: 'Мария ждёт подругу.', answer: 'Η Μαρία περιμένει τη φίλη.', meaning: 'Maria|wait-for|female-friend' },
  { id: 'wait-bus', prompt: 'Я жду автобус.', answer: 'Περιμένω το λεωφορείο.', meaning: 'speaker|wait-for|bus' },
  { id: 'student-waits-teacher', prompt: 'Ученик ждёт учителя.', answer: 'Ο μαθητής περιμένει τον δάσκαλο.', meaning: 'student|wait-for|teacher' },
  { id: 'father-sees-son', prompt: 'Отец видит сына.', answer: 'Ο πατέρας βλέπει τον γιο.', meaning: 'father|see|son' },
  { id: 'elena-waits-maria', prompt: 'Элени ждёт Марию.', answer: 'Η Ελένη περιμένει τη Μαρία.', meaning: 'Elena|wait-for|Maria' },
  { id: 'baby-sees-dog', prompt: 'Малыш видит собаку.', answer: 'Το μωρό βλέπει τον σκύλο.', meaning: 'baby|see|dog' },
  { id: 'read-exercise', prompt: 'Я читаю упражнение.', answer: 'Διαβάζω την άσκηση.', meaning: 'speaker|read|exercise' },
  { id: 'teacher-reads-letter', prompt: 'Учитель читает письмо.', answer: 'Ο δάσκαλος διαβάζει το γράμμα.', meaning: 'teacher|read|letter' },
  { id: 'want-cheese', prompt: 'Я хочу этот сыр.', answer: 'Θέλω αυτό το τυρί.', meaning: 'speaker|want|cheese' },
  { id: 'buy-dress', prompt: 'Я покупаю платье.', answer: 'Αγοράζω ένα φόρεμα.', meaning: 'speaker|buy|dress' },
  { id: 'friend-sees-canary', prompt: 'Друг видит канарейку.', answer: 'Ο φίλος βλέπει το καναρίνι.', meaning: 'male-friend|see|canary' },
] as const

export type NounCaseLabel = 'nominative' | 'accusative' | 'genitive' | 'invalid'

export const NOUN_CASE_FORM_REFERENCE = {
  φίλος: { nominative: 'ο φίλος', accusative: 'τον φίλο', genitive: 'του φίλου' },
  πατέρας: { nominative: 'ο πατέρας', accusative: 'τον πατέρα', genitive: 'του πατέρα' },
  μαθητής: { nominative: 'ο μαθητής', accusative: 'τον μαθητή', genitive: 'του μαθητή' },
  φίλη: { nominative: 'η φίλη', accusative: 'τη φίλη', genitive: 'της φίλης' },
  αδελφή: { nominative: 'η αδελφή', accusative: 'την αδελφή', genitive: 'της αδελφής' },
  εφημερίδα: { nominative: 'η εφημερίδα', accusative: 'την εφημερίδα', genitive: 'της εφημερίδας' },
  πουκάμισο: { nominative: 'το πουκάμισο', accusative: 'το πουκάμισο', genitive: 'του πουκαμίσου' },
  τυρί: { nominative: 'το τυρί', accusative: 'το τυρί', genitive: 'του τυριού' },
  σκύλος: { nominative: 'ο σκύλος', accusative: 'τον σκύλο', genitive: 'του σκύλου' },
  βιβλίο: { nominative: 'το βιβλίο', accusative: 'το βιβλίο', genitive: 'του βιβλίου' },
  δάσκαλος: { nominative: 'ο δάσκαλος', accusative: 'τον δάσκαλο', genitive: 'του δασκάλου' },
  Ελένη: { nominative: 'η Ελένη', accusative: 'την Ελένη', genitive: 'της Ελένης' },
  δασκάλα: { nominative: 'η δασκάλα', accusative: 'τη δασκάλα', genitive: 'της δασκάλας' },
  μητέρα: { nominative: 'η μητέρα', accusative: 'τη μητέρα', genitive: 'της μητέρας' },
  χυμός: { nominative: 'ο χυμός', accusative: 'τον χυμό', genitive: 'του χυμού' },
  ψωμί: { nominative: 'το ψωμί', accusative: 'το ψωμί', genitive: 'του ψωμιού' },
  γράμμα: { nominative: 'το γράμμα', accusative: 'το γράμμα', genitive: 'του γράμματος' },
  άσκηση: { nominative: 'η άσκηση', accusative: 'την άσκηση', genitive: 'της άσκησης' },
  λεωφορείο: { nominative: 'το λεωφορείο', accusative: 'το λεωφορείο', genitive: 'του λεωφορείου' },
  καναρίνι: { nominative: 'το καναρίνι', accusative: 'το καναρίνι', genitive: 'του καναρινιού' },
  φόρεμα: { nominative: 'το φόρεμα', accusative: 'το φόρεμα', genitive: 'του φορέματος' },
  μαθήτρια: { nominative: 'η μαθήτρια', accusative: 'τη μαθήτρια', genitive: 'της μαθήτριας' },
  αγόρι: { nominative: 'το αγόρι', accusative: 'το αγόρι', genitive: 'του αγοριού' },
  μωρό: { nominative: 'το μωρό', accusative: 'το μωρό', genitive: 'του μωρού' },
  Μαρία: { nominative: 'η Μαρία', accusative: 'τη Μαρία', genitive: 'της Μαρίας' },
} as const

/** Additional normative form recorded independently of the trainer question bank. */
export const NOUN_CASE_ACCEPTED_VARIANT_REFERENCE = [
  { headword: 'πουκάμισο', form: 'του πουκάμισου', case: 'genitive' },
] as const

export interface NounAccusativeQuestionReference {
  id: string
  sentence: string
  hint: string
  role: 'subject' | 'object'
  choices: readonly { text: string; case: NounCaseLabel }[]
}

/** Independent case transcriptions for the 24 fixed T3 items. */
export const NOUN_ACCUSATIVE_QUESTION_REFERENCE: readonly NounAccusativeQuestionReference[] = [
  { id: 'acc-see-friend-masculine-os', sentence: 'Βλέπω τον φίλο.', hint: 'Я вижу друга.', role: 'object', choices: [{ text: 'ο', case: 'nominative' }, { text: 'τον', case: 'accusative' }, { text: 'του', case: 'genitive' }] },
  { id: 'acc-wait-father-masculine-as', sentence: 'Η Μαρία περιμένει τον πατέρα.', hint: 'Мария ждёт отца.', role: 'object', choices: [{ text: 'ο πατέρας', case: 'nominative' }, { text: 'τον πατέρα', case: 'accusative' }, { text: 'του πατέρα', case: 'genitive' }] },
  { id: 'acc-ask-student-masculine-is', sentence: 'Ο δάσκαλος ρωτάει τον μαθητή.', hint: 'Учитель спрашивает ученика.', role: 'object', choices: [{ text: 'ο μαθητής', case: 'nominative' }, { text: 'τον μαθητή', case: 'accusative' }, { text: 'του μαθητή', case: 'genitive' }] },
  { id: 'acc-see-friend-feminine-i', sentence: 'Βλέπω τη φίλη.', hint: 'Я вижу подругу.', role: 'object', choices: [{ text: 'η', case: 'nominative' }, { text: 'τη', case: 'accusative' }, { text: 'της', case: 'genitive' }] },
  { id: 'acc-wait-sister-feminine-vowel', sentence: 'Η Ελένη περιμένει την αδελφή.', hint: 'Элени ждёт сестру.', role: 'object', choices: [{ text: 'τη αδελφή', case: 'invalid' }, { text: 'την αδελφή', case: 'accusative' }, { text: 'της αδελφής', case: 'genitive' }] },
  { id: 'acc-read-newspaper-feminine-vowel', sentence: 'Διαβάζω την εφημερίδα κάθε πρωί.', hint: 'Я читаю газету каждое утро.', role: 'object', choices: [{ text: 'τη εφημερίδα', case: 'invalid' }, { text: 'την εφημερίδα', case: 'accusative' }, { text: 'της εφημερίδας', case: 'genitive' }] },
  { id: 'acc-buy-shirt-neuter-o', sentence: 'Αγοράζω το πουκάμισο.', hint: 'Я покупаю рубашку.', role: 'object', choices: [{ text: 'το πουκάμισο', case: 'accusative' }, { text: 'τον πουκάμισο', case: 'invalid' }, { text: 'του πουκάμισου', case: 'genitive' }] },
  { id: 'acc-see-dog-masculine-os', sentence: 'Το αγόρι βλέπει τον σκύλο.', hint: 'Мальчик видит собаку.', role: 'object', choices: [{ text: 'ο σκύλος', case: 'nominative' }, { text: 'τον σκύλο', case: 'accusative' }, { text: 'του σκύλου', case: 'genitive' }] },
  { id: 'acc-read-book-neuter-i', sentence: 'Ο φίλος διαβάζει το βιβλίο.', hint: 'Друг читает книгу.', role: 'object', choices: [{ text: 'το βιβλίο', case: 'accusative' }, { text: 'τον βιβλίο', case: 'invalid' }, { text: 'του βιβλίου', case: 'genitive' }] },
  { id: 'acc-see-teacher-masculine-os', sentence: 'Η μαθήτρια βλέπει τον δάσκαλο.', hint: 'Ученица видит учителя.', role: 'object', choices: [{ text: 'ο δάσκαλος', case: 'nominative' }, { text: 'τον δάσκαλο', case: 'accusative' }, { text: 'του δασκάλου', case: 'genitive' }] },
  { id: 'acc-student-form-masculine-is', sentence: 'Περιμένω τον μαθητή.', hint: 'Я жду ученика.', role: 'object', choices: [{ text: 'ο μαθητής', case: 'nominative' }, { text: 'τον μαθητή', case: 'accusative' }, { text: 'του μαθητή', case: 'genitive' }] },
  { id: 'acc-see-elena-feminine-proper-vowel', sentence: 'Ο φίλος βλέπει την Ελένη.', hint: 'Друг видит Элени.', role: 'object', choices: [{ text: 'η Ελένη', case: 'nominative' }, { text: 'την Ελένη', case: 'accusative' }, { text: 'της Ελένης', case: 'genitive' }] },
  { id: 'acc-ask-teacher-feminine-a', sentence: 'Η μαθήτρια ρωτάει τη δασκάλα.', hint: 'Ученица спрашивает учительницу.', role: 'object', choices: [{ text: 'η δασκάλα', case: 'nominative' }, { text: 'τη δασκάλα', case: 'accusative' }, { text: 'της δασκάλας', case: 'genitive' }] },
  { id: 'acc-see-mother-feminine-a', sentence: 'Η Ελένη βλέπει τη μητέρα.', hint: 'Элени видит мать.', role: 'object', choices: [{ text: 'η μητέρα', case: 'nominative' }, { text: 'τη μητέρα', case: 'accusative' }, { text: 'της μητέρας', case: 'genitive' }] },
  { id: 'acc-drink-juice-masculine-os', sentence: 'Ο φίλος πίνει τον χυμό.', hint: 'Друг пьёт сок.', role: 'object', choices: [{ text: 'ο χυμός', case: 'nominative' }, { text: 'τον χυμό', case: 'accusative' }, { text: 'το χυμό', case: 'invalid' }] },
  { id: 'acc-buy-bread-neuter-i', sentence: 'Ο φίλος αγοράζει το ψωμί.', hint: 'Друг покупает хлеб.', role: 'object', choices: [{ text: 'το ψωμί', case: 'accusative' }, { text: 'τον ψωμί', case: 'invalid' }, { text: 'του ψωμιού', case: 'genitive' }] },
  { id: 'acc-read-letter-neuter-ma', sentence: 'Ο μαθητής γράφει το γράμμα.', hint: 'Ученик пишет письмо.', role: 'object', choices: [{ text: 'το γράμμα', case: 'accusative' }, { text: 'τον γράμμα', case: 'invalid' }, { text: 'του γράμματος', case: 'genitive' }] },
  { id: 'acc-read-exercise-feminine-i', sentence: 'Ο δάσκαλος διαβάζει την άσκηση.', hint: 'Учитель читает упражнение.', role: 'object', choices: [{ text: 'τη άσκηση', case: 'invalid' }, { text: 'την άσκηση', case: 'accusative' }, { text: 'της άσκησης', case: 'genitive' }] },
  { id: 'acc-teacher-sees-student-subject', sentence: 'Ο δάσκαλος βλέπει τον μαθητή.', hint: 'Учитель видит ученика.', role: 'subject', choices: [{ text: 'Ο δάσκαλος', case: 'nominative' }, { text: 'Τον δάσκαλο', case: 'accusative' }, { text: 'Του δασκάλου', case: 'genitive' }] },
  { id: 'acc-father-waits-bus-subject', sentence: 'Ο πατέρας περιμένει το λεωφορείο.', hint: 'Отец ждёт автобус.', role: 'subject', choices: [{ text: 'Ο πατέρας', case: 'nominative' }, { text: 'Τον πατέρα', case: 'accusative' }, { text: 'Του πατέρα', case: 'genitive' }] },
  { id: 'acc-student-asks-teacher-object', sentence: 'Η μαθήτρια ρωτάει τον δάσκαλο.', hint: 'Ученица спрашивает учителя.', role: 'object', choices: [{ text: 'ο δάσκαλος', case: 'nominative' }, { text: 'τον δάσκαλο', case: 'accusative' }, { text: 'του δασκάλου', case: 'genitive' }] },
  { id: 'acc-baby-sees-canary-neuter-i', sentence: 'Το μωρό βλέπει το καναρίνι.', hint: 'Малыш видит канарейку.', role: 'object', choices: [{ text: 'το καναρίνι', case: 'accusative' }, { text: 'τον καναρίνι', case: 'invalid' }, { text: 'του καναρινιού', case: 'genitive' }] },
  { id: 'acc-student-buys-dress-subject', sentence: 'Η μαθήτρια αγοράζει το φόρεμα.', hint: 'Ученица покупает платье.', role: 'subject', choices: [{ text: 'Η μαθήτρια', case: 'nominative' }, { text: 'Τη μαθήτρια', case: 'accusative' }, { text: 'Της μαθήτριας', case: 'genitive' }] },
  { id: 'acc-father-sees-student-object', sentence: 'Ο πατέρας βλέπει τον μαθητή.', hint: 'Отец видит ученика.', role: 'object', choices: [{ text: 'ο μαθητής', case: 'nominative' }, { text: 'τον μαθητή', case: 'accusative' }, { text: 'του μαθητή', case: 'genitive' }] },
] as const
