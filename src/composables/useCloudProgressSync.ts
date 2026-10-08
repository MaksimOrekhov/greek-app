import { onMounted, onUnmounted, shallowRef } from 'vue'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import {
  activateProgressScope,
  getProgressSnapshot,
  mergeProgress,
  type ProgressByWord,
} from './useSpacedRepetition'

export type CloudStatus = 'local' | 'loading' | 'synced' | 'syncing' | 'link-sent' | 'error'

interface CloudWordProgress {
  word_id: string
  due_at: string
  interval_days: number
  repetitions: number
  lapses: number
  last_reviewed_at: string
}

const user = shallowRef<User | null>(null)
const readyUserId = shallowRef<string | null>(null)
const status = shallowRef<CloudStatus>('local')
const errorMessage = shallowRef('')
let activeUserId: string | null | undefined
let sessionRevision = 0
let uploadQueue = Promise.resolve()

function fromCloud(rows: CloudWordProgress[]): ProgressByWord {
  return Object.fromEntries(rows.flatMap((row) => {
    const item = {
      dueAt: Date.parse(row.due_at),
      intervalDays: Number(row.interval_days),
      repetitions: Number(row.repetitions),
      lapses: Number(row.lapses),
      lastReviewedAt: Date.parse(row.last_reviewed_at),
    }
    return Number.isFinite(item.dueAt) && Number.isFinite(item.lastReviewedAt)
      && Number.isFinite(item.intervalDays) && item.intervalDays >= 0
      && Number.isFinite(item.repetitions) && item.repetitions >= 0
      && Number.isFinite(item.lapses) && item.lapses >= 0
      ? [[row.word_id, item]]
      : []
  }))
}

function toCloud(userId: string, onlyWordId?: string) {
  return Object.entries(getProgressSnapshot())
    .filter(([wordId]) => !onlyWordId || wordId === onlyWordId)
    .map(([wordId, item]) => ({
    user_id: userId,
    word_id: wordId,
    due_at: new Date(item.dueAt).toISOString(),
    interval_days: item.intervalDays,
    repetitions: item.repetitions,
    lapses: item.lapses,
    last_reviewed_at: new Date(item.lastReviewedAt).toISOString(),
    }))
}

async function syncAccount(userId: string, revision = sessionRevision) {
  if (!supabase) return
  status.value = 'loading'
  errorMessage.value = ''

  const { data, error } = await supabase
    .from('word_progress')
    .select('word_id, due_at, interval_days, repetitions, lapses, last_reviewed_at')
    .eq('user_id', userId)

  if (revision !== sessionRevision) return
  if (error) {
    status.value = 'error'
    errorMessage.value = 'Не удалось загрузить прогресс из облака. Локальные данные сохранены.'
    return
  }

  const merged = mergeProgress(fromCloud((data ?? []) as CloudWordProgress[]))
  if (Object.keys(merged).length) await uploadProgress(userId, revision)
  else status.value = 'synced'
}

async function uploadProgress(userId: string, revision = sessionRevision, onlyWordId?: string) {
  const client = supabase
  if (!client) return
  const upload = async () => {
    if (revision !== sessionRevision) return
    const rows = toCloud(userId, onlyWordId)
    if (!rows.length) {
      status.value = 'synced'
      return
    }

    status.value = 'syncing'
    errorMessage.value = ''
    const { error } = await client.from('word_progress').upsert(rows, { onConflict: 'user_id,word_id' })
    if (revision !== sessionRevision) return
    if (error) {
      status.value = 'error'
      errorMessage.value = 'Прогресс сохранён на устройстве, но не синхронизирован.'
      return
    }
    status.value = 'synced'
  }

  const queuedUpload = uploadQueue.then(upload, upload)
  uploadQueue = queuedUpload.then(() => undefined, () => undefined)
  await queuedUpload
}

async function handleSession(nextUser: User | null) {
  const nextUserId = nextUser?.id ?? null
  user.value = nextUser
  errorMessage.value = ''

  const scopeChanged = nextUserId !== activeUserId
  if (scopeChanged) {
    sessionRevision += 1
    readyUserId.value = null
    activateProgressScope(nextUserId)
    activeUserId = nextUserId
  }

  if (nextUserId && scopeChanged) {
    const revision = sessionRevision
    await syncAccount(nextUserId, revision)
    if (revision === sessionRevision) readyUserId.value = nextUserId
  }
  else if (!nextUserId) status.value = 'local'
}

export function useCloudProgressSync() {
  let unsubscribe: (() => void) | undefined
  let onOnline: (() => void) | undefined
  let onVisibilityChange: (() => void) | undefined

  onMounted(() => {
    if (!supabase) return

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer database work until Supabase has released its auth-state lock.
      window.setTimeout(() => void handleSession(session?.user ?? null), 0)
    })
    unsubscribe = () => data.subscription.unsubscribe()
    onOnline = () => {
      const userId = user.value?.id
      if (userId) void syncAccount(userId)
    }
    onVisibilityChange = () => {
      const userId = user.value?.id
      if (userId && document.visibilityState === 'visible') void syncAccount(userId)
    }
    window.addEventListener('online', onOnline)
    document.addEventListener('visibilitychange', onVisibilityChange)
  })

  onUnmounted(() => {
    unsubscribe?.()
    if (onOnline) window.removeEventListener('online', onOnline)
    if (onVisibilityChange) document.removeEventListener('visibilitychange', onVisibilityChange)
  })

  async function sendSignInLink(email: string) {
    if (!supabase) return
    status.value = 'loading'
    errorMessage.value = ''
    const redirectUrl = new URL(import.meta.env.BASE_URL, window.location.origin).toString()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectUrl },
    })
    if (error) {
      status.value = 'error'
      errorMessage.value = 'Не удалось отправить ссылку. Проверьте адрес и настройки Supabase.'
      return
    }
    status.value = 'link-sent'
  }

  async function signOut() {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) {
      status.value = 'error'
      errorMessage.value = 'Не удалось выйти из аккаунта.'
    }
  }

  async function syncRatedWord(wordId: string) {
    const userId = user.value?.id
    if (userId) await uploadProgress(userId, sessionRevision, wordId)
  }

  return {
    configured: Boolean(supabase),
    user,
    readyUserId,
    status,
    errorMessage,
    sendSignInLink,
    signOut,
    syncRatedWord,
  }
}
