<script setup lang="ts">
import { computed, nextTick, useTemplateRef, watch } from 'vue'
import { dialogueQuestionCorrectOption, type DialogueQuestionState } from '../../lib/trainers/dialogue/dialogueSession.ts'

const props = defineProps<{
  questionState: DialogueQuestionState
  roundNumber: number
  totalRounds: number
  questionNumber: number
  totalQuestions: number
}>()

const emit = defineEmits<{
  select: [optionId: string]
  check: []
  advance: []
}>()

const questionHeading = useTemplateRef<HTMLHeadingElement>('questionHeading')
const feedbackHeading = useTemplateRef<HTMLHeadingElement>('feedbackHeading')
const correctOption = computed(() => dialogueQuestionCorrectOption(props.questionState.question))
const selectedOption = computed(() => props.questionState.question.options.find(
  (option) => option.id === props.questionState.selectedOptionId,
))
const orderedOptions = computed(() => props.questionState.optionOrder.map(
  (id) => props.questionState.question.options.find((option) => option.id === id),
).filter((option) => option !== undefined))
const isRoundEnd = computed(() => props.questionNumber % 2 === 0)
const isLastQuestion = computed(() => props.questionNumber === props.totalQuestions)

watch(() => props.questionState.checked, (checked) => {
  if (checked) void nextTick(() => feedbackHeading.value?.focus())
})

function focusQuestion(): void {
  questionHeading.value?.focus()
}

defineExpose({ focusQuestion })
</script>

<template>
  <section class="dialogue-question" :aria-labelledby="`dialogue-question-${questionState.question.id}`">
    <div class="dialogue-progress-row">
      <span class="dialogue-round-label">Раунд {{ roundNumber }} из {{ totalRounds }}</span>
      <span class="dialogue-question-count">Задание {{ questionNumber }} из {{ totalQuestions }}</span>
    </div>
    <div class="dialogue-progress-track" role="progressbar" :aria-valuenow="questionNumber" :aria-valuemin="1" :aria-valuemax="totalQuestions" :aria-label="`Задание ${questionNumber} из ${totalQuestions}`">
      <span :style="{ width: `${questionNumber / totalQuestions * 100}%` }"></span>
    </div>

    <h2 :id="`dialogue-question-${questionState.question.id}`" ref="questionHeading" class="dialogue-prompt-title" tabindex="-1">
      Продолжи разговор
    </h2>
    <div class="dialogue-transcript" aria-label="Диалог на греческом">
      <p v-for="(line, index) in questionState.question.context" :key="`${index}-${line.speaker}`" class="dialogue-line">
        <span class="dialogue-speaker">{{ line.speaker }}</span>
        <span class="dialogue-greek">{{ line.greek }}</span>
        <span v-if="questionState.checked" class="dialogue-russian">{{ line.translation }}</span>
      </p>
      <p v-if="questionState.checked && correctOption" class="dialogue-line dialogue-answer-line">
        <span class="dialogue-speaker">Ты</span>
        <span class="dialogue-greek">{{ correctOption.greek }}</span>
        <span class="dialogue-russian">{{ correctOption.translation }}</span>
      </p>
    </div>

    <fieldset class="dialogue-answer-group" :disabled="questionState.checked">
      <legend>Выбери подходящую реплику</legend>
      <div class="dialogue-option-list">
        <button
          v-for="option in orderedOptions"
          :key="option.id"
          type="button"
          class="dialogue-option"
          :class="{
            'is-selected': questionState.selectedOptionId === option.id && !questionState.checked,
            'is-correct': questionState.checked && option.id === questionState.question.correctOptionId,
            'is-incorrect': questionState.checked && questionState.selectedOptionId === option.id && !questionState.isCorrect,
          }"
          :aria-pressed="questionState.selectedOptionId === option.id"
          @click="emit('select', option.id)"
        >
          <span class="dialogue-option-greek">{{ option.greek }}</span>
          <span v-if="questionState.checked && option.id === questionState.question.correctOptionId" class="dialogue-option-result">Верный ответ</span>
          <span v-else-if="questionState.checked && questionState.selectedOptionId === option.id" class="dialogue-option-result">Ваш выбор</span>
        </button>
      </div>
    </fieldset>

    <div v-if="questionState.checked" class="dialogue-feedback" role="status" aria-live="polite" aria-atomic="true">
      <h3 ref="feedbackHeading" class="dialogue-feedback-title" tabindex="-1">
        {{ questionState.isCorrect ? 'Правильно!' : 'Ответ не подходит' }}
      </h3>
      <p class="dialogue-explanation">{{ questionState.question.explanation }}</p>
      <p v-if="selectedOption && !questionState.isCorrect" class="dialogue-selected-explanation">
        <strong>Вы выбрали:</strong> {{ selectedOption.greek }} — {{ selectedOption.translation }}
        {{ selectedOption.explanation }}
      </p>
      <p v-if="correctOption" class="dialogue-correct-explanation">
        <strong>Почему подходит:</strong> {{ correctOption.explanation }}
      </p>
    </div>

    <div class="dialogue-actions">
      <button v-if="!questionState.checked" class="dialogue-primary-button" type="button" :disabled="!questionState.selectedOptionId" @click="emit('check')">
        Проверить
      </button>
      <button v-else class="dialogue-primary-button" type="button" @click="emit('advance')">
        {{ isLastQuestion ? 'Показать результат' : isRoundEnd ? 'Следующий раунд' : 'Следующее задание' }}
        <span aria-hidden="true">→</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.dialogue-question { min-width: 0; }
