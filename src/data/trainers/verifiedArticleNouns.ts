import { words } from '../words.ts'
import type { ArticleGenderNoun, NominativeArticle } from '../../lib/trainers/articleGender/articleGenderTypes.ts'

export interface VerifiedArticleNoun {
  wordId: string
  article: NominativeArticle
  sourceUrl: string
  noteRu?: string
}

const dictionarySearchUrl = 'https://www.greek-language.gr/greekLang/modern_greek/tools/lexica/triantafyllides/search.html'

function sourceUrl(lemma: string): string {
  return `${dictionarySearchUrl}?lq=${encodeURIComponent(lemma)}`
}

/** Each article is transcribed from the linked dictionary headword, never inferred from its ending. */
export const verifiedArticleNounRecords: readonly VerifiedArticleNoun[] = [
  { wordId: 'καφές', article: 'ο', sourceUrl: sourceUrl('καφές') },
  { wordId: 'φίλος', article: 'ο', sourceUrl: sourceUrl('φίλος') },
  { wordId: 'φοιτητής', article: 'ο', sourceUrl: sourceUrl('φοιτητής') },
  { wordId: 'άντρας', article: 'ο', sourceUrl: sourceUrl('άντρας') },
  { wordId: 'χυμός', article: 'ο', sourceUrl: sourceUrl('χυμός') },
  { wordId: 'γύρος', article: 'ο', sourceUrl: sourceUrl('γύρος') },
  { wordId: 'χάρτης', article: 'ο', sourceUrl: sourceUrl('χάρτης') },
  { wordId: 'φούρνος', article: 'ο', sourceUrl: sourceUrl('φούρνος') },
  { wordId: 'λογαριασμός', article: 'ο', sourceUrl: sourceUrl('λογαριασμός') },
  { wordId: 'δρόμος', article: 'ο', sourceUrl: sourceUrl('δρόμος') },
  { wordId: 'πατέρας', article: 'ο', sourceUrl: sourceUrl('πατέρας') },
  { wordId: 'αριθμός', article: 'ο', sourceUrl: sourceUrl('αριθμός') },
  { wordId: 'αδελφός', article: 'ο', sourceUrl: sourceUrl('αδελφός') },
  { wordId: 'θείος', article: 'ο', sourceUrl: sourceUrl('θείος') },
  { wordId: 'μπαμπάς', article: 'ο', sourceUrl: sourceUrl('μπαμπάς') },
  { wordId: 'κινηματογράφος', article: 'ο', sourceUrl: sourceUrl('κινηματογράφος') },
  { wordId: 'χορός', article: 'ο', sourceUrl: sourceUrl('χορός') },
  { wordId: 'μουσακάς', article: 'ο', sourceUrl: sourceUrl('μουσακάς') },
  { wordId: 'καθηγητής', article: 'ο', sourceUrl: sourceUrl('καθηγητής') },
  { wordId: 'καιρός', article: 'ο', sourceUrl: sourceUrl('καιρός') },
  { wordId: 'χρόνος', article: 'ο', sourceUrl: sourceUrl('χρόνος') },
  { wordId: 'μήνας', article: 'ο', sourceUrl: sourceUrl('μήνας') },
  { wordId: 'γιος', article: 'ο', sourceUrl: sourceUrl('γιος') },
  { wordId: 'κόσμος', article: 'ο', sourceUrl: sourceUrl('κόσμος') },
  { wordId: 'ωκεανός', article: 'ο', sourceUrl: sourceUrl('ωκεανός') },
  { wordId: 'τύπος', article: 'ο', sourceUrl: sourceUrl('τύπος') },
  { wordId: 'χαρακτήρας', article: 'ο', sourceUrl: sourceUrl('χαρακτήρας') },

  { wordId: 'μαμά', article: 'η', sourceUrl: sourceUrl('μαμά') },
  { wordId: 'μπίρα', article: 'η', sourceUrl: sourceUrl('μπίρα') },
  { wordId: 'σαλάτα', article: 'η', sourceUrl: sourceUrl('σαλάτα') },
  { wordId: 'σοκολάτα', article: 'η', sourceUrl: sourceUrl('σοκολάτα') },
  { wordId: 'ντομάτα', article: 'η', sourceUrl: sourceUrl('ντομάτα') },
  { wordId: 'ώρα', article: 'η', sourceUrl: sourceUrl('ώρα') },
  { wordId: 'καρέκλα', article: 'η', sourceUrl: sourceUrl('καρέκλα') },
  { wordId: 'τράπεζα', article: 'η', sourceUrl: sourceUrl('τράπεζα') },
  { wordId: 'κυρία', article: 'η', sourceUrl: sourceUrl('κύριος') },
  { wordId: 'φίλη', article: 'η', sourceUrl: sourceUrl('φίλος') },
  { wordId: 'κόρη', article: 'η', sourceUrl: sourceUrl('κόρη') },
  { wordId: 'σελίδα', article: 'η', sourceUrl: sourceUrl('σελίδα') },
  { wordId: 'στάση', article: 'η', sourceUrl: sourceUrl('στάση') },
  { wordId: 'πορτοκαλάδα', article: 'η', sourceUrl: sourceUrl('πορτοκαλάδα') },
  { wordId: 'λεμονάδα', article: 'η', sourceUrl: sourceUrl('λεμονάδα') },
  { wordId: 'πίτσα', article: 'η', sourceUrl: sourceUrl('πίτσα') },
  { wordId: 'τυρόπιτα', article: 'η', sourceUrl: sourceUrl('τυρόπιτα') },
  { wordId: 'σπανακόπιτα', article: 'η', sourceUrl: sourceUrl('σπανακόπιτα') },
  { wordId: 'γαλοπούλα', article: 'η', sourceUrl: sourceUrl('γαλοπούλα') },
  { wordId: 'ζακέτα', article: 'η', sourceUrl: sourceUrl('ζακέτα') },
  { wordId: 'γυναίκα', article: 'η', sourceUrl: sourceUrl('γυναίκα') },
  { wordId: 'ταβέρνα', article: 'η', sourceUrl: sourceUrl('ταβέρνα') },
  { wordId: 'Κυριακή', article: 'η', sourceUrl: sourceUrl('Κυριακή') },
  { wordId: 'φοιτήτρια', article: 'η', sourceUrl: sourceUrl('φοιτητής') },
  { wordId: 'μέρα', article: 'η', sourceUrl: sourceUrl('μέρα') },
  { wordId: 'μητέρα', article: 'η', sourceUrl: sourceUrl('μητέρα') },
  { wordId: 'αδελφή', article: 'η', sourceUrl: sourceUrl('αδελφός') },
  { wordId: 'γάτα', article: 'η', sourceUrl: sourceUrl('γάτα') },
  { wordId: 'θάλασσα', article: 'η', sourceUrl: sourceUrl('θάλασσα') },
  { wordId: 'μουσική', article: 'η', sourceUrl: sourceUrl('μουσική') },
  { wordId: 'περίοδος', article: 'η', sourceUrl: sourceUrl('περίοδος'), noteRu: 'Слово заканчивается на -ος, но оно женского рода. Запоминай сочетание целиком: η περίοδος.' },
  { wordId: 'παράγραφος', article: 'η', sourceUrl: sourceUrl('παράγραφος'), noteRu: 'Слово заканчивается на -ος, но оно женского рода. Запоминай сочетание целиком: η παράγραφος.' },

  { wordId: 'γάλα', article: 'το', sourceUrl: sourceUrl('γάλα') },
  { wordId: 'νερό', article: 'το', sourceUrl: sourceUrl('νερό') },
  { wordId: 'κρασί', article: 'το', sourceUrl: sourceUrl('κρασί') },
  { wordId: 'τζατζίκι', article: 'το', sourceUrl: sourceUrl('τζατζίκι') },
  { wordId: 'ταξί', article: 'το', sourceUrl: sourceUrl('ταξί') },
  { wordId: 'αεροπλάνο', article: 'το', sourceUrl: sourceUrl('αεροπλάνο') },
  { wordId: 'αυτοκίνητο', article: 'το', sourceUrl: sourceUrl('αυτοκίνητο') },
  { wordId: 'τηλέφωνο', article: 'το', sourceUrl: sourceUrl('τηλέφωνο') },
  { wordId: 'διαβατήριο', article: 'το', sourceUrl: sourceUrl('διαβατήριο') },
  { wordId: 'πρόβλημα', article: 'το', sourceUrl: sourceUrl('πρόβλημα'), noteRu: 'Окончание -α здесь не означает женский род. Запоминай сочетание целиком: το πρόβλημα.' },
  { wordId: 'αεροδρόμιο', article: 'το', sourceUrl: sourceUrl('αεροδρόμιο') },
  { wordId: 'θαύμα', article: 'το', sourceUrl: sourceUrl('θαύμα') },
  { wordId: 'σπίτι', article: 'το', sourceUrl: sourceUrl('σπίτι') },
  { wordId: 'μολύβι', article: 'το', sourceUrl: sourceUrl('μολύβι') },
  { wordId: 'βιβλίο', article: 'το', sourceUrl: sourceUrl('βιβλίο') },
  { wordId: 'τραπέζι', article: 'το', sourceUrl: sourceUrl('τραπέζι') },
  { wordId: 'ξενοδοχείο', article: 'το', sourceUrl: sourceUrl('ξενοδοχείο') },
  { wordId: 'παιδί', article: 'το', sourceUrl: sourceUrl('παιδί') },
  { wordId: 'γιαούρτι', article: 'το', sourceUrl: sourceUrl('γιαούρτι') },
  { wordId: 'γράμμα', article: 'το', sourceUrl: sourceUrl('γράμμα') },
  { wordId: 'μάθημα', article: 'το', sourceUrl: sourceUrl('μάθημα') },
  { wordId: 'λεωφορείο', article: 'το', sourceUrl: sourceUrl('λεωφορείο') },
  { wordId: 'δέμα', article: 'το', sourceUrl: sourceUrl('δέμα') },
  { wordId: 'ποτήρι', article: 'το', sourceUrl: sourceUrl('ποτήρι') },
  { wordId: 'πιάτο', article: 'το', sourceUrl: sourceUrl('πιάτο') },
  { wordId: 'μπαλκόνι', article: 'το', sourceUrl: sourceUrl('μπαλκόνι') },
  { wordId: 'δωμάτιο', article: 'το', sourceUrl: sourceUrl('δωμάτιο') },
  { wordId: 'κορίτσι', article: 'το', sourceUrl: sourceUrl('κορίτσι') },
  { wordId: 'μουσείο', article: 'το', sourceUrl: sourceUrl('μουσείο') },
  { wordId: 'παγωτό', article: 'το', sourceUrl: sourceUrl('παγωτό') },
  { wordId: 'ψωμί', article: 'το', sourceUrl: sourceUrl('ψωμί') },
]

const dictionaryWords = new Map(words.map((word) => [word.greek, word]))

export const articleGenderNouns: readonly ArticleGenderNoun[] = verifiedArticleNounRecords.flatMap((record) => {
  const word = dictionaryWords.get(record.wordId)
  if (!word || !word.partOfSpeech.includes('noun')) return []
  return [{
    wordId: word.greek,
    greek: word.greek,
    russian: word.russian,
    article: record.article,
    sourceUrl: record.sourceUrl,
    ...(record.noteRu ? { noteRu: record.noteRu } : {}),
  }]
})
