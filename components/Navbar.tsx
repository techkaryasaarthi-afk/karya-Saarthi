'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Blogs', href: '/blogs' },
  { label: 'Contact', href: '/contact' },
]



interface AuthUser {
  id: number
  fullname: string
  role: string
}

export default function Navbar() {
  const [scrolled,          setScrolled]          = useState(false)
  const [mobileOpen,        setMobileOpen]        = useState(false)

  const [user,              setUser]              = useState<AuthUser | null>(null)
  const [authChecked,       setAuthChecked]       = useState(false)

  const pathname    = usePathname()
  const router      = useRouter()


  /* ── Scroll detection ─────────────────────────────────────── */
  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])



  /* ── Close menus on route change ─────────────────────────── */
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  /* ── Scroll lock when mobile open ────────────────────────── */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  /* ── Auth check ──────────────────────────────────────────── */
  useEffect(() => {
    const checkAuth = async () => {
      try {

        let res = await fetch('/api/auth/me')
        if (res.status === 401) {
          const r = await fetch('/api/auth/refresh', { method: 'POST' })
          if (r.ok) res = await fetch('/api/auth/me')
        }
        if (res.ok) {
          const data = await res.json()
          setUser({ id: data.id, fullname: data.fullname, role: data.role })
        }
      } catch { /* silent */ }
      setAuthChecked(true)
    }
    checkAuth()
  }, [pathname])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/')
  }

  const getDashboardLink = () => {
    if (!user) return '/dashboard'
    if (user.role === 'super_admin' || user.role === 'admin') return '/admin'
    if (user.role === 'vendor') return '/vendor'
    return '/dashboard'
  }

  return (
    <>
      {/* ── Top Nav Bar ─────────────────────────────────────── */}
      <nav
        className="top-nav fixed top-0 left-0 right-0 z-50"
        style={{
          borderBottomColor: scrolled
            ? 'var(--color-hairline-soft)'
            : 'transparent',
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
          transition: 'border-color 200ms var(--ease-out)',
        }}
        aria-label="Main navigation"
      >
        <div style={{ maxWidth: '1199px', margin: '0 auto', padding: '0 var(--space-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>

            {/* Logo */}
            <Link
              href="/"
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', textDecoration: 'none' }}
              aria-label="Karya Saarthi home"
            >
              <Image
                src="/images/karyasaarthi.png"
                alt="Karya Saarthi logo"
                width={28}
                height={28}
                style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)' }}
                priority
              />
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: 600,
                  letterSpacing: '-0.5px',
                  color: 'var(--color-ink)',
                }}
              >
                Karya Saarthi
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div
              className="nav-links-desktop"
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xxs)' }}
            >
              {navLinks.map(link => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: 'var(--text-body-sm-size)',
                      fontWeight: 'var(--text-body-sm-weight)',
                      letterSpacing: 'var(--text-body-sm-ls)',
                      color: isActive ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                      textDecoration: 'none',
                      transition: 'color var(--dur-fast) var(--ease-out), background-color var(--dur-fast) var(--ease-out)',
                      backgroundColor: isActive ? 'var(--color-surface-1)' : 'transparent',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--color-ink)'
                    }}
                    onMouseLeave={e => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--color-ink-muted)'
                    }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>

            {/* Desktop CTAs */}
            <div
              className="nav-ctas-desktop"
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}
            >
              {authChecked && user ? (
                <>
                  <Link href={getDashboardLink()} className="btn-primary" style={{ fontSize: 13 }}>
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn-secondary"
                    style={{ fontSize: 13, cursor: 'pointer' }}
                  >
                    Logout
                  </button>
                </>
              ) : authChecked ? (
                <>
                  {/* Customer / Vendor Login */}
                  <Link href="/login" className="btn-secondary" style={{ fontSize: 13 }}>
                    Sign in
                  </Link>
                  
                  {/* Primary CTA */}
                  <Link href="/signup" className="btn-primary" style={{ fontSize: 13 }}>
                    Get Started
                  </Link>
                </>
              ) : (
                /* Auth loading skeleton */
                <div style={{ display: 'flex', gap: 8 }}>
                  <div className="skeleton" style={{ width: 70, height: 36, borderRadius: 'var(--radius-pill)' }} />
                  <div className="skeleton" style={{ width: 90, height: 36, borderRadius: 'var(--radius-pill)' }} />
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="btn-icon nav-hamburger"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                {mobileOpen ? (
                  <>
                    <line x1="2" y1="2" x2="16" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      style={{ transition: 'all var(--dur-normal) var(--ease-out)' }} />
                    <line x1="16" y1="2" x2="2" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      style={{ transition: 'all var(--dur-normal) var(--ease-out)' }} />
                  </>
                ) : (
                  <>
                    <line x1="2" y1="5" x2="16" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="2" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="2" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Overlay ───────────────────────────────────── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 48,
          }}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile Drawer ─────────────────────────────────────  */}
      <div
        className={`mobile-drawer${mobileOpen ? ' open' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(320px, 85vw)',
          backgroundColor: 'var(--color-surface-1)',
          zIndex: 49,
          overflowY: 'auto',
          paddingTop: '80px',
        }}
        aria-label="Mobile menu"
        role="dialog"
        aria-modal="true"
      >
        {/* Nav links */}
        <nav style={{ padding: '0 var(--space-sm)' }}>
          {navLinks.map(link => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'block',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 4,
                  fontSize: 'var(--text-body-size)',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                  textDecoration: 'none',
                  backgroundColor: isActive ? 'var(--color-surface-2)' : 'transparent',
                  transition: 'background-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* CTAs */}
        <div style={{ padding: 'var(--space-lg) var(--space-sm)', borderTop: '1px solid var(--color-hairline-soft)', marginTop: 'var(--space-md)' }}>
          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href={getDashboardLink()} onClick={() => setMobileOpen(false)} className="btn-primary" style={{ textAlign: 'center', justifyContent: 'center' }}>
                Dashboard
              </Link>
              <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="btn-secondary" style={{ cursor: 'pointer', justifyContent: 'center' }}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href="/signup" onClick={() => setMobileOpen(false)} className="btn-primary" style={{ textAlign: 'center', justifyContent: 'center' }}>
                Get Started
              </Link>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-secondary" style={{ textAlign: 'center', justifyContent: 'center' }}>
                Sign in
              </Link>


            </div>
          )}
        </div>
      </div>

      {/* ── Responsive CSS ───────────────────────────────────── */}
      <style>{`
        .nav-hamburger { display: none; }
        @media (max-width: 810px) {
          .nav-links-desktop { display: none !important; }
          .nav-ctas-desktop  { display: none !important; }
          .nav-hamburger     { display: flex !important; }
        }
      `}</style>
    </>
  )
}