.dialogue-progress-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; color: #777a70; font-size: 11px; }
.dialogue-round-label { color: #52654a; font-weight: 700; }
.dialogue-question-count { white-space: nowrap; }
.dialogue-progress-track { height: 4px; margin-top: 9px; overflow: hidden; border-radius: 99px; background: #eeeee8; }
.dialogue-progress-track span { display: block; height: 100%; border-radius: inherit; background: #7f9272; transition: width .2s ease; }
.dialogue-prompt-title { margin: 23px 0 11px; color: #353a31; font: 700 17px/1.4 'Manrope', sans-serif; }
.dialogue-transcript { min-width: 0; padding: 16px; border: 1px solid #e5e7df; border-radius: 13px; background: #f2f3ef; }
.dialogue-line { min-width: 0; margin: 0; overflow-wrap: anywhere; }
.dialogue-line + .dialogue-line { margin-top: 12px; }
.dialogue-speaker { display: block; margin-bottom: 3px; color: #7c8574; font-size: 10px; font-weight: 700; }
.dialogue-greek { display: block; color: #34392f; font: 500 19px/1.55 'Noto Sans Greek', 'DM Sans', sans-serif; }
.dialogue-russian { display: block; margin-top: 3px; color: #74786f; font-size: 12px; line-height: 1.5; }
.dialogue-answer-line { padding-top: 12px; border-top: 1px solid #dfe2d9; }
.dialogue-answer-group { min-width: 0; margin: 18px 0 0; padding: 0; border: 0; }
.dialogue-answer-group legend { margin-bottom: 9px; color: #777a70; font-size: 12px; font-weight: 600; }
.dialogue-option-list { display: grid; gap: 9px; }
.dialogue-option { min-width: 0; min-height: 58px; display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 13px 14px; border: 1px solid #e0e2da; border-radius: 11px; background: #fff; color: #3f443b; cursor: pointer; font: inherit; text-align: left; overflow-wrap: anywhere; transition: border-color .15s, background-color .15s; }
.dialogue-option:hover:not(:disabled) { border-color: #aab69d; background: #fbfcf9; }
.dialogue-option:focus-visible { outline: 3px solid #9aaf8f; outline-offset: 3px; }
.dialogue-option.is-selected { border-color: #64775a; background: #eef2ea; box-shadow: inset 0 0 0 1px #64775a; }
.dialogue-option.is-correct { border-color: #6c8760; background: #edf4e9; }
.dialogue-option.is-incorrect { border-color: #a96c5d; background: #fbefec; }
.dialogue-option:disabled { cursor: default; }
.dialogue-option-greek { min-width: 0; color: inherit; font: 500 16px/1.5 'Noto Sans Greek', 'DM Sans', sans-serif; }
.dialogue-option-result { flex: 0 0 auto; align-self: center; color: #52654a; font-size: 10px; font-weight: 700; white-space: nowrap; }
.dialogue-option.is-incorrect .dialogue-option-result { color: #925b4e; }
.dialogue-feedback { margin-top: 17px; padding: 15px 16px; border: 1px solid #dfe5d9; border-radius: 12px; background: #f4f7f1; }
.dialogue-feedback-title { margin: 0 0 6px; color: #40533a; font: 700 15px 'Manrope', sans-serif; }
.dialogue-explanation, .dialogue-selected-explanation, .dialogue-correct-explanation { margin: 0; color: #60665b; font-size: 12px; line-height: 1.55; overflow-wrap: anywhere; }
.dialogue-selected-explanation, .dialogue-correct-explanation { margin-top: 7px; }
.dialogue-actions { display: flex; justify-content: flex-end; margin-top: 17px; }
.dialogue-primary-button { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; gap: 9px; padding: 0 16px; border: 1px solid #52654a; border-radius: 9px; background: #52654a; color: #fff; cursor: pointer; font: inherit; font-size: 12px; font-weight: 700; }
.dialogue-primary-button:hover:not(:disabled) { background: #40533a; }
.dialogue-primary-button:disabled { cursor: not-allowed; opacity: .5; }
.dialogue-primary-button:focus-visible { outline: 3px solid #9aaf8f; outline-offset: 3px; }
h2:focus, h3:focus { outline: none; }
h2:focus-visible, h3:focus-visible { outline: 2px solid #9aaf8f; outline-offset: 4px; }
@media (max-width: 520px) {
  .dialogue-transcript { padding: 13px; }
  .dialogue-greek { font-size: 17px; }
  .dialogue-option { min-height: 56px; padding: 12px; }
  .dialogue-option-greek { font-size: 15px; }
  .dialogue-option-result { white-space: normal; text-align: right; }
  .dialogue-primary-button { width: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .dialogue-progress-track span, .dialogue-option { transition: none; }
}
</style>
