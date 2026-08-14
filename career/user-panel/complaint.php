<?php
$pageTitle = 'Secret Complaint Box';
require_once __DIR__ . '/../config/auth.php';
requireLogin();

$pdo = getDBConnection();

// Auto-create complaints table if not exists (NO user_id for anonymity)
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS complaints (
        complaint_id INT AUTO_INCREMENT PRIMARY KEY,
        category ENUM('workplace','harassment','policy','management','other') NOT NULL DEFAULT 'other',
        subject VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status ENUM('pending','under_review','resolved','dismissed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
} catch (Exception $e) {
    error_log("Complaints table creation: " . $e->getMessage());
}

// Handle form submission
$successMsg = '';
$errorMsg = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $category = sanitize($_POST['category'] ?? 'other');
    $subject = sanitize($_POST['subject'] ?? '');
    $description = sanitize($_POST['description'] ?? '');

    $validCategories = ['workplace', 'harassment', 'policy', 'management', 'other'];
    if (!in_array($category, $validCategories)) {
        $category = 'other';
    }

    if (empty($subject) || empty($description)) {
        $errorMsg = 'Please fill in both the subject and description fields.';
    } else {
        try {
            // INSERT with NO user identifying info, NO IP logging
            $stmt = $pdo->prepare("INSERT INTO complaints (category, subject, description, status) VALUES (?, ?, ?, 'pending')");
            $stmt->execute([$category, $subject, $description]);
            $successMsg = 'Your complaint has been submitted anonymously. HR will review within 7 working days.';
        } catch (Exception $e) {
            error_log("Complaint submission error: " . $e->getMessage());
            $errorMsg = 'Something went wrong. Please try again.';
        }
    }
}

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex min-h-[calc(100vh-56px)]">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 dashboard-content-area p-6">

        <div class="max-w-3xl mx-auto">
            <div class="mb-6">
                <h1 class="text-2xl font-bold text-ink"><i class="fas fa-shield-alt mr-2 text-primary-600"></i>Secret Complaint Box</h1>
                <p class="text-ink-muted mt-1">Your voice matters. Share your concerns safely and anonymously.</p>
            </div>

            <!-- Anonymity Guarantee Banner -->
            <div class="mb-6 bg-green-500/10 border border-green-200 rounded-2xl p-5 animate-on-scroll">
                <div class="flex items-start">
                    <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                        <i class="fas fa-user-shield text-green-600 text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-sm font-bold text-green-800">100% Anonymous & Confidential</h3>
                        <p class="text-sm text-green-700 mt-1">Your identity is 100% anonymous. No IP address or user information is logged. The complaint is stored without any link to your account. Only the HR team can view submitted complaints.</p>
                    </div>
                </div>
            </div>

            <!-- Success / Error Messages -->
            <?php if ($successMsg): ?>
                <div class="mb-6 bg-green-500/10 border border-green-200 rounded-xl p-4 animate-on-scroll">
                    <div class="flex items-center">
                        <i class="fas fa-check-circle text-green-400 mr-3 text-xl"></i>
                        <div>
                            <p class="text-sm font-bold text-green-800"><?= $successMsg ?></p>
                            <p class="text-xs text-green-600 mt-1">Thank you for helping us improve. Your feedback is valued.</p>
                        </div>
                    </div>
                </div>
            <?php endif; ?>
            <?php if ($errorMsg): ?>
                <div class="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-on-scroll">
                    <div class="flex items-center">
                        <i class="fas fa-exclamation-circle text-red-400 mr-3"></i>
                        <p class="text-sm font-medium text-red-400"><?= $errorMsg ?></p>
                    </div>
                </div>
            <?php endif; ?>

            <!-- Complaint Form -->
            <form method="POST" class="bg-surface-1 rounded-xl shadow-none border border-hairline mb-6 animate-on-scroll">
                <div class="p-5 border-b border-hairline">
                    <h2 class="text-lg font-semibold text-ink"><i class="fas fa-pen-alt mr-2 text-primary-600"></i>Submit a Complaint</h2>
                    <p class="text-xs text-ink-muted mt-1">All fields below are stored without any connection to your identity.</p>
                </div>
                <div class="p-5 space-y-5">
                    <!-- Category -->
                    <div>
                        <label class="block text-sm font-medium text-ink-muted mb-1">Category <span class="text-red-400">*</span></label>
                        <select name="category" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-surface-1" required>
                            <option value="">-- Select Category --</option>
                            <option value="workplace">Workplace Issue</option>
                            <option value="harassment">Harassment</option>
                            <option value="policy">Policy Concern</option>
                            <option value="management">Management Issue</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <!-- Subject -->
                    <div>
                        <label class="block text-sm font-medium text-ink-muted mb-1">Subject <span class="text-red-400">*</span></label>
                        <input type="text" name="subject" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="Brief subject of your complaint" maxlength="255" required>
                    </div>

                    <!-- Description -->
                    <div>
                        <label class="block text-sm font-medium text-ink-muted mb-1">Detailed Description <span class="text-red-400">*</span></label>
                        <textarea name="description" rows="6" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="Please describe the issue in detail. Include dates, locations, and any relevant context. The more detail you provide, the better HR can investigate." required></textarea>
                    </div>

                    <div class="pt-2">
                        <button type="submit" class="w-full sm:w-auto px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-none transition">
                            <i class="fas fa-paper-plane mr-2"></i> Submit Anonymously
                        </button>
                    </div>
                </div>
            </form>

            <!-- FAQ Section -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline animate-on-scroll">
                <div class="p-5 border-b border-hairline">
                    <h2 class="text-lg font-semibold text-ink"><i class="fas fa-question-circle mr-2 text-amber-500"></i>Frequently Asked Questions</h2>
                </div>
                <div class="divide-y divide-hairline">
                    <div class="p-5">
                        <h3 class="text-sm font-semibold text-ink">Is my complaint truly anonymous?</h3>
                        <p class="text-sm text-ink-muted mt-1">Yes. We do not store your user ID, IP address, browser information, or any other identifying data with the complaint. The complaint record contains only the category, subject, description, and timestamp.</p>
                    </div>
                    <div class="p-5">
                        <h3 class="text-sm font-semibold text-ink">How long does it take for HR to review?</h3>
                        <p class="text-sm text-ink-muted mt-1">HR reviews all complaints within 7 working days. Critical complaints (such as harassment) are prioritized and may be addressed sooner.</p>
                    </div>
                    <div class="p-5">
                        <h3 class="text-sm font-semibold text-ink">Can I track the status of my complaint?</h3>
                        <p class="text-sm text-ink-muted mt-1">Since complaints are fully anonymous, individual tracking is not available. However, if your complaint leads to a policy change or action, it will be communicated to all employees.</p>
                    </div>
                    <div class="p-5">
                        <h3 class="text-sm font-semibold text-ink">What kind of issues can I report?</h3>
                        <p class="text-sm text-ink-muted mt-1">You can report workplace issues, harassment, policy concerns, management problems, or any other issue that affects your work experience. Both serious and minor concerns are welcome.</p>
                    </div>
                    <div class="p-5">
                        <h3 class="text-sm font-semibold text-ink">Will there be retaliation?</h3>
                        <p class="text-sm text-ink-muted mt-1">Absolutely not. Karya Saarthi has a strict zero-retaliation policy. Since complaints are anonymous, nobody can identify or target you. We encourage honest feedback.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>






