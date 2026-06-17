import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/server'
import PartnersMarquee from '@/components/PartnersMarquee'

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

export default async function Home() {
  let partners: any[] = []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('marketing_partnered_companies')
      .select('id, name, logo_url, website')
      .order('created_at', { ascending: false })
    if (data) {
      partners = data
    }
  } catch (e) {
    console.error('Error fetching partnered companies:', e)
  }

  const defaultPartners = [
    {
      name: 'AMD',
      logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/AMD_Logo.svg/320px-AMD_Logo.svg.png',
      website: 'https://www.amd.com',
    },
    {
      name: 'VibCare',
      logo_url: 'https://vibcare.in/wp-content/uploads/2023/10/vibcare-logo.png',
      website: 'https://vibcare.in',
    },
    {
      name: 'Amazon',
      logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/320px-Amazon_logo.svg.png',
      website: 'https://www.amazon.in',
    },
  ]

  const displayPartners = partners.length > 0 ? partners : defaultPartners

  return (
    <>
      <Navbar />
      <HeroSection />
      <ServiceTiles />
      <HowItWorks />
      <PillarsSection />
      <StatsSection />
      <EventsPreviewSection />
      <HackathonsSection />
      <PodcastsSection />
      <BlogSection />
      <TestimonialsSection />
      <QuickAccessDashboard />
      <FAQSection />
      <CTABanner />
      <NewsletterSection />
      <PartnersMarquee partners={displayPartners} />
      <Footer />

    </>
  )
}
