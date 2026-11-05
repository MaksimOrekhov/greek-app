import type { ArticleGenderHistory } from './articleGenderHistory.ts'
import { NOMINATIVE_ARTICLES, type ArticleGenderNoun, type NominativeArticle } from './articleGenderTypes.ts'

export const ARTICLE_GENDER_ROUND_COUNT = 5
export const ARTICLE_GENDER_WORDS_PER_ROUND = 4
export const ARTICLE_GENDER_SESSION_SIZE = ARTICLE_GENDER_ROUND_COUNT * ARTICLE_GENDER_WORDS_PER_ROUND
export const ARTICLE_GENDER_MAX_ERROR_REPEATS = 4

export interface ArticleGenderQuestion {
  noun: ArticleGenderNoun
  optionOrder: NominativeArticle[]
  selectedArticle: NominativeArticle | null
  answered: boolean
  isCorrect: boolean | null
}

export interface ArticleGenderRound {
  number: number
  questions: ArticleGenderQuestion[]
}

export interface ArticleGenderSession {
  rounds: ArticleGenderRound[]
  currentQuestionIndex: number
  completed: boolean
}

export interface ArticleGenderResults {
  totalWords: number
  correctAnswers: number
  errors: number
  accuracyPercent: number
  mistakes: Array<{
    wordId: string
    greek: string
    russian: string
    selectedArticle: NominativeArticle
    correctArticle: NominativeArticle
    noteRu?: string
  }>
}

export type ArticleGenderActionOutcome = 'answered' | 'already-answered' | 'invalid-article' | 'not-answered' | 'session-completed'

export interface ArticleGenderActionResult {
  session: ArticleGenderSession
  outcome: ArticleGenderActionOutcome
  isCorrect?: boolean
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    const current = result[index]!
    result[index] = result[target]!
    result[target] = current
  }
  return result
}

function articleCounts(sessionCount: number): Map<NominativeArticle, number> {
  const counts = new Map<NominativeArticle, number>(NOMINATIVE_ARTICLES.map((article) => [article, 6]))
  const firstExtra = NOMINATIVE_ARTICLES[sessionCount % NOMINATIVE_ARTICLES.length]!
  const secondExtra = NOMINATIVE_ARTICLES[(sessionCount + 1) % NOMINATIVE_ARTICLES.length]!
  counts.set(firstExtra, counts.get(firstExtra)! + 1)
  counts.set(secondExtra, counts.get(secondExtra)! + 1)
  return counts
}

function chooseSessionNouns(
  nouns: readonly ArticleGenderNoun[],
  history: ArticleGenderHistory,
  random: () => number,
): ArticleGenderNoun[] {
  const quota = articleCounts(history.sessionCount)
  const selected: ArticleGenderNoun[] = []
  const selectedIds = new Set<string>()
  const byId = new Map(nouns.map((noun) => [noun.wordId, noun]))
  const order = shuffle(history.order, random)
  const orderIndex = new Map(order.map((id, index) => [id, index]))
  const errorsByArticle = new Map<NominativeArticle, ArticleGenderNoun[]>(NOMINATIVE_ARTICLES.map((article) => [article, []]))

  for (const id of history.mistakeQueue) {
    const noun = byId.get(id)
    if (noun) errorsByArticle.get(noun.article)!.push(noun)
  }

  const selectedPerArticle = new Map<NominativeArticle, ArticleGenderNoun[]>(NOMINATIVE_ARTICLES.map((article) => [article, []]))
  const articleRotation = shuffle(NOMINATIVE_ARTICLES, random)
  let errorRepeats = 0
  while (errorRepeats < ARTICLE_GENDER_MAX_ERROR_REPEATS) {
    let addedInPass = false
    for (const article of articleRotation) {
      if (errorRepeats >= ARTICLE_GENDER_MAX_ERROR_REPEATS) break
      const bucket = selectedPerArticle.get(article)!
      if (bucket.length >= quota.get(article)!) continue
      const nextError = errorsByArticle.get(article)!.find((noun) => !selectedIds.has(noun.wordId))
      if (!nextError) continue
      bucket.push(nextError)
      selected.push(nextError)
      selectedIds.add(nextError.wordId)
      errorRepeats += 1
      addedInPass = true
    }
    if (!addedInPass) break
  }

  const completedIds = new Set(history.completedIds)
  for (const article of NOMINATIVE_ARTICLES) {
    const bucket = selectedPerArticle.get(article)!
    const candidates = nouns.filter((noun) => noun.article === article && !selectedIds.has(noun.wordId))
    const unseen = candidates.filter((noun) => !completedIds.has(noun.wordId))
    const seen = candidates.filter((noun) => completedIds.has(noun.wordId))
    const ranked = [
      ...shuffle(unseen, random).sort((left, right) => orderIndex.get(left.wordId)! - orderIndex.get(right.wordId)!),
      ...shuffle(seen, random).sort((left, right) => orderIndex.get(left.wordId)! - orderIndex.get(right.wordId)!),
    ]
    const needed = quota.get(article)! - bucket.length
    const additions = ranked.slice(0, needed)
    bucket.push(...additions)
    selected.push(...additions)
    additions.forEach((noun) => selectedIds.add(noun.wordId))
  }

  // If a future bank becomes smaller, use any remaining unique noun as a bounded fallback.
  if (selected.length < ARTICLE_GENDER_SESSION_SIZE) {
    const fallback = shuffle(nouns.filter((noun) => !selectedIds.has(noun.wordId)), random)
    const additions = fallback.slice(0, ARTICLE_GENDER_SESSION_SIZE - selected.length)
    selected.push(...additions)
    additions.forEach((noun) => selectedIds.add(noun.wordId))
    for (const noun of additions) selectedPerArticle.get(noun.article)!.push(noun)
  }

  const extraSchedule = shuffle(
    NOMINATIVE_ARTICLES.flatMap((article) => Array.from({ length: quota.get(article)! - ARTICLE_GENDER_ROUND_COUNT }, () => article)),
    random,
  )
  const extraIndexes = new Map<NominativeArticle, number>(NOMINATIVE_ARTICLES.map((article) => [article, ARTICLE_GENDER_ROUND_COUNT]))
  const rounds = Array.from({ length: ARTICLE_GENDER_ROUND_COUNT }, (_, roundIndex) => {
    const round: ArticleGenderNoun[] = []
    for (const article of NOMINATIVE_ARTICLES) {
      const noun = selectedPerArticle.get(article)![roundIndex]
      if (noun) round.push(noun)
    }
    const extraArticle = extraSchedule[roundIndex]
    if (extraArticle) {
      const extraIndex = extraIndexes.get(extraArticle)!
      const noun = selectedPerArticle.get(extraArticle)![extraIndex]
      if (noun) round.push(noun)
      extraIndexes.set(extraArticle, extraIndex + 1)
    }
    return shuffle(round, random)
  })
  return rounds.flat()
}

