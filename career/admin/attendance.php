<?php
$pageTitle = 'Attendance Tracking';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireAdmin();

$pdo = getDBConnection();
$message = '';
$messageType = '';

// Auto-migrate: ensure attendance table & columns exist
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS attendance (
        attendance_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        start_time DATETIME NULL,
        end_time DATETIME NULL,
        duration_minutes INT DEFAULT 0,
        status ENUM('working','paused','completed','absent','half_day','late') DEFAULT 'working',
        ip_address VARCHAR(100) NULL,
        device TEXT NULL,
        notes TEXT NULL,
        device_time DATETIME NULL,
        clock_in_lat DECIMAL(10,8) NULL,
        clock_in_lng DECIMAL(11,8) NULL,
        clock_in_address TEXT NULL,
        clock_out_lat DECIMAL(10,8) NULL,
        clock_out_lng DECIMAL(11,8) NULL,
        clock_out_address TEXT NULL,
        location_accuracy VARCHAR(100) NULL,
        work_summary TEXT NULL,
        pause_time DATETIME NULL,
        total_paused_minutes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
} catch (Exception $e) {}

$attendanceCols = ['notes TEXT NULL','device_time DATETIME NULL','clock_in_lat DECIMAL(10,8) NULL','clock_in_lng DECIMAL(11,8) NULL','clock_in_address TEXT NULL','clock_out_lat DECIMAL(10,8) NULL','clock_out_lng DECIMAL(11,8) NULL','clock_out_address TEXT NULL','location_accuracy VARCHAR(100) NULL','work_summary TEXT NULL','pause_time DATETIME NULL','total_paused_minutes INT DEFAULT 0'];
foreach ($attendanceCols as $col) { try { $pdo->exec("ALTER TABLE attendance ADD COLUMN $col"); } catch (Exception $e) {} }
try { $pdo->exec("ALTER TABLE attendance MODIFY COLUMN status ENUM('working','paused','completed','absent','half_day','late') DEFAULT 'working'"); } catch (Exception $e) {}

// Handle manual attendance entry
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_validate()) {
        $message = 'Invalid form submission (CSRF). Please try again.';
        $messageType = 'error';
    } else {
        $postAction = $_POST['post_action'] ?? '';

        if ($postAction === 'add_manual') {
            $empId = trim($_POST['employee_id'] ?? '');
            $attDate = trim($_POST['att_date'] ?? '');
            $startTime = trim($_POST['start_time'] ?? '');
            $endTime = trim($_POST['end_time'] ?? '');
            $notes = trim($_POST['notes'] ?? '');

            if (empty($empId) || empty($attDate) || empty($startTime)) {
                $message = 'Employee, date, and clock-in time are required.';
                $messageType = 'error';
            } else {
                try {
                    $stmt = $pdo->prepare("SELECT attendance_id FROM attendance WHERE user_id = ? AND date = ?");
                    $stmt->execute([$empId, $attDate]);
                    $existing = $stmt->fetch();

                    $startDT = $attDate . ' ' . $startTime . ':00';
                    $status = 'working';
                    $durationMinutes = 0;
                    $endDT = null;

                    if (!empty($endTime)) {
                        $endDT = $attDate . ' ' . $endTime . ':00';
                        $start = new DateTime($startDT);
                        $end = new DateTime($endDT);
                        $diff = $start->diff($end);
                        $durationMinutes = ($diff->h * 60) + $diff->i + ($diff->days * 24 * 60);
                        $status = 'completed';
                    }

                    if ($existing) {
                        $stmt = $pdo->prepare("UPDATE attendance SET start_time=?, end_time=?, duration_minutes=?, status=?, notes=?, ip_address='Manual Entry', device='Admin Panel' WHERE attendance_id=?");
                        $stmt->execute([$startDT, $endDT, $durationMinutes, $status, $notes, $existing['attendance_id']]);
                        $message = 'Attendance updated successfully!';
                    } else {
                        $stmt = $pdo->prepare("INSERT INTO attendance (user_id, date, start_time, end_time, duration_minutes, status, notes, ip_address, device) VALUES (?,?,?,?,?,?,?,'Manual Entry','Admin Panel')");
                        $stmt->execute([$empId, $attDate, $startDT, $endDT, $durationMinutes, $status, $notes]);
                        $message = 'Attendance added successfully!';
                    }
                    $messageType = 'success';

                    $stmt2 = $pdo->prepare("SELECT name FROM users WHERE user_id = ?");
                    $stmt2->execute([$empId]);
                    $empName = $stmt2->fetchColumn() ?: $empId;
                    logActivity($_SESSION['user_id'], 'manual_attendance', "Manual attendance for $empName on $attDate");

                } catch (Exception $e) {
                    $message = 'Error: ' . $e->getMessage();
                    $messageType = 'error';
                }
            }
        }

        if ($postAction === 'bulk_add') {
            $bulkDate = trim($_POST['bulk_date'] ?? '');
            $bulkEmployees = $_POST['bulk_employees'] ?? [];
            $bulkStart = trim($_POST['bulk_start_time'] ?? '');
            $bulkEnd = trim($_POST['bulk_end_time'] ?? '');

            if (empty($bulkDate) || empty($bulkEmployees) || empty($bulkStart)) {
                $message = 'Date, employees, and start time are required.';
                $messageType = 'error';
            } else {
                $added = 0;
                try {
                    $startDT = $bulkDate . ' ' . $bulkStart . ':00';
                    $endDT = !empty($bulkEnd) ? $bulkDate . ' ' . $bulkEnd . ':00' : null;
                    $status = $endDT ? 'completed' : 'working';
                    $durationMinutes = 0;

                    if ($endDT) {
                        $s = new DateTime($startDT);
                        $e = new DateTime($endDT);
                        $d = $s->diff($e);
                        $durationMinutes = ($d->h * 60) + $d->i + ($d->days * 24 * 60);
                    }

                    $stmtCheck = $pdo->prepare("SELECT attendance_id FROM attendance WHERE user_id = ? AND date = ?");
                    $stmtInsert = $pdo->prepare("INSERT INTO attendance (user_id, date, start_time, end_time, duration_minutes, status, ip_address, device) VALUES (?,?,?,?,?,?,'Bulk Entry','Admin Panel')");
                    $stmtUpdate = $pdo->prepare("UPDATE attendance SET start_time=?, end_time=?, duration_minutes=?, status=? WHERE attendance_id=?");

                    foreach ($bulkEmployees as $eid) {
                        $stmtCheck->execute([$eid, $bulkDate]);
                        $ex = $stmtCheck->fetch();
                        if ($ex) {
                            $stmtUpdate->execute([$startDT, $endDT, $durationMinutes, $status, $ex['attendance_id']]);
                        } else {
                            $stmtInsert->execute([$eid, $bulkDate, $startDT, $endDT, $durationMinutes, $status]);
                        }
                        $added++;
                    }
                    $message = "Attendance added for $added employees!";
                    $messageType = 'success';
                } catch (Exception $e) {
                    $message = 'Error: ' . $e->getMessage();
                    $messageType = 'error';
                }
            }
        }

        if ($postAction === 'delete_entry') {
            $attId = intval($_POST['attendance_id'] ?? 0);
            if ($attId > 0) {
                try {
                    $pdo->prepare("DELETE FROM attendance WHERE attendance_id = ?")->execute([$attId]);
                    $message = 'Attendance entry deleted.';
                    $messageType = 'success';
                } catch (Exception $e) {
                    $message = 'Error: ' . $e->getMessage();
                    $messageType = 'error';
                }
            }
        }
    }
}

