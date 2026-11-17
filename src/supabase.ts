import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL ?? 'http://localhost', import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'missing')
export const WA = import.meta.env.VITE_WHATSAPP ?? ''
export type Quote = { id: string; created_at: string; name: string; phone: string; service: string; details: string; status: string }
