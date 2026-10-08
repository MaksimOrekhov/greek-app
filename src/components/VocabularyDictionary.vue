<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import {
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from 'reka-ui'
import { PART_OF_SPEECH_LABELS, type PartOfSpeech, type WordCard } from '../data/words'
import type { WordLearningStatus } from '../composables/useSpacedRepetition'

const props = defineProps<{
  words: WordCard[]
  getWordLearningStatus: (wordId: string) => WordLearningStatus
}>()

type StatusFilter = 'all' | WordLearningStatus

const search = shallowRef('')
const statusFilter = shallowRef<StatusFilter>('all')
const partOfSpeechFilter = shallowRef<PartOfSpeech | 'all'>('all')
const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Все статусы' },
  { value: 'new', label: 'Новое' },
  { value: 'learning', label: 'В процессе' },
  { value: 'due', label: 'Повторить' },
  { value: 'learned', label: 'Выучено' },
]
const partOfSpeechOptions = [
  { value: 'all' as const, label: 'Все типы' },
  ...(Object.entries(PART_OF_SPEECH_LABELS) as [PartOfSpeech, string][]).map(([value, label]) => ({ value, label })),
]
const statusLabels: Record<WordLearningStatus, string> = {
  new: 'Новое',
  learning: 'В процессе',
  due: 'Повторить',
  learned: 'Выучено',
}

const entries = computed(() => props.words.map((word) => ({
  ...word,
  status: props.getWordLearningStatus(word.greek),
})))

const counts = computed(() => ({
  total: entries.value.length,
  new: entries.value.filter((entry) => entry.status === 'new').length,
  learning: entries.value.filter((entry) => entry.status === 'learning').length,
  due: entries.value.filter((entry) => entry.status === 'due').length,
  learned: entries.value.filter((entry) => entry.status === 'learned').length,
}))

const visibleEntries = computed(() => {
  const query = search.value.trim().toLocaleLowerCase('ru')
  return entries.value.filter((entry) => {
    const matchesStatus = statusFilter.value === 'all' || entry.status === statusFilter.value
    const matchesPartOfSpeech = partOfSpeechFilter.value === 'all' || entry.partOfSpeech.includes(partOfSpeechFilter.value)
    const matchesQuery = !query || [entry.greek, entry.transliteration, entry.russian, entry.category, ...entry.partOfSpeech.map((type) => PART_OF_SPEECH_LABELS[type])]
      .some((value) => value.toLocaleLowerCase('ru').includes(query))
    return matchesStatus && matchesPartOfSpeech && matchesQuery
  })
})
</script>

