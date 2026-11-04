# Greek Flashcards

## Purpose

A beginner-friendly app for learning Modern Greek with flashcards, approximate Russian transliterations, and short example phrases.

## Stack and commands

- Vue 3, Composition API, `<script setup lang="ts">`, TypeScript, and Vite.
- `npm run dev` starts the local development server.
- `npm run build` runs Vue/TypeScript checks and creates the production build.
- `npm test` runs focused core-logic tests with Node.js 22's TypeScript stripping.

## App structure

- `src/App.vue` composes the app shell, header navigation, account panel, and page outlet.
- `src/router.ts` maps the hash-based URLs to pages so direct links work on GitHub Pages.
- `src/pages/CardsPage.vue` owns the flashcard study session.
- `src/pages/ReadingPage.vue` presents the pronunciation guide page.
- `src/pages/TheoryPage.vue` presents the searchable theory catalog; `src/pages/TheoryTopicPage.vue` presents a registered theory topic.
- `src/pages/DictionaryPage.vue` presents vocabulary statistics and the dictionary page.
- `src/pages/VerbsPage.vue` presents one selected verb, its tense tabs, and previous/next verb navigation.
- `src/components/Flashcard.vue` renders and flips the active word card.
- `src/components/StudyModeToggle.vue` selects which language appears first.
- `src/components/ReviewRatings.vue` collects the learner's recall rating after a card is flipped.
- `src/components/AccountPanel.vue` handles email-link sign-in and account status.
- `src/components/WordExamples.vue` displays phrases for the active word.
- `src/composables/useSpacedRepetition.ts` schedules reviews and stores per-word progress in browser localStorage.
- `src/composables/useCloudProgressSync.ts` merges local progress with the signed-in user's Supabase records.
- `src/lib/supabase.ts` creates the Supabase client from Vite environment variables.
- `supabase/schema.sql` defines the per-user cloud progress table and Row Level Security policies.
- `src/components/ReadingGuide.vue` explains Modern Greek letter and letter-pair pronunciation.
- `src/components/theory/` contains theory catalog and safe Markdown rendering components.
- `src/components/VocabularyDictionary.vue` shows the complete vocabulary, search and status/type filters, and review progress statistics.
- `src/pages/TrainersPage.vue` lists available trainer topics; `src/pages/TrainerSessionPage.vue` runs a topic session and displays its results.
- `src/pages/TrainerMultiSelectPage.vue` runs the separate multiple-selection session and displays its own result summary.
- `src/pages/TrainerOrderItemsPage.vue` runs T4 «Расставь по порядку» for the `numbers` topic only; `src/components/trainers/OrderItemsExercise.vue` owns its button-based ordering interaction and `src/components/trainers/OrderItemsSessionResults.vue` shows its results.
- `src/pages/TrainerFillGapPage.vue` runs the separate fill-gap session; `src/components/trainers/` contains all trainer exercises plus catalog and result components; `src/data/trainers/` registers topics, exercise sets, question banks, reviewed generator source tables, and routes; `src/lib/trainers/session.ts`, `src/lib/trainers/multiSelectSession.ts`, and `src/lib/trainers/fillGap/` contain independent testable session rules; `src/lib/trainers/generation/` and `src/lib/trainers/fillGap/` contain pure generators and repeat-history rules; `src/composables/useTrainerSession.ts`, `src/composables/useMultiSelectSession.ts`, and `src/composables/useFillGapSession.ts` connect those rules to Vue state.
- `src/data/words.ts` is the vocabulary source. Each word has its Greek spelling, Russian meaning, approximate transliteration, semantic category, grammatical part-of-speech tags, and an `examples` array.
- `src/data/verbs.ts` contains lemma-level verb conjugations, Russian meanings, and approximate reading support.
- `src/data/readingRules.ts` contains the pronunciation guide content.
- `src/data/theory/topics.ts` registers theory topics and links to existing learning resources; `src/data/theory/content/` stores each topic's summary and detailed explanation as Markdown.
- `src/data/theory/markdown.ts` renders local Markdown with raw HTML disabled; `src/data/theory/routes.ts` defines the theory routes.
- `.env.local` contains local Supabase config and is ignored by Git; GitHub Pages builds read the equivalent repository Actions variables.
- `src/style.css` contains global layout, responsive styles, and visual tokens.
- `.github/workflows/deploy.yml` builds the app and deploys `dist/` to GitHub Pages on pushes to `main`; `.github/workflows/pr-checks.yml` runs tests and a build on each pull request targeting `main` without publishing.

## Change rules

