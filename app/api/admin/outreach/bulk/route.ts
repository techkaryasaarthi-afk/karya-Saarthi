import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/middleware'
import { sendEmail } from '@/lib/email'
import { createClient } from '@/lib/supabase/server'

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

// GET: fetch campaigns list or a single campaign's status
export async function GET(request: Request) {
  const user = await getCurrentUser()
  if (!user || !ALLOWED_ROLES.includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  const supabase = await createClient()

  if (id) {
    const { data: campaign, error } = await supabase
      .from('bulk_outreach_campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    return NextResponse.json({ campaign })
  }

  const { data: campaigns, error } = await supabase
    .from('bulk_outreach_campaigns')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ campaigns })
}

// POST: start a new campaign asynchronously
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

    const supabase = await createClient()

    // 1. Write the initial campaign entry in DB
    const { data: campaign, error: dbError } = await supabase
      .from('bulk_outreach_campaigns')
      .insert({
        channel,
        subject: channel === 'email' ? subject : null,
        message,
        total_recipients: recipients.length,
        sent_count: 0,
        failed_count: 0,
        status: 'processing',
        errors: []
      })
      .select()
      .single()

    if (dbError || !campaign) {
      console.error('[bulk-outreach] DB insert error', dbError)
      return NextResponse.json({ error: 'Failed to initialize campaign in database' }, { status: 500 })
    }

    // 2. Launch background process (fire-and-forget IIFE)
    (async () => {
      let sent = 0
      let failed = 0
      const errorsList: string[] = []

      try {
        const batches = chunk(recipients, BATCH_SIZE)

        for (const batch of batches) {
          const results = await Promise.allSettled(
            batch.map(async recipient => {
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
            })
          )

          results.forEach((res, index) => {
            if (res.status === 'fulfilled') {
              sent += 1
            } else {
              failed += 1
              if (errorsList.length < 50) {
                errorsList.push(`${batch[index]}: ${res.reason instanceof Error ? res.reason.message : 'Failed'}`)
              }
            }
          })

          // Update progress after each batch
          await supabase
            .from('bulk_outreach_campaigns')
            .update({
              sent_count: sent,
              failed_count: failed,
              errors: errorsList
            })
            .eq('id', campaign.id)
        }

        // Finalize campaign
        await supabase
          .from('bulk_outreach_campaigns')
          .update({
            status: 'completed',
            sent_count: sent,
            failed_count: failed,
            errors: errorsList
          })
          .eq('id', campaign.id)

      } catch (bgError) {
        console.error('[bulk-outreach-bg] error', bgError)
        await supabase
          .from('bulk_outreach_campaigns')
          .update({
            status: 'failed',
            errors: [...errorsList, bgError instanceof Error ? bgError.message : 'Fatal background error']
          })
          .eq('id', campaign.id)
      }
    })()

    // 3. Return the campaign details immediately
    return NextResponse.json({
      success: true,
      campaignId: campaign.id,
      status: 'processing',
      total: recipients.length
    })

  } catch (error) {
    console.error('[bulk-outreach] error', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Bulk send failed' }, { status: 500 })
  }
}
