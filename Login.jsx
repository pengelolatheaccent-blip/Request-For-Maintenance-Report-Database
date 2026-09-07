import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Wrench } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'Email atau kata sandi salah.' : error.message)
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--ink)' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Wrench size={22} color="var(--accent)" />
          <div className="text-center">
            <div className="font-mono-tag text-xs tracking-wide" style={{ color: 'var(--accent)' }}>
              THE ACCENT
            </div>
            <div className="text-white font-semibold">Maintenance Log</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="panel p-6" style={{ background: 'var(--panel)' }}>
          <h1 className="text-base font-semibold mb-1">Masuk</h1>
          <p className="text-sm mb-5" style={{ color: 'var(--ink-soft)' }}>
            Gunakan akun staf yang terdaftar di sistem.
          </p>
          <div className="mb-4">
            <label className="field-label">Email</label>
            <input
              className="input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@theaccent.co.id"
            />
          </div>
          <div className="mb-5">
            <label className="field-label">Kata sandi</label>
            <input
              className="input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error && (
            <div className="tag tag-bad mb-4 w-full justify-center py-2">{error}</div>
          )}
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? 'Memproses…' : 'Masuk'}
          </button>
        </form>
        <p className="text-center text-xs mt-4 text-white/40">
          Belum punya akun? Minta admin membuatkannya lewat Supabase Auth.
        </p>
      </div>
    </div>
  )
}
