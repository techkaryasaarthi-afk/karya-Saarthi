'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

import PageCTABanner from '@/components/PageCTABanner'

interface TimelineItem { id: number; year: string; title: string; description: string; sort_order: number }
interface Member { id: number; name: string; role: string; image_url: string | null; vision: string | null; mission: string | null; statement: string | null }
interface Achievement { id: number; icon: string; value: string; label: string }
interface Company { vision: string; mission: string; story: string; tagline: string }
interface AboutData { company: Company; timeline: TimelineItem[]; achievements: Achievement[]; members: Member[] }

const FALLBACK: AboutData = {
  company: {
    vision: 'To create a global platform where knowledge meets opportunity, making quality education and professional services accessible to every student and business across India and beyond.',
    mission: 'To empower 10 million students and 1 million businesses by 2030 through collaborative learning and affordable professional services.',
    story: 'Karya Saarthi was founded with a vision to bridge the gap between what education teaches and what the industry demands.',
    tagline: "From a small idea to India's most trusted work companion — powered by passion, driven by purpose.",
  },
  timeline: [
    { id: 1, year: '2024', title: 'Karya Saarthi Founded', description: 'Started with a vision to make professional services accessible to every student and business.', sort_order: 1 },
    { id: 2, year: '2024', title: 'First 100 Clients', description: 'Crossed 100 happy clients within 6 months of launch.', sort_order: 2 },
    { id: 3, year: '2025', title: '500+ Projects Done', description: 'Expanded to 50+ service categories across academic, tech, and design.', sort_order: 3 },
    { id: 4, year: '2025', title: 'Going Digital', description: 'Launched online platform with AI-powered service matching and project tracking.', sort_order: 4 },
  ],
  achievements: [
    { id: 1, icon: '🏆', value: '500+', label: 'Projects Delivered' },
    { id: 2, icon: '⭐', value: '4.9/5', label: 'Average Rating' },
    { id: 3, icon: '🎓', value: '50+', label: 'Service Categories' },
    { id: 4, icon: '🌐', value: '10+', label: 'Cities Served' },
    { id: 5, icon: '👨‍💼', value: '100+', label: 'Verified Experts' },
    { id: 6, icon: '🔄', value: '80%', label: 'Repeat Rate' },
  ],
  members: [
    { id: 1, name: 'Adv. Saloni Kumari', role: 'Founder & Director', image_url: '/images/team/Saloni.jpg', vision: 'To create a global platform where knowledge meets opportunity.', mission: 'To empower 10 million students and 1 million businesses by 2030.', statement: "As a legal professional turned entrepreneur, I've witnessed the gap between what education teaches and what the industry demands. Karya Saarthi bridges that gap." },
    { id: 2, name: 'Pawandeep Kaur', role: 'Co-Founder & Project Manager Head', image_url: '/images/team/Pawandeep.jpg', vision: 'To build the most efficient and customer-centric project delivery system in India.', mission: 'To ensure 100% on-time delivery with 98%+ customer satisfaction.', statement: "Project management is not about deadlines alone — it's about people. Every project has a student behind it with dreams." },
    { id: 3, name: 'Bhawna', role: 'HR Executive', image_url: '/images/team/Bhawna.jpeg', vision: 'To build the strongest network of verified experts where talent meets opportunity.', mission: 'To recruit, train, and retain the best talent with 1000+ verified experts by 2027.', statement: 'People are our biggest asset. Every vendor we hire, every intern we train — they all contribute to the Karya Saarthi family.' },
    { id: 4, name: 'Rakhi Bhatt', role: 'Operations Manager', image_url: '/images/team/Rakhi.jpeg', vision: 'To create the most streamlined operational framework where every customer query is resolved within hours.', mission: 'To maintain 99% operational efficiency through daily monitoring and continuous improvement.', statement: 'Operations is the backbone of any business. I monitor, I improve, I optimize — daily.' },
  ],
}

const cardSx: React.CSSProperties = {
  backgroundColor: 'var(--color-surface-1)',
  border: '1px solid var(--color-hairline-soft)',
  borderRadius: 'var(--radius-xl)',
}

