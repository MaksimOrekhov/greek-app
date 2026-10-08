<script setup lang="ts">
import VocabularyDictionary from '../components/VocabularyDictionary.vue'
import { useSpacedRepetition } from '../composables/useSpacedRepetition'
import { words } from '../data/words'

const { getWordLearningStatus } = useSpacedRepetition()
</script>

<template>
  <section class="study-area is-dictionary" aria-labelledby="page-title">
    <div class="intro">
      <div class="eyebrow"><span class="eyebrow-line"></span>ВАШ СЛОВАРНЫЙ ЗАПАС</div>
      <h1 id="page-title">Словарь <span>слов.</span></h1>
      <p class="intro-copy">Все слова, транскрипции и переводы в одном месте.</p>
    </div>
    <VocabularyDictionary :words="words" :get-word-learning-status="getWordLearningStatus" />
  </section>
</template>
