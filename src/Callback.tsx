import { useState } from 'react'
import { supabase } from './supabase'

// Saves into the quotes inbox as a "Callback request" (the quote email alert covers it too).
export default function Callback() {
  const [f, setF] = useState({ name: '', phone: '' }); const [trap, setTrap] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (trap) return setState('sent') // bots fill the hidden field; pretend it worked
    setState('sending')
    const { error } = await supabase.from('quotes').insert({ ...f, service: 'Callback request', details: 'Customer asked for a call back.' })
    setState(error ? 'error' : 'sent')
  }
  const i = 'border-2 border-ink bg-white p-3 w-full'
  return <section aria-labelledby="cb" className="bg-white py-10"><div className="mx-auto grid max-w-6xl items-center gap-6 px-5 md:grid-cols-2">
    <div><h2 id="cb" className="text-2xl font-black">Prefer a phone call?</h2><p className="mt-1">Leave your number and we will call you back.</p></div>
    {state === 'sent' ? <p role="status" className="font-bold">Thank you. We will call {f.phone || 'you'} soon.</p> :
      <form onSubmit={submit} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <input required aria-label="Your name" placeholder="Your name" className={i} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
        <input required type="tel" minLength={9} aria-label="Phone number" placeholder="Phone number" className={i} value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} />
        <input tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" name="website" value={trap} onChange={e => setTrap(e.target.value)} />
        <button disabled={state === 'sending'} className="bg-ink px-5 py-3 font-bold text-white disabled:opacity-60">{state === 'sending' ? 'Sending...' : 'Call me back'}</button>
        {state === 'error' && <p role="alert" className="font-semibold text-mag sm:col-span-3">Could not send. Please try again or message us on WhatsApp.</p>}
      </form>}
  </div></section>
}
