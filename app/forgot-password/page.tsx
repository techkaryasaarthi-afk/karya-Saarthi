'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

type Step = 'email' | 'otp' | 'reset' | 'success'

function ForgotPasswordContent() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [tempToken, setTempToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [pwStrength, setPwStrength] = useState(0)

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [countdown])

  const handlePasswordChange = (val: string) => {
    setNewPassword(val)
    const len = val.length
    setPwStrength(len === 0 ? 0 : len < 6 ? 1 : len < 10 ? 2 : 3)
  }

  const strengthColors = ['transparent', '#ef4444', '#f59e0b', '#22c55e']
  const strengthWidths = ['0%', '33%', '66%', '100%']
  const strengthLabels = ['', 'Weak', 'Good', 'Strong']

  // Step 1: Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to send verification code'); setLoading(false); return }
      setStep('otp')
      setCountdown(60)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle OTP input
  const handleOtpChange = useCallback((index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1)
    if (value && !/^\d$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    // Auto-focus next
    if (value && index < 5) {
      const next = document.getElementById(`forgot-otp-${index + 1}`)
      next?.focus()
    }
  }, [otp])

  const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prev = document.getElementById(`forgot-otp-${index - 1}`)
      prev?.focus()
    }
  }, [otp])

  const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
    }
  }, [])

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpStr = otp.join('')
    if (otpStr.length !== 6) { setError('Please enter the complete 6-digit OTP'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpStr, purpose: 'forgot_password' }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Invalid OTP code'); setLoading(false); return }
      setTempToken(data.tempToken)
      setStep('reset')
    } catch {
      setError('Something went wrong while verifying OTP')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tempToken, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to reset password'); setLoading(false); return }
      setStep('success')
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResend = async () => {
    if (countdown > 0) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to resend OTP'); setLoading(false); return }
      setOtp(['', '', '', '', '', ''])
      setCountdown(60)
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-surface-1)',
    color: 'var(--color-ink)',
    fontSize: 'var(--text-body-sm-size)',
    fontWeight: 'var(--text-body-sm-weight)',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-hairline)',
    outline: 'none',
    transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
    fontFamily: 'var(--font-body)',
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-canvas)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      color: 'var(--color-ink)',
    }}>
      {/* Background ambient glows in dark theme */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%)',
            top: `${15 + i * 30}%`,
            left: `${15 + i * 30}%`,
            pointerEvents: 'none',
          }}
          animate={{ scale: [1, 1.25, 1], rotate: [0, 120, 240, 360] }}
          transition={{ duration: 25 + i * 5, repeat: Infinity }}
        />
      ))}

      {/* Back button */}
      <Link
        href="/login"
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          borderRadius: 'var(--radius-pill)',
          backgroundColor: 'var(--color-surface-1)',
          border: '1px solid var(--color-hairline)',
          color: 'var(--color-ink)',
          textDecoration: 'none',
          fontSize: 13,
          fontWeight: 500,
          transition: 'all 0.2s ease',
        }}
      >
        ← Back to Login
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 460,
          backgroundColor: 'var(--color-surface-1)',
          border: '1px solid var(--color-hairline)',
          borderRadius: 'var(--radius-xl)',
          padding: '40px 36px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Image
            src="/images/karyasaarthi.png"
            alt="Logo"
            width={54}
            height={54}
            style={{ borderRadius: 12, margin: '0 auto 16px', display: 'block' }}
          />

          {step === 'email' && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, margin: '0 0 6px', color: 'var(--color-ink)' }}>
                Forgot Password?
              </h2>
              <p style={{ color: 'var(--color-ink-muted)', fontSize: 14, margin: 0 }}>
                Enter your registered email to receive a verification code
              </p>
            </>
          )}
          {step === 'otp' && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, margin: '0 0 6px', color: 'var(--color-ink)' }}>
                Verify OTP
              </h2>
              <p style={{ color: 'var(--color-ink-muted)', fontSize: 14, margin: 0 }}>
                Enter the 6-digit code sent to<br />
                <strong style={{ color: 'var(--color-ink)' }}>{email}</strong>
              </p>
            </>
          )}
          {step === 'reset' && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, margin: '0 0 6px', color: 'var(--color-ink)' }}>
                Set New Password
              </h2>
              <p style={{ color: 'var(--color-ink-muted)', fontSize: 14, margin: 0 }}>
                Choose a strong, secure password for your account
              </p>
            </>
          )}
          {step === 'success' && (
            <>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, margin: '0 0 6px', color: 'var(--color-ink)' }}>
                Password Reset!
              </h2>
              <p style={{ color: 'var(--color-ink-muted)', fontSize: 14, margin: 0 }}>
                Your password has been changed successfully. You can now sign in.
              </p>
            </>
          )}
        </div>

        {/* Step progress indicator */}
        {step !== 'success' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 28 }}>
            {(['email', 'otp', 'reset'] as const).map((s, i) => {
              const order = ['email', 'otp', 'reset']
              const currentIndex = order.indexOf(step)
              const isDone = currentIndex > i
              const isCurrent = step === s
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    backgroundColor: isCurrent ? 'var(--color-accent-blue)' : isDone ? '#22c55e' : 'var(--color-surface-2)',
                    color: isCurrent || isDone ? '#fff' : 'var(--color-ink-muted)',
                    border: `1px solid ${isCurrent ? 'var(--color-accent-blue)' : isDone ? '#22c55e' : 'var(--color-hairline)'}`,
                    transition: 'all 0.3s ease',
                  }}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  {i < 2 && (
                    <div style={{
                      width: 36,
                      height: 2,
                      backgroundColor: currentIndex > i ? '#22c55e' : 'var(--color-surface-2)',
                      transition: 'background-color 0.3s ease',
                    }} />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div style={{
            backgroundColor: '#1a0808',
            border: '1px solid #7f1d1d',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{ color: '#fca5a5', fontSize: 14 }}>⚠ {error}</span>
          </div>
        )}

        {/* Step 1: Email */}
        {step === 'email' && (
          <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ color: 'var(--color-ink-muted)', display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="name@example.com"
                style={inputStyle}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ justifyContent: 'center', width: '100%', padding: '14px', fontSize: 15, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Sending Verification Code...' : 'Send OTP →'}
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }} onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`forgot-otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  autoFocus={i === 0}
                  style={{
                    width: 46,
                    height: 56,
                    textAlign: 'center',
                    fontSize: 22,
                    fontWeight: 700,
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${digit ? 'var(--color-accent-blue)' : 'var(--color-hairline)'}`,
                    backgroundColor: 'var(--color-surface-2)',
                    color: 'var(--color-ink)',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
            </div>

            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-ink-muted)' }}>
              {countdown > 0 ? (
                <span>Resend code in <strong style={{ color: 'var(--color-ink)' }}>{countdown}s</strong></span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontWeight: 600 }}
                >
                  Resend OTP Code
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="btn-primary"
              style={{ justifyContent: 'center', width: '100%', padding: '14px', fontSize: 15, opacity: (loading || otp.join('').length !== 6) ? 0.5 : 1 }}
            >
              {loading ? 'Verifying...' : 'Verify OTP →'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']); setError('') }}
              style={{ background: 'none', border: 'none', color: 'var(--color-ink-muted)', cursor: 'pointer', fontSize: 13, textAlign: 'center', width: '100%', marginTop: -4 }}
            >
              ← Change email address
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ color: 'var(--color-ink-muted)', display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => handlePasswordChange(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  style={{ ...inputStyle, paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-ink-muted)',
                    fontSize: 16,
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Strength bar */}
              <div style={{ marginTop: 8, height: 4, borderRadius: 2, backgroundColor: 'var(--color-surface-2)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: strengthWidths[pwStrength],
                  backgroundColor: strengthColors[pwStrength],
                  transition: 'width 0.3s ease, background-color 0.3s ease',
                }} />
              </div>
              {pwStrength > 0 && (
                <p style={{
                  fontSize: 12,
                  marginTop: 4,
                  color: pwStrength === 1 ? '#ef4444' : pwStrength === 2 ? '#f59e0b' : '#22c55e',
                }}>
                  {strengthLabels[pwStrength]}
                </p>
              )}
            </div>

            <div>
              <label style={{ color: 'var(--color-ink-muted)', display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Confirm new password"
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ justifyContent: 'center', width: '100%', padding: '14px', fontSize: 15, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Resetting Password...' : '🔐 Reset Password'}
            </button>
          </form>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="btn-primary"
              style={{ justifyContent: 'center', width: '100%', padding: '14px', fontSize: 15 }}
            >
              Go to Login →
            </button>
          </div>
        )}

        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--color-hairline)', textAlign: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--color-ink-muted)' }}>Remember your password? </span>
          <Link href="/login" style={{ fontSize: 13, color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: 400, height: 480, borderRadius: 'var(--radius-xl)' }} />
      </div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  )
}
