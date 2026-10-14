import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createMemoryHistory, createRouter } from 'vue-router'
import { getTheoryTopic, theoryTopics, validateTheoryTopics } from '../src/data/theory/topics.ts'
import { theoryRoutes } from '../src/data/theory/routes.ts'
import { renderTheoryMarkdown } from '../src/data/theory/markdown.ts'

test('theory topic registry has complete metadata, unique IDs, and valid related references', () => {
  assert.deepEqual(validateTheoryTopics(), [])
  assert.ok(validateTheoryTopics([...theoryTopics, theoryTopics[0]!]).some((error) => error.includes('Повторяется идентификатор')))
  assert.ok(validateTheoryTopics([{ ...theoryTopics[0]!, related: ['missing-topic'] }]).some((error) => error.includes('неизвестную тему')))
})

test('registered topic content exists and both Markdown files render successfully', async () => {
  for (const topic of theoryTopics) {
    for (const file of [topic.summary, topic.explanation]) {
      const source = await readFile(resolve('src/data/theory', file), 'utf8')
      const html = renderTheoryMarkdown(source)
      assert.match(html, /<(p|table|h2|ul)\b/)
      assert.doesNotMatch(html, /<script\b/i)
    }
  }
})

test('unknown topics are handled without falling back to another article', () => {
  assert.equal(getTheoryTopic('unknown-topic'), undefined)
})

test('theory catalog and topic routes resolve, including direct topic URLs', () => {
  const router = createRouter({ history: createMemoryHistory(), routes: [...theoryRoutes, { path: '/:pathMatch(.*)*', name: 'not-found', component: { template: '<div />' } }] })
  assert.equal(router.resolve('/theory').name, 'theory')
  const directTopic = router.resolve('/theory/definite-article?explanation=1')
  assert.equal(directTopic.name, 'theory-topic')
  assert.equal(directTopic.params.topicId, 'definite-article')
  assert.equal(directTopic.query.explanation, '1')
  const unknownTopic = router.resolve('/theory/not-real')
  assert.equal(unknownTopic.name, 'theory-topic')
  assert.equal(getTheoryTopic(String(unknownTopic.params.topicId)), undefined)
})

test('Markdown output disables raw HTML and adds anchor IDs and scroll wrappers for tables', () => {
  const html = renderTheoryMarkdown('# Раздел один\n\n<table><script>alert(1)</script></table>\n\n| Форма | Значение |\n| --- | --- |\n| ο | он |')
  assert.match(html, /id="раздел-один"/)
  assert.match(html, /class="table-wrap"/)
  assert.doesNotMatch(html, /<script>/)
  assert.match(html, /&lt;script&gt;/)
})
