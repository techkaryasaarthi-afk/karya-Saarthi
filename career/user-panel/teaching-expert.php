<?php
$pageTitle = 'Teaching Expert Dashboard';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
$pdo = getDBConnection();
$userId = $_SESSION['user_id'];

// Fetch user details
$stmt = $pdo->prepare("SELECT * FROM users WHERE user_id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch();

// Sessions completed (tasks with status = completed)
try {
    $stmt = $pdo->prepare("SELECT
        COUNT(*) as total_sessions,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_sessions,
        SUM(CASE WHEN status = 'pending' OR status = 'in_progress' THEN 1 ELSE 0 END) as upcoming_sessions
        FROM tasks WHERE assigned_to = ?");
    $stmt->execute([$userId]);
    $sessionStats = $stmt->fetch();
} catch (Exception $e) {
    $sessionStats = ['total_sessions' => 0, 'completed_sessions' => 0, 'upcoming_sessions' => 0];
}

// Earnings this month
try {
    $stmt = $pdo->prepare("SELECT
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paid,
        COALESCE(SUM(CASE WHEN status = 'pending' OR status = 'approved' THEN amount ELSE 0 END), 0) as pending
        FROM payments WHERE user_id = ? AND MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())");
    $stmt->execute([$userId]);
    $earningsData = $stmt->fetch();
} catch (Exception $e) {
    $earningsData = ['paid' => 0, 'pending' => 0];
}

// Upcoming sessions (pending/in_progress tasks)
try {
    $stmt = $pdo->prepare("SELECT * FROM tasks WHERE assigned_to = ? AND status IN ('pending', 'in_progress') ORDER BY deadline ASC LIMIT 5");
    $stmt->execute([$userId]);
    $upcomingSessions = $stmt->fetchAll();
} catch (Exception $e) {
    $upcomingSessions = [];
}

// Recent earnings from payments
try {
    $stmt = $pdo->prepare("SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 5");
    $stmt->execute([$userId]);
    $recentEarnings = $stmt->fetchAll();
} catch (Exception $e) {
    $recentEarnings = [];
}

// Defaults
$studentsGuided = $sessionStats['completed_sessions'] ?? 0;
$sessionsCompleted = $sessionStats['completed_sessions'] ?? 0;
$monthlyEarnings = $earningsData['paid'] ?? 0;
$isVerified = ($user['status'] ?? '') === 'active';
$rating = 4.5; // Default rating

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex min-h-[calc(100vh-56px)]">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 dashboard-content-area p-6">
        <!-- Announcements -->
        <?php require_once __DIR__ . '/../includes/announcements-banner.php'; ?>
        <!-- Welcome Banner -->
        <div class="mb-6 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-6 text-white animate-on-scroll">
            <div class="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 class="text-2xl font-bold">Welcome back, <?= htmlspecialchars($user['name'] ?? $_SESSION['user_name'], ENT_QUOTES, 'UTF-8', false) ?>!</h1>
                    <p class="text-green-100 mt-1">Teaching Expert Dashboard</p>
                </div>
                <?php if ($isVerified): ?>
                    <div class="inline-flex items-center px-4 py-2 bg-surface-1/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                        <i class="fas fa-check-circle mr-2 text-yellow-300"></i> KS Verified Expert
                    </div>
                <?php endif; ?>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5 hover-lift animate-on-scroll">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-ink-muted">Sessions Completed</p>
                        <p class="text-2xl font-bold text-ink"><?= $sessionsCompleted ?></p>
                    </div>
                    <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-chalkboard-teacher text-green-600 text-xl"></i>
                    </div>
                </div>
            </div>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5 hover-lift animate-on-scroll">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-ink-muted">Students Guided</p>
                        <p class="text-2xl font-bold text-blue-600"><?= $studentsGuided ?></p>
                    </div>
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-user-graduate text-blue-600 text-xl"></i>
                    </div>
                </div>
            </div>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5 hover-lift animate-on-scroll">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-ink-muted">Earnings This Month</p>
                        <p class="text-2xl font-bold text-primary-600"><?= number_format($monthlyEarnings, 0) ?></p>
                    </div>
                    <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-wallet text-primary-600 text-xl"></i>
                    </div>
                </div>
            </div>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5 hover-lift animate-on-scroll">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-ink-muted">Rating</p>
                        <p class="text-2xl font-bold text-amber-600"><?= $rating ?> <i class="fas fa-star text-amber-400 text-sm"></i></p>
                    </div>
                    <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-star text-amber-600 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <a href="<?= BASE_PATH ?>/user-panel/progress.php" class="flex items-center justify-center space-x-2 bg-surface-1 border border-hairline rounded-xl px-4 py-3 hover:bg-primary-50 hover:border-primary-300 transition hover-lift animate-on-scroll">
                <i class="fas fa-user text-primary-600"></i>
                <span class="text-sm font-medium text-ink-muted">View Profile</span>
            </a>
            <a href="<?= BASE_PATH ?>/user-panel/projects.php" class="flex items-center justify-center space-x-2 bg-surface-1 border border-hairline rounded-xl px-4 py-3 hover:bg-green-500/10 hover:border-green-300 transition hover-lift animate-on-scroll">
                <i class="fas fa-calendar-alt text-green-600"></i>
                <span class="text-sm font-medium text-ink-muted">Session Schedule</span>
            </a>
            <a href="<?= BASE_PATH ?>/user-panel/assignments.php" class="flex items-center justify-center space-x-2 bg-surface-1 border border-hairline rounded-xl px-4 py-3 hover:bg-amber-50 hover:border-amber-300 transition hover-lift animate-on-scroll">
                <i class="fas fa-book text-amber-600"></i>
                <span class="text-sm font-medium text-ink-muted">Resource Library</span>
            </a>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Upcoming Sessions -->
            <div class="lg:col-span-2 bg-surface-1 rounded-xl shadow-none border border-hairline animate-on-scroll">
                <div class="p-5 border-b border-hairline flex items-center justify-between">
                    <h2 class="text-lg font-semibold text-ink"><i class="fas fa-calendar-check mr-2 text-primary-600"></i>Upcoming Sessions</h2>
                    <a href="<?= BASE_PATH ?>/user-panel/projects.php" class="text-sm text-primary-600 hover:underline">View All</a>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-surface-2">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Session</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Status</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Priority</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Deadline</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-hairline">
                            <?php if (empty($upcomingSessions)): ?>
                                <tr>
                                    <td colspan="4" class="px-4 py-8 text-center text-ink-muted">
                                        <i class="fas fa-calendar-check text-3xl mb-2 block"></i>
                                        No upcoming sessions scheduled.
                                    </td>
                                </tr>
                            <?php else: ?>
                                <?php foreach ($upcomingSessions as $session):
                                    $statusColors = ['pending' => 'bg-amber-100 text-amber-700', 'in_progress' => 'bg-blue-100 text-blue-700', 'completed' => 'bg-green-100 text-green-700'];
                                    $priorityColors = ['urgent' => 'text-red-600', 'high' => 'text-orange-600', 'medium' => 'text-blue-600', 'low' => 'text-ink-muted'];
                                ?>
                                <tr class="hover:bg-surface-2">
                                    <td class="px-4 py-3 font-medium text-ink"><?= htmlspecialchars($session['title'], ENT_QUOTES, 'UTF-8', false) ?></td>
                                    <td class="px-4 py-3">
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium <?= $statusColors[$session['status']] ?? 'bg-surface-2 text-ink-muted' ?>">
                                            <?= ucfirst(str_replace('_', ' ', $session['status'])) ?>
                                        </span>
                                    </td>
                                    <td class="px-4 py-3">
                                        <i class="fas fa-flag <?= $priorityColors[$session['priority'] ?? 'medium'] ?? 'text-ink-muted' ?> text-xs mr-1"></i>
                                        <?= ucfirst($session['priority'] ?? 'Medium') ?>
                                    </td>
                                    <td class="px-4 py-3 text-ink-muted"><?= $session['deadline'] ? date('d M Y', strtotime($session['deadline'])) : 'N/A' ?></td>
                                </tr>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Recent Earnings -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline animate-on-scroll">
                <div class="p-5 border-b border-hairline">
                    <h2 class="text-lg font-semibold text-ink"><i class="fas fa-wallet mr-2 text-primary-600"></i>Recent Earnings</h2>
                </div>
                <div class="p-5 space-y-3">
                    <?php if (empty($recentEarnings)): ?>
                        <div class="text-center py-6 text-ink-muted">
                            <i class="fas fa-coins text-3xl mb-2 block"></i>
                            <p class="text-sm">No earnings recorded yet.</p>
                        </div>
                    <?php else: ?>
                        <?php foreach ($recentEarnings as $earning):
                            $eStatusColors = ['paid' => 'text-green-600', 'pending' => 'text-amber-600', 'approved' => 'text-blue-600'];
                        ?>
                        <div class="flex items-center justify-between py-2 border-b border-hairline last:border-0">
                            <div>
                                <p class="text-sm font-medium text-ink"><?= htmlspecialchars($earning['payment_type'] ?? 'Payment', ENT_QUOTES, 'UTF-8', false) ?></p>
                                <p class="text-xs text-ink-muted"><?= date('d M Y', strtotime($earning['created_at'])) ?></p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm font-bold <?= $eStatusColors[$earning['status']] ?? 'text-ink-muted' ?>">
                                    <?= number_format($earning['amount'], 0) ?>
                                </p>
                                <p class="text-xs text-ink-muted"><?= ucfirst($earning['status']) ?></p>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                    <a href="<?= BASE_PATH ?>/user-panel/earnings.php" class="block w-full text-center px-4 py-2 bg-surface-2 hover:bg-surface-2 text-ink-muted rounded-lg text-sm font-medium transition mt-2">
                        View All Earnings <i class="fas fa-arrow-right ml-1"></i>
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>






