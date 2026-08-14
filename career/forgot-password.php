<?php
$pageTitle = 'Forgot Password';
$message = '';
$messageType = '';
$showResetForm = false;
$resetEmail = '';

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/security.php';

secure_session_start();
set_security_headers();

try {
    $pdo = getDBConnection();
    $pdo->exec("CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(64) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_token (token),
        INDEX idx_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
} catch (Exception $e) {}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // CSRF check (A01 / A08)
    if (!csrf_validate()) {
        $message = 'Invalid form submission. Please refresh and try again.';
        $messageType = 'error';
        goto render_fp;
    }
    // Rate limit: 3 attempts per IP per hour (A04)
    $ip = client_ip();
    if (!rate_limit('fp_ip_' . $ip, 3, 3600)) {
        $message = 'Too many attempts. Please wait an hour and try again.';
        $messageType = 'error';
        goto render_fp;
    }

    $action = $_POST['action'] ?? 'verify';

    if ($action === 'verify') {
        // Step 1: Verify email + phone
        $email = trim($_POST['email'] ?? '');
        $phone = trim($_POST['phone'] ?? '');

        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $message = 'Please enter a valid email address.';
            $messageType = 'error';
        } elseif (empty($phone)) {
            $message = 'Please enter your registered phone number.';
            $messageType = 'error';
        } else {
            try {
                $pdo = getDBConnection();
                $stmt = $pdo->prepare("SELECT email, name, phone FROM users WHERE email = ? AND status = 'active'");
                $stmt->execute([$email]);
                $user = $stmt->fetch();

                if ($user) {
                    // Verify phone matches (last 4 digits or full match)
                    $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
                    $userPhone = preg_replace('/[^0-9]/', '', $user['phone']);

                    if ($cleanPhone === $userPhone || substr($cleanPhone, -10) === substr($userPhone, -10)) {
                        // Phone verified — generate OTP
                        $otp = sprintf('%06d', mt_rand(1, 999999));
                        
                        $stmt = $pdo->prepare("UPDATE otp_verifications SET expires_at = NOW() WHERE email = ? AND context = 'forgot_password'");
                        $stmt->execute([$user['email']]);
                        
                        $stmt = $pdo->prepare("INSERT INTO otp_verifications (email, otp, context, expires_at) VALUES (?, ?, 'forgot_password', DATE_ADD(NOW(), INTERVAL 10 MINUTE))");
                        $stmt->execute([$user['email'], $otp]);
                        
                        require_once __DIR__ . '/includes/mailer.php';
                        $subject = 'Your Password Reset OTP';
                        $body = "<div style='font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;'>
                                    <h2 style='color: #2563eb;'>Karya Saarthi Password Reset</h2>
                                    <p>Your One-Time Password (OTP) to reset your password is:</p>
                                    <div style='background: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 8px;'>$otp</div>
                                    <p style='color: #666; font-size: 13px; margin-top: 20px;'>This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
                                </div>";
                        sendEmail($user['email'], $subject, $body);
                        
                        session_start();
                        $_SESSION['pending_otp_email'] = $user['email'];
                        header('Location: ' . BASE_PATH . '/verify-otp.php?context=forgot_password');
                        exit;
                    } else {
                        $message = 'Phone number does not match our records for this email.';
                        $messageType = 'error';
                    }
                } else {
                    $message = 'No active account found with this email address.';
                    $messageType = 'error';
                }
            } catch (Exception $e) {
                $message = 'Something went wrong. Please try again.';
                $messageType = 'error';
            }
        }
    }
}
render_fp:
require_once __DIR__ . '/includes/header.php';
?>

