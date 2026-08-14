<?php
// Karya Saarthi Career Portal - Authentication Helper

if (session_status() === PHP_SESSION_NONE) {
    require_once __DIR__ . '/security.php';
    secure_session_start();
}

require_once __DIR__ . '/database.php';

function isLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

function requireLogin() {
    if (!isLoggedIn()) {
        header('Location: ' . BASE_PATH . '/login.php');
        exit;
    }
}

function requireAdmin() {
    requireLogin();
    if ($_SESSION['user_type'] !== 'admin') {
        header('Location: ' . BASE_PATH . '/user-panel/');
        exit;
    }
}

function requireRole($roles) {
    requireLogin();
    if (!in_array($_SESSION['user_type'], (array)$roles)) {
        header('Location: ' . BASE_PATH . '/user-panel/');
        exit;
    }
}

function getCurrentUser() {
    if (!isLoggedIn()) return null;
    return [
        'user_id' => $_SESSION['user_id'],
        'name' => $_SESSION['user_name'],
        'email' => $_SESSION['user_email'],
        'user_type' => $_SESSION['user_type'],
        'profile_photo' => $_SESSION['profile_photo'] ?? null
    ];
}

function getUserTypeLabel($type) {
    $labels = [
        'vendor'         => 'Vendor',
        'employee'       => 'Internal Member',
        'intern'         => 'Intern',
        'campus_saarthi' => 'Campus Saarthi',
        'admin'          => 'Administrator',
        'freelancer'     => 'Freelancer',
        'pillar_post'    => 'Pillar Executive',
        'part_time'      => 'Part-Time',
        'teaching_expert'=> 'Teaching Expert'
    ];
    return $labels[$type] ?? 'User';
}

function getUserTypeBadgeClass($type) {
    $classes = [
        'vendor'         => 'badge-vendor',
        'employee'       => 'badge-employee',
        'intern'         => 'badge-intern',
        'campus_saarthi' => 'badge-campus',
        'admin'          => 'badge-admin',
        'freelancer'     => 'badge-vendor',
        'pillar_post'    => 'badge-employee',
        'part_time'      => 'badge-intern',
        'teaching_expert'=> 'badge-expert'
    ];
    return $classes[$type] ?? 'badge-default';
}

function logActivity($userId, $action, $details = '') {
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $userId,
            $action,
            $details,
            $_SERVER['REMOTE_ADDR'] ?? '',
            $_SERVER['HTTP_USER_AGENT'] ?? ''
        ]);
    } catch (Throwable $e) {
        error_log("Activity log failed: " . $e->getMessage());
    }
}

function syncLeaveBalance($pdo, $userId, $leaveType, $daysToAdd, $year = null) {
    if (empty($year)) {
        $year = (int)date('Y');
    }
    if ($leaveType === 'unpaid') {
        return true;
    }
    
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
    } catch (Throwable $e) {}

    $defaultAllocations = ['casual' => 12, 'sick' => 6, 'earned' => 15];
    $defaultTotal = $defaultAllocations[$leaveType] ?? 10;

    try {
        $stmt = $pdo->prepare("INSERT INTO leave_balances (user_id, leave_type, year, total_days, used_days) 
            VALUES (?, ?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE used_days = used_days + VALUES(used_days)");
        $stmt->execute([$userId, $leaveType, $year, $defaultTotal, $daysToAdd]);
        return true;
    } catch (Throwable $e) {
        error_log("syncLeaveBalance failed: " . $e->getMessage());
        return false;
    }
}






