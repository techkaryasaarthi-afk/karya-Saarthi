<?php
$pageTitle = 'Admin Dashboard';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireAdmin();

$pdo = getDBConnection();

// Auto-migration checks for essential admin tables
$migrations = [
    "CREATE TABLE IF NOT EXISTS users (
        user_id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        user_type VARCHAR(50) NOT NULL DEFAULT 'employee',
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        last_login DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
    "CREATE TABLE IF NOT EXISTS job_postings (
        job_id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        category VARCHAR(50) NOT NULL,
        department VARCHAR(100) NULL,
        status VARCHAR(20) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
    "CREATE TABLE IF NOT EXISTS applications (
        application_id INT AUTO_INCREMENT PRIMARY KEY,
        job_id INT NULL,
        applicant_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'new',
        applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
    "CREATE TABLE IF NOT EXISTS interviews (
        interview_id INT AUTO_INCREMENT PRIMARY KEY,
        application_id INT NOT NULL,
        interview_type VARCHAR(50) DEFAULT 'online',
        interview_date DATETIME NOT NULL,
        status VARCHAR(50) DEFAULT 'scheduled'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
    "CREATE TABLE IF NOT EXISTS leads (
        lead_id VARCHAR(50) PRIMARY KEY,
        campus_saarthi_id VARCHAR(50) NULL,
        customer_name VARCHAR(100) NOT NULL,
        service_required VARCHAR(100) NULL,
        status VARCHAR(50) DEFAULT 'new',
        submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
    "CREATE TABLE IF NOT EXISTS attendance (
        attendance_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        status VARCHAR(50) NOT NULL,
        duration_minutes INT DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
    "CREATE TABLE IF NOT EXISTS leave_requests (
        request_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        leave_type VARCHAR(50) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'pending'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
    "CREATE TABLE IF NOT EXISTS activity_logs (
        log_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(50) NULL,
        action VARCHAR(255) NOT NULL,
        details TEXT NULL,
        ip_address VARCHAR(45) NULL,
        user_agent TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
];
foreach ($migrations as $sql) {
    try { $pdo->exec($sql); } catch (Throwable $e) {}
}

// Active users online (logged in within last 30 minutes)
$activeOnline = 0;
try {
    $stmtOnline = $pdo->query("SELECT COUNT(*) FROM users WHERE last_login >= NOW() - INTERVAL 30 MINUTE AND status = 'active'");
    if ($stmtOnline) $activeOnline = (int)$stmtOnline->fetchColumn();
} catch (Throwable $e) {}

// New applications today
$newAppsToday = 0;
try {
    $stmtApps = $pdo->query("SELECT COUNT(*) FROM applications WHERE DATE(applied_date) = CURDATE()");
    if ($stmtApps) $newAppsToday = (int)$stmtApps->fetchColumn();
} catch (Throwable $e) {}

// Pending interviews
$pendingInterviews = 0;
try {
    $stmtInterviews = $pdo->query("SELECT COUNT(*) FROM interviews WHERE status = 'scheduled' AND interview_date >= NOW()");
    if ($stmtInterviews) $pendingInterviews = (int)$stmtInterviews->fetchColumn();
} catch (Throwable $e) {}

// New leads today
$newLeadsToday = 0;
try {
    $stmtLeads = $pdo->query("SELECT COUNT(*) FROM leads WHERE DATE(submitted_date) = CURDATE()");
    if ($stmtLeads) $newLeadsToday = (int)$stmtLeads->fetchColumn();
} catch (Throwable $e) {}

// Total users
$totalUsers = 0;
try {
    $stmtTotalUsers = $pdo->query("SELECT COUNT(*) FROM users WHERE user_type != 'admin'");
    if ($stmtTotalUsers) $totalUsers = (int)$stmtTotalUsers->fetchColumn();
} catch (Throwable $e) {}

// Total active jobs
$activeJobs = 0;
try {
    $stmtActiveJobs = $pdo->query("SELECT COUNT(*) FROM job_postings WHERE status = 'active'");
    if ($stmtActiveJobs) $activeJobs = (int)$stmtActiveJobs->fetchColumn();
} catch (Throwable $e) {}

