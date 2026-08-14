<?php
$pageTitle = 'Register';
$error = '';
$success = '';

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/security.php';

secure_session_start();
set_security_headers();

// Redirect if already logged in
if (isset($_SESSION['user_id'])) {
    header('Location: ' . BASE_PATH . '/user-panel/');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_once __DIR__ . '/config/auth.php';

    // ── CSRF Validation (A01 / A08) ──────────────────────────────────────────
    if (!csrf_validate()) {
        $error = 'Invalid form submission. Please refresh and try again.';
        goto render;
    }

    // ── Rate Limiting (A04) — 3 signups per IP per hour ──────────────────────
    $ip = client_ip();
    if (!rate_limit('register_ip_' . $ip, 3, 3600)) {
        $error = 'Too many registration attempts. Please wait an hour and try again.';
        goto render;
    }

    $user_type = $_POST['user_type'] ?? '';

    // Extra fields
    $college_name = mb_substr(trim($_POST['college_name'] ?? ''), 0, 150);
    $course_year  = mb_substr(trim($_POST['course_year']  ?? ''), 0, 50);
    $skills       = mb_substr(trim($_POST['skills']       ?? ''), 0, 500);
    $experience   = mb_substr(trim($_POST['experience']   ?? ''), 0, 50);
    $portfolio_url = filter_var(trim($_POST['portfolio_url'] ?? ''), FILTER_SANITIZE_URL);

    // Teaching Expert fields
    $te_qualification    = mb_substr(trim($_POST['te_qualification'] ?? ''), 0, 100);
    $te_experience_years = intval($_POST['te_experience_years'] ?? 0);
    $te_specialization   = mb_substr(trim($_POST['te_specialization'] ?? ''), 0, 255);
    $te_linkedin_url     = filter_var(trim($_POST['te_linkedin_url'] ?? ''), FILTER_SANITIZE_URL);

    // Sanitize & length-cap core inputs (A03)

    $name      = mb_substr(trim($_POST['name'] ?? ''), 0, 100);
    $email     = sanitize_email($_POST['email'] ?? '');
    $phone     = preg_replace('/[^0-9]/', '', $_POST['phone'] ?? '');
    $whatsapp  = preg_replace('/[^0-9]/', '', $_POST['whatsapp'] ?? '');
    $password  = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';

    $allowed_types = ['intern', 'campus_saarthi', 'part_time', 'teaching_expert', 'employee'];
    if (!in_array($user_type, $allowed_types)) {
        $error = 'Please select a valid account type.';
    } elseif (strlen($password) > 128) {
        $error = 'Invalid input.';
    } elseif (empty($name) || empty($email) || empty($phone) || empty($password)) {
        $error = 'Please fill in all required fields.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Please enter a valid email address.';
    } elseif (!preg_match('/^[0-9]{10}$/', $phone)) {
        $error = 'Please enter a valid 10-digit phone number.';
    } elseif (strlen($password) < 8) {
        $error = 'Password must be at least 8 characters long.';
    } elseif ($password !== $confirm_password) {
        $error = 'Passwords do not match.';
    } elseif ($user_type === 'campus_saarthi' && (empty($college_name) || empty($course_year))) {
        $error = 'College name and course/year are required for Saarthi.';
    } elseif ($user_type === 'teaching_expert' && (empty($te_qualification) || $te_experience_years < 5)) {
        $error = 'Qualification and minimum 5 years of experience are required for Teaching Expert.';
    } else {
        try {
            $pdo = getDBConnection();

            // Check if email already exists
            $stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                $error = 'An account with this email already exists. <a href="' . BASE_PATH . '/login.php" class="underline font-semibold">Sign in instead</a>';
            } else {
                // Generate user ID and referral code
                $user_id = generateUserId($user_type);
                $password_hash = password_hash($password, PASSWORD_DEFAULT);
                $referral_code = null;
                if ($user_type === 'campus_saarthi' && !empty($college_name)) {
                    $referral_code = generateReferralCode($college_name, $course_year ?: date('Y'));
                }

                $stmt = $pdo->prepare("
                    INSERT INTO users (user_id, name, email, phone, whatsapp, password_hash, user_type, college, course_year, referral_code, status, email_verified, joined_date, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'inactive', 0, CURDATE(), NOW())
                ");
                $stmt->execute([
                    $user_id,
                    $name,
                    $email,
                    $phone,
                    $whatsapp ?: $phone,
                    $password_hash,
                    $user_type,
                    $college_name ?: null,
                    $course_year ?: null,
                    $referral_code,
                ]);

                // Teaching Expert: insert into trainer_profiles
                if ($user_type === 'teaching_expert') {
                    try {
                        $pdo->exec("CREATE TABLE IF NOT EXISTS trainer_profiles (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            user_id VARCHAR(50) NOT NULL,
                            qualification VARCHAR(100),
                            experience_years INT DEFAULT 0,
                            specialization VARCHAR(255),
                            linkedin_url VARCHAR(500),
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            UNIQUE KEY (user_id)
                        )");
                        $stmt2 = $pdo->prepare("INSERT INTO trainer_profiles (user_id, qualification, experience_years, specialization, linkedin_url) VALUES (?, ?, ?, ?, ?)");
                        $stmt2->execute([$user_id, $te_qualification, $te_experience_years, $te_specialization, $te_linkedin_url ?: null]);
                    } catch (Exception $ignore) {}
                }

                // Log activity
                logActivity($user_id, 'register', 'New user registered as ' . $user_type);

                // Generate OTP for Signup
                try {
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
                } catch (Exception $e) {}

                $otp = sprintf('%06d', mt_rand(1, 999999));
                $stmt = $pdo->prepare("INSERT INTO otp_verifications (email, otp, context, expires_at) VALUES (?, ?, 'signup', DATE_ADD(NOW(), INTERVAL 10 MINUTE))");
                $stmt->execute([$email, $otp]);
                
                require_once __DIR__ . '/includes/mailer.php';
                $subject = 'Verify your Karya Saarthi Account';
                $body = "<div style='font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;'>
                            <h2 style='color: #2563eb;'>Karya Saarthi Registration</h2>
                            <p>Your One-Time Password (OTP) for account verification is:</p>
                            <div style='background: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 8px;'>$otp</div>
                            <p style='color: #666; font-size: 13px; margin-top: 20px;'>This code will expire in 10 minutes. Do not share this with anyone.</p>
                        </div>";
                sendEmail($email, $subject, $body);

                session_start();
                $_SESSION['pending_otp_email'] = $email;

                header('Location: ' . BASE_PATH . '/verify-otp.php?context=signup');
                exit;
            }
        } catch (Exception $e) {
            if (strpos($e->getMessage(), "doesn't exist") !== false) {
                $error = 'Database tables not set up yet. Please run <a href="' . BASE_PATH . '/setup.php" class="underline font-bold">setup.php</a> first.';
            } else {
                $error = 'Registration failed: ' . htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8', false);
            }
        }
    }
}
render:
require_once __DIR__ . '/includes/header.php';
?>

