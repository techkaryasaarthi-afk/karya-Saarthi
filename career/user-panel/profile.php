<?php
$pageTitle = 'My Profile';
require_once __DIR__ . '/../config/auth.php';
requireLogin();

$pdo = getDBConnection();
$userId = $_SESSION['user_id'];
$successMsg = '';
$errorMsg = '';

// Ensure profile columns exist
$newCols = [
    "address TEXT NULL", "profile_photo VARCHAR(500) NULL", "whatsapp VARCHAR(20) NULL",
    "date_of_birth DATE NULL", "gender ENUM('male','female','other') NULL", "blood_group VARCHAR(5) NULL",
    "bank_name VARCHAR(100) NULL", "bank_account_no VARCHAR(30) NULL", "bank_ifsc VARCHAR(20) NULL",
    "emergency_contact_name VARCHAR(100) NULL", "emergency_contact_phone VARCHAR(20) NULL",
    "aadhar_number VARCHAR(20) NULL", "pan_number VARCHAR(15) NULL",
    "city VARCHAR(100) NULL", "state VARCHAR(100) NULL", "pincode VARCHAR(10) NULL",
    "is_hr_intern BOOLEAN DEFAULT FALSE"
];
foreach ($newCols as $col) { try { $pdo->exec("ALTER TABLE users ADD COLUMN $col"); } catch (Exception $e) {} }

// Handle profile photo upload
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'update_profile') {
        $phone = sanitize($_POST['phone'] ?? '');
        $whatsapp = sanitize($_POST['whatsapp'] ?? '');
        $address = sanitize($_POST['address'] ?? '');
        $dob = sanitize($_POST['date_of_birth'] ?? '');
        $gender = sanitize($_POST['gender'] ?? '');
        $bloodGroup = sanitize($_POST['blood_group'] ?? '');
        $bankName = sanitize($_POST['bank_name'] ?? '');
        $bankAccount = sanitize($_POST['bank_account_no'] ?? '');
        $bankIfsc = sanitize($_POST['bank_ifsc'] ?? '');
        $emergName = sanitize($_POST['emergency_contact_name'] ?? '');
        $emergPhone = sanitize($_POST['emergency_contact_phone'] ?? '');
        $aadhar = sanitize($_POST['aadhar_number'] ?? '');
        $pan = sanitize($_POST['pan_number'] ?? '');
        $city = sanitize($_POST['city'] ?? '');
        $state = sanitize($_POST['state'] ?? '');
        $pincode = sanitize($_POST['pincode'] ?? '');

        // Handle file upload
        $photoPath = null;
        if (isset($_FILES['profile_photo']) && $_FILES['profile_photo']['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES['profile_photo'];
            $maxSize = 2 * 1024 * 1024;
            $allowed = ['image/jpeg', 'image/png', 'image/webp'];
            if ($file['size'] > $maxSize) { $errorMsg = 'Photo must be under 2MB.'; }
            elseif (!in_array($file['type'], $allowed)) { $errorMsg = 'Only JPG, PNG, and WebP images are allowed.'; }
            else {
                $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
                $filename = $userId . '_' . time() . '.' . $ext;
                $uploadDir = __DIR__ . '/../uploads/profiles/';
                if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
                if (move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
                    $photoPath = '/uploads/profiles/' . $filename;
                    $oldPhoto = $pdo->prepare("SELECT profile_photo FROM users WHERE user_id = ?");
                    $oldPhoto->execute([$userId]); $old = $oldPhoto->fetchColumn();
                    if ($old && file_exists(__DIR__ . '/..' . $old)) @unlink(__DIR__ . '/..' . $old);
                } else { $errorMsg = 'Failed to upload photo.'; }
            }
        }

        if (empty($errorMsg)) {
            $sql = "UPDATE users SET phone=?, whatsapp=?, address=?, date_of_birth=?, gender=?, blood_group=?, bank_name=?, bank_account_no=?, bank_ifsc=?, emergency_contact_name=?, emergency_contact_phone=?, aadhar_number=?, pan_number=?, city=?, state=?, pincode=?";
            $params = [$phone, $whatsapp, $address, $dob ?: null, $gender ?: null, $bloodGroup, $bankName, $bankAccount, $bankIfsc, $emergName, $emergPhone, $aadhar, $pan, $city, $state, $pincode];
            if ($photoPath) { $sql .= ", profile_photo=?"; $params[] = $photoPath; $_SESSION['profile_photo'] = $photoPath; }
            $sql .= " WHERE user_id=?";
            $params[] = $userId;
            $stmt = $pdo->prepare($sql); $stmt->execute($params);
            $successMsg = 'Profile updated successfully!';
            logActivity($userId, 'profile_updated', 'Updated profile info');
        }
    }
}