- Keep UI components in Vue 3 Composition API with TypeScript and explicit typed props/events.
- Keep vocabulary and example content in `src/data`; avoid embedding word-specific copy in templates.
- Every new vocabulary entry should include an approximate Russian reading and at least one simple example with Greek text, Russian reading, and Russian translation.
- Assign every vocabulary entry one or more grammatical tags from `PART_OF_SPEECH_LABELS`; keep grammatical tags separate from semantic categories. Study filters must not modify a word's review schedule.
- Keep verb conjugations and tense notes in `src/data/verbs.ts`; distinguish aorist from imperfect where a verb uses a different past form.
- Keep examples beginner-friendly and ensure the target word or its inflected form appears in the Greek phrase.
- Russian transliterations are learning aids, not precise phonetic transcriptions. Preserve that distinction in labels and copy.
- Keep the app usable on narrow screens, keyboard accessible, and respectful of reduced-motion preferences.
- Use Vue Router pages for major app sections; keep the hash history mode compatible with GitHub Pages hosting.
- The Today session contains due reviews, already introduced but unrated words, and up to 10 never-before-seen words per local calendar day. Due reviews appear before new words; each segment is shuffled. Manual shuffle starts a fresh pass through the currently eligible session words.
- The dictionary classifies a word as learned once its current interval reaches 21 days; overdue words are shown as due even if they previously reached that interval.
- After revealing a card, collect one of four ratings. Schedule "Again" for about 10 minutes, "Hard" for at least 1 day, "Good" for at least 3 days, and "Easy" for at least 7 days; grow successful intervals gradually and cap them at 365 days.
- Persist review progress and first-introduction timestamps in localStorage keyed by the Greek word and, when signed in, sync them per user with Supabase. Server RPCs merge review progress by review timestamp and preserve the earliest introduction. Never put Supabase secret keys in frontend code.
- When changing card navigation, preserve the behavior that a newly selected word always starts on its first side.
- Keep trainer sessions local and focused: add only working exercise types to a topic, preserve the shared five-round flow and result summary, and do not add Greek text-entry fields. Verify all new or changed exercise prompts, Greek forms, accents, and meanings against the linguistic sources listed below before adding them to trainer data.
- Trainer questions for beginners must use everyday wording and test understanding or use of Greek, not knowledge of Russian grammar terms. Explanations may briefly clarify a form in plain language.
- T2 keeps its 49 reviewed fixed questions and adds six generated questions plus four fixed questions to each ten-question session. Keep topic templates as pure functions in `src/lib/trainers/generation/` and their reviewed word/form tables in `src/data/trainers/generation/verifiedContent.ts`; do not invent Greek with unconstrained string substitutions. Each topic has three focused templates, and every generated option set must have at least two correct and one incorrect option. Pass a random source into generation for deterministic tests. For number exercises, use only the finite neutral counting forms in the reviewed table; do not infer gendered forms without a noun. For possessive and recipient-pronoun exercises, reuse complete reviewed phrases or vary only the possessive suffix after a checked noun phrase. For είμαι, use the checked person-to-form table and keep the accepted form είσαστε out of incorrect distractors. Keep explanations tied to the generated item. Compare normalized prompt, option text, and correctness signatures without depending on display order. Store only a bounded, versioned, per-topic/per-template recent-signature history in localStorage; invalid or unavailable storage must fall back to generation without history. Keep this history separate from SRS and Supabase. Test templates with independent reference tables over hundreds of fixed seeds per topic, and compare content signatures when testing variety.
- T3 keeps its fixed fill-gap bank in `src/data/trainers/fillGapQuestions.ts` and its reviewed variation contexts in `src/data/trainers/generation/fillGapContent.ts`; it reuses checked T2 form tables where possible. Each topic has three bounded templates and each session contains six generated and four fixed questions across five rounds. Keep one answer per context, account for the accepted είστε/είσαστε variants, and avoid unconstrained sentence construction. Store bounded, versioned, per-topic/per-template exact-question and semantic-context signatures under a T3-only localStorage key; semantic signatures ignore distractor choices. Skip repeated contexts within a session when alternatives exist, prefer contexts absent from recent history, and use bounded fallback when a small pool is exhausted. Migrate the prior T3 history format and tolerate invalid or unavailable storage. T3 has separate session state and no Greek text-entry field. Keep the instruction visually secondary to the Russian hint and Greek sentence. Verify all three templates in each topic with independent reference tables over at least 200 fixed seeds and report full-combination and semantic-context diversity across repeated sessions.
- T4 «Расставь по порядку» is available only for `numbers`. Keep its reviewed fixed bank and price phrases in `src/data/trainers/orderItemsQuestions.ts` and `src/data/trainers/orderItemsContent.ts`; generate ascending numbers, descending numbers, and prices from bounded tables in `src/lib/trainers/orderItems/orderItemsGenerator.ts`. Keep numeric ordering, the five-round session, and isolated bounded versioned repeat history in the corresponding T4-only modules. Sessions contain six generated questions (two per template) and four fixed questions; avoid repeated value sets across number directions and prices when alternatives remain. New price phrases must be individually reviewed and stored whole, not assembled freely. Do not register T4 for other topics.
- The Vite base path is `/greek-app/` for the project Pages URL; keep it aligned with the repository name.
- Update this file when the app structure or development workflow changes.

