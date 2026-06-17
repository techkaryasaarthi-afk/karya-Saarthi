'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Project {
  id: number
  title: string
  description: string
  status: string
  budget: number | null
  created_at: string
  customer_name?: string
}

const statusColors: Record<string, { bg: string; color: string }> = {
  pending: { bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' },
  in_progress: { bg: 'rgba(6, 182, 212, 0.1)', color: '#06B6D4' },
  completed: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' },
  cancelled: { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' },
}

export default function VendorProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/projects?role=vendor')
      .then(r => r.json())
      .then(d => { setProjects(d.projects || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter)

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} /></div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="text-display-md" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>📋 My Projects</h1>
        <p className="text-body-sm" style={{ color: 'var(--color-ink-muted)', marginTop: 4 }}>All projects assigned to you</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {[
          { key: 'all', label: 'All', count: projects.length },
          { key: 'in_progress', label: 'Active', count: projects.filter(p => p.status === 'in_progress').length },
          { key: 'completed', label: 'Completed', count: projects.filter(p => p.status === 'completed').length },
          { key: 'pending', label: 'Pending', count: projects.filter(p => p.status === 'pending').length },
        ].map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={filter === t.key ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, borderRadius: 'var(--radius-pill)', cursor: 'pointer' }}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {filtered.length === 0 ? (
        <div className="card-template" style={{ padding: 40, textAlign: 'center' }}>
          <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>📋</span>
          <p className="text-body-sm" style={{ color: 'var(--color-ink-muted)' }}>No projects found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map((project, i) => {
            const sc = statusColors[project.status] || { bg: 'var(--color-surface-2)', color: 'var(--color-ink)' }
            return (
            <motion.div key={project.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card-template" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                  <h3 className="text-body-md" style={{ fontWeight: 700, color: 'var(--color-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.title}</h3>
                  <p className="text-micro" style={{ color: 'var(--color-ink-muted)', marginTop: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{project.description}</p>
                </div>
                <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-pill)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', backgroundColor: sc.bg, color: sc.color, flexShrink: 0 }}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--color-hairline-soft)' }}>
                <span className="text-micro" style={{ fontWeight: 600, color: 'var(--color-ink-muted)' }}>{project.budget ? `₹${Number(project.budget).toLocaleString('en-IN')}` : 'No budget'}</span>
                <span className="text-micro" style={{ color: 'var(--color-ink-muted)' }}>{new Date(project.created_at).toLocaleDateString('en-IN')}</span>
              </div>
            </motion.div>
          )})}
        </div>
      )}
    </div>
  )
}
