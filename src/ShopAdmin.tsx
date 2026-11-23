import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { url } from './Gallery'
import { shrink } from './GalleryAdmin'
import { CATS, type Product } from './shopData'

export default function ShopAdmin() {
  const [rows, setRows] = useState<Product[]>([]); const [file, setFile] = useState<File | null>(null); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  const blank = { name: '', category: CATS[0], price: '', description: '', in_stock: true }; const [f, setF] = useState(blank)
  const load = async () => { const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false }); setRows((data as Product[]) ?? []) }
  useEffect(() => { load() }, [])
  async function add(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('')
    try {
      let image_path: string | null = null
      if (file) { image_path = `shop/${crypto.randomUUID()}.jpg`; const up = await supabase.storage.from('gallery').upload(image_path, await shrink(file), { contentType: 'image/jpeg' }); if (up.error) throw up.error }
      const ins = await supabase.from('products').insert({ name: f.name.trim(), category: f.category, description: f.description.trim(), price_kes: Math.round(+f.price), in_stock: f.in_stock, image_path })
      if (ins.error) throw ins.error
      setF(blank); setFile(null); (e.target as HTMLFormElement).reset(); load()
    } catch (x) { setErr('Could not save: ' + (x as Error).message) }
    setBusy(false)
  }
  const upd = async (id: string, patch: Partial<Product>) => { await supabase.from('products').update(patch).eq('id', id); load() }
  async function remove(p: Product) { if (p.image_path) await supabase.storage.from('gallery').remove([p.image_path]); await supabase.from('products').delete().eq('id', p.id); load() }
  const i = 'border-2 border-ink bg-white p-2 w-full'
  return <div className="mt-6">
    <form onSubmit={add} className="grid gap-2 border-2 border-ink bg-white p-4 sm:grid-cols-3">
      <input required aria-label="Product name" placeholder="Product name (e.g. Samsung A14 screen)" className={i + ' sm:col-span-2'} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
      <select aria-label="Category" className={i} value={f.category} onChange={e => setF({ ...f, category: e.target.value })}>{CATS.map(c => <option key={c}>{c}</option>)}</select>
      <input required type="number" min={0} inputMode="numeric" aria-label="Price in KSh" placeholder="Price (KSh)" className={i} value={f.price} onChange={e => setF({ ...f, price: e.target.value })} />
      <input aria-label="Description" maxLength={600} placeholder="Short description (optional)" className={i + ' sm:col-span-2'} value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
      <input type="file" accept="image/*" aria-label="Photo (optional)" className={i + ' sm:col-span-2'} onChange={e => setFile(e.target.files?.[0] ?? null)} />
      <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={f.in_stock} onChange={e => setF({ ...f, in_stock: e.target.checked })} />In stock</label>
      {err && <p role="alert" className="text-mag sm:col-span-3">{err}</p>}
      <button disabled={busy} className="bg-ink px-4 py-2 font-bold text-white disabled:opacity-60 sm:col-span-3">{busy ? 'Saving...' : 'Add product'}</button>
    </form>
    {rows.length === 0 && <p className="mt-6">No products yet. The Repair parts and tools section stays hidden on the site until you add one.</p>}
    <ul className="mt-4 space-y-2">{rows.map(p => <li key={p.id} className="flex flex-wrap items-center gap-3 border-2 border-ink bg-white p-3">
      {p.image_path ? <img src={url(p.image_path)} alt="" className="h-16 w-16 object-cover" /> : <div className="h-16 w-16 bg-sheet" />}
      <div className="min-w-40 flex-1"><b>{p.name}</b><div className="text-sm text-ink/70">{p.category}{!p.active && ' · hidden from site'}</div></div>
      <label className="text-sm font-semibold">KSh <input type="number" min={0} defaultValue={p.price_kes} onBlur={e => { const v = Math.round(+e.target.value); if (v !== p.price_kes && v >= 0) upd(p.id, { price_kes: v }) }} className="w-24 border-2 border-ink p-1" /></label>
      <button className="border-2 border-ink px-3 py-1 font-bold" onClick={() => upd(p.id, { in_stock: !p.in_stock })}>{p.in_stock ? 'In stock' : 'Out of stock'}</button>
      <button className="underline" onClick={() => upd(p.id, { active: !p.active })}>{p.active ? 'Hide' : 'Show'}</button>
      <button className="underline" onClick={() => remove(p)}>Delete</button></li>)}</ul></div>
}
