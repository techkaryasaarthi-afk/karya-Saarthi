'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DirectChatPanel from '@/components/admin/DirectChatPanel'
import { fetchWithAuth } from '@/lib/auth/fetchWithAuth'

interface Project { id: number; service_type: string; description: string; status: string; progress: number; budget: number | null; created_at: string; client: { id: number; fullname: string; email: string } | null }
interface Message { id: number; content: string; attachment_url: string | null; file_type: string | null; created_at: string; sender: { id: number; fullname: string; role: string } | null }
interface Rating { id: number; rating: number; review: string | null; created_at: string; customer: { id: number; fullname: string } | null; project: { id: number; service_type: string } | null }
interface Notification { id: number; type: string; title: string; message: string; is_read: boolean; created_at: string }
interface Task { id: number; title: string; assignee: string | null; deadline: string | null; priority: 'low' | 'medium' | 'high'; status: 'todo' | 'in_progress' | 'review' | 'done'; created_at: string }
interface EarningsData {
  totalEarned: number
  totalPayments: number
  pendingAmount: number
  completedProjects: number
}
interface EarningsMonth { month: string; amount: number; count: number }
interface Payment { id: number; amount: number; status: string; created_at: string; razorpay_payment_id: string; description: string }

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

const statusColors: Record<string, { bg: string; color: string }> = {
  assigned: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' },
  in_progress: { bg: 'rgba(6, 182, 212, 0.1)', color: '#06B6D4' },
  review: { bg: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' },
  delivered: { bg: 'rgba(20, 184, 166, 0.1)', color: '#14B8A6' },
  completed: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' },
  pending: { bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' },
}

function StarDisplay({ value }: { value: number }) {
  return <span style={{ fontSize: 14 }}>{Array.from({ length: 5 }, (_, i) => <span key={i} style={{ opacity: i < value ? 1 : 0.25 }}>⭐</span>)}</span>
}

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState<'projects' | 'earnings' | 'reviews'>('projects')
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<number | null>(null)
  const [chatProject, setChatProject] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadSummary, setUploadSummary] = useState('')
  const [deletingMsg, setDeletingMsg] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploadingProject, setUploadingProject] = useState<number | null>(null)
  const projectFileRef = useRef<HTMLInputElement>(null)
  const [filter, setFilter] = useState<'all'|'active'|'completed'>('all')
  const [ratings, setRatings] = useState<Rating[]>([])
  const [avgRating, setAvgRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifs, setShowNotifs] = useState(false)
  const [showDMPanel, setShowDMPanel] = useState(false)
  const [currentVendorUserId, setCurrentVendorUserId] = useState<number>(0)
  const [earnings, setEarnings] = useState<EarningsData | null>(null)
  const [earningsMonthly, setEarningsMonthly] = useState<EarningsMonth[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [pendingFiles, setPendingFiles] = useState<{ file: File; id: string; progress: number; status: 'pending' | 'uploading' | 'completed' | 'failed' }[]>([])

  const fetchProjects = async () => { const r = await fetch('/api/projects'); const d = await r.json(); setProjects(d.projects || []); setLoading(false) }
  const fetchNotifications = useCallback(async () => { const r = await fetchWithAuth('/api/notifications'); if (r.ok) { const d = await r.json(); setNotifications(d.notifications || []); setUnreadCount(d.unread || 0) } }, [])

  const fetchRatings = async () => {
    // Get current user ID first
    const meRes = await fetch('/api/auth/me')
    if (!meRes.ok) return
    const me = await meRes.json()
    const r = await fetch(`/api/ratings?vendorId=${me.id}`)
    if (r.ok) { const d = await r.json(); setRatings(d.ratings || []); setAvgRating(d.average || 0); setTotalReviews(d.total || 0) }
  }

  const fetchEarnings = useCallback(async () => {
    try {
      const r = await fetch('/api/vendor/earnings')
      if (r.ok) { const d = await r.json(); setEarnings(d.earnings); setEarningsMonthly(d.monthly || []); setPayments(d.payments || []) }
    } catch {}
  }, [])

  useEffect(() => { fetchProjects(); fetchRatings(); fetchNotifications(); fetchEarnings() }, [fetchEarnings])
  useEffect(() => { const i = setInterval(fetchNotifications, 15000); return () => clearInterval(i) }, [fetchNotifications])

  // Get current user id
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setCurrentVendorUserId(d.id || 0))
  }, [])

  const updateProject = async (id: number, updates: Record<string, unknown>) => {
    setActionId(id); await fetch(`/api/projects/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) })
    setActionId(null); fetchProjects()
  }

  // Chat
  const openChat = async (pid: number) => { 
    setChatProject(chatProject === pid ? null : pid); 
    if (chatProject !== pid) {
      const r = await fetch(`/api/projects/${pid}/messages`); const d = await r.json(); setMessages(d.messages || []);
      const t = await fetch(`/api/admin/projects/tasks?project_id=${pid}`); const td = await t.json(); setTasks(td.tasks || []);
    }
  }
  const updateTaskStatus = async (id: number, status: Task['status']) => {
    setTasks(p => p.map(t => t.id === id ? { ...t, status } : t))
    await fetch('/api/admin/projects/tasks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
  }
  const refreshChat = async () => { if (!chatProject) return; const r = await fetch(`/api/projects/${chatProject}/messages`); const d = await r.json(); setMessages(d.messages || []) }
  useEffect(() => { if (!chatProject) return; const i = setInterval(refreshChat, 5000); return () => clearInterval(i) }, [chatProject])
  const handleChatFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // File upload for project delivery
  const handleProjectFile = async (e: React.ChangeEvent<HTMLInputElement>, projectId: number) => {
    const file = e.target.files?.[0]; if (!file) return; setUploadingProject(projectId)
    const fd = new FormData(); fd.append('file', file)
    try {
      const r = await fetch('/api/upload', { method: 'POST', body: fd }); const d = await r.json()
      if (d.url) { await fetch(`/api/projects/${projectId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: `📁 File uploaded: ${file.name}`, attachment_url: d.url, file_type: d.file_type }) }) }
    } catch {}
    setUploadingProject(null); if (projectFileRef.current) projectFileRef.current.value = ''
  }

  const markAllRead = async () => { await fetchWithAuth('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAllRead: true }) }); fetchNotifications() }

  const filtered = projects.filter(p => {
    if (filter === 'active') return !['completed', 'cancelled'].includes(p.status)
    if (filter === 'completed') return p.status === 'completed'
    return true
  })
  const active = projects.filter(p => !['completed', 'cancelled'].includes(p.status))
  const completed = projects.filter(p => p.status === 'completed')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="text-display-md" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>🏪 Vendor Dashboard</h1>
          <p className="text-body-sm" style={{ color: 'var(--color-ink-muted)', marginTop: 4 }}>Your assigned projects & ratings</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }} className="vendor-header-actions">
          <div style={{ position: 'relative' }}>
            <button onClick={() => { const opening = !showNotifs; setShowNotifs(opening); if (opening && unreadCount > 0) markAllRead() }} style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
              🔔 {unreadCount > 0 && <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', backgroundColor: '#ef4444', color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount}</span>}
            </button>
            <AnimatePresence>{showNotifs && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                className="card-template" style={{ position: 'absolute', right: 0, top: 48, width: 320, zIndex: 50, padding: 0, overflow: 'hidden', border: '1px solid var(--color-hairline-soft)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--color-hairline-soft)' }}>
                  <h4 className="text-body-sm" style={{ fontWeight: 600, color: 'var(--color-ink)' }}>Notifications</h4>
                  {unreadCount > 0 && <button onClick={markAllRead} style={{ fontSize: 12, color: 'var(--color-accent-blue)', background: 'none', border: 'none', cursor: 'pointer' }}>Mark all read</button>}
                </div>
                <div style={{ maxHeight: 256, overflowY: 'auto' }}>
                  {notifications.length === 0 ? <p className="text-body-sm" style={{ padding: 16, color: 'var(--color-ink-muted)', textAlign: 'center' }}>No notifications</p> :
                    notifications.slice(0, 10).map(n => (
                      <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-hairline-soft)', backgroundColor: !n.is_read ? 'rgba(0,153,255,0.05)' : 'transparent' }}>
                        <p className="text-body-sm" style={{ fontWeight: 500, color: 'var(--color-ink)' }}>{n.title}</p>
                        <p className="text-micro" style={{ color: 'var(--color-ink-muted)', marginTop: 2 }}>{n.message}</p>
                        <p className="text-micro" style={{ color: 'var(--color-ink-muted)', marginTop: 4 }}>{new Date(n.created_at).toLocaleString('en-IN')}</p>
                      </div>
                    ))
                  }
                </div>
              </motion.div>
            )}</AnimatePresence>
          </div>
          <button
            onClick={() => setShowDMPanel(v => !v)}
            className={showDMPanel ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '10px 16px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            💬 Chat Support
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { icon: '📋', label: 'Total', value: projects.length, color: '#3B82F6' },
          { icon: '🔄', label: 'Active', value: active.length, color: '#06B6D4' },
          { icon: '✅', label: 'Completed', value: completed.length, color: '#22C55E' },
          { icon: '⭐', label: 'Avg Rating', value: avgRating > 0 ? avgRating.toFixed(1) : '—', color: '#F59E0B' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="card-template" style={{ padding: 20 }}>
            <span style={{ fontSize: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-surface-2)' }}>{s.icon}</span>
            <h3 className="text-display-md" style={{ fontFamily: 'var(--font-display)', color: s.color, marginTop: 12 }}>{s.value}</h3>
            <p className="text-caption" style={{ color: 'var(--color-ink-muted)', marginTop: 4 }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--color-hairline-soft)', paddingBottom: 0, overflowX: 'auto' }} className="scrollbar-none">
        {(['projects', 'earnings', 'reviews'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px', fontSize: 14, fontWeight: 700, textTransform: 'capitalize', cursor: 'pointer', border: 'none', background: 'none', whiteSpace: 'nowrap',
              borderBottom: activeTab === tab ? '2px solid var(--color-accent-blue)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--color-accent-blue)' : 'var(--color-ink-muted)',
              transition: 'color var(--dur-fast), border-color var(--dur-fast)'
            }}>
            {tab === 'projects' ? '📋' : tab === 'earnings' ? '💰' : '⭐'} {tab}
          </button>
        ))}
      </div>

      {/* Projects Tab Filter */}
      {activeTab === 'projects' && (
        <div style={{ display: 'flex', gap: 8 }}>
          {(['all','active','completed'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} 
              className={filter === f ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 16px', fontSize: 12, fontWeight: 600, borderRadius: 'var(--radius-pill)', textTransform: 'capitalize', cursor: 'pointer' }}>
              {f === 'all' ? `All (${projects.length})` : f === 'active' ? `Active (${active.length})` : `Completed (${completed.length})`}
            </button>
          ))}
        </div>
      )}

      {/* Projects */}
      {activeTab === 'projects' && (
        <>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 128, borderRadius: 'var(--radius-lg)' }} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="card-template" style={{ padding: 40, textAlign: 'center' }}><span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>📋</span><p className="text-body-sm" style={{ color: 'var(--color-ink-muted)' }}>No projects found</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map(p => {
              const sc = statusColors[p.status] || { bg: 'var(--color-surface-2)', color: 'var(--color-ink)' }
              return (
              <div key={p.id} className="card-template" style={{ padding: 24, transition: 'box-shadow var(--dur-fast)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h3 className="text-headline" style={{ color: 'var(--color-ink)', fontWeight: 700 }}>{p.service_type}</h3>
                    <p className="text-body-sm" style={{ color: 'var(--color-ink-muted)', marginTop: 4 }}>{p.description}</p>
                    <p className="text-micro" style={{ color: 'var(--color-ink-muted)', marginTop: 6 }}>Client: {p.client?.fullname || 'N/A'} · {new Date(p.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                  <span style={{ padding: '4px 12px', borderRadius: 'var(--radius-pill)', fontSize: 11, fontWeight: 700, backgroundColor: sc.bg, color: sc.color, textTransform: 'capitalize' }}>
                    {p.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Progress */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}><span style={{ color: 'var(--color-ink-muted)' }}>Progress</span><span style={{ fontWeight: 700, color: 'var(--color-ink)' }}>{p.progress}%</span></div>
                  <input type="range" min="0" max="100" value={p.progress} onChange={e => updateProject(p.id, { progress: Number(e.target.value) })} style={{ width: '100%', height: 6, borderRadius: 'var(--radius-pill)', appearance: 'none', backgroundColor: 'var(--color-surface-2)', cursor: 'pointer' }} />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {p.status === 'assigned' && <button onClick={() => updateProject(p.id, { status: 'in_progress', progress: 10 })} disabled={actionId === p.id} className="btn-secondary" style={{ color: '#3B82F6', borderColor: '#3B82F6', cursor: 'pointer' }}>🚀 Start</button>}
                  {p.status === 'in_progress' && <button onClick={() => updateProject(p.id, { status: 'review' })} disabled={actionId === p.id} className="btn-secondary" style={{ color: '#A855F7', borderColor: '#A855F7', cursor: 'pointer' }}>🔍 Review</button>}
                  {p.status === 'review' && <button onClick={() => updateProject(p.id, { status: 'delivered', progress: 100 })} disabled={actionId === p.id} className="btn-secondary" style={{ color: '#14B8A6', borderColor: '#14B8A6', cursor: 'pointer' }}>📦 Deliver</button>}

                  {/* Project File Upload */}
                  <input type="file" ref={projectFileRef} onChange={e => handleProjectFile(e, p.id)} style={{ display: 'none' }} accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.zip,.rar" />
                  <button onClick={() => projectFileRef.current?.click()} disabled={uploadingProject === p.id}
                    className="btn-secondary" style={{ color: '#F59E0B', borderColor: '#F59E0B', cursor: 'pointer' }}>
                    {uploadingProject === p.id ? '⏳ Uploading...' : '📁 Upload File'}
                  </button>

                  <button onClick={() => openChat(p.id)} className={chatProject === p.id ? "btn-primary" : "btn-secondary"} style={{ cursor: 'pointer' }}>💬 Chat</button>
                </div>

                {/* Extra Panel (Tasks & Chat) */}
                {chatProject === p.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: 16, backgroundColor: 'var(--color-surface-1)', borderRadius: 'var(--radius-lg)', padding: 16, gap: 16, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: 16, flexDirection: window.innerWidth < 1024 ? 'column' : 'row' }}>
                      {/* Tasks Section */}
                      <div style={{ flex: 1, backgroundColor: 'var(--color-surface-2)', padding: 16, borderRadius: 'var(--radius-md)', height: 400, overflowY: 'auto' }}>
                        <h4 className="text-body-sm" style={{ fontWeight: 700, color: 'var(--color-ink)', marginBottom: 12 }}>📋 Project Tasks</h4>
                        {tasks.length === 0 && <p className="text-micro" style={{ color: 'var(--color-ink-muted)' }}>No tasks assigned yet.</p>}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {tasks.map(t => (
                            <div key={t.id} style={{ padding: 12, backgroundColor: 'var(--color-surface-1)', border: '1px solid var(--color-hairline-soft)', borderRadius: 'var(--radius-md)' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <p className="text-body-sm" style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{t.title}</p>
                                <select value={t.status} onChange={e => updateTaskStatus(t.id, e.target.value as Task['status'])} className="ks-input" style={{ padding: '2px 8px', fontSize: 10, textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }}>
                                  <option value="todo">To-Do</option><option value="in_progress">In Progress</option><option value="review">Review</option><option value="done">Done</option>
                                </select>
                              </div>
                              <div style={{ display: 'flex', gap: 8, marginTop: 8, fontSize: 10, fontWeight: 700 }}>
                                {t.priority === 'high' && <span style={{ color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}>High Priority</span>}
                                {t.deadline && <span style={{ color: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}>Due: {new Date(t.deadline).toLocaleDateString('en-IN')}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Chat Section */}
                      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface-2)', padding: 16, borderRadius: 'var(--radius-md)', height: 400 }}>
                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12, paddingRight: 8 }}>
                          {messages.length === 0 && <p className="text-body-sm" style={{ color: 'var(--color-ink-muted)', textAlign: 'center', padding: 16 }}>No messages yet</p>}
                        {messages.map(m => (
                          <div key={m.id} style={{ position: 'relative' }} className="group">
                            <div style={{ padding: 12, borderRadius: 'var(--radius-md)', fontSize: 14, maxWidth: '80%', marginLeft: m.sender?.role === 'vendor' ? 'auto' : '0', backgroundColor: m.sender?.role === 'vendor' ? 'rgba(0,153,255,0.1)' : 'var(--color-surface-1)', color: 'var(--color-ink)' }}>
                              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-ink-muted)', marginBottom: 4 }}>{m.sender?.fullname} <span style={{ fontSize: 10, color: 'var(--color-hairline)', marginLeft: 8 }}>{new Date(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></p>
                              <p>{m.content}</p>
                              {m.attachment_url && <div style={{ marginTop: 8 }}>{m.file_type === 'image' ? <a href={m.attachment_url} target="_blank" rel="noopener noreferrer"><img src={m.attachment_url} alt="" style={{ maxWidth: 180, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-hairline-soft)' }} /></a> : m.file_type === 'video' ? <video controls style={{ maxWidth: 220, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-hairline-soft)' }}><source src={m.attachment_url} /></video> : <a href={m.attachment_url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>📎 Download</a>}</div>}
                            </div>
                            <button onClick={() => deleteMessage(m.id)} disabled={deletingMsg === m.id} style={{ position: 'absolute', top: 4, right: 4, opacity: 0, color: '#f87171', background: 'var(--color-surface-1)', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer' }} className="group-hover-opacity-100 transition-opacity">{deletingMsg === m.id ? '·' : '✕'}</button>
                          </div>
                        ))}
                        </div>
                        {/* Pending Attachments Tray */}
                        {pendingFiles.length > 0 && (
                          <div style={{ padding: 12, backgroundColor: 'var(--color-surface-1)', borderTop: '1px solid var(--color-hairline-soft)', borderRadius: '12px 12px 0 0', display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: 160, overflowY: 'auto' }}>
                            {pendingFiles.map(pf => {
                              const isVideo = VIDEO_FILE_TYPES.includes(pf.file.type)
                              const fileExt = pf.file.name.split('.').pop()?.toUpperCase() || 'FILE'
                              return (
                                <div key={pf.id} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, padding: 8, backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-hairline-soft)', borderRadius: 'var(--radius-md)', minWidth: 200, maxWidth: 250 }}>
                                  <div style={{ fontSize: 20 }}>{isVideo ? '🎥' : '📎'}</div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pf.file.name}</p>
                                    <p style={{ fontSize: 10, color: 'var(--color-ink-muted)' }}>{formatFileSize(pf.file.size)} • {fileExt}</p>
                                    {pf.status === 'uploading' && (
                                      <div style={{ width: '100%', backgroundColor: 'var(--color-hairline)', height: 4, borderRadius: 'var(--radius-pill)', marginTop: 4, overflow: 'hidden' }}>
                                        <div style={{ backgroundColor: 'var(--color-accent-blue)', height: '100%', transition: 'width 300ms', width: `${pf.progress}%` }} />
                                      </div>
                                    )}
                                    {pf.status === 'completed' && <span style={{ fontSize: 9, color: '#22c55e', fontWeight: 700 }}>Uploaded</span>}
                                    {pf.status === 'failed' && <span style={{ fontSize: 9, color: '#ef4444', fontWeight: 700, fontFamily: 'monospace' }}>Failed</span>}
                                  </div>
                                  {!uploading && (
                                    <button
                                      type="button"
                                      onClick={() => setPendingFiles(prev => prev.filter(f => f.id !== pf.id))}
                                      style={{ position: 'absolute', top: -4, right: -4, backgroundColor: '#fca5a5', color: '#991b1b', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, border: 'none', cursor: 'pointer' }}
                                    >✕</button>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                          <input type="file" ref={fileRef} onChange={handleChatFileUpload} style={{ display: 'none' }} multiple accept="image/*,video/mp4,video/webm,video/quicktime,.pdf,.doc,.docx,.txt,.xls,.xlsx,.zip,.rar" />
                          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-secondary" style={{ padding: '10px 14px', fontSize: 18, cursor: 'pointer' }}>{uploading ? '⏳' : '📎'}</button>
                          <input value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Type a message..." onKeyDown={e => e.key === 'Enter' && !uploading && sendMessage()} className="ks-input" style={{ flex: 1, backgroundColor: 'var(--color-surface-1)' }} />
                          <button type="button" onClick={() => sendMessage()} disabled={uploading || (!newMsg.trim() && pendingFiles.length === 0)} className="btn-primary" style={{ padding: '10px 20px', cursor: 'pointer', opacity: (uploading || (!newMsg.trim() && pendingFiles.length === 0)) ? 0.5 : 1 }}>Send</button>
                        </div>
                        {uploadSummary && <p style={{ marginTop: 8, fontSize: 11, color: 'var(--color-ink-muted)' }}>{uploadSummary}</p>}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              )
            })}
          </div>
        )}
        </>
      )}

      {/* Earnings Tab */}
      {activeTab === 'earnings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { label: 'Total Earned', value: `₹${(earnings?.totalEarned || 0).toLocaleString('en-IN')}`, icon: '💰', color: '#10B981' },
              { label: 'Released', value: `₹${(earnings?.totalPayments || 0).toLocaleString('en-IN')}`, icon: '✅', color: '#3B82F6' },
              { label: 'Pending', value: `₹${(earnings?.pendingAmount || 0).toLocaleString('en-IN')}`, icon: '⏳', color: '#F59E0B' },
              { label: 'Completed', value: earnings?.completedProjects || 0, icon: '📋', color: '#8B5CF6' },
            ].map(k => (
              <div key={k.label} className="card-template" style={{ padding: 20 }}>
                <span style={{ fontSize: 20 }}>{k.icon}</span>
                <p className="text-display-md" style={{ fontFamily: 'var(--font-display)', color: k.color, marginTop: 8 }}>{k.value}</p>
                <p className="text-caption" style={{ color: 'var(--color-ink-muted)' }}>{k.label}</p>
              </div>
            ))}
          </div>
          {/* Monthly */}
          {earningsMonthly.length > 0 && (
            <div className="card-template" style={{ padding: 24 }}>
              <h3 className="text-headline" style={{ fontWeight: 700, color: 'var(--color-ink)', marginBottom: 20 }}>📊 Monthly Earnings</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 120 }}>
                {earningsMonthly.map((m, i) => {
                  const maxAmt = Math.max(...earningsMonthly.map(x => x.amount), 1)
                  const pct = (m.amount / maxAmt) * 100
                  return (
                    <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <p style={{ fontSize: 10, color: 'var(--color-ink-muted)', fontWeight: 700 }}>₹{m.amount > 0 ? m.amount.toLocaleString('en-IN') : 0}</p>
                      <div style={{ width: '100%', borderRadius: '8px 8px 0 0', height: `${Math.max(pct, 4)}%`, background: i % 2 === 0 ? 'var(--color-accent-blue)' : '#F59E0B', minHeight: 4 }} />
                      <span style={{ fontSize: 10, color: 'var(--color-ink-muted)' }}>{m.month}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {/* Payment History */}
          <div className="card-template" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--color-hairline-soft)' }}><h3 className="text-headline" style={{ fontWeight: 700, color: 'var(--color-ink)' }}>💳 Payment History</h3></div>
            {payments.length === 0 ? (
              <p style={{ padding: 32, textAlign: 'center', color: 'var(--color-ink-muted)', fontSize: 14 }}>No payments received yet</p>
            ) : (
              <div>
                {payments.map(p => (
                  <div key={p.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-hairline-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p className="text-body-sm" style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{p.description || 'Project Payment'}</p>
                      <p className="text-micro" style={{ color: 'var(--color-ink-muted)' }}>{new Date(p.created_at).toLocaleDateString('en-IN')} · {p.razorpay_payment_id || '—'}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 700, color: '#16a34a' }}>₹{(p.amount || 0).toLocaleString('en-IN')}</p>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(22, 163, 74, 0.1)', color: '#16a34a' }}>captured</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ratings.length === 0 ? (
            <div className="card-template" style={{ padding: 40, textAlign: 'center' }}>
              <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>⭐</span>
              <p className="text-body-sm" style={{ color: 'var(--color-ink-muted)' }}>No reviews yet. Complete projects to receive feedback!</p>
            </div>
          ) : (
            ratings.map(r => (
              <div key={r.id} className="card-template" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StarDisplay value={r.rating} />
                    <span className="text-micro" style={{ color: 'var(--color-ink-muted)' }}>by {r.customer?.fullname || 'Customer'}</span>
                  </div>
                  <span className="text-micro" style={{ color: 'var(--color-ink-muted)' }}>{new Date(r.created_at).toLocaleDateString('en-IN')}</span>
                </div>
                {r.review && <p className="text-body-sm" style={{ color: 'var(--color-ink)', marginTop: 4 }}>{r.review}</p>}
                <p className="text-micro" style={{ color: 'var(--color-ink-muted)', marginTop: 8 }}>📋 {r.project?.service_type || 'Project'}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Direct Messages (Support Chat) */}
      <AnimatePresence>
        {showDMPanel && currentVendorUserId > 0 && (
          <DirectChatPanel
            currentUserId={currentVendorUserId}
            mode="user"
            onClose={() => setShowDMPanel(false)}
          />
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 640px) {
          .vendor-header-actions { flex-wrap: wrap; gap: 8px !important; }
        }
      `}</style>
    </div>
  )
}
