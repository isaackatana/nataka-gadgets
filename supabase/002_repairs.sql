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
