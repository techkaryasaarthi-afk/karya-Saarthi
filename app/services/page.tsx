'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PageCTABanner from '@/components/PageCTABanner'

interface Service {
  id: number
  title: string
  slug: string
  category: string
  short_description: string
  price_min: number | null
  price_max: number | null
  delivery_days: number
  featured_image: string | null
  rating: number
  total_orders: number
  is_featured: boolean
  tags: string[]
  expert: { id: number; fullname: string; avatar_url: string | null } | null
}

const CATEGORIES = [
  { key: 'all', label: 'All Services', icon: '🏷️' },
  { key: 'academic', label: 'Academic', icon: '🎓' },
  { key: 'technical', label: 'Technical', icon: '💻' },
  { key: 'business', label: 'Business', icon: '💼' },
  { key: 'government', label: 'Government', icon: '🏛️' },
  { key: 'design', label: 'Design', icon: '🎨' },
  { key: 'marketing', label: 'Marketing', icon: '📣' },
  { key: 'legal', label: 'Legal', icon: '⚖️' },
  { key: 'other', label: 'Other', icon: '📁' },
]

const SORT_OPTIONS = [
  { key: 'featured', label: 'Featured' },
  { key: 'popular', label: 'Most Popular' },
  { key: 'rating', label: 'Top Rated' },
  { key: 'delivery', label: 'Fastest Delivery' },
]

const CAT_COLORS: Record<string, string> = {
  academic: '#3B82F6',
  technical: '#8B5CF6',
  business: '#10B981',
  government: '#F59E0B',
  design: '#EC4899',
  marketing: '#EF4444',
  legal: '#6B7280',
  other: '#64748B',
}

// Normalize category for comparison (handles both 'Academic' and 'academic')
function normCat(cat: string) { return cat.toLowerCase() }

function StarRating({ value }: { value: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} style={{ fontSize: 11, color: s <= Math.round(value) ? '#f59e0b' : 'var(--color-hairline)' }}>★</span>
      ))}
      <span style={{ fontSize: 11, color: 'var(--color-ink-muted)', marginLeft: 4 }}>({value > 0 ? value.toFixed(1) : 'New'})</span>
    </div>
  )
}

function ServiceCard({ service, wishlisted, onWishlist, onEnquire }: {
  service: Service
  wishlisted: boolean
  onWishlist: (id: number) => void
  onEnquire: (s: Service) => void
}) {
  const catColor = CAT_COLORS[normCat(service.category)] || CAT_COLORS.other

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
      className="svc-card"
    >
      {/* Image / Placeholder */}
      <div className="h-44 relative overflow-hidden flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${catColor}15, ${catColor}05)` }}>
        {service.featured_image ? (
          <Image src={service.featured_image} alt={service.title} fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover" />
        ) : (
          <span className="text-5xl opacity-30">
            {CATEGORIES.find(c => c.key === normCat(service.category))?.icon || '📁'}
          </span>
        )}

        {service.is_featured && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
            style={{ background: '#FF6B35' }}>
            ⭐ Featured
          </div>
        )}

        {/* Wishlist btn */}
        <button
          onClick={() => onWishlist(service.id)}
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 32, height: 32, borderRadius: '50%',
            backgroundColor: 'var(--color-surface-1)',
            border: '1px solid var(--color-hairline)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, cursor: 'pointer',
            transition: 'transform 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {wishlisted ? '❤️' : '🤍'}
        </button>
      </div>

      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Category + delivery */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'capitalize', padding: '2px 8px', borderRadius: 'var(--radius-pill)', background: `${catColor}18`, color: catColor }}>{service.category}</span>
          <span style={{ fontSize: 10, color: 'var(--color-ink-muted)' }}>🕐 {service.delivery_days}d</span>
        </div>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-display)', marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{service.title}</h3>
        <p style={{ fontSize: 12, color: 'var(--color-ink-muted)', flex: 1, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{service.short_description}</p>
        {service.expert && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--color-hairline-soft)' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--color-accent-blue)', flexShrink: 0 }}>{service.expert.fullname.charAt(0)}</div>
            <span style={{ fontSize: 11, color: 'var(--color-ink-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{service.expert.fullname}</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-hairline-soft)' }}>
          <button onClick={() => onEnquire(service)} style={{ width: '100%', padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 700, backgroundColor: 'var(--color-accent-blue)', color: '#fff', cursor: 'pointer', border: 'none' }}>Enquire Now</button>
        </div>
      </div>    </div>
  )
}


