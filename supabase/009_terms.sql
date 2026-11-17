alter table public.site_settings drop constraint if exists site_settings_key_check;
alter table public.site_settings add constraint site_settings_key_check
  check (key in ('address','hours','phone','map_url','notice','notice_on','notice_until','terms'));
