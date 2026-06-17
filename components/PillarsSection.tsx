'use client'

import Link from 'next/link'
import { useReveal } from '@/hooks/useReveal'

const pillars = [
  {
    id: 'campus',
    name: 'Campus Saarthi',
    tagline: 'Empowering Students',
    description: 'Campus ambassadors network connecting students with academic excellence, internships, and college projects.',
    icon: '🎓',
    accent: '#6a4cf5',
    features: ['College Ambassador Program', 'Academic Project Support', 'Campus Workshops', 'Student Referral Rewards'],
    stat: '200+ Colleges',
  },
  {
    id: 'digital',
    name: 'Digital Saarthi',
    tagline: 'Content & Presence',
    description: 'Full-stack digital solutions for websites, SEO, content creation, social media and brand building.',
    icon: '💻',
    accent: '#0099ff',
    features: ['Website Development', 'SEO & Digital Marketing', 'Content Creation', 'Social Media Management'],
    stat: '1000+ Websites',
  },
  {
    id: 'calling',
    name: 'Calling Saarthi',
    tagline: 'Voice-First Outreach',
    description: 'Dedicated calling team for lead generation, customer follow-up, and relationship management.',
    icon: '📞',
    accent: '#ff7a3d',
    features: ['Lead Generation Calls', 'Customer Follow-up', 'Survey & Feedback', 'Appointment Setting'],
    stat: '50K+ Calls/yr',
  },
  {
    id: 'government',
    name: 'Government Saarthi',
    tagline: 'Public Sector Excellence',
    description: 'Specialised services for government schemes, tender documentation, and compliance management.',
    icon: '🏛️',
    accent: '#22c55e',
    features: ['Tender Documentation', 'Government Scheme Advisory', 'Compliance Management', 'Policy Research'],
    stat: '500+ Tenders',
  },
  {
    id: 'market',
    name: 'Market Saarthi',
    tagline: 'On-Ground Presence',
    description: 'Field agents network for hyperlocal marketing, offline lead generation, and on-ground business development.',
    icon: '🗺️',
    accent: '#f59e0b',
    features: ['Field Sales Agents', 'Hyperlocal Marketing', 'Offline Lead Capture', 'Territory Management'],
    stat: '12 States',
  },
]

export default function PillarsSection() {
  const ref = useReveal()

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="pillars-section"
      style={{
        backgroundColor: 'var(--color-canvas)',
        borderTop: '1px solid var(--color-hairline-soft)',
        padding: 'var(--space-section) var(--space-xl)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Faint dot grid */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.025, backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1199, margin: '0 auto', position: 'relative' }}>

        {/* Header */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(0,153,255,0.1)', color: 'var(--color-accent-blue)', border: '1px solid rgba(0,153,255,0.2)', marginBottom: 16 }}>
            Our Saarthi
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-1.5px', marginBottom: 14 }}>
            Five Specialised <span style={{ color: 'var(--color-accent-blue)' }}>Pillars</span>
          </h2>
          <p style={{ fontSize: 'var(--text-body-size)', color: 'var(--color-ink-muted)', maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
            Specialised verticals working together to deliver comprehensive solutions across student and business success.
          </p>
        </div>

        {/* Cards grid */}
        <div className="pillars-grid">
          {pillars.map((pillar, i) => (
            <div
              key={pillar.id}
              className="reveal pillar-card"
              style={{ animationDelay: `${i * 80}ms`, '--accent': pillar.accent } as React.CSSProperties}
            >
              {/* Top accent bar */}
              <div style={{ height: 2, backgroundColor: pillar.accent, borderRadius: '2px 2px 0 0', marginBottom: 20 }} />

              {/* Icon + stat */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', backgroundColor: `${pillar.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  {pillar.icon}
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--color-surface-2)', color: 'var(--color-ink-muted)', border: '1px solid var(--color-hairline)', whiteSpace: 'nowrap' }}>
                  {pillar.stat}
                </span>
              </div>

              {/* Content */}
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 4, fontFamily: 'var(--font-display)', letterSpacing: '-0.3px' }}>{pillar.name}</h3>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: pillar.accent, marginBottom: 10 }}>{pillar.tagline}</p>
              <p style={{ fontSize: 12, color: 'var(--color-ink-muted)', lineHeight: 1.55, marginBottom: 14 }}>{pillar.description}</p>

              {/* Features list */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {pillar.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-ink-muted)' }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: pillar.accent, flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={`/contact?pillar=${pillar.id}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '9px 0', borderRadius: 'var(--radius-md)', border: `1px solid ${pillar.accent}40`, backgroundColor: `${pillar.accent}12`, color: pillar.accent, fontSize: 12, fontWeight: 600, textDecoration: 'none', transition: 'background-color var(--dur-fast)' }}
              >
                Connect →
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="reveal" style={{ textAlign: 'center', marginTop: 48 }}>
          <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginBottom: 16 }}>All Saarthi teams work together under one platform: Karya Saarthi</p>
          <Link
            href="/contact"
            className="btn-primary"
            style={{ display: 'inline-flex', padding: '14px 32px' }}
          >
            Start Your Journey with Us
          </Link>
        </div>
      </div>

      <style>{`
        .pillars-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
        }
        .pillar-card {
          background: var(--color-surface-1);
          border: 1px solid var(--color-hairline-soft);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          flex-direction: column;
          transition: border-color var(--dur-fast), transform var(--dur-fast);
        }
        .pillar-card:hover {
          border-color: var(--accent, var(--color-hairline));
          transform: translateY(-4px);
        }
        @media (max-width: 1200px) { .pillars-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px)  { .pillars-grid { grid-template-columns: repeat(2, 1fr); } .pillars-section { padding-left: 16px !important; padding-right: 16px !important; } }
        @media (max-width: 480px)  { .pillars-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  )
}
