import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/middleware'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'super_admin' && user.department !== 'all_saarthi')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const supabase = await createClient()

    const getCount = async (promise: any) => {
      try {
        const { count } = await promise
        return count || 0
      } catch {
        return 0
      }
    }

    // 1. Campus Saarthi Stats
    const ambassadors = await getCount(supabase.from('campus_ambassadors').select('id', { count: 'exact', head: true }))
    
    // 2. Calling Saarthi Stats
    const callingScripts = await getCount(supabase.from('calling_scripts').select('id', { count: 'exact', head: true }))
    const callLogs = await getCount(supabase.from('call_logs').select('id', { count: 'exact', head: true }))

    // 3. Digital Saarthi Stats
    const seoKeywords = await getCount(supabase.from('dm_seo_keywords').select('id', { count: 'exact', head: true }))
    const socialPosts = await getCount(supabase.from('dm_social_posts').select('id', { count: 'exact', head: true }))

    // 4. Government Saarthi Stats
    const tenders = await getCount(supabase.from('tenders').select('id', { count: 'exact', head: true }))
    const govtContacts = await getCount(supabase.from('govt_contacts').select('id', { count: 'exact', head: true }))

    // 5. Marketing Saarthi Stats
    const campaigns = await getCount(supabase.from('campaigns').select('id', { count: 'exact', head: true }))
    const partneredCompanies = await getCount(supabase.from('marketing_partnered_companies').select('id', { count: 'exact', head: true }))

    // 6. User Stats
    const totalUsers = await getCount(supabase.from('users').select('id', { count: 'exact', head: true }))
    const pendingAdmins = await getCount(supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'pending_admin'))

    return NextResponse.json({
      campus: { ambassadors: ambassadors || 0 },
      calling: { scripts: callingScripts || 0, logs: callLogs || 0 },
      digital: { keywords: seoKeywords || 0, posts: socialPosts || 0 },
      government: { tenders: tenders || 0, contacts: govtContacts || 0 },
      marketing: { campaigns: campaigns || 0, partners: partneredCompanies || 0 },
      system: { totalUsers: totalUsers || 0, pendingAdmins: pendingAdmins || 0 }
    })

  } catch (err) {
    console.error('[all-saarthi-stats] error', err)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
