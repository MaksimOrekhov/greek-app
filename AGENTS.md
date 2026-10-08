# Greek Flashcards

## Purpose

A beginner-friendly app for learning Modern Greek with flashcards, approximate Russian transliterations, and short example phrases.

## Stack and commands

- Vue 3, Composition API, `<script setup lang="ts">`, TypeScript, and Vite.
- `npm run dev` starts the local development server.
- `npm run build` runs Vue/TypeScript checks and creates the production build.

## App structure

- `src/App.vue` composes the app shell, section navigation, flashcard session, and current-word examples.
- `src/components/Flashcard.vue` renders and flips the active word card.
- `src/components/StudyModeToggle.vue` selects which language appears first.
- `src/components/WordExamples.vue` displays phrases for the active word.
- `src/components/ReadingGuide.vue` explains Modern Greek letter and letter-pair pronunciation.
- `src/data/words.ts` is the vocabulary source. Each word has its Greek spelling, Russian meaning, approximate transliteration, category, and an `examples` array.
- `src/data/readingRules.ts` contains the pronunciation guide content.
- `src/style.css` contains global layout, responsive styles, and visual tokens.
- `.github/workflows/deploy.yml` builds the app and deploys `dist/` to GitHub Pages on pushes to `main`.

## Change rules

- Keep UI components in Vue 3 Composition API with TypeScript and explicit typed props/events.
- Keep vocabulary and example content in `src/data`; avoid embedding word-specific copy in templates.
- Every new vocabulary entry should include an approximate Russian reading and at least one simple example with Greek text, Russian reading, and Russian translation.
- Keep examples beginner-friendly and ensure the target word or its inflected form appears in the Greek phrase.
- Russian transliterations are learning aids, not precise phonetic transcriptions. Preserve that distinction in labels and copy.
- Keep the app usable on narrow screens, keyboard accessible, and respectful of reduced-motion preferences.
- The vocabulary deck starts shuffled and is reshuffled after a complete pass; manual shuffle starts a fresh order. Avoid showing the same card twice at the shuffle boundary.
- When changing card navigation, preserve the behavior that a newly selected word always starts on its first side.
- The Vite base path is `/greek-app/` for the project Pages URL; keep it aligned with the repository name.
- Update this file when the app structure or development workflow changes.