// Recent applications (last 10)
$recentApps = [];
try {
    $stmtRecentApps = $pdo->query("SELECT a.application_id, a.applicant_name, a.email, a.status, a.applied_date, j.title AS job_title FROM applications a LEFT JOIN job_postings j ON a.job_id = j.job_id ORDER BY a.applied_date DESC LIMIT 10");
    if ($stmtRecentApps) $recentApps = $stmtRecentApps->fetchAll() ?: [];
} catch (Throwable $e) {}

// Recent leads (last 10)
$recentLeads = [];
try {
    $stmtRecentLeads = $pdo->query("SELECT l.lead_id, l.customer_name, l.service_required, l.status, l.submitted_date, u.name AS cs_name FROM leads l LEFT JOIN users u ON l.campus_saarthi_id = u.user_id ORDER BY l.submitted_date DESC LIMIT 10");
    if ($stmtRecentLeads) $recentLeads = $stmtRecentLeads->fetchAll() ?: [];
} catch (Throwable $e) {}

// Attendance summary today
$currentlyWorking = 0;
try {
    $stmtAttWorking = $pdo->query("SELECT COUNT(DISTINCT user_id) FROM attendance WHERE date = CURDATE() AND status IN ('working', 'paused')");
    if ($stmtAttWorking) $currentlyWorking = (int)$stmtAttWorking->fetchColumn();
} catch (Throwable $e) {}

$finishedToday = 0;
try {
    $stmtAttCompleted = $pdo->query("SELECT COUNT(DISTINCT user_id) FROM attendance WHERE date = CURDATE() AND status = 'completed' AND user_id NOT IN (SELECT DISTINCT user_id FROM attendance WHERE date = CURDATE() AND status IN ('working', 'paused'))");
    if ($stmtAttCompleted) $finishedToday = (int)$stmtAttCompleted->fetchColumn();
} catch (Throwable $e) {}

$totalHoursToday = 0;
try {
    $stmtTotalHours = $pdo->query("SELECT COALESCE(SUM(duration_minutes), 0) FROM attendance WHERE date = CURDATE()");
    if ($stmtTotalHours) {
        $minutes = floatval($stmtTotalHours->fetchColumn());
        $totalHoursToday = round($minutes / 60, 1);
    }
} catch (Throwable $e) {}

