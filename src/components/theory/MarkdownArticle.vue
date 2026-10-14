<script setup lang="ts">
import { computed } from 'vue'
import { renderTheoryMarkdown } from '../../data/theory/markdown'

const props = defineProps<{ source: string; variant: 'summary' | 'explanation' }>()
const html = computed(() => renderTheoryMarkdown(props.source))
</script>

<template>
  <div class="theory-markdown" :class="`is-${variant}`" v-html="html"></div>
</template>

<style scoped>
.theory-markdown { color: #565a50; font-size: 14px; line-height: 1.75; }
.theory-markdown :deep(h2) { margin: 29px 0 10px; color: #34392f; font: 700 19px/1.35 'Manrope', sans-serif; letter-spacing: -.35px; scroll-margin-top: 20px; }
.theory-markdown :deep(h2:first-child) { margin-top: 0; }
.theory-markdown :deep(p) { margin: 10px 0; }
.theory-markdown :deep(strong) { color: #3e4938; font-weight: 700; }
.theory-markdown :deep(a) { color: #52654a; text-decoration-thickness: 1px; text-underline-offset: 3px; }
.theory-markdown :deep(ul) { margin: 10px 0; padding-left: 22px; }
.theory-markdown :deep(li + li) { margin-top: 5px; }
.theory-markdown :deep(.table-wrap) { overflow-x: auto; }
.theory-markdown :deep(table) { width: 100%; min-width: 610px; margin: 14px 0; border-collapse: collapse; text-align: left; }
.theory-markdown :deep(th), .theory-markdown :deep(td) { padding: 10px 12px; border-bottom: 1px solid #e9e8e1; white-space: nowrap; }
.theory-markdown :deep(th) { background: #f3f4ee; color: #71776b; font-size: 12px; font-weight: 700; }
.theory-markdown :deep(td) { color: #444a40; }
.theory-markdown :deep(code) { padding: 2px 5px; border-radius: 5px; background: #f0f1eb; color: #48533f; font-family: 'Noto Sans Greek', monospace; }
.theory-markdown :deep(hr) { margin: 24px 0; border: 0; border-top: 1px solid #e9e8e1; }
.theory-markdown.is-summary { font-size: 13px; }
</style>