export function createArticleGenderSession(
  nouns: readonly ArticleGenderNoun[],
  history: ArticleGenderHistory,
  random: () => number = Math.random,
): ArticleGenderSession {
  if (nouns.length < ARTICLE_GENDER_SESSION_SIZE) {
    throw new Error('Для тренировки «Выбери правильный артикль» нужно не меньше двадцати слов.')
  }
  if (new Set(nouns.map((noun) => noun.wordId)).size !== nouns.length) {
    throw new Error('В банке тренажёра не должно быть повторяющихся слов.')
  }

  const selected = chooseSessionNouns(nouns, history, random)
  if (selected.length !== ARTICLE_GENDER_SESSION_SIZE) {
    throw new Error('Не удалось собрать двадцать разных слов для тренировки артиклей.')
  }
  const questions = selected.map((noun): ArticleGenderQuestion => ({
    noun,
    optionOrder: shuffle(NOMINATIVE_ARTICLES, random),
    selectedArticle: null,
    answered: false,
    isCorrect: null,
  }))
  return {
    rounds: Array.from({ length: ARTICLE_GENDER_ROUND_COUNT }, (_, index) => ({
      number: index + 1,
      questions: questions.slice(index * ARTICLE_GENDER_WORDS_PER_ROUND, (index + 1) * ARTICLE_GENDER_WORDS_PER_ROUND),
    })),
    currentQuestionIndex: 0,
    completed: false,
  }
}

export function currentArticleGenderQuestion(session: ArticleGenderSession): ArticleGenderQuestion | null {
  if (session.completed) return null
  const roundIndex = Math.floor(session.currentQuestionIndex / ARTICLE_GENDER_WORDS_PER_ROUND)
  const questionIndex = session.currentQuestionIndex % ARTICLE_GENDER_WORDS_PER_ROUND
  return session.rounds[roundIndex]?.questions[questionIndex] ?? null
}

export function answerArticleGenderQuestion(
  session: ArticleGenderSession,
  article: NominativeArticle,
): ArticleGenderActionResult {
  if (session.completed) return { session, outcome: 'session-completed' }
  if (!NOMINATIVE_ARTICLES.includes(article)) return { session, outcome: 'invalid-article' }
  const current = currentArticleGenderQuestion(session)
  if (!current) return { session, outcome: 'session-completed' }
  if (current.answered) return { session, outcome: 'already-answered' }

  const isCorrect = current.noun.article === article
  const currentRoundIndex = Math.floor(session.currentQuestionIndex / ARTICLE_GENDER_WORDS_PER_ROUND)
  const questionIndex = session.currentQuestionIndex % ARTICLE_GENDER_WORDS_PER_ROUND
  const rounds = session.rounds.map((round, index) => index !== currentRoundIndex
    ? round
    : {
      ...round,
      questions: round.questions.map((question, itemIndex) => itemIndex !== questionIndex
        ? question
        : { ...question, selectedArticle: article, answered: true, isCorrect }),
    })
  return { session: { ...session, rounds }, outcome: 'answered', isCorrect }
}

export function advanceArticleGenderQuestion(session: ArticleGenderSession): ArticleGenderActionResult {
  if (session.completed) return { session, outcome: 'session-completed' }
  const current = currentArticleGenderQuestion(session)
  if (!current?.answered) return { session, outcome: 'not-answered' }
  if (session.currentQuestionIndex === ARTICLE_GENDER_SESSION_SIZE - 1) {
    return { session: { ...session, completed: true }, outcome: 'session-completed' }
  }
  return { session: { ...session, currentQuestionIndex: session.currentQuestionIndex + 1 }, outcome: 'answered' }
}

export function getArticleGenderResults(session: ArticleGenderSession): ArticleGenderResults {
  const questions = session.rounds.flatMap((round) => round.questions)
  const mistakes = questions.filter((question) => question.answered && question.isCorrect === false)
    .map((question) => ({
      wordId: question.noun.wordId,
      greek: question.noun.greek,
      russian: question.noun.russian,
      selectedArticle: question.selectedArticle!,
      correctArticle: question.noun.article,
      ...(question.noun.noteRu ? { noteRu: question.noun.noteRu } : {}),
    }))
  const correctAnswers = questions.filter((question) => question.isCorrect).length
  return {
    totalWords: questions.length,
    correctAnswers,
    errors: mistakes.length,
    accuracyPercent: questions.length ? Math.round((correctAnswers / questions.length) * 100) : 0,
    mistakes,
  }
}
