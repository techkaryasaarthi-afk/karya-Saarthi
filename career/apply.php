<?php
$pageTitle = 'Apply';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/mailer.php';
date_default_timezone_set('Asia/Kolkata');

// Block admin/HR from applying
if (session_status() === PHP_SESSION_NONE) session_start();
if (isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'admin') {
    header('Location: ' . BASE_PATH . '/admin/recruitment.php');
    exit;
}

$jobId = intval($_GET['job_id'] ?? $_POST['job_id'] ?? 0);
$job = null;
$success = false;
$error = '';

if ($jobId > 0) {
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("SELECT * FROM job_postings WHERE job_id = ? AND status = 'active'");
        $stmt->execute([$jobId]);
        $job = $stmt->fetch();
        
        // Auto-fix schema for detailed hiring workflow
        $queries = [
            "ALTER TABLE applications ADD COLUMN user_id VARCHAR(50) NULL AFTER job_id",
            "ALTER TABLE applications ADD COLUMN whatsapp VARCHAR(15) AFTER phone",
            "ALTER TABLE applications ADD COLUMN portfolio_url VARCHAR(255) AFTER resume_url",
            "ALTER TABLE applications ADD COLUMN education VARCHAR(200)",
            "ALTER TABLE applications ADD COLUMN college VARCHAR(200)",
            "ALTER TABLE applications ADD COLUMN notice_period VARCHAR(50)",
            "ALTER TABLE applications ADD COLUMN ctc_expectation VARCHAR(100)",
            "ALTER TABLE applications ADD COLUMN preferred_pillar VARCHAR(100)",
            "ALTER TABLE applications ADD COLUMN availability VARCHAR(100)",
            "ALTER TABLE applications ADD COLUMN hours_per_week INT NULL",
            "ALTER TABLE applications ADD COLUMN qa_1 TEXT AFTER cover_letter",
            "ALTER TABLE applications ADD COLUMN qa_2 TEXT AFTER qa_1",
            "ALTER TABLE applications ADD COLUMN qa_3 TEXT AFTER qa_2",
            "ALTER TABLE applications ADD COLUMN qa_4 TEXT AFTER qa_3",
            "ALTER TABLE applications ADD COLUMN qa_5 TEXT AFTER qa_4",
            "ALTER TABLE applications ADD COLUMN work_samples TEXT AFTER qa_5",
            "ALTER TABLE applications ADD COLUMN score_comm INT DEFAULT 0",
            "ALTER TABLE applications ADD COLUMN score_exp INT DEFAULT 0",
            "ALTER TABLE applications ADD COLUMN score_quality INT DEFAULT 0",
            "ALTER TABLE applications ADD COLUMN score_teaching INT DEFAULT 0",
            "ALTER TABLE applications ADD COLUMN score_avail INT DEFAULT 0",
            "ALTER TABLE applications ADD COLUMN total_score INT DEFAULT 0",
            "ALTER TABLE applications ADD COLUMN chk_resume_received BOOLEAN DEFAULT FALSE",
            "ALTER TABLE applications ADD COLUMN chk_samples_received BOOLEAN DEFAULT FALSE",
            "ALTER TABLE applications ADD COLUMN chk_questions_answered BOOLEAN DEFAULT FALSE",
            "ALTER TABLE applications ADD COLUMN chk_interview_conducted BOOLEAN DEFAULT FALSE",
            "ALTER TABLE applications ADD COLUMN chk_selection_email BOOLEAN DEFAULT FALSE",
            "ALTER TABLE applications ADD COLUMN chk_whatsapp_joined BOOLEAN DEFAULT FALSE",
            "ALTER TABLE applications ADD COLUMN chk_google_form BOOLEAN DEFAULT FALSE",
            "ALTER TABLE applications ADD COLUMN chk_portal_registered BOOLEAN DEFAULT FALSE",
            "ALTER TABLE applications ADD COLUMN chk_docs_uploaded BOOLEAN DEFAULT FALSE",
            "ALTER TABLE applications ADD COLUMN chk_docs_verified BOOLEAN DEFAULT FALSE",
            "ALTER TABLE applications ADD COLUMN chk_vendor_id BOOLEAN DEFAULT FALSE",
            "ALTER TABLE applications ADD COLUMN chk_orientation BOOLEAN DEFAULT FALSE",
            "ALTER TABLE applications ADD COLUMN chk_first_project BOOLEAN DEFAULT FALSE"
        ];
        foreach ($queries as $sql) {
            try { $pdo->exec($sql); } catch (Exception $ignore) {}
        }
    } catch (Exception $e) {}
}

