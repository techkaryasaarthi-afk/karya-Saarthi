<?php
$pageTitle = 'Leave Management';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireAdmin();

$pdo = getDBConnection();
$message = '';
$messageType = '';

// Handle POST actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $postAction = $_POST['post_action'] ?? '';
    // CSRF protection on all admin POST actions
    if (!csrf_validate()) {
        $message = 'Invalid form submission (CSRF). Please try again.';
        $messageType = 'error';
    } else {

    if ($postAction === 'grant_leave') {
        $targetUserId = trim($_POST['target_user_id'] ?? '');
        $leaveType = trim($_POST['leave_type'] ?? '');
        $startDate = trim($_POST['start_date'] ?? '');
        $endDate = trim($_POST['end_date'] ?? '');
        $adminRemarks = trim($_POST['admin_remarks'] ?? '');

        $validTypes = ['casual', 'sick', 'earned', 'unpaid'];

        if (empty($targetUserId) || !in_array($leaveType, $validTypes) || empty($startDate) || empty($endDate)) {
            $message = 'Please select a valid user, leave type, and start/end dates.';
            $messageType = 'error';
        } elseif ($startDate > $endDate) {
            $message = 'End date must be on or after start date.';
            $messageType = 'error';
        } else {
            // Check if user exists
            $userCheck = $pdo->prepare("SELECT name FROM users WHERE user_id = ?");
            $userCheck->execute([$targetUserId]);
            $targetUser = $userCheck->fetch();

            if (!$targetUser) {
                $message = 'Target user not found.';
                $messageType = 'error';
            } else {
                $start = new DateTime($startDate);
                $end = new DateTime($endDate);
                $totalDays = $start->diff($end)->days + 1;
                $remarks = $adminRemarks ?: 'Granted by Admin';

                try {
                    $stmt = $pdo->prepare("INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, reason, status, approved_by, admin_remarks, total_days, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'approved', ?, ?, ?, NOW(), NOW())");
                    $stmt->execute([$targetUserId, $leaveType, $startDate, $endDate, 'Granted directly by Admin', $_SESSION['user_id'], $remarks, $totalDays]);
                    
                    $year = date('Y', strtotime($startDate));
                    syncLeaveBalance($pdo, $targetUserId, $leaveType, $totalDays, $year);

                    $message = "Leave of {$totalDays} day(s) ({$leaveType}) successfully granted to " . htmlspecialchars($targetUser['name'], ENT_QUOTES, 'UTF-8', false) . "!";
                    $messageType = 'success';
                    logActivity($_SESSION['user_id'], 'grant_leave', "Granted {$totalDays} day(s) {$leaveType} leave to {$targetUserId}");
                } catch (Exception $e) {
                    $message = 'Error granting leave: ' . $e->getMessage();
                    $messageType = 'error';
                }
            }
        }
    }

    if ($postAction === 'approve_leave') {
        $leaveId = intval($_POST['leave_id'] ?? 0);
        $adminRemarks = trim($_POST['admin_remarks'] ?? '');
        if ($leaveId > 0) {
            try {
                $checkStmt = $pdo->prepare("SELECT * FROM leave_requests WHERE leave_id = ? AND status = 'pending'");
                $checkStmt->execute([$leaveId]);
                $leaveReq = $checkStmt->fetch();

                if ($leaveReq) {
                    $stmt = $pdo->prepare("UPDATE leave_requests SET status = 'approved', approved_by = ?, admin_remarks = ? WHERE leave_id = ? AND status = 'pending'");
                    $stmt->execute([$_SESSION['user_id'], $adminRemarks, $leaveId]);

                    $year = date('Y', strtotime($leaveReq['start_date']));
                    syncLeaveBalance($pdo, $leaveReq['user_id'], $leaveReq['leave_type'], $leaveReq['total_days'], $year);

                    $message = 'Leave request approved successfully!';
                    $messageType = 'success';
                    logActivity($_SESSION['user_id'], 'approve_leave', "Approved leave request #$leaveId");
                } else {
                    $message = 'Leave request not found or already processed.';
                    $messageType = 'error';
                }
            } catch (Exception $e) {
                $message = 'Error: ' . $e->getMessage();
                $messageType = 'error';
            }
        }
    }

    if ($postAction === 'delete_leave') {
        $leaveId = intval($_POST['leave_id'] ?? 0);
        if ($leaveId > 0) {
            try {
                // Fetch the record before deleting so we can reverse balance if approved
                $delStmt = $pdo->prepare("SELECT * FROM leave_requests WHERE leave_id = ?");
                $delStmt->execute([$leaveId]);
                $delRecord = $delStmt->fetch();

                $pdo->prepare("DELETE FROM leave_requests WHERE leave_id = ?")->execute([$leaveId]);

                // If the deleted request was approved, restore the leave balance
                if ($delRecord && $delRecord['status'] === 'approved' && $delRecord['leave_type'] !== 'unpaid') {
                    $year = date('Y', strtotime($delRecord['start_date']));
                    $pdo->prepare("UPDATE leave_balances SET used_days = GREATEST(0, used_days - ?) WHERE user_id = ? AND leave_type = ? AND year = ?")
                        ->execute([$delRecord['total_days'], $delRecord['user_id'], $delRecord['leave_type'], $year]);
                }

                $message = "Leave request #$leaveId deleted permanently!";
                $messageType = 'success';
                logActivity($_SESSION['user_id'], 'delete_leave', "Deleted leave request #$leaveId");
            } catch (Exception $e) {
                $message = 'Error: ' . $e->getMessage();
                $messageType = 'error';
            }
        }
    }

    if ($postAction === 'reject_leave') {
        $leaveId = intval($_POST['leave_id'] ?? 0);
        $adminRemarks = trim($_POST['admin_remarks'] ?? '');
        if ($leaveId > 0) {
            try {
                $stmt = $pdo->prepare("UPDATE leave_requests SET status = 'rejected', approved_by = ?, admin_remarks = ? WHERE leave_id = ? AND status = 'pending'");
                $stmt->execute([$_SESSION['user_id'], $adminRemarks, $leaveId]);
                if ($stmt->rowCount() > 0) {
                    $message = 'Leave request rejected.';
                    $messageType = 'success';
                    logActivity($_SESSION['user_id'], 'reject_leave', "Rejected leave request #$leaveId");
                } else {
                    $message = 'Leave request not found or already processed.';
                    $messageType = 'error';
                }
            } catch (Exception $e) {
                $message = 'Error: ' . $e->getMessage();
                $messageType = 'error';
            }
        }
    }
    } // end CSRF else block
} // end POST

