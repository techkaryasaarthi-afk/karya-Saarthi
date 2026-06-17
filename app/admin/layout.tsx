'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import SessionInactivityGuard from '@/components/SessionInactivityGuard'

interface UserData {
  id: number; fullname: string; email: string; role: string
  department: string | null; pillar_role?: string | null
  is_approved: boolean; avatar_url?: string | null
}

const INTERNAL_ROLES = ['super_admin', 'board_member', 'admin', 'pillar_member']

function TopBar({ user }: { user: UserData }) {
  const router = useRouter()
  const [showNotifs,    setShowNotifs]    = useState(false)
  const [showGroupChat, setShowGroupChat] = useState(false)
  const [unread,        setUnread]        = useState(0)
  const [showDM,        setShowDM]        = useState(false)
  const [showMeetings,  setShowMeetings]  = useState(false)
  const [NotifComp,  setNotifComp]  = useState<React.ComponentType<{ userId: number; onClose: () => void }> | null>(null)
  const [ChatComp,   setChatComp]   = useState<React.ComponentType<{ currentUserId: number; isAdmin?: boolean; onClose: () => void }> | null>(null)
  const [DMComp,     setDMComp]     = useState<React.ComponentType<{ currentUserId: number; mode: 'ops' | 'user'; onClose: () => void }> | null>(null)
  const [MeetComp,   setMeetComp]   = useState<React.ComponentType<{ currentUserId: number; onClose: () => void }> | null>(null)

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/notifications?limit=1')
        if (res.ok) { const d = await res.json(); setUnread(d.unread || 0) }
      } catch { }
    }
    fetchUnread()
    const i = setInterval(fetchUnread, 15000)
    return () => clearInterval(i)
  }, [])

  const openNotifs   = () => { if (!NotifComp) import('@/components/NotificationCenter').then(m => setNotifComp(() => m.default)); setShowNotifs(v => !v) }
  const openChat     = () => { if (!ChatComp)  import('@/components/admin/GroupChatPanel').then(m => setChatComp(() => m.default));  setShowGroupChat(v => !v) }
  const openDM       = () => { if (!DMComp)    import('@/components/admin/DirectChatPanel').then(m => setDMComp(() => m.default));   setShowDM(v => !v) }
  const openMeetings = () => { if (!MeetComp)  import('@/components/admin/MeetingPanel').then(m => setMeetComp(() => m.default));    setShowMeetings(v => !v) }
  const handleLogout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/') }

  const iconBtnStyle: React.CSSProperties = {
    width: 36, height: 36, borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-hairline)', backgroundColor: 'transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, cursor: 'pointer', position: 'relative',
    color: 'var(--color-ink-muted)',
    transition: 'background-color var(--dur-fast) var(--ease-out)',
  }

  return (
    <>
      <div style={{
        position: 'sticky', top: 0, zIndex: 30,
        backgroundColor: 'var(--color-surface-1)',
        borderBottom: '1px solid var(--color-hairline-soft)',
        padding: '10px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="text-body-sm" style={{ color: 'var(--color-ink)', fontWeight: 600 }}>{user.fullname}</span>
          <span style={{ color: 'var(--color-hairline)', fontSize: 14 }}>·</span>
          <span className="text-body-sm" style={{ color: 'var(--color-ink-muted)', textTransform: 'capitalize' }}>{user.role.replace('_', ' ')}</span>
          {user.department && <span className="text-micro" style={{ color: 'var(--color-accent-blue)', textTransform: 'capitalize' }}>· {user.department}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={openMeetings} style={iconBtnStyle} title="Video Meetings">📹</button>
          <button onClick={openDM}       style={iconBtnStyle} title="Direct Messages">✉️</button>
          <button onClick={openChat}     style={iconBtnStyle} title="Group Chat">💬</button>
          <button onClick={openNotifs}   style={{ ...iconBtnStyle, position: 'relative' }} title="Notifications">
            🔔
            {unread > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', backgroundColor: '#ef4444', color: '#fff', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          <button onClick={handleLogout} style={{ padding: '6px 12px', borderRadius: 'var(--radius-pill)', border: '1px solid #7f1d1d', backgroundColor: '#1a0808', color: '#f87171', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      {showNotifs    && NotifComp && <NotifComp userId={user.id} onClose={() => setShowNotifs(false)} />}
      {showGroupChat && ChatComp  && <ChatComp  currentUserId={user.id} isAdmin={['super_admin', 'admin', 'board_member'].includes(user.role)} onClose={() => setShowGroupChat(false)} />}
      {showDM        && DMComp    && <DMComp    currentUserId={user.id} mode="ops" onClose={() => setShowDM(false)} />}
      {showMeetings  && MeetComp  && <MeetComp  currentUserId={user.id} onClose={() => setShowMeetings(false)} />}
    </>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user,    setUser]    = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        let res = await fetch('/api/auth/me')
        if (res.status === 401) { const r = await fetch('/api/auth/refresh', { method: 'POST' }); if (r.ok) res = await fetch('/api/auth/me') }
        if (!res.ok) { router.push('/login'); return }
        const data = await res.json()
        if (!INTERNAL_ROLES.includes(data.role)) { router.push('/dashboard'); return }
        if (data.role === 'admin' && !data.is_approved) { router.push('/dashboard?pending=1'); return }
        setUser(data)
      } catch { router.push('/login') }
      finally { setLoading(false) }
    }
    fetchUser()
  }, [router])

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {[0,1,2].map(i => <div key={i} className="skeleton" style={{ width: 8, height: 8, borderRadius: '50%', animationDelay: `${i * 200}ms` }} />)}
        </div>
        <p className="text-caption" style={{ color: 'var(--color-ink-muted)' }}>Loading staff portal…</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-canvas)' }}>
      <SessionInactivityGuard redirectTo="/login?timeout=1" />
      <AdminSidebar user={user} />
      <main style={{ marginLeft: 232 /* matches AdminSidebar width */, minHeight: '100vh' }} className="admin-main">
        <TopBar user={user} />
        <div style={{ padding: '24px 28px' }} className="admin-content">
          {children}
        </div>
      </main>

      <style>{`
        @media (max-width: 1024px) {
          .admin-main    { margin-left: 0 !important; }
          .admin-content { padding: 20px 16px !important; }
        }
      `}</style>
    </div>
  )
}
