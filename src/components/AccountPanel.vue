<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import type { CloudStatus } from '../composables/useCloudProgressSync'

const props = defineProps<{
  configured: boolean
  userEmail: string | null
  status: CloudStatus
  message: string
}>()

const emit = defineEmits<{
  sendLink: [email: string]
  signOut: []
}>()

const isOpen = shallowRef(false)
const email = shallowRef('')
const statusLabel = computed(() => ({
  local: 'Сохранение на устройстве',
  loading: 'Подключаемся…',
  synced: 'Прогресс синхронизирован',
  syncing: 'Сохраняем прогресс…',
  'link-sent': 'Ссылка отправлена на почту',
  error: 'Ошибка синхронизации',
}[props.status]))

function submitEmail() {
  const value = email.value.trim()
  if (value) emit('sendLink', value)
}
</script>

<template>
  <div class="account-control">
    <button class="account-trigger" :aria-expanded="isOpen" @click="isOpen = !isOpen">
      <span class="account-status-dot" :class="{ 'is-connected': userEmail }"></span>
      {{ userEmail ? 'Аккаунт' : 'Синхронизация' }}
    </button>
    <section v-if="isOpen" class="account-popover" aria-label="Аккаунт и синхронизация">
      <template v-if="userEmail">
        <strong class="account-title">{{ userEmail }}</strong>
        <p class="account-status">{{ statusLabel }}</p>
        <p v-if="message" class="account-message">{{ message }}</p>
        <button class="account-submit account-signout" @click="emit('signOut')">Выйти</button>
      </template>
      <template v-else-if="configured">
        <strong class="account-title">Синхронизация прогресса</strong>
        <p class="account-status">Войдите по ссылке из письма, чтобы продолжить на другом устройстве.</p>
        <form class="account-form" @submit.prevent="submitEmail">
          <label for="account-email">Электронная почта</label>
          <input id="account-email" v-model="email" type="email" autocomplete="email" required placeholder="you@example.com">
          <button class="account-submit" :disabled="status === 'loading'" type="submit">Получить ссылку</button>
        </form>
        <p v-if="status === 'link-sent'" class="account-message">Проверьте почту и откройте ссылку на этом устройстве.</p>
        <p v-if="message" class="account-error">{{ message }}</p>
      </template>
      <template v-else>
        <strong class="account-title">Синхронизация не настроена</strong>
        <p class="account-status">Прогресс пока хранится только в этом браузере.</p>
      </template>
    </section>
  </div>
</template>
