'use client'

import Link from 'next/link'
import { useState } from 'react'

export interface ServiceTile {
  title: string
  color: string
  icon: string
  audience: string[]
}

const DEFAULT_TILES: ServiceTile[] = [
  { title: 'Website & App Development',           color: '#0099ff', icon: '💻', audience: ['all', 'students', 'professionals', 'businesses'] },
  { title: 'Research Paper & Thesis Writing',     color: '#22c55e', icon: '📄', audience: ['all', 'students', 'professionals'] },
  { title: 'Assignment Help & Handmade Projects', color: '#f59e0b', icon: '✍️', audience: ['all', 'students'] },
  { title: 'SEO & Digital Marketing',             color: '#ff7a3d', icon: '📣', audience: ['all', 'businesses', 'professionals'] },
  { title: '3D Design & Video Editing',           color: '#d44df0', icon: '🎨', audience: ['all', 'businesses', 'professionals'] },
  { title: 'API Integration & Automation',        color: '#6a4cf5', icon: '⚙️', audience: ['all', 'businesses', 'professionals'] },
  { title: 'Government & Business Solutions',     color: '#FF6B35', icon: '🏛️', audience: ['all', 'businesses', 'government'] },
  { title: 'Study Abroad & Visa Consulting',      color: '#06b6d4', icon: '🌍', audience: ['all', 'students', 'professionals'] },
]

const AUDIENCE_FILTERS = [
  { key: 'all',           label: 'All Services',        emoji: '🏷️' },
  { key: 'students',      label: 'For Students',        emoji: '🎓' },
  { key: 'professionals', label: 'For Professionals',   emoji: '👨‍💼' },
  { key: 'businesses',    label: 'For Businesses',      emoji: '🏢' },
  { key: 'government',    label: 'For Government',      emoji: '🏛️' },
]

function CategoryCard({ tile, index }: { tile: ServiceTile; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href="/services"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '24px 14px',
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${hovered ? tile.color + '40' : 'var(--color-hairline-soft)'}`,
        backgroundColor: hovered ? `${tile.color}0d` : 'var(--color-surface-1)',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'border-color 0.2s, background-color 0.2s, transform 0.2s',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        opacity: 0,
        animation: `tile-fade-in 0.5s var(--ease-out) ${index * 60}ms forwards`,
      }}
    >
      <div style={{
        fontSize: 28,
        marginBottom: 12,
        transition: 'transform 0.2s',
        transform: hovered ? 'scale(1.15)' : 'scale(1)',
      }}>
        {tile.icon}
      </div>
      <span style={{
        fontSize: 11.5, fontWeight: 600,
        color: hovered ? 'var(--color-ink)' : 'var(--color-ink-muted)',
        textAlign: 'center', lineHeight: 1.35,
        transition: 'color 0.2s',
      }}>
        {tile.title}
      </span>
      {/* Accent underline on hover */}
      {hovered && (
        <div style={{
          marginTop: 8, height: 2, width: 24, borderRadius: 2,
          backgroundColor: tile.color,
          transition: 'width 0.2s',
        }} />
      )}
    </Link>
  )
}

interface ServiceTilesProps {
  tiles?: ServiceTile[]
}

export default function ServiceTiles({ tiles = DEFAULT_TILES }: ServiceTilesProps) {
  const [activeAudience, setActiveAudience] = useState('all')
  const allTiles = tiles.length > 0 ? tiles : DEFAULT_TILES

  const filtered = activeAudience === 'all'
    ? allTiles
    : allTiles.filter(t => t.audience.includes(activeAudience))

  return (
    <section className="tiles-section" style={{
      padding: 'var(--space-section) var(--space-xl)',
      backgroundColor: 'var(--color-canvas)',
      borderBottom: '1px solid var(--color-hairline-soft)',
      overflowX: 'hidden',
    }}>
      <div style={{ maxWidth: 1199, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
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

        {/* Audience Filter Tabs */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 8,
          flexWrap: 'wrap', marginBottom: 36,
        }}>
          {AUDIENCE_FILTERS.map(filter => (
            <button
              key={filter.key}
              onClick={() => setActiveAudience(filter.key)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 16px', borderRadius: 'var(--radius-pill)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
                border: `1px solid ${activeAudience === filter.key ? 'var(--color-accent-blue)' : 'var(--color-hairline)'}`,
                backgroundColor: activeAudience === filter.key
                  ? 'var(--color-accent-blue)'
                  : 'var(--color-surface-1)',
                color: activeAudience === filter.key ? '#fff' : 'var(--color-ink-muted)',
                transform: activeAudience === filter.key ? 'scale(1.04)' : 'scale(1)',
                boxShadow: activeAudience === filter.key ? '0 4px 16px rgba(0,153,255,0.25)' : 'none',
              }}
            >
              <span style={{ fontSize: 15 }}>{filter.emoji}</span>
              {filter.label}
            </button>
          ))}
        </div>

        {/* Tile grid */}
        {filtered.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(filtered.length, 4)}, 1fr)`,
            gap: 14,
          }} className="tiles-grid">
            {filtered.map((tile, i) => (
              <CategoryCard key={tile.title} tile={tile} index={i} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-ink-muted)', fontSize: 14 }}>
            No services found for this category.
          </div>
        )}

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
          grid-template-columns: repeat(4, 1fr) !important;
        }
        @media (max-width: 1024px) { .tiles-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 768px)  {
          .tiles-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .tiles-section { padding-left: 16px !important; padding-right: 16px !important; }
        }
        @media (max-width: 480px) {
          .tiles-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
          .tiles-grid a { padding: 18px 10px !important; }
          .tiles-grid a span { font-size: 11px !important; }
        }
      `}</style>
    </section>
  )
}
