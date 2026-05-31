import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/middleware'

const ALLOWED_ROLES = ['super_admin', 'board_member', 'admin']

export async function GET() {
  const user = await getCurrentUser()
  if (!user || !ALLOWED_ROLES.includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const whatsappConfigured = !!(
    process.env.WHATSAPP_ACCESS_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID
  )

  const emailConfigured = !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  )

  return NextResponse.json({
    whatsapp: whatsappConfigured,
    email: emailConfigured,
  })
}
