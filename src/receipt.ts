import type { R } from './Repairs'
const esc = (v: string) => v.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))

// Opens a print-ready receipt (fits an 80mm thermal printer or A4) in a new tab.
export function printReceipt(r: R & { created_at?: string }, shop: Record<string, string>) {
  const w = window.open('', '_blank')
  if (!w) return alert('Your browser blocked the receipt window. Allow pop-ups for this site and try again.')
  const date = new Date(r.created_at ?? Date.now()).toLocaleString()
  const line = (k: string, v: string) => v ? `<tr><td class="k">${k}</td><td>${esc(v)}</td></tr>` : ''
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Receipt ${esc(r.code)}</title><style>
    body{font:14px/1.4 Arial,sans-serif;color:#000;max-width:72mm;margin:12px auto;padding:0 6px}
    h1{font-size:16px;margin:0;text-align:center}.c{text-align:center}.code{font-size:28px;font-weight:bold;text-align:center;margin:10px 0;border:2px solid #000;padding:6px}
    table{width:100%;border-collapse:collapse}td{padding:3px 0;vertical-align:top}.k{width:34%;font-weight:bold}hr{border:0;border-top:1px dashed #000;margin:10px 0}.s{font-size:12px}
    @media print{body{margin:0}}</style></head><body>
    <h1>Nataka Gadget &amp; Graphics Co.</h1><p class="c s">Tech Care &amp; Brand Wear${shop.address ? '<br>' + esc(shop.address).replace(/\n/g, '<br>') : ''}${shop.phone ? '<br>Tel: ' + esc(shop.phone) : ''}</p>
    <hr><p class="c"><b>REPAIR RECEIPT</b></p><div class="code">${esc(r.code)}</div>
    <table>${line('Customer', r.customer_name)}${line('Phone', r.phone)}${line('Device', r.device)}${line('Issue', r.issue)}${line('Booked in', date)}</table>
    <hr><p class="s"><b>Track your repair:</b> go to ${esc(location.origin)} and open Track your repair. Enter the job code above and your phone number.</p>
    <p class="s">Please bring this receipt or tell us your job code when you collect your device.</p>${shop.terms ? '<hr><p class="s"><b>Terms</b><br>' + esc(shop.terms).replace(/\n/g, '<br>') + '</p>' : ''}
    <script>window.onload=function(){window.print()}<\/script></body></html>`)
  w.document.close()
}
