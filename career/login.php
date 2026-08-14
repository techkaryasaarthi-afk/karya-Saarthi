<?php
$pageTitle = 'Login';
$error = '';

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/security.php';

// Start secure session and emit security headers
secure_session_start();
set_security_headers();

// If already logged in, redirect
if (isset($_SESSION['user_id'])) {
    header('Location: ' . BASE_PATH . '/user-panel/');
    exit;
}

$successMessage = '';
if (isset($_SESSION['login_message'])) {
    if (($_SESSION['login_message_type'] ?? '') === 'success') {
        $successMessage = $_SESSION['login_message'];
    } else {
        $error = $_SESSION['login_message'];
    }
    unset($_SESSION['login_message']);
    unset($_SESSION['login_message_type']);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // ── CSRF Validation (A01 / A08) ─────────────────────────────────────────
    if (!csrf_validate()) {
        $error = 'Invalid form submission. Please refresh and try again.';
    } else {
        $ip    = client_ip();
        $email = sanitize_email($_POST['email'] ?? '');

        // ── Rate Limiting (A04 / A07) — 5 attempts per IP per 15 min ─────────
        $rl_key = 'login_ip_' . $ip;
        if (!rate_limit($rl_key, 5, 900)) {
            $error = 'Too many login attempts. Please wait 15 minutes before trying again.';
        } else {
            $password = $_POST['password'] ?? '';

            if (empty($email) || empty($password)) {
                $error = 'Please enter email and password.';
            } elseif (strlen($password) > 1000) {
                $error = 'Invalid input.'; // Prevent DoS via bcrypt long-password attack
            } else {
                try {
                    $pdo  = getDBConnection();
                    $stmt = $pdo->prepare("SELECT user_id, name, email, user_type, profile_photo, password_hash, status FROM users WHERE email = ? LIMIT 1");
                    $stmt->execute([$email]);
                    $user = $stmt->fetch();

                    if ($user && password_verify($password, $user['password_hash'])) {
                        if ($user['status'] === 'active') {
                            // ── Successful login ─────────────────────────────────
                            rate_limit_reset($rl_key); // Reset attempt counter on success

                            // Regenerate session to prevent fixation (A07)
                            session_regenerate_id(true);
                            $_SESSION['user_id']      = $user['user_id'];
                            $_SESSION['user_name']    = $user['name'];
                            $_SESSION['user_email']   = $user['email'];
                            $_SESSION['user_type']    = $user['user_type'];
                            $_SESSION['profile_photo'] = $user['profile_photo'];
                            $_SESSION['_last_regen']  = time();
                            $_SESSION['_login_time']  = time();
                            $_SESSION['_user_agent']  = md5($_SERVER['HTTP_USER_AGENT'] ?? '');

                            // Update last login
                            $pdo->prepare("UPDATE users SET last_login = NOW() WHERE user_id = ?")->execute([$user['user_id']]);

                            // Log activity (A09)
                            require_once __DIR__ . '/config/auth.php';
                            logActivity($user['user_id'], 'login', 'Successful login from ' . $ip);

                            // Remember me cookie — secure flags (A02)
                            if (!empty($_POST['remember'])) {
                                set_secure_cookie('remember_email', $email, time() + (86400 * 30));
                            } else {
                                set_secure_cookie('remember_email', '', time() - 3600);
                            }

                            // Redirect based on role
                            if ($user['user_type'] === 'admin') {
                                header('Location: ' . BASE_PATH . '/admin/');
                            } else {
                                header('Location: ' . BASE_PATH . '/user-panel/');
                            }
                            exit;
                        } elseif ($user['status'] === 'hold') {
                            $error = 'Your account is verified but pending Team approval. Please wait for our Team to approve your account.';
                        } elseif ($user['status'] === 'inactive') {
                            $error = 'Please verify your email address to activate your account.';
                        } elseif ($user['status'] === 'blocked') {
                            $error = 'Your account has been blocked. Please contact support.';
                        } else {
                            $error = 'Your account is not active.';
                        }
                    } else {
                        // ── Failed login — log it (A09) ───────────────────────
                        $error = 'Invalid email or password.';
                        try {
                            $pdo->prepare(
                                "INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent) VALUES (NULL, 'login_failed', ?, ?, ?)"
                            )->execute([
                                'Failed login attempt for: ' . $email,
                                $ip,
                                mb_substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255),
                            ]);
                        } catch (Throwable $_) {}
                    }

                } catch (Throwable $e) {
                    if (strpos($e->getMessage(), "doesn't exist") !== false) {
                        $error = 'Database not set up. Please run <a href="' . BASE_PATH . '/setup.php" class="underline font-bold">setup.php</a> first.';
                    } else {
                        error_log("Login error: " . $e->getMessage());
                        $error = 'Something went wrong. Please try again later.';
                    }
                }
            }
        }
    }
}

require_once __DIR__ . '/includes/header.php';
?>

