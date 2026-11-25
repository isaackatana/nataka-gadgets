// Runs after `vite build`: writes one static HTML page per service (own title, description, canonical),
// plus sitemap.xml and robots.txt, so Google can read each page without running JavaScript first.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
const data = JSON.parse(readFileSync('src/services.json', 'utf8'))
const SITE = (process.env.VITE_SITE_URL || '').replace(/\/$/, ''), AREA = process.env.VITE_AREA || '', WA = process.env.VITE_WHATSAPP || ''
const NAME = 'Nataka Gadgets - Tech Care', esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const base = readFileSync('dist/index.html', 'utf8')
const biz = { '@type': 'LocalBusiness', name: NAME, ...(SITE && { url: SITE }), ...(WA && { telephone: '+' + WA }), ...(AREA && { areaServed: AREA }) }
const page = (title, desc, path, ld) => {
  let h = base.replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`).replace(/(<meta name="description" content=")[^"]*"/, `$1${esc(desc)}"`)
  const extra = (SITE ? `<link rel="canonical" href="${SITE}${path}"/>` : '') + `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`
  return h.replace('</head>', extra + '</head>')
}
writeFileSync('dist/index.html', page(`${NAME} | Phone, Laptop & Electronics Repair${AREA ? ' in ' + AREA : ''}`, 'Reliable smartphone, laptop and electronics repairs. Message us for a fast quote.', '/', biz))
for (const s of data.services) {
  mkdirSync(`dist/services/${s.slug}`, { recursive: true })
  const title = `${s.title}${AREA ? ' in ' + AREA : ''} | ${NAME}`
  writeFileSync(`dist/services/${s.slug}/index.html`, page(title, `${s.intro} ${s.desc}`, `/services/${s.slug}`, { '@context': 'https://schema.org', '@type': 'Service', name: s.title, description: s.intro, provider: biz, ...(AREA && { areaServed: AREA }) }))
}
mkdirSync('dist/shop', { recursive: true })
writeFileSync('dist/shop/index.html', page(`Repair parts and tools: phone and laptop parts, batteries, chargers${AREA ? ' in ' + AREA : ''} | ${NAME}`, 'Phone screens, batteries, chargers, laptop parts and accessories. Order on WhatsApp.', '/shop', { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Parts and accessories', publisher: biz }))
// Product pages are added to the sitemap from the database at build time (redeploy to refresh the list).
let productIds = []
try {
  const U = (process.env.VITE_SUPABASE_URL || '').replace(/\/$/, ''), K = process.env.VITE_SUPABASE_ANON_KEY || ''
  if (U && K) { const r = await fetch(`${U}/rest/v1/products?select=id&active=eq.true`, { headers: { apikey: K } }); if (r.ok) productIds = (await r.json()).map(x => x.id) }
} catch { /* sitemap still works without products */ }
if (SITE) {
  const urls = ['/', '/shop', ...data.services.map(s => `/services/${s.slug}`), ...productIds.map(id => `/shop/${id}`)]
  writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `<url><loc>${SITE}${u}</loc></url>`).join('\n')}\n</urlset>\n`)
  writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`)
} else console.warn('VITE_SITE_URL not set: skipped sitemap.xml, robots.txt and canonical links.')
console.log('SEO pages written:', data.services.length + 1)