// Create uploads directory
$uploadDir = __DIR__ . '/uploads/resumes/';
if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0755, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $job) {
    $name = trim($_POST['applicant_name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $whatsapp = trim($_POST['whatsapp'] ?? '');
    $experience = trim($_POST['experience'] ?? '');
    $skills = trim($_POST['skills'] ?? '');
    $coverLetter = trim($_POST['cover_letter'] ?? '');
    $education = trim($_POST['education'] ?? '');
    $college = trim($_POST['college'] ?? '');
    $noticePeriod = trim($_POST['notice_period'] ?? '');
    $ctcExpectation = trim($_POST['ctc_expectation'] ?? '');
    $preferredPillar = trim($_POST['preferred_pillar'] ?? '');
    $availability = trim($_POST['availability'] ?? '');
    $hoursPerWeek = intval($_POST['hours_per_week'] ?? 0);
    $resumeUrl = '';

    // Validation
    if (empty($name) || empty($email) || empty($phone)) {
        $error = 'Please fill in all required fields.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Please enter a valid email address.';
    } elseif (!preg_match('/^[0-9]{10,15}$/', preg_replace('/[\s\-+()]/', '', $phone))) {
        $error = 'Please enter a valid phone number.';
    } elseif (!isset($_FILES['resume']) || $_FILES['resume']['error'] !== UPLOAD_ERR_OK) {
        $error = 'Please upload your resume (PDF, DOC, or DOCX).';
    } else {
        // Validate file
        $file = $_FILES['resume'];
        $maxSize = 5 * 1024 * 1024; // 5MB
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

        if (!in_array($ext, ['pdf', 'doc', 'docx'])) {
            $error = 'Only PDF, DOC, and DOCX files are allowed.';
        } elseif ($file['size'] > $maxSize) {
            $error = 'File size must be under 5MB.';
        } else {
            $fileName = 'resume_' . time() . '_' . preg_replace('/[^a-zA-Z0-9]/', '', $name) . '.' . $ext;
            $filePath = $uploadDir . $fileName;

            if (move_uploaded_file($file['tmp_name'], $filePath)) {
                chmod($filePath, 0600);
                $resumeUrl = '/uploads/resumes/' . $fileName;

                try {
                    $stmt = $pdo->prepare("INSERT INTO applications (job_id, user_id, applicant_name, email, phone, whatsapp, resume_url, portfolio_url, cover_letter, experience, skills, education, college, notice_period, ctc_expectation, preferred_pillar, availability, hours_per_week, qa_1, qa_2, qa_3, qa_4, qa_5, work_samples) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    
                    $workSamples = array_filter([
                        trim($_POST['work_sample_1'] ?? ''),
                        trim($_POST['work_sample_2'] ?? ''),
                        trim($_POST['work_sample_3'] ?? ''),
                        trim($_POST['work_sample_4'] ?? ''),
                        trim($_POST['work_sample_5'] ?? '')
                    ]);

                    $stmt->execute([
                        $jobId,
                        $_SESSION['user_id'] ?? null,
                        $name, $email, $phone, $whatsapp ?: $phone,
                        $resumeUrl,
                        trim($_POST['portfolio_url'] ?? ''),
                        $coverLetter, $experience, $skills,
                        $education, $college, $noticePeriod, $ctcExpectation,
                        $preferredPillar ?: null,
                        $availability,
                        $hoursPerWeek ?: null,
                        trim($_POST['qa_1'] ?? ''),
                        trim($_POST['qa_2'] ?? ''),
                        trim($_POST['qa_3'] ?? ''),
                        trim($_POST['qa_4'] ?? ''),
                        trim($_POST['qa_5'] ?? ''),
                        json_encode($workSamples)
                    ]);
                    $applicationId = $pdo->lastInsertId();

                    // Update application count
                    $pdo->prepare("UPDATE job_postings SET application_count = application_count + 1 WHERE job_id = ?")->execute([$jobId]);

                    // Send email to HR
                    $hrEmail = SITE_EMAIL;
                    $subject = "New Application: {$name} for {$job['title']}";
                    $emailBody = "<html><body style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;'>
<div style='background:linear-gradient(135deg,#1e40af,#2563eb,#f97316);color:white;padding:25px;text-align:center;border-radius:12px 12px 0 0;'>
    <h1 style='margin:0;font-size:22px;'>Karya Saarthi Careers</h1>
    <p style='color:#fdba74;margin:5px 0 0;font-size:13px;'>New Job Application Received</p>
</div>
<div style='padding:25px;background:#f9fafb;border:1px solid #e5e7eb;'>
    <h3 style='color:#1f2937;margin-top:0;'>Application #$applicationId</h3>
    <table style='width:100%;border-collapse:collapse;'>
        <tr><td style='padding:8px 0;color:#6b7280;width:140px;'>Position:</td><td style='padding:8px 0;font-weight:bold;color:#1f2937;'>" . htmlspecialchars($job['title'], ENT_QUOTES, 'UTF-8', false) . "</td></tr>
        <tr><td style='padding:8px 0;color:#6b7280;'>Category:</td><td style='padding:8px 0;'>" . ucfirst(str_replace('_', ' ', $job['category'])) . "</td></tr>
        <tr style='border-top:1px solid #e5e7eb;'><td style='padding:8px 0;color:#6b7280;'>Name:</td><td style='padding:8px 0;font-weight:bold;'>" . htmlspecialchars($name, ENT_QUOTES, 'UTF-8', false) . "</td></tr>
        <tr><td style='padding:8px 0;color:#6b7280;'>Email:</td><td style='padding:8px 0;'><a href='mailto:$email'>$email</a></td></tr>
        <tr><td style='padding:8px 0;color:#6b7280;'>Phone:</td><td style='padding:8px 0;'><a href='tel:$phone'>$phone</a></td></tr>
        <tr><td style='padding:8px 0;color:#6b7280;'>Education:</td><td style='padding:8px 0;'>" . htmlspecialchars($education ?: 'N/A', ENT_QUOTES, 'UTF-8', false) . "</td></tr>
        <tr><td style='padding:8px 0;color:#6b7280;'>Experience:</td><td style='padding:8px 0;'>" . htmlspecialchars($experience ?: 'Fresher', ENT_QUOTES, 'UTF-8', false) . "</td></tr>
    </table>
    <div style='margin-top:20px;text-align:center;'>
        <a href='" . SITE_URL . "/admin/recruitment.php' style='display:inline-block;background:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;'>View in Admin Panel</a>
    </div>
</div>
<div style='padding:15px;text-align:center;color:#9ca3af;font-size:12px;'>Karya Saarthi Careers | " . SITE_URL . "</div>
</body></html>";

                    sendEmail($hrEmail, $subject, $emailBody, $email);

                    // Confirmation to applicant
                    $applicantSubject = "Application Received — " . $job['title'] . " | Karya Saarthi";
                    $applicantBody = "<html><body style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;'>
<div style='background:linear-gradient(135deg,#1e40af,#2563eb,#f97316);color:white;padding:30px;text-align:center;border-radius:12px 12px 0 0;'>
    <h1 style='margin:0;font-size:24px;'>Karya Saarthi Careers</h1>
    <p style='color:#fdba74;margin:5px 0 0;font-size:14px;'>Hum Hai Aapke Saarthi</p>
</div>
<div style='padding:30px;background:#fff;border:1px solid #e5e7eb;'>
    <div style='text-align:center;margin-bottom:20px;font-size:48px;'>&#9989;</div>
    <h2 style='color:#22c55e;text-align:center;margin-top:0;'>Application Received!</h2>
    <p style='color:#374151;'>Dear <strong>" . htmlspecialchars($name, ENT_QUOTES, 'UTF-8', false) . "</strong>,</p>
    <p style='color:#374151;'>Thank you for applying for <strong>" . htmlspecialchars($job['title'], ENT_QUOTES, 'UTF-8', false) . "</strong> at Karya Saarthi.</p>
    <div style='background:#eff6ff;border-left:4px solid #2563eb;padding:20px;margin:20px 0;border-radius:0 8px 8px 0;'>
        <strong>Application Details:</strong><br><br>
        <table style='width:100%;border-collapse:collapse;'>
            <tr><td style='padding:5px 0;color:#6b7280;width:130px;'>Position:</td><td style='padding:5px 0;color:#111;font-weight:bold;'>" . htmlspecialchars($job['title'], ENT_QUOTES, 'UTF-8', false) . "</td></tr>
            <tr><td style='padding:5px 0;color:#6b7280;'>Application ID:</td><td style='padding:5px 0;color:#111;'>#$applicationId</td></tr>
            <tr><td style='padding:5px 0;color:#6b7280;'>Applied On:</td><td style='padding:5px 0;color:#111;'>" . date('d M Y, h:i A') . "</td></tr>
        </table>
    </div>
    <div style='background:#fff7ed;border:1px solid #fed7aa;padding:15px;border-radius:8px;margin:20px 0;'>
        <strong style='color:#ea580c;'>What happens next?</strong>
        <ol style='color:#374151;margin:10px 0;padding-left:20px;'>
            <li style='margin:5px 0;'>Our HR team reviews your application</li>
            <li style='margin:5px 0;'>If shortlisted, you'll receive an interview invite</li>
            <li style='margin:5px 0;'>Interview via Google Meet / phone</li>
            <li style='margin:5px 0;'>Final selection & offer letter</li>
        </ol>
    </div>
    <p style='color:#6b7280;font-size:13px;'>Questions? Contact <a href='mailto:hr@karyasaarthi.com'>hr@karyasaarthi.com</a> or call <a href='tel:+918595275753'>+91 85952 75753</a></p>
</div>
<div style='background:#1e3a5f;padding:15px;text-align:center;border-radius:0 0 12px 12px;'>
    <p style='color:#94a3b8;font-size:12px;margin:0;'>Karya Saarthi — Hum Hai Aapke Saarthi | career.karyasaarthi.com</p>
</div>
</body></html>";

                    sendEmail($email, $applicantSubject, $applicantBody);
                    $success = true;
                } catch (Exception $e) {
                    $error = 'Submission failed: ' . $e->getMessage();
                }
            } else {
                $error = 'Failed to upload resume. Please try again.';
            }
        }
    }
}

// Pre-fill from session
$prefillName = $_SESSION['user_name'] ?? '';
$prefillEmail = $_SESSION['user_email'] ?? '';

if ($job) $pageTitle = 'Apply — ' . $job['title'];
require_once __DIR__ . '/includes/header.php';

// Determine category-specific fields
$showPillar = in_array($job['category'] ?? '', ['pillar_post', 'campus_saarthi']);
$showPortfolio = in_array($job['category'] ?? '', ['vendor', 'freelancer']);
$showHours = in_array($job['category'] ?? '', ['part_time', 'remote', 'freelancer']);
$showCollege = in_array($job['category'] ?? '', ['intern', 'campus_saarthi']);
$showNotice = in_array($job['category'] ?? '', ['employee', 'pillar_post']);
$showTeachingExpert = ($job['category'] ?? '') === 'teaching_expert';
$jobCategory = htmlspecialchars($job['category'] ?? '', ENT_QUOTES, 'UTF-8', false);
?>

<!-- Terms & Conditions Modal -->
<div id="tnc-modal" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm hidden" style="display:none;">
    <div class="bg-surface-1 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-blue-800 via-blue-600 to-orange-500 px-6 py-5 flex-shrink-0">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-surface-1/20 rounded-lg flex items-center justify-center">
                    <i class="fas fa-file-contract text-white text-lg"></i>
                </div>
                <div>
                    <h2 class="text-lg font-bold text-white">Terms & Conditions</h2>
                    <p class="text-blue-100 text-xs">Please Read Carefully</p>
                </div>
            </div>
        </div>
        <!-- Modal Body -->
        <div class="px-6 py-5 overflow-y-auto flex-1">
            <p class="text-sm text-ink-muted mb-5">You must agree to all the following terms before proceeding with your application.</p>
            <div class="space-y-4">
                <label class="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" class="tnc-check mt-0.5 w-4 h-4 rounded border-hairline bg-surface-2 text-ink text-primary-600 focus:ring-primary-500 flex-shrink-0">
                    <span class="text-sm text-ink group-hover:text-ink font-bold"><strong>Eligibility confirmation:</strong> I confirm I am 18+ years of age and the information I am submitting is true and accurate</span>
                </label>
                <label class="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" class="tnc-check mt-0.5 w-4 h-4 rounded border-hairline bg-surface-2 text-ink text-primary-600 focus:ring-primary-500 flex-shrink-0">
                    <span class="text-sm text-ink group-hover:text-ink font-bold"><strong>Application accuracy:</strong> I understand that submitting false information leads to immediate rejection or termination</span>
                </label>
                <label class="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" class="tnc-check mt-0.5 w-4 h-4 rounded border-hairline bg-surface-2 text-ink text-primary-600 focus:ring-primary-500 flex-shrink-0">
                    <span class="text-sm text-ink group-hover:text-ink font-bold"><strong>Data consent:</strong> I consent to Karya Saarthi storing and using my data for hiring and communication purposes only</span>
                </label>
                <label class="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" class="tnc-check mt-0.5 w-4 h-4 rounded border-hairline bg-surface-2 text-ink text-primary-600 focus:ring-primary-500 flex-shrink-0">
                    <span class="text-sm text-ink group-hover:text-ink font-bold"><strong>Confidentiality:</strong> I agree to keep all client, project, and company information strictly confidential during and after engagement</span>
                </label>
                <label class="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" class="tnc-check mt-0.5 w-4 h-4 rounded border-hairline bg-surface-2 text-ink text-primary-600 focus:ring-primary-500 flex-shrink-0">
                    <span class="text-sm text-ink group-hover:text-ink font-bold"><strong>IP rights:</strong> All work created for Karya Saarthi projects belongs to Karya Saarthi — I cannot use it for personal use without permission</span>
                </label>
                <label class="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" class="tnc-check mt-0.5 w-4 h-4 rounded border-hairline bg-surface-2 text-ink text-primary-600 focus:ring-primary-500 flex-shrink-0">
                    <span class="text-sm text-ink group-hover:text-ink font-bold"><strong>Non-solicitation:</strong> I will not directly offer paid services to any student or client I meet through the Karya Saarthi platform</span>
                </label>
                <label class="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" class="tnc-check mt-0.5 w-4 h-4 rounded border-hairline bg-surface-2 text-ink text-primary-600 focus:ring-primary-500 flex-shrink-0">
                    <span class="text-sm text-ink group-hover:text-ink font-bold"><strong>Termination clause:</strong> I understand Karya Saarthi can terminate engagement for policy violations at any time with or without notice</span>
                </label>
                <label class="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" class="tnc-check mt-0.5 w-4 h-4 rounded border-hairline bg-surface-2 text-ink text-primary-600 focus:ring-primary-500 flex-shrink-0">
                    <span class="text-sm text-ink group-hover:text-ink font-bold"><strong>Dispute resolution:</strong> All disputes will be resolved under Indian law with jurisdiction in Delhi courts — mediation first</span>
                </label>
                <label class="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" class="tnc-check mt-0.5 w-4 h-4 rounded border-hairline bg-surface-2 text-ink text-primary-600 focus:ring-primary-500 flex-shrink-0">
                    <span class="text-sm text-ink group-hover:text-ink font-bold"><strong>Privacy policy:</strong> I have read and agree to the <a href="<?= BASE_PATH ?>/privacy.php" target="_blank" class="text-primary-600 underline hover:text-primary-800">Privacy Policy</a></span>
                </label>
            </div>
        </div>
        <!-- Modal Footer -->
        <div class="px-6 py-4 bg-surface-2 border-t border-hairline flex items-center justify-between flex-shrink-0">
            <a href="<?= BASE_PATH ?>/careers.php" class="text-sm text-ink-muted hover:text-ink transition"><i class="fas fa-arrow-left mr-1"></i> Cancel</a>
            <button type="button" id="tnc-accept-btn" disabled class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed">
                <i class="fas fa-check-circle mr-1"></i> I Accept & Continue
            </button>
        </div>
    </div>
</div>

<script>
(function() {
    var modal = document.getElementById('tnc-modal');
    if (!modal) return;

    // Only show for valid job pages with the form (not error/success pages)
    var applyForm = document.getElementById('apply-form');
    if (!applyForm) return;

    // Check sessionStorage
    var tncKey = 'tnc_accepted_job_<?= $jobId ?>';
    if (sessionStorage.getItem(tncKey)) return;

    // Show modal, hide form content
    modal.style.display = '';
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    var checks = modal.querySelectorAll('.tnc-check');
    var acceptBtn = document.getElementById('tnc-accept-btn');

    function updateBtn() {
        var allChecked = true;
        checks.forEach(function(c) { if (!c.checked) allChecked = false; });
        acceptBtn.disabled = !allChecked;
    }

    checks.forEach(function(c) { c.addEventListener('change', updateBtn); });

    acceptBtn.addEventListener('click', function() {
        sessionStorage.setItem(tncKey, '1');
        modal.style.display = 'none';
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    });

    // Prevent closing by clicking outside
    modal.addEventListener('click', function(e) {
        e.stopPropagation();
    });
})();
</script>

<?php if (!$job): ?>
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
    <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 mb-6">
        <i class="fas fa-exclamation-triangle text-4xl text-red-400"></i>
    </div>
    <h1 class="text-3xl font-bold text-ink font-bold mb-3">Job Not Found</h1>
    <p class="text-ink-muted mb-8">This position does not exist or is no longer accepting applications.</p>
    <a href="<?= BASE_PATH ?>/careers.php" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition">
        <i class="fas fa-arrow-left mr-2"></i> Browse Openings
    </a>
</section>

<?php elseif ($success): ?>
<section class="max-w-2xl mx-auto px-4 py-20 text-center">
    <div class="bg-surface-1 rounded-xl border border-hairline shadow-none p-10">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6">
            <i class="fas fa-check-circle text-5xl text-green-400"></i>
        </div>
        <h1 class="text-2xl font-bold text-ink font-bold mb-3">Application Submitted!</h1>
        <p class="text-ink-muted mb-1">You applied for</p>
        <p class="text-lg font-semibold text-primary-600 mb-4"><?= htmlspecialchars($job['title'], ENT_QUOTES, 'UTF-8', false) ?></p>
        <p class="text-sm text-ink-muted opacity-80 mb-8">We've sent a confirmation to your email. Our HR team will review your application and get back to you within 3-5 working days.</p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="<?= BASE_PATH ?>/careers.php" class="border border-hairline bg-surface-2 text-ink hover:bg-surface-2 text-ink-muted px-6 py-3 rounded-lg text-sm font-medium transition">Browse More Jobs</a>
            <?php if (isset($_SESSION['user_id'])): ?>
                <a href="<?= BASE_PATH ?>/user-panel/" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition">Go to Dashboard</a>
            <?php else: ?>
                <a href="<?= BASE_PATH ?>/" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition">Go to Homepage</a>
            <?php endif; ?>
        </div>
    </div>
</section>
<script>
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.launchConfetti === 'function') window.launchConfetti();
});
</script>

