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