<template>
  <div class="dictionary-view">
    <section class="dictionary-stats" aria-label="Статистика словаря">
      <button class="dictionary-stat dictionary-stat-total" :class="{ 'is-selected': statusFilter === 'all' }" :aria-pressed="statusFilter === 'all'" aria-label="Показать все слова" @click="statusFilter = 'all'">
        <span>Всего слов</span>
        <strong>{{ counts.total }}</strong>
      </button>
      <button class="dictionary-stat dictionary-stat-learned" :class="{ 'is-selected': statusFilter === 'learned' }" :aria-pressed="statusFilter === 'learned'" aria-label="Показать выученные слова" @click="statusFilter = 'learned'">
        <span>Выучено</span>
        <strong>{{ counts.learned }}</strong>
      </button>
      <button class="dictionary-stat dictionary-stat-due" :class="{ 'is-selected': statusFilter === 'due' }" :aria-pressed="statusFilter === 'due'" aria-label="Показать слова, которые пора повторить" @click="statusFilter = 'due'">
        <span>Пора повторить</span>
        <strong>{{ counts.due }}</strong>
      </button>
      <button class="dictionary-stat dictionary-stat-learning" :class="{ 'is-selected': statusFilter === 'learning' }" :aria-pressed="statusFilter === 'learning'" aria-label="Показать слова в процессе изучения" @click="statusFilter = 'learning'">
        <span>В процессе</span>
        <strong>{{ counts.learning }}</strong>
      </button>
      <button class="dictionary-stat dictionary-stat-new" :class="{ 'is-selected': statusFilter === 'new' }" :aria-pressed="statusFilter === 'new'" aria-label="Показать новые слова" @click="statusFilter = 'new'">
        <span>Новые</span>
        <strong>{{ counts.new }}</strong>
      </button>
    </section>

    <p class="dictionary-note">«Выучено» — интервал до следующего повтора не меньше 21 дня. Слова, которым уже пора на повтор, показаны отдельно.</p>

    <section class="dictionary-panel" aria-label="Общий словарь">
      <div class="dictionary-toolbar">
        <label class="dictionary-search">
          <span class="visually-hidden">Поиск по словарю</span>
          <span aria-hidden="true">⌕</span>
          <input v-model="search" type="search" placeholder="Найти слово или перевод">
        </label>
        <div class="dictionary-filter-group">
          <div class="dictionary-filter">
            <span>Тип</span>
            <SelectRoot v-model="partOfSpeechFilter" class="dictionary-type-combobox">
              <SelectTrigger class="dictionary-type-trigger" aria-label="Фильтр по типу слова">
                <SelectValue placeholder="Все типы" />
                <span class="verb-combobox-chevron" aria-hidden="true"></span>
              </SelectTrigger>
              <SelectPortal>
                <SelectContent class="verb-combobox-content" position="popper" :side-offset="6" :avoid-collisions="true">
                  <SelectViewport>
                    <SelectItem
                      v-for="option in partOfSpeechOptions"
                      :key="option.value"
                      :value="option.value"
                      class="verb-combobox-item dictionary-type-option"
                    ><SelectItemText>{{ option.label }}</SelectItemText></SelectItem>
                  </SelectViewport>
                </SelectContent>
              </SelectPortal>
            </SelectRoot>
          </div>
          <div class="dictionary-filter">
            <span>Статус</span>
            <SelectRoot v-model="statusFilter" class="dictionary-type-combobox">
              <SelectTrigger class="dictionary-type-trigger" aria-label="Фильтр по статусу">
                <SelectValue placeholder="Все статусы" />
                <span class="verb-combobox-chevron" aria-hidden="true"></span>
              </SelectTrigger>
              <SelectPortal>
                <SelectContent class="verb-combobox-content" position="popper" :side-offset="6" :avoid-collisions="true">
                  <SelectViewport>
                    <SelectItem
                      v-for="option in statusOptions"
                      :key="option.value"
                      :value="option.value"
                      class="verb-combobox-item dictionary-type-option"
                    ><SelectItemText>{{ option.label }}</SelectItemText></SelectItem>
                  </SelectViewport>
                </SelectContent>
              </SelectPortal>
            </SelectRoot>
          </div>
        </div>
      </div>

      <div class="dictionary-table-scroll">
        <table class="dictionary-table">
          <thead>
            <tr>
              <th scope="col">Греческий</th>
              <th scope="col">Как читать</th>
              <th scope="col">Перевод</th>
              <th scope="col">Тип слова</th>
              <th scope="col">Статус</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in visibleEntries" :key="entry.greek">
              <td class="dictionary-greek">{{ entry.greek }}</td>
              <td class="dictionary-transliteration">{{ entry.transliteration }}</td>
              <td>{{ entry.russian }}</td>
              <td class="dictionary-part-of-speech">{{ entry.partOfSpeech.map((type) => PART_OF_SPEECH_LABELS[type]).join(', ') }}</td>
              <td><span class="dictionary-status" :class="`status-${entry.status}`">{{ statusLabels[entry.status] }}</span></td>
            </tr>
            <tr v-if="!visibleEntries.length">
              <td colspan="5" class="dictionary-empty">Ничего не найдено. Измените запрос или фильтр.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="dictionary-result-count">Показано слов: {{ visibleEntries.length }}</p>
    </section>
  </div>
</template>
