-- Nataka Gadgets - Tech Care: complete database setup in ONE file.
-- Paste all of it into the Supabase SQL editor and press Run. Safe to run again: it only adds what is missing.
-- Includes every table, rule, the photo storage, and the permissions (grants). Does not add starter products.

-- ===== schema.sql =====
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
drop policy if exists "anyone can request a quote" on public.quotes;
create policy "anyone can request a quote" on public.quotes for insert to anon, authenticated with check (status = 'new');
drop policy if exists "staff read quotes" on public.quotes;
create policy "staff read quotes" on public.quotes for select to authenticated using (true);
drop policy if exists "staff update quotes" on public.quotes;
create policy "staff update quotes" on public.quotes for update to authenticated using (true) with check (true);

-- ===== 002_repairs.sql =====
create sequence if not exists public.repair_seq start 1001;
create table if not exists public.repairs (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('NG-' || nextval('public.repair_seq')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  customer_name text not null,
  phone text not null,
  device text not null,
  issue text not null default '',
  status text not null default 'received',
  note text not null default ''
);
alter table public.repairs enable row level security;
drop policy if exists "staff manage repairs" on public.repairs;
create policy "staff manage repairs" on public.repairs for all to authenticated using (true) with check (true);
create or replace function public.touch_repair() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists repairs_touch on public.repairs;
create trigger repairs_touch before update on public.repairs for each row execute function public.touch_repair();
-- Public lookup: needs the job code AND the phone number it was booked with.
create or replace function public.track_repair(p_code text, p_phone text)
returns table(code text, device text, status text, note text, updated_at timestamptz)
language sql security definer set search_path = public as $$
  select r.code, r.device, r.status, r.note, r.updated_at from public.repairs r
  where upper(trim(p_code)) = r.code
    and right(regexp_replace(p_phone, '\D', '', 'g'), 9) = right(regexp_replace(r.phone, '\D', '', 'g'), 9)
    and length(regexp_replace(p_phone, '\D', '', 'g')) >= 9
$$;
grant execute on function public.track_repair(text, text) to anon, authenticated;

-- ===== 003_prices.sql =====
create table if not exists public.prices (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('tech','brand')),
  item text not null check (char_length(item) between 1 and 120),
  price text not null check (char_length(price) between 1 and 60),
  created_at timestamptz not null default now()
);
alter table public.prices enable row level security;
drop policy if exists "anyone can read prices" on public.prices;
create policy "anyone can read prices" on public.prices for select to anon, authenticated using (true);
drop policy if exists "staff manage prices" on public.prices;
create policy "staff manage prices" on public.prices for all to authenticated using (true) with check (true);

-- ===== 004_gallery.sql =====
create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null check (char_length(title) between 1 and 120),
  category text not null check (category in ('tech','brand')),
  path text not null
);
alter table public.gallery enable row level security;
drop policy if exists "anyone can view gallery" on public.gallery;
create policy "anyone can view gallery" on public.gallery for select to anon, authenticated using (true);
drop policy if exists "staff manage gallery" on public.gallery;
create policy "staff manage gallery" on public.gallery for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public) values ('gallery', 'gallery', true) on conflict (id) do nothing;
drop policy if exists "public read gallery files" on storage.objects;
create policy "public read gallery files" on storage.objects for select to anon, authenticated using (bucket_id = 'gallery');
drop policy if exists "staff upload gallery files" on storage.objects;
create policy "staff upload gallery files" on storage.objects for insert to authenticated with check (bucket_id = 'gallery');
drop policy if exists "staff delete gallery files" on storage.objects;
create policy "staff delete gallery files" on storage.objects for delete to authenticated using (bucket_id = 'gallery');

-- ===== 005_reviews.sql =====
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  repair_id uuid not null unique references public.repairs(id) on delete cascade,
  created_at timestamptz not null default now(),
  name text not null,
  rating int not null check (rating between 1 and 5),
  body text not null default '' check (char_length(body) <= 600),
  approved boolean not null default false
);
alter table public.reviews enable row level security;
drop policy if exists "anyone can read approved reviews" on public.reviews;
create policy "anyone can read approved reviews" on public.reviews for select to anon, authenticated using (approved);
drop policy if exists "staff manage reviews" on public.reviews;
create policy "staff manage reviews" on public.reviews for all to authenticated using (true) with check (true);
-- Customers review through the tracker: code + phone must match and the job must be collected.
create or replace function public.submit_review(p_code text, p_phone text, p_rating int, p_body text)
returns text language plpgsql security definer set search_path = public as $$
declare r public.repairs%rowtype;
begin
  if p_rating not between 1 and 5 or char_length(coalesce(p_body,'')) > 600 then return 'invalid'; end if;
  select * into r from public.repairs
   where code = upper(trim(p_code))
     and length(regexp_replace(p_phone, '\D', '', 'g')) >= 9
     and right(regexp_replace(p_phone, '\D', '', 'g'), 9) = right(regexp_replace(phone, '\D', '', 'g'), 9);
  if not found then return 'not_found'; end if;
  if r.status <> 'collected' then return 'not_ready'; end if;
  insert into public.reviews(repair_id, name, rating, body) values (r.id, split_part(trim(r.customer_name), ' ', 1), p_rating, trim(coalesce(p_body,'')))
    on conflict (repair_id) do nothing;
  if not found then return 'already'; end if;
  return 'ok';
