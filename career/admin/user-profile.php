<?php
$pageTitle = 'User Profile';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireAdmin();
$pdo = getDBConnection();

// Ensure new columns exist
$newCols = [
    "address TEXT NULL", "date_of_birth DATE NULL", "gender ENUM('male','female','other') NULL",
    "blood_group VARCHAR(5) NULL", "bank_name VARCHAR(100) NULL", "bank_account_no VARCHAR(30) NULL",
    "bank_ifsc VARCHAR(20) NULL", "emergency_contact_name VARCHAR(100) NULL",
    "emergency_contact_phone VARCHAR(20) NULL", "aadhar_number VARCHAR(20) NULL",
    "pan_number VARCHAR(15) NULL", "city VARCHAR(100) NULL", "state VARCHAR(100) NULL",
    "pincode VARCHAR(10) NULL", "is_hr_intern BOOLEAN DEFAULT FALSE",
    "whatsapp VARCHAR(20) NULL", "profile_photo VARCHAR(500) NULL"
];
foreach ($newCols as $col) { try { $pdo->exec("ALTER TABLE users ADD COLUMN $col"); } catch (Exception $e) {} }
try { $pdo->exec("ALTER TABLE tasks ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"); } catch (Exception $e) {}

$viewUserId = $_GET['id'] ?? '';
if (!$viewUserId) { header('Location: ' . BASE_PATH . '/admin/users.php'); exit; }

$stmt = $pdo->prepare("SELECT * FROM users WHERE user_id = ?");
$stmt->execute([$viewUserId]);
$user = $stmt->fetch();
if (!$user) { header('Location: ' . BASE_PATH . '/admin/users.php'); exit; }

// Handle status & leave updates
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    if ($action === 'update_status') {
        $pdo->prepare("UPDATE users SET status=? WHERE user_id=?")->execute([$_POST['status'], $viewUserId]);
        header('Location: ' . BASE_PATH . '/admin/user-profile.php?id=' . urlencode($viewUserId) . '&msg=status_updated');
        exit;
    }
    if ($action === 'grant_leave') {
        $leaveType = trim($_POST['leave_type'] ?? '');
        $startDate = trim($_POST['start_date'] ?? '');
        $endDate = trim($_POST['end_date'] ?? '');
        $adminRemarks = trim($_POST['admin_remarks'] ?? '');

        $validTypes = ['casual', 'sick', 'earned', 'unpaid'];
        if (in_array($leaveType, $validTypes) && !empty($startDate) && !empty($endDate) && $startDate <= $endDate) {
            $start = new DateTime($startDate);
            $end = new DateTime($endDate);
            $totalDays = $start->diff($end)->days + 1;
            $remarks = $adminRemarks ?: 'Granted by Admin';

            try {
                $stmt = $pdo->prepare("INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, reason, status, approved_by, admin_remarks, total_days, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'approved', ?, ?, ?, NOW(), NOW())");
                $stmt->execute([$viewUserId, $leaveType, $startDate, $endDate, 'Granted directly by Admin', $_SESSION['user_id'], $remarks, $totalDays]);

                $year = date('Y', strtotime($startDate));
                syncLeaveBalance($pdo, $viewUserId, $leaveType, $totalDays, $year);

                logActivity($_SESSION['user_id'], 'grant_leave', "Granted {$totalDays} day(s) {$leaveType} leave to {$viewUserId}");
                header('Location: ' . BASE_PATH . '/admin/user-profile.php?id=' . urlencode($viewUserId) . '&tab=leave&msg=leave_granted');
                exit;
            } catch (Exception $e) {
                header('Location: ' . BASE_PATH . '/admin/user-profile.php?id=' . urlencode($viewUserId) . '&tab=leave&msg=leave_error');
                exit;
            }
        }
    }
}

$message = '';
if (($_GET['msg'] ?? '') === 'status_updated') { $message = 'User status updated!'; }
if (($_GET['msg'] ?? '') === 'leave_granted') { $message = 'Leave granted and approved successfully!'; }
if (($_GET['msg'] ?? '') === 'leave_error') { $message = 'Failed to grant leave. Check inputs.'; }

