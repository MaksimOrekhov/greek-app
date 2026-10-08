import { onMounted, onUnmounted, shallowRef } from 'vue'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import {
  activateProgressScope,
  getProgressSnapshot,
  getIntroductionsSnapshot,
  mergeProgress,
  mergeIntroductions,
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
  introduced_at: string | null
  review_id?: string | null
}

interface CloudIntroduction { word_id: string; first_introduced_at: string }

const user = shallowRef<User | null>(null)
const readyUserId = shallowRef<string | null>(null)
const status = shallowRef<CloudStatus>('local')
const errorMessage = shallowRef('')
let activeUserId: string | null | undefined
let sessionRevision = 0
let uploadQueue = Promise.resolve()
let retryTimer: number | undefined
let retryCount = 0

function scheduleRetry(userId: string, revision: number) {
  if (retryTimer !== undefined || retryCount >= 3 || revision !== sessionRevision) return
  const delay = 5_000 * 2 ** retryCount++
  retryTimer = window.setTimeout(() => {
    retryTimer = undefined
    if (navigator.onLine && revision === sessionRevision && user.value?.id === userId) void syncAccount(userId, revision)
  }, delay)
}

function fromCloud(rows: CloudWordProgress[]): ProgressByWord {
  return Object.fromEntries(rows.flatMap((row) => {
    const item = {
      dueAt: Date.parse(row.due_at),
      intervalDays: Number(row.interval_days),
      repetitions: Number(row.repetitions),
      lapses: Number(row.lapses),
      lastReviewedAt: Date.parse(row.last_reviewed_at),
      introducedAt: row.introduced_at ? Date.parse(row.introduced_at) : undefined,
      reviewId: row.review_id ?? undefined,
    }
    return Number.isFinite(item.dueAt) && Number.isFinite(item.lastReviewedAt)
      && Number.isFinite(item.intervalDays) && item.intervalDays >= 0
      && Number.isFinite(item.repetitions) && item.repetitions >= 0
      && Number.isFinite(item.lapses) && item.lapses >= 0
      && (item.introducedAt === undefined || Number.isFinite(item.introducedAt))
      ? [[row.word_id, item]]
      : []
  }))
}

function toCloud(userId: string) {
  return Object.entries(getProgressSnapshot())
    .map(([wordId, item]) => ({
    user_id: userId,
    word_id: wordId,
    due_at: new Date(item.dueAt).toISOString(),
    interval_days: item.intervalDays,
    repetitions: item.repetitions,
    lapses: item.lapses,
    last_reviewed_at: new Date(item.lastReviewedAt).toISOString(),
    introduced_at: item.introducedAt === undefined ? null : new Date(item.introducedAt).toISOString(),
    review_id: item.reviewId ?? null,
    }))
}

function introductionsToCloud(userId: string) {
  return Object.entries(getIntroductionsSnapshot()).map(([word_id, timestamp]) => ({
    user_id: userId,
    word_id,
    first_introduced_at: new Date(timestamp).toISOString(),
  }))
}

function hasPendingCloudChanges(local: ProgressByWord, remote: ProgressByWord, localIntroductions: Record<string, number>, remoteIntroductions: Record<string, number>) {
  const hasNewerProgress = Object.entries(local).some(([wordId, item]) => {
    const cloud = remote[wordId]
    return !cloud || item.lastReviewedAt > cloud.lastReviewedAt
      || (item.lastReviewedAt === cloud.lastReviewedAt && Boolean(item.reviewId) && (!cloud.reviewId || item.reviewId! > cloud.reviewId))
  })
  const hasEarlierIntroductions = Object.entries(localIntroductions).some(([wordId, timestamp]) => remoteIntroductions[wordId] === undefined || timestamp < remoteIntroductions[wordId])
  return hasNewerProgress || hasEarlierIntroductions
}