<section class="min-h-screen flex items-center justify-center bg-canvas py-12 px-4 relative overflow-hidden">
    <!-- Grid Background -->
    <div class="absolute inset-0 z-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(circle at 1px 1px, #fff 1px, transparent 0); background-size: 32px 32px;"></div>
    
    <div class="w-full max-w-lg relative z-10">
        <!-- Logo & Heading -->
        <div class="text-center mb-8">
            <a href="<?= BASE_PATH ?>/" class="inline-block">
                <img src="<?= BASE_PATH ?>/images/karyasaarthi.png" alt="Karya Saarthi Logo" class="h-16 w-16 mx-auto mb-4 rounded-xl object-cover border border-hairline">
            </a>
            <h1 class="text-[32px] font-display tracking-display-md text-ink">Create Your Account</h1>
            <p class="text-[16px] text-ink-muted mt-2">Join Karya Saarthi and start your journey</p>
        </div>

        <!-- Register Card -->
        <div class="bg-surface-1 rounded-xl border border-hairline p-8 shadow-2xl">
            <?php if ($error): ?>
                <div class="mb-6 bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center gap-3" role="alert">
                    <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-[14px] font-medium"><?= $error ?></span>
                </div>
            <?php endif; ?>

            <form method="POST" action="" class="space-y-5" id="registerForm" autocomplete="on">
                <?= csrf_field() ?>

                <!-- User Type Selector -->
                <div>
                    <label class="block text-[13px] font-bold tracking-wide text-ink-muted uppercase mb-3">I want to join as</label>
                    <div class="grid grid-cols-3 gap-3" id="typeGrid">
                        <button type="button" data-type="employee"
                                class="user-type-btn flex flex-col items-center gap-2 p-4 bg-surface-2 border border-hairline rounded-xl hover:border-white/30 transition-all text-center cursor-pointer">
                            <i class="fas fa-user-tie text-[24px] text-amber-400"></i>
                            <span class="text-[12px] font-bold text-ink tracking-wide leading-tight">Internal<br>Member</span>
                        </button>
                        <button type="button" data-type="intern"
                                class="user-type-btn flex flex-col items-center gap-2 p-4 bg-surface-2 border border-hairline rounded-xl hover:border-white/30 transition-all text-center cursor-pointer">
                            <i class="fas fa-user-graduate text-[24px] text-cyan-400"></i>
                            <span class="text-[12px] font-bold text-ink tracking-wide">Intern</span>
                        </button>
                        <button type="button" data-type="campus_saarthi"
                                class="user-type-btn flex flex-col items-center gap-2 p-4 bg-surface-2 border border-hairline rounded-xl hover:border-white/30 transition-all text-center cursor-pointer">
                            <i class="fas fa-university text-[24px] text-green-400"></i>
                            <span class="text-[12px] font-bold text-ink tracking-wide">Saarthi</span>
                        </button>
                        <button type="button" data-type="part_time"
                                class="user-type-btn flex flex-col items-center gap-2 p-4 bg-surface-2 border border-hairline rounded-xl hover:border-white/30 transition-all text-center cursor-pointer">
                            <i class="fas fa-clock text-[24px] text-pink-400"></i>
                            <span class="text-[12px] font-bold text-ink tracking-wide">Part-Time</span>
                        </button>
                        <button type="button" data-type="teaching_expert"
                                class="user-type-btn flex flex-col items-center gap-2 p-4 bg-surface-2 border border-hairline rounded-xl hover:border-white/30 transition-all text-center cursor-pointer col-span-3 sm:col-span-1">
                            <i class="fas fa-chalkboard-teacher text-[24px] text-amber-400"></i>
                            <span class="text-[12px] font-bold text-ink tracking-wide text-center leading-tight">Teaching<br>Expert</span>
                        </button>
                    </div>
                    <input type="hidden" name="user_type" id="userType" value="<?= htmlspecialchars($_POST['user_type'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" required>
                    <p class="text-[13px] text-ink-muted mt-3 text-center" id="typeHint">Select your account type to continue</p>
                </div>

                <!-- Common Fields -->
                <div id="commonFields" class="space-y-4 hidden mt-6 pt-6 border-t border-hairline">
                    <!-- Full Name -->
                    <div>
                        <label for="name" class="block text-[13px] font-bold tracking-wide text-ink-muted uppercase mb-1.5">Full Name <span class="text-red-400">*</span></label>
                        <input type="text" id="name" name="name" required
                               value="<?= htmlspecialchars($_POST['name'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>"
                               class="text-input"
                               placeholder="Enter your full name">
                    </div>

                    <!-- Email -->
                    <div>
                        <label for="email" class="block text-[13px] font-bold tracking-wide text-ink-muted uppercase mb-1.5">Email Address <span class="text-red-400">*</span></label>
                        <input type="email" id="email" name="email" required
                               value="<?= htmlspecialchars($_POST['email'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>"
                               class="text-input"
                               placeholder="you@example.com">
                    </div>

                    <!-- Phone & WhatsApp -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="phone" class="block text-[13px] font-bold tracking-wide text-ink-muted uppercase mb-1.5">Phone <span class="text-red-400">*</span></label>
                            <input type="tel" id="phone" name="phone" required
                                   value="<?= htmlspecialchars($_POST['phone'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>"
                                   class="text-input"
                                   placeholder="10-digit number" maxlength="10" pattern="[0-9]{10}">
                        </div>
                        <div>
                            <label for="whatsapp" class="block text-[13px] font-bold tracking-wide text-ink-muted uppercase mb-1.5">WhatsApp</label>
                            <input type="tel" id="whatsapp" name="whatsapp"
                                   value="<?= htmlspecialchars($_POST['whatsapp'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>"
                                   class="text-input"
                                   placeholder="Same as phone?" maxlength="10" pattern="[0-9]{10}">
                        </div>
                    </div>

                    <!-- Saarthi Extra Fields -->
                    <div id="campusSaarthiFields" class="space-y-4 hidden">
                        <div class="p-5 bg-surface-2 rounded-xl border border-hairline">
                            <h3 class="text-[14px] font-bold text-ink uppercase tracking-wider mb-4"><i class="fas fa-university text-green-400 mr-2"></i>Saarthi Details</h3>
                            <div class="space-y-4">
                                <div>
                                    <label for="college_name" class="block text-[13px] font-bold tracking-wide text-ink-muted uppercase mb-1.5">College Name <span class="text-red-400">*</span></label>
                                    <input type="text" id="college_name" name="college_name"
                                           value="<?= htmlspecialchars($_POST['college_name'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>"
                                           class="text-input"
                                           placeholder="e.g., IIT Delhi">
                                </div>
                                <div>
                                    <label for="course_year" class="block text-[13px] font-bold tracking-wide text-ink-muted uppercase mb-1.5">Course / Year <span class="text-red-400">*</span></label>
                                    <input type="text" id="course_year" name="course_year"
                                           value="<?= htmlspecialchars($_POST['course_year'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>"
                                           class="text-input"
                                           placeholder="e.g., B.Tech CSE, 3rd Year">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Teaching Expert Extra Fields -->
                    <div id="teachingExpertFields" class="space-y-4 hidden">
                        <div class="p-5 bg-surface-2 rounded-xl border border-hairline">
                            <h3 class="text-[14px] font-bold text-ink uppercase tracking-wider mb-4"><i class="fas fa-chalkboard-teacher text-amber-400 mr-2"></i>Teaching Expert Details</h3>
                            <div class="space-y-4">
                                <div>
                                    <label for="te_qualification" class="block text-[13px] font-bold tracking-wide text-ink-muted uppercase mb-1.5">Qualification <span class="text-red-400">*</span></label>
                                    <select id="te_qualification" name="te_qualification"
                                            class="text-input appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center] bg-[length:0.75rem_auto]">
                                        <option value="">Select qualification</option>
                                        <option value="Masters" <?= ($_POST['te_qualification'] ?? '') === 'Masters' ? 'selected' : '' ?>>Masters</option>
                                        <option value="PhD" <?= ($_POST['te_qualification'] ?? '') === 'PhD' ? 'selected' : '' ?>>PhD</option>
                                        <option value="CA/CFA" <?= ($_POST['te_qualification'] ?? '') === 'CA/CFA' ? 'selected' : '' ?>>CA/CFA</option>
                                        <option value="Professional Certification" <?= ($_POST['te_qualification'] ?? '') === 'Professional Certification' ? 'selected' : '' ?>>Professional Certification</option>
                                    </select>
                                </div>
                                <div>
                                    <label for="te_experience_years" class="block text-[13px] font-bold tracking-wide text-ink-muted uppercase mb-1.5">Years of Experience <span class="text-red-400">*</span> <span class="text-[11px] font-normal opacity-80 normal-case">(minimum 5)</span></label>
                                    <input type="number" id="te_experience_years" name="te_experience_years" min="5"
                                           value="<?= htmlspecialchars($_POST['te_experience_years'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>"
                                           class="text-input"
                                           placeholder="Minimum 5 years">
                                </div>
                                <div>
                                    <label for="te_specialization" class="block text-[13px] font-bold tracking-wide text-ink-muted uppercase mb-1.5">Specialization</label>
                                    <input type="text" id="te_specialization" name="te_specialization"
                                           value="<?= htmlspecialchars($_POST['te_specialization'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>"
                                           class="text-input"
                                           placeholder="e.g., Data Science, Finance, Mathematics">
                                </div>
                                <div>
                                    <label for="te_linkedin_url" class="block text-[13px] font-bold tracking-wide text-ink-muted uppercase mb-1.5">LinkedIn URL <span class="text-[11px] font-normal opacity-80 normal-case">(optional)</span></label>
                                    <input type="url" id="te_linkedin_url" name="te_linkedin_url"
                                           value="<?= htmlspecialchars($_POST['te_linkedin_url'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>"
                                           class="text-input"
                                           placeholder="https://linkedin.com/in/yourprofile">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Password -->
                    <div>
                        <label for="password" class="block text-[13px] font-bold tracking-wide text-ink-muted uppercase mb-1.5">Password <span class="text-red-400">*</span></label>
                        <div class="relative">
                            <input type="password" id="password" name="password" required minlength="8"
                                   class="text-input pr-12"
                                   placeholder="Minimum 8 characters">
                            <button type="button" onclick="toggleField('password', 'eyeIcon1')" class="absolute inset-y-0 right-0 flex items-center pr-3 text-ink-muted opacity-60 hover:opacity-100 transition-opacity">
                                <i id="eyeIcon1" class="fas fa-eye"></i>
                            </button>
                        </div>
                        <!-- Password Strength Indicator -->
                        <div class="mt-2 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                            <div id="strengthBar" class="h-full rounded-full transition-all duration-300" style="width: 0%"></div>
                        </div>
                        <p id="strengthText" class="text-[12px] mt-1 text-ink-muted font-bold"></p>
                    </div>

                    <!-- Confirm Password -->
                    <div>
                        <label for="confirm_password" class="block text-[13px] font-bold tracking-wide text-ink-muted uppercase mb-1.5">Confirm Password <span class="text-red-400">*</span></label>
                        <div class="relative">
                            <input type="password" id="confirm_password" name="confirm_password" required minlength="8"
                                   class="text-input pr-12"
                                   placeholder="Re-enter your password">
                            <button type="button" onclick="toggleField('confirm_password', 'eyeIcon2')" class="absolute inset-y-0 right-0 flex items-center pr-3 text-ink-muted opacity-60 hover:opacity-100 transition-opacity">
                                <i id="eyeIcon2" class="fas fa-eye"></i>
                            </button>
                        </div>
                        <p id="matchMsg" class="text-[12px] mt-1 hidden font-bold"></p>
                    </div>

                    <!-- Submit -->
                    <button type="submit" id="submitBtn" disabled
                            class="button-primary w-full h-[48px] mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
                        Create Account
                    </button>
                </div>
            </form>

            <!-- Divider -->
            <div class="relative my-6">
                <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-hairline"></div>
                </div>
                <div class="relative flex justify-center text-[12px]">
                    <span class="px-4 bg-surface-1 text-ink-muted uppercase tracking-wider font-bold">Already have an account?</span>
                </div>
            </div>

            <!-- Login Link -->
            <a href="<?= BASE_PATH ?>/login.php" class="button-secondary w-full h-[48px]">
                Sign In
            </a>
        </div>

        <!-- Footer Note -->
        <p class="text-center text-[13px] text-ink-muted mt-6">
            By creating an account, you agree to our
            <a href="<?= BASE_PATH ?>/terms.php" class="text-accent-blue hover:underline">Terms of Service</a>
            and <a href="<?= BASE_PATH ?>/privacy.php" class="text-accent-blue hover:underline">Privacy Policy</a>.
        </p>
    </div>
