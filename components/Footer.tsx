import Link from 'next/link'
import Image from 'next/image'
import FooterNewsletter from './FooterNewsletter'

/* ── Data ──────────────────────────────────────────────────────── */
const FOOTER_LINKS = [
  {
    heading: 'Services',
    links: [
      { label: 'Thesis & Research',  href: '/services#academic'  },
      { label: 'Web Development',    href: '/services#web'       },
      { label: 'Digital Marketing',  href: '/services#marketing' },
      { label: 'SEO & Content',      href: '/services#seo'       },
      { label: 'AI & Automation',    href: '/services#ai'        },
      { label: 'All Services',       href: '/services'           },
    ],
  },
  {
    heading: 'Platforms',
    links: [
      { label: 'Campus Saarthi',      href: '/login?pillar=campus'     },
      { label: 'Digital Saarthi',     href: '/login?pillar=digital'    },
      { label: 'Calling Saarthi',     href: '/login?pillar=calling'    },
      { label: 'Government Saarthi',  href: '/login?pillar=government' },
      { label: 'Market Saarthi',      href: '/login?pillar=market'     },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us',  href: '/about'          },
      { label: 'Blogs',     href: '/blogs'           },
      { label: 'Events',    href: '/events'          },
      { label: 'Podcasts',  href: '/podcasts'        },
      { label: 'Contact',   href: '/contact'         },
      { label: 'Careers',   href: 'https://career.karyasaarthi.com'  },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Terms of Service',  href: '/terms'       },
      { label: 'Privacy Policy',    href: '/privacy'     },
      { label: 'Disclaimer',        href: '/disclaimer'  },
    ],
  },
]

const SOCIALS = [
  { label: 'Instagram',    href: 'https://www.instagram.com/karyasaarthi/',             icon: <InstagramIcon /> },
  { label: 'LinkedIn',     href: 'https://linkedin.com/in/karya-saarthi-693a01369',     icon: <LinkedInIcon />  },
  { label: 'YouTube',      href: 'https://www.youtube.com/@KaryaSaarthi',               icon: <YouTubeIcon />   },
  { label: 'X / Twitter',  href: 'https://x.com/karyasaarthi',                         icon: <XIcon />         },
  { label: 'Telegram',     href: 'https://t.me/karyasaarthi',                           icon: <TelegramIcon />  },
]

const BADGES = ['ISO 9001', 'MCA Registered', 'GST Verified', 'SSL Secured']

/* ── Component ─────────────────────────────────────────────────── */
export default function Footer() {
  return (
    <footer
      aria-label="Site footer"
      style={{
        backgroundColor: 'var(--color-surface-1)',
        borderTop: '1px solid var(--color-hairline-soft)',
      }}
    >
      {/* Top accent line */}
      <div style={{ height: 2, background: 'linear-gradient(90deg, var(--color-accent-blue) 0%, #6a4cf5 50%, #ff7a3d 100%)' }} />

      <div style={{ maxWidth: 1199, margin: '0 auto', padding: '60px 32px 0' }}>

        {/* ── Main grid ─────────────────────────────────────────── */}
        <div className="footer-main-grid">

          {/* Brand column */}
          <div style={{ gridColumn: 'span 2' }} className="footer-brand-col">
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 18 }}>
              <Image
                src="/images/karyasaarthi.png"
                alt="Karya Saarthi"
                width={28} height={28}
                style={{ borderRadius: 6 }}
              />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-0.5px' }}>
                Karya Saarthi
              </span>
            </Link>

            <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', lineHeight: 1.65, maxWidth: 240, marginBottom: 20 }}>
              Your digital growth partner — expert academic, technical &amp; business services for students and companies across India.
            </p>

            {/* Contact quick-links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {[
                { icon: '📞', text: '+91 8595025753', href: 'tel:+918595025753' },
                { icon: '✉️', text: 'support@karyasaarthi.com', href: 'mailto:support@karyasaarthi.com' },
              ].map(c => (
                <a key={c.href} href={c.href} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-ink-muted)', textDecoration: 'none' }}>
                  <span style={{ fontSize: 14 }}>{c.icon}</span> {c.text}
                </a>
              ))}
            </div>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SOCIALS.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: 'var(--color-surface-2)',
                    border: '1px solid var(--color-hairline)',
                    color: 'var(--color-ink-muted)',
                    textDecoration: 'none',
                    transition: 'border-color 0.15s, color 0.15s',
                  }}
                  className="footer-social-icon"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map(group => (
            <div key={group.heading}>
              <p style={{
                fontSize: 11, fontWeight: 700, color: 'var(--color-ink)',
                textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 16,
              }}>
                {group.heading}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
                {group.links.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="footer-link">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Newsletter strip ──────────────────────────────────── */}
        <div style={{
          marginTop: 52,
          padding: '22px 28px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface-2)',
          border: '1px solid var(--color-hairline)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 20, flexWrap: 'wrap',
        }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 4 }}>Stay updated</p>
            <p style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>Get latest service offers and platform updates.</p>
          </div>
          <FooterNewsletter />
        </div>

        {/* ── Bottom bar ────────────────────────────────────────── */}
        <div style={{
          borderTop: '1px solid var(--color-hairline-soft)',
          marginTop: 40, padding: '24px 0 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <p style={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>© {new Date().getFullYear()} Karya Saarthi (KARYASAARTHI PRIVATE LIMITED). All rights reserved.</p>
            <p style={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>CIN: U62099DL2025OPC444895 &nbsp;·&nbsp; GSTIN: 07ABMCK5849Q1ZK</p>
            <p style={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>Gali No 1, Block A, Uttarakhand Enclave, Nathupura, Burari, North Delhi — 110084</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {BADGES.map(b => (
              <span key={b} style={{
                fontSize: 10, fontWeight: 600, color: 'var(--color-ink-muted)',
                border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-pill)',
                padding: '3px 9px', letterSpacing: '0.04em', whiteSpace: 'nowrap',
              }}>
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .footer-main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
          gap: 40px;
        }
        .footer-link {
          font-size: 13px;
          color: var(--color-ink-muted);
          text-decoration: none;
          transition: color 0.15s;
          line-height: 1;
        }
        .footer-link:hover { color: var(--color-ink); }
        .footer-social-icon:hover {
          border-color: var(--color-accent-blue) !important;
          color: var(--color-accent-blue) !important;
        }
        @media (max-width: 1100px) {
          .footer-main-grid { grid-template-columns: 1fr 1fr 1fr; }
          .footer-brand-col { grid-column: span 1 !important; }
        }
        @media (max-width: 680px) {
          .footer-main-grid { grid-template-columns: 1fr 1fr; gap: 28px; }
        }
        @media (max-width: 400px) {
          .footer-main-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </footer>
  )
}

/* ── SVG Icons ─────────────────────────────────────────────────── */
function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  )
}
function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
    </svg>
  )
}
function YouTubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-2-1.94C18.88 4 12 4 12 4s-6.88 0-8.54.48a2.78 2.78 0 0 0-2 1.94A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.46 19.5C5.12 20 12 20 12 20s6.88 0 8.54-.48a2.78 2.78 0 0 0 2-1.94A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="black"/>
    </svg>
  )
}
function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}
function TelegramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  )
}

