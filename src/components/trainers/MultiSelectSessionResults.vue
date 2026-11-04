<script setup lang="ts">
import type { TrainerTopic } from '../../data/trainers/types.ts'
import type { MultiSelectSessionResults as Results } from '../../lib/trainers/multiSelectSession.ts'

defineProps<{
  topic: TrainerTopic
  results: Results
}>()

defineEmits<{
  restart: []
  catalog: []
}>()
</script>

<template>
  <section class="multi-select-results" aria-labelledby="multi-select-results-title">
    <div class="results-mark" aria-hidden="true">✓</div>
    <p class="results-eyebrow">Тренировка завершена</p>
    <h2 id="multi-select-results-title">{{ topic.title }}</h2>
    <p class="results-intro">Правильно выполнено {{ results.correctAnswers }} из {{ results.totalQuestions }} заданий.</p>

    <dl class="results-stats">
      <div><dt>Заданий с ошибками</dt><dd>{{ results.questionsWithErrors }}</dd></div>
      <div><dt>Пропущено правильных вариантов</dt><dd>{{ results.missedCorrectOptions }}</dd></div>
      <div><dt>Выбрано неправильных вариантов</dt><dd>{{ results.incorrectlySelectedOptions }}</dd></div>
      <div><dt>Завершено раундов</dt><dd>{{ results.completedRounds }} из {{ results.totalRounds }}</dd></div>
    </dl>

    <div class="results-actions">
      <button class="results-primary" type="button" @click="$emit('restart')">Повторить тренировку</button>
      <button class="results-secondary" type="button" @click="$emit('catalog')">К списку тем</button>
    </div>
  </section>
</template>

<style scoped>
.multi-select-results { max-width: 560px; margin: 28px auto 0; padding: 28px 24px; border: 1px solid #dfe5d9; border-radius: 17px; background: #f4f7f1; text-align: center; }
.results-mark { width: 45px; height: 45px; display: grid; place-items: center; margin: 0 auto 12px; border: 1px solid #cbd7c3; border-radius: 50%; background: #e7eee1; color: #52654a; font-size: 22px; font-weight: 700; }
.results-eyebrow { margin: 0; color: #77836d; font-size: 10px; font-weight: 700; letter-spacing: 1.1px; text-transform: uppercase; }
.multi-select-results h2 { margin: 9px 0 7px; font: 700 21px/1.3 'Manrope', 'Noto Sans Greek', sans-serif; letter-spacing: -.5px; }
.results-intro { margin: 0; color: #777a70; font-size: 13px; line-height: 1.5; }
.results-stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; margin: 21px 0; }
.results-stats div { min-width: 0; padding: 11px 9px; border: 1px solid rgba(58, 59, 50, .07); border-radius: 10px; background: rgba(255,255,255,.76); }
.results-stats dt { min-height: 30px; color: #888a80; font-size: 10px; line-height: 1.45; }
.results-stats dd { margin: 5px 0 0; color: #465a3f; font: 700 14px 'Manrope', sans-serif; }
.results-actions { display: flex; justify-content: center; flex-wrap: wrap; gap: 9px; }
.results-actions button { min-height: 40px; padding: 0 14px; border: 1px solid #d3dbcc; border-radius: 9px; cursor: pointer; font-size: 12px; font-weight: 700; }
.results-primary { background: #52654a; border-color: #52654a !important; color: #fff; }
.results-primary:hover { background: #40533a; }
.results-secondary { background: #fff; color: #5b6554; }
.results-secondary:hover { background: #f8f9f6; }
@media (max-width: 500px) {
  .multi-select-results { padding: 23px 15px; }
  .results-stats { grid-template-columns: 1fr; }
  .results-stats div { display: flex; align-items: center; justify-content: space-between; gap: 10px; text-align: left; }
  .results-stats dt { min-height: 0; }
  .results-stats dd { white-space: nowrap; }
  .results-actions { flex-direction: column; }
}
</style>