</section>

<script>
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirm_password');
const strengthBar = document.getElementById('strengthBar');
const strengthText = document.getElementById('strengthText');
const matchMsg = document.getElementById('matchMsg');

// User Type Selection
const typeButtons = document.querySelectorAll('.user-type-btn');
const userTypeInput = document.getElementById('userType');
const commonFields = document.getElementById('commonFields');
const campusSaarthiFields = document.getElementById('campusSaarthiFields');
const teachingExpertFields = document.getElementById('teachingExpertFields');
const typeHint = document.getElementById('typeHint');

const typeLabels = {
    employee: 'Register as an Internal Member — core team, operations, HR, tech & more',
    intern: 'Register as an Intern to find opportunities',
    campus_saarthi: 'Register as a Saarthi to represent your college',
    part_time: 'Register for Part-Time / Remote work opportunities',
    teaching_expert: 'Register as a Teaching Expert to share your expertise'
};

typeButtons.forEach(btn => {
    btn.addEventListener('click', function () {
        const type = this.dataset.type;
        userTypeInput.value = type;

        // Update active state
        typeButtons.forEach(b => {
            b.classList.remove('border-white/40', 'bg-surface-1/5', 'shadow-md');
            b.classList.add('border-hairline', 'bg-surface-2');
        });
        this.classList.remove('border-hairline', 'bg-surface-2');
        this.classList.add('border-white/40', 'bg-surface-1/5', 'shadow-md');

        // Show common fields
        commonFields.classList.remove('hidden');
        typeHint.textContent = typeLabels[type] || '';
        typeHint.classList.add('text-ink-muted');

        // Toggle extra fields
        campusSaarthiFields.classList.toggle('hidden', type !== 'campus_saarthi');
        teachingExpertFields.classList.toggle('hidden', type !== 'teaching_expert');

        validateForm();
    });
});

