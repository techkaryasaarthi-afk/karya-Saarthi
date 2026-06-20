'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import PaymentButton from '@/components/PaymentButton'
import DashboardSidebar from '@/components/DashboardSidebar'
import { fetchWithAuth } from '@/lib/auth/fetchWithAuth'

interface Invoice {
  id: number
  invoice_number: string
  total: number
  status: string
  due_date: string | null
  paid_at: string | null
  created_at: string
  project: { id: number; service_type: string } | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  sent:     { label: 'Pending',  color: '#F59E0B', bg: '#FEF3C7', icon: '⏳' },
  paid:     { label: 'Paid',     color: '#10B981', bg: '#D1FAE5', icon: '✅' },
  overdue:  { label: 'Overdue',  color: '#EF4444', bg: '#FEE2E2', icon: '⚠️' },
  cancelled:{ label: 'Cancelled',color: '#6B7280', bg: '#F3F4F6', icon: '✕'  },
}

function handlePrint(inv: Invoice) {
  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${inv.invoice_number}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; }
        h1 { color: #1B3A6B; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
        .label { color: #64748b; font-size: 14px; }
        .value { font-weight: bold; }
        .total { font-size: 24px; color: #1B3A6B; margin-top: 20px; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;
          background: ${STATUS_CONFIG[inv.status]?.bg || '#f1f5f9'};
          color: ${STATUS_CONFIG[inv.status]?.color || '#64748b'}; }
        .footer { margin-top: 40px; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <h1>Karya Saarthi</h1>
      <p style="color:#64748b">Enterprise Services · karyasaarthi.com</p>
      <hr style="margin:20px 0;border:1px solid #e2e8f0" />
      <h2>Invoice #${inv.invoice_number}</h2>
      <div class="row"><span class="label">Service</span><span class="value">${inv.project?.service_type || 'Service'}</span></div>
      <div class="row"><span class="label">Date</span><span class="value">${new Date(inv.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
      ${inv.due_date ? `<div class="row"><span class="label">Due Date</span><span class="value">${new Date(inv.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>` : ''}
      ${inv.paid_at ? `<div class="row"><span class="label">Paid On</span><span class="value">${new Date(inv.paid_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>` : ''}
      <div class="row"><span class="label">Status</span><span class="badge">${STATUS_CONFIG[inv.status]?.icon} ${STATUS_CONFIG[inv.status]?.label || inv.status}</span></div>
      <div class="total">Total: ₹${inv.total.toLocaleString('en-IN')}</div>
      <div class="footer">
        <p>Karya Saarthi Enterprise · Delhi, India</p>
        <p>This is a computer-generated invoice. For queries, contact support@karyasaarthi.com</p>
      </div>
    </body>
    </html>
  `)
  w.document.close()
  w.print()
}

export default function InvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'sent' | 'paid' | 'overdue'>('all')

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await fetchWithAuth('/api/invoices/my')
      if (res.status === 401) { router.push('/login'); return }
      if (res.ok) {
        const d = await res.json()
        setInvoices(d.invoices || [])
      }
    } catch {} finally { setLoading(false) }
  }, [router])

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  const filtered = invoices.filter(inv => filter === 'all' || inv.status === filter)

  const totalPaid    = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0)
  const totalPending = invoices.filter(i => i.status === 'sent').reduce((s, i) => s + i.total, 0)
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0)

  return (
    <>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-ink-muted)', marginBottom: 20 }}>
        <Link href="/dashboard" style={{ color: 'var(--color-ink-muted)', textDecoration: 'none' }} className="hover:text-ink">Dashboard</Link>
        <span>›</span>
        <span style={{ color: 'var(--color-ink)', fontWeight: 600 }}>My Invoices</span>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h1 className="text-display-md" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)', marginBottom: 4 }}>🧾 My Invoices</h1>
        <p className="text-body-sm" style={{ color: 'var(--color-ink-muted)' }}>View, pay, and download your invoices</p>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }} className="dash-stats-grid">
        {[
          { label: 'Total Invoices', value: invoices.length, icon: '🧾', color: '#3B82F6' },
          { label: 'Amount Paid',   value: `₹${totalPaid.toLocaleString('en-IN')}`,    icon: '✅', color: '#10B981' },
          { label: 'Pending',       value: `₹${totalPending.toLocaleString('en-IN')}`, icon: '⏳', color: '#F59E0B' },
          { label: 'Overdue',       value: `₹${totalOverdue.toLocaleString('en-IN')}`, icon: '⚠️', color: '#EF4444' },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="card-template" style={{ padding: '20px' }}>
            <span style={{ fontSize: 24 }}>{k.icon}</span>
            <p className="text-headline" style={{ color: k.color, marginTop: 8, fontFamily: 'var(--font-display)' }}>{k.value}</p>
            <p className="text-caption" style={{ color: 'var(--color-ink-muted)', marginTop: 2 }}>{k.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['all', 'sent', 'paid', 'overdue'] as const).map(f => {
          const count = f === 'all' ? invoices.length : invoices.filter(i => i.status === f).length
          return (
            <button key={f} onClick={() => setFilter(f)}
              className="btn-secondary" style={{
                backgroundColor: filter === f ? 'var(--color-surface-2)' : 'var(--color-surface-1)',
                color: filter === f ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                borderColor: filter === f ? 'var(--color-accent-blue)' : 'var(--color-hairline)',
                textTransform: 'capitalize',
                padding: '6px 12px',
                cursor: 'pointer'
              }}>
              {STATUS_CONFIG[f]?.icon || '📋'} {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Invoices List */}
      <div className="card-template" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-md)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>🧾</span>
            <h3 className="text-headline" style={{ color: 'var(--color-ink)', marginBottom: 8 }}>
              {filter === 'all' ? 'No invoices yet' : `No ${filter} invoices`}
            </h3>
            <p className="text-body-sm" style={{ color: 'var(--color-ink-muted)', marginBottom: 20 }}>
              {filter === 'all'
                ? 'Your invoices will appear here once a project is created.'
                : `You have no ${filter} invoices at this time.`}
            </p>
            {filter !== 'all' && (
              <button onClick={() => setFilter('all')} className="btn-secondary" style={{ cursor: 'pointer' }}>
                View All Invoices
              </button>
            )}
          </div>
        ) : (
          <div>
            {filtered.map((inv, i) => {
              const cfg = STATUS_CONFIG[inv.status] || STATUS_CONFIG.sent
              const isOverdue = inv.status === 'overdue'
              const isPending = inv.status === 'sent'
              return (
                <motion.div key={inv.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  style={{ padding: '20px', borderBottom: '1px solid var(--color-hairline-soft)', borderLeft: isOverdue ? '4px solid #ef4444' : '4px solid transparent', transition: 'background-color var(--dur-fast)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface-2)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-ink)', fontSize: 14, whiteSpace: 'nowrap' }}>{inv.invoice_number}</span>
                        <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-pill)', fontSize: 10, fontWeight: 700, background: inv.status === 'paid' ? '#0d1f17' : inv.status === 'overdue' ? '#1a0808' : '#1a1200', color: inv.status === 'paid' ? '#22c55e' : inv.status === 'overdue' ? '#f87171' : '#fde68a' }}>
                          {cfg.icon} {cfg.label}
                        </span>
                        {isOverdue && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444' }}>
                            · Due {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-IN') : 'N/A'}
                          </span>
                        )}
                      </div>
                      <p className="text-body-sm" style={{ color: 'var(--color-ink-muted)' }}>{inv.project?.service_type || 'Service'}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, fontSize: 11, color: 'var(--color-ink-muted)', flexWrap: 'wrap' }}>
                        <span>🗓 Created {new Date(inv.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        {inv.due_date && inv.status !== 'paid' && (
                          <span>📅 Due {new Date(inv.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        )}
                        {inv.paid_at && (
                          <span style={{ color: '#22c55e', fontWeight: 500 }}>✅ Paid {new Date(inv.paid_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                      <p className="text-headline" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>
                        ₹{inv.total.toLocaleString('en-IN')}
                      </p>
                      <button
                        onClick={() => handlePrint(inv)}
                        className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}
                        title="Download Invoice">
                        📥 PDF
                      </button>
                      {(isPending || isOverdue) && (
                        <PaymentButton
                          amount={inv.total}
                          invoiceId={inv.id}
                          label={`Pay ₹${inv.total.toLocaleString('en-IN')}`}
                          description={`Invoice ${inv.invoice_number} — ${inv.project?.service_type || 'Service'}`}
                          onSuccess={() => fetchInvoices()}
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer note */}
      {!loading && invoices.length > 0 && (
        <p className="text-micro" style={{ color: 'var(--color-ink-muted)', textAlign: 'center', marginTop: 20 }}>
          🔒 All payments are secured by Razorpay. For disputes, contact{' '}
          <a href="mailto:support@karyasaarthi.com" style={{ color: 'var(--color-accent-blue)', textDecoration: 'none' }} className="hover:underline">support@karyasaarthi.com</a>
        </p>
      )}
    </>
  )
}