// Tasks
$tasks = $pdo->prepare("SELECT t.*, u.name as assigned_by_name FROM tasks t LEFT JOIN users u ON t.assigned_by=u.user_id WHERE t.assigned_to=? ORDER BY t.created_at DESC");
$tasks->execute([$viewUserId]);
$tasks = $tasks->fetchAll();
$taskStats = ['total'=>count($tasks),'pending'=>0,'in_progress'=>0,'completed'=>0];
foreach($tasks as $t){ if(isset($taskStats[$t['status']])) $taskStats[$t['status']]++; }

// Leave
$leaves = $pdo->prepare("SELECT * FROM leave_requests WHERE user_id=? ORDER BY created_at DESC");
$leaves->execute([$viewUserId]);
$leaves = $leaves->fetchAll();

$currentYear = date('Y');
$leaveTypes = ['casual'=>12,'sick'=>6,'earned'=>15];
$balances = [];
foreach($leaveTypes as $type=>$def){
    try{
        $s=$pdo->prepare("SELECT total_days,used_days FROM leave_balances WHERE user_id=? AND leave_type=? AND year=?");
        $s->execute([$viewUserId,$type,$currentYear]);
        $b=$s->fetch();
        $balances[$type]=['total'=>$b?$b['total_days']:$def,'used'=>$b?$b['used_days']:0,'remaining'=>$b?($b['total_days']-$b['used_days']):$def];
    }catch(Exception $e){ $balances[$type]=['total'=>$def,'used'=>0,'remaining'=>$def]; }
}

// Attendance
$attendance = $pdo->prepare("SELECT * FROM attendance WHERE user_id=? ORDER BY date DESC LIMIT 30");
$attendance->execute([$viewUserId]);
$attendance = $attendance->fetchAll();

// Activity
$activity = [];
try{
    $s=$pdo->prepare("SELECT * FROM activity_logs WHERE user_id=? ORDER BY created_at DESC LIMIT 20");
    $s->execute([$viewUserId]);
    $activity=$s->fetchAll();
}catch(Exception $e){}

// Monthly attendance stats
$monthlyStats = ['days_worked' => 0, 'total_hours' => 0, 'leaves_month' => 0, 'tasks_completed_month' => 0];
try {
    $s = $pdo->prepare("SELECT COUNT(*) as d, COALESCE(SUM(duration_minutes),0) as m FROM attendance WHERE user_id=? AND MONTH(date)=MONTH(CURDATE()) AND YEAR(date)=YEAR(CURDATE()) AND status='completed'");
    $s->execute([$viewUserId]); $r = $s->fetch();
    $monthlyStats['days_worked'] = $r['d'] ?? 0;
    $monthlyStats['total_hours'] = round(($r['m'] ?? 0) / 60, 1);
} catch (Exception $e) {}
try {
    // Sum total approved leave days (total_days column); count(requests) is unreliable if no leaves this month
    $s = $pdo->prepare("SELECT COALESCE(SUM(total_days),0) FROM leave_requests WHERE user_id=? AND status='approved'");
    $s->execute([$viewUserId]); $monthlyStats['leaves_month'] = (int)$s->fetchColumn();
} catch (Exception $e) {}
try {
    // Count all completed tasks (completed_at may be NULL even when status=completed)
    $s = $pdo->prepare("SELECT COUNT(*) FROM tasks WHERE assigned_to=? AND status='completed'");
    $s->execute([$viewUserId]); $monthlyStats['tasks_completed_month'] = (int)$s->fetchColumn();
} catch (Exception $e) {}
$avgHoursPerDay = $monthlyStats['days_worked'] > 0 ? round($monthlyStats['total_hours'] / $monthlyStats['days_worked'], 1) : 0;

$initials = strtoupper(substr(explode(' ',trim($user['name']??'U'))[0],0,1).(isset(explode(' ',trim($user['name']??'U'))[1])?substr(explode(' ',trim($user['name']??'U'))[1],0,1):''));
$tab = $_GET['tab'] ?? 'details';

