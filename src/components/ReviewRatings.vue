<script setup lang="ts">
import { computed } from 'vue'
import type { ReviewRating } from '../composables/useSpacedRepetition'
import { formatInterval } from '../composables/useSpacedRepetition'

const props = defineProps<{
  wordId: string
  getNextIntervalDays: (wordId: string, rating: ReviewRating) => number
}>()

const emit = defineEmits<{ rate: [rating: ReviewRating] }>()

const ratings: { value: ReviewRating; label: string }[] = [
  { value: 'again', label: 'Не помню' },
  { value: 'hard', label: 'Трудно' },
  { value: 'good', label: 'Помню' },
  { value: 'easy', label: 'Легко' },
]

const intervalLabels = computed(() => Object.fromEntries(
  ratings.map(({ value }) => [value, formatInterval(props.getNextIntervalDays(props.wordId, value))]),
) as Record<ReviewRating, string>)
</script>

<template>
  <section class="review-ratings" aria-label="Оцените, насколько хорошо вспомнили слово">
    <p class="review-prompt">Как вспомнили слово?</p>
    <div class="rating-buttons">
      <button
        v-for="rating in ratings"
        :key="rating.value"
        class="rating-button"
        :class="`rating-${rating.value}`"
        @click="emit('rate', rating.value)"
      >
        <strong>{{ rating.label }}</strong>
        <span>{{ intervalLabels[rating.value] }}</span>
      </button>
    </div>
  </section>
</template>
