import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/middleware'

const ALLOWED = ['super_admin', 'board_member', 'admin']

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user || !ALLOWED.includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const apiUrl = process.env.META_AI_API_URL
  const apiKey = process.env.META_AI_API_KEY

  if (!apiUrl || !apiKey) {
    return NextResponse.json({ error: 'Meta AI API is not configured' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Meta AI request failed' }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Meta AI request failed' }, { status: 500 })
  }
}