// Fetch user data
$stmt = $pdo->prepare("SELECT * FROM users WHERE user_id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch();

// Task stats
$taskStats = ['total' => 0, 'pending' => 0, 'in_progress' => 0, 'completed' => 0];
try {
    $stmt = $pdo->prepare("SELECT COUNT(*) as total, SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN status='in_progress' THEN 1 ELSE 0 END) as in_progress, SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed FROM tasks WHERE assigned_to=?");
    $stmt->execute([$userId]);
    $taskStats = $stmt->fetch() ?: $taskStats;
} catch (Exception $e) {}

// Recent tasks
$recentTasks = [];
try {
    $stmt = $pdo->prepare("SELECT * FROM tasks WHERE assigned_to=? ORDER BY FIELD(status,'in_progress','pending','completed'), created_at DESC LIMIT 5");
    $stmt->execute([$userId]);
    $recentTasks = $stmt->fetchAll();
} catch (Exception $e) {}

// Leave balances
$currentYear = date('Y');
$leaveTypes = ['casual' => 12, 'sick' => 6, 'earned' => 15];
$balances = [];
foreach ($leaveTypes as $type => $defaultTotal) {
    try {
        $stmt = $pdo->prepare("SELECT total_days, used_days FROM leave_balances WHERE user_id=? AND leave_type=? AND year=?");
        $stmt->execute([$userId, $type, $currentYear]);
        $bal = $stmt->fetch();
        $balances[$type] = ['total' => $bal ? $bal['total_days'] : $defaultTotal, 'used' => $bal ? $bal['used_days'] : 0, 'remaining' => $bal ? ($bal['total_days'] - $bal['used_days']) : $defaultTotal];
    } catch (Exception $e) {
        $balances[$type] = ['total' => $defaultTotal, 'used' => 0, 'remaining' => $defaultTotal];
    }
}

// Recent leaves
$recentLeaves = [];
try {
    $stmt = $pdo->prepare("SELECT * FROM leave_requests WHERE user_id=? ORDER BY created_at DESC LIMIT 5");
    $stmt->execute([$userId]);
    $recentLeaves = $stmt->fetchAll();
} catch (Exception $e) {}

// Attendance stats this month
$attendanceStats = ['days_worked' => 0, 'total_hours' => 0];
try {
    $stmt = $pdo->prepare("SELECT COUNT(*) as days_worked, COALESCE(SUM(duration_minutes),0) as total_mins FROM attendance WHERE user_id=? AND MONTH(date)=MONTH(CURDATE()) AND YEAR(date)=YEAR(CURDATE()) AND status='completed'");
    $stmt->execute([$userId]);
    $att = $stmt->fetch();
    $attendanceStats = ['days_worked' => $att['days_worked'] ?? 0, 'total_hours' => round(($att['total_mins'] ?? 0) / 60, 1)];
} catch (Exception $e) {}

// Leaves taken this month
$leavesThisMonth = 0;
try {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM leave_requests WHERE user_id=? AND status='approved' AND MONTH(start_date)=MONTH(CURDATE()) AND YEAR(start_date)=YEAR(CURDATE())");
    $stmt->execute([$userId]);
    $leavesThisMonth = (int)$stmt->fetchColumn();
} catch (Exception $e) {}

// Avg hours per day this month
$avgHoursPerDay = $attendanceStats['days_worked'] > 0 ? round($attendanceStats['total_hours'] / $attendanceStats['days_worked'], 1) : 0;

// Tasks completed (completed_at may be NULL even when status=completed, count all completed)
$tasksCompletedMonth = 0;
try {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM tasks WHERE assigned_to=? AND status='completed'");
    $stmt->execute([$userId]);
    $tasksCompletedMonth = (int)$stmt->fetchColumn();
} catch (Exception $e) {}

$initials = strtoupper(substr(explode(' ', trim($user['name'] ?? 'U'))[0], 0, 1) . (isset(explode(' ', trim($user['name'] ?? 'U'))[1]) ? substr(explode(' ', trim($user['name'] ?? 'U'))[1], 0, 1) : ''));

require_once __DIR__ . '/../includes/header.php';
?>

<div class="flex min-h-[calc(100vh-56px)] bg-surface-2">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 dashboard-content-area">
        <div class="p-4 sm:p-6 lg:p-8 max-w-5xl">

            <?php if ($successMsg): ?>
            <div class="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-200 text-green-700 text-sm"><i class="fas fa-check-circle mr-2"></i><?= $successMsg ?></div>
            <?php endif; ?>
            <?php if ($errorMsg): ?>
            <div class="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"><i class="fas fa-exclamation-circle mr-2"></i><?= $errorMsg ?></div>
            <?php endif; ?>

            <!-- Profile Header Card -->
            <div class="bg-surface-1 rounded-2xl border border-hairline overflow-hidden mb-6">
                <div class="h-24 gradient-bg relative"></div>
                <div class="px-6 pb-6 -mt-12">
                    <div class="flex flex-col sm:flex-row sm:items-end gap-4">
                        <div class="relative">
                            <?php if (!empty($user['profile_photo'])): ?>
                            <img src="<?= BASE_PATH . htmlspecialchars($user['profile_photo'], ENT_QUOTES, 'UTF-8', false) ?>" alt="Profile" class="w-24 h-24 rounded-2xl object-cover border-4 border-surface-1 shadow-lg" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
                            <div class="w-24 h-24 rounded-2xl bg-primary-600 border-4 border-surface-1 shadow-lg items-center justify-center text-white text-2xl font-bold hidden"><?= $initials ?></div>
                            <?php else: ?>
                            <div class="w-24 h-24 rounded-2xl bg-primary-600 border-4 border-surface-1 shadow-lg flex items-center justify-center text-white text-2xl font-bold"><?= $initials ?></div>
                            <?php endif; ?>
                        </div>
                        <div class="flex-1 pb-1">
                            <h1 class="text-xl font-bold text-ink"><?= htmlspecialchars($user['name'] ?? '', ENT_QUOTES, 'UTF-8', false) ?></h1>
                            <div class="flex flex-wrap items-center gap-2 mt-1">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700"><?= getUserTypeLabel($user['user_type'] ?? '') ?></span>
                                <span class="text-xs text-ink-muted font-mono"><?= htmlspecialchars($user['user_id'] ?? '', ENT_QUOTES, 'UTF-8', false) ?></span>
                                <?php if (!empty($user['joined_date'])): ?>
                                <span class="text-xs text-ink-muted"><i class="fas fa-calendar-alt mr-1"></i>Joined <?= date('M Y', strtotime($user['joined_date'])) ?></span>
                                <?php endif; ?>
                            </div>
                        </div>
                        <button onclick="document.getElementById('editProfileForm').classList.toggle('hidden')" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition self-start sm:self-auto">
                            <i class="fas fa-edit mr-1"></i>Edit Profile
                        </button>
                    </div>

                    <!-- Contact Info -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                        <div class="flex items-center gap-2 text-sm"><i class="fas fa-envelope text-ink-muted w-4"></i><span class="text-ink-muted"><?= htmlspecialchars($user['email'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></span></div>
                        <div class="flex items-center gap-2 text-sm"><i class="fas fa-phone text-ink-muted w-4"></i><span class="text-ink-muted"><?= htmlspecialchars($user['phone'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></span></div>
                        <div class="flex items-center gap-2 text-sm"><i class="fab fa-whatsapp text-ink-muted w-4"></i><span class="text-ink-muted"><?= htmlspecialchars($user['whatsapp'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></span></div>
                        <div class="flex items-center gap-2 text-sm"><i class="fas fa-graduation-cap text-ink-muted w-4"></i><span class="text-ink-muted"><?= htmlspecialchars($user['college'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></span></div>
                    </div>
                    <?php if (!empty($user['address'])): ?>
                    <div class="flex items-start gap-2 text-sm mt-2"><i class="fas fa-map-marker-alt text-ink-muted w-4 mt-0.5"></i><span class="text-ink-muted"><?= htmlspecialchars($user['address'], ENT_QUOTES, 'UTF-8', false) ?></span></div>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Personal Details Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <!-- Personal Info -->
                <div class="bg-surface-1 rounded-xl border border-hairline p-4">
                    <h3 class="text-xs font-semibold text-ink-muted uppercase mb-3"><i class="fas fa-id-badge mr-1 text-primary-500"></i>Personal Info</h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between"><span class="text-ink-muted">DOB</span><span class="text-ink font-medium"><?= !empty($user['date_of_birth']) ? date('d M Y', strtotime($user['date_of_birth'])) : 'Not set' ?></span></div>
                        <div class="flex justify-between"><span class="text-ink-muted">Gender</span><span class="text-ink font-medium"><?= !empty($user['gender']) ? ucfirst($user['gender']) : 'Not set' ?></span></div>
                        <div class="flex justify-between"><span class="text-ink-muted">Blood Group</span><span class="text-ink font-medium"><?= !empty($user['blood_group']) ? htmlspecialchars($user['blood_group'], ENT_QUOTES, 'UTF-8', false) : 'Not set' ?></span></div>
                        <div class="flex justify-between"><span class="text-ink-muted">City</span><span class="text-ink font-medium"><?= !empty($user['city']) ? htmlspecialchars($user['city'], ENT_QUOTES, 'UTF-8', false) : 'Not set' ?></span></div>
                        <div class="flex justify-between"><span class="text-ink-muted">State</span><span class="text-ink font-medium"><?= !empty($user['state']) ? htmlspecialchars($user['state'], ENT_QUOTES, 'UTF-8', false) : 'Not set' ?></span></div>
                    </div>
                </div>
                <!-- Bank Details -->
                <div class="bg-surface-1 rounded-xl border border-hairline p-4">
                    <h3 class="text-xs font-semibold text-ink-muted uppercase mb-3"><i class="fas fa-university mr-1 text-green-500"></i>Bank Details</h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between"><span class="text-ink-muted">Bank</span><span class="text-ink font-medium"><?= !empty($user['bank_name']) ? htmlspecialchars($user['bank_name'], ENT_QUOTES, 'UTF-8', false) : 'Not set' ?></span></div>
                        <div class="flex justify-between"><span class="text-ink-muted">Account No.</span><span class="text-ink font-medium font-mono"><?= !empty($user['bank_account_no']) ? '••••' . substr($user['bank_account_no'], -4) : 'Not set' ?></span></div>
                        <div class="flex justify-between"><span class="text-ink-muted">IFSC</span><span class="text-ink font-medium font-mono"><?= !empty($user['bank_ifsc']) ? htmlspecialchars($user['bank_ifsc'], ENT_QUOTES, 'UTF-8', false) : 'Not set' ?></span></div>
                    </div>
                </div>
                <!-- Emergency Contact -->
                <div class="bg-surface-1 rounded-xl border border-hairline p-4">
                    <h3 class="text-xs font-semibold text-ink-muted uppercase mb-3"><i class="fas fa-phone-alt mr-1 text-red-500"></i>Emergency Contact</h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between"><span class="text-ink-muted">Name</span><span class="text-ink font-medium"><?= !empty($user['emergency_contact_name']) ? htmlspecialchars($user['emergency_contact_name'], ENT_QUOTES, 'UTF-8', false) : 'Not set' ?></span></div>
                        <div class="flex justify-between"><span class="text-ink-muted">Phone</span><span class="text-ink font-medium"><?= !empty($user['emergency_contact_phone']) ? htmlspecialchars($user['emergency_contact_phone'], ENT_QUOTES, 'UTF-8', false) : 'Not set' ?></span></div>
                        <div class="flex justify-between"><span class="text-ink-muted">Aadhar</span><span class="text-ink font-medium font-mono"><?= !empty($user['aadhar_number']) ? '••••' . substr($user['aadhar_number'], -4) : 'Not set' ?></span></div>
                        <div class="flex justify-between"><span class="text-ink-muted">PAN</span><span class="text-ink font-medium font-mono"><?= !empty($user['pan_number']) ? htmlspecialchars($user['pan_number'], ENT_QUOTES, 'UTF-8', false) : 'Not set' ?></span></div>
                    </div>
                </div>
            </div>

            <div id="editProfileForm" class="hidden bg-surface-1 rounded-2xl border border-hairline p-6 mb-6">
                <h2 class="text-lg font-semibold text-ink mb-4"><i class="fas fa-user-edit mr-2 text-primary-500"></i>Edit Profile</h2>
                <form method="POST" enctype="multipart/form-data">
                    <input type="hidden" name="action" value="update_profile">
                    <p class="text-xs text-ink-muted uppercase font-semibold mb-2">Contact</p>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div><label class="block text-xs font-medium text-ink-muted mb-1">Phone</label><input type="text" name="phone" value="<?= htmlspecialchars($user['phone'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"></div>
                        <div><label class="block text-xs font-medium text-ink-muted mb-1">WhatsApp</label><input type="text" name="whatsapp" value="<?= htmlspecialchars($user['whatsapp'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"></div>
                        <div><label class="block text-xs font-medium text-ink-muted mb-1">Profile Photo <span class="text-xs">(Max 2MB)</span></label><input type="file" name="profile_photo" accept="image/jpeg,image/png,image/webp" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary-50 file:text-primary-700"></div>
                    </div>
                    <div class="mb-4"><label class="block text-xs font-medium text-ink-muted mb-1">Address</label><textarea name="address" rows="2" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"><?= htmlspecialchars($user['address'] ?? '', ENT_QUOTES, 'UTF-8', false) ?></textarea></div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div><label class="block text-xs font-medium text-ink-muted mb-1">City</label><input type="text" name="city" value="<?= htmlspecialchars($user['city'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"></div>
                        <div><label class="block text-xs font-medium text-ink-muted mb-1">State</label><input type="text" name="state" value="<?= htmlspecialchars($user['state'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"></div>
                        <div><label class="block text-xs font-medium text-ink-muted mb-1">Pincode</label><input type="text" name="pincode" value="<?= htmlspecialchars($user['pincode'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"></div>
                    </div>
                    <p class="text-xs text-ink-muted uppercase font-semibold mb-2 mt-5">Personal</p>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div><label class="block text-xs font-medium text-ink-muted mb-1">Date of Birth</label><input type="date" name="date_of_birth" value="<?= htmlspecialchars($user['date_of_birth'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"></div>
                        <div><label class="block text-xs font-medium text-ink-muted mb-1">Gender</label><select name="gender" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"><option value="">Select</option><option value="male" <?= ($user['gender'] ?? '') === 'male' ? 'selected' : '' ?>>Male</option><option value="female" <?= ($user['gender'] ?? '') === 'female' ? 'selected' : '' ?>>Female</option><option value="other" <?= ($user['gender'] ?? '') === 'other' ? 'selected' : '' ?>>Other</option></select></div>
                        <div><label class="block text-xs font-medium text-ink-muted mb-1">Blood Group</label><input type="text" name="blood_group" value="<?= htmlspecialchars($user['blood_group'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" placeholder="e.g. O+" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"></div>
                    </div>
                    <p class="text-xs text-ink-muted uppercase font-semibold mb-2 mt-5">Bank Details</p>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div><label class="block text-xs font-medium text-ink-muted mb-1">Bank Name</label><input type="text" name="bank_name" value="<?= htmlspecialchars($user['bank_name'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"></div>
                        <div><label class="block text-xs font-medium text-ink-muted mb-1">Account Number</label><input type="text" name="bank_account_no" value="<?= htmlspecialchars($user['bank_account_no'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"></div>
                        <div><label class="block text-xs font-medium text-ink-muted mb-1">IFSC Code</label><input type="text" name="bank_ifsc" value="<?= htmlspecialchars($user['bank_ifsc'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"></div>
                    </div>
                    <p class="text-xs text-ink-muted uppercase font-semibold mb-2 mt-5">Emergency Contact & IDs</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div><label class="block text-xs font-medium text-ink-muted mb-1">Emergency Contact Name</label><input type="text" name="emergency_contact_name" value="<?= htmlspecialchars($user['emergency_contact_name'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"></div>
                        <div><label class="block text-xs font-medium text-ink-muted mb-1">Emergency Contact Phone</label><input type="text" name="emergency_contact_phone" value="<?= htmlspecialchars($user['emergency_contact_phone'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"></div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div><label class="block text-xs font-medium text-ink-muted mb-1">Aadhar Number</label><input type="text" name="aadhar_number" value="<?= htmlspecialchars($user['aadhar_number'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"></div>
                        <div><label class="block text-xs font-medium text-ink-muted mb-1">PAN Number</label><input type="text" name="pan_number" value="<?= htmlspecialchars($user['pan_number'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"></div>
                    </div>
                    <div class="flex gap-3">
                        <button type="submit" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition"><i class="fas fa-save mr-1"></i>Save Changes</button>
                        <button type="button" onclick="document.getElementById('editProfileForm').classList.add('hidden')" class="border border-hairline bg-surface-2 text-ink-muted px-6 py-2 rounded-lg text-sm font-medium">Cancel</button>
                    </div>
                </form>
            </div>

            <!-- Monthly Stats -->
            <div class="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                <div class="bg-surface-1 rounded-xl border border-hairline p-4"><div class="flex items-center justify-between"><div><p class="text-xs text-ink-muted uppercase">Tasks</p><p class="text-2xl font-bold text-ink mt-1"><?= $taskStats['total'] ?? 0 ?></p></div><div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center"><i class="fas fa-tasks text-primary-600"></i></div></div></div>
                <div class="bg-surface-1 rounded-xl border border-hairline p-4"><div class="flex items-center justify-between"><div><p class="text-xs text-ink-muted uppercase">In Progress</p><p class="text-2xl font-bold text-blue-600 mt-1"><?= $taskStats['in_progress'] ?? 0 ?></p></div><div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><i class="fas fa-spinner text-blue-600"></i></div></div></div>
                <div class="bg-surface-1 rounded-xl border border-hairline p-4"><div class="flex items-center justify-between"><div><p class="text-xs text-ink-muted uppercase">Days Worked</p><p class="text-2xl font-bold text-green-600 mt-1"><?= $attendanceStats['days_worked'] ?></p></div><div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><i class="fas fa-clock text-green-600"></i></div></div></div>
                <div class="bg-surface-1 rounded-xl border border-hairline p-4"><div class="flex items-center justify-between"><div><p class="text-xs text-ink-muted uppercase">Hours (Month)</p><p class="text-2xl font-bold text-amber-600 mt-1"><?= $attendanceStats['total_hours'] ?></p></div><div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"><i class="fas fa-hourglass-half text-amber-600"></i></div></div></div>
                <div class="bg-surface-1 rounded-xl border border-hairline p-4"><div class="flex items-center justify-between"><div><p class="text-xs text-ink-muted uppercase">Leaves (Month)</p><p class="text-2xl font-bold text-red-500 mt-1"><?= $leavesThisMonth ?></p></div><div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><i class="fas fa-calendar-times text-red-500"></i></div></div></div>
                <div class="bg-surface-1 rounded-xl border border-hairline p-4"><div class="flex items-center justify-between"><div><p class="text-xs text-ink-muted uppercase">Avg Hrs/Day</p><p class="text-2xl font-bold text-purple-600 mt-1"><?= $avgHoursPerDay ?></p></div><div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><i class="fas fa-chart-line text-purple-600"></i></div></div></div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <!-- Recent Tasks -->
                <div class="bg-surface-1 rounded-xl border border-hairline">
                    <div class="p-4 border-b border-hairline flex justify-between items-center">
                        <h2 class="text-sm font-semibold text-ink"><i class="fas fa-tasks mr-2 text-primary-500"></i>Recent Tasks</h2>
                        <a href="<?= BASE_PATH ?>/user-panel/tasks.php" class="text-xs text-primary-600 hover:underline">View All</a>
                    </div>
                    <?php if (empty($recentTasks)): ?>
                    <div class="p-8 text-center text-ink-muted text-sm"><i class="fas fa-clipboard-check text-2xl mb-2 block opacity-50"></i>No tasks assigned yet.</div>
                    <?php else: ?>
                    <div class="divide-y divide-hairline">
                        <?php foreach ($recentTasks as $task):
                            $sc = ['pending'=>'bg-amber-100 text-amber-700','in_progress'=>'bg-blue-100 text-blue-700','completed'=>'bg-green-100 text-green-700'];
                        ?>
                        <div class="px-4 py-3 hover:bg-surface-2 transition">
                            <div class="flex items-center justify-between">
                                <p class="text-sm font-medium text-ink truncate pr-2"><?= htmlspecialchars($task['title'], ENT_QUOTES, 'UTF-8', false) ?></p>
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium <?= $sc[$task['status']] ?? 'bg-surface-2 text-ink-muted' ?> flex-shrink-0"><?= ucfirst(str_replace('_',' ',$task['status'])) ?></span>
                            </div>
                            <?php if ($task['deadline']): ?>
                            <p class="text-xs text-ink-muted mt-1"><i class="fas fa-calendar-alt mr-1"></i><?= date('d M Y', strtotime($task['deadline'])) ?></p>
                            <?php endif; ?>
                        </div>
                        <?php endforeach; ?>
                    </div>
                    <?php endif; ?>
                </div>

                <!-- Leave Balance -->
                <div class="bg-surface-1 rounded-xl border border-hairline">
                    <div class="p-4 border-b border-hairline flex justify-between items-center">
                        <h2 class="text-sm font-semibold text-ink"><i class="fas fa-calendar-minus mr-2 text-primary-500"></i>Leave Balance</h2>
                        <a href="<?= BASE_PATH ?>/user-panel/leave.php" class="text-xs text-primary-600 hover:underline">Manage</a>
                    </div>
                    <div class="p-4 space-y-4">
                        <?php
                        $leaveColors = ['casual'=>['bar'=>'bg-primary-500','text'=>'text-primary-600'],'sick'=>['bar'=>'bg-red-500','text'=>'text-red-600'],'earned'=>['bar'=>'bg-amber-500','text'=>'text-amber-600']];
                        foreach ($balances as $type => $bal):
                            $lc = $leaveColors[$type]; $pct = $bal['total'] > 0 ? round(($bal['used']/$bal['total'])*100) : 0;
                        ?>
                        <div>
                            <div class="flex justify-between mb-1">
                                <span class="text-xs font-semibold text-ink uppercase"><?= ucfirst($type) ?></span>
                                <span class="text-xs <?= $lc['text'] ?> font-bold"><?= $bal['remaining'] ?>/<?= $bal['total'] ?></span>
                            </div>
                            <div class="w-full bg-surface-2 rounded-full h-2"><div class="<?= $lc['bar'] ?> h-2 rounded-full" style="width:<?= $pct ?>%"></div></div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                    <?php if (!empty($recentLeaves)): ?>
                    <div class="border-t border-hairline divide-y divide-hairline">
                        <?php foreach (array_slice($recentLeaves, 0, 3) as $leave):
                            $lsc = ['pending'=>'bg-yellow-100 text-yellow-700','approved'=>'bg-green-100 text-green-700','rejected'=>'bg-red-100 text-red-700'];
                        ?>
                        <div class="px-4 py-2.5 flex items-center justify-between">
                            <div>
                                <p class="text-xs font-medium text-ink"><?= ucfirst($leave['leave_type']) ?> · <?= date('d M', strtotime($leave['start_date'])) ?> - <?= date('d M', strtotime($leave['end_date'])) ?></p>
                                <?php if (!empty($leave['admin_remarks'])): ?>
                                <p class="text-[11px] text-primary-600 truncate max-w-[200px]" title="<?= htmlspecialchars($leave['admin_remarks'], ENT_QUOTES, 'UTF-8', false) ?>"><i class="fas fa-comment-dots mr-1"></i><?= htmlspecialchars($leave['admin_remarks'], ENT_QUOTES, 'UTF-8', false) ?></p>
                                <?php endif; ?>
                            </div>
                            <span class="px-2 py-0.5 rounded-full text-xs font-medium <?= $lsc[$leave['status']] ?? 'bg-surface-2 text-ink-muted' ?>"><?= ucfirst($leave['status']) ?></span>
                        </div>
                        <?php endforeach; ?>
                    </div>
                    <?php endif; ?>
                </div>
            </div>

        </div>
    </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
