<?php
$pageTitle = 'Add New Lead';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireRole('campus_saarthi');

$pdo = getDBConnection();
$userId = $_SESSION['user_id'];

// Fetch user details
$stmt = $pdo->prepare("SELECT * FROM users WHERE user_id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch();

$success = false;
$error = '';
$newLeadId = '';

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $customerName = sanitize($_POST['customer_name'] ?? '');
    $customerPhone = sanitize($_POST['customer_phone'] ?? '');
    $customerWhatsapp = sanitize($_POST['customer_whatsapp'] ?? '');
    $customerEmail = sanitize($_POST['customer_email'] ?? '');
    $college = sanitize($_POST['college'] ?? '');
    $courseYear = sanitize($_POST['course_year'] ?? '');
    $serviceRequired = sanitize($_POST['service_required'] ?? '');
    $projectDetails = sanitize($_POST['project_details'] ?? '');
    $budgetMin = floatval($_POST['budget_min'] ?? 0);
    $budgetMax = floatval($_POST['budget_max'] ?? 0);
    $urgency = sanitize($_POST['urgency'] ?? 'normal');
    $source = sanitize($_POST['source'] ?? 'campus_saarthi');
    $notes = sanitize($_POST['additional_notes'] ?? '');

    // Validation
    if (empty($customerName) || empty($customerPhone) || empty($serviceRequired)) {
        $error = 'Please fill in all required fields (Name, Phone, Service Required).';
    } else {
        try {
            $leadId = generateLeadId($userId);
            $stmt = $pdo->prepare("INSERT INTO leads (lead_id, campus_saarthi_id, customer_name, customer_phone, customer_whatsapp, customer_email, college, course_year, service_required, project_details, budget_min, budget_max, urgency, source, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')");
            $stmt->execute([
                $leadId, $userId, $customerName, $customerPhone, $customerWhatsapp,
                $customerEmail, $college, $courseYear, $serviceRequired,
                $projectDetails . ($notes ? "\n\nAdditional Notes: " . $notes : ''),
                $budgetMin, $budgetMax, $urgency, $source
            ]);

            logActivity($userId, 'lead_submitted', "New lead submitted: $leadId - $customerName");
            $success = true;
            $newLeadId = $leadId;
        } catch (Exception $e) {
            error_log("Lead submission error: " . $e->getMessage());
            $error = 'Failed to submit lead. Please try again.';
        }
    }
}

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex min-h-[calc(100vh-56px)]">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 dashboard-content-area p-6">
        <div class="mb-6">
            <div class="flex items-center space-x-2 text-sm text-ink-muted mb-2">
                <a href="<?= BASE_PATH ?>/user-panel/campus-saarthi.php" class="hover:text-primary-600">Dashboard</a>
                <i class="fas fa-chevron-right text-xs"></i>
                <span class="text-ink">Add New Lead</span>
            </div>
            <h1 class="text-2xl font-bold text-ink">Submit New Lead</h1>
            <p class="text-ink-muted mt-1">Fill in the customer details to submit a new lead.</p>
        </div>

        <?php if ($success): ?>
            <!-- Success Message -->
            <div class="bg-green-500/10 border border-green-200 rounded-xl p-6 mb-6">
                <div class="flex items-start">
                    <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-check-circle text-green-600 text-2xl"></i>
                    </div>
                    <div class="ml-4">
                        <h3 class="text-lg font-semibold text-green-800">Lead Submitted Successfully!</h3>
                        <p class="text-green-700 mt-1">Your lead has been recorded and will be reviewed by our team.</p>
                        <div class="mt-3 bg-surface-1 rounded-lg p-3 inline-block">
                            <span class="text-sm text-ink-muted">Lead ID:</span>
                            <span class="text-lg font-mono font-bold text-primary-600 ml-2"><?= htmlspecialchars($newLeadId, ENT_QUOTES, 'UTF-8', false) ?></span>
                        </div>
                        <div class="mt-4 flex space-x-3">
                            <a href="<?= BASE_PATH ?>/user-panel/add-lead.php" class="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition">
                                <i class="fas fa-plus mr-2"></i> Add Another Lead
                            </a>
                            <a href="<?= BASE_PATH ?>/user-panel/my-leads.php" class="inline-flex items-center px-4 py-2 bg-surface-1 border border-hairline bg-surface-2 text-ink hover:bg-surface-2 text-ink-muted rounded-lg text-sm font-medium transition">
                                <i class="fas fa-list mr-2"></i> View All Leads
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        <?php else: ?>

            <?php if ($error): ?>
                <div class="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                    <div class="flex items-center">
                        <i class="fas fa-exclamation-circle text-red-600 mr-3"></i>
                        <p class="text-red-700"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8', false) ?></p>
                    </div>
                </div>
            <?php endif; ?>

            <form method="POST" class="space-y-6">
                <!-- Auto-filled Saarthi Info -->
                <div class="bg-primary-50 rounded-xl border border-primary-200 p-5">
                    <h2 class="text-sm font-semibold text-primary-800 mb-3"><i class="fas fa-user-shield mr-2"></i>Saarthi Information</h2>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label class="text-xs text-primary-600 font-medium">Name</label>
                            <p class="text-sm font-semibold text-ink"><?= htmlspecialchars($user['name'], ENT_QUOTES, 'UTF-8', false) ?></p>
                        </div>
                        <div>
                            <label class="text-xs text-primary-600 font-medium">ID</label>
                            <p class="text-sm font-semibold text-ink"><?= htmlspecialchars($user['user_id'], ENT_QUOTES, 'UTF-8', false) ?></p>
                        </div>
                        <div>
                            <label class="text-xs text-primary-600 font-medium">College</label>
                            <p class="text-sm font-semibold text-ink"><?= htmlspecialchars($user['college'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></p>
                        </div>
                        <div>
                            <label class="text-xs text-primary-600 font-medium">Referral Code</label>
                            <p class="text-sm font-semibold text-primary-700"><?= htmlspecialchars($user['referral_code'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></p>
                        </div>
                    </div>
                </div>

                <!-- Customer Details -->
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6">
                    <h2 class="text-lg font-semibold text-ink mb-4"><i class="fas fa-user mr-2 text-primary-600"></i>Customer Details</h2>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Full Name <span class="text-red-400">*</span></label>
                            <input type="text" name="customer_name" required value="<?= htmlspecialchars($_POST['customer_name'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>"
                                   class="w-full px-4 py-2.5 border border-hairline bg-surface-2 text-ink rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                   placeholder="Customer's full name">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Phone Number <span class="text-red-400">*</span></label>
                            <input type="tel" name="customer_phone" required value="<?= htmlspecialchars($_POST['customer_phone'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>"
                                   class="w-full px-4 py-2.5 border border-hairline bg-surface-2 text-ink rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                   placeholder="+91 XXXXXXXXXX">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">WhatsApp Number</label>
                            <input type="tel" name="customer_whatsapp" value="<?= htmlspecialchars($_POST['customer_whatsapp'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>"
                                   class="w-full px-4 py-2.5 border border-hairline bg-surface-2 text-ink rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                   placeholder="+91 XXXXXXXXXX">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Email</label>
                            <input type="email" name="customer_email" value="<?= htmlspecialchars($_POST['customer_email'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>"
                                   class="w-full px-4 py-2.5 border border-hairline bg-surface-2 text-ink rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                   placeholder="customer@email.com">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">College</label>
                            <input type="text" name="college" value="<?= htmlspecialchars($_POST['college'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>"
                                   class="w-full px-4 py-2.5 border border-hairline bg-surface-2 text-ink rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                   placeholder="Customer's college name">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Course / Year</label>
                            <input type="text" name="course_year" value="<?= htmlspecialchars($_POST['course_year'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>"
                                   class="w-full px-4 py-2.5 border border-hairline bg-surface-2 text-ink rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                   placeholder="e.g., B.Tech CSE, 3rd Year">
                        </div>
                    </div>
                </div>

                <!-- Service Details -->
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6">
                    <h2 class="text-lg font-semibold text-ink mb-4"><i class="fas fa-briefcase mr-2 text-primary-600"></i>Service Details</h2>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Service Required <span class="text-red-400">*</span></label>
                            <select name="service_required" required
                                    class="w-full px-4 py-2.5 border border-hairline bg-surface-2 text-ink rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                                <option value="">-- Select Service --</option>
                                <option value="Thesis Writing" <?= ($_POST['service_required'] ?? '') === 'Thesis Writing' ? 'selected' : '' ?>>Thesis Writing</option>
                                <option value="Assignment Help" <?= ($_POST['service_required'] ?? '') === 'Assignment Help' ? 'selected' : '' ?>>Assignment Help</option>
                                <option value="Website Development" <?= ($_POST['service_required'] ?? '') === 'Website Development' ? 'selected' : '' ?>>Website Development</option>
                                <option value="Study Abroad Guidance" <?= ($_POST['service_required'] ?? '') === 'Study Abroad Guidance' ? 'selected' : '' ?>>Study Abroad Guidance</option>
                                <option value="Other" <?= ($_POST['service_required'] ?? '') === 'Other' ? 'selected' : '' ?>>Other</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Project Details</label>
                            <textarea name="project_details" rows="4"
                                      class="w-full px-4 py-2.5 border border-hairline bg-surface-2 text-ink rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                      placeholder="Describe the project requirements, scope, and any specific details..."><?= htmlspecialchars($_POST['project_details'] ?? '', ENT_QUOTES, 'UTF-8', false) ?></textarea>
                        </div>

                        <!-- Budget Range -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-ink-muted mb-1">Budget Min (INR)</label>
                                <input type="number" name="budget_min" min="0" step="100" value="<?= htmlspecialchars($_POST['budget_min'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>"
                                       class="w-full px-4 py-2.5 border border-hairline bg-surface-2 text-ink rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                       placeholder="e.g., 5000">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-ink-muted mb-1">Budget Max (INR)</label>
                                <input type="number" name="budget_max" min="0" step="100" value="<?= htmlspecialchars($_POST['budget_max'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>"
                                       class="w-full px-4 py-2.5 border border-hairline bg-surface-2 text-ink rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                       placeholder="e.g., 15000">
                            </div>
                        </div>

                        <!-- Urgency -->
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-2">Urgency</label>
                            <div class="flex flex-wrap gap-4">
                                <label class="inline-flex items-center">
                                    <input type="radio" name="urgency" value="urgent" class="text-red-600 focus:ring-red-500"
                                           <?= ($_POST['urgency'] ?? '') === 'urgent' ? 'checked' : '' ?>>
                                    <span class="ml-2 text-sm text-ink-muted"><i class="fas fa-bolt text-red-400 mr-1"></i>Urgent</span>
                                </label>
                                <label class="inline-flex items-center">
                                    <input type="radio" name="urgency" value="normal" class="text-blue-600 focus:ring-blue-500"
                                           <?= ($_POST['urgency'] ?? 'normal') === 'normal' ? 'checked' : '' ?>>
                                    <span class="ml-2 text-sm text-ink-muted"><i class="fas fa-clock text-blue-500 mr-1"></i>Normal</span>
                                </label>
                                <label class="inline-flex items-center">
                                    <input type="radio" name="urgency" value="flexible" class="text-green-600 focus:ring-green-500"
                                           <?= ($_POST['urgency'] ?? '') === 'flexible' ? 'checked' : '' ?>>
                                    <span class="ml-2 text-sm text-ink-muted"><i class="fas fa-leaf text-green-400 mr-1"></i>Flexible</span>
                                </label>
                            </div>
                        </div>

                        <!-- Source -->
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-2">Lead Source</label>
                            <div class="flex flex-wrap gap-4">
                                <label class="inline-flex items-center">
                                    <input type="radio" name="source" value="campus_saarthi" class="text-primary-600 focus:ring-primary-500"
                                           <?= ($_POST['source'] ?? 'campus_saarthi') === 'campus_saarthi' ? 'checked' : '' ?>>
                                    <span class="ml-2 text-sm text-ink-muted">Saarthi</span>
                                </label>
                                <label class="inline-flex items-center">
                                    <input type="radio" name="source" value="social_media" class="text-primary-600 focus:ring-primary-500"
                                           <?= ($_POST['source'] ?? '') === 'social_media' ? 'checked' : '' ?>>
                                    <span class="ml-2 text-sm text-ink-muted">Social Media</span>
                                </label>
                                <label class="inline-flex items-center">
                                    <input type="radio" name="source" value="referral" class="text-primary-600 focus:ring-primary-500"
                                           <?= ($_POST['source'] ?? '') === 'referral' ? 'checked' : '' ?>>
                                    <span class="ml-2 text-sm text-ink-muted">Friend Referral</span>
                                </label>
                                <label class="inline-flex items-center">
                                    <input type="radio" name="source" value="other" class="text-primary-600 focus:ring-primary-500"
                                           <?= ($_POST['source'] ?? '') === 'other' ? 'checked' : '' ?>>
                                    <span class="ml-2 text-sm text-ink-muted">Other</span>
                                </label>
                            </div>
                        </div>

                        <!-- Additional Notes -->
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Additional Notes</label>
                            <textarea name="additional_notes" rows="3"
                                      class="w-full px-4 py-2.5 border border-hairline bg-surface-2 text-ink rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                      placeholder="Any additional information about the lead..."><?= htmlspecialchars($_POST['additional_notes'] ?? '', ENT_QUOTES, 'UTF-8', false) ?></textarea>
                        </div>
                    </div>
                </div>

                <!-- Submit -->
                <div class="flex items-center justify-between">
                    <a href="<?= BASE_PATH ?>/user-panel/campus-saarthi.php" class="text-sm text-ink-muted hover:text-ink-muted">
                        <i class="fas fa-arrow-left mr-1"></i> Back to Dashboard
                    </a>
                    <button type="submit" class="inline-flex items-center px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-none transition text-lg">
                        <i class="fas fa-paper-plane mr-2"></i> Submit Lead
                    </button>
                </div>
            </form>
        <?php endif; ?>
    </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>






