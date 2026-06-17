import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/middleware'

export const dynamic = 'force-dynamic'

export default async function NewsletterSubscribersPage() {
  await requireAuth() // Ensure user is authenticated
  const supabase = await createClient()

  // Fetch subscribers, newest first
  const { data: subscribers, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[var(--color-ink)]">📨 Newsletter Subscribers</h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">Manage users who opted in to receive updates.</p>
        </div>
        <div className="text-sm font-bold bg-[var(--color-surface-2)] text-[var(--color-accent-blue)] px-4 py-2 rounded-xl border border-[var(--color-hairline)]">
          Total Subscribers: {subscribers?.length || 0}
        </div>
      </div>

      <div className="bg-[var(--color-surface-1)] border border-[var(--color-hairline-soft)] rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-surface-2)] border-b border-[var(--color-hairline-soft)] text-[var(--color-ink-muted)] text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Subscribed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-hairline-soft)]">
              {error ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-red-500">
                    Error loading subscribers. Please ensure the table exists.
                  </td>
                </tr>
              ) : !subscribers || subscribers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-[var(--color-ink-muted)]">
                    <span className="text-4xl mb-3 block">📭</span>
                    <p className="font-semibold text-base text-[var(--color-ink)]">No subscribers yet</p>
                    <p className="text-sm">When users subscribe, they will appear here.</p>
                  </td>
                </tr>
              ) : (
                subscribers.map((sub: any) => (
                  <tr key={sub.id || sub.email} className="hover:bg-[var(--color-surface-2)]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] text-[var(--color-accent-blue)] flex items-center justify-center font-bold text-xs uppercase border border-[var(--color-hairline)]">
                          {(sub.name || sub.email).charAt(0)}
                        </div>
                        <span className="font-semibold text-[var(--color-ink)] text-sm">{sub.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-ink-muted)]">
                      {sub.name || <span className="text-[var(--color-hairline)] italic">Not provided</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-ink-muted)]">
                      {new Date(sub.created_at).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
