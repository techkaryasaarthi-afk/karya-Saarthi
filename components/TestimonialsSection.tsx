'use client'

import { useState, useEffect, useCallback } from 'react'

const GoogleG = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

interface GoogleReview {
  author_name: string
  profile_photo_url: string
  rating: number
  relative_time_description: string
  text: string
}

const FALLBACK_REVIEWS: GoogleReview[] = [
  { author_name: 'Priya Sharma',   profile_photo_url: '', rating: 5, relative_time_description: '2 weeks ago',  text: 'Karya Saarthi helped me with my MBA thesis. The quality was outstanding and delivered before deadline. Highly recommend to anyone looking for academic support!' },
  { author_name: 'Rahul Verma',    profile_photo_url: '', rating: 5, relative_time_description: '1 month ago',  text: 'Got my website developed by their team. Professional, responsive, and the design exceeded my expectations. Best investment I\'ve made for my business.' },
  { author_name: 'Ananya Singh',   profile_photo_url: '', rating: 5, relative_time_description: '3 weeks ago',  text: 'The campus ambassador program was an amazing experience. Learned so much about marketing and networking. The team is incredibly supportive. Thank you KS!' },
  { author_name: 'Mohit Gupta',    profile_photo_url: '', rating: 5, relative_time_description: '1 month ago',  text: 'Used their digital marketing services for my startup. Saw real results in just 2 months. ROI was excellent! Highly professional team.' },
  { author_name: 'Sneha Patel',    profile_photo_url: '', rating: 5, relative_time_description: '2 months ago', text: 'Research paper assistance was top-notch. The team understood exactly what I needed and delivered beyond expectations. Will definitely use again!' },
  { author_name: 'Arjun Nair',     profile_photo_url: '', rating: 4, relative_time_description: '3 weeks ago',  text: 'Very professional team. Quick turnaround on my project presentation. 24/7 support as promised. Would recommend for any technical work.' },
  { author_name: 'Kavya Reddy',    profile_photo_url: '', rating: 5, relative_time_description: '1 week ago',   text: 'Excellent service! They guided me through every step of my dissertation. The support is genuinely unmatched. 10/10 would recommend.' },
]

const AVATAR_COLORS = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899']
const VISIBLE = 4 // number of cards visible at once (desktop)

function getVisibleCount() {
  if (typeof window === 'undefined') return VISIBLE
  if (window.innerWidth <= 480) return 1
  if (window.innerWidth <= 768) return 2
  if (window.innerWidth <= 1024) return 3
  return VISIBLE
}

