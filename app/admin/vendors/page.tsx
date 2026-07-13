'use client'

import { useEffect, useState } from 'react'

interface VendorData {
  id: number
  company_name: string | null
  specialization: string | null
  is_approved: boolean
  rating: number
  total_projects: number
  user: { id: number; fullname: string; email: string; phone: string; status: string } | null
}

interface VendorApplication {
  id: number
  vendor_id: string
  fullname: string
  email: string
  phone: string
  education: string | null
  experience_years: number
  skills: string[]
  previous_companies: string | null
  certifications: string | null
  resume_link: string | null
  work_samples: { url: string; title: string; description: string }[]
  q1_projects_experience: string | null
  q2_pricing: string | null
  q3_guidelines_corrections: string | null
  q4_teaching_ability: string | null
  q5_sample_sharing: string | null
  status: string
  pipeline_step: string
  step_1_done: boolean
  step_2_done: boolean
  step_3_done: boolean
  step_4_done: boolean
  interview_scheduled_at: string | null
  hr_call_at: string | null
  hr_call_notes: string | null
  admin_notes: string | null
  interview_notes: string | null
  rejection_reason: string | null
  created_at: string
}

const PIPELINE_STEPS = [
  { key: 'step_1_done', label: 'Application Reviewed', icon: '📄', desc: 'Admin has reviewed basic info, skills & resume' },
  { key: 'step_2_done', label: 'Resume & Work Samples Checked', icon: '🔍', desc: 'Portfolio & samples verified' },
  { key: 'step_3_done', label: 'HR Call Completed', icon: '📞', desc: 'HR spoke with the candidate' },
  { key: 'step_4_done', label: 'Interview Completed', icon: '🎙️', desc: 'Interview / assessment done' },
]

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  under_review: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
}