export default function AboutPage() {
  const [flipped, setFlipped] = useState<number | null>(null)
  const [data,    setData]    = useState<AboutData>(FALLBACK)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/about?public=true')
      .then(r => r.json())
      .then(d => {
        setData({
          company:      (d.company && d.company.vision)        ? d.company      : FALLBACK.company,
          timeline:     (d.timeline && d.timeline.length)      ? d.timeline     : FALLBACK.timeline,
          achievements: (d.achievements && d.achievements.length) ? d.achievements : FALLBACK.achievements,
          members:      (d.members && d.members.length)        ? d.members      : FALLBACK.members,
        })
      })
      .catch(() => setData(FALLBACK))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72, backgroundColor: 'var(--color-canvas)', minHeight: '100vh' }}>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section style={{ backgroundColor: 'var(--color-surface-1)', borderBottom: '1px solid var(--color-hairline-soft)', padding: '64px 32px 72px', textAlign: 'center' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(0,153,255,0.1)', color: 'var(--color-accent-blue)', border: '1px solid rgba(0,153,255,0.2)', marginBottom: 20 }}>Our Story</span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-2px', marginBottom: 16, lineHeight: 1.05 }}>About Karya Saarthi — Our Story &amp; Mission</h1>
            <p style={{ fontSize: 16, color: 'var(--color-ink-muted)', lineHeight: 1.7, maxWidth: 540, margin: '0 auto' }}>
              {data.company.tagline}
            </p>
          </div>
        </section>

        {/* ── Behind the Scenes ───────────────────────────────── */}
        <section style={{ padding: '72px 32px', borderBottom: '1px solid var(--color-hairline-soft)' }}>
          <div style={{ maxWidth: 1199, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }} className="about-two-col">
            <div>
              <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(0,153,255,0.08)', color: 'var(--color-accent-blue)', marginBottom: 20 }}>Behind the Scenes</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-1px', marginBottom: 16 }}>Life at Karya Saarthi</h2>
              <p style={{ fontSize: 15, color: 'var(--color-ink-muted)', lineHeight: 1.7, marginBottom: 14 }}>
                At Karya Saarthi, we are building a collaborative ecosystem where passion meets execution. Our work culture revolves around rapid learning, creative freedom, and delivering impact for our clients.
              </p>
              <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', lineHeight: 1.7 }}>
                From brainstorm sessions in digital design to coding workflows and hyperlocal outreach management — get an insider view of our daily workspaces, R&amp;D labs, and the teams driving student and business success.
              </p>
            </div>
            <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--color-hairline-soft)', backgroundColor: '#000' }}>
              <video src="/images/karyasaarthi.mp4" muted loop playsInline controls preload="metadata" style={{ width: '100%', display: 'block' }} />
            </div>
          </div>
        </section>

        {loading ? (
          <div style={{ maxWidth: 1199, margin: '0 auto', padding: '60px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : (
          <>
            {/* ── Journey Timeline ──────────────────────────────── */}
            {data.timeline.length > 0 && (
              <section style={{ padding: '72px 32px', borderBottom: '1px solid var(--color-hairline-soft)' }}>
                <div style={{ maxWidth: 760, margin: '0 auto' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-1.5px', textAlign: 'center', marginBottom: 52 }}>Our Journey</h2>
                  <div style={{ position: 'relative' }}>
                    {/* Center line */}
                    <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, backgroundColor: 'var(--color-hairline)', transform: 'translateX(-50%)' }} className="timeline-line" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                      {data.timeline.map((item, i) => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 24, flexDirection: i % 2 === 0 ? 'row' : 'row-reverse' }} className="timeline-item">
                          <div style={{ flex: 1, textAlign: i % 2 === 0 ? 'right' : 'left' }} className="timeline-content">
                            <div style={{ ...cardSx, padding: '20px 24px', display: 'inline-block', textAlign: 'left', maxWidth: 300 }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-accent-blue)', display: 'block', marginBottom: 6 }}>{item.year}</span>
                              <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>{item.title}</h4>
                              <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', lineHeight: 1.55 }}>{item.description}</p>
                            </div>
                          </div>
                          <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: 'var(--color-accent-blue)', border: '3px solid var(--color-canvas)', flexShrink: 0, zIndex: 1 }} className="timeline-dot" />
                          <div style={{ flex: 1 }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ── Vision & Mission ─────────────────────────────── */}
            {(data.company.vision || data.company.mission) && (
              <section style={{ padding: '72px 32px', backgroundColor: 'var(--color-surface-1)', borderBottom: '1px solid var(--color-hairline-soft)' }}>
                <div style={{ maxWidth: 1199, margin: '0 auto' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-1.5px', textAlign: 'center', marginBottom: 48 }}>Our Vision &amp; Mission</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="about-two-col">
                    {[
                      { icon: '🎯', title: 'Vision', text: data.company.vision },
                      { icon: '🚀', title: 'Mission', text: data.company.mission },
                    ].map(v => (
                      <div key={v.title} style={{ ...cardSx, padding: 36 }}>
                        <div style={{ fontSize: 36, marginBottom: 16 }}>{v.icon}</div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 14 }}>{v.title}</h3>
                        <p style={{ fontSize: 14, color: 'var(--color-ink-muted)', lineHeight: 1.75 }}>&ldquo;{v.text}&rdquo;</p>
                        {data.members[0] && <p style={{ marginTop: 16, fontSize: 12, color: 'var(--color-accent-blue)', fontWeight: 600 }}>— {data.members[0].name}, {data.members[0].role}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* ── Team ─────────────────────────────────────────── */}
            {data.members.length > 0 && (
              <section style={{ padding: '72px 32px', borderBottom: '1px solid var(--color-hairline-soft)' }}>
                <div style={{ maxWidth: 1199, margin: '0 auto' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-1.5px', textAlign: 'center', marginBottom: 12 }}>Meet Our Team</h2>
                  <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--color-ink-muted)', marginBottom: 48 }}>The passionate people behind Karya Saarthi — click a card to know more!</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
                    {data.members.map((m, i) => (
                      <div
                        key={m.id}
                        onClick={() => setFlipped(flipped === i ? null : i)}
                        style={{ cursor: 'pointer', perspective: 1000, height: 400 }}
                      >
                        <div style={{ position: 'relative', width: '100%', height: '100%', transition: 'transform 0.6s', transformStyle: 'preserve-3d', transform: flipped === i ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                          {/* Front */}
                          <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', ...cardSx, borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
                            <div style={{ height: 220, position: 'relative', backgroundColor: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {m.image_url ? (
                                <Image src={m.image_url} alt={m.name} fill sizes="300px" style={{ objectFit: 'contain', padding: 16 }} onError={() => {}} />
                              ) : (
                                <span style={{ fontSize: 64, color: 'var(--color-ink-muted)', fontWeight: 700 }}>{m.name.charAt(0)}</span>
                              )}
                            </div>
                            <div style={{ padding: '20px 20px 16px', textAlign: 'center' }}>
                              <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>{m.name}</h4>
                              <p style={{ fontSize: 12, color: 'var(--color-accent-blue)', fontWeight: 600, marginBottom: 10 }}>{m.role}</p>
                              <p style={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>Click to know more →</p>
                            </div>
                          </div>
                          {/* Back */}
                          <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', ...cardSx, borderRadius: 'var(--radius-xl)', padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: 'var(--color-surface-2)' }}>
                            <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>{m.name}</h4>
                            <p style={{ fontSize: 11, color: 'var(--color-accent-blue)', fontWeight: 600, marginBottom: 16 }}>{m.role}</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                              {m.vision    && <div><span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-accent-blue)' }}>Vision</span><p style={{ fontSize: 12, color: 'var(--color-ink-muted)', lineHeight: 1.5, marginTop: 4 }}>{m.vision}</p></div>}
                              {m.mission   && <div><span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-accent-blue)' }}>Mission</span><p style={{ fontSize: 12, color: 'var(--color-ink-muted)', lineHeight: 1.5, marginTop: 4 }}>{m.mission}</p></div>}
                              {m.statement && <div><span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-accent-blue)' }}>Statement</span><p style={{ fontSize: 11, color: 'var(--color-ink-muted)', lineHeight: 1.5, marginTop: 4, fontStyle: 'italic' }}>&ldquo;{m.statement}&rdquo;</p></div>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* ── Achievements ─────────────────────────────────── */}
            {data.achievements.length > 0 && (
              <section style={{ padding: '72px 32px', backgroundColor: 'var(--color-surface-1)', borderBottom: '1px solid var(--color-hairline-soft)' }}>
                <div style={{ maxWidth: 1199, margin: '0 auto' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-1.5px', textAlign: 'center', marginBottom: 48 }}>Our Achievements</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
                    {data.achievements.map(a => (
                      <div key={a.id} style={{ textAlign: 'center', padding: '28px 20px', ...cardSx, borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ fontSize: 32, marginBottom: 10 }}>{a.icon}</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-1px' }}>{a.value}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', marginTop: 6 }}>{a.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <PageCTABanner
        headline="Ready to Work with Us?"
        subtext="Whether you're a student, business owner, or startup — Karya Saarthi is your one-stop solution. Get started today!"
        primaryLabel="Get Free Quote →"
        primaryHref="/contact"
        secondaryLabel="📞 Call Us Now"
        secondaryHref="tel:+918595025753"
        variant="violet"
      />
      <Footer />


      <style>{`
        .about-two-col { grid-template-columns: 1fr 1fr; }
        .timeline-line { display: block; }
        .timeline-item { flex-direction: row; }
        @media (max-width: 768px) {
          .about-two-col  { grid-template-columns: 1fr !important; }
          .timeline-line  { display: none; }
          .timeline-item  { flex-direction: column !important; }
          .timeline-dot   { display: none; }
          .timeline-content { text-align: left !important; max-width: 100% !important; }
        }
      `}</style>
    </>
  )
}
