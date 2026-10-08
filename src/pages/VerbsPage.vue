<script setup lang="ts">
import { computed, nextTick, shallowRef, useTemplateRef } from 'vue'
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxTrigger,
} from 'reka-ui'
import { approximateReading, VERB_PERSONS, VERB_TENSES, verbs, type FutureAspect, type FutureForm, type VerbEntry, type VerbTense } from '../data/verbs'

const selectedVerb = shallowRef<VerbEntry | null>(verbs[0])
const searchTerm = shallowRef('')
const verbSearchInput = useTemplateRef<HTMLInputElement>('verb-search-input')
const tense = shallowRef<VerbTense>('present')
const futureAspect = shallowRef<FutureAspect>('continuous')
const tenseOptions = Object.entries(VERB_TENSES) as [VerbTense, string][]
const selectedFuture = computed<FutureForm>(() => selectedVerb.value?.future.find((form) => form.aspect === futureAspect.value) ?? selectedVerb.value?.future[0] ?? { aspect: 'single', label: VERB_TENSES.future, forms: [] })
const visibleForms = computed(() => selectedVerb.value
  ? tense.value === 'future' ? selectedFuture.value.forms : selectedVerb.value.forms[tense.value]
  : [])
const visibleTenseLabel = computed(() => tense.value === 'future' ? selectedFuture.value.label : selectedVerb.value?.pastLabel && tense.value === 'past' ? selectedVerb.value.pastLabel : VERB_TENSES[tense.value])
const selectedVerbIndex = computed(() => selectedVerb.value ? verbs.indexOf(selectedVerb.value) : -1)
const verbPosition = computed(() => `${String(selectedVerbIndex.value + 1).padStart(2, '0')} / ${String(verbs.length).padStart(2, '0')}`)
const filteredVerbs = computed(() => {
  const query = searchTerm.value.trim().toLocaleLowerCase('ru')
  return verbs.filter((verb) => !query || `${verb.lemma} ${verb.meaning} ${approximateReading(verb.lemma)}`.toLocaleLowerCase('ru').includes(query))
})

function displayVerb(value: unknown): string {
  return value && typeof value === 'object' && 'lemma' in value
    ? `${(value as VerbEntry).lemma} — ${(value as VerbEntry).meaning}`
    : ''
}

function selectPreviousVerb() {
  if (selectedVerbIndex.value > 0) selectedVerb.value = verbs[selectedVerbIndex.value - 1]
}

function selectNextVerb() {
  if (selectedVerbIndex.value < verbs.length - 1) selectedVerb.value = verbs[selectedVerbIndex.value + 1]
}

async function clearVerbSearch() {
  searchTerm.value = ''
  await nextTick()
  verbSearchInput.value?.focus()
}
</script>

