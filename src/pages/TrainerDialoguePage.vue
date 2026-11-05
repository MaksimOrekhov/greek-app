<script setup lang="ts">
import { nextTick, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'
import DialogueQuestionPanel from '../components/trainers/DialogueQuestionPanel.vue'
import DialogueSessionResults from '../components/trainers/DialogueSessionResults.vue'
import { useDialogueSession } from '../composables/useDialogueSession.ts'

const router = useRouter()
const { session, currentRound, currentQuestion, results, start, selectOption, checkAnswer, advance } = useDialogueSession()
const exercise = useTemplateRef<InstanceType<typeof DialogueQuestionPanel>>('dialogueExercise')
const resultsView = useTemplateRef<InstanceType<typeof DialogueSessionResults>>('dialogueResults')

start()

function handleAdvance(): void {
  advance()
  void nextTick(() => {
    if (session.value?.completed) resultsView.value?.focusHeading()
    else exercise.value?.focusQuestion()
  })
}

function handleRestart(): void {
  start()
  void nextTick(() => exercise.value?.focusQuestion())
}

function returnToCatalog(): void {
  void router.push('/trainers')
}
</script>

<template>
  <section class="study-area is-trainer-session is-dialogue-session">
    <div class="dialogue-back-row">
      <RouterLink class="dialogue-back-link" to="/trainers"><span aria-hidden="true">←</span> Все тренажёры</RouterLink>
      <span v-if="session && !session.completed" class="dialogue-session-count">{{ session.rounds.length * 2 }} заданий</span>
    </div>

    <header class="dialogue-session-intro">
      <div class="eyebrow"><span class="eyebrow-line"></span> ПОНИМАНИЕ РАЗГОВОРНОГО ГРЕЧЕСКОГО <span class="eyebrow-line"></span></div>
      <h1>Продолжи диалог</h1>
      <p class="intro-copy">Прочитай разговор и выбери ответ, который подходит по смыслу.</p>
    </header>

    <DialogueSessionResults
      v-if="session?.completed && results"
      ref="dialogueResults"
      :results="results"
      @restart="handleRestart"
      @catalog="returnToCatalog"
    />
    <section v-else-if="session && currentRound && currentQuestion" class="dialogue-session-panel" aria-label="Тренировка «Продолжи диалог»">
      <DialogueQuestionPanel
        :key="currentQuestion.question.id"
        ref="dialogueExercise"
        :question-state="currentQuestion"
        :round-number="currentRound.number"
        :total-rounds="session.rounds.length"
        :question-number="(session.currentRoundIndex * 2) + session.currentQuestionIndex + 1"
        :total-questions="session.rounds.length * 2"
        @select="selectOption"
        @check="checkAnswer"
        @advance="handleAdvance"
      />
    </section>
  </section>
</template>

<style scoped>
.study-area.is-trainer-session.is-dialogue-session { width: min(100% - 36px, 710px); padding-top: 38px; }
.dialogue-back-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 0 1px 19px; }
.dialogue-back-link { min-height: 36px; display: inline-flex; align-items: center; gap: 7px; color: #777a70; font-size: 12px; text-decoration: none; }
.dialogue-back-link:hover { color: #40533a; }
.dialogue-back-link span { font-size: 16px; }
.dialogue-session-count { padding: 7px 10px; border-radius: 99px; background: #eeede6; color: #73776c; font-size: 10px; font-weight: 700; white-space: nowrap; }
.dialogue-session-intro { margin-bottom: 22px; text-align: center; }
.dialogue-session-intro h1 { font-size: clamp(28px, 5vw, 38px); overflow-wrap: anywhere; }
.dialogue-session-intro .intro-copy { max-width: 520px; margin: 0 auto; line-height: 1.55; }
.dialogue-session-panel { min-width: 0; padding: 19px 22px 20px; border: 1px solid rgba(58, 59, 50, .07); border-radius: 17px; background: rgba(255, 255, 255, .73); box-shadow: 0 14px 42px rgba(64, 64, 46, .04); }
.dialogue-back-link:focus-visible { outline: 3px solid #9aaf8f; outline-offset: 3px; }
@media (max-width: 520px) {
  .study-area.is-trainer-session.is-dialogue-session { width: calc(100% - 24px); padding-top: 27px; }
  .dialogue-session-panel { padding: 15px 12px; }
  .dialogue-session-intro .intro-copy { max-width: 340px; font-size: 12px; }
}
</style>
