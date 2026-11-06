import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { compileScript, parse } from '@vue/compiler-sfc'
import ts from 'typescript'
import { useReadingComprehensionSession } from '../src/composables/useReadingComprehensionSession.ts'
import { READING_TEXT_COUNT, readingTexts, readingGenreLabels } from '../src/data/trainers/readingTexts.ts'
import { trainerRoutes } from '../src/data/trainers/routes.ts'
import {
  emptyReadingHistory,
  loadReadingHistory,
  reconcileReadingHistory,
  rememberReadingRound,
  READING_HISTORY_KEY,
  READING_HISTORY_VERSION,
  saveReadingHistory,
  type ReadingHistoryStorage,
} from '../src/lib/trainers/readingComprehension/readingHistory.ts'
import {
  advanceReadingSession,
  checkReadingRound,
  createReadingSession,
  getReadingSessionResults,
  selectReadingOption,
} from '../src/lib/trainers/readingComprehension/readingSession.ts'

function seeded(seed: number): () => number {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 0x100000000
  }
}

class MemoryStorage implements ReadingHistoryStorage {
  values = new Map<string, string>()
  unavailable = false

  getItem(key: string): string | null {
    if (this.unavailable) throw new Error('Storage unavailable')
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    if (this.unavailable) throw new Error('Storage unavailable')
    this.values.set(key, value)
  }
}

test('T7 bank matches its reviewed counts and keeps evidence inside each passage', () => {
  assert.equal(readingTexts.length, READING_TEXT_COUNT)
  assert.ok(readingTexts.filter((text) => text.level === 'A1').length >= 8)
  assert.ok(readingTexts.filter((text) => text.level === 'A2').length >= 9)
  assert.equal(new Set(readingTexts.map((text) => text.id)).size, READING_TEXT_COUNT)
  assert.equal(new Set(readingTexts.map((text) => text.genreId)).size, Object.keys(readingGenreLabels).length)
  assert.equal(readingTexts.flatMap((text) => text.questions).length, READING_TEXT_COUNT * 3)
  assert.equal(new Set(readingTexts.flatMap((text) => text.questions.map((question) => question.id))).size, READING_TEXT_COUNT * 3)

  const textSignatures = new Set<string>()
  const questionSignatures = new Set<string>()
  for (const text of readingTexts) {
    assert.ok(text.greek.trim() && text.translationRu.trim(), text.id)
    const wordCount = text.greek.trim().split(/\s+/).length
    if (text.level === 'A1') assert.ok(wordCount >= 30 && wordCount <= 65, `${text.id}: ${wordCount}`)
    else assert.ok(wordCount >= 65 && wordCount <= 120, `${text.id}: ${wordCount}`)
    const textSignature = text.greek.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase()
    assert.ok(!textSignatures.has(textSignature), text.id)
    textSignatures.add(textSignature)
    assert.equal(text.questions.length, 3, text.id)

    for (const question of text.questions) {
      assert.ok(question.promptRu.trim() && question.explanationRu.trim(), question.id)
      assert.equal(question.options.length, 3, question.id)
      assert.equal(new Set(question.options.map((option) => option.id)).size, 3, question.id)
      assert.equal(new Set(question.options.map((option) => option.textRu.trim().toLocaleLowerCase())).size, 3, question.id)
      assert.equal(question.options.filter((option) => option.id === question.correctOptionId).length, 1, question.id)
      assert.ok(question.options.every((option) => option.textRu.trim() && option.feedbackRu.trim()), question.id)
      assert.ok(question.evidenceEl.length > 0 && question.evidenceEl.every((evidence) => text.greek.includes(evidence)), question.id)
      const questionSignature = question.promptRu.normalize('NFC').trim().toLocaleLowerCase()
      assert.ok(!questionSignatures.has(questionSignature), question.id)
      questionSignatures.add(questionSignature)
    }
  }
})

