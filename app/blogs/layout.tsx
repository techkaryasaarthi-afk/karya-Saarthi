import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog - Project Tips & Success Stories',
  description: 'Learn thesis writing, research, study abroad. Expert guides. Weekly updates. Read insights on academic writing, digital marketing, career growth from Karya Saarthi experts.',
  openGraph: {
    title: 'Project Success Guide & Educational Blog | Karya Saarthi',
    description: 'Expert articles on thesis writing, SEO, web development, campus life, and career success — from the Karya Saarthi team.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Project Success Guide & Educational Blog | Karya Saarthi',
    description: 'Learn thesis writing, research, study abroad. Expert guides. Weekly updates.',
    images: ['/og-image.png'],
  },
}

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
