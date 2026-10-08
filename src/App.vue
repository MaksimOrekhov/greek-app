<script setup lang="ts">
import { computed } from 'vue'
import AccountPanel from './components/AccountPanel.vue'
import { useCloudProgressSync } from './composables/useCloudProgressSync'

const {
  configured: cloudConfigured,
  user: cloudUser,
  readyUserId: cloudReadyUserId,
  status: cloudStatus,
  errorMessage: cloudMessage,
  sendSignInLink,
  signOut,
  syncRatedWord,
  syncIntroducedWord,
} = useCloudProgressSync()
const accountEmail = computed(() => cloudUser.value?.email ?? null)
</script>

<template>
  <main class="page-shell">
    <header class="topbar">
      <RouterLink class="brand" to="/cards" aria-label="Λέξη — карточки">
        <span class="brand-mark">λ</span>
        <span class="brand-name">λέξη<span class="brand-period">.</span></span>
      </RouterLink>

      <nav class="primary-nav" aria-label="Главное меню">
        <RouterLink to="/cards" active-class="is-active"><span aria-hidden="true">▤</span> Карточки</RouterLink>
        <RouterLink to="/reading" active-class="is-active"><span aria-hidden="true">Αβ</span> Как читать</RouterLink>
        <RouterLink to="/dictionary" active-class="is-active"><span aria-hidden="true">☷</span> Словарь</RouterLink>
        <RouterLink to="/verbs" active-class="is-active"><span aria-hidden="true">ῥ</span> Глаголы</RouterLink>
      </nav>

      <div class="topbar-actions">
        <div class="topbar-level"><span class="level-spark">✳</span> С нуля</div>
        <AccountPanel
          :configured="cloudConfigured"
          :user-email="accountEmail"
          :status="cloudStatus"
          :message="cloudMessage"
          @send-link="sendSignInLink"
          @sign-out="signOut"
        />
      </div>
    </header>

    <RouterView v-slot="{ Component, route }">
      <component
        :is="Component"
        v-if="route.name === 'cards'"
        :ready-user-id="cloudReadyUserId"
        :sync-rated-word="syncRatedWord"
        :sync-introduced-word="syncIntroducedWord"
      />
      <component :is="Component" v-else />
    </RouterView>

    <footer class="page-footer">
      <span>Μικρά βήματα, μεγάλη πρόοδος</span>
      <span class="footer-divider"></span>
      <span>Маленькие шаги — большой прогресс</span>
    </footer>
    <span class="decor decor-left" aria-hidden="true">α</span>
    <span class="decor decor-right" aria-hidden="true">ω</span>
  </main>
</template>
