import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { url } from './Gallery'
import { shrink } from './GalleryAdmin'
import { CATS, type Product, type ProductImage } from './shopData'
import { downloadCsv } from './Backup'

// Uploads photos to the gallery bucket (folder shop/) and records them. The first photo becomes the main one if there is none yet.
async function uploadPhotos(productId: string, files: File[], hasMain: boolean, startPos: number, onStep?: (n: number) => void) {
  for (let k = 0; k < files.length; k++) {
    onStep?.(k + 1)
    const path = `shop/${crypto.randomUUID()}.jpg`
    const up = await supabase.storage.from('gallery').upload(path, await shrink(files[k]), { contentType: 'image/jpeg' }); if (up.error) throw up.error
    const ins = await supabase.from('product_images').insert({ product_id: productId, path, position: startPos + k }); if (ins.error) throw ins.error
    if (!hasMain && k === 0) { const m = await supabase.from('products').update({ image_path: path }).eq('id', productId); if (m.error) throw m.error }
  }
}

function Editor({ p, onChange }: { p: Product; onChange: () => void }) {
  const [imgs, setImgs] = useState<ProductImage[]>([]); const [d, setD] = useState({ name: p.name, category: p.category, description: p.description, compatible: p.compatible ?? '' })
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false)
  const loadImgs = async () => { const { data } = await supabase.from('product_images').select('*').eq('product_id', p.id).order('position').order('created_at'); setImgs((data as ProductImage[]) ?? []) }
  useEffect(() => { loadImgs() }, [p.id])
  async function saveDetails(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg('')
    const { error } = await supabase.from('products').update({ name: d.name.trim(), category: d.category, description: d.description.trim(), compatible: d.compatible.trim() }).eq('id', p.id)
    setMsg(error ? 'Could not save: ' + error.message : 'Saved.'); setBusy(false); if (!error) onChange()
  }
  async function addPhotos(list: FileList | null) {
    const files = Array.from(list ?? []); if (!files.length) return
    setBusy(true); setMsg('')
    try { await uploadPhotos(p.id, files, !!p.image_path, imgs.length, n => setMsg(`Uploading photo ${n} of ${files.length}...`)); setMsg(files.length === 1 ? 'Photo added.' : `${files.length} photos added.`) }
    catch (x) { setMsg('Could not upload: ' + (x as Error).message) }
    setBusy(false); await loadImgs(); onChange()
  }
  async function makeMain(i: ProductImage) { await supabase.from('products').update({ image_path: i.path }).eq('id', p.id); onChange() }
  async function removeImg(i: ProductImage) {
    if (!confirm('Remove this photo?')) return
    await supabase.storage.from('gallery').remove([i.path]); await supabase.from('product_images').delete().eq('id', i.id)
    if (p.image_path === i.path) await supabase.from('products').update({ image_path: imgs.find(x => x.id !== i.id)?.path ?? null }).eq('id', p.id)
    await loadImgs(); onChange()
  }
  const f = 'border-2 border-ink bg-white p-2 w-full'
  return <div className="mt-3 w-full border-t-2 border-ink pt-3">
    <h3 className="font-black">Photos</h3>
    <p className="text-sm text-ink/70">The main photo shows first on the shop and on the product page. Add as many as you like.</p>
    <ul className="mt-2 flex flex-wrap gap-3">{imgs.map(i => <li key={i.id} className="w-28">
      <img src={url(i.path)} alt="" className="aspect-square w-full object-cover" />
      <div className="mt-1 text-xs">{p.image_path === i.path ? <b>Main photo</b> : <button className="underline" onClick={() => makeMain(i)}>Make main</button>}</div>
      <button className="text-xs underline" onClick={() => removeImg(i)}>Remove</button></li>)}
      {imgs.length === 0 && <li className="text-sm">No photos yet.</li>}</ul>
    <label className="mt-3 block font-semibold">Add photos <input type="file" accept="image/*" multiple disabled={busy} onChange={e => { addPhotos(e.target.files); e.target.value = '' }} className={f + ' mt-1'} /></label>
    <form onSubmit={saveDetails} className="mt-4 grid gap-2 sm:grid-cols-3">
      <h3 className="font-black sm:col-span-3">Details</h3>
      <input required aria-label="Product name" className={f + ' sm:col-span-2'} value={d.name} onChange={e => setD({ ...d, name: e.target.value })} />
      <select aria-label="Category" className={f} value={d.category} onChange={e => setD({ ...d, category: e.target.value })}>{[...new Set([...CATS, d.category])].map(c => <option key={c}>{c}</option>)}</select>
      <textarea aria-label="Description" rows={4} maxLength={600} placeholder="Describe the product: what it fits, quality, what is included" className={f + ' sm:col-span-3'} value={d.description} onChange={e => setD({ ...d, description: e.target.value })} />
      <input aria-label="Compatible with" maxLength={300} placeholder="Compatible with, e.g. Samsung A14, A14 5G (customers can search these)" className={f + ' sm:col-span-3'} value={d.compatible} onChange={e => setD({ ...d, compatible: e.target.value })} />
      <button disabled={busy} className="bg-ink px-4 py-2 font-bold text-white disabled:opacity-60">Save details</button>
      <a className="self-center underline" href={`/shop/${p.id}`} target="_blank" rel="noreferrer">View on the site</a>
    </form>
    {msg && <p role="status" className="mt-2 font-semibold">{msg}</p>}
  </div>
}

