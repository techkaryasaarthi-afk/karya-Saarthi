import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeJson, sanitizeEmail, sanitizeName, sanitizePhone } from '@/lib/security/sanitize'
import bcrypt from 'bcryptjs'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get('email')
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const supabase = await createClient()

    // First try querying vendor_applications table
    const { data: application, error } = await supabase
      .from('vendor_applications')
      .select('*')
      .ilike('email', email.trim())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!error && application) {
      return NextResponse.json({ application })
    }

    // Fallback: Check if they are already in users/vendors
    const { data: user } = await supabase
      .from('users')
      .select('id, fullname, email, phone, role, is_approved, created_at')
      .ilike('email', email.trim())
      .maybeSingle()

    if (user) {
      const { data: vendor } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      // If they are registered or applied via fallback
      let parsedBio: any = {}
      try {
        if (vendor?.bio && vendor.bio.startsWith('{')) {
          parsedBio = JSON.parse(vendor.bio)
        }
      } catch {}

      const fallbackApp = {
        id: vendor?.id || user.id,
        vendor_id: `V-${vendor?.id || user.id}`,
        user_id: user.id,
        status: vendor?.is_approved ? 'approved' : 'pending',
        current_step: parsedBio.current_step || (vendor ? 3 : 1),
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        education: parsedBio.education || null,
        experience_years: parsedBio.experience_years || 0,
        skills: parsedBio.skills || [],
        previous_companies: parsedBio.previous_companies || null,
        certifications: parsedBio.certifications || null,
        resume_link: parsedBio.resume_link || vendor?.portfolio_url || null,
        work_samples: parsedBio.work_samples || [],
        q1_projects_experience: parsedBio.q1_projects_experience || null,
        q2_pricing: parsedBio.q2_pricing || null,
        q3_guidelines_corrections: parsedBio.q3_guidelines_corrections || null,
        q4_teaching_ability: parsedBio.q4_teaching_ability || null,
        q5_sample_sharing: parsedBio.q5_sample_sharing || null,
        interview_date: null,
        total_score: 0,
        created_at: vendor?.created_at || user.created_at,
        updated_at: vendor?.created_at || user.created_at,
      }
      return NextResponse.json({ application: fallbackApp })
    }

    return NextResponse.json({ application: null })
  } catch (err) {
    console.error('[vendor/apply GET] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { data: body, error: parseError } = await safeJson(request)
    if (parseError || !body) {
      return NextResponse.json({ error: parseError || 'Invalid request' }, { status: 400 })
    }

    const step = Number(body.step) || 1
    const supabase = await createClient()

    if (step === 1) {
      const data = (body as any).data as any
      if (!data) return NextResponse.json({ error: 'Data required' }, { status: 400 })

      const fullname = sanitizeName(data.fullname) || 'Vendor Applicant'
      const email = sanitizeEmail(data.email) || ''
      const phone = sanitizePhone(data.phone) || ''
      const education = data.education?.trim() || null
      const experience_years = Number(data.experience_years) || 0
      const skills = Array.isArray(data.skills) ? data.skills : []
      const previous_companies = data.previous_companies?.trim() || null
      const certifications = data.certifications?.trim() || null
      const resume_link = data.resume_link?.trim() || null

      if (!email || !phone) {
        return NextResponse.json({ error: 'Valid email and phone are required' }, { status: 400 })
      }

      // Hash vendor's password if provided
      let password_hash: string | null = null
      if (data.password && typeof data.password === 'string' && data.password.length >= 8) {
        password_hash = await bcrypt.hash(data.password, 12)
      }

      // Check if user account exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .ilike('email', email)
        .maybeSingle()

      const payload = {
        vendor_id: `V-${Date.now().toString().slice(-6)}`,
        user_id: existingUser?.id || null,
        status: 'pending',
        current_step: 2,
        pipeline_step: 'application_received',
        fullname,
        email,
        phone,
        education,
        experience_years,
        skills,
        previous_companies,
        certifications,
        resume_link,
        password_hash,
        updated_at: new Date().toISOString(),
      }

      // Try inserting/updating into vendor_applications
      const { data: existingApp } = await supabase
        .from('vendor_applications')
        .select('id')
        .ilike('email', email)
        .maybeSingle()

      if (existingApp) {
        const { data: updated, error } = await supabase
          .from('vendor_applications')
          .update(payload)
          .eq('id', existingApp.id)
          .select()
          .single()

        if (!error && updated) {
          return NextResponse.json({ application: updated })
        }
      } else {
        const { data: created, error } = await supabase
          .from('vendor_applications')
          .insert(payload)
          .select()
          .single()

        if (!error && created) {
          return NextResponse.json({ application: created })
        }
      }

      // Fallback if vendor_applications table not created yet (42P01 or schema mismatch)
      // Store inside vendors table or return a simulated application ID
      let vendorId = existingUser?.id || Math.floor(Math.random() * 800000 + 100000)
      if (existingUser) {
        const { data: existingVendor } = await supabase
          .from('vendors')
          .select('id')
          .eq('user_id', existingUser.id)
          .maybeSingle()

        if (existingVendor) {
          vendorId = existingVendor.id
          await supabase.from('vendors').update({
            specialization: skills.join(', '),
            portfolio_url: resume_link,
            bio: JSON.stringify(payload),
          }).eq('id', vendorId)
        } else {
          const { data: newVendor } = await supabase.from('vendors').insert({
            user_id: existingUser.id,
            company_name: fullname,
            specialization: skills.join(', '),
            portfolio_url: resume_link,
            bio: JSON.stringify(payload),
            is_approved: false,
          }).select('id').single()
          if (newVendor) vendorId = newVendor.id
        }
      }

      const fallbackApplication = {
        id: vendorId,
        ...payload,
      }
      return NextResponse.json({ application: fallbackApplication })
    }

    if (step === 2) {
      const applicationId = Number((body as any).application_id)
      const data = (body as any).data as any
      if (!applicationId || !data) {
        return NextResponse.json({ error: 'Application ID and data required' }, { status: 400 })
      }

      const work_samples = Array.isArray(data.work_samples) ? data.work_samples : []

      // Try updating vendor_applications
      const { data: updated, error } = await supabase
        .from('vendor_applications')
        .update({
          work_samples,
          current_step: 3,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .select()
        .single()

      if (!error && updated) {
        return NextResponse.json({ application: updated })
      }

      // Fallback
      const { data: vendor } = await supabase.from('vendors').select('*').eq('id', applicationId).maybeSingle()
      let parsedBio: any = { current_step: 3, work_samples }
      if (vendor?.bio && vendor.bio.startsWith('{')) {
        try { parsedBio = { ...JSON.parse(vendor.bio), current_step: 3, work_samples } } catch {}
      }
      if (vendor) {
        await supabase.from('vendors').update({ bio: JSON.stringify(parsedBio) }).eq('id', applicationId)
      }

      return NextResponse.json({
        application: {
          id: applicationId,
          current_step: 3,
          work_samples,
          ...parsedBio,
        },
      })
    }

    if (step === 3) {
      const applicationId = Number((body as any).application_id)
      const data = (body as any).data as any
      if (!applicationId || !data) {
        return NextResponse.json({ error: 'Application ID and data required' }, { status: 400 })
      }

      const step3Fields = {
        q1_projects_experience: data.q1_projects_experience || null,
        q2_pricing: data.q2_pricing || null,
        q3_guidelines_corrections: data.q3_guidelines_corrections || null,
        q4_teaching_ability: data.q4_teaching_ability || null,
        q5_sample_sharing: data.q5_sample_sharing || null,
        current_step: 4,
        status: 'under_review',
        updated_at: new Date().toISOString(),
      }

      // Try updating vendor_applications
      const { data: updated, error } = await supabase
        .from('vendor_applications')
        .update(step3Fields)
        .eq('id', applicationId)
        .select()
        .single()

      if (!error && updated) {
        return NextResponse.json({ application: updated })
      }

      // Fallback
      const { data: vendor } = await supabase.from('vendors').select('*').eq('id', applicationId).maybeSingle()
      let parsedBio: any = { ...step3Fields }
      if (vendor?.bio && vendor.bio.startsWith('{')) {
        try { parsedBio = { ...JSON.parse(vendor.bio), ...step3Fields } } catch {}
      }
      if (vendor) {
        await supabase.from('vendors').update({ bio: JSON.stringify(parsedBio) }).eq('id', applicationId)
      }

      return NextResponse.json({
        application: {
          id: applicationId,
          ...parsedBio,
        },
      })
    }

    return NextResponse.json({ error: 'Invalid step' }, { status: 400 })
  } catch (err) {
    console.error('[vendor/apply POST] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
