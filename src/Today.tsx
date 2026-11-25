import { useEffect, useState } from 'react'
import { supabase, type Quote } from './supabase'
import { intl, waLink, type R } from './Repairs'
import { LOW_STOCK } from './shopData'

type Tab = 'today' | 'repairs' | 'quotes' | 'prices' | 'gallery' | 'reviews' | 'summary' | 'shop' | 'products'
const days = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
const ago = (iso: string) => { const d = days(iso); return d <= 0 ? 'today' : d === 1 ? '1 day ago' : `${d} days ago` }

export default function Today({ go }: { go: (t: Tab) => void }) {
  const [jobs, setJobs] = useState<(R & { updated_at: string })[]>([]); const [quotes, setQuotes] = useState<Quote[]>([]); const [reviews, setReviews] = useState(0); const [ready, setReady] = useState(false); const [low, setLow] = useState<{ id: string; name: string; quantity: number }[]>([])
  useEffect(() => {
    Promise.all([
      supabase.from('repairs').select('*').neq('status', 'collected').order('updated_at'),
      supabase.from('quotes').select('*').eq('status', 'new').order('created_at'),
      supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('approved', false),
      supabase.from('products').select('id,name,quantity').not('quantity', 'is', null).lte('quantity', LOW_STOCK).order('quantity'),
    ]).then(([a, b, c, d]) => { setLow((d.data as typeof low) ?? []); setJobs((a.data as (R & { updated_at: string })[]) ?? []); setQuotes((b.data as Quote[]) ?? []); setReviews(c.count ?? 0); setReady(true) })
  }, [])
  if (!ready) return <p className="mt-6">Loading...</p>
  const pickup = jobs.filter(j => j.status === 'ready for pickup')
  const stale = jobs.filter(j => j.status !== 'ready for pickup' && days(j.updated_at) >= 3)
  const box = 'border-2 border-ink bg-white p-4'
  const btn = 'border-2 border-ink bg-yel px-3 py-1 font-bold'
  const none = <p className="text-ink/70">Nothing here. Good.</p>
  const qWa = (q: Quote) => `https://wa.me/${intl(q.phone)}?text=${encodeURIComponent(`Hi ${q.name.split(' ')[0]}, thank you for contacting Nataka Gadgets - Tech Care about: ${q.service}.`)}`
  return <div className="mt-6 grid gap-4 md:grid-cols-2">
    <section className={box}><h2 className="text-lg font-bold">Ready for pickup ({pickup.length})</h2><p className="text-sm text-ink/70">Customers waiting to be told, or to collect.</p>
      <ul className="mt-2 space-y-2">{pickup.map(j => <li key={j.id} className="flex flex-wrap items-center justify-between gap-2"><span><b>{j.code}</b> {j.device}, {j.customer_name}<span className="block text-sm text-ink/70">Ready {ago(j.updated_at)}</span></span><a className={btn} href={waLink(j)} target="_blank" rel="noreferrer">Message</a></li>)}</ul>{pickup.length === 0 && none}</section>
    <section className={box}><h2 className="text-lg font-bold">New quotes and callbacks ({quotes.length})</h2><p className="text-sm text-ink/70">Waiting for your reply. Mark them quoted when done.</p>
      <ul className="mt-2 space-y-2">{quotes.map(q => <li key={q.id} className="flex flex-wrap items-center justify-between gap-2"><span><b>{q.name}</b> &middot; {q.service}<span className="block text-sm text-ink/70">{ago(q.created_at)} &middot; <a className="underline" href={`tel:${q.phone}`}>{q.phone}</a></span></span><a className={btn} href={qWa(q)} target="_blank" rel="noreferrer">Message</a></li>)}</ul>{quotes.length === 0 && none}
      {quotes.length > 0 && <button className="mt-3 underline" onClick={() => go('quotes')}>Open Quote requests</button>}</section>
    <section className={box}><h2 className="text-lg font-bold">Jobs not updated in 3 days ({stale.length})</h2><p className="text-sm text-ink/70">Check these, update the status or message the customer.</p>
      <ul className="mt-2 space-y-2">{stale.map(j => <li key={j.id}><b>{j.code}</b> {j.device}, {j.customer_name}<span className="block text-sm text-ink/70">{j.status}, last updated {ago(j.updated_at)}</span></li>)}</ul>{stale.length === 0 && none}
      {stale.length > 0 && <button className="mt-3 underline" onClick={() => go('repairs')}>Open Repair jobs</button>}</section>
    <section className={box}><h2 className="text-lg font-bold">Reviews waiting for approval ({reviews})</h2>
      {reviews === 0 ? none : <button className="mt-2 underline" onClick={() => go('reviews')}>Open Reviews</button>}</section>
    <section className={box}><h2 className="text-lg font-bold">Low stock ({low.length})</h2><p className="text-sm text-ink/70">Products with {LOW_STOCK} or fewer left. Time to restock.</p>
      <ul className="mt-2 space-y-1">{low.map(x => <li key={x.id}><b>{x.name}</b>: {x.quantity === 0 ? <span className="font-bold text-mag">sold out</span> : `${x.quantity} left`}</li>)}</ul>
      {low.length === 0 ? <p className="mt-2 text-ink/70">Nothing running low. Enter a quantity next to a product in Products and it will show here when it runs low.</p> : <button className="mt-3 underline" onClick={() => go('products')}>Open Products</button>}</section>
  </div>
}
