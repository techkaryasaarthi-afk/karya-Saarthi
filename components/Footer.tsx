'use client'

import Link from 'next/link'

const footerLinks = [
  {
    title: 'Services',
    links: [
      { label: 'Programming & Tech', href: '/services' },
      { label: 'Graphics & Design', href: '/services' },
      { label: 'Digital Marketing', href: '/services' },
      { label: 'Writing & Translation', href: '/services' },
      { label: 'Video & Animation', href: '/services' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Our Team', href: '/about' },
      { label: 'Blog', href: '/blogs' },
      { label: 'Contact', href: '/contact' },
      { label: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Get Free Quote', href: '/contact' },
      { label: 'Track Project', href: '/dashboard' },
      { label: 'WhatsApp Support', href: 'https://wa.me/918595025753' },
      { label: 'Email Us', href: 'mailto:support@karyasaarthi.com' },
    ],
  },
]

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.75A4 4 0 0 0 3.75 7.75v8.5a4 4 0 0 0 4 4h8.5a4 4 0 0 0 4-4v-8.5a4 4 0 0 0-4-4h-8.5Zm8.88 1.31a1.06 1.06 0 1 1 0 2.12 1.06 1.06 0 0 1 0-2.12ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.75A3.25 3.25 0 1 0 12 15.25 3.25 3.25 0 0 0 12 8.75Z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M13.5 22v-8.09h2.72l.41-3.16H13.5V8.73c0-.92.25-1.54 1.56-1.54h1.66V4.36c-.29-.04-1.29-.12-2.45-.12-2.43 0-4.09 1.48-4.09 4.2v2.31H7.5v3.16h2.68V22h3.32Z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3A1.97 1.97 0 1 0 5.3 6.94 1.97 1.97 0 0 0 5.25 3ZM20 12.93c0-3.47-1.85-5.08-4.32-5.08a3.74 3.74 0 0 0-3.37 1.85V8.5H8.94c.04.8 0 11.5 0 11.5h3.37v-6.42c0-.34.02-.68.13-.92.27-.68.9-1.39 1.95-1.39 1.38 0 1.93 1.05 1.93 2.59V20H20v-7.07Z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M18.9 2H22l-6.77 7.74L23 22h-6.06l-4.74-6.98L6.1 22H3l7.24-8.27L1 2h6.21l4.28 6.38L18.9 2Zm-1.06 18.18h1.69L6.29 3.72H4.48l13.36 16.46Z" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M21.58 7.19a2.96 2.96 0 0 0-2.08-2.1C17.67 4.6 12 4.6 12 4.6s-5.67 0-7.5.5a2.96 2.96 0 0 0-2.08 2.1A31.2 31.2 0 0 0 2 12a31.2 31.2 0 0 0 .42 4.81 2.96 2.96 0 0 0 2.08 2.1c1.83.49 7.5.49 7.5.49s5.67 0 7.5-.5a2.96 2.96 0 0 0 2.08-2.1A31.2 31.2 0 0 0 22 12a31.2 31.2 0 0 0-.42-4.81ZM9.75 15.02V8.98L15.5 12l-5.75 3.02Z" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M12 2a9.9 9.9 0 0 0-8.53 14.93L2 22l5.2-1.36A10 10 0 1 0 12 2Zm0 18.14a8.08 8.08 0 0 1-4.12-1.13l-.3-.18-3.09.81.83-3-.2-.31A8.14 8.14 0 1 1 12 20.14Zm4.47-6.03c-.24-.12-1.4-.69-1.62-.76-.22-.08-.38-.12-.54.12s-.62.76-.76.92c-.14.16-.29.18-.53.06a6.56 6.56 0 0 1-1.94-1.2 7.28 7.28 0 0 1-1.35-1.68c-.14-.24-.01-.37.11-.49.11-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.79-.2-.47-.39-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.68 2.56 4.08 3.6.57.25 1.02.4 1.37.51.58.18 1.1.15 1.52.09.46-.07 1.4-.57 1.6-1.12.2-.56.2-1.03.14-1.12-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  )
}

