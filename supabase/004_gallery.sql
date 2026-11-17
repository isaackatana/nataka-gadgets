create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null check (char_length(title) between 1 and 120),
  category text not null check (category in ('tech','brand')),
  path text not null
);
alter table public.gallery enable row level security;
create policy "anyone can view gallery" on public.gallery for select to anon, authenticated using (true);
create policy "staff manage gallery" on public.gallery for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public) values ('gallery', 'gallery', true) on conflict (id) do nothing;
create policy "public read gallery files" on storage.objects for select to anon, authenticated using (bucket_id = 'gallery');
create policy "staff upload gallery files" on storage.objects for insert to authenticated with check (bucket_id = 'gallery');
create policy "staff delete gallery files" on storage.objects for delete to authenticated using (bucket_id = 'gallery');