<?php else: ?>
<!-- Breadcrumb -->
<section class="bg-surface-1 border-b border-hairline">
    <div class="max-w-7xl mx-auto px-4 py-3">
        <nav class="flex flex-wrap items-center text-sm text-ink-muted gap-x-2 gap-y-1">
            <a href="<?= BASE_PATH ?>/" class="hover:text-primary-600">Home</a>
            <i class="fas fa-chevron-right text-xs text-ink-muted opacity-50"></i>
            <a href="<?= BASE_PATH ?>/careers.php" class="hover:text-primary-600">All Jobs</a>
            <i class="fas fa-chevron-right text-xs text-ink-muted opacity-50"></i>
            <a href="<?= BASE_PATH ?>/job-detail.php?id=<?= $jobId ?>" class="hover:text-primary-600 truncate max-w-[150px] sm:max-w-xs"><?= htmlspecialchars($job['title'], ENT_QUOTES, 'UTF-8', false) ?></a>
            <i class="fas fa-chevron-right text-xs text-ink-muted opacity-50"></i>
            <span class="text-ink font-bold">Apply</span>
        </nav>
    </div>
</section>

<section class="max-w-3xl mx-auto px-4 py-8">
    <!-- Job Header -->
    <div class="bg-surface-1 rounded-xl border border-hairline shadow-none p-6 mb-6">
        <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                <i class="fas fa-briefcase text-primary-600 text-lg"></i>
            </div>
            <div>
                <h1 class="text-xl font-bold text-ink font-bold"><?= htmlspecialchars($job['title'], ENT_QUOTES, 'UTF-8', false) ?></h1>
                <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted mt-1">
                    <?php if ($job['location']): ?><span><i class="fas fa-map-marker-alt mr-1"></i><?= htmlspecialchars($job['location'], ENT_QUOTES, 'UTF-8', false) ?></span><?php endif; ?>
                    <?php if ($job['work_type']): ?><span class="capitalize"><i class="fas fa-laptop-house mr-1"></i><?= $job['work_type'] ?></span><?php endif; ?>
                    <?php if ($job['salary_range']): ?><span><i class="fas fa-rupee-sign mr-1"></i><?= htmlspecialchars($job['salary_range'], ENT_QUOTES, 'UTF-8', false) ?></span><?php endif; ?>
                </div>
            </div>
        </div>
    </div>

    <!-- Step Indicator -->
    <div class="bg-surface-1 rounded-xl border border-hairline shadow-none p-4 mb-6">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 step-indicator" data-step="1">
                <div class="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold step-circle" id="step-circle-1">1</div>
                <span class="text-sm font-medium text-primary-600 hidden sm:inline" id="step-label-1">Personal Info</span>
            </div>
            <div class="flex-1 h-0.5 bg-surface-2 mx-2"><div class="h-full bg-primary-600 transition-all duration-300" id="progress-1" style="width:0%"></div></div>
            <div class="flex items-center gap-2 step-indicator" data-step="2">
                <div class="w-8 h-8 rounded-full bg-surface-2 text-ink-muted flex items-center justify-center text-sm font-bold step-circle" id="step-circle-2">2</div>
                <span class="text-sm font-medium text-ink-muted opacity-80 hidden sm:inline" id="step-label-2">Role & Education</span>
            </div>
            <div class="flex-1 h-0.5 bg-surface-2 mx-2"><div class="h-full bg-primary-600 transition-all duration-300" id="progress-2" style="width:0%"></div></div>
            <div class="flex items-center gap-2 step-indicator" data-step="3">
                <div class="w-8 h-8 rounded-full bg-surface-2 text-ink-muted flex items-center justify-center text-sm font-bold step-circle" id="step-circle-3">3</div>
                <span class="text-sm font-medium text-ink-muted opacity-80 hidden sm:inline" id="step-label-3">Questions</span>
            </div>
            <div class="flex-1 h-0.5 bg-surface-2 mx-2"><div class="h-full bg-primary-600 transition-all duration-300" id="progress-3" style="width:0%"></div></div>
            <div class="flex items-center gap-2 step-indicator" data-step="4">
                <div class="w-8 h-8 rounded-full bg-surface-2 text-ink-muted flex items-center justify-center text-sm font-bold step-circle" id="step-circle-4">4</div>
                <span class="text-sm font-medium text-ink-muted opacity-80 hidden sm:inline" id="step-label-4">Submit</span>
            </div>
        </div>
    </div>

    <?php if ($error): ?>
    <div class="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
        <i class="fas fa-exclamation-circle text-red-400 mr-2"></i>
        <span class="text-sm text-red-400"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8', false) ?></span>
    </div>
    <?php endif; ?>

    <!-- Multi-Step Application Form -->
    <form method="POST" enctype="multipart/form-data" id="apply-form" data-category="<?= $jobCategory ?>">
        <input type="hidden" name="job_id" value="<?= $jobId ?>">

        <!-- STEP 1: Personal Details -->
        <div class="step-panel" id="step-1">
            <div class="bg-surface-1 rounded-xl border border-hairline shadow-none p-6">
                <h2 class="text-base font-semibold text-ink font-bold mb-5"><i class="fas fa-user mr-2 text-primary-500"></i>Step 1: Personal Information</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div class="sm:col-span-2">
                        <label class="block text-sm font-medium text-ink mb-1">Full Name <span class="text-red-400">*</span></label>
                        <input type="text" name="applicant_name" id="f-name" value="<?= htmlspecialchars($_POST['applicant_name'] ?? $prefillName, ENT_QUOTES, 'UTF-8', false) ?>" required placeholder="Your full name" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink mb-1">Email <span class="text-red-400">*</span></label>
                        <input type="email" name="email" id="f-email" value="<?= htmlspecialchars($_POST['email'] ?? $prefillEmail, ENT_QUOTES, 'UTF-8', false) ?>" required placeholder="you@email.com" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink mb-1">Phone <span class="text-red-400">*</span></label>
                        <input type="tel" name="phone" id="f-phone" value="<?= htmlspecialchars($_POST['phone'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" required placeholder="9876543210" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink mb-1">WhatsApp Number</label>
                        <input type="tel" name="whatsapp" value="<?= htmlspecialchars($_POST['whatsapp'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" placeholder="Same as phone if blank" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                </div>
                <div class="mt-6 flex justify-end">
                    <button type="button" onclick="goToStep(2)" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">Next: Role & Education <i class="fas fa-arrow-right ml-2"></i></button>
                </div>
            </div>
        </div>

        <!-- STEP 2: Role & Education -->
        <div class="step-panel hidden" id="step-2">
            <div class="bg-surface-1 rounded-xl border border-hairline shadow-none p-6">
                <h2 class="text-base font-semibold text-ink font-bold mb-5"><i class="fas fa-graduation-cap mr-2 text-primary-500"></i>Step 2: Role & Education</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label class="block text-sm font-medium text-ink mb-1">Experience</label>
                        <input type="text" name="experience" value="<?= htmlspecialchars($_POST['experience'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" placeholder="e.g. Fresher, 2 years" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink mb-1">Education</label>
                        <input type="text" name="education" value="<?= htmlspecialchars($_POST['education'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" placeholder="e.g. B.Tech, MBA, 12th Pass" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                    <?php if ($showCollege): ?>
                    <div>
                        <label class="block text-sm font-medium text-ink mb-1">College / University</label>
                        <input type="text" name="college" value="<?= htmlspecialchars($_POST['college'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" placeholder="Your college name" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                    <?php endif; ?>
                    <?php if ($showPillar): ?>
                    <div>
                        <label class="block text-sm font-medium text-ink mb-1">Preferred Pillar</label>
                        <select name="preferred_pillar" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                            <option value="">Select Pillar</option>
                            <option value="campus_saarthi">Saarthi</option>
                            <option value="digital_saarthi">Digital Saarthi</option>
                            <option value="calling_saarthi">Calling Saarthi</option>
                            <option value="government_saarthi">Government Saarthi</option>
                            <option value="market_saarthi">Market Saarthi</option>
                        </select>
                    </div>
                    <?php endif; ?>
                    <?php if ($showNotice): ?>
                    <div>
                        <label class="block text-sm font-medium text-ink mb-1">Notice Period</label>
                        <input type="text" name="notice_period" value="<?= htmlspecialchars($_POST['notice_period'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" placeholder="e.g. Immediate, 15 days, 30 days" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink mb-1">CTC Expectation</label>
                        <input type="text" name="ctc_expectation" value="<?= htmlspecialchars($_POST['ctc_expectation'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" placeholder="e.g. 3-5 LPA" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                    <?php endif; ?>
                    <?php if ($showHours): ?>
                    <div>
                        <label class="block text-sm font-medium text-ink mb-1">Hours Per Week</label>
                        <input type="number" name="hours_per_week" value="<?= htmlspecialchars($_POST['hours_per_week'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" placeholder="e.g. 20" min="1" max="40" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink mb-1">Availability</label>
                        <input type="text" name="availability" value="<?= htmlspecialchars($_POST['availability'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" placeholder="e.g. Morning, Evening, Flexible" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                    <?php endif; ?>
                    <div class="sm:col-span-2">
                        <label class="block text-sm font-medium text-ink mb-1">Skills</label>
                        <input type="text" name="skills" value="<?= htmlspecialchars($_POST['skills'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" placeholder="e.g. PHP, JavaScript, Marketing, Communication" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        <p class="text-xs text-ink-muted opacity-80 mt-1">Separate with commas</p>
                    </div>
                    <?php if ($showPortfolio): ?>
                    <div class="sm:col-span-2">
                        <label class="block text-sm font-medium text-ink mb-1">Portfolio / Sample Work URL</label>
                        <input type="url" name="portfolio_url" value="<?= htmlspecialchars($_POST['portfolio_url'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" placeholder="https://your-portfolio.com" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                    <?php endif; ?>

                    <!-- Teaching Expert Fields -->
                    <?php if ($showTeachingExpert): ?>
                    <div class="sm:col-span-2 border-t border-hairline pt-4 mt-2" id="teaching-expert-fields">
                        <h3 class="text-sm font-semibold text-ink font-semibold mb-4"><i class="fas fa-chalkboard-teacher mr-1 text-primary-500"></i> Teaching Expert Details</h3>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink mb-1">Qualification <span class="text-red-400">*</span></label>
                        <select name="te_qualification" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                            <option value="">Select Qualification</option>
                            <option value="Masters"<?= ($_POST['te_qualification'] ?? '') === 'Masters' ? ' selected' : '' ?>>Masters</option>
                            <option value="PhD"<?= ($_POST['te_qualification'] ?? '') === 'PhD' ? ' selected' : '' ?>>PhD</option>
                            <option value="CA"<?= ($_POST['te_qualification'] ?? '') === 'CA' ? ' selected' : '' ?>>CA</option>
                            <option value="CFA"<?= ($_POST['te_qualification'] ?? '') === 'CFA' ? ' selected' : '' ?>>CFA</option>
                            <option value="Professional Certification"<?= ($_POST['te_qualification'] ?? '') === 'Professional Certification' ? ' selected' : '' ?>>Professional Certification</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink mb-1">Years of Experience <span class="text-red-400">*</span></label>
                        <input type="number" name="te_years_experience" value="<?= htmlspecialchars($_POST['te_years_experience'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" required min="5" placeholder="Minimum 5 years" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                    <div class="sm:col-span-2">
                        <label class="block text-sm font-medium text-ink mb-1">Specialization / Domains <span class="text-red-400">*</span></label>
                        <textarea name="te_specialization" rows="3" required placeholder="e.g. Financial Accounting, Data Science, Marketing Strategy..." class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y"><?= htmlspecialchars($_POST['te_specialization'] ?? '', ENT_QUOTES, 'UTF-8', false) ?></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink mb-1">Demo Video URL</label>
                        <input type="url" name="te_demo_video_url" value="<?= htmlspecialchars($_POST['te_demo_video_url'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" placeholder="https://youtube.com/watch?v=..." class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        <p class="text-xs text-ink-muted opacity-80 mt-1">Optional — YouTube, Vimeo, or Google Drive link</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink mb-1">LinkedIn Profile URL</label>
                        <input type="url" name="te_linkedin_url" value="<?= htmlspecialchars($_POST['te_linkedin_url'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" placeholder="https://linkedin.com/in/yourprofile" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                    <div class="sm:col-span-2">
                        <label class="block text-sm font-medium text-ink mb-2">Teaching Mode Preference</label>
                        <div class="flex flex-wrap gap-4">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="te_teaching_mode[]" value="Live Online" <?= in_array('Live Online', $_POST['te_teaching_mode'] ?? []) ? 'checked' : '' ?> class="w-4 h-4 rounded border-hairline bg-surface-2 text-ink text-primary-600 focus:ring-primary-500">
                                <span class="text-sm text-ink">Live Online</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="te_teaching_mode[]" value="Recorded Sessions" <?= in_array('Recorded Sessions', $_POST['te_teaching_mode'] ?? []) ? 'checked' : '' ?> class="w-4 h-4 rounded border-hairline bg-surface-2 text-ink text-primary-600 focus:ring-primary-500">
                                <span class="text-sm text-ink">Recorded Sessions</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="te_teaching_mode[]" value="Flexible" <?= in_array('Flexible', $_POST['te_teaching_mode'] ?? []) ? 'checked' : '' ?> class="w-4 h-4 rounded border-hairline bg-surface-2 text-ink text-primary-600 focus:ring-primary-500">
                                <span class="text-sm text-ink">Flexible</span>
                            </label>
                        </div>
                    </div>
                    <?php endif; ?>
                </div>
                <div class="mt-6 flex justify-between">
                    <button type="button" onclick="goToStep(1)" class="text-ink-muted hover:text-ink text-sm"><i class="fas fa-arrow-left mr-1"></i> Back</button>
                    <button type="button" onclick="goToStep(3)" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">Next: Questions <i class="fas fa-arrow-right ml-2"></i></button>
                </div>
            </div>
        </div>

        <!-- STEP 3: Work Samples & Questionnaire -->
        <div class="step-panel hidden" id="step-3">
            <div class="bg-surface-1 rounded-xl border border-hairline shadow-none p-6 mb-6">
                <h2 class="text-base font-semibold text-ink font-bold mb-5"><i class="fas fa-tasks mr-2 text-primary-500"></i>Step 3: Work Samples & Questionnaire</h2>
                
                <div class="mb-8">
                    <h3 class="text-sm font-semibold text-ink font-semibold mb-3 border-b border-hairline-soft pb-2">Provide 3-5 Work Samples (URLs)</h3>
                    <p class="text-xs text-ink-muted mb-4">Please provide links to your best original work (Google Drive, GitHub, Portfolio, etc.). Make sure links are public.</p>
                    <div class="space-y-3">
                        <input type="url" name="work_sample_1" placeholder="Work Sample 1 URL (Required)" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" required>
                        <input type="url" name="work_sample_2" placeholder="Work Sample 2 URL (Required)" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" required>
                        <input type="url" name="work_sample_3" placeholder="Work Sample 3 URL (Required)" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" required>
                        <input type="url" name="work_sample_4" placeholder="Work Sample 4 URL (Optional)" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        <input type="url" name="work_sample_5" placeholder="Work Sample 5 URL (Optional)" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                </div>

                <div>
                    <h3 class="text-sm font-semibold text-ink font-semibold mb-3 border-b border-hairline-soft pb-2">Written Application</h3>
                    <p class="text-xs text-ink-muted mb-4">Please answer all questions in detail. Your honest answers help us understand you better.</p>
                    
                    <div class="space-y-5">
                        <?php 
                        // Define role-specific questions
                        $questions = [];
                        if (in_array($jobCategory, ['vendor', 'freelancer'])) {
                            $questions = [
                                "How many projects have you completed so far? And what is your total experience in years?",
                                "What is your minimum and maximum charge? Do you charge per page, per project, or hourly?",
                                "Can you create projects according to both student guidelines and company guidelines? And are you ready to do unlimited corrections?",
                                "If a student wants to understand how their project was made, can you explain it to them? Can you provide teaching sessions?",
                                "Can we show your sample work to our potential clients (removing personal details)?"
                            ];
                        } elseif (in_array($jobCategory, ['employee', 'intern', 'part_time', 'pillar_post'])) {
                            $questions = [
                                "What is your total experience in years and your core areas of expertise?",
                                "What are your salary/stipend expectations?",
                                "How do you handle constructive feedback and revisions on your work?",
                                "How do you manage your time and prioritize tasks when working on multiple projects?",
                                "Why do you want to join Karya Saarthi and what value will you bring to the team?"
                            ];
                        } elseif ($jobCategory === 'campus_saarthi') {
                            $questions = [
                                "What is your current college/university and course of study?",
                                "How extensive is your student network and how do you plan to promote Karya Saarthi?",
                                "Have you organized or led any events, campaigns, or clubs in your college?",
                                "How many hours per week can you dedicate to this role?",
                                "Why do you want to become a Saarthi and what are your expectations?"
                            ];
                        } elseif ($jobCategory === 'teaching_expert') {
                            $questions = [
                                "What are your core subjects and total years of teaching experience?",
                                "What is your expected remuneration (per hour or per session)?",
                                "How do you adapt your teaching style for students who are struggling to understand a concept?",
                                "Are you comfortable taking live online sessions and providing recorded lectures?",
                                "Can we share your demo sessions with potential students (removing personal details)?"
                            ];
                        } else {
                            $questions = [
                                "What is your total experience in years and your core areas of expertise?",
                                "What are your salary/stipend expectations?",
                                "How do you handle feedback and revisions on your work?",
                                "How do you manage your time and prioritize tasks?",
                                "Why do you want to join Karya Saarthi?"
                            ];
                        }
                        
                        for ($i = 1; $i <= 5; $i++):
                        ?>
                        <div>
                            <label class="block text-sm font-medium text-ink mb-2">Q<?= $i ?>: <?= htmlspecialchars($questions[$i-1], ENT_QUOTES, 'UTF-8', false) ?> <span class="text-red-400">*</span></label>
                            <textarea name="qa_<?= $i ?>" rows="3" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y" placeholder="Your answer..."><?= htmlspecialchars($_POST['qa_'.$i] ?? '', ENT_QUOTES, 'UTF-8', false) ?></textarea>
                        </div>
                        <?php endfor; ?>
                    </div>
                </div>
                
                <div class="mt-6 flex justify-between">
                    <button type="button" onclick="goToStep(2)" class="text-ink-muted hover:text-ink text-sm"><i class="fas fa-arrow-left mr-1"></i> Back</button>
                    <button type="button" onclick="goToStep(4)" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">Next: Submit <i class="fas fa-arrow-right ml-2"></i></button>
                </div>
            </div>
        </div>

        <!-- STEP 4: Resume Upload & Submit -->
        <div class="step-panel hidden" id="step-4">
            <div class="bg-surface-1 rounded-xl border border-hairline shadow-none p-6 mb-6">
                <h2 class="text-base font-semibold text-ink font-bold mb-5"><i class="fas fa-file-upload mr-2 text-primary-500"></i>Step 3: Resume & Cover Letter</h2>
                <div class="border-2 border-dashed border-hairline bg-surface-2 text-ink rounded-xl p-8 text-center hover:border-primary-400 transition mb-5" id="drop-zone">
                    <input type="file" name="resume" id="resume-input" accept=".pdf,.doc,.docx" required class="hidden" onchange="showFileName(this)">
                    <div id="upload-placeholder">
                        <i class="fas fa-cloud-upload-alt text-4xl text-ink-muted opacity-50 mb-3"></i>
                        <p class="text-ink-muted font-medium mb-1">Upload your Resume <span class="text-red-400">*</span></p>
                        <p class="text-xs text-ink-muted opacity-80 mb-4">PDF, DOC, or DOCX (Max 5MB)</p>
                        <button type="button" onclick="document.getElementById('resume-input').click()" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
                            <i class="fas fa-paperclip mr-1"></i> Choose File
                        </button>
                    </div>
                    <div id="file-selected" class="hidden">
                        <i class="fas fa-file-pdf text-4xl text-red-400 mb-3"></i>
                        <p class="text-ink font-bold font-medium" id="file-name"></p>
                        <p class="text-xs text-ink-muted opacity-80" id="file-size"></p>
                        <button type="button" onclick="clearFile()" class="mt-3 text-red-400 hover:text-red-700 text-sm font-medium"><i class="fas fa-times mr-1"></i> Remove</button>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-ink mb-1">Why should we hire you?</label>
                    <textarea name="cover_letter" rows="4" placeholder="Tell us briefly about yourself and why you're interested in this role..." class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y"><?= htmlspecialchars($_POST['cover_letter'] ?? '', ENT_QUOTES, 'UTF-8', false) ?></textarea>
                </div>
            </div>
            <div class="flex items-center justify-between pt-2 pb-8">
                <button type="button" onclick="goToStep(2)" class="text-ink-muted hover:text-ink text-sm"><i class="fas fa-arrow-left mr-1"></i> Back</button>
                <button type="submit" class="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg text-sm font-semibold transition shadow-none">
                    <i class="fas fa-paper-plane mr-2"></i> Submit Application
                </button>
            </div>
        </div>
    </form>
