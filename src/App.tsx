import { useEffect, useState } from 'react'
import { supabase, WA } from './supabase'
import Admin from './Admin'
import Track from './Track'
import Prices from './Prices'
import Gallery from './Gallery'
import Reviews from './Reviews'
import FindUs from './FindUs'
import Notice from './Notice'
import Callback from './Callback'
import ServicePage, { slugOf } from './ServicePage'
import data from './services.json'

const repairs = data.services.filter(s => s.category === 'repair').map(s => [s.title, s.desc])
const brand = data.services.filter(s => s.category === 'brand').map(s => [s.title, s.desc])
const services = [...repairs.map(r => r[0]), ...brand.map(b => b[0])]

function Card({ t, d, c }: { t: string; d: string; c: string }) {
  return <li className="border-l-8 bg-white p-5" style={{ borderColor: c }}><h3 className="text-lg font-bold"><a className="underline decoration-2 underline-offset-4" href={`/services/${slugOf(t)}`}>{t}</a></h3><p className="mt-1 text-sm text-ink/75">{d}</p></li>
}

function QuoteForm() {
  const [f, setF] = useState(() => { const q = new URLSearchParams(location.search).get('service'); return { name: '', phone: '', service: q && services.includes(q) ? q : services[0], details: '' } })
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value })
  const wa = `https://wa.me/${WA}?text=${encodeURIComponent(`Hi Nataka, I need a quote for: ${f.service}. ${f.details}`)}`
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setState('sending')
    const { error } = await supabase.from('quotes').insert(f)
    setState(error ? 'error' : 'sent')
  }
  const field = 'mt-1 w-full border-2 border-ink bg-white p-3'
  if (state === 'sent') return <div className="bg-white p-6 border-2 border-ink"><h3 className="text-xl font-bold">Quote request sent</h3><p className="mt-2">We will call or message {f.phone} shortly. For a faster reply, send it on WhatsApp too.</p><a className="mt-4 inline-block bg-ink px-5 py-3 font-bold text-white" href={wa}>Message us on WhatsApp</a></div>
  return <form onSubmit={submit} className="bg-white p-6 border-2 border-ink space-y-4">
    <label className="block font-semibold">Your name<input required className={field} value={f.name} onChange={set('name')} /></label>
    <label className="block font-semibold">Phone number<input required type="tel" className={field} value={f.phone} onChange={set('phone')} /></label>
    <label className="block font-semibold">What do you need?<select className={field} value={f.service} onChange={set('service')}>{services.map(s => <option key={s}>{s}</option>)}</select></label>
    <label className="block font-semibold">Details<textarea required rows={4} className={field} value={f.details} onChange={set('details')} placeholder="Phone model and fault, or what you want printed, sizes and quantity" /></label>
    {state === 'error' && <p role="alert" className="text-mag font-semibold">Could not send. Check your connection or message us on WhatsApp.</p>}
    <div className="flex flex-wrap gap-3">
      <button disabled={state === 'sending'} className="bg-mag px-5 py-3 font-bold text-white disabled:opacity-60">{state === 'sending' ? 'Sending...' : 'Get my quote'}</button>
      <a href={wa} className="border-2 border-ink px-5 py-3 font-bold">Or use WhatsApp</a>
    </div></form>
}

export default function App() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => { const h = () => setHash(location.hash); addEventListener('hashchange', h); return () => removeEventListener('hashchange', h) }, [])
  const m = location.pathname.match(/^\/services\/([^/]+)/)
  if (m) return <ServicePage slug={m[1]} />
  if (hash === '#/admin') return <Admin />
  return <>
    <Notice />
    <header className="sticky top-0 z-10 border-b-2 border-ink bg-sheet/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <a href="#top" className="font-black text-lg" style={{ fontStretch: '115%' }}>Nataka <span className="text-cyan">Gadget</span> &amp; <span className="text-mag">Graphics</span></a>
        <div className="hidden gap-6 font-semibold sm:flex"><a href="#tech">Tech Care</a><a href="#brand">Brand Wear</a><a href="#track">Track repair</a><a href="#quote">Quote</a></div>
        <a href="#quote" className="bg-ink px-4 py-2 font-bold text-white">Get a quote</a>
      </nav></header>
    <main id="top">
      <section className="relative overflow-hidden">
        <div className="reg absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
          <div>
            <h1 className="text-5xl font-black leading-[0.95] md:text-7xl">We fix what you own. We print what you are.</h1>
            <p className="mt-6 max-w-md text-lg">Reliable phone, laptop and electronics repairs, plus custom printing, branded apparel, stickers and signage for your business.</p>
            <div className="mt-8 flex flex-wrap gap-3"><a href="#quote" className="bg-mag px-6 py-3 font-bold text-white">Message us for a fast quote</a><a href="#tech" className="border-2 border-ink px-6 py-3 font-bold">See services</a></div>
          </div>
          <div className="relative mx-auto h-72 w-72 md:h-96 md:w-96" aria-hidden>
            <div className="pop absolute left-0 top-6 h-48 w-48 rounded-full bg-cyan mix-blend-multiply md:h-64 md:w-64" />
            <div className="pop absolute right-0 top-6 h-48 w-48 rounded-full bg-mag mix-blend-multiply md:h-64 md:w-64" />
            <div className="pop absolute bottom-0 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-yel mix-blend-multiply md:h-64 md:w-64" />
          </div>
        </div></section>
      <section id="tech" className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="text-3xl font-black">Tech Care</h2><p className="mt-2 max-w-xl">Honest diagnosis first, a clear price second, repair third.</p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">{repairs.map(([t, d]) => <Card key={t} t={t} d={d} c="#00A6D6" />)}</ul></section>
      <section id="brand" className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="text-3xl font-black">Brand Wear</h2><p className="mt-2 max-w-xl">From one custom tee to a full team uniform or shop front.</p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">{brand.map(([t, d]) => <Card key={t} t={t} d={d} c="#E5287A" />)}</ul></section>
      <Gallery />
      <Reviews />
      <Prices />
      <Track />
      <FindUs />
      <section id="quote" className="bg-yel py-14"><div className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-2">
        <div><h2 className="text-3xl font-black">Message us for a fast quote</h2><p className="mt-3 max-w-md">Tell us what is broken or what you want printed. We reply with a price and turnaround time.</p></div>
        <QuoteForm /></div></section>
    </main>
    <Callback />
    <footer className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 px-5 py-8 text-sm"><span>&copy; {new Date().getFullYear()} Nataka Gadget &amp; Graphics Co. Tech Care &amp; Brand Wear.</span><a href="#/admin" className="underline">Staff login</a></footer>
  </>
}
