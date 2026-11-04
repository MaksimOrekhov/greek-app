<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import OrderItemsExercise from '../components/trainers/OrderItemsExercise.vue'
import OrderItemsSessionResults from '../components/trainers/OrderItemsSessionResults.vue'
import { getTrainerTopic } from '../data/trainers/topics.ts'
import { useOrderItemsSession } from '../composables/useOrderItemsSession.ts'
import { ORDER_ITEMS_QUESTIONS_PER_ROUND, ORDER_ITEMS_ROUND_COUNT } from '../lib/trainers/orderItems/orderItemsSession.ts'
import { ORDER_ITEMS_SESSION_QUESTION_COUNT } from '../lib/trainers/orderItems/orderItemsGenerator.ts'

const route = useRoute()
const router = useRouter()
const topicId = computed(() => String(route.params.topicId ?? ''))
const topic = computed(() => getTrainerTopic(topicId.value))
const supported = computed(() => topic.value?.availableExercises.includes('order-items') ?? false)
const {
  session,
  currentRound,
  currentQuestion,
  questionNumber,
  questionKey,
  results,
  start,
  selectCard,
  removeCard,
  resetAnswer,
  checkAnswer,
  advance,
  restart,
} = useOrderItemsSession()

watch(topicId, (id) => start(id), { immediate: true })

const continueLabel = computed(() => {
  if (!session.value || !currentRound.value) return 'Дальше'
  const lastQuestion = session.value.currentQuestionIndex === currentRound.value.questions.length - 1
  if (!lastQuestion) return 'Следующее задание'
  return session.value.currentRoundIndex === session.value.rounds.length - 1 ? 'Показать результат' : 'Следующий раунд'
})

function returnToCatalog(): void {
  void router.push('/trainers')
}
</script>

<template>
  <section class="study-area is-trainer-order-items">
    <div class="session-back-row">
      <RouterLink class="back-to-trainers" to="/trainers"><span aria-hidden="true">←</span> Все темы</RouterLink>
      <span v-if="supported && session && !session.completed" class="session-round-pill">
        Раунд {{ session.currentRoundIndex + 1 }} из {{ ORDER_ITEMS_ROUND_COUNT }}
      </span>
    </div>

    <header v-if="supported && topic" class="session-intro">
      <div class="eyebrow"><span class="eyebrow-line"></span> РАССТАВЬ ПО ПОРЯДКУ <span class="eyebrow-line"></span></div>
      <h1>{{ topic.title }}</h1>
    </header>

    <section v-if="!topic" class="session-message">
      <h1>Тема не найдена</h1>
      <p>Выберите тренировку из каталога.</p>
      <RouterLink to="/trainers">Вернуться к темам</RouterLink>
    </section>

    <section v-else-if="!supported" class="session-message" aria-live="polite">
      <h1>Упражнение недоступно</h1>
      <p>«Расставь по порядку» пока доступно только для темы «Числа 0–200».</p>
      <RouterLink to="/trainers">Вернуться к темам</RouterLink>
    </section>

    <OrderItemsSessionResults
      v-else-if="session?.completed && results && topic"
      :topic="topic"
      :results="results"
      @restart="restart"
      @catalog="returnToCatalog"
    />

    <section v-else-if="session && currentRound && currentQuestion" class="session-panel" aria-label="Тренировка «Расставь по порядку»">
      <OrderItemsExercise
        :key="questionKey"
        :question="currentQuestion.question"
        :question-number="questionNumber"
        :total-questions="ORDER_ITEMS_SESSION_QUESTION_COUNT"
        :round-number="session.currentRoundIndex + 1"
        :total-rounds="session.rounds.length"
        :selected-order="currentQuestion.selectedOrder"
        :card-order="currentQuestion.cardOrder"
        :checked="currentQuestion.checked"
        :is-correct="currentQuestion.isCorrect"
        :continue-label="continueLabel"
        :autofocus="questionNumber > 1"
        @select-card="selectCard"
        @remove-card="removeCard"
        @reset-answer="resetAnswer"
        @check-answer="checkAnswer"
        @advance="advance"
      />
      <span class="visually-hidden">В раунде {{ session.currentRoundIndex + 1 }} {{ ORDER_ITEMS_QUESTIONS_PER_ROUND }} задания.</span>
    </section>
  </section>
</template>

<style scoped>
.study-area.is-trainer-order-items { width: min(100% - 36px, 760px); padding-top: 38px; }
.session-back-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 0 1px 19px; }
.back-to-trainers { display: inline-flex; align-items: center; gap: 7px; color: #777a70; font-size: 12px; text-decoration: none; }
.back-to-trainers:hover { color: #40533a; }
.back-to-trainers span { font-size: 16px; }
.session-round-pill { padding: 7px 10px; border-radius: 99px; background: #eeede6; color: #73776c; font-size: 10px; font-weight: 700; white-space: nowrap; }
.session-intro { margin-bottom: 20px; text-align: center; }
.session-intro h1 { margin-top: 13px; font-size: clamp(27px, 5vw, 37px); }
.session-panel { padding: 18px 21px 20px; border: 1px solid rgba(58, 59, 50, .07); border-radius: 17px; background: rgba(255, 255, 255, .73); box-shadow: 0 14px 42px rgba(64, 64, 46, .04); }
.session-message { margin: 45px auto 0; padding: 25px; border: 1px solid rgba(58, 59, 50, .07); border-radius: 16px; background: rgba(255,255,255,.72); text-align: center; }
.session-message h1 { font-size: 26px; }
.session-message p { color: #888980; font-size: 13px; line-height: 1.55; }
.session-message a { color: #52654a; font-size: 12px; font-weight: 700; }
.visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 520px) {
  .study-area.is-trainer-order-items { width: calc(100% - 24px); padding-top: 27px; }
  .session-panel { padding: 14px 10px; }
  .session-intro { margin-bottom: 17px; }
}
</style>
