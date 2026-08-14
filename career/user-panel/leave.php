<?php
$pageTitle = 'Leave Management';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
date_default_timezone_set('Asia/Kolkata');

$pdo = getDBConnection();
$userId = $_SESSION['user_id'];
$userType = $_SESSION['user_type'];
$currentYear = date('Y');
$successMsg = '';
$errorMsg = '';

// Ensure leave_requests columns exist
try { $pdo->exec("ALTER TABLE leave_requests ADD COLUMN total_days INT DEFAULT 1"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE leave_requests ADD COLUMN admin_remarks TEXT NULL"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE leave_requests ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"); } catch (Exception $e) {}

// Handle POST - submit leave request or cancel
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $postAction = $_POST['_post_action'] ?? 'submit';

    // Cancel leave via POST (CSRF-safe)
    if ($postAction === 'cancel') {
        $cancelId = intval($_POST['cancel_id'] ?? 0);
        if ($cancelId > 0) {
            $stmt = $pdo->prepare("SELECT * FROM leave_requests WHERE leave_id = ? AND user_id = ? AND status = 'pending'");
            $stmt->execute([$cancelId, $userId]);
            $cancelLeave = $stmt->fetch();
            if ($cancelLeave) {
                $stmt = $pdo->prepare("UPDATE leave_requests SET status = 'cancelled', admin_remarks = 'Cancelled by employee', updated_at = NOW() WHERE leave_id = ?");
                $stmt->execute([$cancelId]);
                $successMsg = 'Leave request cancelled successfully.';
            } else {
                $errorMsg = 'Unable to cancel this leave request.';
            }
        }
    } else {
    // Submit new leave request
    $leaveType = trim($_POST['leave_type'] ?? '');
    $startDate = trim($_POST['start_date'] ?? '');
    $endDate = trim($_POST['end_date'] ?? '');
    $reason = trim($_POST['reason'] ?? '');

    $validTypes = ['casual', 'sick', 'earned', 'unpaid'];

    if (!in_array($leaveType, $validTypes)) {
        $errorMsg = 'Please select a valid leave type.';
    } elseif (empty($startDate) || empty($endDate)) {
        $errorMsg = 'Please select both start and end dates.';
    } elseif ($startDate > $endDate) {
        $errorMsg = 'End date must be on or after start date.';
    } elseif ($startDate < date('Y-m-d')) {
        $errorMsg = 'Start date cannot be in the past.';
    } elseif (empty($reason)) {
        $errorMsg = 'Please provide a reason for your leave.';
    } else {
        // Calculate total days
        $start = new DateTime($startDate);
        $end = new DateTime($endDate);
        $totalDays = $start->diff($end)->days + 1;

        // Check for overlapping requests (fixed query - 6 placeholders, 7 values with userId)
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM leave_requests WHERE user_id = ? AND status IN ('pending', 'approved') AND ((start_date <= ? AND end_date >= ?) OR (start_date <= ? AND end_date >= ?) OR (start_date >= ? AND end_date <= ?))");
        $stmt->execute([$userId, $endDate, $startDate, $startDate, $endDate, $startDate, $endDate]);
        $overlap = $stmt->fetchColumn();

        if ($overlap > 0) {
            $errorMsg = 'You already have a leave request overlapping with these dates.';
        } else {
            // Check balance for non-unpaid leaves
            if ($leaveType !== 'unpaid') {
                $stmt = $pdo->prepare("SELECT total_days, used_days FROM leave_balances WHERE user_id = ? AND leave_type = ? AND year = ?");
                $stmt->execute([$userId, $leaveType, $currentYear]);
                $balance = $stmt->fetch();
                $defaultLeaves = ['casual' => 12, 'sick' => 6, 'earned' => 15];
                $defaultTotal = $defaultLeaves[$leaveType] ?? 0;
                $remaining = ($balance ? $balance['total_days'] - $balance['used_days'] : $defaultTotal);

                if ($totalDays > $remaining) {
                    $errorMsg = "Insufficient {$leaveType} leave balance. Available: {$remaining} days, Requested: {$totalDays} days.";
                }
            }

            if (empty($errorMsg)) {
                $stmt = $pdo->prepare("INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, reason, status, total_days, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'pending', ?, NOW(), NOW())");
                $stmt->execute([$userId, $leaveType, $startDate, $endDate, $reason, $totalDays]);
                $successMsg = 'Leave request submitted successfully.';
            }
        }
    }
    } // end submit
}

