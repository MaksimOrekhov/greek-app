<script setup lang="ts">
export type StudyLanguage = 'greek' | 'russian'

defineProps<{ modelValue: StudyLanguage }>()
const emit = defineEmits<{ 'update:modelValue': [value: StudyLanguage] }>()
</script>

<template>
  <div class="mode-control" role="group" aria-label="Язык на лицевой стороне карточки">
    <span class="mode-label">Сначала показывать</span>
    <div class="mode-options">
      <button
        class="mode-option"
        :class="{ 'is-selected': modelValue === 'greek' }"
        :aria-pressed="modelValue === 'greek'"
        @click="emit('update:modelValue', 'greek')"
      >
        Ελληνικά
      </button>
      <button
        class="mode-option"
        :class="{ 'is-selected': modelValue === 'russian' }"
        :aria-pressed="modelValue === 'russian'"
        @click="emit('update:modelValue', 'russian')"
      >
        Русский
      </button>
    </div>
  </div>
</template>
