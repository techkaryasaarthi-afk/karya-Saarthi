'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from '@/lib/motion'

interface Project {
  id: number; service_type: string; description: string | null; budget: number | null
  status: string; progress: number; deadline: string | null; priority: string | null
  created_at: string; is_escalated?: boolean; vendor_price: number | null
  client: { id: number; fullname: string; email: string; phone: string } | null
  vendor: { id: number; fullname: string; email: string; phone: string } | null
  invoice_status?: string | null
}

interface Task { id: number; title: string; assignee: string; deadline: string | null; status: 'todo' | 'in_progress' | 'review' | 'done'; priority: string }
interface CommLog { id: number; note: string; author: string; created_at: string; type: string }
interface Checklist { id: number; item: string; checked: boolean }
interface TeamMember { id: number; fullname: string; email: string }

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending: { label: 'To-Do', color: '#6B7280', bg: 'rgba(255,255,255,0.08)', icon: '📋' },
  assigned: { label: 'Assigned', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)', icon: '👤' },
  in_progress: { label: 'In Progress', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', icon: '🔄' },
  review: { label: 'Review', color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)', icon: '👁️' },
  completed: { label: 'Done', color: '#10B981', bg: 'rgba(16,185,129,0.15)', icon: '✅' },
  cancelled: { label: 'Cancelled', color: '#EF4444', bg: 'rgba(239,68,68,0.15)', icon: '❌' },
}
const PRIORITY_COLOR: Record<string, string> = { low: '#6B7280', medium: '#F59E0B', high: '#EF4444', urgent: '#DC2626' }

function fmtDate(iso: string) { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) }
function fmtDeadline(iso: string) {
  const h = (new Date(iso).getTime() - Date.now()) / 3600000
  if (h < 0) return `⚠️ ${Math.abs(Math.round(h))}h overdue`
  if (h < 24) return `⚡ ${Math.round(h)}h left`
  return `📅 ${Math.round(h / 24)}d left`
}

