import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireRole, authErrorResponse } from '@/lib/auth/middleware'

// ── Default fallback (used if DB row not yet created) ──────────────────────
export const DEFAULT_HOMEPAGE_SETTINGS = {
  ticker_enabled: true,
  ticker_text:
    '🎉 Now Offering Research Paper Writing + Thesis Help — Get Expert Guidance Today! • Assignment Help & Handmade Projects Available • Website & App Development Starting ₹5,000',
  ticker_color: '#FF6B35',
  ticker_bg: '#0d0d0d',
  hero_stats: [
    { value: '500+',  label: 'Projects Completed' },
    { value: '2000+', label: 'Happy Clients' },
    { value: '98%',   label: 'Satisfaction Rate' },
    { value: '5★',    label: 'Average Rating' },
  ],
  stats_section: [
    { icon: '🏆', value: 500,  suffix: '+', label: 'Projects Completed' },
    { icon: '⭐', value: 98,   suffix: '%', label: 'Client Satisfaction' },
    { icon: '👥', value: 2000, suffix: '+', label: 'Happy Clients' },
    { icon: '🎓', value: 50,   suffix: '+', label: 'Service Categories' },
  ],
  service_tiles: [
    { title: 'Website & App Development',          color: '#0099ff', icon: '💻', audience: ['all', 'students', 'professionals', 'businesses'] },
    { title: 'Research Paper & Thesis Writing',    color: '#22c55e', icon: '📄', audience: ['all', 'students', 'professionals'] },
    { title: 'Assignment Help & Handmade Projects',color: '#f59e0b', icon: '✍️', audience: ['all', 'students'] },
    { title: 'SEO & Digital Marketing',            color: '#ff7a3d', icon: '📣', audience: ['all', 'businesses', 'professionals'] },
    { title: '3D Design & Video Editing',          color: '#d44df0', icon: '🎨', audience: ['all', 'businesses', 'professionals'] },
    { title: 'API Integration & Automation',       color: '#6a4cf5', icon: '⚙️', audience: ['all', 'businesses', 'professionals'] },
    { title: 'Government & Business Solutions',    color: '#FF6B35', icon: '🏛️', audience: ['all', 'businesses', 'government'] },
    { title: 'Study Abroad & Visa Consulting',     color: '#06b6d4', icon: '🌍', audience: ['all', 'students', 'professionals'] },
  ],
}

// ── Public GET ─────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('homepage_settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (error || !data) {
      return NextResponse.json(DEFAULT_HOMEPAGE_SETTINGS)
    }

    return NextResponse.json({
      ...DEFAULT_HOMEPAGE_SETTINGS,
      ...data,
    })
  } catch {
    return NextResponse.json(DEFAULT_HOMEPAGE_SETTINGS)
  }
}

// ── Super-admin PATCH ──────────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireRole('super_admin')
    const body = await req.json()

    // Allowlist of editable fields
    const allowed = [
      'ticker_enabled', 'ticker_text', 'ticker_color', 'ticker_bg',
      'hero_stats', 'stats_section', 'service_tiles',
    ]
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString(), updated_by: user.id }
    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('homepage_settings')
      .upsert({ id: 1, ...updates })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const { error, status } = authErrorResponse(err)
    return NextResponse.json({ error }, { status })
  }
}
