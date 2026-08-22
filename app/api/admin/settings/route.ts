import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/admin/settings?key=some_key  — returns value for a setting key
// POST /api/admin/settings  — body: { key, value }  — upserts a setting
// Used for dynamic platform settings like xpress_banner_poster

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const key = req.nextUrl.searchParams.get('key')
    if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 })
    const { data } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle()
    return NextResponse.json({ value: data?.value ?? null })
  } catch {
    return NextResponse.json({ value: null })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const { key, value } = body
    if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 })
    const { error } = await supabase
      .from('admin_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 })
  }
}
