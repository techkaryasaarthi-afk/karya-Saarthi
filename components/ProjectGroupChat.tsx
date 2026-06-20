'use client'

import { useRef } from 'react'

interface Message { id: number; content: string; attachment_url: string | null; file_type: string | null; created_at: string; sender: { id: number; fullname: string; role: string } | null }
interface Task { id: number; title: string; deadline: string | null; priority: 'low'|'medium'|'high'; status: string }
interface PendingFile { file: File; id: string; progress: number; status: 'pending'|'uploading'|'completed'|'failed' }

const VIDEO_TYPES = ['video/mp4','video/webm','video/quicktime']

interface Props {
  projectId: number
  messages: Message[]
  tasks: Task[]
  newMsg: string
  uploading: boolean
  uploadSummary: string
  pendingFiles: PendingFile[]
  deletingMsg: number | null
  senderRole?: string
  onNewMsg: (v: string) => void
  onSend: () => void
  onDelete: (id: number) => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemovePending: (id: string) => void
  onClose: () => void
  loadingChat?: boolean
}

export default function ProjectGroupChat({ messages, tasks, newMsg, uploading, uploadSummary, pendingFiles, deletingMsg, senderRole, onNewMsg, onSend, onDelete, onFileChange, onRemovePending, onClose, loadingChat }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 800, background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        {/* Group header */}
        <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(106,76,245,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display:'flex' }}>
          {[{l:'C',c:'#6a4cf5'},{l:'V',c:'#d44df0'},{l:'PM',c:'#0099ff'}].map((m,i)=>(
            <div key={m.l} style={{ width:26,height:26,borderRadius:'50%',background:m.c+'22',border:`2px solid #141414`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:m.c,marginLeft:i>0?-6:0,position:'relative',zIndex:3-i }}>{m.l}</div>
          ))}
        </div>
          <div>
            <p style={{ fontSize:13,fontWeight:600,color:'#fff' }}>Project Team Chat</p>
            <p style={{ fontSize:11,color:'rgba(255,255,255,0.35)' }}>Client · Vendor · Project Manager</p>
          </div>
        </div>
        <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 140ms ease' }} onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.2)')} onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.1)')}>✕</button>
      </div>

      {loadingChat ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#0099ff', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Loading chat history...</p>
        </div>
      ) : (
      <div className="flex flex-col sm:flex-row min-h-[320px]">
        {/* Tasks */}
        <div className="w-full sm:w-[200px] flex-shrink-0 border-b sm:border-b-0 sm:border-r border-white/10 p-3 sm:p-[14px] overflow-y-auto max-h-[140px] sm:max-h-none">
          <p style={{ fontSize:12,fontWeight:700,color:'rgba(255,255,255,0.5)',marginBottom:10,textTransform:'uppercase',letterSpacing:'0.06em' }}>Tasks</p>
          {tasks.length===0 && <p style={{ fontSize:12,color:'rgba(255,255,255,0.25)' }}>No tasks yet.</p>}
          <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
            {tasks.map(t=>(
              <div key={t.id} style={{ padding:'8px 10px',background:'rgba(255,255,255,0.04)',borderRadius:8 }}>
                <p style={{ fontSize:12,fontWeight:600,color:'#fff',marginBottom:4 }}>{t.title}</p>
                <div style={{ display:'flex',gap:4,flexWrap:'wrap' }}>
                  <span style={{ fontSize:9,fontWeight:700,padding:'1px 6px',borderRadius:100,background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.4)',textTransform:'uppercase' }}>{t.status.replace('_',' ')}</span>
                  {t.priority==='high' && <span style={{ fontSize:9,fontWeight:700,padding:'1px 6px',borderRadius:100,background:'rgba(248,113,113,0.1)',color:'#f87171' }}>High</span>}
                  {t.deadline && <span style={{ fontSize:9,fontWeight:700,padding:'1px 6px',borderRadius:100,background:'rgba(251,191,36,0.1)',color:'#fbbf24' }}>{new Date(t.deadline).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div style={{ flex:1,display:'flex',flexDirection:'column',minWidth:0 }}>
          <div style={{ flex:1,overflowY:'auto',padding:'12px 14px',display:'flex',flexDirection:'column',gap:8 }} className="scrollbar-none">
            {messages.length===0 && <p style={{ fontSize:12,color:'rgba(255,255,255,0.25)',textAlign:'center',padding:'20px 0' }}>No messages yet — start the conversation!</p>}
            {messages.map(m=>{
              if(m.file_type==='system') return (
                <div key={m.id} style={{ textAlign:'center' }}>
                  <span style={{ fontSize:11,color:'rgba(255,255,255,0.3)',background:'rgba(255,255,255,0.04)',padding:'4px 12px',borderRadius:100,display:'inline-block' }}>{m.content}</span>
                </div>
              )
              const isMe = m.sender?.role===senderRole || m.sender?.role==='customer'
              return (
                <div key={m.id} style={{ position:'relative' }} className="group">
                  <div style={{ padding:'9px 12px',borderRadius:12,maxWidth:'78%',marginLeft:isMe?'auto':undefined,background:isMe?'rgba(0,153,255,0.15)':'rgba(255,255,255,0.06)' }}>
                    <p style={{ fontSize:11,color:'rgba(255,255,255,0.35)',marginBottom:3 }}>{m.sender?.fullname} · {new Date(m.created_at).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</p>
                    <p style={{ fontSize:13,color:'#fff',lineHeight:1.4 }}>{m.content}</p>
                    {m.attachment_url && (
                      <div style={{ marginTop:8 }}>
                        {m.file_type==='image' ? <a href={m.attachment_url} target="_blank" rel="noopener noreferrer"><img src={m.attachment_url} alt="" style={{ maxWidth:160,borderRadius:8 }} /></a>
                        : m.file_type==='video' ? <video controls style={{ maxWidth:200,borderRadius:8 }}><source src={m.attachment_url} /></video>
                        : <a href={m.attachment_url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ fontSize:11,display:'inline-flex' }}>📎 Download</a>}
                      </div>
                    )}
                  </div>
                  <button onClick={()=>onDelete(m.id)} disabled={deletingMsg===m.id} style={{ position:'absolute',top:4,right:4,width:16,height:16,borderRadius:'50%',border:'none',cursor:'pointer',fontSize:9,background:'rgba(248,113,113,0.2)',color:'#f87171',opacity:0 }} className="group-hover-show">{deletingMsg===m.id?'·':'✕'}</button>
                </div>
              )
            })}
          </div>

          {/* Pending files tray */}
          {pendingFiles.length>0 && (
            <div style={{ padding:'6px 14px',borderTop:'1px solid rgba(255,255,255,0.05)',display:'flex',flexWrap:'wrap',gap:6 }}>
              {pendingFiles.map(pf=>(
                <div key={pf.id} style={{ position:'relative',display:'flex',alignItems:'center',gap:6,padding:'5px 8px',background:'rgba(255,255,255,0.06)',borderRadius:8,minWidth:130 }}>
                  <span style={{ fontSize:13 }}>{VIDEO_TYPES.includes(pf.file.type)?'🎥':'📎'}</span>
                  <div style={{ flex:1,minWidth:0 }}>
                    <p style={{ fontSize:11,color:'#fff',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{pf.file.name}</p>
                    {pf.status==='uploading' && <div style={{ height:2,background:'rgba(255,255,255,0.1)',borderRadius:1,marginTop:2,overflow:'hidden' }}><div style={{ height:'100%',width:`${pf.progress}%`,background:'#0099ff',transition:'width 200ms' }} /></div>}
                    {pf.status==='completed' && <span style={{ fontSize:9,color:'#22c55e',fontWeight:700 }}>Done</span>}
                    {pf.status==='failed' && <span style={{ fontSize:9,color:'#f87171',fontWeight:700 }}>Failed</span>}
                  </div>
                  {!uploading && <button onClick={()=>onRemovePending(pf.id)} style={{ position:'absolute',top:-3,right:-3,width:13,height:13,borderRadius:'50%',border:'none',background:'#f87171',color:'#fff',fontSize:8,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>✕</button>}
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ display:'flex',gap:6,padding:'10px 14px',borderTop:'1px solid rgba(255,255,255,0.06)',flexShrink:0 }}>
            <input type="file" ref={fileRef} onChange={onFileChange} style={{ display:'none' }} multiple accept="image/*,video/mp4,video/webm,video/quicktime,.pdf,.doc,.docx,.txt,.xls,.xlsx,.zip,.rar" />
            <button type="button" onClick={()=>fileRef.current?.click()} disabled={uploading} style={{ width:34,height:34,borderRadius:9,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.05)',cursor:'pointer',fontSize:14,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center' }}>{uploading?'⏳':'📎'}</button>
            <input value={newMsg} onChange={e=>onNewMsg(e.target.value)} placeholder="Type a message…" onKeyDown={e=>e.key==='Enter'&&!uploading&&onSend()} className="ks-input" style={{ flex:1,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',fontSize:13,minWidth:0 }} />
            <button type="button" onClick={onSend} disabled={uploading||(!newMsg.trim()&&pendingFiles.length===0)} style={{ padding:'0 16px',borderRadius:9,border:'none',background:'#0099ff',color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer',opacity:uploading||(!newMsg.trim()&&pendingFiles.length===0)?0.4:1,flexShrink:0 }}>Send</button>
          </div>
          {uploadSummary && <p style={{ padding:'4px 14px 8px',fontSize:11,color:'rgba(255,255,255,0.3)' }}>{uploadSummary}</p>}
        </div>
      </div>
      )}
    </div>
  </div>
  )
}
