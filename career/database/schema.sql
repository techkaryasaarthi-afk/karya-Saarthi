-- KaryaSaarthi Career Portal - Complete Database Schema
-- Database: karyasaarthi_career
-- Updated: April 2026



-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    whatsapp VARCHAR(15),
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('vendor', 'employee', 'intern', 'campus_saarthi', 'admin', 'freelancer', 'pillar_post', 'part_time', 'teaching_expert') NOT NULL,
    department VARCHAR(100),
    pillar ENUM('campus_saarthi', 'digital_saarthi', 'calling_saarthi', 'government_saarthi', 'market_saarthi') NULL,
    college VARCHAR(200),
    course_year VARCHAR(100),
    referral_code VARCHAR(50) UNIQUE,
    referred_by VARCHAR(50),
    profile_photo VARCHAR(255),
    address TEXT NULL,
    date_of_birth DATE NULL,
    gender ENUM('male','female','other') NULL,
    blood_group VARCHAR(5) NULL,
    bank_name VARCHAR(100) NULL,
    bank_account_no VARCHAR(30) NULL,
    bank_ifsc VARCHAR(20) NULL,
    emergency_contact_name VARCHAR(100) NULL,
    emergency_contact_phone VARCHAR(20) NULL,
    aadhar_number VARCHAR(20) NULL,
    pan_number VARCHAR(15) NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    pincode VARCHAR(10) NULL,
    is_hr_intern BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'inactive', 'hold', 'blocked') DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    joined_date DATE,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- JOB POSTINGS TABLE (8 categories)
-- ============================================
CREATE TABLE job_postings (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category ENUM('vendor', 'intern', 'campus_saarthi', 'employee', 'pillar_post', 'freelancer', 'part_time', 'remote', 'teaching_expert') NOT NULL,
    department VARCHAR(100),
    pillar ENUM('campus_saarthi', 'digital_saarthi', 'calling_saarthi', 'government_saarthi', 'market_saarthi') NULL,
    location VARCHAR(200),
    work_type ENUM('remote', 'onsite', 'hybrid') DEFAULT 'remote',
    job_type ENUM('full_time', 'part_time', 'internship', 'vendor', 'contract', 'freelance') DEFAULT 'full_time',
    description TEXT,
    requirements TEXT,
    responsibilities TEXT,
    eligibility_criteria TEXT,
    benefits_perks TEXT,
    interview_process TEXT,
    age_limit VARCHAR(50),
    skills TEXT,
    experience_required VARCHAR(100),
    compensation_type ENUM('fixed', 'commission', 'stipend', 'unpaid', 'task_based') DEFAULT 'fixed',
    salary_range VARCHAR(100),
    positions INT DEFAULT 1,
    is_featured BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'draft', 'closed', 'scheduled') DEFAULT 'draft',
    deadline DATE,
    scheduled_date DATE NULL,
    application_count INT DEFAULT 0,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- ============================================
