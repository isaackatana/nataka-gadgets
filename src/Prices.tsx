import { useEffect, useState } from 'react'
import { supabase } from './supabase'
export type Price = { id: string; category: 'tech' | 'brand'; item: string; price: string }

export default function Prices() {
  const [rows, setRows] = useState<Price[]>([])
  useEffect(() => { supabase.from('prices').select('*').order('created_at').then(({ data }) => setRows((data as Price[]) ?? [])) }, [])
  if (rows.length === 0) return null
  const col = (cat: Price['category'], title: string, c: string) => <div className="border-t-8 bg-white p-5" style={{ borderColor: c }}>
    <h3 className="text-lg font-bold">{title}</h3>
    <dl className="mt-3 divide-y divide-ink/15">{rows.filter(r => r.category === cat).map(r => <div key={r.id} className="flex justify-between gap-4 py-2"><dt>{r.item}</dt><dd className="font-bold whitespace-nowrap">{r.price}</dd></div>)}</dl></div>
  return <section id="prices" className="mx-auto max-w-6xl px-5 py-14">
    <h2 className="text-3xl font-black">Price guide</h2>
    <p className="mt-2 max-w-xl">Starting prices to help you plan. The final price is confirmed after we check your device or your design.</p>
    <div className="mt-6 grid gap-4 md:grid-cols-2">{col('tech', 'Tech Care', '#00A6D6')}{col('brand', 'Brand Wear', '#E5287A')}</div></section>
}
