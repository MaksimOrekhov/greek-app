import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createMemoryHistory, createRouter } from 'vue-router'
import { getTheoryTopic, theoryTopics, validateTheoryTopics } from '../src/data/theory/topics.ts'
import { legacyReadingRoute, theoryRoutes } from '../src/data/theory/routes.ts'
import { renderTheoryMarkdown } from '../src/data/theory/markdown.ts'
import { resolveScrollBehavior, shouldOpenTheoryExplanation } from '../src/lib/scrollBehavior.ts'

test('theory topic registry has complete metadata, unique IDs, and valid related references', () => {
  assert.deepEqual(validateTheoryTopics(), [])
  assert.ok(validateTheoryTopics([...theoryTopics, theoryTopics[0]!]).some((error) => error.includes('Повторяется идентификатор')))
  assert.ok(validateTheoryTopics([{ ...theoryTopics[0]!, related: ['missing-topic'] }]).some((error) => error.includes('неизвестную тему')))
})

test('article and gender topics link to each other and the definite article', () => {
  const definite = getTheoryTopic('definite-article')!
  const indefinite = getTheoryTopic('indefinite-article')!
  const gender = getTheoryTopic('noun-gender')!
  assert.deepEqual(definite.related, ['indefinite-article', 'noun-gender', 'noun-masculine', 'noun-cases', 'personal-pronouns-accusative'])
  assert.deepEqual(indefinite.related, ['definite-article', 'noun-gender'])
  assert.deepEqual(gender.related, ['definite-article', 'indefinite-article', 'noun-cases', 'noun-masculine', 'noun-feminine', 'noun-neuter', 'adjective-agreement'])
  assert.equal(indefinite.category, 'Грамматика')
  assert.equal(gender.category, 'Грамматика')
})

test('weak genitive pronouns topic covers possessive and object uses', async () => {
  const pronouns = getTheoryTopic('personal-pronouns-genitive')!
  assert.equal(pronouns.category, 'Грамматика')
  assert.deepEqual(pronouns.related, ['noun-cases', 'definite-article', 'personal-pronouns-accusative'])

  const summary = await readFile(resolve('src/data/theory', pronouns.summary), 'utf8')
  for (const form of ['**μου**', '**σου**', '**του**', '**της**', '**μας**', '**σας**', '**τους**']) {
    assert.ok(summary.includes(form), `missing pronoun form: ${form}`)
  }

  const explanation = await readFile(resolve('src/data/theory', pronouns.explanation), 'utf8')
  for (const example of ['Το σπίτι μου είναι εδώ.', 'Μου αρέσει ο καφές.', 'Μας δίνουν ένα βιβλίο.', 'Πες μου!']) {
    assert.ok(explanation.includes(example), `missing pronoun example: ${example}`)
  }
  assert.ok(explanation.includes('Некоторые слабые формы совпадают по написанию'))
})

test('numbers topic is registered under its own category and links to related grammar topics', async () => {
  const numbers = getTheoryTopic('numbers-0-20')!
  assert.equal(numbers.title, 'Числительные от 0 до 20')
  assert.equal(numbers.greekTitle, 'Αριθμοί από το 0 έως το 20')
  assert.equal(numbers.category, 'Числительные')
  assert.deepEqual(numbers.related, ['indefinite-article', 'noun-gender', 'ordinal-numbers'])
  assert.ok(numbers.keywords.includes('числительные'))

  const summary = await readFile(resolve('src/data/theory', numbers.summary), 'utf8')
  const entries = summary.split('\n').filter((line) => /^\|\s*\d+\s*\|/.test(line))
  assert.equal(entries.length, 21)
  assert.match(entries[0]!, /^\| 0 \| μηδέν /)
  assert.match(entries[20]!, /^\| 20 \| είκοσι /)

  const explanation = await readFile(resolve('src/data/theory', numbers.explanation), 'utf8')
  for (const form of ['ένας φίλος', 'μία φίλη', 'ένα παιδί', 'τρεις φίλοι', 'τρία παιδιά', 'τέσσερις φίλες', 'τέσσερα παιδιά', 'δεκατρείς φίλοι', 'δεκατριών', 'δεκατέσσερις', 'δεκατεσσάρων', 'μηδενός']) {
    assert.ok(explanation.includes(form), `missing numeral example or form: ${form}`)
  }
})

