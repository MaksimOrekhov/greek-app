import {
  EIMAI_PREDICATES,
  EIMAI_SUBJECTS,
  PERSONAL_PRONOUNS,
  POSSESSION_EXAMPLES,
  RECIPIENT_EXAMPLES,
  VERIFIED_COUNTING_NUMBERS,
} from './verifiedContent.ts'

/**
 * T3 uses the checked T2 phrase tables as complete source units. Pronoun
 * placement and the accepted είστε/είσαστε variants are documented by CGL
 * and the official Modern Greek grammar; see AGENTS.md.
 */
export const FILL_GAP_PERSONAL_PRONOUNS = [
  { word: 'Εγώ', meaning: 'я', verb: 'είμαι', group: 'first' },
  { word: 'Εσύ', meaning: 'ты', verb: 'είσαι', group: 'first' },
  { word: 'Αυτός', meaning: 'он', verb: 'είναι', group: 'third-masculine' },
  { word: 'Αυτή', meaning: 'она', verb: 'είναι', group: 'third-feminine' },
  { word: 'Αυτό', meaning: 'эта вещь', verb: 'είναι', group: 'third-neuter' },
  { word: 'Εμείς', meaning: 'мы', verb: 'είμαστε', group: 'first' },
  { word: 'Εσείς', meaning: 'вы', verb: 'είστε', group: 'second-plural' },
  { word: 'Αυτοί', meaning: 'эти мужчины', verb: 'είναι', group: 'third-masculine-plural' },
  { word: 'Αυτές', meaning: 'эти женщины', verb: 'είναι', group: 'third-feminine-plural' },
  { word: 'Αυτά', meaning: 'эти вещи', verb: 'είναι', group: 'third-neuter-plural' },
] as const

export const FILL_GAP_PRONOUN_REFERENCE_CONTEXTS = [
  { before: 'Ο Ιβάν; ', pronoun: 'Αυτός', after: 'είναι από τη Σερβία.', hint: 'Иван из Сербии.' },
  { before: 'Η Λίντα; ', pronoun: 'Αυτή', after: 'είναι από την Αλβανία.', hint: 'Линда из Албании.' },
  { before: 'Ο Ιβάν και η Λίντα; ', pronoun: 'Αυτοί', after: 'είναι εδώ.', hint: 'Иван и Линда здесь.' },
  { before: 'Οι φίλες; ', pronoun: 'Αυτές', after: 'είναι στο σπίτι.', hint: 'Подруги дома.' },
  { before: 'Το βιβλίο; ', pronoun: 'Αυτό', after: 'είναι εδώ.', hint: 'Книга здесь.' },
] as const

export const FILL_GAP_PRONOUN_DIALOGUES = [
  {
    before: 'Εγώ είμαι εδώ. Κι ', after: ';', answer: 'εσύ',
    hint: 'Я здесь. А ты?',
  },
  {
    before: 'Εσύ είσαι στο σπίτι. Κι ', after: ';', answer: 'εγώ',
    hint: 'Ты дома. А я?',
  },
  {
    before: 'Εμείς είμαστε εδώ. Κι ', after: ';', answer: 'εσείς',
    hint: 'Мы здесь. А вы?',
  },
  {
    before: 'Εγώ είμαι από τη Σερβία. Κι ', after: ';', answer: 'εσύ',
    hint: 'Я из Сербии. А ты?',
  },
] as const

export const FILL_GAP_POSSESSOR_FORMS = ['μου', 'σου', 'του', 'της', 'μας', 'σας', 'τους'] as const
export const FILL_GAP_CAPITALIZED_RECIPIENT_FORMS = ['Μου', 'Σου', 'Του', 'Της', 'Μας', 'Σας', 'Τους'] as const

