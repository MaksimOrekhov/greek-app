<script setup lang="ts">
import { computed } from 'vue'
import { completeFillGapSentence, type FillGapQuestion } from '../../data/trainers/fillGapQuestions.ts'

const props = defineProps<{
  question: FillGapQuestion
  questionNumber: number
  totalQuestions: number
  optionOrder: string[]
  selectedOptionId: string | null
  checked: boolean
  isCorrect: boolean | null
  continueLabel: string
}>()

const emit = defineEmits<{
  selectOption: [optionId: string]
  checkAnswer: []
  advance: []
}>()

const orderedOptions = computed(() => props.optionOrder
  .map((id) => props.question.options.find((option) => option.id === id))
  .filter((option) => option !== undefined))
const selectedOption = computed(() => props.question.options.find((option) => option.id === props.selectedOptionId) ?? null)
const completedSentence = computed(() => completeFillGapSentence(props.question))
const progress = computed(() => `${props.questionNumber} / ${props.totalQuestions}`)
</script>

<template>
  <section class="fill-gap-exercise" aria-labelledby="fill-gap-instruction">
    <div class="exercise-progress-row">
      <span>Задание {{ progress }}</span>
      <div class="exercise-progress-track" role="progressbar" :aria-valuenow="questionNumber" :aria-valuemin="1" :aria-valuemax="totalQuestions" :aria-label="`Задание ${progress}`">
        <span :style="{ width: `${questionNumber / totalQuestions * 100}%` }"></span>
      </div>
    </div>

    <h2 id="fill-gap-instruction">{{ question.instruction }}</h2>
    <p class="fill-gap-hint">{{ question.hint }}</p>

    <p class="sentence-line" aria-label="Предложение с пропуском">
      <span>{{ question.sentenceBefore }}</span><span
        class="sentence-gap"
        :class="{
          'is-empty': !selectedOption,
          'is-right': checked && isCorrect,
          'is-wrong': checked && !isCorrect,
        }"
        :aria-label="selectedOption ? `Выбрано: ${selectedOption.text}` : 'Пропуск не заполнен'"
      >{{ selectedOption?.text ?? '…' }}</span><span>{{ question.sentenceAfter }}</span>
    </p>

    <p class="answer-prompt">Выбери один вариант:</p>
    <div class="gap-option-list" role="group" aria-label="Варианты для пропуска">
      <button
        v-for="option in orderedOptions"
        :key="option.id"
        class="gap-option"
        :class="{
          'is-selected': selectedOptionId === option.id,
          'is-correct': checked && option.id === question.correctOptionId,
          'is-incorrect': checked && selectedOptionId === option.id && option.id !== question.correctOptionId,
        }"
        type="button"
        :aria-pressed="selectedOptionId === option.id"
        :disabled="checked"
        @click="emit('selectOption', option.id)"
      >
        <span class="option-mark" aria-hidden="true">
          {{ checked && option.id === question.correctOptionId ? '✓' : checked && selectedOptionId === option.id ? '×' : '' }}
        </span>
        <span class="option-text">{{ option.text }}</span>
        <span v-if="checked && option.id === question.correctOptionId" class="option-note">Правильно</span>
        <span v-else-if="checked && selectedOptionId === option.id" class="option-note">Твой выбор</span>
      </button>
    </div>

    <button v-if="!checked" class="exercise-action-button" type="button" :disabled="!selectedOptionId" @click="emit('checkAnswer')">
      Проверить
    </button>

    <div v-else class="answer-feedback" :class="isCorrect ? 'is-success' : 'is-error'" role="status" aria-live="polite">
      <strong>{{ isCorrect ? 'Верно!' : 'Пока неверно.' }}</strong>
      <p v-if="!isCorrect" class="correct-sentence"><span>Правильная фраза:</span> {{ completedSentence }}</p>
      <p>{{ question.explanation }}</p>
      <button class="exercise-action-button" type="button" @click="emit('advance')">
        {{ continueLabel }} <span aria-hidden="true">→</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.fill-gap-exercise { min-width: 0; }
