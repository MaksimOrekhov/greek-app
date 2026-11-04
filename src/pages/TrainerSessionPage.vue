<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MatchPairsExercise from '../components/trainers/MatchPairsExercise.vue'
import TrainerSessionResults from '../components/trainers/TrainerSessionResults.vue'
import { getTrainerTopic } from '../data/trainers/topics.ts'
import { useTrainerSession } from '../composables/useTrainerSession'

const route = useRoute()
const router = useRouter()
const topicId = computed(() => String(route.params.topicId ?? ''))
const topic = computed(() => getTrainerTopic(topicId.value))
const { session, currentRound, results, roundKey, start, attempt, advance, restart } = useTrainerSession()

watch(topicId, (id) => start(id), { immediate: true })

const matchedCount = computed(() => currentRound.value?.foundPairIds.length ?? 0)

function handleRestart(): void {
  restart()
}

function returnToCatalog(): void {
  void router.push('/trainers')
}
</script>

<template>
  <section class="study-area is-trainer-session">
    <div class="session-back-row">
      <RouterLink class="back-to-trainers" to="/trainers"><span aria-hidden="true">←</span> Все темы</RouterLink>
      <span v-if="session && !session.completed" class="session-round-pill">
        Раунд {{ session.currentRoundIndex + 1 }} из {{ session.rounds.length }}
      </span>
    </div>

    <header v-if="topic" class="session-intro">
      <div class="eyebrow"><span class="eyebrow-line"></span> СОЕДИНИ ПАРЫ <span class="eyebrow-line"></span></div>
      <h1>{{ topic.title }}</h1>
      <p class="intro-copy">{{ topic.description }}</p>
    </header>

    <section v-if="!topic" class="session-not-found">
      <h1>Тема не найдена</h1>
      <p>Выберите тренировку из каталога.</p>
      <RouterLink to="/trainers">Вернуться к темам</RouterLink>
    </section>

    <TrainerSessionResults
      v-else-if="session?.completed && results"
      :topic="topic"
      :results="results"
      @restart="handleRestart"
      @catalog="returnToCatalog"
    />

    <section v-else-if="session && currentRound" class="session-panel" aria-label="Раунд сопоставления">
      <div class="session-panel-header">
        <div>
          <strong>Найдите соответствия</strong>
          <span>Осталось пар: {{ currentRound.pairs.length - matchedCount }}</span>
        </div>
        <span class="round-error-count">Ошибки: {{ currentRound.errors }}</span>
      </div>

      <MatchPairsExercise
        :key="roundKey"
        :pairs="currentRound.pairs"
        :left-order="currentRound.leftOrder"
        :right-order="currentRound.rightOrder"
        :matched-pair-ids="currentRound.foundPairIds"
        :round-key="roundKey"
        @attempt="attempt"
      />

      <div class="round-progress" aria-label="Прогресс в раунде">
        <div class="round-progress-track"><span :style="{ width: `${matchedCount / currentRound.pairs.length * 100}%` }"></span></div>
        <span>{{ matchedCount }} / {{ currentRound.pairs.length }}</span>
      </div>

      <div v-if="currentRound.completed" class="round-complete">
        <p>Все пары найдены. Ошибочных попыток в раунде: {{ currentRound.errors }}.</p>
        <button class="round-next-button" type="button" @click="advance">
          {{ session.currentRoundIndex === session.rounds.length - 1 ? 'Показать результат' : 'Следующий раунд' }}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  </section>
</template>

<style scoped>
.study-area.is-trainer-session { width: min(100% - 36px, 760px); padding-top: 38px; }
.session-back-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 0 1px 19px; }
.back-to-trainers { display: inline-flex; align-items: center; gap: 7px; color: #777a70; font-size: 12px; text-decoration: none; }
.back-to-trainers:hover { color: #40533a; }
.back-to-trainers span { font-size: 16px; }
.session-round-pill { padding: 7px 10px; border-radius: 99px; background: #eeede6; color: #73776c; font-size: 10px; font-weight: 700; white-space: nowrap; }
.session-intro { margin-bottom: 23px; text-align: center; }
.session-intro h1 { font-size: clamp(27px, 5vw, 37px); }
.session-intro .intro-copy { max-width: 520px; margin: 0 auto; line-height: 1.55; }
.session-panel { padding: 18px 21px 17px; border: 1px solid rgba(58, 59, 50, .07); border-radius: 17px; background: rgba(255, 255, 255, .73); box-shadow: 0 14px 42px rgba(64, 64, 46, .04); }
.session-panel-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.session-panel-header strong, .session-panel-header div > span { display: block; }
.session-panel-header strong { margin-bottom: 4px; font-size: 13px; }
.session-panel-header div > span { color: #92938a; font-size: 10px; }
.round-error-count { padding: 6px 9px; border: 1px solid #ede2dc; border-radius: 99px; background: #fbf5f2; color: #8d6657; font-size: 10px; white-space: nowrap; }
.round-progress { display: flex; align-items: center; gap: 10px; margin-top: 11px; color: #85877d; font-size: 10px; }
.round-progress-track { height: 4px; flex: 1; overflow: hidden; border-radius: 99px; background: #eeeee8; }
.round-progress-track span { display: block; height: 100%; border-radius: inherit; background: #7f9272; transition: width .2s ease; }
.round-complete { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 15px; padding-top: 15px; border-top: 1px solid #eeeee8; }
.round-complete p { margin: 0; color: #73776c; font-size: 11px; line-height: 1.5; }
.round-next-button { flex: 0 0 auto; min-height: 39px; display: inline-flex; align-items: center; gap: 9px; padding: 0 13px; border: 1px solid #52654a; border-radius: 9px; background: #52654a; color: #fff; cursor: pointer; font-size: 11px; font-weight: 700; }
.round-next-button:hover { background: #40533a; }
.round-next-button span { font-size: 15px; }
.session-not-found { margin: 45px auto 0; padding: 25px; border: 1px solid rgba(58, 59, 50, .07); border-radius: 16px; background: rgba(255,255,255,.72); text-align: center; }
.session-not-found h1 { font-size: 28px; }
.session-not-found p { color: #888980; font-size: 13px; }
.session-not-found a { color: #52654a; font-size: 12px; font-weight: 700; }
@media (max-width: 520px) {
  .study-area.is-trainer-session { width: calc(100% - 24px); padding-top: 27px; }
  .session-panel { padding: 15px 12px; }
  .round-complete { align-items: stretch; flex-direction: column; }
  .round-next-button { justify-content: center; width: 100%; }
  .session-intro .intro-copy { max-width: 340px; font-size: 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .round-progress-track span { transition: none; }
}
</style>
