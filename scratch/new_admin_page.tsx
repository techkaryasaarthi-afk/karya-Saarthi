'use client'

import { useEffect, useState } from 'react'
import { motion } from '@/lib/motion'
import Link from 'next/link'

interface DashboardData {
  stats: {
    totalUsers: number
    totalAdmins: number
    totalVendors: number
    totalProjects: number
    pendingRequests: number
    totalBlogs: number
    totalRevenue: number
  }
  projectStats: {
    pending: number
    in_progress: number
    completed: number
    cancelled: number
  }
  recentActivity: Array<{
    id: number
    action: string
    details: string
    created_at: string
  }>
  userRole: string
  userDepartment: string | null
}

const statCards = [
  { key: 'totalUsers', icon: '👥', label: 'Total Users', color: '#3B82F6' },
  { key: 'totalAdmins', icon: '🛡️', label: 'Admins', color: '#A855F7' },
  { key: 'totalVendors', icon: '🏪', label: 'Vendors', color: '#06B6D4' },
  { key: 'totalProjects', icon: '📋', label: 'Projects', color: '#F59E0B' },
  { key: 'pendingRequests', icon: '📩', label: 'Pending Requests', color: '#EF4444' },
  { key: 'totalBlogs', icon: '📝', label: 'Blogs', color: '#22C55E' },
]

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="skeleton" style={{ height: 32, width: 200, borderRadius: 'var(--radius-sm)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 128, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      </div>
    )
  }

  if (!data) return <p style={{ color: '#ef4444' }}>Failed to load dashboard data.</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="text-display-md" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>
            {data.userRole === 'super_admin' ? '👑 Super Admin' : '📊'} Dashboard
          </h1>
          <p className="text-body-sm" style={{ color: 'var(--color-ink-muted)', marginTop: 4 }}>Overview of your platform performance</p>
        </div>
        <div className="text-body-sm" style={{ color: 'var(--color-ink-muted)' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {statCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card-template"
            style={{ padding: 20, position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                {card.icon}
              </span>
              {card.key === 'pendingRequests' && data.stats.pendingRequests > 0 && (
                <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#fc8181', fontSize: 10, fontWeight: 700 }}>
                  NEW
                </span>
              )}
            </div>
            <h3 className="text-display-lg" style={{ fontFamily: 'var(--font-display)', color: card.color }}>
              {data.stats[card.key as keyof typeof data.stats]}
            </h3>
            <p className="text-caption" style={{ color: 'var(--color-ink-muted)', marginTop: 4 }}>{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          background: 'linear-gradient(135deg, #0099ff22 0%, #141414 60%, #1c1c1c 100%)',
          border: '1px solid rgba(0,153,255,0.2)',
          borderRadius: 'var(--radius-xl)',
          padding: 24,
          boxShadow: 'var(--shadow-level-3)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}
      >
        <div>
          <p className="text-body-sm" style={{ color: 'var(--color-ink-muted)' }}>Total Revenue</p>
          <h2 className="text-display-xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)', marginTop: 4 }}>
            ₹{data.stats.totalRevenue.toLocaleString('en-IN')}
          </h2>
        </div>
        <span style={{ fontSize: 48, opacity: 0.3 }}>💰</span>
      </motion.div>

      {/* Project Status + Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        {/* Project Status Breakdown */}
        <div className="card-template" style={{ padding: 24 }}>
          <h3 className="text-headline" style={{ color: 'var(--color-ink)', fontWeight: 700, marginBottom: 16 }}>Project Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Pending', value: data.projectStats.pending, color: '#F59E0B', total: data.stats.totalProjects },
              { label: 'In Progress', value: data.projectStats.in_progress, color: '#3B82F6', total: data.stats.totalProjects },
              { label: 'Completed', value: data.projectStats.completed, color: '#22C55E', total: data.stats.totalProjects },
              { label: 'Cancelled', value: data.projectStats.cancelled, color: '#EF4444', total: data.stats.totalProjects },
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: 'var(--color-ink-muted)' }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-ink)' }}>{item.value}</span>
                </div>
                <div style={{ width: '100%', height: 6, borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--color-surface-2)', overflow: 'hidden' }}>
                  <div
                    style={{ height: '100%', backgroundColor: item.color, borderRadius: 'var(--radius-pill)', transition: 'width 700ms ease', width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-template" style={{ padding: 24 }}>
          <h3 className="text-headline" style={{ color: 'var(--color-ink)', fontWeight: 700, marginBottom: 16 }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {[
              { icon: '📩', label: 'Staff Requests', href: '/admin/staff-requests', count: data.stats.pendingRequests },
              { icon: '👥', label: 'Manage Users', href: '/admin/users' },
              { icon: '📝', label: 'New Blog Post', href: '/admin/blogs/new' },
              { icon: '📋', label: 'All Projects', href: '/admin/projects' },
              { icon: '🏪', label: 'Vendors', href: '/admin/vendors' },
              { icon: '📈', label: 'Analytics', href: '/admin/analytics' },
            ].map(action => (
              <Link
                key={action.href}
                href={action.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                  backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-hairline-soft)',
                  borderRadius: 'var(--radius-md)', textDecoration: 'none', transition: 'background-color var(--dur-fast)'
                }}
              >
                <span style={{ fontSize: 20 }}>{action.icon}</span>
                <div>
                  <span className="text-body-sm" style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{action.label}</span>
                  {action.count !== undefined && action.count > 0 && (
                    <span style={{ marginLeft: 8, padding: '2px 6px', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#fc8181', fontSize: 10, fontWeight: 700 }}>
                      {action.count}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card-template" style={{ padding: 24 }}>
        <h3 className="text-headline" style={{ color: 'var(--color-ink)', fontWeight: 700, marginBottom: 16 }}>Recent Activity</h3>
        {data.recentActivity.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-ink-muted)' }}>
            <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>📭</span>
            <p className="text-body-sm">No recent activity</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.recentActivity.map(activity => (
              <div key={activity.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 12, borderRadius: 'var(--radius-md)', transition: 'background-color var(--dur-fast)', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <div style={{ width: 8, height: 8, marginTop: 6, borderRadius: '50%', backgroundColor: 'var(--color-accent-blue)', flexShrink: 0 }} />
                <div>
                  <p className="text-body-sm" style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{activity.action}</p>
                  <p className="text-micro" style={{ color: 'var(--color-ink-muted)', marginTop: 2 }}>{activity.details}</p>
                  <p className="text-micro" style={{ color: 'var(--color-hairline)', marginTop: 4 }}>
                    {new Date(activity.created_at).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
