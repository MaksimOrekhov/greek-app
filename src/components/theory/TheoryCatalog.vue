<script setup lang="ts">
import { computed, ref } from 'vue'
import { theoryResources, theoryTopics } from '../../data/theory/topics'

const query = ref('')
const entries = computed(() => [
  ...theoryTopics.map((topic) => ({ ...topic, to: `/theory/${topic.id}` })),
  ...theoryResources,
])
const categories = computed(() => {
  const search = query.value.trim().toLocaleLowerCase('ru')
  const visible = entries.value.filter((entry) =>
    !search || [entry.title, entry.description, ...entry.keywords].some((value) => value.toLocaleLowerCase('ru').includes(search)),
  )
  const groups = new Map<string, typeof visible>()
  for (const entry of visible) {
    const group = groups.get(entry.category) ?? []
    group.push(entry)
    groups.set(entry.category, group)
  }
  return [...groups.entries()].map(([name, items]) => ({ name, items }))
})
</script>

<template>
  <div class="theory-catalog">
    <label class="theory-search-label" for="theory-search">Найти тему</label>
    <div class="theory-search-wrap">
      <span aria-hidden="true">⌕</span>
      <input id="theory-search" v-model="query" type="search" placeholder="Название, правило или ключевое слово" />
    </div>

    <section v-for="category in categories" :key="category.name" class="theory-category" :aria-label="category.name">
      <div class="theory-category-heading"><h2>{{ category.name }}</h2><span>{{ category.items.length }}</span></div>
      <div class="theory-topic-grid">
        <RouterLink v-for="entry in category.items" :key="entry.to" class="theory-topic-card" :to="entry.to">
          <span class="theory-topic-arrow" aria-hidden="true">↗</span>
          <span v-if="'greekTitle' in entry && entry.greekTitle" class="theory-greek-title" lang="el">{{ entry.greekTitle }}</span>
          <h3>{{ entry.title }}</h3>
          <p>{{ entry.description }}</p>
        </RouterLink>
      </div>
    </section>
    <p v-if="!categories.length" class="theory-empty" role="status">По этому запросу тем пока нет.</p>
  </div>
</template>

<style scoped>
.theory-catalog { display: grid; gap: 28px; }
.theory-search-label { color: #72776c; font-size: 12px; font-weight: 700; }
.theory-search-wrap { display: flex; align-items: center; gap: 10px; min-height: 48px; margin-top: -21px; padding: 0 14px; border: 1px solid #e5e4dc; border-radius: 12px; background: rgba(255,255,255,.8); color: #89907f; }
.theory-search-wrap span { font-size: 22px; }
.theory-search-wrap input { width: 100%; border: 0; outline: 0; background: transparent; color: #34392f; font: inherit; font-size: 14px; }
.theory-search-wrap input::placeholder { color: #a0a398; }
.theory-category { display: grid; gap: 13px; }
.theory-category-heading { display: flex; align-items: center; gap: 9px; }
.theory-category-heading h2 { margin: 0; color: #50564b; font: 700 15px 'Manrope', sans-serif; }
.theory-category-heading span { display: grid; place-items: center; min-width: 22px; height: 22px; padding: 0 6px; border-radius: 20px; background: #e9ede5; color: #59694e; font-size: 11px; font-weight: 700; }
.theory-topic-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.theory-topic-card { position: relative; display: block; min-height: 130px; padding: 18px 43px 18px 19px; border: 1px solid rgba(58,59,50,.08); border-radius: 15px; background: rgba(255,255,255,.78); box-shadow: 0 8px 24px rgba(64,64,46,.025); color: inherit; text-decoration: none; transition: border-color .18s, transform .18s, box-shadow .18s; }
.theory-topic-card:hover { transform: translateY(-2px); border-color: #cbd4c2; box-shadow: 0 10px 25px rgba(64,64,46,.07); }
.theory-topic-card h3 { margin: 4px 0 7px; color: #34392f; font: 700 17px 'Manrope', sans-serif; }
.theory-topic-card p { margin: 0; color: #808378; font-size: 13px; line-height: 1.55; }
.theory-greek-title { color: #8a927e; font: 13px 'Noto Sans Greek', sans-serif; }
.theory-topic-arrow { position: absolute; top: 18px; right: 17px; color: #89937f; font-size: 18px; }
.theory-empty { margin: 0; padding: 22px; border-radius: 12px; background: rgba(255,255,255,.7); color: #7d8177; text-align: center; }
@media (max-width: 600px) { .theory-topic-grid { grid-template-columns: 1fr; } }
</style>
