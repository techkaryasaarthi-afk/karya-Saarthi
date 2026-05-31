import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import LiveStatsBar from '@/components/LiveStatsBar'
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
const TestimonialsSection = dynamic(() => import('@/components/TestimonialsSection'), { ssr: true })
const QuickAccessDashboard = dynamic(() => import('@/components/QuickAccessDashboard'))
const CTABanner = dynamic(() => import('@/components/CTABanner'), { ssr: true })
const NewsletterSection = dynamic(() => import('@/components/NewsletterSection'), { ssr: true })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: true })

// These are client-heavy widgets, definitely lazy load them
const Chatbot = dynamic(() => import('@/components/Chatbot'))
const WhatsAppWidget = dynamic(() => import('@/components/WhatsAppWidget'))

export const metadata = {
  title: 'Karya Saarthi — Hum Hai Aapke Saathi | Academic, Technical & Business Services',
  description: 'Karya Saarthi provides expert academic writing, technical, business, and government services across India. Get free quotes, track your project, and connect with our dedicated Saarthi support system.',
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
      <LiveStatsBar />
      <ServiceTiles />
      <HowItWorks />
      <PillarsSection />
      <StatsSection />
      <EventsPreviewSection />
      <HackathonsSection />
      <PodcastsSection />
      <TestimonialsSection />
      <QuickAccessDashboard />
      <CTABanner />
      <NewsletterSection />
      <PartnersMarquee partners={displayPartners} />
      <Footer />
      <Chatbot />
      <WhatsAppWidget />
    </>
  )
}