test('numbers 20-100 topic is searchable, registered, and explains compound agreement', async () => {
  const numbers = getTheoryTopic('numbers-20-100')!
  assert.equal(numbers.title, 'Числительные от 20 до 100')
  assert.equal(numbers.greekTitle, 'Αριθμοί από το 20 έως το 100')
  assert.equal(numbers.category, 'Числительные')
  assert.deepEqual(numbers.related, ['numbers-0-20', 'noun-gender'])
  for (const keyword of ['числа', 'числительные', 'десятки', '100']) {
    assert.ok(numbers.keywords.includes(keyword), `missing search keyword: ${keyword}`)
  }

  const summary = await readFile(resolve('src/data/theory', numbers.summary), 'utf8')
  for (const form of ['20 | είκοσι', '30 | τριάντα', '40 | σαράντα', '50 | πενήντα', '60 | εξήντα', '70 | εβδομήντα', '80 | ογδόντα', '90 | ενενήντα', '100 | εκατό']) {
    assert.ok(summary.includes(form), `missing tens form: ${form}`)
  }

  const explanation = await readFile(resolve('src/data/theory', numbers.explanation), 'utf8')
  for (const form of ['είκοσι ένας φίλοι', 'τριάντα μία φίλες', 'σαράντα ένα παιδιά', 'είκοσι τρεις φίλοι', 'είκοσι τέσσερα παιδιά', 'είκοσι τριών χρονών', 'είκοσι έναν φίλους', 'είκοσι επτά / είκοσι εφτά', 'εκατό ευρώ']) {
    assert.ok(explanation.includes(form), `missing compound numeral form: ${form}`)
  }

  const route = createRouter({ history: createMemoryHistory(), routes: theoryRoutes }).resolve('/theory/numbers-20-100?explanation=1')
  assert.equal(route.name, 'theory-topic')
  assert.equal(route.params.topicId, 'numbers-20-100')
  assert.equal(route.query.explanation, '1')
})

