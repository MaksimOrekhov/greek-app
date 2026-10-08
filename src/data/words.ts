export interface WordCard {
  greek: string
  russian: string
  transliteration: string
  category: string
  partOfSpeech: PartOfSpeech[]
  examples: WordExample[]
}

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'pronoun'
  | 'numeral'
  | 'particle'
  | 'conjunction'
  | 'preposition'
  | 'expression'

export const PART_OF_SPEECH_LABELS: Record<PartOfSpeech, string> = {
  noun: 'Существительное',
  verb: 'Глагол',
  adjective: 'Прилагательное',
  adverb: 'Наречие',
  pronoun: 'Местоимение',
  numeral: 'Числительное',
  particle: 'Частица',
  conjunction: 'Союз',
  preposition: 'Предлог',
  expression: 'Выражение',
}

export interface WordExample {
  greek: string
  transliteration: string
  russian: string
}

const wordList: Omit<WordCard, 'examples' | 'partOfSpeech'>[] = [
  { greek: 'ναι', russian: 'да', transliteration: 'нэ', category: 'Общение' },
  { greek: 'όχι', russian: 'нет', transliteration: 'о́хи', category: 'Общение' },
  { greek: 'καλά', russian: 'хорошо', transliteration: 'кала́', category: 'Общение' },
  { greek: 'ευχαριστώ', russian: 'спасибо', transliteration: 'эфхаристо́', category: 'Вежливые слова' },
  { greek: 'παρακαλώ', russian: 'пожалуйста', transliteration: 'паракало́', category: 'Вежливые слова' },
  { greek: 'γεια σου', russian: 'привет / пока', transliteration: 'я су', category: 'Приветствия' },
  { greek: 'καλημέρα', russian: 'доброе утро / добрый день', transliteration: 'калимэ́ра', category: 'Приветствия' },
  { greek: 'καλησπέρα', russian: 'добрый вечер', transliteration: 'калиспэ́ра', category: 'Приветствия' },
  { greek: 'καληνύχτα', russian: 'спокойной ночи', transliteration: 'калини́хта', category: 'Приветствия' },
  { greek: 'μαμά', russian: 'мама', transliteration: 'мама́', category: 'Еда и семья' },
  { greek: 'γάλα', russian: 'молоко', transliteration: 'га́ла', category: 'Еда и напитки' },
  { greek: 'νερό', russian: 'вода', transliteration: 'нэро́', category: 'Еда и напитки' },
  { greek: 'καφέ', russian: 'кофе', transliteration: 'кафэ́', category: 'Еда и напитки' },
  { greek: 'μπίρα', russian: 'пиво', transliteration: 'би́ра', category: 'Еда и напитки' },
  { greek: 'κρασί', russian: 'вино', transliteration: 'краси́', category: 'Еда и напитки' },
  { greek: 'σαλάτα', russian: 'салат', transliteration: 'сала́та', category: 'Еда и напитки' },
  { greek: 'σοκολάτα', russian: 'шоколад', transliteration: 'сокола́та', category: 'Еда и напитки' },
  { greek: 'ντομάτα', russian: 'помидор', transliteration: 'дома́та', category: 'Еда и напитки' },
  { greek: 'τζατζίκι', russian: 'дзадзики', transliteration: 'дзадзи́ки', category: 'Еда и напитки' },
  { greek: 'ταξί', russian: 'такси', transliteration: 'такси́', category: 'Транспорт' },
  { greek: 'αεροπλάνο', russian: 'самолёт', transliteration: 'аэропла́но', category: 'Транспорт' },
  { greek: 'αυτοκίνητο', russian: 'автомобиль', transliteration: 'афтоки́нито', category: 'Транспорт' },
  { greek: 'τηλέφωνο', russian: 'телефон', transliteration: 'тилэ́фоно', category: 'В дороге' },
  { greek: 'διαβατήριο', russian: 'паспорт', transliteration: 'зьявати́рио', category: 'В дороге' },
  { greek: 'πρόβλημα', russian: 'проблема', transliteration: 'про́влима', category: 'Полезные слова' },
  { greek: 'Ελλάδα', russian: 'Греция', transliteration: 'эла́да', category: 'Языки и страны' },
  { greek: 'αγγλικά', russian: 'английский язык', transliteration: 'англика́', category: 'Языки и страны' },
  { greek: 'ελληνικά', russian: 'греческий язык', transliteration: 'элиника́', category: 'Языки и страны' },
  { greek: 'μένω', russian: 'жить / оставаться', transliteration: 'мэ́но', category: 'Глаголы' },
  { greek: 'ξέρω', russian: 'знать', transliteration: 'ксе́ро', category: 'Глаголы' },
  { greek: 'θέλω', russian: 'хотеть', transliteration: 'се́ло*', category: 'Глаголы' },
  { greek: 'κάνω', russian: 'делать', transliteration: 'ка́но', category: 'Глаголы' },
  { greek: 'περιμένω', russian: 'ждать', transliteration: 'периме́но', category: 'Глаголы' },
  { greek: 'καταλαβαίνω', russian: 'понимать', transliteration: 'каталэвэ́но', category: 'Глаголы' },
  { greek: 'έχω', russian: 'иметь / у меня есть', transliteration: 'э́хо', category: 'Глаголы' },
  { greek: 'δουλεύω', russian: 'работать', transliteration: 'дулэ́во', category: 'Глаголы' },
  { greek: 'είμαι', russian: 'я есть / я являюсь', transliteration: 'и́мэ', category: 'Глаголы' },
  { greek: 'είσαι', russian: 'ты есть', transliteration: 'и́сэ', category: 'Глаголы' },
  { greek: 'είναι', russian: 'он / она / оно есть', transliteration: 'и́нэ', category: 'Глаголы' },
  { greek: 'εσύ', russian: 'ты', transliteration: 'эси́', category: 'Местоимения' },
  { greek: 'λίγο', russian: 'немного', transliteration: 'ли́го', category: 'Полезные слова' },
  { greek: 'τώρα', russian: 'сейчас', transliteration: 'то́ра', category: 'Время' },
  { greek: 'αύριο', russian: 'завтра', transliteration: 'а́врио', category: 'Время' },
  { greek: 'αυτό', russian: 'это', transliteration: 'афто́', category: 'Полезные слова' },
  { greek: 'δεν', russian: 'не', transliteration: 'зэн*', category: 'Полезные слова' },
  { greek: 'γιατί', russian: 'почему / потому что', transliteration: 'яти́', category: 'Полезные слова' },
  { greek: 'ένα', russian: 'один / одно', transliteration: 'э́на', category: 'Числа' },
  { greek: 'στο', russian: 'в / на', transliteration: 'сто', category: 'Полезные слова' },
  { greek: 'με λένε…', russian: 'меня зовут…', transliteration: 'ме ле́нэ…', category: 'Знакомство' },
]

