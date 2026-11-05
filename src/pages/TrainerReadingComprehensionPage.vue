<script setup lang="ts">
import { nextTick, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'
import ReadingComprehensionExercise from '../components/trainers/ReadingComprehensionExercise.vue'
import ReadingComprehensionResults from '../components/trainers/ReadingComprehensionResults.vue'
import { useReadingComprehensionSession } from '../composables/useReadingComprehensionSession.ts'

const router = useRouter()
const { session, currentRound, results, start, selectOption, checkRound, advance } = useReadingComprehensionSession()
const exercise = useTemplateRef<InstanceType<typeof ReadingComprehensionExercise>>('readingExercise')
const resultsView = useTemplateRef<InstanceType<typeof ReadingComprehensionResults>>('readingResults')

start()

function handleAdvance(): void {
  advance()
  void nextTick(() => {
    if (session.value?.completed) resultsView.value?.focusHeading()
    else exercise.value?.focusTextHeading()
  })
}

function handleRestart(): void {
  start()
  void nextTick(() => exercise.value?.focusTextHeading())
}

function returnToCatalog(): void {
  void router.push('/trainers')
}
</script>

<template>
  <section class="study-area is-trainer-session is-reading-session">
    <div class="reading-back-row">
      <RouterLink class="reading-back-link" to="/trainers"><span aria-hidden="true">←</span> Все тренажёры</RouterLink>
      <span v-if="session && !session.completed" class="reading-session-count">5 текстов · 10 вопросов</span>
    </div>

    <header class="reading-session-intro">
      <div class="eyebrow"><span class="eyebrow-line"></span> ЧТЕНИЕ И ПОНИМАНИЕ <span class="eyebrow-line"></span></div>
      <h1>Прочитай и пойми</h1>
      <p class="intro-copy">Читай короткие тексты на греческом и отвечай на вопросы по их содержанию.</p>
    </header>

    <ReadingComprehensionResults
      v-if="session?.completed && results"
      ref="readingResults"
      :results="results"
      @restart="handleRestart"
      @catalog="returnToCatalog"
    />
    <section v-else-if="session && currentRound" class="reading-session-panel" aria-label="Тренировка «Прочитай и пойми»">
      <ReadingComprehensionExercise
        :key="currentRound.text.id"
        ref="readingExercise"
        :round="currentRound"
        :total-rounds="session.rounds.length"
        @select="selectOption"
        @check="checkRound"
        @advance="handleAdvance"
      />
    </section>
  </section>
</template>

<style scoped>
.study-area.is-trainer-session.is-reading-session { width: min(100% - 36px, 760px); padding-top: 38px; }
.reading-back-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 0 1px 19px; }
.reading-back-link { min-height: 38px; display: inline-flex; align-items: center; gap: 7px; color: #777a70; font-size: 12px; text-decoration: none; }
.reading-back-link:hover { color: #40533a; }
.reading-back-link span { font-size: 16px; }
.reading-session-count { padding: 7px 10px; border-radius: 99px; background: #eeede6; color: #73776c; font-size: 10px; font-weight: 700; white-space: nowrap; }
.reading-session-intro { margin-bottom: 22px; text-align: center; }
.reading-session-intro h1 { font-size: clamp(28px, 5vw, 38px); overflow-wrap: anywhere; }
.reading-session-intro .intro-copy { max-width: 520px; margin: 0 auto; line-height: 1.55; }
.reading-session-panel { min-width: 0; padding: 19px 22px 20px; border: 1px solid rgba(58, 59, 50, .07); border-radius: 17px; background: rgba(255, 255, 255, .73); box-shadow: 0 14px 42px rgba(64, 64, 46, .04); }
.reading-back-link:focus-visible { outline: 3px solid #9aaf8f; outline-offset: 3px; }
@media (max-width: 520px) {
  .study-area.is-trainer-session.is-reading-session { width: calc(100% - 24px); padding-top: 27px; }
  .reading-session-panel { padding: 15px 12px; }
  .reading-session-intro .intro-copy { max-width: 340px; font-size: 12px; }
}
</style>
