'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Suspense, useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import DirectChatPanel from '@/components/admin/DirectChatPanel'
import { fetchWithAuth } from '@/lib/auth/fetchWithAuth'
import PaymentButton from '@/components/PaymentButton'
import DashboardSidebar from '@/components/DashboardSidebar'

interface UserData { id: number; fullname: string; email: string; role: string; department: string | null; is_approved: boolean; user_type: string }
interface Project { id: number; service_type: string; description: string; status: string; progress: number; budget: number | null; created_at: string; vendor: { id: number; fullname: string; avatar_url?: string } | null }
interface Message { id: number; content: string; attachment_url: string | null; file_type: string | null; created_at: string; sender: { id: number; fullname: string; role: string } | null }
interface Notification { id: number; type: string; title: string; message: string; project_id: number | null; is_read: boolean; created_at: string }
interface Notification { id: number; type: string; title: string; message: string; project_id: number | null; is_read: boolean; created_at: string }
interface Invoice { id: number; invoice_number: string; total: number; status: string; due_date: string | null; created_at: string; project: { service_type: string } | null }
interface Task { id: number; title: string; assignee: string | null; deadline: string | null; priority: 'low' | 'medium' | 'high'; status: 'todo' | 'in_progress' | 'review' | 'done'; created_at: string }

const VIDEO_FILE_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const uploadFileWithProgress = (file: File, onProgress: (progress: number) => void): Promise<{ url?: string; file_type?: string }> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const fd = new FormData()
    fd.append('file', file)

    xhr.open('POST', '/api/upload', true)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentage = Math.round((event.loaded / event.total) * 100)
        onProgress(percentage)
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText))
        } catch {
          reject(new Error('Failed to parse response'))
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    }

    xhr.onerror = () => reject(new Error('Network error'))
    xhr.send(fd)
  })
}

function DashboardLoading() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      {[0,1,2].map(i => <div key={i} className="skeleton" style={{ width: 8, height: 8, borderRadius: '50%', animationDelay: `${i*200}ms` }} />)}
    </div>
  )
}
export default function DashboardWrapper() { return <Suspense fallback={<DashboardLoading />}><DashboardPage /></Suspense> }

const trackingSteps = [
  { label: 'Request', key: 'pending', icon: '📝' },
  { label: 'Assigned', key: 'assigned', icon: '👨‍💼' },
  { label: 'Progress', key: 'in_progress', icon: '🔄' },
  { label: 'Review', key: 'review', icon: '🔍' },
  { label: 'Delivered', key: 'delivered', icon: '📦' },
  { label: 'Completed', key: 'completed', icon: '✅' },
]
const SERVICE_TYPES = ['Thesis Writing','Project Report','Research Paper','Presentation','Resume Building','Business Plan','Website Development','Data Analysis','Other']

// ⭐ Star Rating Component
function StarRating({ value, onChange, readOnly = false }: { value: number; onChange?: (v: number) => void; readOnly?: boolean }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button" disabled={readOnly}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => onChange?.(star)}
          className={`text-2xl transition-transform ${!readOnly ? 'cursor-pointer hover:scale-125' : ''}`}>
          <span className={`${(hover || value) >= star ? 'opacity-100' : 'opacity-25'}`}>⭐</span>
        </button>
      ))}
    </div>
  )
}

