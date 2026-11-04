import { computed, shallowRef } from 'vue'
import { trainerMultiSelectQuestions } from '../data/trainers/multiSelectQuestions.ts'
import { generateMultiSelectQuestions } from '../lib/trainers/generation/multiSelectGenerator.ts'
import {
  loadRecentQuestionSignatures,
  rememberGeneratedQuestions,
} from '../lib/trainers/generation/questionHistory.ts'
import {
  advanceMultiSelectSession,
  createMultiSelectSession,
  getMultiSelectSessionResults,
  submitMultiSelectAnswer,
  toggleMultiSelectOption,
  type MultiSelectActionOutcome,
  type MultiSelectSession,
} from '../lib/trainers/multiSelectSession.ts'

export function useMultiSelectSession() {
  const session = shallowRef<MultiSelectSession | null>(null)
  const runNumber = shallowRef(0)
  const currentRound = computed(() => {
    const current = session.value
    return current ? current.rounds[current.currentRoundIndex] ?? null : null
  })
  const currentQuestion = computed(() => currentRound.value?.questions[session.value?.currentQuestionIndex ?? -1] ?? null)
  const results = computed(() => session.value ? getMultiSelectSessionResults(session.value) : null)
  const questionKey = computed(() => `${runNumber.value}:${session.value?.currentRoundIndex ?? -1}:${session.value?.currentQuestionIndex ?? -1}`)

  function start(topicId: string): boolean {
    const previous = session.value?.topicId === topicId ? session.value : undefined
    const questions = trainerMultiSelectQuestions.filter((item) => item.topicId === topicId)
    if (questions.length === 0) {
      session.value = null
      runNumber.value += 1
      return false
    }

    const generated = generateMultiSelectQuestions(topicId, Math.random, loadRecentQuestionSignatures(topicId))
    session.value = createMultiSelectSession(topicId, questions, Math.random, previous ?? undefined, generated)
    rememberGeneratedQuestions(topicId, generated)
    runNumber.value += 1
    return true
  }

  function toggleOption(optionId: string): MultiSelectActionOutcome {
    if (!session.value) return 'invalid'
    const result = toggleMultiSelectOption(session.value, optionId)
    session.value = result.session
    return result.outcome
  }

  function checkAnswer(): MultiSelectActionOutcome {
    if (!session.value) return 'invalid'
    const result = submitMultiSelectAnswer(session.value)
    session.value = result.session
    return result.outcome
  }

  function advance(): void {
    if (session.value) session.value = advanceMultiSelectSession(session.value)
  }

  function restart(): boolean {
    return session.value ? start(session.value.topicId) : false
  }

  return { session, currentRound, currentQuestion, results, questionKey, start, toggleOption, checkAnswer, advance, restart }
}
