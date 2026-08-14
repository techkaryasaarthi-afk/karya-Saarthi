<?php
$pageTitle = 'Intern Dashboard';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireRole('intern');

$pdo = getDBConnection();
$userId = $_SESSION['user_id'];
$today = date('Y-m-d');

// Today's attendance
$stmt = $pdo->prepare("SELECT * FROM attendance WHERE user_id = ? AND date = ?");
$stmt->execute([$userId, $today]);
$todayAttendance = $stmt->fetch();

// Attendance stats this month
$stmt = $pdo->prepare("SELECT
    COUNT(*) as total_days,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as present_days,
    COALESCE(SUM(duration_minutes), 0) as total_minutes
    FROM attendance WHERE user_id = ? AND MONTH(date) = MONTH(CURRENT_DATE()) AND YEAR(date) = YEAR(CURRENT_DATE())");
$stmt->execute([$userId]);
$monthStats = $stmt->fetch();

// User info
$stmt = $pdo->prepare("SELECT * FROM users WHERE user_id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch();

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex min-h-[calc(100vh-56px)]">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 dashboard-content-area p-6">
        <!-- Announcements -->
        <?php require_once __DIR__ . '/../includes/announcements-banner.php'; ?>
        <!-- Welcome -->
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-ink">Intern Dashboard</h1>
            <p class="text-ink-muted mt-1">Welcome back, <?= htmlspecialchars($_SESSION['user_name'], ENT_QUOTES, 'UTF-8', false) ?>!
                <?php if ($user['college']): ?>
                    <span class="text-ink-muted">|</span> <?= htmlspecialchars($user['college'], ENT_QUOTES, 'UTF-8', false) ?>
                <?php endif; ?>
            </p>
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

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-ink-muted">Days Present (This Month)</p>
                        <p class="text-2xl font-bold text-ink"><?= $monthStats['present_days'] ?? 0 ?></p>
                    </div>
                    <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-calendar-check text-green-600 text-xl"></i>
                    </div>
                </div>
            </div>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-ink-muted">Total Hours (This Month)</p>
                        <p class="text-2xl font-bold text-primary-600"><?= floor(($monthStats['total_minutes'] ?? 0) / 60) ?>h</p>
                    </div>
                    <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-hourglass-half text-primary-600 text-xl"></i>
                    </div>
                </div>
            </div>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-ink-muted">Internship Status</p>
                        <p class="text-lg font-bold text-green-600"><?= ucfirst($user['status'] ?? 'active') ?></p>
                    </div>
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-user-graduate text-blue-600 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Assignments -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline">
                <div class="p-5 border-b border-hairline">
                    <h2 class="text-lg font-semibold text-ink"><i class="fas fa-book mr-2 text-primary-600"></i>Assignments</h2>
                </div>
                <div class="p-8 text-center text-ink-muted">
                    <i class="fas fa-book-open text-4xl mb-3 block"></i>
                    <p class="text-sm">No assignments posted yet.</p>
                    <p class="text-xs mt-1">Your assignments will appear here once assigned by your mentor.</p>
                </div>
            </div>

            <!-- Progress Tracker -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline">
                <div class="p-5 border-b border-hairline">
                    <h2 class="text-lg font-semibold text-ink"><i class="fas fa-chart-line mr-2 text-primary-600"></i>Progress Tracker</h2>
                </div>
                <div class="p-5">
                    <div class="space-y-4">
                        <div>
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-sm font-medium text-ink-muted">Onboarding</span>
                                <span class="text-sm text-green-600 font-medium">Complete</span>
                            </div>
                            <div class="w-full bg-surface-2 rounded-full h-2">
                                <div class="bg-green-500 h-2 rounded-full" style="width: 100%"></div>
                            </div>
                        </div>
                        <div>
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-sm font-medium text-ink-muted">Training Phase</span>
                                <span class="text-sm text-primary-600 font-medium">In Progress</span>
                            </div>
                            <div class="w-full bg-surface-2 rounded-full h-2">
                                <div class="bg-primary-500 h-2 rounded-full" style="width: 40%"></div>
                            </div>
                        </div>
                        <div>
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-sm font-medium text-ink-muted">Project Work</span>
                                <span class="text-sm text-ink-muted font-medium">Not Started</span>
                            </div>
                            <div class="w-full bg-surface-2 rounded-full h-2">
                                <div class="bg-surface-3 h-2 rounded-full" style="width: 0%"></div>
                            </div>
                        </div>
                        <div>
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-sm font-medium text-ink-muted">Final Review</span>
                                <span class="text-sm text-ink-muted font-medium">Not Started</span>
                            </div>
                            <div class="w-full bg-surface-2 rounded-full h-2">
                                <div class="bg-surface-3 h-2 rounded-full" style="width: 0%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Certificate Section -->
        <div class="bg-surface-1 rounded-xl shadow-none border border-hairline mt-6">
            <div class="p-5 border-b border-hairline">
                <h2 class="text-lg font-semibold text-ink"><i class="fas fa-certificate mr-2 text-primary-600"></i>Certificate</h2>
            </div>
            <div class="p-6">
                <div class="flex items-center justify-between bg-surface-2 rounded-xl p-5">
                    <div class="flex items-center space-x-4">
                        <div class="w-14 h-14 bg-amber-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-award text-amber-600 text-2xl"></i>
                        </div>
                        <div>
                            <h3 class="font-semibold text-ink">Internship Completion Certificate</h3>
                            <p class="text-sm text-ink-muted mt-1">Complete all phases and assignments to unlock your certificate.</p>
                        </div>
                    </div>
                    <button disabled class="inline-flex items-center px-5 py-2.5 bg-surface-3 text-ink-muted font-medium rounded-lg text-sm cursor-not-allowed">
                        <i class="fas fa-lock mr-2"></i> Locked
                    </button>
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






