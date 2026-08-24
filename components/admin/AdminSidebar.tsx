'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect }
 from 'react'

interface UserData {
  id: number
  fullname: string
  email: string
  role: string
  department: string | null
  pillar_role?: string | null
  is_approved: boolean
  avatar_url?: string | null
}

interface NavItem {
  icon: string
  label: string
  href: string
  badge?: number
  subItems?: { icon: string; label: string; href: string }[]
}

interface NavGroup {
  title: string
  items: NavItem[]
  roles?: string[]
  departments?: string[]
}

function buildNavGroups(user: UserData): NavGroup[] {
  const isSuperAdmin = user.role === 'super_admin'
  const isBoard = user.role === 'board_member'
  const isPillar = user.role === 'pillar_member'
  const isAllSaarthi = user.role === 'admin' && user.department === 'all_saarthi'
  const dept = user.department
  const pillar = user.pillar_role

  const all: NavGroup[] = []

  // ── Super Admin: Overview ──────────────────────────
  if (isSuperAdmin) {
    all.push({
      title: 'Overview',
      items: [
        { icon: '📊', label: 'Dashboard', href: '/admin' },
        { icon: '👑', label: 'Board View', href: '/admin/board' },
        { icon: '📈', label: 'Analytics', href: '/admin/analytics' },
      ],
    })
  }

  // ── All Saarthi Head: Overview ──────────────────────
  if (isSuperAdmin || isAllSaarthi) {
    all.push({
      title: 'All Saarthi Head',
      items: [
        { icon: '🏰', label: 'All Saarthi Hub', href: '/admin/all-saarthi' },
        { icon: '👤', label: 'User Directory', href: '/admin/users' },
      ],
    })
  }

  // ── Board of Directors ─────────────────────────────
  if (isSuperAdmin || isBoard) {
    all.push({
      title: 'Board of Directors',
      items: [
        { icon: '💰', label: 'Revenue & P&L', href: '/admin/board' },
        { icon: '🎯', label: 'KPI Tracking', href: '/admin/board?tab=kpi' },
        { icon: '📊', label: 'Pillar Performance', href: '/admin/board?tab=pillars' },
        { icon: '📄', label: 'Investor Reports', href: '/admin/board?tab=reports' },
        { icon: '⚖️', label: 'Legal & Policy', href: '/admin/board?tab=mou' },
        { icon: '🗓️', label: 'Board Meetings', href: '/admin/board/meetings' },
        { icon: '🌐', label: 'About Us Page', href: '/admin/board?tab=about' },
      ],
    })
  }


  // ── CRM ────────────────────────────────────────────
  if (isSuperAdmin || dept === 'operations' || dept === 'marketing') {
    all.push({
      title: 'CRM',
      items: [
        { icon: '🎯', label: 'Lead Pipeline', href: '/admin/crm' },
        { icon: '👤', label: 'Clients', href: '/admin/users' },
        { icon: '📞', label: 'Call Logs', href: '/admin/pillars/calling' },
      ],
    })
  }

  // ── Projects ────────────────────────────────────────
  if (isSuperAdmin) {
    all.push({
      title: 'Projects',
      items: [
        { icon: '📋', label: 'Project Board', href: '/admin/projects' },
        { icon: '📩', label: 'New Requests', href: '/admin/requests' },
        { icon: '🏪', label: 'Vendors', href: '/admin/vendors' },
      ],
    })
  } else if (dept === 'operations') {
    all.push({
      title: 'Projects',
      items: [
        { icon: '🏪', label: 'Vendors', href: '/admin/vendors' },
      ],
    })
  }

  // ── Finance ─────────────────────────────────────────
  if (isSuperAdmin || dept === 'finance') {
    all.push({
      title: 'Finance',
      items: [
        { icon: '💵', label: 'Revenue Dashboard', href: '/admin/finance' },
        { icon: '🧾', label: 'Invoices', href: '/admin/finance/invoices' },
        { icon: '⚠️', label: 'Pending Payments', href: '/admin/finance/pending' },
      ],
    })
  }

  // ── Marketing ──────────────────────────────────────
  if (isSuperAdmin || dept === 'marketing') {
    all.push({
      title: 'Marketing',
      items: [
        { icon: '⚡', label: 'Saarthi Xpress', href: '/admin/marketing?tab=saarthi_xpress' },
        { icon: '📣', label: 'Campaign Planner', href: '/admin/marketing?tab=campaigns' },
        { icon: '📊', label: 'Lead Source Analytics', href: '/admin/marketing?tab=leads' },
        { icon: '📅', label: 'Content Calendar', href: '/admin/marketing?tab=calendar' },
        { icon: '📨', label: 'Bulk Outreach', href: '/admin/marketing/outreach' },
        { icon: '🤝', label: 'Referral Manager', href: '/admin/marketing?tab=referral' },
        { icon: '🎪', label: 'Event Creation', href: '/admin/marketing?tab=events' },
        { icon: '🔍', label: 'Competitor Intel', href: '/admin/marketing?tab=competitor' },
        { icon: '🎨', label: 'Brand Assets', href: '/admin/marketing?tab=brand' },
        { icon: '📝', label: 'Blog Editor', href: '/admin/blogs' },
      ],
    })
  }

  // ── Digital Saarthi ────────────────────────────────
  if (isSuperAdmin || dept === 'digital' || (user.role === 'admin' && pillar === 'digital')) {
    all.push({
      title: 'Digital Saarthi',
      items: [
        { icon: '💻', label: 'Digital Dashboard', href: '/admin/digital' },
      ],
    })
  }

  // ── Staff Management (Super Admin only — replaces HR) ────
  if (isSuperAdmin || isBoard) {
    all.push({
      title: 'Staff Management',
      items: [
        { icon: '👥', label: 'Team Directory', href: '/admin/staff' },
        { icon: '💰', label: 'Payroll', href: '/admin/staff?tab=payroll' },
        { icon: '⭐', label: 'Appraisals', href: '/admin/staff?tab=appraisals' },
        { icon: '🏖️', label: 'Leaves & Attendance', href: '/admin/staff?tab=leaves' },
      ],
    })
  }

  // ── 5 Pillars ──────────────────────────────────────
  if (isSuperAdmin || isPillar) {
    const pillarItems = isSuperAdmin ? [
      { icon: '🎓', label: 'Campus Saarthi', href: '/admin/pillars/campus' },
      { icon: '💻', label: 'Digital Saarthi', href: '/admin/pillars/digital' },
      { icon: '📞', label: 'Calling Saarthi', href: '/admin/pillars/calling' },
      { icon: '🏛️', label: 'Government Saarthi', href: '/admin/pillars/government' },
      { icon: '🗺️', label: 'Market Saarthi', href: '/admin/pillars/market' },
    ] : [
      { icon: '🌟', label: `${pillar?.charAt(0).toUpperCase()}${pillar?.slice(1)} Saarthi`, href: `/admin/pillars/${pillar}` },
    ]

    all.push({ title: 'Saarthi Pillars', items: pillarItems })
  }

  // ── Operations ──────────────────────────────────────────
  const isProjectManager = dept === 'operations' && pillar === 'project_manager'
  if (isSuperAdmin || (dept === 'operations' && !isProjectManager)) {
    all.push({
      title: 'Operations Management',
      items: [
        { icon: '⚙️', label: 'Operations Board', href: '/admin/operations' },
        { icon: '🛒', label: 'Services Manager', href: '/admin/operations?tab=services' },
        { icon: '📬', label: 'Contact Leads', href: '/admin/operations?tab=contact_leads' },
        { icon: '📧', label: 'Subscribers', href: '/admin/operations?tab=subscribers' },
      ],
    })
  }

  // ── My Profile — visible to ALL staff ──────────────
  all.push({
    title: 'My Account',
    items: [
      { icon: '👤', label: 'My Profile & Docs', href: '/admin/profile' },
      { icon: '🏖️', label: 'My Leave', href: '/admin/profile?tab=leaves' },
      { icon: '⭐', label: 'My Appraisals', href: '/admin/profile?tab=appraisals' },
    ],
  })

  // ── Shared Workspace — visible to ALL staff ──────────
  all.push({
    title: 'Shared Tools',
    items: [
      { icon: '📁', label: 'Team Workspace', href: '/admin/workspace' },
      { icon: '🤖', label: 'Internal AI Chatbot', href: '/admin/chatbot' },
      { icon: '📨', label: 'Newsletter Subscribers', href: '/admin/newsletter' },
    ],
  })

  // ── Super Admin only: Settings & Access ─────────────
  if (isSuperAdmin) {
    all.push({
      title: 'Platform',
      items: [
        { icon: '👤', label: 'All Users', href: '/admin/users' },
        { icon: '📩', label: 'Staff Requests', href: '/admin/staff-requests' },
        { icon: '📢', label: 'Announcements', href: '/admin/announcements' },
        { icon: '⚙️', label: 'Settings', href: '/admin/settings' },
      ],
    })
  }

  return all
}

