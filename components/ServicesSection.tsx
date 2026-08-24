'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useReveal } from '@/hooks/useReveal'

interface Service {
  id: number
  title: string
  slug: string
  category: string
  short_description: string
  price_min: number | null
  featured_image: string | null
  is_featured: boolean
  tags: string[]
}

const CAT_COLORS: Record<string, string> = {
  academic:   '#8B5CF6',
  technical:  '#3B82F6',
  business:   '#10B981',
  government: '#F59E0B',
  design:     '#EC4899',
  marketing:  '#EF4444',
  legal:      '#6B7280',
  other:      '#FF6B35',
}

const CAT_ICONS: Record<string, string> = {
  academic: '🎓', technical: '💻', business: '💼',
  government: '🏛️', design: '🎨', marketing: '📣', legal: '⚖️', other: '📁',
}

export default function ServicesSection() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const sectionRef = useReveal()

  useEffect(() => {
    fetch('/api/services?limit=6&sort=featured')
      .then(r => r.json())
      .then(d => setServices(d.services || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

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

        {/* Service Cards Grid */}
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-sm)' }}
          className="services-grid"
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card-template" style={{ minHeight: 200, padding: 20, opacity: 0.5, animation: 'pulse 1.5s ease-in-out infinite' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: 'var(--color-surface-2)', marginBottom: 16 }} />
                  <div style={{ height: 14, borderRadius: 6, backgroundColor: 'var(--color-surface-2)', marginBottom: 10, width: '70%' }} />
                  <div style={{ height: 10, borderRadius: 6, backgroundColor: 'var(--color-surface-2)', marginBottom: 6 }} />
                  <div style={{ height: 10, borderRadius: 6, backgroundColor: 'var(--color-surface-2)', width: '80%' }} />
                </div>
              ))
            : services.length === 0
            ? null
            : services.map((s, i) => {
                const catKey = s.category.toLowerCase()
                const color = CAT_COLORS[catKey] || CAT_COLORS.other
                const icon  = CAT_ICONS[catKey]  || '📁'
                return (
                  <Link
                    key={s.id}
                    href={`/services/${s.slug}`}
                    className="reveal card-template"
                    style={{
                      display: 'flex', flexDirection: 'column',
                      minHeight: 200, padding: 0,
                      textDecoration: 'none', overflow: 'hidden',
                      transitionDelay: `${i * 40}ms`,
                    }}
                  >
                    {/* Image or color block */}
                    {s.featured_image ? (
                      <div style={{ position: 'relative', aspectRatio: '16/9', flexShrink: 0, background: `${color}15` }}>
                        <Image src={s.featured_image} alt={s.title} fill style={{ objectFit: 'cover' }} sizes="400px" />
                      </div>
                    ) : (
                      <div style={{ aspectRatio: '16/9', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg,${color}18,${color}06)`, fontSize: 36 }}>
                        {icon}
                      </div>
                    )}
                    {/* Content */}
                    <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'capitalize', padding: '2px 8px', borderRadius: 'var(--radius-pill)', background: `${color}18`, color }}>{s.category}</span>
                        {s.is_featured && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 'var(--radius-pill)', backgroundColor: '#0d1f17', color: '#22c55e' }}>⭐ Featured</span>}
                      </div>
                      <h3 className="text-body-sm" style={{ color: 'var(--color-ink)', marginBottom: 6, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{s.title}</h3>
                      <p className="text-body-sm" style={{ color: 'var(--color-ink-muted)', lineHeight: 1.5, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{s.short_description}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                        {s.price_min
                          ? <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-ink)' }}>From ₹{s.price_min.toLocaleString('en-IN')}</span>
                          : <span style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>Custom pricing</span>}
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-accent-blue)' }}>Explore →</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
        </div>

        {/* View all CTA */}
        {!loading && (
          <div className="reveal" style={{ textAlign: 'center', marginTop: 48 }}>
            <Link href="/services" className="btn-secondary">
              View All Services
            </Link>
          </div>
        )}
      </div>

      <style>{`
        .services-grid { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 1024px) { .services-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) {
          .services-grid { grid-template-columns: 1fr; }
          .services-section { padding-left: 16px !important; padding-right: 16px !important; }
        }
        @keyframes pulse { 0%,100% { opacity: 0.5 } 50% { opacity: 0.8 } }
      `}</style>
    </section>
  )
}