$viewDate = $_GET['date'] ?? date('Y-m-d');
$viewMonth = $_GET['month'] ?? date('Y-m');

// Today's stats
try {
    $currentlyWorking = $pdo->query("SELECT COUNT(DISTINCT user_id) FROM attendance WHERE date = CURDATE() AND status IN ('working', 'paused')")->fetchColumn();
} catch (Exception $e) { $currentlyWorking = 0; }
try {
    $notStarted = $pdo->query("SELECT COUNT(DISTINCT user_id) FROM users WHERE status = 'active' AND user_type != 'admin' AND user_id NOT IN (SELECT DISTINCT user_id FROM attendance WHERE date = CURDATE())")->fetchColumn();
} catch (Exception $e) { $notStarted = 0; }
try {
    $finishedToday = $pdo->query("SELECT COUNT(DISTINCT user_id) FROM attendance WHERE date = CURDATE() AND status = 'completed' AND user_id NOT IN (SELECT DISTINCT user_id FROM attendance WHERE date = CURDATE() AND status IN ('working', 'paused'))")->fetchColumn();
} catch (Exception $e) { $finishedToday = 0; }
try {
    $totalMinutes = $pdo->query("SELECT COALESCE(SUM(duration_minutes), 0) FROM attendance WHERE date = CURDATE()")->fetchColumn();
} catch (Exception $e) { $totalMinutes = 0; }
$totalHours = round($totalMinutes / 60, 1);
try {
    $attCount = $pdo->query("SELECT COUNT(DISTINCT user_id) FROM attendance WHERE date = CURDATE()")->fetchColumn();
} catch (Exception $e) { $attCount = 0; }
$avgHours = $attCount > 0 ? round(($totalMinutes / $attCount) / 60, 1) : 0;

// Live working status for selected date
$liveAttendance = [];
try {
    $stmtLive = $pdo->prepare("SELECT a.*, u.name, u.user_type, u.phone FROM attendance a JOIN users u ON a.user_id = u.user_id WHERE a.date = ? ORDER BY FIELD(a.status, 'working','paused','completed','absent'), a.start_time DESC LIMIT 100");
    $stmtLive->execute([$viewDate]);
    $liveAttendance = $stmtLive->fetchAll();
} catch (Exception $e) { $liveAttendance = []; }

// Monthly report
$monthStart = $viewMonth . '-01';
$monthEnd = date('Y-m-t', strtotime($monthStart));
$monthParams = [$monthStart, $monthEnd];
$monthFilter = '';

if (!empty($_GET['filter_type'])) {
    $monthFilter .= ' AND u.user_type = ?';
    $monthParams[] = $_GET['filter_type'];
}

