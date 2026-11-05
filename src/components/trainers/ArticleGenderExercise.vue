<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { NOMINATIVE_ARTICLES, type NominativeArticle } from '../../lib/trainers/articleGender/articleGenderTypes.ts'
import type { ArticleGenderQuestion } from '../../lib/trainers/articleGender/articleGenderSession.ts'

const props = defineProps<{
  question: ArticleGenderQuestion
  questionNumber: number
  roundNumber: number
  totalQuestions: number
  totalRounds: number
}>()

const emit = defineEmits<{ answer: [article: NominativeArticle]; advance: [] }>()
const promptHeading = useTemplateRef<HTMLHeadingElement>('promptHeading')
const genderNames: Record<NominativeArticle, string> = { ο: 'мужского', η: 'женского', το: 'среднего' }
const displayArticles = NOMINATIVE_ARTICLES

function focusPrompt(): void {
  promptHeading.value?.focus()
}

defineExpose({ focusPrompt })
</script>

<template>
  <div class="article-gender-exercise" aria-labelledby="article-gender-word">
    <div class="article-gender-progress-row">
      <span>Раунд {{ roundNumber }} из {{ totalRounds }}</span>
      <span>Слово {{ questionNumber }} из {{ totalQuestions }}</span>
    </div>
    <div class="article-gender-progress" role="progressbar" :aria-valuenow="questionNumber" :aria-valuemin="1" :aria-valuemax="totalQuestions" :aria-label="`Слово ${questionNumber} из ${totalQuestions}`">
      <span :style="{ width: `${(questionNumber / totalQuestions) * 100}%` }"></span>
    </div>

    <div class="article-gender-prompt">
      <h2 id="article-gender-word" ref="promptHeading" tabindex="-1" lang="el">{{ question.noun.greek }}</h2>
      <p class="article-gender-translation">{{ question.noun.russian }}</p>
      <p class="article-gender-instruction">Выбери подходящий артикль</p>
    </div>

    <div class="article-gender-options" role="group" aria-label="Варианты артикля">
      <button
        v-for="article in question.optionOrder"
        :key="article"
        class="article-gender-option"
        :class="{
          'is-correct': question.answered && article === question.noun.article,
          'is-wrong': question.answered && article === question.selectedArticle && !question.isCorrect,
        }"
        type="button"
        :disabled="question.answered"
        :aria-pressed="question.selectedArticle === article"
        :aria-label="`Артикль ${article}`"
        lang="el"
        @click="emit('answer', article)"
      >
        {{ article }}
      </button>
    </div>

    <div v-if="question.answered" class="article-gender-feedback" role="status" aria-live="polite" aria-atomic="true">
      <p class="article-gender-answer"><span lang="el">{{ question.noun.article }} {{ question.noun.greek }}</span><span aria-hidden="true"> — </span><span>{{ question.noun.russian }}</span></p>
      <p v-if="question.isCorrect" class="article-gender-feedback-copy">Правильно. Это слово {{ genderNames[question.noun.article] }} рода; запоминай сочетание целиком.</p>
      <p v-else class="article-gender-feedback-copy">Ты выбрал <span lang="el">{{ question.selectedArticle }}</span>. Правильный артикль — <span lang="el">{{ question.noun.article }}</span>; слово {{ genderNames[question.noun.article] }} рода.</p>
      <p v-if="question.noun.noteRu" class="article-gender-note">{{ question.noun.noteRu }}</p>
    </div>

    <button v-if="question.answered" class="article-gender-next" type="button" @click="emit('advance')">
      {{ questionNumber === totalQuestions ? 'Посмотреть результат' : questionNumber % 4 === 0 ? 'Следующий раунд' : 'Следующее слово' }}
    </button>
  </div>
</template>

<style scoped>
.article-gender-exercise { min-width: 0; }
.article-gender-progress-row { display: flex; justify-content: space-between; gap: 12px; color: #777a70; font-size: 11px; font-weight: 650; }
.article-gender-progress { height: 6px; overflow: hidden; margin-top: 8px; border-radius: 99px; background: #eceee8; }
.article-gender-progress span { display: block; height: 100%; border-radius: inherit; background: #829675; transition: width .18s ease; }
.article-gender-prompt { padding: 35px 10px 24px; text-align: center; }
.article-gender-prompt h2 { margin: 0; color: #30382d; font: 700 clamp(34px, 8vw, 46px)/1.2 'Manrope', 'Noto Sans Greek', sans-serif; overflow-wrap: anywhere; }
.article-gender-prompt h2:focus { outline: none; }
.article-gender-prompt h2:focus-visible { outline: 2px solid #9aaf8f; outline-offset: 6px; border-radius: 4px; }
.article-gender-translation { margin: 9px 0 0; color: #686b61; font-size: 15px; }
.article-gender-instruction { margin: 25px 0 0; color: #85877d; font-size: 12px; }
.article-gender-options { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; max-width: 430px; margin: 0 auto; }
.article-gender-option { min-width: 0; min-height: 66px; border: 1px solid #dfe4d9; border-radius: 12px; background: #fff; color: #384432; cursor: pointer; font: 700 27px/1 'Noto Sans Greek', sans-serif; transition: background-color .15s ease, border-color .15s ease, transform .15s ease; }
.article-gender-option:hover:not(:disabled) { transform: translateY(-1px); border-color: #aab89f; background: #f5f7f2; }
.article-gender-option:focus-visible, .article-gender-next:focus-visible { outline: 3px solid #9aaf8f; outline-offset: 3px; }
.article-gender-option:disabled { cursor: default; }
.article-gender-option.is-correct { border-color: #77946d; background: #edf3e9; color: #334d2d; }
.article-gender-option.is-wrong { border-color: #bf897b; background: #fbefeb; color: #78463a; text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 4px; }
.article-gender-feedback { max-width: 530px; margin: 20px auto 0; padding: 14px 16px; border-radius: 12px; background: #f5f6f1; text-align: center; }
.article-gender-answer { margin: 0; color: #32432b; font: 700 22px/1.4 'Manrope', 'Noto Sans Greek', sans-serif; overflow-wrap: anywhere; }
.article-gender-feedback-copy { margin: 7px 0 0; color: #66695f; font-size: 12px; line-height: 1.55; }
.article-gender-note { margin: 8px 0 0; color: #6d735f; font-size: 11px; line-height: 1.55; }
.article-gender-next { display: block; min-width: 180px; min-height: 46px; margin: 18px auto 0; padding: 0 18px; border: 1px solid #52654a; border-radius: 9px; background: #52654a; color: #fff; cursor: pointer; font: inherit; font-size: 12px; font-weight: 700; }
.article-gender-next:hover { background: #40533a; }
@media (max-width: 420px) {
  .article-gender-prompt { padding: 29px 5px 20px; }
  .article-gender-options { gap: 8px; }
  .article-gender-option { min-height: 60px; }
  .article-gender-feedback { padding: 13px 11px; }
}
@media (prefers-reduced-motion: reduce) {
  .article-gender-progress span, .article-gender-option { transition: none; }
  .article-gender-option:hover:not(:disabled) { transform: none; }
}
</style>