function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [showNewProject, setShowNewProject] = useState(false)
  const [saving, setSaving] = useState(false)
  const [chatProject, setChatProject] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadSummary, setUploadSummary] = useState('')
  const [deletingMsg, setDeletingMsg] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [filter, setFilter] = useState<'all'|'active'|'completed'|'pending'>('all')
  const [ratingProject, setRatingProject] = useState<Project | null>(null)
  const [ratingValue, setRatingValue] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [ratingSubmitting, setRatingSubmitting] = useState(false)
  const [ratedProjects, setRatedProjects] = useState<Set<number>>(new Set())
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifs, setShowNotifs] = useState(false)
  const [vendorRatings, setVendorRatings] = useState<Record<number, { avg: number; total: number }>>({})
  const isPending = searchParams.get('pending') === '1'
  const [form, setForm] = useState({ service_type: '', description: '', budget: '' })
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [invoicesLoaded, setInvoicesLoaded] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<{ file: File; id: string; progress: number; status: 'pending' | 'uploading' | 'completed' | 'failed' }[]>([])
  const [showDMPanel, setShowDMPanel] = useState(false)

  const fetchProjects = useCallback(async () => {
    const res = await fetch('/api/projects')
    if (res.ok) { const data = await res.json(); setProjects(data.projects || []) }
  }, [])

  const fetchNotifications = useCallback(async () => {
    const res = await fetchWithAuth('/api/notifications')
    if (res.ok) { const data = await res.json(); setNotifications(data.notifications || []); setUnreadCount(data.unread || 0) }
  }, [])

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await fetch('/api/invoices/my')
      if (res.ok) { const d = await res.json(); setInvoices(d.invoices || []); setInvoicesLoaded(true) }
    } catch {}
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        let res = await fetch('/api/auth/me')
        if (res.status === 401) { const r = await fetch('/api/auth/refresh', { method: 'POST' }); if (r.ok) res = await fetch('/api/auth/me') }
        if (!res.ok) { router.push('/login'); return }
        const data = await res.json()
        if ((data.role === 'super_admin' || (data.role === 'admin' && data.is_approved)) && !isPending) { router.push('/admin'); return }
        if (data.role === 'vendor') { router.push('/vendor'); return }
        setUser(data)
        fetchProjects()
        fetchNotifications()
        fetchInvoices()
      } catch { router.push('/login') }
      finally { setLoading(false) }
    }
    fetchUser()
  }, [router, isPending, fetchProjects, fetchNotifications, fetchInvoices])

  // Poll notifications every 15s
  useEffect(() => { const i = setInterval(fetchNotifications, 15000); return () => clearInterval(i) }, [fetchNotifications])

  // Check which projects are already rated
  useEffect(() => {
    const completedWithVendor = projects.filter(p => p.status === 'completed' && p.vendor)
    completedWithVendor.forEach(async p => {
      const res = await fetch(`/api/ratings?projectId=${p.id}`)
      if (res.ok) { const d = await res.json(); if (d.rating) setRatedProjects(prev => new Set(prev).add(p.id)) }
    })
    // Fetch vendor ratings
    const vendorIds = [...new Set(projects.filter(p => p.vendor).map(p => p.vendor!.id))]
    vendorIds.forEach(async vid => {
      const res = await fetch(`/api/ratings?vendorId=${vid}`)
      if (res.ok) { const d = await res.json(); setVendorRatings(prev => ({ ...prev, [vid]: { avg: d.average, total: d.total } })) }
    })
  }, [projects])

  const handleLogout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/') }
  const createProject = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, budget: form.budget ? Number(form.budget) : null }) })
    setSaving(false); setShowNewProject(false); setForm({ service_type: '', description: '', budget: '' }); fetchProjects()
  }

  const openChat = async (projectId: number) => { 
    setChatProject(chatProject === projectId ? null : projectId); 
    if (chatProject !== projectId) {
      const r = await fetch(`/api/projects/${projectId}/messages`); const d = await r.json(); setMessages(d.messages || []);
      const t = await fetch(`/api/admin/projects/tasks?project_id=${projectId}`); const td = await t.json(); setTasks(td.tasks || []);
    }
  }
  const refreshChat = async () => { if (!chatProject) return; const r = await fetch(`/api/projects/${chatProject}/messages`); const d = await r.json(); setMessages(d.messages || []) }
  useEffect(() => { if (!chatProject) return; const i = setInterval(refreshChat, 5000); return () => clearInterval(i) }, [chatProject])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const selected = Array.from(e.target.files)
    
    // Check if adding these would exceed 3 videos limit
    const existingVideos = pendingFiles.filter(pf => VIDEO_FILE_TYPES.includes(pf.file.type)).length
    const newVideos = selected.filter(file => VIDEO_FILE_TYPES.includes(file.type)).length
    
    if (existingVideos + newVideos > 3) {
      setUploadSummary('You can attach a maximum of 3 videos at a time.')
      return
    }
    
    const newPending = selected.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      progress: 0,
      status: 'pending' as const
    }))
    
    setPendingFiles(prev => [...prev, ...newPending])
    setUploadSummary('')
    if (e.target.value) e.target.value = ''
  }

  const sendMessage = async () => {
    if (!chatProject) return
    const text = newMsg.trim()
    if (!text && pendingFiles.length === 0) return
    
    setUploading(true)
    setUploadSummary('')
    
    try {
      if (pendingFiles.length > 0) {
        // Mark all as uploading
        setPendingFiles(prev => prev.map(f => f.status === 'pending' ? { ...f, status: 'uploading' } : f))
        
        for (const pf of pendingFiles) {
          if (pf.status === 'completed') continue
          
          try {
            const result = await uploadFileWithProgress(pf.file, (pct) => {
              setPendingFiles(prev => prev.map(f => f.id === pf.id ? { ...f, progress: pct } : f))
            })
            
            if (result.url) {
              setPendingFiles(prev => prev.map(f => f.id === pf.id ? { ...f, status: 'completed', progress: 100 } : f))
              
              // Send message with this attachment
              await fetch(`/api/projects/${chatProject}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  content: text ? `Sent attachment: ${pf.file.name}\n\n${text}` : `Attachment: ${pf.file.name}`,
                  attachment_url: result.url,
                  file_type: result.file_type,
                }),
              })
            } else {
              throw new Error('Upload failed')
            }
          } catch (err) {
            setPendingFiles(prev => prev.map(f => f.id === pf.id ? { ...f, status: 'failed' } : f))
            throw err
          }
        }
        
        setPendingFiles([])
      } else {
        // Standard text message
        await fetch(`/api/projects/${chatProject}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: text, attachment_url: null, file_type: null })
        })
      }
      
      setNewMsg('')
      setUploadSummary('Sent successfully')
      refreshChat()
    } catch (err) {
      setUploadSummary('Failed to send some attachments')
    } finally {
      setUploading(false)
    }
  }
  const deleteMessage = async (msgId: number) => { if (!chatProject) return; setDeletingMsg(msgId); await fetch(`/api/projects/${chatProject}/messages`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId: msgId }) }); setDeletingMsg(null); refreshChat() }

  const submitRating = async () => {
    if (!ratingProject || !ratingValue) return; setRatingSubmitting(true)
    const res = await fetch('/api/ratings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project_id: ratingProject.id, rating: ratingValue, review: reviewText }) })
    if (res.ok) { setRatedProjects(prev => new Set(prev).add(ratingProject.id)); setRatingProject(null); setRatingValue(0); setReviewText('') }
    setRatingSubmitting(false)
  }

  const markAllRead = async () => { await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAllRead: true }) }); fetchNotifications() }

  if (loading) return <DashboardLoading />

  const filtered = projects.filter(p => {
    if (filter === 'active') return !['completed', 'cancelled', 'pending'].includes(p.status)
    if (filter === 'completed') return p.status === 'completed'
    if (filter === 'pending') return p.status === 'pending'
    return true
  })
  const completedCount = projects.filter(p => p.status === 'completed').length
  const activeCount = projects.filter(p => !['completed', 'cancelled', 'pending'].includes(p.status)).length
  const currentProject = projects.find(p => !['completed', 'cancelled'].includes(p.status)) || projects[0]
  const currentStepIdx = currentProject ? trackingSteps.findIndex(s => s.key === currentProject.status) : -1

  return (
    <>
      {/* Mobile Header */}
            <div className="dash-mobile-header" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--color-ink)' }}>Karya Saarthi</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => { const opening = !showNotifs; setShowNotifs(opening); if (opening && unreadCount > 0) markAllRead() }} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
                  🔔 {unreadCount > 0 && <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', backgroundColor: '#ef4444', color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount}</span>}
                </button>
                <button onClick={handleLogout} className="btn-secondary" style={{ fontSize: 13, cursor: 'pointer' }}>Logout</button>
              </div>
            </div>

            {isPending && user?.role === 'pending_admin' && (
              <div style={{ backgroundColor: '#1a1200', border: '1px solid #78350f', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 20 }}>
                <p className="text-body-sm" style={{ color: '#fde68a' }}>⏳ Admin Access Pending — Your request is awaiting Super Admin approval.</p>
              </div>
            )}

            {/* Welcome + Notification Bell */}
            <div className="card-template" style={{ padding: '20px 24px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <h1 className="text-display-md" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)', marginBottom: 4 }}>Welcome, {user?.fullname || 'User'} 👋</h1>
                  <p className="text-body-sm" style={{ color: 'var(--color-ink-muted)' }}>Here&apos;s your project overview</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ position: 'relative' }}>
                    <button onClick={() => { const opening = !showNotifs; setShowNotifs(opening); if (opening && unreadCount > 0) markAllRead() }} className="btn-icon" style={{ cursor: 'pointer', position: 'relative' }}>
                      🔔
                      {unreadCount > 0 && <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', backgroundColor: '#ef4444', color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount}</span>}
                    </button>
                    {showNotifs && (
                      <div className="ks-popover visible" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 300, backgroundColor: 'var(--color-surface-1)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-xl)', zIndex: 60, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--color-hairline-soft)' }}>
                          <span className="text-body-sm" style={{ fontWeight: 600, color: 'var(--color-ink)' }}>Notifications</span>
                          {unreadCount > 0 && <button onClick={markAllRead} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--text-micro-size)', color: 'var(--color-accent-blue)' }}>Mark all read</button>}
                        </div>
                        <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                          {notifications.length === 0 ? <p className="text-caption" style={{ color: 'var(--color-ink-muted)', textAlign: 'center', padding: 16 }}>No notifications</p> :
                            notifications.slice(0, 10).map(n => (
                              <div key={n.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--color-hairline-soft)', backgroundColor: !n.is_read ? 'var(--color-surface-2)' : 'transparent' }}>
                                <p className="text-body-sm" style={{ fontWeight: 600, color: 'var(--color-ink)', marginBottom: 2 }}>{n.title}</p>
                                <p className="text-micro" style={{ color: 'var(--color-ink-muted)' }}>{n.message}</p>
                                <p className="text-micro" style={{ color: 'var(--color-ink-muted)', marginTop: 4 }}>{new Date(n.created_at).toLocaleString('en-IN')}</p>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    )}
                  </div>
                  <button onClick={() => setShowNewProject(!showNewProject)} className="btn-primary" style={{ cursor: 'pointer' }}>+ New Project</button>
                </div>
              </div>
            </div>

            {/* New Project Form */}
            {showNewProject && (
              <form onSubmit={createProject} className="card-template" style={{ padding: '20px 24px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h3 className="text-headline" style={{ color: 'var(--color-ink)', marginBottom: 4 }}>📝 New Project Request</h3>
                <select value={form.service_type} onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))} required className="ks-input" style={{ backgroundColor: 'var(--color-surface-2)', color: 'var(--color-ink)' }}>
                  <option value="">Select Service Type</option>{SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={4} placeholder="Describe your project requirements..." className="ks-input" style={{ resize: 'vertical' }} />
                <input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} min="0" placeholder="Budget (₹) — optional" className="ks-input" />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" disabled={saving} className="btn-primary" style={{ cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>{saving ? '⏳ Submitting…' : '🚀 Submit Request'}</button>
                  <button type="button" onClick={() => setShowNewProject(false)} className="btn-secondary" style={{ cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            )}

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }} className="dash-stats-grid">
              {[
                { icon: '📦', label: 'Total',     value: projects.length, accent: 'var(--color-accent-blue)' },
                { icon: '🔄', label: 'Active',    value: activeCount,     accent: '#fbbf24' },
                { icon: '✅', label: 'Completed', value: completedCount,  accent: 'var(--color-semantic-success)' },
                { icon: '🔔', label: 'Unread',    value: unreadCount,     accent: '#a78bfa' },
              ].map(s => (
                <div key={s.label} className="card-template" style={{ padding: '16px 20px', textAlign: 'center' }}>
                  <p className="text-display-md" style={{ fontFamily: 'var(--font-display)', color: s.accent, marginBottom: 4, lineHeight: 1 }}>{s.value}</p>
                  <p className="text-caption" style={{ color: 'var(--color-ink-muted)' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Tracking Timeline */}
            {currentProject && (
              <div className="card-template" style={{ padding: '20px 24px', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 className="text-headline" style={{ color: 'var(--color-ink)' }}>📍 {currentProject.service_type}</h3>
                  <span className="text-caption" style={{ color: 'var(--color-ink-muted)' }}>{currentProject.progress}%</span>
                </div>
                {currentProject.vendor && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: 12, backgroundColor: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--color-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--color-ink)', flexShrink: 0 }}>{currentProject.vendor.fullname.charAt(0)}</div>
                    <div style={{ flex: 1 }}>
                      <p className="text-body-sm" style={{ color: 'var(--color-ink)', fontWeight: 600 }}>{currentProject.vendor.fullname}</p>
                      {vendorRatings[currentProject.vendor.id] && <p className="text-micro" style={{ color: 'var(--color-ink-muted)' }}>⭐ {vendorRatings[currentProject.vendor.id].avg.toFixed(1)} ({vendorRatings[currentProject.vendor.id].total} reviews)</p>}
                    </div>
                    <button onClick={() => openChat(currentProject.id)} className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px', cursor: 'pointer' }}>💬 Chat</button>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', position: 'relative', gap: 0 }}>
                  <div style={{ position: 'absolute', top: 20, left: '8%', right: '8%', height: 1, backgroundColor: 'var(--color-hairline)' }} />
                  <div style={{ position: 'absolute', top: 20, left: '8%', height: 1, backgroundColor: 'var(--color-accent-blue)', width: `${Math.max(0, (currentStepIdx / (trackingSteps.length - 1)) * 84)}%`, transition: 'width 600ms var(--ease-out)' }} />
                  {trackingSteps.map((step, i) => (
                    <div key={step.key} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                      <div style={{ width: 40, height: 40, margin: '0 auto', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, position: 'relative', zIndex: 1, backgroundColor: i <= currentStepIdx ? 'var(--color-accent-blue)' : 'var(--color-surface-2)', transition: 'background-color 300ms var(--ease-out)' }}>{step.icon}</div>
                      <p className="text-micro" style={{ marginTop: 6, fontWeight: 600, color: i <= currentStepIdx ? 'var(--color-accent-blue)' : 'var(--color-ink-muted)' }}>{step.label}</p>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, width: '100%', height: 4, backgroundColor: 'var(--color-surface-2)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${currentProject.progress}%`, backgroundColor: 'var(--color-accent-blue)', borderRadius: 2, transition: 'width 600ms var(--ease-out)' }} />
                </div>
              </div>
            )}

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto' }} className="scrollbar-none">
              {(['all','active','completed','pending'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`tab-pill${filter === f ? ' active' : ''}`} style={{ whiteSpace: 'nowrap' }}>
                  {f === 'all' ? `All (${projects.length})` : f === 'active' ? `Active (${activeCount})` : f === 'completed' ? `Completed (${completedCount})` : `Pending (${projects.filter(p => p.status === 'pending').length})`}
                </button>
              ))}
            </div>

            {/* Projects */}
            <div className="card-template" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-hairline-soft)' }}><h3 className="text-headline" style={{ color: 'var(--color-ink)' }}>📋 My Projects</h3></div>
              {filtered.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}><p style={{ fontSize: 36, marginBottom: 10 }}>📭</p><p className="text-body" style={{ color: 'var(--color-ink-muted)' }}>No projects found</p></div>
              ) : (
                <div>
                  {filtered.map(p => (
                    <div key={p.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-hairline-soft)', transition: 'background-color var(--dur-fast) var(--ease-out)' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface-2)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div>
                          <h4 className="text-body-sm" style={{ color: 'var(--color-ink)', fontWeight: 600 }}>{p.service_type}</h4>
                          <p className="text-micro" style={{ color: 'var(--color-ink-muted)', marginTop: 2 }}>{new Date(p.created_at).toLocaleDateString('en-IN')}</p>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 'var(--radius-pill)', letterSpacing: '0.03em', backgroundColor: p.status === 'completed' ? '#0d1f17' : p.status === 'cancelled' ? '#1a0808' : p.status === 'pending' ? '#1a1200' : '#0d1020', color: p.status === 'completed' ? '#22c55e' : p.status === 'cancelled' ? '#f87171' : p.status === 'pending' ? '#fde68a' : '#818cf8' }}>{p.status.replace('_', ' ')}</span>
                      </div>
                      <p className="text-body-sm" style={{ color: 'var(--color-ink-muted)', marginBottom: 12, lineHeight: 1.5 }}>{p.description}</p>

                      {p.vendor && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                          <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--color-ink)', flexShrink: 0 }}>{p.vendor.fullname.charAt(0)}</div>
                          <span className="text-micro" style={{ color: 'var(--color-ink-muted)' }}>{p.vendor.fullname}</span>
                          {vendorRatings[p.vendor.id] && <span className="text-micro" style={{ color: '#fbbf24' }}>⭐ {vendorRatings[p.vendor.id].avg.toFixed(1)}</span>}
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span className="text-micro" style={{ color: 'var(--color-ink-muted)' }}>📊 {p.progress}%</span>
                          <span className="text-micro" style={{ color: 'var(--color-ink-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>💰 ₹
                            {p.budget ? (
                              <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{p.budget.toLocaleString('en-IN')}</span>
                            ) : (
                              <input type="number" defaultValue={p.budget ?? ''} min="0" placeholder="Set"
                                onBlur={async e => { const val = e.target.value ? Number(e.target.value) : null; if (val !== p.budget) { await fetch(`/api/projects/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ budget: val }) }); fetchProjects() } }}
                                onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                                className="ks-input" style={{ width: 80, padding: '4px 8px', display: 'inline-block' }} />
                            )}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {p.status === 'completed' && p.vendor && !ratedProjects.has(p.id) && (
                            <button onClick={() => { setRatingProject(p); setRatingValue(0); setReviewText('') }}
                              className="btn-secondary" style={{ fontSize: 12, padding: '6px 10px', cursor: 'pointer' }}>⭐ Rate Vendor</button>
                          )}
                          {p.status === 'completed' && ratedProjects.has(p.id) && (
                            <span className="text-micro" style={{ color: 'var(--color-semantic-success)', padding: '6px 10px' }}>✓ Rated</span>
                          )}
                          <button onClick={() => openChat(p.id)} className="btn-secondary" style={{ fontSize: 12, padding: '6px 10px', cursor: 'pointer', backgroundColor: chatProject === p.id ? 'var(--color-accent-blue)' : undefined, color: chatProject === p.id ? '#fff' : undefined }}>💬 Chat</button>
                        </div>
                      </div>

                      {chatProject === p.id && (
                        <div style={{ marginTop: 12, backgroundColor: 'var(--color-surface-2)', borderRadius: 'var(--radius-lg)', padding: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          {/* Left Column (Tasks & Docs) */}
                          <div className="flex-1 flex flex-col gap-4">
                            <div style={{ flex: 1, backgroundColor: 'var(--color-surface-1)', borderRadius: 'var(--radius-md)', padding: 16, minHeight: 200, overflowY: 'auto', border: '1px solid var(--color-hairline-soft)' }}>
                              <h4 className="text-body-sm" style={{ color: 'var(--color-ink)', fontWeight: 600, marginBottom: 12 }}>📋 Project Tasks</h4>
                              {tasks.length === 0 && <p className="text-micro" style={{ color: 'var(--color-ink-muted)' }}>No tasks assigned yet.</p>}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {tasks.map(t => (
                                  <div key={t.id} style={{ padding: 10, backgroundColor: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                                      <p className="text-body-sm" style={{ color: 'var(--color-ink)', fontWeight: 600 }}>{t.title}</p>
                                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', padding: '2px 6px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--color-hairline)', color: 'var(--color-ink-muted)' }}>{t.status.replace('_', ' ')}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                                      {t.priority === 'high' && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 'var(--radius-pill)', backgroundColor: '#1a0808', color: '#f87171' }}>High Priority</span>}
                                      {t.deadline && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 'var(--radius-pill)', backgroundColor: '#1a1200', color: '#fde68a' }}>Due: {new Date(t.deadline).toLocaleDateString('en-IN')}</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div style={{ flex: 1, backgroundColor: 'var(--color-surface-1)', borderRadius: 'var(--radius-md)', padding: 16, minHeight: 170, overflowY: 'auto', border: '1px solid var(--color-hairline-soft)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                <h4 className="text-body-sm" style={{ color: 'var(--color-ink)', fontWeight: 600 }}>📁 Document Center</h4>
                                <label className="btn-secondary" style={{ fontSize: 11, padding: '4px 10px', cursor: 'pointer' }}>
                                  + Upload
                                  <input type="file" onChange={handleFileUpload} className="" style={{ display: 'none' }} multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,video/mp4,video/webm,video/quicktime" />
                                </label>
                              </div>
                              {messages.filter(m => m.attachment_url).length === 0 && <p className="text-micro" style={{ color: 'var(--color-ink-muted)' }}>No documents uploaded.</p>}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {messages.filter(m => m.attachment_url).map(doc => (
                                  <a key={doc.id} href={doc.attachment_url!} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, backgroundColor: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)', textDecoration: 'none', transition: 'border-color var(--dur-fast)', border: '1px solid var(--color-hairline-soft)' }}>
                                    <span style={{ fontSize: 18 }}>{doc.file_type === 'image' ? '🖼️' : '📎'}</span>
                                    <div style={{ minWidth: 0 }}>
                                      <p className="text-body-sm" style={{ color: 'var(--color-ink)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.file_type === 'video' ? 'Video' : 'Document'} by {doc.sender?.fullname}</p>
                                      <p className="text-micro" style={{ color: 'var(--color-ink-muted)' }}>{new Date(doc.created_at).toLocaleDateString('en-IN')}</p>
                                    </div>
                                  </a>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div style={{ flex: 2, minWidth: 280, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface-1)', borderRadius: 'var(--radius-md)', padding: 16, height: 380, border: '1px solid var(--color-hairline-soft)' }}>
                            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }} className="scrollbar-none">
                              {messages.length === 0 && <p className="text-micro" style={{ color: 'var(--color-ink-muted)', textAlign: 'center', padding: '16px 0' }}>No messages yet. Start the conversation!</p>}
                              {messages.map(m => (
                                <div key={m.id} style={{ position: 'relative' }} className="group">
                                  <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', maxWidth: '80%', marginLeft: m.sender?.role === 'customer' ? 'auto' : undefined, backgroundColor: m.sender?.role === 'customer' ? 'rgba(0,153,255,0.15)' : 'var(--color-surface-2)' }}>
                                    <p className="text-micro" style={{ color: 'var(--color-ink-muted)', marginBottom: 4 }}>{m.sender?.fullname} · {new Date(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                                    <p className="text-body-sm" style={{ color: 'var(--color-ink)' }}>{m.content}</p>
                                    {m.attachment_url && <div style={{ marginTop: 8 }}>{m.file_type === 'image' ? <a href={m.attachment_url} target="_blank" rel="noopener noreferrer"><img src={m.attachment_url} alt="" style={{ maxWidth: 180, borderRadius: 'var(--radius-sm)' }} /></a> : m.file_type === 'video' ? <video controls style={{ maxWidth: 220, borderRadius: 'var(--radius-sm)' }}><source src={m.attachment_url} /></video> : <a href={m.attachment_url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ fontSize: 12, display: 'inline-flex' }}>📎 Download</a>}</div>}
                                  </div>
                                  <button onClick={() => deleteMessage(m.id)} disabled={deletingMsg === m.id} style={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: 10, backgroundColor: '#1a0808', color: '#f87171', opacity: 0, transition: 'opacity var(--dur-fast)' }} className="group-hover-show">{deletingMsg === m.id ? '·' : '✕'}</button>
                                </div>
                              ))}
                            </div>
                            {pendingFiles.length > 0 && (
                              <div style={{ padding: 8, backgroundColor: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)', display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 120, overflowY: 'auto', marginBottom: 8 }}>
                                {pendingFiles.map(pf => {
                                  const isVideo = VIDEO_FILE_TYPES.includes(pf.file.type)
                                  const fileExt = pf.file.name.split('.').pop()?.toUpperCase() || 'FILE'
                                  return (
                                    <div key={pf.id} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, padding: 8, backgroundColor: 'var(--color-surface-1)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-hairline)', minWidth: 160, maxWidth: 220 }}>
                                      <span style={{ fontSize: 18 }}>{isVideo ? '🎥' : '📎'}</span>
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <p className="text-micro" style={{ color: 'var(--color-ink)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pf.file.name}</p>
                                        <p className="text-micro" style={{ color: 'var(--color-ink-muted)' }}>{formatFileSize(pf.file.size)} · {fileExt}</p>
                                        {pf.status === 'uploading' && <div style={{ width: '100%', height: 2, backgroundColor: 'var(--color-hairline)', borderRadius: 1, overflow: 'hidden', marginTop: 3 }}><div style={{ height: '100%', width: `${pf.progress}%`, backgroundColor: 'var(--color-accent-blue)', transition: 'width 200ms' }} /></div>}
                                        {pf.status === 'completed' && <span className="text-micro" style={{ color: 'var(--color-semantic-success)' }}>Uploaded</span>}
                                        {pf.status === 'failed' && <span className="text-micro" style={{ color: '#f87171' }}>Failed</span>}
                                      </div>
                                      {!uploading && <button type="button" onClick={() => setPendingFiles(prev => prev.filter(f => f.id !== pf.id))} style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: 9, backgroundColor: '#1a0808', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>}
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                              <input type="file" ref={fileRef} onChange={handleFileUpload} style={{ display: 'none' }} multiple accept="image/*,video/mp4,video/webm,video/quicktime,.pdf,.doc,.docx,.txt,.xls,.xlsx,.zip,.rar" />
                              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-icon" style={{ cursor: 'pointer', fontSize: 18, flexShrink: 0 }}>{uploading ? '⏳' : '📎'}</button>
                              <input value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Type a message…" onKeyDown={e => e.key === 'Enter' && !uploading && sendMessage()} className="ks-input" style={{ flex: 1 }} />
                              <button type="button" onClick={() => sendMessage()} disabled={uploading || (!newMsg.trim() && pendingFiles.length === 0)} className="btn-primary" style={{ cursor: 'pointer', opacity: (uploading || (!newMsg.trim() && pendingFiles.length === 0)) ? 0.5 : 1 }}>Send</button>
                            </div>
                            {uploadSummary && <p className="text-micro" style={{ color: 'var(--color-ink-muted)', marginTop: 6 }}>{uploadSummary}</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {invoicesLoaded && invoices.length > 0 && (
              <div className="card-template" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-hairline-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 className="text-headline" style={{ color: 'var(--color-ink)' }}>🧾 My Invoices</h3>
                  <p className="text-micro" style={{ color: 'var(--color-ink-muted)' }}>{invoices.length} invoice(s)</p>
                </div>
                <div>
                  {invoices.map(inv => (
                    <div key={inv.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-hairline-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                      <div>
                        <p className="text-body-sm" style={{ color: 'var(--color-ink)', fontWeight: 600, fontFamily: 'monospace' }}>{inv.invoice_number}</p>
                        <p className="text-micro" style={{ color: 'var(--color-ink-muted)', marginTop: 2 }}>{inv.project?.service_type || 'Service'} · {new Date(inv.created_at).toLocaleDateString('en-IN')}</p>
                        {inv.due_date && <p className="text-micro" style={{ color: 'var(--color-ink-muted)' }}>Due: {new Date(inv.due_date).toLocaleDateString('en-IN')}</p>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 'var(--radius-pill)', backgroundColor: inv.status === 'paid' ? '#0d1f17' : inv.status === 'overdue' ? '#1a0808' : '#1a1200', color: inv.status === 'paid' ? '#22c55e' : inv.status === 'overdue' ? '#f87171' : '#fde68a' }}>
                          {inv.status === 'paid' ? '✅ Paid' : inv.status === 'overdue' ? '⚠ Overdue' : '⏳ Pending'}
                        </span>
                        <p className="text-headline" style={{ color: 'var(--color-ink)' }}>₹{inv.total.toLocaleString('en-IN')}</p>
                        {inv.status !== 'paid' && (
                          <PaymentButton
                            amount={inv.total}
                            invoiceId={inv.id}
                            label={`Pay ₹${inv.total.toLocaleString('en-IN')}`}
                            description={`Invoice ${inv.invoice_number}`}
                            onSuccess={() => fetchInvoices()}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 20 }} className="dash-qa-grid">
              {[
                { icon: '📝', label: 'New Project', onClick: () => setShowNewProject(true), href: undefined },
                { icon: '🎧', label: 'Chat Support', onClick: () => setShowDMPanel(v => !v), href: undefined },
                { icon: '💬', label: 'WhatsApp', onClick: undefined, href: 'https://wa.me/918595025753' },
                { icon: '🛍️', label: 'Services', onClick: undefined, href: '/services' },
              ].map(qa => (
                qa.href ? (
                  <a key={qa.label} href={qa.href} target={qa.href.startsWith('http') ? '_blank' : undefined} rel={qa.href.startsWith('http') ? 'noopener noreferrer' : undefined} className="card-template" style={{ padding: 20, textAlign: 'center', textDecoration: 'none', display: 'block', cursor: 'pointer' }}>
                    <p style={{ fontSize: 28, marginBottom: 8 }}>{qa.icon}</p>
                    <p className="text-body-sm" style={{ color: 'var(--color-ink-muted)', fontWeight: 600 }}>{qa.label}</p>
                  </a>
                ) : (
                  <button key={qa.label} onClick={qa.onClick!} className="card-template" style={{ padding: 20, textAlign: 'center', cursor: 'pointer', border: 'none', width: '100%' }}>
                    <p style={{ fontSize: 28, marginBottom: 8 }}>{qa.icon}</p>
                    <p className="text-body-sm" style={{ color: 'var(--color-ink-muted)', fontWeight: 600 }}>{qa.label}</p>
                  </button>
                )
              ))}
            </div>

      {ratingProject && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setRatingProject(null)}>
          <div onClick={e => e.stopPropagation()} className="card-template" style={{ width: '100%', maxWidth: 400, padding: 24, boxShadow: 'var(--shadow-level-2)' }}>
            <h3 className="text-headline" style={{ color: 'var(--color-ink)', marginBottom: 4 }}>⭐ Rate Your Vendor</h3>
            <p className="text-body-sm" style={{ color: 'var(--color-ink-muted)', marginBottom: 20 }}>{ratingProject.service_type} — {ratingProject.vendor?.fullname}</p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><StarRating value={ratingValue} onChange={setRatingValue} /></div>
            <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} rows={3} placeholder="Share your experience (optional)…" className="ks-input" style={{ resize: 'vertical', marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={submitRating} disabled={!ratingValue || ratingSubmitting} className="btn-primary" style={{ flex: 1, justifyContent: 'center', cursor: 'pointer', opacity: (!ratingValue || ratingSubmitting) ? 0.5 : 1 }}>{ratingSubmitting ? '⏳ Submitting…' : '🚀 Submit Rating'}</button>
              <button onClick={() => setRatingProject(null)} className="btn-secondary" style={{ cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showDMPanel && user && (
        <DirectChatPanel currentUserId={user.id} mode="user" onClose={() => setShowDMPanel(false)} />
      )}
    </>
  )
}
