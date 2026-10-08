<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import Flashcard from './components/Flashcard.vue'
import ReadingGuide from './components/ReadingGuide.vue'
import StudyModeToggle, { type StudyLanguage } from './components/StudyModeToggle.vue'
import WordExamples from './components/WordExamples.vue'
import { words } from './data/words'

const currentPosition = shallowRef(0)
const cardOrder = shallowRef(createShuffledOrder())
const frontLanguage = shallowRef<StudyLanguage>('greek')
const flipped = shallowRef(false)
const section = shallowRef<'cards' | 'reading'>('cards')

const currentWordIndex = computed(() => cardOrder.value[currentPosition.value])
const currentWord = computed(() => words[currentWordIndex.value])
const progress = computed(() => `${String(currentPosition.value + 1).padStart(2, '0')} / ${String(words.length).padStart(2, '0')}`)
const progressPercent = computed(() => ((currentPosition.value + 1) / words.length) * 100)

function createShuffledOrder(avoidFirstIndex?: number, previousOrder: number[] = []) {
  const order = words.map((_, index) => index)
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
  cardOrder.value = createShuffledOrder(currentWordIndex.value, cardOrder.value)
  currentPosition.value = 0
  flipped.value = false
}

function nextCard() {
  if (currentPosition.value === words.length - 1) {
    const lastWordIndex = cardOrder.value[currentPosition.value]
    cardOrder.value = createShuffledOrder(lastWordIndex, cardOrder.value)
    currentPosition.value = 0
  } else {
    currentPosition.value += 1
  }
  flipped.value = false
}

function previousCard() {
  currentPosition.value = (currentPosition.value + words.length - 1) % words.length
  flipped.value = false
}

watch(frontLanguage, () => {
  flipped.value = false
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
      <div class="topbar-level"><span class="level-spark">✳</span> С нуля</div>
    </header>

    <section class="study-area" :class="{ 'is-reading': section === 'reading' }" aria-labelledby="page-title">
      <div class="intro">
        <div class="eyebrow"><span class="eyebrow-line"></span>{{ section === 'cards' ? 'НЕМНОГО ГРЕЧЕСКОГО КАЖДЫЙ ДЕНЬ' : 'ПРОИЗНОШЕНИЕ СОВРЕМЕННОГО ГРЕЧЕСКОГО' }}</div>
        <h1 v-if="section === 'cards'" id="page-title">Слово за <span>словом.</span></h1>
        <h1 v-else id="page-title">Читаем <span>по-гречески.</span></h1>
        <p class="intro-copy">{{ section === 'cards' ? 'Переворачивайте карточки и запоминайте в своём ритме.' : 'Сочетания букв и их примерное чтение по-русски.' }}</p>
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
            <div><strong>Первые слова</strong><span>Базовый набор <span class="label-separator">·</span> {{ words.length }} слов</span></div>
          </div>
          <div class="study-actions">
            <button class="shuffle-button" aria-label="Перемешать карточки" @click="shuffleCards"><span aria-hidden="true">⤨</span> Перемешать</button>
            <StudyModeToggle v-model="frontLanguage" />
          </div>
        </div>

        <Flashcard
          :key="currentWordIndex"
          :word="currentWord"
          :front-language="frontLanguage"
          :flipped="flipped"
          @flip="flipped = !flipped"
        />

        <div class="card-navigation">
          <button class="nav-button nav-previous" aria-label="Предыдущее слово" @click="previousCard">
            <span aria-hidden="true">←</span><span>Назад</span>
          </button>
          <div class="progress-area" aria-live="polite">
            <div class="progress-count">{{ progress }}</div>
            <div class="progress-track"><span :style="{ width: `${progressPercent}%` }"></span></div>
          </div>
          <button class="nav-button nav-next" aria-label="Следующее слово" @click="nextCard">
            <span>Дальше</span><span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <WordExamples :examples="currentWord.examples" :show-translation="flipped" />

      <div class="study-tip"><span class="tip-icon">✦</span><span>Попробуйте вспомнить значение до того, как перевернёте карточку</span></div>
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
