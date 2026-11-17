import { useEffect, useState } from 'react'
import { supabase } from './supabase'
export type Review = { id: string; name: string; rating: number; body: string; approved: boolean; created_at: string }
export const Stars = ({ n }: { n: number }) => <span role="img" aria-label={`${n} out of 5 stars`} className="text-yel" style={{ WebkitTextStroke: '1px #14213D' }}>{'★'.repeat(n)}<span className="opacity-30">{'★'.repeat(5 - n)}</span></span>

export default function Reviews() {
  const [rows, setRows] = useState<Review[]>([])
  useEffect(() => { supabase.from('reviews').select('*').eq('approved', true).order('created_at', { ascending: false }).limit(12).then(({ data }) => setRows((data as Review[]) ?? [])) }, [])
  if (rows.length === 0) return null
  const avg = rows.reduce((a, r) => a + r.rating, 0) / rows.length
  return <section id="reviews" className="mx-auto max-w-6xl px-5 py-14">
    <h2 className="text-3xl font-black">What customers say</h2>
    <p className="mt-2 flex items-center gap-2"><Stars n={Math.round(avg)} /> {avg.toFixed(1)} from {rows.length} verified {rows.length === 1 ? 'repair' : 'repairs'}</p>
    <ul className="mt-6 grid gap-4 md:grid-cols-3">{rows.filter(r => r.body).map(r => <li key={r.id} className="bg-white p-5"><Stars n={r.rating} /><p className="mt-2">{r.body}</p><p className="mt-3 text-sm font-bold">{r.name}</p></li>)}</ul></section>
}