// Restore selected type on validation error
const savedType = userTypeInput.value;
if (savedType) {
    const btn = document.querySelector(`[data-type="${savedType}"]`);
    if (btn) btn.click();
}

// Password Strength

passwordInput.addEventListener('input', function () {
    const val = this.value;
    let score = 0;
    if (val.length >= 8) score++;
    if (val.length >= 12) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const levels = [
        { width: '0%', color: 'bg-surface-2', text: '' },
        { width: '20%', color: 'bg-red-500', text: 'Very weak' },
        { width: '40%', color: 'bg-orange-500', text: 'Weak' },
        { width: '60%', color: 'bg-yellow-500', text: 'Fair' },
        { width: '80%', color: 'bg-zinc-400', text: 'Strong' },
        { width: '100%', color: 'bg-green-500', text: 'Very strong' }
    ];

    const level = levels[score] || levels[0];
    strengthBar.style.width = level.width;
    strengthBar.className = `h-full rounded-full transition-all duration-300 ${level.color}`;
    strengthText.textContent = level.text;
    checkPasswordMatch();
    validateForm();
});

// Password Match

confirmInput.addEventListener('input', function () {
    checkPasswordMatch();
    validateForm();
});

function checkPasswordMatch() {
    const pass = passwordInput.value;
    const confirm = confirmInput.value;
    if (!confirm) {
        matchMsg.classList.add('hidden');
        return;
    }
    matchMsg.classList.remove('hidden');
    if (pass === confirm) {
        matchMsg.textContent = 'Passwords match';
        matchMsg.className = 'text-[12px] mt-1 font-bold text-green-400';
    } else {
        matchMsg.textContent = 'Passwords do not match';
        matchMsg.className = 'text-[12px] mt-1 font-bold text-red-400';
    }
}

