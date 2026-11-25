# Launch guide: Nataka Gadgets - Tech Care

## 1. Supabase (about 10 minutes)
1. Create a project. In the SQL editor run, in order: `supabase/schema.sql`, `002_repairs.sql`, `003_prices.sql`, `004_gallery.sql`, `005_reviews.sql`, `006_summary.sql`, `007_settings.sql`, `008_notice.sql`, `009_terms.sql`, `010_shop.sql`, `012_product_images.sql` (product photos and details pages), `013_stock_quantity.sql` (stock counts and the Low stock list), `014_compatible.sql` ("Compatible with" models). Optional: `011_seed_products.sql` adds about 30 starter repair tools and parts, hidden until you check the prices (see the note at the top of that file).
2. Authentication > Providers > Email: turn OFF "Allow new users to sign up". Only you and your staff should have accounts.
3. Authentication > Users > Add user: create each staff member with a strong password.
4. Authentication > Rate limits: keep the defaults.
5. Settings > API: copy the Project URL and the `anon` public key. Never use the `service_role` key in this site.

## 2. Vercel
1. Push the project to GitHub (the included `.gitignore` keeps `node_modules` and `.env` out; never upload those), import it in Vercel (framework: Vite).
2. Add environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_WHATSAPP` (format 2547XXXXXXXX), `VITE_SITE_URL` (your live address, no trailing slash) and `VITE_AREA` (your town, so pages can rank for searches like "screen repair <town>").
3. Deploy, then add your domain under Settings > Domains.

## 3. Test every feature on the live site
- [ ] Home page loads on a phone; WhatsApp button opens the right number.
- [ ] Send a test quote. It appears in Staff area > Quote requests.
- [ ] Staff login at `/#/admin` works; a wrong password is refused.
- [ ] Book a test repair. Note the job code (NG-1001).
- [ ] On the public site, Track your repair: right code + phone shows progress; wrong phone shows "No repair found".
- [ ] Add your Terms and warranty text in Shop details (write only what you will honour; check the wording with someone you trust if unsure). It should print at the bottom of the receipt.
- [ ] Tap Print receipt on the test job. A receipt with the job code should open and the print window should appear (allow pop-ups if asked). Try it on your receipt printer if you have one.
- [ ] Tap Message on WhatsApp on the test job. The right phone number and message should open in WhatsApp.
- [ ] Change the status and add a note; refresh the tracker and confirm it updates.
- [ ] Mark the test repair as collected, leave a review in the tracker, then approve it in Staff area > Reviews and check it shows on the site.
- [ ] Enter an Amount charged on the test job, mark it collected, then open Staff area > Summary: it should show in this month's repairs collected and takings.
- [ ] In Staff area > Summary, download the Repair jobs file and open it in Excel or Google Sheets. The test job should be in it.
- [ ] Staff area > Shop details: add your address, hours, phone and Google Maps link. The Find us section should appear on the home page and the map button should open your shop.
- [ ] Shop details > Notice banner: switch it on with a test message and a show-until date of today. It should appear on the home page and a service page. Switch it off afterwards.
- [ ] Use "Call me back" at the bottom of the home page. It should appear in Staff area > Quote requests as a Callback request (and trigger the email alert if set up).
- [ ] Staff area opens on Today. With a test job set to ready for pickup and a new test quote, both should be listed with working Message buttons.
- [ ] Staff area > Products: add a product with a photo. It should appear under Repair parts and tools on the home page and at /shop. Tap Order on WhatsApp and check the message. Mark it Out of stock and check the site changes.
- [ ] Add one price and one photo. The Price guide and Our work sections appear; remove the test items after.
- [ ] Delete the test quote and repair job (Supabase > Table editor).

## 4. Good habits
- Write the job code and customer phone on the receipt.
- Spam: both the quote form and the call-back form have a hidden trap field that catches most bots. If real spam still gets through, ask me to add Cloudflare Turnstile.
- Supabase free tier pauses after a week of no activity; open the site or dashboard now and then, or upgrade.

## Database tests
`supabase/tests/check.sql` checks that the public cannot read quotes or repairs, cannot change prices, and that the tracker needs both code and phone. All checks passed on a test Postgres.

## 5. Email alert for new quotes (optional, recommended)
You get an email with the customer's name, phone, request and a WhatsApp link the moment a quote is sent.
1. Resend (resend.com): create an account, verify your domain, create an API key.
2. Install the Supabase CLI, then in the project folder run:
   - `supabase login` and `supabase link --project-ref YOUR_REF`
   - `supabase secrets set RESEND_API_KEY=... NOTIFY_EMAIL=you@yourdomain FROM_EMAIL="Nataka Quotes <quotes@yourdomain>" WEBHOOK_SECRET=any-long-random-text`
   - `supabase functions deploy notify-quote --no-verify-jwt`
3. Supabase dashboard > Database > Webhooks > Create: table `quotes`, event INSERT, type "Supabase Edge Functions", function `notify-quote`, add header `x-webhook-secret` with the same WEBHOOK_SECRET value.
4. Test: send a quote from the site. The email should arrive within seconds. If not, check Edge Functions > notify-quote > Logs.

## 6. Get found on Google
1. Set `VITE_SITE_URL` and `VITE_AREA` in Vercel, then redeploy. This creates `sitemap.xml` and a page for every service at `/services/...`.
2. Google Search Console (search.google.com/search-console): add your site, then submit `sitemap.xml`.
3. Create a free Google Business Profile for the shop and put your site address in it. This matters most for "near me" searches.
4. Test: open `/services/laptop-repair` directly. It should show the Laptop repair page, and "Get a quote" from it should pre-select that service.
