<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FillGapExercise from '../components/trainers/FillGapExercise.vue'
import FillGapSessionResults from '../components/trainers/FillGapSessionResults.vue'
import { getTrainerTopic } from '../data/trainers/topics.ts'
import { useFillGapSession } from '../composables/useFillGapSession.ts'
import { FILL_GAP_SESSION_QUESTION_COUNT } from '../lib/trainers/fillGap/fillGapSession.ts'

const route = useRoute()
const router = useRouter()
const topicId = computed(() => String(route.params.topicId ?? ''))
const topic = computed(() => getTrainerTopic(topicId.value))
const { session, currentRound, currentQuestion, results, questionKey, start, selectOption, checkAnswer, advance, restart } = useFillGapSession()

watch(topicId, (id) => start(id), { immediate: true })

const questionNumber = computed(() => session.value
  ? session.value.currentRoundIndex * 2 + session.value.currentQuestionIndex + 1
  : 0)
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
  <section class="study-area is-trainer-fill-gap">
    <div class="session-back-row">
      <RouterLink class="back-to-trainers" to="/trainers"><span aria-hidden="true">←</span> Все темы</RouterLink>
      <span v-if="session && !session.completed" class="session-round-pill">
        Раунд {{ session.currentRoundIndex + 1 }} из {{ session.rounds.length }}
      </span>
    </div>

    <header v-if="topic" class="session-intro">
      <div class="eyebrow"><span class="eyebrow-line"></span> ЗАПОЛНИ ПРОПУСКИ <span class="eyebrow-line"></span></div>
      <h1>{{ topic.title }}</h1>
      <p class="intro-copy">Выбери слово и вставь его в предложение. Перед проверкой выбор можно изменить.</p>
    </header>

    <section v-if="!topic" class="session-not-found">
      <h1>Тема не найдена</h1>
      <p>Выберите тренировку из каталога.</p>
      <RouterLink to="/trainers">Вернуться к темам</RouterLink>
    </section>

    <FillGapSessionResults
      v-else-if="session?.completed && results"
      :topic="topic"
      :results="results"
      @restart="restart"
      @catalog="returnToCatalog"
    />

    <section v-else-if="session && currentRound && currentQuestion" class="session-panel" aria-label="Тренировка «Заполни пропуски»">
      <div class="session-panel-header">
        <div>
          <strong>Заполни пропуск</strong>
          <span>Задание {{ session.currentQuestionIndex + 1 }} из {{ currentRound.questions.length }} в раунде</span>
        </div>
        <span class="round-question-count">{{ questionNumber }} / {{ FILL_GAP_SESSION_QUESTION_COUNT }}</span>
      </div>

      <FillGapExercise
        :key="questionKey"
        :question="currentQuestion.question"
        :question-number="questionNumber"
        :total-questions="FILL_GAP_SESSION_QUESTION_COUNT"
        :option-order="currentQuestion.optionOrder"
        :selected-option-id="currentQuestion.selectedOptionId"
        :checked="currentQuestion.checked"
        :is-correct="currentQuestion.isCorrect"
        :continue-label="continueLabel"
        @select-option="selectOption"
        @check-answer="checkAnswer"
        @advance="advance"
      />
    </section>
  </section>
</template>

<style scoped>
.study-area.is-trainer-fill-gap { width: min(100% - 36px, 760px); padding-top: 38px; }
.session-back-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 0 1px 19px; }
.back-to-trainers { display: inline-flex; align-items: center; gap: 7px; color: #777a70; font-size: 12px; text-decoration: none; }
.back-to-trainers:hover { color: #40533a; }
.back-to-trainers span { font-size: 16px; }
.session-round-pill { padding: 7px 10px; border-radius: 99px; background: #eeede6; color: #73776c; font-size: 10px; font-weight: 700; white-space: nowrap; }
.session-intro { margin-bottom: 23px; text-align: center; }
.session-intro h1 { font-size: clamp(27px, 5vw, 37px); }
.session-intro .intro-copy { max-width: 520px; margin: 0 auto; line-height: 1.55; }
.session-panel { padding: 18px 21px 20px; border: 1px solid rgba(58, 59, 50, .07); border-radius: 17px; background: rgba(255, 255, 255, .73); box-shadow: 0 14px 42px rgba(64, 64, 46, .04); }
.session-panel-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.session-panel-header strong, .session-panel-header div > span { display: block; }
.session-panel-header strong { margin-bottom: 4px; font-size: 15px; }
.session-panel-header div > span { color: #777a70; font-size: 12px; }
.round-question-count { padding: 7px 10px; border: 1px solid #e5e5dc; border-radius: 99px; background: #fafaf8; color: #73776c; font-size: 12px; white-space: nowrap; }
.session-not-found { margin: 45px auto 0; padding: 25px; border: 1px solid rgba(58, 59, 50, .07); border-radius: 16px; background: rgba(255,255,255,.72); text-align: center; }
.session-not-found h1 { font-size: 28px; }
.session-not-found p { color: #888980; font-size: 13px; }
.session-not-found a { color: #52654a; font-size: 12px; font-weight: 700; }
@media (max-width: 520px) {
  .study-area.is-trainer-fill-gap { width: calc(100% - 24px); padding-top: 27px; }
  .session-panel { padding: 15px 12px; }
  .session-intro .intro-copy { max-width: 340px; font-size: 12px; }
}
</style>
