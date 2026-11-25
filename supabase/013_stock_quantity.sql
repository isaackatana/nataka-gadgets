-- Optional stock counts per product, for the "Low stock" list on the Today tab. Run once, after 010_shop.sql.
-- Empty (null) means "not counted": the product just uses the In stock / Out of stock button as before.
alter table public.products add column if not exists quantity integer check (quantity is null or quantity >= 0);
