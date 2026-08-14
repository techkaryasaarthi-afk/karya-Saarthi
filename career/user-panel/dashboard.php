<?php
$pageTitle = 'Dashboard';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireRole(['part_time', 'vendor', 'freelancer']);

$pdo = getDBConnection();
$userId = $_SESSION['user_id'];
$today = date('Y-m-d');

// Today's attendance
$stmt = $pdo->prepare("SELECT * FROM attendance WHERE user_id = ? AND date = ?");
$stmt->execute([$userId, $today]);
$todayAttendance = $stmt->fetch();

// Recent attendance (last 7 days)
$stmt = $pdo->prepare("SELECT * FROM attendance WHERE user_id = ? ORDER BY date DESC LIMIT 7");
$stmt->execute([$userId]);
$recentAttendance = $stmt->fetchAll();

// Earnings summary
$stmt = $pdo->prepare("SELECT
    COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as total_paid,
    COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as total_pending,
    COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) as total_approved
    FROM payments WHERE user_id = ? AND MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())");
$stmt->execute([$userId]);
$earningsData = $stmt->fetch();

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex min-h-[calc(100vh-56px)]">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 dashboard-content-area p-6">
        <!-- Announcements -->
        <?php require_once __DIR__ . '/../includes/announcements-banner.php'; ?>
        <!-- Welcome -->
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-ink">Dashboard</h1>
            <p class="text-ink-muted mt-1">Welcome back, <?= htmlspecialchars($_SESSION['user_name'], ENT_QUOTES, 'UTF-8', false) ?>!</p>
        </div>

        <!-- Attendance Widget -->
        <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-ink"><i class="fas fa-clock mr-2 text-primary-600"></i>Today's Attendance</h2>
                <span class="text-sm text-ink-muted"><?= date('l, d M Y') ?></span>
            </div>

            <?php if (!$todayAttendance): ?>
                <!-- Not Started -->
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
                <!-- Currently Working -->
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
                <!-- Completed -->
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

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Active Projects -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline">
                <div class="p-5 border-b border-hairline">
                    <h2 class="text-lg font-semibold text-ink"><i class="fas fa-project-diagram mr-2 text-primary-600"></i>Active Projects</h2>
                </div>
                <div class="p-8 text-center text-ink-muted">
                    <i class="fas fa-folder-open text-4xl mb-3 block"></i>
                    <p class="text-sm">No active projects assigned yet.</p>
                    <p class="text-xs mt-1">Projects will appear here once assigned by admin.</p>
                </div>
            </div>

            <!-- Earnings Summary -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline">
                <div class="p-5 border-b border-hairline">
                    <h2 class="text-lg font-semibold text-ink"><i class="fas fa-wallet mr-2 text-primary-600"></i>Earnings (This Month)</h2>
                </div>
                <div class="p-5 space-y-4">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-ink-muted">Paid</span>
                        <span class="text-lg font-bold text-green-600">₹<?= number_format($earningsData['total_paid'], 0) ?></span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-ink-muted">Approved</span>
                        <span class="text-lg font-bold text-blue-600">₹<?= number_format($earningsData['total_approved'], 0) ?></span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-ink-muted">Pending</span>
                        <span class="text-lg font-bold text-amber-600">₹<?= number_format($earningsData['total_pending'], 0) ?></span>
                    </div>
                    <a href="<?= BASE_PATH ?>/user-panel/earnings.php" class="block w-full text-center px-4 py-2 bg-surface-2 hover:bg-surface-2 text-ink-muted rounded-lg text-sm font-medium transition mt-2">
                        View Full Earnings <i class="fas fa-arrow-right ml-1"></i>
                    </a>
                </div>
            </div>
        </div>

        <!-- Recent Attendance Log -->
        <div class="bg-surface-1 rounded-xl shadow-none border border-hairline mt-6">
            <div class="p-5 border-b border-hairline flex items-center justify-between">
                <h2 class="text-lg font-semibold text-ink"><i class="fas fa-history mr-2 text-primary-600"></i>Recent Attendance</h2>
                <a href="<?= BASE_PATH ?>/user-panel/attendance.php" class="text-sm text-primary-600 hover:underline">View All</a>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-surface-2">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Date</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Start</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">End</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Duration</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-hairline">
                        <?php if (empty($recentAttendance)): ?>
                            <tr>
                                <td colspan="5" class="px-4 py-8 text-center text-ink-muted">No attendance records yet.</td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($recentAttendance as $att):
                                $attStatusClass = $att['status'] === 'completed' ? 'bg-green-100 text-green-700' : ($att['status'] === 'working' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700');
                            ?>
                            <tr class="hover:bg-surface-2">
                                <td class="px-4 py-3 font-medium text-ink"><?= date('d M Y', strtotime($att['date'])) ?></td>
                                <td class="px-4 py-3 text-ink-muted"><?= $att['start_time'] ? date('h:i A', strtotime($att['start_time'])) : '-' ?></td>
                                <td class="px-4 py-3 text-ink-muted"><?= $att['end_time'] ? date('h:i A', strtotime($att['end_time'])) : '-' ?></td>
                                <td class="px-4 py-3 text-ink-muted"><?= $att['duration_minutes'] ? floor($att['duration_minutes'] / 60) . 'h ' . ($att['duration_minutes'] % 60) . 'm' : '-' ?></td>
                                <td class="px-4 py-3">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium <?= $attStatusClass ?>">
                                        <?= ucfirst($att['status']) ?>
                                    </span>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<script>
// Work timer
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






