'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

const stats = [
  { value: '500+', label: 'Projects Completed' },
  { value: '2000+', label: 'Happy Clients' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '5★', label: 'Average Rating' },
]

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      el.style.setProperty('--gx', `${x}%`)
      el.style.setProperty('--gy', `${y}%`)
    }
    el.addEventListener('mousemove', onMouseMove)
    return () => el.removeEventListener('mousemove', onMouseMove)
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-label="Hero — Your Trusted Partner"
      className="hero-section"
      style={{
        backgroundColor: 'var(--color-canvas)',
        paddingTop: 'calc(56px + 80px)',
        paddingBottom: 'var(--space-section)',
        paddingLeft: 'var(--space-xl)',
        paddingRight: 'var(--space-xl)',
        position: 'relative',
        overflow: 'hidden',
        '--gx': '50%',
        '--gy': '50%',
      } as React.CSSProperties}
    >
      {/* Subtle radial mouse-follow glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(600px circle at var(--gx) var(--gy), rgba(0,153,255,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
          transition: 'background 0.1s',
        }}
      />

      <div style={{ maxWidth: 1199, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="hero-grid">

          {/* ── Left: Text ─────────────────────────────────── */}
          <div className="hero-left">

            {/* Eyebrow chip */}
            <div className="hero-reveal" style={{ marginBottom: 'var(--space-lg)' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                backgroundColor: 'var(--color-surface-1)',
                color: 'var(--color-ink-muted)',
                fontSize: 'var(--text-caption-size)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-hairline)',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-accent-blue)', display: 'inline-block', flexShrink: 0 }} />
                India&apos;s First Project Solutions Company Where Education Meets Execution
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-display-xxl hero-headline hero-reveal"
              style={{
                color: 'var(--color-ink)',
                marginBottom: 'var(--space-md)',
                fontFamily: 'var(--font-sora, "Sora", sans-serif)',
                fontWeight: 700,
              }}
            >
              Your Trusted<br />Work Companion
            </h1>

            {/* Tagline */}
            <p
              className="hero-reveal"
              style={{
                color: 'var(--color-accent-blue)',
                fontSize: 'var(--text-body-lg-size)',
                fontWeight: 500,
                fontFamily: 'var(--font-sora, "Sora", sans-serif)',
                fontStyle: 'italic',
                marginBottom: 'var(--space-lg)',
              }}
            >
              Hum Hai Aapke Saathi — Your Trusted Partner
            </p>

            {/* Subheadline */}
            <p
              className="text-body-lg hero-reveal"
              style={{
                color: 'var(--color-ink-muted)',
                maxWidth: 520,
                marginBottom: 'var(--space-lg)',
              }}
            >
              Struggling with your thesis? Can&apos;t complete your project? Need a website built? Karya Saarthi is your one-stop solution. We don&apos;t just complete projects — we teach you everything. So when you submit or present, you do it with confidence.
            </p>



            {/* CTA row */}
            <div
              className="hero-reveal hero-cta-row"
              style={{
                display: 'flex', gap: 'var(--space-xs)',
                flexWrap: 'wrap', alignItems: 'center',
                marginBottom: 'var(--space-xxl)',
              }}
            >
              <Link href="/contact" className="btn-primary" style={{ minWidth: 148, fontFamily: 'var(--font-inter, "Inter", sans-serif)', fontWeight: 500 }}>
                Get Free Quote Now
              </Link>
              <Link href="/login?role=vendor" className="btn-secondary" style={{ minWidth: 148, fontFamily: 'var(--font-inter, "Inter", sans-serif)', fontWeight: 500 }}>
                Vendor Login
              </Link>
            </div>

            {/* Social Proof */}
            <div className="hero-reveal" style={{ marginBottom: 'var(--space-lg)', animationDelay: '210ms' }}>
              <p style={{ fontSize: 'var(--text-caption-size)', fontWeight: 600, color: 'var(--color-ink-muted)' }}>
                Trusted by 2000+ Students from Top Universities
              </p>
            </div>

            {/* Stats row */}
            <div
              className="hero-stats-grid hero-reveal"
              style={{
                paddingTop: 'var(--space-lg)',
                borderTop: '1px solid var(--color-hairline-soft)',
                animationDelay: '240ms',
              }}
            >
              {stats.map((s, i) => (
                <div key={s.label} style={{ animationDelay: `${300 + i * 60}ms` }}>
                  <p className="text-display-md" style={{ color: 'var(--color-ink)', marginBottom: 4 }}>{s.value}</p>
                  <p className="text-caption" style={{ color: 'var(--color-ink-muted)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Video ────────────────────────────────── */}
          <div className="hero-right hero-reveal" style={{ animationDelay: '100ms' }}>

            {/* Ambient glow behind the card */}
            <div aria-hidden="true" style={{
              position: 'absolute',
              inset: -40,
              background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(106,76,245,0.18) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0,
            }} />

            {/* Video card with browser chrome */}
            <div className="hero-video-card" style={{ position: 'relative', zIndex: 1 }}>

              {/* Browser chrome bar */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 16px',
                borderBottom: '1px solid var(--color-hairline)',
                backgroundColor: 'var(--color-surface-2)',
                borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
              }}>
                {['#ff5f57','#ffbd2e','#28ca41'].map(c => (
                  <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: c, flexShrink: 0 }} />
                ))}
                <div style={{
                  flex: 1, height: 24, backgroundColor: 'var(--color-surface-1)',
                  borderRadius: 'var(--radius-pill)', marginLeft: 8,
                  display: 'flex', alignItems: 'center', paddingLeft: 12, maxWidth: 280,
                }}>
                  <span style={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>karyasaarthi.com</span>
                </div>
              </div>

              {/* Video */}
              <div style={{
                backgroundColor: '#000',
                borderRadius: '0 0 var(--radius-xl) var(--radius-xl)',
                overflow: 'hidden',
                lineHeight: 0,
                /* Reserve exact space so CLS is 0 — matches video maxHeight */
                aspectRatio: '16/9',
                maxHeight: 380,
              }}>
                <video
                  src="/images/karyasaarthi.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="none"
                  aria-label="Karya Saarthi platform demo"
                  style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
                  onError={(e) => {
                    const el = e.currentTarget as HTMLVideoElement
                    el.style.opacity = '0'
                  }}
                >

                </video>
              </div>
            </div>

            {/* Floating "Project delivered" badge */}
            <div style={{
              position: 'absolute',
              bottom: -16, left: -16,
              backgroundColor: 'var(--color-surface-2)',
              border: '1px solid var(--color-hairline)',
              borderRadius: 'var(--radius-xl)',
              padding: '12px 16px',
              zIndex: 2,
              display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: 'var(--shadow-level-2)',
              animation: 'hero-badge-float 3s ease-in-out infinite',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--radius-full)',
                backgroundColor: '#0d1f17',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>🤝</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.3px' }}>Your Saarthi</p>
              </div>
            </div>

            {/* Top-right "Live" badge */}
            <div style={{
              position: 'absolute', top: -12, right: -12, zIndex: 2,
              backgroundColor: 'var(--color-surface-2)',
              border: '1px solid rgba(0,153,255,0.25)',
              borderRadius: 'var(--radius-xl)',
              padding: '8px 14px',
              display: 'flex', alignItems: 'center', gap: 7,
              animation: 'hero-badge-float 3s ease-in-out infinite',
              animationDelay: '1.5s',
              boxShadow: 'var(--shadow-level-2)',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block', animation: 'live-pulse 1.4s ease-in-out infinite' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink)' }}>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hero-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hero-badge-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes live-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.3); }
        }

        /* Content is VISIBLE immediately — animation is progressive enhancement only */
        .hero-reveal { opacity: 1; }

        /* Apply animation only when user has no motion preference */
        /* fill-mode: forwards (NOT both) so elements stay visible during delay */
        @media (prefers-reduced-motion: no-preference) {
          .hero-reveal {
            animation: hero-fade-up 0.4s var(--ease-out) forwards;
          }
        }

        .hero-video-card {
          border-radius: var(--radius-xl);
          border: 1px solid var(--color-hairline-soft);
          overflow: hidden;
          box-shadow: 0 0 0 1px var(--color-hairline-soft), 0 32px 80px rgba(0,0,0,0.6);
          transition: box-shadow 0.3s;
        }
        .hero-video-card:hover {
          box-shadow: 0 0 0 1px rgba(0,153,255,0.2), 0 32px 80px rgba(0,0,0,0.7), 0 0 40px rgba(0,153,255,0.08);
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        .hero-right { position: relative; }
        .hero-headline { font-family: var(--font-display); }
        .hero-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-lg);
        }
        @media (max-width: 1024px) { .hero-grid { gap: 48px; } }
        @media (max-width: 810px) {
          .hero-grid { grid-template-columns: 1fr; gap: 48px; }
          .hero-right { order: -1; max-width: 520px; margin: 0 auto; width: 100%; }
          .hero-headline {
            font-size: clamp(36px, 9vw, 64px) !important;
            line-height: 1.1 !important;
            letter-spacing: -1.5px !important;
            word-break: break-word;
          }
          .hero-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
        }
        @media (max-width: 480px) {
          .hero-section {
            padding-left: 16px !important;
            padding-right: 16px !important;
            padding-top: calc(56px + 48px) !important;
          }
          .hero-grid { gap: 28px; }
          .hero-headline {
            font-size: clamp(32px, 10vw, 52px) !important;
            line-height: 1.15 !important;
            letter-spacing: -1px !important;
          }
          .hero-cta-row {
            flex-direction: column;
            align-items: stretch !important;
          }
          .hero-cta-row .btn-primary,
          .hero-cta-row .btn-secondary {
            width: 100%;
            min-width: unset !important;
            justify-content: center;
          }
          .hero-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
        }
      `}</style>
    </section>
  )
}
