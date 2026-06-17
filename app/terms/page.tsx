import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Karya Saarthi',
  description: 'Read Karya Saarthi terms and conditions. Service agreement, payment, refund policy, copyright.',
}

const sections = [
  {
    id: 'acceptance',
    icon: '📋',
    title: '1. Acceptance of Terms',
    content: `By using the Karya Saarthi website and its services, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please refrain from using our services. These terms apply to all users including students, businesses, and visitors.`,
  },
  {
    id: 'services',
    icon: '🛍️',
    title: '2. Service Description',
    content: `Karya Saarthi provides the following services:`,
    bullets: [
      'Academic Writing — thesis, research papers, assignments, dissertations',
      'Technical Solutions — web development, mobile apps, software solutions',
      'Study Abroad Consulting — university selection, SOP, application support',
      'Digital Marketing — SEO, social media, content marketing, paid ads',
    ],
    note: 'All services are provided "AS-IS." We guarantee plagiarism-free content but make no guarantees regarding grades, marks, or academic outcomes.',
  },
  {
    id: 'payment',
    icon: '💳',
    title: '3. Payment Terms',
    bullets: [
      'Payment is required before project commencement, or milestone-based for large projects',
      'Accepted methods: Credit/Debit Card, UPI, Bank Transfer, Digital Wallets',
      'Payment is non-refundable once 50% or more of the work has been completed',
      'Custom quotes are valid for 7 days from the date of issue',
      'All prices are in Indian Rupees (INR) and inclusive of applicable taxes',
    ],
  },
  {
    id: 'delivery',
    icon: '🚚',
    title: '4. Delivery & Revisions',
    bullets: [
      'Standard timeline: 4–5 business days for thesis, 2–3 days for research papers',
      'Unlimited free revisions until you are fully satisfied with the deliverable',
      'Delivery is made 2–3 days before your deadline so you have time to review',
      'Extensions beyond the agreed timeline may incur an additional fee',
      'Urgent delivery within 24 hours is available at a premium',
    ],
  },
  {
    id: 'ip',
    icon: '©️',
    title: '5. Intellectual Property',
    bullets: [
      'You own the final work delivered upon full payment',
      'Karya Saarthi retains the right to use anonymized, non-identifiable samples for portfolio and marketing purposes',
      'You may not resell our services or content for commercial gain without written permission',
      'Our website content, brand, and materials are protected under copyright law',
    ],
  },
  {
    id: 'confidentiality',
    icon: '🔒',
    title: '6. Confidentiality',
    content: 'We treat all client information as strictly confidential.',
    bullets: [
      'Your personal and academic details will not be shared with any third party',
      'Our team members are bound by Non-Disclosure Agreements (NDAs)',
      'Exception: We may disclose information if required by applicable law or court order',
    ],
  },
  {
    id: 'liability',
    icon: '⚖️',
    title: '7. Limitation of Liability',
    bullets: [
      'Karya Saarthi is not liable for academic grades or marks — these depend on professor evaluation',
      'We are not responsible for external factors such as internet outages, system failures, or force majeure events',
      'Our maximum liability is limited to a full refund of the amount paid for the service in question',
      'We are not liable for any indirect, consequential, or punitive damages',
    ],
  },
  {
    id: 'cancellation',
    icon: '🚫',
    title: '8. Cancellation & Refund',
    bullets: [
      'Cancellation within 24 hours of order: Full refund',
      'Cancellation after 24 hours but before 50% completion: 50% refund',
      'Cancellation after 50% work completed: No refund',
      'Refunds are processed within 5–7 business days to the original payment method',
    ],
  },
  {
    id: 'disputes',
    icon: '🤝',
    title: '9. Contact for Disputes',
    content: 'We aim to resolve all disputes amicably and promptly.',
    bullets: [
      'For any disputes, contact us at: hr@karyasaarthi.com',
      'We commit to responding within 7 business days',
      'If unresolved, the matter will be escalated to our legal team',
      'Jurisdiction: Courts in Delhi, India shall have exclusive jurisdiction',
    ],
  },
]

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72, backgroundColor: 'var(--color-canvas)', minHeight: '100vh' }}>

        {/* Hero */}
        <section style={{ backgroundColor: 'var(--color-surface-1)', borderBottom: '1px solid var(--color-hairline-soft)', padding: '60px 32px 64px', textAlign: 'center' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(0,153,255,0.1)', color: 'var(--color-accent-blue)', border: '1px solid rgba(0,153,255,0.2)', marginBottom: 20 }}>
              Legal
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-2px', marginBottom: 14, lineHeight: 1.05 }}>
              Terms & Conditions
            </h1>
            <p style={{ fontSize: 14, color: 'var(--color-ink-muted)', lineHeight: 1.65 }}>
              Last updated: June 2025 · Effective for all users of karyasaarthi.com
            </p>
          </div>
        </section>

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 32px 80px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 48, alignItems: 'start' }} className="legal-layout">

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
            <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(0,153,255,0.2)', backgroundColor: 'rgba(0,153,255,0.06)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent-blue)', marginBottom: 8 }}>Have a question?</p>
              <Link href="mailto:hr@karyasaarthi.com" style={{ fontSize: 11, color: 'var(--color-accent-blue)', textDecoration: 'none' }}>hr@karyasaarthi.com</Link>
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
                {s.content && <p style={{ fontSize: 14, color: 'var(--color-ink-muted)', lineHeight: 1.75, marginBottom: s.bullets ? 14 : 0 }}>{s.content}</p>}
                {s.bullets && (
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {s.bullets.map((b, bi) => (
                      <li key={bi} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--color-ink-muted)', lineHeight: 1.65 }}>
                        <span style={{ flexShrink: 0, marginTop: 5, width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-accent-blue)', display: 'inline-block' }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
                {s.note && <p style={{ marginTop: 14, fontSize: 13, color: 'var(--color-ink-muted)', lineHeight: 1.65, padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(0,153,255,0.06)', border: '1px solid rgba(0,153,255,0.15)', fontStyle: 'italic' }}>{s.note}</p>}
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
