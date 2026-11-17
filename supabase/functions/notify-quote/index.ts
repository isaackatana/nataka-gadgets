// Sends the business an email when a new row lands in public.quotes.
// Triggered by a Supabase Database Webhook (INSERT on quotes).
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))

Deno.serve(async (req: Request) => {
  if (req.headers.get('x-webhook-secret') !== Deno.env.get('WEBHOOK_SECRET')) return new Response('Unauthorized', { status: 401 })
  const { record: q } = await req.json()
  if (!q) return new Response('No record', { status: 400 })
  const phone = String(q.phone).replace(/[^\d+]/g, '')
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: Deno.env.get('FROM_EMAIL'),
      to: [Deno.env.get('NOTIFY_EMAIL')],
      subject: `New quote request: ${q.service} (${q.name})`,
      html: `<h2>New quote request</h2><p><b>${esc(q.name)}</b><br>Phone: <a href="tel:${esc(phone)}">${esc(q.phone)}</a><br>Service: ${esc(q.service)}</p><p>${esc(q.details).replace(/\n/g, '<br>')}</p><p>Reply fast: <a href="https://wa.me/${esc(phone.replace('+', ''))}">WhatsApp ${esc(q.name)}</a></p>`,
    }),
  })
  return new Response(res.ok ? 'sent' : await res.text(), { status: res.ok ? 200 : 502 })
})