// One row per product, sorted by category, with an empty "Counted on shelf" column to fill in when checking stock.
const stockRows = (rows: Product[]) => [...rows].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)).map(p => ({
  'Product': p.name, 'Category': p.category, 'Price (KSh)': p.price_kes, 'Quantity in system': p.quantity ?? '', 'In stock': p.in_stock ? 'Yes' : 'No', 'Shown on site': p.active ? 'Yes' : 'No', 'Counted on shelf': '' }))
const esc = (v: unknown) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
function printStock(rows: Product[]) {
  const data = stockRows(rows); const cols = Object.keys(data[0] ?? {})
  const w = window.open('', '_blank'); if (!w) { alert('Your browser blocked the print window. Allow pop-ups for this site, or use Download stock list.'); return }
  w.document.write(`<!doctype html><title>Stock list ${new Date().toISOString().slice(0, 10)}</title><style>body{font:14px sans-serif;margin:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #000;padding:6px;text-align:left}th{background:#eee}td:last-child{width:110px}</style><h1>Stock list, ${new Date().toLocaleDateString()}</h1><table><thead><tr>${cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${data.map(r => `<tr>${cols.map(c => `<td>${esc((r as Record<string, unknown>)[c])}</td>`).join('')}</tr>`).join('')}</tbody></table>`)
  w.document.close(); w.focus(); w.print()
}