.exercise-progress-row { display: flex; align-items: center; gap: 12px; color: #777a70; font-size: 12px; }
.exercise-progress-track { height: 4px; flex: 1; overflow: hidden; border-radius: 99px; background: #eeeee8; }
.exercise-progress-track span { display: block; height: 100%; border-radius: inherit; background: #7f9272; transition: width .2s ease; }
.fill-gap-exercise h2 { margin: 18px 0 3px; color: #777a70; font: 600 14px/1.4 'Manrope', 'Noto Sans Greek', sans-serif; letter-spacing: 0; }
.fill-gap-hint { margin: 0 0 16px; color: #55594f; font-size: 17px; line-height: 1.5; }
.sentence-line { min-height: 82px; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 0; margin: 0; padding: 17px; border: 1px solid #e4e4dc; border-radius: 12px; background: #fbfbf9; color: #32352e; font: 600 clamp(24px, 4.6vw, 29px)/1.5 'Manrope', 'Noto Sans Greek', sans-serif; text-align: center; white-space: pre-wrap; overflow-wrap: anywhere; }
.sentence-gap { min-width: 92px; display: inline-block; margin: 0 4px; padding: 0 6px 1px; border-bottom: 2px solid #849675; color: #53664b; text-align: center; }
.sentence-gap.is-empty { color: #9a9b92; }
.sentence-gap.is-right { border-color: #7b966a; color: #52654a; }
.sentence-gap.is-wrong { border-color: #d16d58; color: #a33f31; }
.answer-prompt { margin: 17px 0 8px; color: #777a70; font-size: 13px; }
.gap-option-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.gap-option { min-width: 0; min-height: 47px; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 9px 11px; border: 1px solid #e4e4dc; border-radius: 10px; background: #fff; color: #4e5148; cursor: pointer; text-align: center; transition: border-color .16s, background .16s, color .16s; }
.gap-option:hover { border-color: #c9d2c0; background: #f8f9f6; }
.gap-option:focus-visible, .exercise-action-button:focus-visible { outline: 3px solid rgba(105, 130, 91, .35); outline-offset: 2px; }
.gap-option.is-selected { border-color: #849675; background: #f0f4ec; color: #465a3f; }
.gap-option.is-correct { border-color: #c8d5bf; background: #edf3e9; color: #465a3f; }
.gap-option.is-incorrect { border-color: #e68d79; background: #fff0ec; color: #9b4133; }
.option-mark { width: 17px; height: 17px; flex: 0 0 17px; display: grid; place-items: center; border: 1px solid #c9cbc1; border-radius: 50%; background: #fff; color: #52654a; font-size: 11px; font-weight: 800; }
.is-selected .option-mark { border-color: #849675; background: #e4ebde; }
.is-correct .option-mark { border-color: #bfd0b4; background: #e0ead9; }
.is-incorrect .option-mark { border-color: #e68d79; background: #fbe1db; color: #a33f31; }
.option-text { min-width: 0; overflow-wrap: anywhere; font-size: 16px; line-height: 1.4; }
.option-note { color: inherit; font-size: 11px; font-weight: 700; }
.gap-option:disabled { cursor: default; }
.answer-feedback { margin-top: 15px; padding: 13px; border: 1px solid #e4e4dc; border-radius: 11px; background: #f8f8f5; }
.answer-feedback strong { display: block; color: #505349; font-size: 14px; }
.answer-feedback p { margin: 6px 0 0; color: #686b61; font-size: 13px; line-height: 1.55; }
.answer-feedback.is-success { border-color: #ccd8c4; background: #f2f6ee; }
.answer-feedback.is-success strong { color: #52654a; }
.answer-feedback.is-error { border-color: #edd3cb; background: #fcf4f1; }
.answer-feedback.is-error strong { color: #9b5142; }
.correct-sentence span { color: #696d61; font-weight: 700; }
.exercise-action-button { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; margin-top: 14px; padding: 0 17px; border: 1px solid #52654a; border-radius: 9px; background: #52654a; color: #fff; cursor: pointer; font-size: 14px; font-weight: 700; }
.exercise-action-button:hover:not(:disabled) { border-color: #40533a; background: #40533a; }
.exercise-action-button:disabled { border-color: #dadbd4; background: #e8e9e3; color: #92938a; cursor: not-allowed; }
.exercise-action-button span { font-size: 15px; }
.answer-feedback .exercise-action-button { margin-top: 12px; }
@media (max-width: 520px) {
  .fill-gap-exercise h2 { margin-top: 15px; font-size: 13px; }
  .fill-gap-hint { margin-bottom: 13px; font-size: 16px; }
  .sentence-line { min-height: 72px; padding: 12px 8px; font-size: clamp(23px, 6vw, 27px); }
  .gap-option-list { grid-template-columns: 1fr; }
  .gap-option { justify-content: flex-start; text-align: left; }
  .option-note { margin-left: auto; }
  .answer-feedback .exercise-action-button { width: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .exercise-progress-track span, .gap-option { transition: none; }
}
</style>
