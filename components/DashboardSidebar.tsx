'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'

interface SidebarProps {
  onChatSupportClick?: () => void
}

export default function DashboardSidebar({ onChatSupportClick }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const navItems = [
    { icon: '📊', label: 'Dashboard', href: '/dashboard' },
    // Only highlight My Projects when exactly on /dashboard
    { icon: '📋', label: 'My Projects', href: '/dashboard' },
    { icon: '🧾', label: 'My Invoices', href: '/dashboard/invoices' },
    { icon: '👤', label: 'Profile', href: '/dashboard/profile' },
  ]

  return (
    <aside className="dash-sidebar" style={{ width: 232, minHeight: 'calc(100vh - 56px)', backgroundColor: 'var(--color-surface-1)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 56, left: 0, borderRight: '1px solid var(--color-hairline-soft)', zIndex: 30 }}>
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--color-hairline-soft)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Image src="/images/karyasaarthi.png" alt="Logo" width={24} height={24} style={{ borderRadius: 4 }} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.3px' }}>Karya Saarthi</span>
      </div>
      <nav style={{ flex: 1, padding: '8px 8px' }}>
        {navItems.map(item => {
          // Determine active state manually
          const isActive = pathname === item.href && (item.label !== 'My Projects' || pathname === '/dashboard')
          return (
            <Link key={item.label} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-md)', marginBottom: 2, textDecoration: 'none', fontSize: 'var(--text-body-sm-size)', fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--color-ink)' : 'var(--color-ink-muted)', backgroundColor: isActive ? 'var(--color-surface-2)' : 'transparent', transition: 'background-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)' }}>
              <span style={{ fontSize: 15 }}>{item.icon}</span> {item.label}
            </Link>
          )
        })}
        {onChatSupportClick && (
          <button onClick={onChatSupportClick} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-md)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 'var(--text-body-sm-size)', color: 'var(--color-ink-muted)', transition: 'color var(--dur-fast)' }}>
            <span style={{ fontSize: 15 }}>💬</span> Chat with Support
          </button>
        )}
      </nav>
      <div style={{ padding: '8px 8px 16px', borderTop: '1px solid var(--color-hairline-soft)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: 'var(--text-body-sm-size)', color: 'var(--color-ink-muted)' }}>🌐 View Website</Link>
        <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-md)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 'var(--text-body-sm-size)', color: '#f87171', transition: 'color var(--dur-fast)' }}>🚪 Logout</button>
      </div>
    </aside>
  )
}
