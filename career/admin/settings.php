<?php
$pageTitle = 'Settings';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireAdmin();

$pdo = getDBConnection();

$message = '';
$messageType = '';

// Initialize settings table
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS site_settings (
        setting_key VARCHAR(50) PRIMARY KEY,
        setting_value TEXT NOT NULL
    )");
    // Insert defaults if not exists
    $pdo->exec("INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES 
        ('onboarding_whatsapp', 'https://chat.whatsapp.com/your-group-link'),
        ('onboarding_google_form', 'https://forms.gle/your-form-link'),
        ('onboarding_docs_drive', 'https://drive.google.com/drive/folders/your-folder-id')
    ");
} catch (Exception $e) {}

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'update_onboarding_links') {
    try {
        $stmt = $pdo->prepare("UPDATE site_settings SET setting_value = ? WHERE setting_key = ?");
        $stmt->execute([trim($_POST['whatsapp']), 'onboarding_whatsapp']);
        $stmt->execute([trim($_POST['google_form']), 'onboarding_google_form']);
        $stmt->execute([trim($_POST['docs_drive']), 'onboarding_docs_drive']);
        
        $message = "Onboarding links updated successfully!";
        $messageType = "success";
    } catch (Exception $e) {
        $message = "Error updating links: " . $e->getMessage();
        $messageType = "error";
    }
}

// Fetch current site settings
$stmt = $pdo->query("SELECT setting_key, setting_value FROM site_settings");
$siteSettings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

// Gather current config values for display
$settings = [
    'Site Name' => SITE_NAME,
    'Site URL' => SITE_URL,
    'Site Email' => SITE_EMAIL,
    'Database Host' => DB_HOST,
    'Database Name' => DB_NAME,
    'Session Lifetime' => SESSION_LIFETIME . ' seconds (' . round(SESSION_LIFETIME / 3600, 1) . ' hours)',
    'Saarthi Commission Rate' => (CAMPUS_SAARTHI_COMMISSION * 100) . '%',
];

// Count stats for system info
$stmtUsers = $pdo->query("SELECT COUNT(*) FROM users");
$totalUsers = $stmtUsers->fetchColumn();

$stmtJobs = $pdo->query("SELECT COUNT(*) FROM job_postings");
$totalJobs = $stmtJobs->fetchColumn();

$stmtApps = $pdo->query("SELECT COUNT(*) FROM applications");
$totalApps = $stmtApps->fetchColumn();

