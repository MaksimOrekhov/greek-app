<script setup lang="ts">
import { nextTick, onMounted, useTemplateRef } from 'vue'
import type { TrainerTopic } from '../../data/trainers/types.ts'
import type { TrainerSessionResults } from '../../lib/trainers/session.ts'

const resultTitle = useTemplateRef<HTMLHeadingElement>('resultTitle')

function russianCount(value: number, forms: [string, string, string]): string {
  const remainder100 = value % 100
  const remainder10 = value % 10
  if (remainder100 >= 11 && remainder100 <= 14) return forms[2]
  if (remainder10 === 1) return forms[0]
  if (remainder10 >= 2 && remainder10 <= 4) return forms[1]
  return forms[2]
}

defineProps<{
  topic: TrainerTopic
  results: TrainerSessionResults
}>()

defineEmits<{
  restart: []
  catalog: []
}>()

onMounted(() => {
  void nextTick(() => resultTitle.value?.focus())
})
</script>

<template>
  <section class="trainer-results" aria-labelledby="trainer-results-title">
    <div class="results-mark" aria-hidden="true">✓</div>
    <p class="results-eyebrow">Тренировка завершена</p>
    <h2 id="trainer-results-title" ref="resultTitle" tabindex="-1">{{ topic.title }}</h2>
    <p class="results-intro">
      Вы прошли {{ results.completedRounds }} {{ russianCount(results.completedRounds, ['раунд', 'раунда', 'раундов']) }}
      и нашли {{ results.foundPairs }} {{ russianCount(results.foundPairs, ['пару', 'пары', 'пар']) }}.
    </p>

    <dl class="results-stats">
      <div>
        <dt>Первый ответ верный</dt>
        <dd>{{ results.firstTryCorrect }} из {{ results.foundPairs }}</dd>
      </div>
      <div>
        <dt>Ошибочные попытки</dt>
        <dd>{{ results.errors }}</dd>
      </div>
      <div>
        <dt>Завершённые раунды</dt>
        <dd>{{ results.completedRounds }} из {{ results.totalRounds }}</dd>
      </div>
    </dl>

    <div class="results-actions">
      <button class="results-primary" type="button" @click="$emit('restart')">Повторить тренировку</button>
      <button class="results-secondary" type="button" @click="$emit('catalog')">К списку тем</button>
    </div>
  </section>
</template>

<style scoped>
.trainer-results { max-width: 560px; margin: 28px auto 0; padding: 28px 24px; border: 1px solid #dfe5d9; border-radius: 17px; background: #f4f7f1; text-align: center; }
.results-mark { width: 45px; height: 45px; display: grid; place-items: center; margin: 0 auto 12px; border: 1px solid #cbd7c3; border-radius: 50%; background: #e7eee1; color: #52654a; font-size: 22px; font-weight: 700; }
.results-eyebrow { margin: 0; color: #77836d; font-size: 10px; font-weight: 700; letter-spacing: 1.1px; text-transform: uppercase; }
.trainer-results h2 { margin: 9px 0 7px; font: 700 21px/1.3 'Manrope', 'Noto Sans Greek', sans-serif; letter-spacing: -.5px; }
.results-intro { margin: 0; color: #777a70; font-size: 13px; line-height: 1.5; }
.results-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; margin: 21px 0; }
.results-stats div { min-width: 0; padding: 11px 7px; border: 1px solid rgba(58, 59, 50, .07); border-radius: 10px; background: rgba(255,255,255,.76); }
.results-stats dt { min-height: 30px; color: #888a80; font-size: 10px; line-height: 1.45; }
.results-stats dd { margin: 5px 0 0; color: #465a3f; font: 700 14px 'Manrope', sans-serif; }
.results-actions { display: flex; justify-content: center; flex-wrap: wrap; gap: 9px; }
.results-actions button { min-height: 40px; padding: 0 14px; border: 1px solid #d3dbcc; border-radius: 9px; cursor: pointer; font-size: 12px; font-weight: 700; }
.results-primary { background: #52654a; border-color: #52654a !important; color: #fff; }
.results-primary:hover { background: #40533a; }
.results-secondary { background: #fff; color: #5b6554; }
.results-secondary:hover { background: #f8f9f6; }
@media (max-width: 500px) {
  .trainer-results { padding: 23px 15px; }
  .results-stats { grid-template-columns: 1fr; }
  .results-stats div { display: flex; align-items: center; justify-content: space-between; gap: 10px; text-align: left; }
  .results-stats dt { min-height: 0; }
  .results-stats dd { white-space: nowrap; }
  .results-actions { flex-direction: column; }
}
</style>
