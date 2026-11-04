<script setup lang="ts">
import { computed, nextTick, onMounted, useTemplateRef, watch } from 'vue'
import { getOrderItemsCorrectOrder, formatOrderItemsValue, type OrderItemsItem, type OrderItemsQuestion } from '../../lib/trainers/orderItems/orderItems.ts'
import { focusOrderItemsChoiceButton, registerOrderItemsChoiceButton } from '../../lib/trainers/orderItems/focusChoiceButton.ts'

const props = defineProps<{
  question: OrderItemsQuestion
  questionNumber: number
  totalQuestions: number
  roundNumber: number
  totalRounds: number
  selectedOrder: string[]
  cardOrder: string[]
  checked: boolean
  isCorrect: boolean | null
  continueLabel: string
  autofocus: boolean
}>()

const emit = defineEmits<{
  selectCard: [itemId: string]
  removeCard: [itemId: string]
  resetAnswer: []
  checkAnswer: []
  advance: []
}>()

const instructionElement = useTemplateRef<HTMLHeadingElement>('instruction')
const feedbackElement = useTemplateRef<HTMLDivElement>('feedback')
const choiceButtons = new Map<string, HTMLButtonElement>()
const slots = [1, 2, 3, 4]
const selectedIds = computed(() => new Set(props.selectedOrder))
const choiceItems = computed<OrderItemsItem[]>(() => props.cardOrder
  .map((id) => props.question.items.find((item) => item.id === id))
  .filter((item): item is OrderItemsItem => item !== undefined))
const selectedItems = computed(() => props.selectedOrder
  .map((id) => props.question.items.find((item) => item.id === id) ?? null))
const correctOrder = computed(() => getOrderItemsCorrectOrder(props.question))
const progress = computed(() => `${props.questionNumber} из ${props.totalQuestions}`)

onMounted(() => {
  if (props.autofocus) void nextTick(() => instructionElement.value?.focus())
})

watch(() => props.checked, async (checked, wasChecked) => {
  if (!checked && !wasChecked) return
  await nextTick()
  if (checked) feedbackElement.value?.focus()
  else instructionElement.value?.focus()
})

function toggleChoice(itemId: string): void {
  if (props.checked) return
  if (selectedIds.value.has(itemId)) emit('removeCard', itemId)
  else emit('selectCard', itemId)
}

function removeFromAnswer(itemId: string): void {
  emit('removeCard', itemId)
  void nextTick(() => focusOrderItemsChoiceButton(choiceButtons, itemId))
}

function setChoiceButton(itemId: string, element: unknown): void {
  const button = element instanceof HTMLButtonElement ? element : null
  registerOrderItemsChoiceButton(choiceButtons, itemId, button)
}
</script>

