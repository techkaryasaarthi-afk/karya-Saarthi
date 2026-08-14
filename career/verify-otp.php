<?php
$pageTitle = 'Verify OTP';
$message = '';
$messageType = '';

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/security.php';
require_once __DIR__ . '/includes/mailer.php';

secure_session_start();
set_security_headers();

try {
    $pdo = getDBConnection();
    // Ensure table exists
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

    // Clean up expired OTPs older than 1 day
    $pdo->exec("DELETE FROM otp_verifications WHERE expires_at < DATE_SUB(NOW(), INTERVAL 1 DAY)");

} catch (Exception $e) {}

$context = $_GET['context'] ?? '';
$email = $_SESSION['pending_otp_email'] ?? '';

if (empty($context) || empty($email)) {
    header('Location: ' . BASE_PATH . '/login.php');
    exit;
}

// Generate OTP Helper
function generateAndSendOTP($pdo, $email, $context) {
    $otp = sprintf("%06d", mt_rand(1, 999999));
    
    // Invalidate previous active OTPs for this context
    $stmt = $pdo->prepare("UPDATE otp_verifications SET expires_at = NOW() WHERE email = ? AND context = ? AND is_verified = FALSE");
    $stmt->execute([$email, $context]);
    
    // Insert new OTP
    $stmt = $pdo->prepare("INSERT INTO otp_verifications (email, otp, context, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))");
    $stmt->execute([$email, $otp, $context]);
    
    // Send email
    $subject = "Your OTP Verification Code";
    $body = "
    <div style='font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;'>
        <h2 style='color: #2563eb;'>Karya Saarthi Verification</h2>
        <p>Your One-Time Password (OTP) for <strong>$context</strong> is:</p>
        <div style='background: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 8px;'>$otp</div>
        <p style='color: #666; font-size: 13px; margin-top: 20px;'>This code will expire in 10 minutes. Do not share this with anyone.</p>
    </div>";
    
    return sendEmail($email, $subject, $body);
}

// Handle Resend OTP
if (isset($_GET['resend']) && $_GET['resend'] == 1) {
    // Basic rate limit for resend
    $ip = client_ip();
    if (!rate_limit('otp_resend_' . $ip, 3, 300)) { // 3 per 5 mins
        $message = "Please wait before requesting another OTP.";
        $messageType = "error";
    } else {
        if (generateAndSendOTP($pdo, $email, $context)) {
            $message = "A new OTP has been sent to your email.";
            $messageType = "success";
        } else {
            $message = "Failed to send OTP. Please try again later.";
            $messageType = "error";
        }
    }
}

// Process OTP Submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_validate()) {
        $message = 'Invalid form submission. Please try again.';
        $messageType = 'error';
    } else {
        $otp = trim($_POST['otp'] ?? '');
        
        $stmt = $pdo->prepare("SELECT * FROM otp_verifications WHERE email = ? AND context = ? AND otp = ? AND is_verified = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1");
        $stmt->execute([$email, $context, $otp]);
        $record = $stmt->fetch();
        
        if ($record) {
            // Mark as verified
            $stmt = $pdo->prepare("UPDATE otp_verifications SET is_verified = TRUE WHERE id = ?");
            $stmt->execute([$record['id']]);
            
            // Context actions
            if ($context === 'signup') {
                // Set to hold for admin approval
                $stmt = $pdo->prepare("UPDATE users SET status = 'hold', email_verified = 1 WHERE email = ?");
                $stmt->execute([$email]);
                
                unset($_SESSION['pending_otp_email']);
                $_SESSION['login_message'] = "Your email has been verified! Your account is now pending Team approval. You will be able to log in once our Team approves it.";
                $_SESSION['login_message_type'] = "success";
                
                header('Location: ' . BASE_PATH . '/login.php');
                exit;
            } elseif ($context === 'forgot_password' || $context === 'change_password') {
                // Allow them to reset password
                $_SESSION['reset_allowed_email'] = $email;
                unset($_SESSION['pending_otp_email']);
                header('Location: ' . BASE_PATH . '/reset-password.php');
                exit;
            }
        } else {
            $message = "Invalid or expired OTP.";
            $messageType = "error";
        }
    }
}

