'use client'

import Image from 'next/image'

interface Partner {
  id?: string | number
  name: string
  logo_url?: string | null
  website?: string | null
}

export default function PartnersMarquee({ partners }: { partners: Partner[] }) {
  const list = [...partners, ...partners, ...partners]

  return (
    <div style={{
      backgroundColor: 'var(--color-surface-1)',
      borderTop: '1px solid var(--color-hairline-soft)',
      padding: '40px 0 36px',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Label */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <p style={{
          fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          color: 'var(--color-ink-muted)',
        }}>
          Trusted by Industry Leaders &amp; Partners
        </p>
      </div>

      {/* Marquee track */}
      <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* Fade edges */}
        <div style={{
          pointerEvents: 'none', position: 'absolute', left: 0, top: 0, bottom: 0, width: 120,
          background: 'linear-gradient(to right, var(--color-surface-1), transparent)',
          zIndex: 10,
        }} />
        <div style={{
          pointerEvents: 'none', position: 'absolute', right: 0, top: 0, bottom: 0, width: 120,
          background: 'linear-gradient(to left, var(--color-surface-1), transparent)',
          zIndex: 10,
        }} />

        {/* Scrolling items */}
        <div style={{ display: 'flex', gap: 16, animation: 'marquee-scroll 30s linear infinite', willChange: 'transform' }}>
          {list.map((p, idx) => (
            <a
              key={`${p.id ?? p.name}-${idx}`}
              href={p.website ?? '#'}
              target={p.website ? '_blank' : undefined}
              rel="noopener noreferrer"
              title={p.name}
              style={{
                flexShrink: 0, minWidth: 160, height: 68,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 24px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-hairline-soft)',
                backgroundColor: 'var(--color-surface-2)',
                textDecoration: 'none',
                transition: 'border-color 0.2s, background-color 0.2s',
              }}
              className="partner-card"
            >
              {p.logo_url ? (
                <img
                  src={p.logo_url}
                  alt={p.name}
                  style={{ maxHeight: 32, width: 'auto', objectFit: 'contain', filter: 'grayscale(1) brightness(0.7)', transition: 'filter 0.2s' }}
                  className="partner-logo"
                  onError={(e) => {
                    const target = e.currentTarget
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent && !parent.querySelector('[data-fallback]')) {
                      const span = document.createElement('span')
                      span.dataset.fallback = 'true'
                      span.style.cssText = 'font-size:13px;font-weight:700;color:var(--color-ink-muted);letter-spacing:0.04em;'
                      span.textContent = p.name
                      parent.appendChild(span)
                    }
                  }}
                />
              ) : (
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-ink-muted)', letterSpacing: '0.04em' }}>
                  {p.name}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .partner-card:hover {
          border-color: rgba(0,153,255,0.25) !important;
          background-color: rgba(0,153,255,0.04) !important;
        }
        .partner-card:hover .partner-logo {
          filter: grayscale(0) brightness(1) !important;
        }
      `}</style>
    </div>
  )
}
