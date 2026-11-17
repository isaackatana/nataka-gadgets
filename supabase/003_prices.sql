create table if not exists public.prices (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('tech','brand')),
  item text not null check (char_length(item) between 1 and 120),
  price text not null check (char_length(price) between 1 and 60),
  created_at timestamptz not null default now()
);
alter table public.prices enable row level security;
create policy "anyone can read prices" on public.prices for select to anon, authenticated using (true);
create policy "staff manage prices" on public.prices for all to authenticated using (true) with check (true);
