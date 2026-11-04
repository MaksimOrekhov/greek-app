<script setup lang="ts">
import type { TrainerTopic } from '../../data/trainers/types.ts'

defineProps<{
  topic: TrainerTopic
}>()
</script>

<template>
  <article class="trainer-topic-card">
    <div class="topic-card-mark" aria-hidden="true">✳</div>
    <div class="topic-card-copy">
      <h2>{{ topic.title }}</h2>
      <p>{{ topic.description }}</p>
    </div>
    <div class="topic-exercise-links" aria-label="Выберите упражнение">
      <RouterLink v-if="topic.availableExercises.includes('match-pairs')" class="topic-start-button" :to="`/trainers/${topic.id}`">
        Соедини пары <span aria-hidden="true">→</span>
      </RouterLink>
      <RouterLink v-if="topic.availableExercises.includes('multi-select')" class="topic-start-button" :to="`/trainers/${topic.id}/multi-select`">
        Найди все правильные варианты <span aria-hidden="true">→</span>
      </RouterLink>
      <RouterLink v-if="topic.availableExercises.includes('fill-gaps')" class="topic-start-button" :to="`/trainers/${topic.id}/fill-gaps`">
        Заполни пропуски <span aria-hidden="true">→</span>
      </RouterLink>
    </div>
  </article>
</template>

<style scoped>
.trainer-topic-card { min-width: 0; display: grid; grid-template-columns: 40px minmax(0, 1fr); align-items: start; gap: 14px; padding: 19px; border: 1px solid rgba(58, 59, 50, .07); border-radius: 16px; background: rgba(255, 255, 255, .76); box-shadow: 0 12px 36px rgba(64, 64, 46, .035); }
.topic-card-mark { display: grid; place-items: center; width: 39px; height: 39px; border-radius: 12px; background: #f0eee6; color: #78886c; font-size: 17px; }
.topic-card-copy { min-width: 0; }
.topic-card-copy h2 { margin: 1px 0 6px; font: 700 15px/1.35 'Manrope', 'Noto Sans Greek', sans-serif; letter-spacing: -.25px; }
.topic-card-copy p { margin: 0; color: #85877d; font-size: 12px; line-height: 1.55; }
.topic-exercise-links { grid-column: 2; display: flex; flex-wrap: wrap; gap: 8px; }
.topic-start-button { justify-self: start; min-height: 38px; display: inline-flex; align-items: center; gap: 10px; margin-top: 2px; padding: 0 13px; border: 1px solid #dce3d7; border-radius: 9px; background: #f5f7f2; color: #465a3f; font-size: 12px; font-weight: 700; text-decoration: none; transition: background .18s, border-color .18s; }
.topic-start-button:hover { border-color: #bfcbb7; background: #eef2e9; }
.topic-start-button span { font-size: 16px; }
@media (max-width: 420px) {
  .trainer-topic-card { padding: 15px; grid-template-columns: 34px minmax(0, 1fr); gap: 11px; }
  .topic-card-mark { width: 34px; height: 34px; }
  .topic-card-copy h2 { font-size: 14px; }
  .topic-exercise-links { grid-column: 1 / -1; flex-direction: column; align-items: stretch; }
  .topic-start-button { justify-content: space-between; }
}
</style>