export default function VendorsPage() {
  const [tab, setTab] = useState<'vendors' | 'applications'>('applications')
  const [vendors, setVendors] = useState<VendorData[]>([])
  const [apps, setApps] = useState<VendorApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<VendorApplication | null>(null)
  const [saving, setSaving] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    if (tab === 'vendors') {
      setLoading(true)
      fetch('/api/admin/vendors').then(r => r.json()).then(d => { setVendors(d.vendors || []); setLoading(false) })
    } else {
      setLoading(true)
      const url = statusFilter === 'all' ? '/api/admin/vendor-applications' : `/api/admin/vendor-applications?status=${statusFilter}`
      fetch(url).then(r => r.json()).then(d => { setApps(d.applications || []); setLoading(false) })
    }
  }, [tab, statusFilter])

  const updateStep = async (appId: number, field: string, value: boolean | string, extra?: Record<string, unknown>) => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/vendor-applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appId, [field]: value, ...extra }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setApps(prev => prev.map(a => a.id === appId ? { ...a, [field]: value, ...extra, ...data.application } : a))
      if (selectedApp?.id === appId) setSelectedApp(prev => prev ? { ...prev, [field]: value, ...extra, ...data.application } : null)
      showToast('Updated successfully')
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to update', 'error')
    } finally { setSaving(false) }
  }

  const handleApprove = async (app: VendorApplication) => {
    if (!confirm(`Approve ${app.fullname}? This will create their vendor account so they can login.`)) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/vendor-applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: app.id, action: 'approve' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setApps(prev => prev.map(a => a.id === app.id ? { ...a, status: 'approved', pipeline_step: 'approved' } : a))
      if (selectedApp?.id === app.id) setSelectedApp(prev => prev ? { ...prev, status: 'approved', pipeline_step: 'approved' } : null)
      showToast(`✅ ${app.fullname} approved! Vendor account created.`)
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to approve', 'error')
    } finally { setSaving(false) }
  }

  const handleReject = async () => {
    if (!selectedApp) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/vendor-applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedApp.id, action: 'reject', rejection_reason: rejectReason }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setApps(prev => prev.filter(a => a.id !== selectedApp.id))
      setSelectedApp(null)
      setShowRejectModal(false)
      setRejectReason('')
      showToast('❌ Application rejected. Data erased.')
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to reject', 'error')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-bold shadow-lg ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy font-heading">🏪 Vendor Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage approved vendors & review new applications</p>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {[{ key: 'applications', label: '📋 Applications' }, { key: 'vendors', label: '✅ Active Vendors' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-all ${tab === t.key ? 'bg-white text-navy shadow-sm' : 'text-slate-500 hover:text-navy'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── APPLICATIONS TAB ── */}
      {tab === 'applications' && (
        <div className="grid grid-cols-12 gap-5">
          {/* Left: list */}
          <div className="col-span-12 lg:col-span-4 space-y-3">
            {/* Filters */}
            <div className="flex gap-1 flex-wrap">
              {['all', 'pending', 'under_review', 'approved'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${statusFilter === s ? 'bg-navy text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>
                  {s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </button>
              ))}
            </div>

            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-slate-100" />)
            ) : apps.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-100">
                <span className="text-4xl block mb-2">📋</span>
                <p className="text-slate-400 text-sm">No applications found</p>
              </div>
            ) : apps.map(app => (
              <button key={app.id} onClick={() => setSelectedApp(app)}
                className={`w-full text-left bg-white rounded-2xl p-4 border transition-all cursor-pointer hover:shadow-md ${selectedApp?.id === app.id ? 'border-accent shadow-md' : 'border-slate-100'}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                      {app.fullname.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-navy text-sm">{app.fullname}</p>
                      <p className="text-xs text-slate-400">{app.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[app.status] || 'bg-slate-100 text-slate-500'}`}>
                    {app.status.replace('_', ' ')}
                  </span>
                </div>
                {/* Mini pipeline */}
                <div className="flex gap-1">
                  {PIPELINE_STEPS.map((s, i) => (
                    <div key={i} className={`flex-1 h-1 rounded-full ${(app as any)[s.key] ? 'bg-green-500' : 'bg-slate-200'}`} />
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {new Date(app.created_at).toLocaleDateString('en-IN')} · {(Array.isArray(app.skills) ? app.skills : []).slice(0, 2).join(', ')}
                </p>
              </button>
            ))}
          </div>

          {/* Right: detail panel */}
          <div className="col-span-12 lg:col-span-8">
            {!selectedApp ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-slate-100">
                <span className="text-5xl block mb-4">👈</span>
                <p className="text-slate-400 font-medium">Select an application to review</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Applicant header */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl">
                        {selectedApp.fullname.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-navy font-heading">{selectedApp.fullname}</h2>
                        <p className="text-sm text-slate-400">{selectedApp.email} · {selectedApp.phone}</p>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[selectedApp.status] || 'bg-slate-100 text-slate-500'}`}>
                            {selectedApp.status.replace('_', ' ')}
                          </span>
                          {(Array.isArray(selectedApp.skills) ? selectedApp.skills : []).map((sk, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-full font-medium">{sk}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {selectedApp.status !== 'approved' && selectedApp.status !== 'rejected' && (
                        <>
                          <button onClick={() => handleApprove(selectedApp)} disabled={saving}
                            className="px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-bold cursor-pointer hover:bg-green-600 disabled:opacity-60">
                            ✅ Approve
                          </button>
                          <button onClick={() => setShowRejectModal(true)} disabled={saving}
                            className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-bold cursor-pointer hover:bg-red-600 disabled:opacity-60">
                            ❌ Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pipeline Checklist */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100">
                  <h3 className="font-bold text-navy font-heading mb-4">🔄 Onboarding Pipeline</h3>
                  <div className="space-y-3">
                    {PIPELINE_STEPS.map((step, i) => {
                      const done = (selectedApp as any)[step.key] as boolean
                      return (
                        <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${done ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                          <button
                            onClick={() => updateStep(selectedApp.id, step.key, !done)}
                            disabled={saving || selectedApp.status === 'approved' || selectedApp.status === 'rejected'}
                            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-all disabled:cursor-not-allowed ${done ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 bg-white hover:border-green-400'}`}
                          >
                            {done ? '✓' : i + 1}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold ${done ? 'text-green-700' : 'text-navy'}`}>{step.icon} {step.label}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
                            {/* Scheduling inputs for step 3 and 4 */}
                            {i === 2 && done && (
                              <div className="mt-2 grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] text-slate-400 font-bold uppercase">HR Call Date/Time</label>
                                  <input type="datetime-local" className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none mt-1"
                                    value={selectedApp.hr_call_at ? selectedApp.hr_call_at.slice(0, 16) : ''}
                                    onChange={e => updateStep(selectedApp.id, 'hr_call_at', e.target.value ? new Date(e.target.value).toISOString() : null as any)} />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 font-bold uppercase">HR Notes</label>
                                  <input type="text" placeholder="Notes from HR call..." className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none mt-1"
                                    value={selectedApp.hr_call_notes || ''}
                                    onChange={e => updateStep(selectedApp.id, 'hr_call_notes', e.target.value)} />
                                </div>
                              </div>
                            )}
                            {i === 3 && done && (
                              <div className="mt-2 grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] text-slate-400 font-bold uppercase">Interview Date/Time</label>
                                  <input type="datetime-local" className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none mt-1"
                                    value={selectedApp.interview_scheduled_at ? selectedApp.interview_scheduled_at.slice(0, 16) : ''}
                                    onChange={e => updateStep(selectedApp.id, 'interview_scheduled_at', e.target.value ? new Date(e.target.value).toISOString() : null as any)} />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 font-bold uppercase">Interview Notes</label>
                                  <input type="text" placeholder="Interview feedback..." className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none mt-1"
                                    value={selectedApp.interview_notes || ''}
                                    onChange={e => updateStep(selectedApp.id, 'interview_notes', e.target.value)} />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Admin Notes */}
                  <div className="mt-4">
                    <label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">Admin Notes</label>
                    <textarea rows={2} placeholder="Add internal notes..."
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-navy resize-none"
                      value={selectedApp.admin_notes || ''}
                      onChange={e => setSelectedApp(prev => prev ? { ...prev, admin_notes: e.target.value } : null)}
                      onBlur={e => updateStep(selectedApp.id, 'admin_notes', e.target.value)} />
                  </div>
                </div>

                {/* Application Details */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100">
                  <h3 className="font-bold text-navy font-heading mb-4">📝 Application Details</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div><p className="text-[10px] text-slate-400 uppercase font-bold">Education</p><p className="text-sm text-navy mt-0.5">{selectedApp.education || '—'}</p></div>
                    <div><p className="text-[10px] text-slate-400 uppercase font-bold">Experience</p><p className="text-sm text-navy mt-0.5">{selectedApp.experience_years} years</p></div>
                    <div><p className="text-[10px] text-slate-400 uppercase font-bold">Previous Companies</p><p className="text-sm text-navy mt-0.5">{selectedApp.previous_companies || '—'}</p></div>
                    <div><p className="text-[10px] text-slate-400 uppercase font-bold">Certifications</p><p className="text-sm text-navy mt-0.5">{selectedApp.certifications || '—'}</p></div>
                  </div>
                  {selectedApp.resume_link && (
                    <a href={selectedApp.resume_link} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 mb-4">
                      📄 View Resume / CV
                    </a>
                  )}

                  {/* Work Samples */}
                  {(selectedApp.work_samples || []).length > 0 && (
                    <div className="mb-4">
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">Work Samples</p>
                      <div className="space-y-2">
                        {selectedApp.work_samples.map((ws, i) => (
                          <a key={i} href={ws.url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all">
                            <span className="text-base">🔗</span>
                            <div>
                              <p className="text-sm font-semibold text-navy">{ws.title || `Sample ${i + 1}`}</p>
                              {ws.description && <p className="text-xs text-slate-400">{ws.description}</p>}
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Q&A */}
                  {selectedApp.q1_projects_experience && (
                    <div className="space-y-3">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Written Application Answers</p>
                      {[
                        { q: 'Projects & Experience', a: selectedApp.q1_projects_experience },
                        { q: 'Pricing Model', a: selectedApp.q2_pricing },
                        { q: 'Guidelines & Corrections', a: selectedApp.q3_guidelines_corrections },
                        { q: 'Teaching Ability', a: selectedApp.q4_teaching_ability },
                        { q: 'Sample Sharing Consent', a: selectedApp.q5_sample_sharing },
                      ].map((qa, i) => (
                        <div key={i} className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs font-bold text-navy mb-1">Q{i + 1}: {qa.q}</p>
                          <p className="text-xs text-slate-600 leading-relaxed">{qa.a || '—'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ACTIVE VENDORS TAB ── */}
      {tab === 'vendors' && (
        <div>
          <p className="text-slate-500 text-sm mb-4">{vendors.length} active vendors</p>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 bg-white rounded-2xl animate-pulse" />)}
            </div>
          ) : vendors.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-100">
              <span className="text-4xl block mb-2">🏪</span>
              <p className="text-slate-500">No approved vendors yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendors.map(v => (
                <div key={v.id} className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-lg">
                        {v.user?.fullname.charAt(0) || 'V'}
                      </div>
                      <div>
                        <p className="font-semibold text-navy">{v.user?.fullname}</p>
                        <p className="text-xs text-slate-400">{v.user?.email}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${v.is_approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {v.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-slate-50 rounded-xl p-3"><p className="text-lg font-bold text-navy">{v.total_projects}</p><p className="text-xs text-slate-400">Projects</p></div>
                    <div className="bg-slate-50 rounded-xl p-3"><p className="text-lg font-bold text-navy">⭐ {v.rating}</p><p className="text-xs text-slate-400">Rating</p></div>
                    <div className="bg-slate-50 rounded-xl p-3"><p className="text-lg font-bold text-navy capitalize">{v.user?.status}</p><p className="text-xs text-slate-400">Status</p></div>
                  </div>
                  {v.specialization && <p className="text-sm text-slate-500 mt-3">🎯 {v.specialization}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedApp && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-navy text-lg mb-2 font-heading">❌ Reject Application</h3>
            <p className="text-sm text-slate-500 mb-4">
              This will permanently delete all data for <strong>{selectedApp.fullname}</strong>. This action cannot be undone.
            </p>
            <textarea rows={3} placeholder="Reason for rejection (will be logged)..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-red-400 resize-none mb-4"
              value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={handleReject} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm cursor-pointer hover:bg-red-600 disabled:opacity-60">
                {saving ? '⏳ Rejecting...' : '🗑️ Reject & Erase Data'}
              </button>
              <button onClick={() => setShowRejectModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm cursor-pointer hover:bg-slate-200">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
