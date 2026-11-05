<script setup lang="ts">
import { useTemplateRef } from 'vue'
import type { ArticleGenderResults } from '../../lib/trainers/articleGender/articleGenderSession.ts'

defineProps<{ results: ArticleGenderResults }>()
const emit = defineEmits<{ restart: []; catalog: [] }>()
const heading = useTemplateRef<HTMLHeadingElement>('resultsHeading')

function focusHeading(): void {
  heading.value?.focus()
}

defineExpose({ focusHeading })
</script>

<template>
  <section class="article-gender-results" aria-labelledby="article-gender-results-title">
    <div class="article-gender-result-mark" aria-hidden="true">✓</div>
    <h2 id="article-gender-results-title" ref="resultsHeading" tabindex="-1">Тренировка завершена</h2>
    <p class="article-gender-results-intro">Ты прошёл все пять раундов. Продолжай запоминать существительные вместе с артиклем.</p>
    <dl class="article-gender-result-stats">
      <div class="article-gender-result-stat article-gender-result-primary"><dt>Слов обработано</dt><dd>{{ results.totalWords }}</dd></div>
      <div class="article-gender-result-stat"><dt>Правильные ответы</dt><dd>{{ results.correctAnswers }}</dd></div>
      <div class="article-gender-result-stat"><dt>Ошибки</dt><dd>{{ results.errors }}</dd></div>
      <div class="article-gender-result-stat"><dt>Верно</dt><dd>{{ results.accuracyPercent }}%</dd></div>
    </dl>

    <section v-if="results.mistakes.length" class="article-gender-mistakes" aria-labelledby="article-gender-mistakes-title">
      <h3 id="article-gender-mistakes-title">Слова для повторения</h3>
      <ul>
        <li v-for="mistake in results.mistakes" :key="mistake.wordId">
          <span class="article-gender-mistake-word" lang="el">{{ mistake.correctArticle }} {{ mistake.greek }}</span>
          <span>{{ mistake.russian }}</span>
          <span class="article-gender-mistake-selected">Ты выбрал <span lang="el">{{ mistake.selectedArticle }}</span></span>
        </li>
      </ul>
    </section>
    <p v-else class="article-gender-no-mistakes">Все ответы верны. Отличная работа!</p>

    <div class="article-gender-result-actions">
      <button class="article-gender-result-primary-button" type="button" @click="emit('restart')">Повторить тренировку</button>
      <button class="article-gender-result-secondary-button" type="button" @click="emit('catalog')">К тренажёрам</button>
    </div>
  </section>
</template>

<style scoped>
.article-gender-results { padding: 25px 20px 22px; border: 1px solid rgba(58, 59, 50, .07); border-radius: 17px; background: rgba(255, 255, 255, .75); text-align: center; }
.article-gender-result-mark { display: grid; width: 48px; height: 48px; place-items: center; margin: 0 auto 12px; border-radius: 15px; background: #edf2e9; color: #52654a; font-size: 22px; font-weight: 700; }
.article-gender-results h2 { margin: 0; color: #353a31; font: 700 22px/1.3 'Manrope', sans-serif; }
.article-gender-results h2:focus { outline: none; }
.article-gender-results h2:focus-visible { outline: 2px solid #9aaf8f; outline-offset: 4px; }
.article-gender-results-intro { max-width: 440px; margin: 7px auto 18px; color: #85877d; font-size: 13px; line-height: 1.5; }
.article-gender-result-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 9px; margin: 0; }
.article-gender-result-stat { min-width: 0; display: flex; min-height: 76px; flex-direction: column; justify-content: center; padding: 9px; border-radius: 11px; background: #f4f4ef; }
.article-gender-result-stat dt { color: #777a70; font-size: 10px; }
.article-gender-result-stat dd { margin: 6px 0 0; color: #353a31; font: 700 19px/1.3 'Manrope', sans-serif; overflow-wrap: anywhere; }
.article-gender-result-primary { grid-column: 1 / -1; background: #eef2ea; }
.article-gender-result-primary dd { color: #40533a; font-size: 23px; }
.article-gender-mistakes { margin-top: 22px; text-align: left; }
.article-gender-mistakes h3 { margin: 0 0 8px; font-size: 13px; }
.article-gender-mistakes ul { display: grid; gap: 7px; margin: 0; padding: 0; list-style: none; }
.article-gender-mistakes li { min-width: 0; display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr); align-items: center; gap: 10px; padding: 10px 11px; border-radius: 9px; background: #f8f6f1; color: #66695f; font-size: 11px; overflow-wrap: anywhere; }
.article-gender-mistake-word { color: #384432; font: 700 14px/1.35 'Manrope', 'Noto Sans Greek', sans-serif; }
.article-gender-mistake-selected { text-align: right; }
.article-gender-no-mistakes { margin: 18px 0 0; color: #52654a; font-size: 13px; font-weight: 650; }
.article-gender-result-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 9px; margin-top: 18px; }
.article-gender-result-primary-button, .article-gender-result-secondary-button { min-height: 44px; padding: 0 15px; border-radius: 9px; cursor: pointer; font: inherit; font-size: 12px; font-weight: 700; }
.article-gender-result-primary-button { border: 1px solid #52654a; background: #52654a; color: #fff; }
.article-gender-result-primary-button:hover { background: #40533a; }
.article-gender-result-secondary-button { border: 1px solid #dfe1d9; background: #fff; color: #52654a; }
.article-gender-result-primary-button:focus-visible, .article-gender-result-secondary-button:focus-visible { outline: 3px solid #9aaf8f; outline-offset: 3px; }
@media (max-width: 520px) {
  .article-gender-results { padding: 22px 13px 17px; }
  .article-gender-mistakes li { grid-template-columns: minmax(0, 1fr) auto; }
  .article-gender-mistake-selected { grid-column: 1 / -1; text-align: left; }
  .article-gender-result-actions { flex-direction: column; }
  .article-gender-result-primary-button, .article-gender-result-secondary-button { width: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .article-gender-results * { scroll-behavior: auto; }
}
</style>
