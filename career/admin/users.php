<?php
$pageTitle = 'User Management';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireAdmin();

$pdo = getDBConnection();
$message = '';
$messageType = '';

// Handle POST actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    try {
        switch ($action) {
            case 'add_user':
                $userId = generateUserId($_POST['user_type']);
                $passwordHash = password_hash($_POST['password'], PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("INSERT INTO users (user_id, name, email, phone, password_hash, user_type, college, course_year, status, joined_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', CURDATE())");
                $stmt->execute([
                    $userId,
                    sanitize($_POST['name']),
                    sanitize($_POST['email']),
                    sanitize($_POST['phone']),
                    $passwordHash,
                    $_POST['user_type'],
                    sanitize($_POST['college']),
                    sanitize($_POST['course_year'])
                ]);
                $message = "User created successfully! User ID: $userId";
                $messageType = 'success';
                logActivity($_SESSION['user_id'], 'Created user', $userId . ' - ' . sanitize($_POST['name']));
                break;

            case 'update_status':
                $stmt = $pdo->prepare("UPDATE users SET status = ? WHERE user_id = ?");
                $stmt->execute([$_POST['status'], $_POST['user_id']]);
                $message = 'User status updated successfully!';
                $messageType = 'success';
                logActivity($_SESSION['user_id'], 'Updated user status', $_POST['user_id'] . ' -> ' . $_POST['status']);
                break;

            case 'bulk_update_status':
                if (!empty($_POST['selected_users'])) {
                    $ids = $_POST['selected_users'];
                    $placeholders = implode(',', array_fill(0, count($ids), '?'));
                    $params = array_merge([$_POST['bulk_status']], $ids);
                    $stmt = $pdo->prepare("UPDATE users SET status = ? WHERE user_id IN ($placeholders)");
                    $stmt->execute($params);
                    $message = count($ids) . ' user(s) status updated!';
                    $messageType = 'success';
                }
                break;

            case 'delete_user':
                $deleteId = $_POST['user_id'] ?? '';
                if ($deleteId && $deleteId !== $_SESSION['user_id']) {
                    $stmt = $pdo->prepare("SELECT name FROM users WHERE user_id = ?");
                    $stmt->execute([$deleteId]);
                    $delUser = $stmt->fetch();
                    // Delete related records first
                    $pdo->prepare("DELETE FROM attendance WHERE user_id = ?")->execute([$deleteId]);
                    $pdo->prepare("DELETE FROM leave_requests WHERE user_id = ?")->execute([$deleteId]);
                    $pdo->prepare("DELETE FROM tasks WHERE assigned_to = ?")->execute([$deleteId]);
                    $pdo->prepare("DELETE FROM payments WHERE user_id = ?")->execute([$deleteId]);
                    $pdo->prepare("DELETE FROM activity_logs WHERE user_id = ?")->execute([$deleteId]);
                    try { $pdo->prepare("DELETE FROM trainer_profiles WHERE user_id = ?")->execute([$deleteId]); } catch (Exception $ignore) {}
                    try { $pdo->prepare("DELETE FROM user_documents WHERE user_id = ?")->execute([$deleteId]); } catch (Exception $ignore) {}
                    try { $pdo->prepare("DELETE FROM appraisals WHERE user_id = ?")->execute([$deleteId]); } catch (Exception $ignore) {}
                    $pdo->prepare("DELETE FROM users WHERE user_id = ?")->execute([$deleteId]);
                    $message = 'User "' . htmlspecialchars($delUser['name'] ?? $deleteId, ENT_QUOTES, 'UTF-8', false) . '" and all related data deleted permanently!';
                    $messageType = 'success';
                    logActivity($_SESSION['user_id'], 'delete_user', "Deleted user $deleteId");
                }
                break;

            case 'bulk_delete':
                if (!empty($_POST['selected_users'])) {
                    $ids = $_POST['selected_users'];
                    $deleted = 0;
                    foreach ($ids as $uid) {
                        if ($uid === $_SESSION['user_id']) continue;
                        $pdo->prepare("DELETE FROM attendance WHERE user_id = ?")->execute([$uid]);
                        $pdo->prepare("DELETE FROM leave_requests WHERE user_id = ?")->execute([$uid]);
                        $pdo->prepare("DELETE FROM tasks WHERE assigned_to = ?")->execute([$uid]);
                        $pdo->prepare("DELETE FROM payments WHERE user_id = ?")->execute([$uid]);
                        $pdo->prepare("DELETE FROM activity_logs WHERE user_id = ?")->execute([$uid]);
                        $pdo->prepare("DELETE FROM users WHERE user_id = ?")->execute([$uid]);
                        $deleted++;
                    }
                    $message = "$deleted user(s) deleted permanently!";
                    $messageType = 'success';
                    logActivity($_SESSION['user_id'], 'bulk_delete_users', "Deleted $deleted users");
                }
                break;

            case 'toggle_hr_intern':
                try { $pdo->exec("ALTER TABLE users ADD COLUMN is_hr_intern BOOLEAN DEFAULT FALSE"); } catch (Throwable $e) {}
                $targetUser = $_POST['user_id'] ?? '';
                $stmt = $pdo->prepare("SELECT is_hr_intern, name FROM users WHERE user_id = ?");
                $stmt->execute([$targetUser]);
                $hrUser = $stmt->fetch();
                if ($hrUser) {
                    $newVal = $hrUser['is_hr_intern'] ? 0 : 1;
                    $pdo->prepare("UPDATE users SET is_hr_intern = ? WHERE user_id = ?")->execute([$newVal, $targetUser]);
                    $action_label = $newVal ? 'Granted' : 'Revoked';
                    $message = "HR Intern access {$action_label} for " . htmlspecialchars($hrUser['name'] ?? '', ENT_QUOTES, 'UTF-8', false);
                    $messageType = 'success';
                    logActivity($_SESSION['user_id'], 'toggle_hr_intern', "$action_label HR access for $targetUser");
                }
                break;
        }
    } catch (Throwable $e) {
        $message = 'Error: ' . $e->getMessage();
        $messageType = 'error';
    }
}