async function syncAccount(userId: string, revision = sessionRevision) {
  if (!supabase) return
  status.value = 'loading'
  errorMessage.value = ''

  const [{ data, error }, { data: introductionData, error: introductionError }] = await Promise.all([
    supabase.from('word_progress')
      .select('word_id, due_at, interval_days, repetitions, lapses, last_reviewed_at, introduced_at, review_id')
      .eq('user_id', userId),
    supabase.from('word_introductions').select('word_id, first_introduced_at').eq('user_id', userId),
  ])

  if (revision !== sessionRevision) return
  if (error || introductionError) {
    status.value = 'error'
    errorMessage.value = 'Не удалось загрузить прогресс из облака. Локальные данные сохранены.'
    scheduleRetry(userId, revision)
    return
  }

  const remoteProgress = fromCloud((data ?? []) as CloudWordProgress[])
  const remoteIntroductions = Object.fromEntries(((introductionData ?? []) as CloudIntroduction[]).flatMap((row) => {
    const timestamp = Date.parse(row.first_introduced_at)
    return Number.isFinite(timestamp) ? [[row.word_id, timestamp]] : []
  }))
  mergeProgress(remoteProgress)
  mergeIntroductions(remoteIntroductions)
  if (hasPendingCloudChanges(getProgressSnapshot(), remoteProgress, getIntroductionsSnapshot(), remoteIntroductions)) await uploadProgress(userId, revision)
  else status.value = 'synced'
}

async function uploadProgress(userId: string, revision = sessionRevision) {
  const client = supabase
  if (!client) return
  const upload = async () => {
    if (revision !== sessionRevision) return
    status.value = 'syncing'
    errorMessage.value = ''
    let synchronized = false
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const rows = toCloud(userId)
      const [{ error }, { error: introductionsError }] = await Promise.all([
        rows.length ? client.rpc('merge_word_progress', { p_rows: rows }) : Promise.resolve({ error: null }),
        client.rpc('merge_word_introductions', { p_rows: introductionsToCloud(userId) }),
      ])
      if (revision !== sessionRevision) return
      if (error || introductionsError) {
        status.value = 'error'
        errorMessage.value = 'Прогресс сохранён на устройстве, но не синхронизирован.'
        scheduleRetry(userId, revision)
        return
      }
      const [{ data: confirmedRows, error: confirmError }, { data: confirmedIntroductions, error: confirmIntroductionError }] = await Promise.all([
        client.from('word_progress').select('word_id, due_at, interval_days, repetitions, lapses, last_reviewed_at, introduced_at, review_id').eq('user_id', userId),
        client.from('word_introductions').select('word_id, first_introduced_at').eq('user_id', userId),
      ])
      if (revision !== sessionRevision) return
      if (confirmError || confirmIntroductionError) {
        status.value = 'error'
        errorMessage.value = 'Не удалось проверить результат синхронизации. Локальные данные сохранены.'
        scheduleRetry(userId, revision)
        return
      }
      const remoteProgress = fromCloud((confirmedRows ?? []) as CloudWordProgress[])
      const remoteIntroductions = Object.fromEntries(((confirmedIntroductions ?? []) as CloudIntroduction[]).flatMap((row) => {
        const timestamp = Date.parse(row.first_introduced_at)
        return Number.isFinite(timestamp) ? [[row.word_id, timestamp]] : []
      }))
      mergeProgress(remoteProgress)
      mergeIntroductions(remoteIntroductions)
      if (!hasPendingCloudChanges(getProgressSnapshot(), remoteProgress, getIntroductionsSnapshot(), remoteIntroductions)) {
        synchronized = true
        break
      }
    }
    if (!synchronized) {
      status.value = 'error'
      errorMessage.value = 'Есть новые изменения, которые пока не удалось синхронизировать.'
      scheduleRetry(userId, revision)
      return
    }
    retryCount = 0
    if (retryTimer !== undefined) window.clearTimeout(retryTimer)
    retryTimer = undefined
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
    if (retryTimer !== undefined) window.clearTimeout(retryTimer)
    retryTimer = undefined
    retryCount = 0
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

    // Hydrate any persisted sign-in explicitly instead of relying only on the
    // initial auth event to start the cloud progress load.
    void supabase.auth.getSession().then(({ data: sessionData, error }) => {
      if (error) {
        status.value = 'error'
        errorMessage.value = 'Не удалось проверить сессию и загрузить прогресс.'
        return
      }
      void handleSession(sessionData.session?.user ?? null)
    })

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
    if (retryTimer !== undefined) window.clearTimeout(retryTimer)
    retryTimer = undefined
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

  async function syncRatedWord(_wordId: string) {
    const userId = user.value?.id
    if (userId && readyUserId.value === userId) await uploadProgress(userId, sessionRevision)
  }

  async function syncIntroducedWord(_wordId: string) {
    const userId = user.value?.id
    if (userId && readyUserId.value === userId) await uploadProgress(userId, sessionRevision)
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
    syncIntroducedWord,
  }
}
