<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import Flashcard from '../components/Flashcard.vue'
import ReviewRatings from '../components/ReviewRatings.vue'
import StudyModeToggle, { type StudyLanguage } from '../components/StudyModeToggle.vue'
import WordExamples from '../components/WordExamples.vue'
import { nextPosition, sessionProgress } from '../lib/studySession'
import { NEW_WORDS_PER_DAY, useSpacedRepetition, type ReviewRating, type StudyMode } from '../composables/useSpacedRepetition'
import { PART_OF_SPEECH_LABELS, words, type PartOfSpeech } from '../data/words'

const props = defineProps<{
  readyUserId: string | null
  syncRatedWord: (wordId: string) => Promise<void>
  syncIntroducedWord: (wordId: string) => Promise<void>
}>()

const currentPosition = shallowRef(0)
const wordIds = words.map((word) => word.greek)
const { getSessionWords, getAvailableNewWordCount, getNewWordCount, getNextIntervalDays, rateWord, nextDueDate, introductions, markWordIntroduced } = useSpacedRepetition()
const partOfSpeechOptions = Object.entries(PART_OF_SPEECH_LABELS) as [PartOfSpeech, string][]
const selectedPartOfSpeech = shallowRef(readPartOfSpeechFilter())
const studyMode = shallowRef<StudyMode>('today')
const filteredWordIds = computed(() => words
  .filter((word) => !selectedPartOfSpeech.value.length || word.partOfSpeech.some((type) => selectedPartOfSpeech.value.includes(type)))
  .map((word) => word.greek))
const dueWordCount = computed(() => getSessionWords(filteredWordIds.value, 'review').length)
const availableNewWordCount = computed(() => getAvailableNewWordCount(filteredWordIds.value))
const unintroducedWordCount = computed(() => getNewWordCount(filteredWordIds.value))
const todayWordCount = computed(() => getSessionWords(filteredWordIds.value, 'today').length)
const cardOrder = shallowRef(createShuffledOrder('today'))
const frontLanguage = shallowRef<StudyLanguage>('greek')
const flipped = shallowRef(false)
const ratedPositions = shallowRef(new Set<number>())
const emptySessionMessage = computed(() => {
  if (studyMode.value === 'review') return 'Пока нет слов, которым пора повториться.'
  if (studyMode.value === 'new') {
    return unintroducedWordCount.value
      ? `Дневной лимит — ${NEW_WORDS_PER_DAY} новых слов. Остальные можно изучить завтра.`
      : 'Новых слов в выбранном наборе больше нет.'
  }
  if (todayWordCount.value === 0 && unintroducedWordCount.value > 0) {
    return 'План на сегодня выполнен. Новые слова появятся завтра, а повторения — по расписанию.'
  }
  return 'Слова для сегодняшней сессии закончились.'
})

const currentWordIndex = computed(() => cardOrder.value[currentPosition.value])
const currentWord = computed(() => words[currentWordIndex.value])
const sessionComplete = computed(() => currentPosition.value >= cardOrder.value.length)
const sessionMetrics = computed(() => sessionProgress(reviewedWordCount.value, cardOrder.value.length))
const progress = computed(() => `${String(sessionMetrics.value.completed).padStart(2, '0')} / ${String(sessionMetrics.value.total).padStart(2, '0')}`)
const progressPercent = computed(() => sessionMetrics.value.percent)
const reviewedWordCount = computed(() => new Set([...ratedPositions.value].map((position) => cardOrder.value[position]).filter((index) => index !== undefined)).size)
const remainingWordCount = computed(() => new Set(cardOrder.value).size - reviewedWordCount.value)
const nextReviewLabel = computed(() => {
  const date = nextDueDate(filteredWordIds.value)
  return date ? new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(date) : null
})