// Fetch leave balances
$leaveTypes = ['casual' => 12, 'sick' => 6, 'earned' => 15];
$balances = [];
foreach ($leaveTypes as $type => $defaultTotal) {
    $stmt = $pdo->prepare("SELECT total_days, used_days FROM leave_balances WHERE user_id = ? AND leave_type = ? AND year = ?");
    $stmt->execute([$userId, $type, $currentYear]);
    $bal = $stmt->fetch();
    $balances[$type] = [
        'total' => $bal ? $bal['total_days'] : $defaultTotal,
        'used' => $bal ? $bal['used_days'] : 0,
        'remaining' => $bal ? ($bal['total_days'] - $bal['used_days']) : $defaultTotal
    ];
}

// Fetch leave request history
$stmt = $pdo->prepare("SELECT * FROM leave_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 50");
$stmt->execute([$userId]);
$leaveHistory = $stmt->fetchAll();

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex min-h-[calc(100vh-56px)]">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 dashboard-content-area p-4 md:p-6 max-w-5xl">
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-ink"><i class="fas fa-calendar-minus mr-2 text-primary-600"></i>Leave Management</h1>
            <p class="text-ink-muted mt-1 text-sm">Apply for leave and track your leave balance</p>
        </div>

        <?php if ($successMsg): ?>
        <div class="bg-green-500/10 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center">
            <i class="fas fa-check-circle mr-2"></i><?= htmlspecialchars($successMsg, ENT_QUOTES, 'UTF-8', false) ?>
        </div>
        <?php endif; ?>
        <?php if ($errorMsg): ?>
        <div class="bg-red-500/10 border border-red-500/20 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center">
            <i class="fas fa-exclamation-circle mr-2"></i><?= htmlspecialchars($errorMsg, ENT_QUOTES, 'UTF-8', false) ?>
        </div>
        <?php endif; ?>

        <!-- Leave Balance Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-umbrella-beach text-primary-600"></i>
                    </div>
                    <div>
                        <p class="text-xs text-ink-muted uppercase font-semibold">Casual Leave</p>
                        <p class="text-sm text-ink-muted"><?= $balances['casual']['total'] ?> days/year</p>
                    </div>
                </div>
                <div class="flex items-end justify-between">
                    <div>
                        <p class="text-3xl font-bold text-primary-600"><?= $balances['casual']['remaining'] ?></p>
                        <p class="text-xs text-ink-muted">remaining</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm font-medium text-ink-muted"><?= $balances['casual']['used'] ?> used</p>
                    </div>
                </div>
                <div class="mt-3 w-full bg-surface-2 rounded-full h-2">
                    <div class="bg-primary-500 h-2 rounded-full" style="width: <?= $balances['casual']['total'] > 0 ? round(($balances['casual']['used'] / $balances['casual']['total']) * 100) : 0 ?>%"></div>
                </div>
            </div>

            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-briefcase-medical text-red-600"></i>
                    </div>
                    <div>
                        <p class="text-xs text-ink-muted uppercase font-semibold">Sick Leave</p>
                        <p class="text-sm text-ink-muted"><?= $balances['sick']['total'] ?> days/year</p>
                    </div>
                </div>
                <div class="flex items-end justify-between">
                    <div>
                        <p class="text-3xl font-bold text-red-600"><?= $balances['sick']['remaining'] ?></p>
                        <p class="text-xs text-ink-muted">remaining</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm font-medium text-ink-muted"><?= $balances['sick']['used'] ?> used</p>
                    </div>
                </div>
                <div class="mt-3 w-full bg-surface-2 rounded-full h-2">
                    <div class="bg-red-500 h-2 rounded-full" style="width: <?= $balances['sick']['total'] > 0 ? round(($balances['sick']['used'] / $balances['sick']['total']) * 100) : 0 ?>%"></div>
                </div>
            </div>

            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-award text-accent-600"></i>
                    </div>
                    <div>
                        <p class="text-xs text-ink-muted uppercase font-semibold">Earned Leave</p>
                        <p class="text-sm text-ink-muted"><?= $balances['earned']['total'] ?> days/year</p>
                    </div>
                </div>
                <div class="flex items-end justify-between">
                    <div>
                        <p class="text-3xl font-bold text-accent-600"><?= $balances['earned']['remaining'] ?></p>
                        <p class="text-xs text-ink-muted">remaining</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm font-medium text-ink-muted"><?= $balances['earned']['used'] ?> used</p>
                    </div>
                </div>
                <div class="mt-3 w-full bg-surface-2 rounded-full h-2">
                    <div class="bg-accent-500 h-2 rounded-full" style="width: <?= $balances['earned']['total'] > 0 ? round(($balances['earned']['used'] / $balances['earned']['total']) * 100) : 0 ?>%"></div>
                </div>
            </div>
        </div>

        <!-- Leave Request Form -->
        <div class="bg-surface-1 rounded-2xl shadow-none border border-hairline p-6 mb-6">
            <h2 class="text-lg font-semibold text-ink mb-4"><i class="fas fa-paper-plane mr-2 text-primary-600"></i>Request Leave</h2>
            <form method="POST" action="">
                <?= csrf_field() ?>
                <input type="hidden" name="_post_action" value="submit">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-medium text-ink-muted mb-1">Leave Type <span class="text-red-400">*</span></label>
                        <select name="leave_type" required class="w-full px-4 py-2.5 border border-hairline bg-surface-2 text-ink rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                            <option value="">Select leave type</option>
                            <option value="casual" <?= (($_POST['leave_type'] ?? '') === 'casual') ? 'selected' : '' ?>>Casual Leave (<?= $balances['casual']['remaining'] ?> remaining)</option>
                            <option value="sick" <?= (($_POST['leave_type'] ?? '') === 'sick') ? 'selected' : '' ?>>Sick Leave (<?= $balances['sick']['remaining'] ?> remaining)</option>
                            <option value="earned" <?= (($_POST['leave_type'] ?? '') === 'earned') ? 'selected' : '' ?>>Earned Leave (<?= $balances['earned']['remaining'] ?> remaining)</option>
                            <option value="unpaid" <?= (($_POST['leave_type'] ?? '') === 'unpaid') ? 'selected' : '' ?>>Unpaid Leave</option>
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Start Date <span class="text-red-400">*</span></label>
                            <input type="date" name="start_date" required min="<?= date('Y-m-d') ?>" value="<?= htmlspecialchars($_POST['start_date'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>"
                                   class="w-full px-4 py-2.5 border border-hairline bg-surface-2 text-ink rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">End Date <span class="text-red-400">*</span></label>
                            <input type="date" name="end_date" required min="<?= date('Y-m-d') ?>" value="<?= htmlspecialchars($_POST['end_date'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>"
                                   class="w-full px-4 py-2.5 border border-hairline bg-surface-2 text-ink rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                        </div>
                    </div>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-ink-muted mb-1">Reason <span class="text-red-400">*</span></label>
                    <textarea name="reason" required rows="3" placeholder="Briefly describe the reason for your leave..."
                              class="w-full px-4 py-2.5 border border-hairline bg-surface-2 text-ink rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm resize-none"><?= htmlspecialchars($_POST['reason'] ?? '', ENT_QUOTES, 'UTF-8', false) ?></textarea>
                </div>
                <div class="flex justify-end">
                    <button type="submit" class="inline-flex items-center px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-none transition-all text-sm">
                        <i class="fas fa-paper-plane mr-2"></i>Submit Request
                    </button>
                </div>
            </form>
        </div>

        <!-- Leave Request History -->
        <div class="bg-surface-1 rounded-2xl shadow-none border border-hairline">
            <div class="p-5 border-b border-hairline flex justify-between items-center">
                <h2 class="text-lg font-semibold text-ink"><i class="fas fa-history mr-2 text-primary-600"></i>Leave History</h2>
                <span class="text-xs text-ink-muted">Last 50 requests</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-surface-2">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase">Type</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase">From</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase">To</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase">Days</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase">Reason</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase">Status</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-hairline">
                        <?php if (empty($leaveHistory)): ?>
                            <tr><td colspan="7" class="px-4 py-10 text-center text-ink-muted">
                                <i class="fas fa-inbox text-4xl mb-3 block"></i>No leave requests yet.
                            </td></tr>
                        <?php else: ?>
                            <?php foreach ($leaveHistory as $leave):
                                $statusClasses = [
                                    'pending'   => 'bg-yellow-100 text-yellow-700',
                                    'approved'  => 'bg-green-100 text-green-700',
                                    'rejected'  => 'bg-red-100 text-red-700',
                                    'cancelled' => 'bg-surface-2 text-ink-muted'
                                ];
                                $statusIcons = [
                                    'pending'   => 'fa-clock',
                                    'approved'  => 'fa-check-circle',
                                    'rejected'  => 'fa-times-circle',
                                    'cancelled' => 'fa-ban'
                                ];
                                $statusLabels = [
                                    'pending'   => 'Pending',
                                    'approved'  => 'Approved',
                                    'rejected'  => 'Rejected',
                                    'cancelled' => 'Cancelled'
                                ];
                                $sc = $statusClasses[$leave['status']] ?? 'bg-surface-2 text-ink-muted';
                                $si = $statusIcons[$leave['status']] ?? 'fa-question';
                                $sl = $statusLabels[$leave['status']] ?? ucfirst($leave['status']);
                                $typeLabels = ['casual' => 'Casual', 'sick' => 'Sick', 'earned' => 'Earned', 'unpaid' => 'Unpaid'];
                                $typeColors = ['casual' => 'text-primary-600', 'sick' => 'text-red-600', 'earned' => 'text-accent-600', 'unpaid' => 'text-ink-muted'];
                            ?>
                            <tr class="hover:bg-surface-2">
                                <td class="px-4 py-3 font-medium <?= $typeColors[$leave['leave_type']] ?? 'text-ink-muted' ?>">
                                    <?= $typeLabels[$leave['leave_type']] ?? ucfirst($leave['leave_type']) ?>
                                </td>
                                <td class="px-4 py-3 text-ink-muted"><?= date('d M Y', strtotime($leave['start_date'])) ?></td>
                                <td class="px-4 py-3 text-ink-muted"><?= date('d M Y', strtotime($leave['end_date'])) ?></td>
                                <td class="px-4 py-3 text-ink-muted font-semibold"><?= $leave['total_days'] ?></td>
                                <td class="px-4 py-3 text-ink-muted max-w-xs truncate" title="<?= htmlspecialchars($leave['reason'], ENT_QUOTES, 'UTF-8', false) ?>"><?= htmlspecialchars($leave['reason'], ENT_QUOTES, 'UTF-8', false) ?></td>
                                <td class="px-4 py-3">
                                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold <?= $sc ?>">
                                        <i class="fas <?= $si ?> mr-1"></i><?= $sl ?>
                                    </span>
                                    <?php if (!empty($leave['admin_remarks'])): ?>
                                        <p class="text-xs text-ink-muted mt-1" title="<?= htmlspecialchars($leave['admin_remarks'], ENT_QUOTES, 'UTF-8', false) ?>"><i class="fas fa-comment-dots mr-1"></i><?= htmlspecialchars($leave['admin_remarks'], ENT_QUOTES, 'UTF-8', false) ?></p>
                                    <?php endif; ?>
                                </td>
                                <td class="px-4 py-3">
                                <?php if ($leave['status'] === 'pending'): ?>
                                        <form method="POST" action="" class="inline" onsubmit="return confirm('Are you sure you want to cancel this leave request?')">
                                            <?= csrf_field() ?>
                                            <input type="hidden" name="_post_action" value="cancel">
                                            <input type="hidden" name="cancel_id" value="<?= $leave['leave_id'] ?>">
                                            <button type="submit" class="inline-flex items-center px-3 py-1.5 bg-red-500/10 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium transition-colors">
                                                <i class="fas fa-times mr-1"></i>Cancel
                                            </button>
                                        </form>
                                    <?php else: ?>
                                        <span class="text-ink-muted opacity-50 text-xs">-</span>
                                    <?php endif; ?>
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
<?php require_once __DIR__ . '/../includes/footer.php'; ?>






