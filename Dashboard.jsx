import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid,
} from 'recharts'
import { ClipboardList, AlertCircle, CheckCircle2, Building2, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

const PIE_COLORS = ['#c4551d', '#2f6f4e', '#b98900', '#4b5468', '#a63232', '#9c4216']

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="panel p-4 flex items-center gap-4">
      <div
        className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: accent ? 'var(--accent)' : 'var(--neutral-bg)', color: accent ? 'white' : 'var(--ink)' }}
      >
        <Icon size={20} />
      </div>
      <div>
        <div className="font-mono-tag text-2xl font-semibold leading-none">{value}</div>
        <div className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>{label}</div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    supabase
      .from('maintenance_requests')
      .select('status, department, klasifikasi, request_complain, month, year, unit')
      .then(({ data, error }) => {
        if (!active) return
        if (error) setError(error.message)
        else setRows(data || [])
      })
    return () => { active = false }
  }, [])

  const stats = useMemo(() => {
    if (!rows) return null
    const total = rows.length
    const open = rows.filter((r) => (r.status || '').toLowerCase() === 'open').length
    const close = total - open
    const uniqueUnits = new Set(rows.map((r) => r.unit).filter(Boolean)).size

    const byDept = {}
    rows.forEach((r) => {
      const d = r.department || 'Tanpa Departemen'
      byDept[d] = (byDept[d] || 0) + 1
    })
    const deptChart = Object.entries(byDept)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }))

    const byType = {}
    rows.forEach((r) => {
      const t = r.request_complain || 'Lainnya'
      byType[t] = (byType[t] || 0) + 1
    })
    const typeChart = Object.entries(byType).map(([name, value]) => ({ name, value }))

    const byKlas = {}
    rows.forEach((r) => {
      const k = r.klasifikasi || 'Lainnya'
      byKlas[k] = (byKlas[k] || 0) + 1
    })
    const klasChart = Object.entries(byKlas)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name: name.length > 22 ? name.slice(0, 22) + '…' : name, value }))

    const currentYear = new Date().getFullYear()
    const monthly = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, value: 0 }))
    rows.forEach((r) => {
      if (r.year === currentYear && r.month >= 1 && r.month <= 12) {
        monthly[r.month - 1].value += 1
      }
    })
    const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
    const monthlyChart = monthly.map((m) => ({ name: monthNames[m.month - 1], value: m.value }))

    return { total, open, close, uniqueUnits, deptChart, typeChart, klasChart, monthlyChart, currentYear }
  }, [rows])

  if (error) {
    return (
      <div className="p-8">
        <div className="tag tag-bad px-4 py-3">Gagal memuat data: {error}</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="p-8 flex items-center gap-2" style={{ color: 'var(--ink-soft)' }}>
        <Loader2 className="animate-spin" size={18} /> Memuat dasbor…
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Dasbor</h1>
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Ringkasan seluruh tiket maintenance & komplain.</p>
        </div>
        <Link to="/requests/new" className="btn btn-primary">+ Tiket Baru</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Tiket" value={stats.total.toLocaleString('id-ID')} icon={ClipboardList} accent />
        <StatCard label="Masih Terbuka" value={stats.open.toLocaleString('id-ID')} icon={AlertCircle} />
        <StatCard label="Sudah Selesai" value={stats.close.toLocaleString('id-ID')} icon={CheckCircle2} />
        <StatCard label="Unit Tercatat" value={stats.uniqueUnits.toLocaleString('id-ID')} icon={Building2} />
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="panel p-4 md:col-span-2">
          <h2 className="text-sm font-semibold mb-3">Tiket per bulan · {stats.currentYear}</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.monthlyChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--ink-soft)' }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--ink-soft)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 8, borderColor: 'var(--line)', fontSize: 13 }} />
              <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="panel p-4">
          <h2 className="text-sm font-semibold mb-3">Request vs Komplain</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stats.typeChart} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                {stats.typeChart.map((entry, i) => (
                  <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, borderColor: 'var(--line)', fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-xs mt-1">
            {stats.typeChart.map((t, i) => (
              <div key={t.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                {t.name} ({t.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="panel p-4">
          <h2 className="text-sm font-semibold mb-3">Berdasarkan departemen</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.deptChart} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--ink-soft)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: 'var(--ink-soft)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, borderColor: 'var(--line)', fontSize: 13 }} />
              <Bar dataKey="value" fill="var(--ink)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="panel p-4">
          <h2 className="text-sm font-semibold mb-3">Klasifikasi terbanyak</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.klasChart} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--ink-soft)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11, fill: 'var(--ink-soft)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, borderColor: 'var(--line)', fontSize: 13 }} />
              <Bar dataKey="value" fill="var(--warn)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
