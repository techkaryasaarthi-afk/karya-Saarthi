'use client'

import { useEffect, useState } from 'react'
import { motion } from '@/lib/motion'
import CustomerProfileModal from '@/components/admin/CustomerProfileModal'
import VendorProfileModal from '@/components/admin/VendorProfileModal'
import { STAFF_ROLE_CONFIGS, formatDepartmentLabel } from '@/lib/org'

interface User {
  id: number
  fullname: string
  email: string
  phone: string
  role: string
  department: string | null
  pillar_role: string | null
  designation: string | null
  is_approved: boolean
  status: string
  created_at: string
  last_login: string | null
}

const roleColors: Record<string, { bg: string, color: string }> = {
  super_admin: { bg: 'rgba(168, 85, 247, 0.1)', color: '#A855F7' },
  admin: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' },
  board_member: { bg: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' },
  vendor: { bg: 'rgba(6, 182, 212, 0.1)', color: '#06B6D4' },
  customer: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' },
  pending_admin: { bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' },
}

const roleLabel = (user: User) => {
  if (user.designation) return user.designation
  if (user.role === 'admin' && user.department) {
    if (user.department === 'operations' && user.pillar_role === 'project_manager') return 'Project Manager'
    if (user.department === 'operations') return 'Operation Head'
    if (user.department === 'digital') return 'Digital Marketing Head'
    if (user.department === 'marketing') return 'Marketing Head'
    return `${formatDepartmentLabel(user.department)} Head`
  }
  if (user.role === 'pillar_member' && user.pillar_role)
    return `${user.pillar_role.replace('_', ' ')} Saarthi`
  return user.role.replace('_', ' ')
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [profileUserId, setProfileUserId] = useState<number | null>(null)
  const [profileVendorId, setProfileVendorId] = useState<number | null>(null)
  // Current user role — determines if role-change controls show
  const [myRole, setMyRole] = useState<string>('')

  // Fetch logged-in user's role first
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setMyRole(d.role || '')).catch(() => {})
  }, [])

  const isSuperAdmin = myRole === 'super_admin'

  const fetchUsers = async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (search) params.set('search', search)
    // Non-super-admins only see customers & vendors (their CRM view)
    if (!isSuperAdmin) {
      params.set('role', roleFilter || 'customer,vendor')
    } else if (roleFilter) {
      params.set('role', roleFilter)
    }
    const res = await fetch(`/api/admin/users?${params}`)
    const data = await res.json()
    setUsers(data.users || [])
    setTotal(data.total || 0)
    setLoading(false)
  }

  useEffect(() => {
    if (myRole) fetchUsers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, roleFilter, myRole])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchUsers()
  }

  const updateUser = async (id: number, updates: Record<string, unknown>) => {
    setActionLoading(id)
    await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    await fetchUsers()
    setActionLoading(null)
  }

  const deleteUser = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"? This cannot be undone.`)) return
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        alert(d.error || 'Failed to delete user')
      }
    } catch {
      alert('Network error')
    }
    await fetchUsers()
    setActionLoading(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="text-display-md" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>
            {isSuperAdmin ? '👥 User Management' : '👤 Clients & Vendors'}
          </h1>
          <p className="text-body-sm" style={{ color: 'var(--color-ink-muted)', marginTop: 4 }}>
            {isSuperAdmin
              ? `${total} total users — full access`
              : `${total} clients & vendors in your CRM`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <form onSubmit={handleSearch} style={{ flex: 1, minWidth: 200 }}>
          <input
            type="text"
            placeholder={isSuperAdmin ? 'Search by name, email, or phone...' : 'Search clients & vendors...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="ks-input"
            style={{ width: '100%', backgroundColor: 'var(--color-surface-1)' }}
          />
        </form>
        {/* Only super admin sees role filter */}
        {isSuperAdmin && (
          <select
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
            className="ks-input"
            style={{ minWidth: 160, backgroundColor: 'var(--color-surface-1)', cursor: 'pointer' }}
          >
            <option value="">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="board_member">Board Member</option>
            <option value="admin">Admin</option>
            <option value="pillar_member">Pillar Member</option>
            <option value="vendor">Vendor</option>
            <option value="customer">Customer</option>
            <option value="pending_admin">Pending Admin</option>
          </select>
        )}
        {!isSuperAdmin && (
          <select
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
            className="ks-input"
            style={{ minWidth: 160, backgroundColor: 'var(--color-surface-1)', cursor: 'pointer' }}
          >
            <option value="">All (Clients + Vendors)</option>
            <option value="customer">Clients</option>
            <option value="vendor">Vendors</option>
          </select>
        )}
      </div>

      {/* Table */}
      <div className="card-template" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-hairline-soft)' }}>
                <th style={{ padding: 16, fontWeight: 600, color: 'var(--color-ink)' }}>User</th>
                <th style={{ padding: 16, fontWeight: 600, color: 'var(--color-ink)' }}>Role</th>
                <th style={{ padding: 16, fontWeight: 600, color: 'var(--color-ink)' }}>Status</th>
                <th style={{ padding: 16, fontWeight: 600, color: 'var(--color-ink)' }}>Joined</th>
                <th style={{ padding: 16, fontWeight: 600, color: 'var(--color-ink)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--color-hairline-soft)' }}>
                    <td colSpan={5} style={{ padding: 16 }}>
                      <div className="skeleton" style={{ height: 24, borderRadius: 'var(--radius-sm)' }} />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--color-ink-muted)' }}>No users found</td>
                </tr>
              ) : (
                users.map(user => {
                  const rc = roleColors[user.role] || { bg: 'var(--color-surface-2)', color: 'var(--color-ink)' }
                  return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ borderBottom: '1px solid var(--color-hairline-soft)', transition: 'background-color var(--dur-fast)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-surface-2)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'rgba(0,153,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-blue)', fontWeight: 700, flexShrink: 0 }}>
                          {user.fullname.charAt(0)}
                        </div>
                        <div>
                          <button
                            onClick={() => {
                              if (user.role === 'customer') setProfileUserId(user.id)
                              else if (user.role === 'vendor') setProfileVendorId(user.id)
                            }}
                            style={{ 
                              background: 'none', border: 'none', padding: 0,
                              fontWeight: 600, color: 'var(--color-ink)', 
                              cursor: ['customer','vendor'].includes(user.role) ? 'pointer' : 'default',
                              textDecoration: ['customer','vendor'].includes(user.role) ? 'underline transparent' : 'none',
                              transition: 'text-decoration var(--dur-fast)'
                            }}
                            onMouseEnter={e => { if (['customer','vendor'].includes(user.role)) (e.currentTarget as HTMLElement).style.textDecorationColor = 'var(--color-accent-blue)' }}
                            onMouseLeave={e => { if (['customer','vendor'].includes(user.role)) (e.currentTarget as HTMLElement).style.textDecorationColor = 'transparent' }}
                          >
                            {user.fullname}
                          </button>
                          <p style={{ fontSize: 11, color: 'var(--color-ink-muted)', marginTop: 2 }}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: 16 }}>
                      <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 'var(--radius-pill)', fontSize: 10, fontWeight: 700, textTransform: 'capitalize', backgroundColor: rc.bg, color: rc.color }}>
                        {roleLabel(user)}
                      </span>
                      {user.role === 'pending_admin' && (
                        <span style={{ marginLeft: 6, fontSize: 10, color: '#F59E0B', fontWeight: 700 }}>⏳ Pending</span>
                      )}
                    </td>
                    <td style={{ padding: 16 }}>
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', marginRight: 8, backgroundColor: user.status === 'active' ? '#22C55E' : user.status === 'blocked' ? '#EF4444' : '#F59E0B' }} />
                      <span style={{ textTransform: 'capitalize', color: 'var(--color-ink)' }}>{user.status}</span>
                    </td>
                    <td style={{ padding: 16, color: 'var(--color-ink-muted)', fontSize: 12 }}>
                      {new Date(user.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: 16, textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                        {/* Block/Unblock — super admin only */}
                        {isSuperAdmin && user.role !== 'super_admin' && (
                          <button
                            onClick={() => updateUser(user.id, { status: user.status === 'blocked' ? 'active' : 'blocked' })}
                            disabled={actionLoading === user.id}
                            style={{ 
                              padding: '6px 12px', borderRadius: 'var(--radius-md)', fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'background-color var(--dur-fast)',
                              backgroundColor: user.status === 'blocked' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: user.status === 'blocked' ? '#22C55E' : '#EF4444'
                            }}
                          >
                            {actionLoading === user.id ? '...' : user.status === 'blocked' ? 'Unblock' : 'Block'}
                          </button>
                        )}
                        {/* Delete — super admin only */}
                        {isSuperAdmin && user.role !== 'super_admin' && (
                          <button
                            onClick={() => deleteUser(user.id, user.fullname)}
                            disabled={actionLoading === user.id}
                            style={{ padding: '6px 12px', borderRadius: 'var(--radius-md)', fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'background-color var(--dur-fast)', backgroundColor: '#EF4444', color: '#fff' }}
                          >
                            {actionLoading === user.id ? '...' : '🗑 Delete'}
                          </button>
                        )}
                        {/* Role change — super admin ONLY */}
                        {isSuperAdmin && user.role !== 'super_admin' && (
                          <select
                            value={
                              user.role === 'board_member' ? 'board_member' :
                              user.role === 'admin' && (user.department === 'digital' || user.pillar_role === 'digital') ? 'digital_head' :
                              user.role === 'admin' && user.department === 'operations' && user.pillar_role === 'project_manager' ? 'pm' :
                              user.role === 'admin' && user.department === 'operations' ? 'ops_head' :
                              user.role === 'admin' && user.department === 'marketing' ? 'marketing_head' :
                              user.role === 'pillar_member' && user.pillar_role ? `pillar_${user.pillar_role}` :
                              user.role
                            }
                            onChange={e => {
                              const val = e.target.value
                              if (val === 'digital_head') updateUser(user.id, { role: 'admin', department: 'digital', pillar_role: 'digital', designation: 'Digital Saarthi Head' })
                              else if (val === 'ops_head') updateUser(user.id, { role: 'admin', department: 'operations', pillar_role: null, designation: 'Operation Head' })
                              else if (val === 'pm') updateUser(user.id, { role: 'admin', department: 'operations', pillar_role: 'project_manager' })
                              else if (val === 'marketing_head') updateUser(user.id, { role: 'admin', department: 'marketing', pillar_role: null, designation: 'Marketing Head' })
                              else if (val.startsWith('staff_')) {
                                const config = STAFF_ROLE_CONFIGS.find(role => role.value === val.replace('staff_', ''))
                                if (config) {
                                  updateUser(user.id, { role: 'admin', department: config.department, pillar_role: config.pillarRole, designation: config.title })
                                }
                              }
                              else if (val.startsWith('pillar_')) updateUser(user.id, { role: 'pillar_member', department: null, pillar_role: val.split('_')[1], designation: null })
                              else updateUser(user.id, { role: val, department: null, pillar_role: null, designation: null })
                            }}
                            style={{ padding: '4px 8px', borderRadius: 'var(--radius-md)', fontSize: 11, border: '1px solid var(--color-hairline)', backgroundColor: 'var(--color-surface-2)', color: 'var(--color-ink)', cursor: 'pointer' }}
                          >
                            <option value="customer">Customer</option>
                            <option value="vendor">Vendor</option>
                            <option value="board_member">👔 Board Member</option>
                            <option disabled>── Staff Roles ──</option>
                            <option value="admin">Global Admin</option>
                            <option value="digital_head">Digital Marketing Head</option>
                            <option value="ops_head">Operation Head</option>
                            <option value="pm">Project Manager</option>
                            <option value="marketing_head">Marketing Head</option>
                            <option disabled>── Expanded Departments ──</option>
                            {STAFF_ROLE_CONFIGS.filter(role => !['digital_marketing_head', 'marketing_head', 'operation_head', 'project_manager'].includes(role.value)).map(role => (
                              <option key={role.value} value={`staff_${role.value}`}>{role.title}</option>
                            ))}
                            <option disabled>── Saarthi Pillars ──</option>
                            <option value="pillar_campus">Campus Saarthi</option>
                            <option value="pillar_digital">Digital Saarthi</option>
                            <option value="pillar_calling">Calling Saarthi</option>
                            <option value="pillar_government">Government Saarthi</option>
                            <option value="pillar_market">Market Saarthi</option>
                          </select>
                        )}
                        {/* Non-super-admin: read-only view action */}
                        {!isSuperAdmin && (
                          <button
                            onClick={() => {
                              if (user.role === 'customer') setProfileUserId(user.id)
                              else if (user.role === 'vendor') setProfileVendorId(user.id)
                            }}
                            className="btn-secondary" style={{ padding: '6px 12px', fontSize: 11 }}
                          >
                            👁 View
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )
              })
            )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderTop: '1px solid var(--color-hairline-soft)' }}>
            <p style={{ fontSize: 13, color: 'var(--color-ink-muted)' }}>
              Page {page} of {Math.ceil(total / 20)}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * 20 >= total}
                className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, cursor: page * 20 >= total ? 'not-allowed' : 'pointer', opacity: page * 20 >= total ? 0.5 : 1 }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profile modals */}
      <CustomerProfileModal userId={profileUserId} onClose={() => setProfileUserId(null)} />
      <VendorProfileModal vendorId={profileVendorId} onClose={() => setProfileVendorId(null)} />
    </div>
  )
}