export default function ShopAdmin() {
  const [rows, setRows] = useState<Product[]>([]); const [files, setFiles] = useState<File[]>([]); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [open, setOpen] = useState<string | null>(null)
  const blank = { name: '', category: CATS[0], price: '', qty: '', description: '', in_stock: true }; const [f, setF] = useState(blank)
  const load = async () => { const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false }); setRows((data as Product[]) ?? []) }
  useEffect(() => { load() }, [])
  async function add(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('')
    try {
      const ins = await supabase.from('products').insert({ name: f.name.trim(), category: f.category, description: f.description.trim(), price_kes: Math.round(+f.price), in_stock: f.qty !== '' && +f.qty === 0 ? false : f.in_stock, quantity: f.qty === '' ? null : Math.max(0, Math.round(+f.qty)) }).select('id').single()
      if (ins.error) throw ins.error
      if (files.length) await uploadPhotos(ins.data.id, files, false, 0)
      setF(blank); setFiles([]); (e.target as HTMLFormElement).reset(); load()
    } catch (x) { setErr('Could not save: ' + (x as Error).message) }
    setBusy(false)
  }
  const upd = async (id: string, patch: Partial<Product>) => { await supabase.from('products').update(patch).eq('id', id); load() }
  // Setting a quantity keeps the In stock / Out of stock label in step: 0 means out of stock, anything above means in stock.
  const setQty = (p: Product, q: number | null) => upd(p.id, q === null ? { quantity: null } : { quantity: q, in_stock: q > 0 })
  async function remove(p: Product) {
    if (!confirm(`Delete "${p.name}" and its photos?`)) return
    const { data } = await supabase.from('product_images').select('path').eq('product_id', p.id)
    const paths = [...new Set([...(data ?? []).map(r => r.path as string), ...(p.image_path ? [p.image_path] : [])])]
    if (paths.length) await supabase.storage.from('gallery').remove(paths)
    await supabase.from('products').delete().eq('id', p.id); load()
  }
  const i = 'border-2 border-ink bg-white p-2 w-full'
  return <div className="mt-6">
    <form onSubmit={add} className="grid gap-2 border-2 border-ink bg-white p-4 sm:grid-cols-3">
      <input required aria-label="Product name" placeholder="Product name (e.g. Samsung A14 screen)" className={i + ' sm:col-span-2'} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
      <select aria-label="Category" className={i} value={f.category} onChange={e => setF({ ...f, category: e.target.value })}>{CATS.map(c => <option key={c}>{c}</option>)}</select>
      <input required type="number" min={0} inputMode="numeric" aria-label="Price in KSh" placeholder="Price (KSh)" className={i} value={f.price} onChange={e => setF({ ...f, price: e.target.value })} />
      <input type="number" min={0} inputMode="numeric" aria-label="Quantity in stock (optional)" placeholder="Quantity (optional)" className={i} value={f.qty} onChange={e => setF({ ...f, qty: e.target.value })} />
      <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={f.in_stock} onChange={e => setF({ ...f, in_stock: e.target.checked })} />In stock</label>
      <input aria-label="Description" maxLength={600} placeholder="Short description (optional)" className={i + ' sm:col-span-3'} value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
      <input type="file" multiple accept="image/*" aria-label="Photos (optional)" className={i + ' sm:col-span-3'} onChange={e => setFiles(Array.from(e.target.files ?? []))} />
      {err && <p role="alert" className="text-mag sm:col-span-3">{err}</p>}
      <button disabled={busy} className="bg-ink px-4 py-2 font-bold text-white disabled:opacity-60 sm:col-span-3">{busy ? 'Saving...' : 'Add product'}</button>
    </form>
    {rows.length === 0 && <p className="mt-6">No products yet. The Repair parts and tools section stays hidden on the site until you add one.</p>}
    {rows.length > 0 && <div className="mt-4 flex flex-wrap items-center gap-2"><button className="border-2 border-ink bg-yel px-4 py-2 font-bold" onClick={() => downloadCsv(`nataka-stock-list-${new Date().toISOString().slice(0, 10)}.csv`, stockRows(rows))}>Download stock list</button><button className="border-2 border-ink bg-white px-4 py-2 font-bold" onClick={() => printStock(rows)}>Print stock list</button><span className="text-sm text-ink/70">Includes an empty column to write what you count on the shelf.</span></div>}
    <ul className="mt-4 space-y-2">{rows.map(p => <li key={p.id} className="flex flex-wrap items-center gap-3 border-2 border-ink bg-white p-3">
      {p.image_path ? <img src={url(p.image_path)} alt="" className="h-16 w-16 object-cover" /> : <div className="h-16 w-16 bg-sheet" />}
      <div className="min-w-40 flex-1"><b>{p.name}</b><div className="text-sm text-ink/70">{p.category}{!p.active && ' · hidden from site'}</div></div>
      <label className="text-sm font-semibold">KSh <input type="number" min={0} defaultValue={p.price_kes} onBlur={e => { const v = Math.round(+e.target.value); if (v !== p.price_kes && v >= 0) upd(p.id, { price_kes: v }) }} className="w-24 border-2 border-ink p-1" /></label>
      <label className="text-sm font-semibold">Qty <input type="number" min={0} placeholder="-" aria-label={`Quantity of ${p.name}`} defaultValue={p.quantity ?? ''} key={p.quantity ?? 'none'} onBlur={e => { const t = e.target.value.trim(); const v = t === '' ? null : Math.max(0, Math.round(+t)); if (v !== p.quantity) setQty(p, v) }} className="w-16 border-2 border-ink p-1" /></label>
      {p.quantity !== null && p.quantity > 0 && <button className="border-2 border-ink px-3 py-1 font-bold" onClick={() => setQty(p, p.quantity! - 1)}>Sold 1</button>}
      <button className="border-2 border-ink px-3 py-1 font-bold" onClick={() => upd(p.id, { in_stock: !p.in_stock })}>{p.in_stock ? 'In stock' : 'Out of stock'}</button>
      <button className="border-2 border-ink bg-yel px-3 py-1 font-bold" aria-expanded={open === p.id} onClick={() => setOpen(open === p.id ? null : p.id)}>{open === p.id ? 'Close' : 'Photos and details'}</button>
      <button className="underline" onClick={() => upd(p.id, { active: !p.active })}>{p.active ? 'Hide' : 'Show'}</button>
      <button className="underline" onClick={() => remove(p)}>Delete</button>
      {open === p.id && <Editor p={p} onChange={load} />}</li>)}</ul></div>
}