export const FILL_GAP_EIMAI_INTRODUCTIONS = [
  { before: 'Εγώ ', after: ' γιατρός.', hint: 'Я врач.', correctForms: ['είμαι'] },
  { before: 'Εγώ ', after: ' δάσκαλος.', hint: 'Я учитель.', correctForms: ['είμαι'] },
  { before: 'Εγώ ', after: ' φοιτήτρια.', hint: 'Я студентка.', correctForms: ['είμαι'] },
  { before: 'Εγώ ', after: ' ο Ιβάν από τη Σερβία.', hint: 'Я Иван из Сербии.', correctForms: ['είμαι'] },
  { before: 'Εσύ ', after: ' από την Ελλάδα.', hint: 'Ты из Греции.', correctForms: ['είσαι'] },
  { before: 'Εσείς ', after: ' από τη Σερβία.', hint: 'Вы из Сербии.', correctForms: ['είστε', 'είσαστε'] },
] as const

export const FILL_GAP_EIMAI_FAMILY_CONTEXTS = [
  { subject: 'Ο φίλος', after: ' καλός.', hint: 'Друг хороший.' },
  { subject: 'Η φίλη', after: ' καλή.', hint: 'Подруга хорошая.' },
  { subject: 'Το παιδί', after: ' καλό.', hint: 'Ребёнок хороший.' },
  { subject: 'Ο πατέρας', after: ' γιατρός.', hint: 'Отец врач.' },
  { subject: 'Η μητέρα', after: ' στο σπίτι.', hint: 'Мама дома.' },
  { subject: 'Το παιδί', after: ' εδώ.', hint: 'Ребёнок здесь.' },
  { subject: 'Οι φίλοι', after: ' εδώ.', hint: 'Друзья здесь.' },
  { subject: 'Οι φίλες', after: ' στο σπίτι.', hint: 'Подруги дома.' },
] as const

export const FILL_GAP_NUMBER_PRICE_CONTEXTS = [
  { before: 'Ο καφές κάνει ', after: ' ευρώ.', value: 2, hint: 'Кофе стоит 2 евро.' },
  { before: 'Ο καφές κάνει ', after: ' ευρώ.', value: 3, hint: 'Кофе стоит 3 евро.' },
  { before: 'Ο καφές κάνει ', after: ' ευρώ.', value: 4, hint: 'Кофе стоит 4 евро.' },
  { before: 'Ο καφές κάνει ', after: ' ευρώ.', value: 5, hint: 'Кофе стоит 5 евро.' },
  { before: 'Το εισιτήριο κάνει ', after: ' λεπτά.', value: 50, hint: 'Билет стоит 50 центов.' },
  { before: 'Το εισιτήριο κάνει ', after: ' λεπτά.', value: 60, hint: 'Билет стоит 60 центов.' },
  { before: 'Το εισιτήριο κάνει ', after: ' λεπτά.', value: 70, hint: 'Билет стоит 70 центов.' },
  { before: 'Το εισιτήριο κάνει ', after: ' λεπτά.', value: 80, hint: 'Билет стоит 80 центов.' },
  { before: 'Το εισιτήριο κάνει ', after: ' λεπτά.', value: 90, hint: 'Билет стоит 90 центов.' },
  { before: 'Το εισιτήριο κάνει ', after: ' λεπτά.', value: 100, hint: 'Билет стоит 100 центов.' },
  { before: 'Το εισιτήριο κάνει ', after: ' λεπτά.', value: 120, hint: 'Билет стоит 120 центов.' },
  { before: 'Το εισιτήριο κάνει ', after: ' λεπτά.', value: 140, hint: 'Билет стоит 140 центов.' },
  { before: 'Το εισιτήριο κάνει ', after: ' λεπτά.', value: 200, hint: 'Билет стоит 200 центов.' },
] as const

export const FILL_GAP_SOURCE_TABLES = {
  personalPronouns: PERSONAL_PRONOUNS,
  possessionExamples: POSSESSION_EXAMPLES,
  recipientExamples: RECIPIENT_EXAMPLES,
  eimaiSubjects: EIMAI_SUBJECTS,
  eimaiPredicates: EIMAI_PREDICATES,
  numbers: VERIFIED_COUNTING_NUMBERS,
}
