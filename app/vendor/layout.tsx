'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import SessionInactivityGuard from '@/components/SessionInactivityGuard'

interface UserData { id: number; fullname: string; email: string; role: string }

const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard', href: '/vendor' },
  { icon: '📋', label: 'My Projects', href: '/vendor/projects' },
  { icon: '⚙️', label: 'Settings', href: '/vendor/settings' },
]

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const router      = useRouter()
  const pathname    = usePathname()
  const [user, setUser]         = useState<UserData | null>(null)
  const [loading, setLoading]   = useState(true)
  const [mobileOpen, setMobile] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        let res = await fetch('/api/auth/me')
        if (res.status === 401) { const r = await fetch('/api/auth/refresh', { method: 'POST' }); if (r.ok) res = await fetch('/api/auth/me') }
        if (!res.ok) { router.push('/login'); return }
        const data = await res.json()
        if (data.role !== 'vendor' && data.role !== 'super_admin') { router.push('/dashboard'); return }
        setUser(data)
      } catch { router.push('/login') }
      finally { setLoading(false) }
    }
    fetchUser()
  }, [router])

  const handleLogout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/') }

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        {[0,1,2].map(i => <div key={i} className="skeleton" style={{ width: 8, height: 8, borderRadius: '50%', animationDelay: `${i * 200}ms` }} />)}
      </div>
    )
  }

  const SidebarInner = () => (
    <>
      {/* Brand */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--color-hairline-soft)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Image src="/images/karyasaarthi.png" alt="Logo" width={24} height={24} style={{ borderRadius: 4 }} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.3px' }}>Karya Saarthi</span>
      </div>

      {/* Vendor badge */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--color-hairline-soft)' }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(34,197,94,0.12)', color: 'var(--color-semantic-success)' }}>
          🏪 Vendor
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 8px' }}>
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href || (item.href !== '/vendor' && pathname?.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobile(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 'var(--radius-md)', marginBottom: 2,
                textDecoration: 'none', fontSize: 'var(--text-body-sm-size)', fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                backgroundColor: isActive ? 'var(--color-surface-2)' : 'transparent',
                transition: 'background-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
              }}>
              <span style={{ fontSize: 15 }}>{item.icon}</span> {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div style={{ padding: '8px 8px 16px', borderTop: '1px solid var(--color-hairline-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', marginBottom: 4 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: 'rgba(0,153,255,0.15)', color: 'var(--color-accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
            {user.fullname.charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="text-body-sm" style={{ color: 'var(--color-ink)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.fullname}</p>
            <p className="text-micro" style={{ color: 'var(--color-ink-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
          </div>
        </div>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: 'var(--text-body-sm-size)', color: 'var(--color-ink-muted)' }}>🌐 View Website</Link>
        <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-md)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 'var(--text-body-sm-size)', color: '#f87171' }}>🚪 Logout</button>
      </div>
    </>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-canvas)' }}>
      <SessionInactivityGuard redirectTo="/login?timeout=1" />

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobile(true)}
        aria-label="Open menu"
        style={{
          display: 'none', position: 'fixed', top: 16, left: 16, zIndex: 50,
          width: 40, height: 40, borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-surface-1)', border: '1px solid var(--color-hairline)',
          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}
        className="vendor-hamburger"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={() => setMobile(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 40 }} />
      )}

      {/* Desktop sidebar */}
      <aside style={{ width: 232, height: '100vh', backgroundColor: 'var(--color-surface-1)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, borderRight: '1px solid var(--color-hairline-soft)', zIndex: 30 }} className="vendor-sidebar">
        <SidebarInner />
      </aside>

      {/* Mobile sidebar */}
      <aside
        style={{ width: 260, height: '100vh', backgroundColor: 'var(--color-surface-1)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, zIndex: 50, borderRight: '1px solid var(--color-hairline)', transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform var(--dur-slow) var(--ease-out)' }}
        className="vendor-mobile-sidebar"
      >
        <button onClick={() => setMobile(false)} style={{ position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: '50%', border: 'none', backgroundColor: 'var(--color-surface-2)', color: 'var(--color-ink-muted)', cursor: 'pointer', fontSize: 14 }}>✕</button>
        <SidebarInner />
      </aside>

      <main style={{ marginLeft: 232, padding: '32px 28px', minHeight: '100vh' }} className="vendor-main">
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .vendor-sidebar    { display: none !important; }
          .vendor-main       { margin-left: 0 !important; padding: 20px 16px !important; padding-top: 64px !important; }
          .vendor-hamburger  { display: flex !important; }
        }
      `}</style>
    </div>
  )
}

