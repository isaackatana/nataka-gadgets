import { useEffect, useState } from 'react'
import { supabase } from './supabase'
export type Item = { id: string; title: string; category: 'tech' | 'brand'; path: string }
export const url = (path: string) => supabase.storage.from('gallery').getPublicUrl(path).data.publicUrl

export default function Gallery() {
  const [rows, setRows] = useState<Item[]>([]); const [open, setOpen] = useState<Item | null>(null)
  useEffect(() => { supabase.from('gallery').select('*').order('created_at', { ascending: false }).then(({ data }) => setRows((data as Item[]) ?? [])) }, [])
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null); addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [])
  if (rows.length === 0) return null
  return <section id="work" className="mx-auto max-w-6xl px-5 py-14">
    <h2 className="text-3xl font-black">Our work</h2><p className="mt-2 max-w-xl">Recent repairs, prints and branding jobs.</p>
    <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">{rows.map(r => <li key={r.id}>
      <button onClick={() => setOpen(r)} className="block w-full text-left"><img src={url(r.path)} alt={r.title} loading="lazy" className="aspect-square w-full border-b-8 object-cover" style={{ borderColor: r.category === 'tech' ? '#00A6D6' : '#E5287A' }} />
        <span className="mt-1 block text-sm font-semibold">{r.title}</span></button></li>)}</ul>
    {open && <div role="dialog" aria-modal="true" aria-label={open.title} onClick={() => setOpen(null)} className="fixed inset-0 z-20 flex items-center justify-center bg-ink/85 p-4">
      <figure className="max-h-full max-w-3xl"><img src={url(open.path)} alt={open.title} className="max-h-[80vh] w-auto" /><figcaption className="mt-2 text-white">{open.title} (tap anywhere to close)</figcaption></figure></div>}
  </section>
}
