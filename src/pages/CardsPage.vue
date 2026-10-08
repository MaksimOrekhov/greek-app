<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import Flashcard from '../components/Flashcard.vue'
import ReviewRatings from '../components/ReviewRatings.vue'
import StudyModeToggle, { type StudyLanguage } from '../components/StudyModeToggle.vue'
import WordExamples from '../components/WordExamples.vue'
import { useSpacedRepetition, type ReviewRating } from '../composables/useSpacedRepetition'
import { PART_OF_SPEECH_LABELS, words, type PartOfSpeech } from '../data/words'

const props = defineProps<{
  readyUserId: string | null
  syncRatedWord: (wordId: string) => Promise<void>
}>()

const currentPosition = shallowRef(0)
const wordIds = words.map((word) => word.greek)
const { getSessionWords, getNextIntervalDays, rateWord, nextDueDate } = useSpacedRepetition()
const partOfSpeechOptions = Object.entries(PART_OF_SPEECH_LABELS) as [PartOfSpeech, string][]
const selectedPartOfSpeech = shallowRef(readPartOfSpeechFilter())
const filteredWordIds = computed(() => words
  .filter((word) => !selectedPartOfSpeech.value.length || word.partOfSpeech.some((type) => selectedPartOfSpeech.value.includes(type)))
  .map((word) => word.greek))
const cardOrder = shallowRef(createShuffledOrder())
const frontLanguage = shallowRef<StudyLanguage>('greek')
const flipped = shallowRef(false)
const ratedPositions = shallowRef(new Set<number>())
const eligibleWordCount = computed(() => getSessionWords(filteredWordIds.value).length)

const currentWordIndex = computed(() => cardOrder.value[currentPosition.value])
const currentWord = computed(() => words[currentWordIndex.value])
const sessionComplete = computed(() => currentPosition.value >= cardOrder.value.length)
const progress = computed(() => `${String(Math.min(currentPosition.value + 1, cardOrder.value.length)).padStart(2, '0')} / ${String(cardOrder.value.length).padStart(2, '0')}`)
const progressPercent = computed(() => cardOrder.value.length
  ? (Math.min(currentPosition.value + 1, cardOrder.value.length) / cardOrder.value.length) * 100
  : 100)
const reviewedWordCount = computed(() => new Set([...ratedPositions.value].map((position) => cardOrder.value[position]).filter((index) => index !== undefined)).size)
const remainingWordCount = computed(() => new Set(cardOrder.value).size - reviewedWordCount.value)
const nextReviewLabel = computed(() => {
  const date = nextDueDate(filteredWordIds.value)
  return date ? new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(date) : null
})

function createShuffledOrder(includeAll = false, avoidFirstIndex?: number, previousOrder: number[] = []) {
  const eligibleIds = getSessionWords(filteredWordIds.value, includeAll)
  const order = eligibleIds.map((id) => wordIds.indexOf(id))
  for (let index = order.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[order[index], order[randomIndex]] = [order[randomIndex], order[index]]
  }

  if (order.length > 1 && order[0] === avoidFirstIndex) {
    ;[order[0], order[1]] = [order[1], order[0]]
  }

  if (order.length > 1 && order.every((wordIndex, index) => wordIndex === previousOrder[index])) {
    ;[order[0], order[1]] = [order[1], order[0]]
  }

  return order
}

function readPartOfSpeechFilter(): PartOfSpeech[] {
  try {
    const stored = localStorage.getItem('greek-app-part-of-speech-filter')
    const parsed: unknown = stored ? JSON.parse(stored) : []
    return Array.isArray(parsed) ? parsed.filter((type): type is PartOfSpeech => type in PART_OF_SPEECH_LABELS) : []
  } catch {
    return []
  }
}

function togglePartOfSpeech(type: PartOfSpeech) {
  selectedPartOfSpeech.value = selectedPartOfSpeech.value.includes(type)
    ? selectedPartOfSpeech.value.filter((selected) => selected !== type)
    : [...selectedPartOfSpeech.value, type]
}

function showAllPartOfSpeech() {
  selectedPartOfSpeech.value = []
}

function shuffleCards() {
  cardOrder.value = createShuffledOrder(true, currentWordIndex.value, cardOrder.value)
  currentPosition.value = 0
  flipped.value = false
  ratedPositions.value = new Set()
}

function nextCard() {
  if (currentPosition.value < cardOrder.value.length - 1) currentPosition.value += 1
  flipped.value = false
}

function previousCard() {
  if (currentPosition.value > 0 && !sessionComplete.value) currentPosition.value -= 1
  flipped.value = false
}

function rateCurrentWord(rating: ReviewRating) {
  if (sessionComplete.value || ratedPositions.value.has(currentPosition.value)) return

  const wordIndex = currentWordIndex.value
  const wordId = wordIds[wordIndex]
  rateWord(wordId, rating)
  void props.syncRatedWord(wordId)
  ratedPositions.value = new Set(ratedPositions.value).add(currentPosition.value)

  currentPosition.value += 1
  flipped.value = false
}