// Ensure essential user table columns exist
$userCols = [
    "is_hr_intern BOOLEAN DEFAULT FALSE",
    "status ENUM('active', 'inactive', 'hold', 'blocked') DEFAULT 'active'",
    "joined_date DATE NULL",
    "last_login DATETIME NULL",
    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
    "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
];
foreach ($userCols as $col) {
    try { $pdo->exec("ALTER TABLE users ADD COLUMN $col"); } catch (Throwable $e) {}
}

// Build filter query
$where = "WHERE user_type != 'admin'";
$params = [];

if (!empty($_GET['type'])) {
    $where .= ' AND user_type = ?';
    $params[] = $_GET['type'];
}
if (!empty($_GET['status'])) {
    $where .= ' AND status = ?';
    $params[] = $_GET['status'];
}
if (!empty($_GET['search'])) {
    $where .= ' AND (name LIKE ? OR email LIKE ? OR user_id LIKE ?)';
    $search = '%' . $_GET['search'] . '%';
    $params[] = $search;
    $params[] = $search;
    $params[] = $search;
}

// Handle CSV Export
if (($_GET['export'] ?? '') === 'csv') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="users_export_' . date('Y-m-d') . '.csv"');
    $output = fopen('php://output', 'w');
    fputcsv($output, ['User ID', 'Name', 'Email', 'Phone', 'Type', 'Status', 'College', 'Course/Year', 'Joined Date', 'Last Login']);
    try {
        $stmtExp = $pdo->prepare("SELECT user_id, name, email, phone, user_type, status, college, course_year, joined_date, last_login FROM users $where ORDER BY created_at DESC");
        $stmtExp->execute($params);
        while ($row = $stmtExp->fetch(PDO::FETCH_ASSOC)) {
            fputcsv($output, $row);
        }
    } catch (Exception $e) {
        $stmtExp = $pdo->prepare("SELECT user_id, name, email, phone, user_type, status, college, course_year, joined_date, last_login FROM users $where ORDER BY user_id DESC");
        $stmtExp->execute($params);
        while ($row = $stmtExp->fetch(PDO::FETCH_ASSOC)) {
            fputcsv($output, $row);
        }
    }
    fclose($output);
    exit;
}

