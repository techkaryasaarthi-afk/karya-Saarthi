<?php
$pageTitle = 'Offer Letter Generator';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireAdmin();
$pdo = getDBConnection();
$message = '';
$messageType = '';

// Auto-create offer_letters table
$pdo->exec("CREATE TABLE IF NOT EXISTS offer_letters (
    letter_id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_name VARCHAR(200) NOT NULL,
    email VARCHAR(200),
    phone VARCHAR(20),
    designation VARCHAR(200) NOT NULL,
    department VARCHAR(100),
    ctc VARCHAR(100),
    joining_date DATE,
    reporting_manager VARCHAR(200),
    work_location VARCHAR(200),
    probation_period VARCHAR(50) DEFAULT '3 months',
    letter_html LONGTEXT,
    status ENUM('draft','sent','accepted','rejected') DEFAULT 'draft',
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// Handle POST actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    try {
        switch ($action) {
            case 'generate_letter':
                $candidateName = sanitize($_POST['candidate_name'] ?? '');
                $email = sanitize($_POST['email'] ?? '');
                $phone = sanitize($_POST['phone'] ?? '');
                $designation = sanitize($_POST['designation'] ?? '');
                $department = sanitize($_POST['department'] ?? '');
                $ctc = sanitize($_POST['ctc'] ?? '');
                $joiningDate = $_POST['joining_date'] ?? '';
                $reportingManager = sanitize($_POST['reporting_manager'] ?? '');
                $workLocation = sanitize($_POST['work_location'] ?? '');
                $probationPeriod = sanitize($_POST['probation_period'] ?? '3 months');

                if (empty($candidateName) || empty($designation)) {
                    $message = 'Candidate name and designation are required.';
                    $messageType = 'error';
                } else {
                    $letterHtml = generateOfferLetterHTML($candidateName, $email, $phone, $designation, $department, $ctc, $joiningDate, $reportingManager, $workLocation, $probationPeriod);

                    $stmt = $pdo->prepare("INSERT INTO offer_letters (candidate_name, email, phone, designation, department, ctc, joining_date, reporting_manager, work_location, probation_period, letter_html, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([$candidateName, $email, $phone, $designation, $department, $ctc, $joiningDate ?: null, $reportingManager, $workLocation, $probationPeriod, $letterHtml, $_SESSION['user_id']]);
                    $message = "Offer letter for \"$candidateName\" generated successfully!";
                    $messageType = 'success';
                    logActivity($_SESSION['user_id'], 'offer_letter_generated', "Generated offer letter for $candidateName - $designation");
                }
                break;

            case 'update_status':
                $letterId = intval($_POST['letter_id'] ?? 0);
                $status = $_POST['status'] ?? 'draft';
                $validStatuses = ['draft', 'sent', 'accepted', 'rejected'];
                if ($letterId && in_array($status, $validStatuses)) {
                    $pdo->prepare("UPDATE offer_letters SET status = ? WHERE letter_id = ?")->execute([$status, $letterId]);
                    $message = "Letter #$letterId status updated to \"$status\"!";
                    $messageType = 'success';
                }
                break;

            case 'delete_letter':
                $letterId = intval($_POST['letter_id'] ?? 0);
                if ($letterId) {
                    $stmt = $pdo->prepare("SELECT candidate_name FROM offer_letters WHERE letter_id = ?");
                    $stmt->execute([$letterId]);
                    $letter = $stmt->fetch();
                    $pdo->prepare("DELETE FROM offer_letters WHERE letter_id = ?")->execute([$letterId]);
                    $message = 'Offer letter for "' . htmlspecialchars($letter['candidate_name'] ?? '', ENT_QUOTES, 'UTF-8', false) . '" deleted!';
                    $messageType = 'success';
                    logActivity($_SESSION['user_id'], 'offer_letter_deleted', "Deleted offer letter #$letterId");
                }
                break;
        }
    } catch (Exception $e) {
        $message = 'Error: ' . $e->getMessage();
        $messageType = 'error';
    }
}

// Fetch all offer letters
$letters = $pdo->query("SELECT * FROM offer_letters ORDER BY created_at DESC")->fetchAll();

