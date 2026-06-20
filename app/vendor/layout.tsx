'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import SessionInactivityGuard from '@/components/SessionInactivityGuard'

interface UserData { id: number; fullname: string; email: string; role: string }

const IconGrid = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
const IconFolder = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
const IconSettings = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
const IconGlobe = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
const IconLogout = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>

const NAV = [
  { icon: <IconGrid />, label: 'Dashboard', href: '/vendor' },
  { icon: <IconFolder />, label: 'My Projects', href: '/vendor/projects' },
  { icon: <IconSettings />, label: 'Settings', href: '/vendor/settings' },
]

function Sidebar({ user, pathname, onClose }: { user: UserData; pathname: string; onClose?: () => void }) {
  const router = useRouter()
  const handleLogout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/') }
  const initials = user.fullname.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#111111', borderRight:'1px solid rgba(255,255,255,0.07)', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, width:2, height:'100%', background:'linear-gradient(180deg,#22c55e 0%,#16a34a 60%,transparent 100%)' }} />
      <div style={{ padding:'20px 20px 16px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:10 }}>
        <Image src="/images/karyasaarthi.png" alt="Logo" width={26} height={26} style={{ borderRadius:8 }} />
        <div>
          <p style={{ fontSize:13, fontWeight:700, color:'#fff', letterSpacing:'-0.3px', lineHeight:1.2 }}>Karya Saarthi</p>
          <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', padding:'2px 7px', borderRadius:100, background:'rgba(34,197,94,0.12)', color:'#22c55e', display:'inline-block', marginTop:2 }}>Vendor</span>
        </div>
      </div>
      <nav style={{ flex:1, padding:'10px 10px' }}>
        {NAV.map(item => {
          const active = pathname === item.href || (item.href !== '/vendor' && pathname?.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} onClick={onClose} style={{ display:'flex', alignItems:'center', gap:9, padding:'9px 12px', borderRadius:9, marginBottom:2, textDecoration:'none', fontSize:13, fontWeight:active?600:400, color:active?'#fff':'rgba(255,255,255,0.4)', background:active?'rgba(255,255,255,0.07)':'transparent', borderLeft:`2px solid ${active?'#22c55e':'transparent'}`, paddingLeft:10, transition:'all 140ms ease' }}>
              <span style={{ color:active?'#22c55e':'rgba(255,255,255,0.3)', flexShrink:0, display:'flex' }}>{item.icon}</span>{item.label}
            </Link>
          )
        })}
      </nav>
      <div style={{ padding:'10px 10px 18px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" onClick={onClose} style={{ display:'flex', alignItems:'center', gap:9, padding:'9px 12px', borderRadius:9, textDecoration:'none', fontSize:13, color:'rgba(255,255,255,0.35)', marginBottom:2 }}>
          <span style={{ display:'flex', flexShrink:0 }}><IconGlobe /></span>View Website
        </Link>
        <button onClick={handleLogout} style={{ width:'100%', display:'flex', alignItems:'center', gap:9, padding:'9px 12px', borderRadius:9, border:'none', background:'transparent', cursor:'pointer', fontSize:13, color:'#f87171', textAlign:'left' }}>
          <span style={{ display:'flex', flexShrink:0 }}><IconLogout /></span>Sign Out
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:9, padding:'10px 12px', borderRadius:9, marginTop:6, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#22c55e,#16a34a)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>{initials}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:12, fontWeight:600, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.fullname}</p>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

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

  if (loading || !user) return (
    <div style={{ minHeight:'100vh', background:'#090909', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
      {[0,1,2].map(i => <div key={i} className="skeleton" style={{ width:8, height:8, borderRadius:'50%', animationDelay:`${i*200}ms` }} />)}
    </div>
  )

  const initials = user.fullname.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div style={{ minHeight:'100vh', background:'#090909' }}>
      <SessionInactivityGuard redirectTo="/login?timeout=1" />

      {/* Desktop sidebar */}
      <aside style={{ width:232, height:'100vh', position:'fixed', top:0, left:0, zIndex:30 }} className="vendor-sidebar-desk">
        <Sidebar user={user} pathname={pathname} />
      </aside>

      {/* Mobile backdrop */}
      {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:40, backdropFilter:'blur(3px)' }} />}

      {/* Mobile drawer */}
      <div style={{ position:'fixed', top:0, left:0, height:'100vh', width:240, zIndex:50, transform:mobileOpen?'translateX(0)':'translateX(-100%)', transition:'transform 260ms cubic-bezier(.4,0,.2,1)' }} className="vendor-drawer">
        <button onClick={() => setMobileOpen(false)} style={{ position:'absolute', top:12, right:10, width:26, height:26, borderRadius:'50%', border:'none', background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:12, zIndex:1 }}>✕</button>
        <Sidebar user={user} pathname={pathname} onClose={() => setMobileOpen(false)} />
      </div>

      {/* Mobile top bar */}
      <header className="vendor-topbar" style={{ display:'none', position:'fixed', top:0, left:0, right:0, height:54, background:'#111111', borderBottom:'1px solid rgba(255,255,255,0.07)', alignItems:'center', justifyContent:'space-between', padding:'0 16px', zIndex:35 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={() => setMobileOpen(true)} style={{ width:34, height:34, borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <Image src="/images/karyasaarthi.png" alt="Logo" width={22} height={22} style={{ borderRadius:6 }} />
          <span style={{ fontSize:13, fontWeight:700, color:'#fff' }}>Vendor Panel</span>
        </div>
        <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#22c55e,#16a34a)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff' }}>{initials}</div>
      </header>

      <main className="vendor-main" style={{ marginLeft:232, minHeight:'100vh', padding:'36px 36px' }}>
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .vendor-sidebar-desk { display: none !important; }
          .vendor-topbar { display: flex !important; }
          .vendor-main { margin-left: 0 !important; padding: 16px !important; padding-top: 70px !important; }
        }
        @media (min-width: 769px) { .vendor-drawer { display: none !important; } }
      `}</style>
    </div>
  )
}
