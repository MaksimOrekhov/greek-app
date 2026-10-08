<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import AccountPanel from './components/AccountPanel.vue'
import Flashcard from './components/Flashcard.vue'
import ReadingGuide from './components/ReadingGuide.vue'
import ReviewRatings from './components/ReviewRatings.vue'
import StudyModeToggle, { type StudyLanguage } from './components/StudyModeToggle.vue'
import WordExamples from './components/WordExamples.vue'
import { useCloudProgressSync } from './composables/useCloudProgressSync'
import { useSpacedRepetition, type ReviewRating } from './composables/useSpacedRepetition'
import { words } from './data/words'

const currentPosition = shallowRef(0)
const wordIds = words.map((word) => word.greek)
const { getSessionWords, getNextIntervalDays, rateWord, nextDueDate } = useSpacedRepetition()
const {
  configured: cloudConfigured,
  user: cloudUser,
  readyUserId: cloudReadyUserId,
  status: cloudStatus,
  errorMessage: cloudMessage,
  sendSignInLink,
  signOut,
  syncRatedWord,
} = useCloudProgressSync()
const accountEmail = computed(() => cloudUser.value?.email ?? null)
const cardOrder = shallowRef(createShuffledOrder())
const frontLanguage = shallowRef<StudyLanguage>('greek')
const flipped = shallowRef(false)
const section = shallowRef<'cards' | 'reading'>('cards')
const ratedPositions = shallowRef(new Set<number>())
const eligibleWordCount = computed(() => getSessionWords(wordIds).length)

const currentWordIndex = computed(() => cardOrder.value[currentPosition.value])
const currentWord = computed(() => words[currentWordIndex.value])
const sessionComplete = computed(() => currentPosition.value >= cardOrder.value.length)
const progress = computed(() => `${String(Math.min(currentPosition.value + 1, cardOrder.value.length)).padStart(2, '0')} / ${String(cardOrder.value.length).padStart(2, '0')}`)
const progressPercent = computed(() => cardOrder.value.length ? (currentPosition.value / cardOrder.value.length) * 100 : 100)
const reviewedWordCount = computed(() => new Set([...ratedPositions.value].map((position) => cardOrder.value[position]).filter((index) => index !== undefined)).size)
const remainingWordCount = computed(() => new Set(cardOrder.value).size - reviewedWordCount.value)
const nextReviewLabel = computed(() => {
  const date = nextDueDate()
  return date ? new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(date) : null
})

function createShuffledOrder(includeAll = false, avoidFirstIndex?: number, previousOrder: number[] = []) {
  const eligibleIds = getSessionWords(wordIds, includeAll)
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
  void syncRatedWord(wordId)
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

watch(cloudReadyUserId, (userId, previousUserId) => {
  if (userId || previousUserId) startDueSession()
})
</script>

<template>
  <main class="page-shell">
    <header class="topbar">
      <a class="brand" href="#" aria-label="Λέξη — на главную">
        <span class="brand-mark">λ</span>
        <span class="brand-name">λέξη<span class="brand-period">.</span></span>
      </a>
      <div class="topbar-note"><span class="status-dot"></span>Ваш первый шаг в греческий</div>
      <div class="topbar-actions">
        <div class="topbar-level"><span class="level-spark">✳</span> С нуля</div>
        <AccountPanel
          :configured="cloudConfigured"
          :user-email="accountEmail"
          :status="cloudStatus"
          :message="cloudMessage"
          @send-link="sendSignInLink"
          @sign-out="signOut"
        />
      </div>
    </header>

    <section class="study-area" :class="{ 'is-reading': section === 'reading' }" aria-labelledby="page-title">
      <div class="intro">
        <div class="eyebrow"><span class="eyebrow-line"></span>{{ section === 'cards' ? 'НЕМНОГО ГРЕЧЕСКОГО КАЖДЫЙ ДЕНЬ' : 'ПРОИЗНОШЕНИЕ СОВРЕМЕННОГО ГРЕЧЕСКОГО' }}</div>
        <h1 v-if="section === 'cards'" id="page-title">Слово за <span>словом.</span></h1>
        <h1 v-else id="page-title">Читаем <span>по-гречески.</span></h1>
        <p class="intro-copy">{{ section === 'cards' ? 'Переворачивайте карточки и повторяйте слова в нужный момент.' : 'Сочетания букв и их примерное чтение по-русски.' }}</p>
      </div>

      <nav class="section-tabs" aria-label="Раздел приложения">
        <button :class="{ 'is-active': section === 'cards' }" :aria-current="section === 'cards' ? 'page' : undefined" @click="section = 'cards'"><span aria-hidden="true">▤</span> Карточки</button>
        <button :class="{ 'is-active': section === 'reading' }" :aria-current="section === 'reading' ? 'page' : undefined" @click="section = 'reading'"><span aria-hidden="true">Αβ</span> Как читать</button>
      </nav>

      <template v-if="section === 'cards'">
      <div class="study-panel">
        <div class="study-toolbar">
          <div class="deck-label">
            <span class="deck-icon" aria-hidden="true">✳</span>
            <div><strong>Первые слова</strong><span>Интервальные повторения <span class="label-separator">·</span> {{ words.length }} слов</span></div>
          </div>
          <div class="study-actions">
            <button class="shuffle-button" aria-label="Перемешать карточки" @click="shuffleCards"><span aria-hidden="true">⤨</span> Перемешать</button>
            <StudyModeToggle v-model="frontLanguage" />
          </div>
        </div>

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
      </template>

      <ReadingGuide v-else />
    </section>

    <footer class="page-footer">
      <span>Μικρά βήματα, μεγάλη πρόοδος</span>
      <span class="footer-divider"></span>
      <span>Маленькие шаги — большой прогресс</span>
    </footer>
    <span class="decor decor-left" aria-hidden="true">α</span>
    <span class="decor decor-right" aria-hidden="true">ω</span>
  </main>
</template>