// View a specific letter
$viewLetter = null;
if (isset($_GET['view'])) {
    $stmt = $pdo->prepare("SELECT * FROM offer_letters WHERE letter_id = ?");
    $stmt->execute([intval($_GET['view'])]);
    $viewLetter = $stmt->fetch();
}

function generateOfferLetterHTML($name, $email, $phone, $designation, $department, $ctc, $joiningDate, $reportingManager, $workLocation, $probationPeriod) {
    $date = date('d F Y');
    $joiningFormatted = $joiningDate ? date('d F Y', strtotime($joiningDate)) : '________';

    return '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Offer Letter - ' . htmlspecialchars($name, ENT_QUOTES, 'UTF-8', false) . '</title>
<style>
    @page { margin: 40px 50px; }
    body { font-family: "Segoe UI", Arial, sans-serif; background-color: #ffffff; color: #1a1a1a; line-height: 1.7; font-size: 14px; margin: 0; padding: 40px; }
    .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #2563eb; font-size: 28px; margin: 0; letter-spacing: 1px; }
    .header p { color: #666; font-size: 12px; margin: 5px 0 0; }
    .ref { font-size: 12px; color: #888; margin-bottom: 20px; }
    .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .details-table th, .details-table td { border: 1px solid #ddd; padding: 10px 14px; text-align: left; font-size: 13px; }
    .details-table th { background: #f0f5ff; color: #1e40af; font-weight: 600; width: 35%; }
    .details-table td { color: #333; }
    .section-title { color: #2563eb; font-size: 15px; font-weight: 600; margin-top: 25px; margin-bottom: 10px; border-left: 4px solid #2563eb; padding-left: 10px; }
    .terms li { margin-bottom: 8px; font-size: 13px; }
    .signature-block { margin-top: 50px; display: flex; justify-content: space-between; }
    .sig-box { width: 45%; }
    .sig-line { border-top: 1px solid #333; margin-top: 60px; padding-top: 5px; font-size: 13px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 15px; border-top: 2px solid #2563eb; font-size: 11px; color: #888; }
    .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 80px; color: rgba(37,99,235,0.04); font-weight: bold; z-index: -1; }
</style>
</head>
<body>
<div class="watermark">KARYA SAARTHI</div>

<div class="header">
    <h1>KARYA SAARTHI</h1>
    <p>Hum Hai Aapke Saarthi | www.karyasaarthi.com | hr@karyasaarthi.com</p>
</div>

<div class="ref">
    <strong>Date:</strong> ' . $date . '<br>
    <strong>Ref:</strong> KS/OL/' . date('Y') . '/' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT) . '
</div>

<p><strong>To,</strong><br>
<strong>' . htmlspecialchars($name, ENT_QUOTES, 'UTF-8', false) . '</strong><br>
' . ($email ? htmlspecialchars($email, ENT_QUOTES, 'UTF-8', false) . '<br>' : '') . '
' . ($phone ? htmlspecialchars($phone, ENT_QUOTES, 'UTF-8', false) : '') . '</p>

<p><strong>Subject: Offer of Employment</strong></p>

<p>Dear <strong>' . htmlspecialchars($name, ENT_QUOTES, 'UTF-8', false) . '</strong>,</p>

<p>We are pleased to inform you that you have been selected for the position of <strong>' . htmlspecialchars($designation, ENT_QUOTES, 'UTF-8', false) . '</strong> at <strong>Karya Saarthi</strong>. We were impressed with your skills and experience, and we believe you will be a valuable addition to our team.</p>

<p class="section-title">Offer Details</p>

<table class="details-table">
    <tr><th>Candidate Name</th><td>' . htmlspecialchars($name, ENT_QUOTES, 'UTF-8', false) . '</td></tr>
    <tr><th>Designation</th><td>' . htmlspecialchars($designation, ENT_QUOTES, 'UTF-8', false) . '</td></tr>
    ' . ($department ? '<tr><th>Department</th><td>' . htmlspecialchars($department, ENT_QUOTES, 'UTF-8', false) . '</td></tr>' : '') . '
    ' . ($ctc ? '<tr><th>CTC / Stipend</th><td>' . htmlspecialchars($ctc, ENT_QUOTES, 'UTF-8', false) . '</td></tr>' : '') . '
    <tr><th>Date of Joining</th><td>' . $joiningFormatted . '</td></tr>
    ' . ($reportingManager ? '<tr><th>Reporting Manager</th><td>' . htmlspecialchars($reportingManager, ENT_QUOTES, 'UTF-8', false) . '</td></tr>' : '') . '
    ' . ($workLocation ? '<tr><th>Work Location</th><td>' . htmlspecialchars($workLocation, ENT_QUOTES, 'UTF-8', false) . '</td></tr>' : '') . '
    <tr><th>Probation Period</th><td>' . htmlspecialchars($probationPeriod, ENT_QUOTES, 'UTF-8', false) . '</td></tr>
</table>

<p class="section-title">Terms & Conditions</p>
<ol class="terms">
    <li>This offer is valid for 7 days from the date of issuance. Please confirm your acceptance within this period.</li>
    <li>You will be on probation for <strong>' . htmlspecialchars($probationPeriod, ENT_QUOTES, 'UTF-8', false) . '</strong> from the date of joining. Your performance will be reviewed during this period.</li>
    <li>You are expected to maintain the highest standards of professional conduct and integrity during your employment.</li>
    <li>All company policies, rules, and regulations as communicated from time to time shall be applicable to you.</li>
    <li>You shall not disclose any confidential information of the company to any third party during or after your employment.</li>
    <li>Either party may terminate this engagement by providing a notice period of 15 days during probation or 30 days after confirmation.</li>
    <li>This offer is contingent upon successful verification of your credentials and documents.</li>
</ol>

<p>We look forward to welcoming you to the Karya Saarthi family. Please sign and return a copy of this letter to confirm your acceptance.</p>

<p><strong>Congratulations and welcome aboard!</strong></p>

<div class="signature-block">
    <div class="sig-box">
        <div class="sig-line">
            <strong>For Karya Saarthi</strong><br>
            HR Department<br>
            Authorized Signatory
        </div>
    </div>
    <div class="sig-box">
        <div class="sig-line">
            <strong>' . htmlspecialchars($name, ENT_QUOTES, 'UTF-8', false) . '</strong><br>
            Candidate Acceptance<br>
            Date: ________________
        </div>
    </div>
</div>

<div class="footer">
    <p>Karya Saarthi | Hum Hai Aapke Saarthi | www.karyasaarthi.com | hr@karyasaarthi.com<br>
    This is a system-generated offer letter. For queries, contact HR at hr@karyasaarthi.com</p>
</div>

</body>
</html>';
}

require_once __DIR__ . '/../includes/header.php';

$statusColors = [
    'draft' => 'bg-surface-2 text-ink-muted',
    'sent' => 'bg-blue-100 text-blue-800',
    'accepted' => 'bg-green-100 text-green-800',
    'rejected' => 'bg-red-100 text-red-400',
];
$statusIcons = [
    'draft' => 'fa-file',
    'sent' => 'fa-paper-plane',
    'accepted' => 'fa-check-circle',
    'rejected' => 'fa-times-circle',
];
?>

<div class="flex min-h-[calc(100vh-56px)] bg-surface-2">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 dashboard-content-area">
        <div class="p-4 sm:p-6 lg:p-8">

            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-ink"><i class="fas fa-file-signature text-primary-500 mr-2"></i>Offer Letter Generator</h1>
                    <p class="text-sm text-ink-muted mt-1">Generate professional offer letters with Karya Saarthi branding.</p>
                </div>
                <div class="mt-3 sm:mt-0">
                    <span class="text-sm text-ink-muted"><?= count($letters) ?> letters generated</span>
                </div>
            </div>

            <?php if ($message): ?>
            <div class="mb-6 p-4 rounded-xl border <?= $messageType === 'success' ? 'bg-green-500/10 border-green-200 text-green-800' : 'bg-red-500/10 border-red-500/20 text-red-400' ?>">
                <i class="fas <?= $messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle' ?> mr-2"></i>
                <?= $message ?>
            </div>
            <?php endif; ?>

            <?php if ($viewLetter): ?>
            <!-- View Letter Mode -->
            <div class="mb-6">
                <div class="flex items-center justify-between mb-4">
                    <a href="<?= BASE_PATH ?>/admin/offer-letter.php" class="text-primary-600 hover:text-primary-800 text-sm font-medium">
                        <i class="fas fa-arrow-left mr-1"></i>Back to list
                    </a>
                    <button onclick="printLetter()" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                        <i class="fas fa-download mr-1"></i>Download PDF
                    </button>
                </div>
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-1">
                    <iframe id="letterFrame" srcdoc="<?= htmlspecialchars($viewLetter['letter_html'], ENT_QUOTES, 'UTF-8', false) ?>" class="w-full border-0 rounded-lg" style="min-height: 900px;"></iframe>
                </div>
            </div>
            <script>
            function printLetter() {
                const frame = document.getElementById('letterFrame');
                frame.contentWindow.focus();
                frame.contentWindow.print();
            }
            </script>
            <?php else: ?>

            <!-- Generate Form -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6 mb-6">
                <h2 class="text-lg font-semibold text-ink mb-4">
                    <i class="fas fa-plus-circle mr-2 text-primary-500"></i>Generate New Offer Letter
                </h2>
                <form method="POST" id="offerForm">
                    <input type="hidden" name="action" value="generate_letter">

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Candidate Name *</label>
                            <input type="text" name="candidate_name" required placeholder="e.g. Rahul Sharma" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Email</label>
                            <input type="email" name="email" placeholder="candidate@email.com" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Phone</label>
                            <input type="text" name="phone" placeholder="+91 98765 43210" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Role / Designation *</label>
                            <input type="text" name="designation" required placeholder="e.g. Marketing Intern" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Department</label>
                            <input type="text" name="department" placeholder="e.g. Marketing" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">CTC / Stipend</label>
                            <input type="text" name="ctc" placeholder="e.g. Rs. 5,000/month" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Joining Date</label>
                            <input type="date" name="joining_date" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Reporting Manager</label>
                            <input type="text" name="reporting_manager" placeholder="e.g. Ashutosh Kumar" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Work Location</label>
                            <input type="text" name="work_location" placeholder="e.g. Remote / New Delhi" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Probation Period</label>
                            <select name="probation_period" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                <option value="1 month">1 Month</option>
                                <option value="2 months">2 Months</option>
                                <option value="3 months" selected>3 Months</option>
                                <option value="6 months">6 Months</option>
                                <option value="N/A">N/A</option>
                            </select>
                        </div>
                    </div>

                    <div class="flex items-center gap-3">
                        <button type="submit" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
                            <i class="fas fa-file-signature mr-1"></i>Generate Offer Letter
                        </button>
                        <button type="button" onclick="previewLetter()" class="border border-primary-300 text-primary-600 hover:bg-primary-50 px-6 py-2.5 rounded-lg text-sm font-medium transition">
                            <i class="fas fa-eye mr-1"></i>Preview
                        </button>
                    </div>
                </form>
            </div>

            <!-- Previous Letters -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline overflow-hidden">
                <div class="px-6 py-4 border-b border-hairline">
                    <h2 class="text-lg font-semibold text-ink"><i class="fas fa-list mr-2 text-primary-500"></i>Generated Offer Letters (<?= count($letters) ?>)</h2>
                </div>

                <?php if (empty($letters)): ?>
                <div class="p-10 text-center">
                    <i class="fas fa-file-signature text-4xl text-ink-muted opacity-50 mb-3"></i>
                    <p class="text-ink-muted">No offer letters generated yet. Use the form above to create one.</p>
                </div>
                <?php else: ?>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-surface-2 border-b border-hairline">
                            <tr>
                                <th class="px-4 py-3 text-left font-semibold text-ink-muted">#</th>
                                <th class="px-4 py-3 text-left font-semibold text-ink-muted">Candidate</th>
                                <th class="px-4 py-3 text-left font-semibold text-ink-muted">Designation</th>
                                <th class="px-4 py-3 text-left font-semibold text-ink-muted">CTC</th>
                                <th class="px-4 py-3 text-left font-semibold text-ink-muted">Joining</th>
                                <th class="px-4 py-3 text-left font-semibold text-ink-muted">Status</th>
                                <th class="px-4 py-3 text-left font-semibold text-ink-muted">Created</th>
                                <th class="px-4 py-3 text-right font-semibold text-ink-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-hairline">
                            <?php foreach ($letters as $letter): ?>
                            <tr class="hover:bg-surface-2 transition">
                                <td class="px-4 py-3 text-ink-muted font-mono text-xs"><?= $letter['letter_id'] ?></td>
                                <td class="px-4 py-3">
                                    <div class="font-medium text-ink"><?= htmlspecialchars($letter['candidate_name'], ENT_QUOTES, 'UTF-8', false) ?></div>
                                    <?php if ($letter['email']): ?>
                                    <div class="text-xs text-ink-muted"><?= htmlspecialchars($letter['email'], ENT_QUOTES, 'UTF-8', false) ?></div>
                                    <?php endif; ?>
                                </td>
                                <td class="px-4 py-3 text-ink-muted"><?= htmlspecialchars($letter['designation'], ENT_QUOTES, 'UTF-8', false) ?></td>
                                <td class="px-4 py-3 text-ink-muted"><?= htmlspecialchars($letter['ctc'] ?: '-', ENT_QUOTES, 'UTF-8', false) ?></td>
                                <td class="px-4 py-3 text-ink-muted"><?= $letter['joining_date'] ? date('d M Y', strtotime($letter['joining_date'])) : '-' ?></td>
                                <td class="px-4 py-3">
                                    <form method="POST" class="inline">
                                        <input type="hidden" name="action" value="update_status">
                                        <input type="hidden" name="letter_id" value="<?= $letter['letter_id'] ?>">
                                        <select name="status" onchange="this.form.submit()" class="text-xs font-medium rounded-full px-2.5 py-1 border-0 <?= $statusColors[$letter['status']] ?? 'bg-surface-2' ?> cursor-pointer">
                                            <option value="draft" <?= $letter['status'] === 'draft' ? 'selected' : '' ?>>Draft</option>
                                            <option value="sent" <?= $letter['status'] === 'sent' ? 'selected' : '' ?>>Sent</option>
                                            <option value="accepted" <?= $letter['status'] === 'accepted' ? 'selected' : '' ?>>Accepted</option>
                                            <option value="rejected" <?= $letter['status'] === 'rejected' ? 'selected' : '' ?>>Rejected</option>
                                        </select>
                                    </form>
                                </td>
                                <td class="px-4 py-3 text-xs text-ink-muted"><?= date('d M Y', strtotime($letter['created_at'])) ?></td>
                                <td class="px-4 py-3 text-right">
                                    <div class="flex items-center justify-end gap-1">
                                        <a href="<?= BASE_PATH ?>/admin/offer-letter.php?view=<?= $letter['letter_id'] ?>" class="text-primary-600 hover:text-primary-800 px-2 py-1 rounded-lg hover:bg-primary-50 transition" title="View & Download">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                        <form method="POST" onsubmit="return confirm('Delete this offer letter?')" class="inline">
                                            <input type="hidden" name="action" value="delete_letter">
                                            <input type="hidden" name="letter_id" value="<?= $letter['letter_id'] ?>">
                                            <button type="submit" class="text-red-600 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-500/10 transition" title="Delete">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
                <?php endif; ?>
            </div>

            <?php endif; ?>

        </div>
    </div>
</div>

<!-- Preview Modal -->
<div id="previewModal" class="fixed inset-0 z-50 hidden" onclick="if(event.target===this)closePreview()">
    <div class="absolute inset-0 bg-black/50"></div>
    <div class="relative flex items-center justify-center min-h-screen p-4">
        <div class="bg-surface-1 rounded-2xl shadow-2xl max-w-3xl w-full relative" style="max-height: 90vh;">
            <div class="flex items-center justify-between p-4 border-b border-hairline">
                <h3 class="font-semibold text-ink"><i class="fas fa-eye mr-2 text-primary-500"></i>Letter Preview</h3>
                <button onclick="closePreview()" class="text-ink-muted hover:text-ink-muted"><i class="fas fa-times text-lg"></i></button>
            </div>
            <div class="overflow-auto" style="max-height: calc(90vh - 60px);">
                <iframe id="previewFrame" class="w-full border-0" style="min-height: 800px;"></iframe>
            </div>
        </div>
    </div>
</div>

<script>
function previewLetter() {
    const form = document.getElementById('offerForm');
    const name = form.candidate_name.value || 'Candidate Name';
    const email = form.email.value || '';
    const phone = form.phone.value || '';
    const designation = form.designation.value || 'Designation';
    const department = form.department.value || '';
    const ctc = form.ctc.value || '';
    const joiningDate = form.joining_date.value ? new Date(form.joining_date.value).toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'}) : '________';
    const reportingManager = form.reporting_manager.value || '';
    const workLocation = form.work_location.value || '';
    const probation = form.probation_period.value || '3 months';
    const today = new Date().toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'});
    const ref = 'KS/OL/' + new Date().getFullYear() + '/XXXX';

    let detailsRows = `
        <tr><th>Candidate Name</th><td>${esc(name)}</td></tr>
        <tr><th>Designation</th><td>${esc(designation)}</td></tr>`;
    if (department) detailsRows += `<tr><th>Department</th><td>${esc(department)}</td></tr>`;
    if (ctc) detailsRows += `<tr><th>CTC / Stipend</th><td>${esc(ctc)}</td></tr>`;
    detailsRows += `<tr><th>Date of Joining</th><td>${joiningDate}</td></tr>`;
    if (reportingManager) detailsRows += `<tr><th>Reporting Manager</th><td>${esc(reportingManager)}</td></tr>`;
    if (workLocation) detailsRows += `<tr><th>Work Location</th><td>${esc(workLocation)}</td></tr>`;
    detailsRows += `<tr><th>Probation Period</th><td>${esc(probation)}</td></tr>`;

    const html = `<!DOCTYPE html><html><head><style>
        body{font-family:"Segoe UI",Arial,sans-serif;background-color:#ffffff;color:#1a1a1a;line-height:1.7;font-size:14px;margin:0;padding:40px}
        .header{text-align:center;border-bottom:3px solid #2563eb;padding-bottom:20px;margin-bottom:30px}
        .header h1{color:#2563eb;font-size:28px;margin:0;letter-spacing:1px}
        .header p{color:#666;font-size:12px;margin:5px 0 0}
        .ref{font-size:12px;color:#888;margin-bottom:20px}
        .details-table{width:100%;border-collapse:collapse;margin:20px 0}
        .details-table th,.details-table td{border:1px solid #ddd;padding:10px 14px;text-align:left;font-size:13px}
        .details-table th{background:#f0f5ff;color:#1e40af;font-weight:600;width:35%}
        .section-title{color:#2563eb;font-size:15px;font-weight:600;margin-top:25px;margin-bottom:10px;border-left:4px solid #2563eb;padding-left:10px}
        .terms li{margin-bottom:8px;font-size:13px}
        .footer{text-align:center;margin-top:40px;padding-top:15px;border-top:2px solid #2563eb;font-size:11px;color:#888}
    </style></head><body>
        <div class="header"><h1>KARYA SAARTHI</h1><p>Hum Hai Aapke Saarthi | www.karyasaarthi.com | hr@karyasaarthi.com</p></div>
        <div class="ref"><strong>Date:</strong> ${today}<br><strong>Ref:</strong> ${ref}</div>
        <p><strong>To,</strong><br><strong>${esc(name)}</strong><br>${email ? esc(email)+'<br>' : ''}${phone ? esc(phone) : ''}</p>
        <p><strong>Subject: Offer of Employment</strong></p>
        <p>Dear <strong>${esc(name)}</strong>,</p>
        <p>We are pleased to inform you that you have been selected for the position of <strong>${esc(designation)}</strong> at <strong>Karya Saarthi</strong>.</p>
        <p class="section-title">Offer Details</p>
        <table class="details-table">${detailsRows}</table>
        <p class="section-title">Terms & Conditions</p>
        <ol class="terms">
            <li>This offer is valid for 7 days from the date of issuance.</li>
            <li>Probation period: <strong>${esc(probation)}</strong></li>
            <li>All company policies shall be applicable to you.</li>
        </ol>
        <p><strong>Congratulations and welcome aboard!</strong></p>
        <div class="footer"><p>Karya Saarthi | www.karyasaarthi.com | hr@karyasaarthi.com</p></div>
    </body></html>`;

    const frame = document.getElementById('previewFrame');
    frame.srcdoc = html;
    document.getElementById('previewModal').classList.remove('hidden');
}

function closePreview() {
    document.getElementById('previewModal').classList.add('hidden');
}

function esc(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>







