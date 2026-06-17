import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/middleware'

// GET /api/invoices/my — invoices for the logged-in customer
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      id, invoice_number, total, status, due_date, paid_at, created_at, project_id
    `)
    .eq('client_id', user.userId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Manually fetch project details since there's no foreign key constraint
  let invoices = data || []
  if (invoices.length > 0) {
    const projectIds = invoices.map((i: any) => i.project_id).filter(Boolean)
    if (projectIds.length > 0) {
      const { data: projects } = await supabase
        .from('service_requests')
        .select('id, service_type')
        .in('id', projectIds)
      
      const projectMap = new Map((projects || []).map((p: any) => [p.id, p]))
      invoices = invoices.map((inv: any) => ({
        ...inv,
        project: inv.project_id ? (projectMap.get(inv.project_id) || null) : null
      }))
    }
  }

  return NextResponse.json({ invoices })
}
