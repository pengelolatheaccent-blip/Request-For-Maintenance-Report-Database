import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, PlusCircle, LogOut, Wrench } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', label: 'Dasbor', icon: LayoutDashboard, end: true },
  { to: '/requests', label: 'Daftar Tiket', icon: ClipboardList },
  { to: '/requests/new', label: 'Tiket Baru', icon: PlusCircle },
]

export default function Layout({ children }) {
  const { signOut, session } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--paper)' }}>
      <aside
        className="no-print w-60 shrink-0 flex flex-col justify-between"
        style={{ background: 'var(--ink)', color: '#EDEAE1' }}
      >
        <div>
          <div className="px-5 py-6 flex items-center gap-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <Wrench size={20} color="var(--accent)" />
            <div>
              <div className="font-mono-tag text-[0.68rem] tracking-wide" style={{ color: 'var(--accent)' }}>
                THE ACCENT
              </div>
              <div className="text-sm font-semibold leading-tight">Maintenance Log</div>
            </div>
          </div>
          <nav className="px-3 py-4 flex flex-col gap-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="px-3 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="px-3 text-xs text-white/40 mb-2 truncate">{session?.user?.email}</div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}
