import { useEffect } from 'react'
import data from './services.json'
import { WA } from './supabase'
import Notice from './Notice'
import Callback from './Callback'
export const slugOf = (title: string) => data.services.find(s => s.title === title)?.slug ?? ''
const AREA = import.meta.env.VITE_AREA ?? ''

export default function ServicePage({ slug }: { slug: string }) {
  const s = data.services.find(x => x.slug === slug)
  useEffect(() => { document.title = s ? `${s.title}${AREA ? ' in ' + AREA : ''} | Nataka Gadget & Graphics Co.` : 'Page not found' }, [s])
  const head = <><Notice /><header className="border-b-2 border-ink bg-sheet"><nav className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3">
    <a href="/" className="text-lg font-black" style={{ fontStretch: '115%' }}>Nataka <span className="text-cyan">Gadget</span> &amp; <span className="text-mag">Graphics</span></a>
    <a href="/#quote" className="bg-ink px-4 py-2 font-bold text-white">Get a quote</a></nav></header></>
  if (!s) return <>{head}<main className="mx-auto max-w-4xl px-5 py-14"><h1 className="text-3xl font-black">We could not find that page</h1><p className="mt-3"><a className="underline" href="/">Go to the home page</a> to see all our services.</p></main></>
  const accent = s.category === 'repair' ? '#00A6D6' : '#E5287A'
  const wa = `https://wa.me/${WA}?text=${encodeURIComponent('Hi Nataka, I need a quote for: ' + s.title)}`
  return <>{head}
    <main className="mx-auto max-w-4xl px-5 py-12">
      <p className="text-sm font-semibold"><a className="underline" href="/">Home</a> / {s.category === 'repair' ? 'Tech Care' : 'Brand Wear'}</p>
      <h1 className="mt-3 border-l-8 pl-4 text-4xl font-black md:text-5xl" style={{ borderColor: accent }}>{s.title}{AREA && <span className="block text-2xl font-bold">in {AREA}</span>}</h1>
      <p className="mt-5 max-w-2xl text-lg">{s.intro}</p>
      <div className="mt-6 flex flex-wrap gap-3"><a href={`/?service=${encodeURIComponent(s.title)}#quote`} className="bg-mag px-6 py-3 font-bold text-white">Get a quote</a><a href={wa} className="border-2 border-ink px-6 py-3 font-bold">Message us on WhatsApp</a></div>
      <h2 className="mt-12 text-2xl font-black">What we handle</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">{s.covers.map(c => <li key={c} className="bg-white p-3">{c}</li>)}</ul>
      <h2 className="mt-12 text-2xl font-black">How it works</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-6">{data.steps[s.category as 'repair' | 'brand'].map(t => <li key={t}>{t}</li>)}</ol>
      <h2 className="mt-12 text-2xl font-black">Questions</h2>
      <div className="mt-3 space-y-2">{data.faq[s.category as 'repair' | 'brand'].map(([q, a]) => <details key={q} className="bg-white p-4"><summary className="cursor-pointer font-bold">{q}</summary><p className="mt-2">{a}</p></details>)}</div>
      <h2 className="mt-12 text-2xl font-black">Other services</h2>
      <ul className="mt-3 flex flex-wrap gap-2">{data.services.filter(x => x.slug !== s.slug).map(x => <li key={x.slug}><a className="block border-2 border-ink px-3 py-2 font-semibold" href={`/services/${x.slug}`}>{x.title}</a></li>)}</ul>
    </main>
    <Callback></Callback></>
}
