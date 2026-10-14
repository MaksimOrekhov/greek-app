<script setup lang="ts">
import TheoryCatalog from '../components/theory/TheoryCatalog.vue'
</script>

<template>
  <section class="study-area is-theory" aria-labelledby="theory-title">
    <div class="intro">
      <div class="eyebrow"><span class="eyebrow-line"></span>СПРАВОЧНИК СОВРЕМЕННОГО ГРЕЧЕСКОГО</div>
      <h1 id="theory-title">Теория <span>по полочкам.</span></h1>
      <p class="intro-copy">Короткие шпаргалки и подробные объяснения грамматики.</p>
    </div>
    <TheoryCatalog />
  </section>
</template>

<style scoped>
.study-area.is-theory { width: min(100% - 36px, 900px); padding: 58px 0 70px; margin: 0 auto; position: relative; z-index: 1; }
@media (max-width: 600px) { .study-area.is-theory { width: min(100% - 28px, 900px); padding-top: 38px; } }
</style>
