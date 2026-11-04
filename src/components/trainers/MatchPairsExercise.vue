<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'
import type { TrainerPair } from '../../data/trainers/types.ts'

const props = defineProps<{
  pairs: TrainerPair[]
  leftOrder: string[]
  rightOrder: string[]
  matchedPairIds: string[]
  roundKey: string
}>()

const emit = defineEmits<{
  attempt: [leftPairId: string, rightPairId: string]
}>()

type Side = 'left' | 'right'
type PointPair = { left: { x: number; y: number }; right: { x: number; y: number } }

const board = useTemplateRef<HTMLDivElement>('board')
const leftButtons = new Map<string, HTMLButtonElement>()
const rightButtons = new Map<string, HTMLButtonElement>()
const selectedLeftId = shallowRef<string | null>(null)
const selectedRightId = shallowRef<string | null>(null)
const errorLeftId = shallowRef<string | null>(null)
const errorRightId = shallowRef<string | null>(null)
const liveMessage = shallowRef('Нажмите кнопку слева, затем подходящую кнопку справа.')
const svgSize = shallowRef({ width: 0, height: 0 })
const connectionPoints = shallowRef<Record<string, PointPair>>({})
let resizeObserver: ResizeObserver | undefined
let errorTimer: number | undefined

const pairsById = computed(() => new Map(props.pairs.map((pair) => [pair.id, pair])))
const connections = computed(() => props.matchedPairIds
  .map((pairId) => ({ pairId, points: connectionPoints.value[pairId] }))
  .filter((connection): connection is { pairId: string; points: PointPair } => Boolean(connection.points)))

function orderedPairs(ids: string[]): TrainerPair[] {
  return ids.map((id) => pairsById.value.get(id)).filter((pair): pair is TrainerPair => Boolean(pair))
}

function setButtonElement(side: Side, id: string, element: unknown): void {
  const buttons = side === 'left' ? leftButtons : rightButtons
  if (typeof HTMLElement !== 'undefined' && element instanceof HTMLElement) buttons.set(id, element as HTMLButtonElement)
  else buttons.delete(id)
}

function clearErrorTimer(): void {
  if (errorTimer !== undefined) window.clearTimeout(errorTimer)
  errorTimer = undefined
}

function attemptMatch(leftPairId: string, rightPairId: string): void {
  selectedLeftId.value = null
  selectedRightId.value = null
  clearErrorTimer()

  if (leftPairId === rightPairId) {
    const pair = pairsById.value.get(leftPairId)
    liveMessage.value = pair ? `Верно: ${pair.prompt} — ${pair.answer}.` : 'Пара найдена.'
    errorLeftId.value = null
    errorRightId.value = null
  } else {
    errorLeftId.value = leftPairId
    errorRightId.value = rightPairId
    liveMessage.value = 'Эти элементы не образуют пару. Попробуйте ещё раз.'
    errorTimer = window.setTimeout(() => {
      errorLeftId.value = null
      errorRightId.value = null
      errorTimer = undefined
    }, 800)
  }

  emit('attempt', leftPairId, rightPairId)
}

function choose(side: Side, pairId: string): void {
  if (props.matchedPairIds.includes(pairId)) return
  errorLeftId.value = null
  errorRightId.value = null

  if (side === 'left') {
    selectedLeftId.value = pairId
    if (selectedRightId.value) attemptMatch(pairId, selectedRightId.value)
    return
  }

  selectedRightId.value = pairId
  if (selectedLeftId.value) attemptMatch(selectedLeftId.value, pairId)
}

function measureConnections(): void {
  const element = board.value
  if (!element) return

  const bounds = element.getBoundingClientRect()
  const width = Math.round(bounds.width)
  const height = Math.round(bounds.height)
  if (!width || !height) return
  if (svgSize.value.width !== width || svgSize.value.height !== height) svgSize.value = { width, height }

  const nextPoints: Record<string, PointPair> = {}
  for (const pairId of props.matchedPairIds) {
    const left = leftButtons.get(pairId)?.getBoundingClientRect()
    const right = rightButtons.get(pairId)?.getBoundingClientRect()
    if (!left || !right) continue
    nextPoints[pairId] = {
      left: { x: left.right - bounds.left, y: (left.top + left.bottom) / 2 - bounds.top },
      right: { x: right.left - bounds.left, y: (right.top + right.bottom) / 2 - bounds.top },
    }
  }
  connectionPoints.value = nextPoints
}

async function refreshConnections(): Promise<void> {
  await nextTick()
  measureConnections()
}

watch(
  () => `${props.roundKey}:${props.matchedPairIds.join(',')}`,
  refreshConnections,
  { flush: 'post' },
)

onMounted(() => {
  void refreshConnections()
  if (board.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => measureConnections())
    resizeObserver.observe(board.value)
  }
  window.addEventListener('resize', measureConnections)
  document.fonts?.ready.then(() => measureConnections())
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', measureConnections)
  clearErrorTimer()
})
</script>

