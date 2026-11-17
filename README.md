# Nataka Gadget & Graphics Co.
React + TypeScript + Vite + Tailwind v4 + Supabase. Deploy on Vercel.

1. Supabase: new project, run `supabase/schema.sql` in the SQL editor.
2. Supabase > Authentication > Users: add your staff user (email + password). Turn off public sign-ups.
3. Copy `.env.example` to `.env`, fill in the three values (WhatsApp number in format 2547XXXXXXXX).
4. `npm install` then `npm run dev`. Staff area: `/#/admin`.
5. Vercel: import the project, add the same three env vars, deploy.
