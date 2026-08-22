'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const QUICK_LINKS = [
  'PPTs', 'Reels', 'Designs', 'Resumes', 'Research Support',
  'Plagiarism Reports', 'Documents', 'Marketing', '& 100+ more'
]

export default function SaarthiXpressBanner() {
  const [posterUrl, setPosterUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/settings?key=xpress_banner_poster')
      .then(r => r.json())
      .then(d => { if (d.value) setPosterUrl(d.value) })
      .catch(() => {})
  }, [])

  const imageSrc = posterUrl || '/images/saarthi-xpress-banner.png'

  return (
    <section
      style={{
        margin: '0 var(--space-xl)',
        marginBottom: 'var(--space-xxl)',
        borderRadius: 'var(--radius-xxl)',
        overflow: 'hidden',
        position: 'relative',
        background: 'linear-gradient(135deg, #0d0d0d 0%, #1a0a00 40%, #0d0d0d 100%)',
        border: '1px solid rgba(255, 122, 61, 0.25)',
      }}
      aria-label="Saarthi Xpress — Quick Services Banner"
    >
      {/* Poster image — right-aligned, contained within right portion */}
      <div style={{
        position: 'absolute',
        top: 0, right: 0, bottom: 0,
        width: '40%',
        maxWidth: 320,
        zIndex: 0,
        overflow: 'hidden',
      }}>
        <Image
          src={imageSrc}
          alt="Saarthi Xpress — Fast Delivery"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center center', opacity: 0.4 }}
          priority
          loading="eager"
        />
        {/* Fade gradient so image blends into dark bg */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, #0d0d0d 0%, transparent 40%, transparent 100%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Orange glow bottom */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 80% at 80% 120%, rgba(255,122,61,0.18) 0%, transparent 70%)',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, padding: '28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>

          {/* Left: Branding */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              {/* Lightning bolt */}
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'linear-gradient(135deg, #ff7a3d, #f59e0b)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, flexShrink: 0,
                boxShadow: '0 0 24px rgba(255,122,61,0.5)',
              }}>
                ⚡
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <h2 style={{
                    fontSize: 26, fontWeight: 800, color: '#fff',
                    fontFamily: 'var(--font-display)', letterSpacing: '-0.8px',
                    margin: 0,
                  }}>
                    Saarthi <span style={{ color: '#f59e0b' }}>Express</span>
                  </h2>
                  <span style={{
                    fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
                    textTransform: 'uppercase', padding: '3px 8px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'rgba(245,158,11,0.15)',
                    color: '#f59e0b',
                    border: '1px solid rgba(245,158,11,0.35)',
                    whiteSpace: 'nowrap',
                  }}>
                    ⚡ QUICK SERVICES
                  </span>
                </div>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0, marginBottom: 2, letterSpacing: '-0.3px' }}>
                  Need it done? Don&apos;t wait.
                </p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                  Fast, professional help for the things you need right now.
                </p>
              </div>
            </div>

            {/* Quick-link pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
              {QUICK_LINKS.map(label => (
                <span
                  key={label}
                  style={{
                    fontSize: 11, fontWeight: 600, padding: '4px 10px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.75)',
                    cursor: 'default',
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Timer badge + CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16, flexShrink: 0 }}>
            {/* 1–24 hours badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 20px', borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, rgba(255,122,61,0.2), rgba(245,158,11,0.15))',
              border: '1px solid rgba(255,122,61,0.35)',
            }}>
              <span style={{ fontSize: 28 }}>⏱️</span>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b', margin: 0, letterSpacing: '-0.5px', lineHeight: 1 }}>
                  1–24 Hours
                </p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Turnaround
                </p>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/saarthi-xpress"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 24px', borderRadius: 'var(--radius-pill)',
                background: 'linear-gradient(135deg, #ff7a3d, #f59e0b)',
                color: '#fff', fontSize: 14, fontWeight: 700,
                textDecoration: 'none', whiteSpace: 'nowrap',
                boxShadow: '0 4px 20px rgba(255,122,61,0.4)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-2px)'
                el.style.boxShadow = '0 8px 28px rgba(255,122,61,0.55)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = '0 4px 20px rgba(255,122,61,0.4)'
              }}
            >
              Explore Saarthi Xpress →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
