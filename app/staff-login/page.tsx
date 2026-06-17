'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { STAFF_ROLE_CONFIGS, getDepartmentRoute } from '@/lib/org'

const STAFF_ROLES = STAFF_ROLE_CONFIGS.map(role => ({ value: role.value, label: role.title }))

type RegisterStep = 'form' | 'otp' | 'success'

function RegisterForm() {
  const [form, setForm]         = useState({ fullname: '', email: '', password: '', phone: '', staff_role: '' })
  const [step, setStep]         = useState<RegisterStep>('form')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [otp, setOtp]           = useState(['', '', '', '', '', ''])
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown > 0) { const t = setTimeout(() => setCountdown(c => c - 1), 1000); return () => clearTimeout(t) }
  }, [countdown])

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.staff_role) { setError('Please select a role'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/auth/send-signup-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email, fullname: form.fullname }) })
      const d   = await res.json()
      if (!res.ok) { setError(d.error || 'Failed to send OTP'); setSaving(false); return }
      setStep('otp'); setCountdown(60)
    } catch { setError('Something went wrong') }
    setSaving(false)
  }

  const handleOtpChange = useCallback((index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1)
    if (value && !/^\d$/.test(value)) return
    const newOtp = [...otp]; newOtp[index] = value; setOtp(newOtp)
    if (value && index < 5) document.getElementById(`staff-otp-${index + 1}`)?.focus()
  }, [otp])

  const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) document.getElementById(`staff-otp-${index - 1}`)?.focus()
  }, [otp])

  const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) setOtp(pasted.split(''))
  }, [])

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpStr = otp.join('')
    if (otpStr.length !== 6) { setError('Please enter the complete 6-digit OTP'); return }
    setSaving(true); setError('')
    try {
      const verifyRes  = await fetch('/api/auth/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email, otp: otpStr, purpose: 'signup_verification' }) })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) { setError(verifyData.error || 'OTP verification failed'); setSaving(false); return }
      const res = await fetch('/api/auth/staff-register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, email_verified: true }) })
      const d   = await res.json()
      if (!res.ok) { setError(d.error || 'Registration failed'); setSaving(false); return }
      setStep('success')
    } catch { setError('Something went wrong') }
    setSaving(false)
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/auth/send-signup-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email, fullname: form.fullname }) })
      const d   = await res.json()
      if (!res.ok) { setError(d.error); setSaving(false); return }
      setOtp(['', '', '', '', '', '']); setCountdown(60)
    } catch { setError('Something went wrong') }
    setSaving(false)
  }

  const inputSx = { width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-hairline)', backgroundColor: 'var(--color-surface-2)', color: 'var(--color-ink)', fontSize: 'var(--text-body-sm-size)', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'var(--font-body)' }

  if (step === 'success') return (
    <div style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--radius-lg)', padding: 24, textAlign: 'center' }}>
      <span style={{ fontSize: 36, display: 'block', marginBottom: 10 }}>🎉</span>
      <p style={{ color: '#22c55e', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Registration Submitted!</p>
      <p style={{ color: 'rgba(34,197,94,0.7)', fontSize: 13, lineHeight: 1.6 }}>
        Your email has been verified and your account is pending <strong>Super Admin approval</strong>. You&apos;ll receive an email once approved.
      </p>
      <div style={{ marginTop: 12, backgroundColor: 'rgba(34,197,94,0.08)', borderRadius: 'var(--radius-md)', padding: '8px 12px', color: 'rgba(34,197,94,0.6)', fontSize: 12 }}>
        💡 After approval, log in using the Login tab.
      </div>
    </div>
  )

  if (step === 'otp') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 28, display: 'block', marginBottom: 6 }}>✉️</span>
        <p className="text-body-sm" style={{ color: 'var(--color-ink-muted)' }}>Enter the 6-digit code sent to</p>
        <p className="text-body-sm" style={{ color: 'var(--color-accent-blue)', fontWeight: 600 }}>{form.email}</p>
      </div>
      {error && <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: '#f87171', fontSize: 13 }}>⚠️ {error}</div>}
      <form onSubmit={handleVerifyAndRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }} onPaste={handleOtpPaste}>
          {otp.map((digit, i) => (
            <input key={i} id={`staff-otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit}
              onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKeyDown(i, e)} autoFocus={i === 0}
              style={{ width: 44, height: 52, textAlign: 'center', fontSize: 20, fontWeight: 700, borderRadius: 'var(--radius-md)', border: '2px solid var(--color-hairline)', backgroundColor: 'var(--color-surface-2)', color: 'var(--color-ink)', outline: 'none' }} />
          ))}
        </div>
        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-ink-muted)' }}>
          {countdown > 0 ? <span>Resend in <strong style={{ color: 'var(--color-accent-blue)' }}>{countdown}s</strong></span> :
            <button type="button" onClick={handleResend} disabled={saving} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-accent-blue)', fontWeight: 600 }}>Resend OTP</button>}
        </div>
        <button type="submit" disabled={saving || otp.join('').length !== 6} className="btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: (saving || otp.join('').length !== 6) ? 0.5 : 1, cursor: 'pointer', padding: '12px' }}>
          {saving ? '⏳ Verifying…' : '✅ Verify & Create Account'}
        </button>
        <button type="button" onClick={() => { setStep('form'); setOtp(['', '', '', '', '', '']); setError('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--color-ink-muted)' }}>
          ← Back to form
        </button>
      </form>
    </div>
  )

  return (
    <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {error && <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: '#f87171', fontSize: 13 }}>⚠️ {error}</div>}
      <input required value={form.fullname}  onChange={e => setForm(p => ({ ...p, fullname: e.target.value }))}  placeholder="Full name *"              style={inputSx} />
      <input required type="email" value={form.email}     onChange={e => setForm(p => ({ ...p, email: e.target.value }))}     placeholder="Work email *"             style={inputSx} />
      <input required type="password" minLength={8} value={form.password}  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}  placeholder="Password (min 8 chars) *" style={inputSx} />
      <input value={form.phone}     onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}     placeholder="Phone number"             style={inputSx} />
      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-ink-muted)', marginBottom: 6 }}>Select Your Role *</label>
        <select required value={form.staff_role} onChange={e => setForm(p => ({ ...p, staff_role: e.target.value }))} style={{ ...inputSx, cursor: 'pointer' }}>
          <option value="">Choose a role…</option>
          {STAFF_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>
      <div style={{ backgroundColor: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 12, color: 'rgba(251,191,36,0.8)' }}>
        ℹ️ After email verification, your account will be reviewed by the Super Admin.
      </div>
      <button type="submit" disabled={saving} className="btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: saving ? 0.5 : 1, cursor: 'pointer', padding: '12px' }}>
        {saving ? '⏳ Sending OTP…' : '📧 Verify Email & Register'}
      </button>
    </form>
  )
}

export default function StaffLoginPage() {
  const router  = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [pending,      setPending]      = useState(false)
  const [activeTab,    setActiveTab]    = useState<'login' | 'register'>('login')

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setLoading(true); setError(''); setPending(false)
    const formData = new FormData(e.currentTarget)
    try {
      const res  = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: formData.get('email'), password: formData.get('password'), remember: true }) })
      const data = await res.json()
      if (!res.ok) {
        if (data.pending) { setPending(true) }
        else if (data.error?.includes('customer') || data.error?.includes('vendor')) { setError('This portal is for staff only. Please use the main login page.') }
        else { setError(data.error || 'Login failed') }
        setLoading(false); return
      }
      const role = data.user?.role; const dept = data.user?.department; const pillarRole = data.user?.pillar_role
      if (['customer', 'vendor', 'campus', 'digital', 'calling', 'government', 'market'].includes(role)) {
        setError('This portal is for internal team only.'); await fetch('/api/auth/logout', { method: 'POST' }); setLoading(false); return
      }
      if (role === 'super_admin')      router.push('/admin')
      else if (role === 'board_member')                                           router.push('/admin/board')
      else if (role === 'pillar_member' && pillarRole)                            router.push(`/admin/pillars/${pillarRole}`)
      else if (role === 'admin' && dept)                                          router.push(getDepartmentRoute(dept, pillarRole))
      else                                                                        router.push('/admin')
    } catch { setError('Something went wrong. Please try again.'); setLoading(false) }
  }

  const inputSx: React.CSSProperties = { display: 'block', width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-hairline)', backgroundColor: 'var(--color-surface-2)', color: 'var(--color-ink)', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none' }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-canvas)', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      {/* Background grid */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(var(--color-ink-muted) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink-muted) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

      {/* Subtle glow orbs */}
      <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,153,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} className="animate-spotlight-breathe" />
      <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,53,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Top nav links */}
      <Link href="/" style={{ position: 'absolute', top: 24, left: 24, zIndex: 20, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-hairline)', color: 'var(--color-ink-muted)', fontSize: 13, textDecoration: 'none', backgroundColor: 'var(--color-surface-1)' }}>
        ← Public Website
      </Link>
      <Link href="/login" style={{ position: 'absolute', top: 24, right: 24, zIndex: 20, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-hairline)', color: 'var(--color-accent-blue)', fontSize: 13, textDecoration: 'none', backgroundColor: 'rgba(0,153,255,0.08)' }}>
        Customer Login →
      </Link>

      {/* Left branding panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 48px', borderRight: '1px solid var(--color-hairline-soft)' }} className="staff-login-brand">
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, overflow: 'hidden', margin: '0 auto 24px', position: 'relative' }}>
            <Image src="/images/karyasaarthi.png" alt="Karya Saarthi" width={72} height={72} style={{ width: '100%', height: '100%', objectFit: 'cover', }} />
            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderRadius: '50%', backgroundColor: '#22c55e', border: '2px solid var(--color-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#fff' }} />
            </div>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 10, letterSpacing: '-0.5px' }}>Staff Portal</h1>
          <p style={{ color: 'var(--color-ink-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
            Karya Saarthi internal access for team members, admins, and board directors.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['🔐 Role-based access control', '👥 Team collaboration tools', '📊 Real-time analytics', '🛡️ Enterprise-grade security'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-1)', border: '1px solid var(--color-hairline-soft)' }}>
                <span style={{ fontSize: 13, color: 'var(--color-ink)', fontWeight: 500 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ width: 440, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 40px' }} className="staff-login-form">
        <div style={{ width: '100%', maxWidth: 380 }}>
          {/* Top stripe */}
          <div style={{ height: 2, borderRadius: 1, background: 'linear-gradient(90deg, var(--color-accent-blue), var(--color-ink-muted))', marginBottom: 28 }} />

          {/* Tabs */}
          <div style={{ display: 'flex', backgroundColor: 'var(--color-surface-1)', padding: 4, borderRadius: 'var(--radius-lg)', marginBottom: 24, border: '1px solid var(--color-hairline-soft)' }}>
            {(['login', 'register'] as const).map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); setError(''); setPending(false) }} style={{ flex: 1, padding: '9px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, transition: 'all var(--dur-fast) var(--ease-out)', backgroundColor: activeTab === tab ? 'var(--color-ink)' : 'transparent', color: activeTab === tab ? 'var(--color-canvas)' : 'var(--color-ink-muted)', textTransform: 'capitalize' }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Login form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {error   && <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: '#f87171', fontSize: 13 }}>⚠️ {error}</div>}
              {pending && <div style={{ backgroundColor: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'rgba(251,191,36,0.9)', fontSize: 13 }}>⏳ Your account is pending approval by the administrator.</div>}

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-ink-muted)', marginBottom: 6 }}>Staff Email</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-muted)', fontSize: 13 }}>✉</span>
                  <input type="email" name="email" required autoFocus placeholder="yourname@karyasaarthi.in" style={{ ...inputSx, paddingLeft: 34 }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-ink-muted)', marginBottom: 6 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13 }}>🔒</span>
                  <input type={showPassword ? 'text' : 'password'} name="password" required placeholder="Enter your password" style={{ ...inputSx, paddingLeft: 34, paddingRight: 40 }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <Link href="/forgot-password" style={{ fontSize: 12, color: 'var(--color-accent-blue)', textDecoration: 'none' }}>Forgot password?</Link>
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.6 : 1, cursor: 'pointer', padding: '13px', fontSize: 14 }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" /><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Authenticating…
                  </span>
                ) : '🔐 Access Staff Portal'}
              </button>
            </form>
          )}

          {/* Register form */}
          {activeTab === 'register' && <RegisterForm />}

          {/* Footer */}
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-ink-muted)', marginTop: 24 }}>
            Not a staff member?{' '}
            <a href="https://karyasaarthi.com/login" style={{ color: 'var(--color-accent-blue)', textDecoration: 'none' }}>Go to customer login →</a>
          </p>
          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-ink-muted)', marginTop: 8 }}>
            🛡️ Staff portal · admin.karyasaarthi.com · Role-based access
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .staff-login-brand { display: none !important; }
          .staff-login-form  { width: 100% !important; padding: 32px 20px !important; }
        }
      `}</style>
    </div>
  )
}