## Linguistic accuracy and source verification

Verify new or changed Greek learning material against reliable linguistic sources before treating it as correct. Familiarity, resemblance to Russian or English, and passing tests are not sufficient verification.

### Priority sources

- Use the [Triantafyllidis Dictionary of Standard Modern Greek](https://www.greek-language.gr/greekLang/modern_greek/tools/lexica/triantafyllides/) first for individual words. Check spelling, written accent, pronunciation information, meaning, part of speech, grammatical features, inflection, verb forms, and accepted variants.
- Use the [Centre for the Greek Language tools](https://www.greek-language.gr/greekLang/modern_greek/tools/index.html) for grammar and usage: cases, declension, gender and number agreement, articles, pronouns, syntax, contrasts between similar forms, and natural use in context.
- Use the official [Grammar of Modern Greek (A΄–Γ΄ Gymnasium)](https://ebooks.edu.gr/ebooks/v/html/8547/2334/Grammatiki-Neas-Ellinikis-Glossas_A-B-G-Gymnasiou_html-apli/index_B_01.html) for pronunciation, accentuation, forms, declensions, conjugations, and standard variants. The [Triantafyllidis Modern Greek Grammar](https://www.greek-language.gr/greekLang/files/document/modern_greek/grammatiki.triantafyllidi.pdf) is another preferred reference.
- Other trustworthy linguistic sources may be used when needed; assess their authority and prefer primary or institutional references. Link sources in theory Markdown when the explanation relies on them. Do not claim a source was consulted unless it was actually checked.

### Vocabulary and examples

Every new vocabulary entry must be linguistically verified before it is committed. For each entry in `src/data/words.ts`, check:

- Greek spelling and accentuation, the standard pronunciation, meaning, and part of speech.
- Applicable grammatical details, including gender, number, case, person, and tense.
- That each Greek example is grammatical and natural in Modern Greek, uses the intended meaning, and has an accurate Russian translation.
- The approximate Russian reading of both the headword and each example, including the pronunciation of the exact inflected form used in context.

Check words and complete expressions alike. Prefer short, natural A1–A2 examples; do not invent awkward sentences just to feature a word. For `src/data/verbs.ts`, verify lemma meanings and every added or changed conjugated form, including tense or aspect distinctions where relevant.

Russian readings are learning aids, not IPA. Use source pronunciation information to derive them, follow the app's established Russian-letter conventions, and keep the reading consistent between a card and its examples. Do not transliterate Greek letters mechanically. Pay particular attention to `γ`, `δ`, `θ`, `χ`; `αι`, `ει`, `οι`, `ου`; `αυ`, `ευ`; `μπ`, `ντ`, `γκ`, `γγ`; and stress changes in inflected forms.

### Grammar theory

When adding or changing `src/data/theory/content/`, verify tables, forms, rules, article and pronoun usage, cases, accentuation, exceptions, and example sentences against an authoritative grammar source. Do not generalize from a few examples, apply one declension model to another, or present a valid variant as incorrect. State the limits of a rule where needed, while keeping explanations accessible to A1–A2 learners.

### Uncertain or conflicting evidence

If a preferred source is unavailable, try another reliable source. If a form or explanation still cannot be confirmed, state the uncertainty and do not guess or claim it was verified. Do not replace a confirmed correct form with an assumption. If reliable sources document multiple accepted variants, preserve them and briefly explain the distinction when useful.

### Reports and tests

For any task that adds or changes learning content, include a concise `Linguistic verification` section in the final report. Say what kinds of material were checked, which sources were actually used, whether any questionable forms were corrected, and whether anything remains uncertain. Keep the report brief and list unresolved cases only when present.

Automated tests do not replace linguistic verification. Use tests to check structure, required fields, uniqueness, and forms that have already been confirmed. Do not add assertions for unverified pronunciation or grammar, and do not treat a passing `npm test` as evidence that translations, readings, or grammar are linguistically correct.
