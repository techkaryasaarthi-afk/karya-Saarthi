'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// ─── Dark-themed Widget Wrapper ────────────────────────────────────────────────
const W = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <div
    style={{
      backgroundColor: 'var(--color-surface-1)',
      border: '1px solid var(--color-hairline-soft)',
      borderRadius: 'var(--radius-lg)',
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      opacity: 0,
      animation: `qad-fade 0.55s var(--ease-out) ${delay}ms forwards`,
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}
    className="qad-widget"
  >
    {children}
  </div>
)

const WidgetTitle = ({ icon, label, href, linkLabel }: { icon: string; label: string; href?: string; linkLabel?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{
        width: 32, height: 32, borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-surface-2)',
        border: '1px solid var(--color-hairline-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 15, flexShrink: 0,
      }}>{icon}</span>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>{label}</h3>
    </div>
    {href && (
      <Link href={href} style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-ink-muted)', textDecoration: 'none', letterSpacing: '0.04em' }}>
        {linkLabel || 'View All →'}
      </Link>
    )}
  </div>
)

const skRow = { height: 14, borderRadius: 6, backgroundColor: 'var(--color-surface-2)', marginBottom: 8 }

// ─── 1. Podcast Widget ─────────────────────────────────────────────────────────
const PodcastWidget = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch('/api/widgets/frontend?type=podcast').then(r => r.json()).then(d => { setData(d.title ? d : null); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (!loading && !data) return null;

  return (
    <W delay={0}>
      <WidgetTitle icon="🎙️" label="Latest Podcast" href="/podcasts" />
      {!data ? (
        <div style={{ flex: 1 }}>
          <div style={skRow} className="skeleton" />
          <div style={{ ...skRow, width: '70%' }} className="skeleton" />
          <div style={{ height: 60, borderRadius: 10, marginTop: 16 }} className="skeleton" />
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.35, marginBottom: 6, fontFamily: 'var(--font-display)' }}>{data.title}</p>
          <p style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>Guest: <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{data.guest}</span></p>
          <p style={{ fontSize: 11, color: 'var(--color-ink-muted)', marginTop: 2, marginBottom: 14 }}>{new Date(data.date).toLocaleDateString('en-IN')}</p>
          {/* Audio waveform visualiser */}
          <div style={{
            height: 56, borderRadius: 10,
            backgroundColor: 'var(--color-surface-2)',
            border: '1px solid var(--color-hairline-soft)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 3, padding: '0 12px', marginBottom: 16, overflow: 'hidden',
          }}>
            {Array.from({ length: 24 }).map((_, i) => {
              const h = 20 + ((i * 37 + 13) % 80)
              return (
                <div key={i} style={{
                  width: 3, borderRadius: 99,
                  height: `${h}%`,
                  backgroundColor: 'rgba(106,76,245,0.5)',
                  animation: `wave-bar 1.2s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.05}s`,
                }} />
              )
            })}
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
            <a href={data.listen_link} target="_blank" rel="noreferrer" style={{
              flex: 1, textAlign: 'center', padding: '9px 0', borderRadius: 'var(--radius-md)',
              fontSize: 11, fontWeight: 700, backgroundColor: '#6a4cf5', color: '#fff', textDecoration: 'none',
            }}>Listen Full</a>
            <a href={data.subscribe_youtube} target="_blank" rel="noreferrer" style={{
              flex: 1, textAlign: 'center', padding: '9px 0', borderRadius: 'var(--radius-md)',
              fontSize: 11, fontWeight: 700,
              backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.2)', textDecoration: 'none',
            }}>📺 Subscribe</a>
          </div>
        </div>
      )}
    </W>
  )
}

// ─── 2. Hackathon Widget ───────────────────────────────────────────────────────
const HackathonWidget = () => {
  const [event,    setEvent]    = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null)

  useEffect(() => {
    fetch('/api/events?type=hackathon&status=upcoming&limit=1')
      .then(r => r.json())
      .then(d => { setEvent(d.events?.[0] || null); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!event?.event_date) return
    const target = new Date(event.event_date).getTime()
    const timer = setInterval(() => {
      const diff = target - Date.now()
      if (diff <= 0) { setTimeLeft({ d: 0, h: 0, m: 0, s: 0 }); clearInterval(timer); return }
      setTimeLeft({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) })
    }, 1000)
    return () => clearInterval(timer)
  }, [event])

  if (!loading && !event) return null;

  return (
    <W delay={80}>
      <WidgetTitle icon="💻" label="Hackathon" href="/hackathons" linkLabel="View All →" />
      {!event ? (
        <div style={{ flex: 1 }}>
          <div style={skRow} className="skeleton" />
          <div style={{ ...skRow, width: '80%' }} className="skeleton" />
          <div style={{ height: 80, borderRadius: 10, marginTop: 12 }} className="skeleton" />
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 10, fontWeight: 700, color: '#22c55e',
              backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 'var(--radius-pill)', padding: '3px 8px',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
              LIVE
            </span>
          </div>
          <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-display)', lineHeight: 1.35, marginBottom: 6 }}>{event.title}</h4>
          <p style={{ fontSize: 11, color: 'var(--color-ink-muted)', marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{event.short_description}</p>
          {/* Prize */}
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,122,61,0.1)', border: '1px solid rgba(255,122,61,0.2)', textAlign: 'center', marginBottom: 12 }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ff7a3d', marginBottom: 2 }}>Prize Pool</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#ff7a3d', fontFamily: 'var(--font-display)' }}>₹{event.prize_pool || '25,000'}</p>
          </div>
          {/* Countdown */}
          {timeLeft && (
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 14 }}>
              {[{ v: timeLeft.d, l: 'Days' }, { v: timeLeft.h, l: 'Hrs' }, { v: timeLeft.m, l: 'Min' }, { v: timeLeft.s, l: 'Sec' }].map((t, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-hairline-soft)', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: 15, color: 'var(--color-ink)' }}>
                    {t.v.toString().padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: 9, color: 'var(--color-ink-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{t.l}</span>
                </div>
              ))}
            </div>
          )}
          <Link href={`/events/${event.slug || event.id}`} style={{ display: 'block', width: '100%', textAlign: 'center', padding: '10px 0', borderRadius: 'var(--radius-md)', fontSize: 12, fontWeight: 700, backgroundColor: '#ff7a3d', color: '#fff', textDecoration: 'none', marginTop: 'auto' }}>
            Register Now
          </Link>
        </div>
      )}
    </W>
  )
}

