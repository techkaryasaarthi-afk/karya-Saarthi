import { NextResponse } from 'next/server'
import { requireAuth, authErrorResponse } from '@/lib/auth/middleware'
import { createClient } from '@/lib/supabase/server'

// GET /api/projects/[id]/group-info — returns the 3 participants of a project group chat
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const supabase = await createClient()

    const { data: project } = await supabase
      .from('service_requests')
      .select('user_id, assigned_to, manager_id')
      .eq('id', id)
      .single()

    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Access check
    if (user.role === 'customer' && project.user_id !== user.userId)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (user.role === 'vendor' && project.assigned_to !== user.userId)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const ids = [project.user_id, project.assigned_to, project.manager_id].filter(Boolean) as number[]
    const { data: users } = await supabase
      .from('users')
      .select('id, fullname, role, email')
      .in('id', ids)

    // Fallback: if no manager_id, get first ops admin
    let manager = users?.find(u => u.id === project.manager_id) || null
    if (!manager) {
      const { data: ops } = await supabase
        .from('users')
        .select('id, fullname, role, email')
        .eq('role', 'admin')
        .eq('department', 'operations')
        .limit(1)
      manager = ops?.[0] || null
    }

    const client = users?.find(u => u.id === project.user_id) || null
    const vendor = users?.find(u => u.id === project.assigned_to) || null

    return NextResponse.json({ client, vendor, manager })
  } catch (err) {
    const { error, status } = authErrorResponse(err)
    return NextResponse.json({ error }, { status })
  }
}