</section>

<script>
let currentStep = 1;

function validateStep(stepIndex) {
    const stepPanel = document.getElementById('step-' + stepIndex);
    if (!stepPanel) return true;
    
    let isValid = true;
    // Clear old errors
    stepPanel.querySelectorAll('.error-msg').forEach(el => el.remove());
    stepPanel.querySelectorAll('.border-red-500').forEach(el => {
        el.classList.remove('border-red-500');
        el.classList.add('border-hairline');
    });
    
    // Check all inputs
    const inputs = stepPanel.querySelectorAll('input:not([type="hidden"]), select, textarea');
    inputs.forEach(input => {
        if (!input.checkValidity()) {
            isValid = false;
            input.classList.remove('border-hairline');
            input.classList.add('border-red-500');
            
            const errorMsg = document.createElement('p');
            errorMsg.className = 'error-msg text-red-500 text-xs mt-1 font-bold';
            errorMsg.textContent = input.validationMessage || 'This field is required or invalid.';
            input.parentNode.appendChild(errorMsg);
        }
    });
    
    return isValid;
}

function goToStep(step) {
    // Validate current step before proceeding forward
    if (step > currentStep) {
        if (!validateStep(currentStep)) {
            return;
        }
    }

    // Hide all steps
    document.querySelectorAll('.step-panel').forEach(p => p.classList.add('hidden'));
    // Show target step
    document.getElementById('step-' + step).classList.remove('hidden');

    // Update indicators
    for (let i = 1; i <= 4; i++) {
        const circle = document.getElementById('step-circle-' + i);
        const label = document.getElementById('step-label-' + i);
        if (circle) {
            if (i <= step) {
                circle.className = 'w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold step-circle';
                if (label) label.className = 'text-sm font-medium text-primary-600 hidden sm:inline';
            } else {
                circle.className = 'w-8 h-8 rounded-full bg-surface-2 text-ink-muted flex items-center justify-center text-sm font-bold step-circle';
                if (label) label.className = 'text-sm font-medium text-ink-muted opacity-80 hidden sm:inline';
            }
        }
    }

    // Progress bars
    if (document.getElementById('progress-1')) document.getElementById('progress-1').style.width = step >= 2 ? '100%' : '0%';
    if (document.getElementById('progress-2')) document.getElementById('progress-2').style.width = step >= 3 ? '100%' : '0%';
    if (document.getElementById('progress-3')) document.getElementById('progress-3').style.width = step >= 4 ? '100%' : '0%';

    currentStep = step;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showFileName(input) {
    if (input.files.length > 0) {
        const file = input.files[0];
        document.getElementById('file-name').textContent = file.name;
        document.getElementById('file-size').textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB';
        document.getElementById('upload-placeholder').classList.add('hidden');
        document.getElementById('file-selected').classList.remove('hidden');
        const icon = document.querySelector('#file-selected .fas');
        icon.className = file.name.endsWith('.pdf') ? 'fas fa-file-pdf text-4xl text-red-400 mb-3' : 'fas fa-file-word text-4xl text-blue-500 mb-3';
    }
}

function clearFile() {
    document.getElementById('resume-input').value = '';
    document.getElementById('upload-placeholder').classList.remove('hidden');
    document.getElementById('file-selected').classList.add('hidden');
}

// Drag & drop
const dropZone = document.getElementById('drop-zone');
if (dropZone) {
    ['dragenter','dragover'].forEach(e => dropZone.addEventListener(e, ev => { ev.preventDefault(); dropZone.classList.add('border-primary-500','bg-primary-50'); }));
    ['dragleave','drop'].forEach(e => dropZone.addEventListener(e, ev => { ev.preventDefault(); dropZone.classList.remove('border-primary-500','bg-primary-50'); }));
    dropZone.addEventListener('drop', ev => {
        const input = document.getElementById('resume-input');
        input.files = ev.dataTransfer.files;
        showFileName(input);
    });
}

// Intercept form submission to validate all steps
document.querySelector('form').addEventListener('submit', function(e) {
    let isValid = true;
    for (let i = 1; i <= 4; i++) {
        if (!validateStep(i)) {
            isValid = false;
            goToStep(i); // Navigate to the step with the error
            break;
        }
    }
    if (!isValid) {
        e.preventDefault();
    }
});
</script>
<?php endif; ?>
<?php require_once __DIR__ . '/includes/footer.php'; ?>





