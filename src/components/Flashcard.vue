<script setup lang="ts">
import { computed } from 'vue'
import type { WordCard } from '../data/words'
import type { StudyLanguage } from './StudyModeToggle.vue'

const props = defineProps<{
  word: WordCard
  frontLanguage: StudyLanguage
  flipped: boolean
}>()

defineEmits<{ flip: [] }>()

const frontWord = computed(() => props.frontLanguage === 'greek' ? props.word.greek : props.word.russian)
const backWord = computed(() => props.frontLanguage === 'greek' ? props.word.russian : props.word.greek)
const frontLanguageName = computed(() => props.frontLanguage === 'greek' ? 'Греческий' : 'Русский')
const backLanguageName = computed(() => props.frontLanguage === 'greek' ? 'Русский' : 'Греческий')
</script>

<template>
  <button
    class="flashcard"
    :class="{ 'is-flipped': flipped }"
    :aria-label="flipped ? `${backWord}. Нажмите, чтобы вернуться к ${frontWord}` : `${frontWord}. Нажмите, чтобы увидеть перевод`"
    :aria-pressed="flipped"
    @click="$emit('flip')"
  >
    <span class="card-face card-front">
      <span class="card-topline">
        <span class="category-pill"><span class="category-dot"></span>{{ word.category }}</span>
        <span class="face-label">{{ frontLanguageName }}</span>
      </span>
      <span class="card-center">
        <span class="word-text" :class="{ 'is-greek': frontLanguage === 'greek' }">{{ frontWord }}</span>
        <span class="pronunciation">
          <span class="sound-icon" aria-hidden="true">♫</span>
          {{ frontLanguage === 'greek' ? `примерно: ${word.transliteration}` : `${word.greek} · ${word.transliteration}` }}
        </span>
      </span>
      <span class="card-hint"><span class="flip-icon" aria-hidden="true">↻</span>Нажмите, чтобы перевернуть</span>
    </span>
    <span class="card-face card-back">
      <span class="card-topline">
        <span class="category-pill"><span class="category-dot"></span>{{ word.category }}</span>
        <span class="face-label">{{ backLanguageName }}</span>
      </span>
      <span class="card-center">
        <span class="word-text" :class="{ 'is-greek': frontLanguage === 'russian' }">{{ backWord }}</span>
        <span v-if="frontLanguage === 'russian'" class="pronunciation">
          <span class="sound-icon" aria-hidden="true">♫</span>примерно: {{ word.transliteration }}
        </span>
        <span v-else class="meaning-note">Перевод на русский</span>
      </span>
      <span class="card-hint"><span class="flip-icon" aria-hidden="true">↻</span>Нажмите, чтобы вернуться</span>
    </span>
  </button>
</template>