function ReviewCard({ review, active }: { review: GoogleReview; active: boolean }) {
  const initial = review.author_name?.charAt(0)?.toUpperCase() || '?'
  const color   = AVATAR_COLORS[review.author_name.charCodeAt(0) % AVATAR_COLORS.length]

  return (
    <div style={{
      backgroundColor: 'var(--color-surface-1)',
      border: `1px solid ${active ? 'rgba(0,153,255,0.25)' : 'var(--color-hairline-soft)'}`,
      borderRadius: 'var(--radius-lg)',
      padding: '24px 22px',
      display: 'flex', flexDirection: 'column', gap: 14,
      flexShrink: 0,
      width: undefined,
      /* Use opacity transition (GPU-composited) instead of box-shadow/border-color (non-composited) */
      opacity: active ? 1 : 0.75,
      transition: 'opacity 0.3s',
      willChange: 'opacity',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 15, fontWeight: 700, color: '#fff' }}>
          {initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{review.author_name}</p>
          <p style={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>{review.relative_time_description}</p>
        </div>
        <div style={{ width: 26, height: 26, backgroundColor: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <GoogleG />
        </div>
      </div>

      {/* Stars */}
      <div style={{ display: 'flex', gap: 2 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill={i < review.rating ? '#fbbc04' : 'var(--color-hairline)'} />
          </svg>
        ))}
      </div>

      {/* Text */}
      <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', lineHeight: 1.65, flex: 1, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        "{review.text}"
      </p>
    </div>
  )
}

export default function TestimonialsSection() {
  const [reviews,  setReviews]  = useState<GoogleReview[]>(FALLBACK_REVIEWS)
  const [index,    setIndex]    = useState(0)
  const [paused,   setPaused]   = useState(false)
  const [visibleCount, setVisibleCount] = useState(VISIBLE)

  useEffect(() => {
    const update = () => setVisibleCount(getVisibleCount())
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    fetch('/api/reviews')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.reviews?.length) setReviews(d.reviews) })
      .catch(() => {})
  }, [])

  // Total pages based on visible cards
  const maxIndex = Math.max(0, reviews.length - visibleCount)

  // Clamp index if visibleCount changes
  useEffect(() => {
    setIndex(i => Math.min(i, maxIndex))
  }, [maxIndex])

  const prev = useCallback(() => setIndex(i => Math.max(0, i - 1)), [])
  const next = useCallback(() => setIndex(i => Math.min(maxIndex, i + 1)), [maxIndex])

  // Auto-advance every 4s
  useEffect(() => {
    if (paused) return
    const t = setInterval(() => {
      setIndex(i => (i >= maxIndex ? 0 : i + 1))
    }, 4000)
    return () => clearInterval(t)
  }, [paused, maxIndex])

  // Rating summary
  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)

  return (
    <section
      id="testimonials"
      aria-label="Customer reviews"
      style={{
        backgroundColor: 'var(--color-surface-1)',
        paddingTop: 'var(--space-section)',
        paddingBottom: 'var(--space-section)',
        borderTop: '1px solid var(--color-hairline-soft)',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div style={{ maxWidth: 1199, margin: '0 auto', paddingLeft: 'var(--space-xl)', paddingRight: 'var(--space-xl)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 44, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(251,188,4,0.1)', color: '#fbbc04', border: '1px solid rgba(251,188,4,0.25)', marginBottom: 14 }}>
              ⭐ Customer Reviews
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-1.5px', marginBottom: 4 }}>
              What Our Clients Say
            </h2>
            <p style={{ fontSize: 14, color: 'var(--color-ink-muted)' }}>
              Trusted by 500+ students and businesses across India
            </p>
          </div>

          {/* Rating summary + nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-1px' }}>{avg}</span>
                <div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} viewBox="0 0 24 24" width="14" height="14"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="#fbbc04" /></svg>
                    ))}
                  </div>
                  <p style={{ fontSize: 10, color: 'var(--color-ink-muted)', fontWeight: 600 }}>on Google</p>
                </div>
              </div>
              <p style={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>{reviews.length} reviews</p>
            </div>

            {/* Prev/Next */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={prev} disabled={index === 0} id="testimonials-prev-btn"
                aria-label="Previous testimonial"
                style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-hairline)',
                  backgroundColor: 'var(--color-surface-2)',
                  color: 'var(--color-ink)', fontSize: 16, cursor: 'pointer',
                  opacity: index === 0 ? 0.35 : 1,
                  transition: 'opacity 0.15s, background-color 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              ><span aria-hidden="true">←</span></button>
              <button
                onClick={next} disabled={index >= maxIndex} id="testimonials-next-btn"
                aria-label="Next testimonial"
                style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-hairline)',
                  backgroundColor: 'var(--color-surface-2)',
                  color: 'var(--color-ink)', fontSize: 16, cursor: 'pointer',
                  opacity: index >= maxIndex ? 0.35 : 1,
                  transition: 'opacity 0.15s, background-color 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              ><span aria-hidden="true">→</span></button>
            </div>
          </div>
        </div>

        {/* Slider */}
        <div style={{ overflow: 'hidden', position: 'relative' }}>
          <div
            className="testimonials-slider"
            style={{
              display: 'flex', gap: 16,
              transform: `translateX(calc(-${index} * (100% / ${visibleCount} + ${16 / visibleCount}px)))`,
              transition: 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          >
            {reviews.map((r, i) => (
              <ReviewCard key={i} review={r} active={i >= index && i < index + visibleCount} />
            ))}
          </div>
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 28 }}>
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to review ${i + 1}`}
              aria-current={i === index ? 'true' : undefined}
              style={{
                /* Visual size of the dot */
                width: i === index ? 24 : 8, height: 8, borderRadius: 99,
                border: 'none', cursor: 'pointer',
                backgroundColor: i === index ? 'var(--color-accent-blue)' : 'var(--color-hairline)',
                transition: 'width 0.3s, background-color 0.3s',
                /* Expand tap area to 44px minimum without changing visual layout */
                padding: '18px 0',
                margin: '-18px 0',
                boxSizing: 'content-box',
              }}
            />
          ))}
          <style>{`
          .testimonials-slider > div {
            width: calc((100% - ${(VISIBLE - 1) * 16}px) / ${VISIBLE});
            flex-shrink: 0;
          }
          @media (max-width: 1024px) {
            .testimonials-slider > div {
              width: calc((100% - ${(3 - 1) * 16}px) / 3);
            }
          }
          @media (max-width: 768px) {
            .testimonials-slider > div {
              width: calc((100% - 16px) / 2);
            }
          }
          @media (max-width: 480px) {
            .testimonials-slider > div {
              width: 100%;
            }
          }
        `}</style>
      </div>
      </div>
    </section>
  )
}
