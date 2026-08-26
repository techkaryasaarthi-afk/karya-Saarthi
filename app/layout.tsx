import type { Metadata, Viewport } from 'next'
import { Inter, Geist, Sora } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import SilenceWarnings from '@/components/SilenceWarnings'
import { cn } from "@/lib/utils";
import ChatbotLoader from '@/components/ChatbotLoader'
import CustomCursor from '@/components/CustomCursor'

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


/* ── Fonts ─────────────────────────────────────────────────── */
// Inter Variable: body typeface with full OpenType support
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  axes: ['opsz'],
})

// Sora: display / heading typeface (Hero headings, section titles)
const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
  weight: ['500', '700'],
})

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://karyasaarthi.vercel.app'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#090909',
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Karya Saarthi - Project Solutions With Education',
    template: '%s | Karya Saarthi',
  },
  description:
    'Transform your academic success. Get expert thesis writing, web development, and study abroad help. We teach while we complete. 500+ projects completed. 98% satisfaction.',
  keywords: [
    'thesis writing',
    'research paper help',
    'web development services',
    'digital marketing',
    'SEO services',
    'academic writing',
    'AI automation',
    'campus ambassador',
    'karya saarthi',
    'professional services India',
    'dissertation help',
    'mobile app development',
  ],
  authors: [{ name: 'Karya Saarthi', url: BASE_URL }],
  creator: 'Karya Saarthi',
  publisher: 'Karya Saarthi',
  category: 'Education & Professional Services',

  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: BASE_URL,
    siteName: 'Karya Saarthi',
    title: 'Karya Saarthi - Project Solutions With Education',
    description:
      'India\'s first project solutions company where education meets execution. Expert thesis writing, web development, digital marketing & AI solutions. 500+ projects completed.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Karya Saarthi — Your Digital Growth Partner',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Karya Saarthi - Project Solutions With Education',
    description:
      'Transform your academic success. Get expert thesis writing, web development, and study abroad help. 500+ projects completed. 98% satisfaction.',
    images: ['/og-image.png'],
    creator: '@karyasaarthi',
    site: '@karyasaarthi',
  },

  alternates: {
    canonical: BASE_URL,
  },

  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || '',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={cn(GeistSans.variable, inter.variable, sora.variable, "font-sans", geist.variable)}
      style={{ backgroundColor: '#090909', colorScheme: 'dark' }}
    >
      <head>
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/icon-16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* JSON-LD: Organization structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Karya Saarthi',
              url: BASE_URL,
              logo: `${BASE_URL}/logo.png`,
              sameAs: [
                'https://www.instagram.com/karyasaarthi/',
                'https://www.facebook.com/profile.php?id=61576877739779',
                'https://linkedin.com/in/karya-saarthi-693a01369',
                'https://x.com/karyasaarthi',
                'https://www.youtube.com/@KaryaSaarthi',
                'https://www.threads.com/@karyasaarthi',
                'https://t.me/karyasaarthi',
                'https://bsky.app/profile/karyasaarthi.bsky.social',
                'https://www.reddit.com/u/karyasaarthi/',
                'https://www.quora.com/profile/Karya-Saarthi',
                'https://www.tumblr.com/karyasaarthi',
                'https://www.twitch.tv/karyasaarthi',
                'https://pin.it/1GwGBkfOk',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+91-8595025753',
                contactType: 'customer support',
                areaServed: 'IN',
                availableLanguage: ['English', 'Hindi'],
              },
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Gali No 1, Block A, Uttarakhand Enclave, Nathupura, Burari',
                addressLocality: 'North Delhi',
                addressRegion: 'Delhi',
                postalCode: '110084',
                addressCountry: 'IN',
              },
            }),
          }}
        />
      </head>
      <body
        className="antialiased"
        style={{
          fontFamily: `var(--font-inter, 'Inter', system-ui, sans-serif)`,
          backgroundColor: 'var(--color-canvas)',
          color: 'var(--color-ink)',
        }}
        suppressHydrationWarning
      >
        <SilenceWarnings />
        <CustomCursor />
        {children}
        <ChatbotLoader />
      </body>
    </html>
  )
}
