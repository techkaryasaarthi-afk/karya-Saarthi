'use client'

import { useEffect, useRef, useState } from 'react'

interface Stat { value: number; suffix: string; label: string; icon: string }

const stats: Stat[] = [
  { value: 5000,  suffix: '+',  label: 'Projects Completed',  icon: '✅' },
  { value: 3200,  suffix: '+',  label: 'Happy Clients',       icon: '😊' },
  { value: 98,    suffix: '%',  label: 'Success Rate',        icon: '🎯' },
  { value: 150,   suffix: '+',  label: 'Expert Team',         icon: '👥' },
  { value: 12,    suffix: '+',  label: 'States Served',       icon: '🗺️' },
  { value: 24,    suffix: '/7', label: 'Support Available',   icon: '🎧' },
]

function AnimatedCounter({ target, suffix, duration = 2000 }: { target: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref   = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current; if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        let startTime: number
        const step = (ts: number) => {
          if (!startTime) startTime = ts
          const progress = Math.min((ts - startTime) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setCount(Math.floor(eased * target))
          if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      }
    }, { threshold: 0.3 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

export default function LiveStatsBar() {
  return (
    <section
      style={{
        backgroundColor: 'var(--color-surface-1)',
        borderTop: '1px solid var(--color-hairline-soft)',
        borderBottom: '1px solid var(--color-hairline-soft)',
        padding: '14px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* subtle left-to-right scan line */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(0,153,255,0.04) 50%, transparent 100%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1199, margin: '0 auto', padding: '0 var(--space-xl)' }}>
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', justifyContent: 'center' }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{stat.icon}</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-ink)', lineHeight: 1, whiteSpace: 'nowrap', letterSpacing: '-0.5px' }}>
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p style={{ color: 'var(--color-ink-muted)', fontSize: 10, marginTop: 2, lineHeight: 1.2 }}>{stat.label}</p>
              </div>
              {i < stats.length - 1 && (
                <div style={{ display: 'none', width: 1, height: 28, backgroundColor: 'var(--color-hairline)', marginLeft: 8, flexShrink: 0 }} className="stat-divider" />
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
        }
        .stat-divider { display: block !important; }
        @media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 640px)  { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </section>
  )
}
