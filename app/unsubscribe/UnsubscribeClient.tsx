'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function UnsubscribeClient() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      
      if (res.ok) {
        setStatus('success')
        setMessage('You have been successfully unsubscribed from our newsletter.')
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
    <div className="min-h-screen bg-[var(--color-canvas)] pt-32 pb-20 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-[var(--color-surface-1)] p-8 rounded-3xl shadow-2xl shadow-black/50 border border-[var(--color-hairline)] text-center">
        
        <div className="w-16 h-16 mx-auto bg-[var(--color-surface-2)] border border-[var(--color-hairline)] text-3xl flex items-center justify-center rounded-2xl mb-6">
          {status === 'success' ? '👋' : '📬'}
        </div>

        <h1 className="text-2xl font-bold font-heading text-[var(--color-ink)] mb-3">
          {status === 'success' ? 'Unsubscribed' : 'Unsubscribe'}
        </h1>
        
        <p className="text-[var(--color-ink-muted)] text-sm mb-8 leading-relaxed">
          {status === 'success' 
            ? message 
            : "We're sorry to see you go! Enter your email below to unsubscribe from our newsletter and updates."}
        </p>

        {status !== 'success' && (
          <form onSubmit={handleUnsubscribe} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full px-5 py-3 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
              />
            </div>
            
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Processing...' : 'Unsubscribe Me'}
            </button>

            {status === 'error' && (
              <p className="text-red-500 text-xs font-semibold mt-2">{message}</p>
            )}
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-[var(--color-hairline-soft)]">
          <Link href="/" className="text-sm font-semibold text-[var(--color-accent-blue)] hover:underline">
            ← Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
