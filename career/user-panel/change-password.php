<?php
$pageTitle = 'Change Password';

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../includes/mailer.php';

secure_session_start();

if (!isset($_SESSION['user_id'])) {
    header('Location: ' . BASE_PATH . '/login.php');
    exit;
}

$email = $_SESSION['user_email'];

try {
    $pdo = getDBConnection();

    // Ensure OTP table exists (fallback)
    $pdo->exec("CREATE TABLE IF NOT EXISTS otp_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL,
        otp VARCHAR(10) NOT NULL,
        context ENUM('signup', 'forgot_password', 'change_password') NOT NULL,
        expires_at DATETIME NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email_context (email, context)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Generate OTP
    $otp = sprintf("%06d", mt_rand(1, 999999));

    // Invalidate previous active OTPs for this context
    $stmt = $pdo->prepare("UPDATE otp_verifications SET expires_at = NOW() WHERE email = ? AND context = 'change_password' AND is_verified = FALSE");
    $stmt->execute([$email]);

    // Insert new OTP
    $stmt = $pdo->prepare("INSERT INTO otp_verifications (email, otp, context, expires_at) VALUES (?, ?, 'change_password', DATE_ADD(NOW(), INTERVAL 10 MINUTE))");
    $stmt->execute([$email, $otp]);

    // Send Email
    $subject = 'Your OTP for Password Change';
    $body = "<div style='font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;'>
                <h2 style='color: #2563eb;'>Change Password Request</h2>
                <p>Your One-Time Password (OTP) to change your account password is:</p>
                <div style='background: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 8px;'>$otp</div>
                <p style='color: #666; font-size: 13px; margin-top: 20px;'>This code will expire in 10 minutes. Do not share this with anyone.</p>
            </div>";
    sendEmail($email, $subject, $body);

    // Set Session and Redirect
    $_SESSION['pending_otp_email'] = $email;
    header('Location: ' . BASE_PATH . '/verify-otp.php?context=change_password');
    exit;

} catch (Exception $e) {
    error_log("Change password error: " . $e->getMessage());
    die("An error occurred while generating your OTP. Please try again later.");
}
