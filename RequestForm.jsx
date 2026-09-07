import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import {
  KLASIFIKASI_OPTIONS, REQUEST_COMPLAIN_OPTIONS, UNIT_PUBLIC_AREA_OPTIONS,
  DEPARTMENT_OPTIONS, DIVISI_OPTIONS, STATUS_OPTIONS, DAY_NAMES,
} from '../lib/constants'

const empty = {
  no_form: '', date: '', unit: '', tenant: '', work_requested: '',
  klasifikasi: '', request_complain: 'Request', unit_public_area: 'Unit', department: 'Teknik',
  work_required: '', work_performed: '', material: '', quantity: '', cost: '',
  unable: '', desc_unable: '', closing_date: '', pic_name: '', divisi: 'Teknik',
  status: 'Open', completion_target: '', giving_solution: '', occupant_feedback: '', keterangan: '',
}

function Section({ title, children }) {
  return (
    <div className="panel p-5 mb-4">
      <h2 className="font-mono-tag text-[0.7rem] uppercase tracking-wide mb-4" style={{ color: 'var(--accent)' }}>
        {title}
      </h2>
      <div className="grid md:grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

function Field({ label, full, children }) {
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <label className="field-label">{label}</label>
      {children}
    </div>
  )
}

export default function RequestForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    supabase.from('maintenance_requests').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error) setError(error.message)
      else setForm({ ...empty, ...data })
      setLoading(false)
    })
  }, [id, isEdit])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = { ...form }
    if (payload.date) {
      const d = new Date(payload.date)
      payload.year = d.getFullYear()
      payload.month = d.getMonth() + 1
      payload.day = DAY_NAMES[d.getDay()]
    }
    ;['completion_target'].forEach((k) => {
      payload[k] = payload[k] === '' ? null : Number(payload[k])
    })
    ;['closing_date'].forEach((k) => { if (payload[k] === '') payload[k] = null })

    let result
    if (isEdit) {
      result = await supabase.from('maintenance_requests').update(payload).eq('id', id)
    } else {
      result = await supabase.from('maintenance_requests').insert(payload)
    }
    setSaving(false)
    if (result.error) setError(result.error.message)
    else navigate('/requests')
  }

  if (loading) {
    return <div className="p-8 flex items-center gap-2" style={{ color: 'var(--ink-soft)' }}>
      <Loader2 className="animate-spin" size={18} /> Memuat tiket…
    </div>
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <button onClick={() => navigate(-1)} className="btn btn-ghost mb-4">
        <ArrowLeft size={15} /> Kembali
      </button>
      <h1 className="text-xl font-semibold mb-1">{isEdit ? `Edit Tiket ${form.no_form}` : 'Tiket Baru'}</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--ink-soft)' }}>
        Isi detail permintaan atau komplain maintenance di bawah ini.
      </p>

      {error && <div className="tag tag-bad px-4 py-3 mb-4 w-full">{error}</div>}

      <form onSubmit={handleSubmit}>
        <Section title="Informasi Permintaan">
          <Field label="No. Form"><input className="input" required value={form.no_form} onChange={set('no_form')} placeholder="mis. 2025-101" /></Field>
          <Field label="Tanggal"><input className="input" type="date" required value={form.date || ''} onChange={set('date')} /></Field>
          <Field label="Unit"><input className="input" required value={form.unit} onChange={set('unit')} placeholder="mis. AC 12-04" /></Field>
          <Field label="Nama Penyewa"><input className="input" value={form.tenant} onChange={set('tenant')} /></Field>
          <Field label="Isi Permintaan / Komplain" full>
            <textarea className="input" rows={3} required value={form.work_requested} onChange={set('work_requested')} />
          </Field>
        </Section>

        <Section title="Klasifikasi Tiket">
          <Field label="Klasifikasi">
            <select className="input" list="klasifikasi-list" value={form.klasifikasi} onChange={set('klasifikasi')}>
              <option value="">— pilih atau ketik —</option>
              {KLASIFIKASI_OPTIONS.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </Field>
          <Field label="Jenis">
            <select className="input" value={form.request_complain} onChange={set('request_complain')}>
              {REQUEST_COMPLAIN_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Lokasi">
            <select className="input" value={form.unit_public_area} onChange={set('unit_public_area')}>
              {UNIT_PUBLIC_AREA_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Departemen">
            <select className="input" value={form.department} onChange={set('department')}>
              {DEPARTMENT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
        </Section>

        <Section title="Pengerjaan">
          <Field label="Pekerjaan yang Diperlukan" full>
            <textarea className="input" rows={2} value={form.work_required} onChange={set('work_required')} />
          </Field>
          <Field label="Pekerjaan yang Dilakukan" full>
            <textarea className="input" rows={2} value={form.work_performed} onChange={set('work_performed')} />
          </Field>
          <Field label="Material"><input className="input" value={form.material} onChange={set('material')} /></Field>
          <Field label="Jumlah"><input className="input" value={form.quantity} onChange={set('quantity')} /></Field>
          <Field label="Biaya"><input className="input" value={form.cost} onChange={set('cost')} /></Field>
          <Field label="Tidak Dapat Diselesaikan?"><input className="input" value={form.unable} onChange={set('unable')} placeholder="- jika tidak ada" /></Field>
          <Field label="Keterangan Tidak Selesai" full>
            <textarea className="input" rows={2} value={form.desc_unable} onChange={set('desc_unable')} />
          </Field>
        </Section>

        <Section title="Penutupan Tiket">
          <Field label="Tanggal Selesai"><input className="input" type="date" value={form.closing_date || ''} onChange={set('closing_date')} /></Field>
          <Field label="Ditangani oleh"><input className="input" value={form.pic_name} onChange={set('pic_name')} /></Field>
          <Field label="Divisi">
            <select className="input" list="divisi-list" value={form.divisi} onChange={set('divisi')}>
              {DIVISI_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select className="input" value={form.status} onChange={set('status')}>
              {STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Target Penyelesaian (hari)"><input className="input" type="number" value={form.completion_target} onChange={set('completion_target')} /></Field>
          <Field label="Predikat Solusi"><input className="input" value={form.giving_solution} onChange={set('giving_solution')} /></Field>
          <Field label="Umpan Balik Penghuni" full>
            <textarea className="input" rows={2} value={form.occupant_feedback} onChange={set('occupant_feedback')} />
          </Field>
          <Field label="Keterangan Tambahan" full>
            <textarea className="input" rows={2} value={form.keterangan} onChange={set('keterangan')} />
          </Field>
        </Section>

        <div className="flex justify-end gap-2 mt-2 mb-8">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Batal</button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
            {isEdit ? 'Simpan Perubahan' : 'Buat Tiket'}
          </button>
        </div>
      </form>
    </div>
  )
}