const partOfSpeechByWord: Record<string, PartOfSpeech[]> = {
  'ναι': ['particle'],
  'όχι': ['particle'],
  'καλά': ['adjective', 'adverb'],
  'ευχαριστώ': ['verb'],
  'παρακαλώ': ['verb'],
  'γεια σου': ['expression'],
  'καλημέρα': ['expression'],
  'καλησπέρα': ['expression'],
  'καληνύχτα': ['expression'],
  'μαμά': ['noun'],
  'γάλα': ['noun'],
  'νερό': ['noun'],
  'καφέ': ['noun'],
  'μπίρα': ['noun'],
  'κρασί': ['noun'],
  'σαλάτα': ['noun'],
  'σοκολάτα': ['noun'],
  'ντομάτα': ['noun'],
  'τζατζίκι': ['noun'],
  'ταξί': ['noun'],
  'αεροπλάνο': ['noun'],
  'αυτοκίνητο': ['noun'],
  'τηλέφωνο': ['noun'],
  'διαβατήριο': ['noun'],
  'πρόβλημα': ['noun'],
  'Ελλάδα': ['noun'],
  'αγγλικά': ['noun', 'adverb'],
  'ελληνικά': ['noun', 'adverb'],
  'μένω': ['verb'],
  'ξέρω': ['verb'],
  'θέλω': ['verb'],
  'κάνω': ['verb'],
  'περιμένω': ['verb'],
  'καταλαβαίνω': ['verb'],
  'έχω': ['verb'],
  'δουλεύω': ['verb'],
  'είμαι': ['verb'],
  'είσαι': ['verb'],
  'είναι': ['verb'],
  'εσύ': ['pronoun'],
  'λίγο': ['adjective', 'adverb'],
  'τώρα': ['adverb'],
  'αύριο': ['adverb'],
  'αυτό': ['pronoun'],
  'δεν': ['particle'],
  'γιατί': ['adverb', 'conjunction'],
  'ένα': ['numeral'],
  'στο': ['preposition'],
  'με λένε…': ['expression'],
}

