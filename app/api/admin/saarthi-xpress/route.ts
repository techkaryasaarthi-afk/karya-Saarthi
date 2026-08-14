import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Verify admin
async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  return !!user
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('saarthi_xpress_services')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ services: data || [] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ services: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await req.json()

    // Generate slug from title
    const slug = body.slug || body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const { data, error } = await supabase
      .from('saarthi_xpress_services')
      .insert([{ ...body, slug }])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ service: data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await req.json()
    const { id, ...updates } = body

    const { data, error } = await supabase
      .from('saarthi_xpress_services')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ service: data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await req.json()
    const { id } = body

    const { error } = await supabase
      .from('saarthi_xpress_services')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
