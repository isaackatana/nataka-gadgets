import { useSettings } from './FindUs'

// Site-wide banner, switched on from Staff area > Shop details. Hides itself after the "show until" date.
export default function Notice() {
  const { s } = useSettings()
  const until = s.notice_until ? new Date(s.notice_until + 'T23:59:59') : null
  if (s.notice_on !== 'true' || !s.notice || (until && new Date() > until)) return null
  return <div role="status" className="bg-yel px-5 py-3 text-center font-bold text-ink">{s.notice}</div>
}
