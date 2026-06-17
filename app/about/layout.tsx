import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Karya Saarthi - Our Story & Mission',
  description: 'Learn our story, mission, team. 500+ projects, 98% satisfaction. Discover how Karya Saarthi bridges the gap between education and industry with expert professional services.',
  openGraph: {
    title: 'About Karya Saarthi | Our Story & Mission',
    description: 'Meet the team behind Karya Saarthi. 500+ projects delivered, 98% satisfaction. Discover our mission to empower students and businesses across India.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Karya Saarthi | Our Story & Mission',
    description: 'Learn our story, mission, and values. 500+ projects, 98% satisfaction rate.',
    images: ['/og-image.png'],
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
