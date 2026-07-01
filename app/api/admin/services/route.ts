import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/middleware'

/** Convert Google Drive share links to a direct-renderable image URL */
function convertImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const driveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]+)/)
  if (driveMatch) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}=w1200`
  }
  return url
}

// GET /api/admin/services — admin view (all services incl inactive)
export async function GET(request: Request) {
  const user = await getCurrentUser()
  if (!user || !['super_admin', 'admin'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const search = searchParams.get('q')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit

  const supabase = await createClient()
  let query = supabase
    .from('services')
    .select('id, title, slug, category, short_description, price_min, price_max, delivery_days, featured_image, rating, total_orders, is_featured, is_active, tags, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (category && category !== 'all') query = query.eq('category', category)
  if (search) query = query.ilike('title', `%${search}%`)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ services: data || [], total: count || 0, page, limit })
}

// POST /api/admin/services — create service
export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user || !['super_admin', 'admin'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const {
      title, category, short_description, description,
      price_min, price_max, delivery_days,
      tags, is_featured, is_active, featured_image
    } = body

    if (!title || !category) {
      return NextResponse.json({ error: 'title and category are required' }, { status: 400 })
    }

    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '-') + '-' + Date.now()

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('services')
      .insert({
        title,
        slug,
        category: category.toLowerCase(),
        short_description: short_description || '',
        description: description || '',
        price_min: price_min ? Number(price_min) : null,
        price_max: price_max ? Number(price_max) : null,
        delivery_days: delivery_days ? Number(delivery_days) : 3,
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []),
        is_featured: Boolean(is_featured),
        is_active: is_active !== false,
        featured_image: convertImageUrl(featured_image),
        rating: 0,
        total_orders: 0,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ service: data }, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create service'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// PATCH /api/admin/services — update service
export async function PATCH(request: Request) {
  const user = await getCurrentUser()
  if (!user || !['super_admin', 'admin'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { id, ...raw } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    // Build a clean update payload — only known DB columns, no extras
    // This prevents "column does not exist" errors if schema has drifted
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const patch: Record<string, any> = {}

    if (raw.title !== undefined) patch.title = String(raw.title)
    if (raw.short_description !== undefined) patch.short_description = String(raw.short_description || '')
    if (raw.description !== undefined) patch.description = String(raw.description || '')
    if (raw.category !== undefined) patch.category = String(raw.category).toLowerCase()
    if (raw.price_min !== undefined) patch.price_min = raw.price_min ? Number(raw.price_min) : null
    if (raw.price_max !== undefined) patch.price_max = raw.price_max ? Number(raw.price_max) : null
    if (raw.delivery_days !== undefined) patch.delivery_days = Number(raw.delivery_days) || 3
    if (raw.is_featured !== undefined) patch.is_featured = Boolean(raw.is_featured)
    if (raw.is_active !== undefined) patch.is_active = Boolean(raw.is_active)
    if ('featured_image' in raw) patch.featured_image = convertImageUrl(raw.featured_image)
    if (raw.tags !== undefined) {
      patch.tags = typeof raw.tags === 'string'
        ? raw.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : Array.isArray(raw.tags) ? raw.tags : []
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('services')
      .update(patch)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[PATCH /api/admin/services] DB error:', error)
      return NextResponse.json({ error: error.message, details: error.details, hint: error.hint }, { status: 500 })
    }
    return NextResponse.json({ service: data })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update service'
    console.error('[PATCH /api/admin/services] Unexpected error:', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// DELETE /api/admin/services — soft delete
export async function DELETE(request: Request) {
  const user = await getCurrentUser()
  if (!user || !['super_admin', 'admin'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const supabase = await createClient()
  const { error } = await supabase
    .from('services')
    .update({ is_active: false })
    .eq('id', Number(id))

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