-- APPLICATIONS TABLE
-- ============================================
CREATE TABLE applications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    user_id VARCHAR(50) NULL,
    applicant_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    whatsapp VARCHAR(15),
    resume_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    experience VARCHAR(100),
    skills TEXT,
    cover_letter TEXT,
    qa_1 TEXT,
    qa_2 TEXT,
    qa_3 TEXT,
    qa_4 TEXT,
    qa_5 TEXT,
    work_samples TEXT,
    education VARCHAR(200),
    college VARCHAR(200),
    notice_period VARCHAR(50),
    ctc_expectation VARCHAR(100),
    preferred_pillar ENUM('campus_saarthi', 'digital_saarthi', 'calling_saarthi', 'government_saarthi', 'market_saarthi') NULL,
    availability VARCHAR(100),
    hours_per_week INT NULL,
    status ENUM('new', 'shortlisted', 'interview_scheduled', 'selected', 'offer_sent', 'joined', 'rejected') DEFAULT 'new',
    notes TEXT,
    score_comm INT DEFAULT 0,
    score_exp INT DEFAULT 0,
    score_quality INT DEFAULT 0,
    score_teaching INT DEFAULT 0,
    score_avail INT DEFAULT 0,
    total_score INT DEFAULT 0,
    chk_resume_received BOOLEAN DEFAULT FALSE,
    chk_samples_received BOOLEAN DEFAULT FALSE,
    chk_questions_answered BOOLEAN DEFAULT FALSE,
    chk_interview_conducted BOOLEAN DEFAULT FALSE,
    chk_selection_email BOOLEAN DEFAULT FALSE,
    chk_whatsapp_joined BOOLEAN DEFAULT FALSE,
    chk_google_form BOOLEAN DEFAULT FALSE,
    chk_portal_registered BOOLEAN DEFAULT FALSE,
    chk_docs_uploaded BOOLEAN DEFAULT FALSE,
    chk_docs_verified BOOLEAN DEFAULT FALSE,
    chk_vendor_id BOOLEAN DEFAULT FALSE,
    chk_orientation BOOLEAN DEFAULT FALSE,
    chk_first_project BOOLEAN DEFAULT FALSE,
    applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES job_postings(job_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ============================================
-- INTERVIEWS TABLE
-- ============================================
CREATE TABLE interviews (
    interview_id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    interview_type ENUM('video', 'phone', 'in_person') DEFAULT 'video',
    interview_date DATETIME NOT NULL,
    interviewer_id VARCHAR(50),
    meeting_link VARCHAR(255),
    status ENUM('scheduled', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
    feedback TEXT,
    rating INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(application_id),
    FOREIGN KEY (interviewer_id) REFERENCES users(user_id)
);

-- ============================================
-- ATTENDANCE TABLE (Enhanced)
-- ============================================
CREATE TABLE attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    start_time DATETIME,
    end_time DATETIME,
    duration_minutes INT DEFAULT 0,
    status ENUM('working', 'completed', 'absent', 'half_day', 'late') DEFAULT 'working',
    work_mode ENUM('office', 'wfh', 'hybrid') DEFAULT 'office',
    is_late BOOLEAN DEFAULT FALSE,
    overtime_minutes INT DEFAULT 0,
    ip_address VARCHAR(45),
    device VARCHAR(255),
    device_time DATETIME NULL,
    clock_in_lat DECIMAL(10,8) NULL,
    clock_in_lng DECIMAL(11,8) NULL,
    clock_in_address TEXT NULL,
    clock_out_lat DECIMAL(10,8) NULL,
    clock_out_lng DECIMAL(11,8) NULL,
    clock_out_address TEXT NULL,
    location_accuracy VARCHAR(100) NULL,
    notes TEXT,
    work_summary TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================
-- ATTENDANCE REGULARISATION REQUESTS
-- ============================================
CREATE TABLE attendance_regularisation (
    reg_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (approved_by) REFERENCES users(user_id)
);

-- ============================================
-- LEADS TABLE (Campus Saarthi)
-- ============================================
CREATE TABLE leads (
    lead_id VARCHAR(50) PRIMARY KEY,
    campus_saarthi_id VARCHAR(50) NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(15),
    customer_whatsapp VARCHAR(15),
    customer_email VARCHAR(100),
    college VARCHAR(200),
    course_year VARCHAR(100),
    service_required VARCHAR(200),
    project_details TEXT,
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    urgency ENUM('urgent', 'normal', 'flexible') DEFAULT 'normal',
    source ENUM('campus_saarthi', 'social_media', 'referral', 'other') DEFAULT 'campus_saarthi',
    status ENUM('new', 'contacted', 'discussion', 'won', 'lost') DEFAULT 'new',
    project_value DECIMAL(10,2),
    commission_amount DECIMAL(10,2),
    commission_status ENUM('pending', 'approved', 'paid', 'rejected') DEFAULT 'pending',
    admin_notes TEXT,
    submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (campus_saarthi_id) REFERENCES users(user_id)
);

-- ============================================
-- PAYMENTS TABLE
-- ============================================
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_type ENUM('salary', 'commission', 'bonus', 'stipend', 'referral_bonus', 'task_payout') NOT NULL,
    reference_id VARCHAR(100),
    description TEXT,
    status ENUM('pending', 'approved', 'paid', 'rejected') DEFAULT 'pending',
    payment_date DATE,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ============================================
-- ACTIVITY LOGS TABLE
-- ============================================
CREATE TABLE activity_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50),
    action VARCHAR(200) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ============================================
-- USER DOCUMENTS TABLE
-- ============================================
CREATE TABLE user_documents (
    doc_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    doc_type ENUM('college_id', 'aadhaar', 'pan', 'resume', 'agreement', 'photo', 'offer_letter', 'noc', 'bank_details', 'other') NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(50),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (verified_by) REFERENCES users(user_id)
);

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    assigned_to VARCHAR(50) NOT NULL,
    assigned_by VARCHAR(50),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    deadline DATE,
    completed_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES users(user_id),
    FOREIGN KEY (assigned_by) REFERENCES users(user_id)
);