<template>
  <section class="study-area is-verbs" aria-labelledby="page-title">
    <div class="intro">
      <div class="eyebrow"><span class="eyebrow-line"></span>ФОРМЫ И СПРЯЖЕНИЕ</div>
      <h1 id="page-title">Греческие <span>глаголы.</span></h1>
      <p class="intro-copy">Выберите глагол и изучайте его формы по одному времени.</p>
    </div>

    <section class="verbs-panel" aria-label="Спряжение глаголов">
      <div class="verb-picker">
        <label class="verb-select-label" for="verb-search">Глагол</label>
        <ComboboxRoot v-model="selectedVerb" :open-on-focus="true" :ignore-filter="true" class="verb-combobox">
          <ComboboxAnchor class="verb-combobox-anchor">
            <ComboboxInput
              id="verb-search"
              ref="verb-search-input"
              v-model="searchTerm"
              :display-value="displayVerb"
              class="verb-combobox-input"
              placeholder="Найти по-гречески или по-русски"
              autocomplete="off"
            />
            <button
              v-if="selectedVerb"
              type="button"
              class="verb-combobox-clear"
              aria-label="Очистить поиск"
              @click="clearVerbSearch"
            >×</button>
            <ComboboxTrigger class="verb-combobox-trigger" aria-label="Показать список глаголов"><span class="verb-combobox-chevron" aria-hidden="true"></span></ComboboxTrigger>
          </ComboboxAnchor>
          <ComboboxPortal>
            <ComboboxContent class="verb-combobox-content" position="popper" :side-offset="6" :avoid-collisions="true">
              <ComboboxEmpty class="verb-combobox-empty">Ничего не найдено</ComboboxEmpty>
              <ComboboxItem
                v-for="verb in filteredVerbs"
                :key="verb.lemma"
                :value="verb"
                :text-value="`${verb.lemma} ${verb.meaning}`"
                class="verb-combobox-item"
              >
                <span class="verb-option-title"><span class="verb-option-greek" lang="el">{{ verb.lemma }}</span><span aria-hidden="true"> — </span><span>{{ verb.meaning }}</span></span>
                <span class="verb-option-reading">≈ {{ approximateReading(verb.lemma) }}</span>
              </ComboboxItem>
            </ComboboxContent>
          </ComboboxPortal>
        </ComboboxRoot>
        <nav v-if="selectedVerb" class="verb-navigation" aria-label="Перейти к другому глаголу">
          <button type="button" :disabled="selectedVerbIndex === 0" @click="selectPreviousVerb"><span aria-hidden="true">←</span> Предыдущий</button>
          <span class="verb-position" aria-live="polite">{{ verbPosition }}</span>
          <button type="button" :disabled="selectedVerbIndex === verbs.length - 1" @click="selectNextVerb">Следующий <span aria-hidden="true">→</span></button>
        </nav>
      </div>

      <article v-if="selectedVerb" class="verb-card">
        <header class="verb-card-heading">
          <div>
            <h2 lang="el">{{ selectedVerb.lemma }}</h2>
            <span class="verb-reading">≈ {{ approximateReading(selectedVerb.lemma) }}</span>
          </div>
          <span class="verb-meaning">{{ selectedVerb.meaning }}</span>
        </header>

        <div class="tense-tabs" role="tablist" aria-label="Время глагола">
          <button
            v-for="[key, label] in tenseOptions"
            :key="key"
            type="button"
            role="tab"
            :aria-selected="tense === key"
            :class="{ 'is-active': tense === key }"
            @click="tense = key"
          >{{ label }}</button>
        </div>

        <div v-if="tense === 'future' && selectedVerb.future.length > 1" class="future-tabs" role="tablist" aria-label="Вид будущего времени">
          <button
            v-for="form in selectedVerb.future"
            :key="form.aspect"
            type="button"
            role="tab"
            :aria-selected="selectedFuture.aspect === form.aspect"
            :class="{ 'is-active': selectedFuture.aspect === form.aspect }"
            @click="futureAspect = form.aspect"
          >{{ form.label }}</button>
        </div>

        <p v-if="tense === 'past' && selectedVerb.note" class="verb-note">{{ selectedVerb.note }}</p>
        <p v-if="tense === 'future' && selectedFuture.note" class="verb-note">{{ selectedFuture.note }}</p>

        <div class="verb-table-wrap">
          <table class="verb-table">
            <thead>
              <tr>
                <th scope="col">Лицо</th>
                <th scope="col">{{ visibleTenseLabel }}</th>
                <th scope="col">Примерное чтение</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(form, index) in visibleForms" :key="`${selectedVerb.lemma}-${tense}-${selectedFuture.aspect}-${index}`">
                <td data-label="Лицо"><span lang="el" class="verb-person-greek">{{ VERB_PERSONS[index].greek }}</span><span class="verb-person-russian">{{ VERB_PERSONS[index].russian }}</span></td>
                <td data-label="Форма" lang="el" class="verb-form">{{ form }}</td>
                <td data-label="Чтение" class="verb-reading">≈ {{ approximateReading(form) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <p v-else class="verb-empty-selection">Выберите глагол из списка, чтобы увидеть его формы.</p>

      <p class="verbs-hint">Чтение дано приблизительно. В будущем перед формой ставится частица θα.</p>
    </section>
  </section>
</template>
