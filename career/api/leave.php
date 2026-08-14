<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../config/auth.php';

header('Content-Type: application/json');

// Set timezone to IST
date_default_timezone_set('Asia/Kolkata');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated. Please login.']);
    exit;
}

$userId = $_SESSION['user_id'];
$action = $_POST['action'] ?? $_GET['action'] ?? '';

try {
    $pdo = getDBConnection();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}

$now = date('Y-m-d H:i:s');

// Auto-migrate: ensure leave_requests table has 'cancelled' status in ENUM
try {
    $pdo->exec("ALTER TABLE leave_requests MODIFY COLUMN status ENUM('pending','approved','rejected','cancelled') DEFAULT 'pending'");
} catch (Exception $e) {}

// Auto-create leave_balances table if missing
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS leave_balances (
        balance_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        leave_type VARCHAR(50) NOT NULL,
        year INT NOT NULL,
        total_days INT DEFAULT 12,
        used_days INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_leave_year (user_id, leave_type, year)
    )");
} catch (Exception $e) {}

switch ($action) {
    case 'request':
        // Submit a new leave request
        $leaveType = trim($_POST['leave_type'] ?? '');
        $startDate = trim($_POST['start_date'] ?? '');
        $endDate = trim($_POST['end_date'] ?? '');
        $reason = trim($_POST['reason'] ?? '');

        if (empty($leaveType) || empty($startDate) || empty($endDate) || empty($reason)) {
            echo json_encode(['success' => false, 'message' => 'All fields are required: leave_type, start_date, end_date, reason.']);
            exit;
        }

        // Validate dates
        $start = new DateTime($startDate);
        $end = new DateTime($endDate);

        if ($end < $start) {
            echo json_encode(['success' => false, 'message' => 'End date cannot be before start date.']);
            exit;
        }

        // Calculate total days (inclusive of both start and end date)
        $diff = $start->diff($end);
        $totalDays = $diff->days + 1;

        // Check leave balance
        $currentYear = date('Y');
        $stmt = $pdo->prepare("SELECT * FROM leave_balances WHERE user_id = ? AND leave_type = ? AND year = ?");
        $stmt->execute([$userId, $leaveType, $currentYear]);
        $balance = $stmt->fetch();

        if ($balance) {
            $remaining = $balance['total_days'] - $balance['used_days'];
            if ($totalDays > $remaining) {
                echo json_encode(['success' => false, 'message' => "Insufficient leave balance. You have {$remaining} day(s) remaining for {$leaveType}."]);
                exit;
            }
        }

        // Insert leave request
        $stmt = $pdo->prepare("INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, reason, status, total_days, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)");
        $stmt->execute([$userId, $leaveType, $startDate, $endDate, $reason, $totalDays, $now, $now]);

        logActivity($userId, 'leave_request', "Submitted {$leaveType} leave request for {$totalDays} day(s) from {$startDate} to {$endDate}");

        echo json_encode([
            'success' => true,
            'message' => "Leave request submitted successfully for {$totalDays} day(s).",
            'leave_id' => $pdo->lastInsertId()
        ]);
        break;

    case 'cancel':
        // Cancel a pending leave request (own request only)
        $leaveId = intval($_POST['leave_id'] ?? 0);

        if ($leaveId <= 0) {
            echo json_encode(['success' => false, 'message' => 'Valid leave_id is required.']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM leave_requests WHERE leave_id = ?");
        $stmt->execute([$leaveId]);
        $request = $stmt->fetch();

        if (!$request) {
            echo json_encode(['success' => false, 'message' => 'Leave request not found.']);
            exit;
        }

        if ($request['user_id'] != $userId) {
            echo json_encode(['success' => false, 'message' => 'You can only cancel your own leave requests.']);
            exit;
        }

        if ($request['status'] !== 'pending') {
            echo json_encode(['success' => false, 'message' => 'Only pending leave requests can be cancelled.']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE leave_requests SET status = 'cancelled', updated_at = ? WHERE leave_id = ?");
        $stmt->execute([$now, $leaveId]);

        logActivity($userId, 'leave_cancel', "Cancelled leave request #{$leaveId}");

        echo json_encode(['success' => true, 'message' => 'Leave request cancelled successfully.']);
        break;

    case 'approve':
        // Admin only - approve a leave request
        if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') {
            echo json_encode(['success' => false, 'message' => 'Access denied. Admin privileges required.']);
            exit;
        }

        $leaveId = intval($_POST['leave_id'] ?? 0);
        $adminRemarks = trim($_POST['admin_remarks'] ?? '');

        if ($leaveId <= 0) {
            echo json_encode(['success' => false, 'message' => 'Valid leave_id is required.']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM leave_requests WHERE leave_id = ?");
        $stmt->execute([$leaveId]);
        $request = $stmt->fetch();

        if (!$request) {
            echo json_encode(['success' => false, 'message' => 'Leave request not found.']);
            exit;
        }

        if ($request['status'] !== 'pending') {
            echo json_encode(['success' => false, 'message' => 'Only pending leave requests can be approved.']);
            exit;
        }

        $approvedDate = date('Y-m-d');

        $stmt = $pdo->prepare("UPDATE leave_requests SET status = 'approved', approved_by = ?, admin_remarks = ?, updated_at = ? WHERE leave_id = ?");
        $stmt->execute([$userId, $adminRemarks, $now, $leaveId]);

        // Sync leave balance
        $year = date('Y', strtotime($request['start_date']));
        syncLeaveBalance($pdo, $request['user_id'], $request['leave_type'], $request['total_days'], $year);

        logActivity($userId, 'leave_approve', "Approved leave request #{$leaveId} for user #{$request['user_id']}");

        echo json_encode(['success' => true, 'message' => 'Leave request approved successfully.']);
        break;

    case 'grant':
        // Admin only - directly grant leave to a user
        if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') {
            echo json_encode(['success' => false, 'message' => 'Access denied. Admin privileges required.']);
            exit;
        }

        $targetUserId = trim($_POST['target_user_id'] ?? '');
        $leaveType = trim($_POST['leave_type'] ?? '');
        $startDate = trim($_POST['start_date'] ?? '');
        $endDate = trim($_POST['end_date'] ?? '');
        $adminRemarks = trim($_POST['admin_remarks'] ?? '');

        $validTypes = ['casual', 'sick', 'earned', 'unpaid'];

        if (empty($targetUserId) || !in_array($leaveType, $validTypes) || empty($startDate) || empty($endDate)) {
            echo json_encode(['success' => false, 'message' => 'Valid target_user_id, leave_type, start_date, and end_date required.']);
            exit;
        }

        if ($startDate > $endDate) {
            echo json_encode(['success' => false, 'message' => 'End date cannot be before start date.']);
            exit;
        }

        $start = new DateTime($startDate);
        $end = new DateTime($endDate);
        $totalDays = $start->diff($end)->days + 1;
        $remarks = $adminRemarks ?: 'Granted by Admin';

        $stmt = $pdo->prepare("INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, reason, status, approved_by, admin_remarks, total_days, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'approved', ?, ?, ?, ?, ?)");
        $stmt->execute([$targetUserId, $leaveType, $startDate, $endDate, 'Granted directly by Admin', $userId, $remarks, $totalDays, $now, $now]);
        $leaveId = $pdo->lastInsertId();

        $year = date('Y', strtotime($startDate));
        syncLeaveBalance($pdo, $targetUserId, $leaveType, $totalDays, $year);

        logActivity($userId, 'grant_leave', "Granted {$totalDays} day(s) {$leaveType} leave to {$targetUserId}");

        echo json_encode([
            'success' => true,
            'message' => "Leave of {$totalDays} day(s) granted successfully.",
            'leave_id' => $leaveId
        ]);
        break;

    case 'reject':
        // Admin only - reject a leave request
        if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') {
            echo json_encode(['success' => false, 'message' => 'Access denied. Admin privileges required.']);
            exit;
        }

        $leaveId = intval($_POST['leave_id'] ?? 0);
        $adminRemarks = trim($_POST['admin_remarks'] ?? '');

        if ($leaveId <= 0) {
            echo json_encode(['success' => false, 'message' => 'Valid leave_id is required.']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM leave_requests WHERE leave_id = ?");
        $stmt->execute([$leaveId]);
        $request = $stmt->fetch();

        if (!$request) {
            echo json_encode(['success' => false, 'message' => 'Leave request not found.']);
            exit;
        }

        if ($request['status'] !== 'pending') {
            echo json_encode(['success' => false, 'message' => 'Only pending leave requests can be rejected.']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE leave_requests SET status = 'rejected', approved_by = ?, admin_remarks = ?, updated_at = ? WHERE leave_id = ?");
        $stmt->execute([$userId, $adminRemarks, $now, $leaveId]);

        logActivity($userId, 'leave_reject', "Rejected leave request #{$leaveId} for user #{$request['user_id']}");

        echo json_encode(['success' => true, 'message' => 'Leave request rejected.']);
        break;

    case 'status':
        // Get leave balances and pending requests for current user
        $currentYear = date('Y');

        // Fetch leave balances
        $stmt = $pdo->prepare("SELECT leave_type, total_days, used_days, (total_days - used_days) AS remaining_days FROM leave_balances WHERE user_id = ? AND year = ?");
        $stmt->execute([$userId, $currentYear]);
        $balances = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch pending leave requests
        $stmt = $pdo->prepare("SELECT leave_id, leave_type, start_date, end_date, reason, status, total_days, created_at FROM leave_requests WHERE user_id = ? AND status = 'pending' ORDER BY created_at DESC");
        $stmt->execute([$userId]);
        $pendingRequests = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'balances' => $balances,
            'pending_requests' => $pendingRequests,
            'year' => $currentYear
        ]);
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action. Use: request, cancel, approve, reject, or status.']);
}





