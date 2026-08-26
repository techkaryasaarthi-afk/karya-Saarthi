'use client'

import Link from 'next/link'
import { useReveal } from '@/hooks/useReveal'

const reasons = [
  {
    icon: '🎓',
    title: 'Learn While We Deliver',
    description: 'We don\'t just complete your project — we teach you the concepts behind it, so you grow with every service.',
    accent: '#6a4cf5',
    stat: '1000+',
    statLabel: 'Students Mentored',
  },
  {
    icon: '⚡',
    title: 'Fast Turnaround',
    description: 'Our Saarthi Express team handles urgent tasks within 1–24 hours without compromising on quality.',
    accent: '#ff7a3d',
    stat: '500+',
    statLabel: 'Express Orders',
  },
  {
    icon: '🔒',
    title: 'Secure & Confidential',
    description: 'Your data, projects, and submissions remain strictly confidential. We sign NDAs upon request.',
    accent: '#22c55e',
    stat: '100%',
    statLabel: 'Data Privacy',
  },
  {
    icon: '👨‍💼',
    title: 'Expert Professionals',
    description: 'Every project is handled by domain experts — engineers, researchers, designers, and digital marketers.',
    accent: '#0099ff',
    stat: '50+',
    statLabel: 'Expert Professionals',
  },
  {
    icon: '💰',
    title: 'Transparent Pricing',
    description: 'No hidden fees. Get clear quotes upfront with flexible payment options and student-friendly plans.',
    accent: '#f59e0b',
    stat: '98%',
    statLabel: 'Satisfaction Rate',
  },
  {
    icon: '🌍',
    title: 'All-in-One Platform',
    description: 'From academics to business — web development, research, SEO, video editing, and more under one roof.',
    accent: '#e11d48',
    stat: '100+',
    statLabel: 'Services Available',
  },
]

export default function PillarsSection() {
  const ref = useReveal()

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="why-section"
      style={{
        backgroundColor: 'var(--color-canvas)',
        borderTop: '1px solid var(--color-hairline-soft)',
        padding: 'var(--space-section) var(--space-xl)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle background gradient */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(106,76,245,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1199, margin: '0 auto', position: 'relative' }}>

        {/* Header */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(106,76,245,0.1)', color: '#6a4cf5', border: '1px solid rgba(106,76,245,0.2)', marginBottom: 16 }}>
            Why Us
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-1.5px', marginBottom: 14 }}>
            Why Choose <span style={{ color: '#6a4cf5' }}>Karya Saarthi</span>?
          </h2>
          <p style={{ fontSize: 'var(--text-body-size)', color: 'var(--color-ink-muted)', maxWidth: 540, margin: '0 auto', lineHeight: 1.6 }}>
            We&apos;re not just a service provider — we&apos;re your growth partner. Here&apos;s what sets us apart from the rest.
          </p>
        </div>

        {/* Cards grid */}
        <div className="why-grid">
          {reasons.map((r, i) => (
            <div
              key={r.title}
              className="reveal why-card"
              style={{ animationDelay: `${i * 80}ms`, '--accent': r.accent } as React.CSSProperties}
            >
              {/* Top accent bar */}
              <div style={{ height: 3, background: `linear-gradient(90deg, ${r.accent}, ${r.accent}88)`, borderRadius: '3px 3px 0 0', marginBottom: 20 }} />

              {/* Icon + stat */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', backgroundColor: `${r.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: `1px solid ${r.accent}30` }}>
                  {r.icon}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: r.accent, lineHeight: 1, marginBottom: 2 }}>{r.stat}</p>
                  <p style={{ fontSize: 9, fontWeight: 600, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{r.statLabel}</p>
                </div>
              </div>

              {/* Content */}
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 8, fontFamily: 'var(--font-display)', letterSpacing: '-0.3px' }}>{r.title}</h3>
              <p style={{ fontSize: 12, color: 'var(--color-ink-muted)', lineHeight: 1.6 }}>{r.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="reveal" style={{ textAlign: 'center', marginTop: 52 }}>
          <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginBottom: 16 }}>Join 1000+ students and businesses who chose Karya Saarthi</p>
          <div style={{ display: 'inline-flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link
              href="/services"
              className="btn-primary"
              style={{ display: 'inline-flex', padding: '14px 32px' }}
            >
              Explore Services →
            </Link>
            <Link
              href="/contact"
              className="btn-secondary"
              style={{ display: 'inline-flex', padding: '14px 32px' }}
            >
              Talk to Us
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .why-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .why-card {
          background: var(--color-surface-1);
          border: 1px solid var(--color-hairline-soft);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          flex-direction: column;
          transition: border-color var(--dur-fast), transform var(--dur-fast), box-shadow var(--dur-fast);
        }
        .why-card:hover {
          border-color: var(--accent, var(--color-hairline));
          transform: translateY(-5px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.08);
        }
        @media (max-width: 1024px) { .why-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px)  {
          .why-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .why-section { padding-left: 16px !important; padding-right: 16px !important; }
        }
        @media (max-width: 480px)  {
          .why-grid { grid-template-columns: 1fr; gap: 10px; }
          .why-card { padding: 16px; }
        }
      `}</style>
    </section>
  )
}
