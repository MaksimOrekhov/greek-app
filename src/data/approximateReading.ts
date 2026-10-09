const readingMap: Record<string, string> = {
  αι: 'э', αί: 'э́', ει: 'и', εί: 'и́', οι: 'и', οί: 'и́', ου: 'у', ού: 'у́',
  ια: 'я', ιά: 'я́',
  αυ: 'ав', αύ: 'а́в', ευ: 'эв', εύ: 'э́в', ηυ: 'ив', ηύ: 'и́в',
  μπ: 'мб', ντ: 'нд', γκ: 'нг', γγ: 'нг', γχ: 'нх', γξ: 'нкс', τζ: 'дз', τσ: 'ц',
  α: 'а', ά: 'а́', β: 'в', γ: 'г', δ: 'з', ε: 'э', έ: 'э́', ζ: 'з',
  η: 'и', ή: 'и́', θ: 'с', ι: 'и', ί: 'и́', κ: 'к', λ: 'л', μ: 'м',
  ν: 'н', ξ: 'кс', ο: 'о', ό: 'о́', π: 'п', ρ: 'р', σ: 'с', ς: 'с',
  τ: 'т', υ: 'и', ύ: 'и́', φ: 'ф', χ: 'х', ψ: 'пс', ω: 'о', ώ: 'о́',
}

export function approximateReading(text: string): string {
  const normalized = text.normalize('NFC').toLocaleLowerCase('el')
  let result = ''

  for (let index = 0; index < normalized.length;) {
    if (normalized.startsWith('γεια', index)) {
      result += 'я'
      index += 4
      continue
    }
    if (normalized.startsWith('γιά', index)) {
      result += 'я́'
      index += 3
      continue
    }
    if (normalized.startsWith('για', index)) {
      result += 'я'
      index += 3
      continue
    }
    const pair = normalized.slice(index, index + 2)
    if (pair.length === 2 && pair[0] === pair[1] && pair[0] !== 'γ' && /[βδζθκλμνπρστφχψ]/u.test(pair[0])) {
      result += readingMap[pair[0]]
      index += 2
      continue
    }
    if (readingMap[pair]) {
      const next = normalized[index + 2] ?? ''
      const isVoiceless = /[κπτφθχσξψ]/u.test(next) || !next || /[\s.,!?;:…]/u.test(next)
      const isAvEv = /^(?:αυ|αύ|ευ|εύ|ηυ|ηύ)$/u.test(pair)
      const previous = normalized[index - 1] ?? ''
      const atWordStart = index === 0 || /[\s.,!?;:…]/u.test(previous)
      const afterConsonant = /[βγδζθκλμνξπρστφχψ]/u.test(previous)
      if (isAvEv && isVoiceless) result += readingMap[pair].replace(/в$/u, 'ф')
      else if (/^(?:μπ|ντ|γκ)$/u.test(pair) && (atWordStart || afterConsonant)) result += pair === 'μπ' ? 'б' : pair === 'ντ' ? 'д' : 'г'
      else result += readingMap[pair]
      index += 2
      continue
    }

    const letter = normalized[index]
    const gammaBeforeFrontVowel = letter === 'γ'
      && /^(?:αι|αί|ε|έ|ει|εί|η|ή|ι|ί|οι|οί|υ|ύ|υι|υί)/u.test(normalized.slice(index + 1))
    result += gammaBeforeFrontVowel ? 'й' : readingMap[letter] ?? letter
    index += 1
  }

  return result
}
