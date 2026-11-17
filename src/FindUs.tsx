import { useEffect, useState } from 'react'
import { supabase } from './supabase'
export type S = Record<string, string>
export const safeUrl = (u?: string) => (u && /^https:\/\//i.test(u) ? u : '')
export const useSettings = () => {
  const [s, setS] = useState<S>({}); const [ready, setReady] = useState(false)
  useEffect(() => { supabase.from('site_settings').select('key,value').then(({ data }) => { setS(Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]))); setReady(true) }) }, [])
  return { s, setS, ready }
}

export default function FindUs() {
  const { s } = useSettings()
  if (!s.address && !s.hours && !s.phone) return null
  const map = safeUrl(s.map_url), tel = (s.phone ?? '').replace(/[^\d+]/g, '')
  return <section id="find-us" className="mx-auto max-w-6xl px-5 py-14">
    <h2 className="text-3xl font-black">Find us</h2>
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <div className="border-t-8 bg-white p-5" style={{ borderColor: '#00A6D6' }}>
        {s.address && <><h3 className="font-bold">Visit the shop</h3><address className="mt-1 whitespace-pre-line not-italic">{s.address}</address></>}
        {tel && <p className="mt-3"><b>Call:</b> <a className="underline" href={`tel:${tel}`}>{s.phone}</a></p>}
        {map && <a href={map} target="_blank" rel="noreferrer" className="mt-4 inline-block bg-ink px-5 py-3 font-bold text-white">Open in Google Maps</a>}
      </div>
      {s.hours && <div className="border-t-8 bg-white p-5" style={{ borderColor: '#FFC400' }}><h3 className="font-bold">Opening hours</h3><p className="mt-1 whitespace-pre-line">{s.hours}</p></div>}
    </div></section>
}
