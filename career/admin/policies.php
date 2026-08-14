<?php
$pageTitle = 'Manage Policies';
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

// Create policies table if not exists
$pdo->exec("CREATE TABLE IF NOT EXISTS policies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    icon VARCHAR(50) DEFAULT 'fa-file-alt',
    icon_color VARCHAR(30) DEFAULT 'text-primary-500',
    content TEXT NOT NULL,
    applies_to VARCHAR(100) DEFAULT 'All members',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    try {
        switch ($action) {
            case 'create':
                $title = sanitize($_POST['title'] ?? '');
                $slug = strtolower(preg_replace('/[^a-z0-9]+/', '-', $title));
                $icon = sanitize($_POST['icon'] ?? 'fa-file-alt');
                $iconColor = sanitize($_POST['icon_color'] ?? 'text-primary-500');
                $content = $_POST['content'] ?? '';
                $appliesTo = sanitize($_POST['applies_to'] ?? 'All members');
                $sortOrder = intval($_POST['sort_order'] ?? 0);
                $isActive = isset($_POST['is_active']) ? 1 : 0;

                if (empty($title) || empty($content)) {
                    $message = 'Title and content are required.';
                    $messageType = 'error';
                } else {
                    $stmt = $pdo->prepare("INSERT INTO policies (title, slug, icon, icon_color, content, applies_to, sort_order, is_active, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([$title, $slug, $icon, $iconColor, $content, $appliesTo, $sortOrder, $isActive, $_SESSION['user_id']]);
                    $message = 'Policy created successfully!';
                    $messageType = 'success';
                    logActivity($_SESSION['user_id'], 'policy_created', "Created policy: $title");
                }
                break;

            case 'update':
                $policyId = intval($_POST['id'] ?? 0);
                $title = sanitize($_POST['title'] ?? '');
                $slug = strtolower(preg_replace('/[^a-z0-9]+/', '-', $title));
                $icon = sanitize($_POST['icon'] ?? 'fa-file-alt');
                $iconColor = sanitize($_POST['icon_color'] ?? 'text-primary-500');
                $content = $_POST['content'] ?? '';
                $appliesTo = sanitize($_POST['applies_to'] ?? 'All members');
                $sortOrder = intval($_POST['sort_order'] ?? 0);
                $isActive = isset($_POST['is_active']) ? 1 : 0;

                if (!$policyId || empty($title) || empty($content)) {
                    $message = 'Title and content are required.';
                    $messageType = 'error';
                } else {
                    $stmt = $pdo->prepare("UPDATE policies SET title=?, slug=?, icon=?, icon_color=?, content=?, applies_to=?, sort_order=?, is_active=? WHERE id=?");
                    $stmt->execute([$title, $slug, $icon, $iconColor, $content, $appliesTo, $sortOrder, $isActive, $policyId]);
                    $message = 'Policy updated successfully!';
                    $messageType = 'success';
                    logActivity($_SESSION['user_id'], 'policy_updated', "Updated policy #$policyId: $title");
                }
                break;

            case 'delete':
                $policyId = intval($_POST['id'] ?? 0);
                if ($policyId) {
                    $stmt = $pdo->prepare("SELECT title FROM policies WHERE id = ?");
                    $stmt->execute([$policyId]);
                    $pol = $stmt->fetch();
                    $pdo->prepare("DELETE FROM policies WHERE id = ?")->execute([$policyId]);
                    $message = 'Policy "' . htmlspecialchars($pol['title'] ?? '', ENT_QUOTES, 'UTF-8', false) . '" deleted!';
                    $messageType = 'success';
                    logActivity($_SESSION['user_id'], 'policy_deleted', "Deleted policy #$policyId");
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

// Fetch all policies
$policies = $pdo->query("SELECT * FROM policies ORDER BY sort_order ASC, created_at ASC")->fetchAll();

// Check if editing
$editPolicy = null;
if (isset($_GET['edit'])) {
    $stmt = $pdo->prepare("SELECT * FROM policies WHERE id = ?");
    $stmt->execute([intval($_GET['edit'])]);
    $editPolicy = $stmt->fetch();
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
                    <h1 class="text-2xl font-bold text-ink">Manage Policies</h1>
                    <p class="text-sm text-ink-muted mt-1">Create, edit, and delete company policies. These appear on the public Policy page.</p>
                </div>
                <div class="mt-3 sm:mt-0">
                    <span class="text-sm text-ink-muted"><?= count($policies) ?> policies total</span>
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
                    <i class="fas <?= $editPolicy ? 'fa-edit' : 'fa-plus-circle' ?> mr-2 text-primary-500"></i>
                    <?= $editPolicy ? 'Edit Policy' : 'Create New Policy' ?>
                </h2>
                <form method="POST">
                    <input type="hidden" name="action" value="<?= $editPolicy ? 'update' : 'create' ?>">
                    <?php if ($editPolicy): ?>
                        <input type="hidden" name="id" value="<?= $editPolicy['id'] ?>">
                    <?php endif; ?>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Policy Title *</label>
                            <input type="text" name="title" required value="<?= htmlspecialchars($editPolicy['title'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" placeholder="e.g. Leave Policy" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Applies To</label>
                            <input type="text" name="applies_to" value="<?= htmlspecialchars($editPolicy['applies_to'] ?? 'All members', ENT_QUOTES, 'UTF-8', false) ?>" placeholder="e.g. All employees & interns" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Icon <span class="text-ink-muted text-xs">(FontAwesome class)</span></label>
                            <select name="icon" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                <?php
                                $icons = [
                                    'fa-calendar-alt' => 'Calendar (Leave)',
                                    'fa-home' => 'Home (WFH)',
                                    'fa-balance-scale' => 'Scale (Code of Conduct)',
                                    'fa-hand-paper' => 'Hand (Anti-Harassment)',
                                    'fa-lock' => 'Lock (Confidentiality)',
                                    'fa-handshake' => 'Handshake (Vendor)',
                                    'fa-book-reader' => 'Book (Internship)',
                                    'fa-graduation-cap' => 'Cap (Saarthi)',
                                    'fa-database' => 'Database (Data/Privacy)',
                                    'fa-bullhorn' => 'Bullhorn (Grievance)',
                                    'fa-laptop' => 'Laptop (IT/Device)',
                                    'fa-door-open' => 'Door (Exit/Resignation)',
                                    'fa-shield-alt' => 'Shield (Security)',
                                    'fa-file-alt' => 'File (General)',
                                    'fa-users' => 'Users (Team)',
                                    'fa-gavel' => 'Gavel (Legal)',
                                ];
                                foreach ($icons as $val => $label):
                                ?>
                                <option value="<?= $val ?>" <?= ($editPolicy['icon'] ?? 'fa-file-alt') === $val ? 'selected' : '' ?>><i class="fas <?= $val ?>"></i> <?= $label ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Icon Color</label>
                            <select name="icon_color" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                <?php
                                $colors = ['text-green-400'=>'Green','text-blue-500'=>'Blue','text-indigo-500'=>'Indigo','text-red-400'=>'Red','text-amber-500'=>'Amber','text-purple-500'=>'Purple','text-cyan-500'=>'Cyan','text-pink-500'=>'Pink','text-teal-500'=>'Teal','text-orange-500'=>'Orange','text-ink-muted'=>'Gray','text-rose-500'=>'Rose'];
                                foreach ($colors as $val => $label):
                                ?>
                                <option value="<?= $val ?>" <?= ($editPolicy['icon_color'] ?? 'text-primary-500') === $val ? 'selected' : '' ?>><?= $label ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Sort Order</label>
                            <input type="number" name="sort_order" value="<?= intval($editPolicy['sort_order'] ?? count($policies) + 1) ?>" min="0" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div class="flex items-center gap-2 pt-6">
                            <input type="checkbox" name="is_active" id="is_active" value="1" <?= ($editPolicy['is_active'] ?? 1) ? 'checked' : '' ?> class="rounded border-hairline bg-surface-2 text-ink text-primary-600 focus:ring-primary-500">
                            <label for="is_active" class="text-sm font-medium text-ink-muted">Active (visible on public page)</label>
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-ink-muted mb-1">Policy Content * <span class="text-ink-muted text-xs">(Plain text, line breaks supported)</span></label>
                        <textarea name="content" required rows="12" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono"><?= htmlspecialchars($editPolicy['content'] ?? '', ENT_QUOTES, 'UTF-8', false) ?></textarea>
                    </div>

                    <div class="flex items-center gap-3">
                        <button type="submit" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
                            <i class="fas <?= $editPolicy ? 'fa-save' : 'fa-plus' ?> mr-1"></i>
                            <?= $editPolicy ? 'Update Policy' : 'Create Policy' ?>
                        </button>
                        <?php if ($editPolicy): ?>
                            <a href="<?= BASE_PATH ?>/admin/policies.php" class="border border-hairline bg-surface-2 text-ink hover:bg-surface-2 text-ink-muted px-6 py-2.5 rounded-lg text-sm font-medium transition">Cancel</a>
                        <?php endif; ?>
                    </div>
                </form>
            </div>

            <!-- Existing Policies List -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline overflow-hidden">
                <div class="px-6 py-4 border-b border-hairline">
                    <h2 class="text-lg font-semibold text-ink"><i class="fas fa-list mr-2 text-primary-500"></i>All Policies (<?= count($policies) ?>)</h2>
                </div>

                <?php if (empty($policies)): ?>
                <div class="p-10 text-center">
                    <i class="fas fa-file-alt text-4xl text-ink-muted opacity-50 mb-3"></i>
                    <p class="text-ink-muted">No policies created yet. Use the form above to add your first policy.</p>
                </div>
                <?php else: ?>
                <div class="divide-y divide-hairline">
                    <?php foreach ($policies as $i => $pol): ?>
                    <div class="px-6 py-4 flex items-center justify-between hover:bg-surface-2 transition">
                        <div class="flex items-center gap-4 flex-1 min-w-0">
                            <div class="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0">
                                <i class="fas <?= htmlspecialchars($pol['icon'], ENT_QUOTES, 'UTF-8', false) ?> <?= htmlspecialchars($pol['icon_color'], ENT_QUOTES, 'UTF-8', false) ?>"></i>
                            </div>
                            <div class="min-w-0">
                                <h3 class="text-sm font-semibold text-ink truncate"><?= htmlspecialchars($pol['title'], ENT_QUOTES, 'UTF-8', false) ?></h3>
                                <p class="text-xs text-ink-muted">
                                    Applies to: <?= htmlspecialchars($pol['applies_to'], ENT_QUOTES, 'UTF-8', false) ?> &middot;
                                    Order: <?= $pol['sort_order'] ?> &middot;
                                    <?php if ($pol['is_active']): ?>
                                        <span class="text-green-600"><i class="fas fa-check-circle"></i> Active</span>
                                    <?php else: ?>
                                        <span class="text-ink-muted"><i class="fas fa-eye-slash"></i> Hidden</span>
                                    <?php endif; ?>
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 flex-shrink-0 ml-4">
                            <a href="<?= BASE_PATH ?>/admin/policies.php?edit=<?= $pol['id'] ?>" class="text-primary-600 hover:text-primary-800 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-primary-50 transition">
                                <i class="fas fa-edit mr-1"></i>Edit
                            </a>
                            <form method="POST" onsubmit="return confirm('Delete policy: <?= htmlspecialchars(addslashes($pol['title']), ENT_QUOTES, 'UTF-8', false) ?>?')" class="inline">
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="id" value="<?= $pol['id'] ?>">
                                <button type="submit" class="text-red-600 hover:text-red-400 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition">
                                    <i class="fas fa-trash mr-1"></i>Delete
                                </button>
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







