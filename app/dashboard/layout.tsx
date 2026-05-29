import type { ReactNode } from 'react'
import SessionInactivityGuard from '@/components/SessionInactivityGuard'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SessionInactivityGuard redirectTo="/login?timeout=1" />
      {children}
    </>
  )
}
