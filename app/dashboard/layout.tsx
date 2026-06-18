'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SessionInactivityGuard from '@/components/SessionInactivityGuard'
import Navbar from '@/components/Navbar'
import DashboardSidebar from '@/components/DashboardSidebar'
import DirectChatPanel from '@/components/admin/DirectChatPanel'
import { fetchWithAuth } from '@/lib/auth/fetchWithAuth'

interface UserData { id: number; fullname: string; email: string; role: string; department: string | null; is_approved: boolean; user_type: string }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDMPanel, setShowDMPanel] = useState(false)

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

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        {[0,1,2].map(i => <div key={i} className="skeleton" style={{ width: 8, height: 8, borderRadius: '50%', animationDelay: `${i*200}ms` }} />)}
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-canvas)' }}>
      <SessionInactivityGuard redirectTo="/login?timeout=1" />
      <Navbar />
      <div style={{ display: 'flex', paddingTop: '56px' }}>
        <DashboardSidebar onChatSupportClick={() => setShowDMPanel(v => !v)} />
        <main style={{ flex: 1, marginLeft: 232, padding: '32px 28px', minHeight: 'calc(100vh - 56px)' }} className="dash-main">
          {children}
        </main>
      </div>
      {showDMPanel && (
        <DirectChatPanel currentUserId={user.id} mode="user" onClose={() => setShowDMPanel(false)} />
      )}
      <style>{`
        @media (max-width: 768px) {
          .dash-sidebar { display: none !important; }
          .dash-main { margin-left: 0 !important; padding: 20px 16px !important; padding-top: 72px !important; }
          .dash-mobile-header { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
