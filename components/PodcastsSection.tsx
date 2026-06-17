'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface PodcastEvent {
  id: number; title: string; short_description: string
  event_date: string; status: string; registration_fee: number
  prize_pool: string | null; tags: string[]
}

const ACCENT = '#8B5CF6'

export default function PodcastsSection() {
  const [podcasts, setPodcasts] = useState<PodcastEvent[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    fetch('/api/events?type=podcast&limit=6')
      .then(r => r.json())
      .then(d => setPodcasts(d.events || []))
      .catch(() => setPodcasts([]))
      .finally(() => setLoading(false))
  }, [])

  if (!loading && podcasts.length === 0) return null

  return (
    <section style={{
      padding: 'var(--space-section) var(--space-xl)',
      backgroundColor: 'var(--color-surface-1)',
      borderTop: '1px solid var(--color-hairline-soft)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: -80, left: -60, width: 360, height: 360,
        borderRadius: '50%', background: `radial-gradient(circle, ${ACCENT}18, transparent)`,
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1199, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 44, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span style={{
              display: 'inline-block', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '4px 12px', borderRadius: 'var(--radius-pill)',
              backgroundColor: `${ACCENT}14`, color: ACCENT,
              border: `1px solid ${ACCENT}30`, marginBottom: 14,
            }}>🎤 Podcasts</span>
            <Link href="/podcasts" style={{ display: 'block', textDecoration: 'none' }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(26px, 3.5vw, 42px)',
                fontWeight: 700, color: 'var(--color-ink)',
                letterSpacing: '-1.5px',
              }}>
                Listen &amp; <span style={{ color: ACCENT }}>Learn</span> →
              </h2>
            </Link>
            <p style={{ fontSize: 14, color: 'var(--color-ink-muted)', marginTop: 8 }}>
              Expert conversations, industry insights and inspiring stories
            </p>
          </div>
          <Link href="/podcasts" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '10px 20px', borderRadius: 'var(--radius-pill)',
            border: `1px solid ${ACCENT}40`, color: ACCENT,
            fontSize: 13, fontWeight: 600, textDecoration: 'none',
            backgroundColor: `${ACCENT}0a`,
            transition: 'background-color 0.15s',
          }}>
            All Podcasts →
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="pod-grid">
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 220, borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="pod-grid">
            {podcasts.map((ep, i) => (
              <div
                key={ep.id}
                style={{
                  backgroundColor: 'var(--color-surface-2)',
                  border: '1px solid var(--color-hairline-soft)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                  transition: 'border-color 0.2s, transform 0.2s',
                  opacity: 0,
                  animation: `tile-fade-in 0.5s var(--ease-out) ${i * 70}ms forwards`,
                }}
                className="pod-card"
              >
                {/* Image area */}
                <div style={{
                  height: 110,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                  background: `linear-gradient(135deg, ${ACCENT}14, rgba(0,153,255,0.06))`,
                }}>
                  <span style={{ fontSize: 44 }}>🎙️</span>
                  {ep.registration_fee === 0 && (
                    <div style={{
                      position: 'absolute', top: 10, right: 10,
                      padding: '3px 8px', borderRadius: 'var(--radius-pill)',
                      fontSize: 10, fontWeight: 700, color: '#fff',
                      backgroundColor: ACCENT,
                    }}>FREE</div>
                  )}
                </div>
                {/* Content */}
                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <p style={{ fontSize: 11, color: ACCENT, fontWeight: 600, marginBottom: 6 }}>
                    📅 {new Date(ep.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <h3 style={{
                    fontSize: 13, fontWeight: 700, color: 'var(--color-ink)',
                    fontFamily: 'var(--font-display)', marginBottom: 8, flex: 1,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>{ep.title}</h3>
                  <p style={{
                    fontSize: 12, color: 'var(--color-ink-muted)', marginBottom: 14,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>{ep.short_description}</p>
                  <Link href={`/events/${ep.id}`} style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    gap: 6, padding: '9px 0', borderRadius: 'var(--radius-md)',
                    fontSize: 12, fontWeight: 700, color: '#fff',
                    backgroundColor: ACCENT, textDecoration: 'none',
                  }}>
                    🎧 Listen Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .pod-card:hover { border-color: ${ACCENT}35 !important; transform: translateY(-4px); }
        .pod-grid { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 900px) { .pod-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 580px) { .pod-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
