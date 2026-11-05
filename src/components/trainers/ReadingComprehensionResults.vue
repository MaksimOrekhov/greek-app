<script setup lang="ts">
import { useTemplateRef } from 'vue'
import type { ReadingSessionResults } from '../../lib/trainers/readingComprehension/readingSession.ts'

defineProps<{ results: ReadingSessionResults }>()
const emit = defineEmits<{ restart: []; catalog: [] }>()
const heading = useTemplateRef<HTMLHeadingElement>('resultsHeading')

function focusHeading(): void {
  heading.value?.focus()
}

defineExpose({ focusHeading })
</script>

<template>
  <section class="reading-results" aria-labelledby="reading-results-heading">
    <div class="reading-result-mark" aria-hidden="true">✓</div>
    <h2 id="reading-results-heading" ref="resultsHeading" tabindex="-1">Тренировка завершена</h2>
    <p class="reading-results-intro">Ты прочитал все пять текстов и ответил на десять вопросов.</p>
    <dl class="reading-result-stats">
      <div class="reading-result-stat reading-result-primary-stat"><dt>Прочитано текстов</dt><dd>{{ results.textsRead }} из {{ results.totalTexts }}</dd></div>
      <div class="reading-result-stat"><dt>Правильные ответы</dt><dd>{{ results.correctAnswers }} из {{ results.totalQuestions }}</dd></div>
      <div class="reading-result-stat"><dt>Ошибки</dt><dd>{{ results.errors }}</dd></div>
      <div class="reading-result-stat"><dt>Верно</dt><dd>{{ results.accuracyPercent }}%</dd></div>
      <div class="reading-result-stat"><dt>Завершено раундов</dt><dd>{{ results.completedRounds }} из {{ results.totalRounds }}</dd></div>
    </dl>
    <div class="reading-results-actions">
      <button class="reading-results-primary" type="button" @click="emit('restart')">Повторить тренировку</button>
      <button class="reading-results-secondary" type="button" @click="emit('catalog')">К тренажёрам</button>
    </div>
  </section>
</template>

<style scoped>
.reading-results { padding: 27px 20px 22px; border: 1px solid rgba(58, 59, 50, .07); border-radius: 17px; background: rgba(255, 255, 255, .75); text-align: center; }
.reading-result-mark { display: grid; width: 48px; height: 48px; place-items: center; margin: 0 auto 12px; border-radius: 15px; background: #edf2e9; color: #52654a; font-size: 22px; font-weight: 700; }
.reading-results h2 { margin: 0; color: #353a31; font: 700 22px/1.3 'Manrope', sans-serif; }
.reading-results-intro { margin: 7px 0 18px; color: #85877d; font-size: 13px; line-height: 1.5; }
.reading-result-stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; margin: 0; }
.reading-result-stat { min-width: 0; display: flex; min-height: 78px; flex-direction: column; justify-content: center; padding: 10px; border-radius: 11px; background: #f4f4ef; }
.reading-result-stat dt { color: #777a70; font-size: 11px; }
.reading-result-stat dd { margin: 6px 0 0; color: #353a31; font: 700 19px/1.3 'Manrope', sans-serif; overflow-wrap: anywhere; }
.reading-result-primary-stat { grid-column: span 2; background: #eef2ea; }
.reading-result-primary-stat dd { color: #40533a; font-size: 25px; }
.reading-results-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 9px; margin-top: 18px; }
.reading-results-primary, .reading-results-secondary { min-height: 44px; padding: 0 15px; border-radius: 9px; cursor: pointer; font: inherit; font-size: 12px; font-weight: 700; }
.reading-results-primary { border: 1px solid #52654a; background: #52654a; color: #fff; }
.reading-results-primary:hover { background: #40533a; }
.reading-results-secondary { border: 1px solid #dfe1d9; background: #fff; color: #52654a; }
.reading-results-primary:focus-visible, .reading-results-secondary:focus-visible { outline: 3px solid #9aaf8f; outline-offset: 3px; }
.reading-results h2:focus { outline: none; }
.reading-results h2:focus-visible { outline: 2px solid #9aaf8f; outline-offset: 4px; }
@media (max-width: 520px) {
  .reading-results { padding: 22px 13px 17px; }
  .reading-results-actions { flex-direction: column; }
  .reading-results-primary, .reading-results-secondary { width: 100%; }
}
</style>
