import { NextResponse } from 'next/server'
import { requireRole, authErrorResponse } from '@/lib/auth/middleware'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

/**
 * Admin Vendor Applications API
 * GET  - List all vendor applications with filtering
 * PATCH - Update pipeline step (notes, scheduling, approve/reject)
 * DELETE - Delete a rejected application (erase data)
 */

export async function GET(request: Request) {
  try {
    await requireRole('super_admin', 'admin')
    const supabase = await createClient()
    const url = new URL(request.url)
    const status = url.searchParams.get('status') || 'all'
    const id = url.searchParams.get('id')

    if (id) {
      // Get single application
      const { data, error } = await supabase
        .from('vendor_applications')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      // Remove password_hash before returning
      if (data) delete (data as any).password_hash
      return NextResponse.json({ application: data })
    }

    let query = supabase
      .from('vendor_applications')
      .select('id, vendor_id, fullname, email, phone, education, experience_years, skills, previous_companies, certifications, resume_link, work_samples, q1_projects_experience, q2_pricing, q3_guidelines_corrections, q4_teaching_ability, q5_sample_sharing, status, current_step, pipeline_step, step_1_done, step_2_done, step_3_done, step_4_done, interview_scheduled_at, hr_call_at, hr_call_notes, admin_notes, interview_notes, rejection_reason, reviewer_id, reviewed_at, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ applications: data || [], total: data?.length || 0 })
  } catch (err) {
    const { error, status } = authErrorResponse(err)
    return NextResponse.json({ error }, { status })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireRole('super_admin', 'admin')
    const supabase = await createClient()
    const body = await request.json()
    const { id, action, ...fields } = body

    if (!id) return NextResponse.json({ error: 'Application ID required' }, { status: 400 })

    // Get current application
    const { data: app, error: fetchErr } = await supabase
      .from('vendor_applications')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchErr || !app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // ── Action: APPROVE ────────────────────────────────────────────
    if (action === 'approve') {
      if (!app.password_hash) {
        return NextResponse.json({ error: 'Cannot approve: vendor did not set a password during application' }, { status: 400 })
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .ilike('email', app.email)
        .maybeSingle()

      let userId = existingUser?.id

      if (!userId) {
        // Create the user account with the stored password hash
        const { data: newUser, error: userErr } = await supabase
          .from('users')
          .insert({
            fullname: app.fullname,
            email: app.email,
            phone: app.phone,
            password: app.password_hash, // Already hashed
            role: 'vendor',
            status: 'active',
            is_approved: true,
            email_verified: true,
            created_at: new Date().toISOString(),
          })
          .select('id')
          .single()

        if (userErr || !newUser) {
          return NextResponse.json({ error: `Failed to create user account: ${userErr?.message}` }, { status: 500 })
        }
        userId = newUser.id
      } else {
        // Update existing user to vendor role
        await supabase
          .from('users')
          .update({ role: 'vendor', status: 'active', is_approved: true })
          .eq('id', userId)
      }

      // Create or update vendor profile
      const { data: existingVendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      if (!existingVendor) {
        await supabase.from('vendors').insert({
          user_id: userId,
          company_name: app.fullname,
          specialization: Array.isArray(app.skills) ? app.skills.join(', ') : app.skills,
          portfolio_url: app.resume_link,
          bio: JSON.stringify({
            education: app.education,
            experience_years: app.experience_years,
            previous_companies: app.previous_companies,
            certifications: app.certifications,
          }),
          is_approved: true,
          rating: 0,
          total_projects: 0,
        })
      } else {
        await supabase.from('vendors').update({ is_approved: true, user_id: userId }).eq('id', existingVendor.id)
      }

      // Update application status to approved and clear password hash
      await supabase
        .from('vendor_applications')
        .update({
          status: 'approved',
          pipeline_step: 'approved',
          step_4_done: true,
          user_id: userId,
          password_hash: null, // Clear the temp password hash
          reviewer_id: session?.id || null,
          reviewed_at: new Date().toISOString(),
          admin_notes: fields.admin_notes || app.admin_notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      return NextResponse.json({ success: true, message: 'Vendor approved. Account created successfully.', user_id: userId })
    }

    // ── Action: REJECT ─────────────────────────────────────────────
    if (action === 'reject') {
      // Update status to rejected first
      await supabase
        .from('vendor_applications')
        .update({
          status: 'rejected',
          pipeline_step: 'rejected',
          rejection_reason: fields.rejection_reason || 'Application did not meet requirements',
          reviewer_id: session?.id || null,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      // Delete the application entirely to erase data (as per requirement)
      if (fields.erase_data !== false) {
        await supabase.from('vendor_applications').delete().eq('id', id)
      }

      return NextResponse.json({ success: true, message: 'Application rejected. Data erased.' })
    }

    // ── Action: UPDATE PIPELINE STEP ──────────────────────────────
    const allowedFields = [
      'pipeline_step', 'step_1_done', 'step_2_done', 'step_3_done', 'step_4_done',
      'admin_notes', 'interview_notes', 'hr_call_at', 'hr_call_notes',
      'interview_scheduled_at', 'status',
    ]

    const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const key of allowedFields) {
      if (key in fields) updatePayload[key] = fields[key]
    }

    // Auto-advance pipeline step based on checklist
    if (!action && !fields.pipeline_step) {
      const step1 = fields.step_1_done ?? app.step_1_done
      const step2 = fields.step_2_done ?? app.step_2_done
      const step3 = fields.step_3_done ?? app.step_3_done
      const step4 = fields.step_4_done ?? app.step_4_done

      if (step4) updatePayload.pipeline_step = 'final_review'
      else if (step3) updatePayload.pipeline_step = 'interview'
      else if (step2) updatePayload.pipeline_step = 'hr_call'
      else if (step1) updatePayload.pipeline_step = 'resume_check'
      else updatePayload.pipeline_step = 'application_review'
    }

    // Update status to under_review when admin first opens it
    if (app.status === 'pending') {
      updatePayload.status = 'under_review'
    }

    const { data: updated, error: updateErr } = await supabase
      .from('vendor_applications')
      .update(updatePayload)
      .eq('id', id)
      .select('id, status, pipeline_step, step_1_done, step_2_done, step_3_done, step_4_done, admin_notes, interview_notes, hr_call_at, hr_call_notes, interview_scheduled_at')
      .single()

    if (updateErr) throw updateErr

    return NextResponse.json({ success: true, application: updated })
  } catch (err) {
    const { error, status } = authErrorResponse(err)
    return NextResponse.json({ error }, { status })
  }
}

export async function DELETE(request: Request) {
  try {
    await requireRole('super_admin', 'admin')
    const supabase = await createClient()
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'Application ID required' }, { status: 400 })

    const { error } = await supabase
      .from('vendor_applications')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    const { error, status } = authErrorResponse(err)
    return NextResponse.json({ error }, { status })
  }
}
