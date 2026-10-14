<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarkdownArticle from '../components/theory/MarkdownArticle.vue'
import { getTheoryTopic, theoryTopics } from '../data/theory/topics'

const route = useRoute()
const router = useRouter()
const topic = computed(() => getTheoryTopic(String(route.params.topicId ?? '')))
const markdownFiles = import.meta.glob('../data/theory/content/**/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const summary = computed(() => topic.value ? markdownFiles[`../data/theory/${topic.value.summary}`] : undefined)
const explanation = computed(() => topic.value ? markdownFiles[`../data/theory/${topic.value.explanation}`] : undefined)
const relatedTopics = computed(() => topic.value?.related.map((id) => getTheoryTopic(id)).filter((item) => item !== undefined) ?? [])
const explanationOpen = ref(false)
watch(() => route.fullPath, () => {
  explanationOpen.value = route.query.explanation === '1' || Boolean(route.hash)
}, { immediate: true })
function toggleExplanation() {
  explanationOpen.value = !explanationOpen.value
  void router.replace({
    query: { ...route.query, explanation: explanationOpen.value ? '1' : undefined },
    hash: explanationOpen.value ? route.hash : '',
  })
}
</script>

<template>
  <section class="study-area is-theory-topic" aria-labelledby="topic-title">
    <RouterLink class="theory-back" to="/theory"><span aria-hidden="true">←</span> К каталогу теории</RouterLink>

    <template v-if="topic">
      <header class="theory-topic-header">
        <div class="eyebrow"><span class="eyebrow-line"></span>{{ topic.category.toLocaleUpperCase('ru') }}</div>
        <h1 id="topic-title">{{ topic.title }}</h1>
        <p v-if="topic.greekTitle" class="theory-topic-greek" lang="el">{{ topic.greekTitle }}</p>
        <p class="intro-copy">{{ topic.description }}</p>
      </header>

      <section v-if="summary" class="theory-summary" aria-labelledby="summary-title">
        <div class="theory-section-heading"><span aria-hidden="true">✳</span><h2 id="summary-title">Шпаргалка</h2></div>
        <MarkdownArticle :source="summary" variant="summary" />
      </section>
      <p v-else class="theory-content-error" role="alert">Не удалось загрузить шпаргалку для этой темы.</p>

      <section id="explanation" class="theory-explanation" aria-labelledby="explanation-title">
        <button
          id="explanation-title"
          class="theory-explanation-toggle"
          type="button"
          :aria-expanded="explanationOpen"
          aria-controls="explanation-content"
          @click="toggleExplanation"
        >
          <span>{{ explanationOpen ? 'Скрыть подробное объяснение' : 'Показать подробное объяснение' }}</span>
          <span class="theory-toggle-mark" aria-hidden="true">{{ explanationOpen ? '−' : '+' }}</span>
        </button>
        <div v-if="explanationOpen" id="explanation-content" class="theory-explanation-content">
          <MarkdownArticle v-if="explanation" :source="explanation" variant="explanation" />
          <p v-else class="theory-content-error" role="alert">Не удалось загрузить объяснение для этой темы.</p>
        </div>
      </section>

      <nav v-if="relatedTopics.length" class="theory-related" aria-label="Связанные темы">
        <h2>Связанные темы</h2>
        <RouterLink v-for="related in relatedTopics" :key="related.id" :to="`/theory/${related.id}`">{{ related.title }} <span aria-hidden="true">↗</span></RouterLink>
      </nav>
    </template>
    <section v-else class="theory-not-found" role="status">
      <h1>Тема не найдена</h1>
      <p>В каталоге пока нет статьи с таким адресом.</p>
      <RouterLink to="/theory">Вернуться к темам</RouterLink>
    </section>
  </section>
</template>

<style scoped>
.study-area.is-theory-topic { width: min(100% - 36px, 800px); padding: 38px 0 70px; margin: 0 auto; position: relative; z-index: 1; }
.theory-back { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 24px; color: #65715c; font-size: 13px; font-weight: 600; text-decoration: none; }
.theory-back:hover, .theory-not-found a:hover { color: #40533a; text-decoration: underline; text-underline-offset: 3px; }
.theory-topic-header { margin-bottom: 25px; }
.theory-topic-header h1 { margin: 11px 0 5px; color: #30352c; font: 800 clamp(30px, 5vw, 42px)/1.15 'Manrope', sans-serif; letter-spacing: -1.3px; }
.theory-topic-greek { margin: 0 0 8px; color: #7e8974; font: 16px 'Noto Sans Greek', sans-serif; }
.theory-topic-header .intro-copy { margin-top: 0; }
.theory-summary { padding: 21px 23px; border: 1px solid #dfe5d9; border-radius: 16px; background: #f0f3ec; }
.theory-section-heading { display: flex; align-items: center; gap: 9px; margin-bottom: 15px; color: #718265; }
.theory-section-heading h2, .theory-related h2 { margin: 0; color: #3c4936; font: 700 16px 'Manrope', sans-serif; }
.theory-explanation { margin-top: 13px; border: 1px solid rgba(58,59,50,.08); border-radius: 15px; background: rgba(255,255,255,.78); overflow: hidden; scroll-margin-top: 16px; }
.theory-explanation-toggle { display: flex; width: 100%; min-height: 59px; align-items: center; justify-content: space-between; gap: 14px; padding: 0 19px; border: 0; background: transparent; color: #46543f; cursor: pointer; text-align: left; font-size: 14px; font-weight: 700; }
.theory-toggle-mark { color: #75856a; font-size: 21px; }
.theory-explanation-content { padding: 0 21px 22px; border-top: 1px solid #eeede7; }
.theory-related { display: grid; justify-items: start; gap: 10px; margin-top: 26px; }
.theory-related h2 { margin-bottom: 2px; }
.theory-related a, .theory-not-found a { color: #52654a; font-size: 14px; font-weight: 600; text-decoration: none; }
.theory-content-error { margin: 0; padding: 14px; color: #8a4b3c; }
.theory-not-found { padding: 30px; border: 1px solid #e8e6df; border-radius: 15px; background: rgba(255,255,255,.76); }
.theory-not-found h1 { margin: 0 0 8px; color: #30352c; font: 700 26px 'Manrope', sans-serif; }
.theory-not-found p { color: #74796e; }
@media (max-width: 600px) {
  .study-area.is-theory-topic { width: min(100% - 28px, 800px); padding-top: 28px; }
  .theory-summary { padding: 17px 14px; }
  .theory-explanation-content { padding: 0 14px 17px; }
}
</style>
