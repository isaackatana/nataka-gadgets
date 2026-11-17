import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import Backup from './Backup'

type Q = { created_at: string; status: string }
type J = { created_at: string; collected_at: string | null; status: string; price_kes: number | null }
const key = (d: string) => d.slice(0, 7)
const label = (k: string) => new Date(k + '-01T00:00:00').toLocaleString(undefined, { month: 'long', year: 'numeric' })

export default function Summary() {
  const [q, setQ] = useState<Q[]>([]); const [j, setJ] = useState<J[]>([]); const [ready, setReady] = useState(false)
  useEffect(() => {
    Promise.all([supabase.from('quotes').select('created_at,status'), supabase.from('repairs').select('created_at,collected_at,status,price_kes')])
      .then(([a, b]) => { setQ((a.data as Q[]) ?? []); setJ((b.data as J[]) ?? []); setReady(true) })
  }, [])
  if (!ready) return <p className="mt-6">Loading...</p>
  const months: string[] = []
  for (let i = 0, d = new Date(); i < 6; i++, d.setMonth(d.getMonth() - 1, 1)) months.push(key(d.toISOString()))
  const rows = months.map(m => ({
    m, quotes: q.filter(x => key(x.created_at) === m).length,
    booked: j.filter(x => key(x.created_at) === m).length,
    done: j.filter(x => x.collected_at && key(x.collected_at) === m).length,
    takings: j.filter(x => x.collected_at && key(x.collected_at) === m).reduce((a, x) => a + (x.price_kes ?? 0), 0),
    unpriced: j.filter(x => x.collected_at && key(x.collected_at) === m && x.price_kes == null).length,
  }))
  const open = j.filter(x => x.status !== 'collected').length, newQ = q.filter(x => x.status === 'new').length
  const box = 'border-2 border-ink bg-white p-4'
  return <div className="mt-6">
    <div className="grid gap-3 sm:grid-cols-2">
      <div className={box}><div className="text-3xl font-black">{open}</div>repair jobs in the shop right now</div>
      <div className={box}><div className="text-3xl font-black">{newQ}</div>quote requests still marked new</div></div>
    <div className="mt-4 overflow-x-auto"><table className="w-full border-2 border-ink bg-white text-left">
      <thead><tr className="border-b-2 border-ink"><th className="p-3">Month</th><th className="p-3">Quotes received</th><th className="p-3">Repairs booked</th><th className="p-3">Repairs collected</th><th className="p-3">Takings from collected repairs</th></tr></thead>
      <tbody>{rows.map(r => <tr key={r.m} className="border-t border-ink/20"><td className="p-3 font-bold">{label(r.m)}</td><td className="p-3">{r.quotes}</td><td className="p-3">{r.booked}</td><td className="p-3">{r.done}</td>
        <td className="p-3">KSh {r.takings.toLocaleString()}{r.unpriced > 0 && <span className="block text-sm text-mag">{r.unpriced} collected without an amount</span>}</td></tr>)}</tbody></table></div>
    <p className="mt-3 text-sm">Takings add up the "Amount charged" you enter on each repair job. A repair counts in the month it was marked collected.</p>
    <Backup /></div>
}
