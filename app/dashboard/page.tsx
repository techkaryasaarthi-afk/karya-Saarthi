'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Suspense, useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DirectChatPanel from '@/components/admin/DirectChatPanel'
import { fetchWithAuth } from '@/lib/auth/fetchWithAuth'
import PaymentButton from '@/components/PaymentButton'
import ProjectGroupChat from '@/components/ProjectGroupChat'

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
  const [chatLoading, setChatLoading] = useState(false)
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
    if (chatProject === projectId) {
      setChatProject(null);
    } else {
      setChatProject(projectId); 
      setChatLoading(true);
      try {
        const r = await fetch(`/api/projects/${projectId}/messages`); const d = await r.json(); setMessages(d.messages || []);
        const t = await fetch(`/api/admin/projects/tasks?project_id=${projectId}`); const td = await t.json(); setTasks(td.tasks || []);
      } finally {
        setChatLoading(false);
      }
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
      {isPending && user?.role === 'pending_admin' && (
        <div style={{ background:'#1a1200',border:'1px solid #78350f',borderRadius:12,padding:'12px 18px',marginBottom:16 }}>
          <p className="text-body-sm" style={{ color:'#fde68a' }}>⏳ Admin Access Pending — awaiting Super Admin approval.</p>
        </div>
      )}

      {/* HERO */}
      <div style={{ background:'linear-gradient(135deg,#3d2a9e 0%,#6a4cf5 60%,#7c3aed 100%)',borderRadius:20,padding:'28px 28px',marginBottom:20,position:'relative',overflow:'hidden' }}>
        <div style={{ position:'absolute',top:-60,right:-60,width:220,height:220,borderRadius:'50%',background:'rgba(255,255,255,0.04)' }} />
        <div style={{ position:'absolute',bottom:-40,left:40,width:120,height:120,borderRadius:'50%',background:'rgba(255,255,255,0.03)' }} />
        <div style={{ position:'relative',display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16,flexWrap:'wrap' }}>
          <div>
            <p style={{ fontSize:11,color:'rgba(255,255,255,0.5)',marginBottom:6,letterSpacing:'0.08em',textTransform:'uppercase' }}>Dashboard</p>
            <h1 style={{ fontSize:26,fontWeight:700,color:'#fff',letterSpacing:'-0.5px',fontFamily:'var(--font-sora,var(--font-display))',marginBottom:4 }}>{user?.fullname||'User'}</h1>
            <p style={{ fontSize:13,color:'rgba(255,255,255,0.55)' }}>Here's your project overview</p>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:8 }}>
            <div style={{ position:'relative' }}>
              <button onClick={()=>{const o=!showNotifs;setShowNotifs(o);if(o&&unreadCount>0)markAllRead()}} style={{ width:38,height:38,borderRadius:'50%',border:'none',background:'rgba(255,255,255,0.12)',cursor:'pointer',fontSize:16,position:'relative' }}>
                🔔{unreadCount>0&&<span style={{ position:'absolute',top:-2,right:-2,width:14,height:14,borderRadius:'50%',background:'#ef4444',color:'#fff',fontSize:9,display:'flex',alignItems:'center',justifyContent:'center' }}>{unreadCount}</span>}
              </button>
              {showNotifs&&(
                <div style={{ position:'absolute',right:0,top:46,width:300,background:'#1c1c1c',border:'1px solid rgba(255,255,255,0.1)',borderRadius:16,zIndex:60,overflow:'hidden' }}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-body-sm" style={{ fontWeight:600,color:'#fff' }}>Notifications</span>
                    {unreadCount>0&&<button onClick={markAllRead} style={{ background:'none',border:'none',cursor:'pointer',fontSize:12,color:'var(--color-accent-blue)' }}>Mark all read</button>}
                  </div>
                  <div style={{ maxHeight:240,overflowY:'auto' }}>
                    {notifications.length===0?<p className="text-caption" style={{ color:'var(--color-ink-muted)',textAlign:'center',padding:16 }}>No notifications</p>:
                      notifications.slice(0,10).map(n=>(
                        <div key={n.id} style={{ padding:'10px 16px',borderBottom:'1px solid rgba(255,255,255,0.04)',background:!n.is_read?'rgba(255,255,255,0.02)':'transparent' }}>
                          <p className="text-body-sm" style={{ fontWeight:600,color:'#fff',marginBottom:2 }}>{n.title}</p>
                          <p className="text-micro" style={{ color:'var(--color-ink-muted)' }}>{n.message}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={()=>setShowNewProject(!showNewProject)} style={{ background:'#fff',color:'#000',border:'none',borderRadius:100,padding:'10px 18px',fontSize:13,fontWeight:600,cursor:'pointer',letterSpacing:'-0.1px',whiteSpace:'nowrap' }}>+ New Project</button>
          </div>
        </div>
        <div style={{ display:'flex',gap:24,marginTop:24,flexWrap:'wrap' }}>
          {[{l:'Total',v:projects.length},{l:'Active',v:activeCount},{l:'Completed',v:completedCount},{l:'Unread',v:unreadCount}].map(s=>(
            <div key={s.l} style={{ display:'flex',alignItems:'baseline',gap:6 }}>
              <span style={{ fontSize:22,fontWeight:700,color:'#fff',fontFamily:'var(--font-sora,var(--font-display))' }}>{s.v}</span>
              <span style={{ fontSize:12,color:'rgba(255,255,255,0.45)' }}>{s.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* NEW PROJECT FORM */}
      {showNewProject&&(
        <form onSubmit={createProject} style={{ background:'#141414',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:'22px 24px',marginBottom:20,display:'flex',flexDirection:'column',gap:12 }}>
          <h3 className="text-headline" style={{ color:'#fff',marginBottom:4 }}>New Project Request</h3>
          <select value={form.service_type} onChange={e=>setForm(f=>({...f,service_type:e.target.value}))} required className="ks-input" style={{ background:'#1c1c1c',color:'#fff' }}>
            <option value="">Select Service Type</option>{SERVICE_TYPES.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} required rows={4} placeholder="Describe your requirements…" className="ks-input" style={{ resize:'vertical' }} />
          <input type="number" value={form.budget} onChange={e=>setForm(f=>({...f,budget:e.target.value}))} min="0" placeholder="Budget (₹) — optional" className="ks-input" />
          <div style={{ display:'flex',gap:8 }}>
            <button type="submit" disabled={saving} className="btn-primary" style={{ opacity:saving?0.6:1,cursor:'pointer' }}>{saving?'Submitting…':'Submit Request'}</button>
            <button type="button" onClick={()=>setShowNewProject(false)} className="btn-secondary" style={{ cursor:'pointer' }}>Cancel</button>
          </div>
        </form>
      )}

      {/* PROGRESS TRACKER */}
      {currentProject&&(
        <div style={{ background:'#141414',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:'22px 24px',marginBottom:20 }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:8 }}>
            <div>
              <p style={{ fontSize:11,color:'rgba(255,255,255,0.35)',marginBottom:4,textTransform:'uppercase',letterSpacing:'0.06em' }}>Current Project</p>
              <h3 className="text-headline" style={{ color:'#fff' }}>{currentProject.service_type}</h3>
            </div>
            <span style={{ fontSize:20,fontWeight:700,color:'var(--color-accent-blue)',fontFamily:'var(--font-sora,var(--font-display))' }}>{currentProject.status === 'completed' ? 100 : (currentProject.progress || 0)}%</span>
          </div>
          {currentProject.vendor&&(
            <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:18,padding:'10px 14px',background:'rgba(255,255,255,0.04)',borderRadius:10 }}>
              <div style={{ width:32,height:32,borderRadius:'50%',background:'rgba(0,153,255,0.15)',color:'var(--color-accent-blue)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:12,flexShrink:0 }}>{currentProject.vendor.fullname.charAt(0)}</div>
              <div style={{ flex:1 }}>
                <p className="text-body-sm" style={{ color:'#fff',fontWeight:600 }}>{currentProject.vendor.fullname}</p>
                {vendorRatings[currentProject.vendor.id]&&<p className="text-micro" style={{ color:'rgba(255,255,255,0.35)' }}>⭐ {vendorRatings[currentProject.vendor.id].avg.toFixed(1)} ({vendorRatings[currentProject.vendor.id].total} reviews)</p>}
              </div>
              <button onClick={()=>openChat(currentProject.id)} style={{ background:'rgba(0,153,255,0.1)',border:'1px solid rgba(0,153,255,0.25)',color:'var(--color-accent-blue)',borderRadius:100,padding:'6px 14px',fontSize:12,fontWeight:600,cursor:'pointer' }}>Chat</button>
            </div>
          )}
          <div style={{ display:'flex',alignItems:'center',position:'relative',marginBottom:12 }}>
            <div style={{ position:'absolute',top:16,left:'4%',right:'4%',height:1,background:'rgba(255,255,255,0.07)' }} />
            <div style={{ position:'absolute',top:16,left:'4%',height:1,background:'var(--color-accent-blue)',width:`${Math.max(0,(currentStepIdx/(trackingSteps.length-1))*92)}%`,transition:'width 600ms ease' }} />
            {trackingSteps.map((step,i)=>(
              <div key={step.key} style={{ flex:1,textAlign:'center',position:'relative' }}>
                <div style={{ width:32,height:32,margin:'0 auto',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,position:'relative',zIndex:1,background:i<=currentStepIdx?'var(--color-accent-blue)':'#1c1c1c',border:`1px solid ${i<=currentStepIdx?'var(--color-accent-blue)':'rgba(255,255,255,0.08)'}`,transition:'all 300ms ease' }}>{step.icon}</div>
                <p style={{ marginTop:6,fontSize:10,fontWeight:600,color:i<=currentStepIdx?'var(--color-accent-blue)':'rgba(255,255,255,0.2)' }}>{step.label}</p>
              </div>
            ))}
          </div>
          <div style={{ height:3,background:'rgba(255,255,255,0.06)',borderRadius:2,overflow:'hidden' }}>
            <div style={{ height:'100%',width:`${currentProject.status === 'completed' ? 100 : (currentProject.progress || 0)}%`,background:'linear-gradient(90deg,#6a4cf5,#0099ff)',borderRadius:2,transition:'width 600ms ease' }} />
          </div>
        </div>
      )}

      {/* FILTER TABS */}
      <div style={{ display:'flex',gap:6,marginBottom:16,overflowX:'auto' }} className="scrollbar-none">
        {(['all','active','completed','pending'] as const).map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{ padding:'7px 16px',borderRadius:100,border:'none',cursor:'pointer',fontSize:12,fontWeight:600,whiteSpace:'nowrap',background:filter===f?'#fff':'rgba(255,255,255,0.06)',color:filter===f?'#000':'rgba(255,255,255,0.4)',transition:'all 140ms ease' }}>
            {f==='all'?`All (${projects.length})`:f==='active'?`Active (${activeCount})`:f==='completed'?`Completed (${completedCount})`:`Pending (${projects.filter(p=>p.status==='pending').length})`}
          </button>
        ))}
      </div>

      {/* PROJECTS */}
      <div style={{ background:'#141414',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,marginBottom:20,overflow:'hidden' }}>
        <div style={{ padding:'16px 22px',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <h3 className="text-headline" style={{ color:'#fff' }}>My Projects</h3>
          <span style={{ fontSize:12,color:'rgba(255,255,255,0.25)' }}>{filtered.length} project{filtered.length!==1?'s':''}</span>
        </div>
        {filtered.length===0?(
          <div style={{ padding:'48px 24px',textAlign:'center' }}>
            <p style={{ fontSize:32,marginBottom:10 }}>📫</p>
            <p className="text-body" style={{ color:'var(--color-ink-muted)' }}>No projects found</p>
          </div>
        ):filtered.map(p=>{
          const sc=p.status==='completed'?{bg:'rgba(34,197,94,0.1)',col:'#22c55e'}:p.status==='cancelled'?{bg:'rgba(248,113,113,0.1)',col:'#f87171'}:p.status==='pending'?{bg:'rgba(251,191,36,0.1)',col:'#fbbf24'}:{bg:'rgba(99,102,241,0.1)',col:'#818cf8'}
          return (
            <div key={p.id} style={{ padding:'18px 22px',borderBottom:'1px solid rgba(255,255,255,0.04)',transition:'background 140ms ease' }} onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.015)')} onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
              <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:8 }}>
                <div>
                  <h4 className="text-body-sm" style={{ color:'#fff',fontWeight:600 }}>{p.service_type}</h4>
                  <p className="text-micro" style={{ color:'rgba(255,255,255,0.25)',marginTop:2 }}>{new Date(p.created_at).toLocaleDateString('en-IN')}</p>
                </div>
                <span style={{ fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:100,background:sc.bg,color:sc.col,textTransform:'capitalize',whiteSpace:'nowrap' }}>{p.status.replace('_',' ')}</span>
              </div>
              <p className="text-body-sm" style={{ color:'rgba(255,255,255,0.35)',marginBottom:10,lineHeight:1.5 }}>{p.description}</p>
              {p.vendor&&(
                <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:10 }}>
                  <div style={{ width:20,height:20,borderRadius:'50%',background:'rgba(106,76,245,0.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:'#a78bfa',flexShrink:0 }}>{p.vendor.fullname.charAt(0)}</div>
                  <span className="text-micro" style={{ color:'rgba(255,255,255,0.35)' }}>{p.vendor.fullname}</span>
                  {vendorRatings[p.vendor.id]&&<span className="text-micro" style={{ color:'#fbbf24' }}>⭐ {vendorRatings[p.vendor.id].avg.toFixed(1)}</span>}
                </div>
              )}
              <div style={{ height:3,background:'rgba(255,255,255,0.06)',borderRadius:2,overflow:'hidden',marginBottom:12 }}>
                <div style={{ height:'100%',width:`${p.status === 'completed' ? 100 : (p.progress || 0)}%`,background:'linear-gradient(90deg,#6a4cf5,#0099ff)',borderRadius:2,transition:'width 600ms ease' }} />
              </div>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8 }}>
                <div style={{ display:'flex',gap:12 }}>
                  <span className="text-micro" style={{ color:'rgba(255,255,255,0.25)' }}>{p.status === 'completed' ? 100 : (p.progress || 0)}% complete</span>
                  {p.budget?<span className="text-micro" style={{ color:'rgba(255,255,255,0.25)' }}>₹{p.budget.toLocaleString('en-IN')}</span>:(
                    <span className="text-micro" style={{ color:'rgba(255,255,255,0.25)',display:'flex',alignItems:'center',gap:4 }}>₹<input type="number" defaultValue={p.budget??''} min="0" placeholder="Set" onBlur={async e=>{const val=e.target.value?Number(e.target.value):null;if(val!==p.budget){await fetch(`/api/projects/${p.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({budget:val})});fetchProjects()}}} onKeyDown={e=>{if(e.key==='Enter')(e.target as HTMLInputElement).blur()}} className="ks-input" style={{ width:70,padding:'2px 6px',display:'inline-block' }} /></span>
                  )}
                </div>
                <div style={{ display:'flex',gap:6 }}>
                  {p.status==='completed'&&p.vendor&&!ratedProjects.has(p.id)&&<button onClick={()=>{setRatingProject(p);setRatingValue(0);setReviewText('')}} style={{ background:'rgba(251,191,36,0.1)',border:'1px solid rgba(251,191,36,0.2)',color:'#fbbf24',borderRadius:100,padding:'6px 12px',fontSize:11,fontWeight:600,cursor:'pointer' }}>⭐ Rate</button>}
                  {p.status==='completed'&&ratedProjects.has(p.id)&&<span className="text-micro" style={{ color:'#22c55e',padding:'6px 10px' }}>✓ Rated</span>}
                  <button onClick={()=>openChat(p.id)} style={{ background:chatProject===p.id?'rgba(0,153,255,0.12)':'rgba(255,255,255,0.06)',border:`1px solid ${chatProject===p.id?'rgba(0,153,255,0.3)':'rgba(255,255,255,0.08)'}`,color:chatProject===p.id?'var(--color-accent-blue)':'rgba(255,255,255,0.45)',borderRadius:100,padding:'6px 14px',fontSize:11,fontWeight:600,cursor:'pointer',transition:'all 140ms ease' }}>
                    {chatProject===p.id?'▲ Close':'💬 Team Chat'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {chatProject && (
        <ProjectGroupChat
          projectId={chatProject}
          messages={messages}
          tasks={tasks}
          newMsg={newMsg}
          uploading={uploading}
          uploadSummary={uploadSummary}
          pendingFiles={pendingFiles}
          deletingMsg={deletingMsg}
          senderRole="customer"
          onNewMsg={setNewMsg}
          onSend={sendMessage}
          onDelete={deleteMessage}
          onFileChange={handleFileUpload}
          onRemovePending={id=>setPendingFiles(prev=>prev.filter(f=>f.id!==id))}
          onClose={() => setChatProject(null)}
          loadingChat={chatLoading}
        />
      )}

      {/* INVOICES */}
      {invoicesLoaded&&invoices.length>0&&(
        <div style={{ background:'#141414',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,marginBottom:20,overflow:'hidden' }}>
          <div style={{ padding:'16px 22px',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
            <h3 className="text-headline" style={{ color:'#fff' }}>My Invoices</h3>
            <span style={{ fontSize:12,color:'rgba(255,255,255,0.25)' }}>{invoices.length} invoice{invoices.length!==1?'s':''}</span>
          </div>
          {invoices.map(inv=>{
            const is=inv.status==='paid'?{bg:'rgba(34,197,94,0.1)',col:'#22c55e',lbl:'✅ Paid'}:inv.status==='overdue'?{bg:'rgba(248,113,113,0.1)',col:'#f87171',lbl:'⚠️ Overdue'}:{bg:'rgba(251,191,36,0.1)',col:'#fbbf24',lbl:'⏳ Pending'}
            return (
              <div key={inv.id} style={{ padding:'14px 22px',borderBottom:'1px solid rgba(255,255,255,0.04)',display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap' }}>
                <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                  <p className="text-body-sm" style={{ color:'#fff',fontWeight:600,fontFamily:'monospace',whiteSpace:'nowrap' }}>{inv.invoice_number}</p>
                  <p className="text-micro" style={{ color:'rgba(255,255,255,0.3)',marginTop:2 }}>{inv.project?.service_type||'Service'} · {new Date(inv.created_at).toLocaleDateString('en-IN')}</p>
                  {inv.due_date&&<p className="text-micro" style={{ color:'rgba(255,255,255,0.3)' }}>Due: {new Date(inv.due_date).toLocaleDateString('en-IN')}</p>}
                </div>
                <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                  <span style={{ fontSize:10,fontWeight:700,padding:'3px 8px',borderRadius:100,background:is.bg,color:is.col }}>{is.lbl}</span>
                  <p className="text-headline" style={{ color:'#fff' }}>₹{inv.total.toLocaleString('en-IN')}</p>
                  {inv.status!=='paid'&&<PaymentButton amount={inv.total} invoiceId={inv.id} label={`Pay ₹${inv.total.toLocaleString('en-IN')}`} description={`Invoice ${inv.invoice_number}`} onSuccess={()=>fetchInvoices()} />}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* QUICK ACTIONS */}
      <div style={{ display:'grid',gap:12,marginTop:8 }} className="dash-qa-grid">
        {[
          { label:'New Project', onClick:()=>setShowNewProject(true), href:undefined, gradient:'linear-gradient(135deg,#6a4cf5,#4a3ab5)' },
          { label:'Chat Support', onClick:()=>setShowDMPanel(v=>!v), href:undefined, gradient:undefined },
          { label:'WhatsApp', onClick:undefined, href:'https://wa.me/918595025753', gradient:undefined },
          { label:'Services', onClick:undefined, href:'/services', gradient:undefined },
        ].map(qa=>qa.href?(
          <a key={qa.label} href={qa.href} target={qa.href.startsWith('http')?'_blank':undefined} rel={qa.href.startsWith('http')?'noopener noreferrer':undefined} style={{ background:'#141414',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:'20px 16px',textAlign:'center',textDecoration:'none',display:'block',cursor:'pointer',transition:'border-color 140ms ease' }} onMouseEnter={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.14)')} onMouseLeave={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.07)')}>
            <p style={{ fontSize:26,marginBottom:8 }}>{qa.label==='WhatsApp'?'💬':'🛠️'}</p>
            <p className="text-body-sm" style={{ color:'rgba(255,255,255,0.5)',fontWeight:600 }}>{qa.label}</p>
          </a>
        ):(
          <button key={qa.label} onClick={qa.onClick!} style={{ background:qa.gradient||'#141414',border:`1px solid ${qa.gradient?'transparent':'rgba(255,255,255,0.07)'}`,borderRadius:16,padding:'20px 16px',textAlign:'center',cursor:'pointer',width:'100%',transition:'opacity 140ms ease' }} onMouseEnter={e=>(e.currentTarget.style.opacity='0.85')} onMouseLeave={e=>(e.currentTarget.style.opacity='1')}>
            <p style={{ fontSize:26,marginBottom:8 }}>{qa.label==='New Project'?'📝':'🎧'}</p>
            <p className="text-body-sm" style={{ color:qa.gradient?'#fff':'rgba(255,255,255,0.5)',fontWeight:600 }}>{qa.label}</p>
          </button>
        ))}
      </div>

      {/* RATING MODAL */}
      {ratingProject&&(
        <div style={{ position:'fixed',inset:0,zIndex:50,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',padding:16 }} onClick={()=>setRatingProject(null)}>
          <div onClick={e=>e.stopPropagation()} style={{ width:'100%',maxWidth:400,background:'#141414',border:'1px solid rgba(255,255,255,0.1)',borderRadius:20,padding:28 }}>
            <h3 className="text-headline" style={{ color:'#fff',marginBottom:4 }}>Rate Your Vendor</h3>
            <p className="text-body-sm" style={{ color:'rgba(255,255,255,0.4)',marginBottom:20 }}>{ratingProject.service_type} — {ratingProject.vendor?.fullname}</p>
            <div style={{ display:'flex',justifyContent:'center',marginBottom:16 }}><StarRating value={ratingValue} onChange={setRatingValue} /></div>
            <textarea value={reviewText} onChange={e=>setReviewText(e.target.value)} rows={3} placeholder="Share your experience (optional)…" className="ks-input" style={{ resize:'vertical',marginBottom:16 }} />
            <div style={{ display:'flex',gap:8 }}>
              <button onClick={submitRating} disabled={!ratingValue||ratingSubmitting} className="btn-primary" style={{ flex:1,justifyContent:'center',cursor:'pointer',opacity:(!ratingValue||ratingSubmitting)?0.5:1 }}>{ratingSubmitting?'Submitting…':'Submit Rating'}</button>
              <button onClick={()=>setRatingProject(null)} className="btn-secondary" style={{ cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showDMPanel&&user&&<DirectChatPanel currentUserId={user.id} mode="user" onClose={()=>setShowDMPanel(false)} />}

      <style>{`
        .dash-stats-grid { grid-template-columns: repeat(4,1fr); }
        .dash-qa-grid { grid-template-columns: repeat(4,1fr); }
        @media (max-width: 640px) {
          .dash-stats-grid { grid-template-columns: repeat(2,1fr); }
          .dash-qa-grid { grid-template-columns: repeat(2,1fr); }
        }
      `}</style>
    </>
  )
}
