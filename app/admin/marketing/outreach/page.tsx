'use client'

import { useMemo, useState, useEffect } from 'react'

interface Campaign {
  id: number
  channel: 'email' | 'whatsapp'
  subject: string | null
  message: string
  total_recipients: number
  sent_count: number
  failed_count: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  errors: string[]
  created_at: string
}

interface IntegrationStatus {
  whatsapp: boolean
  email: boolean
}

function normalizeRecipients(input: string) {
  return input
    .split(/\r?\n|,/)
    .map(item => item.trim())
    .filter(Boolean)
}

export default function MarketingOutreachPage() {
  const [channel, setChannel] = useState<'email' | 'whatsapp'>('email')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [recipientsText, setRecipientsText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null)
  const [pastCampaigns, setPastCampaigns] = useState<Campaign[]>([])
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus | null>(null)

  const recipients = useMemo(() => normalizeRecipients(recipientsText), [recipientsText])

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/admin/outreach/bulk')
      if (res.ok) {
        const data = await res.json()
        setPastCampaigns(data.campaigns || [])
      }
    } catch (err) {
      console.error('Failed to load campaigns', err)
    }
  }

  const fetchIntegrationStatus = async () => {
    try {
      const res = await fetch('/api/admin/outreach/status')
      if (res.ok) {
        const data = await res.json()
        setIntegrationStatus(data)
      }
    } catch (err) {
      console.error('Failed to load integration status', err)
    }
  }

  // Load past campaigns and integration status on mount
  useEffect(() => {
    fetchCampaigns()
    fetchIntegrationStatus()
  }, [])

  // Poll active campaign progress
  useEffect(() => {
    if (!activeCampaign || activeCampaign.status === 'completed' || activeCampaign.status === 'failed') {
      return
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/outreach/bulk?id=${activeCampaign.id}`)
        if (res.ok) {
          const data = await res.json()
          const updated = data.campaign as Campaign
          setActiveCampaign(updated)
          if (updated.status === 'completed' || updated.status === 'failed') {
            clearInterval(interval)
            fetchCampaigns() // reload list when done
          }
        }
      } catch (err) {
        console.error('Polling error', err)
      }
    }, 1500)

    return () => clearInterval(interval)
  }, [activeCampaign])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Pre-flight integration check
    if (channel === 'whatsapp' && integrationStatus && !integrationStatus.whatsapp) {
      setError('WhatsApp API credentials are not configured. Please add WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID to your .env.local file and restart the server.')
      return
    }
    if (channel === 'email' && integrationStatus && !integrationStatus.email) {
      setError('Email (SMTP) credentials are not configured. Please add SMTP_HOST, SMTP_USER, and SMTP_PASS to your .env.local file and restart the server.')
      return
    }

    setSending(true)
    setError('')
    setActiveCampaign(null)

    try {
      const response = await fetch('/api/admin/outreach/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          subject,
          message,
          recipients,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Bulk send failed')

      // Set active campaign to start polling
      setActiveCampaign({
        id: data.campaignId,
        channel,
        subject: channel === 'email' ? subject : null,
        message,
        total_recipients: data.total || recipients.length,
        sent_count: 0,
        failed_count: 0,
        status: 'processing',
        errors: [],
        created_at: new Date().toISOString()
      })

      // Reset form
      setSubject('')
      setMessage('')
      setRecipientsText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk send failed')
    } finally {
      setSending(false)
    }
  }

  // Progress calculations
  const progressPercent = useMemo(() => {
    if (!activeCampaign) return 0
    const processed = activeCampaign.sent_count + activeCampaign.failed_count
    return Math.min(100, Math.round((processed / activeCampaign.total_recipients) * 100))
  }, [activeCampaign])

  const channelReady = integrationStatus
    ? (channel === 'email' ? integrationStatus.email : integrationStatus.whatsapp)
    : true // optimistic while loading

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy font-heading">Bulk Outreach</h1>
        <p className="mt-1 text-sm text-slate-500">Send marketing emails or WhatsApp messages in batches of up to 10,000 contacts.</p>
      </div>

      {/* Integration Status Banner */}
      {integrationStatus && (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Integration Status</p>
          <div className="flex flex-wrap gap-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold ${integrationStatus.email ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              <span>{integrationStatus.email ? '✅' : '❌'}</span>
              <span>Email (SMTP)</span>
              {!integrationStatus.email && (
                <span className="text-[10px] font-normal opacity-80">— Add SMTP_HOST, SMTP_USER, SMTP_PASS to .env.local</span>
              )}
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold ${integrationStatus.whatsapp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              <span>{integrationStatus.whatsapp ? '✅' : '❌'}</span>
              <span>WhatsApp (Meta API)</span>
              {!integrationStatus.whatsapp && (
                <span className="text-[10px] font-normal opacity-80">— Add WHATSAPP_ACCESS_TOKEN & WHATSAPP_PHONE_NUMBER_ID to .env.local</span>
              )}
            </div>
          </div>
          {(!integrationStatus.email || !integrationStatus.whatsapp) && (
            <p className="mt-3 text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
              ⚠️ After adding credentials to <code className="font-mono">.env.local</code>, restart the dev server (<code className="font-mono">npm run dev</code>) for changes to take effect.
            </p>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-600">Channel</span>
              <select value={channel} onChange={e => setChannel(e.target.value as 'email' | 'whatsapp')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none">
                <option value="email">Email {integrationStatus && !integrationStatus.email ? '⚠ Not configured' : ''}</option>
                <option value="whatsapp">WhatsApp {integrationStatus && !integrationStatus.whatsapp ? '⚠ Not configured' : ''}</option>
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-600">Recipient Count</span>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 font-mono">{recipients.length}</div>
            </label>
          </div>

          {channel === 'email' && (
            <label className="block space-y-1 text-sm">
              <span className="font-medium text-slate-600">Subject</span>
              <input value={subject} onChange={e => setSubject(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-navy" placeholder="Campaign subject" required />
            </label>
          )}

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-600">Message</span>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={8} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-navy" placeholder={channel === 'email' ? 'Email body (supports HTML)' : 'WhatsApp message body'} required />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-600">Recipients (One per line or comma-separated)</span>
            <textarea value={recipientsText} onChange={e => setRecipientsText(e.target.value)} rows={10} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none font-mono text-xs focus:border-navy" placeholder={channel === 'email' ? 'one@example.com\nsecond@example.com' : '919876543210\n919812345678'} required />
          </label>

          <div className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700">
            ⚠ Please note: Sending process is asynchronous. You can close this tab or page, the campaign will continue running in the background.
          </div>

          {/* Not-configured warning for selected channel */}
          {integrationStatus && !channelReady && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
              ❌ <strong>{channel === 'email' ? 'Email (SMTP)' : 'WhatsApp'}</strong> integration is not configured.
              {channel === 'whatsapp'
                ? ' Add WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID to .env.local, then restart the server.'
                : ' Add SMTP_HOST, SMTP_USER, and SMTP_PASS to .env.local, then restart the server.'}
            </div>
          )}

          {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={sending || recipients.length === 0 || (integrationStatus != null && !channelReady)}
            className="rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white disabled:opacity-50 hover:bg-accent-dark transition-colors cursor-pointer"
          >
            {sending ? '⏳ Triggering Campaign...' : `🚀 Start Bulk Outreach (${recipients.length} Contact${recipients.length === 1 ? '' : 's'})`}
          </button>
        </form>

        <div className="space-y-6">
          {/* Active Campaign Status Card */}
          <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-navy font-heading text-lg flex items-center justify-between">
              <span>Campaign Tracker</span>
              {activeCampaign && (
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-bold ${
                  activeCampaign.status === 'processing' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                  activeCampaign.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {activeCampaign.status}
                </span>
              )}
            </h2>

            {activeCampaign ? (
              <div className="space-y-4 text-sm">
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-accent h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-green-50 text-green-700 p-2 rounded-xl">
                    <div className="font-extrabold">{activeCampaign.sent_count}</div>
                    <div>Sent</div>
                  </div>
                  <div className="bg-red-50 text-red-700 p-2 rounded-xl">
                    <div className="font-extrabold">{activeCampaign.failed_count}</div>
                    <div>Failed</div>
                  </div>
                  <div className="bg-slate-50 text-slate-600 p-2 rounded-xl">
                    <div className="font-extrabold">{activeCampaign.total_recipients}</div>
                    <div>Total</div>
                  </div>
                </div>

                {activeCampaign.errors.length > 0 && (
                  <div className="rounded-xl bg-red-50 p-3 max-h-40 overflow-y-auto font-mono text-[10px] text-red-600 space-y-1">
                    <strong className="block text-xs mb-1">Recent Errors:</strong>
                    {activeCampaign.errors.map((e, index) => (
                      <div key={index} className="border-b border-red-100 pb-0.5 last:border-0">{e}</div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No active campaign is running. Select contact lists and write a message to start.</p>
            )}
          </div>

          {/* Past Campaigns History Card */}
          <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-navy font-heading text-lg">Campaign History</h2>
            {pastCampaigns.length === 0 ? (
              <p className="text-sm text-slate-400">No past campaigns found.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {pastCampaigns.map(c => (
                  <div key={c.id} className="p-3 border border-slate-100 rounded-xl hover:border-slate-200 transition-all text-xs">
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="font-bold text-navy capitalize">
                        {c.channel === 'email' ? '✉ Email' : '💬 WhatsApp'}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] capitalize font-bold ${
                        c.status === 'completed' ? 'bg-green-50 text-green-600' :
                        c.status === 'failed' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    {c.subject && <p className="font-semibold text-slate-700 truncate mb-1">{c.subject}</p>}
                    <div className="flex gap-4 text-slate-400 font-mono text-[10px]">
                      <span>Sent: {c.sent_count}</span>
                      <span>Failed: {c.failed_count}</span>
                      <span>Total: {c.total_recipients}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(c.created_at).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
