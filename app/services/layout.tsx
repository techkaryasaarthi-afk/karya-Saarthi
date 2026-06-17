import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Professional Services - Thesis, Web Development & Digital Marketing',
  description: 'Custom websites for businesses. Responsive design. SEO-optimized. Original thesis writing with teaching. 100% plagiarism-free. Expert writers. Fast delivery. Portfolio available.',
  openGraph: {
    title: 'Professional Services | Karya Saarthi',
    description: 'From thesis writing to full-stack development and digital marketing — explore all services offered by Karya Saarthi. 500+ projects delivered.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Professional Services | Karya Saarthi',
    description: 'Thesis writing, web development, digital marketing & AI solutions. 500+ projects delivered with 98% satisfaction.',
    images: ['/og-image.png'],
  },
}

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
