import { useState } from 'react'
import { supabase } from './supabase'
export const STEPS = ['received', 'diagnosing', 'waiting for parts', 'repairing', 'ready for pickup', 'collected']
type Job = { code: string; device: string; status: string; note: string; updated_at: string }


function ReviewForm({ code, phone }: { code: string; phone: string }) {
  const [rating, setRating] = useState(5); const [body, setBody] = useState(''); const [res, setRes] = useState('')
  async function send(e: React.FormEvent) {
    e.preventDefault()
    const { data, error } = await supabase.rpc('submit_review', { p_code: code, p_phone: phone, p_rating: rating, p_body: body })
    setRes(error ? 'error' : String(data))
  }
  if (res === 'ok') return <p className="mt-4 font-bold">Thank you. Your review will show on the site after we approve it.</p>
  if (res === 'already') return <p className="mt-4 font-bold">You have already reviewed this repair. Thank you.</p>
  return <form onSubmit={send} className="mt-4 space-y-2 border-t-2 border-ink pt-4">
    <h4 className="font-bold">How did we do?</h4>
    <label className="block">Rating<select className="ml-2 border-2 border-ink p-1" value={rating} onChange={e => setRating(+e.target.value)}>{[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} star{n > 1 && 's'}</option>)}</select></label>
    <textarea aria-label="Your review" maxLength={600} rows={3} className="w-full border-2 border-ink p-2" placeholder="Tell others about your repair (optional)" value={body} onChange={e => setBody(e.target.value)} />
    {res && <p role="alert" className="text-mag">Could not send your review. Please try again.</p>}
    <button className="bg-mag px-4 py-2 font-bold text-white">Send review</button></form>
}

export default function Track() {
  const [code, setCode] = useState(''); const [phone, setPhone] = useState('')
  const [job, setJob] = useState<Job | null>(null); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false)
  async function look(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(''); setJob(null)
    const { data, error } = await supabase.rpc('track_repair', { p_code: code, p_phone: phone })
    setBusy(false)
    if (error) setMsg('Could not check right now. Try again or message us on WhatsApp.')
    else if (!data || data.length === 0) setMsg('No repair found. Check the job code on your receipt and the phone number you gave us.')
    else setJob(data[0])
  }
  const f = 'mt-1 w-full border-2 border-ink bg-white p-3'
  const at = job ? STEPS.indexOf(job.status) : -1
  return <section id="track" className="mx-auto max-w-6xl px-5 py-14">
    <h2 className="text-3xl font-black">Track your repair</h2>
    <p className="mt-2 max-w-xl">Enter the job code from your receipt (like NG-1001) and the phone number you booked with.</p>
    <div className="mt-6 grid gap-6 md:grid-cols-2">
      <form onSubmit={look} className="space-y-3 border-2 border-ink bg-white p-6">
        <label className="block font-semibold">Job code<input required className={f} value={code} onChange={e => setCode(e.target.value)} placeholder="NG-1001" /></label>
        <label className="block font-semibold">Phone number<input required type="tel" className={f} value={phone} onChange={e => setPhone(e.target.value)} /></label>
        <button disabled={busy} className="bg-ink px-5 py-3 font-bold text-white disabled:opacity-60">{busy ? 'Checking...' : 'Check status'}</button>
      </form>
      <div aria-live="polite">
        {msg && <p role="alert" className="font-semibold text-mag">{msg}</p>}
        {job && <div className="border-2 border-ink bg-white p-6">
          <h3 className="text-xl font-bold">{job.device} <span className="text-ink/60">({job.code})</span></h3>
          <ol className="mt-4 space-y-2">{STEPS.map((s, i) => <li key={s} className={'flex items-center gap-3 ' + (i <= at ? 'font-bold' : 'text-ink/40')}>
            <span className={'h-4 w-4 rounded-full border-2 border-ink ' + (i < at ? 'bg-ink' : i === at ? 'bg-mag' : '')} />{s.charAt(0).toUpperCase() + s.slice(1)}</li>)}</ol>
          {job.status === 'collected' && <ReviewForm code={job.code} phone={phone} />}
          {job.note && <p className="mt-4 bg-sheet p-3">{job.note}</p>}
          <p className="mt-3 text-sm text-ink/60">Updated {new Date(job.updated_at).toLocaleString()}</p>
        </div>}
      </div>
    </div></section>
}
