import { useEffect, useState } from 'react'
import { supabase } from './supabase'

// Open your site address followed by /#/status to see whether this deployed copy can reach the database.
// It shows only whether settings exist and the database address, never the key itself.
export default function Status() {
  const env = import.meta.env
  const url = (env.VITE_SUPABASE_URL as string | undefined) ?? ''
  const host = (() => { try { return new URL(url).host } catch { return '' } })()
  const [res, setRes] = useState('Checking...')
  useEffect(() => {
    if (!host || host === 'localhost') { setRes('FAILED: skipped, there is no database address in this build'); return }
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('active', true)
      .then(({ count, error, status }) => setRes(error ? `FAILED (code ${status}): ${error.message || 'could not reach the database'}` : `OK: ${count ?? 0} visible products`), () => setRes('FAILED: could not reach the database'))
  }, [host])
  const row = (k: string, v: string, bad = false) => <tr key={k} className="border-b-2 border-ink"><th className="p-3 text-left">{k}</th><td className={'p-3 ' + (bad ? 'font-bold text-mag' : '')}>{v}</td></tr>
  const keyLen = ((env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? '').length
  return <main className="mx-auto max-w-2xl px-5 py-10">
    <h1 className="text-3xl font-black">Site status</h1>
    <p className="mt-2 text-ink/70">Checks this deployed copy of the site. Settings are read when Vercel builds the site, so after changing them in Vercel you must redeploy.</p>
    <table className="mt-6 w-full border-2 border-ink bg-white"><tbody>
      {row('Database address', host && host !== 'localhost' ? host : 'NOT SET: add VITE_SUPABASE_URL in Vercel and redeploy', !host || host === 'localhost')}
      {row('Database key', keyLen > 20 ? 'set' : 'NOT SET: add VITE_SUPABASE_ANON_KEY in Vercel and redeploy', keyLen <= 20)}
      {row('WhatsApp number', env.VITE_WHATSAPP ? 'set' : 'NOT SET: add VITE_WHATSAPP in Vercel and redeploy', !env.VITE_WHATSAPP)}
      {row('Products from the database', res, res.startsWith('FAILED'))}
      {row('This page', location.origin)}
    </tbody></table>
    <p className="mt-6"><a className="underline" href="/shop">Go to the shop</a></p>
  </main>
}
