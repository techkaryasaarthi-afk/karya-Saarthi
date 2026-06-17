'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'


const SERVICES = ['Programming & Tech','Graphics & Design','Digital Marketing','Writing & Translation','Video & Animation','AI Services','Music & Audio','Business','Consulting','Other']

const CONTACT_ITEMS = [
  { icon: '📍', label: 'Address',  value: 'Gali No 1, Block A, Uttarakhand Enclave, Nathupura, Burari, North Delhi — 110084' },
  { icon: '📱', label: 'Phone',    value: '+91 8595025753 / +91 6238521530' },
  { icon: '✉️', label: 'Email',    value: 'support@karyasaarthi.com' },
  { icon: '🕐', label: 'Hours',    value: 'Open 24/7 (Closed only on major festivals)' },
]

const inp: React.CSSProperties = {
  display: 'block', width: '100%', boxSizing: 'border-box',
  padding: '12px 14px', borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-hairline)', backgroundColor: 'var(--color-surface-2)',
  color: 'var(--color-ink)', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none',
}

export default function ContactPage() {
  const [form,   setForm]   = useState({ name: '', email: '', phone: '', service: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [msg,    setMsg]    = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setStatus('loading')
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) {
        setStatus('success'); setMsg("Thank you! We'll get back to you within 2 hours. 🎉")
        setForm({ name: '', email: '', phone: '', service: '', message: '' })
      } else {
        const d = await res.json(); setStatus('error'); setMsg(d.error || 'Something went wrong.')
      }
    } catch { setStatus('error'); setMsg('Network error. Please try again.') }
  }

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 80, paddingBottom: 80, backgroundColor: 'var(--color-canvas)', minHeight: '100vh' }}>

        {/* Page hero */}
        <div style={{ backgroundColor: 'var(--color-surface-1)', borderBottom: '1px solid var(--color-hairline-soft)', padding: '48px var(--space-xl) 52px' }}>
          <div style={{ maxWidth: 1199, margin: '0 auto' }}>
            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(0,153,255,0.1)', color: 'var(--color-accent-blue)', border: '1px solid rgba(0,153,255,0.2)', marginBottom: 16 }}>Contact Us</span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-2px', marginBottom: 12 }}>Get In Touch</h1>
            <p style={{ fontSize: 'var(--text-body-size)', color: 'var(--color-ink-muted)', maxWidth: 480 }}>Have a project in mind? Let&apos;s talk. We typically respond within 2 hours.</p>
          </div>
        </div>

        <div style={{ maxWidth: 1199, margin: '0 auto', padding: '48px var(--space-xl) 0' }}>
          <div className="contact-grid">

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--color-surface-1)', border: '1px solid var(--color-hairline-soft)', borderRadius: 'var(--radius-xl)', padding: 32 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 24, letterSpacing: '-0.5px' }}>Send Us a Message</h2>

              <div className="form-row" style={{ marginBottom: 14 }}>
                <input type="text"  placeholder="Your Name *"      required  value={form.name}    onChange={e => setForm(p => ({ ...p, name:    e.target.value }))} style={inp} />
                <input type="email" placeholder="Email Address *"  required  value={form.email}   onChange={e => setForm(p => ({ ...p, email:   e.target.value }))} style={inp} />
              </div>
              <input type="tel" placeholder="Phone Number" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} style={{ ...inp, marginBottom: 14 }} />
              <select value={form.service} onChange={e => setForm(p => ({ ...p, service: e.target.value }))} style={{ ...inp, marginBottom: 14, cursor: 'pointer' }}>
                <option value="">Select Service Category</option>
                {SERVICES.map(s => <option key={s}>{s}</option>)}
              </select>
              <textarea rows={5} placeholder="Tell us about your project..." required value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} style={{ ...inp, marginBottom: 14, resize: 'none' }} />

              {status === 'success' && (
                <div style={{ marginBottom: 14, padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e', fontSize: 13 }}>✅ {msg}</div>
              )}
              {status === 'error' && (
                <div style={{ marginBottom: 14, padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 13 }}>❌ {msg}</div>
              )}

              <button type="submit" disabled={status === 'loading' || status === 'success'} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, opacity: (status === 'loading' || status === 'success') ? 0.6 : 1, cursor: 'pointer' }}>
                {status === 'loading' ? '⏳ Sending…' : status === 'success' ? '✅ Sent!' : 'Get Free Quote →'}
              </button>
            </form>

            {/* ── Info panel ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Contact details */}
              <div style={{ backgroundColor: 'var(--color-surface-1)', border: '1px solid var(--color-hairline-soft)', borderRadius: 'var(--radius-xl)', padding: 28 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 20, letterSpacing: '-0.5px' }}>Contact Information</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {CONTACT_ITEMS.map(c => (
                    <div key={c.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <span style={{ fontSize: 20, lineHeight: 1.2, flexShrink: 0 }}>{c.icon}</span>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-ink-muted)', marginBottom: 2 }}>{c.label}</p>
                        <p style={{ fontSize: 13, color: 'var(--color-ink)', lineHeight: 1.5 }}>{c.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* WhatsApp CTA */}
              <div style={{ borderRadius: 'var(--radius-xl)', padding: 28, textAlign: 'center', background: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(0,153,255,0.08) 100%)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>💬</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>Quick Response on WhatsApp</h3>
                <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginBottom: 16 }}>Get an instant response — just send us a message!</p>
                <a href="https://wa.me/918595025753" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 'var(--radius-pill)', backgroundColor: '#22c55e', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  💬 WhatsApp Us Now
                </a>
              </div>

              {/* Map */}
              <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--color-hairline-soft)' }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3498.2!2d77.19!3d28.75!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDQ1JzAwLjAiTiA3N8KwMTEnMjQuMCJF!5e0!3m2!1sen!2sin!4v1"
                  width="100%" height="220" style={{ border: 0, display: 'block' }}
                  allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  title="Karya Saarthi Location"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />


      <style>{`
        .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .form-row     { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 900px) { .contact-grid { grid-template-columns: 1fr; } }
        @media (max-width: 480px) { .form-row     { grid-template-columns: 1fr; } }
      `}</style>
    </>
  )
}
