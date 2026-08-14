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
  url.searchParams.set('module', 'recruitment')

  if (method === 'GET') {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }

  const headers: Record<string, string> = { 'X-Mobile-Secret': SECRET, 'X-User-Email': email }
  const opts: RequestInit = { method, headers }

  if (method === 'POST') {
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
    const bodyParams = { module: 'recruitment', ...params }
    opts.body = new URLSearchParams(bodyParams).toString()
  }

  const res = await fetch(url.toString(), opts)
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    console.error('[Career Bridge] Non-JSON recruitment response:', text.slice(0, 200))
    return { success: false, message: 'Invalid response from career server' }
  }
}

export async function GET(req: Request) {
  const user = await getCurrentUser()
  if (!user || !['super_admin', 'admin', 'board_member'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const action   = searchParams.get('action') || 'jobs'
  const job_id   = searchParams.get('job_id') || ''
  const status   = searchParams.get('status') || ''

  const data = await callCareer(user.email, 'GET', {
    module: 'recruitment',
    action,
    ...(job_id ? { job_id } : {}),
    ...(status ? { status } : {}),
  })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user || !['super_admin', 'admin', 'board_member'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawBody: Record<string, any> = await req.json()
  const body = toStringRecord(rawBody)

  const data = await callCareer(user.email, 'POST', body)
  return NextResponse.json(data)
}
