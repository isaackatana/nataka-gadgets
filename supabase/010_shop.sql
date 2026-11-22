create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 120),
  category text not null check (char_length(category) between 1 and 60),
  description text not null default '' check (char_length(description) <= 600),
  price_kes integer not null check (price_kes >= 0),
  in_stock boolean not null default true,
  active boolean not null default true,
  image_path text
);
alter table public.products enable row level security;
create policy "anyone can see active products" on public.products for select to anon, authenticated using (active);
create policy "staff manage products" on public.products for all to authenticated using (true) with check (true);
-- Product photos reuse the gallery storage bucket (folder shop/), created in 004_gallery.sql.
