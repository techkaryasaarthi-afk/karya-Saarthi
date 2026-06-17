'use client'

import { useReveal } from '@/hooks/useReveal'

const steps = [
  {
    number: '01',
    title: 'Submit Your Requirement',
    desc: 'Fill out our simple form with your project details, deadline, and budget. Takes less than 2 minutes.',
    icon: '📋',
  },
  {
    number: '02',
    title: 'Get Matched to an Expert',
    desc: 'We assign a vetted specialist with proven experience in your exact service category.',
    icon: '🎯',
  },
  {
    number: '03',
    title: 'Track Progress Live',
    desc: 'Monitor real-time progress in your dashboard, communicate directly, and approve milestones.',
    icon: '📊',
  },
  {
    number: '04',
    title: 'Receive & Review',
    desc: 'Get your deliverable, request revisions if needed, and rate your experience.',
    icon: '✅',
  },
]

export default function HowItWorks() {
  const ref = useReveal()
  return (
    <section
      id="how-it-works"
      ref={ref as React.RefObject<HTMLElement>}
      className="hiw-section"
      style={{
        backgroundColor: 'var(--color-canvas)',
        paddingTop: 'var(--space-section)',
        paddingBottom: 'var(--space-section)',
        paddingLeft: 'var(--space-xl)',
        paddingRight: 'var(--space-xl)',
        borderTop: '1px solid var(--color-hairline-soft)',
      }}
      aria-label="How it works"
    >
      <div style={{ maxWidth: 1199, margin: '0 auto' }}>
        {/* Header */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 72 }}>
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
            How It Works
          </span>
          <h2 className="text-display-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>
            From request to delivery
          </h2>
        </div>

        {/* Steps */}
        <div className="hiw-grid">
          {steps.map((step, i) => (
            <div key={step.number} className="reveal hiw-step" style={{ transitionDelay: `${i * 80}ms` }}>
              {/* Connector line (hidden on last) */}
              {i < steps.length - 1 && (
                <div
                  className="hiw-connector"
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: 20,
                    left: 'calc(50% + 20px)',
                    right: 'calc(-50% + 20px)',
                    height: '1px',
                    backgroundColor: 'var(--color-hairline)',
                  }}
                />
              )}

              {/* Step icon circle */}
              <div className="btn-icon" style={{ width: 40, height: 40, flexShrink: 0, fontSize: 18, marginBottom: 24, cursor: 'default' }} aria-hidden="true">
                {step.icon}
              </div>

              {/* Step number */}
              <p className="text-display-md" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-hairline)', marginBottom: 12, lineHeight: 1 }}>
                {step.number}
              </p>

              {/* Title */}
              <h3 className="text-headline" style={{ color: 'var(--color-ink)', marginBottom: 12 }}>
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-body" style={{ color: 'var(--color-ink-muted)', lineHeight: 1.6 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .hiw-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-xl);
          position: relative;
        }
        .hiw-step {
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .hiw-connector {
          display: block;
        }
        @media (max-width: 810px) {
          .hiw-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .hiw-connector {
            display: none;
          }
        }
        @media (max-width: 480px) {
          .hiw-grid {
            grid-template-columns: 1fr;
          }
          .hiw-section {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
        }
      `}</style>
    </section>
  )
}
