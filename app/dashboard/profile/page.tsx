'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import DashboardSidebar from '@/components/DashboardSidebar'
import { fetchWithAuth } from '@/lib/auth/fetchWithAuth'

interface Profile {
  id: number
  fullname: string
  email: string
  phone: string | null
  role: string
  created_at: string
  slack_connected?: boolean
}

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [fullname, setFullname] = useState('')
  const [phone, setPhone] = useState('')

  // Password change
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [pwSaving, setPwSaving] = useState(false)

  const router = useRouter()

  useEffect(() => {
    fetchWithAuth('/api/auth/profile').then(async r => {
      if (r.status === 401) { router.push('/login'); return }
      const d = await r.json()
      if (d.profile) {
        setProfile(d.profile)
        setFullname(d.profile.fullname || '')
        setPhone(d.profile.phone || '')
      }
      setLoading(false)
    })
  }, [router])

  const saveProfile = async () => {
    setSaving(true); setMsg('')
    const res = await fetchWithAuth('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullname, phone }),
    })
    const d = await res.json()
    if (res.ok) { setMsg('✅ Profile updated!'); setProfile(d.profile) }
    else setMsg(`❌ ${d.error}`)
    setSaving(false)
  }

  const changePassword = async () => {
    setPwSaving(true); setPwMsg('')
    if (newPw !== confirmPw) { setPwMsg('❌ Passwords do not match'); setPwSaving(false); return }
    if (newPw.length < 6) { setPwMsg('❌ Password must be at least 6 characters'); setPwSaving(false); return }
    const res = await fetchWithAuth('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    })
    const d = await res.json()
    if (res.ok) { setPwMsg('✅ Password changed!'); setCurrentPw(''); setNewPw(''); setConfirmPw('') }
    else setPwMsg(`❌ ${d.error}`)
    setPwSaving(false)
  }

  if (loading) return <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} /></div>

  return (
    <>
      <div style={{ maxWidth: 800 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 className="text-display-md" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)', marginBottom: 4 }}>👤 My Profile</h1>
            <p className="text-body-sm" style={{ color: 'var(--color-ink-muted)' }}>Manage your account settings</p>
          </div>
        </div>

        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card-template" style={{ padding: '24px', marginBottom: 24 }}>
          <h3 className="text-headline" style={{ color: 'var(--color-ink)', marginBottom: 16 }}>Profile Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="text-body-sm" style={{ color: 'var(--color-ink-muted)', display: 'block', marginBottom: 6 }}>Full Name</label>
              <input value={fullname} onChange={e => setFullname(e.target.value)} className="ks-input" style={{ width: '100%' }} />
            </div>
            <div>
              <label className="text-body-sm" style={{ color: 'var(--color-ink-muted)', display: 'block', marginBottom: 6 }}>Email</label>
              <input value={profile?.email || ''} disabled className="ks-input" style={{ width: '100%', backgroundColor: 'var(--color-surface-2)', color: 'var(--color-ink-muted)', cursor: 'not-allowed' }} />
            </div>
            <div>
              <label className="text-body-sm" style={{ color: 'var(--color-ink-muted)', display: 'block', marginBottom: 6 }}>Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" className="ks-input" style={{ width: '100%' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <button onClick={saveProfile} disabled={saving} className="btn-primary" style={{ cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving...' : '💾 Save Changes'}
              </button>
              {msg && <span className="text-body-sm" style={{ color: msg.includes('❌') ? '#f87171' : 'var(--color-semantic-success)' }}>{msg}</span>}
            </div>
          </div>
        </motion.div>

        {/* Slack Connection */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-template" style={{ padding: '24px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h3 className="text-headline" style={{ color: 'var(--color-ink)', marginBottom: 4 }}>
                <span style={{ marginRight: 8 }}>💬</span> Connect with Slack
              </h3>
              <p className="text-body-sm" style={{ color: 'var(--color-ink-muted)' }}>
                {profile?.slack_connected 
                  ? 'Your account is successfully linked to Slack for notifications and tools.'
                  : 'Link your Slack account to receive direct project updates and manage tasks without leaving Slack.'}
              </p>
            </div>
            <div>
              {profile?.slack_connected ? (
                <div style={{ padding: '8px 16px', backgroundColor: '#0d1f17', color: '#22c55e', borderRadius: 'var(--radius-pill)', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e' }}></span> Connected
                </div>
              ) : (
                <button
                  onClick={() => window.location.href = `/api/slack/auth?userId=${profile?.id}`}
                  style={{ padding: '10px 20px', borderRadius: 'var(--radius-pill)', backgroundColor: '#4A154B', color: '#fff', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                >
                  Connect Slack Workspace
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Password Change */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-template" style={{ padding: '24px', marginBottom: 24 }}>
          <h3 className="text-headline" style={{ color: 'var(--color-ink)', marginBottom: 16 }}>🔐 Change Password</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="text-body-sm" style={{ color: 'var(--color-ink-muted)', display: 'block', marginBottom: 6 }}>Current Password</label>
              <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="ks-input" style={{ width: '100%' }} />
            </div>
            <div>
              <label className="text-body-sm" style={{ color: 'var(--color-ink-muted)', display: 'block', marginBottom: 6 }}>New Password</label>
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="ks-input" style={{ width: '100%' }} />
            </div>
            <div>
              <label className="text-body-sm" style={{ color: 'var(--color-ink-muted)', display: 'block', marginBottom: 6 }}>Confirm New Password</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="ks-input" style={{ width: '100%' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <button onClick={changePassword} disabled={pwSaving} className="btn-secondary" style={{ cursor: 'pointer', opacity: pwSaving ? 0.6 : 1 }}>
                {pwSaving ? 'Changing...' : '🔑 Change Password'}
              </button>
              {pwMsg && <span className="text-body-sm" style={{ color: pwMsg.includes('❌') ? '#f87171' : 'var(--color-semantic-success)' }}>{pwMsg}</span>}
            </div>
          </div>
        </motion.div>


      </div>
    </>
  )
}