export default function AdminSidebar({ user }: { user: UserData }) {
  const pathname = usePathname()
  const router = useRouter()
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['Overview', 'CRM', 'Projects']))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifications, setNotifications] = useState(0)

  const navGroups = buildNavGroups(user)

  useEffect(() => {
    // Auto-expand group containing current path (strip query params before comparing)
    navGroups.forEach(group => {
      if (group.items.some(item => {
        const itemPath = item.href.split('?')[0]
        return pathname === itemPath || pathname.startsWith(itemPath + '/')
      })) {
        setExpanded(prev => new Set([...prev, group.title]))
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const toggleGroup = (title: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(title) ? next.delete(title) : next.add(title)
      return next
    })
  }

  const isActive = (href: string) => {
    // Strip query params for comparison
    const hrefPath = href.split('?')[0]
    if (hrefPath === '/admin') return pathname === '/admin'
    return pathname === hrefPath || pathname.startsWith(hrefPath + '/')
  }

  // Handle navigation — for same-pathname links (tab switches), use router.push without full remount
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const hrefPath = href.split('?')[0]
    // If we're already on this base path, prevent Link default and use push
    if (pathname === hrefPath) {
      e.preventDefault()
      router.push(href, { scroll: false })
    }
    setMobileOpen(false)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const getRoleBadge = () => {
    if (user.role === 'super_admin') return { label: '👑 Super Admin', color: '#FF6B35' }
    if (user.role === 'board_member') return { label: '🏦 Board Member', color: '#8B5CF6' }
    if (user.role === 'pillar_member') return { label: `🌟 ${user.pillar_role} Saarthi`, color: '#10B981' }
    if (user.role === 'admin' && user.department === 'all_saarthi') return { label: '👑 All Saarthi Head', color: '#FF6B35' }
    if (user.role === 'admin') return { label: `⚙️ ${user.department?.toUpperCase()} Admin`, color: '#3B82F6' }
    return { label: user.role, color: '#6B7280' }
  }

  const roleBadge = getRoleBadge()

  const sidebarInner = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Logo */}
      <div style={{ padding: '18px 16px', borderBottom: '1px solid var(--color-hairline-soft)', flexShrink: 0 }}>
        <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
            <Image src="/images/karyasaarthi.png" alt="Logo" width={28} height={28} style={{ width: '100%', height: '100%', objectFit: 'cover', }} />
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--color-ink)', fontSize: 13, letterSpacing: '-0.3px' }}>KaryaSaarthi</span>
            <p style={{ color: 'var(--color-ink-muted)', fontSize: 10, marginTop: 1 }}>Enterprise Platform</p>
          </div>
        </Link>
      </div>

      {/* User card */}
      <div style={{ margin: '10px 10px', padding: 10, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-hairline-soft)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0, backgroundColor: roleBadge.color }}>
            {user.fullname.charAt(0)}
          </div>
          <div style={{ minWidth: 0 }}>
            <p className="text-body-sm" style={{ color: 'var(--color-ink)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.fullname}</p>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 'var(--radius-pill)', backgroundColor: `${roleBadge.color}25`, color: roleBadge.color }}>{roleBadge.label}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 8px', minHeight: 0 }} className="scrollbar-thin">
        {navGroups.map(group => (
          <div key={group.title} style={{ marginBottom: 4 }}>
            <button
              onClick={() => toggleGroup(group.title)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '6px 10px', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
                color: 'var(--color-ink-muted)', transition: 'color var(--dur-fast)',
              }}
            >
              <span>{group.title}</span>
              <span style={{ transform: expanded.has(group.title) ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform var(--dur-normal) var(--ease-out)', fontSize: 14, lineHeight: 1 }}>›</span>
            </button>

            <div style={{
              display: 'grid',
              gridTemplateRows: expanded.has(group.title) ? '1fr' : '0fr',
              transition: 'grid-template-rows var(--dur-normal) var(--ease-out)',
              overflow: 'hidden',
            }}>
              <div style={{ overflow: 'hidden' }}>
                {group.items.map((item, idx) => (
                  <Link
                    key={`${group.title}-${item.label}-${idx}`}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 10px', borderRadius: 'var(--radius-md)',
                      marginBottom: 2, textDecoration: 'none',
                      fontSize: 12, fontWeight: isActive(item.href) ? 600 : 400,
                      color: isActive(item.href) ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                      backgroundColor: isActive(item.href) ? 'var(--color-surface-2)' : 'transparent',
                      borderLeft: isActive(item.href) ? '2px solid var(--color-accent-blue)' : '2px solid transparent',
                      transition: 'background-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{item.icon}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{item.label}</span>
                    {item.badge ? (
                      <span style={{ marginLeft: 'auto', padding: '1px 5px', borderRadius: 'var(--radius-pill)', fontSize: 9, fontWeight: 700, backgroundColor: '#ef4444', color: '#fff' }}>{item.badge}</span>
                    ) : null}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '8px 8px 14px', borderTop: '1px solid var(--color-hairline-soft)', flexShrink: 0 }}>
        <Link href="/" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: 12, color: 'var(--color-ink-muted)' }}>
          <span>🌐</span> View Website
        </Link>
        <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 'var(--radius-md)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, color: '#f87171' }}>
          <span>🚪</span> Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside style={{ width: 232, height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 30, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'var(--color-surface-1)', borderRight: '1px solid var(--color-hairline-soft)' }}
        className="admin-sidebar-desktop">
        {sidebarInner}
      </aside>

      {/* Mobile toggle button */}
      <button
        style={{ position: 'fixed', top: 16, left: 16, zIndex: 50, width: 40, height: 40, borderRadius: 'var(--radius-md)', display: 'none', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-surface-1)', border: '1px solid var(--color-hairline)', color: 'var(--color-ink)', cursor: 'pointer' }}
        className="admin-mobile-toggle"
        onClick={() => setMobileOpen(v => !v)}
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40, backgroundColor: 'rgba(0,0,0,0.7)' }} onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside
        style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 260, zIndex: 50, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'var(--color-surface-1)', borderRight: '1px solid var(--color-hairline)', transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform var(--dur-slow) var(--ease-out)' }}
        className="admin-sidebar-mobile"
      >
        {sidebarInner}
      </aside>

      <style>{`
        @media (max-width: 1024px) {
          .admin-sidebar-desktop { display: none !important; }
          .admin-mobile-toggle   { display: flex !important; }
        }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: var(--color-hairline); border-radius: 2px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: var(--color-ink-muted); }
        .scrollbar-thin { scrollbar-width: thin; scrollbar-color: var(--color-hairline) transparent; }
      `}</style>
    </>
  )
}
