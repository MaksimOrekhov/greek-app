export interface ReadingRule {
  letters: string
  sound: string
  example: string
  pronunciation: string
  note?: string
}

export const vowelLetters: ReadingRule[] = [
  { letters: 'α', sound: 'а', example: 'άλλο', pronunciation: 'а́лло — другой' },
  { letters: 'ε', sound: 'э', example: 'ένα', pronunciation: 'э́на — один' },
  { letters: 'η · ι · υ', sound: 'и', example: 'ήλιος · ίσως · ύπνος', pronunciation: 'и́лиос · и́сос · и́пнос' },
  { letters: 'ο · ω', sound: 'о', example: 'όνομα · ώρα', pronunciation: 'о́нома · о́ра' },
]

export const vowelPairs: ReadingRule[] = [
  { letters: 'αι', sound: 'э', example: 'καιρός', pronunciation: 'кэро́с — погода' },
  { letters: 'ει', sound: 'и', example: 'είναι', pronunciation: 'и́нэ — есть / является' },
  { letters: 'οι', sound: 'и', example: 'οικογένεια', pronunciation: 'икогэ́ния — семья' },
  { letters: 'υι', sound: 'и', example: 'υιός', pronunciation: 'ио́с — сын', note: 'Встречается редко' },
  { letters: 'ου', sound: 'у', example: 'ουρανός', pronunciation: 'урано́с — небо' },
  { letters: 'αυ', sound: 'ав / аф', example: 'αύριο · αυτό', pronunciation: 'а́врио · афто́', note: 'ав перед звонким звуком, аф перед глухим' },
  { letters: 'ευ', sound: 'эв / эф', example: 'Ευρώπη · ευχαριστώ', pronunciation: 'эвро́пи · эфхаристо́', note: 'эв перед звонким звуком, эф перед глухим' },
  { letters: 'ηυ', sound: 'ив / иф', example: 'απηύδησα', pronunciation: 'апи́вдиса — мне надоело', note: 'Очень редкое сочетание; правило как у αυ и ευ' },
]

export const consonantPairs: ReadingRule[] = [
  { letters: 'μπ', sound: 'б · мб', example: 'μπάλα · λάμπα', pronunciation: 'ба́ла · ла́мба', note: 'В начале слова обычно б, внутри часто мб' },
  { letters: 'ντ', sound: 'д · нд', example: 'ντομάτα · πέντε', pronunciation: 'дома́та · пэ́ндэ', note: 'В начале слова обычно д, внутри часто нд' },
  { letters: 'γκ', sound: 'г · нг', example: 'γκάζι · αγκαλιά', pronunciation: 'га́зи · ангаля́', note: 'В начале слова обычно г, внутри часто нг' },
  { letters: 'γγ', sound: 'нг', example: 'άγγελος · εγγόνι', pronunciation: 'а́нгелос · э́нгони' },
  { letters: 'γχ', sound: 'нх', example: 'άγχος', pronunciation: 'а́нхос — тревога', note: 'Здесь γ перед χ звучит носовым н' },
  { letters: 'γξ', sound: 'нкс', example: 'σφίγξ', pronunciation: 'сфи́нкс — сфинкс', note: 'Редкое сочетание' },
  { letters: 'τσ', sound: 'ц', example: 'τσάι · κορίτσι', pronunciation: 'ца́й · кори́ци' },
  { letters: 'τζ', sound: 'дз', example: 'τζάκι · τζάμι', pronunciation: 'дза́ки · дза́ми' },
]

export const doubleConsonants = 'ββ · δδ · κκ · λλ · μμ · νν · ππ · ρρ · σσ · ττ'
