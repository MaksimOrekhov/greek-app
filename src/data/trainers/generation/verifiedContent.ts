/**
 * Small, reviewed source tables for local multi-select question generation.
 * Pronouns/possessives: CGL grammar reference, https://www.greek-language.gr/digitalResources/modern_greek/tools/lexica/glossology_edu/iframe.html?heading=3&id=147
 * Polite plural: CGL first-grade grammar, https://www.greek-language.gr/digitalResources/modern_greek/education/gram_first_grade/index.html?id=06
 * είμαι and counting forms: official Ministry grammar chapters C_06 and C_04 (linked from AGENTS.md).
 * Recipient phrases are reviewed examples from the current T2 bank and CGL A2 material.
 */
export interface PronounMeaning {
  greek: string
  russian: string
}

export const PERSONAL_PRONOUNS: PronounMeaning[] = [
  { greek: 'εγώ', russian: 'я' },
  { greek: 'εσύ', russian: 'ты' },
  { greek: 'αυτός', russian: 'он' },
  { greek: 'αυτή', russian: 'она' },
  { greek: 'αυτό', russian: 'оно' },
  { greek: 'εμείς', russian: 'мы' },
  { greek: 'εσείς', russian: 'вы' },
  { greek: 'αυτοί', russian: 'они' },
  { greek: 'αυτές', russian: 'они' },
  { greek: 'αυτά', russian: 'они' },
]

export interface PossessionExample {
  greek: string
  russian: string
  possessor: 'μου' | 'σου' | 'του' | 'της' | 'μας' | 'σας' | 'τους'
}

const possessors: PossessionExample['possessor'][] = ['μου', 'σου', 'του', 'της', 'μας', 'σας', 'τους']
const possessorTranslations: Record<PossessionExample['possessor'], (gender: 'masculine' | 'feminine' | 'plural') => string> = {
  μου: (gender) => gender === 'masculine' ? 'мой' : gender === 'feminine' ? 'моя' : 'мои',
  σου: (gender) => gender === 'masculine' ? 'твой' : gender === 'feminine' ? 'твоя' : 'твои',
  του: (gender) => gender === 'masculine' ? 'его' : gender === 'feminine' ? 'его' : 'его',
  της: (gender) => gender === 'masculine' ? 'её' : gender === 'feminine' ? 'её' : 'её',
  μας: (gender) => gender === 'masculine' ? 'наш' : gender === 'feminine' ? 'наша' : 'наши',
  σας: (gender) => gender === 'masculine' ? 'ваш' : gender === 'feminine' ? 'ваша' : 'ваши',
  τους: () => 'их',
}

const possessions: Array<{ greekNounPhrase: string; russianNoun: string; gender: 'masculine' | 'feminine' | 'plural' }> = [
  { greekNounPhrase: 'το σπίτι', russianNoun: 'дом', gender: 'masculine' },
  { greekNounPhrase: 'το βιβλίο', russianNoun: 'книга', gender: 'feminine' },
  { greekNounPhrase: 'η μουσική', russianNoun: 'музыка', gender: 'feminine' },
  { greekNounPhrase: 'τα βιβλία', russianNoun: 'книги', gender: 'plural' },
  { greekNounPhrase: 'τα σπίτια', russianNoun: 'дома', gender: 'plural' },
]

export const POSSESSION_EXAMPLES: PossessionExample[] = possessions.flatMap(({ greekNounPhrase, russianNoun, gender }) =>
  possessors.map((possessor) => ({
    greek: `${greekNounPhrase} ${possessor}`,
    russian: `${possessorTranslations[possessor](gender)} ${russianNoun}`,
    possessor,
  })),
)

export interface RecipientExample {
  greek: string
  russian: string
}

// Complete phrases are reused as reviewed units; the generator never swaps a
// pronoun into a verb frame or invents a new sentence.
export const RECIPIENT_EXAMPLES: RecipientExample[] = [
  { greek: 'Μου αρέσει ο καφές.', russian: 'Мне нравится кофе.' },
  { greek: 'Μου αρέσει η μουσική.', russian: 'Мне нравится музыка.' },
  { greek: 'Μου δίνουν ένα βιβλίο.', russian: 'Мне дают книгу.' },
  { greek: 'Σου αρέσει ο καφές;', russian: 'Тебе нравится кофе?' },
  { greek: 'Της αρέσει η μουσική.', russian: 'Ей нравится музыка.' },
  { greek: 'Του δίνω το βιβλίο.', russian: 'Я даю ему книгу.' },
  { greek: 'Μας δίνουν ένα βιβλίο.', russian: 'Нам дают книгу.' },
  { greek: 'Σας δίνω το βιβλίο.', russian: 'Я даю вам книгу.' },
  { greek: 'Τους δίνω το βιβλίο.', russian: 'Я даю им книгу.' },
]

