'use client'

import Link from 'next/link'
import { useState } from 'react'

const categories = [
  {
    title: 'Website Development',
    color: '#0099ff',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={28} height={28}>
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    title: 'Research Paper Writing',
    color: '#22c55e',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={28} height={28}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),
  },
  {
    title: 'Assignment Help',
    color: '#f59e0b',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={28} height={28}>
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    title: '3D Model Design',
    color: '#d44df0',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={28} height={28}>
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    title: 'SEO Services & Ads',
    color: '#ff7a3d',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={28} height={28}>
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    ),
  },
  {
    title: 'API Integration & Automation',
    color: '#6a4cf5',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={28} height={28}>
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
        <line x1="12" y1="2" x2="12" y2="22" />
      </svg>
    ),
  },
  {
    title: 'Video/Reel Editing',
    color: '#e11d48',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={28} height={28}>
        <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        <line x1="5" y1="9" x2="9" y2="9" />
      </svg>
    ),
  },
]

function CategoryCard({ cat, index }: { cat: typeof categories[0]; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href="/services"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '28px 16px',
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${hovered ? cat.color + '40' : 'var(--color-hairline-soft)'}`,
        backgroundColor: hovered ? `${cat.color}0d` : 'var(--color-surface-1)',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'border-color 0.2s, background-color 0.2s, transform 0.2s',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        opacity: 0,
        animation: `tile-fade-in 0.5s var(--ease-out) ${index * 60}ms forwards`,
      }}
    >
      <div style={{
        color: hovered ? cat.color : 'var(--color-ink-muted)',
        marginBottom: 14,
        transition: 'color 0.2s',
      }}>
        {cat.icon}
      </div>
      <span style={{
        fontSize: 12, fontWeight: 600,
        color: hovered ? 'var(--color-ink)' : 'var(--color-ink-muted)',
        textAlign: 'center', lineHeight: 1.35,
        transition: 'color 0.2s',
      }}>
        {cat.title}
      </span>
    </Link>
  )
}

export default function ServiceTiles() {
  return (
    <section className="tiles-section" style={{
      padding: 'var(--space-section) var(--space-xl)',
      backgroundColor: 'var(--color-canvas)',
      borderBottom: '1px solid var(--color-hairline-soft)',
      overflowX: 'hidden',
    }}>
      <div style={{ maxWidth: 1199, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', padding: '4px 12px', borderRadius: 'var(--radius-pill)',
            backgroundColor: 'rgba(0,153,255,0.08)', color: 'var(--color-accent-blue)',
            border: '1px solid rgba(0,153,255,0.18)', marginBottom: 16,
          }}>
            Popular Categories
          </span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(24px, 3.5vw, 42px)',
            fontWeight: 700, color: 'var(--color-ink)',
            letterSpacing: '-1.5px',
          }}>
            Services We Offer
          </h2>
        </div>

        {/* 7-card grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 14,
        }} className="tiles-grid">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.title} cat={cat} index={i} />
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link href="/services" className="btn-secondary" style={{ display: 'inline-block' }}>
            View All Services →
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes tile-fade-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tiles-grid {
          grid-template-columns: repeat(7, 1fr);
        }
        @media (max-width: 1200px) { .tiles-grid { grid-template-columns: repeat(4, 1fr) !important; } }
        @media (max-width: 1024px) { .tiles-grid { grid-template-columns: repeat(4, 1fr) !important; } }
        @media (max-width: 768px)  {
          .tiles-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 10px !important; }
          .tiles-section { padding-left: 16px !important; padding-right: 16px !important; }
        }
        @media (max-width: 540px)  {
          .tiles-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
        }
        /* Tile card compact on mobile */
        @media (max-width: 540px) {
          .tiles-grid a {
            padding: 18px 10px !important;
          }
          .tiles-grid a span {
            font-size: 11px !important;
          }
          .tiles-grid a svg {
            width: 22px !important;
            height: 22px !important;
          }
        }
      `}</style>
    </section>
  )
}
