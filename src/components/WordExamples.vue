<script setup lang="ts">
import type { WordExample } from '../data/words'

defineProps<{
  examples: WordExample[]
  showTranslation: boolean
}>()
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
    <article v-for="(example, index) in examples" :key="`${example.greek}-${index}`" class="example-item">
      <p class="example-greek" lang="el">{{ example.greek }}</p>
      <p class="example-transliteration">{{ example.transliteration }}</p>
      <p v-if="showTranslation" class="example-translation">{{ example.russian }}</p>
    </article>
  </section>
</template>
