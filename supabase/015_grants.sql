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