<section class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
    <div class="w-full max-w-md">
        <!-- Logo & Heading -->
        <div class="text-center mb-8">
            <a href="<?= BASE_PATH ?>/" class="inline-block">
                <img src="<?= BASE_PATH ?>/images/karyasaarthi.png" alt="Karya Saarthi Logo" class="h-16 w-16 mx-auto mb-4 rounded-xl object-cover">
            </a>
            <?php if ($messageType === 'success'): ?>
                <h1 class="text-3xl font-bold text-ink font-semibold">Password Reset!</h1>
                <p class="text-ink-muted mt-2">Your password has been updated successfully</p>
            <?php elseif ($showResetForm): ?>
                <h1 class="text-3xl font-bold text-ink font-semibold">Set New Password</h1>
                <p class="text-ink-muted mt-2">Identity verified. Enter your new password below.</p>
            <?php else: ?>
                <h1 class="text-3xl font-bold text-ink font-semibold">Forgot Password?</h1>
                <p class="text-ink-muted mt-2">Verify your identity to reset your password</p>
            <?php endif; ?>
        </div>

        <!-- Card -->
        <div class="bg-surface-1 rounded-2xl shadow-xl border border-hairline-soft p-8">

            <?php if ($message): ?>
            <div class="mb-6 <?= $messageType === 'success' ? 'bg-green-500/10 border-green-200 text-green-700' : 'bg-red-500/10 border-red-500/20 text-red-700' ?> border px-4 py-3 rounded-lg flex items-center gap-3">
                <i class="fas <?= $messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle' ?> flex-shrink-0"></i>
                <span class="text-sm"><?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8', false) ?></span>
            </div>
            <?php endif; ?>

            <?php if ($messageType === 'success'): ?>
            <!-- Success — Go to Login -->
            <div class="text-center py-4">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-check-circle text-green-600 text-3xl"></i>
                </div>
                <a href="<?= BASE_PATH ?>/login.php" class="block w-full text-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md">
                    <i class="fas fa-sign-in-alt mr-2"></i> Sign In Now
                </a>
            </div>


            <!-- Step 1: Email + Phone Verification -->
            <form method="POST" class="space-y-5" id="verifyForm">
                <?= csrf_field() ?>
                <input type="hidden" name="action" value="verify">

                <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                    <i class="fas fa-info-circle mr-1"></i> Enter your registered email and phone number to verify your identity.
                </div>

                <div>
                    <label for="email" class="block text-sm font-semibold text-ink mb-1.5">Email Address</label>
                    <div class="relative">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-ink-muted opacity-80"><i class="fas fa-envelope"></i></span>
                        <input type="email" id="email" name="email" required
                               value="<?= htmlspecialchars($_POST['email'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>"
                               class="w-full pl-10 pr-4 py-3 border border-hairline bg-surface-2 text-ink rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink font-semibold"
                               placeholder="you@example.com">
                    </div>
                </div>

                <div>
                    <label for="phone" class="block text-sm font-semibold text-ink mb-1.5">Registered Phone Number</label>
                    <div class="relative">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-ink-muted opacity-80"><i class="fas fa-phone"></i></span>
                        <input type="tel" id="phone" name="phone" required
                               value="<?= htmlspecialchars($_POST['phone'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>"
                               class="w-full pl-10 pr-4 py-3 border border-hairline bg-surface-2 text-ink rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-ink font-semibold"
                               placeholder="10-digit phone number" maxlength="10">
                    </div>
                    <p class="text-xs text-ink-muted opacity-80 mt-1">Enter the phone number you used during registration</p>
                </div>

                <button type="submit" class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg">
                    <i class="fas fa-shield-alt mr-2"></i> Verify & Reset Password
                </button>
            </form>
            <?php endif; ?>

            <!-- Divider -->
            <div class="relative my-6">
                <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-hairline"></div></div>
                <div class="relative flex justify-center text-sm"><span class="px-4 bg-canvas text-ink-muted">Remember your password?</span></div>
            </div>

            <a href="<?= BASE_PATH ?>/login.php" class="button-secondary block w-full text-center py-3 px-4 rounded-lg transition-all">
                <i class="fas fa-arrow-left mr-2"></i> Back to Login
            </a>
        </div>

        <p class="text-center text-xs text-ink-muted opacity-80 mt-6">
            Need help? Contact <a href="mailto:hr@karyasaarthi.com" class="text-blue-500 hover:underline">hr@karyasaarthi.com</a>
        </p>
    </div>
</section>

<script>
function togglePwd(id) {
    const inp = document.getElementById(id);
    const icon = document.getElementById('eye-' + id);
    if (inp.type === 'password') { inp.type = 'text'; icon.className = 'fas fa-eye-slash'; }
    else { inp.type = 'password'; icon.className = 'fas fa-eye'; }
}

const pw = document.getElementById('password');
const cpw = document.getElementById('confirm_password');
if (pw) {
    pw.addEventListener('input', function() {
        const v = this.value; let s = 0;
        if (v.length >= 8) s++;
        if (v.length >= 12) s++;
        if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
        if (/\d/.test(v)) s++;
        if (/[^a-zA-Z0-9]/.test(v)) s++;
        const L = [
            {w:'0%',c:'bg-surface-3',t:'Enter a password',tc:'text-ink-muted opacity-80'},
            {w:'20%',c:'bg-red-500',t:'Very weak',tc:'text-red-400'},
            {w:'40%',c:'bg-orange-500',t:'Weak',tc:'text-orange-500'},
            {w:'60%',c:'bg-yellow-500',t:'Fair',tc:'text-yellow-600'},
            {w:'80%',c:'bg-blue-500',t:'Strong',tc:'text-blue-600'},
            {w:'100%',c:'bg-green-500',t:'Very strong',tc:'text-green-600'}
        ];
        const l = v.length === 0 ? L[0] : L[Math.min(s,5)];
        document.getElementById('strengthBar').style.width = l.w;
        document.getElementById('strengthBar').className = 'h-full rounded-full transition-all duration-300 ' + l.c;
        document.getElementById('strengthText').textContent = l.t;
        document.getElementById('strengthText').className = 'text-xs mt-1 ' + l.tc;
        chkMatch();
    });
    cpw.addEventListener('input', chkMatch);
}
function chkMatch() {
    const mt = document.getElementById('matchText');
    if (!cpw.value) { mt.classList.add('hidden'); return; }
    mt.classList.remove('hidden');
    if (pw.value === cpw.value) { mt.textContent = 'Passwords match'; mt.className = 'text-xs mt-1 text-green-600'; }
    else { mt.textContent = 'Passwords do not match'; mt.className = 'text-xs mt-1 text-red-400'; }
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>





