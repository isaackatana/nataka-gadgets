import { useState } from 'react'
import { supabase } from './supabase'

// Cells starting with = + - @ are prefixed so spreadsheets never run them as formulas.
const cell = (v: unknown) => { let s = v == null ? '' : String(v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"' }
function toCsv(rows: Record<string, unknown>[]) {
  const cols = Object.keys(rows[0] ?? {})
  return '\ufeff' + [cols.join(','), ...rows.map(r => cols.map(c => cell(r[c])).join(','))].join('\r\n')
}
const sets = [
  { table: 'quotes', label: 'Quote requests' },
  { table: 'repairs', label: 'Repair jobs' },
  { table: 'reviews', label: 'Reviews' },
  { table: 'products', label: 'Products' },
]

export default function Backup() {
  const [msg, setMsg] = useState('')
  async function get(table: string, label: string) {
    setMsg('')
    const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false })
    if (error) return setMsg('Could not download: ' + error.message)
    if (!data || data.length === 0) return setMsg(`${label}: nothing to download yet.`)
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([toCsv(data)], { type: 'text/csv;charset=utf-8' }))
    a.download = `nataka-${table}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(a.href)
  }
  return <div className="mt-8 border-2 border-ink bg-white p-4">
    <h2 className="text-lg font-bold">Backup your data</h2>
    <p className="mt-1 text-sm">Download a spreadsheet file (opens in Excel or Google Sheets). Keep a copy somewhere safe every month.</p>
    <div className="mt-3 flex flex-wrap gap-2">{sets.map(s => <button key={s.table} onClick={() => get(s.table, s.label)} className="border-2 border-ink bg-yel px-4 py-2 font-bold">Download {s.label}</button>)}</div>
    {msg && <p role="status" className="mt-3 font-semibold">{msg}</p>}
  </div>
}
