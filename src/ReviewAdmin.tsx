import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { Stars, type Review } from './Reviews'

export default function ReviewAdmin() {
  const [rows, setRows] = useState<Review[]>([])
  const load = async () => { const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false }); setRows((data as Review[]) ?? []) }
  useEffect(() => { load() }, [])
  return <div className="mt-6">
    {rows.length === 0 && <p>No reviews yet. Customers can review from the Track your repair section once their job is marked collected.</p>}
    <ul className="space-y-3">{rows.map(r => <li key={r.id} className="border-2 border-ink bg-white p-4">
      <div className="flex flex-wrap justify-between gap-2"><span><b>{r.name}</b> <Stars n={r.rating} /> &middot; {r.approved ? 'Showing on site' : 'Waiting for approval'}</span>
        <span className="flex gap-4"><button className="underline" onClick={async () => { await supabase.from('reviews').update({ approved: !r.approved }).eq('id', r.id); load() }}>{r.approved ? 'Hide' : 'Approve'}</button>
          <button className="underline" onClick={async () => { await supabase.from('reviews').delete().eq('id', r.id); load() }}>Delete</button></span></div>
      {r.body && <p className="mt-2">{r.body}</p>}</li>)}</ul></div>
}
