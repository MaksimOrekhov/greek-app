-- Track when a word first entered a learner's study queue for daily new-word limits.
alter table public.word_progress
  add column if not exists introduced_at timestamptz;
