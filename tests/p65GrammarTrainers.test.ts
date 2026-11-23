import test from 'node:test'
import assert from 'node:assert/strict'
import { trainerPairSets } from '../src/data/trainers/pairSets.ts'
import { trainerFillGapQuestions } from '../src/data/trainers/fillGapQuestions.ts'
import { getTrainerTopic } from '../src/data/trainers/topics.ts'
import { advanceTrainerSession, createTrainerSession, getTrainerSessionResults, submitTrainerMatch } from '../src/lib/trainers/session.ts'
import { generatedFillGapTemplates } from '../src/lib/trainers/fillGap/fillGapGenerator.ts'
import { advanceFillGapSession, checkFillGapAnswer, createFillGapSession, getFillGapSessionResults, restartFillGapSession, selectFillGapOption } from '../src/lib/trainers/fillGap/fillGapSession.ts'
import { adjectiveReference, objectPronounReference, seArticleReference } from './fixtures/p65GrammarReference.ts'

function seeded(seed: number) {
  let state = seed
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0
    return state / 4294967296
  }
}

const references = {
  'object-pronouns': Object.fromEntries(Object.entries(objectPronounReference).map(([id, [, reply]]) => [id, reply])),
  'se-article': seArticleReference,
  'adjective-agreement': adjectiveReference,
}

for (const [topic, reference] of Object.entries(references)) {
  test(topic + ' fixed cloze has exactly one reviewed completion for each context', () => {
    const questions = trainerFillGapQuestions.filter((question) => question.topicId === topic)
    assert.equal(questions.length, Object.keys(reference).length)
    assert.deepEqual(generatedFillGapTemplates(topic), [])
    assert.deepEqual(getTrainerTopic(topic)?.availableExercises, ['match-pairs', 'fill-gaps'])
    for (const question of questions) {
      const id = question.id.slice(topic.length + 1)
      const phrase = reference[id]
      assert.ok(phrase, question.id)
      const matching = question.options.filter((option) =>
        new RegExp('(?:^|[^\\p{L}])' + phrase + '(?=$|[^\\p{L}])', 'u')
          .test(question.sentenceBefore + option.text + question.sentenceAfter),
      )
      assert.deepEqual(matching.map((option) => option.id), [question.correctOptionId], question.id)
      if (topic === 'object-pronouns') {
        const [referent, , gender] = objectPronounReference[id]!
        assert.ok(question.sentenceBefore.includes(referent), question.id)
        const next = question.sentenceAfter.trim().toLocaleLowerCase('el')
        const keepNu = /^(?:[αάεέηήιίϊΐοόυύϋΰωώκπτξψ]|μπ|ντ|γκ)/u.test(next)
        const clitics = ['τον', keepNu ? 'την' : 'τη', 'το']
        assert.deepEqual(question.options.map((option) => option.text.toLocaleLowerCase('el')).sort(), [...clitics].sort())
        assert.equal(matching[0]!.text.toLocaleLowerCase('el'), clitics[['m', 'f', 'n'].indexOf(gender)])
      }
    }
  })

  test(topic + ' runs five rounds in T1 and T3 over 100 seeds and supports restart', () => {
    const pairs = trainerPairSets[topic]!.pairs
    assert.equal(pairs.length, 16)
    const allMatches = new Set<string>()
    const allQuestions = new Set<string>()
    const firstRoundSignatures = new Set<string>()
    for (let seed = 1; seed <= 100; seed += 1) {
      let t1 = createTrainerSession(topic, pairs, seeded(seed))
      let t3 = createFillGapSession(topic, trainerFillGapQuestions, seeded(seed))
      assert.equal(t1.rounds.length, 5)
      assert.equal(t3.rounds.length, 5)
      firstRoundSignatures.add(t1.rounds[0]!.leftOrder.join('|'))
      for (const round of t1.rounds) {
        const offered = round.pairs
        assert.equal(new Set(offered.map((pair) => pair.prompt)).size, 4)
        assert.equal(new Set(offered.map((pair) => pair.answer)).size, 4)
        for (const pair of offered) {
          allMatches.add(pair.id)
          const result = submitTrainerMatch(t1, pair.id, pair.id)
          assert.equal(result.outcome, 'correct')
          t1 = result.session
        }
        t1 = advanceTrainerSession(t1)
      }
      assert.equal(getTrainerSessionResults(t1).foundPairs, 20)
      assert.ok(t1.completed)
      const ids = new Set<string>()
      for (const round of t3.rounds) {
        assert.equal(round.questions.length, 2)
        for (const { question } of round.questions) {
          ids.add(question.id)
          allQuestions.add(question.id)
          t3 = selectFillGapOption(t3, question.correctOptionId).session
          const checked = checkFillGapAnswer(t3)
          assert.equal(checked.outcome, 'checked')
          assert.equal(checkFillGapAnswer(checked.session).outcome, 'already-checked')
          t3 = advanceFillGapSession(checked.session)
        }
      }
      assert.equal(ids.size, 10)
      assert.equal(getFillGapSessionResults(t3).correctAnswers, 10)
      assert.ok(t3.completed)
      if (seed <= 10) {
        const nextT1 = createTrainerSession(topic, pairs, seeded(seed), t1)
        const nextT3 = restartFillGapSession(t3, trainerFillGapQuestions, [], seeded(seed))
        assert.equal(nextT1.completed, false)
        assert.notDeepEqual(nextT1.rounds.map((round) => round.rightOrder), t1.rounds.map((round) => round.rightOrder))
        assert.equal(nextT3.currentQuestionIndex, 0)
        assert.equal(nextT3.completed, false)
        assert.ok(nextT3.rounds.every((round) => round.questions.every((question) => question.isCorrect === null)))
      }
    }
    assert.equal(allMatches.size, 16)
    assert.equal(allQuestions.size, Object.keys(reference).length)
    assert.ok(firstRoundSignatures.size > 10)
  })
}
