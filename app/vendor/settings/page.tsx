'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Profile {
  id: number
  fullname: string
  email: string
  phone: string | null
  role: string
  department: string | null
  created_at: string
}

export default function VendorSettingsPage() {
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

  useEffect(() => {
    fetch('/api/auth/profile').then(r => r.json()).then(d => {
      if (d.profile) {
        setProfile(d.profile)
        setFullname(d.profile.fullname || '')
        setPhone(d.profile.phone || '')
      }
      setLoading(false)
    })
  }, [])

  const saveProfile = async () => {
    setSaving(true); setMsg('')
    const res = await fetch('/api/auth/profile', {
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
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    })
    const d = await res.json()
    if (res.ok) { setPwMsg('✅ Password changed!'); setCurrentPw(''); setNewPw(''); setConfirmPw('') }
    else setPwMsg(`❌ ${d.error}`)
    setPwSaving(false)
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} /></div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 672 }}>
      <div>
        <h1 className="text-display-md" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>⚙️ Settings</h1>
        <p className="text-body-sm" style={{ color: 'var(--color-ink-muted)', marginTop: 4 }}>Manage your profile and password</p>
      </div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card-template" style={{ padding: 24 }}>
        <h3 className="text-headline" style={{ fontWeight: 700, color: 'var(--color-ink)', marginBottom: 20 }}>👤 Profile Information</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--color-ink-muted)', marginBottom: 6 }}>Full Name</label>
            <input value={fullname} onChange={e => setFullname(e.target.value)} className="ks-input" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--color-ink-muted)', marginBottom: 6 }}>Email</label>
            <input value={profile?.email || ''} disabled className="ks-input" style={{ backgroundColor: 'var(--color-surface-2)', color: 'var(--color-ink-muted)', cursor: 'not-allowed' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--color-ink-muted)', marginBottom: 6 }}>Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" className="ks-input" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8 }}>
            <button onClick={saveProfile} disabled={saving} className="btn-primary" style={{ cursor: 'pointer', opacity: saving ? 0.5 : 1 }}>
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
            {msg && <span style={{ fontSize: 14, color: 'var(--color-ink)' }}>{msg}</span>}
          </div>
        </div>
      </motion.div>

      {/* Password Change */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-template" style={{ padding: 24 }}>
        <h3 className="text-headline" style={{ fontWeight: 700, color: 'var(--color-ink)', marginBottom: 20 }}>🔐 Change Password</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--color-ink-muted)', marginBottom: 6 }}>Current Password</label>
            <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="ks-input" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--color-ink-muted)', marginBottom: 6 }}>New Password</label>
            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="ks-input" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--color-ink-muted)', marginBottom: 6 }}>Confirm New Password</label>
            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="ks-input" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8 }}>
            <button onClick={changePassword} disabled={pwSaving} className="btn-secondary" style={{ cursor: 'pointer', opacity: pwSaving ? 0.5 : 1 }}>
              {pwSaving ? 'Changing...' : '🔑 Change Password'}
            </button>
            {pwMsg && <span style={{ fontSize: 14, color: 'var(--color-ink)' }}>{pwMsg}</span>}
          </div>
        </div>
      </motion.div>

      {/* Account Info */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-template" style={{ padding: 24 }}>
        <h3 className="text-headline" style={{ fontWeight: 700, color: 'var(--color-ink)', marginBottom: 20 }}>ℹ️ Account Info</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, fontSize: 14 }}>
          <div><span style={{ color: 'var(--color-ink-muted)' }}>Role</span><p style={{ fontWeight: 600, color: 'var(--color-ink)', textTransform: 'capitalize', marginTop: 4 }}>{profile?.role}</p></div>
          {profile?.department && <div><span style={{ color: 'var(--color-ink-muted)' }}>Department</span><p style={{ fontWeight: 600, color: 'var(--color-ink)', textTransform: 'capitalize', marginTop: 4 }}>{profile.department}</p></div>}
          <div><span style={{ color: 'var(--color-ink-muted)' }}>Member Since</span><p style={{ fontWeight: 600, color: 'var(--color-ink)', marginTop: 4 }}>{profile ? new Date(profile.created_at).toLocaleDateString('en-IN') : '-'}</p></div>
        </div>
      </motion.div>
    </div>
  )
}
