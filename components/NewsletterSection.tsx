'use client'

import { useState } from 'react'

export default function NewsletterSection() {
  const [email,   setEmail]   = useState('')
  const [status,  setStatus]  = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const res  = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage("You're subscribed! Welcome to the Karya Saarthi community 🎉")
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  return (
    <section style={{
      padding: 'var(--space-section) var(--space-xl)',
      backgroundColor: 'var(--color-canvas)',
      borderTop: '1px solid var(--color-hairline-soft)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glows */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: -80, right: -80, width: 360, height: 360,
        borderRadius: '50%', backgroundColor: 'rgba(0,153,255,0.05)', pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: -80, left: -80, width: 280, height: 280,
        borderRadius: '50%', backgroundColor: 'rgba(106,76,245,0.05)', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>

        {/* Icon */}
        <div style={{
          width: 64, height: 64, margin: '0 auto 24px',
          borderRadius: 'var(--radius-xl)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28,
          backgroundColor: 'var(--color-surface-1)',
          border: '1px solid var(--color-hairline)',
          animation: 'nl-icon-bounce 3s ease-in-out infinite',
        }}>
          ✉️
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(26px, 4vw, 44px)',
          fontWeight: 700,
          color: 'var(--color-ink)',
          letterSpacing: '-1.5px',
          marginBottom: 14,
        }}>
          Stay in the <span style={{ color: 'var(--color-accent-blue)' }}>Loop</span>
        </h2>

        <p style={{
          fontSize: 15, color: 'var(--color-ink-muted)',
          maxWidth: 480, margin: '0 auto 36px',
          lineHeight: 1.65,
        }}>
          Get updates on new services, events, hackathons, and exclusive offers directly in your inbox.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {status !== 'success' ? (
            <div style={{
              display: 'flex', gap: 10,
              maxWidth: 500, margin: '0 auto',
              flexWrap: 'wrap',
            }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                style={{
                  flex: 1, minWidth: 200,
                  padding: '13px 18px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--color-hairline)',
                  backgroundColor: 'var(--color-surface-1)',
                  color: 'var(--color-ink)',
                  fontSize: 14, outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-accent-blue)' }}
                onBlur={e  => { e.currentTarget.style.borderColor = 'var(--color-hairline)' }}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                id="newsletter-subscribe-btn"
                className="btn-primary"
                style={{ flexShrink: 0, opacity: status === 'loading' ? 0.6 : 1 }}
              >
                {status === 'loading' ? '⏳ Subscribing…' : 'Subscribe →'}
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 10, padding: '14px 24px',
              borderRadius: 'var(--radius-xl)',
              backgroundColor: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.2)',
              maxWidth: 500, margin: '0 auto',
            }}>
              <span style={{ fontSize: 20 }}>✅</span>
              <p style={{ fontSize: 13, color: '#22c55e', fontWeight: 600 }}>You&apos;re subscribed! Welcome aboard 🎉</p>
            </div>
          )}
        </form>

        {status === 'error' && (
          <p style={{ marginTop: 12, fontSize: 13, color: '#f87171', fontWeight: 500 }}>{message}</p>
        )}

        <p style={{ color: 'var(--color-ink-muted)', fontSize: 11, marginTop: 20, opacity: 0.6 }}>
          No spam. <a href="/unsubscribe" style={{ color: 'var(--color-accent-blue)', textDecoration: 'underline' }}>Unsubscribe anytime</a>. Your data is safe with us. 🔒
        </p>
      </div>

      <style>{`
        @keyframes nl-icon-bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
      `}</style>
    </section>
  )
}
