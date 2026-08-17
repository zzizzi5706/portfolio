-- Run once in the Supabase SQL editor.

alter table public.projects add column if not exists project_detail text;
alter table public.projects add column if not exists category_detail text;
alter table public.projects add column if not exists channel text;
alter table public.projects add column if not exists scope text;
alter table public.projects add column if not exists role text;
