'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from '@/lib/motion'

interface Meeting {
  id: number
  title: string
  description: string | null
  jitsi_room: string
  scheduled_at: string | null
  duration_min: number
  created_by: number
  creator?: { fullname: string } | null
}

export default function DepartmentMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [activeCall, setActiveCall] = useState<Meeting | null>(null)

  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [durationMin, setDurationMin] = useState(60)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchMeetings = async () => {
    try {
      const res = await fetch('/api/admin/meetings')
      if (res.ok) {
        const data = await res.json()
        setMeetings(data.meetings || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMeetings()
  }, [])

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    setError('')

    const roomSlug = `karyasaarthi-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`

    try {
      const res = await fetch('/api/admin/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description.trim() || null,
          jitsi_room: roomSlug,
          scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
          duration_min: Number(durationMin),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to schedule meeting')
      }

      setTitle('')
      setDescription('')
      setScheduledAt('')
      setDurationMin(60)
      setShowScheduleForm(false)
      fetchMeetings()
    } catch (err: any) {
      setError(err.message || 'Failed to create meeting')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this meeting?')) return
    try {
      const res = await fetch('/api/admin/meetings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        fetchMeetings()
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-4">
      {/* Meetings Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-navy font-heading text-base flex items-center gap-2">
          <span>📹 Video Meetings</span>
          <span className="bg-[rgba(0,153,255,0.12)] text-navy text-[10px] px-2 py-0.5 rounded-full font-bold">
            {meetings.length} Total
          </span>
        </h3>
        <button
          onClick={() => setShowScheduleForm(!showScheduleForm)}
          className="text-xs bg-accent text-white font-bold px-3 py-1.5 rounded-xl hover:bg-accent-dark transition-all cursor-pointer shadow shadow-accent/20"
        >
          {showScheduleForm ? 'Close' : '+ Schedule'}
        </button>
      </div>

      {/* Schedule Form */}
      <AnimatePresence>
        {showScheduleForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSchedule}
            className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3"
          >
            <h4 className="text-xs font-bold text-navy font-heading">🗓 Schedule New Jitsi Call</h4>
            <input
              type="text"
              placeholder="Meeting Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-navy"
              required
            />
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-navy"
            />
            <div className="grid grid-cols-2 gap-2">
              <label className="text-[10px] text-slate-500 font-semibold space-y-1 block">
                <span>Date & Time</span>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                  required
                />
              </label>
              <label className="text-[10px] text-slate-500 font-semibold space-y-1 block">
                <span>Duration (min)</span>
                <select
                  value={durationMin}
                  onChange={e => setDurationMin(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none cursor-pointer"
                >
                  <option value={15}>15 mins</option>
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </label>
            </div>
            {error && <p className="text-[10px] font-bold text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 bg-accent text-white text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer"
            >
              {submitting ? '⏳ Scheduling...' : '🚀 Create Meeting'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Meetings List */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
          ))
        ) : meetings.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
            No meetings scheduled.
          </div>
        ) : (
          meetings.map(m => {
            const timeStr = m.scheduled_at
              ? new Date(m.scheduled_at).toLocaleString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Flexible Time'

            return (
              <div
                key={m.id}
                className="p-3 bg-white border border-slate-100 rounded-xl hover:border-slate-200 hover:shadow-sm transition-all text-xs flex justify-between items-center gap-3"
              >
                <div className="min-w-0">
                  <h4 className="font-bold text-navy truncate" title={m.title}>{m.title}</h4>
                  {m.description && <p className="text-slate-400 text-[10px] truncate">{m.description}</p>}
                  <div className="flex gap-2 items-center text-[10px] text-slate-500 mt-1">
                    <span>📅 {timeStr}</span>
                    <span>• {m.duration_min} min</span>
                    {m.creator && <span className="text-accent">by {m.creator.fullname}</span>}
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => setActiveCall(m)}
                    className="px-3 py-1.5 rounded-lg bg-green-500 text-white font-bold text-[10px] hover:bg-green-600 transition-colors cursor-pointer shadow-sm shadow-green-500/25"
                  >
                    Join
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                    title="Cancel meeting"
                  >
                    🗑
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Embedded Jitsi Meeting Modal */}
      <AnimatePresence>
        {activeCall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex flex-col p-4"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <h3 className="font-bold text-white text-sm font-heading">KaryaSaarthi Live Room</h3>
              </div>
              <div className="flex gap-2">
                <a
                  href={`https://meet.jit.si/${activeCall.jitsi_room}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white/10 text-white font-semibold text-xs rounded-xl hover:bg-white/20 transition-all"
                >
                  ↗ Open in Jitsi App
                </a>
                <button
                  onClick={() => setActiveCall(null)}
                  className="px-3 py-1.5 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700 transition-all cursor-pointer"
                >
                  Disconnect ✕
                </button>
              </div>
            </div>

            <div className="flex-1 w-full bg-slate-900 rounded-2xl flex flex-col items-center justify-center p-8 text-center border border-white/10">
              <span className="text-6xl mb-4">🎥</span>
              <h3 className="text-xl font-bold text-white font-heading mb-2">Ready to join &ldquo;{activeCall.title}&rdquo;?</h3>
              {activeCall.creator && (
                <p className="text-xs text-accent font-bold mb-2">👑 Host/Owner: {activeCall.creator.fullname}</p>
              )}
              <p className="text-slate-400 text-xs max-w-md mb-6 leading-relaxed">
                To guarantee microphone and camera access with full security, Jitsi meetings must be launched in a secure external tab.
                <br />
                <span className="text-amber-500 font-semibold mt-2.5 block">
                  ⚠️ Host Note: The meeting host should join the room first to obtain Jitsi moderator privileges. Guests joining before the host may gain moderator status automatically.
                </span>
              </p>
              <a
                href={`https://meet.jit.si/${activeCall.jitsi_room}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setActiveCall(null)}
                className="px-8 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-green-500/20"
              >
                🚀 Launch Jitsi Meeting Room
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