// Pagination
$page = max(1, intval($_GET['page'] ?? 1));
$perPage = 20;
$offset = ($page - 1) * $perPage;

$totalUsers_filtered = 0;
$totalPages = 1;
$users = [];

try {
    // Total count for pagination
    $stmtCount = $pdo->prepare("SELECT COUNT(*) FROM users $where");
    $stmtCount->execute($params);
    $totalUsers_filtered = (int)$stmtCount->fetchColumn();
    $totalPages = max(1, ceil($totalUsers_filtered / $perPage));

    $stmtUsers = $pdo->prepare("SELECT * FROM users $where ORDER BY created_at DESC LIMIT $perPage OFFSET $offset");
    $stmtUsers->execute($params);
    $users = $stmtUsers->fetchAll();
} catch (Exception $e) {
    try {
        $stmtCount = $pdo->prepare("SELECT COUNT(*) FROM users $where");
        $stmtCount->execute($params);
        $totalUsers_filtered = (int)$stmtCount->fetchColumn();
        $totalPages = max(1, ceil($totalUsers_filtered / $perPage));

        $stmtUsers = $pdo->prepare("SELECT * FROM users $where ORDER BY user_id DESC LIMIT $perPage OFFSET $offset");
        $stmtUsers->execute($params);
        $users = $stmtUsers->fetchAll();
    } catch (Exception $ex) {
        $message = 'Failed to load users: ' . $ex->getMessage();
        $messageType = 'error';
    }
}

// User counts by type
$typeCounts = [];
try {
    $stmtCounts = $pdo->query("SELECT user_type, COUNT(*) as cnt FROM users WHERE user_type != 'admin' GROUP BY user_type");
    while ($row = $stmtCounts->fetch()) {
        $typeCounts[$row['user_type']] = $row['cnt'];
    }
} catch (Exception $e) {}

$typeBadgeColors = [
    'vendor' => 'bg-blue-100 text-blue-700',
    'employee' => 'bg-amber-100 text-amber-700',
    'intern' => 'bg-green-100 text-green-700',
    'campus_saarthi' => 'bg-purple-100 text-purple-700',
    'admin' => 'bg-red-100 text-red-700'
];

