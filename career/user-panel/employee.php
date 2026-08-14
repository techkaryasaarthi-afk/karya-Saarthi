<?php
$pageTitle = 'Employee Dashboard';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireRole(['employee', 'pillar_post']);

$pdo = getDBConnection();
$userId = $_SESSION['user_id'];
$today = date('Y-m-d');

// Today's attendance
$stmt = $pdo->prepare("SELECT * FROM attendance WHERE user_id = ? AND date = ?");
$stmt->execute([$userId, $today]);
$todayAttendance = $stmt->fetch();

// My Tasks
$stmt = $pdo->prepare("SELECT * FROM tasks WHERE assigned_to = ? ORDER BY
    FIELD(priority, 'urgent', 'high', 'medium', 'low'),
    FIELD(status, 'in_progress', 'pending', 'completed', 'cancelled'),
    deadline ASC LIMIT 10");
$stmt->execute([$userId]);
$tasks = $stmt->fetchAll();

// Task stats
$stmt = $pdo->prepare("SELECT
    COUNT(*) as total,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
    FROM tasks WHERE assigned_to = ?");
$stmt->execute([$userId]);
$taskStats = $stmt->fetch();

// Leave balance (count approved leaves this year)
$stmt = $pdo->prepare("SELECT
    COUNT(*) as total_requests,
    SUM(CASE WHEN status = 'approved' THEN DATEDIFF(end_date, start_date) + 1 ELSE 0 END) as days_taken,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_requests
    FROM leave_requests WHERE user_id = ? AND YEAR(start_date) = YEAR(CURRENT_DATE())");
$stmt->execute([$userId]);
$leaveData = $stmt->fetch();

// Salary info (this month)
$stmt = $pdo->prepare("SELECT
    COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paid,
    COALESCE(SUM(CASE WHEN status = 'pending' OR status = 'approved' THEN amount ELSE 0 END), 0) as pending
    FROM payments WHERE user_id = ? AND payment_type = 'salary' AND MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())");
$stmt->execute([$userId]);
$salaryData = $stmt->fetch();

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex min-h-[calc(100vh-56px)]">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 dashboard-content-area p-6">
        <!-- Announcements -->
        <?php require_once __DIR__ . '/../includes/announcements-banner.php'; ?>
        <!-- Welcome -->
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-ink">Employee Dashboard</h1>
            <p class="text-ink-muted mt-1">Welcome back, <?= htmlspecialchars($_SESSION['user_name'], ENT_QUOTES, 'UTF-8', false) ?>!</p>
        </div>

        <!-- Attendance Widget -->
        <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-ink"><i class="fas fa-clock mr-2 text-primary-600"></i>Today's Attendance</h2>
                <span class="text-sm text-ink-muted"><?= date('l, d M Y') ?></span>
            </div>

            <?php if (!$todayAttendance): ?>
                <div class="text-center py-6">
                    <div class="w-20 h-20 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-play text-ink-muted text-2xl"></i>
                    </div>
                    <p class="text-ink-muted mb-4">You haven't started work today.</p>
                    <a href="<?= BASE_PATH ?>/user-panel/attendance.php" class="inline-flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition text-lg">
                        <i class="fas fa-play-circle mr-2"></i> START WORK
                    </a>
                </div>
            <?php elseif ($todayAttendance['status'] === 'working'): ?>
                <div class="text-center py-6">
                    <div class="flex items-center justify-center mb-3">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                            <span class="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span> WORKING NOW
                        </span>
                    </div>
                    <p class="text-sm text-ink-muted mb-1">Started at <?= date('h:i A', strtotime($todayAttendance['start_time'])) ?></p>
                    <div class="text-4xl font-mono font-bold text-primary-600 my-4" id="work-timer"
                         data-start="<?= $todayAttendance['start_time'] ?>">
                        00:00:00
                    </div>
                    <a href="<?= BASE_PATH ?>/user-panel/attendance.php" class="inline-flex items-center px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition text-lg">
                        <i class="fas fa-stop-circle mr-2"></i> STOP WORK
                    </a>
                </div>
            <?php else: ?>
                <div class="text-center py-6">
                    <div class="flex items-center justify-center mb-3">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                            <i class="fas fa-check-circle mr-1"></i> COMPLETED
                        </span>
                    </div>
                    <div class="grid grid-cols-3 gap-4 max-w-md mx-auto mt-4">
                        <div class="bg-surface-2 rounded-lg p-3">
                            <p class="text-xs text-ink-muted">Start Time</p>
                            <p class="text-sm font-bold text-ink"><?= date('h:i A', strtotime($todayAttendance['start_time'])) ?></p>
                        </div>
                        <div class="bg-surface-2 rounded-lg p-3">
                            <p class="text-xs text-ink-muted">End Time</p>
                            <p class="text-sm font-bold text-ink"><?= date('h:i A', strtotime($todayAttendance['end_time'])) ?></p>
                        </div>
                        <div class="bg-surface-2 rounded-lg p-3">
                            <p class="text-xs text-ink-muted">Duration</p>
                            <p class="text-sm font-bold text-primary-600"><?= floor($todayAttendance['duration_minutes'] / 60) ?>h <?= $todayAttendance['duration_minutes'] % 60 ?>m</p>
                        </div>
                    </div>
                </div>
            <?php endif; ?>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- My Tasks -->
            <div class="lg:col-span-2 bg-surface-1 rounded-xl shadow-none border border-hairline">
                <div class="p-5 border-b border-hairline flex items-center justify-between">
                    <h2 class="text-lg font-semibold text-ink"><i class="fas fa-tasks mr-2 text-primary-600"></i>My Tasks</h2>
                    <div class="flex items-center space-x-3 text-xs">
                        <span class="text-ink-muted">Pending: <strong class="text-amber-600"><?= $taskStats['pending'] ?? 0 ?></strong></span>
                        <span class="text-ink-muted">In Progress: <strong class="text-blue-600"><?= $taskStats['in_progress'] ?? 0 ?></strong></span>
                        <span class="text-ink-muted">Done: <strong class="text-green-600"><?= $taskStats['completed'] ?? 0 ?></strong></span>
                    </div>
                </div>
                <div class="divide-y divide-hairline">
                    <?php if (empty($tasks)): ?>
                        <div class="p-8 text-center text-ink-muted">
                            <i class="fas fa-clipboard-check text-4xl mb-3 block"></i>
                            <p class="text-sm">No tasks assigned yet.</p>
                        </div>
                    <?php else: ?>
                        <?php foreach ($tasks as $task):
                            $priorityColors = ['urgent' => 'text-red-600', 'high' => 'text-orange-600', 'medium' => 'text-blue-600', 'low' => 'text-ink-muted'];
                            $statusColors = ['pending' => 'bg-amber-100 text-amber-700', 'in_progress' => 'bg-blue-100 text-blue-700', 'completed' => 'bg-green-100 text-green-700', 'cancelled' => 'bg-surface-2 text-ink-muted'];
                        ?>
                        <div class="p-4 hover:bg-surface-2 transition">
                            <div class="flex items-start justify-between">
                                <div class="flex-1">
                                    <div class="flex items-center space-x-2">
                                        <i class="fas fa-flag <?= $priorityColors[$task['priority']] ?? 'text-ink-muted' ?> text-xs"></i>
                                        <h3 class="text-sm font-semibold text-ink"><?= htmlspecialchars($task['title'], ENT_QUOTES, 'UTF-8', false) ?></h3>
                                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium <?= $statusColors[$task['status']] ?? 'bg-surface-2 text-ink-muted' ?>">
                                            <?= ucfirst(str_replace('_', ' ', $task['status'])) ?>
                                        </span>
                                    </div>
                                    <?php if ($task['description']): ?>
                                        <p class="text-xs text-ink-muted mt-1 line-clamp-1"><?= htmlspecialchars($task['description'], ENT_QUOTES, 'UTF-8', false) ?></p>
                                    <?php endif; ?>
                                </div>
                                <?php if ($task['deadline']): ?>
                                    <span class="text-xs text-ink-muted ml-4 whitespace-nowrap">
                                        <i class="fas fa-calendar-alt mr-1"></i><?= date('d M', strtotime($task['deadline'])) ?>
                                    </span>
                                <?php endif; ?>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-6">
                <!-- Leave Balance -->
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline">
                    <div class="p-5 border-b border-hairline">
                        <h2 class="text-lg font-semibold text-ink"><i class="fas fa-calendar-alt mr-2 text-primary-600"></i>Leave</h2>
                    </div>
                    <div class="p-5 space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-ink-muted">Total Allowed</span>
                            <span class="text-sm font-bold text-ink">24 days</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-ink-muted">Days Taken</span>
                            <span class="text-sm font-bold text-red-600"><?= $leaveData['days_taken'] ?? 0 ?> days</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-ink-muted">Remaining</span>
                            <span class="text-sm font-bold text-green-600"><?= 24 - ($leaveData['days_taken'] ?? 0) ?> days</span>
                        </div>
                        <?php if (($leaveData['pending_requests'] ?? 0) > 0): ?>
                            <div class="mt-2 p-2 bg-amber-50 rounded-lg text-xs text-amber-700">
                                <i class="fas fa-info-circle mr-1"></i> <?= $leaveData['pending_requests'] ?> pending request(s)
                            </div>
                        <?php endif; ?>
                        <hr class="border-hairline">
                        <a href="<?= BASE_PATH ?>/user-panel/leave.php" class="block w-full text-center px-4 py-2 bg-surface-2 hover:bg-surface-2 text-ink-muted rounded-lg text-sm font-medium transition">
                            Manage Leave <i class="fas fa-arrow-right ml-1"></i>
                        </a>
                    </div>
                </div>

                <!-- Salary Info -->
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline">
                    <div class="p-5 border-b border-hairline">
                        <h2 class="text-lg font-semibold text-ink"><i class="fas fa-wallet mr-2 text-primary-600"></i>Salary</h2>
                    </div>
                    <div class="p-5 space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-ink-muted">This Month (Paid)</span>
                            <span class="text-lg font-bold text-green-600">₹<?= number_format($salaryData['paid'], 0) ?></span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-ink-muted">Pending</span>
                            <span class="text-lg font-bold text-amber-600">₹<?= number_format($salaryData['pending'], 0) ?></span>
                        </div>
                        <a href="<?= BASE_PATH ?>/user-panel/salary.php" class="block w-full text-center px-4 py-2 bg-surface-2 hover:bg-surface-2 text-ink-muted rounded-lg text-sm font-medium transition">
                            View Details <i class="fas fa-arrow-right ml-1"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
const timerEl = document.getElementById('work-timer');
if (timerEl) {
    const startTime = new Date(timerEl.dataset.start).getTime();
    function updateTimer() {
        const now = Date.now();
        const diff = Math.floor((now - startTime) / 1000);
        const hrs = String(Math.floor(diff / 3600)).padStart(2, '0');
        const mins = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
        const secs = String(diff % 60).padStart(2, '0');
        timerEl.textContent = hrs + ':' + mins + ':' + secs;
    }
    updateTimer();
    setInterval(updateTimer, 1000);
}
</script>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>