-- ============================================
-- LEAVE REQUESTS TABLE (Enhanced with all types)
-- ============================================
CREATE TABLE leave_requests (
    leave_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    leave_type ENUM('casual', 'sick', 'earned', 'compensatory', 'maternity', 'paternity', 'unpaid', 'optional_holiday') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    half_day BOOLEAN DEFAULT FALSE,
    half_day_session ENUM('morning', 'afternoon') NULL,
    reason TEXT,
    total_days INT DEFAULT 1,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by VARCHAR(50),
    approved_at DATETIME,
    admin_remarks TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (approved_by) REFERENCES users(user_id)
);

-- ============================================
-- LEAVE BALANCE TABLE
-- ============================================
CREATE TABLE leave_balance (
    balance_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    casual_leave DECIMAL(4,1) DEFAULT 8,
    sick_leave DECIMAL(4,1) DEFAULT 6,
    earned_leave DECIMAL(4,1) DEFAULT 0,
    compensatory_off DECIMAL(4,1) DEFAULT 0,
    optional_holiday DECIMAL(4,1) DEFAULT 2,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    UNIQUE KEY unique_balance (user_id, year)
);

-- ============================================
-- PERFORMANCE / KPI TABLE
-- ============================================
CREATE TABLE performance_kpi (
    kpi_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    kpi_name VARCHAR(100) NOT NULL,
    target_value DECIMAL(10,2),
    actual_value DECIMAL(10,2) DEFAULT 0,
    score DECIMAL(5,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ============================================
-- APPRAISALS TABLE
-- ============================================
CREATE TABLE appraisals (
    appraisal_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    quarter TINYINT NOT NULL,
    year INT NOT NULL,
    self_rating DECIMAL(3,1),
    manager_rating DECIMAL(3,1),
    peer_rating DECIMAL(3,1),
    final_score DECIMAL(3,1),
    self_comments TEXT,
    manager_comments TEXT,
    strengths TEXT,
    improvements TEXT,
    status ENUM('pending_self', 'pending_manager', 'pending_peer', 'completed') DEFAULT 'pending_self',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ============================================
-- ANNOUNCEMENTS TABLE
-- ============================================
CREATE TABLE announcements (
    announcement_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    target_audience ENUM('all', 'employees', 'interns', 'vendors', 'campus_saarthi') DEFAULT 'all',
    is_active BOOLEAN DEFAULT TRUE,
    scheduled_at DATETIME NULL,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- ============================================
-- ONBOARDING CHECKLIST TABLE
-- ============================================
CREATE TABLE onboarding_checklist (
    checklist_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at DATETIME,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ============================================
-- REFERRALS TABLE
-- ============================================
CREATE TABLE referrals (
    referral_id INT AUTO_INCREMENT PRIMARY KEY,
    referred_by VARCHAR(50) NOT NULL,
    referred_name VARCHAR(100) NOT NULL,
    referred_email VARCHAR(100),
    referred_phone VARCHAR(15),
    job_id INT NULL,
    status ENUM('pending', 'applied', 'shortlisted', 'selected', 'rejected') DEFAULT 'pending',
    bonus_amount DECIMAL(10,2) DEFAULT 0,
    bonus_status ENUM('pending', 'approved', 'paid') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referred_by) REFERENCES users(user_id),
    FOREIGN KEY (job_id) REFERENCES job_postings(job_id)
);

-- ============================================
-- FAQS TABLE
-- ============================================
CREATE TABLE faqs (
    faq_id INT AUTO_INCREMENT PRIMARY KEY,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- ============================================
-- COMPLAINTS TABLE (Anonymous)
-- ============================================
CREATE TABLE complaints (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    subject VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('new', 'investigating', 'resolved', 'dismissed') DEFAULT 'new',
    admin_notes TEXT,
    resolved_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- EVENTS TABLE
-- ============================================
CREATE TABLE events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    event_type ENUM('hackathon', 'seminar', 'webinar', 'workshop', 'podcast', 'celebration') NOT NULL,
    description TEXT,
    date_start DATETIME NOT NULL,
    date_end DATETIME,
    location VARCHAR(200),
    meeting_link VARCHAR(500),
    registration_link VARCHAR(500),
    speaker_name VARCHAR(200),
    prize_pool VARCHAR(100),
    status ENUM('upcoming', 'live', 'past', 'cancelled') DEFAULT 'upcoming',
    thumbnail_url VARCHAR(500),
    is_featured BOOLEAN DEFAULT FALSE,
    max_participants INT,
    current_registrations INT DEFAULT 0,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- ============================================
-- EVENT REGISTRATIONS TABLE
-- ============================================
CREATE TABLE event_registrations (
    reg_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    user_id VARCHAR(50),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(event_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ============================================
-- OFFER LETTERS TABLE
-- ============================================
CREATE TABLE offer_letters (
    letter_id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(15),
    designation VARCHAR(200),
    department VARCHAR(100),
    ctc VARCHAR(100),
    joining_date DATE,
    reporting_manager VARCHAR(100),
    work_location VARCHAR(200),
    probation_period VARCHAR(50),
    letter_html LONGTEXT,
    status ENUM('draft', 'sent', 'accepted', 'rejected') DEFAULT 'draft',
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- ============================================
-- TRAINER PROFILES TABLE
-- ============================================
CREATE TABLE trainer_profiles (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    qualification VARCHAR(200),
    experience_years INT,
    specialization TEXT,
    bio TEXT,
    domains TEXT,
    demo_video_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(50),
    verified_at DATETIME,
    rating DECIMAL(3,2) DEFAULT 0,
    total_sessions INT DEFAULT 0,
    total_students INT DEFAULT 0,
    badge ENUM('none', 'bronze', 'silver', 'gold', 'verified_expert') DEFAULT 'none',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (verified_by) REFERENCES users(user_id)
);

-- ============================================
-- GALLERY TABLE
-- ============================================
CREATE TABLE gallery (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200),
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    category ENUM('team', 'events', 'office', 'celebrations', 'awards') DEFAULT 'team',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    uploaded_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id)
);

-- ============================================
-- TESTIMONIALS TABLE
-- ============================================
CREATE TABLE testimonials (
    testimonial_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50),
    name VARCHAR(100) NOT NULL,
    designation VARCHAR(200),
    quote TEXT NOT NULL,
    photo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ============================================
-- PROJECT ENQUIRIES TABLE
-- ============================================
CREATE TABLE project_enquiries (
    enquiry_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    service_required VARCHAR(200) NOT NULL,
    message TEXT,
    status ENUM('new', 'contacted', 'converted', 'closed') DEFAULT 'new',
    assigned_to VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES users(user_id)
);

-- ============================================
-- CHAT LOGS TABLE
-- ============================================
CREATE TABLE chat_logs (
    chat_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    visitor_name VARCHAR(100),
    visitor_phone VARCHAR(20),
    visitor_email VARCHAR(100),
    message TEXT NOT NULL,
    sender ENUM('user', 'bot') DEFAULT 'user',
    page_url VARCHAR(500),
    ip_address VARCHAR(45),
    device VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_session (session_id),
    KEY idx_created (created_at)
);

-- ============================================
-- GROUP CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE group_chat_messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    has_mention BOOLEAN DEFAULT FALSE,
    has_task_assignment BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    KEY idx_created (created_at)
);

-- ============================================
-- GROUP CHAT MENTIONS TABLE
-- ============================================
CREATE TABLE group_chat_mentions (
    mention_id INT AUTO_INCREMENT PRIMARY KEY,
    message_id INT NOT NULL,
    mentioned_user_id VARCHAR(50) NOT NULL,
    FOREIGN KEY (message_id) REFERENCES group_chat_messages(message_id) ON DELETE CASCADE,
    FOREIGN KEY (mentioned_user_id) REFERENCES users(user_id)
);

-- ============================================
-- DEFAULT ADMIN USER
-- ============================================
INSERT INTO users (user_id, name, email, phone, password_hash, user_type, status, joined_date)
VALUES ('ADMIN-001', 'HR Admin', 'hr@karyasaarthi.com', '9999999999',
        '$2y$10$defaulthashchangethis', 'admin', 'active', CURDATE());
