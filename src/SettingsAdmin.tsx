import { useState } from 'react'
import { supabase } from './supabase'
import { useSettings } from './FindUs'

const fields = [
  ['address', 'Shop address', 'Shop name, building, street, town'],
  ['phone', 'Phone number to call', '+254 7XX XXX XXX'],
  ['hours', 'Opening hours', 'Mon to Sat: 8am to 6pm\nSun: closed'],
  ['map_url', 'Google Maps link', 'In Google Maps tap Share, copy the link and paste it here'],
  ['terms', 'Terms and warranty (printed on every repair receipt)', 'Write your own terms, for example how long you keep uncollected devices and what your repair warranty covers.'],
] as const

export default function SettingsAdmin() {
  const { s, setS, ready } = useSettings(); const [msg, setMsg] = useState('')
  async function save(e: React.FormEvent) {
    e.preventDefault(); setMsg('')
    if (s.map_url && !/^https:\/\//i.test(s.map_url)) return setMsg('The Google Maps link must start with https://')
    const keys = [...fields.map(([k]) => k), 'notice', 'notice_on', 'notice_until']
    const { error } = await supabase.from('site_settings').upsert(keys.map(k => ({ key: k, value: (s[k] ?? '').trim() })))
    setMsg(error ? 'Could not save: ' + error.message : 'Saved. Your site is updated.')
  }
  if (!ready) return <p className="mt-6">Loading...</p>
  const i = 'mt-1 w-full border-2 border-ink bg-white p-2'
  return <form onSubmit={save} className="mt-6 max-w-xl space-y-4 border-2 border-ink bg-white p-4">
    {fields.map(([k, label, ph]) => <label key={k} className="block font-semibold">{label}
      {k === 'hours' || k === 'address' || k === 'terms' ? <textarea rows={k === 'terms' ? 5 : 3} maxLength={500} className={i} placeholder={ph} value={s[k] ?? ''} onChange={e => setS({ ...s, [k]: e.target.value })} />
        : <input maxLength={500} type={k === 'map_url' ? 'url' : 'text'} className={i} placeholder={ph} value={s[k] ?? ''} onChange={e => setS({ ...s, [k]: e.target.value })} />}</label>)}
    <fieldset className="space-y-2 border-t-2 border-ink pt-4"><legend className="font-bold">Notice banner (for example: closed for a public holiday)</legend>
      <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={s.notice_on === 'true'} onChange={e => setS({ ...s, notice_on: e.target.checked ? 'true' : 'false' })} />Show the notice on the site</label>
      <label className="block font-semibold">Notice text<input maxLength={300} className={i} placeholder="We are closed today. Open again tomorrow at 8am." value={s.notice ?? ''} onChange={e => setS({ ...s, notice: e.target.value })} /></label>
      <label className="block font-semibold">Hide automatically after (optional)<input type="date" className={i} value={s.notice_until ?? ''} onChange={e => setS({ ...s, notice_until: e.target.value })} /></label></fieldset>
    <button className="bg-ink px-5 py-3 font-bold text-white">Save shop details</button>
    {msg && <p role="status" className="font-semibold">{msg}</p>}
    <p className="text-sm">The Find us section stays hidden on the site until you add an address, hours or phone number.</p></form>
}
