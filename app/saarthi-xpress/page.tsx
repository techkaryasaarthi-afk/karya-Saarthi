'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface XService {
  id: number
  title: string
  slug: string
  category: string
  short_description: string
  delivery_hours: number
  price_min: number | null
  price_max: number | null
  featured_image: string | null
  rating: number
  total_orders: number
  is_featured: boolean
  tags: string[]
}

const DELIVERY_TABS = [
  { key: 'all', label: 'All Services', icon: '⚡' },
  { key: '1', label: '1 Hour', sublabel: 'Quick Fix', icon: '⚡' },
  { key: '4', label: '4 Hours', sublabel: 'Fast Delivery', icon: '⏰' },
  { key: '24', label: '24 Hours', sublabel: 'Same Day', icon: '📅' },
  { key: '0', label: 'Expert', sublabel: 'Quality assured', icon: '👤' },
]

const WHY_REASONS = [
  { icon: '⚡', title: 'Fast Turnaround', desc: 'Get work done quickly' },
  { icon: '👨‍💼', title: 'Expert Professionals', desc: 'Vetted & skilled team' },
  { icon: '💰', title: 'Transparent Pricing', desc: 'No hidden charges' },
  { icon: '🔒', title: 'Secure & Confidential', desc: 'Your data stays safe' },
  { icon: '⭐', title: '100+ Services', desc: 'All in one place' },
]

const CATEGORY_PILLS = ['All', 'PPTs', 'Reels', 'Designs', 'Resumes', 'Research', 'Documents', 'Marketing']

function XServiceCard({ svc, onEnquire }: { svc: XService; onEnquire: (s: XService) => void }) {
  const deliveryLabel = svc.delivery_hours === 0 ? 'Expert' : svc.delivery_hours === 1 ? '1 Hr' : svc.delivery_hours === 4 ? '2–4 Hrs' : '24 Hrs'
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface-1)',
        border: '1px solid var(--color-hairline-soft)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.15s, transform 0.15s',
      }}
      className="sx-card"
    >
      <div style={{ position: 'relative', aspectRatio: '16/9', background: 'linear-gradient(135deg, rgba(255,122,61,0.08), rgba(245,158,11,0.04))' }}>
        {svc.featured_image ? (
          <Image src={svc.featured_image} alt={svc.title} fill style={{ objectFit: 'cover' }} sizes="400px" />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, opacity: 0.4 }}>⚡</div>
        )}
        <div style={{
          position: 'absolute', top: 10, left: 10,
          background: 'linear-gradient(135deg, #ff7a3d, #f59e0b)',
          color: '#fff', fontSize: 10, fontWeight: 800,
          padding: '3px 8px', borderRadius: 'var(--radius-pill)',
          letterSpacing: '0.04em',
        }}>
          ⚡ Saarthi Express
        </div>
        <div style={{
          position: 'absolute', bottom: 10, right: 10,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          color: '#fff', fontSize: 10, fontWeight: 600,
          padding: '3px 8px', borderRadius: 'var(--radius-pill)',
        }}>
          ⏱ {deliveryLabel}
        </div>
      </div>

      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 6 }}>{svc.title}</h3>
        <p style={{ fontSize: 11, color: 'var(--color-ink-muted)', flex: 1, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{svc.short_description}</p>
        <button
          onClick={() => onEnquire(svc)}
          style={{
            width: '100%', padding: '8px 16px', borderRadius: 'var(--radius-sm)',
            fontSize: 13, fontWeight: 700,
            background: 'linear-gradient(135deg, #ff7a3d, #f59e0b)',
            color: '#fff', border: 'none', cursor: 'pointer',
          }}
        >
          Get Started →
        </button>
      </div>
    </div>
  )
}

