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
create policy "anyone can read approved reviews" on public.reviews for select to anon, authenticated using (approved);
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