function EnquiryModal({ service, onClose }: { service: Service; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', budget: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      await fetch('/api/services/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_id: service.id, ...form }),
      })
      setSent(true)
    } catch {} finally { setSending(false) }
  }

  const mInp: React.CSSProperties = { display: 'block', width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-hairline)', backgroundColor: 'var(--color-surface-2)', color: 'var(--color-ink)', fontSize: 13, outline: 'none' }
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--color-surface-1)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-xl)', padding: 28, width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto' }}>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-display)', marginBottom: 8 }}>Enquiry Sent!</h3>
            <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginBottom: 20 }}>We&apos;ll get back to you within 24 hours.</p>
            <button onClick={onClose} style={{ padding: '10px 24px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-accent-blue)', color: '#fff', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer' }}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>📩 Send Enquiry</h3>
              <button onClick={onClose} style={{ fontSize: 18, color: 'var(--color-ink-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-ink-muted)', backgroundColor: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', padding: '8px 12px', marginBottom: 16 }}>{service.title}</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your name', required: true },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', required: true },
                { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+91 XXXXX XXXXX', required: false },
                { key: 'budget', label: 'Budget (₹)', type: 'text', placeholder: 'e.g. 5000 – 10000', required: false },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--color-ink-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} required={f.required} value={form[f.key as keyof typeof form]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} style={mInp} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--color-ink-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Message</label>
                <textarea rows={3} placeholder="Describe your requirements…" value={form.message} onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))} style={{ ...mInp, resize: 'none' }} />
              </div>
              <button type="submit" disabled={sending} style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-accent-blue)', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', opacity: sending ? 0.6 : 1 }}>
                {sending ? '⏳ Sending…' : '🚀 Send Enquiry'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('featured')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [wishlist, setWishlist] = useState<Set<number>>(new Set())
  const [enquireService, setEnquireService] = useState<Service | null>(null)
  const [showFilters, setShowFilters] = useState(false)


  const fetchServices = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      category, sort, page: page.toString(), limit: '12',
      ...(search ? { q: search } : {}),
    })
    try {
      const res = await fetch(`/api/services?${params}`)
      const data = await res.json()
      setServices(data.services || [])
      setTotal(data.total || 0)
    } catch {} finally { setLoading(false) }
  }, [category, sort, search, page])

  useEffect(() => { fetchServices() }, [fetchServices])

  // Load wishlist
  useEffect(() => {
    fetch('/api/services/wishlist')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.wishlist) setWishlist(new Set(d.wishlist)) })
      .catch(() => {})
  }, [])

  const toggleWishlist = async (serviceId: number) => {
    const res = await fetch('/api/services/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_id: serviceId }),
    })
    if (res.ok) {
      const data = await res.json()
      setWishlist(prev => {
        const next = new Set(prev)
        data.added ? next.add(serviceId) : next.delete(serviceId)
        return next
      })
    }
  }

  const totalPages = Math.ceil(total / 12)

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-canvas)', paddingTop: 72 }}>
        {/* Hero */}
        <div style={{ backgroundColor: 'var(--color-surface-1)', borderBottom: '1px solid var(--color-hairline-soft)', padding: '52px 32px 56px', textAlign: 'center' }}>
          <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(0,153,255,0.1)', color: 'var(--color-accent-blue)', border: '1px solid rgba(0,153,255,0.2)', marginBottom: 16 }}>🛍️ Service Marketplace</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-2px', marginBottom: 12 }}>Professional <span style={{ color: 'var(--color-accent-blue)' }}>Services</span></h1>
          <p style={{ fontSize: 15, color: 'var(--color-ink-muted)', maxWidth: 480, margin: '0 auto 28px' }}>Thesis Writing, Web Development, Digital Marketing &amp; More — All Under One Platform</p>
          <div style={{ position: 'relative', maxWidth: 520, margin: '0 auto' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-muted)', fontSize: 15 }}>🔍</span>
            <input type="text" placeholder="Search — thesis, website, business plan…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={{ width: '100%', boxSizing: 'border-box', paddingLeft: 44, paddingRight: 16, paddingTop: 14, paddingBottom: 14, borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-hairline)', backgroundColor: 'var(--color-surface-2)', color: 'var(--color-ink)', fontSize: 14, outline: 'none' }} />
          </div>
        </div>

        <div style={{ maxWidth: 1199, margin: '0 auto', padding: '32px 32px' }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }} className="svc-layout">
            {/* Filters sidebar */}
            <div style={{ width: 200, flexShrink: 0, position: 'sticky', top: 88 }} className={`svc-sidebar ${showFilters ? '' : 'svc-sidebar-hidden'}`}>
              <div style={{ backgroundColor: 'var(--color-surface-1)', border: '1px solid var(--color-hairline-soft)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink)', marginBottom: 14 }}>Categories</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {CATEGORIES.map(cat => (
                    <button key={cat.key} onClick={() => { setCategory(cat.key); setPage(1) }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 'var(--radius-md)', fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', backgroundColor: category === cat.key ? 'var(--color-accent-blue)' : 'transparent', color: category === cat.key ? '#fff' : 'var(--color-ink-muted)', textAlign: 'left' }}>
                      <span>{cat.icon}</span> {cat.label}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 20 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink)', marginBottom: 10 }}>Sort By</p>
                  <select value={sort} onChange={e => { setSort(e.target.value); setPage(1) }} style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', fontSize: 12, border: '1px solid var(--color-hairline)', backgroundColor: 'var(--color-surface-2)', color: 'var(--color-ink)', outline: 'none' }}>
                    {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                  </select>
                </div>
                <div style={{ marginTop: 16, padding: '14px 12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,153,255,0.2)', backgroundColor: 'rgba(0,153,255,0.06)', textAlign: 'center' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent-blue)', marginBottom: 8 }}>Need a Custom Quote?</p>
                  <Link href="/contact?type=quote" style={{ display: 'block', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: 11, fontWeight: 700, backgroundColor: 'var(--color-accent-blue)', color: '#fff', textDecoration: 'none' }}>Get Free Quote →</Link>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-ink)' }}>{total.toLocaleString()} Services{search && <span style={{ fontWeight: 400, color: 'var(--color-ink-muted)' }}> for &quot;{search}&quot;</span>}</span>
                <button onClick={() => setShowFilters(v => !v)} style={{ display: 'none', padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-hairline)', backgroundColor: 'var(--color-surface-1)', color: 'var(--color-ink)', fontSize: 13, cursor: 'pointer' }} className="svc-filter-toggle">🔧 Filters</button>
              </div>
              {/* Category pills */}
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 20 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat.key} onClick={() => { setCategory(cat.key); setPage(1) }}
                    style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 'var(--radius-pill)', fontSize: 12, fontWeight: 600, border: `1px solid ${category === cat.key ? 'var(--color-accent-blue)' : 'var(--color-hairline)'}`, backgroundColor: category === cat.key ? 'var(--color-accent-blue)' : 'var(--color-surface-1)', color: category === cat.key ? '#fff' : 'var(--color-ink-muted)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
              {/* Grid */}
              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="svc-grid">
                  {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ height: 260, borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-surface-1)' }} className="skeleton" />)}
                </div>
              ) : services.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 24px', backgroundColor: 'var(--color-surface-1)', border: '1px solid var(--color-hairline-soft)', borderRadius: 'var(--radius-xl)' }}>
                  <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>🔍</span>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-display)', marginBottom: 8 }}>No services found</h3>
                  <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginBottom: 20 }}>Try a different category or search term</p>
                  <button onClick={() => { setCategory('all'); setSearch(''); setPage(1) }} style={{ padding: '10px 24px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-accent-blue)', color: '#fff', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer' }}>View All Services</button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="svc-grid">
                    {services.map(service => (
                      <ServiceCard key={service.id} service={service} wishlisted={wishlist.has(service.id)} onWishlist={toggleWishlist} onEnquire={setEnquireService} />
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
                      <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: 13, border: '1px solid var(--color-hairline)', backgroundColor: 'var(--color-surface-1)', color: 'var(--color-ink)', cursor: 'pointer', opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
                      {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => { const pg = i + 1; return (<button key={pg} onClick={() => setPage(pg)} style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 700, border: `1px solid ${page === pg ? 'var(--color-accent-blue)' : 'var(--color-hairline)'}`, backgroundColor: page === pg ? 'var(--color-accent-blue)' : 'var(--color-surface-1)', color: page === pg ? '#fff' : 'var(--color-ink)', cursor: 'pointer' }}>{pg}</button>) })}
                      <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: 13, border: '1px solid var(--color-hairline)', backgroundColor: 'var(--color-surface-1)', color: 'var(--color-ink)', cursor: 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>Next →</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>



      {/* Enquiry Modal */}
      {enquireService && (
        <EnquiryModal service={enquireService} onClose={() => setEnquireService(null)} />
      )}

      <PageCTABanner
        headline="Can't Find What You Need?"
        subtext="Tell us your requirements and we'll match you with the perfect expert. 500+ services available across 50+ categories."
        primaryLabel="Request a Custom Service →"
        primaryHref="/contact?type=custom"
        secondaryLabel="💬 Chat on WhatsApp"
        secondaryHref="https://wa.me/918595025753"
        variant="orange"
      />
      <Footer />
    </>
  )
}