<template>
  <div class="match-exercise">
    <p class="match-instructions" id="match-instructions">
      Выберите элемент в левой колонке, затем соответствующий ему в правой.
    </p>

    <div ref="board" class="match-board">
      <svg
        class="match-overlay"
        :viewBox="`0 0 ${svgSize.width} ${svgSize.height}`"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <line
          v-for="connection in connections"
          :key="connection.pairId"
          class="match-connector"
          :x1="connection.points.left.x"
          :y1="connection.points.left.y"
          :x2="connection.points.right.x"
          :y2="connection.points.right.y"
        />
      </svg>

      <div class="match-column" role="group" aria-label="Подсказки">
        <h3 class="match-column-title">Подсказка</h3>
        <div class="match-options">
          <button
            v-for="pair in orderedPairs(leftOrder)"
            :key="`left-${pair.id}`"
            :ref="(element) => setButtonElement('left', pair.id, element)"
            class="match-option"
            :class="{
              'is-selected': selectedLeftId === pair.id,
              'is-matched': matchedPairIds.includes(pair.id),
              'is-error': errorLeftId === pair.id,
            }"
            type="button"
            :disabled="matchedPairIds.includes(pair.id)"
            :aria-pressed="selectedLeftId === pair.id"
            :aria-label="`${pair.prompt}${matchedPairIds.includes(pair.id) ? ', пара найдена' : selectedLeftId === pair.id ? ', выбран' : ''}`"
            aria-describedby="match-instructions"
            @click="choose('left', pair.id)"
          >
            <span class="match-option-label">{{ pair.prompt }}</span>
          </button>
        </div>
      </div>

      <div class="match-column" role="group" aria-label="Ответы на греческом">
        <h3 class="match-column-title">Ответ</h3>
        <div class="match-options">
          <button
            v-for="pair in orderedPairs(rightOrder)"
            :key="`right-${pair.id}`"
            :ref="(element) => setButtonElement('right', pair.id, element)"
            class="match-option match-option-greek"
            :class="{
              'is-selected': selectedRightId === pair.id,
              'is-matched': matchedPairIds.includes(pair.id),
              'is-error': errorRightId === pair.id,
            }"
            type="button"
            :disabled="matchedPairIds.includes(pair.id)"
            :aria-pressed="selectedRightId === pair.id"
            :aria-label="`${pair.answer}${matchedPairIds.includes(pair.id) ? ', пара найдена' : selectedRightId === pair.id ? ', выбран' : ''}`"
            aria-describedby="match-instructions"
            @click="choose('right', pair.id)"
          >
            <span class="match-option-label">{{ pair.answer }}</span>
          </button>
        </div>
      </div>
    </div>

    <p class="match-live-message" role="status" aria-live="polite">{{ liveMessage }}</p>
  </div>
</template>

<style scoped>
.match-exercise { min-width: 0; }
.match-instructions { margin: 0 0 12px; color: #777a70; font-size: 12px; line-height: 1.55; text-align: center; }
.match-board { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: clamp(12px, 5vw, 62px); position: relative; isolation: isolate; }
.match-overlay { position: absolute; z-index: -1; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.match-connector { stroke: #849879; stroke-width: 2.5; stroke-linecap: round; vector-effect: non-scaling-stroke; opacity: .8; }
.match-column { min-width: 0; }
.match-column-title { margin: 0 0 8px; color: #999a91; font-size: 10px; font-weight: 700; letter-spacing: .9px; text-align: center; text-transform: uppercase; }
.match-options { display: grid; gap: 8px; }
.match-option { min-width: 0; min-height: 49px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; position: relative; padding: 8px 29px; border: 1px solid #e4e5dd; border-radius: 11px; background: rgba(255, 255, 255, .97); box-shadow: 0 2px 5px rgba(50, 53, 43, .025); color: #4a4e43; cursor: pointer; font-size: 13px; line-height: 1.4; text-align: center; overflow-wrap: anywhere; transition: border-color .15s, background .15s, box-shadow .15s, transform .15s; }
.match-option:hover:not(:disabled) { border-color: #bdc8b4; background: #fbfcf9; }
.match-option.is-error:hover:not(:disabled) { border-color: #c77d6b; background: #fbefec; color: #85483b; }
.match-option.is-selected { border-color: #718665; background: #edf1e9; box-shadow: 0 0 0 2px rgba(113, 134, 101, .16); color: #40533a; }
.match-option.is-matched { border-color: #c7d2bf; background: #eef2ea; color: #44543e; cursor: default; box-shadow: none; }
.match-option.is-matched::after { content: '✓'; position: absolute; top: 50%; right: 8px; width: 16px; height: 16px; display: grid; place-items: center; transform: translateY(-50%); border: 1px solid #b9c8af; border-radius: 50%; background: #e3ebdd; color: #43583b; font: 700 10px/1 'DM Sans', sans-serif; }
.match-option.is-error { border-color: #c77d6b; background: #fbefec; color: #85483b; animation: match-shake .22s ease-in-out; }
.match-option:disabled { opacity: 1; }
.match-option-greek { font-family: 'Noto Sans Greek', 'DM Sans', sans-serif; font-size: 16px; }
.match-live-message { min-height: 20px; margin: 12px 0 0; color: #7c806f; font-size: 11px; line-height: 1.5; text-align: center; }
@keyframes match-shake { 25% { transform: translateX(-2px); } 75% { transform: translateX(2px); } }
@media (max-width: 460px) {
  .match-board { gap: 9px; }
  .match-options { gap: 7px; }
  .match-option { min-height: 46px; padding: 7px 24px; font-size: 12px; }
  .match-option-greek { font-size: 14px; }
}
@media (prefers-reduced-motion: reduce) {
  .match-option { transition: none; }
  .match-option.is-error { animation: none; }
}
</style>
