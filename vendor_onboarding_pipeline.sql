-- ============================================================
-- Vendor Onboarding Pipeline Migration
-- Run this in Supabase SQL editor
-- ============================================================

-- 1. Add password_hash column for storing temp hashed password until approval
ALTER TABLE vendor_applications
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS interview_notes TEXT,
  ADD COLUMN IF NOT EXISTS hr_call_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS hr_call_notes TEXT,
  ADD COLUMN IF NOT EXISTS interview_scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pipeline_step VARCHAR(50) DEFAULT 'application_received',
  ADD COLUMN IF NOT EXISTS step_1_done BOOLEAN DEFAULT FALSE,  -- Application reviewed
  ADD COLUMN IF NOT EXISTS step_2_done BOOLEAN DEFAULT FALSE,  -- Resume checked
  ADD COLUMN IF NOT EXISTS step_3_done BOOLEAN DEFAULT FALSE,  -- HR call done
  ADD COLUMN IF NOT EXISTS step_4_done BOOLEAN DEFAULT FALSE,  -- Interview done
  ADD COLUMN IF NOT EXISTS reviewer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 2. Add constraint for pipeline_step values
ALTER TABLE vendor_applications
  DROP CONSTRAINT IF EXISTS vendor_applications_pipeline_step_check;
ALTER TABLE vendor_applications
  ADD CONSTRAINT vendor_applications_pipeline_step_check 
  CHECK (pipeline_step IN (
    'application_received', 
    'application_review', 
    'resume_check', 
    'hr_call', 
    'interview', 
    'final_review',
    'approved', 
    'rejected'
  ));

-- 3. Update status check constraint to include more states
ALTER TABLE vendor_applications
  DROP CONSTRAINT IF EXISTS vendor_applications_status_check;
ALTER TABLE vendor_applications
  ADD CONSTRAINT vendor_applications_status_check
  CHECK (status IN ('pending', 'under_review', 'approved', 'rejected'));

-- 4. Index for faster lookups by pipeline step
CREATE INDEX IF NOT EXISTS idx_vendor_applications_pipeline ON vendor_applications(pipeline_step);
CREATE INDEX IF NOT EXISTS idx_vendor_applications_status ON vendor_applications(status);

-- 5. Security: ensure service role can always access
DROP POLICY IF EXISTS "Service role full access" ON vendor_applications;
CREATE POLICY "Service role full access" ON vendor_applications FOR ALL USING (true) WITH CHECK (true);
