-- Reliable per-account first-seen tracking and conflict-safe progress writes.
-- Existing word_progress rows and timestamps are preserved.
alter table public.word_progress
  add column if not exists introduced_at timestamptz,
  add column if not exists review_id uuid not null default gen_random_uuid();

create table if not exists public.word_introductions (
  user_id uuid not null references auth.users (id) on delete cascade,
  word_id text not null,
  first_introduced_at timestamptz not null,
  primary key (user_id, word_id)
);
alter table public.word_introductions enable row level security;
grant select, insert, update, delete on table public.word_introductions to authenticated;

drop policy if exists "Users can read their own word introductions" on public.word_introductions;
drop policy if exists "Users can create their own word introductions" on public.word_introductions;
drop policy if exists "Users can update their own word introductions" on public.word_introductions;
drop policy if exists "Users can delete their own word introductions" on public.word_introductions;
create policy "Users can read their own word introductions" on public.word_introductions for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create their own word introductions" on public.word_introductions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their own word introductions" on public.word_introductions for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete their own word introductions" on public.word_introductions for delete to authenticated using ((select auth.uid()) = user_id);

insert into public.word_introductions(user_id, word_id, first_introduced_at)
select user_id, word_id, introduced_at from public.word_progress where introduced_at is not null
on conflict (user_id, word_id) do update set first_introduced_at = least(public.word_introductions.first_introduced_at, excluded.first_introduced_at);

create or replace function public.merge_word_progress(p_rows jsonb)
returns void language plpgsql security invoker set search_path = public
as $$
declare row_data record;
begin
  if jsonb_typeof(p_rows) <> 'array' then raise exception 'p_rows must be an array'; end if;
  for row_data in select * from jsonb_to_recordset(p_rows) as x(
    user_id uuid, word_id text, due_at timestamptz, interval_days integer,
    repetitions integer, lapses integer, last_reviewed_at timestamptz,
    introduced_at timestamptz, review_id uuid
  ) loop
    if row_data.user_id is distinct from auth.uid() then raise exception 'user_id must match authenticated user'; end if;
    insert into public.word_progress(user_id, word_id, due_at, interval_days, repetitions, lapses, last_reviewed_at, introduced_at, review_id)
    values (row_data.user_id, row_data.word_id, row_data.due_at, row_data.interval_days, row_data.repetitions, row_data.lapses,
      row_data.last_reviewed_at, row_data.introduced_at, coalesce(row_data.review_id, gen_random_uuid()))
    on conflict (user_id, word_id) do update set
      due_at = case when (excluded.last_reviewed_at, excluded.review_id) > (public.word_progress.last_reviewed_at, public.word_progress.review_id) then excluded.due_at else public.word_progress.due_at end,
      interval_days = case when (excluded.last_reviewed_at, excluded.review_id) > (public.word_progress.last_reviewed_at, public.word_progress.review_id) then excluded.interval_days else public.word_progress.interval_days end,
      repetitions = case when (excluded.last_reviewed_at, excluded.review_id) > (public.word_progress.last_reviewed_at, public.word_progress.review_id) then excluded.repetitions else public.word_progress.repetitions end,
      lapses = case when (excluded.last_reviewed_at, excluded.review_id) > (public.word_progress.last_reviewed_at, public.word_progress.review_id) then excluded.lapses else public.word_progress.lapses end,
      last_reviewed_at = greatest(excluded.last_reviewed_at, public.word_progress.last_reviewed_at),
      review_id = case when (excluded.last_reviewed_at, excluded.review_id) > (public.word_progress.last_reviewed_at, public.word_progress.review_id) then excluded.review_id else public.word_progress.review_id end,
      introduced_at = case
        when public.word_progress.introduced_at is null then excluded.introduced_at
        when excluded.introduced_at is null then public.word_progress.introduced_at
        else least(public.word_progress.introduced_at, excluded.introduced_at) end
      ;
  end loop;
end; $$;

create or replace function public.merge_word_introductions(p_rows jsonb)
returns void language plpgsql security invoker set search_path = public
as $$
declare row_data record;
begin
  if jsonb_typeof(p_rows) <> 'array' then raise exception 'p_rows must be an array'; end if;
  for row_data in select * from jsonb_to_recordset(p_rows) as x(user_id uuid, word_id text, first_introduced_at timestamptz) loop
    if row_data.user_id is distinct from auth.uid() then raise exception 'user_id must match authenticated user'; end if;
    insert into public.word_introductions(user_id, word_id, first_introduced_at)
    values (row_data.user_id, row_data.word_id, row_data.first_introduced_at)
    on conflict(user_id, word_id) do update set first_introduced_at = least(public.word_introductions.first_introduced_at, excluded.first_introduced_at);
  end loop;
end; $$;

revoke all on function public.merge_word_progress(jsonb) from public, anon;
revoke all on function public.merge_word_introductions(jsonb) from public, anon;
grant execute on function public.merge_word_progress(jsonb) to authenticated;
grant execute on function public.merge_word_introductions(jsonb) to authenticated;
