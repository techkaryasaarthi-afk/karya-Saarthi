<?php
$pageTitle = 'Recruitment Management';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireAdmin();

$pdo = getDBConnection();
require_once __DIR__ . '/../includes/mailer.php';
$message = '';
$messageType = '';
$activeTab = $_GET['tab'] ?? 'jobs';

// Handle POST actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    // Auto-add missing columns if they don't exist
    try {
        $pdo->exec("ALTER TABLE job_postings MODIFY category VARCHAR(50) NOT NULL");
    } catch (Exception $ignore) {}
    $addCols = [
        "ALTER TABLE job_postings ADD COLUMN pillar VARCHAR(50) NULL AFTER department",
        "ALTER TABLE job_postings ADD COLUMN job_type VARCHAR(50) DEFAULT 'full_time' AFTER work_type",
        "ALTER TABLE job_postings ADD COLUMN skills TEXT AFTER responsibilities",
        "ALTER TABLE job_postings ADD COLUMN experience_required VARCHAR(100) AFTER skills",
        "ALTER TABLE job_postings ADD COLUMN is_featured BOOLEAN DEFAULT FALSE AFTER positions",
        "ALTER TABLE job_postings ADD COLUMN application_count INT DEFAULT 0 AFTER deadline",
        "ALTER TABLE job_postings ADD COLUMN eligibility_criteria TEXT AFTER responsibilities",
        "ALTER TABLE job_postings ADD COLUMN benefits_perks TEXT AFTER eligibility_criteria",
        "ALTER TABLE job_postings ADD COLUMN interview_process TEXT AFTER benefits_perks",
        "ALTER TABLE job_postings ADD COLUMN age_limit VARCHAR(50) AFTER interview_process",
    ];
    foreach ($addCols as $sql) {
        try { $pdo->exec($sql); } catch (Exception $ignore) {}
    }

    try {
        switch ($action) {
            // Create new job posting
            case 'create_job':
                try {
                    $stmt = $pdo->prepare("INSERT INTO job_postings (title, category, department, pillar, location, work_type, job_type, description, requirements, responsibilities, eligibility_criteria, benefits_perks, interview_process, age_limit, skills, experience_required, compensation_type, salary_range, positions, is_featured, deadline, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([
                        sanitize($_POST['title']),
                        $_POST['category'] ?? '',
                        sanitize($_POST['department'] ?? ''),
                        !empty($_POST['pillar']) ? $_POST['pillar'] : null,
                        sanitize($_POST['location'] ?? ''),
                        $_POST['work_type'] ?? 'remote',
                        $_POST['job_type'] ?? 'full_time',
                        sanitize($_POST['description'] ?? ''),
                        sanitize($_POST['requirements'] ?? ''),
                        sanitize($_POST['responsibilities'] ?? ''),
                        sanitize($_POST['eligibility_criteria'] ?? ''),
                        sanitize($_POST['benefits_perks'] ?? ''),
                        sanitize($_POST['interview_process'] ?? ''),
                        sanitize($_POST['age_limit'] ?? ''),
                        sanitize($_POST['skills'] ?? ''),
                        sanitize($_POST['experience_required'] ?? ''),
                        $_POST['compensation_type'] ?? 'fixed',
                        sanitize($_POST['salary_range'] ?? ''),
                        (int)($_POST['positions'] ?? 1),
                        isset($_POST['is_featured']) ? 1 : 0,
                        !empty($_POST['deadline']) ? $_POST['deadline'] : null,
                        $_POST['status'] ?? 'draft',
                        $_SESSION['user_id']
                    ]);
                    $message = 'Job posting created successfully!';
                    $messageType = 'success';
                    logActivity($_SESSION['user_id'], 'Created job posting', sanitize($_POST['title']));
                } catch (PDOException $e) {
                    $message = 'Error creating job: ' . $e->getMessage();
                    $messageType = 'error';
                }
                $activeTab = 'jobs';
                break;

            // Update (edit) existing job posting
            case 'update_job':
                try {
                    $jobId = (int)($_POST['job_id'] ?? 0);
                    if (!$jobId) throw new Exception('Invalid job ID.');
                    $stmt = $pdo->prepare("UPDATE job_postings SET title=?, category=?, department=?, pillar=?, location=?, work_type=?, job_type=?, description=?, requirements=?, responsibilities=?, eligibility_criteria=?, benefits_perks=?, interview_process=?, age_limit=?, skills=?, experience_required=?, compensation_type=?, salary_range=?, positions=?, is_featured=?, deadline=?, status=? WHERE job_id=?");
                    $stmt->execute([
                        sanitize($_POST['title']),
                        $_POST['category'] ?? '',
                        sanitize($_POST['department'] ?? ''),
                        !empty($_POST['pillar']) ? $_POST['pillar'] : null,
                        sanitize($_POST['location'] ?? ''),
                        $_POST['work_type'] ?? 'remote',
                        $_POST['job_type'] ?? 'full_time',
                        sanitize($_POST['description'] ?? ''),
                        sanitize($_POST['requirements'] ?? ''),
                        sanitize($_POST['responsibilities'] ?? ''),
                        sanitize($_POST['eligibility_criteria'] ?? ''),
                        sanitize($_POST['benefits_perks'] ?? ''),
                        sanitize($_POST['interview_process'] ?? ''),
                        sanitize($_POST['age_limit'] ?? ''),
                        sanitize($_POST['skills'] ?? ''),
                        sanitize($_POST['experience_required'] ?? ''),
                        $_POST['compensation_type'] ?? 'fixed',
                        sanitize($_POST['salary_range'] ?? ''),
                        (int)($_POST['positions'] ?? 1),
                        isset($_POST['is_featured']) ? 1 : 0,
                        !empty($_POST['deadline']) ? $_POST['deadline'] : null,
                        $_POST['status'] ?? 'draft',
                        $jobId
                    ]);
                    $message = 'Job posting updated successfully!';
                    $messageType = 'success';
                    logActivity($_SESSION['user_id'], 'Updated job posting', sanitize($_POST['title']));
                } catch (Exception $e) {
                    $message = 'Error updating job: ' . $e->getMessage();
                    $messageType = 'error';
                }
                $activeTab = 'jobs';
                break;

            // Update job status
            case 'update_job_status':
                $stmt = $pdo->prepare("UPDATE job_postings SET status = ? WHERE job_id = ?");
                $stmt->execute([$_POST['status'], (int)$_POST['job_id']]);
                $message = 'Job status updated successfully!';
                $messageType = 'success';
                $activeTab = 'jobs';
                break;

            // Delete job posting
            case 'delete_job':
                $stmt = $pdo->prepare("DELETE FROM job_postings WHERE job_id = ?");
                $stmt->execute([(int)$_POST['job_id']]);
                $message = 'Job posting deleted successfully!';
                $messageType = 'success';
                $activeTab = 'jobs';
                break;
                
            // Delete dummy jobs
            case 'delete_dummy_jobs':
                $stmt = $pdo->prepare("DELETE FROM job_postings WHERE title LIKE '%Test%' OR title LIKE '%Dummy%' OR created_by IS NULL");
                $stmt->execute();
                $deletedCount = $stmt->rowCount();
                $message = "Successfully deleted $deletedCount dummy/test job(s)!";
                $messageType = 'success';
                $activeTab = 'jobs';
                break;

            // Update application status + send email
            case 'update_application_status':
                $newStatus = $_POST['status'];
                $appId = (int)$_POST['application_id'];

                $stmt = $pdo->prepare("UPDATE applications SET status = ?, notes = CONCAT(IFNULL(notes,''), '\n[', NOW(), '] Status changed to ', ?) WHERE application_id = ?");
                $stmt->execute([$newStatus, $newStatus, $appId]);

                // Get applicant details for email (NO email on rejection)
                $stmtAppInfo = $pdo->prepare("SELECT a.applicant_name, a.email, j.title AS job_title FROM applications a LEFT JOIN job_postings j ON a.job_id = j.job_id WHERE a.application_id = ?");
                $stmtAppInfo->execute([$appId]);
                $appInfo = $stmtAppInfo->fetch();

                // Send status update email - SKIP only 'new' (no email for status reset)
                if ($newStatus === 'new') {
                    $message = 'Application status updated!';
                    $messageType = 'success';
                    $activeTab = 'applications';
                    logActivity($_SESSION['user_id'], 'Updated application status', 'App #' . $appId . ' -> ' . $newStatus);
                    break;
                }

                if ($appInfo && !empty($appInfo['email'])) {
                    $aName = htmlspecialchars($appInfo['applicant_name'], ENT_QUOTES, 'UTF-8', false);
                    $aJob = htmlspecialchars($appInfo['job_title'] ?? 'the position', ENT_QUOTES, 'UTF-8', false);

                    // Status-specific email content
                    $statusEmails = [
                        'shortlisted' => [
                            'subject' => "Congratulations! You've been Shortlisted - $aJob",
                            'icon' => '&#11088;',
                            'color' => '#f59e0b',
                            'heading' => 'You\'ve Been Shortlisted!',
                            'body' => "Great news! We have reviewed your application for <strong>$aJob</strong> and we are pleased to inform you that you have been <strong>shortlisted</strong> for the next round.<br><br>Our team will contact you soon to schedule an interview. Please keep your phone available."
                        ],
                        'interview_scheduled' => [
                            'subject' => "Interview Scheduled - $aJob | Karya Saarthi",
                            'icon' => '&#128197;',
                            'color' => '#8b5cf6',
                            'heading' => 'Interview Scheduled!',
                            'body' => "Your interview for <strong>$aJob</strong> has been scheduled. Please check your email for interview details including date, time, and meeting link.<br><br>Prepare well and be on time. Best of luck!"
                        ],
                        'selected' => [
                            'subject' => "Congratulations! You're Selected - $aJob | Karya Saarthi",
                            'icon' => '&#127881;',
                            'color' => '#22c55e',
                            'heading' => 'Congratulations! You\'re Selected!',
                            'body' => "We are thrilled to inform you that you have been <strong>selected</strong> for the position of <strong>$aJob</strong> at Karya Saarthi!<br><br>Our HR team will reach out to you shortly with the offer details and next steps. Welcome to the Karya Saarthi family!"
                        ],
                        'offer_sent' => [
                            'subject' => "Offer Letter - $aJob | Karya Saarthi",
                            'icon' => '&#128228;',
                            'color' => '#6366f1',
                            'heading' => 'Offer Letter Sent!',
                            'body' => "We have sent you the offer letter for <strong>$aJob</strong>. Please review it carefully.<br><br>If you have any questions about the offer, don't hesitate to contact us. We look forward to having you on our team!"
                        ],
                        'joined' => [
                            'subject' => "Welcome to Karya Saarthi! - $aJob",
                            'icon' => '&#127775;',
                            'color' => '#10b981',
                            'heading' => 'Welcome to Karya Saarthi!',
                            'body' => "Welcome aboard! We are excited to have you as part of the Karya Saarthi team for <strong>$aJob</strong>.<br><br>You will receive your login credentials and onboarding details shortly. Looking forward to working with you!<br><br><strong>Hum Hai Aapke Saarthi!</strong>"
                        ],
                        'rejected' => [
                            'subject' => "Application Update - $aJob | Karya Saarthi",
                            'icon' => '&#128172;',
                            'color' => '#6b7280',
                            'heading' => 'Application Update',
                            'body' => "Thank you for your interest in <strong>$aJob</strong> at Karya Saarthi. After careful consideration, we have decided to move forward with other candidates at this time.<br><br>This doesn't reflect on your abilities. We encourage you to apply for future openings that match your profile. We wish you all the best in your career!"
                        ]
                    ];

                    if (isset($statusEmails[$newStatus])) {
                        $se = $statusEmails[$newStatus];
                        $emailBody = "
                        <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;'>
                            <div style='background:linear-gradient(135deg,#1e40af,#2563eb,#f97316);padding:30px;text-align:center;border-radius:12px 12px 0 0;'>
                                <h1 style='color:#fff;margin:0;font-size:24px;'>Karya Saarthi</h1>
                                <p style='color:#fdba74;margin:5px 0 0;font-size:14px;'>Hum Hai Aapke Saarthi</p>
                            </div>
                            <div style='background:#fff;padding:30px;border:1px solid #e5e7eb;'>
                                <div style='text-align:center;margin-bottom:20px;'>
                                    <span style='font-size:48px;'>{$se['icon']}</span>
                                </div>
                                <h2 style='color:{$se['color']};text-align:center;margin-top:0;'>{$se['heading']}</h2>
                                <p>Dear <strong>$aName</strong>,</p>
                                <p>{$se['body']}</p>

                                <div style='background:#eff6ff;border-left:4px solid #2563eb;padding:15px;margin:20px 0;border-radius:0 8px 8px 0;'>
                                    <strong>Position:</strong> $aJob<br>
                                    <strong>Application ID:</strong> #$appId<br>
                                    <strong>Status:</strong> " . ucfirst(str_replace('_', ' ', $newStatus)) . "
                                </div>

                                <hr style='border:none;border-top:1px solid #e5e7eb;margin:20px 0;'>
                                <p style='color:#6b7280;font-size:13px;'>Questions? Contact us at <a href='mailto:hr@karyasaarthi.com' style='color:#2563eb;'>hr@karyasaarthi.com</a> or call <a href='tel:+918595275753' style='color:#2563eb;'>+91 85952 75753</a></p>
                                <p style='color:#111;font-weight:bold;'>Best Regards,<br>Karya Saarthi HR Team</p>
                            </div>
                            <div style='background:#1e3a5f;padding:15px;text-align:center;border-radius:0 0 12px 12px;'>
                                <p style='color:#94a3b8;font-size:12px;margin:0;'>Karya Saarthi - Hum Hai Aapke Saarthi | www.karyasaarthi.com</p>
                            </div>
                        </div>";

                        sendEmail($appInfo['email'], $se['subject'], $emailBody, 'hr@karyasaarthi.com');
                        $message = 'Status updated & email sent to ' . htmlspecialchars($appInfo['email'], ENT_QUOTES, 'UTF-8', false) . '!';
                    } else {
                        $message = 'Application status updated!';
                    }
                } else {
                    $message = 'Application status updated! (No email sent - email not found)';
                }

                $messageType = 'success';
                $activeTab = 'applications';
                logActivity($_SESSION['user_id'], 'Updated application status', 'App #' . $appId . ' -> ' . $newStatus);
                break;

            // Schedule interview
            case 'schedule_interview':
                $stmt = $pdo->prepare("INSERT INTO interviews (application_id, interview_type, interview_date, interviewer_id, meeting_link, feedback) VALUES (?, ?, ?, ?, ?, ?)");
                $interviewDate = $_POST['interview_date'] . ' ' . $_POST['interview_time'];
                $stmt->execute([
                    (int)$_POST['application_id'],
                    $_POST['interview_type'],
                    $interviewDate,
                    $_POST['interviewer_id'] ?: null,
                    sanitize($_POST['meeting_link']),
                    sanitize($_POST['notes'])
                ]);
                // Also update application status
                $stmtApp = $pdo->prepare("UPDATE applications SET status = 'interview_scheduled' WHERE application_id = ?");
                $stmtApp->execute([(int)$_POST['application_id']]);

                // Send email to applicant with interview details
                $stmtAppEmail = $pdo->prepare("SELECT a.applicant_name, a.email, j.title AS job_title FROM applications a LEFT JOIN job_postings j ON a.job_id = j.job_id WHERE a.application_id = ?");
                $stmtAppEmail->execute([(int)$_POST['application_id']]);
                $appInfo = $stmtAppEmail->fetch();

                if ($appInfo && !empty($appInfo['email'])) {
                    $applicantName = htmlspecialchars($appInfo['applicant_name'], ENT_QUOTES, 'UTF-8', false);
                    $jobTitle = htmlspecialchars($appInfo['job_title'] ?? 'Position', ENT_QUOTES, 'UTF-8', false);
                    $ivType = ucfirst(str_replace('_', ' ', $_POST['interview_type']));
                    $ivDate = date('l, d M Y', strtotime($_POST['interview_date']));
                    $ivTime = date('h:i A', strtotime($_POST['interview_time']));
                    $meetLink = sanitize($_POST['meeting_link']);
                    $ivNotes = sanitize($_POST['notes']);

                    $emailSubject = "Interview Scheduled - $jobTitle | Karya Saarthi";
                    $emailBody = "
                    <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;'>
                        <div style='background:linear-gradient(135deg,#1e40af,#2563eb,#f97316);padding:30px;text-align:center;border-radius:12px 12px 0 0;'>
                            <h1 style='color:#fff;margin:0;font-size:24px;'>Karya Saarthi</h1>
                            <p style='color:#fdba74;margin:5px 0 0;font-size:14px;'>Hum Hai Aapke Saarthi</p>
                        </div>
                        <div style='background:#fff;padding:30px;border:1px solid #e5e7eb;'>
                            <h2 style='color:#1e40af;margin-top:0;'>Interview Scheduled!</h2>
                            <p>Dear <strong>$applicantName</strong>,</p>
                            <p>Congratulations! Your application for <strong>$jobTitle</strong> has been shortlisted, and we'd like to invite you for an interview.</p>

                            <div style='background:#eff6ff;border-left:4px solid #2563eb;padding:20px;margin:20px 0;border-radius:0 8px 8px 0;'>
                                <table style='width:100%;border-collapse:collapse;'>
                                    <tr><td style='padding:8px 0;color:#6b7280;width:120px;'><strong>Date:</strong></td><td style='padding:8px 0;color:#111;'>$ivDate</td></tr>
                                    <tr><td style='padding:8px 0;color:#6b7280;'><strong>Time:</strong></td><td style='padding:8px 0;color:#111;'>$ivTime</td></tr>
                                    <tr><td style='padding:8px 0;color:#6b7280;'><strong>Type:</strong></td><td style='padding:8px 0;color:#111;'>$ivType</td></tr>
                                    " . ($meetLink ? "<tr><td style='padding:8px 0;color:#6b7280;'><strong>Link:</strong></td><td style='padding:8px 0;'><a href='$meetLink' style='color:#2563eb;font-weight:bold;'>Join Meeting</a></td></tr>" : "") . "
                                </table>
                            </div>

                            " . ($meetLink ? "<div style='text-align:center;margin:25px 0;'><a href='$meetLink' style='display:inline-block;background:#2563eb;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;'>Join Interview</a></div>" : "") . "

                            " . ($ivNotes ? "<p style='color:#6b7280;font-size:14px;'><strong>Note from HR:</strong> $ivNotes</p>" : "") . "

                            <hr style='border:none;border-top:1px solid #e5e7eb;margin:20px 0;'>
                            <p style='color:#6b7280;font-size:13px;'>Please be on time. If you need to reschedule, contact us at <a href='mailto:hr@karyasaarthi.com' style='color:#2563eb;'>hr@karyasaarthi.com</a> or call <a href='tel:+918595275753' style='color:#2563eb;'>+91 85952 75753</a>.</p>
                            <p style='color:#6b7280;font-size:13px;'>Best of luck!</p>
                            <p style='color:#111;font-weight:bold;'>Karya Saarthi Team</p>
                        </div>
                        <div style='background:#1e3a5f;padding:15px;text-align:center;border-radius:0 0 12px 12px;'>
                            <p style='color:#94a3b8;font-size:12px;margin:0;'>Karya Saarthi - Hum Hai Aapke Saarthi | www.karyasaarthi.com</p>
                        </div>
                    </div>";

                    sendEmail($appInfo['email'], $emailSubject, $emailBody, 'hr@karyasaarthi.com');
                    $message = 'Interview scheduled & email sent to ' . htmlspecialchars($appInfo['email'], ENT_QUOTES, 'UTF-8', false) . '!';
                } else {
                    $message = 'Interview scheduled! (No email - applicant email not found)';
                }

                $messageType = 'success';
                $activeTab = 'interviews';
                logActivity($_SESSION['user_id'], 'Scheduled interview', 'App #' . $_POST['application_id']);
                break;

            // Update interview status
            case 'update_interview_status':
                $stmt = $pdo->prepare("UPDATE interviews SET status = ? WHERE interview_id = ?");
                $stmt->execute([$_POST['interview_status'], (int)$_POST['interview_id']]);
                $message = 'Interview status updated!';
                $messageType = 'success';
                $activeTab = 'interviews';
                logActivity($_SESSION['user_id'], 'Updated interview status', 'Interview #' . $_POST['interview_id'] . ' -> ' . $_POST['interview_status']);
                break;

            // Delete interview
            case 'delete_interview':
                $stmt = $pdo->prepare("DELETE FROM interviews WHERE interview_id = ?");
                $stmt->execute([(int)$_POST['interview_id']]);
                $message = 'Interview record deleted!';
                $messageType = 'success';
                $activeTab = 'interviews';
                logActivity($_SESSION['user_id'], 'Deleted interview', 'Interview #' . $_POST['interview_id']);
                break;

            // Bulk delete completed/cancelled interviews
            case 'bulk_delete_interviews':
                $stmt = $pdo->prepare("DELETE FROM interviews WHERE status IN ('completed', 'cancelled', 'no_show')");
                $stmt->execute();
                $deleted = $stmt->rowCount();
                $message = "$deleted old interview records deleted! Database cleaned.";
                $messageType = 'success';
                $activeTab = 'interviews';
                logActivity($_SESSION['user_id'], 'Bulk deleted interviews', "$deleted records removed");
                break;
                
            // Update Interview Scoring
            case 'update_interview_scoring':
                $stmt = $pdo->prepare("UPDATE applications SET score_comm = ?, score_exp = ?, score_quality = ?, score_teaching = ?, score_avail = ?, total_score = ? WHERE application_id = ?");
                $total = (int)$_POST['score_comm'] + (int)$_POST['score_exp'] + (int)$_POST['score_quality'] + (int)$_POST['score_teaching'] + (int)$_POST['score_avail'];
                $stmt->execute([
                    (int)$_POST['score_comm'], (int)$_POST['score_exp'], (int)$_POST['score_quality'], (int)$_POST['score_teaching'], (int)$_POST['score_avail'], $total, (int)$_POST['application_id']
                ]);
                $message = 'Interview scores updated successfully!';
                $messageType = 'success';
                $activeTab = 'applications';
                break;
                
            // Update Onboarding Checklist
            case 'update_onboarding_checklist':
                $stmt = $pdo->prepare("UPDATE applications SET chk_resume_received = ?, chk_samples_received = ?, chk_questions_answered = ?, chk_interview_conducted = ?, chk_selection_email = ?, chk_whatsapp_joined = ?, chk_google_form = ?, chk_portal_registered = ?, chk_docs_uploaded = ?, chk_docs_verified = ?, chk_vendor_id = ?, chk_orientation = ?, chk_first_project = ? WHERE application_id = ?");
                $stmt->execute([
                    isset($_POST['chk_resume']) ? 1 : 0,
                    isset($_POST['chk_samples']) ? 1 : 0,
                    isset($_POST['chk_questions']) ? 1 : 0,
                    isset($_POST['chk_interview']) ? 1 : 0,
                    isset($_POST['chk_selection_email']) ? 1 : 0,
                    isset($_POST['chk_whatsapp']) ? 1 : 0,
                    isset($_POST['chk_google']) ? 1 : 0,
                    isset($_POST['chk_portal']) ? 1 : 0,
                    isset($_POST['chk_docs_upload']) ? 1 : 0,
                    isset($_POST['chk_docs_verify']) ? 1 : 0,
                    isset($_POST['chk_vendor_id']) ? 1 : 0,
                    isset($_POST['chk_orientation']) ? 1 : 0,
                    isset($_POST['chk_first_project']) ? 1 : 0,
                    (int)$_POST['application_id']
                ]);
                $message = 'Onboarding checklist updated successfully!';
                $messageType = 'success';
                $activeTab = 'applications';
                break;
                
            // Send Onboarding Email
            case 'send_onboarding_email':
                $appId = (int)$_POST['application_id'];
                
                // Fetch dynamic onboarding links
                $stmtLinks = $pdo->query("SELECT setting_key, setting_value FROM site_settings");
                $links = $stmtLinks->fetchAll(PDO::FETCH_KEY_PAIR);
                $waLink = $links['onboarding_whatsapp'] ?? '#';
                $formLink = $links['onboarding_google_form'] ?? '#';
                $driveLink = $links['onboarding_docs_drive'] ?? '#';
                
                $stmtAppInfo = $pdo->prepare("SELECT a.applicant_name, a.email, j.title AS job_title FROM applications a LEFT JOIN job_postings j ON a.job_id = j.job_id WHERE a.application_id = ?");
                $stmtAppInfo->execute([$appId]);
                $appInfo = $stmtAppInfo->fetch();

                if ($appInfo && !empty($appInfo['email'])) {
                    $aName = htmlspecialchars($appInfo['applicant_name'], ENT_QUOTES, 'UTF-8', false);
                    $aJob = htmlspecialchars($appInfo['job_title'] ?? 'Position', ENT_QUOTES, 'UTF-8', false);
                    
                    $emailSubject = "Welcome Aboard! Selection & Next Steps - Karya Saarthi";
                    $emailBody = "
                    <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;'>
                        <div style='background:linear-gradient(135deg,#1e40af,#2563eb,#f97316);padding:30px;text-align:center;border-radius:12px 12px 0 0;'>
                            <h1 style='color:#fff;margin:0;font-size:24px;'>Karya Saarthi🤝</h1>
                            <p style='color:#fdba74;margin:5px 0 0;font-size:14px;'>Your Trusted Work Companion</p>
                        </div>
                        <div style='background:#fff;padding:30px;border:1px solid #e5e7eb;'>
                            <h2 style='color:#22c55e;margin-top:0;'>Congratulations $aName! You are Selected!</h2>
                            <p>We are thrilled to welcome you to the Karya Saarthi team for the <strong>$aJob</strong> role.</p>
                            
                            <div style='background:#f8fafc;border:1px solid #e2e8f0;padding:20px;border-radius:8px;margin:20px 0;'>
                                <h3 style='color:#1e40af;margin-top:0;font-size:16px;'>Next Steps for Onboarding:</h3>
                                <ol style='margin-bottom:0;padding-left:20px;line-height:1.6;'>
                                    <li><strong>WhatsApp Community Join:</strong> <a href='$waLink' style='color:#2563eb;'>[WhatsApp Group Link]</a></li>
                                    <li><strong>Google Form Fill (Official Onboarding):</strong> <a href='$formLink' style='color:#2563eb;'>[Google Form Link]</a></li>
                                    <li><strong>Website/App Registration:</strong> <a href='https://career.karyasaarthi.com' style='color:#2563eb;'>career.karyasaarthi.com</a> <br><span style='font-size:12px;color:#64748b;'>(Create your profile where projects will be assigned)</span></li>
                                    <li><strong>Documents Upload:</strong> HR team has shared a folder where you need to upload your docs: <a href='$driveLink' style='color:#2563eb;'>[Upload Documents Here]</a>
                                        <ul style='margin-top:5px;padding-left:15px;color:#475569;font-size:13px;'>
                                            <li>Aadhaar Card & PAN Card</li>
                                            <li>Educational Certificates</li>
                                            <li>Bank Details (cancelled cheque/passbook)</li>
                                            <li>3-5 Best Work Samples</li>
                                        </ul>
                                    </li>
                                </ol>
                            </div>
                            
                            <p style='color:#dc2626;font-weight:bold;text-align:center;background:#fef2f2;padding:10px;border-radius:6px;'>Please complete all steps in the next 2 days to get your first project assigned!</p>
                            
                            <p>Any doubts? Call/WhatsApp: <strong>+91 9311025753</strong></p>
                            <p style='font-weight:bold;margin-bottom:0;'>Welcome aboard!<br>Karya Saarthi Team</p>
                        </div>
                        <div style='background:#1e3a5f;padding:15px;text-align:center;border-radius:0 0 12px 12px;'>
                            <p style='color:#94a3b8;font-size:12px;margin:0;'>Email: hr.karyasaarthi@gmail.com | Phone: +91 9311025753 | Website: www.karyasaarthi.com</p>
                            <p style='color:#94a3b8;font-size:12px;margin:5px 0 0;'>Hum Hai Aapke Saarthi - And Our Vendors Are Too!</p>
                        </div>
                    </div>";

                    sendEmail($appInfo['email'], $emailSubject, $emailBody, 'hr@karyasaarthi.com');
                    
                    // Auto-check the email box
                    $pdo->prepare("UPDATE applications SET chk_selection_email = 1 WHERE application_id = ?")->execute([$appId]);
                    
                    $message = 'Onboarding email sent to ' . htmlspecialchars($appInfo['email'], ENT_QUOTES, 'UTF-8', false) . '!';
                } else {
                    $message = 'Error: Applicant email not found.';
                }
                $messageType = 'success';
                $activeTab = 'applications';
                break;
        }
    } catch (Exception $e) {
        $message = 'Error: ' . $e->getMessage();
        $messageType = 'error';
    }
}

