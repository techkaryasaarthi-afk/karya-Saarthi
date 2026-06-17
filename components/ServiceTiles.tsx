'use client'

import Link from 'next/link'
import { useState } from 'react'

const categories = [
  {
    title: 'Programming & Tech',
    color: '#0099ff',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={28} height={28}>
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    title: 'Graphics & Design',
    color: '#d44df0',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={28} height={28}>
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.476-1.125-.29-.289-.48-.7-.48-1.187 0-.926.71-1.687 1.648-1.687H16c2.757 0 5-2.104 5-4.702C21 6.376 16.973 2 12 2z" />
      </svg>
    ),
  },
  {
    title: 'Digital Marketing',
    color: '#ff7a3d',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={28} height={28}>
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    title: 'Writing & Translation',
    color: '#22c55e',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={28} height={28}>
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    title: 'Video & Animation',
    color: '#f59e0b',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={28} height={28}>
        <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    title: 'AI Services',
    color: '#6a4cf5',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={28} height={28}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" /><circle cx="12" cy="16" r="1" fill="currentColor" />
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

        {/* 6-card grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
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
          grid-template-columns: repeat(6, 1fr);
        }
        @media (max-width: 1024px) { .tiles-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 768px) { .tiles-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 10px !important; } .tiles-section { padding-left: 16px !important; padding-right: 16px !important; } }
        @media (max-width: 640px)  { .tiles-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; } }
        @media (max-width: 380px)  { .tiles-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </section>
  )
}
