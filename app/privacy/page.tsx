import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Karya Saarthi',
  description: 'Learn how Karya Saarthi collects, uses, and protects your personal data. GDPR compliant. SSL secured.',
}

const sections = [
  {
    id: 'collect',
    icon: '📥',
    title: '1. Information We Collect',
    groups: [
      { label: 'Personal Information', items: ['Name, email address, phone number, mailing address'] },
      { label: 'Academic Details', items: ['College/university name, course, subject, topic, submission deadline'] },
      { label: 'Payment Information', items: ['Credit/debit card details and bank information — processed securely via PCI-DSS compliant gateways'] },
      { label: 'Usage Data', items: ['Pages visited, time on site, click behavior — collected via Google Analytics'] },
    ],
  },
  {
    id: 'usage',
    icon: '🔧',
    title: '2. How We Use Your Information',
    bullets: [
      'Service delivery — to contact you, manage assignments, and track project progress',
      'Communication — updates, support responses, and opt-in marketing messages',
      'Analytics — to improve website performance and understand user behavior',
      'Legal compliance — GST filing, tax records, and regulatory requirements',
    ],
  },
  {
    id: 'security',
    icon: '🛡️',
    title: '3. Data Security',
    bullets: [
      'All pages are served over HTTPS with SSL/TLS encryption',
      'Payment data is processed via PCI DSS-compliant payment gateways — we never store card details',
      'Passwords are hashed using bcrypt and are never stored in plain text',
      'Data access is restricted to authorized personnel only, under NDA',
    ],
  },
  {
    id: 'cookies',
    icon: '🍪',
    title: '4. Cookies',
    content: 'We use cookies to enhance your experience on our website.',
    bullets: [
      'Session cookies — for login state and user preferences',
      'Analytics cookies — Google Analytics to understand site traffic',
      'Third-party cookies — Facebook Pixel for retargeting ads',
      'You can disable cookies in your browser settings; some features may not work as intended',
    ],
  },
  {
    id: 'sharing',
    icon: '🔗',
    title: '5. Third-Party Sharing',
    content: 'We do NOT sell your data. We share information only when necessary:',
    bullets: [
      'Payment gateways (Razorpay, Stripe) — to process transactions securely',
      'Email service providers — to send order updates and support emails',
      'These partners have their own independent privacy policies',
    ],
    note: 'We will never sell, rent, or trade your personal data to any third party for marketing purposes.',
  },
  {
    id: 'rights',
    icon: '✅',
    title: '6. Your Rights',
    bullets: [
      'Right to access — request a copy of all personal data we hold about you',
      'Right to deletion — we will delete your data within 30 days of a valid request',
      'Right to opt-out — unsubscribe from marketing emails at any time via the unsubscribe link',
      'Right to correction — request correction of inaccurate or incomplete data',
      'GDPR compliant — we honor all rights under the General Data Protection Regulation',
    ],
  },
  {
    id: 'contact',
    icon: '📬',
    title: '7. Contact Us',
    content: 'For any privacy-related questions, requests, or concerns:',
    bullets: [
      'Email: privacy@karyasaarthi.com',
      'Response time: Within 7 business days',
      'Physical address: Delhi, India',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72, backgroundColor: 'var(--color-canvas)', minHeight: '100vh' }}>

        {/* Hero */}
        <section style={{ backgroundColor: 'var(--color-surface-1)', borderBottom: '1px solid var(--color-hairline-soft)', padding: '60px 32px 64px', textAlign: 'center' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)', marginBottom: 20 }}>
              Legal
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-2px', marginBottom: 14, lineHeight: 1.05 }}>
              Privacy Policy
            </h1>
            <p style={{ fontSize: 14, color: 'var(--color-ink-muted)', lineHeight: 1.65 }}>
              Last updated: June 2025 · We take your privacy seriously. This policy is GDPR compliant.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 20, marginTop: 24, padding: '10px 20px', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-hairline-soft)' }}>
              {['🔒 SSL Secured', '🛡️ GDPR Compliant', '💳 PCI DSS'].map(b => (
                <span key={b} style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-muted)' }}>{b}</span>
              ))}
            </div>
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
            <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(34,197,94,0.2)', backgroundColor: 'rgba(34,197,94,0.06)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', marginBottom: 8 }}>Privacy questions?</p>
              <Link href="mailto:privacy@karyasaarthi.com" style={{ fontSize: 11, color: '#22c55e', textDecoration: 'none' }}>privacy@karyasaarthi.com</Link>
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
                {'groups' in s && s.groups && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {s.groups.map((g) => (
                      <div key={g.label} style={{ padding: '14px 18px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-1)', border: '1px solid var(--color-hairline-soft)' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink)', marginBottom: 8 }}>{g.label}</p>
                        {g.items.map((item, ii) => (
                          <p key={ii} style={{ fontSize: 13, color: 'var(--color-ink-muted)', lineHeight: 1.65 }}>{item}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
                {s.bullets && (
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {s.bullets.map((b, bi) => (
                      <li key={bi} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--color-ink-muted)', lineHeight: 1.65 }}>
                        <span style={{ flexShrink: 0, marginTop: 5, width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
                {s.note && <p style={{ marginTop: 14, fontSize: 13, color: 'var(--color-ink-muted)', lineHeight: 1.65, padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', fontStyle: 'italic' }}>{s.note}</p>}
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
