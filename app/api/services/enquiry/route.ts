import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/middleware'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { service_id, name, email, phone, message, budget } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const supabase = await createClient()
    const user = await getCurrentUser()

    let finalMessage = message || '';
    if (body.source === 'saarthi_xpress') {
      finalMessage = `[Saarthi Xpress Enquiry - ${body.service_title}]\n\n${finalMessage || 'No additional details provided.'}`;
    }

    const { data, error } = await supabase
      .from('service_enquiries')
      .insert({
        service_id: service_id || null,
        user_id: user?.userId || null,
        name,
        email: email.toLowerCase(),
        phone,
        message: finalMessage,
        budget,
        status: 'new',
      })
      .select()
      .single()

    if (error) throw error

    // Send email notification to admin
    try {
      const { sendEmail, newEnquiryEmail } = await import('@/lib/email')
      await sendEmail({
        to: process.env.SMTP_USER || 'support@karyasaarthi.com',
        ...newEnquiryEmail({
          name,
          email: email.toLowerCase(),
          phone,
          message: finalMessage,
          serviceTitle: body.source === 'saarthi_xpress' ? `Saarthi Xpress - ${body.service_title}` : body.service_title || undefined
        })
      })
    } catch (emailErr) {
      console.error('Failed to send notification email:', emailErr)
      // Do not fail the request if email fails
    }

    // Also push this enquiry into the CRM leads pipeline
    try {
      const serviceInterest = body.source === 'saarthi_xpress' 
        ? `Saarthi Xpress - ${body.service_title}` 
        : (body.service_title || 'General Enquiry')
        
      const { data: newLead, error: leadError } = await supabase.from('leads').insert({
        name,
        email: email.toLowerCase(),
        phone,
        source: body.source === 'saarthi_xpress' ? 'website' : 'website',
        service_interest: serviceInterest,
        stage: 'new',
        priority: body.source === 'saarthi_xpress' ? 'high' : 'medium',
      }).select().single()

      if (leadError) throw leadError

      if (newLead && finalMessage) {
        await supabase.from('crm_followup_log').insert({
          lead_id: newLead.id,
          note: `Enquiry Message:\n${finalMessage}`,
          note_type: 'note',
        })
      }
    } catch (leadErr) {
      console.error('Failed to create lead in CRM:', leadErr)
    }

    return NextResponse.json({ enquiry: data }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to send enquiry' }, { status: 500 })
  }
}