const socialLinks = [
  { icon: InstagramIcon, label: 'Instagram', href: 'https://www.instagram.com/karyasaarthi/', hoverBg: 'hover:bg-gradient-to-br hover:from-pink-500/20 hover:to-orange-500/20' },
  { icon: FacebookIcon, label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61576877739779', hoverBg: 'hover:bg-blue-600/20' },
  { icon: LinkedInIcon, label: 'LinkedIn', href: 'https://linkedin.com/in/karya-saarthi-693a01369', hoverBg: 'hover:bg-blue-500/20' },
  { icon: XIcon, label: 'X (Twitter)', href: 'https://x.com/karyasaarthi', hoverBg: 'hover:bg-slate-300/20' },
  { icon: YouTubeIcon, label: 'YouTube', href: 'https://www.youtube.com/@KaryaSaarthi', hoverBg: 'hover:bg-red-500/20' },
  { icon: WhatsAppIcon, label: 'WhatsApp', href: 'https://whatsapp.com/channel/0029Vb66k5vADTO79QKvGx0L', hoverBg: 'hover:bg-green-500/20' },
]

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-1 text-xl font-bold font-heading">
              <span>Karya</span>{' '}
              <span className="text-accent">Saarthi</span>
            </h3>
            <p className="mb-4 text-[11px] font-semibold text-white/40 uppercase tracking-wider">
              A Brand of Karyanex Private Limited
            </p>
            <p className="mb-4 text-sm leading-relaxed text-white/60">
              Your trusted work companion. We guide, teach, and empower you to succeed in academics and business.
            </p>
            <p className="mb-4 text-xs text-white/40">
              &ldquo;Hum Hai Aapke Saathi&rdquo;
            </p>
            <a
              href="https://www.karyasaarthi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent-light"
            >
              www.karyasaarthi.com
            </a>
          </div>

          {footerLinks.map(col => (
            <div key={col.title}>
              <h4 className="mb-4 font-bold text-white font-heading">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-accent"
                      {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">📍</span>
              <div>
                <h5 className="text-sm font-semibold">Address</h5>
                <p className="text-sm text-white/50">Gali No 1, Block A, Uttarakhand Enclave, Nathupura, Burari, North Delhi, Delhi 110084</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">📞</span>
              <div>
                <h5 className="text-sm font-semibold">Phone</h5>
                <p className="text-sm text-white/50">+91 8595025753 / +91 6238521530</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">✉️</span>
              <div>
                <h5 className="text-sm font-semibold">Email</h5>
                <p className="text-sm text-white/50">support@karyasaarthi.com</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h5 className="mb-4 text-center text-sm font-bold text-white/60 sm:text-left">Connect With Us</h5>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {socialLinks.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-lg transition-all duration-200 ${s.hoverBg} hover:scale-110`}
                  aria-label={s.label}
                  title={s.label}
                >
                  <s.icon />
                  <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-white px-2 py-1 text-[10px] font-bold text-navy opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    {s.label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Corporate Legal Info */}
        <div className="mt-8 border-t border-white/10 pt-8 text-xs text-white/50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2 space-y-3">
              <p className="leading-relaxed">
                Karya Saarthi is the trade name operated by <strong className="text-white/80">Karyanex Private Limited</strong>, a company incorporated under the Companies Act, 2013. All transactions, contracts, and legal obligations are governed under the name Karyanex Private Limited.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2.5 py-1 text-[10px] font-bold text-white/70 border border-white/10">
                  🛡️ MCA Registered
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2.5 py-1 text-[10px] font-bold text-white/70 border border-white/10">
                  💼 GST Compliant
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 md:text-right">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/30 font-bold">CIN</p>
                <p className="font-mono text-white/70 mt-0.5 text-xs">U85500BR2026PTC085054</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/30 font-bold">GST number</p>
                <p className="font-mono text-white/70 mt-0.5 text-xs">10AAMCK8870B1ZN</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center md:flex md:items-center md:justify-between text-xs text-white/30">
          <p>
            © 2026 Karyanex Private Limited. All rights reserved.
          </p>
          <p className="mt-2 md:mt-0">
            Open 24/7 (Closed only on major festivals)
          </p>
        </div>
      </div>
    </footer>
  )
}
