import test from 'node:test'
import assert from 'node:assert/strict'
import { approximateReading } from '../src/data/approximateReading.ts'
import { validateVocabularyData, words } from '../src/data/words.ts'
import { validateVerbData, verbs } from '../src/data/verbs.ts'
import { canImportAnonymousProgress, formatInterval, introducedTodayCount, mergeProgressSnapshots, nextInterval, selectSessionWords } from '../src/lib/studyRules.ts'
import { nextPosition, sessionProgress } from '../src/lib/studySession.ts'

test('review intervals preserve rating order, handle first reviews and cap growth', () => {
  assert.equal(nextInterval('again', 100), 0)
  assert.equal(nextInterval('hard', 0), 1)
  assert.equal(nextInterval('hard', 100), 80)
  assert.equal(nextInterval('good', 0), 3)
  assert.equal(nextInterval('easy', 0), 7)
  assert.equal(nextInterval('easy', 200), 365)
})

test('Russian interval labels use correct day forms', () => {
  assert.equal(formatInterval(1), '1 день')
  assert.equal(formatInterval(2), '2 дня')
  assert.equal(formatInterval(5), '5 дней')
  assert.equal(formatInterval(11), '11 дней')
  assert.equal(formatInterval(21), '21 день')
  assert.equal(formatInterval(24), '24 дня')
  assert.equal(formatInterval(0), '10 мин')
})

test('progress merge keeps the newest review and earliest introduction', () => {
  const local = { слово: { dueAt: 50, intervalDays: 4, repetitions: 2, lapses: 0, lastReviewedAt: 20, introducedAt: 10 } }
  const remote = { слово: { dueAt: 90, intervalDays: 8, repetitions: 3, lapses: 1, lastReviewedAt: 30, introducedAt: 15 } }
  assert.deepEqual(mergeProgressSnapshots(local, remote).слово, { ...remote.слово, introducedAt: 10 })
  assert.equal(mergeProgressSnapshots(remote, local).слово.dueAt, 90)
  const simultaneous = mergeProgressSnapshots(
    { слово: { ...local.слово, reviewId: '00000000-0000-4000-8000-000000000001' } },
    { слово: { ...remote.слово, lastReviewedAt: 20, reviewId: '00000000-0000-4000-8000-000000000002' } },
  )
  assert.equal(simultaneous.слово.dueAt, remote.слово.dueAt)
})

test('anonymous progress import is repeatable only for its owner', () => {
  assert.equal(canImportAnonymousProgress(null, 'account-a'), true)
  assert.equal(canImportAnonymousProgress('pending', 'account-a'), true)
  assert.equal(canImportAnonymousProgress('account-a', 'account-a'), true)
  assert.equal(canImportAnonymousProgress('account-a', 'account-b'), false)
  assert.equal(canImportAnonymousProgress('true', 'account-a'), false)
})

test('daily new-word quota counts first exposure, survives the next day, and keeps unrated exposures available', () => {
  const today = new Date(2026, 9, 8, 12).getTime()
  const tomorrow = new Date(2026, 9, 9, 12).getTime()
  const exposures = { viewed: new Date(2026, 9, 8, 8).getTime() }
  assert.equal(introducedTodayCount(exposures, today), 1)
  assert.equal(introducedTodayCount(exposures, tomorrow), 0)
  assert.deepEqual(selectSessionWords(['viewed', 'fresh1', 'fresh2'], {}, exposures, today, 1, 'today'), ['viewed', 'fresh1'])
  assert.deepEqual(selectSessionWords(['viewed', 'fresh1', 'fresh2'], {}, exposures, today, 1, 'new'), ['viewed', 'fresh1'])
  assert.deepEqual(selectSessionWords(['viewed', 'fresh1'], { viewed: { dueAt: today - 1, intervalDays: 0, repetitions: 0, lapses: 0, lastReviewedAt: today - 10 } }, exposures, today, 10, 'review'), ['viewed'])
})

test('session progress counts rated cards only and skip can complete the last card', () => {
  assert.deepEqual(sessionProgress(0, 3), { completed: 0, total: 3, percent: 0 })
  assert.equal(sessionProgress(1, 3).completed, 1)
  assert.ok(Math.abs(sessionProgress(1, 3).percent - 100 / 3) < Number.EPSILON * 100)
  assert.equal(nextPosition(1, 2), 2)
  assert.equal(sessionProgress(0, 0).percent, 100)
})

test('approximate reading handles accented αυ/ευ and nasal consonant pairs', () => {
  assert.equal(approximateReading('εύκολος'), 'э́фколос')
  assert.equal(approximateReading('αύξηση'), 'а́фксиси')
  assert.equal(approximateReading('αύριο'), 'а́врио')
  assert.equal(approximateReading('μπίρα'), 'би́ра')
  assert.equal(approximateReading('λάμπα'), 'ла́мба')
  assert.equal(approximateReading('ντομάτα'), 'дома́та')
  assert.equal(approximateReading('πέντε'), 'пэ́ндэ')
  assert.equal(approximateReading('αγκαλιά'), 'ангаля́')
  assert.equal(approximateReading('άγχος'), 'а́нхос')
  assert.equal(approximateReading('σφίγξ'), 'сфи́нкс')
  assert.equal(approximateReading('γεια σου'), 'я су')
})

test('vocabulary and verb data have complete, unique references and forms', () => {
  assert.deepEqual(validateVocabularyData(), [])
  assert.deepEqual(validateVerbData(), [])
  assert.ok(validateVocabularyData([words[0], words[0]]).some((error) => error.includes('Duplicate')))
  assert.ok(validateVerbData([verbs[0], verbs[0]]).some((error) => error.includes('Duplicate')))
  const brokenVerb = { ...verbs[0], future: [{ ...verbs[0].future[0], forms: ['θα'] }] }
  assert.ok(validateVerbData([brokenVerb]).some((error) => error.includes('Invalid future')))
})