$stmtLeads = $pdo->query("SELECT COUNT(*) FROM leads");
$totalLeads = $stmtLeads->fetchColumn();

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 dashboard-content-area p-6">
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-ink">Settings</h1>
            <p class="text-sm text-ink-muted mt-1">Site configuration and system information.</p>
        </div>

        <?php if ($message): ?>
            <div class="mb-6 px-4 py-3 rounded-lg flex items-center justify-between <?= $messageType === 'success' ? 'bg-green-500/10 text-green-800 border border-green-200' : 'bg-red-500/10 text-red-400 border border-red-500/20' ?>">
                <span><?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8', false) ?></span>
                <button onclick="this.parentElement.style.display='none'" class="text-ink-muted hover:text-ink">&times;</button>
            </div>
        <?php endif; ?>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Site Configuration -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6">
                <h3 class="text-lg font-semibold text-ink mb-4"><i class="fas fa-cog text-primary-500 mr-2"></i>Site Configuration</h3>
                <p class="text-sm text-ink-muted mb-4">Current settings loaded from <code class="bg-surface-2 px-1 py-0.5 rounded text-xs">config/database.php</code></p>
                <div class="space-y-3">
                    <?php foreach ($settings as $key => $value): ?>
                    <div class="flex justify-between items-center py-2 border-b border-hairline">
                        <span class="text-sm font-medium text-ink-muted"><?= $key ?></span>
                        <span class="text-sm text-ink-muted font-mono bg-surface-2 px-2 py-1 rounded"><?= htmlspecialchars($value, ENT_QUOTES, 'UTF-8', false) ?></span>
                    </div>
                    <?php endforeach; ?>
                </div>
                <div class="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p class="text-sm text-amber-700"><i class="fas fa-info-circle mr-1"></i> To modify these settings, edit the <strong>config/database.php</strong> file directly. A settings management UI will be available in a future update.</p>
                </div>
            </div>

            <!-- System Information -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6">
                <h3 class="text-lg font-semibold text-ink mb-4"><i class="fas fa-server text-green-400 mr-2"></i>System Information</h3>
                <div class="space-y-3">
                    <div class="flex justify-between items-center py-2 border-b border-hairline">
                        <span class="text-sm font-medium text-ink-muted">PHP Version</span>
                        <span class="text-sm text-ink-muted font-mono bg-surface-2 px-2 py-1 rounded"><?= phpversion() ?></span>
                    </div>
                    <div class="flex justify-between items-center py-2 border-b border-hairline">
                        <span class="text-sm font-medium text-ink-muted">Server Software</span>
                        <span class="text-sm text-ink-muted font-mono bg-surface-2 px-2 py-1 rounded"><?= htmlspecialchars($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown', ENT_QUOTES, 'UTF-8', false) ?></span>
                    </div>
                    <div class="flex justify-between items-center py-2 border-b border-hairline">
                        <span class="text-sm font-medium text-ink-muted">Database</span>
                        <span class="text-sm text-ink-muted font-mono bg-surface-2 px-2 py-1 rounded"><?= $pdo->getAttribute(PDO::ATTR_DRIVER_NAME) ?> <?= $pdo->getAttribute(PDO::ATTR_SERVER_VERSION) ?></span>
                    </div>
                    <div class="flex justify-between items-center py-2 border-b border-hairline">
                        <span class="text-sm font-medium text-ink-muted">Total Users</span>
                        <span class="text-sm text-ink-muted font-mono bg-surface-2 px-2 py-1 rounded"><?= $totalUsers ?></span>
                    </div>
                    <div class="flex justify-between items-center py-2 border-b border-hairline">
                        <span class="text-sm font-medium text-ink-muted">Total Job Postings</span>
                        <span class="text-sm text-ink-muted font-mono bg-surface-2 px-2 py-1 rounded"><?= $totalJobs ?></span>
                    </div>
                    <div class="flex justify-between items-center py-2 border-b border-hairline">
                        <span class="text-sm font-medium text-ink-muted">Total Applications</span>
                        <span class="text-sm text-ink-muted font-mono bg-surface-2 px-2 py-1 rounded"><?= $totalApps ?></span>
                    </div>
                    <div class="flex justify-between items-center py-2 border-b border-hairline">
                        <span class="text-sm font-medium text-ink-muted">Total Leads</span>
                        <span class="text-sm text-ink-muted font-mono bg-surface-2 px-2 py-1 rounded"><?= $totalLeads ?></span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Onboarding Links Settings -->
        <div class="mt-6 bg-surface-1 rounded-xl shadow-none border border-hairline p-6">
            <h3 class="text-lg font-semibold text-ink mb-4"><i class="fas fa-link text-indigo-500 mr-2"></i>Onboarding Links (For Automated Selection Emails)</h3>
            <form method="POST" class="space-y-4">
                <input type="hidden" name="action" value="update_onboarding_links">
                
                <div>
                    <label class="block text-sm font-medium text-ink-muted mb-1">WhatsApp Community Link <span class="text-red-400">*</span></label>
                    <input type="url" name="whatsapp" value="<?= htmlspecialchars($siteSettings['onboarding_whatsapp'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-ink-muted mb-1">Google Form Link (Official Onboarding) <span class="text-red-400">*</span></label>
                    <input type="url" name="google_form" value="<?= htmlspecialchars($siteSettings['onboarding_google_form'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                </div>

                <div>
                    <label class="block text-sm font-medium text-ink-muted mb-1">Documents Upload Folder (Google Drive) <span class="text-red-400">*</span></label>
                    <input type="url" name="docs_drive" value="<?= htmlspecialchars($siteSettings['onboarding_docs_drive'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                </div>
                
                <div class="pt-2">
                    <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition shadow-none">Save Links</button>
                </div>
            </form>
        </div>

        <!-- Future Settings Placeholder -->
        <div class="mt-6 bg-surface-1 rounded-xl shadow-none border border-hairline p-6">
            <h3 class="text-lg font-semibold text-ink mb-4"><i class="fas fa-tools text-ink-muted mr-2"></i>Coming Soon</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="p-4 bg-surface-2 rounded-lg border border-dashed border-hairline bg-surface-2 text-ink text-center">
                    <i class="fas fa-envelope text-ink-muted text-2xl mb-2"></i>
                    <p class="text-sm font-medium text-ink-muted">Email Templates</p>
                    <p class="text-xs text-ink-muted">Configure notification emails</p>
                </div>
                <div class="p-4 bg-surface-2 rounded-lg border border-dashed border-hairline bg-surface-2 text-ink text-center">
                    <i class="fas fa-bell text-ink-muted text-2xl mb-2"></i>
                    <p class="text-sm font-medium text-ink-muted">Notification Settings</p>
                    <p class="text-xs text-ink-muted">SMS and WhatsApp alerts</p>
                </div>
                <div class="p-4 bg-surface-2 rounded-lg border border-dashed border-hairline bg-surface-2 text-ink text-center">
                    <i class="fas fa-shield-alt text-ink-muted text-2xl mb-2"></i>
                    <p class="text-sm font-medium text-ink-muted">Security Settings</p>
                    <p class="text-xs text-ink-muted">Password policies, 2FA</p>
                </div>
            </div>
        </div>
    </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>






