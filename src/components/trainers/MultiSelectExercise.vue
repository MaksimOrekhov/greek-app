<script setup lang="ts">
import { computed } from 'vue'
import type { MultiSelectQuestion } from '../../data/trainers/multiSelectQuestions.ts'

const props = defineProps<{
  question: MultiSelectQuestion
  questionNumber: number
  totalQuestions: number
  optionOrder: string[]
  selectedOptionIds: string[]
  checked: boolean
  isCorrect: boolean | null
  missedOptionIds: string[]
  incorrectOptionIds: string[]
  continueLabel: string
}>()

const emit = defineEmits<{
  toggleOption: [optionId: string]
  checkAnswer: []
  advance: []
}>()

const orderedOptions = computed(() => props.optionOrder
  .map((id) => props.question.options.find((option) => option.id === id))
  .filter((option) => option !== undefined))
const progress = computed(() => `${props.questionNumber} / ${props.totalQuestions}`)
</script>

<template>
  <section class="multi-select-exercise" aria-labelledby="multi-select-prompt">
    <div class="exercise-progress-row">
      <span>Задание {{ progress }}</span>
      <div class="exercise-progress-track" role="progressbar" :aria-valuenow="questionNumber" :aria-valuemin="1" :aria-valuemax="totalQuestions" :aria-label="`Задание ${progress}`">
        <span :style="{ width: `${questionNumber / totalQuestions * 100}%` }"></span>
      </div>
    </div>

    <h2 id="multi-select-prompt">{{ question.prompt }}</h2>
    <p class="selection-hint">Выбери все подходящие варианты.</p>

    <div class="option-list">
      <button
        v-for="option in orderedOptions"
        :key="option.id"
        class="option-button"
        :class="{
          'is-selected': selectedOptionIds.includes(option.id),
          'is-correct': checked && selectedOptionIds.includes(option.id) && option.correct,
          'is-incorrect': checked && incorrectOptionIds.includes(option.id),
          'is-missed': checked && missedOptionIds.includes(option.id),
        }"
        type="button"
        :aria-pressed="selectedOptionIds.includes(option.id)"
        :disabled="checked"
        @click="emit('toggleOption', option.id)"
      >
        <span class="option-mark" aria-hidden="true">
          <template v-if="checked && (incorrectOptionIds.includes(option.id) || missedOptionIds.includes(option.id))">
            {{ incorrectOptionIds.includes(option.id) ? '×' : '✓' }}
          </template>
          <template v-else>{{ selectedOptionIds.includes(option.id) ? '✓' : '' }}</template>
        </span>
        <span class="option-text">{{ option.text }}</span>
        <span v-if="checked && missedOptionIds.includes(option.id)" class="option-note">Нужный вариант</span>
        <span v-else-if="checked && incorrectOptionIds.includes(option.id)" class="option-note">Выбрано ошибочно</span>
      </button>
    </div>

    <button v-if="!checked" class="exercise-action-button" type="button" :disabled="selectedOptionIds.length === 0" @click="emit('checkAnswer')">
      Проверить
    </button>

    <div v-else class="answer-feedback" :class="isCorrect ? 'is-success' : 'is-error'" role="status" aria-live="polite">
      <strong>{{ isCorrect ? 'Всё верно!' : 'Есть ошибка в выборе.' }}</strong>
      <p>{{ question.explanation }}</p>
      <button class="exercise-action-button" type="button" @click="emit('advance')">
        {{ continueLabel }} <span aria-hidden="true">→</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.multi-select-exercise { min-width: 0; }
