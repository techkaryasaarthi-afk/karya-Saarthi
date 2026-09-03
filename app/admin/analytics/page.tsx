'use client'

import { useEffect, useState } from 'react'
import { motion } from '@/lib/motion'
import DepartmentMeetings from '@/components/admin/DepartmentMeetings'

interface Stats {
  totalRevenue: number
  totalProjects: number
  totalUsers: number
  totalVendors: number
  completedProjects: number
  pendingProjects: number
  activeProjects: number
  totalLeads: number
  wonLeads: number
  totalServices: number
  totalEvents: number
  totalBlogViews: number
}

interface MonthlyData {
  month: string
  revenue: number
  projects: number
}

const BAR_COLORS = ['#0099ff', '#3b82f6', '#6a4cf5', '#ff7a3d', '#22c55e', '#f59e0b']

function BarChart({ data, valueKey }: { data: MonthlyData[]; valueKey: 'revenue' | 'projects' }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
      {data.map((d, i) => (
        <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }} className="group">
          <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: 96 }}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d[valueKey] / max) * 100}%` }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: 'easeOut' }}
              style={{
                width: '100%',
                borderRadius: '6px 6px 0 0',
                background: `linear-gradient(180deg, ${BAR_COLORS[i % BAR_COLORS.length]} 0%, ${BAR_COLORS[i % BAR_COLORS.length]}88 100%)`,
                minHeight: 4,
                cursor: 'pointer',
              }}
            />
            <div style={{
              position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 6,
              whiteSpace: 'nowrap', pointerEvents: 'none',
              opacity: 0, transition: 'opacity 0.15s',
            }} className="group-hover:opacity-100">
              {valueKey === 'revenue' ? `₹${d.revenue.toLocaleString('en-IN')}` : d.projects}
            </div>
          </div>
          <span style={{ fontSize: 10, color: 'var(--color-ink-muted)', fontWeight: 500 }}>{d.month}</span>
        </div>
      ))}
    </div>
  )
}

function StatCard({ label, value, icon, color, change, delay }: {
  label: string; value: string | number; icon: string; color: string; change: string; delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      style={{
        background: 'var(--color-surface-1)',
        border: '1px solid var(--color-hairline)',
        borderRadius: 16,
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      whileHover={{ borderColor: `${color}44`, boxShadow: `0 0 0 1px ${color}22, 0 8px 32px rgba(0,0,0,0.4)` }}
    >
      {/* Subtle color glow at top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        opacity: 0.6,
      }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
          background: `${color}18`, color: color, letterSpacing: '0.02em',
        }}>{change}</span>
      </div>
      <p style={{ fontSize: 28, fontWeight: 800, color, marginBottom: 4, lineHeight: 1, letterSpacing: '-0.5px', fontFamily: 'var(--font-display)' }}>
        {value}
      </p>
      <p style={{ fontSize: 12, color: 'var(--color-ink-muted)', fontWeight: 500 }}>{label}</p>
    </motion.div>
  )
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [monthly, setMonthly] = useState<MonthlyData[]>([])
  const [lookerUrl, setLookerUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/analytics?range=${range}`)
      .then(r => r.json())
      .then(d => { setStats(d.stats); setMonthly(d.monthly || []); setLookerUrl(d.lookerUrl || ''); setLoading(false) })
      .catch(() => setLoading(false))
  }, [range])

  const kpis = stats ? [
    { label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`, icon: '💰', color: '#22c55e', change: '+12%' },
    { label: 'Total Projects', value: stats.totalProjects, icon: '📋', color: '#3b82f6', change: `${stats.activeProjects} active` },
    { label: 'Total Clients', value: stats.totalUsers, icon: '👥', color: '#a78bfa', change: `${Math.round(stats.totalUsers * 0.1)} new` },
    { label: 'Vendors', value: stats.totalVendors, icon: '🏪', color: '#f59e0b', change: 'Approved' },
    { label: 'Total Leads', value: stats.totalLeads, icon: '🎯', color: '#ff7a3d', change: `${stats.wonLeads} won` },
    { label: 'Completion', value: `${stats.totalProjects > 0 ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0}%`, icon: '✅', color: '#06b6d4', change: `${stats.completedProjects} done` },
    { label: 'Blog Views', value: (stats.totalBlogViews || 0).toLocaleString(), icon: '👁️', color: '#ec4899', change: 'All time' },
    { label: 'Events', value: stats.totalEvents, icon: '📅', color: '#8b5cf6', change: 'Hosted' },
  ] : []

  const surface: React.CSSProperties = {
    background: 'var(--color-surface-1)',
    border: '1px solid var(--color-hairline)',
    borderRadius: 16,
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, maxWidth: 1400, alignItems: 'start' }}
      className="analytics-grid">

      {/* ── Left column ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-display)', letterSpacing: '-0.5px', margin: 0 }}>
              📈 Analytics
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginTop: 2, margin: 0 }}>Platform-wide performance metrics</p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['7d', '30d', '90d', '1y'] as const).map(r => (
              <button key={r} onClick={() => setRange(r)} style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                border: range === r ? 'none' : '1px solid var(--color-hairline)',
                background: range === r ? 'var(--color-accent-blue)' : 'transparent',
                color: range === r ? '#fff' : 'var(--color-ink-muted)',
                transition: 'all 0.15s',
              }}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ height: 110, background: 'var(--color-surface-1)', borderRadius: 16, border: '1px solid var(--color-hairline)', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="kpi-grid">
            {kpis.map((k, i) => (
              <StatCard key={k.label} {...k} delay={i * 0.06} />
            ))}
          </div>
        )}

        {/* Charts row */}
        {monthly.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="chart-grid">
            {[
              { title: '💰 Monthly Revenue', key: 'revenue' as const },
              { title: '📋 Monthly Projects', key: 'projects' as const },
            ].map(({ title, key }) => (
              <div key={key} style={{ ...surface, padding: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 20 }}>{title}</p>
                <BarChart data={monthly} valueKey={key} />
              </div>
            ))}
          </div>
        )}

        {/* Pipeline + Lead Conversion row */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="chart-grid">
            {/* Project Pipeline */}
            <div style={{ ...surface, padding: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 20 }}>🔄 Project Pipeline</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Pending', value: stats.pendingProjects, color: '#f59e0b' },
                  { label: 'Active', value: stats.activeProjects, color: '#3b82f6' },
                  { label: 'Completed', value: stats.completedProjects, color: '#22c55e' },
                ].map(item => {
                  const pct = stats.totalProjects > 0 ? Math.round((item.value / stats.totalProjects) * 100) : 0
                  return (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--color-ink-muted)', fontWeight: 500 }}>{item.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.value} <span style={{ color: 'var(--color-ink-muted)', fontWeight: 400 }}>({pct}%)</span></span>
                      </div>
                      <div style={{ height: 6, background: 'var(--color-hairline)', borderRadius: 3, overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }}
                          style={{ height: '100%', borderRadius: 3, background: item.color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Lead Conversion */}
            <div style={{ ...surface, padding: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 20 }}>🎯 Lead Conversion</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <p style={{ fontSize: 42, fontWeight: 800, color: '#22c55e', lineHeight: 1, fontFamily: 'var(--font-display)', letterSpacing: '-1px' }}>
                    {stats.totalLeads > 0 ? Math.round((stats.wonLeads / stats.totalLeads) * 100) : 0}%
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--color-ink-muted)', marginTop: 4 }}>Conversion Rate</p>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Total Leads', value: stats.totalLeads, color: 'var(--color-ink-muted)' },
                    { label: 'Won', value: stats.wonLeads, color: '#22c55e' },
                    { label: 'Lost', value: Math.max(0, stats.totalLeads - stats.wonLeads), color: '#ef4444' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, color: 'var(--color-ink-muted)', width: 72, flexShrink: 0 }}>{item.label}</span>
                      <div style={{ flex: 1, height: 5, background: 'var(--color-hairline)', borderRadius: 3, overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }}
                          animate={{ width: `${stats.totalLeads > 0 ? (item.value / stats.totalLeads) * 100 : 0}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          style={{ height: '100%', borderRadius: 3, background: item.color }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: item.color, width: 24, textAlign: 'right', flexShrink: 0 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Google Analytics / Looker Studio ── */}
        <div style={{ ...surface, overflow: 'hidden' }}>
          {/* Header bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-hairline)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #ea4335, #fbbc04, #34a853, #4285f4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
              }}>
                📊
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>Google Analytics</p>
                <p style={{ fontSize: 11, color: 'var(--color-ink-muted)', margin: 0 }}>
                  Live traffic · Property G-N2BL9SLZ8R · Stream ID 15633189188
                </p>
              </div>
            </div>
            {lookerUrl && (
              <a href="https://lookerstudio.google.com" target="_blank" rel="noopener noreferrer" style={{
                fontSize: 12, color: 'var(--color-accent-blue)', fontWeight: 600,
                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4,
                padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(0,153,255,0.3)',
                transition: 'background 0.15s',
              }}>
                Open in Looker ↗
              </a>
            )}
          </div>

          {/* Content */}
          {lookerUrl ? (
            <div style={{ position: 'relative', width: '100%', paddingBottom: '65%' }}>
              <iframe
                src={lookerUrl}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                allowFullScreen
                loading="lazy"
                title="Google Analytics — Karyasaarthi"
              />
            </div>
          ) : (
            <div style={{ padding: 32 }}>
              <div style={{ maxWidth: 560, margin: '0 auto' }}>

                {/* Setup steps */}
                <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginBottom: 20, textAlign: 'center' }}>
                  Connect your GA4 Looker Studio report to see live traffic data here.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {[
                    { n: '1', title: 'Create Looker Studio report', desc: 'Go to lookerstudio.google.com → Blank Report → Add Data → Google Analytics → select "karyasaarthi" property.' },
                    { n: '2', title: 'Build your dashboard', desc: 'Add Scorecards (Sessions, Users, Page Views), Time Series chart, and a Top Pages table.' },
                    { n: '3', title: 'Get embed URL', desc: 'Share → Embed report → Enable embedding → Copy the URL (starts with lookerstudio.google.com/embed/...).' },
                    { n: '4', title: 'Add env variable', desc: 'In Vercel settings, add LOOKER_STUDIO_URL=<your-embed-url> and redeploy.' },
                  ].map(s => (
                    <div key={s.n} style={{
                      display: 'flex', gap: 14, padding: '14px 16px',
                      background: 'var(--color-surface-2)', border: '1px solid var(--color-hairline)',
                      borderRadius: 12, alignItems: 'flex-start',
                    }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', background: 'var(--color-accent-blue)',
                        color: '#fff', fontSize: 11, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
                      }}>{s.n}</div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 2px' }}>{s.title}</p>
                        <p style={{ fontSize: 12, color: 'var(--color-ink-muted)', margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Env snippet */}
                <div style={{
                  background: 'var(--color-surface-2)', border: '1px solid rgba(0,153,255,0.2)',
                  borderRadius: 10, padding: '12px 16px', marginBottom: 20,
                }}>
                  <p style={{ fontSize: 11, color: 'var(--color-accent-blue)', fontWeight: 700, margin: '0 0 6px' }}>📝 Vercel Environment Variable</p>
                  <code style={{ fontSize: 12, color: '#22c55e', fontFamily: 'monospace', wordBreak: 'break-all', display: 'block' }}>
                    LOOKER_STUDIO_URL=https://lookerstudio.google.com/embed/reporting/YOUR-ID/page/PAGE-ID
                  </code>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <a href="https://lookerstudio.google.com" target="_blank" rel="noopener noreferrer" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '10px 20px', borderRadius: 10,
                    background: 'linear-gradient(135deg, #4285f4, #34a853)',
                    color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none',
                    boxShadow: '0 4px 16px rgba(66,133,244,0.3)',
                    transition: 'opacity 0.15s',
                  }}>
                    🚀 Open Looker Studio
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Right sidebar ── */}
      <div style={{ position: 'sticky', top: 20 }}>
        <div style={{ ...surface, padding: 20 }}>
          <DepartmentMeetings />
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .analytics-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 900px) {
          .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .chart-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .kpi-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
