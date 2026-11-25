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
create policy "anyone can see photos of active products" on public.product_images for select to anon
  using (exists (select 1 from public.products p where p.id = product_id and p.active));
drop policy if exists "staff manage product images" on public.product_images;
create policy "staff manage product images" on public.product_images for all to authenticated using (true) with check (true);
grant select on public.product_images to anon;
grant select, insert, update, delete on public.product_images to authenticated;
-- Keep any existing main photos: copy them into the new table once.
insert into public.product_images (product_id, path, position)
select p.id, p.image_path, 0 from public.products p
where p.image_path is not null and not exists (select 1 from public.product_images i where i.product_id = p.id and i.path = p.image_path);
