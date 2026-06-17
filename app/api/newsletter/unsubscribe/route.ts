import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ status: 'unsubscribed' })
      .eq('email', email.toLowerCase().trim())

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, message: 'Unsubscribed successfully.' })
  } catch (err) {
    console.error('Unsubscribe error:', err)
    return NextResponse.json({ error: 'Failed to unsubscribe. Please try again.' }, { status: 500 })
  }
}
