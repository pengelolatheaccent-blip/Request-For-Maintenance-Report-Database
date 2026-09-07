import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, Printer, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

function Row({ label, value, full }) {
  return (
    <div className={`py-1.5 ${full ? 'col-span-2' : ''}`}>
      <div className="font-mono-tag text-[0.65rem] uppercase tracking-wide" style={{ color: 'var(--ink-soft)' }}>{label}</div>
      <div className="text-sm mt-0.5">{value || '—'}</div>
    </div>
  )
}

export default function PrintView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('maintenance_requests').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error) setError(error.message)
      else setData(data)
    })
  }, [id])

  if (error) return <div className="p-8 tag tag-bad">{error}</div>
  if (!data) return <div className="p-8 flex items-center gap-2" style={{ color: 'var(--ink-soft)' }}><Loader2 className="animate-spin" size={18} /> Memuat…</div>

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <div className="no-print flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="btn btn-ghost"><ArrowLeft size={15} /> Kembali</button>
        <button onClick={() => window.print()} className="btn btn-primary"><Printer size={15} /> Cetak</button>
      </div>

      <div className="panel p-8">
        <div className="flex items-start justify-between border-b pb-4 mb-4" style={{ borderColor: 'var(--line)' }}>
          <div>
            <div className="font-mono-tag text-xs" style={{ color: 'var(--accent)' }}>APARTEMEN THE ACCENT</div>
            <h1 className="text-lg font-semibold">Formulir Request for Maintenance</h1>
          </div>
          <div className="text-right">
            <div className="font-mono-tag text-xs" style={{ color: 'var(--ink-soft)' }}>No. Form</div>
            <div className="font-mono-tag text-lg font-semibold">{data.no_form}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 divide-y" style={{ borderColor: 'var(--line-soft)' }}>
          <Row label="Tanggal" value={data.date} />
          <Row label="Hari" value={data.day} />
          <Row label="Unit" value={data.unit} />
          <Row label="Nama Penyewa" value={data.tenant} />
          <Row label="Isi Permintaan / Komplain" value={data.work_requested} full />
          <Row label="Klasifikasi" value={data.klasifikasi} />
          <Row label="Jenis" value={data.request_complain} />
          <Row label="Lokasi" value={data.unit_public_area} />
          <Row label="Departemen" value={data.department} />
          <Row label="Pekerjaan Diperlukan" value={data.work_required} full />
          <Row label="Pekerjaan Dilakukan" value={data.work_performed} full />
          <Row label="Material" value={data.material} />
          <Row label="Jumlah" value={data.quantity} />
          <Row label="Biaya" value={data.cost} />
          <Row label="Status" value={data.status} />
          <Row label="Tanggal Selesai" value={data.closing_date} />
          <Row label="Ditangani Oleh" value={data.pic_name} />
          <Row label="Divisi" value={data.divisi} />
          <Row label="Predikat Solusi" value={data.giving_solution} />
          <Row label="Umpan Balik Penghuni" value={data.occupant_feedback} full />
          <Row label="Keterangan" value={data.keterangan} full />
        </div>

        <div className="grid grid-cols-2 gap-8 mt-10 pt-6 border-t" style={{ borderColor: 'var(--line)' }}>
          <div className="text-center">
            <div className="h-16" />
            <div className="border-t pt-1 text-xs" style={{ borderColor: 'var(--ink)' }}>Petugas Teknik</div>
          </div>
          <div className="text-center">
            <div className="h-16" />
            <div className="border-t pt-1 text-xs" style={{ borderColor: 'var(--ink)' }}>Penghuni / Penyewa</div>
          </div>
        </div>
      </div>
    </div>
  )
}
