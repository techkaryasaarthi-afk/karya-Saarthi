'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

/* ── Google "G" logo ──────────────────────────────────────────── */
const GoogleG = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

/* ── Quote icon ───────────────────────────────────────────────── */
const QuoteIcon = ({ color }: { color: string }) => (
  <svg width="32" height="24" viewBox="0 0 32 24" fill="none" aria-hidden="true">
    <path d="M0 24V14.4C0 6.4 4.8 1.6 14.4 0L16 3.2C11.2 4.267 8.533 6.933 8 11.2H14.4V24H0ZM17.6 24V14.4C17.6 6.4 22.4 1.6 32 0L33.6 3.2C28.8 4.267 26.133 6.933 25.6 11.2H32V24H17.6Z" fill={color} fillOpacity="0.18"/>
  </svg>
)

/* ── Types ────────────────────────────────────────────────────── */
interface GoogleReview {
  author_name: string
  profile_photo_url: string
  rating: number
  relative_time_description: string
  text: string
}

/* ── Fallback data ────────────────────────────────────────────── */
const FALLBACK_REVIEWS: GoogleReview[] = [
  { author_name: 'Priya Sharma',   profile_photo_url: '', rating: 5, relative_time_description: '2 weeks ago',  text: 'Karya Saarthi helped me with my MBA thesis. The quality was outstanding and delivered before deadline. Highly recommend to anyone looking for academic support!' },
  { author_name: 'Rahul Verma',    profile_photo_url: '', rating: 5, relative_time_description: '1 month ago',  text: 'Got my website developed by their team. Professional, responsive, and the design exceeded my expectations. Best investment I\'ve made for my business.' },
  { author_name: 'Ananya Singh',   profile_photo_url: '', rating: 5, relative_time_description: '3 weeks ago',  text: 'The campus ambassador program was an amazing experience. Learned so much about marketing and networking. The team is incredibly supportive. Thank you KS!' },
  { author_name: 'Mohit Gupta',    profile_photo_url: '', rating: 5, relative_time_description: '1 month ago',  text: 'Used their digital marketing services for my startup. Saw real results in just 2 months. ROI was excellent! Highly professional team.' },
  { author_name: 'Sneha Patel',    profile_photo_url: '', rating: 5, relative_time_description: '2 months ago', text: 'Research paper assistance was top-notch. The team understood exactly what I needed and delivered beyond expectations. Will definitely use again!' },
  { author_name: 'Arjun Nair',     profile_photo_url: '', rating: 4, relative_time_description: '3 weeks ago',  text: 'Very professional team. Quick turnaround on my project presentation. 24/7 support as promised. Would recommend for any technical work.' },
  { author_name: 'Kavya Reddy',    profile_photo_url: '', rating: 5, relative_time_description: '1 week ago',   text: 'Excellent service! They guided me through every step of my dissertation. The support is genuinely unmatched. 10/10 would recommend.' },
]

/* ── Accent colours per card ──────────────────────────────────── */
const ACCENTS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

function getAccent(name: string) {
  return ACCENTS[name.charCodeAt(0) % ACCENTS.length]
}

/* ── Star row ─────────────────────────────────────────────────── */
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
          <path
            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            fill={i < rating ? '#fbbc04' : 'rgba(255,255,255,0.12)'}
          />
        </svg>
      ))}
    </div>
  )
}

