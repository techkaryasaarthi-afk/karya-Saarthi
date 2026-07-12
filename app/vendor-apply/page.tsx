'use client'

import React, { useState, useCallback, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface WorkSample {
  url: string
  title: string
  description: string
}

const STEPS = [
  { num: 1, label: 'Basic Info' },
  { num: 2, label: 'Work Samples' },
  { num: 3, label: 'Questions' },
]

function VendorApplyContent() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<number | 'success'>(1)
  const [applicationId, setApplicationId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Step 1 state
  const [fullname, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [education, setEducation] = useState('')
  const [experience, setExperience] = useState('')
  const [skills, setSkills] = useState('')
  const [companies, setCompanies] = useState('')
  const [certifications, setCertifications] = useState('')
  const [resumeLink, setResumeLink] = useState('')

  // Step 2 state
  const [samples, setSamples] = useState<WorkSample[]>([
    { url: '', title: '', description: '' },
    { url: '', title: '', description: '' },
    { url: '', title: '', description: '' },
  ])

  // Step 3 state
  const [q1, setQ1] = useState('')
  const [q2, setQ2] = useState('')
  const [q3, setQ3] = useState('')
  const [q4, setQ4] = useState('')
  const [q5, setQ5] = useState('')

  const updateSample = (index: number, field: keyof WorkSample, value: string) => {
    setSamples(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const addSample = () => {
    if (samples.length < 5) {
      setSamples(prev => [...prev, { url: '', title: '', description: '' }])
    }
  }

  const removeSample = (index: number) => {
    if (samples.length > 3) {
      setSamples(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleStep1 = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullname.trim()) { setError('Full name is required'); return }
    if (!email.trim() || !email.includes('@')) { setError('Valid email is required'); return }
    if (!phone.trim() || phone.length < 10) { setError('Valid 10-digit phone number is required'); return }
    if (!resumeLink.trim()) { setError('Please provide a link to your resume or CV'); return }

    setLoading(true)
    setError('')
    setSuccessMsg('')
    try {
      const res = await fetch('/api/vendor/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 1,
          data: {
            fullname: fullname.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            education: education.trim() || null,
            experience_years: parseInt(experience) || 0,
            skills: skills.split(',').map(s => s.trim()).filter(Boolean),
            previous_companies: companies.trim() || null,
            certifications: certifications.trim() || null,
            resume_link: resumeLink.trim(),
          },
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        setError(result.error || 'Failed to save Step 1')
        setLoading(false)
        return
      }
      setApplicationId(result.application?.id || Math.floor(Math.random() * 800000 + 100000))
      setCurrentStep(2)
      setSuccessMsg('Step 1 saved! Now add your work samples.')
    } catch {
      setError('Something went wrong while communicating with the server.')
    } finally {
      setLoading(false)
    }
  }, [fullname, email, phone, education, experience, skills, companies, certifications, resumeLink])

  const handleStep2 = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const validSamples = samples.filter(s => s.url.trim())
    if (validSamples.length < 3) {
      setError('Minimum 3 work sample links are required.')
      return
    }
    for (const s of validSamples) {
      if (!s.title.trim()) {
        setError('Each work sample with a link must also have a title.')
        return
      }
    }

    setLoading(true)
    setError('')
    setSuccessMsg('')
    try {
      const res = await fetch('/api/vendor/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 2,
          application_id: applicationId,
          data: { work_samples: validSamples },
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        setError(result.error || 'Failed to save Step 2')
        setLoading(false)
        return
      }
      setCurrentStep(3)
      setSuccessMsg('Step 2 saved! Now answer the written questions.')
    } catch {
      setError('Something went wrong saving your work samples.')
    } finally {
      setLoading(false)
    }
  }, [samples, applicationId])

  const handleStep3 = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!q1.trim() || !q2.trim() || !q3.trim() || !q4.trim() || !q5.trim()) {
      setError('All 5 written application questions must be answered.')
      return
    }

    setLoading(true)
    setError('')
    setSuccessMsg('')
    try {
      const res = await fetch('/api/vendor/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 3,
          application_id: applicationId,
          data: {
            q1_projects_experience: q1.trim(),
            q2_pricing: q2.trim(),
            q3_guidelines_corrections: q3.trim(),
            q4_teaching_ability: q4.trim(),
            q5_sample_sharing: q5.trim(),
          },
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        setError(result.error || 'Failed to submit application')
        setLoading(false)
        return
      }
      setCurrentStep('success')
    } catch {
      setError('Something went wrong submitting your final application.')
    } finally {
      setLoading(false)
    }
  }, [q1, q2, q3, q4, q5, applicationId])

  const inputStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-surface-1)',
    color: 'var(--color-ink)',
    fontSize: 'var(--text-body-sm-size)',
    fontWeight: 'var(--text-body-sm-weight)',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-hairline)',
    outline: 'none',
    transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
    fontFamily: 'var(--font-body)',
  }

  const labelStyle: React.CSSProperties = {
    color: 'var(--color-ink-muted)',
    display: 'block',
    marginBottom: 6,
    fontSize: 13,
    fontWeight: 500,
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-canvas)', display: 'flex', flexDirection: 'column', color: 'var(--color-ink)' }}>
      {/* Header */}
      <header style={{
        padding: '24px 32px',
        borderBottom: '1px solid var(--color-hairline-soft)',
        backgroundColor: 'var(--color-canvas)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image src="/images/karyasaarthi.png" alt="Karya Saarthi" width={32} height={32} style={{ borderRadius: 6 }} />
          <div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-0.4px', display: 'block' }}>Karya Saarthi</span>
            <span style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>Vendor Application Portal</span>
          </div>
        </Link>
        <Link href="/login" className="btn-secondary" style={{ fontSize: 13, padding: '8px 16px', textDecoration: 'none' }}>
          Back to Login
        </Link>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: 760, width: '100%', margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Progress bar */}
        {currentStep !== 'success' && (
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              {STEPS.map((s, idx) => {
                const isActive = typeof currentStep === 'number' && currentStep >= s.num
                const isCurrent = currentStep === s.num
                return (
                  <React.Fragment key={s.num}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700,
                        backgroundColor: isActive ? 'var(--color-accent-blue)' : 'var(--color-surface-1)',
                        color: isActive ? '#fff' : 'var(--color-ink-muted)',
                        border: `2px solid ${isCurrent ? 'var(--color-accent-blue)' : isActive ? 'var(--color-accent-blue)' : 'var(--color-hairline)'}`,
                        boxShadow: isCurrent ? '0 0 16px rgba(56, 189, 248, 0.3)' : 'none',
                        transition: 'all 0.3s ease',
                      }}>
                        {typeof currentStep === 'number' && currentStep > s.num ? '✓' : s.num}
                      </div>
                      <span style={{
                        fontSize: 14,
                        fontWeight: isCurrent ? 600 : 500,
                        color: isActive ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                      }}>
                        {s.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div style={{
                        flex: 1, height: 2, margin: '0 12px',
                        backgroundColor: typeof currentStep === 'number' && currentStep > s.num ? 'var(--color-accent-blue)' : 'var(--color-surface-2)',
                        transition: 'background-color 0.3s ease',
                      }} />
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div style={{ backgroundColor: '#1a0808', border: '1px solid #7f1d1d', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: 24 }}>
            <p className="text-body-sm" style={{ color: '#fca5a5', margin: 0 }}>⚠ {error}</p>
          </div>
        )}
        {successMsg && currentStep !== 'success' && (
          <div style={{ backgroundColor: '#061a12', border: '1px solid #065f46', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: 24 }}>
            <p className="text-body-sm" style={{ color: '#6ee7b7', margin: 0 }}>✓ {successMsg}</p>
          </div>
        )}

        {/* Form Card */}
        <div style={{
          backgroundColor: 'var(--color-surface-1)',
          border: '1px solid var(--color-hairline)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px 40px',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)',
        }}>
          {/* STEP 1: Basic Info */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, margin: '0 0 6px' }}>Basic Information</h1>
                <p style={{ color: 'var(--color-ink-muted)', fontSize: 14, margin: 0 }}>Tell us about your background and share your resume link.</p>
              </div>

              <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.08)', borderLeft: '3px solid var(--color-accent-blue)', padding: '12px 16px', borderRadius: 6 }}>
                <p style={{ fontSize: 13, color: '#38bdf8', margin: 0 }}>
                  ℹ️ We check your details carefully: Name, phone, educational qualifications, experience, and verified CV/Resume.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input type="text" value={fullname} onChange={e => setFullname(e.target.value)} placeholder="John Doe" required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Phone Number *</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit mobile number" required style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Email Address *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Educational Qualifications</label>
                  <input type="text" value={education} onChange={e => setEducation(e.target.value)} placeholder="e.g. B.Tech Computer Science, M.A. English" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Experience (Years)</label>
                  <input type="number" min="0" max="50" value={experience} onChange={e => setExperience(e.target.value)} placeholder="e.g. 3" style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Skills (comma separated) *</label>
                <input type="text" value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. React, Node.js, Content Writing, Graphic Design" required style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Previous Companies or Clients</label>
                <input type="text" value={companies} onChange={e => setCompanies(e.target.value)} placeholder="e.g. ABC Tech, Freelance projects" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Certifications / Achievements</label>
                <input type="text" value={certifications} onChange={e => setCertifications(e.target.value)} placeholder="e.g. AWS Certified Developer, Best Writer Award" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Resume / CV Link (Google Drive, Dropbox, etc.) *</label>
                <input type="url" value={resumeLink} onChange={e => setResumeLink(e.target.value)} placeholder="https://drive.google.com/file/d/..." required style={inputStyle} />
                <span style={{ fontSize: 12, color: 'var(--color-ink-muted)', marginTop: 4, display: 'block' }}>Make sure access permission is set to &quot;Anyone with the link can view&quot;.</span>
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent: 'center', width: '100%', padding: '14px', fontSize: 15, marginTop: 12, opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Saving & Continuing...' : 'Save & Continue →'}
              </button>
            </form>
          )}

          {/* STEP 2: Work Samples */}
          {currentStep === 2 && (
            <form onSubmit={handleStep2} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, margin: '0 0 6px' }}>Work Samples</h1>
                <p style={{ color: 'var(--color-ink-muted)', fontSize: 14, margin: 0 }}>Share 3 to 5 links to your best original work or projects.</p>
              </div>

              <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.08)', borderLeft: '3px solid var(--color-accent-blue)', padding: '12px 16px', borderRadius: 6 }}>
                <p style={{ fontSize: 13, color: '#38bdf8', margin: 0 }}>
                  ℹ️ Please provide direct viewable links (Drive, GitHub, Figma, Behance, live site). Minimum 3 work samples are required.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {samples.map((sample, idx) => (
                  <div key={idx} style={{
                    backgroundColor: 'var(--color-surface-2)',
                    border: '1px solid var(--color-hairline-soft)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px 24px',
                    position: 'relative',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-accent-blue)' }}>
                        Sample #{idx + 1} {idx < 3 ? '*' : '(Optional)'}
                      </span>
                      {idx >= 3 && (
                        <button
                          type="button"
                          onClick={() => removeSample(idx)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Link URL (Drive, Github, Website) {idx < 3 ? '*' : ''}</label>
                        <input
                          type="url"
                          value={sample.url}
                          onChange={e => updateSample(idx, 'url', e.target.value)}
                          placeholder="https://..."
                          required={idx < 3}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Project Title {idx < 3 ? '*' : ''}</label>
                        <input
                          type="text"
                          value={sample.title}
                          onChange={e => updateSample(idx, 'title', e.target.value)}
                          placeholder="e.g. E-Commerce Dashboard / Research Thesis"
                          required={idx < 3}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Description (Optional)</label>
                        <input
                          type="text"
                          value={sample.description}
                          onChange={e => updateSample(idx, 'description', e.target.value)}
                          placeholder="Briefly explain your role and tools used"
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {samples.length < 5 && (
                <button
                  type="button"
                  onClick={addSample}
                  className="btn-secondary"
                  style={{ justifyContent: 'center', width: '100%', padding: '12px' }}
                >
                  + Add Another Sample ({samples.length}/5)
                </button>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: 'center', padding: '14px' }}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ flex: 2, justifyContent: 'center', padding: '14px', opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? 'Saving & Continuing...' : 'Save & Continue →'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Written Application */}
          {currentStep === 3 && (
            <form onSubmit={handleStep3} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, margin: '0 0 6px' }}>Written Application</h1>
                <p style={{ color: 'var(--color-ink-muted)', fontSize: 14, margin: 0 }}>Please answer all 5 questions honestly and in detail.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ backgroundColor: 'var(--color-surface-2)', padding: '18px 20px', borderRadius: 'var(--radius-lg)' }}>
                  <label style={{ ...labelStyle, color: 'var(--color-ink)', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
                    Question 1: How many projects have you completed so far? What is your total experience in years? *
                  </label>
                  <textarea
                    rows={3}
                    value={q1}
                    onChange={e => setQ1(e.target.value)}
                    placeholder="Provide details about your project count and overall industry/academic work experience..."
                    required
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                  />
                </div>

                <div style={{ backgroundColor: 'var(--color-surface-2)', padding: '18px 20px', borderRadius: 'var(--radius-lg)' }}>
                  <label style={{ ...labelStyle, color: 'var(--color-ink)', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
                    Question 2: What is your minimum and maximum charge? Do you charge per page, per project, or hourly? *
                  </label>
                  <textarea
                    rows={3}
                    value={q2}
                    onChange={e => setQ2(e.target.value)}
                    placeholder="Specify your pricing model, average turnaround costs, and billing preferences..."
                    required
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                  />
                </div>

                <div style={{ backgroundColor: 'var(--color-surface-2)', padding: '18px 20px', borderRadius: 'var(--radius-lg)' }}>
                  <label style={{ ...labelStyle, color: 'var(--color-ink)', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
                    Question 3: Can you create projects according to both student and company guidelines? Are you ready to do unlimited corrections? *
                  </label>
                  <textarea
                    rows={3}
                    value={q3}
                    onChange={e => setQ3(e.target.value)}
                    placeholder="Confirm your flexibility with strict guidelines and commitment to revision loops..."
                    required
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                  />
                </div>

                <div style={{ backgroundColor: 'var(--color-surface-2)', padding: '18px 20px', borderRadius: 'var(--radius-lg)' }}>
                  <label style={{ ...labelStyle, color: 'var(--color-ink)', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
                    Question 4: If a student wants to understand how their project was made (for viva/presentation), can you explain and provide teaching sessions? *
                  </label>
                  <textarea
                    rows={3}
                    value={q4}
                    onChange={e => setQ4(e.target.value)}
                    placeholder="Explain your willingness to conduct 1-on-1 walkthrough or viva prep sessions..."
                    required
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                  />
                </div>

                <div style={{ backgroundColor: 'var(--color-surface-2)', padding: '18px 20px', borderRadius: 'var(--radius-lg)' }}>
                  <label style={{ ...labelStyle, color: 'var(--color-ink)', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
                    Question 5: Can we show your sample work to potential clients? (Removing student name & personal details, just to show quality) *
                  </label>
                  <textarea
                    rows={3}
                    value={q5}
                    onChange={e => setQ5(e.target.value)}
                    placeholder="Confirm anonymized portfolio usage consent..."
                    required
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: 'center', padding: '14px' }}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ flex: 2, justifyContent: 'center', padding: '14px', opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? 'Submitting Application...' : 'Submit Application 🎉'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Success Screen */}
          {currentStep === 'success' && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                color: '#22c55e',
                fontSize: 40,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                border: '2px solid rgba(34, 197, 94, 0.4)',
              }}>
                ✓
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, margin: '0 0 12px' }}>Application Submitted!</h1>
              <p style={{ color: 'var(--color-ink-muted)', fontSize: 15, maxWidth: 460, margin: '0 auto 32px', lineHeight: 1.6 }}>
                Thank you for applying to become a Karya Saarthi Vendor. Our HR team has received your application and work samples. We will review your profile and contact you soon!
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <Link href="/login" className="btn-primary" style={{ padding: '14px 28px', textDecoration: 'none' }}>
                  Return to Login →
                </Link>
                <Link href="/" className="btn-secondary" style={{ padding: '14px 28px', textDecoration: 'none' }}>
                  Go to Homepage
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function VendorApplyPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: 400, height: 500, borderRadius: 'var(--radius-xl)' }} />
      </div>
    }>
      <VendorApplyContent />
    </Suspense>
  )
}
