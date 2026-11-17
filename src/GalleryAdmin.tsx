import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { url, type Item } from './Gallery'

// Shrinks phone photos to max 1200px JPEG before upload to save data and storage.
async function shrink(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file); const s = Math.min(1, 1200 / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s)
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  return new Promise((res, rej) => c.toBlob(b => (b ? res(b) : rej(new Error('Could not read image'))), 'image/jpeg', 0.82))
}

export default function GalleryAdmin() {
  const [rows, setRows] = useState<Item[]>([]); const [title, setTitle] = useState(''); const [category, setCategory] = useState('tech')
  const [file, setFile] = useState<File | null>(null); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  const load = async () => { const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false }); setRows((data as Item[]) ?? []) }
  useEffect(() => { load() }, [])
  async function add(e: React.FormEvent) {
    e.preventDefault(); if (!file) return; setBusy(true); setErr('')
    try {
      const path = `${crypto.randomUUID()}.jpg`
      const up = await supabase.storage.from('gallery').upload(path, await shrink(file), { contentType: 'image/jpeg' })
      if (up.error) throw up.error
      const ins = await supabase.from('gallery').insert({ title, category, path })
      if (ins.error) throw ins.error
      setTitle(''); setFile(null); (e.target as HTMLFormElement).reset(); load()
    } catch (x) { setErr('Could not upload: ' + (x as Error).message) }
    setBusy(false)
  }
  async function remove(r: Item) { await supabase.storage.from('gallery').remove([r.path]); await supabase.from('gallery').delete().eq('id', r.id); load() }
  const i = 'border-2 border-ink bg-white p-2 w-full'
  return <div className="mt-6">
    <form onSubmit={add} className="grid gap-2 border-2 border-ink bg-white p-4 sm:grid-cols-3">
      <input required aria-label="Title" placeholder="Title (e.g. Staff polos for a hotel)" className={i + ' sm:col-span-2'} value={title} onChange={e => setTitle(e.target.value)} />
      <select aria-label="Category" className={i} value={category} onChange={e => setCategory(e.target.value)}><option value="tech">Tech Care</option><option value="brand">Brand Wear</option></select>
      <input required type="file" accept="image/*" aria-label="Photo" className={i + ' sm:col-span-3'} onChange={e => setFile(e.target.files?.[0] ?? null)} />
      {err && <p role="alert" className="text-mag sm:col-span-3">{err}</p>}
      <button disabled={busy} className="bg-ink px-4 py-2 font-bold text-white disabled:opacity-60 sm:col-span-3">{busy ? 'Uploading...' : 'Add to gallery'}</button>
    </form>
    {rows.length === 0 && <p className="mt-6">No photos yet. The Our work section stays hidden on the site until you add one.</p>}
    <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">{rows.map(r => <li key={r.id} className="border-2 border-ink bg-white p-2">
      <img src={url(r.path)} alt={r.title} className="aspect-square w-full object-cover" /><div className="mt-1 text-sm font-semibold">{r.title}</div>
      <button className="text-sm underline" onClick={() => remove(r)}>Remove</button></li>)}</ul></div>
}