end $$;
grant execute on function public.submit_review(text, text, int, text) to anon, authenticated;

-- ===== 006_summary.sql =====
alter table public.repairs add column if not exists price_kes integer check (price_kes is null or price_kes >= 0);
alter table public.repairs add column if not exists collected_at timestamptz;
create or replace function public.touch_repair() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  if new.status = 'collected' and old.status <> 'collected' then new.collected_at = now();
  elsif new.status <> 'collected' then new.collected_at = null; end if;
  return new;
end $$;
-- Jobs already collected before this migration: use their last update as the collected date.
update public.repairs set collected_at = updated_at where status = 'collected' and collected_at is null;

-- ===== 007_settings.sql =====
create table if not exists public.site_settings (
  key text primary key check (key in ('address','hours','phone','map_url')),
  value text not null default '' check (char_length(value) <= 500)
);
alter table public.site_settings enable row level security;
drop policy if exists "anyone can read settings" on public.site_settings;
create policy "anyone can read settings" on public.site_settings for select to anon, authenticated using (true);
drop policy if exists "staff manage settings" on public.site_settings;
create policy "staff manage settings" on public.site_settings for all to authenticated using (true) with check (true);

-- ===== 008_notice.sql =====
alter table public.site_settings drop constraint if exists site_settings_key_check;
alter table public.site_settings add constraint site_settings_key_check
  check (key in ('address','hours','phone','map_url','notice','notice_on','notice_until'));

-- ===== 009_terms.sql =====
alter table public.site_settings drop constraint if exists site_settings_key_check;
alter table public.site_settings add constraint site_settings_key_check
  check (key in ('address','hours','phone','map_url','notice','notice_on','notice_until','terms'));

-- ===== 010_shop.sql =====
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
drop policy if exists "anyone can see active products" on public.products;
create policy "anyone can see active products" on public.products for select to anon, authenticated using (active);
drop policy if exists "staff manage products" on public.products;
create policy "staff manage products" on public.products for all to authenticated using (true) with check (true);
-- Product photos reuse the gallery storage bucket (folder shop/), created in 004_gallery.sql.

-- ===== 012_product_images.sql =====
-- Several photos per product, for the product details page. Run once, after 010_shop.sql.
-- product_images holds every photo of a product; products.image_path stays the main (cover) photo.
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  product_id uuid not null references public.products(id) on delete cascade,
  path text not null check (char_length(path) between 1 and 200),
  position integer not null default 0
);
create index if not exists product_images_product_idx on public.product_images (product_id, position);
alter table public.product_images enable row level security;
drop policy if exists "anyone can see photos of active products" on public.product_images;
drop policy if exists "anyone can see photos of active products" on public.product_images;
create policy "anyone can see photos of active products" on public.product_images for select to anon
  using (exists (select 1 from public.products p where p.id = product_id and p.active));
drop policy if exists "staff manage product images" on public.product_images;
drop policy if exists "staff manage product images" on public.product_images;
create policy "staff manage product images" on public.product_images for all to authenticated using (true) with check (true);
grant select on public.product_images to anon;
grant select, insert, update, delete on public.product_images to authenticated;
-- Keep any existing main photos: copy them into the new table once.
insert into public.product_images (product_id, path, position)
select p.id, p.image_path, 0 from public.products p
where p.image_path is not null and not exists (select 1 from public.product_images i where i.product_id = p.id and i.path = p.image_path);

-- ===== 013_stock_quantity.sql =====
-- Optional stock counts per product, for the "Low stock" list on the Today tab. Run once, after 010_shop.sql.
-- Empty (null) means "not counted": the product just uses the In stock / Out of stock button as before.
alter table public.products add column if not exists quantity integer check (quantity is null or quantity >= 0);

-- ===== 014_compatible.sql =====
-- "Compatible with" text per product (phone or laptop models a part fits). Run once, after 010_shop.sql.
alter table public.products add column if not exists compatible text not null default '' check (char_length(compatible) <= 300);

-- ===== 015_grants.sql =====
-- Table permissions. Newer Supabase projects no longer give the website's API roles access to new tables
-- automatically, which shows up as "403" errors in the browser. Run this after the other files; safe to run again.
-- Row level security (the policies in the other files) still decides which rows each person can see or change.
-- A table that does not exist yet is skipped with a notice: run the file that creates it, then run this again.
do $$
declare t text;
begin
  foreach t in array array['prices','gallery','reviews','site_settings','products','product_images'] loop   -- public can read these
    if to_regclass('public.' || t) is null then raise notice 'Table % does not exist yet, skipped', t;
    else execute format('grant select on public.%I to anon', t); end if;
  end loop;
  foreach t in array array['quotes','repairs','prices','gallery','reviews','site_settings','products','product_images'] loop   -- staff can do everything
    if to_regclass('public.' || t) is null then raise notice 'Table % does not exist yet, skipped', t;
    else execute format('grant select, insert, update, delete on public.%I to authenticated', t); end if;
  end loop;
  if to_regclass('public.quotes') is not null then execute 'grant insert on public.quotes to anon'; end if;   -- visitors can send quotes, never read them
end $$;