$statusBadgeColors = [
    'active' => 'bg-green-100 text-green-700',
    'inactive' => 'bg-surface-2 text-ink-muted',
    'hold' => 'bg-yellow-100 text-yellow-700',
    'blocked' => 'bg-red-100 text-red-700'
];

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 dashboard-content-area p-4 md:p-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div>
                <h1 class="text-2xl font-bold text-ink">User Management</h1>
                <p class="text-sm text-ink-muted mt-1">Manage all portal users and their accounts.</p>
            </div>
            <button onclick="document.getElementById('addUserForm').classList.toggle('hidden')" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                <i class="fas fa-user-plus mr-1"></i> Add New User
            </button>
        </div>

        <?php if ($message): ?>
        <div class="mb-6 p-4 rounded-lg <?= $messageType === 'success' ? 'bg-green-500/10 text-green-700 border border-green-200' : 'bg-red-500/10 text-red-700 border border-red-500/20' ?>">
            <i class="fas <?= $messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle' ?> mr-2"></i>
            <?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8', false) ?>
        </div>
        <?php endif; ?>

        <!-- User Type Summary Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <?php foreach (['vendor' => 'Vendors', 'employee' => 'Employees', 'intern' => 'Interns', 'campus_saarthi' => 'Saarthi', 'freelancer' => 'Freelancers', 'pillar_post' => 'Saarthi', 'part_time' => 'Part-Time'] as $type => $label): ?>
            <div class="bg-surface-1 rounded-lg shadow-none border border-hairline p-4 text-center">
                <p class="text-2xl font-bold text-ink"><?= $typeCounts[$type] ?? 0 ?></p>
                <p class="text-xs font-medium mt-1"><span class="px-2 py-0.5 rounded-full <?= $typeBadgeColors[$type] ?>"><?= $label ?></span></p>
            </div>
            <?php endforeach; ?>
        </div>

        <!-- Add User Form -->
        <div id="addUserForm" class="hidden bg-surface-1 rounded-xl shadow-none border border-hairline p-6 mb-6">
            <h3 class="text-lg font-semibold text-ink mb-4">Add New User</h3>
            <form method="POST" class="space-y-4">
                <input type="hidden" name="action" value="add_user">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-ink-muted mb-1">Full Name *</label>
                        <input type="text" name="name" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink-muted mb-1">Email *</label>
                        <input type="email" name="email" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink-muted mb-1">Phone</label>
                        <input type="text" name="phone" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink-muted mb-1">User Type *</label>
                        <select name="user_type" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                            <option value="">Select Type</option>
                            <option value="employee">Internal Member</option>
                            <option value="pillar_post">Saarthi</option>
                            <option value="vendor">Vendor</option>
                            <option value="intern">Intern</option>
                            <option value="freelancer">Freelancer</option>
                            <option value="part_time">Part-Time / Remote</option>
                            <option value="teaching_expert">Teaching Expert</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink-muted mb-1">Password *</label>
                        <input type="password" name="password" required minlength="6" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink-muted mb-1">College</label>
                        <input type="text" name="college" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink-muted mb-1">Course/Year</label>
                        <input type="text" name="course_year" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                </div>
                <div class="flex justify-end space-x-3">
                    <button type="button" onclick="document.getElementById('addUserForm').classList.add('hidden')" class="px-4 py-2 border border-hairline bg-surface-2 text-ink rounded-lg text-sm font-medium text-ink-muted hover:bg-surface-2">Cancel</button>
                    <button type="submit" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition">Create User</button>
                </div>
            </form>
        </div>

        <!-- Filter Bar -->
        <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4 mb-6">
            <form method="GET" class="flex flex-wrap items-end gap-4">
                <div>
                    <label class="block text-xs font-medium text-ink-muted mb-1">User Type</label>
                    <select name="type" class="border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                        <option value="">All Types</option>
                        <option value="employee" <?= ($_GET['type'] ?? '') === 'employee' ? 'selected' : '' ?>>Internal Member</option>
                        <option value="pillar_post" <?= ($_GET['type'] ?? '') === 'pillar_post' ? 'selected' : '' ?>>Saarthi</option>
                        <option value="vendor" <?= ($_GET['type'] ?? '') === 'vendor' ? 'selected' : '' ?>>Vendor</option>
                        <option value="intern" <?= ($_GET['type'] ?? '') === 'intern' ? 'selected' : '' ?>>Intern</option>
                        <option value="freelancer" <?= ($_GET['type'] ?? '') === 'freelancer' ? 'selected' : '' ?>>Freelancer</option>
                        <option value="part_time" <?= ($_GET['type'] ?? '') === 'part_time' ? 'selected' : '' ?>>Part-Time</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-ink-muted mb-1">Status</label>
                    <select name="status" class="border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                        <option value="">All Statuses</option>
                        <option value="active" <?= ($_GET['status'] ?? '') === 'active' ? 'selected' : '' ?>>Active</option>
                        <option value="inactive" <?= ($_GET['status'] ?? '') === 'inactive' ? 'selected' : '' ?>>Inactive</option>
                        <option value="hold" <?= ($_GET['status'] ?? '') === 'hold' ? 'selected' : '' ?>>On Hold</option>
                        <option value="blocked" <?= ($_GET['status'] ?? '') === 'blocked' ? 'selected' : '' ?>>Blocked</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-ink-muted mb-1">Search</label>
                    <input type="text" name="search" value="<?= htmlspecialchars($_GET['search'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" placeholder="Name, email, or ID..." class="border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                </div>
                <button type="submit" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">Search</button>
                <a href="<?= BASE_PATH ?>/admin/users.php" class="text-ink-muted hover:text-ink-muted text-sm">Clear</a>
            </form>
        </div>

        <!-- Hidden form for single actions to prevent nested forms -->
        <form id="singleActionForm" method="POST" class="hidden">
            <input type="hidden" name="action" id="sa_action">
            <input type="hidden" name="user_id" id="sa_user_id">
            <input type="hidden" name="status" id="sa_status">
        </form>

        <!-- Bulk Actions -->
        <form method="POST" id="bulkForm">
            <input type="hidden" name="action" value="bulk_update_status">
            <div class="flex items-center gap-3 mb-4">
                <select name="bulk_status" class="border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                    <option value="active">Set Active</option>
                    <option value="inactive">Set Inactive</option>
                    <option value="hold">Set On Hold</option>
                    <option value="blocked">Set Blocked</option>
                </select>
                <button type="submit" onclick="return confirm('Update status for selected users?')" class="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition">Bulk Update</button>
                <button type="submit" formaction="" onclick="this.form.querySelector('[name=action]').value='bulk_delete'; return confirm('PERMANENTLY DELETE selected users and all their data? This cannot be undone!')" class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition"><i class="fas fa-trash mr-1"></i>Bulk Delete</button>
                <a href="?export=csv" class="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition"><i class="fas fa-download mr-1"></i>Export Data</a>
            </div>

            <!-- Users Table -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-xs">
                        <thead class="bg-surface-2">
                            <tr>
                                <th class="px-2 py-2.5 text-left"><input type="checkbox" onclick="toggleAll(this)" class="rounded"></th>
                                <th class="px-2 py-2.5 text-left font-medium text-ink-muted">ID</th>
                                <th class="px-2 py-2.5 text-left font-medium text-ink-muted">Name</th>
                                <th class="px-2 py-2.5 text-left font-medium text-ink-muted">Type</th>
                                <th class="px-2 py-2.5 text-left font-medium text-ink-muted">Email</th>
                                <th class="px-2 py-2.5 text-left font-medium text-ink-muted">Phone</th>
                                <th class="px-2 py-2.5 text-left font-medium text-ink-muted">Status</th>
                                <th class="px-2 py-2.5 text-left font-medium text-ink-muted">Last Login</th>
                                <th class="px-2 py-2.5 text-left font-medium text-ink-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-hairline">
                            <?php if (empty($users)): ?>
                            <tr><td colspan="9" class="px-4 py-8 text-center text-ink-muted">No users found.</td></tr>
                            <?php else: ?>
                            <?php foreach ($users as $user): ?>
                            <tr class="hover:bg-surface-2">
                                <td class="px-2 py-2"><input type="checkbox" name="selected_users[]" value="<?= $user['user_id'] ?>" class="rounded user-checkbox"></td>
                                <td class="px-2 py-2 font-mono font-bold text-primary-700"><?= htmlspecialchars($user['user_id'], ENT_QUOTES, 'UTF-8', false) ?></td>
                                <td class="px-2 py-2 font-medium text-ink whitespace-nowrap"><?= htmlspecialchars($user['name'], ENT_QUOTES, 'UTF-8', false) ?></td>
                                <td class="px-2 py-2">
                                    <span class="px-1.5 py-0.5 rounded-full font-medium <?= $typeBadgeColors[$user['user_type']] ?? 'bg-surface-2 text-ink-muted' ?>"><?= ucfirst(str_replace('_', ' ', $user['user_type'])) ?></span>
                                </td>
                                <td class="px-2 py-2 text-ink-muted max-w-[140px] truncate" title="<?= htmlspecialchars($user['email'], ENT_QUOTES, 'UTF-8', false) ?>"><?= htmlspecialchars($user['email'], ENT_QUOTES, 'UTF-8', false) ?></td>
                                <td class="px-2 py-2 text-ink-muted whitespace-nowrap"><?= htmlspecialchars($user['phone'] ?? '-', ENT_QUOTES, 'UTF-8', false) ?></td>
                                <td class="px-2 py-2">
                                    <span class="px-1.5 py-0.5 rounded-full font-medium <?= $statusBadgeColors[$user['status']] ?? 'bg-surface-2 text-ink-muted' ?>"><?= ucfirst($user['status']) ?></span>
                                </td>
                                <td class="px-2 py-2 text-ink-muted whitespace-nowrap"><?= $user['last_login'] ? date('d M, h:i A', strtotime($user['last_login'])) : 'Never' ?></td>
                                <td class="px-2 py-2">
                                    <div class="flex items-center space-x-1">
                                        <a href="<?= BASE_PATH ?>/admin/user-profile.php?id=<?= urlencode($user['user_id']) ?>" class="text-primary-600 hover:text-primary-800 font-medium px-1 py-0.5 rounded hover:bg-primary-50"><i class="fas fa-eye"></i></a>
                                        <?php if (in_array($user['user_type'], ['intern', 'employee', 'pillar_post'])): ?>
                                        <form method="POST" class="inline">
                                            <input type="hidden" name="action" value="toggle_hr_intern">
                                            <input type="hidden" name="user_id" value="<?= $user['user_id'] ?>">
                                            <button type="submit" class="<?= !empty($user['is_hr_intern']) ? 'text-green-600 hover:text-green-800 bg-green-50' : 'text-ink-muted hover:text-amber-600' ?> font-medium px-1 py-0.5 rounded hover:bg-amber-50" title="<?= !empty($user['is_hr_intern']) ? 'Revoke HR Access' : 'Grant HR Access' ?>">
                                                <i class="fas fa-briefcase"></i>
                                            </button>
                                        </form>
                                        <?php endif; ?>
                                        <button type="button" onclick="deleteUser('<?= htmlspecialchars(addslashes($user['name']), ENT_QUOTES, 'UTF-8', false) ?>', '<?= $user['user_id'] ?>')" class="text-red-400 hover:text-red-700 font-medium px-1 py-0.5 rounded hover:bg-red-500/10"><i class="fas fa-trash"></i></button>
                                    </div>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </form>

        <!-- Pagination -->
        <?php if ($totalPages > 1): ?>
        <div class="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
            <p class="text-sm text-ink-muted">Showing <?= $offset + 1 ?>-<?= min($offset + $perPage, $totalUsers_filtered) ?> of <?= $totalUsers_filtered ?> users</p>
            <div class="flex gap-1">
                <?php if ($page > 1): ?>
                <a href="?page=<?= $page-1 ?><?= !empty($_GET['type']) ? '&type='.$_GET['type'] : '' ?><?= !empty($_GET['status']) ? '&status='.$_GET['status'] : '' ?><?= !empty($_GET['search']) ? '&search='.urlencode($_GET['search']) : '' ?>" class="px-3 py-2 bg-surface-1 border border-hairline bg-surface-2 text-ink rounded-lg text-sm hover:bg-surface-2"><i class="fas fa-chevron-left"></i></a>
                <?php endif; ?>
                <?php for ($i = max(1, $page-2); $i <= min($totalPages, $page+2); $i++): ?>
                <a href="?page=<?= $i ?><?= !empty($_GET['type']) ? '&type='.$_GET['type'] : '' ?><?= !empty($_GET['status']) ? '&status='.$_GET['status'] : '' ?><?= !empty($_GET['search']) ? '&search='.urlencode($_GET['search']) : '' ?>" class="px-3 py-2 border rounded-lg text-sm <?= $i===$page ? 'bg-primary-600 text-white border-primary-600' : 'bg-surface-1 border-hairline bg-surface-2 text-ink hover:bg-surface-2' ?>"><?= $i ?></a>
                <?php endfor; ?>
                <?php if ($page < $totalPages): ?>
                <a href="?page=<?= $page+1 ?><?= !empty($_GET['type']) ? '&type='.$_GET['type'] : '' ?><?= !empty($_GET['status']) ? '&status='.$_GET['status'] : '' ?><?= !empty($_GET['search']) ? '&search='.urlencode($_GET['search']) : '' ?>" class="px-3 py-2 bg-surface-1 border border-hairline bg-surface-2 text-ink rounded-lg text-sm hover:bg-surface-2"><i class="fas fa-chevron-right"></i></a>
                <?php endif; ?>
            </div>
        </div>
        <?php endif; ?>
    </div>
</div>

<script>
function toggleAll(source) {
    document.querySelectorAll('.user-checkbox').forEach(cb => cb.checked = source.checked);
}
function deleteUser(name, uid) {
    if (confirm('PERMANENTLY DELETE ' + name + ' and all their data?')) {
        document.getElementById('sa_action').value = 'delete_user';
        document.getElementById('sa_user_id').value = uid;
        document.getElementById('singleActionForm').submit();
    }
}
function updateUserStatus(uid, status) {
    document.getElementById('sa_action').value = 'update_status';
    document.getElementById('sa_user_id').value = uid;
    document.getElementById('sa_status').value = status;
    document.getElementById('singleActionForm').submit();
}
</script>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>






