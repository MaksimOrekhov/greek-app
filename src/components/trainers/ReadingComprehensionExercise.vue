<script setup lang="ts">
import { computed, nextTick, useTemplateRef, watch } from 'vue'
import type { PropType } from 'vue'
import { readingGenreLabels } from '../../data/trainers/readingTexts.ts'
import type { ReadingQuestionState, ReadingRound } from '../../lib/trainers/readingComprehension/readingSession.ts'
import { readingCorrectOption } from '../../lib/trainers/readingComprehension/readingSession.ts'

const props = defineProps({
  round: { type: Object as PropType<ReadingRound>, required: true },
  totalRounds: { type: Number, required: true },
})

const emit = defineEmits<{
  select: [questionId: string, optionId: string]
  check: []
  advance: []
}>()

const textHeading = useTemplateRef<HTMLHeadingElement>('textHeading')
const feedbackHeading = useTemplateRef<HTMLHeadingElement>('feedbackHeading')
const paragraphs = computed(() => props.round.text.greek.split(/\n\s*\n/))
const translationParagraphs = computed(() => props.round.text.translationRu.split(/\n\s*\n/))
const allSelected = computed(() => props.round.questions.every((item) => item.selectedOptionId !== null))
const correctCount = computed(() => props.round.questions.filter((item) => item.isCorrect).length)
const lastRound = computed(() => props.round.number === props.totalRounds)

function orderedOptions(item: ReadingQuestionState) {
  return item.optionOrder.map((id) => item.question.options.find((option) => option.id === id))
    .filter((option) => option !== undefined)
}

function selectedOption(item: ReadingQuestionState) {
  return item.question.options.find((option) => option.id === item.selectedOptionId)
}

function correctOption(item: ReadingQuestionState) {
  return readingCorrectOption(item.question)
}

watch(() => props.round.checked, (checked) => {
  if (checked) void nextTick(() => feedbackHeading.value?.focus())
})

function focusTextHeading(): void {
  textHeading.value?.focus()
}

defineExpose({ focusTextHeading })
</script>

<template>
  <section class="reading-exercise" aria-label="Тренажёр «Прочитай и пойми»">
    <div class="reading-progress-row">
      <span class="reading-round-label">Текст {{ round.number }} из {{ totalRounds }}</span>
      <span>{{ round.text.level }} · {{ readingGenreLabels[round.text.genreId] }}</span>
    </div>
    <div class="reading-progress-track" role="progressbar" :aria-valuenow="round.number" :aria-valuemin="1" :aria-valuemax="totalRounds" :aria-label="`Текст ${round.number} из ${totalRounds}`">
      <span :style="{ width: `${round.number / totalRounds * 100}%` }"></span>
    </div>

    <h2 ref="textHeading" class="reading-title" tabindex="-1">Прочитай текст</h2>
    <p class="reading-instruction">Прочитай текст. Ответь на оба вопроса, затем нажми «Проверить ответы».</p>
    <p v-if="round.text.contextNoteRu" class="reading-context-note">{{ round.text.contextNoteRu }}</p>

    <article class="reading-source" lang="el" aria-label="Текст на греческом языке">
      <p v-for="(paragraph, index) in paragraphs" :key="index">{{ paragraph }}</p>
    </article>

    <div class="reading-question-list">
      <fieldset v-for="item in round.questions" :key="item.question.id" class="reading-question" :disabled="round.checked">
        <legend>{{ item.question.promptRu }}</legend>
        <div class="reading-option-list">
          <button
            v-for="option in orderedOptions(item)"
            :key="option.id"
            type="button"
            class="reading-option"
            :class="{
              'is-selected': item.selectedOptionId === option.id && !round.checked,
              'is-correct': round.checked && option.id === item.question.correctOptionId,
              'is-incorrect': round.checked && item.selectedOptionId === option.id && !item.isCorrect,
            }"
            :aria-pressed="item.selectedOptionId === option.id"
            @click="emit('select', item.question.id, option.id)"
          >
            <span class="reading-option-copy">{{ option.textRu }}</span>
            <span v-if="round.checked && option.id === item.question.correctOptionId" class="reading-option-result">Правильный ответ</span>
            <span v-else-if="round.checked && item.selectedOptionId === option.id" class="reading-option-result">Ваш выбор</span>
            <span v-if="round.checked" class="reading-option-feedback">{{ option.feedbackRu }}</span>
          </button>
        </div>
      </fieldset>
    </div>

    <section v-if="round.checked" class="reading-feedback" role="status" aria-live="polite" aria-atomic="true">
      <h3 ref="feedbackHeading" class="reading-feedback-title" tabindex="-1">
        В этом тексте верно {{ correctCount }} из {{ round.questions.length }} ответов
      </h3>
      <article v-for="item in round.questions" :key="item.question.id" class="reading-question-feedback">
        <h4>{{ item.question.promptRu }}</h4>
        <p class="reading-answer-status">{{ item.isCorrect ? 'Твой ответ верный.' : `Твой ответ: ${selectedOption(item)?.textRu ?? ''}` }}</p>
        <p v-if="!item.isCorrect && correctOption(item)" class="reading-correct-answer">Правильный ответ: {{ correctOption(item)?.textRu }}</p>
        <p>{{ item.question.explanationRu }}</p>
        <p class="reading-evidence"><span>В тексте:</span> <q v-for="evidence in item.question.evidenceEl" :key="evidence" lang="el">{{ evidence }}</q></p>
      </article>
      <div class="reading-translation">
        <h4>Перевод текста</h4>
        <p v-for="(paragraph, index) in translationParagraphs" :key="index">{{ paragraph }}</p>
      </div>
    </section>

    <div class="reading-actions">
      <button v-if="!round.checked" class="reading-primary-button" type="button" :disabled="!allSelected" @click="emit('check')">
        Проверить ответы
      </button>
      <button v-else class="reading-primary-button" type="button" @click="emit('advance')">
        {{ lastRound ? 'Показать результаты' : 'Следующий текст' }} <span aria-hidden="true">→</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.reading-exercise { min-width: 0; }
