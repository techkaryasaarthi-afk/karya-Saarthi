<?php
$pageTitle = 'Announcements';
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

// Ensure announcements table exists (uses existing schema from migrate.php)
$pdo->exec("CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    target_audience VARCHAR(50) DEFAULT 'all',
    is_active BOOLEAN DEFAULT TRUE,
    scheduled_at DATETIME NULL,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$announcementIdColumn = 'id';
try {
    $announcementColumns = $pdo->query("SHOW COLUMNS FROM announcements")->fetchAll(PDO::FETCH_COLUMN);
    if (in_array('announcement_id', $announcementColumns, true)) {
        $announcementIdColumn = 'announcement_id';
    }
} catch (Exception $e) {}

$audienceOptions = [
    'all' => 'All Users',
    'employees' => 'Employees',
    'interns' => 'Interns',
    'vendors' => 'Vendors',
    'campus_saarthi' => 'Campus Saarthi',
    'teaching_expert' => 'Teaching Experts',
];

// Handle POST actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    try {
        switch ($action) {
            case 'create_announcement':
                $title = sanitize($_POST['title'] ?? '');
                $content = $_POST['content'] ?? '';
                $targetAudience = sanitize($_POST['target_audience'] ?? 'all');
                $scheduledAt = !empty($_POST['scheduled_at']) ? $_POST['scheduled_at'] : null;
                $isActive = isset($_POST['is_active']) ? 1 : 0;

                if (empty($title) || empty($content)) {
                    $message = 'Title and content are required.';
                    $messageType = 'error';
                } else {
                    $stmt = $pdo->prepare("INSERT INTO announcements (title, content, target_audience, is_active, scheduled_at, created_by) VALUES (?, ?, ?, ?, ?, ?)");
                    $stmt->execute([$title, $content, $targetAudience, $isActive, $scheduledAt, $_SESSION['user_id']]);
                    $message = 'Announcement created successfully!';
                    $messageType = 'success';
                    logActivity($_SESSION['user_id'], 'announcement_created', "Created announcement: $title");
                }
                break;

            case 'update_announcement':
                $announcementId = intval($_POST['id'] ?? 0);
                $title = sanitize($_POST['title'] ?? '');
                $content = $_POST['content'] ?? '';
                $targetAudience = sanitize($_POST['target_audience'] ?? 'all');
                $scheduledAt = !empty($_POST['scheduled_at']) ? $_POST['scheduled_at'] : null;
                $isActive = isset($_POST['is_active']) ? 1 : 0;

                if (!$announcementId || empty($title) || empty($content)) {
                    $message = 'Title and content are required.';
                    $messageType = 'error';
                } else {
                    $stmt = $pdo->prepare("UPDATE announcements SET title=?, content=?, target_audience=?, is_active=?, scheduled_at=? WHERE {$announcementIdColumn}=?");
                    $stmt->execute([$title, $content, $targetAudience, $isActive, $scheduledAt, $announcementId]);
                    $message = 'Announcement updated successfully!';
                    $messageType = 'success';
                    logActivity($_SESSION['user_id'], 'announcement_updated', "Updated announcement #$announcementId");
                }
                break;

            case 'delete_announcement':
                $announcementId = intval($_POST['id'] ?? 0);
                if ($announcementId) {
                    $stmt = $pdo->prepare("SELECT title FROM announcements WHERE {$announcementIdColumn} = ?");
                    $stmt->execute([$announcementId]);
                    $ann = $stmt->fetch();
                    $pdo->prepare("DELETE FROM announcements WHERE {$announcementIdColumn} = ?")->execute([$announcementId]);
                    $message = 'Announcement "' . htmlspecialchars($ann['title'] ?? '', ENT_QUOTES, 'UTF-8', false) . '" deleted!';
                    $messageType = 'success';
                    logActivity($_SESSION['user_id'], 'announcement_deleted', "Deleted announcement #$announcementId");
                }
                break;

            case 'toggle_active':
                $announcementId = intval($_POST['id'] ?? 0);
                if ($announcementId) {
                    $pdo->prepare("UPDATE announcements SET is_active = NOT is_active WHERE {$announcementIdColumn} = ?")->execute([$announcementId]);
                    $message = 'Announcement visibility toggled!';
                    $messageType = 'success';
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

// Fetch all announcements
$announcements = $pdo->query("SELECT {$announcementIdColumn} AS id, title, content, target_audience, is_active, scheduled_at, created_by, created_at FROM announcements ORDER BY created_at DESC")->fetchAll();

// Check if editing
$editAnn = null;
if (isset($_GET['edit'])) {
    $stmt = $pdo->prepare("SELECT {$announcementIdColumn} AS id, title, content, target_audience, is_active, scheduled_at, created_by, created_at FROM announcements WHERE {$announcementIdColumn} = ?");
    $stmt->execute([intval($_GET['edit'])]);
    $editAnn = $stmt->fetch();
}

// Determine status for each announcement
function getAnnouncementStatus($ann) {
    $now = time();
    if (!$ann['is_active']) return ['label' => 'Inactive', 'class' => 'bg-surface-2 text-ink-muted', 'icon' => 'fa-eye-slash'];
    if ($ann['scheduled_at'] && strtotime($ann['scheduled_at']) > $now) return ['label' => 'Scheduled', 'class' => 'bg-amber-100 text-amber-800', 'icon' => 'fa-clock'];
    if ($ann['scheduled_at'] && strtotime($ann['scheduled_at']) <= $now) return ['label' => 'Active', 'class' => 'bg-green-100 text-green-800', 'icon' => 'fa-check-circle'];
    return ['label' => 'Active', 'class' => 'bg-green-100 text-green-800', 'icon' => 'fa-check-circle'];
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="flex min-h-[calc(100vh-56px)] bg-surface-2">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 dashboard-content-area">
        <div class="p-4 sm:p-6 lg:p-8">

            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-ink"><i class="fas fa-bullhorn text-primary-500 mr-2"></i>Announcements</h1>
                    <p class="text-sm text-ink-muted mt-1">Create and manage announcements visible on user dashboards.</p>
                </div>
                <div class="mt-3 sm:mt-0">
                    <span class="text-sm text-ink-muted"><?= count($announcements) ?> announcements total</span>
                </div>
            </div>

            <?php if ($message): ?>
            <div class="mb-6 p-4 rounded-xl border <?= $messageType === 'success' ? 'bg-green-500/10 border-green-200 text-green-800' : 'bg-red-500/10 border-red-500/20 text-red-400' ?>">
                <i class="fas <?= $messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle' ?> mr-2"></i>
                <?= $message ?>
            </div>
            <?php endif; ?>

            <!-- Create / Edit Form -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6 mb-6">
                <h2 class="text-lg font-semibold text-ink mb-4">
                    <i class="fas <?= $editAnn ? 'fa-edit' : 'fa-plus-circle' ?> mr-2 text-primary-500"></i>
                    <?= $editAnn ? 'Edit Announcement' : 'Create Announcement' ?>
                </h2>
                <form method="POST">
                    <input type="hidden" name="action" value="<?= $editAnn ? 'update_announcement' : 'create_announcement' ?>">
                    <?php if ($editAnn): ?>
                        <input type="hidden" name="id" value="<?= $editAnn['id'] ?>">
                    <?php endif; ?>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-ink-muted mb-1">Title *</label>
                            <input type="text" name="title" required value="<?= htmlspecialchars($editAnn['title'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" placeholder="e.g. Office Closed on Holi" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Target Audience</label>
                            <select name="target_audience" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                <?php foreach ($audienceOptions as $val => $label): ?>
                                <option value="<?= $val ?>" <?= ($editAnn['target_audience'] ?? 'all') === $val ? 'selected' : '' ?>><?= $label ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Schedule Date/Time <span class="text-ink-muted text-xs">(optional — leave blank for immediate)</span></label>
                            <input type="datetime-local" name="scheduled_at" value="<?= $editAnn['scheduled_at'] ? date('Y-m-d\TH:i', strtotime($editAnn['scheduled_at'])) : '' ?>" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-ink-muted mb-1">Content * <span class="text-ink-muted text-xs">(Plain text, line breaks supported)</span></label>
                        <textarea name="content" required rows="6" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"><?= htmlspecialchars($editAnn['content'] ?? '', ENT_QUOTES, 'UTF-8', false) ?></textarea>
                    </div>

                    <div class="flex items-center gap-4 mb-4">
                        <div class="flex items-center gap-2">
                            <input type="checkbox" name="is_active" id="is_active" value="1" <?= ($editAnn['is_active'] ?? 1) ? 'checked' : '' ?> class="rounded border-hairline bg-surface-2 text-ink text-primary-600 focus:ring-primary-500">
                            <label for="is_active" class="text-sm font-medium text-ink-muted">Active</label>
                        </div>
                    </div>

                    <div class="flex items-center gap-3">
                        <button type="submit" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
                            <i class="fas <?= $editAnn ? 'fa-save' : 'fa-plus' ?> mr-1"></i>
                            <?= $editAnn ? 'Update Announcement' : 'Create Announcement' ?>
                        </button>
                        <?php if ($editAnn): ?>
                            <a href="<?= BASE_PATH ?>/admin/announcements.php" class="border border-hairline bg-surface-2 text-ink hover:bg-surface-2 text-ink-muted px-6 py-2.5 rounded-lg text-sm font-medium transition">Cancel</a>
                        <?php endif; ?>
                    </div>
                </form>
            </div>

            <!-- Announcements List -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline overflow-hidden">
                <div class="px-6 py-4 border-b border-hairline">
                    <h2 class="text-lg font-semibold text-ink"><i class="fas fa-list mr-2 text-primary-500"></i>All Announcements (<?= count($announcements) ?>)</h2>
                </div>

                <?php if (empty($announcements)): ?>
                <div class="p-10 text-center">
                    <i class="fas fa-bullhorn text-4xl text-ink-muted opacity-50 mb-3"></i>
                    <p class="text-ink-muted">No announcements yet. Create your first one above.</p>
                </div>
                <?php else: ?>
                <div class="divide-y divide-hairline">
                    <?php foreach ($announcements as $ann):
                        $status = getAnnouncementStatus($ann);
                    ?>
                    <div class="px-6 py-4 hover:bg-surface-2 transition">
                        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div class="flex-1 dashboard-content-area min-w-0">
                                <div class="flex flex-wrap items-center gap-2 mb-1">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium <?= $status['class'] ?>">
                                        <i class="fas <?= $status['icon'] ?> mr-1"></i><?= $status['label'] ?>
                                    </span>
                                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                                        <?= $audienceOptions[$ann['target_audience']] ?? ucfirst($ann['target_audience']) ?>
                                    </span>
                                    <span class="text-xs text-ink-muted"><?= date('d M Y, h:i A', strtotime($ann['created_at'])) ?></span>
                                </div>
                                <h3 class="text-sm font-semibold text-ink"><?= htmlspecialchars($ann['title'], ENT_QUOTES, 'UTF-8', false) ?></h3>
                                <p class="text-sm text-ink-muted mt-1 line-clamp-2"><?= htmlspecialchars(strip_tags($ann['content']), ENT_QUOTES, 'UTF-8', false) ?></p>
                                <?php if ($ann['scheduled_at'] && strtotime($ann['scheduled_at']) > time()): ?>
                                <p class="text-xs text-amber-600 mt-2">
                                    <i class="fas fa-clock mr-1"></i>Scheduled for: <?= date('d M Y, h:i A', strtotime($ann['scheduled_at'])) ?>
                                    <span class="ml-2 font-mono" id="countdown-<?= $ann['id'] ?>"></span>
                                </p>
                                <?php endif; ?>
                            </div>
                            <div class="flex items-center gap-1 flex-shrink-0">
                                <!-- Preview Button -->
                                <button onclick="previewAnnouncement(<?= $ann['id'] ?>)" class="text-indigo-600 hover:text-indigo-800 text-sm px-2 py-1.5 rounded-lg hover:bg-indigo-50 transition" title="Preview">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <form method="POST" class="inline">
                                    <input type="hidden" name="action" value="toggle_active">
                                    <input type="hidden" name="id" value="<?= $ann['id'] ?>">
                                    <button type="submit" title="Toggle active" class="<?= $ann['is_active'] ? 'text-green-600 hover:text-green-800' : 'text-ink-muted hover:text-ink-muted' ?> text-sm px-2 py-1.5 rounded-lg hover:bg-surface-2 transition">
                                        <i class="fas <?= $ann['is_active'] ? 'fa-toggle-on' : 'fa-toggle-off' ?>"></i>
                                    </button>
                                </form>
                                <a href="<?= BASE_PATH ?>/admin/announcements.php?edit=<?= $ann['id'] ?>" class="text-primary-600 hover:text-primary-800 text-sm px-2 py-1.5 rounded-lg hover:bg-primary-50 transition">
                                    <i class="fas fa-edit"></i>
                                </a>
                                <form method="POST" onsubmit="return confirm('Delete this announcement?')" class="inline">
                                    <input type="hidden" name="action" value="delete_announcement">
                                    <input type="hidden" name="id" value="<?= $ann['id'] ?>">
                                    <button type="submit" class="text-red-600 hover:text-red-400 text-sm px-2 py-1.5 rounded-lg hover:bg-red-500/10 transition">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>
            </div>

        </div>
    </div>
</div>

<!-- Preview Modal -->
<div id="previewModal" class="fixed inset-0 z-50 hidden" onclick="if(event.target===this)closePreview()">
    <div class="absolute inset-0 bg-black/50"></div>
    <div class="relative flex items-center justify-center min-h-screen p-4">
        <div class="bg-surface-1 rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
            <button onclick="closePreview()" class="absolute top-3 right-3 text-ink-muted hover:text-ink-muted"><i class="fas fa-times text-lg"></i></button>
            <h3 class="text-xs uppercase tracking-wider text-ink-muted mb-2">Dashboard Preview</h3>
            <div class="bg-primary-50 border border-primary-200 rounded-xl p-4">
                <div class="flex items-start gap-3">
                    <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i class="fas fa-bullhorn text-primary-600 text-sm"></i>
                    </div>
                    <div>
                        <h4 id="preview-title" class="font-semibold text-ink"></h4>
                        <div id="preview-content" class="text-sm text-ink-muted mt-1"></div>
                        <p id="preview-meta" class="text-xs text-ink-muted mt-2"></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// Announcement data for preview
const announcements = <?= json_encode(array_map(function($a) {
    return [
        'id' => $a['id'],
        'title' => $a['title'],
        'content' => $a['content'],
        'audience' => $a['target_audience'],
        'created_at' => date('d M Y', strtotime($a['created_at']))
    ];
}, $announcements)) ?>;

function previewAnnouncement(id) {
    const ann = announcements.find(a => a.id === id);
    if (!ann) return;
    document.getElementById('preview-title').textContent = ann.title;
    document.getElementById('preview-content').innerHTML = ann.content;
    document.getElementById('preview-meta').textContent = 'For: ' + ann.audience + ' | ' + ann.created_at;
    document.getElementById('previewModal').classList.remove('hidden');
}

function closePreview() {
    document.getElementById('previewModal').classList.add('hidden');
}

// Countdown timers for scheduled announcements
document.querySelectorAll('[id^="countdown-"]').forEach(el => {
    const id = el.id.replace('countdown-', '');
    const ann = <?= json_encode(array_map(function($a) {
        return ['id' => $a['id'], 'scheduled_at' => $a['scheduled_at']];
    }, $announcements)) ?>.find(a => a.id == id);
    if (!ann || !ann.scheduled_at) return;

    function updateCountdown() {
        const target = new Date(ann.scheduled_at).getTime();
        const now = Date.now();
        const diff = target - now;
        if (diff <= 0) { el.textContent = '(Live now)'; return; }
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        el.textContent = '(' + (days > 0 ? days + 'd ' : '') + hours + 'h ' + mins + 'm)';
    }
    updateCountdown();
    setInterval(updateCountdown, 60000);
});
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>







