'use client'

import Link from 'next/link'

export default function CTABanner() {
  return (
    <section style={{
      padding: 'var(--space-section) var(--space-xl)',
      backgroundColor: 'var(--color-surface-1)',
      borderTop: '1px solid var(--color-hairline-soft)',
      borderBottom: '1px solid var(--color-hairline-soft)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background gradient accent */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 80% at 50% 110%, rgba(106,76,245,0.12) 0%, transparent 70%)',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', top: -60, right: -60, width: 320, height: 320,
        borderRadius: '50%', backgroundColor: 'rgba(0,153,255,0.04)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>

        {/* Badge */}
        <span style={{
          display: 'inline-block', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          padding: '4px 12px', borderRadius: 'var(--radius-pill)',
          backgroundColor: 'rgba(0,153,255,0.08)', color: 'var(--color-accent-blue)',
          border: '1px solid rgba(0,153,255,0.18)', marginBottom: 24,
        }}>
          Get Started Today
        </span>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 4vw, 52px)',
          fontWeight: 700,
          color: 'var(--color-ink)',
          letterSpacing: '-2px',
          marginBottom: 16,
          lineHeight: 1.05,
        }}>
          Ready to Get Started?
        </h2>

        <p style={{
          fontSize: 16, color: 'var(--color-ink-muted)',
          maxWidth: 480, margin: '0 auto 40px',
          lineHeight: 1.65,
        }}>
          Join 500+ satisfied clients who trust Karya Saarthi for their academic and professional needs. Get your free quote today.
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/contact" className="btn-primary" style={{ minWidth: 180, justifyContent: 'center', padding: '14px 32px', fontSize: 15 }}>
            Get Free Quote Now →
          </Link>
          <a
            href="https://wa.me/918595025753"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 28px', minWidth: 180, justifyContent: 'center',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--color-hairline)',
              backgroundColor: 'var(--color-surface-2)',
              color: 'var(--color-ink)',
              fontSize: 15, fontWeight: 600, textDecoration: 'none',
              transition: 'border-color 0.15s, background-color 0.15s',
            }}
            className="cta-wa-btn"
          >
            💬 WhatsApp Us
          </a>
        </div>

        {/* Trust strip */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 24, marginTop: 44, flexWrap: 'wrap',
        }}>
          {['⚡ 2-hr response', '🔒 100% secure', '✅ 2000+ clients', '⭐ 98% satisfaction'].map(t => (
            <span key={t} style={{ fontSize: 12, color: 'var(--color-ink-muted)', fontWeight: 500 }}>{t}</span>
          ))}
        </div>
      </div>

      <style>{`.cta-wa-btn:hover { border-color: rgba(34,197,94,0.4) !important; background-color: rgba(34,197,94,0.06) !important; }`}</style>
    </section>
  )
}
