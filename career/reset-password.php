<?php
$pageTitle = 'Reset Password';
$message = '';
$messageType = '';
$resetSuccess = false;

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/mailer.php';

secure_session_start();
set_security_headers();

$resetEmail = $_SESSION['reset_allowed_email'] ?? '';

if (empty($resetEmail)) {
    header('Location: ' . BASE_PATH . '/login.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';

    if (empty($password) || empty($confirmPassword)) {
        $message = 'Please fill in both password fields.';
        $messageType = 'error';
    } elseif (strlen($password) < 8) {
        $message = 'Password must be at least 8 characters long.';
        $messageType = 'error';
    } elseif ($password !== $confirmPassword) {
        $message = 'Passwords do not match.';
        $messageType = 'error';
    } else {
        try {
            $pdo = getDBConnection();
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            
            $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE email = ?");
            $stmt->execute([$passwordHash, $resetEmail]);

            if ($stmt->rowCount() > 0) {
                // Send confirmation email
                $emailBody = '
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <div style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #f97316 100%); padding: 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Karya Saarthi</h1>
                    </div>
                    <div style="padding: 30px;">
                        <h2 style="color: #1e40af; margin-top: 0;">Password Changed Successfully</h2>
                        <p style="color: #374151; font-size: 15px;">Your password for your Karya Saarthi Career account has been successfully updated.</p>
                        <p style="color: #374151; font-size: 15px;">If you did not make this change, please contact us immediately at <a href="mailto:hr@karyasaarthi.com" style="color: #2563eb;">hr@karyasaarthi.com</a>.</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="' . BASE_PATH . '/login.php" style="background: #2563eb; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">Sign In Now</a>
                        </div>
                    </div>
                </div>';
                sendEmail($resetEmail, 'Password Changed - Karya Saarthi', $emailBody);

                $message = 'Your password has been reset successfully!';
                $messageType = 'success';
                $resetSuccess = true;
                
                // Clear session
                unset($_SESSION['reset_allowed_email']);
            } else {
                $message = 'Unable to update password. The account may no longer exist.';
                $messageType = 'error';
            }
        } catch (Exception $e) {
            $message = 'Something went wrong. Please try again.';
            $messageType = 'error';
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
                <img src="<?= BASE_PATH ?>/images/karyasaarthi.png" alt="Logo" class="h-16 w-16 mx-auto mb-4 rounded-xl object-cover border border-hairline">
            </a>
            <?php if ($resetSuccess): ?>
                <h1 class="text-[32px] font-display tracking-display-md text-ink">Password Reset!</h1>
                <p class="text-ink-muted mt-2">Your password has been updated successfully</p>
            <?php else: ?>
                <h1 class="text-[32px] font-display tracking-display-md text-ink">Reset Password</h1>
                <p class="text-ink-muted mt-2">Identity verified for <?= htmlspecialchars($resetEmail, ENT_QUOTES, 'UTF-8', false) ?>. <br>Enter your new password below</p>
            <?php endif; ?>
        </div>

        <div class="bg-surface-1 rounded-xl border border-hairline p-8 shadow-2xl">
            <?php if ($message): ?>
                <div class="mb-6 <?= $messageType === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400' ?> border px-4 py-3 rounded-lg flex items-center gap-3">
                    <span class="text-sm font-medium"><?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8', false) ?></span>
                </div>
            <?php endif; ?>

            <?php if ($resetSuccess): ?>
                <div class="text-center py-4">
                    <div class="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                        <i class="fas fa-check-circle text-3xl"></i>
                    </div>
                    <a href="<?= BASE_PATH ?>/login.php"
                       class="button-primary w-full h-[48px] mt-4 flex items-center justify-center gap-2">
                        <i class="fas fa-sign-in-alt"></i> Sign In Now
                    </a>
                </div>
            <?php else: ?>
                <form method="POST" action="" class="space-y-5" id="resetForm">
                    <?= csrf_field() ?>
                    <div>
                        <label for="password" class="block text-[13px] font-bold tracking-wide text-ink-muted uppercase mb-1.5">New Password</label>
                        <div class="relative">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-ink-muted opacity-80"><i class="fas fa-lock"></i></span>
                            <input type="password" id="password" name="password" required minlength="8"
                                   class="text-input pl-10 pr-12"
                                   placeholder="Minimum 8 characters">
                            <button type="button" onclick="togglePwd('password')" class="absolute inset-y-0 right-0 flex items-center pr-3 text-ink-muted opacity-80 hover:text-ink-muted">
                                <i class="fas fa-eye" id="eye-password"></i>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label for="confirm_password" class="block text-[13px] font-bold tracking-wide text-ink-muted uppercase mb-1.5">Confirm New Password</label>
                        <div class="relative">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-ink-muted opacity-80"><i class="fas fa-lock"></i></span>
                            <input type="password" id="confirm_password" name="confirm_password" required minlength="8"
                                   class="text-input pl-10 pr-12"
                                   placeholder="Re-enter your new password">
                            <button type="button" onclick="togglePwd('confirm_password')" class="absolute inset-y-0 right-0 flex items-center pr-3 text-ink-muted opacity-80 hover:text-ink-muted">
                                <i class="fas fa-eye" id="eye-confirm_password"></i>
                            </button>
                        </div>
                        <p id="matchText" class="text-xs mt-1 hidden"></p>
                    </div>

                    <button type="submit" id="submitBtn"
                            class="button-primary w-full h-[48px]">
                        <i class="fas fa-key mr-2"></i> Save New Password
                    </button>
                </form>
            <?php endif; ?>
        </div>
    </div>
</section>

<script>
function togglePwd(id) {
    const input = document.getElementById(id);
    const icon = document.getElementById('eye-' + id);
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}
const pw = document.getElementById('password');
const cpw = document.getElementById('confirm_password');
if (pw && cpw) {
    pw.addEventListener('input', checkMatch);
    cpw.addEventListener('input', checkMatch);
}
function checkMatch() {
    const mt = document.getElementById('matchText');
    if (!cpw.value) { mt.classList.add('hidden'); return; }
    mt.classList.remove('hidden');
    if (pw.value === cpw.value) {
        mt.textContent = 'Passwords match';
        mt.className = 'text-[12px] mt-1 font-bold text-green-400';
    } else {
        mt.textContent = 'Passwords do not match';
        mt.className = 'text-[12px] mt-1 font-bold text-red-400';
    }
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
