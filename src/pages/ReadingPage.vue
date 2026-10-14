<script setup lang="ts">
import ReadingGuide from '../components/ReadingGuide.vue'
</script>

<template>
  <section class="study-area is-reading" aria-labelledby="page-title">
    <RouterLink class="reading-back" to="/theory"><span aria-hidden="true">←</span> К каталогу теории</RouterLink>
    <div class="intro">
      <div class="eyebrow"><span class="eyebrow-line"></span>ПРОИЗНОШЕНИЕ СОВРЕМЕННОГО ГРЕЧЕСКОГО</div>
      <h1 id="page-title">Читаем <span>по-гречески.</span></h1>
      <p class="intro-copy">Сочетания букв и их примерное чтение по-русски.</p>
    </div>
    <ReadingGuide />
  </section>
</template>

<style scoped>
.reading-back { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 18px; color: #65715c; font-size: 13px; font-weight: 600; text-decoration: none; }
.reading-back:hover { color: #40533a; text-decoration: underline; text-underline-offset: 3px; }
</style>
