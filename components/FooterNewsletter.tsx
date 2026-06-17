'use client'

import { useState } from 'react'

export default function FooterNewsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div style={{ display: 'flex', gap: 8, flex: 1, minWidth: 240, maxWidth: 400, alignItems: 'center', padding: '10px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
        <span style={{ fontSize: 16 }}>✅</span>
        <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 600 }}>Subscribed successfully!</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 'min(240px, 100%)', maxWidth: 400 }}>
      <div style={{ display: 'flex', gap: 8, width: '100%' }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          style={{
            flex: 1, minWidth: 0, padding: '10px 14px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-hairline)', backgroundColor: 'var(--color-canvas)',
            color: 'var(--color-ink)', fontSize: 13, outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            padding: '10px 18px', borderRadius: 'var(--radius-md)',
            /* Use #fff (ink) on #141414 (surface-1) → contrast 12:1, passes WCAG AAA */
            backgroundColor: 'var(--color-ink)', color: 'var(--color-canvas)',
            border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
            opacity: status === 'loading' ? 0.7 : 1
          }}
        >
          {status === 'loading' ? '...' : 'Subscribe'}
        </button>
      </div>
      {status === 'error' && <span style={{ fontSize: 11, color: '#ef4444' }}>Failed to subscribe. Try again.</span>}
    </form>
  )
}
