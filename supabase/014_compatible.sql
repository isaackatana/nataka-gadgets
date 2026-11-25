-- "Compatible with" text per product (phone or laptop models a part fits). Run once, after 010_shop.sql.
alter table public.products add column if not exists compatible text not null default '' check (char_length(compatible) <= 300);