function startDueSession() {
  cardOrder.value = createShuffledOrder(false)
  currentPosition.value = 0
  flipped.value = false
  ratedPositions.value = new Set()
}

watch(frontLanguage, () => {
  flipped.value = false
})

watch(selectedPartOfSpeech, (types) => {
  try {
    localStorage.setItem('greek-app-part-of-speech-filter', JSON.stringify(types))
  } catch {
    // Keep the filter usable when browser storage is unavailable.
  }
  startDueSession()
})

watch(() => props.readyUserId, (userId, previousUserId) => {
  if (userId || previousUserId) startDueSession()
})
</script>

<template>
  <section class="study-area" aria-labelledby="page-title">
    <div class="intro">
      <div class="eyebrow"><span class="eyebrow-line"></span>НЕМНОГО ГРЕЧЕСКОГО КАЖДЫЙ ДЕНЬ</div>
      <h1 id="page-title">Слово за <span>словом.</span></h1>
      <p class="intro-copy">Переворачивайте карточки и повторяйте слова в нужный момент.</p>
    </div>

    <div class="study-panel">
      <div class="study-toolbar">
        <div class="deck-label">
          <span class="deck-icon" aria-hidden="true">✳</span>
          <div><strong>Первые слова</strong><span>Интервальные повторения <span class="label-separator">·</span> {{ filteredWordIds.length }} слов</span></div>
        </div>
        <div class="study-actions">
          <button class="shuffle-button" aria-label="Перемешать карточки" @click="shuffleCards"><span aria-hidden="true">⤨</span> Перемешать</button>
          <StudyModeToggle v-model="frontLanguage" />
        </div>
      </div>

      <fieldset class="part-of-speech-filter">
        <legend>Типы слов</legend>
        <button type="button" class="type-filter-chip" :class="{ 'is-selected': !selectedPartOfSpeech.length }" :aria-pressed="!selectedPartOfSpeech.length" @click="showAllPartOfSpeech">Все</button>
        <button
          v-for="[type, label] in partOfSpeechOptions"
          :key="type"
          type="button"
          class="type-filter-chip"
          :class="{ 'is-selected': selectedPartOfSpeech.includes(type) }"
          :aria-pressed="selectedPartOfSpeech.includes(type)"
          @click="togglePartOfSpeech(type)"
        >{{ label }}</button>
      </fieldset>

      <div v-if="sessionComplete" class="session-complete" aria-live="polite">
        <span class="complete-icon" aria-hidden="true">✦</span>
        <h2>{{ cardOrder.length ? 'На сегодня всё!' : 'Пока нечего повторять' }}</h2>
        <p v-if="cardOrder.length">Оценено слов: {{ reviewedWordCount }}<template v-if="remainingWordCount"> · без оценки: {{ remainingWordCount }}</template></p>
        <p v-else>Новые карточки и слова с подошедшим сроком повтора появятся здесь.</p>
        <p v-if="nextReviewLabel" class="next-review-note">Ближайший повтор: {{ nextReviewLabel }}</p>
        <div class="completion-actions">
          <button v-if="remainingWordCount" class="primary-action" @click="startDueSession">Вернуться к словам без оценки</button>
          <button v-else-if="eligibleWordCount" class="primary-action" @click="startDueSession">Повторить слова по расписанию ({{ eligibleWordCount }})</button>
          <button class="secondary-action" @click="shuffleCards">Повторить все слова сейчас</button>
        </div>
      </div>

      <Flashcard
        v-else
        :key="currentWordIndex"
        :word="currentWord"
        :front-language="frontLanguage"
        :flipped="flipped"
        @flip="flipped = !flipped"
      />

      <div v-if="!sessionComplete" class="card-navigation">
        <button class="nav-button nav-previous" aria-label="Предыдущее слово" :disabled="currentPosition === 0" @click="previousCard">
          <span aria-hidden="true">←</span><span>Назад</span>
        </button>
        <div class="progress-area" aria-live="polite">
          <div class="progress-count">{{ progress }}</div>
          <div class="progress-track"><span :style="{ width: `${progressPercent}%` }"></span></div>
        </div>
        <button class="nav-button nav-next" aria-label="Пропустить слово" @click="nextCard" :disabled="currentPosition >= cardOrder.length - 1">
          <span>Пропустить</span><span aria-hidden="true">→</span>
        </button>
      </div>
      <ReviewRatings
        v-if="flipped && !sessionComplete && !ratedPositions.has(currentPosition)"
        :word-id="currentWord.greek"
        :get-next-interval-days="getNextIntervalDays"
        @rate="rateCurrentWord"
      />
    </div>

    <WordExamples v-if="!sessionComplete"
      :examples="currentWord.examples"
      :front-language="frontLanguage"
      :revealed="flipped"
    />
    <div v-if="!sessionComplete" class="study-tip"><span class="tip-icon">✦</span><span>Попробуйте вспомнить значение до того, как перевернёте карточку</span></div>
  </section>
</template>
