import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const deliveryHours = searchParams.get('delivery_hours') // 1, 4, 24, 0 (expert)
    const category = searchParams.get('category')
    const search = searchParams.get('q')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    const supabase = await createClient()

    let query = supabase
      .from('saarthi_xpress_services')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (deliveryHours && deliveryHours !== 'all') {
      query = query.eq('delivery_hours', parseInt(deliveryHours))
    }
    if (category && category !== 'all') {
      query = query.ilike('category', category)
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,short_description.ilike.%${search}%`)
    }

    const from = (page - 1) * limit
    query = query.range(from, from + limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({ services: data || [], total: count || 0 })
  } catch (err) {
    console.error('Saarthi Xpress API error:', err)
    return NextResponse.json({ services: [], total: 0 }, { status: 200 })
  }
}
