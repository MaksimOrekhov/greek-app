# Greek Flashcards

## Purpose

A beginner-friendly app for learning Modern Greek with flashcards, approximate Russian transliterations, and short example phrases.

## Stack and commands

- Vue 3, Composition API, `<script setup lang="ts">`, TypeScript, and Vite.
- `npm run dev` starts the local development server.
- `npm run build` runs Vue/TypeScript checks and creates the production build.

## App structure

- `src/App.vue` composes the app shell, header navigation, account panel, and page outlet.
- `src/router.ts` maps the hash-based URLs to pages so direct links work on GitHub Pages.
- `src/pages/CardsPage.vue` owns the flashcard study session.
- `src/pages/ReadingPage.vue` presents the pronunciation guide page.
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
- `src/components/VocabularyDictionary.vue` shows the complete vocabulary, search and status/type filters, and review progress statistics.
- `src/data/words.ts` is the vocabulary source. Each word has its Greek spelling, Russian meaning, approximate transliteration, semantic category, grammatical part-of-speech tags, and an `examples` array.
- `src/data/verbs.ts` contains lemma-level verb conjugations, Russian meanings, and approximate reading support.
- `src/data/readingRules.ts` contains the pronunciation guide content.
- `.env.local` contains local Supabase config and is ignored by Git; GitHub Pages builds read the equivalent repository Actions variables.
- `src/style.css` contains global layout, responsive styles, and visual tokens.
- `.github/workflows/deploy.yml` builds the app and deploys `dist/` to GitHub Pages on pushes to `main`.

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
- The review session starts with new and due words in shuffled order; manual shuffle starts a fresh pass through the full deck.
- The dictionary classifies a word as learned once its current interval reaches 21 days; overdue words are shown as due even if they previously reached that interval.
- After revealing a card, collect one of four ratings. Schedule "Again" for about 10 minutes, "Hard" for at least 1 day, "Good" for at least 3 days, and "Easy" for at least 7 days; grow successful intervals gradually and cap them at 365 days.
- Persist review progress in localStorage keyed by the Greek word and, when signed in, sync it per user with Supabase. Never put Supabase secret keys in frontend code.
- When changing card navigation, preserve the behavior that a newly selected word always starts on its first side.
- The Vite base path is `/greek-app/` for the project Pages URL; keep it aligned with the repository name.
- Update this file when the app structure or development workflow changes.
