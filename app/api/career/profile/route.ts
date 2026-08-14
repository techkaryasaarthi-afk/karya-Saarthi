import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/middleware'

const CAREER_API = 'https://career.karyasaarthi.com/api/mobile.php'
const SECRET = process.env.CAREER_MOBILE_SECRET || 'ks-mobile-bridge-2025-secret'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(CAREER_API)
  url.searchParams.set('module', 'profile')
  url.searchParams.set('action', 'get')

  const res = await fetch(url.toString(), {
    headers: { 'X-Mobile-Secret': SECRET, 'X-User-Email': user.email },
  })
  const data = await res.json()
  return NextResponse.json(data)
}