<template>
  <section class="order-items-exercise" aria-labelledby="order-items-instruction">
    <div class="order-progress-row">
      <span>Задание {{ progress }}</span>
      <div class="order-progress-track" role="progressbar" :aria-valuenow="questionNumber" :aria-valuemin="1" :aria-valuemax="totalQuestions" :aria-label="`Общий прогресс: ${progress}`">
        <span :style="{ width: `${questionNumber / totalQuestions * 100}%` }"></span>
      </div>
      <span>Раунд {{ roundNumber }} из {{ totalRounds }}</span>
    </div>

    <h2 id="order-items-instruction" ref="instructionElement" tabindex="-1">{{ question.instruction }}</h2>

    <section class="order-answer-area" aria-labelledby="order-answer-title">
      <div class="order-area-heading">
        <h3 id="order-answer-title">Твой порядок</h3>
        <button v-if="!checked" class="order-reset-button" type="button" :disabled="selectedOrder.length === 0" @click="emit('resetAnswer')">
          Сбросить
        </button>
      </div>
      <ol class="order-answer-slots" aria-label="Позиции ответа">
        <li v-for="slot in slots" :key="slot" class="order-answer-slot">
          <span class="order-slot-number" aria-hidden="true">{{ slot }}</span>
          <button
            v-if="selectedItems[slot - 1]"
            class="order-answer-card"
            type="button"
            :disabled="checked"
            :aria-label="checked
              ? `Позиция ${slot}: ${selectedItems[slot - 1]!.greek} — ${formatOrderItemsValue(selectedItems[slot - 1]!)}`
              : `Убрать из ответа, позиция ${slot}: ${selectedItems[slot - 1]!.greek}`"
            @click="removeFromAnswer(selectedItems[slot - 1]!.id)"
          >
            <span class="order-card-greek">{{ selectedItems[slot - 1]!.greek }}</span>
            <span v-if="checked" class="order-card-value">{{ formatOrderItemsValue(selectedItems[slot - 1]!) }}</span>
            <span v-else class="order-remove-mark" aria-hidden="true">×</span>
          </button>
          <span v-else class="order-empty-slot">Позиция {{ slot }}</span>
        </li>
      </ol>
    </section>

    <section class="order-available-area" aria-labelledby="order-available-title">
      <h3 id="order-available-title">Карточки</h3>
      <p v-if="!checked" class="order-helper">Нажимай на карточки в нужном порядке. Выбранную можно нажать ещё раз, чтобы убрать.</p>
      <div class="order-available-cards" role="group" aria-label="Греческие карточки для ответа">
        <button
          v-for="item in choiceItems"
          :key="item.id"
          :ref="(element) => setChoiceButton(item.id, element)"
          class="order-choice-card"
          :class="{ 'is-selected': selectedIds.has(item.id) }"
          type="button"
          :disabled="checked"
          :aria-pressed="selectedIds.has(item.id)"
          :aria-label="selectedIds.has(item.id)
            ? `${item.greek}: выбрано, нажмите, чтобы убрать из ответа`
            : `${item.greek}: нажмите, чтобы добавить в ответ`"
          @click="toggleChoice(item.id)"
        >
          {{ item.greek }}
          <span v-if="selectedIds.has(item.id)" class="order-choice-state" aria-hidden="true">✓ В ответе · нажми, чтобы убрать</span>
        </button>
      </div>
    </section>

    <button v-if="!checked" class="order-action-button" type="button" :disabled="selectedOrder.length !== 4" @click="emit('checkAnswer')">
      Проверить
    </button>

    <div v-else ref="feedback" class="order-feedback" :class="isCorrect ? 'is-success' : 'is-error'" role="status" aria-live="polite" aria-atomic="true" tabindex="-1">
      <strong>{{ isCorrect ? 'Верно!' : 'Пока неверно.' }}</strong>
      <div v-if="!isCorrect" class="order-correct-answer">
        <span class="order-feedback-label">Правильный порядок:</span>
        <ol>
          <li v-for="item in correctOrder" :key="item.id">
            <span>{{ item.greek }}</span>
            <span class="order-card-value">{{ formatOrderItemsValue(item) }}</span>
          </li>
        </ol>
      </div>
      <p>{{ question.explanation }}</p>
      <button class="order-action-button" type="button" @click="emit('advance')">
        {{ continueLabel }} <span aria-hidden="true">→</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.order-items-exercise { min-width: 0; }
