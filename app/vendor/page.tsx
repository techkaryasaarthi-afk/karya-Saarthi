'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import DirectChatPanel from '@/components/admin/DirectChatPanel'
import ProjectGroupChat from '@/components/ProjectGroupChat'
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
  return <span style={{ fontSize: 14 }}>{Array.from({ length: 5 }, (_, i) => <span key={i} style={{ opacity: i < value ? 1 : 0.25 }}>Î“Â¡Ã‰</span>)}</span>
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
  const [chatLoading, setChatLoading] = useState(false)
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
  const [vendorName, setVendorName] = useState<string>('Vendor Dashboard')
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
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      setCurrentVendorUserId(d.id || 0)
      if (d.fullname) setVendorName(d.fullname)
    })
  }, [])

  const updateProject = async (id: number, updates: Record<string, unknown>) => {
    setActionId(id); await fetch(`/api/projects/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) })
    setActionId(null); fetchProjects()
  }

  // Chat
  const openChat = async (pid: number) => { 
    if (chatProject === pid) {
      setChatProject(null);
    } else {
      setChatProject(pid); 
      setChatLoading(true);
      try {
        const r = await fetch(`/api/projects/${pid}/messages`); const d = await r.json(); setMessages(d.messages || []);
        const t = await fetch(`/api/admin/projects/tasks?project_id=${pid}`); const td = await t.json(); setTasks(td.tasks || []);
      } finally {
        setChatLoading(false);
      }
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
      if (d.url) { await fetch(`/api/projects/${projectId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: `📎 File uploaded: ${file.name}`, attachment_url: d.url, file_type: d.file_type }) }) }
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

  const scMap: Record<string,{bg:string;col:string}> = { assigned:{bg:'rgba(59,130,246,0.1)',col:'#3B82F6'}, in_progress:{bg:'rgba(6,182,212,0.1)',col:'#06B6D4'}, review:{bg:'rgba(168,85,247,0.1)',col:'#A855F7'}, delivered:{bg:'rgba(20,184,166,0.1)',col:'#14B8A6'}, completed:{bg:'rgba(34,197,94,0.1)',col:'#22C55E'}, pending:{bg:'rgba(245,158,11,0.1)',col:'#F59E0B'} }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* HEADER */}
      <div style={{ background:'linear-gradient(135deg,#7c2a8e 0%,#d44df0 60%,#b845d4 100%)', borderRadius:20, padding:'28px 28px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-50, right:-50, width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
        <div style={{ position:'relative', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
          <div>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginBottom:6, letterSpacing:'0.08em', textTransform:'uppercase' }}>Vendor Panel</p>
            <h1 style={{ fontSize:24, fontWeight:700, color:'#fff', letterSpacing:'-0.4px', fontFamily:'var(--font-sora,var(--font-display))', marginBottom:4 }}>{vendorName}</h1>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.55)' }}>Your assigned projects &amp; earnings</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ position:'relative' }}>
              <button onClick={()=>{const o=!showNotifs;setShowNotifs(o);if(o&&unreadCount>0)markAllRead()}} style={{ width:38, height:38, borderRadius:'50%', border:'none', background:'rgba(255,255,255,0.12)', cursor:'pointer', fontSize:16, position:'relative' }}>
                🔔{unreadCount>0&&<span style={{ position:'absolute', top:-2, right:-2, width:14, height:14, borderRadius:'50%', background:'#ef4444', color:'#fff', fontSize:9, display:'flex', alignItems:'center', justifyContent:'center' }}>{unreadCount}</span>}
              </button>
              {showNotifs&&(
                <div className="notif-dropdown" style={{ position:'absolute', top:46, width:300, background:'#1c1c1c', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, zIndex:50, overflow:'hidden' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize:13, fontWeight:600, color:'#fff' }}>Notifications</span>
                    {unreadCount>0&&<button onClick={markAllRead} style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, color:'var(--color-accent-blue)' }}>Mark all read</button>}
                  </div>
                  <div style={{ maxHeight:240, overflowY:'auto' }}>
                    {notifications.length===0?<p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', textAlign:'center', padding:16 }}>No notifications</p>:
                      notifications.slice(0,10).map(n=>(<div key={n.id} style={{ padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)', background:!n.is_read?'rgba(255,255,255,0.02)':'transparent' }}><p style={{ fontSize:13, fontWeight:500, color:'#fff' }}>{n.title}</p><p style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{n.message}</p></div>))
                    }
                  </div>
                </div>
              )}
            </div>
            <button onClick={()=>setShowDMPanel(v=>!v)} style={{ background:showDMPanel?'#fff':'rgba(255,255,255,0.15)', color:showDMPanel?'#000':'#fff', border:'none', borderRadius:100, padding:'10px 18px', fontSize:13, fontWeight:600, cursor:'pointer' }}>💬 Chat Support</button>
          </div>
        </div>
        <div style={{ display:'flex', gap:24, marginTop:24, flexWrap:'wrap' }}>
          {[{l:'Total',v:projects.length},{l:'Active',v:active.length},{l:'Done',v:completed.length},{l:'Rating',v:avgRating>0?avgRating.toFixed(1):'—'}].map(s=>(
            <div key={s.l} style={{ display:'flex', alignItems:'baseline', gap:6 }}><span style={{ fontSize:22, fontWeight:700, color:'#fff', fontFamily:'var(--font-sora,var(--font-display))' }}>{s.v}</span><span style={{ fontSize:12, color:'rgba(255,255,255,0.45)' }}>{s.l}</span></div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.07)', overflowX:'auto' }} className="scrollbar-none">
        {(['projects','earnings','reviews'] as const).map(tab=>(
          <button key={tab} onClick={()=>setActiveTab(tab)} style={{ padding:'11px 22px', fontSize:13, fontWeight:600, textTransform:'capitalize', cursor:'pointer', border:'none', background:'none', whiteSpace:'nowrap', borderBottom:activeTab===tab?'2px solid var(--color-accent-blue)':'2px solid transparent', color:activeTab===tab?'var(--color-accent-blue)':'rgba(255,255,255,0.35)', transition:'all 140ms ease' }}>
            {tab==='projects'?'📋':tab==='earnings'?'💰':'⭐'} {tab}
          </button>
        ))}
      </div>

      {activeTab==='projects'&&(
        <>
          <div style={{ display:'flex', gap:6, overflowX:'auto' }} className="scrollbar-none">
            {(['all','active','completed'] as const).map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{ padding:'7px 16px', borderRadius:100, border:'none', cursor:'pointer', fontSize:12, fontWeight:600, whiteSpace:'nowrap', background:filter===f?'#fff':'rgba(255,255,255,0.06)', color:filter===f?'#000':'rgba(255,255,255,0.4)', transition:'all 140ms ease' }}>
                {f==='all'?`All (${projects.length})`:f==='active'?`Active (${active.length})`:`Completed (${completed.length})`}
              </button>
            ))}
          </div>
          {loading?(<div style={{ display:'flex', flexDirection:'column', gap:12 }}>{[0,1,2].map(i=><div key={i} className="skeleton" style={{ height:140, borderRadius:14 }} />)}</div>
          ):filtered.length===0?(
            <div style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'48px 24px', textAlign:'center' }}><p style={{ fontSize:32, marginBottom:10 }}>📋</p><p style={{ fontSize:14, color:'rgba(255,255,255,0.4)' }}>No projects found</p></div>
          ):(
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {filtered.map(p=>{
                const sc=scMap[p.status]||{bg:'rgba(255,255,255,0.06)',col:'rgba(255,255,255,0.5)'}
                const progressVal = p.status === 'completed' ? 100 : (p.progress || 0)
                return (
                  <div key={p.id} style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'22px 22px', transition:'border-color 140ms ease' }} onMouseEnter={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.12)')} onMouseLeave={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.07)')}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12, flexWrap:'wrap', gap:10 }}>
                      <div style={{ flex: '1 1 200px', minWidth: 0 }}><h3 style={{ fontSize:15, fontWeight:700, color:'#fff' }}>{p.service_type}</h3><p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginTop:4, lineHeight:1.4 }}>{p.description}</p><p style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginTop:6 }}>Client: {p.client?.fullname||'N/A'} · {new Date(p.created_at).toLocaleDateString('en-IN')}</p></div>
                      <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:100, background:sc.bg, color:sc.col, textTransform:'capitalize', whiteSpace:'nowrap' }}>{p.status.replace('_',' ')}</span>
                    </div>
                    <div style={{ marginBottom:14 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:6 }}><span style={{ color:'rgba(255,255,255,0.35)' }}>Progress</span><span style={{ fontWeight:700, color:'#fff' }}>{progressVal}%</span></div>
                      <input type="range" min="0" max="100" value={progressVal} disabled={p.status === 'completed'} onChange={e=>updateProject(p.id,{progress:Number(e.target.value)})} style={{ width:'100%', height:4, appearance:'none', background:`linear-gradient(90deg,#d44df0 ${progressVal}%,rgba(255,255,255,0.08) ${progressVal}%)`, borderRadius:2, cursor:p.status === 'completed' ? 'not-allowed' : 'pointer', outline:'none', opacity:p.status === 'completed' ? 0.6 : 1 }} />
                    </div>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      {p.status==='assigned'&&<button onClick={()=>updateProject(p.id,{status:'in_progress',progress:10})} disabled={actionId===p.id} style={{ background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.25)', color:'#3B82F6', borderRadius:100, padding:'7px 14px', fontSize:12, fontWeight:600, cursor:'pointer' }}>🚀 Start</button>}
                      {p.status==='in_progress'&&<button onClick={()=>updateProject(p.id,{status:'review'})} disabled={actionId===p.id} style={{ background:'rgba(168,85,247,0.1)', border:'1px solid rgba(168,85,247,0.25)', color:'#A855F7', borderRadius:100, padding:'7px 14px', fontSize:12, fontWeight:600, cursor:'pointer' }}>🔍 Submit Review</button>}
                      {p.status==='review'&&<button onClick={()=>updateProject(p.id,{status:'delivered',progress:100})} disabled={actionId===p.id} style={{ background:'rgba(20,184,166,0.1)', border:'1px solid rgba(20,184,166,0.25)', color:'#14B8A6', borderRadius:100, padding:'7px 14px', fontSize:12, fontWeight:600, cursor:'pointer' }}>📦 Mark Delivered</button>}
                      <input type="file" ref={projectFileRef} onChange={e=>handleProjectFile(e,p.id)} style={{ display:'none' }} accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.zip,.rar" />
                      <button onClick={()=>projectFileRef.current?.click()} disabled={uploadingProject===p.id} style={{ background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.25)', color:'#F59E0B', borderRadius:100, padding:'7px 14px', fontSize:12, fontWeight:600, cursor:'pointer' }}>{uploadingProject===p.id?'⏳ Uploading…':'📁 Upload File'}</button>
                      <button onClick={()=>openChat(p.id)} style={{ background:chatProject===p.id?'rgba(0,153,255,0.12)':'rgba(255,255,255,0.06)', border:`1px solid ${chatProject===p.id?'rgba(0,153,255,0.3)':'rgba(255,255,255,0.08)'}`, color:chatProject===p.id?'var(--color-accent-blue)':'rgba(255,255,255,0.45)', borderRadius:100, padding:'7px 14px', fontSize:12, fontWeight:600, cursor:'pointer' }}>{chatProject===p.id?'▲ Close':'💬 Team Chat'}</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {chatProject && (
            <ProjectGroupChat projectId={chatProject} messages={messages} tasks={tasks} newMsg={newMsg} uploading={uploading} uploadSummary={uploadSummary} pendingFiles={pendingFiles} deletingMsg={deletingMsg} senderRole="vendor" onNewMsg={setNewMsg} onSend={sendMessage} onDelete={deleteMessage} onFileChange={handleChatFileUpload} onRemovePending={id=>setPendingFiles(prev=>prev.filter(f=>f.id!==id))} onClose={() => setChatProject(null)} loadingChat={chatLoading} />
          )}
        </>
      )}

      {activeTab==='earnings'&&(
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'grid', gap:12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }} className="vendor-earnings-grid">
            {[
              {l:'Total Earned',v:`₹${(earnings?.totalEarned||0).toLocaleString('en-IN')}`,c:'#10B981'},
              {l:'Released',v:`₹${(earnings?.totalPayments||0).toLocaleString('en-IN')}`,c:'#3B82F6'},
              {l:'Pending',v:`₹${(earnings?.pendingAmount||0).toLocaleString('en-IN')}`,c:'#F59E0B'},
              {l:'Completed',v:earnings?.completedProjects||0,c:'#8B5CF6'},
            ].map(k=>(<div key={k.l} style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'18px 20px' }}><p style={{ fontSize:22, fontWeight:700, color:k.c, fontFamily:'var(--font-sora,var(--font-display))', marginBottom:4 }}>{k.v}</p><p style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>{k.l}</p></div>))}
          </div>
          {earningsMonthly.length>0&&(
            <div style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'20px 22px' }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:'#fff', marginBottom:18 }}>Monthly Earnings</h3>
              <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:110 }}>
                {earningsMonthly.map((m,i)=>{ const mx=Math.max(...earningsMonthly.map(x=>x.amount),1); return (
                  <div key={m.month} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <p style={{ fontSize:9, color:'rgba(255,255,255,0.35)', fontWeight:700 }}>{m.amount>0?`₹${(m.amount/1000).toFixed(0)}k`:''}</p>
                    <div style={{ width:'100%', borderRadius:'6px 6px 0 0', height:`${Math.max((m.amount/mx)*100,4)}%`, background:i%2===0?'#d44df0':'#6a4cf5', minHeight:4 }} />
                    <span style={{ fontSize:9, color:'rgba(255,255,255,0.3)' }}>{m.month}</span>
                  </div>
                )})}
              </div>
            </div>
          )}
          <div style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'16px 22px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}><h3 style={{ fontSize:14, fontWeight:700, color:'#fff' }}>Payment History</h3></div>
            {payments.length===0?<p style={{ padding:'32px', textAlign:'center', color:'rgba(255,255,255,0.3)', fontSize:14 }}>No payments yet</p>:
              payments.map(p=>(
                <div key={p.id} style={{ padding:'14px 22px', borderBottom:'1px solid rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
                  <div><p style={{ fontSize:13, fontWeight:600, color:'#fff' }}>{p.description||'Project Payment'}</p><p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{new Date(p.created_at).toLocaleDateString('en-IN')} · {p.razorpay_payment_id||'—'}</p></div>
                  <div style={{ textAlign:'right' }}><p style={{ fontWeight:700, color:'#22c55e', fontSize:14 }}>₹{(p.amount||0).toLocaleString('en-IN')}</p><span style={{ fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:100, background:'rgba(34,197,94,0.1)', color:'#22c55e' }}>received</span></div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {activeTab==='reviews'&&(
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {ratings.length===0?(
            <div style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'48px 24px', textAlign:'center' }}><p style={{ fontSize:32, marginBottom:10 }}>⭐</p><p style={{ fontSize:14, color:'rgba(255,255,255,0.4)' }}>No reviews yet</p></div>
          ):ratings.map(r=>(
            <div key={r.id} style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'18px 20px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span>{Array.from({length:5},(_,i)=><span key={i} style={{ opacity:i<r.rating?1:0.2, fontSize:14 }}>⭐</span>)}</span>
                  <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>by {r.customer?.fullname||'Customer'}</span>
                </div>
                <span style={{ fontSize:11, color:'rgba(255,255,255,0.25)' }}>{new Date(r.created_at).toLocaleDateString('en-IN')}</span>
              </div>
              {r.review&&<p style={{ fontSize:13, color:'rgba(255,255,255,0.7)', lineHeight:1.5 }}>{r.review}</p>}
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginTop:8 }}>📋 {r.project?.service_type||'Project'}</p>
            </div>
          ))}
        </div>
      )}

      {showDMPanel&&currentVendorUserId>0&&<DirectChatPanel currentUserId={currentVendorUserId} mode="user" onClose={()=>setShowDMPanel(false)} />}
      <style>{`.vendor-earnings-grid{grid-template-columns:repeat(4,1fr)} .notif-dropdown { right: 0; } @media(max-width:640px){.vendor-earnings-grid{grid-template-columns:repeat(2,1fr)} .notif-dropdown { right: auto; left: -10px; max-width: calc(100vw - 32px); }}`}</style>
    </div>
  )
}
