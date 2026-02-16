-- 003_security_hardening.sql
-- Defense-in-depth hardening for RLS and data integrity.

begin;

-- Ensure RLS enabled on all application tables.
alter table if exists public.projects enable row level security;
alter table if exists public.steps enable row level security;
alter table if exists public.project_data enable row level security;
alter table if exists public.user_settings enable row level security;
alter table if exists public.scenario_definitions enable row level security;

-- Force RLS so owner/superuser-style bypass does not happen accidentally in app sessions.
alter table if exists public.projects force row level security;
alter table if exists public.steps force row level security;
alter table if exists public.project_data force row level security;
alter table if exists public.user_settings force row level security;
alter table if exists public.scenario_definitions force row level security;

-- Recreate strict policies.
drop policy if exists "projects_owner_all" on public.projects;
create policy "projects_owner_all" on public.projects
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "steps_owner_all" on public.steps;
create policy "steps_owner_all" on public.steps
for all
using (
  exists (
    select 1
    from public.projects p
    where p.id = steps.project_id
      and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.projects p
    where p.id = steps.project_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "project_data_owner_all" on public.project_data;
create policy "project_data_owner_all" on public.project_data
for all
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_data.project_id
      and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.projects p
    where p.id = project_data.project_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "user_settings_owner_all" on public.user_settings;
create policy "user_settings_owner_all" on public.user_settings
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Scenario definitions are read-only for authenticated users.
drop policy if exists "scenario_definitions_read_auth" on public.scenario_definitions;
create policy "scenario_definitions_read_auth" on public.scenario_definitions
for select
using (auth.uid() is not null);

-- Indexes for policy/filter paths.
create index if not exists projects_user_id_id_idx on public.projects (user_id, id);
create index if not exists steps_project_id_idx on public.steps (project_id);
create index if not exists project_data_project_id_idx on public.project_data (project_id);

-- Data integrity constraints.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'project_data_key_whitelist'
      and conrelid = 'public.project_data'::regclass
  ) then
    alter table public.project_data
      add constraint project_data_key_whitelist
      check (key in ('project_profile', 'audience', 'offer', 'competitors', 'references', 'tracking'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'steps_status_whitelist'
      and conrelid = 'public.steps'::regclass
  ) then
    alter table public.steps
      add constraint steps_status_whitelist
      check (status in ('todo', 'doing', 'review', 'done'));
  end if;
end $$;

-- Keep project.updated_at fresh when child rows change.
create or replace function public.touch_project_updated_at() returns trigger as $$
begin
  update public.projects
  set updated_at = now()
  where id = coalesce(new.project_id, old.project_id);
  return coalesce(new, old);
end;
$$ language plpgsql;

drop trigger if exists trg_touch_projects_from_steps on public.steps;
create trigger trg_touch_projects_from_steps
after insert or update or delete on public.steps
for each row execute function public.touch_project_updated_at();

drop trigger if exists trg_touch_projects_from_project_data on public.project_data;
create trigger trg_touch_projects_from_project_data
after insert or update or delete on public.project_data
for each row execute function public.touch_project_updated_at();

commit;
