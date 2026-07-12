'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type SignupStep = 'form' | 'otp' | 'complete'

const PW_STRENGTH_COLORS = ['transparent', '#ef4444', '#f59e0b', '#22c55e']
const PW_STRENGTH_WIDTHS = ['0%', '33%', '66%', '100%']

function SignupContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const pillar       = searchParams.get('pillar')

  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState('')
  const [pwStrength, setPwStrength] = useState(0)
  const [regType,   setRegType]   = useState<string>(pillar || 'customer')
  const [step,      setStep]      = useState<SignupStep>('form')
  const [otp,       setOtp]       = useState(['', '', '', '', '', ''])
  const [countdown, setCountdown] = useState(0)
  const [formData,  setFormData]  = useState<Record<string, string>>({})

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [countdown])

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const len = e.target.value.length
    setPwStrength(len === 0 ? 0 : len < 6 ? 1 : len < 10 ? 2 : 3)
  }

  const handleSendOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    const fd = new FormData(e.currentTarget)
    if (fd.get('password') !== fd.get('confirm_password')) { setError('Passwords do not match'); setLoading(false); return }
    const data: Record<string, string> = {
      fullname: fd.get('fullname') as string,
      phone:    fd.get('phone')    as string,
      email:    fd.get('email')    as string,
      password: fd.get('password') as string,
      user_type:  (fd.get('user_type')  as string) || '',
      department: (fd.get('department') as string) || '',
    }
    setFormData(data)
    try {
      const res    = await fetch('/api/auth/send-signup-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: data.email, fullname: data.fullname }) })
      const result = await res.json()
      if (!res.ok) { setError(result.error || 'Failed to send OTP'); setLoading(false); return }
      setStep('otp'); setCountdown(60)
    } catch { setError('Something went wrong.') }
    setLoading(false)
  }

  const handleOtpChange = useCallback((index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1)
    if (value && !/^\d$/.test(value)) return
    const newOtp = [...otp]; newOtp[index] = value; setOtp(newOtp)
    if (value && index < 5) { document.getElementById(`signup-otp-${index + 1}`)?.focus() }
  }, [otp])

  const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) document.getElementById(`signup-otp-${index - 1}`)?.focus()
  }, [otp])

  const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) setOtp(pasted.split(''))
  }, [])

  const handleVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpStr = otp.join('')
    if (otpStr.length !== 6) { setError('Please enter the complete 6-digit OTP'); return }
    setLoading(true); setError('')
    try {
      const verifyRes  = await fetch('/api/auth/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: formData.email, otp: otpStr, purpose: 'signup_verification' }) })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) { setError(verifyData.error || 'OTP verification failed'); setLoading(false); return }
      const signupRes  = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullname: formData.fullname, phone: formData.phone, email: formData.email, user_type: formData.user_type || null, password: formData.password, role: regType, department: null, email_verified: true }) })
      const signupData = await signupRes.json()
      if (!signupRes.ok) { setError(signupData.error || 'Signup failed'); setLoading(false); return }
      if (regType === 'vendor') {
        router.push('/vendor-apply')
      } else {
        router.push('/login?registered=1')
      }
    } catch { setError('Something went wrong.') }
    setLoading(false)
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/auth/send-signup-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: formData.email, fullname: formData.fullname }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setLoading(false); return }
      setOtp(['', '', '', '', '', '']); setCountdown(60)
    } catch { setError('Something went wrong') }
    setLoading(false)
  }

  /* ── Shared form field style ─────────────────────────────── */
  const inputStyle: React.CSSProperties = {
    display: 'block', width: '100%', boxSizing: 'border-box',
    backgroundColor: 'var(--color-surface-1)', color: 'var(--color-ink)',
    fontSize: 'var(--text-body-sm-size)', fontWeight: 'var(--text-body-sm-weight)',
    padding: '10px 14px', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-hairline)', outline: 'none',
    transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
    fontFamily: 'var(--font-body)',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-canvas)', display: 'flex', alignItems: 'stretch' }}>

      {/* Left panel */}
      <div className="signup-left" style={{ flex: 1, padding: '64px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid var(--color-hairline-soft)' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 64 }}>
          <Image src="/images/karyasaarthi.png" alt="Karya Saarthi" width={24} height={24} style={{ borderRadius: 4 }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.4px' }}>Karya Saarthi</span>
        </Link>
        <h1 className="text-display-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)', marginBottom: 16 }}>
          Join Karya Saarthi
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--color-ink-muted)', maxWidth: 340, marginBottom: 48 }}>
          Thousands of students and businesses trust us. Your journey starts here.
        </p>
        {['500+ Happy Clients', 'Expert Assistance 24/7', '100% Secure & Confidential', 'Money Back Guarantee'].map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-semantic-success)', flexShrink: 0 }} />
            <span className="text-body-sm" style={{ color: 'var(--color-ink-muted)' }}>{f}</span>
          </div>
        ))}
      </div>

      {/* Right panel: forms */}
      <div className="signup-right" style={{ width: 520, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px 48px', overflowY: 'auto' }}>

        {step === 'form' && (
          <>
            <div className="mobile-logo">
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 32 }}>
                <Image src="/images/karyasaarthi.png" alt="Karya Saarthi" width={24} height={24} style={{ borderRadius: 4 }} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.4px' }}>Karya Saarthi</span>
              </Link>
            </div>
            
            <div style={{ marginBottom: 28 }}>
              <h2 className="text-display-md" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)', marginBottom: 8 }}>Create account</h2>
              <p className="text-body" style={{ color: 'var(--color-ink-muted)' }}>
                Already have one?{' '}
                <Link href="/login" style={{ color: 'var(--color-accent-blue)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
              </p>
            </div>

            {/* Account type toggle */}
            {!pillar && (
              <div style={{ display: 'flex', backgroundColor: 'var(--color-surface-1)', borderRadius: 'var(--radius-pill)', padding: 4, marginBottom: 24, gap: 4 }}>
                {[{ key: 'customer', label: 'Customer' }, { key: 'vendor', label: 'Vendor' }].map(tab => (
                  <button
                    key={tab.key} type="button"
                    onClick={() => { setRegType(tab.key); setError('') }}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: 'var(--radius-pill)', border: 'none', cursor: 'pointer',
                      fontSize: 'var(--text-body-sm-size)', fontWeight: 500,
                      backgroundColor: regType === tab.key ? 'var(--color-surface-2)' : 'transparent',
                      color: regType === tab.key ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                      transition: 'all var(--dur-normal) var(--ease-out)',
                    }}
                  >{tab.label}</button>
                ))}
              </div>
            )}

            {!pillar && regType === 'vendor' && (
              <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.08)', borderLeft: '3px solid var(--color-accent-blue)', padding: '12px 14px', borderRadius: 6, marginBottom: 16 }}>
                <p className="text-body-sm" style={{ color: '#38bdf8', margin: 0 }}>
                  ✨ <strong>Vendor Onboarding:</strong> After creating and verifying your account, you&apos;ll be directed to complete our quick 3-step application (Basic Info, Work Samples & Written Questions).
                </p>
              </div>
            )}

            {error && <div style={{ backgroundColor: '#1a0808', border: '1px solid #7f1d1d', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 16 }}><p className="text-body-sm" style={{ color: '#fca5a5' }}>⚠ {error}</p></div>}

            <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="text-body-sm" style={{ color: 'var(--color-ink-muted)', display: 'block', marginBottom: 5 }}>Full Name</label>
                  <input type="text" name="fullname" placeholder="Jane Doe" required style={inputStyle} />
                </div>
                <div>
                  <label className="text-body-sm" style={{ color: 'var(--color-ink-muted)', display: 'block', marginBottom: 5 }}>Phone</label>
                  <input type="tel" name="phone" placeholder="10-digit number" pattern="[0-9]{10}" required style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="text-body-sm" style={{ color: 'var(--color-ink-muted)', display: 'block', marginBottom: 5 }}>Email</label>
                <input type="email" name="email" placeholder="name@example.com" required style={inputStyle} />
              </div>
              {!pillar && regType === 'customer' && (
                <div>
                  <label className="text-body-sm" style={{ color: 'var(--color-ink-muted)', display: 'block', marginBottom: 5 }}>I am a…</label>
                  <select name="user_type" required defaultValue="" style={{ ...inputStyle, color: 'var(--color-ink-muted)' }}>
                    <option value="" disabled>Select type</option>
                    <option value="student">Student</option>
                    <option value="business">Business Owner</option>
                    <option value="professional">Professional</option>
                    <option value="freelancer">Freelancer</option>
                  </select>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="text-body-sm" style={{ color: 'var(--color-ink-muted)', display: 'block', marginBottom: 5 }}>Password</label>
                  <input type="password" name="password" placeholder="Min. 6 chars" minLength={6} required onChange={handlePasswordChange} style={inputStyle} />
                  <div style={{ marginTop: 6, height: 3, backgroundColor: 'var(--color-surface-2)', borderRadius: 2 }}>
                    <div style={{ height: '100%', borderRadius: 2, width: PW_STRENGTH_WIDTHS[pwStrength], backgroundColor: PW_STRENGTH_COLORS[pwStrength], transition: 'width 300ms var(--ease-out), background-color 300ms var(--ease-out)' }} />
                  </div>
                </div>
                <div>
                  <label className="text-body-sm" style={{ color: 'var(--color-ink-muted)', display: 'block', marginBottom: 5 }}>Confirm Password</label>
                  <input type="password" name="confirm_password" placeholder="Repeat password" minLength={6} required style={inputStyle} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 4 }}>
                <input type="checkbox" required style={{ accentColor: 'var(--color-accent-blue)', width: 14, height: 14 }} />
                <span className="text-body-sm" style={{ color: 'var(--color-ink-muted)' }}>I agree to the <Link href="/terms" style={{ color: 'var(--color-accent-blue)', textDecoration: 'none' }}>Terms</Link> & <Link href="/privacy" style={{ color: 'var(--color-accent-blue)', textDecoration: 'none' }}>Privacy Policy</Link></span>
              </label>
              <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent: 'center', width: '100%', marginTop: 4, opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Sending OTP…' : 'Verify Email & Continue →'}
              </button>
            </form>
          </>
        )}

        {step === 'otp' && (
          <div>
            <h2 className="text-display-md" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)', marginBottom: 8 }}>Verify email</h2>
            <p className="text-body" style={{ color: 'var(--color-ink-muted)', marginBottom: 28 }}>
              Enter the 6-digit code sent to <strong style={{ color: 'var(--color-ink)' }}>{formData.email}</strong>
            </p>
            {error && <div style={{ backgroundColor: '#1a0808', border: '1px solid #7f1d1d', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 16 }}><p className="text-body-sm" style={{ color: '#fca5a5' }}>⚠ {error}</p></div>}
            <form onSubmit={handleVerifyAndSignup} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }} onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i} id={`signup-otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKeyDown(i, e)} autoFocus={i === 0}
                    style={{
                      width: 44, height: 52, textAlign: 'center',
                      fontSize: 20, fontWeight: 700,
                      backgroundColor: 'var(--color-surface-1)', color: 'var(--color-ink)',
                      border: `2px solid ${digit ? 'var(--color-accent-blue)' : 'var(--color-hairline)'}`,
                      borderRadius: 'var(--radius-md)', outline: 'none',
                      transition: 'border-color var(--dur-fast) var(--ease-out)',
                    }}
                  />
                ))}
              </div>
              <div style={{ textAlign: 'center' }}>
                {countdown > 0 ? (
                  <span className="text-body-sm" style={{ color: 'var(--color-ink-muted)' }}>Resend in <strong style={{ color: 'var(--color-ink)' }}>{countdown}s</strong></span>
                ) : (
                  <button type="button" onClick={handleResend} disabled={loading} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-accent-blue)', fontSize: 'var(--text-body-sm-size)', fontWeight: 500 }}>Resend OTP</button>
                )}
              </div>
              <button type="submit" disabled={loading || otp.join('').length !== 6} className="btn-primary" style={{ justifyContent: 'center', width: '100%', opacity: (loading || otp.join('').length !== 6) ? 0.5 : 1 }}>
                {loading ? 'Creating account…' : 'Verify & Create Account →'}
              </button>
              <button type="button" onClick={() => { setStep('form'); setOtp(['', '', '', '', '', '']); setError('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ink-muted)', fontSize: 'var(--text-body-sm-size)' }}>
                ← Back to form
              </button>
            </form>
          </div>
        )}

        {step === 'complete' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 48, marginBottom: 20 }}>🎉</p>
            <h2 className="text-display-md" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)', marginBottom: 12 }}>You&apos;re in!</h2>
            {success && <p className="text-body" style={{ color: 'var(--color-semantic-success)', marginBottom: 24 }}>{success}</p>}
            <Link href="/login" className="btn-primary">Go to Sign in →</Link>
          </div>
        )}

      </div>

      <style>{`
        .mobile-logo { display: none; }
        @media (max-width: 900px) { .signup-left { display: none !important; } .signup-right { width: 100% !important; max-width: 520px; margin: 0 auto; padding: 40px 24px !important; } .mobile-logo { display: block; } }
        select option { background-color: #1c1c1c; color: #ffffff; }
      `}</style>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: 320, height: 400, borderRadius: 'var(--radius-xl)' }} />
      </div>
    }>
      <SignupContent />
    </Suspense>
  )
}

