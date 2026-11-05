import { computed, shallowRef } from 'vue'
import { articleGenderNouns } from '../data/trainers/verifiedArticleNouns.ts'
import {
  createArticleGenderHistory,
  loadArticleGenderHistory,
  reconcileArticleGenderHistory,
  recordArticleGenderAnswer,
  saveArticleGenderHistory,
  type ArticleGenderHistory,
  type ArticleGenderStorage,
} from '../lib/trainers/articleGender/articleGenderHistory.ts'
import {
  advanceArticleGenderQuestion,
  answerArticleGenderQuestion,
  createArticleGenderSession,
  currentArticleGenderQuestion,
  getArticleGenderResults,
  type ArticleGenderSession,
} from '../lib/trainers/articleGender/articleGenderSession.ts'
import type { NominativeArticle } from '../lib/trainers/articleGender/articleGenderTypes.ts'

function browserStorage(): ArticleGenderStorage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}

export function useArticleGenderSession(options: { storage?: ArticleGenderStorage; random?: () => number } = {}) {
  const storage = options.storage ?? browserStorage()
  const random = options.random ?? Math.random
  const wordIds = articleGenderNouns.map((noun) => noun.wordId)
  const history = shallowRef<ArticleGenderHistory>(
    storage ? loadArticleGenderHistory(articleGenderNouns, random, storage)
      : createArticleGenderHistory(wordIds, random),
  )
  const state = shallowRef<ArticleGenderSession | null>(null)
  const hasAnsweredInSession = shallowRef(false)
  const session = computed(() => state.value)
  const currentQuestion = computed(() => state.value ? currentArticleGenderQuestion(state.value) : null)
  const currentRound = computed(() => state.value?.rounds[Math.floor(state.value.currentQuestionIndex / 4)] ?? null)
  const results = computed(() => state.value?.completed ? getArticleGenderResults(state.value) : null)

  function start(): void {
    history.value = reconcileArticleGenderHistory(history.value, wordIds, random)
    state.value = createArticleGenderSession(articleGenderNouns, history.value, random)
    hasAnsweredInSession.value = false
  }

  function answer(article: NominativeArticle): void {
    if (!state.value) return
    const question = currentQuestion.value
    const result = answerArticleGenderQuestion(state.value, article)
    state.value = result.session
    if (result.outcome !== 'answered' || !question) return

    history.value = recordArticleGenderAnswer(
      history.value,
      question.noun.wordId,
      Boolean(result.isCorrect),
      articleGenderNouns,
      { random, beginsSession: !hasAnsweredInSession.value },
    )
    hasAnsweredInSession.value = true
    saveArticleGenderHistory(history.value, storage)
  }

  function advance(): void {
    if (state.value) state.value = advanceArticleGenderQuestion(state.value).session
  }

  return { session, currentQuestion, currentRound, results, start, answer, advance }
}
