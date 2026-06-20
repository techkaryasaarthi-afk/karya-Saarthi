'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'

interface SidebarProps {
  user?: { fullname: string; email: string } | null
  onChatSupportClick?: () => void
  onClose?: () => void
}

const IconGrid = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
const IconReceipt = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16l3-2 3 2 3-2 3 2 3-2V8z"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="12" y2="16"/><polyline points="14 2 14 8 20 8"/></svg>
const IconUser = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IconChat = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const IconGlobe = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
const IconLogout = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>

const NAV = [
  { icon: <IconGrid />, label: 'Overview', href: '/dashboard' },
  { icon: <IconReceipt />, label: 'Invoices', href: '/dashboard/invoices' },
  { icon: <IconUser />, label: 'Profile', href: '/dashboard/profile' },
]

export default function DashboardSidebar({ user, onChatSupportClick, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const handleLogout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/') }
  const initials = user?.fullname?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <aside className="dash-sidebar" style={{ width: 232, height: '100vh', background: '#111111', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, borderRight: '1px solid rgba(255,255,255,0.07)', zIndex: 30, overflow: 'hidden' }}>
      {/* Gradient accent strip */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 2, height: '100%', background: 'linear-gradient(180deg, #6a4cf5 0%, #d44df0 60%, transparent 100%)' }} />

      {/* Logo */}
      <div style={{ padding: '22px 20px 18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Image src="/images/karyasaarthi.png" alt="Logo" width={26} height={26} style={{ borderRadius: 8 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.2 }}>Karya Saarthi</p>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Dashboard</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 10px' }}>
        {NAV.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} onClick={onClose} style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px',
              borderRadius: 9, marginBottom: 2, textDecoration: 'none', fontSize: 13,
              fontWeight: active ? 600 : 400, letterSpacing: '-0.1px',
              color: active ? '#fff' : 'rgba(255,255,255,0.4)',
              background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
              borderLeft: `2px solid ${active ? '#0099ff' : 'transparent'}`,
              paddingLeft: 10, transition: 'all 140ms ease',
            }}>
              <span style={{ color: active ? '#0099ff' : 'rgba(255,255,255,0.3)', flexShrink: 0, display: 'flex' }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
        {onChatSupportClick && (
          <button onClick={onChatSupportClick} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px',
            borderRadius: 9, marginBottom: 2, border: 'none', background: 'transparent', cursor: 'pointer',
            fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'left',
            borderLeft: '2px solid transparent', paddingLeft: 10, transition: 'all 140ms ease',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0, display: 'flex' }}><IconChat /></span>
            Chat Support
          </button>
        )}
      </nav>

      {/* Footer */}
      <div style={{ padding: '10px 10px 18px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', borderRadius: 9, textDecoration: 'none', fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>
          <span style={{ display: 'flex', flexShrink: 0 }}><IconGlobe /></span>View Website
        </Link>
        <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', borderRadius: 9, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#f87171', textAlign: 'left' }}>
          <span style={{ display: 'flex', flexShrink: 0 }}><IconLogout /></span>Sign Out
        </button>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', borderRadius: 9, marginTop: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#6a4cf5,#d44df0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.fullname}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
