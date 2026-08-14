<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/security.php';

secure_session_start();

session_unset();
session_destroy();

// Clear remember me cookie
if (isset($_COOKIE['remember_email'])) {
    set_secure_cookie('remember_email', '', time() - 3600, '/');
}

header('Location: ' . BASE_PATH . '/login.php');
exit;
?>