function EnquiryModal({ svc, onClose }: { svc: XService; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const mInp: React.CSSProperties = { display: 'block', width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-hairline)', backgroundColor: 'var(--color-surface-2)', color: 'var(--color-ink)', fontSize: 13, outline: 'none' }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSending(true)
    try {
      await fetch('/api/services/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ service_id: svc.id, service_title: svc.title, source: 'saarthi_xpress', ...form }) })
      setSent(true)
    } catch {} finally { setSending(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--color-surface-1)', border: '1px solid rgba(255,122,61,0.3)', borderRadius: 'var(--radius-xl)', padding: 28, width: '100%', maxWidth: 420, maxHeight: '90vh', overflowY: 'auto' }}>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 8 }}>Request Sent!</h3>
            <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginBottom: 20 }}>Our Saarthi Express team will reach out within 1 hour.</p>
            <button onClick={onClose} style={{ padding: '10px 24px', borderRadius: 'var(--radius-pill)', background: 'linear-gradient(135deg, #ff7a3d, #f59e0b)', color: '#fff', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer' }}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-ink)' }}>⚡ Quick Request</h3>
                <p style={{ fontSize: 11, color: '#f59e0b', marginTop: 2 }}>{svc.title}</p>
              </div>
              <button onClick={onClose} style={{ fontSize: 18, color: 'var(--color-ink-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[{ key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your name', required: true }, { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', required: true }, { key: 'phone', label: 'Phone / WhatsApp', type: 'tel', placeholder: '+91 XXXXX XXXXX', required: true }].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--color-ink-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} required={f.required} value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={mInp} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--color-ink-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Requirements</label>
                <textarea rows={3} placeholder="Describe what you need…" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} style={{ ...mInp, resize: 'none' }} />
              </div>
              <button type="submit" disabled={sending} style={{ padding: '12px', borderRadius: 'var(--radius-pill)', background: 'linear-gradient(135deg, #ff7a3d, #f59e0b)', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', opacity: sending ? 0.6 : 1 }}>
                {sending ? '⏳ Sending…' : '⚡ Submit Request'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default function SaarthiXpressPage() {
  const [services, setServices] = useState<XService[]>([])
  const [loading, setLoading] = useState(true)
  const [delivery, setDelivery] = useState('all')
  const [catFilter, setCatFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [enquireSvc, setEnquireSvc] = useState<XService | null>(null)

  const fetchServices = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ ...(delivery !== 'all' ? { delivery_hours: delivery } : {}), ...(search ? { q: search } : {}) })
    try {
      const res = await fetch(`/api/saarthi-xpress?${params}`)
      const data = await res.json()
      setServices(data.services || [])
    } catch {} finally { setLoading(false) }
  }, [delivery, search])

  useEffect(() => { fetchServices() }, [fetchServices])

  const filteredServices = services.filter(svc => {
    if (catFilter === 'All') return true
    const searchTarget = (svc.title + ' ' + svc.category + ' ' + svc.short_description).toLowerCase()
    const matchCat = catFilter.toLowerCase()
    // "PPTs" -> "ppt", "Reels" -> "reel"
    const keyword = matchCat.endsWith('s') ? matchCat.slice(0, -1) : matchCat
    return searchTarget.includes(keyword)
  })

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-canvas)', paddingTop: 72 }}>
        {/* ── Hero ─────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #0d0d0d 0%, #1a0800 50%, #0d0d0d 100%)',
          borderBottom: '1px solid rgba(255,122,61,0.2)',
          padding: '56px 32px 48px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(255,122,61,0.12) 0%, transparent 70%)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #ff7a3d, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: '0 0 32px rgba(255,122,61,0.5)' }}>⚡</div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f59e0b' }}>⚡ QUICK SERVICES</span>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 800, color: '#fff', letterSpacing: '-2px', margin: 0, lineHeight: 1 }}>
                  Saarthi <span style={{ color: '#f59e0b' }}>Express</span>
                </h1>
              </div>
            </div>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Need it done? Don&apos;t wait.</p>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', maxWidth: 480, margin: '0 auto 28px' }}>Fast, professional help for the things you need right now — within 1 to 24 hours.</p>
            <div style={{ position: 'relative', maxWidth: 520, margin: '0 auto' }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-muted)', fontSize: 15 }}>🔍</span>
              <input
                type="text"
                placeholder="Search express services — PPT, Resume, Reel…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', paddingLeft: 44, paddingRight: 16, paddingTop: 14, paddingBottom: 14, borderRadius: 'var(--radius-pill)', border: '1px solid rgba(255,122,61,0.3)', backgroundColor: 'rgba(255,255,255,0.04)', color: 'var(--color-ink)', fontSize: 14, outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* ── Delivery Filter Tabs ────────────── */}
        <div style={{ backgroundColor: 'var(--color-surface-1)', borderBottom: '1px solid var(--color-hairline-soft)', padding: '0 32px' }}>
          <div style={{ maxWidth: 1199, margin: '0 auto', display: 'flex', gap: 0, overflowX: 'auto' }}>
            {DELIVERY_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setDelivery(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '16px 24px',
                  background: 'none', border: 'none',
                  borderBottom: `2px solid ${delivery === tab.key ? '#f59e0b' : 'transparent'}`,
                  color: delivery === tab.key ? '#f59e0b' : 'var(--color-ink-muted)',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'color 0.15s',
                }}
              >
                <span style={{ fontSize: 16 }}>{tab.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <div>{tab.label}</div>
                  {tab.sublabel && <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.7 }}>{tab.sublabel}</div>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Category Pills ──────────────────── */}
        <div style={{ padding: '20px 32px 0', maxWidth: 1199, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {CATEGORY_PILLS.map(cat => (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                style={{
                  flexShrink: 0, padding: '6px 14px', borderRadius: 'var(--radius-pill)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                  border: `1px solid ${catFilter === cat ? '#f59e0b' : 'var(--color-hairline)'}`,
                  backgroundColor: catFilter === cat ? 'rgba(245,158,11,0.12)' : 'var(--color-surface-1)',
                  color: catFilter === cat ? '#f59e0b' : 'var(--color-ink-muted)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main Content ────────────────────── */}
        <div style={{ maxWidth: 1199, margin: '0 auto', padding: '24px 32px 64px' }}>
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }} className="sx-layout">

            {/* Cards Grid */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>
                  <span style={{ color: '#f59e0b' }}>⚡ Saarthi Express</span> — Quick Services
                </h2>
                <Link href="/services" style={{ fontSize: 12, color: 'var(--color-accent-blue)', textDecoration: 'none', fontWeight: 600 }}>View All Services →</Link>
              </div>

              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="sx-grid">
                  {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ height: 280, borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-surface-1)' }} className="skeleton" />)}
                </div>
              ) : filteredServices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 24px', backgroundColor: 'var(--color-surface-1)', border: '1px solid var(--color-hairline-soft)', borderRadius: 'var(--radius-xl)' }}>
                  <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>⚡</span>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 8 }}>No express services found</h3>
                  <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginBottom: 20 }}>Try a different filter or contact us directly</p>
                  <a href="https://wa.me/918595025753" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '10px 24px', borderRadius: 'var(--radius-pill)', background: 'linear-gradient(135deg, #ff7a3d, #f59e0b)', color: '#fff', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>📱 WhatsApp Us</a>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="sx-grid">
                  {filteredServices.map(svc => <XServiceCard key={svc.id} svc={svc} onEnquire={setEnquireSvc} />)}
                </div>
              )}
            </div>

            {/* Why Saarthi Xpress Sidebar */}
            <div style={{ width: 220, flexShrink: 0, position: 'sticky', top: 88 }} className="sx-sidebar">
              <div style={{ backgroundColor: 'var(--color-surface-1)', border: '1px solid rgba(255,122,61,0.2)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#f59e0b', marginBottom: 16, fontFamily: 'var(--font-display)' }}>Why Saarthi Express?</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {WHY_REASONS.map(r => (
                    <div key={r.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{r.icon}</span>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 2 }}>{r.title}</p>
                        <p style={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>{r.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--color-hairline-soft)' }}>
                  <a href="https://wa.me/918595025753" target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', padding: '10px 16px', borderRadius: 'var(--radius-pill)', background: 'linear-gradient(135deg, #ff7a3d, #f59e0b)', color: '#fff', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
                    💬 Talk to Saarthi
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Urgent CTA Banner ─────────────── */}
        <div style={{ backgroundColor: 'var(--color-surface-1)', borderTop: '1px solid var(--color-hairline-soft)', padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#f59e0b', marginBottom: 6 }}>🚀 Need something urgent?</p>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-ink)', fontFamily: 'var(--font-display)', letterSpacing: '-0.8px', marginBottom: 6 }}>Tell us what you need</h3>
              <p style={{ fontSize: 13, color: 'var(--color-ink-muted)' }}>Our Saarthi Express team will deliver it — fast!</p>
            </div>
            <a href="https://wa.me/918595025753" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 'var(--radius-pill)', background: 'linear-gradient(135deg, #ff7a3d, #f59e0b)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(255,122,61,0.4)' }}>
              💬 Talk to Your Saarthi →
            </a>
          </div>
        </div>
      </div>

      {enquireSvc && <EnquiryModal svc={enquireSvc} onClose={() => setEnquireSvc(null)} />}
      <Footer />

      <style>{`
        .sx-card:hover { border-color: rgba(245,158,11,0.4) !important; transform: translateY(-2px); }
        .sx-grid { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 1024px) { .sx-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .sx-grid { grid-template-columns: 1fr; } }
        @media (max-width: 900px) { .sx-sidebar { display: none; } }
        @media (max-width: 768px) { .sx-layout { flex-direction: column; } }
      `}</style>
    </>
  )
}
