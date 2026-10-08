<script setup lang="ts">
import { computed } from 'vue'
import type { WordCard } from '../data/words'
import { useGreekSpeech } from '../composables/useGreekSpeech'
import type { StudyLanguage } from './StudyModeToggle.vue'

const props = defineProps<{
  word: WordCard
  frontLanguage: StudyLanguage
  flipped: boolean
}>()

const emit = defineEmits<{ flip: [] }>()
const { isSpeechSupported, speechMessage, speakGreek } = useGreekSpeech()

const frontWord = computed(() => props.frontLanguage === 'greek' ? props.word.greek : props.word.russian)
const backWord = computed(() => props.frontLanguage === 'greek' ? props.word.russian : props.word.greek)
const frontLanguageName = computed(() => props.frontLanguage === 'greek' ? 'Греческий' : 'Русский')
const backLanguageName = computed(() => props.frontLanguage === 'greek' ? 'Русский' : 'Греческий')
</script>

<template>
  <div
    class="flashcard"
    :class="{ 'is-flipped': flipped }"
    :aria-label="flipped ? `${backWord}. Нажмите, чтобы вернуться к ${frontWord}` : `${frontWord}. Нажмите, чтобы увидеть перевод`"
    aria-keyshortcuts="Enter Space"
    role="group"
    tabindex="0"
    @click="emit('flip')"
    @keydown.enter="emit('flip')"
    @keydown.space.prevent="emit('flip')"
  >
    <span class="card-face card-front">
      <span class="card-topline">
        <span class="category-pill"><span class="category-dot"></span>{{ word.category }}</span>
        <span class="face-label">{{ frontLanguageName }}</span>
      </span>
      <span class="card-center">
        <span class="word-text" :class="{ 'is-greek': frontLanguage === 'greek' }">{{ frontWord }}</span>
        <span v-if="frontLanguage === 'greek'" class="pronunciation">
          <button v-if="isSpeechSupported" type="button" class="speech-button" :aria-label="`Прослушать: ${word.greek}`" title="Прослушать по-гречески" @click.stop="speakGreek(word.greek)" @keydown.stop>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>
          </button>
          примерно: {{ word.transliteration }}
        </span>
        <span v-if="speechMessage" class="speech-message" role="status">{{ speechMessage }}</span>
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
          <button v-if="isSpeechSupported" type="button" class="speech-button" :aria-label="`Прослушать: ${word.greek}`" title="Прослушать по-гречески" @click.stop="speakGreek(word.greek)" @keydown.stop>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>
          </button>
          примерно: {{ word.transliteration }}
        </span>
        <span v-if="speechMessage" class="speech-message" role="status">{{ speechMessage }}</span>
        <span v-else class="meaning-note">Перевод на русский</span>
      </span>
      <span class="card-hint"><span class="flip-icon" aria-hidden="true">↻</span>Нажмите, чтобы вернуться</span>
    </span>
  </div>
</template>