.reading-progress-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; color: #777a70; font-size: 11px; }
.reading-round-label { color: #52654a; font-weight: 700; }
.reading-progress-track { height: 4px; margin-top: 9px; overflow: hidden; border-radius: 99px; background: #eeeee8; }
.reading-progress-track span { display: block; height: 100%; border-radius: inherit; background: #7f9272; transition: width .2s ease; }
.reading-title { margin: 19px 0 4px; color: #353a31; font: 700 18px/1.4 'Manrope', sans-serif; overflow-wrap: anywhere; }
.reading-context-note { margin: 0 0 10px; color: #687064; font-size: 13px; line-height: 1.45; }
.reading-instruction { margin: 0 0 14px; color: #85877d; font-size: 12px; line-height: 1.5; }
.reading-source { min-width: 0; padding: 18px; border: 1px solid #e5e7df; border-radius: 13px; background: #f2f3ef; color: #34392f; font: 500 19px/1.7 'Noto Sans Greek', 'DM Sans', sans-serif; overflow-wrap: anywhere; }
.reading-source p { margin: 0; }
.reading-source p + p { margin-top: 12px; }
.reading-question-list { display: grid; gap: 16px; margin-top: 19px; }
.reading-question { min-width: 0; margin: 0; padding: 0; border: 0; }
.reading-question legend { width: 100%; margin-bottom: 9px; color: #454a40; font-size: 14px; font-weight: 700; line-height: 1.5; overflow-wrap: anywhere; }
.reading-option-list { display: grid; gap: 8px; }
.reading-option { min-width: 0; min-height: 52px; display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 8px 12px; padding: 11px 13px; border: 1px solid #e0e2da; border-radius: 11px; background: #fff; color: #3f443b; cursor: pointer; font: inherit; text-align: left; overflow-wrap: anywhere; transition: border-color .15s, background-color .15s; }
.reading-option-copy { min-width: 0; font-size: 13px; line-height: 1.5; }
.reading-option:hover:not(:disabled) { border-color: #aab69d; background: #fbfcf9; }
.reading-option:focus-visible, .reading-primary-button:focus-visible { outline: 3px solid #9aaf8f; outline-offset: 3px; }
.reading-option.is-selected { border-color: #64775a; background: #eef2ea; box-shadow: inset 0 0 0 1px #64775a; }
.reading-option.is-correct { border-color: #6c8760; background: #edf4e9; }
.reading-option.is-incorrect { border-color: #a96c5d; background: #fbefec; }
.reading-option:disabled { cursor: default; }
.reading-option-result { color: #52654a; font-size: 10px; font-weight: 700; text-align: right; }
.reading-option.is-incorrect .reading-option-result { color: #925b4e; }
.reading-option-feedback { grid-column: 1 / -1; padding-top: 7px; border-top: 1px solid rgba(70, 75, 64, .12); color: #62675d; font-size: 11px; line-height: 1.5; }
.reading-feedback { margin-top: 18px; padding: 15px 16px; border: 1px solid #dfe5d9; border-radius: 12px; background: #f4f7f1; color: #60665b; font-size: 12px; line-height: 1.55; overflow-wrap: anywhere; }
.reading-feedback-title { margin: 0 0 12px; color: #40533a; font: 700 15px 'Manrope', sans-serif; }
.reading-question-feedback + .reading-question-feedback { margin-top: 14px; padding-top: 13px; border-top: 1px solid #dfe5d9; }
.reading-question-feedback h4, .reading-translation h4 { margin: 0 0 5px; color: #454a40; font-size: 12px; }
.reading-question-feedback p { margin: 5px 0 0; }
.reading-answer-status { font-weight: 700; }
.reading-correct-answer { color: #40533a; font-weight: 700; }
.reading-evidence q { display: inline; color: #34392f; font: 500 14px/1.6 'Noto Sans Greek', sans-serif; }
.reading-evidence span { font-weight: 600; }
.reading-translation { margin-top: 17px; padding-top: 13px; border-top: 1px solid #dfe5d9; }
.reading-translation p { margin: 6px 0 0; }
.reading-actions { display: flex; justify-content: flex-end; margin-top: 17px; }
.reading-primary-button { min-height: 46px; display: inline-flex; align-items: center; justify-content: center; gap: 9px; padding: 0 17px; border: 1px solid #52654a; border-radius: 9px; background: #52654a; color: #fff; cursor: pointer; font: inherit; font-size: 12px; font-weight: 700; }
.reading-primary-button:hover:not(:disabled) { background: #40533a; }
.reading-primary-button:disabled { cursor: not-allowed; opacity: .5; }
.reading-title:focus, .reading-feedback-title:focus { outline: none; }
.reading-title:focus-visible, .reading-feedback-title:focus-visible { outline: 2px solid #9aaf8f; outline-offset: 4px; }
@media (max-width: 520px) {
  .reading-source { padding: 14px; font-size: 17px; line-height: 1.65; }
  .reading-option { padding: 11px; }
  .reading-option-result { max-width: 84px; }
  .reading-primary-button { width: 100%; }
  .reading-actions { justify-content: stretch; }
}
@media (prefers-reduced-motion: reduce) {
  .reading-progress-track span, .reading-option { transition: none; }
}
</style>
