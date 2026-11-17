import { useEffect, useState } from 'react'
import { supabase, type Quote } from './supabase'
import Repairs from './Repairs'
import PriceAdmin from './PriceAdmin'
import GalleryAdmin from './GalleryAdmin'
import ReviewAdmin from './ReviewAdmin'
import Summary from './Summary'
import SettingsAdmin from './SettingsAdmin'
import Today from './Today'

export default function Admin() {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState('')
  const [rows, setRows] = useState<Quote[]>([]); const [tab, setTab] = useState<'today' | 'quotes' | 'repairs' | 'prices' | 'gallery' | 'reviews' | 'summary' | 'shop'>('today')
  const load = async () => { const { data } = await supabase.from('quotes').select('*').order('created_at', { ascending: false }); setRows((data as Quote[]) ?? []) }
  useEffect(() => { supabase.auth.getSession().then(({ data }) => { setAuthed(!!data.session); if (data.session) load() }) }, [])
  async function login(e: React.FormEvent) {
    e.preventDefault(); const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
    if (error) setErr(error.message); else { setAuthed(true); load() }
  }
  async function setStatus(id: string, status: string) { await supabase.from('quotes').update({ status }).eq('id', id); load() }
  const f = 'mt-1 w-full border-2 border-ink bg-white p-3'
  if (authed === null) return null
  if (!authed) return <main className="mx-auto max-w-sm p-6"><h1 className="text-2xl font-black">Staff login</h1>
    <form onSubmit={login} className="mt-4 space-y-3"><label className="block font-semibold">Email<input type="email" required className={f} value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label className="block font-semibold">Password<input type="password" required className={f} value={pw} onChange={e => setPw(e.target.value)} /></label>
      {err && <p role="alert" className="text-mag">{err}</p>}<button className="bg-ink px-5 py-3 font-bold text-white">Log in</button></form></main>
  return <main className="mx-auto max-w-5xl p-6"><div className="flex items-center justify-between"><h1 className="text-2xl font-black">Staff area</h1>
    <div className="flex gap-4"><a href="#top" className="underline">View site</a><button className="underline" onClick={async () => { await supabase.auth.signOut(); setAuthed(false) }}>Log out</button></div></div>
    <div className="mt-4 flex flex-wrap gap-2">{(['today', 'repairs', 'quotes', 'prices', 'gallery', 'reviews', 'summary', 'shop'] as const).map(t => <button key={t} onClick={() => setTab(t)} aria-pressed={tab === t} className={'border-2 border-ink px-4 py-2 font-bold ' + (tab === t ? 'bg-ink text-white' : 'bg-white')}>{t === 'today' ? 'Today' : t === 'repairs' ? 'Repair jobs' : t === 'quotes' ? 'Quote requests' : t === 'prices' ? 'Price guide' : t === 'gallery' ? 'Gallery' : t === 'reviews' ? 'Reviews' : t === 'summary' ? 'Summary' : 'Shop details'}</button>)}</div>
    {tab === 'today' && <Today go={setTab} />}
    {tab === 'repairs' && <Repairs />}
    {tab === 'prices' && <PriceAdmin />}
    {tab === 'gallery' && <GalleryAdmin />}
    {tab === 'reviews' && <ReviewAdmin />}
    {tab === 'summary' && <Summary />}
    {tab === 'shop' && <SettingsAdmin />}
    {tab === 'quotes' && <>
    {rows.length === 0 && <p className="mt-6">No quote requests yet. They will appear here as customers send them.</p>}
    <ul className="mt-6 space-y-3">{rows.map(r => <li key={r.id} className="border-2 border-ink bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2"><div><b>{r.name}</b> &middot; <a className="underline" href={`tel:${r.phone}`}>{r.phone}</a><div className="text-sm text-ink/70">{r.service} &middot; {new Date(r.created_at).toLocaleString()}</div></div>
        <select aria-label="Status" value={r.status} onChange={e => setStatus(r.id, e.target.value)} className="border-2 border-ink p-2"><option>new</option><option>quoted</option><option>in progress</option><option>done</option></select></div>
      <p className="mt-2 whitespace-pre-wrap">{r.details}</p></li>)}</ul></>}</main>
}
