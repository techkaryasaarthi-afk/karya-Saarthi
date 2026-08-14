<?php
$pageTitle = 'Complaint Box — Anonymous';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireAdmin();
$pdo = getDBConnection();
$message = '';
$messageType = '';
if (isset($_GET['msg']) && $_GET['msg'] === 'success') {
    $message = 'Operation completed successfully!';
    $messageType = 'success';
}

// Auto-create complaints table
$pdo->exec("CREATE TABLE IF NOT EXISTS complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    subject VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('new','investigating','resolved','dismissed') DEFAULT 'new',
    admin_notes TEXT,
    resolved_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// Handle POST actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    try {
        switch ($action) {
            case 'update_complaint':
                $complaintId = intval($_POST['id'] ?? 0);
                $status = $_POST['status'] ?? 'new';
                $adminNotes = $_POST['admin_notes'] ?? '';

                $validStatuses = ['new', 'investigating', 'resolved', 'dismissed'];
                if (!$complaintId || !in_array($status, $validStatuses)) {
                    $message = 'Invalid complaint or status.';
                    $messageType = 'error';
                } else {
                    $resolvedAt = ($status === 'resolved') ? date('Y-m-d H:i:s') : null;
                    $stmt = $pdo->prepare("UPDATE complaints SET status=?, admin_notes=?, resolved_at=COALESCE(?, resolved_at) WHERE id=?");
                    $stmt->execute([$status, $adminNotes, $resolvedAt, $complaintId]);
                    $message = "Complaint #$complaintId updated to \"$status\" successfully!";
                    $messageType = 'success';
                    logActivity($_SESSION['user_id'], 'complaint_updated', "Updated complaint #$complaintId to $status");
                }
                break;
        }
        if ($messageType === 'success') {
            header('Location: ' . $_SERVER['PHP_SELF'] . '?msg=success');
            exit;
        }
    } catch (Exception $e) {
        $message = 'Error: ' . $e->getMessage();
        $messageType = 'error';
    }
}

// Filter by status
$filterStatus = $_GET['status'] ?? '';
$filterCategory = $_GET['category'] ?? '';

$sql = "SELECT * FROM complaints WHERE 1=1";
$params = [];

if ($filterStatus && in_array($filterStatus, ['new', 'investigating', 'resolved', 'dismissed'])) {
    $sql .= " AND status = ?";
    $params[] = $filterStatus;
}
if ($filterCategory) {
    $sql .= " AND category = ?";
    $params[] = $filterCategory;
}
$sql .= " ORDER BY created_at DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$complaints = $stmt->fetchAll();