try {
    $stmtMonthly = $pdo->prepare("SELECT u.name, u.user_type, u.user_id,
        COUNT(a.attendance_id) as days_present,
        SUM(a.duration_minutes) as total_minutes,
        AVG(CASE WHEN a.duration_minutes > 0 THEN a.duration_minutes END) as avg_minutes,
        MIN(TIME(a.start_time)) as earliest_start,
        MAX(TIME(a.end_time)) as latest_end
        FROM attendance a JOIN users u ON a.user_id = u.user_id
        WHERE a.date BETWEEN ? AND ? $monthFilter
        GROUP BY a.user_id, u.name, u.user_type ORDER BY total_minutes DESC");
    $stmtMonthly->execute($monthParams);
    $monthlyReport = $stmtMonthly->fetchAll();
} catch (Exception $e) { $monthlyReport = []; }

// Individual detail if user selected
$detailRecords = [];
if (!empty($_GET['filter_user']) && !empty($_GET['month'])) {
    try {
        $stmtDetail = $pdo->prepare("SELECT * FROM attendance WHERE user_id = ? AND date BETWEEN ? AND ? ORDER BY date ASC");
        $stmtDetail->execute([$_GET['filter_user'], $monthStart, $monthEnd]);
        $detailRecords = $stmtDetail->fetchAll();
    } catch (Exception $e) { $detailRecords = []; }
}

// Get all active users
try {
    $activeUsers = $pdo->query("SELECT user_id, name, user_type FROM users WHERE status = 'active' AND user_type != 'admin' ORDER BY name")->fetchAll();
} catch (Exception $e) { $activeUsers = []; }

// Fetch all tasks grouped by user for Tasks modal
$allUserTasks = [];
try {
    $stmtTasks = $pdo->query("SELECT t.task_id, t.assigned_to, t.title, t.description, t.priority, t.status, t.deadline, t.created_at, t.completed_at FROM tasks t ORDER BY t.created_at DESC");
    foreach ($stmtTasks->fetchAll() as $tk) {
        $allUserTasks[$tk['assigned_to']][] = $tk;
    }
} catch (Exception $e) { $allUserTasks = []; }

// Fetch monthly work summaries grouped by user (for Monthly Summary Show button)
$monthlyWorkSummaries = [];
try {
    $stmtWS = $pdo->prepare("SELECT user_id, date, work_summary FROM attendance WHERE date BETWEEN ? AND ? AND work_summary IS NOT NULL AND work_summary != '' ORDER BY date ASC");
    $stmtWS->execute([$monthStart, $monthEnd]);
    foreach ($stmtWS->fetchAll() as $ws) {
        $dateLabel = date('d M (D)', strtotime($ws['date']));
        $monthlyWorkSummaries[$ws['user_id']][] = "[$dateLabel]\n" . $ws['work_summary'];
    }
    // Join into single string per user
    foreach ($monthlyWorkSummaries as $uid => $entries) {
        $monthlyWorkSummaries[$uid] = implode("\n\n", $entries);
    }
} catch (Exception $e) { $monthlyWorkSummaries = []; }

$statusColors = [
    'working'   => 'bg-green-100 text-green-700',
    'paused'    => 'bg-amber-100 text-amber-700',
    'completed' => 'bg-blue-100 text-blue-700',
    'absent'    => 'bg-red-100 text-red-700'
];
$typeBadgeColors = [
    'vendor'         => 'bg-blue-100 text-blue-700',
    'employee'       => 'bg-amber-100 text-amber-700',
    'intern'         => 'bg-green-100 text-green-700',
    'campus_saarthi' => 'bg-purple-100 text-purple-700'
];

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 dashboard-content-area p-3 md:p-6">
        <div class="flex flex-wrap justify-between items-center mb-6 gap-3">
            <div>
                <h1 class="text-xl md:text-2xl font-bold text-ink"><i class="fas fa-clock mr-2 text-primary-600"></i>Attendance Tracking</h1>
                <p class="text-sm text-ink-muted mt-1">Live dashboard, manual entry & reports</p>
            </div>
            <div class="flex gap-2">
                <button onclick="document.getElementById('manual-entry-form').classList.toggle('hidden')" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                    <i class="fas fa-plus mr-1"></i> Add Entry
                </button>
                <button onclick="document.getElementById('bulk-entry-form').classList.toggle('hidden')" class="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                    <i class="fas fa-users mr-1"></i> Bulk Entry
                </button>
            </div>
        </div>

        <!-- Messages -->
        <?php if ($message): ?>
        <div class="mb-4 px-4 py-3 rounded-lg text-sm font-medium <?= $messageType === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-500/20' ?>">
            <i class="fas <?= $messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle' ?> mr-1"></i>
            <?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8', false) ?>
        </div>
        <?php endif; ?>

        <!-- Manual Entry Form (Hidden by default) -->
        <div id="manual-entry-form" class="hidden bg-surface-1 rounded-xl shadow-none border border-hairline p-6 mb-6">
            <h3 class="text-lg font-semibold text-ink mb-4"><i class="fas fa-edit mr-2 text-primary-600"></i>Add / Edit Attendance Entry</h3>
            <form method="POST">
                <?= csrf_field() ?>
                <input type="hidden" name="post_action" value="add_manual">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-ink-muted mb-1">Employee <span class="text-red-400">*</span></label>
                        <select name="employee_id" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                            <option value="">-- Select Employee --</option>
                            <?php foreach ($activeUsers as $u): ?>
                            <option value="<?= $u['user_id'] ?>"><?= htmlspecialchars($u['name'], ENT_QUOTES, 'UTF-8', false) ?> (<?= $u['user_id'] ?>) - <?= ucfirst(str_replace('_',' ',$u['user_type'])) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink-muted mb-1">Date <span class="text-red-400">*</span></label>
                        <input type="date" name="att_date" value="<?= date('Y-m-d') ?>" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink-muted mb-1">Clock In Time <span class="text-red-400">*</span></label>
                        <input type="time" name="start_time" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink-muted mb-1">Clock Out Time <span class="text-ink-muted">(optional)</span></label>
                        <input type="time" name="end_time" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-ink-muted mb-1">Notes</label>
                        <input type="text" name="notes" placeholder="e.g. Worked from office, Late entry..." class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                </div>
                <div class="mt-4 flex gap-2">
                    <button type="submit" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
                        <i class="fas fa-save mr-1"></i> Save Attendance
                    </button>
                    <button type="button" onclick="document.getElementById('manual-entry-form').classList.add('hidden')" class="bg-surface-2 hover:bg-surface-3 text-ink-muted px-4 py-2.5 rounded-lg text-sm font-medium transition">Cancel</button>
                </div>
            </form>
        </div>

        <!-- Bulk Entry Form (Hidden by default) -->
        <div id="bulk-entry-form" class="hidden bg-surface-1 rounded-xl shadow-none border border-hairline p-6 mb-6">
            <h3 class="text-lg font-semibold text-ink mb-4"><i class="fas fa-users mr-2 text-ink-muted"></i>Bulk Attendance Entry</h3>
            <form method="POST">
                <?= csrf_field() ?>
                <input type="hidden" name="post_action" value="bulk_add">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-medium text-ink-muted mb-1">Date <span class="text-red-400">*</span></label>
                        <input type="date" name="bulk_date" value="<?= date('Y-m-d') ?>" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink-muted mb-1">Clock In Time <span class="text-red-400">*</span></label>
                        <input type="time" name="bulk_start_time" value="09:30" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink-muted mb-1">Clock Out Time <span class="text-ink-muted">(optional)</span></label>
                        <input type="time" name="bulk_end_time" value="18:00" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-ink-muted mb-2">Select Employees <span class="text-red-400">*</span></label>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-3 border border-hairline rounded-lg bg-surface-2">
                        <?php foreach ($activeUsers as $u): ?>
                        <label class="flex items-center space-x-2 text-sm text-ink cursor-pointer hover:bg-surface-1 p-1 rounded">
                            <input type="checkbox" name="bulk_employees[]" value="<?= $u['user_id'] ?>" class="rounded border-hairline text-primary-600 focus:ring-primary-500">
                            <span class="truncate"><?= htmlspecialchars($u['name'], ENT_QUOTES, 'UTF-8', false) ?></span>
                        </label>
                        <?php endforeach; ?>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button type="submit" class="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
                        <i class="fas fa-check-double mr-1"></i> Apply Bulk Attendance
                    </button>
                    <button type="button" onclick="document.getElementById('bulk-entry-form').classList.add('hidden')" class="bg-surface-2 hover:bg-surface-3 text-ink-muted px-4 py-2.5 rounded-lg text-sm font-medium transition">Cancel</button>
                </div>
            </form>
        </div>

        <!-- Realtime Stats Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div class="bg-surface-1 p-4 rounded-xl shadow-none border border-hairline flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 text-xl font-bold">
                    <i class="fas fa-user-clock"></i>
                </div>
                <div>
                    <div class="text-2xl font-bold text-ink"><?= $currentlyWorking ?></div>
                    <div class="text-xs font-medium text-ink-muted">Currently Working</div>
                </div>
            </div>
            <div class="bg-surface-1 p-4 rounded-xl shadow-none border border-hairline flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 text-xl font-bold">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div>
                    <div class="text-2xl font-bold text-ink"><?= $finishedToday ?></div>
                    <div class="text-xs font-medium text-ink-muted">Clocked Out Today</div>
                </div>
            </div>
            <div class="bg-surface-1 p-4 rounded-xl shadow-none border border-hairline flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 text-xl font-bold">
                    <i class="fas fa-user-slash"></i>
                </div>
                <div>
                    <div class="text-2xl font-bold text-ink"><?= $notStarted ?></div>
                    <div class="text-xs font-medium text-ink-muted">Not Clocked In</div>
                </div>
            </div>
            <div class="bg-surface-1 p-4 rounded-xl shadow-none border border-hairline flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 text-xl font-bold">
                    <i class="fas fa-business-time"></i>
                </div>
                <div>
                    <div class="text-2xl font-bold text-ink"><?= $totalHours ?> hrs</div>
                    <div class="text-xs font-medium text-ink-muted">Total Hours Logged (Avg: <?= $avgHours ?>h)</div>
                </div>
            </div>
        </div>

        <!-- Section 1: Live Today's Log -->
        <div class="bg-surface-1 rounded-xl shadow-none border border-hairline mb-8">
            <div class="p-5 border-b border-hairline flex flex-wrap justify-between items-center gap-3">
                <div>
                    <h2 class="text-lg font-semibold text-ink flex items-center gap-2">
                        <span class="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
                        Daily Live Status
                    </h2>
                    <p class="text-xs text-ink-muted mt-0.5">Showing entries for <?= date('d M Y', strtotime($viewDate)) ?></p>
                </div>
                <form method="GET" class="flex items-center gap-2">
                    <input type="date" name="date" value="<?= $viewDate ?>" onchange="this.form.submit()" class="border border-hairline bg-surface-2 text-ink text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500">
                    <?php if ($viewDate !== date('Y-m-d')): ?>
                    <a href="attendance.php" class="text-xs text-primary-600 hover:underline">Today</a>
                    <?php endif; ?>
                </form>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-ink">
                    <thead class="text-xs uppercase bg-surface-2 text-ink-muted border-b border-hairline">
                        <tr>
                            <th class="px-4 py-3">Employee</th>
                            <th class="px-4 py-3">Role</th>
                            <th class="px-4 py-3">Status</th>
                            <th class="px-4 py-3">Clock In</th>
                            <th class="px-4 py-3">Clock Out</th>
                            <th class="px-4 py-3">Duration</th>
                            <th class="px-4 py-3">Location / Device</th>
                            <th class="px-4 py-3 text-center">Tasks</th>
                            <th class="px-4 py-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-hairline">
                        <?php if (empty($liveAttendance)): ?>
                        <tr>
                            <td colspan="9" class="px-4 py-8 text-center text-ink-muted">No attendance records found for <?= date('d M Y', strtotime($viewDate)) ?>.</td>
                        </tr>
                        <?php else: ?>
                        <?php foreach ($liveAttendance as $att): ?>
                        <tr class="hover:bg-surface-2/50 transition">
                            <td class="px-4 py-3 font-medium text-ink">
                                <a href="user-profile.php?id=<?= urlencode($att['user_id']) ?>" class="hover:text-primary-600 hover:underline">
                                    <?= htmlspecialchars($att['name'], ENT_QUOTES, 'UTF-8', false) ?>
                                </a>
                                <div class="text-xs text-ink-muted font-normal"><?= $att['user_id'] ?></div>
                            </td>
                            <td class="px-4 py-3">
                                <span class="px-2 py-0.5 rounded-full text-xs font-medium <?= $typeBadgeColors[$att['user_type']] ?? 'bg-surface-2' ?>"><?= ucfirst(str_replace('_',' ',$att['user_type'] ?? '')) ?></span>
                            </td>
                            <td class="px-4 py-3">
                                <span class="px-2.5 py-1 rounded-full text-xs font-semibold <?= $statusColors[$att['status']] ?? 'bg-surface-2' ?>">
                                    <?php if ($att['status'] === 'working'): ?><span class="inline-block w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span><?php endif; ?>
                                    <?= ucfirst($att['status']) ?>
                                </span>
                            </td>
                            <td class="px-4 py-3 font-medium text-ink-muted"><?= $att['start_time'] ? date('h:i:s A', strtotime($att['start_time'])) : '-' ?></td>
                            <td class="px-4 py-3 font-medium text-ink-muted"><?= $att['end_time'] ? date('h:i:s A', strtotime($att['end_time'])) : '-' ?></td>
                            <td class="px-4 py-3 font-bold <?= ($att['duration_minutes'] ?? 0) >= 480 ? 'text-green-600' : 'text-ink-muted' ?>">
                                <?php
                                if ($att['status'] === 'working' && $att['start_time']) {
                                    $mins = max(0, round((time() - strtotime($att['start_time'])) / 60) - (int)($att['total_paused_minutes'] ?? 0));
                                    echo floor($mins / 60) . 'h ' . ($mins % 60) . 'm';
                                    echo ' <span class="text-xs text-green-400 font-normal">(live)</span>';
                                } elseif ($att['status'] === 'paused') {
                                    echo '<span class="text-xs text-amber-500 font-medium"><i class="fas fa-pause mr-1"></i>Paused</span>';
                                } elseif (($att['duration_minutes'] ?? 0) > 0) {
                                    echo floor($att['duration_minutes'] / 60) . 'h ' . ($att['duration_minutes'] % 60) . 'm';
                                } else {
                                    echo '-';
                                }
                                ?>
                            </td>
                            <td class="px-4 py-3 text-xs text-ink-muted">
                                <div><i class="fas fa-desktop mr-1"></i><?= htmlspecialchars($att['device'] ?? 'Unknown', ENT_QUOTES, 'UTF-8', false) ?></div>
                                <div class="truncate max-w-xs" title="<?= htmlspecialchars($att['clock_in_address'] ?? $att['ip_address'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>">
                                    <i class="fas fa-map-marker-alt mr-1 text-red-400"></i><?= htmlspecialchars($att['clock_in_address'] ?: ($att['ip_address'] ?? 'N/A'), ENT_QUOTES, 'UTF-8', false) ?>
                                </div>
                            </td>
                            <td class="px-4 py-3 text-center">
                                <?php
                                $userTasksForBtn = $allUserTasks[$att['user_id']] ?? [];
                                $taskCount = count($userTasksForBtn);
                                $workSummaryForBtn = $att['work_summary'] ?? '';
                                ?>
                                <button
                                    onclick="openTasksModal(<?= htmlspecialchars(json_encode($att['name']), ENT_QUOTES) ?>, <?= htmlspecialchars(json_encode($userTasksForBtn), ENT_QUOTES) ?>, <?= htmlspecialchars(json_encode($workSummaryForBtn), ENT_QUOTES) ?>)"
                                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border border-indigo-200/60 transition-all duration-150"
                                    title="View tasks for <?= htmlspecialchars($att['name'], ENT_QUOTES, 'UTF-8', false) ?>">
                                    <i class="fas fa-clipboard-list text-[10px]"></i>
                                    Show <?= ($taskCount > 0 || $workSummaryForBtn) ? '(' . $taskCount . ')' : '' ?>
                                </button>
                            </td>
                            <td class="px-4 py-3 text-center">
                                <form method="POST" onsubmit="return confirm('Delete this entry?')" class="inline">
                                    <?= csrf_field() ?>
                                    <input type="hidden" name="post_action" value="delete_entry">
                                    <input type="hidden" name="attendance_id" value="<?= $att['attendance_id'] ?>">
                                    <button type="submit" class="text-red-400 hover:text-red-700 text-xs"><i class="fas fa-trash"></i></button>
                                </form>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Section 2: Monthly Summary Report -->
        <div class="bg-surface-1 rounded-xl shadow-none border border-hairline mb-8">
            <div class="p-5 border-b border-hairline flex flex-wrap justify-between items-center gap-3">
                <div>
                    <h2 class="text-lg font-semibold text-ink"><i class="fas fa-calendar-alt mr-2 text-primary-600"></i>Monthly Attendance Summary</h2>
                    <p class="text-xs text-ink-muted mt-0.5">Aggregated attendance & working hours for <?= date('F Y', strtotime($monthStart)) ?></p>
                </div>
                <form method="GET" class="flex flex-wrap items-center gap-2">
                    <input type="month" name="month" value="<?= $viewMonth ?>" onchange="this.form.submit()" class="border border-hairline bg-surface-2 text-ink text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500">
                    <select name="filter_type" onchange="this.form.submit()" class="border border-hairline bg-surface-2 text-ink text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500">
                        <option value="">All Roles</option>
                        <option value="employee" <?= ($_GET['filter_type'] ?? '') === 'employee' ? 'selected' : '' ?>>Employees</option>
                        <option value="vendor" <?= ($_GET['filter_type'] ?? '') === 'vendor' ? 'selected' : '' ?>>Vendors</option>
                        <option value="intern" <?= ($_GET['filter_type'] ?? '') === 'intern' ? 'selected' : '' ?>>Interns</option>
                        <option value="campus_saarthi" <?= ($_GET['filter_type'] ?? '') === 'campus_saarthi' ? 'selected' : '' ?>>Campus Saarthi</option>
                    </select>
                </form>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-ink">
                    <thead class="text-xs uppercase bg-surface-2 text-ink-muted border-b border-hairline">
                        <tr>
                            <th class="px-4 py-3">Employee</th>
                            <th class="px-4 py-3">Role</th>
                            <th class="px-4 py-3 text-center">Days Logged</th>
                            <th class="px-4 py-3 text-center">Total Hours</th>
                            <th class="px-4 py-3 text-center">Avg Daily Hours</th>
                            <th class="px-4 py-3 text-center">Typical Clock In</th>
                            <th class="px-4 py-3 text-center">Typical Clock Out</th>
                            <th class="px-4 py-3 text-center">Tasks</th>
                            <th class="px-4 py-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-hairline">
                        <?php if (empty($monthlyReport)): ?>
                        <tr>
                            <td colspan="9" class="px-4 py-8 text-center text-ink-muted">No monthly attendance records for this criteria.</td>
                        </tr>
                        <?php else: ?>
                        <?php foreach ($monthlyReport as $row): ?>
                        <tr class="hover:bg-surface-2/50 transition">
                            <td class="px-4 py-3 font-medium text-ink">
                                <a href="user-profile.php?id=<?= urlencode($row['user_id']) ?>" class="hover:text-primary-600 hover:underline">
                                    <?= htmlspecialchars($row['name'], ENT_QUOTES, 'UTF-8', false) ?>
                                </a>
                                <div class="text-xs text-ink-muted font-normal"><?= $row['user_id'] ?></div>
                            </td>
                            <td class="px-4 py-3">
                                <span class="px-2 py-0.5 rounded-full text-xs font-medium <?= $typeBadgeColors[$row['user_type']] ?? 'bg-surface-2' ?>"><?= ucfirst(str_replace('_',' ',$row['user_type'])) ?></span>
                            </td>
                            <td class="px-4 py-3 text-center font-bold text-ink"><?= $row['days_present'] ?> days</td>
                            <td class="px-4 py-3 text-center font-bold text-primary-600"><?= round(($row['total_minutes'] ?? 0) / 60, 1) ?> hrs</td>
                            <td class="px-4 py-3 text-center font-medium text-ink-muted"><?= round(($row['avg_minutes'] ?? 0) / 60, 1) ?> hrs</td>
                            <td class="px-4 py-3 text-center text-xs text-ink-muted"><?= $row['earliest_start'] ? date('h:i A', strtotime($row['earliest_start'])) : '-' ?></td>
                            <td class="px-4 py-3 text-center text-xs text-ink-muted"><?= $row['latest_end'] ? date('h:i A', strtotime($row['latest_end'])) : '-' ?></td>
                            <td class="px-4 py-3 text-center">
                                <?php
                                $userTasksMonthly = $allUserTasks[$row['user_id']] ?? [];
                                $taskCountMonthly = count($userTasksMonthly);
                                $monthWorkSummary = $monthlyWorkSummaries[$row['user_id']] ?? '';
                                ?>
                                <button
                                    onclick="openTasksModal(<?= htmlspecialchars(json_encode($row['name']), ENT_QUOTES) ?>, <?= htmlspecialchars(json_encode($userTasksMonthly), ENT_QUOTES) ?>, <?= htmlspecialchars(json_encode($monthWorkSummary), ENT_QUOTES) ?>)"
                                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border border-indigo-200/60 transition-all duration-150"
                                    title="View work & tasks">
                                    <i class="fas fa-clipboard-list text-[10px]"></i>
                                    Show <?= ($taskCountMonthly > 0 || $monthWorkSummary) ? "($taskCountMonthly)" : '' ?>
                                </button>
                            </td>
                            <td class="px-4 py-3 text-center">
                                <a href="attendance.php?month=<?= $viewMonth ?>&filter_user=<?= urlencode($row['user_id']) ?>#detail-section" class="text-xs text-primary-600 hover:underline font-medium flex items-center justify-center gap-1">
                                    <i class="fas fa-eye"></i> View Details
                                </a>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Individual Day-wise Detail (if user selected) -->
        <?php if (!empty($detailRecords)): ?>
        <?php
            $detailUserIdx = array_search($_GET['filter_user'], array_column($activeUsers, 'user_id'));
            $detailUser = ($detailUserIdx !== false) ? $activeUsers[$detailUserIdx] : null;
            $detailTotalMins = array_sum(array_column($detailRecords, 'duration_minutes'));
            $detailPresent = count(array_filter($detailRecords, function ($r) {
                return ($r['status'] ?? '') === 'completed';
            }));
        ?>
        <div id="detail-section" class="bg-surface-1 rounded-xl shadow-none border border-hairline">
            <div class="p-5 border-b border-hairline">
                <h3 class="text-lg font-semibold text-ink">
                    <i class="fas fa-user-check mr-2 text-primary-600"></i>
                    Detailed Attendance Log: <?= htmlspecialchars($detailUser['name'] ?? $_GET['filter_user'], ENT_QUOTES, 'UTF-8', false) ?>
                </h3>
                <p class="text-xs text-ink-muted mt-1">
                    Month: <?= date('F Y', strtotime($monthStart)) ?> |
                    Total Days Logged: <strong><?= count($detailRecords) ?></strong> |
                    Total Hours: <strong><?= round($detailTotalMins / 60, 1) ?> hrs</strong>
                </p>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-ink">
                    <thead class="text-xs uppercase bg-surface-2 text-ink-muted border-b border-hairline">
                        <tr>
                            <th class="px-4 py-3">Date</th>
                            <th class="px-4 py-3">Clock In</th>
                            <th class="px-4 py-3">Clock Out</th>
                            <th class="px-4 py-3">Duration</th>
                            <th class="px-4 py-3">Status</th>
                            <th class="px-4 py-3">Notes / Location</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-hairline">
                        <?php foreach ($detailRecords as $dr): ?>
                        <tr class="hover:bg-surface-2/50 transition">
                            <td class="px-4 py-3 font-medium text-ink"><?= date('d M Y (D)', strtotime($dr['date'])) ?></td>
                            <td class="px-4 py-3 text-ink-muted"><?= $dr['start_time'] ? date('h:i:s A', strtotime($dr['start_time'])) : '-' ?></td>
                            <td class="px-4 py-3 text-ink-muted"><?= $dr['end_time'] ? date('h:i:s A', strtotime($dr['end_time'])) : '-' ?></td>
                            <td class="px-4 py-3 font-bold <?= ($dr['duration_minutes'] ?? 0) >= 480 ? 'text-green-600' : 'text-ink-muted' ?>">
                                <?= ($dr['duration_minutes'] ?? 0) > 0 ? floor($dr['duration_minutes'] / 60) . 'h ' . ($dr['duration_minutes'] % 60) . 'm' : '-' ?>
                            </td>
                            <td class="px-4 py-3">
                                <span class="px-2 py-0.5 rounded-full text-xs font-semibold <?= $statusColors[$dr['status']] ?? 'bg-surface-2' ?>">
                                    <?= ucfirst($dr['status']) ?>
                                </span>
                            </td>
                            <td class="px-4 py-3 text-xs text-ink-muted">
                                <?= htmlspecialchars($dr['notes'] ?: ($dr['clock_in_address'] ?: ($dr['ip_address'] ?? '-')), ENT_QUOTES, 'UTF-8', false) ?>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
        <?php endif; ?>

    </div>
</div>

<!-- ===== Tasks Modal ===== -->
<div id="att-tasks-modal" class="hidden fixed inset-0 z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="att-tasks-modal-title">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="closeTasksModal()"></div>

    <!-- Panel -->
    <div class="relative bg-surface-1 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" style="animation: modalSlideIn .22s cubic-bezier(.4,0,.2,1)">

        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-hairline bg-gradient-to-r from-indigo-600/10 to-purple-600/5 flex-shrink-0">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                    <i class="fas fa-tasks text-indigo-500 text-base"></i>
                </div>
                <div>
                    <h3 id="att-tasks-modal-title" class="text-base font-bold text-ink leading-tight">Tasks</h3>
                    <p id="att-tasks-modal-sub" class="text-xs text-ink-muted mt-0.5"></p>
                </div>
            </div>
            <button onclick="closeTasksModal()" class="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-2 transition-all" title="Close">
                <i class="fas fa-times text-sm"></i>
            </button>
        </div>

        <!-- Body -->
        <div id="att-tasks-modal-body" class="flex-1 overflow-y-auto px-6 py-5 space-y-3">
            <!-- Populated by JS -->
        </div>

        <!-- Footer -->
        <div class="px-6 py-3 border-t border-hairline flex-shrink-0 flex justify-end">
            <button onclick="closeTasksModal()" class="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-sm font-medium text-ink transition-all">
                <i class="fas fa-times-circle text-ink-muted"></i> Close
            </button>
        </div>
    </div>
</div>

<style>
@keyframes modalSlideIn {
    from { opacity: 0; transform: translateY(24px) scale(.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
}
</style>

<script>
const PRIORITY_STYLES = {
    urgent: { bg: 'bg-red-500/10',    text: 'text-red-500',    border: 'border-red-400/30',    icon: 'fa-fire',     label: 'Urgent' },
    high:   { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-400/30', icon: 'fa-arrow-up', label: 'High' },
    medium: { bg: 'bg-blue-500/10',   text: 'text-blue-500',   border: 'border-blue-400/30',   icon: 'fa-minus',    label: 'Medium' },
    low:    { bg: 'bg-surface-2',     text: 'text-ink-muted',  border: 'border-hairline',       icon: 'fa-arrow-down',label: 'Low' },
};
const STATUS_STYLES = {
    pending:     { bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'Pending' },
    in_progress: { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'In Progress' },
    completed:   { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Completed' },
    cancelled:   { bg: 'bg-surface-2',  text: 'text-ink-muted',  label: 'Cancelled' },
};

function formatDate(str) {
    if (!str) return null;
    const d = new Date(str);
    if (isNaN(d)) return str;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function openTasksModal(name, tasks, workSummary) {
    const modal   = document.getElementById('att-tasks-modal');
    const title   = document.getElementById('att-tasks-modal-title');
    const sub     = document.getElementById('att-tasks-modal-sub');
    const body    = document.getElementById('att-tasks-modal-body');

    title.textContent = name + "'s Work & Tasks";

    const total   = tasks.length;
    const done    = tasks.filter(t => t.status === 'completed').length;
    const inProg  = tasks.filter(t => t.status === 'in_progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    sub.textContent = (workSummary ? 'Work summary submitted · ' : '') +
        (total === 0 ? 'No assigned tasks' : `${total} task${total !== 1 ? 's' : ''} · ${done} done · ${inProg} in progress · ${pending} pending`);

    let html = '';

    // ── Section 1: Work Summary (what user submitted at clock-out) ──
    if (workSummary && workSummary.trim()) {
        html += `
        <div class="rounded-xl border border-emerald-200/60 bg-emerald-50/60 overflow-hidden mb-1">
            <div class="flex items-center gap-2 px-4 py-2.5 border-b border-emerald-100 bg-emerald-100/50">
                <i class="fas fa-clipboard-check text-emerald-600 text-sm"></i>
                <span class="text-xs font-bold text-emerald-700 uppercase tracking-wide">Work Done Today (Self-Reported)</span>
            </div>
            <div class="px-4 py-3">
                <p class="text-sm text-emerald-900 whitespace-pre-wrap leading-relaxed">${escapeHtml(workSummary.trim())}</p>
            </div>
        </div>`;
    } else {
        html += `
        <div class="rounded-xl border border-hairline bg-surface-2/50 overflow-hidden mb-1">
            <div class="flex items-center gap-2 px-4 py-2.5">
                <i class="fas fa-clipboard text-ink-muted text-sm opacity-50"></i>
                <span class="text-xs text-ink-muted italic">No work summary submitted for this day (user hasn't clocked out yet or summary was not provided)</span>
            </div>
        </div>`;
    }

    // ── Section 2: Assigned Tasks ──
    html += `<div class="flex items-center gap-2 mt-3 mb-2 px-1">
        <i class="fas fa-tasks text-indigo-500 text-xs"></i>
        <span class="text-xs font-bold text-ink-muted uppercase tracking-wide">Assigned Tasks (${total})</span>
    </div>`;

    if (total === 0) {
        html += `
        <div class="flex flex-col items-center justify-center py-8 text-center rounded-xl border border-hairline">
            <i class="fas fa-clipboard-list text-2xl text-ink-muted opacity-30 mb-2"></i>
            <p class="text-sm text-ink-muted">No tasks assigned to this user.</p>
        </div>`;
    } else {
        html += tasks.map(task => {
            const p  = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;
            const s  = STATUS_STYLES[task.status]     || STATUS_STYLES.pending;
            const now = new Date();
            const dl  = task.deadline ? new Date(task.deadline) : null;
            const overdue = dl && task.status !== 'completed' && dl < now;

            const deadlineHtml = task.deadline
                ? `<span class="flex items-center gap-1 ${overdue ? 'text-red-500' : 'text-ink-muted'}">
                       <i class="fas fa-calendar-alt text-[10px]"></i>
                       Due: ${formatDate(task.deadline)}${overdue ? ' <span class="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-red-500/10 text-red-500 font-semibold">Overdue</span>' : ''}
                   </span>` : '';

            const completedHtml = task.completed_at
                ? `<span class="flex items-center gap-1 text-green-600">
                       <i class="fas fa-check-circle text-[10px]"></i>
                       Completed: ${formatDate(task.completed_at)}
                   </span>` : '';

            return `
            <div class="rounded-xl border ${p.border} bg-surface-1 overflow-hidden hover:shadow-sm transition-shadow">
                <div class="flex items-start gap-3 px-4 py-3">
                    <div class="w-8 h-8 rounded-lg ${p.bg} flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i class="fas ${p.icon} text-xs ${p.text}"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex flex-wrap items-center gap-2 mb-1">
                            <span class="font-semibold text-sm text-ink truncate">${escapeHtml(task.title)}</span>
                            <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold ${s.bg} ${s.text}">${s.label}</span>
                            <span class="px-2 py-0.5 rounded-full text-[11px] font-medium ${p.bg} ${p.text} border ${p.border}">${p.label}</span>
                            ${overdue ? '<span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-500"><i class="fas fa-exclamation-circle mr-0.5 text-[9px]"></i>Overdue</span>' : ''}
                        </div>
                        ${task.description ? `<p class="text-xs text-ink-muted leading-relaxed mb-2 line-clamp-2">${escapeHtml(task.description)}</p>` : ''}
                        <div class="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
                            ${deadlineHtml}
                            ${completedHtml}
                            <span class="flex items-center gap-1 text-ink-muted">
                                <i class="fas fa-clock text-[10px]"></i>
                                Assigned: ${formatDate(task.created_at)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    body.innerHTML = html;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeTasksModal() {
    document.getElementById('att-tasks-modal').classList.add('hidden');
    document.body.style.overflow = '';
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

// Close on Escape key
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeTasksModal(); });
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
