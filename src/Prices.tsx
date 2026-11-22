import { useEffect, useState } from 'react'
import { supabase } from './supabase'
export type Price = { id: string; category: string; item: string; price: string }

export default function Prices() {
  const [rows, setRows] = useState<Price[]>([])
  useEffect(() => { supabase.from('prices').select('*').eq('category', 'tech').order('created_at').then(({ data }) => setRows((data as Price[]) ?? [])) }, [])
  if (rows.length === 0) return null
  return <section id="prices" className="mx-auto max-w-3xl px-5 py-14">
    <h2 className="text-3xl font-black">Repair price guide</h2>
    <p className="mt-2 max-w-xl">Starting prices to help you plan. The final price is confirmed after we check your device.</p>
    <dl className="mt-6 divide-y divide-ink/15 border-t-8 bg-white px-5 py-2" style={{ borderColor: '#00A6D6' }}>{rows.map(r => <div key={r.id} className="flex justify-between gap-4 py-3"><dt>{r.item}</dt><dd className="whitespace-nowrap font-bold">{r.price}</dd></div>)}</dl></section>
}
