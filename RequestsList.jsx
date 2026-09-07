import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, Printer, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { StatusBadge, TypeBadge } from '../components/StatusBadge'
import { STATUS_OPTIONS, REQUEST_COMPLAIN_OPTIONS } from '../lib/constants'

const PAGE_SIZE = 20

export default function RequestsList() {
  const [rows, setRows] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')

  const fetchRows = useCallback(async () => {
    setLoading(true)
    setError('')
    let query = supabase
      .from('maintenance_requests')
      .select('id, no_form, date, unit, tenant, work_requested, klasifikasi, request_complain, department, status', { count: 'exact' })
      .order('date', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)

    if (search.trim()) {
      const term = search.trim()
      query = query.or(
        `no_form.ilike.%${term}%,unit.ilike.%${term}%,tenant.ilike.%${term}%,work_requested.ilike.%${term}%`
      )
    }
    if (status) query = query.eq('status', status)
    if (type) query = query.eq('request_complain', type)

    const { data, error, count } = await query
    if (error) setError(error.message)
    else {
      setRows(data || [])
      setCount(count || 0)
    }
    setLoading(false)
  }, [page, search, status, type])

  useEffect(() => { fetchRows() }, [fetchRows])
  useEffect(() => { setPage(0) }, [search, status, type])

  const handleDelete = async (id, noForm) => {
    if (!confirm(`Hapus tiket ${noForm}? Tindakan ini tidak dapat dibatalkan.`)) return
    const { error } = await supabase.from('maintenance_requests').delete().eq('id', id)
    if (error) alert('Gagal menghapus: ' + error.message)
    else fetchRows()
  }

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Daftar Tiket</h1>
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>{count.toLocaleString('id-ID')} tiket tercatat.</p>
        </div>
        <Link to="/requests/new" className="btn btn-primary">+ Tiket Baru</Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-soft)' }} />
          <input
            className="input pl-8"
            placeholder="Cari no. form, unit, penyewa, atau isi permintaan…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Semua status</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input w-auto" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Semua jenis</option>
          {REQUEST_COMPLAIN_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {error && <div className="tag tag-bad px-4 py-3 mb-4">Gagal memuat data: {error}</div>}

      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: 'var(--line)' }}>
                {['No. Form', 'Tanggal', 'Unit', 'Penyewa', 'Klasifikasi', 'Jenis', 'Departemen', 'Status', ''].map((h) => (
                  <th key={h} className="font-mono-tag text-[0.68rem] uppercase tracking-wide px-4 py-2.5" style={{ color: 'var(--ink-soft)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center" style={{ color: 'var(--ink-soft)' }}>
                  <Loader2 className="animate-spin inline mr-2" size={16} />Memuat…
                </td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center" style={{ color: 'var(--ink-soft)' }}>
                  Tidak ada tiket yang cocok dengan pencarian.
                </td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-black/[0.02]" style={{ borderColor: 'var(--line-soft)' }}>
                  <td className="px-4 py-2.5 font-mono-tag text-xs whitespace-nowrap">{r.no_form}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{r.date || '—'}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{r.unit || '—'}</td>
                  <td className="px-4 py-2.5 max-w-[140px] truncate">{r.tenant || '—'}</td>
                  <td className="px-4 py-2.5 max-w-[180px] truncate" title={r.klasifikasi}>{r.klasifikasi || '—'}</td>
                  <td className="px-4 py-2.5"><TypeBadge type={r.request_complain} /></td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{r.department || '—'}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1 justify-end">
                      <Link to={`/requests/${r.id}/print`} className="p-1.5 rounded hover:bg-black/5" title="Cetak">
                        <Printer size={15} />
                      </Link>
                      <Link to={`/requests/${r.id}`} className="p-1.5 rounded hover:bg-black/5" title="Edit">
                        <Pencil size={15} />
                      </Link>
                      <button onClick={() => handleDelete(r.id, r.no_form)} className="p-1.5 rounded hover:bg-black/5" title="Hapus" style={{ color: 'var(--bad)' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--line)' }}>
          <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>
            Halaman {page + 1} dari {totalPages}
          </span>
          <div className="flex gap-2">
            <button className="btn btn-ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={15} /> Sebelumnya
            </button>
            <button className="btn btn-ghost" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Berikutnya <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
