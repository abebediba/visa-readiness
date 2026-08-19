-- Visa Readiness — cloud sync schema (run in the Supabase SQL editor).
-- One row per application, owner-only under row-level security. The payload is
-- the same Application JSON the browser keeps locally; the server never needs
-- to read inside it.

create table if not exists public.applications (
  id text primary key,
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.applications enable row level security;

drop policy if exists "applications are owner-only" on public.applications;
create policy "applications are owner-only"
  on public.applications
  for all
  using (owner = auth.uid())
  with check (owner = auth.uid());

create index if not exists applications_owner_updated_idx
  on public.applications (owner, updated_at desc);
