'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const PILLAR_CONFIG: Record<string, { title: string; subtitle: string; icon: string; accentColor: string }> = {
  campus:     { title: 'Campus Saarthi',     subtitle: 'Empowering Students',        icon: '🎓', accentColor: '#818cf8' },
  digital:    { title: 'Digital Saarthi',    subtitle: 'Content & Presence',          icon: '💻', accentColor: '#a78bfa' },
  calling:    { title: 'Calling Saarthi',    subtitle: 'Voice-First Outreach',         icon: '📞', accentColor: '#f97316' },
  government: { title: 'Govt Saarthi',       subtitle: 'Public Sector Excellence',     icon: '🏛️', accentColor: '#22c55e' },
  market:     { title: 'Market Saarthi',     subtitle: 'On-Ground Presence',           icon: '🗺️', accentColor: '#fbbf24' },
}

function LoginContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const pillar       = searchParams.get('pillar')

  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [pending, setPending] = useState(false)

  const cfg = pillar ? PILLAR_CONFIG[pillar] : null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setPending(false)
    const fd = new FormData(e.currentTarget)
    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:    fd.get('email'),
          password: fd.get('password'),
          remember: fd.get('remember') === 'on',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.pending) { setPending(true) }
        else              { setError(data.error || 'Login failed') }
        setLoading(false)
        return
      }
      const role = data.user?.role
      if (['super_admin', 'board_member', 'admin', 'pillar_member'].includes(role)) {
        setError('Internal staff must use the Staff Portal.')
        await fetch('/api/auth/logout', { method: 'POST' })
        setLoading(false)
        return
      }
      if (['customer', 'vendor'].includes(role) && pillar) {
        setError('This portal is for Saarthi members. Use the main login.')
        await fetch('/api/auth/logout', { method: 'POST' })
        setLoading(false)
        return
      }
      if (['campus', 'digital', 'calling', 'government', 'market'].includes(role) && role !== pillar) {
        setError(`Please log in through the ${role.charAt(0).toUpperCase() + role.slice(1)} Saarthi portal.`)
        await fetch('/api/auth/logout', { method: 'POST' })
        setLoading(false)
        return
      }
      if (role === 'vendor') {
        router.push(data.user?.is_approved ? '/vendor' : '/vendor-apply')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-canvas)', display: 'flex', alignItems: 'stretch' }}>

      {/* ── Left panel: brand / headline ───────────────────── */}
      <div className="login-left" style={{
        flex: 1,
        padding: '64px 48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRight: '1px solid var(--color-hairline-soft)',
      }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 64 }}>
          <Image src="/images/karyasaarthi.png" alt="Karya Saarthi" width={24} height={24} style={{ borderRadius: 4 }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.4px' }}>Karya Saarthi</span>
        </Link>

        {cfg ? (
          <>
            <p style={{ fontSize: 40, marginBottom: 24 }}>{cfg.icon}</p>
            <h1 className="text-display-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)', marginBottom: 16 }}>
              {cfg.title}
            </h1>
            <p className="text-body-lg" style={{ color: 'var(--color-ink-muted)', maxWidth: 340 }}>
              {cfg.subtitle} — sign in to access your Saarthi dashboard.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-display-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)', marginBottom: 16 }}>
              Welcome back
            </h1>
            <p className="text-body-lg" style={{ color: 'var(--color-ink-muted)', maxWidth: 360 }}>
              Sign in to track your projects, communicate with specialists, and manage your account.
            </p>
          </>
        )}

        <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {['500+ active projects', '98% satisfaction rate', 'Real-time progress tracking'].map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-semantic-success)', flexShrink: 0 }} />
              <span className="text-body-sm" style={{ color: 'var(--color-ink-muted)' }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel: form ───────────────────────────────── */}
      <div className="login-right" style={{
        width: 460,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '64px 48px',
      }}>
        <div className="mobile-logo">
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 32 }}>
            <Image src="/images/karyasaarthi.png" alt="Karya Saarthi" width={24} height={24} style={{ borderRadius: 4 }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.4px' }}>Karya Saarthi</span>
          </Link>
        </div>

        <div style={{ marginBottom: 36 }}>
          <h2 className="text-display-md" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)', marginBottom: 8 }}>Sign in</h2>
          <p className="text-body" style={{ color: 'var(--color-ink-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link href={`/signup${pillar ? `?pillar=${pillar}` : ''}`} style={{ color: 'var(--color-accent-blue)', textDecoration: 'none', fontWeight: 500 }}>
              Create one
            </Link>
          </p>
          <p className="text-body-sm" style={{ color: 'var(--color-ink-muted)', marginTop: 6 }}>
            Applying as a Vendor?{' '}
            <Link href="/vendor-apply" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 500 }}>
              Complete Application →
            </Link>
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{ backgroundColor: '#1a0808', border: '1px solid #7f1d1d', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 20 }}>
            <p className="text-body-sm" style={{ color: '#fca5a5' }}>⚠ {error}</p>
          </div>
        )}
        {pending && (
          <div style={{ backgroundColor: '#1a1200', border: '1px solid #78350f', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 20 }}>
            <p className="text-body-sm" style={{ color: '#fde68a' }}>⏳ Your registration is pending approval. You'll be notified by email.</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label htmlFor="email" className="text-body-sm" style={{ color: 'var(--color-ink-muted)', display: 'block', marginBottom: 6 }}>Email</label>
            <input
              id="email" type="email" name="email" required autoFocus
              placeholder="name@example.com"
              className="ks-input"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-body-sm" style={{ color: 'var(--color-ink-muted)', display: 'block', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password" type={showPw ? 'text' : 'password'} name="password" required
                placeholder="Enter your password"
                className="ks-input"
                style={{ paddingRight: 48 }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ink-muted)',
                  fontSize: 16, lineHeight: 1,
                }}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" name="remember" style={{ accentColor: 'var(--color-accent-blue)', width: 14, height: 14 }} />
              <span className="text-body-sm" style={{ color: 'var(--color-ink-muted)' }}>Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-body-sm" style={{ color: 'var(--color-accent-blue)', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ justifyContent: 'center', marginTop: 4, width: '100%', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-hairline-soft)' }} />
          <span className="text-micro" style={{ color: 'var(--color-ink-muted)' }}>or contact us</span>
          <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-hairline-soft)' }} />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <a href="https://wa.me/918595025753" target="_blank" rel="noopener noreferrer"
            className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}>
            💬 WhatsApp
          </a>
          <a href="tel:+918595025753"
            className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}>
            📞 Call
          </a>
        </div>


      </div>

      <style>{`
        .mobile-logo { display: none; }
        @media (max-width: 810px) {
          .login-left { display: none !important; }
          .login-right { width: 100% !important; max-width: 460px; margin: 0 auto; padding: 40px 24px !important; }
          .mobile-logo { display: block; }
        }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: 320, height: 400, borderRadius: 'var(--radius-xl)' }} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}