test('T7.1 targeted content corrections keep questions independent and evidence aligned', () => {
  const text = (id: string) => readingTexts.find((item) => item.id === id)!
  const question = (textId: string, questionId: string) =>
    text(textId).questions.find((item) => item.id === questionId)!

  const ad = text('r-a1-ad-desk')
  const adQuestionTwo = question(ad.id, 'r-a1-ad-desk-q2')
  assert.equal(adQuestionTwo.promptRu, 'Сколько ящиков указано в объявлении?')
  assert.doesNotMatch(adQuestionTwo.promptRu, /стол/i)
  assert.deepEqual(adQuestionTwo.options.map((option) => option.textRu), ['Два.', 'Один.', 'Четыре.'])
  assert.match(ad.greek, /Πουλάω ένα μικρό γραφείο/)
  assert.doesNotMatch(ad.greek, /κατάλληλο|παραλαβή|πωλήτρια/)

  const center = text('r-a1-notice-center')
  const centerQuestionThree = question(center.id, 'r-a1-notice-center-q3')
  assert.match(center.greek, /Το μάθημα είναι δωρεάν, αλλά τηλεφωνήστε πριν έρθετε\./)
  assert.doesNotMatch(center.greek, /τηλεφωνική κράτηση|Η είσοδος/)
  assert.match(center.translationRu, /перед приходом позвоните/)
  assert.ok(centerQuestionThree.options.some((option) => option.textRu === 'Позвонить до прихода.'))
  assert.equal(centerQuestionThree.options.find((option) => option.id === centerQuestionThree.correctOptionId)?.textRu, 'Позвонить до прихода.')
  assert.match(centerQuestionThree.explanationRu, /позвонить/)
  assert.doesNotMatch(centerQuestionThree.options.map((option) => option.textRu + option.feedbackRu).join(' '), /нужна запись|записаться/)

  const workQuestionOne = question('r-a2-work-hours', 'r-a2-work-hours-q1')
  const workQuestionTwo = question('r-a2-work-hours', 'r-a2-work-hours-q2')
  assert.equal(workQuestionOne.skillId, 'purpose')
  assert.equal(workQuestionOne.promptRu, 'Для чего с понедельника офис открывается раньше?')
  assert.deepEqual(workQuestionOne.options.map((option) => option.textRu), [
    'Чтобы обслуживать клиентов до начала их рабочего дня.',
    'Чтобы офис закрывался раньше вечером.',
    'Чтобы встречаться с клиентами в выходные.',
  ])
  assert.equal(workQuestionOne.options.find((option) => option.id === workQuestionOne.correctOptionId)?.textRu,
    'Чтобы обслуживать клиентов до начала их рабочего дня.')
  assert.doesNotMatch(workQuestionOne.promptRu + workQuestionOne.options.map((option) => option.textRu).join(' '), /среду|электрическ|до десяти/i)
  assert.equal(workQuestionTwo.promptRu, 'Почему в среду офис откроется позже?')
  assert.match(workQuestionTwo.explanationRu, /электрической системы/)
  const workNotice = text('r-a2-work-hours')
  assert.equal(workNotice.genreId, 'customer-notice')
  assert.match(workNotice.greek, /^Αγαπητοί πελάτες,/)
  assert.match(workNotice.greek, /σας εξυπηρετούμε καλύτερα πριν από τη δουλειά σας/)
  assert.match(workNotice.greek, /Αν έχετε ραντεβού.*παρακαλούμε να μας τηλεφωνήσετε/)
  assert.match(workNotice.translationRu, /^Уважаемые клиенты,/)
  assert.doesNotMatch(workNotice.greek + workNotice.translationRu, /συνάδελφοι|коллеги/)
  assert.equal(workQuestionTwo.options.find((option) => option.id === workQuestionTwo.correctOptionId)?.textRu,
    'Будут проверять электрическую систему.')
  assert.equal(question(workNotice.id, 'r-a2-work-hours-q3').options.find((option) =>
    option.id === question(workNotice.id, 'r-a2-work-hours-q3').correctOptionId)?.textRu,
  'Тем, у кого встреча назначена до десяти.')

  const petros = text('r-a2-story-petros')
  assert.match(petros.greek, /ο Πέτρος/)
  assert.match(petros.greek, /Στον δρόμο αγόρασε/)
  assert.doesNotMatch(petros.greek, /Στο δρόμο/)
  assert.match(petros.translationRu, /Петрос/)
  assert.doesNotMatch(JSON.stringify(petros), /Петрис/)
  const petrosQuestionOne = question(petros.id, 'r-a2-story-petros-q1')
  assert.doesNotMatch(petrosQuestionOne.options.slice(1).map((option) => option.textRu).join(' '), /автобус|кофе/i)

  const elena = text('r-a1-story-elena')
  assert.match(elena.greek, /Το απόγευμα/)
  assert.match(elena.translationRu, /После обеда/)
  assert.doesNotMatch(elena.translationRu, /Днём/)
  const weekend = text('r-a2-email-weekend')
  assert.match(weekend.greek, /Το απόγευμα/)
  assert.match(weekend.translationRu, /После обеда/)
  assert.doesNotMatch(weekend.translationRu, /Днём/)

  const timetable = text('r-a1-timetable-line3')
  assert.equal(timetable.contextNoteRu, 'Учебное расписание. Маршрут вымышленный.')
  assert.match(timetable.greek, /Η γραμμή 3 ξεκινά/)
  assert.match(timetable.greek, /Το μάθημα της Μαρίας στο Κέντρο Γειτονιάς αρχίζει στις εννέα\. Εκείνη παίρνει τη γραμμή 3\./)
  assert.doesNotMatch(timetable.greek, /γι[’'] αυτό περιμένει στην πλατεία/)
  assert.doesNotMatch(timetable.translationRu, /поэтому она ждёт на площади/)
  assert.doesNotMatch(timetable.greek, /Για την άσκηση|φανταστικ/)
  assert.doesNotMatch(timetable.translationRu, /вымышлен|упражнен/i)
  assert.equal(question(timetable.id, 'r-a1-timetable-line3-q1').options.find((option) =>
    option.id === question(timetable.id, 'r-a1-timetable-line3-q1').correctOptionId)?.textRu,
  'От площади Элиас.')
  const timetableQuestionTwo = question(timetable.id, 'r-a1-timetable-line3-q2')
  assert.deepEqual(timetableQuestionTwo.options.map((option) => option.textRu), ['В 8:20.', 'В 8:15.', 'В 8:25.'])
  assert.equal(timetableQuestionTwo.options.find((option) => option.id === timetableQuestionTwo.correctOptionId)?.textRu, 'В 8:20.')
  const timetableQuestionThree = question(timetable.id, 'r-a1-timetable-line3-q3')
  assert.equal(timetableQuestionThree.options.find((option) => option.id === timetableQuestionThree.correctOptionId)?.textRu, 'В девять.')
  assert.equal(timetableQuestionThree.skillId, 'specific-information')
  assert.ok(timetableQuestionThree.evidenceEl.every((fragment) => timetable.greek.includes(fragment)))
  assert.match(timetableQuestionThree.explanationRu, /В расписании.*девять/)
  assert.doesNotMatch(timetableQuestionThree.explanationRu, /карте|маршруте/)

  const invitationQuestionTwo = question('r-a1-invitation-anna', 'r-a1-invitation-anna-q2')
  assert.equal(invitationQuestionTwo.skillId, 'purpose')
  assert.doesNotMatch(invitationQuestionTwo.options.filter((option) => option.id !== invitationQuestionTwo.correctOptionId).map((option) => option.textRu).join(' '), /праздник|музык/i)
  const sophiaQuestionTwo = question('r-a2-story-sophia', 'r-a2-story-sophia-q2')
  assert.equal(sophiaQuestionTwo.skillId, 'sequence')
  assert.equal(sophiaQuestionTwo.promptRu, 'В каком порядке София искала ключи?')
  assert.equal(sophiaQuestionTwo.options.find((option) => option.id === sophiaQuestionTwo.correctOptionId)?.textRu,
    'Сначала в сумке, потом на кухонном столе, в конце у двери.')
  assert.ok(sophiaQuestionTwo.evidenceEl.every((fragment) => text('r-a2-story-sophia').greek.includes(fragment)))

  const posterQuestionOne = question('r-a2-poster-films', 'r-a2-poster-films-q1')
  assert.doesNotMatch(posterQuestionOne.options.slice(1).map((option) => option.textRu).join(' '), /только один фильм/i)
  assert.equal(question('r-a2-poster-films', 'r-a2-poster-films-q2').skillId, 'specific-information')
  assert.equal(question('r-a2-poster-films', 'r-a2-poster-films-q3').skillId, 'specific-information')

  const deliveryQuestionThree = question('r-a2-delivery-notice', 'r-a2-delivery-notice-q3')
  assert.equal(deliveryQuestionThree.skillId, 'specific-information')
  assert.doesNotMatch(deliveryQuestionThree.options.slice(1).map((option) => option.textRu).join(' '), /суббот|офис закрыт/i)
  const libraryQuestionTwo = question('r-a2-library-message', 'r-a2-library-message-q2')
  assert.equal(libraryQuestionTwo.skillId, 'specific-information')
  assert.doesNotMatch(libraryQuestionTwo.options.slice(1).map((option) => option.textRu).join(' '), /друг/i)

  const skillCounts = Object.fromEntries(
    [...new Set(readingTexts.flatMap((item) => item.questions.map((entry) => entry.skillId)))].sort().map((skill) => [
      skill,
      readingTexts.flatMap((item) => item.questions).filter((entry) => entry.skillId === skill).length,
    ]),
  )
  assert.deepEqual(skillCounts, {
    'cause-effect': 9,
    purpose: 4,
    sequence: 3,
    'specific-information': 35,
  })
})

test('T7.2 corrects invitation, recipe, courtesy, deadlines, and route logic', () => {
  const text = (id: string) => readingTexts.find((item) => item.id === id)!
  const question = (textId: string, questionId: string) =>
    text(textId).questions.find((item) => item.id === questionId)!
  const answer = (item: ReturnType<typeof question>) =>
    item.options.find((option) => option.id === item.correctOptionId)!

  const invitation = text('r-a1-invitation-anna')
  const invitationQ1 = question(invitation.id, 'r-a1-invitation-anna-q1')
  const invitationQ2 = question(invitation.id, 'r-a1-invitation-anna-q2')
  const invitationQ3 = question(invitation.id, 'r-a1-invitation-anna-q3')
  assert.equal(answer(invitationQ1).textRu, 'Приглашает их на праздник.')
  assert.equal(answer(invitationQ2).textRu, 'Чтобы узнать, сколько человек придёт.')
  assert.equal(answer(invitationQ3).textRu, 'Сладкое.')
  assert.doesNotMatch(invitationQ2.options.filter((option) => option.id !== invitationQ2.correctOptionId).map((option) => option.textRu).join(' '), /праздник|музык/i)
  assert.match(invitation.translationRu, /не позднее пятницы/)
  assert.match(invitationQ2.promptRu, /не позднее пятницы/)

  const saladQ1 = question('r-a2-instructions-salad', 'r-a2-instructions-salad-q1')
  const saladQ2 = question('r-a2-instructions-salad', 'r-a2-instructions-salad-q2')
  const saladQ3 = question('r-a2-instructions-salad', 'r-a2-instructions-salad-q3')
  assert.equal(answer(saladQ1).textRu, 'Вымыть помидоры и огурец и нарезать их.')
  assert.equal(answer(saladQ2).textRu, 'Чтобы помидоры не размялись.')
  assert.equal(answer(saladQ3).textRu, 'В конце.')
  assert.deepEqual(saladQ3.options.filter((option) => option.id !== saladQ3.correctOptionId).map((option) => option.textRu), [
    'До начала приготовления салата.',
    'После подачи на стол.',
  ])
  const saladQuestionThreeSurface = [saladQ3.promptRu, ...saladQ3.options.flatMap((option) => [option.textRu, option.feedbackRu])].join(' ')
  assert.doesNotMatch(saladQuestionThreeSurface, /вымыть|нарезать|помидор|огурец/i)

  const delivery = text('r-a2-delivery-notice')
  const deliveryQ2 = question(delivery.id, 'r-a2-delivery-notice-q2')
  const deliveryQ3 = question(delivery.id, 'r-a2-delivery-notice-q3')
  assert.match(delivery.greek, /μέχρι την Παρασκευή/)
  assert.match(delivery.greek, /τηλεφωνήστε μέχρι αύριο/)
  assert.match(delivery.translationRu, /не позднее пятницы/)
  assert.match(delivery.translationRu, /не позднее завтрашнего дня/)
  assert.equal(deliveryQ2.promptRu, 'Какой последний день для получения посылки в офисе?')
  assert.match(answer(deliveryQ2).textRu, /Не позднее пятницы/)
  assert.match(deliveryQ2.explanationRu, /не позднее пятницы/)
  assert.match(answer(deliveryQ3).textRu, /не позднее завтрашнего дня/)
  assert.match(deliveryQ3.explanationRu, /не позднее завтрашнего дня/)
  assert.doesNotMatch(delivery.translationRu + deliveryQ2.options.map((option) => option.textRu + option.feedbackRu).join(' ') + deliveryQ3.options.map((option) => option.textRu + option.feedbackRu).join(' '), /до пятницы|до завтра/i)
  assert.match(text('r-a2-library-message').translationRu, /не позднее пятницы/)

  const timetable = text('r-a1-timetable-line3')
  assert.match(timetable.greek, /Η γραμμή 3 ξεκινά από την Πλατεία Ελιάς στις 8:10/)
  assert.match(timetable.greek, /περνά από την αγορά στις 8:20/)
  assert.match(timetable.greek, /Το μάθημα της Μαρίας στο Κέντρο Γειτονιάς αρχίζει στις εννέα/)
  assert.doesNotMatch(timetable.greek, /γι[’'] αυτό περιμένει|όχι στην αγορά/)
  assert.ok(timetable.questions.every((item) => item.evidenceEl.every((fragment) => timetable.greek.includes(fragment))))
})

test('T7 sessions build five distinct rounds, rising from two A1 texts to three A2 texts', () => {
  const signatures = new Set<string>()
  for (let seed = 0; seed < 100; seed += 1) {
    const session = createReadingSession(readingTexts, seeded(seed))
    assert.equal(session.rounds.length, 5)
    assert.deepEqual(session.rounds.map((round) => round.questions.length), [2, 2, 2, 2, 2])
    assert.deepEqual(session.rounds.map((round) => round.text.level), ['A1', 'A1', 'A2', 'A2', 'A2'])
    assert.equal(new Set(session.rounds.map((round) => round.text.id)).size, 5)
    const selected = session.rounds.flatMap((round) => round.questions)
    assert.equal(selected.length, 10)
    assert.equal(new Set(selected.map((item) => item.question.id)).size, 10)
    assert.ok(session.rounds.every((round) => round.questions.every((item) =>
      item.optionOrder.length === 3 && new Set(item.optionOrder).size === 3,
    )))
    signatures.add(JSON.stringify(session.rounds.map((round) => [
      round.text.id,
      round.questions.map((item) => [item.question.id, item.optionOrder]),
    ])))
  }
  assert.ok(signatures.size >= 95, `Only ${signatures.size} distinct seeded sessions`)
})

test('both answers are required and checked together; selections lock only after round check', () => {
  let session = createReadingSession(readingTexts, seeded(27))
  const round = session.rounds[0]!
  assert.equal(checkReadingRound(session).outcome, 'no-selection')
  assert.equal(advanceReadingSession(session).outcome, 'not-checked')

  const first = round.questions[0]!
  const second = round.questions[1]!
  const firstWrong = first.question.options.find((option) => option.id !== first.question.correctOptionId)!
  const secondCorrect = second.question.correctOptionId
  session = selectReadingOption(session, first.question.id, firstWrong.id).session
  assert.equal(checkReadingRound(session).outcome, 'no-selection')
  assert.equal(session.rounds[0]!.questions.every((item) => !item.checked), true)
  session = selectReadingOption(session, first.question.id, first.question.correctOptionId).session
  session = selectReadingOption(session, second.question.id, secondCorrect).session
  assert.equal(session.rounds[0]!.questions[0]!.selectedOptionId, first.question.correctOptionId)
  assert.equal(checkReadingRound(session).outcome, 'checked')
  session = checkReadingRound(session).session
  assert.equal(session.rounds[0]!.checked, true)
  assert.equal(session.rounds[0]!.questions.every((item) => item.checked), true)
  assert.equal(session.rounds[0]!.questions.every((item) => item.isCorrect !== null), true)
  assert.equal(selectReadingOption(session, first.question.id, firstWrong.id).outcome, 'already-checked')
  assert.equal(checkReadingRound(session).outcome, 'already-checked')
  assert.equal(advanceReadingSession(session).outcome, 'advanced')
  session = advanceReadingSession(session).session
  assert.equal(session.currentRoundIndex, 1)
})

test('new page 53–55 reading items have three independent A1 questions with checked evidence', () => {
  const student = readingTexts.find((text) => text.id === 'r-a1-student-after-class')!
  const kiosk = readingTexts.find((text) => text.id === 'r-a1-kiosk-postage')!
  assert.ok(student && kiosk)
  assert.equal(student.level, 'A1')
  assert.equal(kiosk.level, 'A1')
  assert.match(student.greek, /πανεπιστήμιο|σπουδάζω|πληρώνω/)
  assert.match(kiosk.greek, /περίπτερο|γραμματόσημο|ρέστα/)
  for (const text of [student, kiosk]) {
    for (const question of text.questions) {
      assert.ok(question.evidenceEl.every((evidence) => text.greek.includes(evidence)), question.id)
      assert.equal(question.options.filter((option) => option.id === question.correctOptionId).length, 1, question.id)
    }
    const questionFacts = text.questions.map((question) => [question.promptRu, question.options.map((option) => option.textRu).join(' '), question.explanationRu].join(' '))
    assert.equal(new Set(questionFacts).size, 3, text.id)
  }
  assert.equal(student.questions[0]!.correctOptionId, 'near-home')
  assert.equal(student.questions[1]!.correctOptionId, 'ten')
  assert.equal(student.questions[2]!.correctOptionId, 'book')
  assert.equal(kiosk.questions[0]!.correctOptionId, 'no-change')
  assert.equal(kiosk.questions[1]!.correctOptionId, 'stamp-chocolate')
  assert.equal(kiosk.questions[2]!.correctOptionId, 'twenty-cents')
})

test('a text round can score zero, one, or two correct and a full session reports ten questions', () => {
  const scoreRound = (correctCount: number) => {
    let session = createReadingSession(readingTexts, seeded(31))
    const round = session.rounds[0]!
    round.questions.forEach((item, index) => {
      const optionId = index < correctCount
        ? item.question.correctOptionId
        : item.question.options.find((option) => option.id !== item.question.correctOptionId)!.id
      session = selectReadingOption(session, item.question.id, optionId).session
    })
    session = checkReadingRound(session).session
    return session.rounds[0]!.questions.filter((item) => item.isCorrect).length
  }
  assert.equal(scoreRound(0), 0)
  assert.equal(scoreRound(1), 1)
  assert.equal(scoreRound(2), 2)

  let session = createReadingSession(readingTexts, seeded(39))
  for (let index = 0; index < 5; index += 1) {
    const round = session.rounds[session.currentRoundIndex]!
    for (const item of round.questions) session = selectReadingOption(session, item.question.id, item.question.correctOptionId).session
    session = checkReadingRound(session).session
    session = advanceReadingSession(session).session
  }
  assert.equal(session.completed, true)
  assert.deepEqual(getReadingSessionResults(session), {
    textsRead: 5,
    totalTexts: 5,
    totalQuestions: 10,
    correctAnswers: 10,
    errors: 0,
    accuracyPercent: 100,
    completedRounds: 5,
    totalRounds: 5,
  })
  assert.equal(advanceReadingSession(session).outcome, 'session-completed')
})

test('T7 history records only checked rounds, once each, and leaves unfinished texts unseen', () => {
  const storage = new MemoryStorage()
  const exercise = useReadingComprehensionSession({ storage, random: seeded(12) })
  exercise.start()
  assert.equal(storage.values.size, 0)
  const round = exercise.currentRound.value!
  exercise.selectOption(round.questions[0]!.question.id, round.questions[0]!.question.correctOptionId)
  exercise.checkRound()
  assert.equal(storage.values.size, 0)
  exercise.selectOption(round.questions[1]!.question.id, round.questions[1]!.question.correctOptionId)
  exercise.checkRound()
  const firstSaved = storage.getItem(READING_HISTORY_KEY)
  let history = loadReadingHistory(readingTexts, storage)
  assert.deepEqual(history.recentTextIds, [round.text.id])
  assert.deepEqual(new Set(history.recentQuestionIds), new Set(round.questions.map((item) => item.question.id)))
  exercise.checkRound()
  assert.equal(storage.getItem(READING_HISTORY_KEY), firstSaved)
  exercise.advance()
  const nextTextId = exercise.currentRound.value!.text.id
  const reentry = useReadingComprehensionSession({ storage, random: seeded(12) })
  reentry.start()
  history = loadReadingHistory(readingTexts, storage)
  assert.equal(history.recentTextIds.includes(nextTextId), false)
  assert.equal(history.recentTextIds.length, 1)

  const fullStorage = new MemoryStorage()
  const full = useReadingComprehensionSession({ storage: fullStorage, random: seeded(44) })
  full.start()
  for (let index = 0; index < 5; index += 1) {
    const current = full.currentRound.value!
    for (const item of current.questions) full.selectOption(item.question.id, item.question.correctOptionId)
    full.checkRound()
    full.advance()
  }
  assert.equal(loadReadingHistory(readingTexts, fullStorage).recentTextIds.length, 5)
  assert.equal(loadReadingHistory(readingTexts, fullStorage).recentQuestionIds.length, 10)
  assert.doesNotThrow(() => { full.start(); full.checkRound() })
})

test('T7 history is versioned, bounded, reconciles removed content, and tolerates unavailable storage', () => {
  const storage = new MemoryStorage()
  saveReadingHistory(emptyReadingHistory(), storage)
  assert.equal(JSON.parse(storage.getItem(READING_HISTORY_KEY)!).version, READING_HISTORY_VERSION)
  const firstText = readingTexts[0]!
  let history = emptyReadingHistory()
  for (let index = 0; index < 90; index += 1) {
    history = rememberReadingRound(history, { ...firstText, id: `text-${index}` }, [
      { ...firstText.questions[0]!, id: `question-${index}` },
    ])
  }
  assert.equal(history.recentTextIds.length, 60)
  assert.equal(history.recentQuestionIds.length, 90)
  const reconciled = reconcileReadingHistory({
    version: READING_HISTORY_VERSION,
    recentTextIds: [firstText.id, 'removed-text'],
    recentQuestionIds: [firstText.questions[0]!.id, 'removed-question'],
  }, readingTexts)
  assert.deepEqual(reconciled.recentTextIds, [firstText.id])
  assert.deepEqual(reconciled.recentQuestionIds, [firstText.questions[0]!.id])
  storage.values.set(READING_HISTORY_KEY, '{bad json')
  assert.deepEqual(loadReadingHistory(readingTexts, storage), emptyReadingHistory())
  storage.unavailable = true
  assert.deepEqual(loadReadingHistory(readingTexts, storage), emptyReadingHistory())
  assert.doesNotThrow(() => saveReadingHistory(history, storage))
  assert.doesNotThrow(() => createReadingSession(readingTexts, seeded(5), emptyReadingHistory()))
})

test('100 fixed seeds and ten history-backed sessions cover the bank without within-session repeats', () => {
  for (let seed = 0; seed < 100; seed += 1) {
    const session = createReadingSession(readingTexts, seeded(seed + 1000))
    assert.equal(new Set(session.rounds.map((round) => round.text.id)).size, 5)
    assert.equal(new Set(session.rounds.flatMap((round) => round.questions.map((item) => item.question.id))).size, 10)
  }

  let history = emptyReadingHistory()
  const random = seeded(20261105)
  const textOccurrences = new Map<string, number>()
  const questionIds = new Set<string>()
  let repeatsInsideSession = 0
  const levelCoverage = new Set<string>()
  const genreCoverage = new Set<string>()
  for (let launch = 0; launch < 10; launch += 1) {
    let session = createReadingSession(readingTexts, random, history)
    const selectedTextIds = session.rounds.map((round) => round.text.id)
    repeatsInsideSession += selectedTextIds.length - new Set(selectedTextIds).size
    for (const round of session.rounds) {
      textOccurrences.set(round.text.id, (textOccurrences.get(round.text.id) ?? 0) + 1)
      levelCoverage.add(round.text.level)
      genreCoverage.add(round.text.genreId)
    }
    for (let index = 0; index < 5; index += 1) {
      const round = session.rounds[session.currentRoundIndex]!
      for (const item of round.questions) {
        questionIds.add(item.question.id)
        session = selectReadingOption(session, item.question.id, item.question.correctOptionId).session
      }
      session = checkReadingRound(session).session
      history = rememberReadingRound(history, round.text, round.questions.map((item) => item.question))
      session = advanceReadingSession(session).session
    }
  }
  assert.equal(textOccurrences.size, READING_TEXT_COUNT)
  assert.equal(questionIds.size, READING_TEXT_COUNT * 3)
  assert.deepEqual(levelCoverage, new Set(['A1', 'A2']))
  assert.equal(genreCoverage.size, Object.keys(readingGenreLabels).length)
  assert.equal(repeatsInsideSession, 0)
  assert.equal([...textOccurrences.values()].reduce((sum, count) => sum + count - 1, 0), 50 - READING_TEXT_COUNT)
})

test('history rotation covers the full text bank within four sessions across 100 fixed seeds', () => {
  for (let seed = 0; seed < 100; seed += 1) {
    let history = emptyReadingHistory()
    const random = seeded(seed + 7000)
    const seenTextIds = new Set<string>()

    for (let launch = 0; launch < Math.ceil(READING_TEXT_COUNT / 5); launch += 1) {
      let session = createReadingSession(readingTexts, random, history)
      for (let roundIndex = 0; roundIndex < 5; roundIndex += 1) {
        const round = session.rounds[session.currentRoundIndex]!
        seenTextIds.add(round.text.id)
        for (const item of round.questions) {
          session = selectReadingOption(session, item.question.id, item.question.correctOptionId).session
        }
        session = checkReadingRound(session).session
        history = rememberReadingRound(history, round.text, round.questions.map((item) => item.question))
        session = advanceReadingSession(session).session
      }
    }

    assert.equal(seenTextIds.size, READING_TEXT_COUNT, `Seed ${seed} did not cover every text in three sessions`)
  }
})

test('the T7 route and UI keep both answers together and hide the translation until checking', async () => {
  assert.equal(trainerRoutes.find((route) => route.path === '/trainers/reading-comprehension')?.name, 'trainer-reading-comprehension')
  const filename = new URL('../src/components/trainers/ReadingComprehensionExercise.vue', import.meta.url)
  const source = readFileSync(filename, 'utf8')
  assert.match(source, /<fieldset[^>]*:disabled="round\.checked"/)
  assert.match(source, /aria-pressed="item\.selectedOptionId === option\.id"/)
  assert.match(source, /role="status" aria-live="polite"/)
  assert.match(source, /lang="el"/)
  assert.match(source, /@media \(max-width: 520px\)/)
  assert.match(source, /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(source, /Проверить ответы/)
  assert.doesNotMatch(source, /<input\b/)

  const { descriptor } = parse(source, { filename: filename.pathname })
  const compiled = compileScript(descriptor, { id: 'reading-comprehension-regression', inlineTemplate: true })
  let code = ts.transpileModule(compiled.content, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText
  code = code
    .replaceAll('"vue"', JSON.stringify(import.meta.resolve('vue')))
    .replaceAll("'vue'", JSON.stringify(import.meta.resolve('vue')))
    .replaceAll("'../../data/trainers/readingTexts.ts'", JSON.stringify(new URL('../src/data/trainers/readingTexts.ts', import.meta.url).href))
    .replaceAll("'../../lib/trainers/readingComprehension/readingSession.ts'", JSON.stringify(new URL('../src/lib/trainers/readingComprehension/readingSession.ts', import.meta.url).href))
  const component = (await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)).default
  const session = createReadingSession(readingTexts, seeded(18))
  const round = session.rounds[0]!
  const props = { round, totalRounds: 5 }
  const before = await renderToString(createSSRApp(component, props))
  assert.ok(before.includes(round.text.greek))
  assert.ok(before.includes('<h2 class="reading-title" tabindex="-1">Прочитай текст</h2>'))
  assert.ok(!before.includes(round.text.translationRu))
  for (const item of round.questions) {
    assert.ok(!before.includes(item.question.explanationRu))
    for (const option of item.question.options) assert.ok(!before.includes(option.feedbackRu))
  }
  assert.ok(!before.includes(session.rounds[1]!.text.greek))
  for (const item of round.questions) item.selectedOptionId = item.question.correctOptionId
  const cannotPartiallyCheck = await renderToString(createSSRApp(component, props))
  assert.ok(!cannotPartiallyCheck.includes(round.text.translationRu))
  round.questions.forEach((item) => { item.checked = true; item.isCorrect = true })
  round.checked = true
  const after = await renderToString(createSSRApp(component, props))
  assert.ok(after.includes(round.text.translationRu))
  for (const item of round.questions) {
    assert.ok(after.includes(item.question.explanationRu))
    for (const evidence of item.question.evidenceEl) assert.ok(after.includes(evidence))
  }

  const timetable = readingTexts.find((item) => item.id === 'r-a1-timetable-line3')!
  const timetableRound = {
    number: 1,
    text: timetable,
    questions: timetable.questions.slice(0, 2).map((question) => ({
      question,
      optionOrder: question.options.map((option) => option.id),
      selectedOptionId: null,
      checked: false,
      isCorrect: null,
    })),
    checked: false,
    completed: false,
  }
  const timetableBeforeCheck = await renderToString(createSSRApp(component, {
    round: timetableRound,
    totalRounds: 5,
  }))
  const noteIndex = timetableBeforeCheck.indexOf(timetable.contextNoteRu!)
  const passageIndex = timetableBeforeCheck.indexOf(timetable.greek)
  assert.ok(noteIndex >= 0 && noteIndex < passageIndex)
  assert.ok(!timetableBeforeCheck.includes(timetable.translationRu))
})
