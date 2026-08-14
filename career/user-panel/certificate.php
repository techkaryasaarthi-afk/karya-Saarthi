<?php
$pageTitle = 'Certificate';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireRole(['intern']);

$pdo = getDBConnection();
$userId = $_SESSION['user_id'];
$userType = $_SESSION['user_type'];
$successMsg = '';
$errorMsg = '';

// Get user info
$stmt = $pdo->prepare("SELECT created_at, name, email FROM users WHERE user_id = ?");
$stmt->execute([$userId]);
$userInfo = $stmt->fetch();
$joinedDate = $userInfo['created_at'] ?? date('Y-m-d');
$daysSinceJoining = max(0, floor((time() - strtotime($joinedDate)) / 86400));

// Attendance stats
$stmt = $pdo->prepare("SELECT
    COUNT(*) as total_days,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as present_days
    FROM attendance WHERE user_id = ?");
$stmt->execute([$userId]);
$attendanceData = $stmt->fetch();
$presentDays = $attendanceData['present_days'] ?? 0;
$attendancePct = $daysSinceJoining > 0 ? min(100, round(($presentDays / $daysSinceJoining) * 100)) : 0;

// Task completion
$stmt = $pdo->prepare("SELECT
    COUNT(*) as total,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
    FROM tasks WHERE assigned_to = ?");
$stmt->execute([$userId]);
$taskData = $stmt->fetch();
$totalTasks = $taskData['total'] ?? 0;
$completedTasks = $taskData['completed'] ?? 0;
$allTasksComplete = ($totalTasks > 0 && $completedTasks >= $totalTasks);

// Eligibility checks
$minDays = 30;
$minAttendance = 80;
$hasMinDays = $daysSinceJoining >= $minDays;
$hasMinAttendance = $attendancePct >= $minAttendance;
$hasAllTasks = $allTasksComplete;
$isEligible = $hasMinDays && $hasMinAttendance && $hasAllTasks;

// Check if already requested
$stmt = $pdo->prepare("SELECT * FROM activity_logs WHERE user_id = ? AND action = 'certificate_request' ORDER BY created_at DESC LIMIT 1");
$stmt->execute([$userId]);
$existingRequest = $stmt->fetch();

// Handle certificate request
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'request_certificate') {
    if (!$isEligible) {
        $errorMsg = 'You are not yet eligible for a certificate. Please meet all requirements first.';
    } elseif ($existingRequest) {
        $errorMsg = 'You have already requested a certificate. Please wait for HR to process it.';
    } else {
        logActivity($userId, 'certificate_request', json_encode([
            'user_name' => $userInfo['name'],
            'email' => $userInfo['email'],
            'days_completed' => $daysSinceJoining,
            'attendance_pct' => $attendancePct,
            'tasks_completed' => $completedTasks . '/' . $totalTasks,
            'joined_date' => $joinedDate,
            'request_date' => date('Y-m-d H:i:s')
        ]));
        $successMsg = 'Certificate request submitted successfully! HR will review and process your request.';
        // Refresh request status
        $stmt = $pdo->prepare("SELECT * FROM activity_logs WHERE user_id = ? AND action = 'certificate_request' ORDER BY created_at DESC LIMIT 1");
        $stmt->execute([$userId]);
        $existingRequest = $stmt->fetch();
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
                <h1 class="text-2xl font-bold text-ink"><i class="fas fa-certificate mr-2 text-primary-600"></i>Internship Certificate</h1>
                <p class="text-ink-muted mt-1">Check your eligibility and request your internship completion certificate.</p>
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
                <div class="lg:col-span-2 space-y-6">
                    <!-- Internship Duration -->
                    <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6">
                        <div class="flex items-center space-x-4 mb-4">
                            <div class="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
                                <i class="fas fa-calendar-check text-primary-600 text-xl"></i>
                            </div>
                            <div>
                                <h2 class="text-lg font-semibold text-ink">Internship Duration</h2>
                                <p class="text-sm text-ink-muted">Your internship timeline at Karya Saarthi</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div class="bg-surface-2 rounded-lg p-4 text-center">
                                <p class="text-xs text-ink-muted uppercase tracking-wider mb-1">Joined Date</p>
                                <p class="text-lg font-bold text-ink"><?= date('d M Y', strtotime($joinedDate)) ?></p>
                            </div>
                            <div class="bg-surface-2 rounded-lg p-4 text-center">
                                <p class="text-xs text-ink-muted uppercase tracking-wider mb-1">Current Date</p>
                                <p class="text-lg font-bold text-ink"><?= date('d M Y') ?></p>
                            </div>
                            <div class="bg-primary-50 rounded-lg p-4 text-center">
                                <p class="text-xs text-primary-600 uppercase tracking-wider mb-1">Days Completed</p>
                                <p class="text-lg font-bold text-primary-700"><?= $daysSinceJoining ?> days</p>
                            </div>
                        </div>
                    </div>

                    <!-- Eligibility Requirements -->
                    <div class="bg-surface-1 rounded-xl shadow-none border border-hairline">
                        <div class="p-5 border-b border-hairline">
                            <h2 class="text-lg font-semibold text-ink"><i class="fas fa-clipboard-list mr-2 text-primary-600"></i>Eligibility Requirements</h2>
                        </div>
                        <div class="p-5 space-y-5">
                            <!-- Requirement 1: Min 30 days -->
                            <div>
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-8 h-8 rounded-full flex items-center justify-center <?= $hasMinDays ? 'bg-green-100 text-green-600' : 'bg-surface-2 text-ink-muted' ?>">
                                            <i class="fas <?= $hasMinDays ? 'fa-check' : 'fa-times' ?>"></i>
                                        </div>
                                        <div>
                                            <p class="text-sm font-medium text-ink">Minimum <?= $minDays ?> Days</p>
                                            <p class="text-xs text-ink-muted">Complete at least <?= $minDays ?> days of internship</p>
                                        </div>
                                    </div>
                                    <span class="text-sm font-bold <?= $hasMinDays ? 'text-green-600' : 'text-ink-muted' ?>">
                                        <?= $daysSinceJoining ?>/<?= $minDays ?>
                                    </span>
                                </div>
                                <div class="ml-11">
                                    <div class="w-full bg-surface-2 rounded-full h-2.5">
                                        <div class="h-2.5 rounded-full transition-all <?= $hasMinDays ? 'bg-green-500' : 'bg-amber-500' ?>" style="width: <?= min(100, round(($daysSinceJoining / $minDays) * 100)) ?>%"></div>
                                    </div>
                                    <p class="text-xs text-ink-muted mt-1"><?= min(100, round(($daysSinceJoining / $minDays) * 100)) ?>% complete</p>
                                </div>
                            </div>

                            <!-- Requirement 2: 80% Attendance -->
                            <div>
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-8 h-8 rounded-full flex items-center justify-center <?= $hasMinAttendance ? 'bg-green-100 text-green-600' : 'bg-surface-2 text-ink-muted' ?>">
                                            <i class="fas <?= $hasMinAttendance ? 'fa-check' : 'fa-times' ?>"></i>
                                        </div>
                                        <div>
                                            <p class="text-sm font-medium text-ink"><?= $minAttendance ?>% Attendance</p>
                                            <p class="text-xs text-ink-muted">Maintain at least <?= $minAttendance ?>% attendance rate</p>
                                        </div>
                                    </div>
                                    <span class="text-sm font-bold <?= $hasMinAttendance ? 'text-green-600' : 'text-ink-muted' ?>">
                                        <?= $attendancePct ?>%
                                    </span>
                                </div>
                                <div class="ml-11">
                                    <div class="w-full bg-surface-2 rounded-full h-2.5">
                                        <div class="h-2.5 rounded-full transition-all <?= $hasMinAttendance ? 'bg-green-500' : 'bg-amber-500' ?>" style="width: <?= min(100, round(($attendancePct / $minAttendance) * 100)) ?>%"></div>
                                    </div>
                                    <p class="text-xs text-ink-muted mt-1"><?= $presentDays ?> present days out of <?= $daysSinceJoining ?></p>
                                </div>
                            </div>

                            <!-- Requirement 3: All Tasks Complete -->
                            <div>
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-8 h-8 rounded-full flex items-center justify-center <?= $hasAllTasks ? 'bg-green-100 text-green-600' : 'bg-surface-2 text-ink-muted' ?>">
                                            <i class="fas <?= $hasAllTasks ? 'fa-check' : 'fa-times' ?>"></i>
                                        </div>
                                        <div>
                                            <p class="text-sm font-medium text-ink">All Tasks Completed</p>
                                            <p class="text-xs text-ink-muted">Complete all assigned tasks and assignments</p>
                                        </div>
                                    </div>
                                    <span class="text-sm font-bold <?= $hasAllTasks ? 'text-green-600' : 'text-ink-muted' ?>">
                                        <?= $completedTasks ?>/<?= $totalTasks ?>
                                    </span>
                                </div>
                                <div class="ml-11">
                                    <div class="w-full bg-surface-2 rounded-full h-2.5">
                                        <?php $taskProgPct = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0; ?>
                                        <div class="h-2.5 rounded-full transition-all <?= $hasAllTasks ? 'bg-green-500' : 'bg-amber-500' ?>" style="width: <?= $taskProgPct ?>%"></div>
                                    </div>
                                    <p class="text-xs text-ink-muted mt-1"><?= $taskProgPct ?>% tasks completed</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Action Section -->
                    <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6">
                        <?php if ($existingRequest): ?>
                            <div class="text-center py-4">
                                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i class="fas fa-hourglass-half text-blue-600 text-2xl"></i>
                                </div>
                                <h3 class="text-lg font-semibold text-ink mb-2">Certificate Request Submitted</h3>
                                <p class="text-sm text-ink-muted mb-2">Your request was submitted on <?= date('d M Y, h:i A', strtotime($existingRequest['created_at'])) ?></p>
                                <p class="text-sm text-ink-muted">HR is reviewing your request. You will be notified once your certificate is ready.</p>
                                <div class="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                                    <i class="fas fa-info-circle mr-1"></i> For queries, contact <a href="mailto:hr@karyasaarthi.com" class="font-medium underline">hr@karyasaarthi.com</a>
                                </div>
                            </div>
                        <?php elseif ($isEligible): ?>
                            <div class="text-center py-4">
                                <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i class="fas fa-award text-green-600 text-3xl"></i>
                                </div>
                                <h3 class="text-xl font-bold text-green-700 mb-2">Congratulations! You are eligible!</h3>
                                <p class="text-sm text-ink-muted mb-6">You have met all the requirements for your internship completion certificate.</p>
                                <form method="POST">
                                    <input type="hidden" name="action" value="request_certificate">
                                    <button type="submit" class="inline-flex items-center px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition text-lg">
                                        <i class="fas fa-certificate mr-2"></i>Request Certificate
                                    </button>
                                </form>
                            </div>
                        <?php else: ?>
                            <div class="text-center py-4">
                                <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i class="fas fa-hourglass-start text-amber-600 text-2xl"></i>
                                </div>
                                <h3 class="text-lg font-semibold text-ink mb-2">Not Yet Eligible</h3>
                                <p class="text-sm text-ink-muted mb-4">Keep up the good work! Complete the requirements above to become eligible for your certificate.</p>
                                <div class="inline-flex items-center px-4 py-2 bg-surface-2 text-ink-muted font-medium rounded-lg text-sm cursor-not-allowed">
                                    <i class="fas fa-lock mr-2"></i>Request Certificate (Locked)
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>

                <!-- Right Column -->
                <div class="space-y-6">
                    <!-- Eligibility Status -->
                    <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5">
                        <h3 class="font-semibold text-ink mb-4"><i class="fas fa-shield-alt mr-2 text-primary-600"></i>Eligibility Status</h3>
                        <div class="space-y-3">
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-ink-muted">Minimum Days</span>
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium <?= $hasMinDays ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' ?>">
                                    <?= $hasMinDays ? 'Passed' : 'Pending' ?>
                                </span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-ink-muted">Attendance Rate</span>
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium <?= $hasMinAttendance ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' ?>">
                                    <?= $hasMinAttendance ? 'Passed' : 'Pending' ?>
                                </span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-ink-muted">All Tasks Done</span>
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium <?= $hasAllTasks ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' ?>">
                                    <?= $hasAllTasks ? 'Passed' : 'Pending' ?>
                                </span>
                            </div>
                            <hr class="border-hairline">
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-semibold text-ink">Overall</span>
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold <?= $isEligible ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700' ?>">
                                    <?= $isEligible ? 'Eligible' : 'Not Eligible' ?>
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Stats -->
                    <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5">
                        <h3 class="font-semibold text-ink mb-4"><i class="fas fa-chart-pie mr-2 text-primary-600"></i>Quick Stats</h3>
                        <div class="space-y-3">
                            <div class="flex items-center justify-between p-3 bg-surface-2 rounded-lg">
                                <span class="text-sm text-ink-muted"><i class="fas fa-calendar mr-2 text-ink-muted"></i>Days</span>
                                <span class="text-sm font-bold text-ink"><?= $daysSinceJoining ?> / <?= $minDays ?>+</span>
                            </div>
                            <div class="flex items-center justify-between p-3 bg-surface-2 rounded-lg">
                                <span class="text-sm text-ink-muted"><i class="fas fa-clock mr-2 text-ink-muted"></i>Attendance</span>
                                <span class="text-sm font-bold text-ink"><?= $attendancePct ?>% / <?= $minAttendance ?>%</span>
                            </div>
                            <div class="flex items-center justify-between p-3 bg-surface-2 rounded-lg">
                                <span class="text-sm text-ink-muted"><i class="fas fa-tasks mr-2 text-ink-muted"></i>Tasks</span>
                                <span class="text-sm font-bold text-ink"><?= $completedTasks ?> / <?= $totalTasks ?></span>
                            </div>
                        </div>
                    </div>

                    <!-- Help -->
                    <div class="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl shadow-none p-5 text-white">
                        <h3 class="font-semibold mb-2"><i class="fas fa-question-circle mr-2"></i>Need Help?</h3>
                        <p class="text-sm text-primary-200 mb-3">Questions about your certificate or eligibility? Contact HR.</p>
                        <a href="<?= BASE_PATH ?>/user-panel/support.php" class="inline-flex items-center px-4 py-2 bg-surface-1 text-primary-700 font-medium rounded-lg text-sm hover:bg-primary-50 transition">
                            <i class="fas fa-headset mr-2"></i>Contact Support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>







