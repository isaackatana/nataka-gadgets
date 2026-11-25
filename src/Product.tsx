import { useEffect, useState } from 'react'
import { supabase, WA } from './supabase'
import { url } from './Gallery'
import { kes, type Product } from './shopData'
import { wa } from './Shop'
import Notice from './Notice'
import Callback from './Callback'

const NAME = 'Nataka Gadgets - Tech Care'

export default function ProductPage({ id }: { id: string }) {
  const [p, setP] = useState<Product | null | undefined>(undefined) // undefined = loading, null = not found
  const [imgs, setImgs] = useState<string[]>([]); const [sel, setSel] = useState(0); const [more, setMore] = useState<Product[]>([])
  useEffect(() => {
    let live = true
    ;(async () => {
      const { data } = await supabase.from('products').select('*').eq('id', id).maybeSingle()
      const prod = (data as Product | null) ?? null
      if (!live) return
      setP(prod); setSel(0); if (!prod) return
      const im = await supabase.from('product_images').select('path').eq('product_id', id).order('position').order('created_at')
      const rest = ((im.data ?? []) as { path: string }[]).map(r => r.path).filter(x => x !== prod.image_path)
      const rel = await supabase.from('products').select('*').eq('active', true).eq('category', prod.category).neq('id', id).limit(4)
      if (live) { setImgs([...(prod.image_path ? [prod.image_path] : []), ...rest]); setMore((rel.data as Product[]) ?? []) }
    })()
    return () => { live = false }
  }, [id])
  // Page title, description and Google product data (removed again when leaving the page).
  useEffect(() => {
    if (p === undefined) return
    document.title = p ? `${p.name} | ${NAME}` : 'Product not found'
    if (!p) return
    const meta = document.querySelector('meta[name="description"]'); const old = meta?.getAttribute('content') ?? null
    meta?.setAttribute('content', `${p.name}, ${kes(p.price_kes)}. ${p.description || 'Repair part or tool.'}`.slice(0, 200))
    const ld = document.createElement('script'); ld.type = 'application/ld+json'
    ld.text = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.description || p.name, category: p.category, ...(imgs[0] && { image: url(imgs[0]) }), offers: { '@type': 'Offer', priceCurrency: 'KES', price: p.price_kes, availability: p.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' } }).replace(/</g, '\\u003c')
    document.head.appendChild(ld)
    return () => { ld.remove(); if (old !== null) meta?.setAttribute('content', old) }
  }, [p, imgs])
  const head = <><Notice /><header className="border-b-2 border-ink bg-sheet"><nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
    <a href="/" className="text-lg font-black" style={{ fontStretch: '115%' }}>Nataka <span className="text-cyan">Gadgets</span> <span className="whitespace-nowrap text-mag">Tech Care</span></a>
    <a href="/#quote" className="bg-ink px-4 py-2 font-bold text-white">Get a quote</a></nav></header></>
  if (p === undefined) return <>{head}<main className="mx-auto max-w-6xl px-5 py-14"><p>Loading...</p></main></>
  if (p === null) return <>{head}<main className="mx-auto max-w-6xl px-5 py-14"><h1 className="text-3xl font-black">We could not find that product</h1><p className="mt-3">It may have been removed. <a className="underline" href="/shop">See all repair parts and tools</a> or message us on WhatsApp to ask.</p></main><Callback /></>
  const fitCheck = !['Tools and kits', 'Accessories'].includes(p.category) // parts must match the exact device model
  const ask = `https://wa.me/${WA}?text=${encodeURIComponent(fitCheck ? `Hi Nataka, will this fit my device? ${p.name} (${kes(p.price_kes)}). My device and model is: ` : `Hi Nataka, I have a question about: ${p.name}. `)}`
  const share = `https://wa.me/?text=${encodeURIComponent(`${p.name} - ${kes(p.price_kes)} at ${NAME}: ${location.href}`)}`
  return <>{head}<main className="mx-auto max-w-6xl px-5 py-8">
    <nav aria-label="Breadcrumb" className="text-sm"><a className="underline" href="/shop">Repair parts and tools</a> / <a className="underline" href={`/shop?cat=${encodeURIComponent(p.category)}`}>{p.category}</a></nav>
    <div className="mt-5 grid gap-8 md:grid-cols-2">
      <div>
        {imgs.length > 0 ? <img src={url(imgs[Math.min(sel, imgs.length - 1)])} alt={p.name} className="aspect-square w-full bg-white object-contain" /> : <div className="flex aspect-square items-center justify-center bg-sheet text-ink/50">No photo yet</div>}
        {imgs.length > 1 && <ul className="mt-3 grid grid-cols-5 gap-2">{imgs.map((x, k) => <li key={x}><button aria-label={`Show photo ${k + 1}`} aria-pressed={k === sel} onClick={() => setSel(k)} className={'block w-full border-2 ' + (k === sel ? 'border-mag' : 'border-ink')}><img src={url(x)} alt="" loading="lazy" className="aspect-square w-full object-cover" /></button></li>)}</ul>}
      </div>
      <div>
        <p className="text-sm font-semibold text-ink/70">{p.category}</p>
        <h1 className="mt-1 text-3xl font-black">{p.name}</h1>
        <p className="mt-3 text-3xl font-black">{kes(p.price_kes)}</p>
        <p className={'mt-2 font-bold ' + (p.in_stock ? 'text-ink' : 'text-mag')}>{p.in_stock ? 'In stock' : 'Out of stock'}</p>
        {p.description && <p className="mt-4 whitespace-pre-line">{p.description}</p>}
        {p.compatible && <p className="mt-4"><b>Compatible with:</b> {p.compatible}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={wa(p)} className="bg-mag px-6 py-3 font-bold text-white">{p.in_stock ? 'Order on WhatsApp' : 'Ask when it is back'}</a>
          <a href={ask} className="border-2 border-ink bg-yel px-6 py-3 font-bold">{fitCheck ? 'Check it fits my device' : 'Ask a question'}</a>
          <a href={share} className="border-2 border-ink px-6 py-3 font-bold">Share on WhatsApp</a></div>
        <p className="mt-4 text-sm text-ink/70">Not sure it suits your device? Message us the model before you order. We confirm the fit and arrange collection.</p>
      </div></div>
    {more.length > 0 && <section className="mt-14"><h2 className="text-2xl font-black">More in {p.category}</h2>
      <ul className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">{more.map(m => <li key={m.id} className="bg-white"><a href={`/shop/${m.id}`} className="block">
        {m.image_path ? <img src={url(m.image_path)} alt="" loading="lazy" className="aspect-square w-full object-cover" /> : <div className="flex aspect-square items-center justify-center bg-sheet text-sm text-ink/50">No photo</div>}
        <div className="p-3"><b>{m.name}</b><p className="font-black">{kes(m.price_kes)}</p></div></a></li>)}</ul></section>}
  </main><Callback /></>
}
