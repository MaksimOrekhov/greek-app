<script setup lang="ts">
import { nextTick, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'
import ArticleGenderExercise from '../components/trainers/ArticleGenderExercise.vue'
import ArticleGenderResults from '../components/trainers/ArticleGenderResults.vue'
import { useArticleGenderSession } from '../composables/useArticleGenderSession.ts'
import type { NominativeArticle } from '../lib/trainers/articleGender/articleGenderTypes.ts'

const router = useRouter()
const { session, currentQuestion, currentRound, results, start, answer, advance } = useArticleGenderSession()
const exercise = useTemplateRef<InstanceType<typeof ArticleGenderExercise>>('articleGenderExercise')
const resultsView = useTemplateRef<InstanceType<typeof ArticleGenderResults>>('articleGenderResults')

start()

function handleAdvance(): void {
  advance()
  void nextTick(() => {
    if (session.value?.completed) resultsView.value?.focusHeading()
    else exercise.value?.focusPrompt()
  })
}

function handleRestart(): void {
  start()
  void nextTick(() => exercise.value?.focusPrompt())
}

function returnToCatalog(): void {
  void router.push('/trainers')
}

function submitAnswer(article: NominativeArticle): void {
  answer(article)
}
</script>

<template>
  <section class="study-area is-trainer-session is-article-gender-session">
    <div class="article-gender-back-row">
      <RouterLink class="article-gender-back-link" to="/trainers"><span aria-hidden="true">←</span> Все тренажёры</RouterLink>
      <span v-if="session && !session.completed" class="article-gender-session-count">20 слов · 5 раундов</span>
    </div>

    <header class="article-gender-session-intro">
      <div class="eyebrow"><span class="eyebrow-line"></span> ГРЕЧЕСКИЙ СЛОВАРЬ <span class="eyebrow-line"></span></div>
      <h1>Выбери правильный артикль</h1>
      <p class="intro-copy">Запоминай род греческих существительных вместе с определённым артиклем.</p>
    </header>

    <ArticleGenderResults
      v-if="session?.completed && results"
      ref="articleGenderResults"
      :results="results"
      @restart="handleRestart"
      @catalog="returnToCatalog"
    />
    <section v-else-if="session && currentQuestion && currentRound" class="article-gender-session-panel" aria-label="Тренировка «Выбери правильный артикль»">
      <ArticleGenderExercise
        :key="currentQuestion.noun.wordId"
        ref="articleGenderExercise"
        :question="currentQuestion"
        :question-number="session.currentQuestionIndex + 1"
        :round-number="currentRound.number"
        :total-questions="session.rounds.length * 4"
        :total-rounds="session.rounds.length"
        @answer="submitAnswer"
        @advance="handleAdvance"
      />
    </section>
  </section>
</template>

<style scoped>
.study-area.is-trainer-session.is-article-gender-session { width: min(100% - 36px, 680px); padding-top: 38px; }
.article-gender-back-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 0 1px 19px; }
.article-gender-back-link { min-height: 38px; display: inline-flex; align-items: center; gap: 7px; color: #777a70; font-size: 12px; text-decoration: none; }
.article-gender-back-link:hover { color: #40533a; }
.article-gender-back-link span { font-size: 16px; }
.article-gender-back-link:focus-visible { outline: 3px solid #9aaf8f; outline-offset: 3px; }
.article-gender-session-count { padding: 7px 10px; border-radius: 99px; background: #eeede6; color: #73776c; font-size: 10px; font-weight: 700; white-space: nowrap; }
.article-gender-session-intro { margin-bottom: 22px; text-align: center; }
.article-gender-session-intro h1 { font-size: clamp(28px, 5vw, 38px); overflow-wrap: anywhere; }
.article-gender-session-intro .intro-copy { max-width: 520px; margin: 0 auto; line-height: 1.55; }
.article-gender-session-panel { min-width: 0; padding: 21px 22px 23px; border: 1px solid rgba(58, 59, 50, .07); border-radius: 17px; background: rgba(255, 255, 255, .73); box-shadow: 0 14px 42px rgba(64, 64, 46, .04); }
@media (max-width: 520px) {
  .study-area.is-trainer-session.is-article-gender-session { width: calc(100% - 24px); padding-top: 27px; }
  .article-gender-session-panel { padding: 16px 12px; }
  .article-gender-session-intro .intro-copy { max-width: 340px; font-size: 12px; }
}
</style>
