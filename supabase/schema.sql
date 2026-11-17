create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 120),
  phone text not null check (char_length(phone) between 5 and 30),
  service text not null,
  details text not null check (char_length(details) <= 2000),
  status text not null default 'new'
);
alter table public.quotes enable row level security;
create policy "anyone can request a quote" on public.quotes for insert to anon, authenticated with check (status = 'new');
create policy "staff read quotes" on public.quotes for select to authenticated using (true);
create policy "staff update quotes" on public.quotes for update to authenticated using (true) with check (true);