const examplesByWord: Record<string, WordExample[]> = {
  'ναι': [{ greek: 'Ναι, ευχαριστώ.', transliteration: 'нэ, эфхаристо́', russian: 'Да, спасибо.' }],
  'όχι': [{ greek: 'Όχι, ευχαριστώ.', transliteration: 'о́хи, эфхаристо́', russian: 'Нет, спасибо.' }],
  'καλά': [{ greek: 'Είμαι καλά.', transliteration: 'и́мэ кала́', russian: 'У меня всё хорошо.' }],
  'ευχαριστώ': [{ greek: 'Ευχαριστώ πολύ.', transliteration: 'эфхаристо́ поли́', russian: 'Большое спасибо.' }],
  'παρακαλώ': [{ greek: 'Ένα νερό, παρακαλώ.', transliteration: 'э́на нэро́, паракало́', russian: 'Воду, пожалуйста.' }],
  'γεια σου': [{ greek: 'Γεια σου, Μαρία!', transliteration: 'я су, мари́а', russian: 'Привет, Мария!' }],
  'καλημέρα': [{ greek: 'Καλημέρα σας!', transliteration: 'калимэ́ра сас', russian: 'Доброе утро!' }],
  'καλησπέρα': [{ greek: 'Καλησπέρα, κύριε!', transliteration: 'калиспэ́ра ки́риэ', russian: 'Добрый вечер, господин!' }],
  'καληνύχτα': [{ greek: 'Καληνύχτα, μαμά!', transliteration: 'калини́хта, мама́', russian: 'Спокойной ночи, мама!' }],
  'μαμά': [{ greek: 'Η μαμά είναι εδώ.', transliteration: 'и мама́ и́нэ э́до', russian: 'Мама здесь.' }],
  'γάλα': [{ greek: 'Θέλω γάλα.', transliteration: 'сэ́ло га́ла', russian: 'Я хочу молока.' }],
  'νερό': [{ greek: 'Ένα νερό, παρακαλώ.', transliteration: 'э́на нэро́, паракало́', russian: 'Воду, пожалуйста.' }],
  'καφέ': [{ greek: 'Έναν καφέ, παρακαλώ.', transliteration: 'э́нан кафэ́, паракало́', russian: 'Кофе, пожалуйста.' }],
  'μπίρα': [{ greek: 'Μία μπίρα, παρακαλώ.', transliteration: 'ми́а би́ра, паракало́', russian: 'Одно пиво, пожалуйста.' }],
  'κρασί': [{ greek: 'Θέλω κρασί.', transliteration: 'сэ́ло краси́', russian: 'Я хочу вина.' }],
  'σαλάτα': [{ greek: 'Μία σαλάτα, παρακαλώ.', transliteration: 'ми́а сала́та, паракало́', russian: 'Один салат, пожалуйста.' }],
  'σοκολάτα': [{ greek: 'Θέλω σοκολάτα.', transliteration: 'сэ́ло сокола́та', russian: 'Я хочу шоколад.' }],
  'ντομάτα': [{ greek: 'Η ντομάτα είναι κόκκινη.', transliteration: 'и дома́та и́нэ ко́кини', russian: 'Помидор красный.' }],
  'τζατζίκι': [{ greek: 'Θέλω τζατζίκι.', transliteration: 'сэ́ло дзадзи́ки', russian: 'Я хочу дзадзики.' }],
  'ταξί': [{ greek: 'Το ταξί είναι εδώ.', transliteration: 'то такси́ и́нэ э́до', russian: 'Такси здесь.' }],
  'αεροπλάνο': [{ greek: 'Το αεροπλάνο φεύγει αύριο.', transliteration: 'то аэропла́но фэ́вги а́врио', russian: 'Самолёт улетает завтра.' }],
  'αυτοκίνητο': [{ greek: 'Έχω αυτοκίνητο.', transliteration: 'э́хо афтоки́нито', russian: 'У меня есть автомобиль.' }],
  'τηλέφωνο': [{ greek: 'Έχω τηλέφωνο.', transliteration: 'э́хо тилэ́фоно', russian: 'У меня есть телефон.' }],
  'διαβατήριο': [{ greek: 'Έχω το διαβατήριο.', transliteration: 'э́хо то зьявати́рио', russian: 'У меня есть паспорт.' }],
  'πρόβλημα': [{ greek: 'Δεν έχω πρόβλημα.', transliteration: 'зэн э́хо про́влима', russian: 'У меня нет проблем.' }],
  'Ελλάδα': [{ greek: 'Είμαι στην Ελλάδα.', transliteration: 'и́мэ стин эла́да', russian: 'Я в Греции.' }],
  'αγγλικά': [{ greek: 'Μιλάω αγγλικά.', transliteration: 'мила́о англика́', russian: 'Я говорю по-английски.' }],
  'ελληνικά': [{ greek: 'Μιλάω ελληνικά.', transliteration: 'мила́о элиника́', russian: 'Я говорю по-гречески.' }],
  'μένω': [{ greek: 'Μένω στην Αθήνα.', transliteration: 'мэ́но стин аси́на', russian: 'Я живу в Афинах.' }],
  'ξέρω': [{ greek: 'Δεν ξέρω.', transliteration: 'зэн ксе́ро', russian: 'Я не знаю.' }],
  'θέλω': [{ greek: 'Θέλω νερό.', transliteration: 'сэ́ло нэро́', russian: 'Я хочу воды.' }],
  'κάνω': [{ greek: 'Κάνω καφέ.', transliteration: 'ка́но кафэ́', russian: 'Я готовлю кофе.' }],
  'περιμένω': [{ greek: 'Περιμένω ταξί.', transliteration: 'перимэ́но такси́', russian: 'Я жду такси.' }],
  'καταλαβαίνω': [{ greek: 'Δεν καταλαβαίνω.', transliteration: 'зэн каталэвэ́но', russian: 'Я не понимаю.' }],
  'έχω': [{ greek: 'Έχω χρόνο.', transliteration: 'э́хо хро́но', russian: 'У меня есть время.' }],
  'δουλεύω': [{ greek: 'Δουλεύω σήμερα.', transliteration: 'дулэ́во си́мэра', russian: 'Я работаю сегодня.' }],
  'είμαι': [{ greek: 'Είμαι καλά.', transliteration: 'и́мэ кала́', russian: 'У меня всё хорошо.' }],
  'είσαι': [{ greek: 'Είσαι εδώ.', transliteration: 'и́сэ э́до', russian: 'Ты здесь.' }],
  'είναι': [{ greek: 'Είναι εδώ.', transliteration: 'и́нэ э́до', russian: 'Он / она / оно здесь.' }],
  'εσύ': [{ greek: 'Εσύ είσαι εδώ.', transliteration: 'эси́ и́сэ э́до', russian: 'Ты здесь.' }],
  'λίγο': [{ greek: 'Θέλω λίγο νερό.', transliteration: 'сэ́ло ли́го нэро́', russian: 'Я хочу немного воды.' }],
  'τώρα': [{ greek: 'Τώρα είμαι εδώ.', transliteration: 'то́ра и́мэ э́до', russian: 'Сейчас я здесь.' }],
  'αύριο': [{ greek: 'Τα λέμε αύριο.', transliteration: 'та лэ́мэ а́врио', russian: 'До завтра.' }],
  'αυτό': [{ greek: 'Αυτό είναι καλό.', transliteration: 'афто́ и́нэ кало́', russian: 'Это хорошо.' }],
  'δεν': [{ greek: 'Δεν ξέρω.', transliteration: 'зэн ксе́ро', russian: 'Я не знаю.' }],
  'γιατί': [{ greek: 'Γιατί είσαι εδώ;', transliteration: 'яти́ и́сэ э́до', russian: 'Почему ты здесь?' }],
  'ένα': [{ greek: 'Ένα νερό, παρακαλώ.', transliteration: 'э́на нэро́, паракало́', russian: 'Воду, пожалуйста.' }],
  'στο': [{ greek: 'Μένω στο ξενοδοχείο.', transliteration: 'мэ́но сто ксэнодо́хио', russian: 'Я живу в гостинице.' }],
  'με λένε…': [{ greek: 'Με λένε Άννα.', transliteration: 'мэ лэ́нэ а́на', russian: 'Меня зовут Анна.' }],
}

export const words: WordCard[] = wordList.map((word) => ({
  ...word,
  partOfSpeech: partOfSpeechByWord[word.greek],
  examples: examplesByWord[word.greek] ?? [],
}))