$statusBadge = ['active'=>'bg-green-100 text-green-700','inactive'=>'bg-surface-2 text-ink-muted','hold'=>'bg-yellow-100 text-yellow-700','blocked'=>'bg-red-100 text-red-700'];

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex min-h-[calc(100vh-56px)] bg-surface-2">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 dashboard-content-area">
        <div class="p-4 sm:p-6 lg:p-8 max-w-6xl">

            <a href="<?= BASE_PATH ?>/admin/users.php" class="inline-flex items-center text-sm text-ink-muted hover:text-ink mb-4"><i class="fas fa-arrow-left mr-2"></i>Back to Users</a>

            <?php if($message): ?>
            <div class="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-200 text-green-700 text-sm"><i class="fas fa-check-circle mr-2"></i><?= $message ?></div>
            <?php endif; ?>

            <!-- Profile Header -->
            <div class="bg-surface-1 rounded-2xl border border-hairline overflow-hidden mb-6">
                <div class="h-20 gradient-bg"></div>
                <div class="px-6 pb-6 -mt-10">
                    <div class="flex flex-col sm:flex-row sm:items-end gap-4">
                        <div>
                            <?php if(!empty($user['profile_photo'])): ?>
                            <img src="<?= BASE_PATH.htmlspecialchars($user['profile_photo'],ENT_QUOTES,'UTF-8',false) ?>" class="w-20 h-20 rounded-2xl object-cover border-4 border-surface-1 shadow-lg" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
                            <div class="w-20 h-20 rounded-2xl bg-primary-600 border-4 border-surface-1 shadow-lg items-center justify-center text-white text-xl font-bold hidden"><?= $initials ?></div>
                            <?php else: ?>
                            <div class="w-20 h-20 rounded-2xl bg-primary-600 border-4 border-surface-1 shadow-lg flex items-center justify-center text-white text-xl font-bold"><?= $initials ?></div>
                            <?php endif; ?>
                        </div>
                        <div class="flex-1 pb-1">
                            <h1 class="text-xl font-bold text-ink"><?= htmlspecialchars($user['name']??'',ENT_QUOTES,'UTF-8',false) ?></h1>
                            <div class="flex flex-wrap items-center gap-2 mt-1">
                                <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700"><?= getUserTypeLabel($user['user_type']??'') ?></span>
                                <span class="px-2.5 py-0.5 rounded-full text-xs font-medium <?= $statusBadge[$user['status']]??'bg-surface-2 text-ink-muted' ?>"><?= ucfirst($user['status']??'') ?></span>
                                <span class="text-xs text-ink-muted font-mono"><?= htmlspecialchars($user['user_id']??'',ENT_QUOTES,'UTF-8',false) ?></span>
                                <?php if (!empty($user['is_hr_intern'])): ?>
                                <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700"><i class="fas fa-briefcase mr-1"></i>HR Intern</span>
                                <?php endif; ?>
                            </div>
                        </div>
                        <!-- Status Actions -->
                        <div class="flex flex-wrap gap-1">
                            <?php foreach(['active','inactive','hold','blocked'] as $s): if($user['status']!==$s): ?>
                            <form method="POST" class="inline"><input type="hidden" name="action" value="update_status"><input type="hidden" name="status" value="<?= $s ?>">
                                <button type="submit" class="px-2.5 py-1 rounded-lg text-xs font-medium <?= $statusBadge[$s] ?> hover:opacity-80 transition"><?= ucfirst($s) ?></button>
                            </form>
                            <?php endif; endforeach; ?>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 text-sm">
                        <div class="flex items-center gap-2"><i class="fas fa-envelope text-ink-muted w-4"></i><span class="text-ink-muted"><?= htmlspecialchars($user['email']??'N/A',ENT_QUOTES,'UTF-8',false) ?></span></div>
                        <div class="flex items-center gap-2"><i class="fas fa-phone text-ink-muted w-4"></i><span class="text-ink-muted"><?= htmlspecialchars($user['phone']??'N/A',ENT_QUOTES,'UTF-8',false) ?></span></div>
                        <div class="flex items-center gap-2"><i class="fas fa-graduation-cap text-ink-muted w-4"></i><span class="text-ink-muted"><?= htmlspecialchars($user['college']??'N/A',ENT_QUOTES,'UTF-8',false) ?></span></div>
                        <div class="flex items-center gap-2"><i class="fas fa-calendar-alt text-ink-muted w-4"></i><span class="text-ink-muted">Joined <?= $user['joined_date']?date('d M Y',strtotime($user['joined_date'])):'N/A' ?></span></div>
                        <?php if(!empty($user['whatsapp'])): ?><div class="flex items-center gap-2"><i class="fab fa-whatsapp text-ink-muted w-4"></i><span class="text-ink-muted"><?= htmlspecialchars($user['whatsapp'],ENT_QUOTES,'UTF-8',false) ?></span></div><?php endif; ?>
                        <?php if(!empty($user['address'])): ?><div class="flex items-center gap-2 sm:col-span-2"><i class="fas fa-map-marker-alt text-ink-muted w-4"></i><span class="text-ink-muted"><?= htmlspecialchars($user['address'],ENT_QUOTES,'UTF-8',false) ?></span></div><?php endif; ?>
                        <div class="flex items-center gap-2"><i class="fas fa-sign-in-alt text-ink-muted w-4"></i><span class="text-ink-muted">Last login: <?= $user['last_login']?date('d M, h:i A',strtotime($user['last_login'])):'Never' ?></span></div>
                    </div>
                </div>
            </div>

            <div class="flex flex-wrap gap-2 mb-6">
                <?php foreach(['details'=>'Details','tasks'=>'Tasks','leave'=>'Leave','attendance'=>'Attendance','activity'=>'Activity'] as $k=>$v): ?>
                <a href="?id=<?= urlencode($viewUserId) ?>&tab=<?= $k ?>" class="px-4 py-2 rounded-lg text-sm font-medium transition <?= $tab===$k?'bg-primary-600 text-white':'bg-surface-1 text-ink-muted border border-hairline hover:bg-surface-2' ?>"><?= $v ?></a>
                <?php endforeach; ?>
            </div>

            <?php if($tab==='details'): ?>
            <!-- Monthly Stats -->
            <div class="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                <div class="bg-surface-1 rounded-xl border border-hairline p-4"><p class="text-xs text-ink-muted uppercase">Days Worked</p><p class="text-2xl font-bold text-green-600 mt-1"><?= $monthlyStats['days_worked'] ?></p><p class="text-xs text-ink-muted">This month</p></div>
                <div class="bg-surface-1 rounded-xl border border-hairline p-4"><p class="text-xs text-ink-muted uppercase">Total Hours</p><p class="text-2xl font-bold text-blue-600 mt-1"><?= $monthlyStats['total_hours'] ?></p><p class="text-xs text-ink-muted">This month</p></div>
                <div class="bg-surface-1 rounded-xl border border-hairline p-4"><p class="text-xs text-ink-muted uppercase">Avg Hrs/Day</p><p class="text-2xl font-bold text-purple-600 mt-1"><?= $avgHoursPerDay ?></p><p class="text-xs text-ink-muted">This month</p></div>
                <div class="bg-surface-1 rounded-xl border border-hairline p-4"><p class="text-xs text-ink-muted uppercase">Leaves Taken</p><p class="text-2xl font-bold text-red-500 mt-1"><?= $monthlyStats['leaves_month'] ?></p><p class="text-xs text-ink-muted">Total days</p></div>
                <div class="bg-surface-1 rounded-xl border border-hairline p-4"><p class="text-xs text-ink-muted uppercase">Tasks Done</p><p class="text-2xl font-bold text-amber-600 mt-1"><?= $monthlyStats['tasks_completed_month'] ?></p><p class="text-xs text-ink-muted">Total completed</p></div>
            </div>

            <!-- Personal Details Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div class="bg-surface-1 rounded-xl border border-hairline p-5">
                    <h3 class="text-xs font-semibold text-ink-muted uppercase mb-3"><i class="fas fa-id-badge mr-1 text-primary-500"></i>Personal Info</h3>
                    <div class="space-y-2.5 text-sm">
                        <div class="flex justify-between"><span class="text-ink-muted">Date of Birth</span><span class="text-ink font-medium"><?= !empty($user['date_of_birth']) ? date('d M Y', strtotime($user['date_of_birth'])) : 'Not set' ?></span></div>
                        <div class="flex justify-between"><span class="text-ink-muted">Gender</span><span class="text-ink font-medium"><?= !empty($user['gender']) ? ucfirst($user['gender']) : 'Not set' ?></span></div>
                        <div class="flex justify-between"><span class="text-ink-muted">Blood Group</span><span class="text-ink font-medium"><?= !empty($user['blood_group']) ? htmlspecialchars($user['blood_group'], ENT_QUOTES, 'UTF-8', false) : 'Not set' ?></span></div>
                        <div class="flex justify-between"><span class="text-ink-muted">Mobile</span><span class="text-ink font-medium"><?= htmlspecialchars($user['phone'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></span></div>
                        <div class="flex justify-between"><span class="text-ink-muted">WhatsApp</span><span class="text-ink font-medium"><?= htmlspecialchars($user['whatsapp'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></span></div>
                        <div class="flex justify-between"><span class="text-ink-muted">City</span><span class="text-ink font-medium"><?= !empty($user['city']) ? htmlspecialchars($user['city'], ENT_QUOTES, 'UTF-8', false) : 'Not set' ?></span></div>
                        <div class="flex justify-between"><span class="text-ink-muted">State</span><span class="text-ink font-medium"><?= !empty($user['state']) ? htmlspecialchars($user['state'], ENT_QUOTES, 'UTF-8', false) : 'Not set' ?></span></div>
                        <div class="flex justify-between"><span class="text-ink-muted">Pincode</span><span class="text-ink font-medium"><?= !empty($user['pincode']) ? htmlspecialchars($user['pincode'], ENT_QUOTES, 'UTF-8', false) : 'Not set' ?></span></div>
                        <?php if (!empty($user['address'])): ?>
                        <div><span class="text-ink-muted">Address</span><p class="text-ink font-medium mt-0.5"><?= htmlspecialchars($user['address'], ENT_QUOTES, 'UTF-8', false) ?></p></div>
                        <?php endif; ?>
                    </div>
                </div>
                <div class="bg-surface-1 rounded-xl border border-hairline p-5">
                    <h3 class="text-xs font-semibold text-ink-muted uppercase mb-3"><i class="fas fa-university mr-1 text-green-500"></i>Bank Details</h3>
                    <div class="space-y-2.5 text-sm">
                        <div class="flex justify-between"><span class="text-ink-muted">Bank Name</span><span class="text-ink font-medium"><?= !empty($user['bank_name']) ? htmlspecialchars($user['bank_name'], ENT_QUOTES, 'UTF-8', false) : 'Not set' ?></span></div>
                        <div class="flex justify-between"><span class="text-ink-muted">Account No.</span><span class="text-ink font-medium font-mono"><?= !empty($user['bank_account_no']) ? htmlspecialchars($user['bank_account_no'], ENT_QUOTES, 'UTF-8', false) : 'Not set' ?></span></div>
                        <div class="flex justify-between"><span class="text-ink-muted">IFSC Code</span><span class="text-ink font-medium font-mono"><?= !empty($user['bank_ifsc']) ? htmlspecialchars($user['bank_ifsc'], ENT_QUOTES, 'UTF-8', false) : 'Not set' ?></span></div>
                    </div>
                    <h3 class="text-xs font-semibold text-ink-muted uppercase mb-3 mt-6"><i class="fas fa-id-card mr-1 text-blue-500"></i>ID Documents</h3>
                    <div class="space-y-2.5 text-sm">
                        <div class="flex justify-between"><span class="text-ink-muted">Aadhar</span><span class="text-ink font-medium font-mono"><?= !empty($user['aadhar_number']) ? htmlspecialchars($user['aadhar_number'], ENT_QUOTES, 'UTF-8', false) : 'Not set' ?></span></div>
                        <div class="flex justify-between"><span class="text-ink-muted">PAN</span><span class="text-ink font-medium font-mono"><?= !empty($user['pan_number']) ? htmlspecialchars($user['pan_number'], ENT_QUOTES, 'UTF-8', false) : 'Not set' ?></span></div>
                    </div>
                </div>
                <div class="bg-surface-1 rounded-xl border border-hairline p-5">
                    <h3 class="text-xs font-semibold text-ink-muted uppercase mb-3"><i class="fas fa-phone-alt mr-1 text-red-500"></i>Emergency Contact</h3>
                    <div class="space-y-2.5 text-sm">
                        <div class="flex justify-between"><span class="text-ink-muted">Name</span><span class="text-ink font-medium"><?= !empty($user['emergency_contact_name']) ? htmlspecialchars($user['emergency_contact_name'], ENT_QUOTES, 'UTF-8', false) : 'Not set' ?></span></div>
                        <div class="flex justify-between"><span class="text-ink-muted">Phone</span><span class="text-ink font-medium"><?= !empty($user['emergency_contact_phone']) ? htmlspecialchars($user['emergency_contact_phone'], ENT_QUOTES, 'UTF-8', false) : 'Not set' ?></span></div>
                    </div>
                    <h3 class="text-xs font-semibold text-ink-muted uppercase mb-3 mt-6"><i class="fas fa-briefcase mr-1 text-amber-500"></i>Employment</h3>
                    <div class="space-y-2.5 text-sm">
                        <div class="flex justify-between"><span class="text-ink-muted">Role</span><span class="text-ink font-medium"><?= getUserTypeLabel($user['user_type'] ?? '') ?></span></div>
                        <div class="flex justify-between"><span class="text-ink-muted">Department</span><span class="text-ink font-medium"><?= htmlspecialchars($user['department'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></span></div>
                        <div class="flex justify-between"><span class="text-ink-muted">College</span><span class="text-ink font-medium"><?= htmlspecialchars($user['college'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></span></div>
                        <div class="flex justify-between"><span class="text-ink-muted">Course/Year</span><span class="text-ink font-medium"><?= htmlspecialchars($user['course_year'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></span></div>
                        <div class="flex justify-between"><span class="text-ink-muted">HR Intern</span><span class="text-ink font-medium"><?= !empty($user['is_hr_intern']) ? '<span class="text-green-600">Yes</span>' : 'No' ?></span></div>
                        <div class="flex justify-between"><span class="text-ink-muted">Joined</span><span class="text-ink font-medium"><?= $user['joined_date'] ? date('d M Y', strtotime($user['joined_date'])) : 'N/A' ?></span></div>
                        <div class="flex justify-between"><span class="text-ink-muted">Last Login</span><span class="text-ink font-medium"><?= $user['last_login'] ? date('d M Y, h:i A', strtotime($user['last_login'])) : 'Never' ?></span></div>
                    </div>
                </div>
            </div>

            <?php elseif($tab==='tasks'): ?>
            <!-- Tasks Stats -->
            <div class="grid grid-cols-4 gap-3 mb-4">
                <?php foreach(['total'=>['Total','ink','clipboard-list'],'pending'=>['Pending','amber','hourglass-half'],'in_progress'=>['In Progress','blue','spinner'],'completed'=>['Completed','green','check-circle']] as $sk=>$sv): ?>
                <div class="bg-surface-1 rounded-xl border border-hairline p-3 text-center">
                    <p class="text-2xl font-bold text-<?= $sv[1] ?>-600"><?= $taskStats[$sk] ?></p>
                    <p class="text-xs text-ink-muted"><?= $sv[0] ?></p>
                </div>
                <?php endforeach; ?>
            </div>
            <div class="bg-surface-1 rounded-xl border border-hairline overflow-hidden">
                <?php if(empty($tasks)): ?>
                <div class="p-8 text-center text-ink-muted"><i class="fas fa-clipboard-check text-3xl mb-2 block opacity-50"></i>No tasks assigned.</div>
                <?php else: ?>
                <div class="divide-y divide-hairline">
                    <?php foreach($tasks as $t):
                        $tsc=['pending'=>'bg-amber-100 text-amber-700','in_progress'=>'bg-blue-100 text-blue-700','completed'=>'bg-green-100 text-green-700','cancelled'=>'bg-surface-2 text-ink-muted'];
                        $prc=['urgent'=>'text-red-600','high'=>'text-orange-600','medium'=>'text-blue-600','low'=>'text-ink-muted'];
                    ?>
                    <div class="px-4 py-3 hover:bg-surface-2">
                        <div class="flex items-center justify-between gap-2">
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2">
                                    <i class="fas fa-flag <?= $prc[$t['priority']]??'text-ink-muted' ?> text-xs"></i>
                                    <p class="text-sm font-medium text-ink truncate"><?= htmlspecialchars($t['title'],ENT_QUOTES,'UTF-8',false) ?></p>
                                    <span class="px-2 py-0.5 rounded-full text-xs font-medium <?= $tsc[$t['status']]??'' ?>"><?= ucfirst(str_replace('_',' ',$t['status'])) ?></span>
                                </div>
                                <?php if($t['deadline']): ?><p class="text-xs text-ink-muted mt-0.5"><i class="fas fa-calendar-alt mr-1"></i><?= date('d M Y',strtotime($t['deadline'])) ?></p><?php endif; ?>
                            </div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>
            </div>

            <?php elseif($tab==='leave'): ?>
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-base font-semibold text-ink"><i class="fas fa-calendar-minus mr-2 text-primary-500"></i>Leave Allocations & History</h3>
                <button onclick="document.getElementById('grantUserLeaveCard').classList.toggle('hidden')" class="bg-primary-600 hover:bg-primary-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition">
                    <i class="fas fa-plus-circle mr-1"></i>Grant Leave to <?= htmlspecialchars(explode(' ', trim($user['name'] ?? 'User'))[0], ENT_QUOTES, 'UTF-8', false) ?>
                </button>
            </div>

            <!-- Inline Grant Leave Form -->
            <div id="grantUserLeaveCard" class="hidden bg-surface-1 rounded-xl border border-hairline p-5 mb-4 shadow-sm">
                <div class="flex justify-between items-center mb-3">
                    <h4 class="text-sm font-semibold text-ink"><i class="fas fa-user-plus text-primary-600 mr-2"></i>Grant Direct Leave</h4>
                    <button onclick="document.getElementById('grantUserLeaveCard').classList.add('hidden')" class="text-ink-muted text-xs hover:text-ink"><i class="fas fa-times"></i></button>
                </div>
                <form method="POST" action="">
                    <input type="hidden" name="action" value="grant_leave">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div>
                            <label class="block text-xs font-medium text-ink-muted mb-1">Leave Type *</label>
                            <select name="leave_type" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-1.5 text-xs">
                                <option value="casual">Casual Leave</option>
                                <option value="sick">Sick Leave</option>
                                <option value="earned">Earned Leave</option>
                                <option value="unpaid">Unpaid Leave</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-ink-muted mb-1">Start Date *</label>
                            <input type="date" name="start_date" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-1.5 text-xs">
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-ink-muted mb-1">End Date *</label>
                            <input type="date" name="end_date" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-1.5 text-xs">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="block text-xs font-medium text-ink-muted mb-1">Admin Remarks / Reason</label>
                        <input type="text" name="admin_remarks" placeholder="e.g. Granted by HR Admin, Family Emergency, etc." class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-1.5 text-xs">
                    </div>
                    <div class="flex justify-end gap-2">
                        <button type="button" onclick="document.getElementById('grantUserLeaveCard').classList.add('hidden')" class="px-3 py-1.5 border border-hairline bg-surface-2 text-ink-muted rounded-lg text-xs font-medium">Cancel</button>
                        <button type="submit" class="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold transition"><i class="fas fa-check-circle mr-1"></i>Grant Leave</button>
                    </div>
                </form>
            </div>

            <div class="grid grid-cols-3 gap-3 mb-4">
                <?php foreach($balances as $lt=>$lb):
                    $lc=['casual'=>'primary','sick'=>'red','earned'=>'amber'];$c=$lc[$lt]??'primary';
                ?>
                <div class="bg-surface-1 rounded-xl border border-hairline p-4">
                    <p class="text-xs text-ink-muted uppercase font-semibold mb-2"><?= ucfirst($lt) ?> Leave</p>
                    <p class="text-2xl font-bold text-<?= $c ?>-600"><?= $lb['remaining'] ?><span class="text-sm text-ink-muted font-normal">/<?= $lb['total'] ?></span></p>
                    <div class="w-full bg-surface-2 rounded-full h-2 mt-2"><div class="bg-<?= $c ?>-500 h-2 rounded-full" style="width:<?= $lb['total']>0?round(($lb['used']/$lb['total'])*100):0 ?>%"></div></div>
                </div>
                <?php endforeach; ?>
            </div>
            <div class="bg-surface-1 rounded-xl border border-hairline overflow-hidden">
                <?php if(empty($leaves)): ?>
                <div class="p-8 text-center text-ink-muted">No leave requests.</div>
                <?php else: ?>
                <table class="w-full text-sm"><thead class="bg-surface-2"><tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted">Type</th><th class="px-4 py-3 text-left text-xs font-medium text-ink-muted">From</th><th class="px-4 py-3 text-left text-xs font-medium text-ink-muted">To</th><th class="px-4 py-3 text-left text-xs font-medium text-ink-muted">Days</th><th class="px-4 py-3 text-left text-xs font-medium text-ink-muted">Reason / Admin Remarks</th><th class="px-4 py-3 text-left text-xs font-medium text-ink-muted">Status</th>
                </tr></thead><tbody class="divide-y divide-hairline">
                <?php foreach($leaves as $l):
                    $lsc=['pending'=>'bg-yellow-100 text-yellow-700','approved'=>'bg-green-100 text-green-700','rejected'=>'bg-red-100 text-red-700'];
                ?>
                <tr class="hover:bg-surface-2">
                    <td class="px-4 py-3 font-medium"><?= ucfirst($l['leave_type']) ?></td>
                    <td class="px-4 py-3 text-ink-muted"><?= date('d M Y',strtotime($l['start_date'])) ?></td>
                    <td class="px-4 py-3 text-ink-muted"><?= date('d M Y',strtotime($l['end_date'])) ?></td>
                    <td class="px-4 py-3 font-semibold"><?= $l['total_days'] ?></td>
                    <td class="px-4 py-3 text-ink-muted max-w-xs">
                        <p class="truncate text-ink font-medium" title="<?= htmlspecialchars($l['reason']??'',ENT_QUOTES,'UTF-8',false) ?>"><?= htmlspecialchars($l['reason']??'-',ENT_QUOTES,'UTF-8',false) ?></p>
                        <?php if(!empty($l['admin_remarks'])): ?>
                        <p class="text-xs text-primary-600 truncate mt-0.5" title="<?= htmlspecialchars($l['admin_remarks'],ENT_QUOTES,'UTF-8',false) ?>"><i class="fas fa-comment-dots mr-1"></i><?= htmlspecialchars($l['admin_remarks'],ENT_QUOTES,'UTF-8',false) ?></p>
                        <?php endif; ?>
                    </td>
                    <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-xs font-medium <?= $lsc[$l['status']]??'bg-surface-2 text-ink-muted' ?>"><?= ucfirst($l['status']) ?></span></td>
                </tr>
                <?php endforeach; ?>
                </tbody></table>
                <?php endif; ?>
            </div>

            <?php elseif($tab==='attendance'): ?>
            <div class="bg-surface-1 rounded-xl border border-hairline overflow-hidden">
                <?php if(empty($attendance)): ?>
                <div class="p-8 text-center text-ink-muted">No attendance records.</div>
                <?php else: ?>
                <table class="w-full text-sm"><thead class="bg-surface-2"><tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted">Date</th><th class="px-4 py-3 text-left text-xs font-medium text-ink-muted">Start</th><th class="px-4 py-3 text-left text-xs font-medium text-ink-muted">End</th><th class="px-4 py-3 text-left text-xs font-medium text-ink-muted">Duration</th><th class="px-4 py-3 text-left text-xs font-medium text-ink-muted">Status</th>
                </tr></thead><tbody class="divide-y divide-hairline">
                <?php foreach($attendance as $a):
                    $asc=$a['status']==='completed'?'bg-green-100 text-green-700':($a['status']==='working'?'bg-blue-100 text-blue-700':($a['status']==='paused'?'bg-amber-100 text-amber-700':'bg-red-100 text-red-700'));
                ?>
                <tr class="hover:bg-surface-2">
                    <td class="px-4 py-3 font-medium"><?= date('d M Y',strtotime($a['date'])) ?></td>
                    <td class="px-4 py-3 text-ink-muted"><?= $a['start_time']?date('h:i A',strtotime($a['start_time'])):'-' ?></td>
                    <td class="px-4 py-3 text-ink-muted"><?= $a['end_time']?date('h:i A',strtotime($a['end_time'])):'-' ?></td>
                    <td class="px-4 py-3 text-ink-muted"><?= $a['duration_minutes']?floor($a['duration_minutes']/60).'h '.($a['duration_minutes']%60).'m':'-' ?></td>
                    <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-xs font-medium <?= $asc ?>"><?= ucfirst($a['status']) ?></span></td>
                </tr>
                <?php endforeach; ?>
                </tbody></table>
                <?php endif; ?>
            </div>

            <?php elseif($tab==='activity'): ?>
            <div class="bg-surface-1 rounded-xl border border-hairline overflow-hidden">
                <?php if(empty($activity)): ?>
                <div class="p-8 text-center text-ink-muted">No activity logged.</div>
                <?php else: ?>
                <div class="divide-y divide-hairline">
                    <?php foreach($activity as $act): ?>
                    <div class="px-4 py-3 hover:bg-surface-2">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-ink"><?= htmlspecialchars($act['action'],ENT_QUOTES,'UTF-8',false) ?></p>
                                <?php if(!empty($act['details'])): ?><p class="text-xs text-ink-muted mt-0.5"><?= htmlspecialchars(substr($act['details'],0,150),ENT_QUOTES,'UTF-8',false) ?></p><?php endif; ?>
                            </div>
                            <span class="text-xs text-ink-muted flex-shrink-0"><?= date('d M, h:i A',strtotime($act['created_at'])) ?></span>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>
            </div>
            <?php endif; ?>

        </div>
    </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
