<script setup lang="ts">
import type { WordExample } from '../data/words'
import { useGreekSpeech } from '../composables/useGreekSpeech'

defineProps<{
  examples: WordExample[]
  frontLanguage: 'greek' | 'russian'
  revealed: boolean
}>()

const { isSpeechSupported, speechMessage, speakGreek } = useGreekSpeech()
</script>

<template>
  <section v-if="examples.length" class="examples-panel" aria-labelledby="examples-title">
    <div class="examples-heading">
      <span class="examples-icon" aria-hidden="true">“</span>
      <div>
        <h2 id="examples-title">В контексте</h2>
        <p>Примеры с этим словом</p>
      </div>
    </div>
    <template v-if="frontLanguage === 'greek' || revealed">
      <article v-for="(example, index) in examples" :key="`${example.greek}-${index}`" class="example-item">
        <div class="example-greek-line">
          <p class="example-greek" lang="el">{{ example.greek }}</p>
          <button v-if="isSpeechSupported" type="button" class="speech-button" :aria-label="`Прослушать пример: ${example.greek}`" title="Прослушать пример по-гречески" @click="speakGreek(example.greek)">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>
          </button>
        </div>
        <p class="example-transliteration">{{ example.transliteration }}</p>
        <p v-if="speechMessage" class="speech-message" role="status">{{ speechMessage }}</p>
        <p v-if="revealed" class="example-translation">{{ example.russian }}</p>
      </article>
    </template>
    <p v-else class="example-locked">Переверните карточку, чтобы увидеть пример</p>
  </section>
</template>
