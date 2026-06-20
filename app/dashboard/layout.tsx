'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import SessionInactivityGuard from '@/components/SessionInactivityGuard'
import DashboardSidebar from '@/components/DashboardSidebar'
import DirectChatPanel from '@/components/admin/DirectChatPanel'

interface UserData { id: number; fullname: string; email: string; role: string; department: string | null; is_approved: boolean; user_type: string }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDMPanel, setShowDMPanel] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        let res = await fetch('/api/auth/me')
        if (res.status === 401) { const r = await fetch('/api/auth/refresh', { method: 'POST' }); if (r.ok) res = await fetch('/api/auth/me') }
        if (!res.ok) { router.push('/login'); return }
        const data = await res.json()
        if (data.role === 'vendor') { router.push('/vendor'); return }
        setUser(data)
      } catch { router.push('/login') }
      finally { setLoading(false) }
    }
    fetchUser()
  }, [router])

  if (loading || !user) return (
    <div style={{ minHeight: '100vh', background: '#090909', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      {[0,1,2].map(i => <div key={i} className="skeleton" style={{ width: 8, height: 8, borderRadius: '50%', animationDelay: `${i*200}ms` }} />)}
    </div>
  )

  const initials = user.fullname.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div style={{ minHeight: '100vh', background: '#090909' }}>
      <SessionInactivityGuard redirectTo="/login?timeout=1" />

      {/* Desktop Sidebar */}
      <div className="dash-sidebar-desk">
        <DashboardSidebar user={user} onChatSupportClick={() => setShowDMPanel(v => !v)} />
      </div>

      {/* Mobile: backdrop */}
      {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 40, backdropFilter: 'blur(3px)' }} />}

      {/* Mobile sidebar drawer */}
      <div style={{ position: 'fixed', top: 0, left: 0, height: '100vh', width: 240, zIndex: 50, transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 260ms cubic-bezier(.4,0,.2,1)' }} className="dash-drawer">
        <button onClick={() => setMobileOpen(false)} style={{ position: 'absolute', top: 12, right: 10, width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 12, zIndex: 1 }}>✕</button>
        <DashboardSidebar user={user} onClose={() => setMobileOpen(false)} onChatSupportClick={() => { setShowDMPanel(v => !v); setMobileOpen(false) }} />
      </div>

      {/* Mobile top bar */}
      <header className="dash-topbar" style={{ display: 'none', position: 'fixed', top: 0, left: 0, right: 0, height: 54, background: '#111111', borderBottom: '1px solid rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 35 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setMobileOpen(true)} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <Image src="/images/karyasaarthi.png" alt="Logo" width={22} height={22} style={{ borderRadius: 6 }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '-0.2px' }}>Karya Saarthi</span>
        </div>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>{initials}</div>
      </header>

      {/* Main */}
      <main className="dash-main" style={{ marginLeft: 232, minHeight: '100vh', padding: '36px 36px' }}>
        {children}
      </main>

      {showDMPanel && <DirectChatPanel currentUserId={user.id} mode="user" onClose={() => setShowDMPanel(false)} />}

      <style>{`
        @media (max-width: 768px) {
          .dash-sidebar-desk { display: none !important; }
          .dash-topbar { display: flex !important; }
          .dash-main { margin-left: 0 !important; padding: 16px !important; padding-top: 70px !important; }
        }
        @media (min-width: 769px) { .dash-drawer { display: none !important; } }
      `}</style>
    </div>
  )
}
