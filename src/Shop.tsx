import { useEffect, useState } from 'react'
import { supabase, WA } from './supabase'
import { url } from './Gallery'
import { kes, type Product } from './shopData'
import Notice from './Notice'
import Callback from './Callback'

export const wa = (p: Product) => `https://wa.me/${WA}?text=${encodeURIComponent(p.in_stock ? `Hi Nataka, I would like to order: ${p.name} (${kes(p.price_kes)}).` : `Hi Nataka, when will you have ${p.name} back in stock?`)}`

export function Shop({ limit }: { limit?: number }) {
  const [rows, setRows] = useState<Product[] | null>(null); const [cat, setCat] = useState(() => new URLSearchParams(location.search).get('cat') ?? ''); const [q, setQ] = useState('')
  useEffect(() => { supabase.from('products').select('*').eq('active', true).order('created_at', { ascending: false }).then(({ data }) => setRows((data as Product[]) ?? [])) }, [])
  if (rows === null) return null
  if (rows.length === 0) return limit ? null : <p className="mx-auto max-w-6xl px-5 py-10">Our repair parts and tools list is coming soon. Message us on WhatsApp to ask for what you need.</p>
  const cats = [...new Set(rows.map(r => r.category))]
  const act = cats.includes(cat) ? cat : '' // ignore a ?cat= that has no products yet
  const list = rows.filter(r => (!act || r.category === act) && (!q || (r.name + ' ' + r.description + ' ' + (r.compatible ?? '')).toLowerCase().includes(q.toLowerCase()))).slice(0, limit)
  return <section id="shop" className="mx-auto max-w-6xl px-5 py-14">
    <h2 className="text-3xl font-black">Repair parts and tools</h2>
    <p className="mt-2 max-w-xl">Phone and laptop parts, batteries, chargers, repair tools and more. Order on WhatsApp and we will confirm and arrange collection.</p>
    {!limit && <div className="mt-5 flex flex-wrap items-center gap-2">
      <input aria-label="Search products" placeholder="Search or type your phone model" className="border-2 border-ink bg-white p-2" value={q} onChange={e => setQ(e.target.value)} />
      {['', ...cats].map(c => <button key={c} aria-pressed={act === c} onClick={() => setCat(c)} className={'border-2 border-ink px-3 py-2 font-semibold ' + (act === c ? 'bg-ink text-white' : 'bg-white')}>{c || 'All'}</button>)}</div>}
    <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">{list.map(p => <li key={p.id} className="flex flex-col bg-white">
      <a href={`/shop/${p.id}`} aria-label={`View details: ${p.name}`}>{p.image_path ? <img src={url(p.image_path)} alt={p.name} loading="lazy" className="aspect-square w-full object-cover" /> : <div className="flex aspect-square items-center justify-center bg-sheet text-sm text-ink/50">No photo</div>}</a>
      <div className="flex flex-1 flex-col p-3"><h3 className="font-bold"><a href={`/shop/${p.id}`} className="hover:underline">{p.name}</a></h3><p className="text-sm text-ink/70">{p.category}</p>
        {p.description && <p className="mt-1 line-clamp-2 text-sm">{p.description}</p>}
        <p className="mt-2 text-lg font-black">{kes(p.price_kes)}</p>
        <div className="mt-auto pt-3">{p.in_stock ? <a href={wa(p)} className="block bg-mag px-3 py-2 text-center font-bold text-white">Order on WhatsApp</a>
          : <><p className="font-bold text-mag">Out of stock</p><a href={wa(p)} className="underline">Ask when it is back</a></>}</div></div></li>)}</ul>
    {!limit && list.length === 0 && <p className="mt-6">Nothing matches that. <a className="underline" href={`https://wa.me/${WA}?text=${encodeURIComponent('Hi Nataka, do you have this part: ' + q)}`}>Message us on WhatsApp</a> and we will find it for you.</p>}
    {limit && rows.length > limit && <p className="mt-6"><a href="/shop" className="inline-block border-2 border-ink px-5 py-3 font-bold">See all products</a></p>}
    {limit && cats.includes('Tools and kits') && <a href="/shop?cat=Tools%20and%20kits" className="mt-8 flex flex-wrap items-center justify-between gap-3 border-2 border-ink bg-yel p-5"><span><b className="text-lg">Repairing devices yourself?</b> Browse our repair tools and kits.</span><span className="font-bold underline">Shop tools and kits</span></a>}
  </section>
}

export function ShopPage() {
  useEffect(() => { document.title = 'Repair parts and tools | Nataka Gadgets - Tech Care' }, [])
  return <><Notice /><header className="border-b-2 border-ink bg-sheet"><nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
    <a href="/" className="text-lg font-black" style={{ fontStretch: '115%' }}>Nataka <span className="text-cyan">Gadgets</span> <span className="whitespace-nowrap text-mag">Tech Care</span></a>
    <a href="/#quote" className="bg-ink px-4 py-2 font-bold text-white">Get a quote</a></nav></header>
    <main><Shop /></main><Callback /></>
}