// ─── 3. Seminar Widget ─────────────────────────────────────────────────────────
const SeminarWidget = () => {
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch('/api/events?type=seminar&status=upcoming&limit=1')
      .then(r => r.json())
      .then(d => { setEvent(d.events?.[0] || null); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (!loading && !event) return null;

  return (
    <W delay={160}>
      <WidgetTitle icon="🎓" label="Upcoming Seminar" href="/events" linkLabel="View All →" />
      {!event ? (
        <div style={{ flex: 1 }}>
          <div style={skRow} className="skeleton" />
          <div style={{ ...skRow, width: '60%' }} className="skeleton" />
          <div style={{ height: 80, borderRadius: 10, marginTop: 12 }} className="skeleton" />
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {new Date(event.event_date).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-display)', marginTop: 6, marginBottom: 8, lineHeight: 1.35 }}>{event.title}</h4>
          <p style={{ fontSize: 12, color: 'var(--color-ink-muted)', marginBottom: 14 }}>Speaker: <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>Dr. Industry Expert</span></p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 'auto' }}>
            {[{ label: '📅 Add to Google Calendar', color: '#0099ff' }, { label: '📼 View Past Recordings', color: '#22c55e' }].map(item => (
              <a key={item.label} href="#" style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 11, fontWeight: 600, color: 'var(--color-ink-muted)',
                padding: '8px 12px', borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-2)',
                border: '1px solid var(--color-hairline-soft)',
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}>
                {item.label}
              </a>
            ))}
          </div>
          <Link href={`/events/${event.slug || event.id}`} style={{
            display: 'block', width: '100%', textAlign: 'center', marginTop: 14,
            padding: '10px 0', borderRadius: 'var(--radius-md)', fontSize: 12, fontWeight: 700,
            border: '1px solid var(--color-accent-blue)', color: 'var(--color-accent-blue)',
            backgroundColor: 'rgba(0,153,255,0.06)', textDecoration: 'none',
          }}>
            RSVP / Register
          </Link>
        </div>
      )}
    </W>
  )
}

// ─── Main Section ──────────────────────────────────────────────────────────────
export default function QuickAccessDashboard() {
  return (
    <section style={{
      padding: 'var(--space-section) var(--space-xl)',
      backgroundColor: 'var(--color-canvas)',
      borderTop: '1px solid var(--color-hairline-soft)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient background glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 400, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(0,153,255,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1199, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto', marginBottom: 52 }}>
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', padding: '4px 12px', borderRadius: 'var(--radius-pill)',
            backgroundColor: 'rgba(0,153,255,0.08)', color: 'var(--color-accent-blue)',
            border: '1px solid rgba(0,153,255,0.18)', marginBottom: 18,
          }}>
            ⚡ Quick Access
          </span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700,
            color: 'var(--color-ink)', letterSpacing: '-1.5px', marginBottom: 14,
          }}>
            Live <span style={{ color: 'var(--color-accent-blue)' }}>Updates & Dashboard</span>
          </h2>
          <p style={{ fontSize: 14, color: 'var(--color-ink-muted)', lineHeight: 1.65 }}>
            Stay connected with the latest from Karya Saarthi — hackathons, podcasts, and instant consultations.
          </p>
        </div>

        <div className="qad-grid">
          <PodcastWidget />
          <HackathonWidget />
          <SeminarWidget />
                  </div>
      </div>

      <style>{`
        @keyframes qad-fade {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes wave-bar {
          from { transform: scaleY(0.4); opacity: 0.5; }
          to   { transform: scaleY(1); opacity: 1; }
        }
        .qad-widget:hover {
          border-color: var(--color-hairline) !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important;
        }
        .qad-grid { 
          display: flex; 
          flex-wrap: wrap; 
          justify-content: center; 
          gap: 16px; 
        }
        .qad-widget {
          flex: 1 1 320px;
          max-width: 400px;
        }
      `}</style>
    </section>
  )
}
