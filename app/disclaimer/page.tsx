import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Disclaimer | Karya Saarthi',
  description: 'Important disclaimer for Karya Saarthi services. Educational purpose only. No guarantee of grades.',
}

const sections = [
  {
    id: 'service',
    icon: '📌',
    title: '1. Service Disclaimer',
    content: 'Karya Saarthi provides educational project solutions and professional support services. We are NOT responsible for:',
    bullets: [
      'Grades or marks — these depend entirely on your professor\'s evaluation and assessment rubric',
      'Plagiarism detection outcomes — while we guarantee low-plagiarism content, different tools use different algorithms',
      'Academic integrity violations — compliance with your institution\'s academic honesty policy is your responsibility',
      'Misuse of our services — any misuse is solely the user\'s responsibility',
    ],
  },
  {
    id: 'grades',
    icon: '📊',
    title: '2. No Guarantee of Grades',
    content: 'We are committed to delivering high-quality work. However, final grades depend on numerous factors beyond our control:',
    bullets: [
      'Professor\'s individual evaluation criteria and personal assessment',
      'Class curve and relative grading within your cohort',
      'Rubric interpretation and subject-specific requirements',
      'Additional submission requirements we may not be aware of',
    ],
    note: 'We provide quality work and guidance. Grade outcomes are outside our control and we make no guarantees regarding academic results.',
  },
  {
    id: 'educational',
    icon: '🎓',
    title: '3. Educational Purpose Only',
    content: 'Our services are intended for educational assistance, learning support, and understanding of complex subjects. Important:',
    bullets: [
      'Our content is meant to help you learn and understand the subject matter',
      'Submitting our work verbatim as 100% your own without learning constitutes academic dishonesty',
      'Academic dishonesty is governed by your institution\'s policies — we are not responsible for violations',
      'Use our services as a learning reference, guide, or starting point for your own work',
    ],
  },
  {
    id: 'thirdparty',
    icon: '🔌',
    title: '4. Third-Party Tools',
    content: 'Karya Saarthi integrates with various third-party tools and services:',
    bullets: [
      'Google Services (Analytics, Fonts) — governed by Google\'s Privacy Policy',
      'Payment Gateways (Razorpay, Stripe) — governed by their respective terms',
      'Communication Tools (WhatsApp Business) — governed by WhatsApp\'s Terms of Service',
      'We are not responsible for outages, failures, or policy changes of any third-party service',
    ],
  },
  {
    id: 'accuracy',
    icon: '🔍',
    title: '5. Website Accuracy',
    bullets: [
      'While we strive to keep all website information accurate and up-to-date, we do not guarantee 100% accuracy',
      'Pricing, timelines, and service descriptions may change without prior notice',
      'Use of website information is at your own discretion and risk',
      'We reserve the right to modify, correct, or remove any content at any time',
    ],
  },
  {
    id: 'liability',
    icon: '⚖️',
    title: '6. Liability Limit',
    content: 'Our maximum liability in any situation is limited as follows:',
    bullets: [
      'Maximum liability: Refund of the exact amount paid for the service in question',
      'We are not liable for indirect, incidental, special, or punitive damages',
      'We are not liable for loss of academic opportunity, reputation, or business',
      'This limitation applies to the fullest extent permitted by applicable law',
    ],
  },
  {
    id: 'professional',
    icon: '🏥',
    title: '7. Professional Advice',
    content: 'Karya Saarthi provides writing, project, and academic support solutions only. We do NOT provide:',
    bullets: [
      'Legal advice — consult a qualified lawyer for legal matters',
      'Medical or health advice — consult a registered medical professional',
      'Financial advice — consult a certified financial advisor or CA',
      'Engineering or safety certification — consult a licensed professional engineer',
    ],
    note: 'Always consult qualified professionals for legal, medical, financial, or technical decisions that impact your well-being.',
  },
]

export default function DisclaimerPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72, backgroundColor: 'var(--color-canvas)', minHeight: '100vh' }}>

        {/* Hero */}
        <section style={{ backgroundColor: 'var(--color-surface-1)', borderBottom: '1px solid var(--color-hairline-soft)', padding: '60px 32px 64px', textAlign: 'center' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)', marginBottom: 20 }}>
              ⚠️ Disclaimer
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-2px', marginBottom: 14, lineHeight: 1.05 }}>
              Disclaimer
            </h1>
            <p style={{ fontSize: 14, color: 'var(--color-ink-muted)', lineHeight: 1.65, maxWidth: 520, margin: '0 auto' }}>
              Please read this disclaimer carefully before using Karya Saarthi services. By using our services, you acknowledge and accept these limitations.
            </p>
          </div>
        </section>

        {/* Important banner */}
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 32px 0' }}>
          <div style={{ padding: '18px 20px', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
            <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', lineHeight: 1.65 }}>
              <strong style={{ color: 'var(--color-ink)' }}>Important:</strong> Karya Saarthi provides educational project solutions only. We are not responsible for grades, academic decisions, or misuse of our work. Use our services responsibly.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 48, alignItems: 'start' }} className="legal-layout">

          {/* Sticky ToC */}
          <aside style={{ position: 'sticky', top: 88 }} className="legal-toc">
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-muted)', marginBottom: 14 }}>Contents</p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {sections.map(s => (
                <a key={s.id} href={`#${s.id}`} style={{ fontSize: 12, color: 'var(--color-ink-muted)', textDecoration: 'none', padding: '6px 10px', borderRadius: 'var(--radius-sm)', transition: 'color 0.15s, background-color 0.15s' }} className="legal-toc-link">
                  {s.title}
                </a>
              ))}
            </nav>
            <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(245,158,11,0.2)', backgroundColor: 'rgba(245,158,11,0.05)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', marginBottom: 6 }}>Questions?</p>
              <Link href="mailto:hr@karyasaarthi.com" style={{ fontSize: 11, color: '#f59e0b', textDecoration: 'none' }}>hr@karyasaarthi.com</Link>
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Link href="/terms" style={{ fontSize: 11, color: 'var(--color-accent-blue)', textDecoration: 'none' }}>← Terms & Conditions</Link>
              <Link href="/privacy" style={{ fontSize: 11, color: 'var(--color-accent-blue)', textDecoration: 'none' }}>← Privacy Policy</Link>
            </div>
          </aside>

          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} style={{ scrollMarginTop: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-0.5px' }}>{s.title}</h2>
                </div>
                {s.content && <p style={{ fontSize: 14, color: 'var(--color-ink-muted)', lineHeight: 1.75, marginBottom: 14 }}>{s.content}</p>}
                {s.bullets && (
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {s.bullets.map((b, bi) => (
                      <li key={bi} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--color-ink-muted)', lineHeight: 1.65 }}>
                        <span style={{ flexShrink: 0, marginTop: 5, width: 6, height: 6, borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
                {s.note && <p style={{ marginTop: 14, fontSize: 13, color: '#f59e0b', lineHeight: 1.65, padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', fontStyle: 'italic' }}>{s.note}</p>}
                {i < sections.length - 1 && <div style={{ height: 1, backgroundColor: 'var(--color-hairline-soft)', marginTop: 40 }} />}
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        .legal-layout { grid-template-columns: 220px 1fr; }
        .legal-toc-link:hover { color: var(--color-ink) !important; background-color: var(--color-surface-1) !important; }
        @media (max-width: 768px) { .legal-layout { grid-template-columns: 1fr !important; } .legal-toc { display: none; } }
      `}</style>
    </>
  )
}