// ── Sub-panels ────────────────────────────────────────────────────
function ContactCard({ person, label, onClose }: { person: { fullname: string; email: string; phone: string }; label: string; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={(e: React.MouseEvent) => e.stopPropagation()} className="bg-[var(--color-surface-1)] rounded-2xl p-6 w-72 shadow-2xl shadow-black/80">
        <div className="flex items-center justify-between mb-4">
          <span className="font-bold text-[var(--color-ink)]">{label}</span>
          <button onClick={onClose} className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] cursor-pointer text-xl">✕</button>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-[rgba(0,153,255,0.12)] flex items-center justify-center font-bold text-[var(--color-ink)] text-lg">{person.fullname.charAt(0)}</div>
          <p className="font-bold text-[var(--color-ink)]">{person.fullname}</p>
        </div>
        <div className="space-y-2">
          <a href={`mailto:${person.email}`} className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--color-surface-2)] hover:bg-blue-50 transition-colors text-xs text-[var(--color-ink)]">✉️ {person.email}</a>
          {person.phone && <a href={`tel:${person.phone}`} className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--color-surface-2)] hover:bg-green-50 transition-colors text-xs text-[var(--color-ink)]">📞 {person.phone}</a>}
          {person.phone && <a href={`https://wa.me/${person.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2.5 rounded-xl bg-green-50 text-xs font-bold text-green-700">💬 WhatsApp</a>}
        </div>
      </motion.div>
    </motion.div>
  )
}

function ProjectDetailPanel({ project, onClose, team, updateProject }: { project: Project; onClose: () => void; team: TeamMember[]; updateProject: (id: number, updates: Record<string, unknown>) => void }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [commLogs, setCommLogs] = useState<CommLog[]>([])
  const [checklist, setChecklist] = useState<Checklist[]>([])
  const progressVal = project.status === 'completed' ? 100 : (project.progress || 0)
  
  const [draftBudget, setDraftBudget] = useState(project.budget?.toString() || '')
  const [draftVendorPrice, setDraftVendorPrice] = useState(project.vendor_price?.toString() || '')
  const [draftDeadline, setDraftDeadline] = useState(project.deadline ? project.deadline.split('T')[0] : '')

  useEffect(() => {
    setDraftBudget(project.budget?.toString() || '')
    setDraftVendorPrice(project.vendor_price?.toString() || '')
    setDraftDeadline(project.deadline ? project.deadline.split('T')[0] : '')
  }, [project.id, project.budget, project.vendor_price, project.deadline])

  const [activeTab, setActiveTab] = useState<'tasks' | 'comm' | 'checklist' | 'billing'>('tasks')
  const [newTask, setNewTask] = useState({ title: '', assignee: '', deadline: '', priority: 'medium' })
  const [newNote, setNewNote] = useState('')
  const [newCheckItem, setNewCheckItem] = useState('')
  const [saving, setSaving] = useState(false)
  const [taskLoading, setTaskLoading] = useState(true)

  const loadProjectData = useCallback(async () => {
    setTaskLoading(true)
    try {
      const [tRes, cRes, chRes] = await Promise.all([
        fetch(`/api/admin/projects/tasks?project_id=${project.id}`).then(r => r.ok ? r.json() : { tasks: [] }),
        fetch(`/api/admin/projects/comm?project_id=${project.id}`).then(r => r.ok ? r.json() : { logs: [] }),
        fetch(`/api/admin/projects/checklist?project_id=${project.id}`).then(r => r.ok ? r.json() : { items: [] }),
      ])
      setTasks(tRes.tasks || [])
      setCommLogs(cRes.logs || [])
      setChecklist(chRes.items || [])
    } catch {} finally { setTaskLoading(false) }
  }, [project.id])

  useEffect(() => { loadProjectData() }, [loadProjectData])

  const saveTask = async () => {
    if (!newTask.title) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/projects/tasks', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: project.id, title: newTask.title, assignee: newTask.assignee, deadline: newTask.deadline || null, priority: newTask.priority, status: 'todo' })
      })
      if (res.ok) { setNewTask({ title: '', assignee: '', deadline: '', priority: 'medium' }); loadProjectData() }
    } catch {} finally { setSaving(false) }
  }

  const updateTaskStatus = async (id: number, status: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    await fetch('/api/admin/projects/tasks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
  }

  const addNote = async () => {
    if (!newNote.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/projects/comm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: project.id, note: newNote, author: 'Admin', type: 'note' })
      })
      if (res.ok) { setNewNote(''); loadProjectData() }
    } catch {} finally { setSaving(false) }
  }

  const addCheckItem = async () => {
    if (!newCheckItem.trim()) return
    try {
      const res = await fetch('/api/admin/projects/checklist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: project.id, item: newCheckItem })
      })
      if (res.ok) { setNewCheckItem(''); loadProjectData() }
    } catch {}
  }

  const toggleCheck = async (id: number) => {
    const item = checklist.find(c => c.id === id)
    if (!item) return
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c))
    await fetch('/api/admin/projects/checklist', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, checked: !item.checked }) })
  }

  const generateInvoice = async () => {
    if (!project.budget || project.budget <= 0) {
      alert("Please set a Client Budget first.")
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/projects/${project.id}/invoice`, { method: 'POST' })
      if (res.ok) {
        updateProject(project.id, { invoice_status: 'sent' })
        alert("Invoice generated and payment requested!")
      } else {
        const err = await res.json()
        alert(`Failed: ${err.error}`)
      }
    } catch {
      alert("An error occurred")
    } finally {
      setSaving(false)
    }
  }

  const completedChecks = checklist.filter(c => c.checked).length
  const TASK_COLS: Task['status'][] = ['todo', 'in_progress', 'review', 'done']
  const TASK_LABELS: Record<Task['status'], { label: string; color: string; bg: string }> = {
    todo: { label: 'To-Do', color: '#6B7280', bg: 'rgba(255,255,255,0.08)' },
    in_progress: { label: 'In Progress', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
    review: { label: 'Review', color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' },
    done: { label: 'Done', color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-end" onClick={onClose}>
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-2xl h-full bg-[var(--color-surface-1)] shadow-2xl shadow-black/80 overflow-y-auto" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-[var(--color-surface-1)] border-b border-[var(--color-hairline-soft)] px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-bold text-[var(--color-ink)] text-lg font-heading">#{project.id} — {project.service_type}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: STATUS_CFG[project.status]?.bg, color: STATUS_CFG[project.status]?.color }}>
                {STATUS_CFG[project.status]?.icon} {STATUS_CFG[project.status]?.label}
              </span>
              {project.is_escalated && <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold">🚨 Escalated</span>}
              {project.priority && <span className="text-[10px] font-bold capitalize" style={{ color: PRIORITY_COLOR[project.priority] }}>● {project.priority}</span>}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-hairline)] flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-2)] border border-[var(--color-hairline-soft)] cursor-pointer text-lg">✕</button>
        </div>

        {/* Project info */}
        <div className="px-6 pt-5 pb-3 bg-[var(--color-surface-2)] border-b border-[var(--color-hairline-soft)]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div><p className="text-[10px] text-[var(--color-ink-muted)] uppercase font-bold mb-0.5">Client</p><p className="font-semibold text-[var(--color-ink)] mt-1.5">{project.client?.fullname || '—'}</p></div>
            <div>
              <p className="text-[10px] text-[var(--color-ink-muted)] uppercase font-bold mb-0.5">Assignee (Vendor)</p>
              <select value={project.vendor?.id || ''} onChange={e => {
                const assigned_to = e.target.value ? Number(e.target.value) : null
                updateProject(project.id, { assigned_to })
              }} className="font-semibold text-[var(--color-ink)] bg-transparent outline-none cursor-pointer w-full text-sm py-1 border-b border-transparent focus:border-slate-300">
                <option value="">— Unassigned —</option>
                {team.map(m => <option key={m.id} value={m.id}>{m.fullname}</option>)}
              </select>
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-ink-muted)] uppercase font-bold mb-0.5">Client Budget</p>
              <div className="flex items-center gap-1">
                <span className="text-[var(--color-ink-muted)]">₹</span>
                <input type="number" 
                  value={draftBudget} 
                  onChange={e => setDraftBudget(e.target.value)}
                  onBlur={() => updateProject(project.id, { budget: draftBudget ? Number(draftBudget) : null })}
                  className="font-semibold text-[var(--color-ink)] bg-transparent outline-none border-b border-transparent focus:border-slate-300 w-full text-sm py-1 appearance-none"
                  placeholder="—"
                />
              </div>
            </div>
            <div>
               <p className="text-[10px] text-[var(--color-ink-muted)] uppercase font-bold mb-0.5">Vendor Price</p>
               <div className="flex items-center gap-1">
                 <span className="text-[var(--color-ink-muted)]">₹</span>
                 <input type="number"
                   value={draftVendorPrice}
                   onChange={e => setDraftVendorPrice(e.target.value)}
                   onBlur={() => updateProject(project.id, { vendor_price: draftVendorPrice ? Number(draftVendorPrice) : null })}
                   className="font-semibold text-accent bg-transparent outline-none border-b border-transparent focus:border-slate-300 w-full text-sm py-1 appearance-none"
                   placeholder="—"
                 />
               </div>
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-ink-muted)] uppercase font-bold mb-0.5">Deadline</p>
              <input type="date"
                value={draftDeadline}
                onChange={e => setDraftDeadline(e.target.value)}
                onBlur={() => updateProject(project.id, { deadline: draftDeadline || null })}
                className="font-semibold text-[var(--color-ink)] bg-transparent text-sm w-full outline-none py-1 cursor-pointer border-b border-transparent focus:border-slate-300"
              />
            </div>
          </div>
          {/* Progress */}
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1"><span className="text-[var(--color-ink-muted)]">Progress</span><span className="font-bold text-[var(--color-ink)]">{progressVal}%</span></div>
            <div className="h-2 bg-[var(--color-surface-2)] border border-[var(--color-hairline-soft)] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-navy to-accent rounded-full" style={{ width: `${progressVal}%` }} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-[var(--color-hairline-soft)]">
          {(['tasks', 'comm', 'checklist', 'billing'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${activeTab === t ? 'bg-[var(--color-surface-2)] text-[var(--color-ink)]' : 'text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-2)] border border-[var(--color-hairline)]'}`}>
              {t === 'tasks' ? '📋 Tasks' : t === 'comm' ? '💬 Comm Log' : t === 'checklist' ? '✅ Checklist' : '💰 Billing'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Tasks tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="bg-[var(--color-surface-2)] rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-[var(--color-ink)] uppercase">Add Task</h4>
                <input value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                  placeholder="Task title..." className="w-full px-3 py-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-surface-1)] text-sm focus:outline-none focus:border-[var(--color-hairline)]" />
                <div className="grid grid-cols-3 gap-2">
                  <select value={newTask.assignee} onChange={e => setNewTask(p => ({ ...p, assignee: e.target.value }))}
                    className="px-2 py-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-surface-1)] text-xs focus:outline-none">
                    <option value="">Assign to...</option>
                    {team.map(m => <option key={m.id} value={m.fullname}>{m.fullname}</option>)}
                  </select>
                  <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}
                    className="px-2 py-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-surface-1)] text-xs focus:outline-none">
                    {['low', 'medium', 'high', 'urgent'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <input type="date" value={newTask.deadline} onChange={e => setNewTask(p => ({ ...p, deadline: e.target.value }))}
                    className="px-2 py-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-surface-1)] text-xs focus:outline-none" />
                </div>
                <button onClick={saveTask} disabled={saving} className="px-4 py-2 rounded-lg bg-[var(--color-inverse-surface)] text-[var(--color-on-primary)] text-xs font-bold cursor-pointer hover:opacity-90 disabled:opacity-60">{saving ? '⏳' : '+ Add Task'}</button>
              </div>

              {/* Kanban */}
              <div className="grid grid-cols-2 gap-3">
                {TASK_COLS.map(col => {
                  const colTasks = tasks.filter(t => t.status === col)
                  const cfg = TASK_LABELS[col]
                  return (
                    <div key={col} className="rounded-xl p-3 border" style={{ background: cfg.bg + '40', borderColor: cfg.color + '30' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase" style={{ color: cfg.color }}>{cfg.label}</span>
                        <span className="text-[10px] font-bold text-[var(--color-ink-muted)]">{colTasks.length}</span>
                      </div>
                      <div className="space-y-2">
                        {colTasks.map(task => (
                          <div key={task.id} className="bg-[var(--color-surface-1)] rounded-lg p-2.5  border border-white/60">
                            <p className="text-xs font-semibold text-[var(--color-ink)]">{task.title}</p>
                            {task.assignee && <p className="text-[10px] text-[var(--color-ink-muted)] mt-0.5">👤 {task.assignee}</p>}
                            {task.deadline && <p className="text-[10px] text-amber-500 mt-0.5">📅 {fmtDate(task.deadline)}</p>}
                            <div className="flex gap-1 mt-1.5 flex-wrap">
                              {col !== 'todo' && <button onClick={() => updateTaskStatus(task.id, TASK_COLS[TASK_COLS.indexOf(col) - 1])} className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-hairline)] text-[var(--color-ink-muted)] cursor-pointer">←</button>}
                              {col !== 'done' && <button onClick={() => updateTaskStatus(task.id, TASK_COLS[TASK_COLS.indexOf(col) + 1])} className="text-[9px] px-1.5 py-0.5 rounded font-bold cursor-pointer" style={{ background: cfg.bg, color: cfg.color }}>→</button>}
                            </div>
                          </div>
                        ))}
                        {colTasks.length === 0 && <div className="text-center py-4 text-[10px] text-[var(--color-hairline)] border-2 border-dashed border-[var(--color-hairline)] rounded-lg">Empty</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Comm Log tab */}
          {activeTab === 'comm' && (
            <div className="space-y-4">
              <div className="bg-[var(--color-surface-2)] rounded-xl p-4">
                <h4 className="text-xs font-bold text-[var(--color-ink)] uppercase mb-2">Log Communication</h4>
                <textarea rows={2} value={newNote} onChange={e => setNewNote(e.target.value)}
                  placeholder="Log a client call, email, meeting note..."
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-surface-1)] text-sm focus:outline-none resize-none" />
                <button onClick={addNote} className="mt-2 px-4 py-2 rounded-lg bg-[var(--color-inverse-surface)] text-[var(--color-on-primary)] text-xs font-bold cursor-pointer hover:opacity-90">+ Log Note</button>
              </div>
              <div className="space-y-2">
                {commLogs.length === 0 ? (
                  <div className="text-center py-8 text-[var(--color-ink-muted)] text-sm">
                    <span className="text-3xl block mb-2">💬</span>No communication logs yet
                  </div>
                ) : commLogs.map(log => (
                  <div key={log.id} className="bg-[var(--color-surface-1)] border border-[var(--color-hairline-soft)] rounded-xl p-3">
                    <p className="text-sm text-[var(--color-ink)]">{log.note}</p>
                    <p className="text-[10px] text-[var(--color-ink-muted)] mt-1">👤 {log.author} · {new Date(log.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Checklist tab */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[var(--color-ink)]">Quality Checklist</span>
                  {checklist.length > 0 && <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">{completedChecks}/{checklist.length} done</span>}
                </div>
              </div>
              {checklist.length > 0 && (
                <div className="h-2 bg-[var(--color-surface-2)] border border-[var(--color-hairline)] rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(completedChecks / checklist.length) * 100}%` }} />
                </div>
              )}
              <div className="bg-[var(--color-surface-2)] rounded-xl p-3 flex gap-2">
                <input value={newCheckItem} onChange={e => setNewCheckItem(e.target.value)}
                  placeholder="Add checklist item..."
                  className="flex-1 px-3 py-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-surface-1)] text-sm focus:outline-none"
                  onKeyDown={e => e.key === 'Enter' && addCheckItem()} />
                <button onClick={addCheckItem} className="px-3 py-2 rounded-lg bg-[var(--color-inverse-surface)] text-[var(--color-on-primary)] text-xs font-bold cursor-pointer">+</button>
              </div>
              <div className="space-y-2">
                {checklist.length === 0 ? (
                  <div className="text-center py-8 text-[var(--color-ink-muted)] text-sm">
                    <span className="text-3xl block mb-2">✅</span>No checklist items yet
                  </div>
                ) : checklist.map(item => (
                  <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${item.checked ? 'bg-green-50 border-green-200' : 'bg-[var(--color-surface-1)] border-[var(--color-hairline-soft)]'}`}
                    onClick={() => toggleCheck(item.id)}>
                    <span className={`text-xl flex-shrink-0 ${item.checked ? 'text-green-500' : 'text-[var(--color-hairline)]'}`}>{item.checked ? '✅' : '⬜'}</span>
                    <p className={`text-sm flex-1 ${item.checked ? 'line-through text-[var(--color-ink-muted)]' : 'text-[var(--color-ink)]'}`}>{item.item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Billing tab */}
          {activeTab === 'billing' && (
            <div className="space-y-4">
              <div className="bg-[var(--color-surface-2)] rounded-xl p-5">
                <h4 className="font-bold text-[var(--color-ink)] mb-4">💰 Project Billing Status</h4>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-[var(--color-surface-1)] rounded-xl border border-[var(--color-hairline-soft)]">
                    <span className="text-sm text-[var(--color-ink-muted)]">Budget</span>
                    <span className="text-sm font-bold text-[var(--color-ink)]">{project.budget ? `₹${Number(project.budget).toLocaleString('en-IN')}` : '—'}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-[var(--color-surface-1)] rounded-xl border border-[var(--color-hairline-soft)]">
                    <span className="text-sm text-[var(--color-ink-muted)]">Invoice Status</span>
                    <span className={`text-sm font-bold ${project.invoice_status === 'paid' ? 'text-green-600' : project.invoice_status === 'overdue' ? 'text-red-500' : 'text-amber-500'}`}>
                      {project.invoice_status ? project.invoice_status.toUpperCase() : 'No invoice yet'}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-[var(--color-surface-1)] rounded-xl border border-[var(--color-hairline-soft)]">
                    <span className="text-sm text-[var(--color-ink-muted)]">Project Status</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: STATUS_CFG[project.status]?.bg, color: STATUS_CFG[project.status]?.color }}>
                      {STATUS_CFG[project.status]?.label}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-[var(--color-surface-1)] rounded-xl border border-[var(--color-hairline-soft)]">
                    <span className="text-sm text-[var(--color-ink-muted)]">Completion</span>
                    <span className="text-sm font-bold text-[var(--color-ink)]">{progressVal}%</span>
                  </div>
                </div>
                {!project.invoice_status && (
                  <button 
                    onClick={generateInvoice} 
                    disabled={saving || !project.budget}
                    className="mt-4 w-full py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-opacity"
                    style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)', opacity: (!project.budget || saving) ? 0.5 : 1 }}
                  >
                    {saving ? '⏳ Generating...' : '💳 Generate Invoice & Request Payment'}
                  </button>
                )}
                <a href="/admin/finance/invoices" className="mt-2 block w-full text-center py-2.5 rounded-xl bg-[var(--color-inverse-surface)] text-[var(--color-on-primary)] text-sm font-bold cursor-pointer hover:opacity-90">
                  🧾 View All Invoices
                </a>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Gantt Timeline ────────────────────────────────────────────────
function GanttView({ projects }: { projects: Project[] }) {
  const now = new Date()
  const projectsWithDeadline = projects.filter(p => p.deadline && p.created_at)
  if (projectsWithDeadline.length === 0) return <div className="bg-[var(--color-surface-1)] rounded-2xl p-12 text-center border border-[var(--color-hairline-soft)] text-[var(--color-ink-muted)]"><span className="text-4xl block mb-3">📅</span><p>No projects with deadlines set</p></div>

  const minDate = new Date(Math.min(...projectsWithDeadline.map(p => new Date(p.created_at).getTime())))
  const maxDate = new Date(Math.max(...projectsWithDeadline.map(p => new Date(p.deadline!).getTime())))
  const totalDays = Math.max((maxDate.getTime() - minDate.getTime()) / 86400000, 1)

  return (
    <div className="bg-[var(--color-surface-1)] rounded-2xl p-6 border border-[var(--color-hairline-soft)]  overflow-x-auto">
      <h3 className="font-bold text-[var(--color-ink)] font-heading mb-5">📅 Project Timeline (Gantt)</h3>
      <div className="space-y-3 min-w-[600px]">
        {/* Header */}
        <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-hairline-soft)]">
          <div className="w-40 text-[10px] font-bold text-[var(--color-ink-muted)] uppercase">Project</div>
          <div className="flex-1 relative h-4">
            {[0, 25, 50, 75, 100].map(pct => (
              <div key={pct} className="absolute h-full border-l border-[var(--color-hairline-soft)] text-[9px] text-[var(--color-hairline)]" style={{ left: `${pct}%` }}>
                <span className="ml-1">{new Date(minDate.getTime() + (totalDays * pct / 100) * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              </div>
            ))}
          </div>
        </div>
        {projectsWithDeadline.map(p => {
          const start = (new Date(p.created_at).getTime() - minDate.getTime()) / 86400000
          const end = (new Date(p.deadline!).getTime() - minDate.getTime()) / 86400000
          const left = (start / totalDays) * 100
          const width = Math.max(((end - start) / totalDays) * 100, 2)
          const cfg = STATUS_CFG[p.status] || STATUS_CFG.pending
          const isOverdue = new Date(p.deadline!) < now && p.status !== 'completed'
          return (
            <div key={p.id} className="flex items-center gap-2">
              <div className="w-40 min-w-0">
                <p className="text-xs font-semibold text-[var(--color-ink)] truncate">{p.service_type}</p>
                <p className="text-[10px] text-[var(--color-ink-muted)] truncate">{p.client?.fullname || '—'}</p>
              </div>
              <div className="flex-1 relative h-7 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0, x: `${left}%` }} animate={{ width: `${width}%`, x: `${left}%` }} transition={{ duration: 0.8 }}
                  className="absolute inset-y-1 rounded-full flex items-center px-2"
                  style={{ background: isOverdue ? '#EF4444' : cfg.color, left: `${left}%`, width: `${width}%` }}>
                  <span className="text-[9px] text-[var(--color-on-primary)] font-bold truncate">{cfg.icon} {p.service_type}</span>
                </motion.div>
                {/* Now marker */}
                {now >= minDate && now <= maxDate && (
                  <div className="absolute top-0 bottom-0 w-px bg-red-400" style={{ left: `${((now.getTime() - minDate.getTime()) / 86400000 / totalDays) * 100}%` }} />
                )}
              </div>
              <span className="text-[10px] text-[var(--color-ink-muted)] w-14 text-right">{fmtDate(p.deadline!)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────
export default function ProjectManagerPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'kanban' | 'gantt' | 'list' | 'new'>('kanban')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [contactCard, setContactCard] = useState<{ person: { fullname: string; email: string; phone: string }; label: string } | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ service_type: '', user_id: '', assigned_to: '', budget: '', vendor_price: '', priority: 'medium', deadline: '', description: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = filter ? `?status=${filter}` : ''
      const [pRes, tRes] = await Promise.all([
        fetch(`/api/admin/projects${params}`).then(r => r.json()),
        fetch('/api/admin/operations').then(r => r.json()),
      ])
      setProjects(pRes.projects || [])
      setTeam(tRes.vendors || [])
    } catch {} finally { setLoading(false) }
  }, [filter])

  useEffect(() => { load() }, [load])

  const updateProject = async (id: number, body: Record<string, unknown>) => {
    setUpdatingId(id)
    await fetch(`/api/admin/projects/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    await load(); setUpdatingId(null)
  }

  const toggleEscalate = async (p: Project) => {
    // Store escalation in localStorage for demo
    const key = `escalated_${p.id}`
    const cur = localStorage.getItem(key) === 'true'
    localStorage.setItem(key, (!cur).toString())
    setProjects(prev => prev.map(proj => proj.id === p.id ? { ...proj, is_escalated: !cur } : proj))
  }

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    const payload = { 
      ...form, 
      budget: form.budget ? Number(form.budget) : null, 
      vendor_price: form.vendor_price ? Number(form.vendor_price) : null,
      user_id: Number(form.user_id), 
      assigned_to: form.assigned_to ? Number(form.assigned_to) : undefined 
    }
    await fetch('/api/admin/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setShowNew(false); load(); setSaving(false)
  }

  const filtered = projects
    .map(p => ({ ...p, is_escalated: localStorage.getItem(`escalated_${p.id}`) === 'true' }))
    .filter(p => (filter === '' || p.status === filter) && (search === '' || p.service_type.toLowerCase().includes(search.toLowerCase()) || p.client?.fullname.toLowerCase().includes(search.toLowerCase())))

  const COLS = ['pending', 'assigned', 'in_progress', 'review', 'completed'] as const

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)] font-heading">📋 Project Manager</h1>
          <p className="text-[var(--color-ink-muted)] text-sm">Kanban · Gantt · Task assignment · Client comm · Quality sign-off</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="px-4 py-2.5 rounded-xl font-bold text-[var(--color-on-primary)] text-sm cursor-pointer shadow hover:opacity-90 transition-opacity"
          style={{ background: '#10B981' }}>+ New Project</button>
      </div>

      {/* Search + tabs */}
      <div className="flex gap-3 flex-wrap items-center">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search projects or clients..."
          className="px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-1)] text-sm focus:outline-none focus:border-[var(--color-hairline)] flex-1 min-w-64" />
        <div className="flex gap-1 bg-[var(--color-surface-1)] border border-[var(--color-hairline)] rounded-xl p-1">
          {(['kanban', 'gantt', 'list'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${activeTab === t ? 'bg-[var(--color-surface-2)] text-[var(--color-ink)]' : 'text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-2)] border border-[var(--color-hairline)]'}`}>
              {t === 'kanban' ? '📊 Kanban' : t === 'gantt' ? '📅 Gantt' : '📋 List'}
            </button>
          ))}
        </div>
      </div>

      {/* Status filters */}
      <div className="flex gap-1.5 flex-wrap">
        {['', 'pending', 'in_progress', 'review', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${filter === s ? 'bg-[var(--color-surface-2)] text-[var(--color-ink)]' : 'bg-[var(--color-surface-1)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-2)] border border-[var(--color-hairline)] border border-[var(--color-hairline)]'}`}>
            {s === '' ? `All (${projects.length})` : `${STATUS_CFG[s]?.icon} ${STATUS_CFG[s]?.label} (${projects.filter(p => p.status === s).length})`}
          </button>
        ))}
      </div>

      {/* ── KANBAN VIEW ── */}
      {activeTab === 'kanban' && (
        loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-64 bg-[var(--color-surface-1)] rounded-2xl animate-pulse border border-[var(--color-hairline-soft)]" />)}</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 flex-nowrap overflow-x-auto pb-4">
            {COLS.map(col => {
              const colProjects = filtered.filter(p => p.status === col)
              const cfg = STATUS_CFG[col]
              const nextStatus: Record<string, string> = { pending: 'assigned', assigned: 'in_progress', in_progress: 'review', review: 'completed', completed: 'completed' }
              const prevStatus: Record<string, string> = { pending: 'pending', assigned: 'pending', in_progress: 'assigned', review: 'in_progress', completed: 'review' }
              return (
                <div key={col} className="bg-[var(--color-surface-2)] rounded-2xl p-3 border border-[var(--color-hairline)] min-w-[240px] min-h-[300px]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background: cfg.bg, color: cfg.color }}>{cfg.icon} {cfg.label}</span>
                    <span className="text-xs font-bold text-[var(--color-ink-muted)]">{colProjects.length}</span>
                  </div>
                  <div className="space-y-2">
                    {colProjects.map(p => (
                      <div key={p.id} className="bg-[var(--color-surface-1)] rounded-xl p-3  border border-[var(--color-hairline-soft)] cursor-pointer hover: transition-shadow"
                        onClick={() => setSelectedProject(p)}>
                        <div className="flex items-start justify-between gap-1">
                          <div className="min-w-0">
                            <p className="text-[10px] font-mono text-[var(--color-ink-muted)]">#{p.id}</p>
                            <p className="text-xs font-bold text-[var(--color-ink)] mt-0.5 truncate">{p.service_type}</p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            {p.is_escalated && <span className="text-xs" title="Escalated">🚨</span>}
                            <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: PRIORITY_COLOR[p.priority || 'medium'] }} />
                          </div>
                        </div>
                        {p.client && <p className="text-[10px] text-[var(--color-ink-muted)] mt-1 truncate">👤 {p.client.fullname}</p>}
                        {p.vendor && <p className="text-[10px] text-[var(--color-ink-muted)] truncate">🔧 {p.vendor.fullname}</p>}
                        {p.deadline && <p className="text-[10px] text-amber-500 mt-1">{fmtDeadline(p.deadline)}</p>}
                        {p.budget && <p className="text-[10px] text-green-600 font-bold">₹{(Number(p.budget) / 1000).toFixed(0)}K</p>}
                        <div className="mt-2 flex gap-1">
                          {col !== 'pending' && <button onClick={e => { e.stopPropagation(); updateProject(p.id, { status: prevStatus[col] }) }} className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-hairline)] text-[var(--color-ink-muted)] cursor-pointer hover:bg-[var(--color-surface-2)] border border-[var(--color-hairline-soft)]">← Back</button>}
                          {col !== 'completed' && <button onClick={e => { e.stopPropagation(); updateProject(p.id, { status: nextStatus[col] }) }} className="text-[9px] px-1.5 py-0.5 rounded font-bold cursor-pointer" style={{ background: cfg.bg, color: cfg.color }}>→ Next</button>}
                          <button onClick={e => { e.stopPropagation(); toggleEscalate(p) }} className={`text-[9px] px-1.5 py-0.5 rounded cursor-pointer ml-auto ${p.is_escalated ? 'bg-red-100 text-red-600' : 'bg-[var(--color-surface-2)] border border-[var(--color-hairline)] text-[var(--color-ink-muted)]'}`} title="Flag escalation">🚨</button>
                        </div>
                      </div>
                    ))}
                    {colProjects.length === 0 && <div className="text-center py-8 text-[var(--color-hairline)] text-xs border-2 border-dashed border-[var(--color-hairline)] rounded-xl">Drop zone</div>}
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {/* ── GANTT VIEW ── */}
      {activeTab === 'gantt' && !loading && <GanttView projects={filtered} />}

      {/* ── LIST VIEW ── */}
      {activeTab === 'list' && (
        <div className="bg-[var(--color-surface-1)] rounded-2xl  border border-[var(--color-hairline-soft)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="bg-[var(--color-surface-2)] border-b border-[var(--color-hairline-soft)]">
                {['#', 'Service', 'Client', 'Assignee', 'Budget', 'Status', 'Priority', 'Deadline', 'Flags', 'Actions'].map(h => (
                  <th key={h} className="px-3 py-3 text-left font-bold text-[var(--color-ink-muted)] uppercase text-[10px] whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={10} className="p-3"><div className="h-10 bg-[var(--color-surface-2)] border border-[var(--color-hairline)] rounded animate-pulse" /></td></tr>) :
                  filtered.length === 0 ? <tr><td colSpan={10} className="p-10 text-center text-[var(--color-ink-muted)]">No projects</td></tr> :
                    filtered.map(p => (
                      <tr key={p.id} className="border-b border-[var(--color-hairline-soft)] hover:bg-[var(--color-canvas)] transition-colors">
                        <td className="px-3 py-3 font-mono text-[var(--color-ink-muted)]">#{p.id}</td>
                        <td className="px-3 py-3">
                          <button onClick={() => setSelectedProject(p)} className="text-left group cursor-pointer">
                            <p className="font-semibold text-[var(--color-ink)] group-hover:text-accent transition-colors truncate max-w-[130px]">{p.service_type}</p>
                          </button>
                        </td>
                        <td className="px-3 py-3">
                          {p.client ? (
                            <button onClick={() => setContactCard({ person: p.client!, label: 'Client' })} className="text-left cursor-pointer group">
                              <p className="font-medium text-[var(--color-ink)] group-hover:text-accent transition-colors truncate max-w-[100px]">{p.client.fullname}</p>
                            </button>
                          ) : <span className="text-[var(--color-hairline)]">—</span>}
                        </td>
                        <td className="px-3 py-3">
                          <select value={p.vendor?.id || ''} onChange={e => {
                            const assigned_to = e.target.value ? Number(e.target.value) : null
                            updateProject(p.id, { assigned_to })
                          }} className="w-full text-xs font-medium text-[var(--color-ink)] bg-transparent outline-none cursor-pointer">
                            <option value="">— Unassigned —</option>
                            {team.map(m => <option key={m.id} value={m.id}>{m.fullname}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-3 font-semibold text-[var(--color-ink)]">{p.budget ? `₹${(Number(p.budget) / 1000).toFixed(0)}K` : '—'}</td>
                        <td className="px-3 py-3">
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold whitespace-nowrap" style={{ background: STATUS_CFG[p.status]?.bg, color: STATUS_CFG[p.status]?.color }}>
                            {STATUS_CFG[p.status]?.icon} {STATUS_CFG[p.status]?.label}
                          </span>
                        </td>
                        <td className="px-3 py-3 capitalize" style={{ color: PRIORITY_COLOR[p.priority || 'medium'] }}>● {p.priority || 'medium'}</td>
                        <td className="px-3 py-3 text-[var(--color-ink-muted)]">{p.deadline ? fmtDeadline(p.deadline) : '—'}</td>
                        <td className="px-3 py-3">{p.is_escalated && <span title="Escalated" className="text-base">🚨</span>}</td>
                        <td className="px-3 py-3">
                          {updatingId === p.id ? (
                            <div className="w-4 h-4 border-2 border-[var(--color-hairline)]/20 border-t-navy rounded-full animate-spin" />
                          ) : (
                            <select value={p.status} onChange={e => updateProject(p.id, { status: e.target.value })}
                              className="text-xs px-2 py-1.5 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-surface-1)] focus:outline-none cursor-pointer">
                              {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="bg-[var(--color-surface-1)] rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-black/80 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-[var(--color-ink)] font-heading">+ New Project</h3>
                <button onClick={() => setShowNew(false)} className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] cursor-pointer text-xl">✕</button>
              </div>
              <form onSubmit={createProject} className="space-y-3">
                <input required value={form.service_type} onChange={e => setForm(p => ({ ...p, service_type: e.target.value }))}
                  placeholder="Project / Service type *" className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-2)] text-sm focus:outline-none focus:border-[var(--color-hairline)]" />
                <input required type="number" value={form.user_id} onChange={e => setForm(p => ({ ...p, user_id: e.target.value }))}
                  placeholder="Client User ID *" className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-2)] text-sm focus:outline-none focus:border-[var(--color-hairline)]" />
                <select value={form.assigned_to} onChange={e => setForm(p => ({ ...p, assigned_to: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-2)] text-sm focus:outline-none">
                  <option value="">— Assign to (optional) —</option>
                  {team.map(m => <option key={m.id} value={m.id}>{m.fullname}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
                    placeholder="Client Budget (₹)" className="px-3 py-2.5 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-2)] text-sm focus:outline-none" />
                  <input type="number" value={form.vendor_price} onChange={e => setForm(p => ({ ...p, vendor_price: e.target.value }))}
                    placeholder="Vendor Price (₹)" className="px-3 py-2.5 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-2)] text-sm focus:outline-none" />
                  <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-2)] text-sm focus:outline-none">
                    {['low', 'medium', 'high', 'urgent'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-2)] text-sm focus:outline-none" />
                </div>
                <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Description..." className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-2)] text-sm focus:outline-none resize-none" />
                <button type="submit" disabled={saving}
                  className="w-full py-3 rounded-xl font-bold text-[var(--color-on-primary)] cursor-pointer disabled:opacity-60 hover:opacity-90 transition-opacity"
                  style={{ background: 'var(--color-accent-blue)' }}>
                  {saving ? '⏳ Creating...' : '✅ Create Project'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Detail Panel */}
      <AnimatePresence>
        {selectedProject && <ProjectDetailPanel project={selectedProject} onClose={() => setSelectedProject(null)} team={team} updateProject={(id, body) => { updateProject(id, body); setSelectedProject(prev => prev && prev.id === id ? { ...prev, vendor: body.assigned_to ? team.find((t) => t.id === body.assigned_to) as any : prev.vendor, assigned_to: body.assigned_to } : prev); }} />}
      </AnimatePresence>
      <AnimatePresence>
        {contactCard && <ContactCard person={contactCard.person} label={contactCard.label} onClose={() => setContactCard(null)} />}
      </AnimatePresence>
    </div>
  )
}

