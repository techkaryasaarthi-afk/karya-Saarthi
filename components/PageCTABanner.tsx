import Link from 'next/link'

interface PageCTABannerProps {
  headline?:      string
  subtext?:       string
  primaryLabel?:  string
  primaryHref?:   string
  secondaryLabel?: string
  secondaryHref?:  string
  /** 'magenta' | 'violet' | 'orange' — gradient spotlight card variant */
  variant?: 'magenta' | 'violet' | 'orange'
}

const GRADIENT_BG: Record<string, string> = {
  magenta: 'linear-gradient(135deg, #d44df0 0%, #8b2fc9 100%)',
  violet:  'linear-gradient(135deg, #6a4cf5 0%, #4a2cd5 100%)',
  orange:  'linear-gradient(135deg, #ff7a3d 0%, #e05a1d 100%)',
}

export default function PageCTABanner({
  headline      = 'Ready to Get Started?',
  subtext       = 'Join 500+ satisfied clients who trust Karya Saarthi. Get your free quote in minutes.',
  primaryLabel  = 'Get Free Quote',
  primaryHref   = '/contact',
  secondaryLabel = 'WhatsApp Us',
  secondaryHref  = 'https://wa.me/918595025753',
  variant        = 'magenta',
}: PageCTABannerProps) {
  const bg = GRADIENT_BG[variant] ?? GRADIENT_BG.magenta
  const isExternalSecondary = secondaryHref.startsWith('http')

  return (
    <section
      style={{
        background: bg,
        borderRadius: 'var(--radius-xxl)',
        padding: '64px var(--space-xl)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        /* spotlight-breathe animation (#13) */
        animation: 'spotlight-breathe 4s ease-in-out infinite',
        margin: 'var(--space-xl)',
        maxWidth: 1199,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
      aria-label="Call to action"
    >
      {/* Decorative radial glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-40%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <h2
          className="text-display-lg"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--color-ink)',
            marginBottom: 16,
          }}
        >
          {headline}
        </h2>
        <p
          className="text-body-lg"
          style={{
            color: 'rgba(255,255,255,0.80)',
            maxWidth: 520,
            margin: '0 auto 36px',
          }}
        >
          {subtext}
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: 'var(--space-xs)', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
          <Link
            href={primaryHref}
            className="btn-primary"
            id="page-cta-primary"
          >
            {primaryLabel}
          </Link>

          {isExternalSecondary ? (
            <a
              href={secondaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-translucent"
              id="page-cta-secondary"
            >
              {secondaryLabel}
            </a>
          ) : (
            <Link
              href={secondaryHref}
              className="btn-translucent"
              id="page-cta-secondary"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
          {['Free Consultation', 'Response in 30 mins', '100% Confidential', 'Unlimited Revisions'].map(b => (
            <span
              key={b}
              className="text-micro"
              style={{ color: 'rgba(255,255,255,0.65)' }}
            >
              ✓ {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
