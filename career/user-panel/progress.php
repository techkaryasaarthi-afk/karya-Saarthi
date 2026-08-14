<?php
$pageTitle = 'My Progress';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireRole(['intern']);

$pdo = getDBConnection();
$userId = $_SESSION['user_id'];
$userType = $_SESSION['user_type'];

// Get user info (join date)
$stmt = $pdo->prepare("SELECT created_at, name FROM users WHERE user_id = ?");
$stmt->execute([$userId]);
$userInfo = $stmt->fetch();
$joinedDate = $userInfo['created_at'] ?? date('Y-m-d');
$daysSinceJoining = max(1, floor((time() - strtotime($joinedDate)) / 86400));

// Attendance stats
$stmt = $pdo->prepare("SELECT
    COUNT(*) as total_days,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as present_days
    FROM attendance WHERE user_id = ?");
$stmt->execute([$userId]);
$attendanceData = $stmt->fetch();
$totalAttendanceDays = max(1, $attendanceData['total_days'] ?? 1);
$presentDays = $attendanceData['present_days'] ?? 0;
$attendancePct = min(100, round(($presentDays / max(1, $daysSinceJoining)) * 100));

// Task stats
$stmt = $pdo->prepare("SELECT
    COUNT(*) as total,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
    FROM tasks WHERE assigned_to = ?");
$stmt->execute([$userId]);
$taskData = $stmt->fetch();
$totalTasks = $taskData['total'] ?? 0;
$completedTasks = $taskData['completed'] ?? 0;
$taskPct = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0;

// Overall score (weighted: 40% attendance + 40% tasks + 20% days active)
$daysActivePct = min(100, round(($daysSinceJoining / 90) * 100)); // 90 days ideal
$overallScore = round(($attendancePct * 0.4) + ($taskPct * 0.4) + ($daysActivePct * 0.2));

// Monthly attendance breakdown (last 6 months)
$stmt = $pdo->prepare("SELECT
    DATE_FORMAT(date, '%Y-%m') as month,
    COUNT(*) as total,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as present
    FROM attendance WHERE user_id = ?
    GROUP BY DATE_FORMAT(date, '%Y-%m')
    ORDER BY month DESC LIMIT 6");
$stmt->execute([$userId]);
$monthlyAttendance = array_reverse($stmt->fetchAll());

// KPI data (if table exists)
$kpiData = [];
try {
    $stmt = $pdo->prepare("SELECT * FROM performance_kpi WHERE user_id = ? ORDER BY created_at DESC LIMIT 5");
    $stmt->execute([$userId]);
    $kpiData = $stmt->fetchAll();
} catch (Exception $e) {
    // Table may not exist
}

// Onboarding checklist (if table exists)
$checklistItems = [];
try {
    $stmt = $pdo->prepare("SELECT * FROM onboarding_checklist WHERE user_id = ? ORDER BY id ASC");
    $stmt->execute([$userId]);
    $checklistItems = $stmt->fetchAll();
} catch (Exception $e) {
    // Table may not exist - provide defaults
    $checklistItems = [];
}

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex min-h-screen bg-surface-2">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1">
        <div class="p-4 sm:p-6 lg:p-8">
            <!-- Page Header -->
            <div class="mb-6">
                <h1 class="text-2xl font-bold text-ink"><i class="fas fa-chart-line mr-2 text-primary-600"></i>My Progress</h1>
                <p class="text-ink-muted mt-1">Track your internship progress and performance metrics.</p>
            </div>

            <!-- Overall Score Card -->
            <div class="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl shadow-lg p-6 mb-6 text-white">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 class="text-lg font-semibold mb-1">Overall Performance Score</h2>
                        <p class="text-primary-200 text-sm">Based on attendance, task completion, and active days</p>
                    </div>
                    <div class="flex items-center space-x-6">
                        <div class="relative w-24 h-24">
                            <svg class="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="8"/>
                                <circle cx="50" cy="50" r="40" fill="none" stroke="white" stroke-width="8" stroke-linecap="round"
                                    stroke-dasharray="<?= 2 * 3.14159 * 40 ?>"
                                    stroke-dashoffset="<?= 2 * 3.14159 * 40 * (1 - $overallScore / 100) ?>"/>
                            </svg>
                            <div class="absolute inset-0 flex items-center justify-center">
                                <span class="text-2xl font-bold"><?= $overallScore ?>%</span>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 gap-2 text-sm">
                            <div class="flex items-center space-x-2">
                                <span class="w-3 h-3 bg-green-400 rounded-full"></span>
                                <span>Attendance: <?= $attendancePct ?>%</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <span class="w-3 h-3 bg-blue-400 rounded-full"></span>
                                <span>Tasks: <?= $taskPct ?>%</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <span class="w-3 h-3 bg-amber-400 rounded-full"></span>
                                <span>Active: <?= $daysSinceJoining ?> days</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Metrics Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <!-- Attendance -->
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-sm font-semibold text-ink"><i class="fas fa-clock mr-2 text-green-600"></i>Attendance</h3>
                        <span class="text-2xl font-bold text-green-600"><?= $attendancePct ?>%</span>
                    </div>
                    <div class="w-full bg-surface-2 rounded-full h-3 mb-2">
                        <div class="bg-green-500 h-3 rounded-full transition-all" style="width: <?= $attendancePct ?>%"></div>
                    </div>
                    <p class="text-xs text-ink-muted"><?= $presentDays ?> present out of <?= $daysSinceJoining ?> days</p>
                </div>

                <!-- Tasks -->
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-sm font-semibold text-ink"><i class="fas fa-tasks mr-2 text-blue-600"></i>Tasks Completed</h3>
                        <span class="text-2xl font-bold text-blue-600"><?= $taskPct ?>%</span>
                    </div>
                    <div class="w-full bg-surface-2 rounded-full h-3 mb-2">
                        <div class="bg-blue-500 h-3 rounded-full transition-all" style="width: <?= $taskPct ?>%"></div>
                    </div>
                    <p class="text-xs text-ink-muted"><?= $completedTasks ?> of <?= $totalTasks ?> tasks completed</p>
                </div>

                <!-- Duration -->
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-sm font-semibold text-ink"><i class="fas fa-calendar mr-2 text-purple-600"></i>Internship Duration</h3>
                        <span class="text-2xl font-bold text-purple-600"><?= $daysSinceJoining ?></span>
                    </div>
                    <div class="w-full bg-surface-2 rounded-full h-3 mb-2">
                        <div class="bg-purple-500 h-3 rounded-full transition-all" style="width: <?= min(100, $daysActivePct) ?>%"></div>
                    </div>
                    <p class="text-xs text-ink-muted">Started <?= date('d M Y', strtotime($joinedDate)) ?></p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Monthly Progress Chart -->
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline">
                    <div class="p-5 border-b border-hairline">
                        <h2 class="text-lg font-semibold text-ink"><i class="fas fa-chart-bar mr-2 text-primary-600"></i>Monthly Attendance</h2>
                    </div>
                    <div class="p-5">
                        <?php if (empty($monthlyAttendance)): ?>
                            <div class="text-center py-6 text-ink-muted">
                                <i class="fas fa-chart-bar text-3xl mb-2 block"></i>
                                <p class="text-sm">No attendance data yet.</p>
                            </div>
                        <?php else: ?>
                            <div class="space-y-3">
                                <?php foreach ($monthlyAttendance as $ma):
                                    $maPct = $ma['total'] > 0 ? round(($ma['present'] / $ma['total']) * 100) : 0;
                                    $monthLabel = date('M Y', strtotime($ma['month'] . '-01'));
                                ?>
                                <div>
                                    <div class="flex items-center justify-between text-sm mb-1">
                                        <span class="text-ink-muted font-medium"><?= $monthLabel ?></span>
                                        <span class="text-ink-muted"><?= $ma['present'] ?>/<?= $ma['total'] ?> days (<?= $maPct ?>%)</span>
                                    </div>
                                    <div class="w-full bg-surface-2 rounded-full h-4">
                                        <div class="h-4 rounded-full transition-all <?= $maPct >= 80 ? 'bg-green-500' : ($maPct >= 60 ? 'bg-amber-500' : 'bg-red-500') ?>" style="width: <?= $maPct ?>%"></div>
                                    </div>
                                </div>
                                <?php endforeach; ?>
                            </div>
                            <div class="flex items-center gap-4 mt-4 text-xs text-ink-muted">
                                <span class="flex items-center"><span class="w-3 h-3 bg-green-500 rounded-full mr-1"></span> 80%+</span>
                                <span class="flex items-center"><span class="w-3 h-3 bg-amber-500 rounded-full mr-1"></span> 60-79%</span>
                                <span class="flex items-center"><span class="w-3 h-3 bg-red-500 rounded-full mr-1"></span> Below 60%</span>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>

                <!-- KPI & Checklist -->
                <div class="space-y-6">
                    <!-- KPI Section -->
                    <?php if (!empty($kpiData)): ?>
                    <div class="bg-surface-1 rounded-xl shadow-none border border-hairline">
                        <div class="p-5 border-b border-hairline">
                            <h2 class="text-lg font-semibold text-ink"><i class="fas fa-bullseye mr-2 text-primary-600"></i>Performance KPIs</h2>
                        </div>
                        <div class="p-5 space-y-3">
                            <?php foreach ($kpiData as $kpi): ?>
                            <div>
                                <div class="flex items-center justify-between text-sm mb-1">
                                    <span class="text-ink-muted font-medium"><?= htmlspecialchars($kpi['kpi_name'] ?? $kpi['metric_name'] ?? 'KPI', ENT_QUOTES, 'UTF-8', false) ?></span>
                                    <span class="font-bold text-primary-600"><?= htmlspecialchars($kpi['score'] ?? $kpi['value'] ?? '0', ENT_QUOTES, 'UTF-8', false) ?>/<?= htmlspecialchars($kpi['target'] ?? '100', ENT_QUOTES, 'UTF-8', false) ?></span>
                                </div>
                                <?php
                                    $kpiScore = floatval($kpi['score'] ?? $kpi['value'] ?? 0);
                                    $kpiTarget = floatval($kpi['target'] ?? 100);
                                    $kpiPct = $kpiTarget > 0 ? min(100, round(($kpiScore / $kpiTarget) * 100)) : 0;
                                ?>
                                <div class="w-full bg-surface-2 rounded-full h-2">
                                    <div class="bg-primary-500 h-2 rounded-full" style="width: <?= $kpiPct ?>%"></div>
                                </div>
                            </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                    <?php endif; ?>

                    <!-- Training Checklist -->
                    <div class="bg-surface-1 rounded-xl shadow-none border border-hairline">
                        <div class="p-5 border-b border-hairline">
                            <h2 class="text-lg font-semibold text-ink"><i class="fas fa-clipboard-check mr-2 text-primary-600"></i>Training Modules</h2>
                        </div>
                        <div class="p-5">
                            <?php if (!empty($checklistItems)): ?>
                                <div class="space-y-2">
                                    <?php
                                    $completedChecklist = 0;
                                    foreach ($checklistItems as $item):
                                        $isComplete = !empty($item['completed_at']) || !empty($item['is_completed']);
                                        if ($isComplete) $completedChecklist++;
                                    ?>
                                    <div class="flex items-center space-x-3 p-2 rounded-lg <?= $isComplete ? 'bg-green-500/10' : 'bg-surface-2' ?>">
                                        <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 <?= $isComplete ? 'bg-green-500 text-white' : 'bg-surface-2 text-ink-muted' ?>">
                                            <i class="fas <?= $isComplete ? 'fa-check' : 'fa-circle' ?>" style="font-size: 10px;"></i>
                                        </div>
                                        <span class="text-sm <?= $isComplete ? 'text-green-700 line-through' : 'text-ink-muted' ?>"><?= htmlspecialchars($item['title'] ?? $item['item_name'] ?? 'Module', ENT_QUOTES, 'UTF-8', false) ?></span>
                                    </div>
                                    <?php endforeach; ?>
                                    <div class="mt-3 pt-3 border-t border-hairline">
                                        <div class="flex items-center justify-between text-sm">
                                            <span class="text-ink-muted">Progress</span>
                                            <span class="font-bold text-primary-600"><?= $completedChecklist ?>/<?= count($checklistItems) ?></span>
                                        </div>
                                        <div class="w-full bg-surface-2 rounded-full h-2 mt-1">
                                            <?php $clPct = count($checklistItems) > 0 ? round(($completedChecklist / count($checklistItems)) * 100) : 0; ?>
                                            <div class="bg-primary-500 h-2 rounded-full" style="width: <?= $clPct ?>%"></div>
                                        </div>
                                    </div>
                                </div>
                            <?php else: ?>
                                <!-- Default training modules when no checklist data exists -->
                                <div class="space-y-2">
                                    <?php
                                    $defaultModules = [
                                        'Company orientation & introduction',
                                        'Workplace tools & platform training',
                                        'Role-specific onboarding',
                                        'HR policy & code of conduct review',
                                        'First task submission',
                                    ];
                                    foreach ($defaultModules as $i => $module):
                                        $isComplete = ($i < min(count($defaultModules), floor($daysSinceJoining / 7)));
                                    ?>
                                    <div class="flex items-center space-x-3 p-2 rounded-lg <?= $isComplete ? 'bg-green-500/10' : 'bg-surface-2' ?>">
                                        <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 <?= $isComplete ? 'bg-green-500 text-white' : 'bg-surface-2 text-ink-muted' ?>">
                                            <i class="fas <?= $isComplete ? 'fa-check' : 'fa-circle' ?>" style="font-size: 10px;"></i>
                                        </div>
                                        <span class="text-sm <?= $isComplete ? 'text-green-700' : 'text-ink-muted' ?>"><?= $module ?></span>
                                    </div>
                                    <?php endforeach; ?>
                                    <p class="text-xs text-ink-muted mt-3 italic">Training modules are tracked by your mentor.</p>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>







