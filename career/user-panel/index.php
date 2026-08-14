<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';
secure_session_start();

if (!isset($_SESSION['user_id'])) {
    header('Location: ' . BASE_PATH . '/login.php');
    exit;
}

switch ($_SESSION['user_type']) {
    case 'admin':
        header('Location: ' . BASE_PATH . '/admin/');
        break;
    case 'campus_saarthi':
        header('Location: ' . BASE_PATH . '/user-panel/campus-saarthi.php');
        break;
    case 'vendor':
    case 'freelancer':
    case 'part_time':
        header('Location: ' . BASE_PATH . '/user-panel/dashboard.php');
        break;
    case 'employee':
    case 'pillar_post':
        header('Location: ' . BASE_PATH . '/user-panel/employee.php');
        break;
    case 'intern':
        header('Location: ' . BASE_PATH . '/user-panel/intern.php');
        break;
    case 'teaching_expert':
        header('Location: ' . BASE_PATH . '/user-panel/teaching-expert.php');
        break;
    default:
        header('Location: ' . BASE_PATH . '/login.php');
}
exit;
?>