.order-progress-row { display: flex; align-items: center; gap: 10px; color: #777a70; font-size: 11px; }
.order-progress-track { height: 4px; flex: 1; overflow: hidden; border-radius: 99px; background: #eeeee8; }
.order-progress-track span { display: block; height: 100%; border-radius: inherit; background: #7f9272; transition: width .2s ease; }
.order-items-exercise h2 { margin: 19px 0; color: #32352e; font: 700 clamp(19px, 4vw, 23px)/1.35 'Manrope', 'Noto Sans Greek', sans-serif; text-align: center; }
.order-items-exercise h2:focus { outline: 3px solid rgba(105, 130, 91, .38); outline-offset: 4px; border-radius: 3px; }
.order-answer-area, .order-available-area { min-width: 0; margin-top: 13px; padding: 14px; border: 1px solid #e5e5dc; border-radius: 12px; background: #fbfbf9; }
.order-area-heading { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.order-answer-area h3, .order-available-area h3 { margin: 0; color: #686b61; font-size: 12px; font-weight: 700; }
.order-reset-button { min-height: 33px; padding: 0 10px; border: 1px solid #dddeda; border-radius: 8px; background: #fff; color: #66695f; cursor: pointer; font-size: 11px; }
.order-reset-button:disabled { color: #a2a49d; cursor: default; }
.order-answer-slots { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin: 12px 0 0; padding: 0; list-style: none; }
.order-answer-slot { min-width: 0; min-height: 58px; display: flex; align-items: stretch; gap: 7px; }
.order-slot-number { width: 23px; flex: 0 0 23px; display: grid; place-items: center; border-radius: 7px; background: #eeeee8; color: #797c72; font-size: 11px; font-weight: 700; }
.order-empty-slot { min-width: 0; flex: 1; display: grid; place-items: center; padding: 6px; border: 1px dashed #d9dbd2; border-radius: 9px; color: #a0a198; font-size: 11px; text-align: center; }
.order-answer-card { position: relative; min-width: 0; flex: 1; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 2px; padding: 7px 9px; border: 1px solid #cfd8c9; border-radius: 9px; background: #f2f6ef; color: #465a3f; cursor: pointer; text-align: left; }
.order-answer-card:disabled { cursor: default; }
.order-card-greek { min-width: 0; overflow-wrap: anywhere; font: 600 clamp(14px, 3.8vw, 17px)/1.35 'Manrope', 'Noto Sans Greek', sans-serif; }
.order-card-value { color: #697464; font-size: 11px; font-weight: 600; }
.order-remove-mark { position: absolute; top: 2px; right: 5px; color: #7f8878; font-size: 16px; line-height: 1; }
.order-available-area { background: rgba(255,255,255,.7); }
.order-helper { margin: 5px 0 0; color: #8b8d83; font-size: 11px; line-height: 1.45; }
.order-available-cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 11px; }
.order-choice-card { min-width: 0; min-height: 57px; padding: 9px 8px; border: 1px solid #e0e2d9; border-radius: 10px; background: #fff; color: #3f433a; cursor: pointer; font: 600 clamp(15px, 4vw, 18px)/1.4 'Manrope', 'Noto Sans Greek', sans-serif; overflow-wrap: anywhere; text-align: center; transition: border-color .16s, background .16s, transform .16s; }
.order-choice-card:hover { border-color: #c4d0ba; background: #f6f8f3; transform: translateY(-1px); }
.order-choice-card.is-selected { border-color: #a9ba9f; background: #edf3e9; color: #465a3f; box-shadow: inset 0 0 0 1px #a9ba9f; }
.order-choice-card:disabled { cursor: default; }
.order-choice-card:disabled:hover { transform: none; }
.order-choice-state { display: block; margin-top: 3px; color: #52654a; font: 600 10px/1.35 'Manrope', sans-serif; }
.order-choice-card:focus-visible, .order-answer-card:focus-visible, .order-reset-button:focus-visible, .order-action-button:focus-visible { outline: 3px solid rgba(105, 130, 91, .38); outline-offset: 2px; }
.order-action-button { min-height: 45px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; margin-top: 14px; padding: 0 17px; border: 1px solid #52654a; border-radius: 9px; background: #52654a; color: #fff; cursor: pointer; font-size: 13px; font-weight: 700; }
.order-action-button:disabled { border-color: #dadbd4; background: #e8e9e3; color: #92938a; cursor: not-allowed; }
.order-action-button:hover:not(:disabled) { border-color: #40533a; background: #40533a; }
.order-feedback { margin-top: 14px; padding: 13px; border: 1px solid #e4e4dc; border-radius: 11px; background: #f8f8f5; }
.order-feedback:focus { outline: 3px solid rgba(105, 130, 91, .38); outline-offset: 3px; }
.order-feedback > strong { display: block; color: #505349; font-size: 14px; }
.order-feedback p { margin: 8px 0 0; color: #686b61; font-size: 12px; line-height: 1.55; }
.order-feedback.is-success { border-color: #ccd8c4; background: #f2f6ee; }
.order-feedback.is-success > strong { color: #52654a; }
.order-feedback.is-error { border-color: #edd3cb; background: #fcf4f1; }
.order-feedback.is-error > strong { color: #9b5142; }
.order-correct-answer { margin-top: 10px; }
.order-feedback-label { color: #696d61; font-size: 11px; font-weight: 700; }
.order-correct-answer ol { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 5px 10px; margin: 6px 0 0; padding-left: 20px; color: #52564d; font-size: 12px; }
.order-correct-answer li { min-width: 0; padding-left: 1px; overflow-wrap: anywhere; }
.order-correct-answer .order-card-value { display: block; }
.order-feedback .order-action-button { width: 100%; }
@media (max-width: 390px) {
  .order-answer-area, .order-available-area { padding: 11px 9px; }
  .order-answer-slots, .order-available-cards { gap: 6px; }
  .order-answer-slot { gap: 5px; min-height: 55px; }
  .order-slot-number { width: 20px; flex-basis: 20px; }
  .order-answer-card { padding: 6px 7px; }
  .order-choice-card { padding: 8px 6px; }
  .order-progress-row { gap: 6px; font-size: 10px; }
  .order-correct-answer ol { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .order-progress-track span, .order-choice-card { transition: none; }
  .order-choice-card:hover { transform: none; }
}
</style>