// Fetch job postings
$stmtJobs = $pdo->query("SELECT * FROM job_postings ORDER BY created_at DESC LIMIT 20");
$jobs = $stmtJobs->fetchAll();

// Fetch applications with filters
$appFilter = '';
$appParams = [];
if (!empty($_GET['filter_job'])) {
    $appFilter .= ' AND a.job_id = ?';
    $appParams[] = (int)$_GET['filter_job'];
}
if (!empty($_GET['filter_status'])) {
    $appFilter .= ' AND a.status = ?';
    $appParams[] = $_GET['filter_status'];
}
$stmtApps = $pdo->prepare("SELECT a.*, j.title AS job_title FROM applications a LEFT JOIN job_postings j ON a.job_id = j.job_id WHERE 1=1 $appFilter ORDER BY a.applied_date DESC LIMIT 20");
$stmtApps->execute($appParams);
$applications = $stmtApps->fetchAll();

// Fetch interviews
$stmtInterviews = $pdo->query("SELECT i.*, a.applicant_name, a.email AS applicant_email, j.title AS job_title, u.name AS interviewer_name FROM interviews i LEFT JOIN applications a ON i.application_id = a.application_id LEFT JOIN job_postings j ON a.job_id = j.job_id LEFT JOIN users u ON i.interviewer_id = u.user_id ORDER BY i.interview_date DESC LIMIT 20");
$interviews = $stmtInterviews->fetchAll();