// Stats
$stats = $pdo->query("SELECT
    COUNT(*) as total,
    SUM(status = 'new') as new_count,
    SUM(status = 'investigating') as investigating_count,
    SUM(status = 'resolved') as resolved_count,
    SUM(status = 'dismissed') as dismissed_count
FROM complaints")->fetch();

// Unique categories for filter
$catList = $pdo->query("SELECT DISTINCT category FROM complaints ORDER BY category")->fetchAll(PDO::FETCH_COLUMN);

require_once __DIR__ . '/../includes/header.php';

$statusColors = [
    'new' => 'bg-blue-100 text-blue-800',
    'investigating' => 'bg-amber-100 text-amber-800',
    'resolved' => 'bg-green-100 text-green-800',
    'dismissed' => 'bg-surface-2 text-ink-muted',
];
$statusIcons = [
    'new' => 'fa-inbox',
    'investigating' => 'fa-search',
    'resolved' => 'fa-check-circle',
    'dismissed' => 'fa-ban',
];
?>

<div class="flex min-h-[calc(100vh-56px)] bg-surface-2">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 dashboard-content-area">
        <div class="p-4 sm:p-6 lg:p-8">

            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-ink"><i class="fas fa-shield-alt text-primary-500 mr-2"></i>Complaint Box</h1>
                    <p class="text-sm text-ink-muted mt-1">Review and manage anonymous complaints. <strong class="text-amber-600">These complaints are 100% anonymous — no sender information is stored.</strong></p>
                </div>
            </div>

            <?php if ($message): ?>
            <div class="mb-6 p-4 rounded-xl border <?= $messageType === 'success' ? 'bg-green-500/10 border-green-200 text-green-800' : 'bg-red-500/10 border-red-500/20 text-red-400' ?>">
                <i class="fas <?= $messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle' ?> mr-2"></i>
                <?= $message ?>
            </div>
            <?php endif; ?>

            <!-- Stats Cards -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-surface-1 rounded-xl border border-hairline p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs text-ink-muted uppercase tracking-wide">Total</p>
                            <p class="text-2xl font-bold text-ink"><?= $stats['total'] ?? 0 ?></p>
                        </div>
                        <div class="w-10 h-10 bg-surface-2 rounded-lg flex items-center justify-center">
                            <i class="fas fa-envelope-open-text text-ink-muted"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-surface-1 rounded-xl border border-blue-200 p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs text-blue-500 uppercase tracking-wide">New</p>
                            <p class="text-2xl font-bold text-blue-700"><?= $stats['new_count'] ?? 0 ?></p>
                        </div>
                        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-inbox text-blue-500"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-surface-1 rounded-xl border border-amber-200 p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs text-amber-500 uppercase tracking-wide">Investigating</p>
                            <p class="text-2xl font-bold text-amber-700"><?= $stats['investigating_count'] ?? 0 ?></p>
                        </div>
                        <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-search text-amber-500"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-surface-1 rounded-xl border border-green-200 p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs text-green-400 uppercase tracking-wide">Resolved</p>
                            <p class="text-2xl font-bold text-green-700"><?= $stats['resolved_count'] ?? 0 ?></p>
                        </div>
                        <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-check-circle text-green-400"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Anonymous Notice -->
            <div class="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div class="flex items-start gap-3">
                    <i class="fas fa-user-secret text-amber-500 text-xl mt-0.5"></i>
                    <div>
                        <p class="font-semibold text-amber-800">100% Anonymous Complaints</p>
                        <p class="text-sm text-amber-700 mt-1">No sender information (name, email, IP, or user ID) is stored with these complaints. They are completely anonymous to protect the identity of the complainant.</p>
                    </div>
                </div>
            </div>

            <!-- Filters -->
            <div class="flex flex-wrap gap-2 mb-6">
                <a href="<?= BASE_PATH ?>/admin/complaints.php" class="px-4 py-2 rounded-lg text-sm font-medium transition <?= !$filterStatus ? 'bg-primary-600 text-white' : 'bg-surface-1 text-ink-muted border border-hairline hover:bg-surface-2' ?>">
                    All (<?= $stats['total'] ?? 0 ?>)
                </a>
                <a href="<?= BASE_PATH ?>/admin/complaints.php?status=new" class="px-4 py-2 rounded-lg text-sm font-medium transition <?= $filterStatus === 'new' ? 'bg-blue-600 text-white' : 'bg-surface-1 text-ink-muted border border-hairline hover:bg-surface-2' ?>">
                    <i class="fas fa-inbox mr-1"></i>New (<?= $stats['new_count'] ?? 0 ?>)
                </a>
                <a href="<?= BASE_PATH ?>/admin/complaints.php?status=investigating" class="px-4 py-2 rounded-lg text-sm font-medium transition <?= $filterStatus === 'investigating' ? 'bg-amber-600 text-white' : 'bg-surface-1 text-ink-muted border border-hairline hover:bg-surface-2' ?>">
                    <i class="fas fa-search mr-1"></i>Investigating (<?= $stats['investigating_count'] ?? 0 ?>)
                </a>
                <a href="<?= BASE_PATH ?>/admin/complaints.php?status=resolved" class="px-4 py-2 rounded-lg text-sm font-medium transition <?= $filterStatus === 'resolved' ? 'bg-green-600 text-white' : 'bg-surface-1 text-ink-muted border border-hairline hover:bg-surface-2' ?>">
                    <i class="fas fa-check-circle mr-1"></i>Resolved (<?= $stats['resolved_count'] ?? 0 ?>)
                </a>
                <a href="<?= BASE_PATH ?>/admin/complaints.php?status=dismissed" class="px-4 py-2 rounded-lg text-sm font-medium transition <?= $filterStatus === 'dismissed' ? 'bg-gray-600 text-white' : 'bg-surface-1 text-ink-muted border border-hairline hover:bg-surface-2' ?>">
                    <i class="fas fa-ban mr-1"></i>Dismissed (<?= $stats['dismissed_count'] ?? 0 ?>)
                </a>
                <?php if (!empty($catList)): ?>
                <span class="text-ink-muted opacity-50 px-1">|</span>
                <?php foreach ($catList as $cat): ?>
                <a href="<?= BASE_PATH ?>/admin/complaints.php?category=<?= urlencode($cat) ?>" class="px-3 py-2 rounded-lg text-sm font-medium transition <?= $filterCategory === $cat ? 'bg-purple-600 text-white' : 'bg-surface-1 text-ink-muted border border-hairline hover:bg-surface-2' ?>">
                    <?= htmlspecialchars($cat, ENT_QUOTES, 'UTF-8', false) ?>
                </a>
                <?php endforeach; ?>
                <?php endif; ?>
            </div>

            <!-- Complaints List -->
            <?php if (empty($complaints)): ?>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-10 text-center">
                <i class="fas fa-inbox text-4xl text-ink-muted opacity-50 mb-3"></i>
                <p class="text-ink-muted">No complaints found.</p>
            </div>
            <?php else: ?>
            <div class="space-y-4">
                <?php foreach ($complaints as $complaint): ?>
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline overflow-hidden">
                    <div class="px-6 py-4">
                        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div class="flex-1 dashboard-content-area min-w-0">
                                <div class="flex flex-wrap items-center gap-2 mb-2">
                                    <span class="text-xs font-mono text-ink-muted">#<?= $complaint['id'] ?></span>
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"><?= htmlspecialchars($complaint['category'], ENT_QUOTES, 'UTF-8', false) ?></span>
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium <?= $statusColors[$complaint['status']] ?? 'bg-surface-2 text-ink-muted' ?>">
                                        <i class="fas <?= $statusIcons[$complaint['status']] ?? 'fa-circle' ?> mr-1"></i>
                                        <?= ucfirst($complaint['status']) ?>
                                    </span>
                                    <span class="text-xs text-ink-muted"><i class="fas fa-clock mr-1"></i><?= date('d M Y, h:i A', strtotime($complaint['created_at'])) ?></span>
                                </div>
                                <h3 class="text-base font-semibold text-ink mb-1"><?= htmlspecialchars($complaint['subject'], ENT_QUOTES, 'UTF-8', false) ?></h3>
                                <details class="mt-2">
                                    <summary class="text-sm text-primary-600 cursor-pointer hover:text-primary-800 font-medium">View full description</summary>
                                    <div class="mt-2 p-3 bg-surface-2 rounded-lg text-sm text-ink-muted whitespace-pre-wrap"><?= htmlspecialchars($complaint['description'], ENT_QUOTES, 'UTF-8', false) ?></div>
                                </details>
                                <?php if (!empty($complaint['admin_notes'])): ?>
                                <div class="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <p class="text-xs font-semibold text-blue-700 mb-1"><i class="fas fa-sticky-note mr-1"></i>Admin Notes:</p>
                                    <p class="text-sm text-blue-800"><?= htmlspecialchars($complaint['admin_notes'], ENT_QUOTES, 'UTF-8', false) ?></p>
                                </div>
                                <?php endif; ?>
                                <?php if ($complaint['resolved_at']): ?>
                                <p class="text-xs text-green-600 mt-2"><i class="fas fa-check mr-1"></i>Resolved on <?= date('d M Y, h:i A', strtotime($complaint['resolved_at'])) ?></p>
                                <?php endif; ?>
                            </div>
                        </div>

                        <!-- Update Form -->
                        <details class="mt-4 border-t border-hairline pt-4">
                            <summary class="text-sm text-ink-muted cursor-pointer hover:text-ink-muted font-medium"><i class="fas fa-pen mr-1"></i>Update Status & Notes</summary>
                            <form method="POST" class="mt-3">
                                <input type="hidden" name="action" value="update_complaint">
                                <input type="hidden" name="id" value="<?= $complaint['id'] ?>">
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label class="block text-xs font-medium text-ink-muted mb-1">Status</label>
                                        <select name="status" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                            <option value="new" <?= $complaint['status'] === 'new' ? 'selected' : '' ?>>New</option>
                                            <option value="investigating" <?= $complaint['status'] === 'investigating' ? 'selected' : '' ?>>Investigating</option>
                                            <option value="resolved" <?= $complaint['status'] === 'resolved' ? 'selected' : '' ?>>Resolved</option>
                                            <option value="dismissed" <?= $complaint['status'] === 'dismissed' ? 'selected' : '' ?>>Dismissed</option>
                                        </select>
                                    </div>
                                    <div class="md:col-span-2">
                                        <label class="block text-xs font-medium text-ink-muted mb-1">Admin Notes</label>
                                        <textarea name="admin_notes" rows="2" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="Internal notes (not visible to complainant)"><?= htmlspecialchars($complaint['admin_notes'] ?? '', ENT_QUOTES, 'UTF-8', false) ?></textarea>
                                    </div>
                                </div>
                                <div class="mt-3">
                                    <button type="submit" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                                        <i class="fas fa-save mr-1"></i>Update Complaint
                                    </button>
                                </div>
                            </form>
                        </details>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>

        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>







