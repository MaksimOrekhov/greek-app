-- Per-user spaced-repetition progress for Greek flashcards.
create table public.word_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  word_id text not null,
  due_at timestamptz not null,
  interval_days integer not null default 0 check (interval_days >= 0),
  repetitions integer not null default 0 check (repetitions >= 0),
  lapses integer not null default 0 check (lapses >= 0),
  last_reviewed_at timestamptz not null default now(),
  introduced_at timestamptz,
  primary key (user_id, word_id)
);

alter table public.word_progress enable row level security;

-- The API roles need explicit table access; RLS policies below still limit rows
-- to the signed-in user who owns them.
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.word_progress to authenticated;

create policy "Users can read their own word progress"
  on public.word_progress for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own word progress"
  on public.word_progress for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own word progress"
  on public.word_progress for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own word progress"
  on public.word_progress for delete to authenticated
  using ((select auth.uid()) = user_id);