.exercise-progress-row { display: flex; align-items: center; gap: 12px; color: #85877d; font-size: 10px; }
.exercise-progress-track { height: 4px; flex: 1; overflow: hidden; border-radius: 99px; background: #eeeee8; }
.exercise-progress-track span { display: block; height: 100%; border-radius: inherit; background: #7f9272; transition: width .2s ease; }
.multi-select-exercise h2 { margin: 20px 0 5px; font: 700 19px/1.4 'Manrope', 'Noto Sans Greek', sans-serif; letter-spacing: -.3px; }
.selection-hint { margin: 0 0 13px; color: #85877d; font-size: 11px; }
.option-list { display: grid; gap: 8px; }
.option-button { width: 100%; min-height: 48px; display: flex; align-items: center; gap: 11px; padding: 10px 13px; border: 1px solid #e4e4dc; border-radius: 11px; background: #fff; color: #4e5148; cursor: pointer; text-align: left; transition: border-color .16s, background .16s, color .16s; }
.option-button:hover { border-color: #c9d2c0; background: #f8f9f6; }
.option-button:focus-visible, .exercise-action-button:focus-visible { outline: 3px solid rgba(105, 130, 91, .35); outline-offset: 2px; }
.option-button.is-selected { border-color: #849675; background: #f0f4ec; }
.option-mark { width: 19px; height: 19px; flex: 0 0 19px; display: grid; place-items: center; border: 1px solid #c9cbc1; border-radius: 6px; background: #fff; color: #52654a; font-size: 12px; font-weight: 800; }
.is-selected .option-mark { border-color: #849675; background: #e4ebde; }
.option-text { flex: 1; min-width: 0; font-size: 13px; line-height: 1.45; }
.option-note { flex: 0 0 auto; color: #69765f; font-size: 10px; font-weight: 700; }
.option-button.is-correct, .option-button.is-missed { border-color: #c8d5bf; background: #edf3e9; color: #465a3f; }
.option-button.is-correct:hover, .option-button.is-missed:hover { border-color: #c8d5bf; background: #edf3e9; }
.option-button.is-incorrect { border-color: #e68d79; background: #fff0ec; color: #9b4133; }
.option-button.is-incorrect:hover { border-color: #e68d79; background: #fff0ec; color: #9b4133; }
.option-button.is-incorrect .option-mark { border-color: #e68d79; background: #fbe1db; color: #a33f31; }
.option-button.is-correct .option-mark, .option-button.is-missed .option-mark { border-color: #bfd0b4; background: #e0ead9; }
.option-button:disabled { cursor: default; }
.answer-feedback { margin-top: 15px; padding: 13px; border: 1px solid #e4e4dc; border-radius: 11px; background: #f8f8f5; }
.answer-feedback strong { display: block; color: #505349; font-size: 12px; }
.answer-feedback p { margin: 5px 0 0; color: #777a70; font-size: 11px; line-height: 1.55; }
.answer-feedback.is-success { border-color: #ccd8c4; background: #f2f6ee; }
.answer-feedback.is-success strong { color: #52654a; }
.answer-feedback.is-error { border-color: #edd3cb; background: #fcf4f1; }
.answer-feedback.is-error strong { color: #9b5142; }
.exercise-action-button { min-height: 40px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; margin-top: 14px; padding: 0 16px; border: 1px solid #52654a; border-radius: 9px; background: #52654a; color: #fff; cursor: pointer; font-size: 12px; font-weight: 700; }
.exercise-action-button:hover:not(:disabled) { border-color: #40533a; background: #40533a; }
.exercise-action-button:disabled { border-color: #dadbd4; background: #e8e9e3; color: #92938a; cursor: not-allowed; }
.exercise-action-button span { font-size: 15px; }
.answer-feedback .exercise-action-button { margin-top: 12px; }
@media (max-width: 520px) {
  .multi-select-exercise h2 { margin-top: 16px; font-size: 17px; }
  .option-button { align-items: flex-start; min-height: 46px; padding: 10px 11px; }
  .option-mark { margin-top: 1px; }
  .option-note { max-width: 83px; text-align: right; line-height: 1.3; }
  .answer-feedback .exercise-action-button { width: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .exercise-progress-track span, .option-button { transition: none; }
}
</style>