function createShuffledOrder(mode: StudyMode = studyMode.value, avoidFirstIndex?: number, previousOrder: number[] = []) {
  const dueIds = mode === 'today' ? getSessionWords(filteredWordIds.value, 'review') : []
  const newIds = mode === 'today' ? getSessionWords(filteredWordIds.value, 'new') : []
  const eligibleIds = mode === 'today' ? [...dueIds, ...newIds] : getSessionWords(filteredWordIds.value, mode)
  const order = eligibleIds.map((id) => wordIds.indexOf(id))
  const dueCount = dueIds.length
  const ranges = mode === 'today' ? [[0, dueCount], [dueCount, order.length]] : [[0, order.length]]

  for (const [start, end] of ranges) {
    for (let index = end - 1; index > start; index -= 1) {
      const randomIndex = start + Math.floor(Math.random() * (index - start + 1))
      ;[order[index], order[randomIndex]] = [order[randomIndex], order[index]]
    }

    const rangeLength = end - start
    const sameAsPrevious = rangeLength > 1
      && order.slice(start, end).every((wordIndex, offset) => wordIndex === previousOrder[start + offset])
    if (sameAsPrevious) [order[start], order[start + 1]] = [order[start + 1], order[start]]
  }

  const firstRangeEnd = ranges[0][1]
  if (firstRangeEnd > 1 && order[0] === avoidFirstIndex) {
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
  cardOrder.value = createShuffledOrder(studyMode.value, currentWordIndex.value, cardOrder.value)
  currentPosition.value = 0
  flipped.value = false
  ratedPositions.value = new Set()
}

function startSession(mode: StudyMode) {
  studyMode.value = mode
  cardOrder.value = createShuffledOrder(mode)
  currentPosition.value = 0
  flipped.value = false
  ratedPositions.value = new Set()
}

function resumeUnratedCards() {
  cardOrder.value = cardOrder.value.filter((_wordIndex, position) => !ratedPositions.value.has(position))
  currentPosition.value = 0
  flipped.value = false
  ratedPositions.value = new Set()
}

function nextCard() {
  currentPosition.value = nextPosition(currentPosition.value, cardOrder.value.length)
  flipped.value = false
}

function flipCurrentCard() {
  flipped.value = !flipped.value
  if (flipped.value && currentWord.value) {
    const wordId = currentWord.value.greek
    const wasIntroduced = introductions.value[wordId] !== undefined
    markWordIntroduced(wordId)
    if (!wasIntroduced) void props.syncIntroducedWord(wordId)
  }
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

watch(frontLanguage, () => {
  flipped.value = false
})

watch(selectedPartOfSpeech, (types) => {
  try {
    localStorage.setItem('greek-app-part-of-speech-filter', JSON.stringify(types))
  } catch {
    // Keep the filter usable when browser storage is unavailable.
  }
  startSession(studyMode.value)
})

watch(() => props.readyUserId, (userId, previousUserId) => {
  if (userId || previousUserId) startSession(studyMode.value)
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

      <div class="study-mode-tabs" role="group" aria-label="Режим занятий">
        <button type="button" :aria-pressed="studyMode === 'today'" :class="{ 'is-active': studyMode === 'today' }" @click="startSession('today')">План на сегодня <span>{{ todayWordCount }}</span></button>
        <button type="button" :aria-pressed="studyMode === 'review'" :class="{ 'is-active': studyMode === 'review' }" @click="startSession('review')">Повторить <span>{{ dueWordCount }}</span></button>
        <button type="button" :aria-pressed="studyMode === 'new'" :class="{ 'is-active': studyMode === 'new' }" @click="startSession('new')">Новые слова <span>{{ availableNewWordCount }}</span></button>
      </div>
      <p class="study-mode-hint">В плане сначала идут слова к повторению, затем — до {{ NEW_WORDS_PER_DAY }} новых слов в день.</p>

      <div v-if="sessionComplete" class="session-complete" aria-live="polite">
        <span class="complete-icon" aria-hidden="true">✦</span>
        <h2>{{ cardOrder.length ? 'Сессия завершена' : 'Пока нечего учить' }}</h2>
        <p v-if="cardOrder.length">Оценено слов: {{ reviewedWordCount }}<template v-if="remainingWordCount"> · без оценки: {{ remainingWordCount }}</template></p>
        <p v-else>{{ emptySessionMessage }}</p>
        <p v-if="nextReviewLabel" class="next-review-note">Ближайший повтор: {{ nextReviewLabel }}</p>
        <div class="completion-actions">
          <button v-if="remainingWordCount" class="primary-action" @click="resumeUnratedCards">Вернуться к словам без оценки</button>
        </div>
      </div>

      <Flashcard
        v-else
        :key="currentWordIndex"
        :word="currentWord"
        :front-language="frontLanguage"
        :flipped="flipped"
        @flip="flipCurrentCard"
      />

      <div v-if="!sessionComplete" class="card-navigation">
        <button class="nav-button nav-previous" aria-label="Предыдущее слово" :disabled="currentPosition === 0" @click="previousCard">
          <span aria-hidden="true">←</span><span>Назад</span>
        </button>
        <div class="progress-area" aria-live="polite">
          <div class="progress-count">{{ progress }}</div>
          <div class="progress-track"><span :style="{ width: `${progressPercent}%` }"></span></div>
        </div>
        <button class="nav-button nav-next" aria-label="Дальше" @click="nextCard">
          <span>Дальше</span><span aria-hidden="true">→</span>
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