// Who's on leave today
$stmtOnLeave = $pdo->query("SELECT u.name, u.user_type, lr.leave_type, lr.start_date, lr.end_date
    FROM leave_requests lr
    JOIN users u ON lr.user_id = u.user_id
    WHERE lr.status = 'approved' AND CURDATE() BETWEEN lr.start_date AND lr.end_date");
$onLeaveToday = $stmtOnLeave->fetchAll();

// Stats
$pendingCount = $pdo->query("SELECT COUNT(*) FROM leave_requests WHERE status = 'pending'")->fetchColumn();
$approvedToday = $pdo->query("SELECT COUNT(*) FROM leave_requests WHERE status = 'approved' AND DATE(updated_at) = CURDATE()")->fetchColumn();
$onLeaveCount = count($onLeaveToday);
$monthStart = date('Y-m-01');
$monthEnd = date('Y-m-t');
$stmtMonthTotal = $pdo->prepare("SELECT COUNT(*) FROM leave_requests WHERE created_at BETWEEN ? AND ?");
$stmtMonthTotal->execute([$monthStart . ' 00:00:00', $monthEnd . ' 23:59:59']);
$totalThisMonth = $stmtMonthTotal->fetchColumn();

// Pending leave requests
$stmtPending = $pdo->query("SELECT lr.*, u.name, u.user_type
    FROM leave_requests lr
    JOIN users u ON lr.user_id = u.user_id
    WHERE lr.status = 'pending'
    ORDER BY lr.created_at ASC");
$pendingRequests = $stmtPending->fetchAll();

// All leave requests with filters
$filterStatus = $_GET['filter_status'] ?? '';
$filterUser = $_GET['filter_user'] ?? '';
$filterDateFrom = $_GET['filter_date_from'] ?? '';
$filterDateTo = $_GET['filter_date_to'] ?? '';

$allQuery = "SELECT lr.*, u.name, u.user_type, approver.name AS approved_by_name
    FROM leave_requests lr
    JOIN users u ON lr.user_id = u.user_id
    LEFT JOIN users approver ON lr.approved_by = approver.user_id
    WHERE 1=1";
$allParams = [];

if (!empty($filterStatus)) {
    $allQuery .= " AND lr.status = ?";
    $allParams[] = $filterStatus;
}
if (!empty($filterUser)) {
    $allQuery .= " AND lr.user_id = ?";
    $allParams[] = $filterUser;
}
if (!empty($filterDateFrom)) {
    $allQuery .= " AND lr.start_date >= ?";
    $allParams[] = $filterDateFrom;
}
if (!empty($filterDateTo)) {
    $allQuery .= " AND lr.end_date <= ?";
    $allParams[] = $filterDateTo;
}

$allQuery .= " ORDER BY lr.created_at DESC";
$stmtAll = $pdo->prepare($allQuery);
$stmtAll->execute($allParams);
$allRequests = $stmtAll->fetchAll();

// Get all active users for filter dropdown
$activeUsers = $pdo->query("SELECT user_id, name, user_type FROM users WHERE status = 'active' AND user_type != 'admin' ORDER BY name")->fetchAll();

// Leave type badge colors
$leaveTypeBadges = [
    'casual'  => 'bg-blue-100 text-blue-700',
    'sick'    => 'bg-red-100 text-red-700',
    'earned'  => 'bg-green-100 text-green-700',
    'unpaid'  => 'bg-surface-2 text-ink-muted',
];

$statusBadges = [
    'pending'  => 'bg-amber-100 text-amber-700',
    'approved' => 'bg-green-100 text-green-700',
    'rejected' => 'bg-red-100 text-red-700',
];

$typeBadgeColors = [
    'vendor'         => 'bg-blue-100 text-blue-700',
    'employee'       => 'bg-amber-100 text-amber-700',
    'intern'         => 'bg-green-100 text-green-700',
    'campus_saarthi' => 'bg-purple-100 text-purple-700',
];

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 dashboard-content-area p-4 md:p-6">
        <div class="flex flex-wrap justify-between items-center mb-6 gap-4">
            <div>
                <h1 class="text-2xl font-bold text-ink"><i class="fas fa-calendar-minus mr-2 text-primary-600"></i>Leave Management</h1>
                <p class="text-sm text-ink-muted mt-1">Review, approve & track employee leave requests</p>
            </div>
            <button onclick="document.getElementById('grantLeaveCard').classList.toggle('hidden')" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition flex items-center">
                <i class="fas fa-plus-circle mr-2 text-base"></i>Grant Leave to User
            </button>
        </div>

        <!-- Grant Leave Form Card -->
        <div id="grantLeaveCard" class="hidden bg-surface-1 rounded-2xl shadow-none border border-hairline p-6 mb-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-ink"><i class="fas fa-user-plus mr-2 text-primary-600"></i>Grant Leave to User</h3>
                <button onclick="document.getElementById('grantLeaveCard').classList.add('hidden')" class="text-ink-muted hover:text-ink text-sm"><i class="fas fa-times text-lg"></i></button>
            </div>
            <form method="POST" action="">
                <input type="hidden" name="post_action" value="grant_leave">
                <?= csrf_field() ?>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label class="block text-xs font-medium text-ink-muted mb-1">Select User <span class="text-red-400">*</span></label>
                        <select name="target_user_id" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                            <option value="">Choose User...</option>
                            <?php foreach ($activeUsers as $au): ?>
                            <option value="<?= $au['user_id'] ?>"><?= htmlspecialchars($au['name'], ENT_QUOTES, 'UTF-8', false) ?> (<?= $au['user_id'] ?> - <?= ucfirst(str_replace('_',' ',$au['user_type'])) ?>)</option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-ink-muted mb-1">Leave Type <span class="text-red-400">*</span></label>
                        <select name="leave_type" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                            <option value="casual">Casual Leave</option>
                            <option value="sick">Sick Leave</option>
                            <option value="earned">Earned Leave</option>
                            <option value="unpaid">Unpaid Leave</option>
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="block text-xs font-medium text-ink-muted mb-1">Start Date <span class="text-red-400">*</span></label>
                            <input type="date" name="start_date" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-ink-muted mb-1">End Date <span class="text-red-400">*</span></label>
                            <input type="date" name="end_date" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                    </div>
                </div>
                <div class="mb-4">
                    <label class="block text-xs font-medium text-ink-muted mb-1">Admin Remarks / Reason</label>
                    <input type="text" name="admin_remarks" placeholder="e.g. Approved for personal emergency, Granted by HR, etc." class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                </div>
                <div class="flex justify-end gap-3">
                    <button type="button" onclick="document.getElementById('grantLeaveCard').classList.add('hidden')" class="px-4 py-2 border border-hairline bg-surface-2 text-ink-muted rounded-lg text-sm font-medium">Cancel</button>
                    <button type="submit" class="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition"><i class="fas fa-check-circle mr-1.5"></i>Grant & Approve Leave</button>
                </div>
            </form>
        </div>

        <!-- Messages -->
        <?php if ($message): ?>
        <div class="mb-4 px-4 py-3 rounded-lg text-sm font-medium <?= $messageType === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-500/20' ?>">
            <i class="fas <?= $messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle' ?> mr-1"></i>
            <?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8', false) ?>
        </div>
        <?php endif; ?>

        <!-- Who's On Leave Today -->
        <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5 mb-6">
            <h3 class="text-lg font-semibold text-ink mb-3">
                <i class="fas fa-user-clock text-orange-500 mr-2"></i>Who's On Leave Today
            </h3>
            <?php if (empty($onLeaveToday)): ?>
            <p class="text-sm text-ink-muted"><i class="fas fa-check-circle text-green-400 mr-1"></i>Everyone is at work today!</p>
            <?php else: ?>
            <div class="flex flex-wrap gap-3">
                <?php foreach ($onLeaveToday as $ol): ?>
                <div class="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2">
                    <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-user text-orange-500 text-sm"></i>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-ink"><?= htmlspecialchars($ol['name'], ENT_QUOTES, 'UTF-8', false) ?></p>
                        <span class="text-xs px-1.5 py-0.5 rounded <?= $leaveTypeBadges[$ol['leave_type']] ?? 'bg-surface-2 text-ink-muted' ?>"><?= ucfirst($ol['leave_type']) ?> Leave</span>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4 text-center">
                <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <i class="fas fa-hourglass-half text-amber-600"></i>
                </div>
                <p class="text-2xl font-bold text-amber-600"><?= $pendingCount ?></p>
                <p class="text-xs text-ink-muted">Pending Requests</p>
            </div>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4 text-center">
                <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <i class="fas fa-check-circle text-green-600"></i>
                </div>
                <p class="text-2xl font-bold text-green-600"><?= $approvedToday ?></p>
                <p class="text-xs text-ink-muted">Approved Today</p>
            </div>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4 text-center">
                <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <i class="fas fa-user-minus text-orange-600"></i>
                </div>
                <p class="text-2xl font-bold text-orange-600"><?= $onLeaveCount ?></p>
                <p class="text-xs text-ink-muted">On Leave Today</p>
            </div>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4 text-center">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <i class="fas fa-calendar-alt text-blue-600"></i>
                </div>
                <p class="text-2xl font-bold text-blue-600"><?= $totalThisMonth ?></p>
                <p class="text-xs text-ink-muted">Total This Month</p>
            </div>
        </div>

        <!-- Pending Leave Requests -->
        <div class="bg-surface-1 rounded-xl shadow-none border border-hairline mb-6">
            <div class="p-5 border-b border-hairline">
                <h3 class="text-lg font-semibold text-ink">
                    <i class="fas fa-exclamation-triangle text-amber-500 mr-2"></i>Pending Leave Requests
                    <?php if ($pendingCount > 0): ?>
                    <span class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-2"><?= $pendingCount ?> pending</span>
                    <?php endif; ?>
                </h3>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-surface-2">
                        <tr>
                            <th class="px-4 py-3 text-left font-semibold text-ink-muted text-xs uppercase">Employee</th>
                            <th class="px-4 py-3 text-left font-semibold text-ink-muted text-xs uppercase">Type</th>
                            <th class="px-4 py-3 text-left font-semibold text-ink-muted text-xs uppercase">Leave Type</th>
                            <th class="px-4 py-3 text-left font-semibold text-ink-muted text-xs uppercase">Start Date</th>
                            <th class="px-4 py-3 text-left font-semibold text-ink-muted text-xs uppercase">End Date</th>
                            <th class="px-4 py-3 text-center font-semibold text-ink-muted text-xs uppercase">Days</th>
                            <th class="px-4 py-3 text-left font-semibold text-ink-muted text-xs uppercase">Reason</th>
                            <th class="px-4 py-3 text-left font-semibold text-ink-muted text-xs uppercase">Applied On</th>
                            <th class="px-4 py-3 text-center font-semibold text-ink-muted text-xs uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-hairline">
                        <?php if (empty($pendingRequests)): ?>
                        <tr><td colspan="9" class="px-4 py-8 text-center text-ink-muted"><i class="fas fa-inbox text-3xl mb-2 block"></i>No pending leave requests.</td></tr>
                        <?php else: ?>
                        <?php foreach ($pendingRequests as $pr): ?>
                        <tr class="hover:bg-surface-2">
                            <td class="px-4 py-3">
                                <div class="font-medium text-ink"><?= htmlspecialchars($pr['name'], ENT_QUOTES, 'UTF-8', false) ?></div>
                                <div class="text-xs text-ink-muted"><?= $pr['user_id'] ?></div>
                            </td>
                            <td class="px-4 py-3">
                                <span class="px-2 py-0.5 rounded-full text-xs font-medium <?= $typeBadgeColors[$pr['user_type']] ?? 'bg-surface-2 text-ink-muted' ?>"><?= ucfirst(str_replace('_', ' ', $pr['user_type'])) ?></span>
                            </td>
                            <td class="px-4 py-3">
                                <span class="px-2 py-0.5 rounded-full text-xs font-semibold <?= $leaveTypeBadges[$pr['leave_type']] ?? 'bg-surface-2 text-ink-muted' ?>"><?= ucfirst($pr['leave_type']) ?></span>
                            </td>
                            <td class="px-4 py-3 text-ink-muted"><?= date('d M Y', strtotime($pr['start_date'])) ?></td>
                            <td class="px-4 py-3 text-ink-muted"><?= date('d M Y', strtotime($pr['end_date'])) ?></td>
                            <td class="px-4 py-3 text-center font-bold text-ink-muted"><?= $pr['total_days'] ?></td>
                            <td class="px-4 py-3 text-ink-muted max-w-xs">
                                <p class="truncate" title="<?= htmlspecialchars($pr['reason'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>"><?= htmlspecialchars($pr['reason'] ?? '-', ENT_QUOTES, 'UTF-8', false) ?></p>
                            </td>
                            <td class="px-4 py-3 text-xs text-ink-muted"><?= date('d M Y h:i A', strtotime($pr['created_at'])) ?></td>
                            <td class="px-4 py-3">
                                <div class="flex flex-col gap-2 items-center">
                                    <input type="text" id="remarks-<?= $pr['leave_id'] ?>" placeholder="Remarks (optional)" class="w-full border border-hairline bg-surface-2 text-ink rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary-500 focus:border-primary-500">
                                    <div class="flex gap-1">
                                        <form method="POST" class="inline">
                                            <input type="hidden" name="post_action" value="approve_leave">
                                            <input type="hidden" name="leave_id" value="<?= $pr['leave_id'] ?>">
                                            <input type="hidden" name="admin_remarks" value="" id="approve-remarks-<?= $pr['leave_id'] ?>">
                                            <?= csrf_field() ?>
                                            <button type="submit" onclick="document.getElementById('approve-remarks-<?= $pr['leave_id'] ?>').value = document.getElementById('remarks-<?= $pr['leave_id'] ?>').value" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-medium transition">
                                                <i class="fas fa-check mr-1"></i>Approve
                                            </button>
                                        </form>
                                        <form method="POST" class="inline">
                                            <input type="hidden" name="post_action" value="reject_leave">
                                            <input type="hidden" name="leave_id" value="<?= $pr['leave_id'] ?>">
                                            <input type="hidden" name="admin_remarks" value="" id="reject-remarks-<?= $pr['leave_id'] ?>">
                                            <?= csrf_field() ?>
                                            <button type="submit" onclick="document.getElementById('reject-remarks-<?= $pr['leave_id'] ?>').value = document.getElementById('remarks-<?= $pr['leave_id'] ?>').value" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-medium transition">
                                                <i class="fas fa-times mr-1"></i>Reject
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- All Leave Requests -->
        <div class="bg-surface-1 rounded-xl shadow-none border border-hairline">
            <div class="p-5 border-b border-hairline">
                <h3 class="text-lg font-semibold text-ink"><i class="fas fa-list text-primary-500 mr-2"></i>All Leave Requests</h3>
            </div>

            <!-- Filters -->
            <form method="GET" class="p-5 border-b border-hairline flex flex-wrap items-end gap-3">
                <div>
                    <label class="block text-xs font-medium text-ink-muted mb-1">Status</label>
                    <select name="filter_status" class="border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                        <option value="">All Status</option>
                        <option value="pending" <?= $filterStatus === 'pending' ? 'selected' : '' ?>>Pending</option>
                        <option value="approved" <?= $filterStatus === 'approved' ? 'selected' : '' ?>>Approved</option>
                        <option value="rejected" <?= $filterStatus === 'rejected' ? 'selected' : '' ?>>Rejected</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-ink-muted mb-1">Employee</label>
                    <select name="filter_user" class="border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                        <option value="">All Employees</option>
                        <?php foreach ($activeUsers as $u): ?>
                        <option value="<?= $u['user_id'] ?>" <?= $filterUser === $u['user_id'] ? 'selected' : '' ?>><?= htmlspecialchars($u['name'], ENT_QUOTES, 'UTF-8', false) ?> (<?= $u['user_id'] ?>)</option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-ink-muted mb-1">From Date</label>
                    <input type="date" name="filter_date_from" value="<?= htmlspecialchars($filterDateFrom, ENT_QUOTES, 'UTF-8', false) ?>" class="border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-xs font-medium text-ink-muted mb-1">To Date</label>
                    <input type="date" name="filter_date_to" value="<?= htmlspecialchars($filterDateTo, ENT_QUOTES, 'UTF-8', false) ?>" class="border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                </div>
                <button type="submit" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"><i class="fas fa-filter mr-1"></i>Apply</button>
                <a href="<?= BASE_PATH ?>/admin/leave.php" class="text-ink-muted hover:text-ink-muted text-sm px-3 py-2">Clear</a>
            </form>

            <!-- All Requests Table -->
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-surface-2">
                        <tr>
                            <th class="px-4 py-3 text-left font-semibold text-ink-muted text-xs uppercase">Employee</th>
                            <th class="px-4 py-3 text-left font-semibold text-ink-muted text-xs uppercase">Type</th>
                            <th class="px-4 py-3 text-left font-semibold text-ink-muted text-xs uppercase">Leave Type</th>
                            <th class="px-4 py-3 text-left font-semibold text-ink-muted text-xs uppercase">Start Date</th>
                            <th class="px-4 py-3 text-left font-semibold text-ink-muted text-xs uppercase">End Date</th>
                            <th class="px-4 py-3 text-center font-semibold text-ink-muted text-xs uppercase">Days</th>
                            <th class="px-4 py-3 text-left font-semibold text-ink-muted text-xs uppercase">Reason</th>
                            <th class="px-4 py-3 text-left font-semibold text-ink-muted text-xs uppercase">Status</th>
                            <th class="px-4 py-3 text-left font-semibold text-ink-muted text-xs uppercase">Approved By</th>
                            <th class="px-4 py-3 text-left font-semibold text-ink-muted text-xs uppercase">Remarks</th>
                            <th class="px-4 py-3 text-left font-semibold text-ink-muted text-xs uppercase">Applied On</th>
                            <th class="px-4 py-3 text-center font-semibold text-ink-muted text-xs uppercase">Delete</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-hairline">
                        <?php if (empty($allRequests)): ?>
                        <tr><td colspan="12" class="px-4 py-8 text-center text-ink-muted"><i class="fas fa-inbox text-3xl mb-2 block"></i>No leave requests found.</td></tr>
                        <?php else: ?>
                        <?php foreach ($allRequests as $lr): ?>
                        <tr class="hover:bg-surface-2">
                            <td class="px-4 py-3">
                                <div class="font-medium text-ink"><?= htmlspecialchars($lr['name'], ENT_QUOTES, 'UTF-8', false) ?></div>
                                <div class="text-xs text-ink-muted"><?= $lr['user_id'] ?></div>
                            </td>
                            <td class="px-4 py-3">
                                <span class="px-2 py-0.5 rounded-full text-xs font-medium <?= $typeBadgeColors[$lr['user_type']] ?? 'bg-surface-2 text-ink-muted' ?>"><?= ucfirst(str_replace('_', ' ', $lr['user_type'])) ?></span>
                            </td>
                            <td class="px-4 py-3">
                                <span class="px-2 py-0.5 rounded-full text-xs font-semibold <?= $leaveTypeBadges[$lr['leave_type']] ?? 'bg-surface-2 text-ink-muted' ?>"><?= ucfirst($lr['leave_type']) ?></span>
                            </td>
                            <td class="px-4 py-3 text-ink-muted"><?= date('d M Y', strtotime($lr['start_date'])) ?></td>
                            <td class="px-4 py-3 text-ink-muted"><?= date('d M Y', strtotime($lr['end_date'])) ?></td>
                            <td class="px-4 py-3 text-center font-bold text-ink-muted"><?= $lr['total_days'] ?></td>
                            <td class="px-4 py-3 text-ink-muted max-w-xs">
                                <p class="truncate" title="<?= htmlspecialchars($lr['reason'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>"><?= htmlspecialchars($lr['reason'] ?? '-', ENT_QUOTES, 'UTF-8', false) ?></p>
                            </td>
                            <td class="px-4 py-3">
                                <span class="px-2.5 py-1 rounded-full text-xs font-semibold <?= $statusBadges[$lr['status']] ?? 'bg-surface-2 text-ink-muted' ?>"><?= ucfirst($lr['status']) ?></span>
                            </td>
                            <td class="px-4 py-3 text-xs text-ink-muted"><?= htmlspecialchars($lr['approved_by_name'] ?? '-', ENT_QUOTES, 'UTF-8', false) ?></td>
                            <td class="px-4 py-3 text-xs text-ink-muted max-w-xs">
                                <p class="truncate" title="<?= htmlspecialchars($lr['admin_remarks'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>"><?= htmlspecialchars($lr['admin_remarks'] ?? '-', ENT_QUOTES, 'UTF-8', false) ?></p>
                            </td>
                            <td class="px-4 py-3 text-xs text-ink-muted"><?= date('d M Y h:i A', strtotime($lr['created_at'])) ?></td>
                            <td class="px-4 py-3 text-center">
                                <form method="POST" class="inline" onsubmit="return confirm('Delete this leave request permanently?')">
                                    <input type="hidden" name="post_action" value="delete_leave">
                                    <input type="hidden" name="leave_id" value="<?= $lr['leave_id'] ?>">
                                    <?= csrf_field() ?>
                                    <button type="submit" class="text-red-400 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-500/10"><i class="fas fa-trash"></i></button>
                                </form>
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