export interface EimaiSubject {
  greek: string
  russian: string
  verb: 'είμαι' | 'είσαι' | 'είναι' | 'είμαστε' | 'είστε'
}

export const EIMAI_SUBJECTS: EimaiSubject[] = [
  { greek: 'Εγώ', russian: 'я', verb: 'είμαι' },
  { greek: 'Εσύ', russian: 'ты', verb: 'είσαι' },
  { greek: 'Αυτός', russian: 'он', verb: 'είναι' },
  { greek: 'Αυτή', russian: 'она', verb: 'είναι' },
  { greek: 'Εμείς', russian: 'мы', verb: 'είμαστε' },
  { greek: 'Εσείς', russian: 'вы', verb: 'είστε' },
  { greek: 'Αυτοί', russian: 'они', verb: 'είναι' },
  { greek: 'Αυτές', russian: 'они', verb: 'είναι' },
]

export const EIMAI_PREDICATES = [
  { greek: 'εδώ', russian: 'здесь' },
  { greek: 'στο σπίτι', russian: 'дома' },
  { greek: 'στην Ελλάδα', russian: 'в Греции' },
  { greek: 'από τη Σερβία', russian: 'из Сербии' },
] as const

/**
 * Finite neutral counting forms selected from the official A–Γ Gymnasium
 * number table and the composition rules there. Avoids inflected forms that
 * would require a noun's gender or case.
 */
export const VERIFIED_COUNTING_NUMBERS: Array<{ value: number; greek: string }> = [
  { value: 0, greek: 'μηδέν' },
  { value: 1, greek: 'ένα' },
  { value: 2, greek: 'δύο' },
  { value: 3, greek: 'τρία' },
  { value: 4, greek: 'τέσσερα' },
  { value: 5, greek: 'πέντε' },
  { value: 6, greek: 'έξι' },
  { value: 7, greek: 'επτά' },
  { value: 8, greek: 'οκτώ' },
  { value: 9, greek: 'εννέα' },
  { value: 10, greek: 'δέκα' },
  { value: 11, greek: 'έντεκα' },
  { value: 12, greek: 'δώδεκα' },
  { value: 13, greek: 'δεκατρία' },
  { value: 14, greek: 'δεκατέσσερα' },
  { value: 15, greek: 'δεκαπέντε' },
  { value: 16, greek: 'δεκαέξι' },
  { value: 17, greek: 'δεκαεπτά' },
  { value: 18, greek: 'δεκαοκτώ' },
  { value: 19, greek: 'δεκαεννέα' },
  { value: 20, greek: 'είκοσι' },
  { value: 21, greek: 'είκοσι ένα' },
  { value: 22, greek: 'είκοσι δύο' },
  { value: 23, greek: 'είκοσι τρία' },
  { value: 24, greek: 'είκοσι τέσσερα' },
  { value: 25, greek: 'είκοσι πέντε' },
  { value: 28, greek: 'είκοσι οκτώ' },
  { value: 30, greek: 'τριάντα' },
  { value: 31, greek: 'τριάντα ένα' },
  { value: 34, greek: 'τριάντα τέσσερα' },
  { value: 40, greek: 'σαράντα' },
  { value: 43, greek: 'σαράντα τρία' },
  { value: 50, greek: 'πενήντα' },
  { value: 53, greek: 'πενήντα τρία' },
  { value: 60, greek: 'εξήντα' },
  { value: 63, greek: 'εξήντα τρία' },
  { value: 70, greek: 'εβδομήντα' },
  { value: 73, greek: 'εβδομήντα τρία' },
  { value: 80, greek: 'ογδόντα' },
  { value: 83, greek: 'ογδόντα τρία' },
  { value: 89, greek: 'ογδόντα εννέα' },
  { value: 90, greek: 'ενενήντα' },
  { value: 94, greek: 'ενενήντα τέσσερα' },
  { value: 100, greek: 'εκατό' },
  { value: 101, greek: 'εκατόν ένα' },
  { value: 102, greek: 'εκατόν δύο' },
  { value: 107, greek: 'εκατόν επτά' },
  { value: 120, greek: 'εκατόν είκοσι' },
  { value: 125, greek: 'εκατόν είκοσι πέντε' },
  { value: 140, greek: 'εκατόν σαράντα' },
  { value: 178, greek: 'εκατόν εβδομήντα οκτώ' },
  { value: 199, greek: 'εκατόν ενενήντα εννέα' },
  { value: 200, greek: 'διακόσια' },
]
