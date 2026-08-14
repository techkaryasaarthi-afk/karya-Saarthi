<?php
$pageTitle = 'Life at KS Manager';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireAdmin();
$pdo = getDBConnection();
$message = '';
$messageType = '';

// Handle GET messages from POST-Redirect-GET
if (isset($_GET['msg'])) {
    $msgs = ['eom_saved' => 'Employee of the Month saved!', 'eom_deleted' => 'EOM deleted!', 'video_saved' => 'Video saved!', 'video_deleted' => 'Video deleted!'];
    $message = $msgs[$_GET['msg']] ?? 'Operation completed!';
    $messageType = 'success';
}

// Auto-create tables
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS employee_of_month (
        eom_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        designation VARCHAR(100),
        description TEXT,
        photo_url VARCHAR(500),
        month_year VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS life_videos (
        video_id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        role VARCHAR(100),
        video_url VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
} catch (Exception $e) {}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    try {
        if ($action === 'save_eom') {
            $eomId = intval($_POST['eom_id'] ?? 0);
            $name = sanitize($_POST['name'] ?? '');
            $designation = sanitize($_POST['designation'] ?? '');
            $description = sanitize($_POST['description'] ?? '');
            $photoUrl = $_POST['photo_url'] ?? '';
            $monthYear = sanitize($_POST['month_year'] ?? '');
            $isActive = isset($_POST['is_active']) ? 1 : 0;

            if (empty($name)) {
                $message = 'Name is required.';
                $messageType = 'error';
            } else {
                if ($eomId) {
                    $stmt = $pdo->prepare("UPDATE employee_of_month SET name=?, designation=?, description=?, photo_url=?, month_year=?, is_active=? WHERE eom_id=?");
                    $stmt->execute([$name, $designation, $description, $photoUrl, $monthYear, $isActive, $eomId]);
                    $message = 'Employee of the Month updated!';
                    header('Location: ' . BASE_PATH . '/admin/life.php?msg=eom_saved');
                    exit;
                } else {
                    $stmt = $pdo->prepare("INSERT INTO employee_of_month (name, designation, description, photo_url, month_year, is_active) VALUES (?, ?, ?, ?, ?, ?)");
                    $stmt->execute([$name, $designation, $description, $photoUrl, $monthYear, $isActive]);
                    $message = 'Employee of the Month added!';
                }
                header('Location: ' . BASE_PATH . '/admin/life.php?msg=eom_saved');
                exit;
                $messageType = 'success';
            }
        } elseif ($action === 'delete_eom') {
            $eomId = intval($_POST['eom_id'] ?? 0);
            $pdo->prepare("DELETE FROM employee_of_month WHERE eom_id=?")->execute([$eomId]);
            header('Location: ' . BASE_PATH . '/admin/life.php?msg=eom_deleted');
            exit;
        } elseif ($action === 'save_video') {
            $videoId = intval($_POST['video_id'] ?? 0);
            $title = sanitize($_POST['title'] ?? '');
            $role = sanitize($_POST['role'] ?? '');
            $videoUrl = $_POST['video_url'] ?? '';
            $sortOrder = intval($_POST['sort_order'] ?? 0);
            $isActive = isset($_POST['is_active']) ? 1 : 0;

            if (empty($title)) {
                $message = 'Title is required.';
                $messageType = 'error';
            } else {
                if ($videoId) {
                    $stmt = $pdo->prepare("UPDATE life_videos SET title=?, role=?, video_url=?, sort_order=?, is_active=? WHERE video_id=?");
                    $stmt->execute([$title, $role, $videoUrl, $sortOrder, $isActive, $videoId]);
                    $message = 'Video updated!';
                    header('Location: ' . BASE_PATH . '/admin/life.php?msg=video_saved');
                    exit;
                } else {
                    $stmt = $pdo->prepare("INSERT INTO life_videos (title, role, video_url, sort_order, is_active) VALUES (?, ?, ?, ?, ?)");
                    $stmt->execute([$title, $role, $videoUrl, $sortOrder, $isActive]);
                    $message = 'Video added!';
                }
                header('Location: ' . BASE_PATH . '/admin/life.php?msg=video_saved');
                exit;
                $messageType = 'success';
            }
        } elseif ($action === 'delete_video') {
            $videoId = intval($_POST['video_id'] ?? 0);
            $pdo->prepare("DELETE FROM life_videos WHERE video_id=?")->execute([$videoId]);
            header('Location: ' . BASE_PATH . '/admin/life.php?msg=video_deleted');
            exit;
        }
    } catch (Exception $e) {
        $message = 'Error: ' . $e->getMessage();
        $messageType = 'error';
    }
}