<section class="min-h-screen flex items-center justify-center bg-canvas py-12 px-4 relative overflow-hidden">
    <!-- Grid Background -->
    <div class="absolute inset-0 z-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(circle at 1px 1px, #fff 1px, transparent 0); background-size: 32px 32px;"></div>

    <div class="w-full max-w-md relative z-10">
        <!-- Logo & Heading -->
        <div class="text-center mb-8">
            <a href="<?= BASE_PATH ?>/" class="inline-block">
                <img src="<?= BASE_PATH ?>/images/karyasaarthi.png" alt="Karya Saarthi Logo" class="h-16 w-16 mx-auto mb-4 rounded-xl object-cover border border-hairline">
            </a>
            <h1 class="text-[32px] font-display tracking-display-md text-ink">Welcome Back</h1>
            <p class="text-[16px] text-ink-muted mt-2">Sign in to your Karya Saarthi account</p>
        </div>

        <!-- Login Card -->
        <div class="bg-surface-1 rounded-xl border border-hairline p-8 shadow-2xl">
            <?php if ($error): ?>
                <div class="mb-6 bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center gap-3" role="alert">
                    <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-[14px] font-medium"><?= $error ?></span>
                </div>
            <?php endif; ?>
            
            <?php if ($successMessage): ?>
                <div class="mb-6 bg-green-900/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg flex items-center gap-3" role="alert">
                    <i class="fas fa-check-circle"></i>
                    <span class="text-[14px] font-medium"><?= $successMessage ?></span>
                </div>
            <?php endif; ?>

            <form method="POST" action="" class="space-y-5" id="loginForm" autocomplete="on">
                <?= csrf_field() ?>

                <!-- Email -->
                <div>
                    <label for="email" class="block text-[13px] font-bold tracking-wide text-ink-muted uppercase mb-1.5">Email Address</label>
                    <div class="relative">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-ink-muted opacity-60">
                            <i class="fas fa-envelope"></i>
                        </span>
                        <input type="email" id="email" name="email" required autocomplete="email"
                               value="<?= htmlspecialchars($_POST['email'] ?? $_COOKIE['remember_email'] ?? '', ENT_QUOTES, 'UTF-8') ?>"
                               class="text-input pl-10"
                               maxlength="255"
                               placeholder="you@example.com">
                    </div>
                </div>

                <!-- Password -->
                <div>
                    <label for="password" class="block text-[13px] font-bold tracking-wide text-ink-muted uppercase mb-1.5">Password</label>
                    <div class="relative">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-ink-muted opacity-60">
                            <i class="fas fa-lock"></i>
                        </span>
                        <input type="password" id="password" name="password" required autocomplete="current-password"
                               class="text-input pl-10 pr-12"
                               maxlength="128"
                               placeholder="Enter your password">
                        <button type="button" onclick="togglePassword()" class="absolute inset-y-0 right-0 flex items-center pr-3 text-ink-muted opacity-60 hover:opacity-100 transition-opacity" aria-label="Toggle password visibility">
                            <i id="eyeIcon" class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>

                <!-- Remember Me & Forgot Password -->
                <div class="flex items-center justify-between">
                    <label class="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" name="remember" value="1"
                               <?= !empty($_COOKIE['remember_email']) ? 'checked' : '' ?>
                               class="w-4 h-4 bg-surface-2 border-hairline rounded">
                        <span class="text-[13px] text-ink-muted group-hover:text-ink transition-colors">Remember me</span>
                    </label>
                    <a href="<?= BASE_PATH ?>/forgot-password.php" class="text-[13px] text-ink-muted hover:text-ink font-bold transition-colors">
                        Forgot password?
                    </a>
                </div>

                <!-- Login Button -->
                <button type="submit" class="button-primary w-full h-[48px]" id="loginBtn">
                    Sign In
                </button>
            </form>

            <!-- Divider -->
            <div class="relative my-6">
                <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-hairline"></div>
                </div>
                <div class="relative flex justify-center text-[12px]">
                    <span class="px-4 bg-surface-1 text-ink-muted uppercase tracking-wider font-bold">New to Karya Saarthi?</span>
                </div>
            </div>

            <!-- Register Link -->
            <a href="<?= BASE_PATH ?>/register.php" class="button-secondary w-full h-[48px]">
                Create an Account
            </a>
        </div>

        <!-- Footer Note -->
        <p class="text-center text-[13px] text-ink-muted mt-6">
            By signing in, you agree to our
            <a href="<?= BASE_PATH ?>/terms.php" class="hover:text-ink underline underline-offset-2 transition">Terms of Service</a>
            and <a href="<?= BASE_PATH ?>/privacy.php" class="hover:text-ink underline underline-offset-2 transition">Privacy Policy</a>.
        </p>
    </div>
</section>

<script>
function togglePassword() {
    const input = document.getElementById('password');
    const icon  = document.getElementById('eyeIcon');
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    icon.className = isHidden ? 'fas fa-eye-slash' : 'fas fa-eye';
}

document.getElementById('loginForm').addEventListener('submit', function(e) {
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const btn      = document.getElementById('loginBtn');

    if (!email || !password) {
        e.preventDefault();
        return;
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        e.preventDefault();
        alert('Please enter a valid email address.');
        return;
    }

    // Prevent double-submit
    btn.disabled = true;
    btn.textContent = 'Signing in…';
});

// Re-enable button if PHP returned an error (page reloaded with error)
<?php if ($error): ?>
window.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('loginBtn');
    if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
});
<?php endif; ?>
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
