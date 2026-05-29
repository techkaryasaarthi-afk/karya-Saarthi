import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/middleware'
import { sendEmail } from '@/lib/email'

const ALLOWED_ROLES = ['super_admin', 'board_member', 'admin']
const MAX_RECIPIENTS = 10000
const BATCH_SIZE = 25

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size))
  return chunks
}

async function sendWhatsAppMessage(phone: string, message: string) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!token || !phoneNumberId) {
    throw new Error('WhatsApp API credentials are not configured')
  }

  const response = await fetch(`https://graph.facebook.com/v23.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: { body: message },
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error?.message || 'WhatsApp send failed')
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user || !ALLOWED_ROLES.includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const channel = body.channel as 'email' | 'whatsapp'
    const recipients: string[] = Array.from(new Set((body.recipients || []).map((item: string) => String(item).trim()).filter(Boolean)))
    const subject = String(body.subject || '').trim()
    const message = String(body.message || '').trim()

    if (!['email', 'whatsapp'].includes(channel)) {
      return NextResponse.json({ error: 'Invalid channel' }, { status: 400 })
    }

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (channel === 'email' && !subject) {
      return NextResponse.json({ error: 'Email subject is required' }, { status: 400 })
    }

    if (recipients.length === 0 || recipients.length > MAX_RECIPIENTS) {
      return NextResponse.json({ error: `Recipients must be between 1 and ${MAX_RECIPIENTS}` }, { status: 400 })
    }

    let sent = 0
    let failed = 0
    const errors: string[] = []

    for (const recipientBatch of chunk(recipients, BATCH_SIZE)) {
      const results = await Promise.allSettled(
        recipientBatch.map(async recipient => {
          if (channel === 'email') {
            const result = await sendEmail({
              to: recipient,
              subject,
              html: `<div style="font-family:Arial,sans-serif;line-height:1.6;white-space:pre-wrap">${message}</div>`,
            })
            if (!result.success) throw new Error(`Email failed for ${recipient}`)
            return
          }

          await sendWhatsAppMessage(recipient, message)
        }),
      )

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          sent += 1
        } else {
          failed += 1
          if (errors.length < 10) errors.push(`${recipientBatch[index]}: ${result.reason instanceof Error ? result.reason.message : 'Failed'}`)
        }
      })
    }

    return NextResponse.json({
      success: true,
      channel,
      sent,
      failed,
      total: recipients.length,
      errors,
    })
  } catch (error) {
    console.error('[bulk-outreach] error', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Bulk send failed' }, { status: 500 })
  }
}
