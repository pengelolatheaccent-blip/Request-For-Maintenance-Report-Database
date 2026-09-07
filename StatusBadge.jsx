export function StatusBadge({ status }) {
  const s = (status || '').toLowerCase()
  const cls = s === 'close' ? 'tag-good' : s === 'open' ? 'tag-warn' : 'tag-neutral'
  return <span className={`tag ${cls}`}>{status || '—'}</span>
}

export function TypeBadge({ type }) {
  const s = (type || '').toLowerCase()
  const cls = s === 'komplain' ? 'tag-bad' : 'tag-neutral'
  return <span className={`tag ${cls}`}>{type || '—'}</span>
}