// Who's on leave today
$onLeaveToday = [];
$pendingLeaveCount = 0;
try {
    $stmtOnLeave = $pdo->query("SELECT u.name, u.user_type, lr.leave_type, lr.start_date, lr.end_date
        FROM leave_requests lr JOIN users u ON lr.user_id = u.user_id
        WHERE lr.status = 'approved' AND CURDATE() BETWEEN lr.start_date AND lr.end_date
        ORDER BY u.name");
    if ($stmtOnLeave) $onLeaveToday = $stmtOnLeave->fetchAll() ?: [];

    $stmtPendingLeave = $pdo->query("SELECT COUNT(*) FROM leave_requests WHERE status = 'pending'");
    if ($stmtPendingLeave) $pendingLeaveCount = (int)$stmtPendingLeave->fetchColumn();
} catch (Throwable $e) {}

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex min-h-[calc(100vh-56px)]">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 p-4 md:p-6 dashboard-content-area">
        <!-- Announcements -->
        <?php require_once __DIR__ . '/../includes/announcements-banner.php'; ?>
        <div class="mb-6">
            <h1 class="text-xl md:text-2xl font-bold text-ink">Admin Dashboard</h1>
            <p class="text-sm text-ink-muted mt-1">Welcome back! Here's what's happening today.</p>
        </div>

        <!-- Top Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-ink-muted">Active Users Online</p>
                        <p class="text-3xl font-bold text-green-600 mt-1"><?= $activeOnline ?></p>
                    </div>
                    <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-users text-green-600"></i>
                    </div>
                </div>
                <p class="text-xs text-ink-muted mt-2"><?= $totalUsers ?> total users</p>
            </div>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-ink-muted">New Applications Today</p>
                        <p class="text-3xl font-bold text-primary-600 mt-1"><?= $newAppsToday ?></p>
                    </div>
                    <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-file-alt text-primary-600"></i>
                    </div>
                </div>
                <p class="text-xs text-ink-muted mt-2"><?= $activeJobs ?> active job postings</p>
            </div>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-ink-muted">Pending Interviews</p>
                        <p class="text-3xl font-bold text-amber-600 mt-1"><?= $pendingInterviews ?></p>
                    </div>
                    <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-calendar-check text-amber-600"></i>
                    </div>
                </div>
                <p class="text-xs text-ink-muted mt-2">Upcoming scheduled</p>
            </div>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-ink-muted">New Leads Today</p>
                        <p class="text-3xl font-bold text-accent-600 mt-1"><?= $newLeadsToday ?></p>
                    </div>
                    <div class="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-bullhorn text-accent-600"></i>
                    </div>
                </div>
                <p class="text-xs text-ink-muted mt-2">From Saarthi</p>
            </div>
        </div>

        <!-- Quick Overview Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <!-- Attendance Summary -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6">
                <h3 class="text-lg font-semibold text-ink mb-4"><i class="fas fa-clock text-primary-500 mr-2"></i>Attendance Today</h3>
                <div class="space-y-3">
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-ink-muted">Currently Working</span>
                        <span class="text-sm font-bold text-green-600"><?= $currentlyWorking ?></span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-ink-muted">Finished Today</span>
                        <span class="text-sm font-bold text-blue-600"><?= $finishedToday ?></span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-ink-muted">Total Hours</span>
                        <span class="text-sm font-bold text-ink"><?= $totalHoursToday ?> hrs</span>
                    </div>
                </div>
                <a href="<?= BASE_PATH ?>/admin/attendance.php" class="block mt-4 text-center text-sm text-primary-600 hover:text-primary-700 font-medium">View Full Attendance &rarr;</a>
            </div>

            <!-- Who's On Leave Today -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6 lg:col-span-2">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-ink"><i class="fas fa-calendar-minus text-accent-500 mr-2"></i>On Leave Today</h3>
                    <?php if ($pendingLeaveCount > 0): ?>
                    <a href="<?= BASE_PATH ?>/admin/leave.php" class="text-xs bg-accent-100 text-accent-700 px-3 py-1 rounded-full font-medium"><?= $pendingLeaveCount ?> pending</a>
                    <?php endif; ?>
                </div>
                <?php if (empty($onLeaveToday)): ?>
                    <div class="text-center py-4">
                        <i class="fas fa-smile text-green-400 text-2xl mb-2"></i>
                        <p class="text-sm text-ink-muted">Everyone is at work today!</p>
                    </div>
                <?php else: ?>
                    <div class="space-y-2">
                        <?php
                        $leaveColors = ['casual'=>'bg-blue-100 text-blue-700','sick'=>'bg-red-100 text-red-700','earned'=>'bg-green-100 text-green-700','unpaid'=>'bg-surface-2 text-ink-muted'];
                        foreach ($onLeaveToday as $ol): ?>
                        <div class="flex items-center justify-between p-2 bg-accent-50 rounded-lg">
                            <div class="flex items-center gap-2">
                                <div class="w-8 h-8 bg-accent-200 rounded-full flex items-center justify-center text-xs font-bold text-accent-800"><?= strtoupper(substr($ol['name'], 0, 2)) ?></div>
                                <div>
                                    <p class="text-sm font-medium text-ink"><?= htmlspecialchars($ol['name'], ENT_QUOTES, 'UTF-8', false) ?></p>
                                    <p class="text-xs text-ink-muted"><?= ucfirst(str_replace('_',' ',$ol['user_type'])) ?></p>
                                </div>
                            </div>
                            <span class="px-2 py-0.5 rounded-full text-xs font-medium <?= $leaveColors[$ol['leave_type']] ?? 'bg-surface-2' ?>"><?= ucfirst($ol['leave_type']) ?></span>
                        </div>
                        <?php endforeach; ?>
                    </div>
                    <a href="<?= BASE_PATH ?>/admin/leave.php" class="block mt-4 text-center text-sm text-accent-600 hover:text-accent-700 font-medium">Manage Leave &rarr;</a>
                <?php endif; ?>
            </div>
        </div>

        <!-- Recent Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <!-- Recent Applications -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6 lg:col-span-2">
                <h3 class="text-lg font-semibold text-ink mb-4"><i class="fas fa-file-alt text-primary-500 mr-2"></i>Recent Applications</h3>
                <?php if (empty($recentApps)): ?>
                    <p class="text-sm text-ink-muted">No applications yet.</p>
                <?php else: ?>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="text-left text-ink-muted border-b">
                                    <th class="pb-2 font-medium">Applicant</th>
                                    <th class="pb-2 font-medium">Job</th>
                                    <th class="pb-2 font-medium">Status</th>
                                    <th class="pb-2 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-hairline">
                                <?php foreach (array_slice($recentApps, 0, 5) as $app): ?>
                                <tr>
                                    <td class="py-2 font-medium text-ink"><?= htmlspecialchars($app['applicant_name'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></td>
                                    <td class="py-2 text-ink-muted"><?= htmlspecialchars($app['job_title'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></td>
                                    <td class="py-2">
                                        <?php
                                        $statusColors = ['new' => 'bg-blue-100 text-blue-700', 'shortlisted' => 'bg-yellow-100 text-yellow-700', 'interview_scheduled' => 'bg-accent-100 text-purple-700', 'selected' => 'bg-green-100 text-green-700', 'offer_sent' => 'bg-indigo-100 text-indigo-700', 'joined' => 'bg-emerald-100 text-emerald-700', 'rejected' => 'bg-red-100 text-red-700'];
                                        $color = $statusColors[$app['status'] ?? ''] ?? 'bg-surface-2 text-ink-muted';
                                        ?>
                                        <span class="px-2 py-1 rounded-full text-xs font-medium <?= $color ?>"><?= ucfirst(str_replace('_', ' ', $app['status'] ?? '')) ?></span>
                                    </td>
                                    <td class="py-2 text-ink-muted"><?= !empty($app['applied_date']) ? date('M d', strtotime($app['applied_date'])) : 'N/A' ?></td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                    <a href="<?= BASE_PATH ?>/admin/recruitment.php?tab=applications" class="block mt-4 text-center text-sm text-primary-600 hover:text-primary-700 font-medium">View All Applications &rarr;</a>
                <?php endif; ?>
            </div>
        </div>

        <!-- Recent Leads -->
        <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6">
            <h3 class="text-lg font-semibold text-ink mb-4"><i class="fas fa-bullhorn text-accent-500 mr-2"></i>Recent Leads</h3>
            <?php if (empty($recentLeads)): ?>
                <p class="text-sm text-ink-muted">No leads submitted yet.</p>
            <?php else: ?>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="text-left text-ink-muted border-b">
                                <th class="pb-2 font-medium">Lead ID</th>
                                <th class="pb-2 font-medium">Saarthi</th>
                                <th class="pb-2 font-medium">Customer</th>
                                <th class="pb-2 font-medium">Service</th>
                                <th class="pb-2 font-medium">Status</th>
                                <th class="pb-2 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-hairline">
                            <?php foreach (array_slice($recentLeads, 0, 5) as $lead): ?>
                            <tr>
                                <td class="py-2 font-mono text-xs text-ink-muted"><?= htmlspecialchars($lead['lead_id'] ?? '', ENT_QUOTES, 'UTF-8', false) ?></td>
                                <td class="py-2 font-medium text-ink"><?= htmlspecialchars($lead['cs_name'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></td>
                                <td class="py-2 text-ink-muted"><?= htmlspecialchars($lead['customer_name'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></td>
                                <td class="py-2 text-ink-muted"><?= htmlspecialchars($lead['service_required'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></td>
                                <td class="py-2">
                                    <?php
                                    $leadColors = ['new' => 'bg-blue-100 text-blue-700', 'contacted' => 'bg-yellow-100 text-yellow-700', 'discussion' => 'bg-accent-100 text-purple-700', 'won' => 'bg-green-100 text-green-700', 'lost' => 'bg-red-100 text-red-700'];
                                    $lColor = $leadColors[$lead['status'] ?? ''] ?? 'bg-surface-2 text-ink-muted';
                                    ?>
                                    <span class="px-2 py-1 rounded-full text-xs font-medium <?= $lColor ?>"><?= ucfirst($lead['status'] ?? '') ?></span>
                                </td>
                                <td class="py-2 text-ink-muted"><?= !empty($lead['submitted_date']) ? date('M d', strtotime($lead['submitted_date'])) : 'N/A' ?></td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
                <a href="<?= BASE_PATH ?>/admin/leads.php" class="block mt-4 text-center text-sm text-primary-600 hover:text-primary-700 font-medium">View All Leads &rarr;</a>
            <?php endif; ?>
        </div>
    </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>






