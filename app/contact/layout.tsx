import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us - 24/7 Support Available',
  description: 'Reach us via WhatsApp, email, phone. Free consultation. Quick response. Get instant support for your project, thesis, or business needs from Karya Saarthi.',
  openGraph: {
    title: 'Contact Karya Saarthi - Get Instant Support',
    description: 'Have a project in mind? Contact us today via WhatsApp, email, or phone. Free consultation. Our experts respond within 2 hours.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Karya Saarthi - Get Instant Support',
    description: 'Reach us via WhatsApp, email, phone. Free consultation. Quick response. 24/7 support available.',
    images: ['/og-image.png'],
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
