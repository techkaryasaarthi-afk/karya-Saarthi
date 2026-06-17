import { NextResponse } from 'next/server'
import { requireRole, authErrorResponse, getCurrentUser } from '@/lib/auth/middleware'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    await requireRole('super_admin', 'admin')
    const { id } = await params
    
    const supabase = await createClient()

    // 1. Fetch the project (service_request)
    const { data: project, error: projErr } = await supabase
      .from('service_requests')
      .select('id, user_id, budget, service_type')
      .eq('id', id)
      .single()

    if (projErr || !project) {
      return NextResponse.json({ error: projErr ? projErr.message : 'Project not found' }, { status: 404 })
    }

    // 2. Validate budget
    if (!project.budget || project.budget <= 0) {
      return NextResponse.json({ error: 'Client budget must be set before generating an invoice.' }, { status: 400 })
    }

    // 3. Generate unique invoice number
    const { count } = await supabase.from('invoices').select('*', { count: 'exact', head: true })
    const invoice_number = `KS-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(4, '0')}`

    // 4. Create invoice record
    const { data: invoice, error: invErr } = await supabase
      .from('invoices')
      .insert({
        client_id: project.user_id,
        project_id: project.id,
        issued_by: user!.userId,
        invoice_number,
        subtotal: project.budget,
        tax_percent: 0,
        tax_amount: 0,
        discount: 0,
        total: project.budget,
        status: 'sent',
        notes: `Auto-generated for project #${project.id}`
      })
      .select()
      .single()

    if (invErr) {
      return NextResponse.json({ error: invErr.message }, { status: 500 })
    }

    // 5. Insert invoice item (single line item for the project)
    await supabase.from('invoice_items').insert({
      invoice_id: invoice.id,
      description: project.service_type || 'Service Payment',
      quantity: 1,
      unit_price: project.budget,
      total: project.budget
    })

    // Notify user
    await supabase.from('notifications').insert({
      user_id: project.user_id,
      title: 'New Invoice Generated',
      message: `An invoice of ₹${project.budget} for your project (${project.service_type}) is pending payment.`,
      type: 'invoice',
      link: '/dashboard/invoices'
    })

    return NextResponse.json({ invoice })

  } catch (err) {
    const { error, status } = authErrorResponse(err)
    return NextResponse.json({ error }, { status })
  }
}
