import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/server'
import PartnersMarquee from '@/components/PartnersMarquee'
import TickerBanner from '@/components/TickerBanner'
import { DEFAULT_HOMEPAGE_SETTINGS } from '@/app/api/homepage-settings/route'

// Lazy load below-the-fold components to improve initial load performance
const ServiceTiles = dynamic(() => import('@/components/ServiceTiles'), { ssr: true })
const HowItWorks = dynamic(() => import('@/components/HowItWorks'), { ssr: true })
const PillarsSection = dynamic(() => import('@/components/PillarsSection'), { ssr: true })
const StatsSection = dynamic(() => import('@/components/StatsSection'), { ssr: true })
const EventsPreviewSection = dynamic(() => import('@/components/EventsPreviewSection'))
const HackathonsSection = dynamic(() => import('@/components/HackathonsSection'))
const PodcastsSection = dynamic(() => import('@/components/PodcastsSection'))
const BlogSection = dynamic(() => import('@/components/BlogSection'), { ssr: true })
const TestimonialsSection = dynamic(() => import('@/components/TestimonialsSection'), { ssr: true })
const QuickAccessDashboard = dynamic(() => import('@/components/QuickAccessDashboard'))
const FAQSection = dynamic(() => import('@/components/FAQSection'), { ssr: true })
const CTABanner = dynamic(() => import('@/components/CTABanner'), { ssr: true })
const SaarthiXpressBanner = dynamic(() => import('@/components/SaarthiXpressBanner'), { ssr: true })
const NewsletterSection = dynamic(() => import('@/components/NewsletterSection'), { ssr: true })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: true })



export const metadata = {
  title: 'Karya Saarthi - Project Solutions With Education | Complete Your Project + Learn',
  description: 'Transform your academic success. Get expert thesis writing, web development, and study abroad help. We teach while we complete. 500+ projects completed. 98% satisfaction.',
  openGraph: {
    title: 'Karya Saarthi - Project Solutions With Education',
    description: 'India\'s first project solutions company where education meets execution. Expert thesis writing, web development, digital marketing & AI solutions.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Karya Saarthi - Project Solutions With Education',
    description: 'Transform your academic success. 500+ projects completed. 98% satisfaction rate.',
    images: ['/og-image.png'],
  },
}

async function getHomepageSettings() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('homepage_settings')
      .select('*')
      .eq('id', 1)
      .single()
    if (error || !data) return DEFAULT_HOMEPAGE_SETTINGS
    return { ...DEFAULT_HOMEPAGE_SETTINGS, ...data }
  } catch {
    return DEFAULT_HOMEPAGE_SETTINGS
  }
}

export default async function Home() {
  // Fetch homepage settings + partners in parallel
  const [settings, partnersResult] = await Promise.allSettled([
    getHomepageSettings(),
    (async () => {
      const supabase = await createClient()
      const { data } = await supabase
        .from('marketing_partnered_companies')
        .select('id, name, logo_url, website')
        .order('created_at', { ascending: false })
      return data || []
    })(),
  ])

  const homepageSettings = settings.status === 'fulfilled' ? settings.value : DEFAULT_HOMEPAGE_SETTINGS
  const partners = partnersResult.status === 'fulfilled' ? partnersResult.value : []

  const defaultPartners = [
    // Text-only entries (no logo_url) so the marquee renders brand names cleanly
    // without broken external image requests hitting the console
    { name: 'AMD',              website: 'https://www.amd.com' },
    { name: 'VibCare',          website: 'https://vibcare.in' },
    { name: 'Amazon',           website: 'https://www.amazon.in' },
    { name: 'Google',           website: 'https://www.google.com' },
    { name: 'Microsoft',        website: 'https://www.microsoft.com' },
    { name: 'IIT Delhi',        website: 'https://home.iitd.ac.in' },
    { name: 'DU',               website: 'https://www.du.ac.in' },
    { name: 'IGNOU',            website: 'https://www.ignou.ac.in' },
  ]

  const displayPartners = partners.length > 0 ? partners : defaultPartners

  return (
    <>
      {/* Ticker banner — above the navbar */}
      {homepageSettings.ticker_enabled && (
        <TickerBanner
          text={homepageSettings.ticker_text}
          color={homepageSettings.ticker_color}
          bg={homepageSettings.ticker_bg}
          enabled={homepageSettings.ticker_enabled}
        />
      )}
      <Navbar />
      <main id="main-content">
        <HeroSection heroStats={homepageSettings.hero_stats} />
        <ServiceTiles tiles={homepageSettings.service_tiles} />
        <HowItWorks />
        <PillarsSection />
        <StatsSection stats={homepageSettings.stats_section} />
        <EventsPreviewSection />
        <HackathonsSection />
        <PodcastsSection />
        <BlogSection />
        <TestimonialsSection />
        <QuickAccessDashboard />
        <FAQSection />
        <SaarthiXpressBanner />
        <CTABanner />
        <NewsletterSection />
        <PartnersMarquee partners={displayPartners} />
      </main>
      <Footer />
    </>
  )
}
