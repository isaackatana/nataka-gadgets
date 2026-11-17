import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { Price } from './Prices'

export default function PriceAdmin() {
  const [rows, setRows] = useState<Price[]>([]); const [f, setF] = useState({ category: 'tech', item: '', price: '' }); const [err, setErr] = useState('')
  const load = async () => { const { data } = await supabase.from('prices').select('*').order('created_at'); setRows((data as Price[]) ?? []) }
  useEffect(() => { load() }, [])
  async function add(e: React.FormEvent) {
    e.preventDefault(); setErr('')
    const { error } = await supabase.from('prices').insert(f)
    if (error) setErr('Could not save: ' + error.message); else { setF({ ...f, item: '', price: '' }); load() }
  }
  const i = 'border-2 border-ink bg-white p-2 w-full'
  return <div className="mt-6">
    <form onSubmit={add} className="grid gap-2 border-2 border-ink bg-white p-4 sm:grid-cols-4">
      <select aria-label="Category" className={i} value={f.category} onChange={e => setF({ ...f, category: e.target.value })}><option value="tech">Tech Care</option><option value="brand">Brand Wear</option></select>
      <input required aria-label="Item" placeholder="Item (e.g. Phone screen replacement)" className={i + ' sm:col-span-2'} value={f.item} onChange={e => setF({ ...f, item: e.target.value })} />
      <input required aria-label="Price" placeholder="From KSh 1,500" className={i} value={f.price} onChange={e => setF({ ...f, price: e.target.value })} />
      {err && <p role="alert" className="text-mag sm:col-span-4">{err}</p>}
      <button className="bg-ink px-4 py-2 font-bold text-white sm:col-span-4">Add to price guide</button>
    </form>
    {rows.length === 0 && <p className="mt-6">No prices yet. The Price guide section stays hidden on the site until you add one.</p>}
    <ul className="mt-4 space-y-2">{rows.map(r => <li key={r.id} className="flex items-center justify-between gap-3 border-2 border-ink bg-white p-3">
      <span>{r.category === 'tech' ? 'Tech Care' : 'Brand Wear'} &middot; {r.item} &middot; <b>{r.price}</b></span>
      <button className="underline" onClick={async () => { await supabase.from('prices').delete().eq('id', r.id); load() }}>Remove</button></li>)}</ul></div>
}
