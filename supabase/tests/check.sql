-- Test harness: stubs Supabase roles/storage, runs all migrations, checks access rules.
create role anon nologin; create role authenticated nologin;
grant usage on schema public to anon, authenticated;
create schema storage; create table storage.buckets(id text primary key, name text, public boolean);
create table storage.objects(id uuid default gen_random_uuid(), bucket_id text, name text);
alter table storage.objects enable row level security;
grant usage on schema storage to anon, authenticated;
\i supabase/schema.sql
\i supabase/002_repairs.sql
\i supabase/003_prices.sql
\i supabase/004_gallery.sql
\i supabase/005_reviews.sql
\i supabase/006_summary.sql
\i supabase/007_settings.sql
\i supabase/008_notice.sql
\i supabase/009_terms.sql
\i supabase/010_shop.sql
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage on all sequences in schema public to anon, authenticated;
set role authenticated;
insert into repairs(customer_name, phone, device) values ('Test','0712 345 678','Samsung A14');
select code from repairs;
set role anon;
do $$ begin
  begin insert into quotes(name,phone,service,details) values('A','0700000000','Laptop repair','x'); raise notice 'PASS anon can insert quote'; exception when others then raise notice 'FAIL anon insert quote: %', sqlerrm; end;
  begin insert into quotes(name,phone,service,details,status) values('A','0700000000','x','x','done'); raise notice 'FAIL anon set status'; exception when others then raise notice 'PASS anon cannot set status'; end;
  if (select count(*) from quotes)=0 then raise notice 'PASS anon cannot read quotes'; else raise notice 'FAIL anon reads quotes'; end if;
  if (select count(*) from repairs)=0 then raise notice 'PASS anon cannot read repairs'; else raise notice 'FAIL anon reads repairs'; end if;
  if (select count(*) from track_repair('ng-1001','+254 712 345 678'))=1 then raise notice 'PASS tracker right code+phone'; else raise notice 'FAIL tracker'; end if;
  if (select count(*) from track_repair('NG-1001','0799999999'))=0 then raise notice 'PASS tracker wrong phone blocked'; else raise notice 'FAIL tracker wrong phone'; end if;
  if (select count(*) from track_repair('NG-1001','123'))=0 then raise notice 'PASS tracker short phone blocked'; else raise notice 'FAIL tracker short phone'; end if;
  begin insert into prices(category,item,price) values('tech','x','y'); raise notice 'FAIL anon writes prices'; exception when others then raise notice 'PASS anon cannot write prices'; end;
  if submit_review('NG-1001','0712345678',5,'x') = 'not_ready' then raise notice 'PASS review blocked before collected'; else raise notice 'FAIL review before collected'; end if;
  if submit_review('NG-1001','0799999999',5,'x') = 'not_found' then raise notice 'PASS review wrong phone blocked'; else raise notice 'FAIL review wrong phone'; end if;
end $$;
reset role; set role authenticated; update repairs set status='collected'; set role anon;
do $$ begin
  if submit_review('ng-1001','+254712345678',5,'Great') = 'ok' then raise notice 'PASS review accepted'; else raise notice 'FAIL review accepted'; end if;
  if submit_review('NG-1001','0712345678',1,'Again') = 'already' then raise notice 'PASS one review per job'; else raise notice 'FAIL duplicate review'; end if;
  if (select count(*) from reviews)=0 then raise notice 'PASS unapproved review hidden'; else raise notice 'FAIL unapproved visible'; end if;
end $$;
reset role; set role authenticated;
do $$ begin
  if (select collected_at is not null from repairs limit 1) then raise notice 'PASS collected_at set when collected'; else raise notice 'FAIL collected_at'; end if;
  update repairs set status='repairing'; if (select collected_at is null from repairs limit 1) then raise notice 'PASS collected_at cleared when reopened'; else raise notice 'FAIL collected_at reopen'; end if;
end $$;
reset role; set role authenticated; insert into site_settings values ('address','Test street');
set role anon;
do $$ begin
  if (select count(*) from site_settings)=1 then raise notice 'PASS anon can read settings'; else raise notice 'FAIL anon read settings'; end if;
  begin update site_settings set value='x'; if (select value from site_settings)='x' then raise notice 'FAIL anon edits settings'; else raise notice 'PASS anon cannot edit settings'; end if; exception when others then raise notice 'PASS anon cannot edit settings'; end;
  begin insert into site_settings values ('bogus','x'); raise notice 'FAIL bad key accepted'; exception when others then raise notice 'PASS bad key refused'; end;
end $$;
reset role; set role authenticated; insert into site_settings values ('notice','Closed today'),('notice_on','true');
set role anon;
do $$ begin
  if (select count(*) from site_settings where key like 'notice%')=2 then raise notice 'PASS anon can read notice'; else raise notice 'FAIL notice read'; end if;
  begin insert into site_settings values ('notice_until','2026-12-25'); raise notice 'FAIL anon writes notice'; exception when others then raise notice 'PASS anon cannot write notice'; end;
end $$;
reset role; set role authenticated;
do $$ begin
  begin insert into site_settings values ('terms','Test terms'); raise notice 'PASS staff can save terms'; exception when others then raise notice 'FAIL staff terms: %', sqlerrm; end;
end $$;
set role anon;
do $$ begin
  begin insert into site_settings values ('x','y'); raise notice 'FAIL bad key after 009'; exception when others then raise notice 'PASS bad key still refused after 009'; end;
end $$;
reset role; set role authenticated; insert into products(name,category,price_kes,active) values ('Shown','Batteries',500,true),('Hidden','Batteries',500,false);
set role anon;
do $$ begin
  if (select count(*) from products)=1 then raise notice 'PASS anon sees only active products'; else raise notice 'FAIL products visibility'; end if;
  begin insert into products(name,category,price_kes) values('x','x',1); raise notice 'FAIL anon adds product'; exception when others then raise notice 'PASS anon cannot add products'; end;
end $$;
