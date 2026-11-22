# Nataka Gadgets - Tech Care
React + TypeScript + Vite + Tailwind v4 + Supabase. Deploy on Vercel.

1. Supabase: new project, run `supabase/schema.sql`, then `supabase/002_repairs.sql` `supabase/003_prices.sql` `supabase/004_gallery.sql` `supabase/005_reviews.sql` `supabase/006_summary.sql` `supabase/007_settings.sql` `supabase/008_notice.sql` and `supabase/009_terms.sql` and `supabase/010_shop.sql`, in the SQL editor.
2. Supabase > Authentication > Users: add your staff user (email + password). Turn off public sign-ups.
3. Copy `.env.example` to `.env`, fill in the values (WhatsApp number in format 2547XXXXXXXX).
4. `npm install` then `npm run dev`. Staff area: `/#/admin`.
5. Vercel and launch checks: see `LAUNCH_GUIDE.md`.
