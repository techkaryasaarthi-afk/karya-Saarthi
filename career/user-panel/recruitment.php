<?php
$pageTitle = 'Recruitment Panel (HR)';
require_once __DIR__ . '/../config/auth.php';
requireLogin();

$pdo = getDBConnection();

// Ensure is_hr_intern column exists
try { $pdo->exec("ALTER TABLE users ADD COLUMN is_hr_intern BOOLEAN DEFAULT FALSE"); } catch (Exception $e) {}

// Check access: must be admin OR is_hr_intern = 1
$userId = $_SESSION['user_id'];
$userType = $_SESSION['user_type'];

if ($userType !== 'admin') {
    $stmt = $pdo->prepare("SELECT is_hr_intern FROM users WHERE user_id = ?");
    $stmt->execute([$userId]);
    $hrFlag = $stmt->fetchColumn();
    if (!$hrFlag) {
        header("Location: " . BASE_PATH . "/user-panel/dashboard.php");
        exit;
    }
}

// Set flag so sidebar knows we're in HR intern view
$_isHrInternView = true;

// Load admin recruitment file content
$adminFile = file_get_contents(__DIR__ . '/../admin/recruitment.php');

// Fix __DIR__ references — replace with absolute admin directory path
$adminDir = str_replace('\\', '/', realpath(__DIR__ . '/../admin'));
$adminFile = str_replace('__DIR__', "'" . $adminDir . "'", $adminFile);

// Remove the auth/setup lines since we already handled them
$adminFile = preg_replace('/\$pageTitle\s*=\s*[\'"][^\'"]+[\'"];/m', '', $adminFile, 1);
$adminFile = preg_replace('/require_once\s+.*?auth\.php.*?;/m', '', $adminFile, 1);
$adminFile = preg_replace('/requireLogin\(\)\s*;/m', '', $adminFile, 1);
$adminFile = preg_replace('/requireAdmin\(\)\s*;/m', '', $adminFile, 1);

// Remove the $pdo = getDBConnection() since we already have it
$adminFile = preg_replace('/\$pdo\s*=\s*getDBConnection\(\)\s*;/m', '', $adminFile, 1);

// Remove opening/closing PHP tags
$adminFile = preg_replace('/^<\?php/', '', $adminFile);
$adminFile = preg_replace('/\?>\s*$/', '', $adminFile);

// Execute
eval($adminFile);
?>
