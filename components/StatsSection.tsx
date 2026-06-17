'use client'

import { useEffect, useRef, useState } from 'react'

function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const ref     = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current; if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        let start: number
        const step = (ts: number) => {
          if (!start) start = ts
          const progress = Math.min((ts - start) / 2000, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setDisplay(Math.floor(eased * target))
          if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      }
    }, { threshold: 0.5 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{display}{suffix}</span>
}

const stats = [
  { icon: '🏆', value: 500,  suffix: '+', label: 'Projects Completed' },
  { icon: '⭐', value: 98,   suffix: '%', label: 'Client Satisfaction' },
  { icon: '👥', value: 2000, suffix: '+', label: 'Happy Clients'      },
  { icon: '🎓', value: 50,   suffix: '+', label: 'Service Categories'  },
]

export default function StatsSection() {
  return (
    <section
      className="stats-section"
      style={{
        backgroundColor: 'var(--color-surface-1)',
        borderTop: '1px solid var(--color-hairline-soft)',
        borderBottom: '1px solid var(--color-hairline-soft)',
        padding: 'var(--space-section) var(--space-xl)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow orb */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,153,255,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1199, margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-1.5px', marginBottom: 12 }}>
            Numbers That Speak
          </h2>
          <p style={{ fontSize: 'var(--text-body-size)', color: 'var(--color-ink-muted)', maxWidth: 440, margin: '0 auto' }}>
            Our growing community of satisfied clients and successful projects.
          </p>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, width: '100%' }} className="stats-section-grid">
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                textAlign: 'center',
                padding: '28px 20px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-surface-2)',
                border: '1px solid var(--color-hairline)',
                transition: 'border-color var(--dur-fast), transform var(--dur-fast)',
              }}
              className="stat-card-item"
            >
              <div style={{ fontSize: 32, marginBottom: 10 }}>{s.icon}</div>
              <div className="stat-value" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-2px', lineHeight: 1 }}>
                <Counter target={s.value} suffix={s.suffix} />
              </div>
              <div style={{ color: 'var(--color-ink-muted)', fontSize: 13, marginTop: 8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .stats-section-grid { grid-template-columns: repeat(4, 1fr); }
        .stat-card-item:hover { border-color: rgba(0,153,255,0.3); transform: translateY(-3px); }
        .stat-card-item { min-width: 0; overflow: hidden; }
        @media (max-width: 900px) {
          .stats-section-grid { grid-template-columns: repeat(2, 1fr); gap: 12px !important; }
          .stats-section { padding-left: 16px !important; padding-right: 16px !important; }
        }
        @media (max-width: 400px) {
          .stats-section-grid { grid-template-columns: repeat(2, 1fr); gap: 10px !important; }
          .stat-card-item { padding: 20px 12px !important; }
          .stat-value { font-size: 28px !important; }
        }
      `}</style>
    </section>
  )
}