$eoms = $pdo->query("SELECT * FROM employee_of_month ORDER BY eom_id DESC")->fetchAll();
$videos = $pdo->query("SELECT * FROM life_videos ORDER BY sort_order ASC, video_id DESC")->fetchAll();

$editEom = null;
if (isset($_GET['edit_eom'])) {
    $stmt = $pdo->prepare("SELECT * FROM employee_of_month WHERE eom_id = ?");
    $stmt->execute([intval($_GET['edit_eom'])]);
    $editEom = $stmt->fetch();
}

$editVideo = null;
if (isset($_GET['edit_video'])) {
    $stmt = $pdo->prepare("SELECT * FROM life_videos WHERE video_id = ?");
    $stmt->execute([intval($_GET['edit_video'])]);
    $editVideo = $stmt->fetch();
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="flex min-h-[calc(100vh-56px)] bg-surface-2">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 dashboard-content-area">
        <div class="p-4 sm:p-6 lg:p-8">

            <div class="mb-6">
                <h1 class="text-2xl font-bold text-ink"><i class="fas fa-heart text-primary-500 mr-2"></i>Life at KS Manager</h1>
                <p class="text-sm text-ink-muted mt-1">Manage Employee of the Month and Videos for the Life at KS page.</p>
            </div>

            <?php if ($message): ?>
            <div class="mb-6 p-4 rounded-xl border <?= $messageType === 'success' ? 'bg-green-500/10 border-green-200 text-green-800' : 'bg-red-500/10 border-red-500/20 text-red-400' ?>">
                <i class="fas <?= $messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle' ?> mr-2"></i>
                <?= $message ?>
            </div>
            <?php endif; ?>

            <!-- EOM Section -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6 mb-8">
                <h2 class="text-lg font-semibold text-ink mb-4 border-b border-hairline pb-2">Employee of the Month</h2>
                
                <form method="POST" class="mb-6">
                    <input type="hidden" name="action" value="save_eom">
                    <?php if ($editEom): ?><input type="hidden" name="eom_id" value="<?= $editEom['eom_id'] ?>"><?php endif; ?>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Name *</label>
                            <input type="text" name="name" required value="<?= htmlspecialchars($editEom['name'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Designation</label>
                            <input type="text" name="designation" value="<?= htmlspecialchars($editEom['designation'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Month & Year</label>
                            <input type="text" name="month_year" placeholder="e.g. March 2024" value="<?= htmlspecialchars($editEom['month_year'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Photo URL</label>
                            <input type="url" name="photo_url" value="<?= htmlspecialchars($editEom['photo_url'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-ink-muted mb-1">Description <span class="text-xs text-ink-muted">(Plain text)</span></label>
                        <textarea name="description" rows="3" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"><?= htmlspecialchars($editEom['description'] ?? '', ENT_QUOTES, 'UTF-8', false) ?></textarea>
                    </div>
                    <div class="flex items-center gap-3">
                        <input type="checkbox" name="is_active" value="1" <?= ($editEom['is_active'] ?? 1) ? 'checked' : '' ?> class="rounded border-hairline bg-surface-2 text-ink text-primary-600">
                        <label class="text-sm font-medium text-ink-muted">Active</label>
                    </div>
                    <div class="mt-4 flex gap-2">
                        <button type="submit" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition"><?= $editEom ? 'Update' : 'Add' ?> EOM</button>
                        <?php if ($editEom): ?><a href="<?= BASE_PATH ?>/admin/life.php" class="bg-surface-2 px-6 py-2 rounded-lg text-sm font-medium border border-hairline transition">Cancel</a><?php endif; ?>
                    </div>
                </form>

                <?php if (!empty($eoms)): ?>
                <div class="divide-y divide-hairline border-t border-hairline mt-4">
                    <?php foreach ($eoms as $eom): ?>
                    <div class="py-3 flex items-center justify-between">
                        <div>
                            <p class="font-semibold text-sm text-ink"><?= htmlspecialchars($eom['name'], ENT_QUOTES, 'UTF-8', false) ?> <span class="text-xs text-ink-muted font-normal ml-2"><?= htmlspecialchars($eom['month_year'], ENT_QUOTES, 'UTF-8', false) ?></span></p>
                            <p class="text-xs text-ink-muted"><?= htmlspecialchars($eom['designation'], ENT_QUOTES, 'UTF-8', false) ?></p>
                        </div>
                        <div class="flex gap-2">
                            <a href="?edit_eom=<?= $eom['eom_id'] ?>" class="text-primary-600 text-sm p-2 hover:bg-primary-50 rounded-lg"><i class="fas fa-edit"></i></a>
                            <form method="POST" onsubmit="return confirm('Delete?')" class="inline">
                                <input type="hidden" name="action" value="delete_eom">
                                <input type="hidden" name="eom_id" value="<?= $eom['eom_id'] ?>">
                                <button type="submit" class="text-red-600 text-sm p-2 hover:bg-red-500/10 rounded-lg"><i class="fas fa-trash"></i></button>
                            </form>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>
            </div>

            <!-- Videos Section -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6">
                <h2 class="text-lg font-semibold text-ink mb-4 border-b border-hairline pb-2">Videos</h2>
                
                <form method="POST" class="mb-6">
                    <input type="hidden" name="action" value="save_video">
                    <?php if ($editVideo): ?><input type="hidden" name="video_id" value="<?= $editVideo['video_id'] ?>"><?php endif; ?>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Video Title *</label>
                            <input type="text" name="title" required value="<?= htmlspecialchars($editVideo['title'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Subtitle / Role</label>
                            <input type="text" name="role" value="<?= htmlspecialchars($editVideo['role'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-ink-muted mb-1">Video URL (YouTube/Vimeo embed link)</label>
                            <input type="url" name="video_url" value="<?= htmlspecialchars($editVideo['video_url'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <input type="checkbox" name="is_active" value="1" <?= ($editVideo['is_active'] ?? 1) ? 'checked' : '' ?> class="rounded border-hairline bg-surface-2 text-ink text-primary-600">
                        <label class="text-sm font-medium text-ink-muted mr-4">Active</label>
                        
                        <label class="text-sm font-medium text-ink-muted mr-2">Sort Order</label>
                        <input type="number" name="sort_order" value="<?= intval($editVideo['sort_order'] ?? 0) ?>" class="w-20 border border-hairline bg-surface-2 text-ink rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-primary-500">
                    </div>
                    <div class="mt-4 flex gap-2">
                        <button type="submit" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition"><?= $editVideo ? 'Update' : 'Add' ?> Video</button>
                        <?php if ($editVideo): ?><a href="<?= BASE_PATH ?>/admin/life.php" class="bg-surface-2 px-6 py-2 rounded-lg text-sm font-medium border border-hairline transition">Cancel</a><?php endif; ?>
                    </div>
                </form>

                <?php if (!empty($videos)): ?>
                <div class="divide-y divide-hairline border-t border-hairline mt-4">
                    <?php foreach ($videos as $vid): ?>
                    <div class="py-3 flex items-center justify-between">
                        <div>
                            <p class="font-semibold text-sm text-ink"><?= htmlspecialchars($vid['title'], ENT_QUOTES, 'UTF-8', false) ?></p>
                            <p class="text-xs text-ink-muted"><?= htmlspecialchars($vid['role'], ENT_QUOTES, 'UTF-8', false) ?></p>
                        </div>
                        <div class="flex gap-2">
                            <a href="?edit_video=<?= $vid['video_id'] ?>" class="text-primary-600 text-sm p-2 hover:bg-primary-50 rounded-lg"><i class="fas fa-edit"></i></a>
                            <form method="POST" onsubmit="return confirm('Delete?')" class="inline">
                                <input type="hidden" name="action" value="delete_video">
                                <input type="hidden" name="video_id" value="<?= $vid['video_id'] ?>">
                                <button type="submit" class="text-red-600 text-sm p-2 hover:bg-red-500/10 rounded-lg"><i class="fas fa-trash"></i></button>
                            </form>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>
            </div>

        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
