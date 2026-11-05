<script setup lang="ts">
import { useTemplateRef } from 'vue'
import type { DialogueSessionResults } from '../../lib/trainers/dialogue/dialogueSession.ts'

defineProps<{ results: DialogueSessionResults }>()
const emit = defineEmits<{ restart: []; catalog: [] }>()
const heading = useTemplateRef<HTMLHeadingElement>('resultsHeading')

function focusHeading(): void {
  heading.value?.focus()
}

defineExpose({ focusHeading })
</script>

<template>
  <section class="dialogue-results" aria-labelledby="dialogue-results-heading">
    <div class="dialogue-result-mark" aria-hidden="true">✓</div>
    <h2 id="dialogue-results-heading" ref="resultsHeading" tabindex="-1">Тренировка завершена</h2>
    <p class="dialogue-results-intro">Ты прошёл все пять раундов.</p>

    <dl class="dialogue-result-stats">
      <div class="dialogue-result-stat dialogue-result-primary-stat">
        <dt>Правильные ответы</dt>
        <dd>{{ results.correctAnswers }} из {{ results.totalQuestions }}</dd>
      </div>
      <div class="dialogue-result-stat">
        <dt>Верно</dt>
        <dd>{{ results.accuracyPercent }}%</dd>
      </div>
      <div class="dialogue-result-stat">
        <dt>Ошибки</dt>
        <dd>{{ results.errors }}</dd>
      </div>
      <div class="dialogue-result-stat">
        <dt>Завершено раундов</dt>
        <dd>{{ results.completedRounds }} из {{ results.totalRounds }}</dd>
      </div>
    </dl>

    <div class="dialogue-results-actions">
      <button class="dialogue-results-primary" type="button" @click="emit('restart')">Повторить тренировку</button>
      <button class="dialogue-results-secondary" type="button" @click="emit('catalog')">К тренажёрам</button>
    </div>
  </section>
</template>

<style scoped>
.dialogue-results { padding: 29px 20px 23px; border: 1px solid rgba(58, 59, 50, .07); border-radius: 17px; background: rgba(255, 255, 255, .75); text-align: center; }
.dialogue-result-mark { display: grid; width: 48px; height: 48px; place-items: center; margin: 0 auto 12px; border-radius: 15px; background: #edf2e9; color: #52654a; font-size: 22px; font-weight: 700; }
.dialogue-results h2 { margin: 0; color: #353a31; font: 700 22px/1.3 'Manrope', sans-serif; }
.dialogue-results-intro { margin: 7px 0 19px; color: #85877d; font-size: 13px; }
.dialogue-result-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 9px; margin: 0; }
.dialogue-result-stat { min-width: 0; display: flex; min-height: 82px; flex-direction: column; justify-content: center; padding: 11px; border-radius: 11px; background: #f4f4ef; }
.dialogue-result-stat dt { color: #777a70; font-size: 11px; }
.dialogue-result-stat dd { margin: 6px 0 0; color: #353a31; font: 700 19px/1.3 'Manrope', sans-serif; overflow-wrap: anywhere; }
.dialogue-result-primary-stat { grid-column: span 3; background: #eef2ea; }
.dialogue-result-primary-stat dd { color: #40533a; font-size: 25px; }
.dialogue-results-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 9px; margin-top: 18px; }
.dialogue-results-primary, .dialogue-results-secondary { min-height: 43px; padding: 0 14px; border-radius: 9px; cursor: pointer; font: inherit; font-size: 12px; font-weight: 700; }
.dialogue-results-primary { border: 1px solid #52654a; background: #52654a; color: #fff; }
.dialogue-results-primary:hover { background: #40533a; }
.dialogue-results-secondary { border: 1px solid #dfe1d9; background: #fff; color: #52654a; }
.dialogue-results-primary:focus-visible, .dialogue-results-secondary:focus-visible { outline: 3px solid #9aaf8f; outline-offset: 3px; }
.dialogue-results h2:focus { outline: none; }
.dialogue-results h2:focus-visible { outline: 2px solid #9aaf8f; outline-offset: 4px; }
@media (max-width: 520px) {
  .dialogue-results { padding: 22px 13px 17px; }
  .dialogue-result-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .dialogue-result-primary-stat { grid-column: span 2; }
  .dialogue-results-actions { flex-direction: column; }
  .dialogue-results-primary, .dialogue-results-secondary { width: 100%; }
}
</style>