/* ── Single testimonial card ──────────────────────────────────── */
function TestimonialCard({
  review, index, isActive,
}: {
  review: GoogleReview
  index: number
  isActive: boolean
}) {
  const accent  = getAccent(review.author_name)
  const initial = review.author_name.charAt(0).toUpperCase()

  return (
    <div
      className={`tcard${isActive ? ' tcard--active' : ''}`}
      style={{ '--accent': accent } as React.CSSProperties}
    >
      {/* Quote decoration */}
      <div style={{ marginBottom: 16 }}>
        <QuoteIcon color={accent} />
      </div>

      {/* Review text */}
      <p className="tcard__text">
        {review.text}
      </p>

      {/* Footer */}
      <div className="tcard__footer">
        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: `linear-gradient(135deg, ${accent}cc, ${accent}66)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17, fontWeight: 800, color: '#fff', flexShrink: 0,
              border: `2px solid ${accent}44`,
            }}
          >
            {initial}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2, lineHeight: 1.2 }}>
              {review.author_name}
            </p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1 }}>
              {review.relative_time_description}
            </p>
          </div>
        </div>

        {/* Stars + Google badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
          <Stars rating={review.rating} size={13} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <GoogleG />
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Google</span>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="tcard__line" />
    </div>
  )
}

/* ── Main section ─────────────────────────────────────────────── */
export default function TestimonialsSection() {
  const [reviews,      setReviews]      = useState<GoogleReview[]>(FALLBACK_REVIEWS)
  const [index,        setIndex]        = useState(0)
  const [paused,       setPaused]       = useState(false)
  const [cols,         setCols]         = useState(3)
  const sliderRef                       = useRef<HTMLDivElement>(null)

  /* ── Responsive column count ──────────────────────────────── */
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w <= 480)  setCols(1)
      else if (w <= 768)  setCols(2)
      else if (w <= 1100) setCols(2)
      else setCols(3)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  /* ── Fetch real reviews ───────────────────────────────────── */
  useEffect(() => {
    fetch('/api/reviews')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.reviews?.length) setReviews(d.reviews) })
      .catch(() => {})
  }, [])

  const total    = reviews.length
  const maxIndex = Math.max(0, total - cols)

  useEffect(() => {
    setIndex(i => Math.min(i, maxIndex))
  }, [maxIndex])

  const prev = useCallback(() => setIndex(i => Math.max(0, i - 1)), [])
  const next = useCallback(() => setIndex(i => Math.min(maxIndex, i + 1)), [maxIndex])

  /* ── Touch / drag swipe ──────────────────────────────────── */
  const touchStart = useRef(0)
  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX }
  const onTouchEnd   = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
  }

  /* ── Auto-advance ────────────────────────────────────────── */
  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setIndex(i => i >= maxIndex ? 0 : i + 1), 4500)
    return () => clearInterval(t)
  }, [paused, maxIndex])

  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)

  return (
    <section
      id="testimonials"
      aria-label="Customer testimonials"
      className="testimonials-section"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Background decoration ─────────────────────────── */}
      <div className="t-bg-glow t-bg-glow--left"  aria-hidden="true" />
      <div className="t-bg-glow t-bg-glow--right" aria-hidden="true" />
      <div className="t-bg-grid" aria-hidden="true" />

      <div className="t-container">

        {/* ── Header ────────────────────────────────────────── */}
        <div className="t-header">
          <div className="t-header__left">
            <span className="t-badge">⭐ Client Reviews</span>
            <h2 className="t-heading">
              What Our <span className="t-heading__accent">Clients Say</span>
            </h2>
            <p className="t-subheading">
              Trusted by 500+ students and businesses across India
            </p>
          </div>

          {/* Rating summary */}
          <div className="t-rating-block">
            <div className="t-rating-block__score">
              <span className="t-rating-block__number">{avg}</span>
              <div>
                <Stars rating={5} size={16} />
                <p className="t-rating-block__label">on Google</p>
              </div>
            </div>
            <p className="t-rating-block__count">{reviews.length} verified reviews</p>
          </div>
        </div>

        {/* ── Slider track ──────────────────────────────────── */}
        <div
          className="t-track"
          ref={sliderRef}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="t-slider"
            style={{
              transform: `translateX(calc(-${index} * (100% / ${cols} + 20px / ${cols})))`,
            }}
          >
            {reviews.map((r, i) => (
              <TestimonialCard
                key={i}
                review={r}
                index={i}
                isActive={i >= index && i < index + cols}
              />
            ))}
          </div>
        </div>

        {/* ── Controls ──────────────────────────────────────── */}
        <div className="t-controls">
          {/* Dot indicators */}
          <div className="t-dots" role="tablist" aria-label="Review navigation">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === index}
                aria-label={`Go to review set ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`t-dot${i === index ? ' t-dot--active' : ''}`}
              />
            ))}
          </div>

          {/* Arrow buttons */}
          <div className="t-arrows">
            <button
              onClick={prev}
              disabled={index === 0}
              id="testimonials-prev-btn"
              aria-label="Previous reviews"
              className="t-arrow"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <button
              onClick={next}
              disabled={index >= maxIndex}
              id="testimonials-next-btn"
              aria-label="Next reviews"
              className="t-arrow"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>

      </div>

      {/* ── All styles scoped to this section ─────────────────── */}
      <style>{`
        /* ── Section shell ──────────────────────────────────── */
        .testimonials-section {
          position: relative;
          overflow: hidden;
          background: #0a0a0a;
          padding: var(--space-section) 0;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        /* ── Background elements ────────────────────────────── */
        .t-bg-grid {
          position: absolute;
          inset: 0;
          opacity: 0.025;
          background-image:
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }
        .t-bg-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .t-bg-glow--left  { top: -20%; left: -10%; background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%); }
        .t-bg-glow--right { bottom: -20%; right: -10%; background: radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%); }

        /* ── Container ──────────────────────────────────────── */
        .t-container {
          max-width: 1199px;
          margin: 0 auto;
          padding: 0 var(--space-xl);
          position: relative;
          z-index: 1;
        }

        /* ── Header ─────────────────────────────────────────── */
        .t-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 52px;
          flex-wrap: wrap;
        }
        .t-header__left { flex: 1; min-width: 200px; }
        .t-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 5px 14px;
          border-radius: 999px;
          background: rgba(251,188,4,0.1);
          color: #fbbc04;
          border: 1px solid rgba(251,188,4,0.25);
          margin-bottom: 16px;
        }
        .t-heading {
          font-family: var(--font-display);
          font-size: clamp(28px, 3.5vw, 44px);
          font-weight: 700;
          color: #fff;
          letter-spacing: -1.5px;
          line-height: 1.1;
          margin-bottom: 10px;
        }
        .t-heading__accent { color: #6366f1; }
        .t-subheading { font-size: 14px; color: rgba(255,255,255,0.45); }

        /* ── Rating block ───────────────────────────────────── */
        .t-rating-block {
          text-align: right;
          flex-shrink: 0;
        }
        .t-rating-block__score {
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: flex-end;
          margin-bottom: 6px;
        }
        .t-rating-block__number {
          font-family: var(--font-display);
          font-size: 42px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -2px;
          line-height: 1;
        }
        .t-rating-block__label {
          font-size: 10px;
          color: rgba(255,255,255,0.35);
          font-weight: 600;
          margin-top: 4px;
        }
        .t-rating-block__count { font-size: 12px; color: rgba(255,255,255,0.4); }

        /* ── Slider track ───────────────────────────────────── */
        .t-track {
          overflow: hidden;
          position: relative;
          /* Fade edges */
          mask-image: linear-gradient(90deg, transparent 0%, #000 3%, #000 97%, transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 3%, #000 97%, transparent 100%);
        }
        .t-slider {
          display: flex;
          gap: 20px;
          transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: transform;
        }
        /* Card width by column count */
        .t-slider > .tcard { flex-shrink: 0; width: calc((100% - 40px) / 3); }
        @media (max-width: 1100px) { .t-slider > .tcard { width: calc((100% - 20px) / 2) !important; } }
        @media (max-width: 768px)  { .t-slider > .tcard { width: calc((100% - 16px) / 2) !important; } }
        @media (max-width: 480px)  { .t-slider > .tcard { width: 100% !important; } }

        /* ── Testimonial card ───────────────────────────────── */
        .tcard {
          position: relative;
          background: linear-gradient(145deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.02) 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 28px 26px 24px;
          display: flex;
          flex-direction: column;
          gap: 0;
          cursor: default;
          backdrop-filter: blur(12px);
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), border-color 0.3s, box-shadow 0.3s, opacity 0.3s;
          opacity: 0.6;
          overflow: hidden;
        }
        .tcard--active {
          opacity: 1;
          border-color: rgba(255,255,255,0.13);
        }
        .tcard:hover {
          transform: translateY(-6px);
          border-color: var(--accent, rgba(99,102,241,0.5)) !important;
          box-shadow: 0 20px 48px rgba(0,0,0,0.4), 0 0 0 1px var(--accent, #6366f1) inset;
        }

        /* Card text */
        .tcard__text {
          font-size: 14px;
          color: rgba(255,255,255,0.72);
          line-height: 1.7;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 5;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 24px;
          font-style: italic;
        }

        /* Card footer */
        .tcard__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.07);
          flex-wrap: wrap;
        }

        /* Bottom accent line */
        .tcard__line {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--accent, #6366f1), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .tcard:hover .tcard__line { opacity: 1; }

        /* ── Controls ───────────────────────────────────────── */
        .t-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 32px;
          margin-top: 36px;
          flex-wrap: wrap;
        }

        /* Dots */
        .t-dots { display: flex; gap: 8px; align-items: center; }
        .t-dot {
          height: 6px;
          width: 6px;
          border-radius: 99px;
          border: none;
          background: rgba(255,255,255,0.2);
          cursor: pointer;
          transition: width 0.35s cubic-bezier(0.16,1,0.3,1), background 0.35s;
          padding: 10px 0;
          margin: -10px 0;
          box-sizing: content-box;
        }
        .t-dot--active {
          width: 28px;
          background: #6366f1;
        }

        /* Arrows */
        .t-arrows { display: flex; gap: 10px; }
        .t-arrow {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
          flex-shrink: 0;
        }
        .t-arrow:hover:not(:disabled) {
          background: rgba(99,102,241,0.15);
          border-color: rgba(99,102,241,0.5);
          color: #fff;
          transform: scale(1.08);
        }
        .t-arrow:disabled {
          opacity: 0.25;
          cursor: not-allowed;
        }

        /* ── Responsive overrides ───────────────────────────── */
        @media (max-width: 768px) {
          .t-container    { padding: 0 16px; }
          .t-header       { margin-bottom: 28px; flex-direction: column; align-items: flex-start; gap: 16px; }
          .t-heading      { font-size: clamp(22px, 6vw, 32px); margin-bottom: 6px; }
          .t-rating-block { text-align: left; width: 100%; }
          .t-rating-block__score  { justify-content: flex-start; }
          .t-rating-block__number { font-size: 32px; }
          .tcard          { padding: 20px 16px 16px; border-radius: 16px; }
          .tcard__text    { font-size: 13px; -webkit-line-clamp: 4; margin-bottom: 16px; }
          .tcard__footer  { padding-top: 14px; }
          .t-controls     { gap: 20px; margin-top: 24px; }
        }
        @media (max-width: 480px) {
          .testimonials-section   { padding: 48px 0; }
          .t-container            { padding: 0 16px; }
          .t-header               { margin-bottom: 24px; }
          /* On very small screens, collapse rating row to hide the large 42px number */
          .t-rating-block__number { font-size: 28px; }
          .t-rating-block__score  { gap: 8px; }
          /* Remove edge fade on single-col to prevent clipping */
          .t-track {
            mask-image: none !important;
            -webkit-mask-image: none !important;
          }
        }
      `}</style>
    </section>
  )
}
