'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const pillars = [
  {
    id: 'campus',
    name: 'Campus Saarthi',
    tagline: 'Empowering Students',
    description: 'Campus ambassadors network connecting students with academic excellence, internships, and college projects.',
    icon: '🎓',
    gradient: 'from-blue-600 to-indigo-700',
    glow: 'rgba(99,102,241,0.3)',
    features: ['College Ambassador Program', 'Academic Project Support', 'Campus Workshops', 'Student Referral Rewards'],
    stat: '200+ Colleges',
  },
  {
    id: 'digital',
    name: 'Digital Saarthi',
    tagline: 'Content & Presence',
    description: 'Full-stack digital solutions for websites, SEO, content creation, social media and brand building.',
    icon: '💻',
    gradient: 'from-violet-600 to-purple-700',
    glow: 'rgba(139,92,246,0.3)',
    features: ['Website Development', 'SEO & Digital Marketing', 'Content Creation', 'Social Media Management'],
    stat: '1000+ Websites',
  },
  {
    id: 'calling',
    name: 'Calling Saarthi',
    tagline: 'Voice-First Outreach',
    description: 'Dedicated calling team for lead generation, customer follow-up, and relationship management.',
    icon: '📞',
    gradient: 'from-orange-500 to-red-600',
    glow: 'rgba(249,115,22,0.3)',
    features: ['Lead Generation Calls', 'Customer Follow-up', 'Survey & Feedback', 'Appointment Setting'],
    stat: '50K+ Calls/yr',
  },
  {
    id: 'government',
    name: 'Government Saarthi',
    tagline: 'Public Sector Excellence',
    description: 'Specialised services for government schemes, tender documentation, and compliance management.',
    icon: '🏛️',
    gradient: 'from-emerald-600 to-teal-700',
    glow: 'rgba(16,185,129,0.3)',
    features: ['Tender Documentation', 'Government Scheme Advisory', 'Compliance Management', 'Policy Research'],
    stat: '500+ Tenders',
  },
  {
    id: 'market',
    name: 'Market Saarthi',
    tagline: 'On-Ground Presence',
    description: 'Field agents network for hyperlocal marketing, offline lead generation, and on-ground business development.',
    icon: '🗺️',
    gradient: 'from-amber-500 to-orange-600',
    glow: 'rgba(245,158,11,0.3)',
    features: ['Field Sales Agents', 'Hyperlocal Marketing', 'Offline Lead Capture', 'Territory Management'],
    stat: '12 States',
  },
]

export default function PillarsSection() {
  return (
    <section className="relative overflow-hidden bg-[#080d1a] py-20">
      <div
        className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
      />
      <div className="absolute left-0 right-0 top-0 h-16 bg-gradient-to-b from-white/5 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <span
            className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
            style={{ background: 'rgba(255,107,53,0.15)', color: '#FF6B35', border: '1px solid rgba(255,107,53,0.3)' }}
          >
            Our Saarthi
          </span>
          <h2 className="mb-4 text-4xl font-extrabold text-white font-heading md:text-5xl">
            Our <span style={{ color: '#FF6B35' }}>Saarthi Pillars</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/50">
            Specialised verticals working together to deliver comprehensive solutions across student and business success.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl h-full ${i === 4 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <motion.div
                className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ boxShadow: `inset 0 0 60px ${pillar.glow}` }}
              />

              <div className={`h-1 bg-gradient-to-r ${pillar.gradient}`} />

              <div className="p-3.5 flex flex-col justify-between flex-grow h-full">
                <div>
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-lg shadow-md ${pillar.gradient}`}>
                      {pillar.icon}
                    </div>
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white/60"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      {pillar.stat}
                    </span>
                  </div>

                  <h3 className="mb-0.5 text-base font-bold leading-snug text-white font-heading">{pillar.name}</h3>
                  <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-white/40">{pillar.tagline}</p>
                  <p className="mb-3 text-[11px] leading-relaxed text-white/50">{pillar.description}</p>

                  <ul className="mb-3 space-y-1">
                    {pillar.features.map(feat => (
                      <li key={feat} className="flex items-center gap-1.5 text-[10px] text-white/40">
                        <div className={`h-1 w-1 flex-shrink-0 rounded-full bg-gradient-to-br ${pillar.gradient}`} />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-2">
                  <Link
                    href={`/contact?pillar=${pillar.id}`}
                    className={`inline-flex w-full justify-center items-center gap-1 rounded-lg bg-gradient-to-r px-2.5 py-1.5 text-[10px] font-semibold text-white shadow-md transition-opacity hover:opacity-90 ${pillar.gradient}`}
                  >
                    Connect →
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="mb-4 text-sm text-white/30">All Saarthi teams work together under one platform: Karya Saarthi</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #FF6B35, #e0551f)', boxShadow: '0 8px 24px rgba(255,107,53,0.3)' }}
          >
            Start Your Journey with Us
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
