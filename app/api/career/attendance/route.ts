import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/middleware'

const CAREER_API = 'https://career.karyasaarthi.com/api/mobile.php'
const SECRET = process.env.CAREER_MOBILE_SECRET || 'ks-mobile-bridge-2025-secret'

function toStringRecord(obj: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v !== null && v !== undefined && v !== '') out[k] = String(v)
  }
  return out
}

async function callCareer(email: string, method: string, params: Record<string, string> = {}) {
  const url = new URL(CAREER_API)
  // Always set module in URL so PHP switch works for both GET and POST
  url.searchParams.set('module', params.module || 'attendance')

  if (method === 'GET') {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }

  const headers: Record<string, string> = {
    'X-Mobile-Secret': SECRET,
    'X-User-Email': email,
  }

  const opts: RequestInit = { method, headers }
  if (method === 'POST') {
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
    // Also include module in body for PHP $_POST access
    const bodyParams = { ...params }
    if (!bodyParams.module) bodyParams.module = 'attendance'
    opts.body = new URLSearchParams(bodyParams).toString()
  }

  const res = await fetch(url.toString(), opts)
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    console.error('[Career Bridge] Non-JSON response:', text.slice(0, 200))
    return { success: false, message: 'Invalid response from career server', raw: text.slice(0, 200) }
  }
}

export async function GET(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') || 'status'
  const date   = searchParams.get('date') || ''

  const data = await callCareer(user.email, 'GET', {
    module: 'attendance',
    action,
    ...(date ? { date } : {}),
  })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawBody: Record<string, any> = await req.json()
  const body = toStringRecord(rawBody)
  if (!body.module) body.module = 'attendance'

  const data = await callCareer(user.email, 'POST', body)
  return NextResponse.json(data)
}