// Fetch admin/employee users for interviewer dropdown
$stmtInterviewers = $pdo->query("SELECT user_id, name FROM users WHERE user_type IN ('admin', 'employee') AND status = 'active' ORDER BY name");
$interviewers = $stmtInterviewers->fetchAll();

// Fetch all applications for interview scheduling dropdown
$stmtAllApps = $pdo->query("SELECT a.application_id, a.applicant_name, j.title AS job_title FROM applications a LEFT JOIN job_postings j ON a.job_id = j.job_id WHERE a.status IN ('new', 'shortlisted') ORDER BY a.applied_date DESC LIMIT 50");
$allApps = $stmtAllApps->fetchAll();

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 dashboard-content-area p-6">
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-ink">Recruitment Management</h1>
            <p class="text-sm text-ink-muted mt-1">Manage job postings, applications, and interviews.</p>
        </div>

        <?php if ($message): ?>
        <div class="mb-6 p-4 rounded-lg <?= $messageType === 'success' ? 'bg-green-500/10 text-green-700 border border-green-200' : 'bg-red-500/10 text-red-700 border border-red-500/20' ?>">
            <i class="fas <?= $messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle' ?> mr-2"></i>
            <?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8', false) ?>
        </div>
        <?php endif; ?>

        <!-- Tab Navigation -->
        <div class="border-b border-hairline mb-6">
            <nav class="flex space-x-8">
                <a href="?tab=jobs" class="pb-3 px-1 text-sm font-medium border-b-2 <?= $activeTab === 'jobs' ? 'border-primary-500 text-primary-600' : 'border-transparent text-ink-muted hover:text-ink-muted hover:border-hairline bg-surface-2 text-ink' ?>">
                    <i class="fas fa-briefcase mr-1"></i> Job Postings
                </a>
                <a href="?tab=applications" class="pb-3 px-1 text-sm font-medium border-b-2 <?= $activeTab === 'applications' ? 'border-primary-500 text-primary-600' : 'border-transparent text-ink-muted hover:text-ink-muted hover:border-hairline bg-surface-2 text-ink' ?>">
                    <i class="fas fa-file-alt mr-1"></i> Applications
                </a>
                <a href="?tab=interviews" class="pb-3 px-1 text-sm font-medium border-b-2 <?= $activeTab === 'interviews' ? 'border-primary-500 text-primary-600' : 'border-transparent text-ink-muted hover:text-ink-muted hover:border-hairline bg-surface-2 text-ink' ?>">
                    <i class="fas fa-video mr-1"></i> Interviews
                </a>
            </nav>
        </div>

        <!-- Job Postings Tab -->
        <?php if ($activeTab === 'jobs'): ?>
        <div>
            <!-- Create New Job Toggle & Delete Dummy Jobs -->
            <div class="mb-6 flex gap-3">
                <button onclick="document.getElementById('createJobForm').classList.toggle('hidden')" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                    <i class="fas fa-plus mr-1"></i> Create New Job
                </button>
                <form method="POST" onsubmit="return confirm('Are you sure you want to delete all dummy/test jobs?');" class="inline">
                    <input type="hidden" name="action" value="delete_dummy_jobs">
                    <button type="submit" class="bg-red-500/10 text-red-600 hover:bg-red-100 border border-red-500/20 px-4 py-2 rounded-lg text-sm font-medium transition">
                        <i class="fas fa-trash-alt mr-1"></i> Delete Fixed Jobs
                    </button>
                </form>
            </div>

            <!-- Create Job Form -->
            <div id="createJobForm" class="hidden bg-surface-1 rounded-xl shadow-none border border-hairline p-6 mb-6">
                <h3 class="text-lg font-semibold text-ink mb-4">Create New Job Posting</h3>
                <form method="POST" class="space-y-4">
                    <input type="hidden" name="action" value="create_job">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Job Title *</label>
                            <input type="text" name="title" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Category *</label>
                            <select name="category" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                <option value="">Select Category</option>
                                <option value="employee">Internal Member</option>
                                <option value="pillar_post">Saarthi</option>
                                <option value="vendor">Vendor / Freelancer</option>
                                <option value="intern">Internship</option>
                                <option value="freelancer">Freelancer</option>
                                <option value="part_time">Part-Time / Remote</option>
                                <option value="remote">Remote</option>
                                <option value="teaching_expert">Teaching Expert</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Department</label>
                            <input type="text" name="department" placeholder="e.g. Marketing, Tech, HR, Operations" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Pillar <span class="text-ink-muted text-xs">(if Saarthi role)</span></label>
                            <select name="pillar" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                <option value="">None</option>
                                <option value="campus_saarthi">Campus Saarthi</option>
                                <option value="digital_saarthi">Digital Saarthi</option>
                                <option value="calling_saarthi">Calling Saarthi</option>
                                <option value="government_saarthi">Government Saarthi</option>
                                <option value="market_saarthi">Market Saarthi</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Location</label>
                            <input type="text" name="location" placeholder="e.g. Delhi, Mumbai, Remote" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Work Type</label>
                            <select name="work_type" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                <option value="remote">Remote</option>
                                <option value="onsite">Onsite</option>
                                <option value="hybrid">Hybrid</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Job Type</label>
                            <select name="job_type" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                <option value="full_time">Full-Time</option>
                                <option value="part_time">Part-Time</option>
                                <option value="internship">Internship</option>
                                <option value="contract">Contract</option>
                                <option value="freelance">Freelance</option>
                                <option value="vendor">Vendor</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Experience Required</label>
                            <input type="text" name="experience_required" placeholder="e.g. Fresher, 1-2 years, 3+ years" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Compensation Type</label>
                            <select name="compensation_type" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                <option value="fixed">Fixed Salary</option>
                                <option value="commission">Commission</option>
                                <option value="stipend">Stipend</option>
                                <option value="task_based">Task-Based Payout</option>
                                <option value="unpaid">Unpaid</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">CTC / Stipend Range</label>
                            <input type="text" name="salary_range" placeholder="e.g. ₹15,000 – ₹25,000/month" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Open Positions</label>
                            <input type="number" name="positions" value="1" min="1" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Application Deadline</label>
                            <input type="date" name="deadline" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Status</label>
                            <select name="status" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                <option value="draft">Draft (hidden)</option>
                                <option value="active">Active (visible on site)</option>
                            </select>
                        </div>
                        <div class="flex items-center gap-2 pt-5">
                            <input type="checkbox" name="is_featured" id="is_featured" value="1" class="rounded border-hairline bg-surface-2 text-ink text-primary-600 focus:ring-primary-500">
                            <label for="is_featured" class="text-sm font-medium text-ink-muted">Mark as "Job of the Week" (featured on homepage)</label>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink-muted mb-1">Description</label>
                        <textarea name="description" rows="3" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink-muted mb-1">Skills Required</label>
                        <input type="text" name="skills" placeholder="e.g. PHP, JavaScript, Communication, Marketing (comma separated)" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink-muted mb-1">Requirements / Eligibility</label>
                        <textarea name="requirements" rows="3" placeholder="Education qualification, experience, tools they should know..." class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink-muted mb-1">Responsibilities</label>
                        <textarea name="responsibilities" rows="3" placeholder="Bullet list of what the person will do daily..." class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink-muted mb-1">Eligibility Criteria <span class="text-red-400">*</span></label>
                        <textarea name="eligibility_criteria" rows="3" placeholder="Who can apply?&#10;- Minimum 18 years of age&#10;- Graduate/Post-Graduate in relevant field&#10;- Minimum 1 year experience (for senior roles)&#10;- Good communication skills in English/Hindi" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink-muted mb-1">Age Limit</label>
                        <input type="text" name="age_limit" placeholder="e.g. 18-35 years or No age limit" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink-muted mb-1">Benefits & Perks</label>
                        <textarea name="benefits_perks" rows="3" placeholder="What you'll get:&#10;- Work from home flexibility&#10;- Performance-based incentives&#10;- Certificate & Letter of Recommendation&#10;- Real project experience" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink-muted mb-1">Interview Process</label>
                        <textarea name="interview_process" rows="3" placeholder="Hiring steps:&#10;1. Application Review (2-3 days)&#10;2. Phone/Video Screening&#10;3. Technical/Task Round&#10;4. HR Interview&#10;5. Offer Letter" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"></textarea>
                    </div>
                    <div class="flex justify-end space-x-3">
                        <button type="button" onclick="document.getElementById('createJobForm').classList.add('hidden')" class="px-4 py-2 border border-hairline bg-surface-2 text-ink rounded-lg text-sm font-medium text-ink-muted hover:bg-surface-2">Cancel</button>
                        <button type="submit" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition">Create Job Posting</button>
                    </div>
                </form>
            </div>

            <!-- Job Postings Table -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-surface-2">
                            <tr>
                                <th class="px-4 py-3 text-left font-medium text-ink-muted">Title</th>
                                <th class="px-4 py-3 text-left font-medium text-ink-muted">Category</th>
                                <th class="px-4 py-3 text-left font-medium text-ink-muted">Positions</th>
                                <th class="px-4 py-3 text-left font-medium text-ink-muted">Status</th>
                                <th class="px-4 py-3 text-left font-medium text-ink-muted">Deadline</th>
                                <th class="px-4 py-3 text-left font-medium text-ink-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-hairline">
                            <?php if (empty($jobs)): ?>
                            <tr><td colspan="6" class="px-4 py-8 text-center text-ink-muted">No job postings found. Create your first job posting above.</td></tr>
                            <?php else: ?>
                            <?php foreach ($jobs as $job): ?>
                            <tr class="hover:bg-surface-2">
                                <td class="px-4 py-3 font-medium text-ink"><?= htmlspecialchars($job['title'], ENT_QUOTES, 'UTF-8', false) ?></td>
                                <td class="px-4 py-3">
                                    <?php
                                    $catColors = ['vendor' => 'bg-blue-100 text-blue-700', 'employee' => 'bg-amber-100 text-amber-700', 'intern' => 'bg-green-100 text-green-700', 'campus_saarthi' => 'bg-purple-100 text-purple-700'];
                                    ?>
                                    <span class="px-2 py-1 rounded-full text-xs font-medium <?= $catColors[$job['category']] ?? 'bg-surface-2 text-ink-muted' ?>"><?= ucfirst(str_replace('_', ' ', $job['category'])) ?></span>
                                </td>
                                <td class="px-4 py-3 text-ink-muted"><?= $job['positions'] ?></td>
                                <td class="px-4 py-3">
                                    <?php
                                    $jobStatusColors = ['active' => 'bg-green-100 text-green-700', 'draft' => 'bg-surface-2 text-ink-muted', 'closed' => 'bg-red-100 text-red-700'];
                                    ?>
                                    <span class="px-2 py-1 rounded-full text-xs font-medium <?= $jobStatusColors[$job['status']] ?? 'bg-surface-2 text-ink-muted' ?>"><?= ucfirst($job['status']) ?></span>
                                </td>
                                <td class="px-4 py-3 text-ink-muted"><?= $job['deadline'] ? date('M d, Y', strtotime($job['deadline'])) : 'N/A' ?></td>
                                <td class="px-4 py-3">
                                        <div class="flex space-x-2">
                                            <!-- Edit button -->
                                            <button type="button" 
                                                onclick="openEditJob(this)" 
                                                class="text-blue-500 hover:text-blue-700 text-xs font-medium" 
                                                title="Edit"
                                                data-id="<?= $job['job_id'] ?>"
                                                data-title="<?= htmlspecialchars($job['title'], ENT_QUOTES) ?>"
                                                data-category="<?= htmlspecialchars($job['category'] ?? '', ENT_QUOTES) ?>"
                                                data-department="<?= htmlspecialchars($job['department'] ?? '', ENT_QUOTES) ?>"
                                                data-pillar="<?= htmlspecialchars($job['pillar'] ?? '', ENT_QUOTES) ?>"
                                                data-location="<?= htmlspecialchars($job['location'] ?? '', ENT_QUOTES) ?>"
                                                data-work_type="<?= htmlspecialchars($job['work_type'] ?? 'remote', ENT_QUOTES) ?>"
                                                data-job_type="<?= htmlspecialchars($job['job_type'] ?? 'full_time', ENT_QUOTES) ?>"
                                                data-experience_required="<?= htmlspecialchars($job['experience_required'] ?? '', ENT_QUOTES) ?>"
                                                data-compensation_type="<?= htmlspecialchars($job['compensation_type'] ?? 'fixed', ENT_QUOTES) ?>"
                                                data-salary_range="<?= htmlspecialchars($job['salary_range'] ?? '', ENT_QUOTES) ?>"
                                                data-positions="<?= (int)($job['positions'] ?? 1) ?>"
                                                data-deadline="<?= htmlspecialchars($job['deadline'] ?? '', ENT_QUOTES) ?>"
                                                data-status="<?= htmlspecialchars($job['status'] ?? 'draft', ENT_QUOTES) ?>"
                                                data-is_featured="<?= !empty($job['is_featured']) ? '1' : '0' ?>"
                                                data-description="<?= htmlspecialchars($job['description'] ?? '', ENT_QUOTES) ?>"
                                                data-skills="<?= htmlspecialchars($job['skills'] ?? '', ENT_QUOTES) ?>"
                                                data-requirements="<?= htmlspecialchars($job['requirements'] ?? '', ENT_QUOTES) ?>"
                                                data-responsibilities="<?= htmlspecialchars($job['responsibilities'] ?? '', ENT_QUOTES) ?>"
                                                data-eligibility_criteria="<?= htmlspecialchars($job['eligibility_criteria'] ?? '', ENT_QUOTES) ?>"
                                                data-benefits_perks="<?= htmlspecialchars($job['benefits_perks'] ?? '', ENT_QUOTES) ?>"
                                                data-interview_process="<?= htmlspecialchars($job['interview_process'] ?? '', ENT_QUOTES) ?>"
                                                data-age_limit="<?= htmlspecialchars($job['age_limit'] ?? '', ENT_QUOTES) ?>">
                                                <i class="fas fa-pen"></i>
                                            </button>
                                            <?php if ($job['status'] !== 'active'): ?>
                                            <form method="POST" class="inline">
                                                <input type="hidden" name="action" value="update_job_status">
                                                <input type="hidden" name="job_id" value="<?= $job['job_id'] ?>">
                                                <input type="hidden" name="status" value="active">
                                                <button type="submit" class="text-green-600 hover:text-green-800 text-xs font-medium" title="Activate"><i class="fas fa-check-circle"></i></button>
                                            </form>
                                            <?php endif; ?>
                                            <?php if ($job['status'] !== 'closed'): ?>
                                            <form method="POST" class="inline">
                                                <input type="hidden" name="action" value="update_job_status">
                                                <input type="hidden" name="job_id" value="<?= $job['job_id'] ?>">
                                                <input type="hidden" name="status" value="closed">
                                                <button type="submit" class="text-amber-600 hover:text-amber-800 text-xs font-medium" title="Close"><i class="fas fa-times-circle"></i></button>
                                            </form>
                                            <?php endif; ?>
                                            <form method="POST" class="inline" onsubmit="return confirm('Are you sure you want to delete this job posting?')">
                                                <input type="hidden" name="action" value="delete_job">
                                                <input type="hidden" name="job_id" value="<?= $job['job_id'] ?>">
                                                <button type="submit" class="text-red-600 hover:text-red-400 text-xs font-medium" title="Delete"><i class="fas fa-trash"></i></button>
                                            </form>
                                        </div>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <?php endif; ?>

        <!-- Applications Tab -->
        <?php if ($activeTab === 'applications'): ?>
        <div>
            <!-- Filters -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4 mb-6">
                <form method="GET" class="flex flex-wrap items-end gap-4">
                    <input type="hidden" name="tab" value="applications">
                    <div>
                        <label class="block text-xs font-medium text-ink-muted mb-1">Filter by Job</label>
                        <select name="filter_job" class="border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                            <option value="">All Jobs</option>
                            <?php foreach ($jobs as $j): ?>
                            <option value="<?= $j['job_id'] ?>" <?= ($_GET['filter_job'] ?? '') == $j['job_id'] ? 'selected' : '' ?>><?= htmlspecialchars($j['title'], ENT_QUOTES, 'UTF-8', false) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-ink-muted mb-1">Filter by Status</label>
                        <select name="filter_status" class="border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                            <option value="">All Statuses</option>
                            <?php foreach (['new','shortlisted','interview_scheduled','selected','offer_sent','joined','rejected'] as $s): ?>
                            <option value="<?= $s ?>" <?= ($_GET['filter_status'] ?? '') === $s ? 'selected' : '' ?>><?= ucfirst(str_replace('_', ' ', $s)) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <button type="submit" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">Filter</button>
                    <a href="?tab=applications" class="text-ink-muted hover:text-ink-muted text-sm">Clear</a>
                </form>
            </div>

            <!-- Status Pipeline Legend -->
            <div class="flex flex-wrap gap-2 mb-4">
                <span class="text-xs text-ink-muted">Pipeline:</span>
                <?php
                $pipeline = ['new' => 'bg-blue-100 text-blue-700', 'shortlisted' => 'bg-yellow-100 text-yellow-700', 'interview_scheduled' => 'bg-purple-100 text-purple-700', 'selected' => 'bg-green-100 text-green-700', 'offer_sent' => 'bg-indigo-100 text-indigo-700', 'joined' => 'bg-emerald-100 text-emerald-700', 'rejected' => 'bg-red-100 text-red-700'];
                foreach ($pipeline as $ps => $pc): ?>
                <span class="px-2 py-0.5 rounded-full text-xs font-medium <?= $pc ?>"><?= ucfirst(str_replace('_', ' ', $ps)) ?></span>
                <?php if ($ps !== 'rejected' && $ps !== 'joined'): ?><span class="text-ink-muted opacity-50 text-xs">&rarr;</span><?php endif; ?>
                <?php endforeach; ?>
            </div>

            <!-- Applications Table -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-surface-2">
                            <tr>
                                <th class="px-4 py-3 text-left font-medium text-ink-muted">Applicant</th>
                                <th class="px-4 py-3 text-left font-medium text-ink-muted">Email</th>
                                <th class="px-4 py-3 text-left font-medium text-ink-muted">Job Applied</th>
                                <th class="px-4 py-3 text-left font-medium text-ink-muted">Status</th>
                                <th class="px-4 py-3 text-left font-medium text-ink-muted">Date</th>
                                <th class="px-4 py-3 text-left font-medium text-ink-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-hairline">
                            <?php if (empty($applications)): ?>
                            <tr><td colspan="6" class="px-4 py-8 text-center text-ink-muted">No applications found.</td></tr>
                            <?php else: ?>
                            <?php foreach ($applications as $app): ?>
                            <tr class="hover:bg-surface-2">
                                <td class="px-4 py-3 font-medium text-ink"><?= htmlspecialchars($app['applicant_name'], ENT_QUOTES, 'UTF-8', false) ?></td>
                                <td class="px-4 py-3 text-ink-muted"><?= htmlspecialchars($app['email'], ENT_QUOTES, 'UTF-8', false) ?></td>
                                <td class="px-4 py-3 text-ink-muted"><?= htmlspecialchars($app['job_title'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></td>
                                <td class="px-4 py-3">
                                    <?php $color = $pipeline[$app['status']] ?? 'bg-surface-2 text-ink-muted'; ?>
                                    <span class="px-2 py-1 rounded-full text-xs font-medium <?= $color ?>"><?= ucfirst(str_replace('_', ' ', $app['status'])) ?></span>
                                </td>
                                <td class="px-4 py-3 text-ink-muted"><?= date('M d, Y', strtotime($app['applied_date'])) ?></td>
                                <td class="px-4 py-3">
                                    <div class="flex items-center space-x-2">
                                        <button onclick="document.getElementById('appDetail<?= $app['application_id'] ?>').classList.toggle('hidden')" class="text-primary-600 hover:text-primary-800 text-xs font-medium"><i class="fas fa-eye"></i> View</button>
                                        <?php if ($app['resume_url']): ?>
                                        <a href="<?= BASE_PATH . '/admin/download_resume.php?file=' . urlencode(basename($app['resume_url'])) ?>" target="_blank" class="text-blue-600 hover:text-blue-800 text-xs font-medium ml-2"><i class="fas fa-file-pdf"></i> Resume</a>
                                        <?php endif; ?>
                                        <form method="POST" class="inline flex items-center space-x-1 ml-2">
                                            <input type="hidden" name="action" value="update_application_status">
                                            <input type="hidden" name="application_id" value="<?= $app['application_id'] ?>">
                                            <select name="status" class="border border-hairline bg-surface-2 text-ink rounded px-1 py-0.5 text-xs">
                                                <?php foreach (array_keys($pipeline) as $ps): ?>
                                                <option value="<?= $ps ?>" <?= $app['status'] === $ps ? 'selected' : '' ?>><?= ucfirst(str_replace('_', ' ', $ps)) ?></option>
                                                <?php endforeach; ?>
                                            </select>
                                            <button type="submit" class="text-green-600 hover:text-green-800 text-xs"><i class="fas fa-check"></i></button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                            <!-- Application Detail Card -->
                            <tr id="appDetail<?= $app['application_id'] ?>" class="hidden">
                                <td colspan="6" class="px-4 py-4 bg-surface-2 border-b border-hairline">
                                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
                                        
                                        <!-- Column 1: Applicant Details & Questionnaire -->
                                        <div class="space-y-6">
                                            <div class="bg-surface-1 p-4 rounded border">
                                                <h4 class="font-bold mb-3 border-b pb-2">Applicant Info</h4>
                                                <p><strong>Phone:</strong> <?= htmlspecialchars($app['phone'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?> <?= $app['whatsapp'] ? ' / WA: ' . htmlspecialchars($app['whatsapp'], ENT_QUOTES, 'UTF-8', false) : '' ?></p>
                                                <p><strong>Experience:</strong> <?= htmlspecialchars($app['experience'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></p>
                                                <p><strong>Education:</strong> <?= htmlspecialchars($app['education'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></p>
                                                <p><strong>Resume:</strong> <?= $app['resume_url'] ? '<a href="' . BASE_PATH . '/admin/download_resume.php?file=' . urlencode(basename($app['resume_url'])) . '" class="text-primary-600 hover:underline" target="_blank">Download PDF</a>' : 'N/A' ?></p>
                                                <p><strong>Cover Letter:</strong> <?= htmlspecialchars($app['cover_letter'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></p>
                                            </div>
                                            
                                            <div class="bg-surface-1 p-4 rounded border">
                                                <h4 class="font-bold mb-3 border-b pb-2">Work Samples</h4>
                                                <?php 
                                                $samples = json_decode($app['work_samples'] ?? '[]', true) ?: [];
                                                if (empty($samples)): ?>
                                                    <p class="text-ink-muted">No samples provided.</p>
                                                <?php else: ?>
                                                    <ul class="list-disc pl-5">
                                                    <?php $sampleCount = 1; foreach ($samples as $s): ?>
                                                        <li><a href="<?= htmlspecialchars($s, ENT_QUOTES, 'UTF-8', false) ?>" target="_blank" class="text-primary-600 hover:underline"><i class="fas fa-external-link-alt text-xs mr-1"></i>View Sample <?= $sampleCount++ ?></a></li>
                                                    <?php endforeach; ?>
                                                    </ul>
                                                <?php endif; ?>
                                            </div>
                                            
                                            <div class="bg-surface-1 p-4 rounded border">
                                                <h4 class="font-bold mb-3 border-b pb-2">Questionnaire Answers</h4>
                                                <div class="space-y-3">
                                                    <?php for($i=1; $i<=5; $i++): ?>
                                                    <div>
                                                        <p class="font-medium text-xs text-ink-muted">Q<?= $i ?> Answer:</p>
                                                        <p class="text-sm bg-surface-1 p-2 rounded"><?= htmlspecialchars($app['qa_'.$i] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></p>
                                                    </div>
                                                    <?php endfor; ?>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Column 2: Scoring & Checklist -->
                                        <div class="space-y-6">
                                            <div class="bg-surface-1 p-4 rounded border border-primary-200">
                                                <h4 class="font-bold mb-3 border-b pb-2 text-primary-700"><i class="fas fa-star text-amber-400 mr-1"></i> Interview Scoring (Max 50)</h4>
                                                <form method="POST" class="space-y-3">
                                                    <input type="hidden" name="action" value="update_interview_scoring">
                                                    <input type="hidden" name="application_id" value="<?= $app['application_id'] ?>">
                                                    
                                                    <div class="grid grid-cols-2 gap-4">
                                                        <div><label class="block text-xs font-medium mb-1">Communication /10</label><input type="number" name="score_comm" value="<?= $app['score_comm'] ?? 0 ?>" min="0" max="10" class="w-full border rounded px-2 py-1 text-sm"></div>
                                                        <div><label class="block text-xs font-medium mb-1">Experience /10</label><input type="number" name="score_exp" value="<?= $app['score_exp'] ?? 0 ?>" min="0" max="10" class="w-full border rounded px-2 py-1 text-sm"></div>
                                                        <div><label class="block text-xs font-medium mb-1">Quality /10</label><input type="number" name="score_quality" value="<?= $app['score_quality'] ?? 0 ?>" min="0" max="10" class="w-full border rounded px-2 py-1 text-sm"></div>
                                                        <div><label class="block text-xs font-medium mb-1">Teaching /10</label><input type="number" name="score_teaching" value="<?= $app['score_teaching'] ?? 0 ?>" min="0" max="10" class="w-full border rounded px-2 py-1 text-sm"></div>
                                                        <div><label class="block text-xs font-medium mb-1">Availability /10</label><input type="number" name="score_avail" value="<?= $app['score_avail'] ?? 0 ?>" min="0" max="10" class="w-full border rounded px-2 py-1 text-sm"></div>
                                                        
                                                        <div class="col-span-2 flex justify-between items-center bg-surface-1 p-2 rounded mt-2">
                                                            <span class="font-bold">Total Score: <?= $app['total_score'] ?? 0 ?> / 50</span>
                                                            <button type="submit" class="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded text-xs font-bold transition">Save Scores</button>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>

                                            <div class="bg-surface-1 p-4 rounded border border-green-200">
                                                <h4 class="font-bold mb-3 border-b pb-2 text-green-700"><i class="fas fa-clipboard-check mr-1"></i> Onboarding Checklist</h4>
                                                <form method="POST" class="space-y-3">
                                                    <input type="hidden" name="action" value="update_onboarding_checklist">
                                                    <input type="hidden" name="application_id" value="<?= $app['application_id'] ?>">
                                                    
                                                    <div class="grid grid-cols-2 gap-2 text-xs">
                                                        <label class="flex items-center gap-2"><input type="checkbox" name="chk_resume" <?= ($app['chk_resume_received'] ?? 0) ? 'checked' : '' ?>> Resume received</label>
                                                        <label class="flex items-center gap-2"><input type="checkbox" name="chk_samples" <?= ($app['chk_samples_received'] ?? 0) ? 'checked' : '' ?>> Samples received</label>
                                                        <label class="flex items-center gap-2"><input type="checkbox" name="chk_questions" <?= ($app['chk_questions_answered'] ?? 0) ? 'checked' : '' ?>> Q&A answered</label>
                                                        <label class="flex items-center gap-2"><input type="checkbox" name="chk_interview" <?= ($app['chk_interview_conducted'] ?? 0) ? 'checked' : '' ?>> Interview done</label>
                                                        <label class="flex items-center gap-2"><input type="checkbox" name="chk_whatsapp" <?= ($app['chk_whatsapp_joined'] ?? 0) ? 'checked' : '' ?>> WhatsApp joined</label>
                                                        <label class="flex items-center gap-2"><input type="checkbox" name="chk_google" <?= ($app['chk_google_form'] ?? 0) ? 'checked' : '' ?>> Google Form filled</label>
                                                        <label class="flex items-center gap-2"><input type="checkbox" name="chk_portal" <?= ($app['chk_portal_registered'] ?? 0) ? 'checked' : '' ?>> Portal registered</label>
                                                        <label class="flex items-center gap-2"><input type="checkbox" name="chk_docs_upload" <?= ($app['chk_docs_uploaded'] ?? 0) ? 'checked' : '' ?>> Docs uploaded</label>
                                                        <label class="flex items-center gap-2"><input type="checkbox" name="chk_docs_verify" <?= ($app['chk_docs_verified'] ?? 0) ? 'checked' : '' ?>> Docs verified</label>
                                                        <label class="flex items-center gap-2"><input type="checkbox" name="chk_vendor_id" <?= ($app['chk_vendor_id'] ?? 0) ? 'checked' : '' ?>> ID generated</label>
                                                        <label class="flex items-center gap-2"><input type="checkbox" name="chk_orientation" <?= ($app['chk_orientation'] ?? 0) ? 'checked' : '' ?>> Orientation call</label>
                                                        <label class="flex items-center gap-2"><input type="checkbox" name="chk_first_project" <?= ($app['chk_first_project'] ?? 0) ? 'checked' : '' ?>> 1st Project assigned</label>
                                                    </div>
                                                    
                                                    <div class="mt-4 flex justify-end">
                                                        <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-xs font-bold transition">Save Checklist</button>
                                                    </div>
                                                </form>
                                            </div>

                                            <!-- Onboarding Email Action -->
                                            <div class="bg-surface-1 p-4 rounded border border-indigo-200">
                                                <form method="POST" class="flex justify-between items-center">
                                                    <input type="hidden" name="action" value="send_onboarding_email">
                                                    <input type="hidden" name="application_id" value="<?= $app['application_id'] ?>">
                                                    <div>
                                                        <h4 class="font-bold text-indigo-700 text-sm mb-1">Final Selection Email</h4>
                                                        <p class="text-xs text-ink-muted">Sends official email with WhatsApp & Google form links.</p>
                                                    </div>
                                                    <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded text-xs font-bold whitespace-nowrap shadow hover:bg-indigo-700 transition" <?= ($app['chk_selection_email'] ?? 0) ? 'title="Already sent"' : '' ?>>
                                                        <i class="fas fa-paper-plane mr-1"></i> <?= ($app['chk_selection_email'] ?? 0) ? 'Sent' : 'Send Onboarding' ?>
                                                    </button>
                                                </form>
                                            </div>

                                            <?php if ($app['notes']): ?>
                                            <div class="bg-surface-1 p-4 rounded border">
                                                <h4 class="font-bold mb-2 text-sm border-b pb-1">Activity Log</h4>
                                                <pre class="text-xs text-ink-muted whitespace-pre-wrap max-h-32 overflow-y-auto"><?= htmlspecialchars($app['notes'], ENT_QUOTES, 'UTF-8', false) ?></pre>
                                            </div>
                                            <?php endif; ?>
                                        </div>
                                        
                                    </div>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <?php endif; ?>

        <!-- Interviews Tab -->
        <?php if ($activeTab === 'interviews'): ?>
        <div>
            <!-- Schedule Interview Form -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6 mb-6">
                <h3 class="text-lg font-semibold text-ink mb-4">Schedule New Interview</h3>
                <form method="POST" class="space-y-4">
                    <input type="hidden" name="action" value="schedule_interview">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Application *</label>
                            <select name="application_id" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                <option value="">Select Application</option>
                                <?php foreach ($allApps as $a): ?>
                                <option value="<?= $a['application_id'] ?>"><?= htmlspecialchars($a['applicant_name'], ENT_QUOTES, 'UTF-8', false) ?> - <?= htmlspecialchars($a['job_title'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Interview Type</label>
                            <select name="interview_type" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                <option value="video">Video Call</option>
                                <option value="phone">Phone</option>
                                <option value="in_person">In Person</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Date *</label>
                            <input type="date" name="interview_date" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Time *</label>
                            <input type="time" name="interview_time" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Interviewer</label>
                            <select name="interviewer_id" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                <option value="">Select Interviewer</option>
                                <?php foreach ($interviewers as $iv): ?>
                                <option value="<?= $iv['user_id'] ?>"><?= htmlspecialchars($iv['name'], ENT_QUOTES, 'UTF-8', false) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Meeting Link</label>
                            <input type="url" name="meeting_link" placeholder="https://meet.google.com/..." class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink-muted mb-1">Notes</label>
                        <textarea name="notes" rows="2" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"></textarea>
                    </div>
                    <button type="submit" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                        <i class="fas fa-calendar-plus mr-1"></i> Schedule Interview
                    </button>
                </form>
            </div>

            <!-- Upcoming Interviews -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline overflow-hidden">
                <div class="px-4 py-3 border-b border-hairline flex flex-wrap justify-between items-center gap-2">
                    <h3 class="font-semibold text-ink"><i class="fas fa-calendar-check text-primary-500 mr-2"></i>All Interviews</h3>
                    <!-- Bulk cleanup button -->
                    <form method="POST" onsubmit="return confirm('Delete ALL completed, cancelled & no-show interviews? This frees up database space.')">
                        <input type="hidden" name="action" value="bulk_delete_interviews">
                        <button type="submit" class="bg-red-500/10 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium transition border border-red-500/20">
                            <i class="fas fa-trash-alt mr-1"></i> Clean Old Records
                        </button>
                    </form>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-surface-2">
                            <tr>
                                <th class="px-3 py-3 text-left font-medium text-ink-muted text-xs">Applicant</th>
                                <th class="px-3 py-3 text-left font-medium text-ink-muted text-xs">Job</th>
                                <th class="px-3 py-3 text-left font-medium text-ink-muted text-xs">Type</th>
                                <th class="px-3 py-3 text-left font-medium text-ink-muted text-xs">Date & Time</th>
                                <th class="px-3 py-3 text-left font-medium text-ink-muted text-xs">Interviewer</th>
                                <th class="px-3 py-3 text-left font-medium text-ink-muted text-xs">Status</th>
                                <th class="px-3 py-3 text-left font-medium text-ink-muted text-xs">Link</th>
                                <th class="px-3 py-3 text-center font-medium text-ink-muted text-xs">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-hairline">
                            <?php if (empty($interviews)): ?>
                            <tr><td colspan="8" class="px-4 py-8 text-center text-ink-muted"><i class="fas fa-calendar-times text-3xl mb-2 block"></i>No interviews scheduled.</td></tr>
                            <?php else: ?>
                            <?php foreach ($interviews as $iv):
                                $isPast = strtotime($iv['interview_date']) < time();
                            ?>
                            <tr class="hover:bg-surface-2 <?= $isPast && $iv['status'] === 'scheduled' ? 'bg-amber-50/50' : '' ?>">
                                <td class="px-3 py-3">
                                    <div class="font-medium text-ink"><?= htmlspecialchars($iv['applicant_name'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></div>
                                    <div class="text-xs text-ink-muted"><?= htmlspecialchars($iv['applicant_email'] ?? '', ENT_QUOTES, 'UTF-8', false) ?></div>
                                </td>
                                <td class="px-3 py-3 text-ink-muted text-xs"><?= htmlspecialchars($iv['job_title'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></td>
                                <td class="px-3 py-3">
                                    <?php $typeIcons = ['video' => 'fa-video text-blue-600', 'phone' => 'fa-phone text-green-600', 'in_person' => 'fa-user text-purple-600']; ?>
                                    <i class="fas <?= $typeIcons[$iv['interview_type']] ?? 'fa-question' ?> mr-1"></i>
                                    <?= ucfirst(str_replace('_', ' ', $iv['interview_type'])) ?>
                                </td>
                                <td class="px-3 py-3 text-ink-muted whitespace-nowrap">
                                    <?= date('d M Y', strtotime($iv['interview_date'])) ?><br>
                                    <span class="text-xs font-medium"><?= date('h:i A', strtotime($iv['interview_date'])) ?></span>
                                    <?php if ($isPast && $iv['status'] === 'scheduled'): ?>
                                    <span class="text-xs text-amber-600 block font-medium"><i class="fas fa-exclamation-triangle"></i> Overdue</span>
                                    <?php endif; ?>
                                </td>
                                <td class="px-3 py-3 text-ink-muted text-xs"><?= htmlspecialchars($iv['interviewer_name'] ?? 'TBD', ENT_QUOTES, 'UTF-8', false) ?></td>
                                <td class="px-3 py-3">
                                    <?php
                                    $ivColors = ['scheduled' => 'bg-blue-100 text-blue-700', 'completed' => 'bg-green-100 text-green-700', 'cancelled' => 'bg-red-100 text-red-700', 'no_show' => 'bg-surface-2 text-ink-muted'];
                                    ?>
                                    <span class="px-2 py-1 rounded-full text-xs font-medium <?= $ivColors[$iv['status']] ?? 'bg-surface-2 text-ink-muted' ?>"><?= ucfirst(str_replace('_', ' ', $iv['status'])) ?></span>
                                </td>
                                <td class="px-3 py-3">
                                    <?php if ($iv['meeting_link']): ?>
                                    <a href="<?= htmlspecialchars($iv['meeting_link'], ENT_QUOTES, 'UTF-8', false) ?>" target="_blank" class="inline-flex items-center gap-1 text-primary-600 hover:text-primary-800 text-xs font-medium bg-primary-50 px-2 py-1 rounded">
                                        <i class="fas fa-external-link-alt"></i> Join
                                    </a>
                                    <?php else: ?>
                                    <span class="text-ink-muted text-xs">N/A</span>
                                    <?php endif; ?>
                                </td>
                                <td class="px-3 py-3">
                                    <div class="flex flex-col gap-1 items-center">
                                        <!-- Status update buttons -->
                                        <?php if ($iv['status'] === 'scheduled'): ?>
                                        <form method="POST" class="inline">
                                            <input type="hidden" name="action" value="update_interview_status">
                                            <input type="hidden" name="interview_id" value="<?= $iv['interview_id'] ?>">
                                            <input type="hidden" name="interview_status" value="completed">
                                            <button type="submit" class="text-green-600 hover:bg-green-500/10 px-2 py-1 rounded text-xs font-medium" title="Mark Completed"><i class="fas fa-check"></i> Done</button>
                                        </form>
                                        <form method="POST" class="inline">
                                            <input type="hidden" name="action" value="update_interview_status">
                                            <input type="hidden" name="interview_id" value="<?= $iv['interview_id'] ?>">
                                            <input type="hidden" name="interview_status" value="no_show">
                                            <button type="submit" class="text-amber-600 hover:bg-amber-50 px-2 py-1 rounded text-xs font-medium" title="Mark No Show"><i class="fas fa-user-slash"></i> No Show</button>
                                        </form>
                                        <?php endif; ?>
                                        <!-- Delete button -->
                                        <form method="POST" onsubmit="return confirm('Delete this interview record?')" class="inline">
                                            <input type="hidden" name="action" value="delete_interview">
                                            <input type="hidden" name="interview_id" value="<?= $iv['interview_id'] ?>">
                                            <button type="submit" class="text-red-400 hover:bg-red-500/10 px-2 py-1 rounded text-xs font-medium" title="Delete"><i class="fas fa-trash"></i> Delete</button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <?php endif; ?>
    </div>
</div>
<!-- ======== EDIT JOB MODAL ======== -->
<div id="edit-job-modal" class="hidden fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-10">
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" onclick="closeEditJob()"></div>
    <div class="relative bg-surface-1 border border-hairline rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
        <div class="sticky top-0 bg-surface-1 border-b border-hairline px-6 py-4 flex justify-between items-center z-10">
            <h3 class="text-lg font-bold text-ink"><i class="fas fa-pen mr-2 text-blue-500"></i>Edit Job Posting</h3>
            <button onclick="closeEditJob()" class="text-ink-muted hover:text-ink"><i class="fas fa-times"></i></button>
        </div>
        <div class="p-6">
            <form method="POST" id="edit-job-form" class="space-y-4">
                <input type="hidden" name="action" value="update_job">
                <input type="hidden" name="job_id" id="edit_job_id">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label class="block text-sm font-medium text-ink-muted mb-1">Job Title *</label>
                        <input type="text" name="title" id="edit_title" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm"></div>
                    <div><label class="block text-sm font-medium text-ink-muted mb-1">Category *</label>
                        <select name="category" id="edit_category" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                            <option value="employee">Internal Member</option>
                            <option value="pillar_post">Saarthi</option>
                            <option value="vendor">Vendor / Freelancer</option>
                            <option value="intern">Internship</option>
                            <option value="freelancer">Freelancer</option>
                            <option value="part_time">Part-Time / Remote</option>
                            <option value="remote">Remote</option>
                            <option value="teaching_expert">Teaching Expert</option>
                        </select></div>
                    <div><label class="block text-sm font-medium text-ink-muted mb-1">Department</label>
                        <input type="text" name="department" id="edit_department" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm"></div>
                    <div><label class="block text-sm font-medium text-ink-muted mb-1">Pillar</label>
                        <select name="pillar" id="edit_pillar" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                            <option value="">None</option>
                            <option value="campus_saarthi">Campus Saarthi</option>
                            <option value="digital_saarthi">Digital Saarthi</option>
                            <option value="calling_saarthi">Calling Saarthi</option>
                            <option value="government_saarthi">Government Saarthi</option>
                            <option value="market_saarthi">Market Saarthi</option>
                        </select></div>
                    <div><label class="block text-sm font-medium text-ink-muted mb-1">Location</label>
                        <input type="text" name="location" id="edit_location" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm"></div>
                    <div><label class="block text-sm font-medium text-ink-muted mb-1">Work Type</label>
                        <select name="work_type" id="edit_work_type" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                            <option value="remote">Remote</option><option value="onsite">Onsite</option><option value="hybrid">Hybrid</option>
                        </select></div>
                    <div><label class="block text-sm font-medium text-ink-muted mb-1">Job Type</label>
                        <select name="job_type" id="edit_job_type" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                            <option value="full_time">Full-Time</option><option value="part_time">Part-Time</option>
                            <option value="internship">Internship</option><option value="contract">Contract</option>
                            <option value="freelance">Freelance</option><option value="vendor">Vendor</option>
                        </select></div>
                    <div><label class="block text-sm font-medium text-ink-muted mb-1">Experience Required</label>
                        <input type="text" name="experience_required" id="edit_experience_required" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm"></div>
                    <div><label class="block text-sm font-medium text-ink-muted mb-1">Compensation Type</label>
                        <select name="compensation_type" id="edit_compensation_type" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                            <option value="fixed">Fixed Salary</option><option value="commission">Commission</option>
                            <option value="stipend">Stipend</option><option value="task_based">Task-Based Payout</option><option value="unpaid">Unpaid</option>
                        </select></div>
                    <div><label class="block text-sm font-medium text-ink-muted mb-1">CTC / Stipend Range</label>
                        <input type="text" name="salary_range" id="edit_salary_range" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm"></div>
                    <div><label class="block text-sm font-medium text-ink-muted mb-1">Open Positions</label>
                        <input type="number" name="positions" id="edit_positions" min="1" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm"></div>
                    <div><label class="block text-sm font-medium text-ink-muted mb-1">Application Deadline</label>
                        <input type="date" name="deadline" id="edit_deadline" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm"></div>
                    <div><label class="block text-sm font-medium text-ink-muted mb-1">Status</label>
                        <select name="status" id="edit_status" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                            <option value="draft">Draft (hidden)</option><option value="active">Active (visible on site)</option><option value="closed">Closed</option>
                        </select></div>
                    <div><label class="block text-sm font-medium text-ink-muted mb-1">Age Limit</label>
                        <input type="text" name="age_limit" id="edit_age_limit" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm"></div>
                    <div class="flex items-center gap-2 pt-5 md:col-span-2">
                        <input type="checkbox" name="is_featured" id="edit_is_featured" value="1" class="rounded border-hairline">
                        <label for="edit_is_featured" class="text-sm font-medium text-ink-muted">Mark as "Job of the Week" (featured on homepage)</label>
                    </div>
                </div>
                <div><label class="block text-sm font-medium text-ink-muted mb-1">Description</label>
                    <textarea name="description" id="edit_description" rows="3" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm"></textarea></div>
                <div><label class="block text-sm font-medium text-ink-muted mb-1">Skills Required</label>
                    <input type="text" name="skills" id="edit_skills" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm"></div>
                <div><label class="block text-sm font-medium text-ink-muted mb-1">Requirements / Eligibility</label>
                    <textarea name="requirements" id="edit_requirements" rows="3" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm"></textarea></div>
                <div><label class="block text-sm font-medium text-ink-muted mb-1">Responsibilities</label>
                    <textarea name="responsibilities" id="edit_responsibilities" rows="3" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm"></textarea></div>
                <div><label class="block text-sm font-medium text-ink-muted mb-1">Eligibility Criteria</label>
                    <textarea name="eligibility_criteria" id="edit_eligibility_criteria" rows="3" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm"></textarea></div>
                <div><label class="block text-sm font-medium text-ink-muted mb-1">Benefits &amp; Perks</label>
                    <textarea name="benefits_perks" id="edit_benefits_perks" rows="3" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm"></textarea></div>
                <div><label class="block text-sm font-medium text-ink-muted mb-1">Interview Process</label>
                    <textarea name="interview_process" id="edit_interview_process" rows="3" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm"></textarea></div>
                <div class="flex justify-end gap-3 pt-2">
                    <button type="button" onclick="closeEditJob()" class="px-4 py-2 border border-hairline bg-surface-2 text-ink-muted rounded-lg text-sm font-medium">Cancel</button>
                    <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"><i class="fas fa-save mr-1"></i> Save Changes</button>
                </div>
            </form>
        </div>
    </div>
</div>
<script>
function openEditJob(btn) {
    const d = btn.dataset;
    const set = (id, val) => { const el = document.getElementById(id); if(el) el.value = val ?? ''; };
    const setTA = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val ?? ''; };
    set('edit_job_id', d.id);
    set('edit_title', d.title);
    set('edit_category', d.category);
    set('edit_department', d.department);
    set('edit_pillar', d.pillar);
    set('edit_location', d.location);
    set('edit_work_type', d.work_type);
    set('edit_job_type', d.job_type);
    set('edit_experience_required', d.experience_required);
    set('edit_compensation_type', d.compensation_type);
    set('edit_salary_range', d.salary_range);
    set('edit_positions', d.positions);
    set('edit_deadline', d.deadline);
    set('edit_status', d.status);
    set('edit_age_limit', d.age_limit);
    set('edit_skills', d.skills);
    setTA('edit_description', d.description);
    setTA('edit_requirements', d.requirements);
    setTA('edit_responsibilities', d.responsibilities);
    setTA('edit_eligibility_criteria', d.eligibility_criteria);
    setTA('edit_benefits_perks', d.benefits_perks);
    setTA('edit_interview_process', d.interview_process);
    document.getElementById('edit_is_featured').checked = d.is_featured === '1';
    document.getElementById('edit-job-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}
function closeEditJob() {
    document.getElementById('edit-job-modal').classList.add('hidden');
    document.body.style.overflow = '';
}
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>