require_once __DIR__ . '/includes/header.php';
?>

<section class="min-h-screen flex items-center justify-center bg-canvas py-12 px-4 relative overflow-hidden">
    <div class="absolute inset-0 z-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(circle at 1px 1px, #fff 1px, transparent 0); background-size: 32px 32px;"></div>
    
    <div class="w-full max-w-md relative z-10">
        <div class="text-center mb-8">
            <a href="<?= BASE_PATH ?>/" class="inline-block">
                <img src="<?= BASE_PATH ?>/images/karyasaarthi.png" alt="Karya Saarthi Logo" class="h-16 w-16 mx-auto mb-4 rounded-xl object-cover border border-hairline">
            </a>
            <h1 class="text-[32px] font-display tracking-display-md text-ink">Verify Your Email</h1>
            <p class="text-[16px] text-ink-muted mt-2">We've sent a 6-digit code to <br><span class="font-bold text-ink"><?= htmlspecialchars($email, ENT_QUOTES, 'UTF-8', false) ?></span></p>
        </div>

        <div class="bg-surface-1 rounded-xl border border-hairline p-8 shadow-2xl">
            <?php if ($message): ?>
                <div class="mb-6 <?= $messageType === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400' ?> border px-4 py-3 rounded-lg flex items-center gap-3">
                    <span class="text-[14px] font-medium"><?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8', false) ?></span>
                </div>
            <?php endif; ?>

            <form method="POST" action="?context=<?= htmlspecialchars($context, ENT_QUOTES, 'UTF-8', false) ?>" class="space-y-6">
                <?= csrf_field() ?>
                
                <div>
                    <label class="block text-[13px] font-bold tracking-wide text-ink-muted uppercase mb-3 text-center">Enter 6-Digit OTP</label>
                    <div class="flex justify-center gap-2 mb-2" id="otp-inputs">
                        <input type="text" maxlength="1" class="w-12 h-14 text-center text-xl font-bold bg-surface-2 border border-hairline rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-ink" autocomplete="off" autofocus>
                        <input type="text" maxlength="1" class="w-12 h-14 text-center text-xl font-bold bg-surface-2 border border-hairline rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-ink" autocomplete="off">
                        <input type="text" maxlength="1" class="w-12 h-14 text-center text-xl font-bold bg-surface-2 border border-hairline rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-ink" autocomplete="off">
                        <input type="text" maxlength="1" class="w-12 h-14 text-center text-xl font-bold bg-surface-2 border border-hairline rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-ink" autocomplete="off">
                        <input type="text" maxlength="1" class="w-12 h-14 text-center text-xl font-bold bg-surface-2 border border-hairline rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-ink" autocomplete="off">
                        <input type="text" maxlength="1" class="w-12 h-14 text-center text-xl font-bold bg-surface-2 border border-hairline rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-ink" autocomplete="off">
                    </div>
                    <input type="hidden" name="otp" id="final_otp">
                </div>

                <button type="submit" id="verifyBtn" class="button-primary w-full h-[48px]">
                    Verify Code
                </button>
            </form>

            <div class="mt-6 text-center text-[13px] text-ink-muted">
                Didn't receive the code? 
                <a href="?context=<?= htmlspecialchars($context, ENT_QUOTES, 'UTF-8', false) ?>&resend=1" class="text-blue-500 font-bold hover:underline">Resend OTP</a>
            </div>
        </div>
    </div>
</section>

<script>
    const inputs = document.querySelectorAll('#otp-inputs input');
    const finalOtp = document.getElementById('final_otp');

    inputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value.length > 1) {
                // Handle paste
                const paste = e.target.value.replace(/\D/g, '').substring(0, 6);
                paste.split('').forEach((char, i) => {
                    if (inputs[i]) inputs[i].value = char;
                });
                inputs[Math.min(paste.length, 5)].focus();
            } else if (e.target.value.length === 1 && index < 5) {
                inputs[index + 1].focus();
            }
            updateFinalOtp();
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });

    function updateFinalOtp() {
        let otp = '';
        inputs.forEach(input => otp += input.value);
        finalOtp.value = otp;
    }
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