// Toggle password visibility
function toggleField(id, iconId) {
    const input = document.getElementById(id);
    const icon = document.getElementById(iconId);
    if (input.type === 'password') {
        input.type = 'text';
        if (icon) icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        if (icon) icon.className = 'fas fa-eye';
    }
}

// Form validation
function validateForm() {
    const btn = document.getElementById('submitBtn');
    const type = userTypeInput.value;
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const pass = passwordInput.value;
    const confirm = confirmInput.value;

    let valid = type && name && email && phone.length === 10 && pass.length >= 8 && pass === confirm;

    if (type === 'campus_saarthi') {
        valid = valid && document.getElementById('college_name').value.trim() && document.getElementById('course_year').value.trim();
    }
    if (type === 'teaching_expert') {
        valid = valid && document.getElementById('te_qualification').value && parseInt(document.getElementById('te_experience_years').value) >= 5;
    }

    btn.disabled = !valid;
}

// Attach validation to all inputs
document.querySelectorAll('#registerForm input, #registerForm select').forEach(el => {
    el.addEventListener('input', validateForm);
    el.addEventListener('change', validateForm);
});

// Phone auto-fill WhatsApp
document.getElementById('phone').addEventListener('blur', function () {
    const wa = document.getElementById('whatsapp');
    if (!wa.value) wa.value = this.value;
});

// Form submit validation
document.getElementById('registerForm').addEventListener('submit', function (e) {
    if (!userTypeInput.value) {
        e.preventDefault();
        alert('Please select an account type.');
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(document.getElementById('email').value)) {
        e.preventDefault();
        alert('Please enter a valid email address.');
    }
});
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>





