'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useReveal } from '@/hooks/useReveal'

const serviceCategories = [
  { key: 'all',       label: 'All' },
  { key: 'academic',  label: 'Academic' },
  { key: 'tech',      label: 'Web & Tech' },
  { key: 'design',    label: 'Design' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'writing',   label: 'Writing' },
]

const serviceCards = [
  { category: 'academic',  icon: '📖', title: 'Thesis & Research',      desc: 'Complete thesis support from topic selection to final submission with expert guidance.', badge: 'BESTSELLER', spotlight: false },
  { category: 'tech',      icon: '💻', title: 'Professional Website',    desc: 'Responsive, modern business websites built with the latest technologies.',                badge: 'HOT',        spotlight: false },
  { category: 'design',    icon: '🎨', title: 'Logo & Brand Design',     desc: 'Unique, professional logo design with unlimited revisions.',                               badge: '',           spotlight: false },
  { category: 'academic',  icon: '📝', title: 'Assignment Help',         desc: 'Subject-wise assignment help with detailed explanations and learning.',                    badge: 'POPULAR',    spotlight: false },
  { category: 'marketing', icon: '📈', title: 'SEO & Digital Marketing', desc: 'Improve your ranking and online presence with proven strategies.',                        badge: '',           spotlight: true  }, /* gradient card */
  { category: 'writing',   icon: '✍️', title: 'Blog & Article Writing',  desc: 'SEO-optimized content that engages readers and drives organic traffic.',                  badge: '',           spotlight: false },
  { category: 'design',    icon: '🎬', title: 'Video Editing',           desc: 'YouTube videos, reels, and promotional videos with cinematic quality.',                   badge: '',           spotlight: false },
  { category: 'writing',   icon: '📄', title: 'Resume & Cover Letter',   desc: 'ATS-friendly professional resumes that get you noticed by top recruiters.',               badge: '',           spotlight: false },
  { category: 'tech',      icon: '🤖', title: 'AI & Automation',         desc: 'Custom AI solutions and workflow automation that scale with your business.',              badge: '',           spotlight: true  }, /* gradient card */
]

const badgeStyle: Record<string, React.CSSProperties> = {
  BESTSELLER: { backgroundColor: '#0d1f17', color: '#22c55e' },
  HOT:        { backgroundColor: '#1a0808', color: '#f87171' },
  POPULAR:    { backgroundColor: '#0d1020', color: '#818cf8' },
  NEW:        { backgroundColor: '#001a1a', color: '#2dd4bf' },
}

export default function ServicesSection() {
  const [active, setActive] = useState('all')
  const sectionRef = useReveal()
  const filtered = active === 'all' ? serviceCards : serviceCards.filter(s => s.category === active)

  return (
    <section
      id="services"
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="services-section"
      style={{
        backgroundColor: 'var(--color-canvas)',
        paddingTop: 'var(--space-section)',
        paddingBottom: 'var(--space-section)',
        paddingLeft: 'var(--space-xl)',
        paddingRight: 'var(--space-xl)',
      }}
      aria-label="Our Services"
    >
      <div style={{ maxWidth: 1199, margin: '0 auto' }}>

        {/* Header */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{
            display: 'inline-block',
            backgroundColor: 'var(--color-surface-1)',
            color: 'var(--color-ink-muted)',
            fontSize: 'var(--text-caption-size)',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '4px 12px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--color-hairline)',
            marginBottom: 20,
          }}>
            Our Services
          </span>
          <h2 className="text-display-lg" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-display)', marginBottom: 16 }}>
            Popular Services
          </h2>
          <p className="text-body-lg" style={{ color: 'var(--color-ink-muted)', maxWidth: 520, margin: '0 auto' }}>
            Choose from our most-requested professional services — no hidden fees, no surprises.
          </p>
        </div>

        {/* Category Tab Pills */}
        <div className="reveal" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 48 }}>
          {serviceCategories.map(c => (
            <button
              key={c.key}
              onClick={() => setActive(c.key)}
              className={`tab-pill${active === c.key ? ' active' : ''}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Service Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--space-sm)',
          }}
          className="services-grid"
        >
          {filtered.map((s, i) =>
            s.spotlight ? (
              /* Gradient spotlight card */
              <div
                key={s.title}
                className={`reveal card-spotlight ${s.title.includes('AI') ? 'card-spotlight-violet' : 'card-spotlight-orange'}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  minHeight: 200,
                  transitionDelay: `${i * 40}ms`,
                }}
              >
                <span style={{ fontSize: 36, marginBottom: 12 }}>{s.icon}</span>
                <h3 className="text-headline" style={{ color: 'var(--color-ink)', marginBottom: 8 }}>{s.title}</h3>
                <p className="text-body-sm" style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 20 }}>{s.desc}</p>
                <Link href="/services" className="btn-translucent" style={{ alignSelf: 'flex-start' }}>
                  Learn more
                </Link>
              </div>
            ) : (
              /* Standard template-card */
              <div
                key={s.title}
                className="reveal card-template"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 200,
                  padding: 20,
                  transitionDelay: `${i * 40}ms`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{
                    width: 40, height: 40,
                    backgroundColor: 'var(--color-surface-2)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0,
                  }}>
                    {s.icon}
                  </div>
                  {s.badge && (
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      padding: '3px 7px',
                      borderRadius: 'var(--radius-pill)',
                      letterSpacing: '0.04em',
                      ...badgeStyle[s.badge],
                    }}>
                      {s.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-body-sm" style={{ color: 'var(--color-ink)', marginBottom: 8, fontWeight: 600 }}>{s.title}</h3>
                <p className="text-body-sm" style={{ color: 'var(--color-ink-muted)', lineHeight: 1.5, flex: 1 }}>{s.desc}</p>
                <Link
                  href="/services"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: 16,
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--color-accent-blue)',
                    textDecoration: 'none',
                    transition: 'gap var(--dur-fast) var(--ease-out)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.gap = '8px')}
                  onMouseLeave={e => (e.currentTarget.style.gap = '4px')}
                >
                  Explore →
                </Link>
              </div>
            )
          )}
        </div>

        {/* View all CTA */}
        <div className="reveal" style={{ textAlign: 'center', marginTop: 48 }}>
          <Link href="/services" className="btn-secondary">
            View All Services
          </Link>
        </div>
      </div>

      <style>{`
        .services-grid {
          grid-template-columns: repeat(3, 1fr);
        }
        @media (max-width: 1024px) {
          .services-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .services-grid { grid-template-columns: 1fr; }
          .services-section { padding-left: 16px !important; padding-right: 16px !important; }
        }
      `}</style>
    </section>
  )
}
