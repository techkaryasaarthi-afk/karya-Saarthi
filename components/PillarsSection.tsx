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
    gradient: 'linear-gradient(135deg, rgba(106,76,245,0.15) 0%, rgba(106,76,245,0.03) 100%)',
  },
  {
    icon: '⚡',
    title: 'Fast Turnaround',
    description: 'Our Saarthi Express team handles urgent tasks within 1–24 hours without compromising on quality.',
    accent: '#ff7a3d',
    stat: '500+',
    statLabel: 'Express Orders',
    gradient: 'linear-gradient(135deg, rgba(255,122,61,0.15) 0%, rgba(255,122,61,0.03) 100%)',
  },
  {
    icon: '🔒',
    title: 'Secure & Confidential',
    description: 'Your data, projects, and submissions remain strictly confidential. We sign NDAs upon request.',
    accent: '#22c55e',
    stat: '100%',
    statLabel: 'Data Privacy',
    gradient: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.03) 100%)',
  },
  {
    icon: '👨‍💼',
    title: 'Expert Professionals',
    description: 'Every project is handled by domain experts — engineers, researchers, designers, and digital marketers.',
    accent: '#0099ff',
    stat: '50+',
    statLabel: 'Expert Professionals',
    gradient: 'linear-gradient(135deg, rgba(0,153,255,0.15) 0%, rgba(0,153,255,0.03) 100%)',
  },
  {
    icon: '💰',
    title: 'Transparent Pricing',
    description: 'No hidden fees. Get clear quotes upfront with flexible payment options and student-friendly plans.',
    accent: '#f59e0b',
    stat: '98%',
    statLabel: 'Satisfaction Rate',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.03) 100%)',
  },
  {
    icon: '🌍',
    title: 'All-in-One Platform',
    description: 'From academics to business — web development, research, SEO, video editing, and more under one roof.',
    accent: '#e11d48',
    stat: '100+',
    statLabel: 'Services Available',
    gradient: 'linear-gradient(135deg, rgba(225,29,72,0.15) 0%, rgba(225,29,72,0.03) 100%)',
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
      {/* Decorative blobs */}
      <div aria-hidden="true" style={{ position: 'absolute', top: '-15%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(106,76,245,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div aria-hidden="true" style={{ position: 'absolute', bottom: '-15%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,153,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1199, margin: '0 auto', position: 'relative' }}>

        {/* Header */}
        <div className="reveal why-header" style={{ textAlign: 'center', marginBottom: 60 }}>
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', padding: '5px 14px', borderRadius: 'var(--radius-pill)',
            backgroundColor: 'rgba(106,76,245,0.1)', color: '#6a4cf5',
            border: '1px solid rgba(106,76,245,0.2)', marginBottom: 18,
          }}>
            Why Us
          </span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(26px, 4vw, 48px)',
            fontWeight: 700, color: 'var(--color-ink)',
            letterSpacing: '-1.5px', marginBottom: 14,
          }}>
            Why Choose <span style={{ color: '#6a4cf5' }}>Karya Saarthi</span>?
          </h2>
          <p style={{
            fontSize: 'var(--text-body-size)', color: 'var(--color-ink-muted)',
            maxWidth: 520, margin: '0 auto', lineHeight: 1.65,
          }}>
            We&apos;re not just a service provider — we&apos;re your growth partner.
            Here&apos;s what sets us apart.
          </p>
        </div>

        {/* Cards grid */}
        <div className="why-grid">
          {reasons.map((r, i) => (
            <div
              key={r.title}
              className="reveal why-card"
              style={{ '--accent': r.accent, '--card-gradient': r.gradient, transitionDelay: `${i * 70}ms` } as React.CSSProperties}
            >
              {/* Gradient background fill on hover via CSS */}
              <div className="why-card__bg" aria-hidden="true" />

              {/* Top row: icon + stat */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                {/* Icon */}
                <div className="why-card__icon">
                  <span style={{ fontSize: 22 }}>{r.icon}</span>
                </div>

                {/* Stat badge */}
                <div className="why-card__stat">
                  <p className="why-card__stat-value">{r.stat}</p>
                  <p className="why-card__stat-label">{r.statLabel}</p>
                </div>
              </div>

              {/* Accent line */}
              <div className="why-card__line" />

              {/* Title */}
              <h3 className="why-card__title">{r.title}</h3>

              {/* Description */}
              <p className="why-card__desc">{r.description}</p>

              {/* Bottom arrow */}
              <div className="why-card__arrow" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="reveal why-cta" style={{ textAlign: 'center', marginTop: 56 }}>
          <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginBottom: 18 }}>
            Join 1000+ students and businesses who chose Karya Saarthi
          </p>
          <div style={{ display: 'inline-flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/services" className="btn-primary" style={{ padding: '14px 32px' }}>
              Explore Services →
            </Link>
            <Link href="/contact" className="btn-secondary" style={{ padding: '14px 32px' }}>
              Talk to Us
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        /* ── Why Grid ──────────────────────────────────────── */
        .why-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        /* ── Why Card ──────────────────────────────────────── */
        .why-card {
          position: relative;
          background: var(--color-surface-1);
          border: 1px solid var(--color-hairline-soft);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          cursor: default;
          transition:
            border-color 0.3s ease,
            transform 0.3s cubic-bezier(0.16,1,0.3,1),
            box-shadow 0.3s ease;
        }
        .why-card:hover {
          border-color: var(--accent);
          transform: translateY(-6px);
          box-shadow:
            0 20px 50px rgba(0,0,0,0.3),
            0 0 0 1px var(--accent) inset;
        }

        /* Gradient bg overlay — reveals on hover */
        .why-card__bg {
          position: absolute;
          inset: 0;
          background: var(--card-gradient);
          opacity: 0;
          transition: opacity 0.35s ease;
          pointer-events: none;
          z-index: 0;
        }
        .why-card:hover .why-card__bg { opacity: 1; }

        /* Icon container */
        .why-card__icon {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
          transition: background 0.3s, border-color 0.3s;
        }
        .why-card:hover .why-card__icon {
          background: color-mix(in srgb, var(--accent) 15%, transparent);
          border-color: color-mix(in srgb, var(--accent) 30%, transparent);
        }

        /* Stat */
        .why-card__stat {
          text-align: right;
          position: relative;
          z-index: 1;
        }
        .why-card__stat-value {
          font-size: 20px;
          font-weight: 800;
          color: var(--accent);
          line-height: 1;
          margin-bottom: 3px;
          font-family: var(--font-display);
        }
        .why-card__stat-label {
          font-size: 9px;
          font-weight: 700;
          color: var(--color-ink-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          line-height: 1.2;
          max-width: 80px;
        }

        /* Accent line */
        .why-card__line {
          height: 2px;
          width: 40px;
          background: linear-gradient(90deg, var(--accent), transparent);
          border-radius: 2px;
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
          transition: width 0.35s ease;
        }
        .why-card:hover .why-card__line { width: 70px; }

        /* Title */
        .why-card__title {
          font-size: 15px;
          font-weight: 700;
          color: var(--color-ink);
          margin-bottom: 10px;
          font-family: var(--font-display);
          letter-spacing: -0.3px;
          line-height: 1.3;
          position: relative;
          z-index: 1;
        }

        /* Desc */
        .why-card__desc {
          font-size: 13px;
          color: var(--color-ink-muted);
          line-height: 1.65;
          flex: 1;
          position: relative;
          z-index: 1;
        }

        /* Bottom arrow */
        .why-card__arrow {
          margin-top: 16px;
          color: var(--accent);
          opacity: 0;
          transform: translateX(-6px);
          transition: opacity 0.25s ease, transform 0.25s ease;
          position: relative;
          z-index: 1;
        }
        .why-card:hover .why-card__arrow {
          opacity: 1;
          transform: translateX(0);
        }

        /* ── Responsive ────────────────────────────────────── */
        @media (max-width: 1100px) {
          .why-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
        }
        @media (max-width: 768px) {
          .why-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .why-section { padding-left: 16px !important; padding-right: 16px !important; }
          .why-header { margin-bottom: 40px !important; }
        }
        @media (max-width: 480px) {
          .why-grid { grid-template-columns: 1fr; gap: 10px; }
          .why-card  { padding: 20px; border-radius: 16px; }
          .why-cta .btn-primary, .why-cta .btn-secondary {
            width: 100%;
            justify-content: center;
          }
          .why-cta > div { flex-direction: column; align-items: stretch; width: 100%; max-width: 300px; margin: 0 auto; }
        }
      `}</style>
    </section>
  )
}
