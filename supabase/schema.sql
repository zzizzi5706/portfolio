-- Run this in the Supabase SQL editor.
-- Also create an Auth user (Authentication → Users) for /admin login.

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('packaging', 'web', 'detail_page')),
  description text,
  thumbnail_url text,
  images text[] default '{}',
  display_order int default 0,
  participation text,
  project_year text
);

alter table public.projects
  add column if not exists participation text,
  add column if not exists project_year text;

create table if not exists public.careers (
  id uuid primary key default gen_random_uuid(),
  year_range text not null,
  company text not null,
  role text not null,
  employment_type text not null check (employment_type in ('regular', 'freelancer', 'contract')),
  description text,
  display_order int default 0
);

alter table public.projects enable row level security;
alter table public.careers enable row level security;

drop policy if exists "Public read projects" on public.projects;
create policy "Public read projects"
  on public.projects for select
  using (true);

drop policy if exists "Authenticated insert projects" on public.projects;
create policy "Authenticated insert projects"
  on public.projects for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated update projects" on public.projects;
create policy "Authenticated update projects"
  on public.projects for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated delete projects" on public.projects;
create policy "Authenticated delete projects"
  on public.projects for delete
  to authenticated
  using (true);

drop policy if exists "Public read careers" on public.careers;
create policy "Public read careers"
  on public.careers for select
  using (true);

drop policy if exists "Authenticated insert careers" on public.careers;
create policy "Authenticated insert careers"
  on public.careers for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated update careers" on public.careers;
create policy "Authenticated update careers"
  on public.careers for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated delete careers" on public.careers;
create policy "Authenticated delete careers"
  on public.careers for delete
  to authenticated
  using (true);

insert into storage.buckets (id, name, public)
values ('portfolio-images', 'portfolio-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read portfolio images" on storage.objects;
create policy "Public read portfolio images"
  on storage.objects for select
  using (bucket_id = 'portfolio-images');

drop policy if exists "Authenticated upload portfolio images" on storage.objects;
create policy "Authenticated upload portfolio images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'portfolio-images');

drop policy if exists "Authenticated update portfolio images" on storage.objects;
create policy "Authenticated update portfolio images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'portfolio-images');

drop policy if exists "Authenticated delete portfolio images" on storage.objects;
create policy "Authenticated delete portfolio images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'portfolio-images');
