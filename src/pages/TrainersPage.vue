<script setup lang="ts">
import TrainerTopicCard from '../components/trainers/TrainerTopicCard.vue'
import { trainerTopics } from '../data/trainers/topics.ts'
import { words } from '../data/words.ts'
import { adaptWordsToTrainerPairs } from '../lib/trainers/vocabularyMatch.ts'

const vocabularyWordCount = adaptWordsToTrainerPairs(words).length
</script>

<template>
  <section class="study-area is-trainers">
    <header class="trainer-intro">
      <div class="eyebrow"><span class="eyebrow-line"></span> УЧИМСЯ ЧЕРЕЗ ПРАКТИКУ <span class="eyebrow-line"></span></div>
      <h1>Тренажёры</h1>
      <p class="intro-copy">Выберите тему и закрепите материал в короткой тренировке.</p>
    </header>

    <section class="dictionary-training" aria-labelledby="dictionary-training-title">
      <div class="dictionary-training-heading">
        <h2 id="dictionary-training-title">Тренировка словаря</h2>
      </div>
      <article class="dictionary-training-card">
        <div class="dictionary-training-copy">
          <span class="dictionary-training-eyebrow">СЛОВАРЬ</span>
          <h3>Соедини пары: весь словарь</h3>
          <p>Находи соответствия между греческими словами и русскими переводами.</p>
          <span class="dictionary-training-count">{{ vocabularyWordCount }} слов и выражений</span>
        </div>
        <RouterLink class="dictionary-training-button" to="/trainers/vocabulary/match-pairs">Начать тренировку</RouterLink>
      </article>
    </section>

    <section class="dialogue-training" aria-labelledby="dialogue-training-title">
      <div class="dictionary-training-heading">
        <h2 id="dialogue-training-title">Тренировка диалогов</h2>
      </div>
      <article class="dialogue-training-card">
        <div class="dictionary-training-copy">
          <span class="dictionary-training-eyebrow">ПОНИМАНИЕ РЕЧИ</span>
          <h3>Продолжи диалог</h3>
          <p>Читай короткие разговоры и выбирай подходящий ответ в повседневной ситуации.</p>
          <span class="dictionary-training-count">10 заданий · 5 раундов</span>
        </div>
        <RouterLink class="dialogue-training-button" to="/trainers/dialogues">Начать тренировку</RouterLink>
      </article>
    </section>

    <section class="reading-training" aria-labelledby="reading-training-title">
      <div class="dictionary-training-heading">
        <h2 id="reading-training-title">Тренировка чтения</h2>
      </div>
      <article class="reading-training-card">
        <div class="dictionary-training-copy">
          <span class="dictionary-training-eyebrow">ЧТЕНИЕ И ПОНИМАНИЕ</span>
          <h3>Прочитай и пойми</h3>
          <p>Читай короткие тексты на греческом и отвечай на вопросы по их содержанию.</p>
          <span class="dictionary-training-count">5 текстов · 10 вопросов</span>
        </div>
        <RouterLink class="reading-training-button" to="/trainers/reading-comprehension">Начать тренировку</RouterLink>
      </article>
    </section>

    <div class="trainer-catalog-heading">
      <div>
        <h2>Учебные темы</h2>
        <p>Выберите упражнение для выбранной темы.</p>
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
.dictionary-training { margin-bottom: 25px; }
.dialogue-training { margin-bottom: 27px; }
.reading-training { margin-bottom: 27px; }
.dictionary-training-heading { margin: 0 1px 10px; }
.dictionary-training-heading h2 { margin: 0; font: 700 15px 'Manrope', sans-serif; }
.dictionary-training-card { min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 17px 18px; border: 1px solid #dfe5d9; border-radius: 15px; background: #f4f7f1; }
.dictionary-training-copy { min-width: 0; }
.dictionary-training-eyebrow { color: #7c8b73; font-size: 9px; font-weight: 700; letter-spacing: 1px; }
.dictionary-training-copy h3 { margin: 5px 0 4px; font: 700 15px/1.4 'Manrope', 'Noto Sans Greek', sans-serif; overflow-wrap: anywhere; }
.dictionary-training-copy p { margin: 0; color: #777a70; font-size: 11px; line-height: 1.5; overflow-wrap: anywhere; }
.dictionary-training-count { display: block; margin-top: 7px; color: #85877d; font-size: 10px; }
.dictionary-training-button { flex: 0 0 auto; min-height: 40px; display: inline-flex; align-items: center; justify-content: center; padding: 0 14px; border-radius: 9px; background: #52654a; color: #fff; font-size: 11px; font-weight: 700; text-align: center; text-decoration: none; }
.dictionary-training-button:hover { background: #40533a; }
.dialogue-training-card { min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 17px 18px; border: 1px solid #e5e3d8; border-radius: 15px; background: #f8f7f1; }
.dialogue-training-button { flex: 0 0 auto; min-height: 40px; display: inline-flex; align-items: center; justify-content: center; padding: 0 14px; border-radius: 9px; background: #52654a; color: #fff; font-size: 11px; font-weight: 700; text-align: center; text-decoration: none; }
.dialogue-training-button:hover { background: #40533a; }
.reading-training-card { min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 17px 18px; border: 1px solid #dce5eb; border-radius: 15px; background: #f2f6f8; }
.reading-training-button { flex: 0 0 auto; min-height: 40px; display: inline-flex; align-items: center; justify-content: center; padding: 0 14px; border-radius: 9px; background: #52654a; color: #fff; font-size: 11px; font-weight: 700; text-align: center; text-decoration: none; }
.reading-training-button:hover { background: #40533a; }
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
  .dictionary-training-card { align-items: stretch; flex-direction: column; }
  .dictionary-training-button { width: 100%; }
  .dialogue-training-card { align-items: stretch; flex-direction: column; }
  .dialogue-training-button { width: 100%; }
  .reading-training-card { align-items: stretch; flex-direction: column; }
  .reading-training-button { width: 100%; }
}
</style>
