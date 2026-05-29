'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const INACTIVITY_LIMIT_MS = 20 * 60 * 1000
const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click']

export default function SessionInactivityGuard({ redirectTo }: { redirectTo: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const protectedPrefixes = ['/admin', '/vendor', '/dashboard']
    const isProtectedRoute = protectedPrefixes.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))

    if (!isProtectedRoute) return

    const logout = async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' })
      } finally {
        router.replace(redirectTo)
      }
    }

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(logout, INACTIVITY_LIMIT_MS)
    }

    resetTimer()
    ACTIVITY_EVENTS.forEach(event => window.addEventListener(event, resetTimer, { passive: true }))

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      ACTIVITY_EVENTS.forEach(event => window.removeEventListener(event, resetTimer))
    }
  }, [pathname, redirectTo, router])

  return null
}
