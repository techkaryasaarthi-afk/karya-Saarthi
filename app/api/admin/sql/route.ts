import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/middleware'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'super_admin' && user.department !== 'all_saarthi')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const { sql } = await request.json()
    if (!sql || typeof sql !== 'string') {
      return NextResponse.json({ error: 'SQL query is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase.rpc('execute_sql', { sql })

    if (error) {
      return NextResponse.json({ error: error.message, details: error.details }, { status: 400 })
    }

    // Handle internal errors thrown inside the PG function exception block
    if (data && typeof data === 'object' && 'error' in data) {
      return NextResponse.json({ error: data.error, details: data.detail }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('[admin-sql] error', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Execution failed' }, { status: 500 })
  }
}
