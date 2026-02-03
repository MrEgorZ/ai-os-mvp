create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('site','bot','ads','strategy','market','product','software')),
  mode text not null check (mode in ('A','B')),
  name text not null,
  status text not null default 'in_progress' check (status in ('in_progress','paused','done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects (user_id);

create table if not exists public.project_data (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  key text not null,
  status text not null default 'missing' check (status in ('ok','warn','missing')),
  value_json jsonb,
  value_text text,
  updated_at timestamptz not null default now(),
  unique (project_id, key)
);

create index if not exists project_data_project_idx on public.project_data (project_id);

create table if not exists public.steps (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  scenario_key text not null,
  title text not null,
  description text,
  acceptance text,
  required_fields jsonb not null default '[]'::jsonb,
  ai_tool_default text not null default 'gpt' check (ai_tool_default in ('gpt','claude','gemini','perplexity','wavespeed')),
  prompt_template text not null,
  prompt_last_generated text,
  result_text text,
  status text not null default 'todo' check (status in ('todo','doing','review','done')),
  order_index int not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists steps_project_idx on public.steps (project_id);
create index if not exists steps_project_status_idx on public.steps (project_id, status);

create table if not exists public.scenario_definitions (
  key text primary key,
  type text not null,
  mode text not null,
  name_ru text not null,
  definition_json jsonb not null
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  language text not null default 'ru',
  tools_json jsonb not null default '{}'::jsonb
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_projects_updated on public.projects;
create trigger trg_projects_updated before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists trg_project_data_updated on public.project_data;
create trigger trg_project_data_updated before update on public.project_data
for each row execute function public.set_updated_at();

drop trigger if exists trg_steps_updated on public.steps;
create trigger trg_steps_updated before update on public.steps
for each row execute function public.set_updated_at();

alter table public.projects enable row level security;
alter table public.project_data enable row level security;
alter table public.steps enable row level security;
alter table public.user_settings enable row level security;

drop policy if exists "projects_owner_all" on public.projects;
create policy "projects_owner_all" on public.projects
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "project_data_owner_all" on public.project_data;
create policy "project_data_owner_all" on public.project_data
for all using (
  exists(select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
) with check (
  exists(select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
);

drop policy if exists "steps_owner_all" on public.steps;
create policy "steps_owner_all" on public.steps
for all using (
  exists(select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
) with check (
  exists(select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
);

drop policy if exists "user_settings_owner_all" on public.user_settings;
create policy "user_settings_owner_all" on public.user_settings
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
