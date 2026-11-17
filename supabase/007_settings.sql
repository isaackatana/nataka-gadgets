create table if not exists public.site_settings (
  key text primary key check (key in ('address','hours','phone','map_url')),
  value text not null default '' check (char_length(value) <= 500)
);
alter table public.site_settings enable row level security;
create policy "anyone can read settings" on public.site_settings for select to anon, authenticated using (true);
create policy "staff manage settings" on public.site_settings for all to authenticated using (true) with check (true);
