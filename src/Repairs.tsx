import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { STEPS } from './Track'
import { printReceipt } from './receipt'
import { useSettings } from './FindUs'
export type R = { id: string; code: string; customer_name: string; phone: string; device: string; issue: string; status: string; note: string; price_kes: number | null; created_at?: string }

// Turns 07xx / 01xx / +254... into 254xxxxxxxxx for wa.me links.
export const intl = (p: string) => { const d = p.replace(/\D/g, ''); return d.startsWith('254') ? d : '254' + d.replace(/^0/, '') }
export function waLink(r: R) {
  const first = r.customer_name.split(' ')[0], site = location.origin + '/#track', sig = ' - Nataka Gadgets, Tech Care'
  const m: Record<string, string> = {
    'received': `Hi ${first}, we have received your ${r.device}. Your job code is ${r.code}. Track progress anytime: ${site}`,
    'ready for pickup': `Hi ${first}, good news: your ${r.device} (${r.code}) is ready for pickup.`,
    'collected': `Hi ${first}, thank you for choosing us. If you are happy with the repair, please leave a short review: ${site} (use job code ${r.code}).`,
  }
  const text = (m[r.status] ?? `Hi ${first}, update on your ${r.device} (${r.code}): ${r.status}.${r.note ? ' ' + r.note : ''}`) + sig
  return `https://wa.me/${intl(r.phone)}?text=${encodeURIComponent(text)}`
}

export default function Repairs() {
  const { s: shop } = useSettings()
  const [rows, setRows] = useState<R[]>([]); const [f, setF] = useState({ customer_name: '', phone: '', device: '', issue: '' }); const [err, setErr] = useState('')
  const load = async () => { const { data } = await supabase.from('repairs').select('*').order('created_at', { ascending: false }); setRows((data as R[]) ?? []) }
  useEffect(() => { load() }, [])
  async function add(e: React.FormEvent) {
    e.preventDefault(); setErr('')
    const { error } = await supabase.from('repairs').insert(f)
    if (error) setErr('Could not save: ' + error.message); else { setF({ customer_name: '', phone: '', device: '', issue: '' }); load() }
  }
  async function upd(id: string, patch: Partial<R>) { await supabase.from('repairs').update(patch).eq('id', id); load() }
  const i = 'border-2 border-ink bg-white p-2 w-full'
  const k = (n: keyof typeof f) => ({ value: f[n], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [n]: e.target.value }) })
  return <div className="mt-6">
    <form onSubmit={add} className="grid gap-2 border-2 border-ink bg-white p-4 sm:grid-cols-2">
      <input required aria-label="Customer name" placeholder="Customer name" className={i} {...k('customer_name')} />
      <input required type="tel" aria-label="Phone" placeholder="Phone" className={i} {...k('phone')} />
      <input required aria-label="Device" placeholder="Device (e.g. Samsung A14)" className={i} {...k('device')} />
      <input aria-label="Issue" placeholder="Issue" className={i} {...k('issue')} />
      {err && <p role="alert" className="text-mag sm:col-span-2">{err}</p>}
      <button className="bg-ink px-4 py-2 font-bold text-white sm:col-span-2">Book in repair and get job code</button>
    </form>
    {rows.length === 0 && <p className="mt-6">No repair jobs yet. Book one in above and give the customer their job code.</p>}
    <ul className="mt-4 space-y-3">{rows.map(r => <li key={r.id} className="border-2 border-ink bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2"><div><b>{r.code}</b> &middot; {r.device}<div className="text-sm text-ink/70">{r.customer_name} &middot; {r.phone}{r.issue && ' · ' + r.issue}</div></div>
        <div className="flex items-center gap-3"><button type="button" onClick={() => printReceipt(r, shop)} className="border-2 border-ink bg-white px-3 py-2 font-bold">Print receipt</button><a href={waLink(r)} target="_blank" rel="noreferrer" className="border-2 border-ink bg-yel px-3 py-2 font-bold">Message on WhatsApp</a><select aria-label="Status" value={r.status} onChange={e => upd(r.id, { status: e.target.value })} className="border-2 border-ink p-2">{STEPS.map(s => <option key={s}>{s}</option>)}</select></div></div>
      <label className="mt-2 flex items-center gap-2 text-sm font-semibold">Amount charged (KSh)<input type="number" min={0} inputMode="numeric" defaultValue={r.price_kes ?? ''} onBlur={e => { const v = e.target.value === '' ? null : Math.round(+e.target.value); if (v !== r.price_kes) upd(r.id, { price_kes: v }) }} className="w-32 border-2 border-ink bg-white p-1" /></label>
      <input aria-label="Note for customer" defaultValue={r.note} onBlur={e => e.target.value !== r.note && upd(r.id, { note: e.target.value })} placeholder="Note the customer will see (optional)" className={i + ' mt-2'} /></li>)}</ul></div>
}