test('numbers 100-200 Markdown omits the duplicate page title', async () => {
  const numbers = getTheoryTopic('numbers-100-200')!
  const summary = await readFile(resolve('src/data/theory', numbers.summary), 'utf8')
  const explanation = await readFile(resolve('src/data/theory', numbers.explanation), 'utf8')

  assert.doesNotMatch(summary, /^# Числительные от 100 до 200$/m)
  assert.doesNotMatch(explanation, /^# Числительные от 100 до 200$/m)
  assert.match(renderTheoryMarkdown(summary), /<p>/)
  assert.match(renderTheoryMarkdown(explanation), /<h2\b/)
})

test('noun cases topic is searchable, linked to grammar topics, and includes validated case forms', async () => {
  const cases = getTheoryTopic('noun-cases')!
  assert.equal(cases.title, 'Падежи существительных')
  assert.equal(cases.greekTitle, 'Οι πτώσεις των ουσιαστικών')
  assert.equal(cases.category, 'Грамматика')
  assert.deepEqual(cases.related, ['definite-article', 'indefinite-article', 'noun-gender', 'noun-masculine', 'noun-feminine', 'noun-neuter', 'present-tense-verbs', 'personal-pronouns-accusative', 'adjective-agreement'])
  for (const keyword of ['падеж', 'именительный', 'родительный', 'винительный', 'звательный']) {
    assert.ok(cases.keywords.includes(keyword), `missing search keyword: ${keyword}`)
  }

  const summary = await readFile(resolve('src/data/theory', cases.summary), 'utf8')
  for (const form of ['Ο φίλος είναι εδώ.', 'Το βιβλίο του φίλου.', 'Βλέπω τον φίλο.', 'Φίλε, έλα!']) {
    assert.ok(summary.includes(form), `missing case example: ${form}`)
  }

  const explanation = await readFile(resolve('src/data/theory', cases.explanation), 'utf8')
  for (const form of ['ο φίλος', 'του φίλου', 'τον φίλο', 'φίλε', 'η φίλη', 'της φίλης', 'το παιδί', 'του παιδιού', 'Πάω στον φίλο.', 'με τον φίλο', 'από τον φίλο']) {
    assert.ok(explanation.includes(form), `missing noun case or preposition example: ${form}`)
  }

  const route = createRouter({ history: createMemoryHistory(), routes: theoryRoutes }).resolve('/theory/noun-cases?explanation=1')
  assert.equal(route.name, 'theory-topic')
  assert.equal(route.params.topicId, 'noun-cases')
  assert.equal(route.query.explanation, '1')
})

test('present-tense verb topic is registered, linked, searchable, and loads both Markdown files', async () => {
  const verbs = getTheoryTopic('present-tense-verbs')!
  assert.ok(verbs)
  assert.equal(verbs.title, 'Глаголы в настоящем времени')
  assert.equal(verbs.greekTitle, 'Ρήματα στον ενεστώτα')
  assert.equal(verbs.category, 'Грамматика')
  assert.deepEqual(verbs.related, ['noun-cases', 'definite-article'])
  for (const keyword of ['глаголы', 'настоящее время', 'γράφω', 'ρωτάω', 'ρωτώ']) {
    assert.ok(verbs.keywords.includes(keyword), `missing search keyword: ${keyword}`)
  }

  const summary = await readFile(resolve('src/data/theory', verbs.summary), 'utf8')
  const explanation = await readFile(resolve('src/data/theory', verbs.explanation), 'utf8')
  for (const form of ['γράφω', 'γράφεις', 'γράφει', 'γράφουμε', 'γράφετε', 'γράφουν']) {
    assert.ok(summary.includes(form) || explanation.includes(form), `missing present-tense form: ${form}`)
  }
  for (const example of ['Βλέπω τον φίλο.', 'Πίνεις νερό;', 'Αγοράζουν το πουκάμισο.', 'Μαθαίνουμε ελληνικά.']) {
    assert.ok(explanation.includes(example), `missing present-tense example: ${example}`)
  }
  assert.match(explanation, /ρωτάω\s*\/\s*ρωτώ/)
  assert.match(explanation, /Не смешивайте времена/)
  assert.match(renderTheoryMarkdown(summary), /<p>/)
  assert.match(renderTheoryMarkdown(explanation), /<h2\b/)

  const route = createRouter({ history: createMemoryHistory(), routes: theoryRoutes }).resolve('/theory/present-tense-verbs?explanation=1')
  assert.equal(route.name, 'theory-topic')
  assert.equal(route.params.topicId, 'present-tense-verbs')
  assert.equal(route.query.explanation, '1')
})

test('masculine noun declension topic is searchable, linked, and contains checked paradigms', async () => {
  const masculine = getTheoryTopic('noun-masculine')!
  assert.equal(masculine.title, 'Склонение существительных мужского рода')
  assert.equal(masculine.greekTitle, 'Κλίση αρσενικών ουσιαστικών')
  assert.equal(masculine.category, 'Грамматика')
  assert.deepEqual(masculine.related, ['noun-cases', 'noun-gender', 'definite-article', 'noun-feminine', 'noun-neuter'])
  for (const keyword of ['мужской род', 'склонение', 'склонение мужских', 'падежи', '-ος', '-ας', '-ης', '-ές', 'μαθητής']) {
    assert.ok(masculine.keywords.includes(keyword), `missing search keyword: ${keyword}`)
  }

  const summary = await readFile(resolve('src/data/theory', masculine.summary), 'utf8')
  for (const form of ['του φίλου', 'των φίλων', 'τον φίλο', 'φίλε', 'του άντρα', 'των αντρών', 'άντρες', 'του μαθητή', 'των μαθητών', 'οι καφέδες', 'των καφέδων']) {
    assert.ok(summary.includes(form), `missing summary form: ${form}`)
  }

  const explanation = await readFile(resolve('src/data/theory', masculine.explanation), 'utf8')
  for (const form of ['ο φίλος', 'του φίλου', 'των φίλων', 'φίλε', 'ο άνθρωπος', 'του ανθρώπου', 'των ανθρώπων', 'ο άντρας', 'του άντρα', 'των αντρών', 'ο μαθητής', 'του μαθητή', 'των μαθητών', 'ο καφές', 'του καφέ', 'οι καφέδες', 'Μαθητή, διάβασε την ερώτηση.']) {
    assert.ok(explanation.includes(form), `missing explanation form or example: ${form}`)
  }
  assert.ok(explanation.includes('Неверно:** **του άνθρωπου**. **Верно:** **του ανθρώπου**'))
  assert.ok(explanation.includes('**ο άντρας → οι άντρες**, но **ο ταμίας → οι ταμίες**'))
  assert.ok(explanation.includes('Не переносите модель **καφές → καφέδες** на существительное **μαθητής**: его множественное число — **μαθητές**.'))
  for (const obsoleteExample of ['ταμάντρες', 'ταμάδες', '**\\*οι καφέδες** как форма слова']) {
    assert.ok(!explanation.includes(obsoleteExample), `obsolete misleading example remains: ${obsoleteExample}`)
  }
  const explanationHtml = renderTheoryMarkdown(explanation, 'explanation')
  assert.match(explanationHtml, /id="explanation-2-модель-на-ος-ο-φίλος"/)

  const html = renderTheoryMarkdown(summary)
  assert.match(html, /class="table-wrap"/)

  const route = createRouter({ history: createMemoryHistory(), routes: theoryRoutes }).resolve('/theory/noun-masculine?explanation=1#explanation-2-модель-на-ος-ο-фίλος')
  assert.equal(route.name, 'theory-topic')
  assert.equal(route.params.topicId, 'noun-masculine')
  assert.equal(route.query.explanation, '1')
  assert.equal(route.hash, '#explanation-2-модель-на-ος-ο-фίλος')
})

test('feminine noun declension topic is searchable, linked, and contains checked paradigms', async () => {
  const feminine = getTheoryTopic('noun-feminine')!
  assert.equal(feminine.title, 'Склонение существительных женского рода')
  assert.equal(feminine.greekTitle, 'Κλίση θηλυκών ουσιαστικών')
  assert.equal(feminine.category, 'Грамматика')
  assert.deepEqual(feminine.related, ['noun-cases', 'noun-gender', 'noun-masculine', 'noun-neuter'])
  for (const keyword of ['женский род', 'склонение женских', 'падежи', '-α', '-η', '-εις', 'γυναίκα', 'πόλη']) {
    assert.ok(feminine.keywords.includes(keyword), `missing search keyword: ${keyword}`)
  }

  const summary = await readFile(resolve('src/data/theory', feminine.summary), 'utf8')
  for (const form of ['της γυναίκας', 'των γυναικών', 'τη γυναίκα', 'της φωνής', 'των φωνών', 'φίλη → των φίλων', 'οι πόλεις', 'των πόλεων']) {
    assert.ok(summary.includes(form), `missing summary form: ${form}`)
  }

  const explanation = await readFile(resolve('src/data/theory', feminine.explanation), 'utf8')
  for (const form of ['η θάλασσα', 'της θάλασσας', 'των θαλασσών', 'η γυναίκα', 'της γυναίκας', 'των γυναικών', 'η φωνή', 'των φωνών', 'η φίλη', 'των φίλων', 'η πόλη', 'της πόλης', 'οι πόλεις', 'των πόλεων', 'η οδός', 'της οδού', 'η αλεπού', 'των αλεπούδων', 'Φίλη μου, έλα εδώ!']) {
    assert.ok(explanation.includes(form), `missing explanation form or example: ${form}`)
  }
  assert.ok(explanation.includes('η φίλη — της φίλης — οι φίλες — των φίλων'))
  assert.ok(explanation.includes('**η φίλη → των φίλων** — ударение сохраняется на первом слоге'))
  assert.doesNotMatch(explanation, /φίλη[^\n]*ударение (?:стоит на последнем слоге|перемещается с первого слога на последний)/i)

  const summaryHtml = renderTheoryMarkdown(summary)
  assert.match(summaryHtml, /class="table-wrap"/)
  const explanationHtml = renderTheoryMarkdown(explanation, 'explanation')
  const topicAnchor = explanationHtml.match(/id="(explanation-4-[^"]+)"/)?.[1]
  assert.ok(topicAnchor)

  const route = createRouter({ history: createMemoryHistory(), routes: theoryRoutes }).resolve(`/theory/noun-feminine?explanation=1#${topicAnchor}`)
  assert.equal(route.name, 'theory-topic')
  assert.equal(route.params.topicId, 'noun-feminine')
  assert.equal(route.query.explanation, '1')
  assert.equal(route.hash, `#${topicAnchor}`)
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

test('present tense Markdown links resolve through hash routes and preserve external references', async () => {
  const topic = getTheoryTopic('present-tense-verbs')!
  const source = await readFile(resolve('src/data/theory', topic.explanation), 'utf8')
  const html = renderTheoryMarkdown(source, 'explanation')
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [...theoryRoutes, { path: '/verbs', name: 'verbs', component: { template: '<div />' } }],
  })
  const links = [
    { href: '#/verbs', path: '/verbs', name: 'verbs' },
    { href: '#/theory/noun-cases', path: '/theory/noun-cases', name: 'theory-topic' },
    { href: '#/theory/definite-article', path: '/theory/definite-article', name: 'theory-topic' },
  ]

  for (const link of links) {
    assert.ok(html.includes(`href="${link.href}"`), `missing rendered href ${link.href}`)
    assert.equal(router.resolve(link.path).name, link.name, `unresolved app route ${link.path}`)
    const pageUrl = new URL('/greek-app/#/theory/present-tense-verbs', 'https://example.test')
    const targetUrl = new URL(link.href, pageUrl)
    assert.equal(targetUrl.pathname, '/greek-app/')
    assert.equal(targetUrl.hash, `#${link.path}`)
    assert.equal(router.resolve(targetUrl.hash.slice(1)).name, link.name)
  }

  assert.doesNotMatch(html, /href="\/(?:verbs|theory\/)/)
  assert.match(html, /href="https:\/\/ebooks\.edu\.gr\/ebooks\/v\/html\/[^\"]*index_C_06\.html"/)
  assert.match(html, /href="https:\/\/www\.greek-language\.gr\/greekLang\/modern_greek\/tools\/lexica\/triantafyllides\/search\.html\?lq=/)
})

test('neuter noun declension topic is registered, searchable, linked, and contains checked paradigms', async () => {
  const neuter = getTheoryTopic('noun-neuter')!
  assert.equal(neuter.title, 'Склонение существительных среднего рода')
  assert.equal(neuter.greekTitle, 'Κλίση ουδέτερων ουσιαστικών')
  assert.equal(neuter.category, 'Грамматика')
  assert.deepEqual(neuter.related, ['noun-cases', 'noun-gender', 'noun-masculine', 'noun-feminine'])
  for (const keyword of ['средний род', 'склонение средних', '-ο', '-ι', '-μα', 'βιβλίο', 'σπίτι', 'παιδί', 'όνομα']) {
    assert.ok(neuter.keywords.includes(keyword), `missing search keyword: ${keyword}`)
  }

  const summary = await readFile(resolve('src/data/theory', neuter.summary), 'utf8')
  for (const form of ['του βιβλίου', 'τα βιβλία', 'των βιβλίων', 'του σπιτιού', 'τα σπίτια', 'των σπιτιών', 'του ονόματος', 'τα ονόματα', 'των ονομάτων']) {
    assert.ok(summary.includes(form), `missing summary form: ${form}`)
  }

  const explanation = await readFile(resolve('src/data/theory', neuter.explanation), 'utf8')
  for (const form of ['του βιβλίου', 'των βιβλίων', 'του ονόματος', 'των ονομάτων', 'του δέντρου', 'του προσώπου', 'του παιδιού', 'των παιδιών', 'του προβλήματος', 'των προβλημάτων', 'το μέρος', 'του μέρους', 'τα μέρη', 'των μερών', 'του φωτός', 'των φώτων', 'Τα βιβλία των παιδιών είναι εδώ.', 'Υπάρχουν δύο σπίτια στο χωριό.']) {
    assert.ok(explanation.includes(form), `missing explanation form or example: ${form}`)
  }
  assert.match(explanation, /у \*\*όνομα\*\* ударение в \*\*ονόματος\*\* и \*\*ονόματα\*\* стоит на втором слоге/i)
  assert.ok(explanation.includes('ударение остаётся на том же слоге: **βιβλίο — βιβλίου — βιβλία — βιβλίων**'))
  assert.match(renderTheoryMarkdown(summary), /class="table-wrap"/)
  const explanationHtml = renderTheoryMarkdown(explanation, 'explanation')
  const topicAnchor = explanationHtml.match(/id="(explanation-\d+-[^\"]+)"/)?.[1]
  assert.ok(topicAnchor)
  const route = createRouter({ history: createMemoryHistory(), routes: theoryRoutes }).resolve(`/theory/noun-neuter?explanation=1#${topicAnchor}`)
  assert.equal(route.name, 'theory-topic')
  assert.equal(route.params.topicId, 'noun-neuter')
  assert.equal(route.query.explanation, '1')
  assert.equal(route.hash, `#${topicAnchor}`)
})

test('unknown topics are handled without falling back to another article', () => {
  assert.equal(getTheoryTopic('unknown-topic'), undefined)
})

test('theory catalog and topic routes resolve, including direct topic URLs', () => {
  const router = createRouter({ history: createMemoryHistory(), routes: [...theoryRoutes, legacyReadingRoute, { path: '/:pathMatch(.*)*', name: 'not-found', component: { template: '<div />' } }] })
  assert.equal(router.resolve('/theory').name, 'theory')
  assert.equal(router.resolve('/theory/reading').name, 'theory-reading')
  const directTopic = router.resolve('/theory/definite-article?explanation=1')
  assert.equal(directTopic.name, 'theory-topic')
  assert.equal(directTopic.params.topicId, 'definite-article')
  assert.equal(directTopic.query.explanation, '1')
  const numbersTopic = router.resolve('/theory/numbers-0-20')
  assert.equal(numbersTopic.name, 'theory-topic')
  assert.equal(numbersTopic.params.topicId, 'numbers-0-20')
  const subsection = router.resolve('/theory/definite-article#explanation-1-что-показывает-артикль')
  assert.equal(subsection.name, 'theory-topic')
  assert.equal(subsection.hash, '#explanation-1-что-показывает-артикль')
  const unknownTopic = router.resolve('/theory/not-real')
  assert.equal(unknownTopic.name, 'theory-topic')
  assert.equal(getTheoryTopic(String(unknownTopic.params.topicId)), undefined)
  assert.equal(router.getRoutes().find((route) => route.path === '/reading')?.redirect, '/theory/reading')
})

test('Markdown headings get safe unique IDs for numbered and repeated headings', () => {
  const html = renderTheoryMarkdown('## 1. Что показывает артикль\n\n## 1. Что показывает артикль', 'explanation')
  assert.match(html, /id="explanation-1-что-показывает-артикль"/)
  assert.match(html, /id="explanation-1-что-показывает-артикль-2"/)
})

test('Markdown output disables raw HTML and adds scroll wrappers for tables', () => {
  const html = renderTheoryMarkdown('<table><script>alert(1)</script></table>\n\n| Форма | Значение |\n| --- | --- |\n| ο | он |')
  assert.match(html, /class="table-wrap"/)
  assert.doesNotMatch(html, /<script>/)
  assert.match(html, /&lt;script&gt;/)
})

test('deep links open explanation and same-page query updates preserve scrolling', () => {
  assert.equal(shouldOpenTheoryExplanation('1', ''), true)
  assert.equal(shouldOpenTheoryExplanation(undefined, '#explanation-section'), true)
  assert.equal(shouldOpenTheoryExplanation(undefined, ''), false)
  assert.equal(resolveScrollBehavior({ path: '/theory/topic', hash: '' }, { path: '/theory/topic', hash: '' }, { top: 300 }), false)
  assert.deepEqual(resolveScrollBehavior({ path: '/theory/topic', hash: '#explanation-section' }, { path: '/theory/topic', hash: '' }, null), { el: '#explanation-section' })
  assert.deepEqual(resolveScrollBehavior({ path: '/theory', hash: '' }, { path: '/cards', hash: '' }, null), { top: 0 })
})

test('P65/W31.2 registers linked theory, renders the reviewed forms, and uses hash links', async () => {
  const checks = [
    ['personal-pronouns-accusative', ['τον βλέπω', 'τη βλέπω', 'την έχω', 'το έχω', 'το βιβλίο']],
    ['adjective-agreement', ['τον καλό φίλο', 'την καλή φίλη', 'το καλό παιδί', 'μια ωραία μέρα', 'το μπλε πουλόβερ']],
    ['ordinal-numbers', ['πρώτος', 'δεύτερη', 'τρίτο', 'τέταρτη', 'πέμπτο', 'τη δεύτερη μέρα']],
  ] as const
  const router = createRouter({ history: createMemoryHistory('/greek-app/#'), routes: theoryRoutes })
  for (const [id, forms] of checks) {
    const entry = getTheoryTopic(id)
    assert.ok(entry, id)
    assert.equal(new Set(entry.related).size, entry.related.length)
    const html = renderTheoryMarkdown(await readFile(resolve('src/data/theory', entry.explanation), 'utf8'))
    for (const form of forms) assert.ok(html.includes(form), form)
    assert.match(renderTheoryMarkdown(await readFile(resolve('src/data/theory', entry.summary), 'utf8')), /<p>/u)
    for (const related of [id, ...entry.related]) {
      const route = router.resolve({ name: 'theory-topic', params: { topicId: related } })
      assert.equal(route.href, '#/theory/' + related)
      assert.ok(getTheoryTopic(related))
    }
    assert.doesNotMatch(html, /href="\/theory\//u)
  }
  const cases = getTheoryTopic('noun-cases')!
  const explanation = await readFile(resolve('src/data/theory', cases.explanation), 'utf8')
  for (const form of ['στον δεύτερο όροφο', 'στην Αθήνα', 'στη θάλασσα', 'στο δωμάτιο', 'Πηγαίνω στο ξενοδοχείο.', 'Μένω στο ξενοδοχείο.', 'σε ένα δωμάτιο']) {
    assert.ok(explanation.includes(form), form)
  }
})
