'use client'

import { useState, useRef } from 'react'

// JSON-LD FAQ structured data — preserved from original
const faqs = [
  {
    q: 'What exactly is Karya Saarthi?',
    a: 'Karya Saarthi is India\'s first project solutions company that combines quality project delivery with genuine education. Unlike traditional services that just "write and hand over," we work WITH you. We complete your thesis, website, or assignment AND teach you how it was done. So when you present in class or show clients your work, you can explain everything confidently. We serve students, researchers, businesses, and professionals needing quality project help.',
  },
  {
    q: 'How is Karya Saarthi different from other services?',
    a: 'Great question! Here\'s the difference: Traditional services = Write project, hand it over, goodbye. Karya Saarthi = Write project + 6-8 teaching sessions + free revisions + lifetime support. Your professor will ask questions in viva or your client will ask how the project was built. With us, you UNDERSTAND everything. Plus, we guarantee 100% original work (plagiarism report provided). And we\'re transparent — no hidden costs, fair pricing, and we actually care about your success.',
  },
  {
    q: 'How long does it take to complete a thesis?',
    a: 'For Master\'s thesis (80-100 pages): 4-5 days. For PhD thesis (150-200 pages): 2-3 weeks. For research papers: 2-3 days. For assignments: 1-2 days. Why so fast? Our expert team works dedicated to your project. But remember — speed doesn\'t mean less quality. We maintain highest standards of research and writing. Plus, timeline can be extended if you prefer more teaching sessions or revisions.',
  },
  {
    q: 'Is the work really plagiarism-free?',
    a: '100% YES! We do original research and writing. No copy-paste from internet. We use proper research methodology and write from scratch. As proof, we provide you Turnitin plagiarism report showing plagiarism score (target: <5%). You can verify authenticity yourself. This is why students trust us. And if somehow plagiarism is found, we offer unlimited free revisions until it\'s completely original.',
  },
  {
    q: 'How much does it cost?',
    a: 'Transparent pricing! No hidden charges. Examples: Thesis (Master\'s): ₹15,000-25,000 depending on complexity. Research Paper (20 pages): ₹5,000-8,000. Website (5 pages): ₹10,000-30,000. Assignment: ₹500-3,000. Price includes: Complete project work + Teaching sessions + Plagiarism report + Free revisions + Support. For exact quote, message us your requirements. We respond within 1 hour.',
  },
  {
    q: 'What if I don\'t understand the teaching?',
    a: 'Then we teach again! And again! Until you understand. That\'s our promise. We don\'t believe in "I\'ve explained once, your responsibility to understand." Every student learns differently — some need diagrams, some need examples, some need step-by-step videos. We adapt to YOUR learning style. Plus, after project completion, you can always reach out with doubts. We\'re here for lifetime support.',
  },
  {
    q: 'Can I see your previous work/samples?',
    a: 'Yes! We have portfolio available on website. You can see sample theses, websites we\'ve built, research papers completed. But remember — we maintain client confidentiality. We won\'t share client names or original projects without permission. However, we have "anonymized" samples (name removed, but content visible) to show quality. Ask our team to share samples via WhatsApp or email.',
  },
  {
    q: 'What if my professor suspects I didn\'t write it?',
    a: 'Smart question! Here\'s why they won\'t suspect: (1) You\'ll understand EVERYTHING because of teaching sessions. (2) You can explain every concept, every data point, every decision made. (3) In viva, you\'ll answer confidently and correctly. (4) Your writing style isn\'t "obviously different" from your usual work. Professors suspect when students can\'t explain their own work. Since you CAN explain everything with us — no suspicion!',
  },
  {
    q: 'Do you offer revision if I\'m not happy?',
    a: 'Unlimited free revisions! Not satisfied with the work? We revise. Professor asked for changes? We do it free. Want a different angle or approach? We rewrite. This continues until you\'re 100% happy. That\'s our confidence in quality. We get paid when YOU\'RE satisfied. Not before. This policy shows we genuinely care about your success, not just collecting money.',
  },
  {
    q: 'How do I start? What\'s the process?',
    a: 'Super simple! Step 1: Message us (WhatsApp +91 7991124091 or email info@karyasaarthi.com) with your requirements — topic, deadline, pages, any special requests. Step 2: We send you free quote within 1 hour. Step 3: You pay (multiple payment options available). Step 4: We start immediately — daily updates in WhatsApp group. Step 5: Receive project 2-3 days before deadline (so you can review). Step 6: Teaching sessions begin. Step 7: Submit with confidence! Total time: 4-5 days.',
  },
]

function FAQItem({ faq, index }: { faq: typeof faqs[0]; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className={`faq-row${open ? ' open' : ''}`}
      style={{ marginBottom: 'var(--space-xs)' }}
    >
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '22px 24px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: 16,
        }}
        aria-expanded={open}
        id={`faq-q-${index}`}
        aria-controls={`faq-a-${index}`}
      >
        <span className="text-body" style={{ color: 'var(--color-ink)', fontWeight: open ? 600 : 400 }}>
          {faq.q}
        </span>
        <span
          style={{
            flexShrink: 0,
            width: 24,
            height: 24,
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-surface-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform var(--dur-normal) var(--ease-out)',
            transform: open ? 'rotate(45deg)' : 'none',
          }}
          aria-hidden="true"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <line x1="5" y1="1" x2="5" y2="9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="1" y1="5" x2="9" y2="5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </span>
      </button>

      {/* Accordion body — CSS grid-template-rows (Animation #4) */}
      <div
        className={`accordion-body${open ? ' open' : ''}`}
        id={`faq-a-${index}`}
        role="region"
        aria-labelledby={`faq-q-${index}`}
      >
        <div className="accordion-inner">
          <p
            className="text-body"
            style={{
              color: 'var(--color-ink-muted)',
              padding: '0 24px 22px',
              lineHeight: 1.7,
            }}
          >
            {faq.a}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function FAQSection() {
  return (
    <section
      id="faq"
      style={{
        backgroundColor: 'var(--color-canvas)',
        paddingTop: 'var(--space-section)',
        paddingBottom: 'var(--space-section)',
        paddingLeft: 'var(--space-xl)',
        paddingRight: 'var(--space-xl)',
        borderTop: '1px solid var(--color-hairline-soft)',
      }}
      aria-label="Frequently asked questions"
      className="faq-section"
    >
      {/* JSON-LD FAQ structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map(f => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />

      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{
            display: 'inline-block',
            backgroundColor: 'var(--color-surface-1)',
            color: 'var(--color-ink-muted)',
            fontSize: 'var(--text-caption-size)',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '4px 12px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--color-hairline)',
            marginBottom: 20,
          }}>
            FAQ
          </span>
          <h2 className="text-display-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>
            Frequently asked questions
          </h2>
        </div>

        {/* FAQ rows */}
        {faqs.map((faq, i) => (
          <FAQItem key={i} faq={faq} index={i} />
        ))}

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <p className="text-body" style={{ color: 'var(--color-ink-muted)', marginBottom: 20 }}>
            Still have questions?
          </p>
          <a href="/contact" className="btn-primary">
            Contact us
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .faq-section {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
          .faq-section > div { padding-left: 0 !important; padding-right: 0 !important; }
          .faq-section h2 { font-size: clamp(22px, 7vw, 36px) !important; }
        }
      `}</style>
    </section>
  )
}
