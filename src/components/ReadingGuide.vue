<script setup lang="ts">
import { consonantPairs, doubleConsonants, vowelLetters, vowelPairs } from '../data/readingRules'
</script>

<template>
  <div class="reading-guide">
    <section class="guide-panel">
      <div class="guide-heading">
        <span class="guide-icon">α</span>
        <div><h2>Гласные</h2><p>Одна буква — один простой звук</p></div>
      </div>
      <div class="vowel-list">
        <article v-for="rule in vowelLetters" :key="rule.letters" class="vowel-row">
          <span class="rule-letters">{{ rule.letters }}</span>
          <span class="rule-arrow">→</span>
          <span class="rule-sound">{{ rule.sound }}</span>
          <span class="rule-example"><strong>{{ rule.example }}</strong><small>{{ rule.pronunciation }}</small></span>
        </article>
      </div>
    </section>

    <section class="guide-panel">
      <div class="guide-heading">
        <span class="guide-icon">αι</span>
        <div><h2>Сочетания гласных</h2><p>В греческом эти пары читаются как один звук</p></div>
      </div>
      <div class="rule-grid">
        <article v-for="rule in vowelPairs" :key="rule.letters" class="rule-card">
          <div class="rule-card-top"><span class="rule-letters">{{ rule.letters }}</span><span class="rule-arrow">→</span><span class="rule-sound">{{ rule.sound }}</span></div>
          <strong class="rule-example-word">{{ rule.example }}</strong>
          <span class="rule-transcription">{{ rule.pronunciation }}</span>
          <span v-if="rule.note" class="rule-note">{{ rule.note }}</span>
        </article>
      </div>
      <p class="guide-footnote"><span>¨</span> Две точки над ι или υ показывают, что гласные читаются раздельно: αϊ — «а-и».</p>
    </section>

    <section class="guide-panel">
      <div class="guide-heading">
        <span class="guide-icon">μπ</span>
        <div><h2>Сочетания согласных</h2><p>Некоторые пары обозначают особый звук</p></div>
      </div>
      <div class="rule-grid consonant-grid">
        <article v-for="rule in consonantPairs" :key="rule.letters" class="rule-card">
          <div class="rule-card-top"><span class="rule-letters">{{ rule.letters }}</span><span class="rule-arrow">→</span><span class="rule-sound">{{ rule.sound }}</span></div>
          <strong class="rule-example-word">{{ rule.example }}</strong>
          <span class="rule-transcription">{{ rule.pronunciation }}</span>
          <span v-if="rule.note" class="rule-note">{{ rule.note }}</span>
        </article>
      </div>
      <p class="guide-footnote"><span>{{ doubleConsonants }}</span> — в стандартном новогреческом удвоенные согласные обычно звучат как один. В кипрской речи некоторые из них произносятся дольше.</p>
    </section>

    <aside class="guide-tip"><span>✦</span> Транскрипция приблизительная. Θ и Δ — межзубные звуки: русские «с» и «з» лишь приближения. Γ перед «э» и «и» смягчается (в записи примерно «й»); точного русского аналога нет.</aside>
  </div>
</template>
