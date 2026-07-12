-- Table for multi-step vendor applications
CREATE TABLE IF NOT EXISTS vendor_applications (
    id BIGSERIAL PRIMARY KEY,
    vendor_id VARCHAR(50),
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
    current_step INT DEFAULT 1,
    fullname VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    education VARCHAR(255),
    experience_years INT DEFAULT 0,
    skills TEXT[] DEFAULT '{}',
    previous_companies TEXT,
    certifications TEXT,
    resume_link TEXT,
    work_samples JSONB DEFAULT '[]'::jsonb,
    q1_projects_experience TEXT,
    q2_pricing TEXT,
    q3_guidelines_corrections TEXT,
    q4_teaching_ability TEXT,
    q5_sample_sharing TEXT,
    interview_date TIMESTAMPTZ,
    total_score INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_applications_email ON vendor_applications(email);
CREATE INDEX IF NOT EXISTS idx_vendor_applications_user ON vendor_applications(user_id);

ALTER TABLE vendor_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access" ON vendor_applications;
CREATE POLICY "Service role full access" ON vendor_applications FOR ALL USING (true) WITH CHECK (true);
