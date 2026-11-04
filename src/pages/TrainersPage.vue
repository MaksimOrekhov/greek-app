<script setup lang="ts">
import TrainerTopicCard from '../components/trainers/TrainerTopicCard.vue'
import { trainerTopics } from '../data/trainers/topics.ts'
</script>

<template>
  <section class="study-area is-trainers">
    <header class="trainer-intro">
      <div class="eyebrow"><span class="eyebrow-line"></span> УЧИМСЯ ЧЕРЕЗ ПРАКТИКУ <span class="eyebrow-line"></span></div>
      <h1>Тренажёры</h1>
      <p class="intro-copy">Выберите тему и закрепите материал в короткой тренировке.</p>
    </header>

    <div class="trainer-catalog-heading">
      <div>
        <h2>Учебные темы</h2>
        <p>Сейчас доступна механика «Соедини пары».</p>
      </div>
      <span class="topic-count">{{ trainerTopics.length }} темы</span>
    </div>

    <div class="trainer-topic-grid">
      <TrainerTopicCard v-for="topic in trainerTopics" :key="topic.id" :topic="topic" />
    </div>
  </section>
</template>

<style scoped>
.study-area.is-trainers { width: min(100% - 36px, 850px); padding-top: 48px; }
.trainer-intro { margin-bottom: 29px; text-align: center; }
.trainer-intro h1 { margin-top: 13px; }
.trainer-catalog-heading { display: flex; align-items: center; justify-content: space-between; gap: 15px; margin: 0 1px 13px; }
.trainer-catalog-heading h2 { margin: 0 0 4px; font: 700 15px 'Manrope', sans-serif; }
.trainer-catalog-heading p { margin: 0; color: #92938a; font-size: 11px; line-height: 1.5; }
.topic-count { flex: 0 0 auto; padding: 6px 9px; border-radius: 99px; background: #eeede6; color: #777a70; font-size: 10px; }
.trainer-topic-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
@media (max-width: 680px) {
  .study-area.is-trainers { padding-top: 38px; }
  .trainer-topic-grid { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 420px) {
  .study-area.is-trainers { width: calc(100% - 24px); }
  .trainer-catalog-heading { align-items: flex-start; }
}
</style>
