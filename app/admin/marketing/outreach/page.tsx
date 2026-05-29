'use client'

import { useMemo, useState } from 'react'

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
  const [result, setResult] = useState<{ sent: number; failed: number; total: number; errors: string[] } | null>(null)
  const [error, setError] = useState('')

  const recipients = useMemo(() => normalizeRecipients(recipientsText), [recipientsText])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError('')
    setResult(null)

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

      setResult({
        sent: data.sent || 0,
        failed: data.failed || 0,
        total: data.total || recipients.length,
        errors: data.errors || [],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk send failed')
    }

    setSending(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy font-heading">Bulk Outreach</h1>
        <p className="mt-1 text-sm text-slate-500">Send marketing emails or WhatsApp messages in batches of up to 10,000 contacts.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-600">Channel</span>
              <select value={channel} onChange={e => setChannel(e.target.value as 'email' | 'whatsapp')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none">
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-600">Recipient Count</span>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500">{recipients.length}</div>
            </label>
          </div>

          {channel === 'email' && (
            <label className="block space-y-1 text-sm">
              <span className="font-medium text-slate-600">Subject</span>
              <input value={subject} onChange={e => setSubject(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" placeholder="Campaign subject" />
            </label>
          )}

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-600">Message</span>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={8} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" placeholder={channel === 'email' ? 'Email body' : 'WhatsApp message body'} />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-600">Recipients</span>
            <textarea value={recipientsText} onChange={e => setRecipientsText(e.target.value)} rows={10} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none font-mono text-xs" placeholder={channel === 'email' ? 'one@example.com\nsecond@example.com' : '919876543210\n919812345678'} />
          </label>

          <div className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700">
            Use only opted-in contacts. WhatsApp delivery depends on Meta/WhatsApp Business approval and configured credentials.
          </div>

          {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

          <button type="submit" disabled={sending || recipients.length === 0} className="rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
            {sending ? 'Sending...' : `Send to ${recipients.length || 0} recipient${recipients.length === 1 ? '' : 's'}`}
          </button>
        </form>

        <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-navy font-heading">Campaign Status</h2>
          {result ? (
            <div className="space-y-3 text-sm">
              <div className="rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">Sent: {result.sent}</div>
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-slate-600">Failed: {result.failed}</div>
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-slate-600">Total: {result.total}</div>
              {result.errors.length > 0 && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600">
                  {result.errors.join('\n')}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No campaign has been sent yet in this session.</p>
          )}
        </div>
      </div>
    </div>
  )
}
