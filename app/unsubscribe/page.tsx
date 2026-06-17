import { Suspense } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import UnsubscribeClient from './UnsubscribeClient'

export const metadata = {
  title: 'Unsubscribe — Karya Saarthi',
  description: 'Unsubscribe from Karya Saarthi communications.',
}

export default function UnsubscribePage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen bg-[var(--color-canvas)] pt-32 pb-20 flex items-center justify-center text-[var(--color-ink-muted)]">
          Loading...
        </div>
      }>
        <UnsubscribeClient />
      </Suspense>
      <Footer />
    </>
  )
}
