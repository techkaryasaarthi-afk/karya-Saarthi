<?php
$pageTitle = 'Support & Help';
require_once __DIR__ . '/../config/auth.php';
requireLogin();

$pdo = getDBConnection();
$userId = $_SESSION['user_id'];
$userType = $_SESSION['user_type'];
$successMsg = '';
$errorMsg = '';

// Handle contact form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'contact_hr') {
    $subject = sanitize($_POST['subject'] ?? '');
    $message = sanitize($_POST['message'] ?? '');

    if (empty($subject) || empty($message)) {
        $errorMsg = 'Please fill in all fields.';
    } else {
        try {
            logActivity($userId, 'support_request', json_encode([
                'subject' => $subject,
                'message' => $message,
                'user_name' => $_SESSION['user_name'],
                'user_email' => $_SESSION['user_email']
            ]));
            $successMsg = 'Your message has been sent to HR. We will get back to you soon!';
        } catch (Exception $e) {
            $errorMsg = 'Failed to send message. Please try again.';
        }
    }
}

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex min-h-screen bg-surface-2">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1">
        <div class="p-4 sm:p-6 lg:p-8">
            <!-- Page Header -->
            <div class="mb-6">
                <h1 class="text-2xl font-bold text-ink"><i class="fas fa-question-circle mr-2 text-primary-600"></i>Support & Help</h1>
                <p class="text-ink-muted mt-1">Find answers to common questions or reach out to our HR team.</p>
            </div>

            <?php if ($successMsg): ?>
                <div class="mb-6 p-4 bg-green-500/10 border border-green-200 rounded-xl text-green-700 text-sm">
                    <i class="fas fa-check-circle mr-2"></i><?= $successMsg ?>
                </div>
            <?php endif; ?>
            <?php if ($errorMsg): ?>
                <div class="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-700 text-sm">
                    <i class="fas fa-exclamation-circle mr-2"></i><?= $errorMsg ?>
                </div>
            <?php endif; ?>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- FAQ Section -->
                <div class="lg:col-span-2 space-y-4">
                    <div class="bg-surface-1 rounded-xl shadow-none border border-hairline">
                        <div class="p-5 border-b border-hairline">
                            <h2 class="text-lg font-semibold text-ink"><i class="fas fa-book-open mr-2 text-primary-600"></i>Frequently Asked Questions</h2>
                        </div>
                        <div class="divide-y divide-hairline" id="faq-accordion">
                            <?php
                            $faqs = [
                                ['q' => 'How do I mark my attendance?', 'a' => 'Go to the Attendance page from your dashboard sidebar. Click "START WORK" when you begin your shift and "STOP WORK" when you finish. Your hours will be automatically calculated.'],
                                ['q' => 'How do I apply for leave?', 'a' => 'Navigate to the Leave page from your dashboard. Click "Apply for Leave", select the dates and leave type, provide a reason, and submit. Your manager will review and approve/reject the request.'],
                                ['q' => 'When do I receive my salary/payment?', 'a' => 'Salaries are processed between the 1st and 5th of each month for the previous month. Vendor payments are processed within 7 working days of work approval. You can check your payment status on the Salary/Earnings page.'],
                                ['q' => 'How do I update my profile information?', 'a' => 'Contact HR via the form below or email hr@karyasaarthi.com with your updated details. Profile changes require admin verification for security purposes.'],
                                ['q' => 'What are the working hours?', 'a' => 'Standard working hours are Monday to Saturday, 9:00 AM to 6:00 PM IST. Part-time and remote workers should follow their agreed schedule. Minimum 6 hours per day is required for full attendance.'],
                                ['q' => 'How do I submit my work as a vendor/freelancer?', 'a' => 'Go to the "Submit Work" page from your sidebar. Select the assigned task, add any notes, upload your deliverables, and submit. The admin will review your submission.'],
                                ['q' => 'How can interns get their certificate?', 'a' => 'Interns can request a certificate from the Certificate page after completing minimum 30 days, maintaining 80% attendance, and completing all assigned tasks.'],
                                ['q' => 'Who do I contact for technical issues?', 'a' => 'For any technical issues with the portal, email hr@karyasaarthi.com or call +91 85952 75753. You can also use the Contact HR form on this page.'],
                            ];
                            foreach ($faqs as $i => $faq):
                            ?>
                            <div class="faq-item">
                                <button onclick="toggleFaq(<?= $i ?>)" class="w-full flex items-center justify-between p-4 text-left hover:bg-surface-2 transition">
                                    <span class="text-sm font-medium text-ink pr-4"><?= $faq['q'] ?></span>
                                    <i class="fas fa-chevron-down text-ink-muted text-xs transition-transform duration-200" id="faq-icon-<?= $i ?>"></i>
                                </button>
                                <div class="hidden px-4 pb-4" id="faq-answer-<?= $i ?>">
                                    <p class="text-sm text-ink-muted leading-relaxed"><?= $faq['a'] ?></p>
                                </div>
                            </div>
                            <?php endforeach; ?>
                        </div>
                    </div>

                    <!-- Contact HR Form -->
                    <div class="bg-surface-1 rounded-xl shadow-none border border-hairline">
                        <div class="p-5 border-b border-hairline">
                            <h2 class="text-lg font-semibold text-ink"><i class="fas fa-envelope mr-2 text-primary-600"></i>Contact HR</h2>
                        </div>
                        <form method="POST" class="p-5 space-y-4">
                            <input type="hidden" name="action" value="contact_hr">
                            <div>
                                <label class="block text-sm font-medium text-ink-muted mb-1">Your Name</label>
                                <input type="text" value="<?= htmlspecialchars($_SESSION['user_name'], ENT_QUOTES, 'UTF-8', false) ?>" class="w-full px-4 py-2.5 border border-hairline bg-surface-2 text-ink rounded-lg bg-surface-2 text-ink-muted text-sm" readonly>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-ink-muted mb-1">Subject <span class="text-red-400">*</span></label>
                                <select name="subject" required class="w-full px-4 py-2.5 border border-hairline bg-surface-2 text-ink rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                    <option value="">Select a subject</option>
                                    <option value="Attendance Issue">Attendance Issue</option>
                                    <option value="Leave Request">Leave Request</option>
                                    <option value="Payment Query">Payment Query</option>
                                    <option value="Task/Project Issue">Task/Project Issue</option>
                                    <option value="Profile Update">Profile Update</option>
                                    <option value="Technical Issue">Technical Issue</option>
                                    <option value="Certificate Request">Certificate Request</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-ink-muted mb-1">Message <span class="text-red-400">*</span></label>
                                <textarea name="message" rows="5" required placeholder="Describe your issue or question in detail..." class="w-full px-4 py-2.5 border border-hairline bg-surface-2 text-ink rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"></textarea>
                            </div>
                            <button type="submit" class="w-full sm:w-auto px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg text-sm transition">
                                <i class="fas fa-paper-plane mr-2"></i>Send Message
                            </button>
                        </form>
                    </div>
                </div>

                <!-- Right Column - Contact Info -->
                <div class="space-y-6">
                    <div class="bg-surface-1 rounded-xl shadow-none border border-hairline">
                        <div class="p-5 border-b border-hairline">
                            <h2 class="text-lg font-semibold text-ink"><i class="fas fa-phone-alt mr-2 text-primary-600"></i>HR Contact</h2>
                        </div>
                        <div class="p-5 space-y-4">
                            <div class="flex items-start space-x-3">
                                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <i class="fas fa-envelope text-blue-600"></i>
                                </div>
                                <div>
                                    <p class="text-xs text-ink-muted">Email</p>
                                    <a href="mailto:hr@karyasaarthi.com" class="text-sm font-medium text-primary-600 hover:underline">hr@karyasaarthi.com</a>
                                </div>
                            </div>
                            <div class="flex items-start space-x-3">
                                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <i class="fab fa-whatsapp text-green-600"></i>
                                </div>
                                <div>
                                    <p class="text-xs text-ink-muted">Phone / WhatsApp</p>
                                    <a href="https://wa.me/918595275753" class="text-sm font-medium text-primary-600 hover:underline">+91 85952 75753</a>
                                </div>
                            </div>
                            <div class="flex items-start space-x-3">
                                <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <i class="fas fa-clock text-amber-600"></i>
                                </div>
                                <div>
                                    <p class="text-xs text-ink-muted">Working Hours</p>
                                    <p class="text-sm font-medium text-ink">Mon - Sat, 9 AM - 6 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl shadow-none p-5 text-white">
                        <div class="flex items-center space-x-3 mb-3">
                            <div class="w-10 h-10 bg-surface-1/20 rounded-lg flex items-center justify-center">
                                <i class="fas fa-headset text-lg"></i>
                            </div>
                            <h3 class="font-semibold">Need Urgent Help?</h3>
                        </div>
                        <p class="text-sm text-primary-100 mb-4">For urgent matters, reach out to us directly on WhatsApp for faster response.</p>
                        <a href="https://wa.me/918595275753?text=Hi%20Karya%20Saarthi!%20I%20need%20urgent%20help." target="_blank" class="inline-flex items-center px-4 py-2 bg-surface-1 text-primary-700 font-medium rounded-lg text-sm hover:bg-primary-50 transition">
                            <i class="fab fa-whatsapp mr-2"></i>Chat on WhatsApp
                        </a>
                    </div>

                    <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5">
                        <h3 class="font-semibold text-ink mb-3"><i class="fas fa-link mr-2 text-primary-600"></i>Quick Links</h3>
                        <div class="space-y-2">
                            <a href="<?= BASE_PATH ?>/user-panel/attendance.php" class="flex items-center text-sm text-ink-muted hover:text-primary-600 transition py-1">
                                <i class="fas fa-clock w-5 mr-2 text-ink-muted"></i>My Attendance
                            </a>
                            <a href="<?= BASE_PATH ?>/user-panel/leave.php" class="flex items-center text-sm text-ink-muted hover:text-primary-600 transition py-1">
                                <i class="fas fa-calendar-minus w-5 mr-2 text-ink-muted"></i>Leave Management
                            </a>
                            <a href="<?= BASE_PATH ?>/policy.php" class="flex items-center text-sm text-ink-muted hover:text-primary-600 transition py-1">
                                <i class="fas fa-file-alt w-5 mr-2 text-ink-muted"></i>HR Policy
                            </a>
                            <a href="<?= BASE_PATH ?>/contact.php" class="flex items-center text-sm text-ink-muted hover:text-primary-600 transition py-1">
                                <i class="fas fa-address-book w-5 mr-2 text-ink-muted"></i>Contact Page
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
function toggleFaq(index) {
    const answer = document.getElementById('faq-answer-' + index);
    const icon = document.getElementById('faq-icon-' + index);
    const isHidden = answer.classList.contains('hidden');

    // Close all
    document.querySelectorAll('[id^="faq-answer-"]').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('[id^="faq-icon-"]').forEach(el => el.classList.remove('rotate-180'));

    if (isHidden) {
        answer.classList.remove('hidden');
        icon.classList.add('rotate-180');
    }
}
</script>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>







