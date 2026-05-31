'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
}

interface Stats {
  campus: { ambassadors: number }
  calling: { scripts: number; logs: number }
  digital: { keywords: number; posts: number }
  government: { tenders: number; contacts: number }
  marketing: { campaigns: number; partners: number }
  system: { totalUsers: number; pendingAdmins: number }
}

const roleColors: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-700',
  admin: 'bg-blue-100 text-blue-700',
  board_member: 'bg-indigo-100 text-indigo-700',
  vendor: 'bg-cyan-100 text-cyan-700',
  customer: 'bg-green-100 text-green-700',
  pending_admin: 'bg-amber-100 text-amber-700',
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

export default function AllSaarthiPage() {
  const [activeTab, setActiveTab] = useState<'hub' | 'users' | 'sql'>('hub')
  const [stats, setStats] = useState<Stats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  // Users Management State
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  // SQL Executor State
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM users LIMIT 5;')
  const [sqlRunning, setSqlRunning] = useState(false)
  const [sqlResult, setSqlResult] = useState<any[] | null>(null)
  const [sqlError, setSqlError] = useState('')
  const [sqlSuccessMessage, setSqlSuccessMessage] = useState('')

  const fetchStats = async () => {
    setStatsLoading(true)
    try {
      const res = await fetch('/api/admin/all-saarthi/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchUsers = async () => {
    setUsersLoading(true)
    try {
      const params = new URLSearchParams({ page: '1', limit: '50' })
      if (search) params.set('search', search)
      if (roleFilter) params.set('role', roleFilter)
      
      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      setUsers(data.users || [])
    } catch (err) {
      console.error(err)
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchUsers()
  }, [])

  const handleUserSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers()
  }

  const updateUser = async (id: number, updates: Record<string, any>) => {
    setActionLoading(id)
    try {
      await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      await fetchUsers()
      await fetchStats()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const deleteUser = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete user "${name}"?`)) return
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Failed to delete user')
      }
      await fetchUsers()
      await fetchStats()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const executeQuery = async () => {
    if (!sqlQuery.trim()) return
    setSqlRunning(true)
    setSqlError('')
    setSqlResult(null)
    setSqlSuccessMessage('')

    try {
      const res = await fetch('/api/admin/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: sqlQuery }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Execution failed')
      }

      if (Array.isArray(data.data)) {
        setSqlResult(data.data)
        setSqlSuccessMessage(`Executed successfully. Returned ${data.data.length} row(s).`)
      } else {
        setSqlSuccessMessage('Statement executed successfully.')
        setSqlResult(null)
      }
      // Refresh stats & users in case DDL/DML was run
      fetchStats()
      fetchUsers()
    } catch (err: any) {
      setSqlError(err.message || 'Failed to execute query')
    } finally {
      setSqlRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy font-heading">🏰 All Saarthi Hub</h1>
        <p className="text-slate-500 text-sm mt-1">Unified command room for managing database queries, organization structure, and checking pillar metrics.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-0">
        {[
          { key: 'hub', label: '📊 Pillar Hub', icon: '⚡' },
          { key: 'users', label: '👥 User Directory', icon: '👤' },
          { key: 'sql', label: '💽 SQL Executor', icon: '💻' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-5 py-2.5 text-sm font-bold cursor-pointer transition-all border-b-2 -mb-px flex items-center gap-2 ${
              activeTab === tab.key ? 'border-accent text-accent' : 'border-transparent text-slate-500 hover:text-navy'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main View Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'hub' && (
          <motion.div key="hub" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="space-y-6">
            {/* Stats Grid */}
            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 animate-pulse">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-32 bg-white rounded-2xl border border-slate-100" />
                ))}
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Campus Saarthi */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-2xl">🎓</span>
                    <h3 className="font-bold text-navy text-sm font-heading mt-2">Campus Saarthi</h3>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-extrabold text-blue-600">{stats.campus.ambassadors}</p>
                    <p className="text-slate-400 text-[10px] uppercase font-bold">Ambassadors</p>
                  </div>
                </div>

                {/* Calling Saarthi */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-2xl">📞</span>
                    <h3 className="font-bold text-navy text-sm font-heading mt-2">Calling Saarthi</h3>
                  </div>
                  <div className="mt-4 flex gap-4">
                    <div>
                      <p className="text-xl font-extrabold text-cyan-600">{stats.calling.scripts}</p>
                      <p className="text-slate-400 text-[9px] uppercase font-bold">Scripts</p>
                    </div>
                    <div>
                      <p className="text-xl font-extrabold text-cyan-600">{stats.calling.logs}</p>
                      <p className="text-slate-400 text-[9px] uppercase font-bold">Call Logs</p>
                    </div>
                  </div>
                </div>

                {/* Digital Saarthi */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-2xl">🌐</span>
                    <h3 className="font-bold text-navy text-sm font-heading mt-2">Digital Saarthi</h3>
                  </div>
                  <div className="mt-4 flex gap-4">
                    <div>
                      <p className="text-xl font-extrabold text-purple-600">{stats.digital.keywords}</p>
                      <p className="text-slate-400 text-[9px] uppercase font-bold">Keywords</p>
                    </div>
                    <div>
                      <p className="text-xl font-extrabold text-purple-600">{stats.digital.posts}</p>
                      <p className="text-slate-400 text-[9px] uppercase font-bold">Posts</p>
                    </div>
                  </div>
                </div>

                {/* Government Saarthi */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-2xl">🏛</span>
                    <h3 className="font-bold text-navy text-sm font-heading mt-2">Government Saarthi</h3>
                  </div>
                  <div className="mt-4 flex gap-4">
                    <div>
                      <p className="text-xl font-extrabold text-indigo-600">{stats.government.tenders}</p>
                      <p className="text-slate-400 text-[9px] uppercase font-bold">Tenders</p>
                    </div>
                    <div>
                      <p className="text-xl font-extrabold text-indigo-600">{stats.government.contacts}</p>
                      <p className="text-slate-400 text-[9px] uppercase font-bold">Contacts</p>
                    </div>
                  </div>
                </div>

                {/* Marketing Saarthi */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-2xl">🤝</span>
                    <h3 className="font-bold text-navy text-sm font-heading mt-2">Marketing Saarthi</h3>
                  </div>
                  <div className="mt-4 flex gap-4">
                    <div>
                      <p className="text-xl font-extrabold text-accent">{stats.marketing.campaigns}</p>
                      <p className="text-slate-400 text-[9px] uppercase font-bold">Campaigns</p>
                    </div>
                    <div>
                      <p className="text-xl font-extrabold text-accent">{stats.marketing.partners}</p>
                      <p className="text-slate-400 text-[9px] uppercase font-bold">Partners</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">Failed to load statistics.</p>
            )}

            {/* Quick Hub Panel Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-navy font-heading text-base mb-3">🏢 Saarthi System Directories</h3>
                <p className="text-sm text-slate-500 mb-4">View total active user profiles and approve any pending admin requests.</p>
                {stats && (
                  <div className="flex gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl flex-1 text-center">
                      <strong className="text-3xl font-extrabold text-navy font-heading block">{stats.system.totalUsers}</strong>
                      <span className="text-xs text-slate-400 uppercase font-semibold">Total Accounts</span>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl flex-1 text-center border border-amber-100">
                      <strong className="text-3xl font-extrabold text-amber-600 font-heading block">{stats.system.pendingAdmins}</strong>
                      <span className="text-xs text-amber-500 uppercase font-semibold">Pending Approvals</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-navy font-heading text-base mb-2">⚡ Direct Query Tool</h3>
                  <p className="text-sm text-slate-500">Run quick select queries on your schema directly. Perfect for checking logs and database health.</p>
                </div>
                <button
                  onClick={() => setActiveTab('sql')}
                  className="w-full mt-4 py-2.5 rounded-xl bg-navy text-white text-sm font-bold hover:bg-navy-light transition-all cursor-pointer text-center"
                >
                  Open SQL Terminal →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="space-y-4">
            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <form onSubmit={handleUserSearch} className="flex-1">
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-navy text-sm shadow-sm"
                />
              </form>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-navy cursor-pointer"
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
              <button onClick={fetchUsers} className="px-5 py-3 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent-dark transition-colors cursor-pointer">
                Apply Filters
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left p-4 font-semibold text-slate-600">User</th>
                      <th className="text-left p-4 font-semibold text-slate-600">Role/Designation</th>
                      <th className="text-left p-4 font-semibold text-slate-600">Department</th>
                      <th className="text-left p-4 font-semibold text-slate-600">Approval Status</th>
                      <th className="text-right p-4 font-semibold text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b border-slate-5">
                          <td colSpan={5} className="p-4">
                            <div className="h-6 bg-slate-100 rounded animate-pulse" />
                          </td>
                        </tr>
                      ))
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">No users found</td>
                      </tr>
                    ) : (
                      users.map(u => (
                        <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                            <div>
                              <strong className="text-navy font-bold block">{u.fullname}</strong>
                              <span className="text-xs text-slate-400">{u.email}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${roleColors[u.role] || 'bg-slate-100 text-slate-600'}`}>
                              {roleLabel(u)}
                            </span>
                          </td>
                          <td className="p-4 capitalize text-slate-500 font-semibold text-xs">
                            {formatDepartmentLabel(u.department)}
                          </td>
                          <td className="p-4">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.role === 'pending_admin' ? 'bg-amber-100 text-amber-700 animate-pulse' :
                              u.is_approved ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {u.role === 'pending_admin' ? 'Pending Approval' : u.is_approved ? 'Approved' : 'Standard Account'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Approve Pending Admin */}
                              {u.role === 'pending_admin' && (
                                <button
                                  onClick={() => updateUser(u.id, { role: 'admin', is_approved: true, department: 'management' })}
                                  disabled={actionLoading === u.id}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-green-500 text-white hover:bg-green-600 cursor-pointer disabled:opacity-50"
                                >
                                  Approve Admin
                                </button>
                              )}

                              {/* Role Select Dropdown */}
                              {u.role !== 'super_admin' && (
                                <select
                                  value={
                                    u.role === 'board_member' ? 'board_member' :
                                    u.role === 'admin' && (u.department === 'digital' || u.pillar_role === 'digital') ? 'digital_head' :
                                    u.role === 'admin' && u.department === 'operations' && u.pillar_role === 'project_manager' ? 'pm' :
                                    u.role === 'admin' && u.department === 'operations' ? 'ops_head' :
                                    u.role === 'admin' && u.department === 'marketing' ? 'marketing_head' :
                                    u.role === 'pillar_member' && u.pillar_role ? `pillar_${u.pillar_role}` :
                                    u.role
                                  }
                                  onChange={e => {
                                    const val = e.target.value
                                    if (val === 'digital_head') updateUser(u.id, { role: 'admin', department: 'digital', pillar_role: 'digital', designation: 'Digital Saarthi Head', is_approved: true })
                                    else if (val === 'ops_head') updateUser(u.id, { role: 'admin', department: 'operations', pillar_role: null, designation: 'Operation Head', is_approved: true })
                                    else if (val === 'pm') updateUser(u.id, { role: 'admin', department: 'operations', pillar_role: 'project_manager', is_approved: true })
                                    else if (val === 'marketing_head') updateUser(u.id, { role: 'admin', department: 'marketing', pillar_role: null, designation: 'Marketing Head', is_approved: true })
                                    else if (val.startsWith('staff_')) {
                                      const config = STAFF_ROLE_CONFIGS.find(role => role.value === val.replace('staff_', ''))
                                      if (config) {
                                        updateUser(u.id, { role: 'admin', department: config.department, pillar_role: config.pillarRole, designation: config.title, is_approved: true })
                                      }
                                    }
                                    else if (val.startsWith('pillar_')) updateUser(u.id, { role: 'pillar_member', department: null, pillar_role: val.split('_')[1], designation: null, is_approved: true })
                                    else updateUser(u.id, { role: val, department: null, pillar_role: null, designation: null, is_approved: true })
                                  }}
                                  className="px-2 py-1.5 rounded-lg text-xs border border-slate-200 bg-white focus:outline-none cursor-pointer"
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

                              {/* Block/Unblock toggle */}
                              {u.role !== 'super_admin' && (
                                <button
                                  onClick={() => updateUser(u.id, { status: u.status === 'blocked' ? 'active' : 'blocked' })}
                                  className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer ${
                                    u.status === 'blocked' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                                  }`}
                                >
                                  {u.status === 'blocked' ? 'Unblock' : 'Block'}
                                </button>
                              )}

                              {/* Delete */}
                              {u.role !== 'super_admin' && (
                                <button
                                  onClick={() => deleteUser(u.id, u.fullname)}
                                  className="px-2 py-1 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-700 cursor-pointer"
                                >
                                  🗑 Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'sql' && (
          <motion.div key="sql" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="space-y-4">
            {/* SQL Input Area */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-navy font-heading text-base">💻 Raw SQL Command Executor</h3>
                <span className="text-xs text-slate-400 font-mono">Supabase SQL Editor Mock</span>
              </div>
              <textarea
                value={sqlQuery}
                onChange={e => setSqlQuery(e.target.value)}
                rows={6}
                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-900 text-green-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Type your SQL query here..."
              />
              <div className="flex gap-2">
                <button
                  onClick={executeQuery}
                  disabled={sqlRunning}
                  className="px-5 py-2.5 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent-dark transition-colors cursor-pointer disabled:opacity-50"
                >
                  {sqlRunning ? '⏳ Executing Query...' : '⚡ Run Query'}
                </button>
                <button
                  onClick={() => setSqlQuery('SELECT * FROM users LIMIT 5;')}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Reset Query
                </button>
              </div>
            </div>

            {/* Query Results Display */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm min-h-[150px]">
              <h4 className="font-bold text-navy font-heading text-sm mb-3">🗂 Query Output</h4>
              
              {sqlError && (
                <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl font-mono text-xs whitespace-pre-wrap">
                  <strong>Error:</strong> {sqlError}
                </div>
              )}

              {sqlSuccessMessage && (
                <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 p-3 rounded-xl mb-3">
                  ✔ {sqlSuccessMessage}
                </p>
              )}

              {sqlResult && sqlResult.length > 0 ? (
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-xs font-mono text-slate-700">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {Object.keys(sqlResult[0]).map(key => (
                          <th key={key} className="text-left p-3 font-bold border-r border-slate-100 last:border-0">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sqlResult.map((row, index) => (
                        <tr key={index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                          {Object.values(row).map((val: any, cellIdx) => (
                            <td key={cellIdx} className="p-3 border-r border-slate-100 last:border-0 truncate max-w-[200px]" title={String(val)}>
                              {val === null ? <span className="text-slate-300">null</span> : typeof val === 'object' ? JSON.stringify(val) : String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                !sqlError && !sqlSuccessMessage && (
                  <p className="text-xs text-slate-400 text-center py-8">Write a query above and click "Run Query" to see output results here.</p>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
