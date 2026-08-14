<?php
$pageTitle = 'FAQ Manager';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireAdmin();
$pdo = getDBConnection();
$message = '';
$messageType = '';

// Auto-create faqs table
$pdo->exec("CREATE TABLE IF NOT EXISTS faqs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// Ensure all columns exist (migration for older schema)
try { $pdo->exec("ALTER TABLE faqs ADD COLUMN category VARCHAR(100) NOT NULL DEFAULT 'General'"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE faqs ADD COLUMN sort_order INT DEFAULT 0"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE faqs ADD COLUMN is_active BOOLEAN DEFAULT TRUE"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE faqs ADD COLUMN created_by VARCHAR(50) NULL"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE faqs ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"); } catch (Exception $e) {}

$faqIdColumn = 'id';
try {
    $faqColumns = $pdo->query("SHOW COLUMNS FROM faqs")->fetchAll(PDO::FETCH_COLUMN);
    if (in_array('faq_id', $faqColumns, true)) {
        $faqIdColumn = 'faq_id';
    }
} catch (Exception $e) {}

$categories = ['General', 'Teaching Expert', 'Intern', 'Campus Saarthi', 'Vendor', 'Application', 'Policy'];

// Handle POST actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    try {
        switch ($action) {
            case 'create_faq':
                $question = sanitize($_POST['question'] ?? '');
                $answer = $_POST['answer'] ?? '';
                $category = sanitize($_POST['category'] ?? 'General');
                $sortOrder = intval($_POST['sort_order'] ?? 0);

                if (empty($question) || empty($answer)) {
                    $message = 'Question and answer are required.';
                    $messageType = 'error';
                } else {
                    $stmt = $pdo->prepare("INSERT INTO faqs (question, answer, category, sort_order, is_active, created_by) VALUES (?, ?, ?, ?, 1, ?)");
                    $stmt->execute([$question, $answer, $category, $sortOrder, $_SESSION['user_id']]);
                    logActivity($_SESSION['user_id'], 'faq_created', "Created FAQ: $question");
                    header('Location: ' . BASE_PATH . '/admin/faq.php?msg=created');
                    exit;
                }
                break;

            case 'update_faq':
                $faqId = intval($_POST['id'] ?? 0);
                $question = sanitize($_POST['question'] ?? '');
                $answer = $_POST['answer'] ?? '';
                $category = sanitize($_POST['category'] ?? 'General');
                $sortOrder = intval($_POST['sort_order'] ?? 0);
                $isActive = isset($_POST['is_active']) ? 1 : 0;

                if (!$faqId || empty($question) || empty($answer)) {
                    $message = 'Question and answer are required.';
                    $messageType = 'error';
                } else {
                    $stmt = $pdo->prepare("UPDATE faqs SET question=?, answer=?, category=?, sort_order=?, is_active=? WHERE {$faqIdColumn}=?");
                    $stmt->execute([$question, $answer, $category, $sortOrder, $isActive, $faqId]);
                    logActivity($_SESSION['user_id'], 'faq_updated', "Updated FAQ #$faqId");
                    header('Location: ' . BASE_PATH . '/admin/faq.php?msg=updated');
                    exit;
                }
                break;

            case 'delete_faq':
                $faqId = intval($_POST['id'] ?? 0);
                if ($faqId) {
                    $stmt = $pdo->prepare("SELECT question FROM faqs WHERE {$faqIdColumn} = ?");
                    $stmt->execute([$faqId]);
                    $faq = $stmt->fetch();
                    $pdo->prepare("DELETE FROM faqs WHERE {$faqIdColumn} = ?")->execute([$faqId]);
                    logActivity($_SESSION['user_id'], 'faq_deleted', "Deleted FAQ #$faqId");
                    header('Location: ' . BASE_PATH . '/admin/faq.php?msg=deleted');
                    exit;
                }
                break;

            case 'toggle_faq':
                $faqId = intval($_POST['id'] ?? 0);
                if ($faqId) {
                    $pdo->prepare("UPDATE faqs SET is_active = NOT is_active WHERE {$faqIdColumn} = ?")->execute([$faqId]);
                    $message = 'FAQ visibility toggled!';
                    $messageType = 'success';
                }
                break;
        }
    } catch (Exception $e) {
        $message = 'Error: ' . $e->getMessage();
        $messageType = 'error';
    }
}

// Handle GET messages
if (isset($_GET['msg'])) {
    if ($_GET['msg'] === 'created') {
        $message = 'FAQ created successfully!';
        $messageType = 'success';
    } elseif ($_GET['msg'] === 'updated') {
        $message = 'FAQ updated successfully!';
        $messageType = 'success';
    } elseif ($_GET['msg'] === 'deleted') {
        $message = 'FAQ deleted successfully!';
        $messageType = 'success';
    }
}

// Filter by category
$filterCategory = $_GET['category'] ?? '';

// Fetch FAQs
if ($filterCategory && in_array($filterCategory, $categories)) {
    $stmt = $pdo->prepare("SELECT {$faqIdColumn} AS id, question, answer, category, sort_order, is_active, created_by, created_at, updated_at FROM faqs WHERE category = ? ORDER BY sort_order ASC, created_at ASC");
    $stmt->execute([$filterCategory]);
    $faqs = $stmt->fetchAll();
} else {
    $faqs = $pdo->query("SELECT {$faqIdColumn} AS id, question, answer, category, sort_order, is_active, created_by, created_at, updated_at FROM faqs ORDER BY sort_order ASC, created_at ASC")->fetchAll();
}

// Category counts
$categoryCounts = [];
$countStmt = $pdo->query("SELECT category, COUNT(*) as cnt FROM faqs GROUP BY category");
while ($row = $countStmt->fetch()) {
    $categoryCounts[$row['category']] = $row['cnt'];
}

// Check if editing
$editFaq = null;
if (isset($_GET['edit'])) {
    $stmt = $pdo->prepare("SELECT {$faqIdColumn} AS id, question, answer, category, sort_order, is_active, created_by, created_at, updated_at FROM faqs WHERE {$faqIdColumn} = ?");
    $stmt->execute([intval($_GET['edit'])]);
    $editFaq = $stmt->fetch();
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
                    <h1 class="text-2xl font-bold text-ink"><i class="fas fa-question-circle text-primary-500 mr-2"></i>FAQ Manager</h1>
                    <p class="text-sm text-ink-muted mt-1">Create and manage frequently asked questions for all users.</p>
                </div>
                <div class="mt-3 sm:mt-0">
                    <span class="text-sm text-ink-muted"><?= count($faqs) ?> FAQs <?= $filterCategory ? "in \"$filterCategory\"" : 'total' ?></span>
                </div>
            </div>

            <?php if ($message): ?>
            <div class="mb-6 p-4 rounded-xl border <?= $messageType === 'success' ? 'bg-green-500/10 border-green-200 text-green-800' : 'bg-red-500/10 border-red-500/20 text-red-400' ?>">
                <i class="fas <?= $messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle' ?> mr-2"></i>
                <?= $message ?>
            </div>
            <?php endif; ?>

            <!-- Category Filter Tabs -->
            <div class="flex flex-wrap gap-2 mb-6">
                <a href="<?= BASE_PATH ?>/admin/faq.php" class="px-4 py-2 rounded-lg text-sm font-medium transition <?= !$filterCategory ? 'bg-primary-600 text-white' : 'bg-surface-1 text-ink-muted border border-hairline hover:bg-surface-2' ?>">
                    All (<?= array_sum($categoryCounts) ?>)
                </a>
                <?php foreach ($categories as $cat): ?>
                <a href="<?= BASE_PATH ?>/admin/faq.php?category=<?= urlencode($cat) ?>" class="px-4 py-2 rounded-lg text-sm font-medium transition <?= $filterCategory === $cat ? 'bg-primary-600 text-white' : 'bg-surface-1 text-ink-muted border border-hairline hover:bg-surface-2' ?>">
                    <?= $cat ?> (<?= $categoryCounts[$cat] ?? 0 ?>)
                </a>
                <?php endforeach; ?>
            </div>

            <!-- Create / Edit Form -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6 mb-6">
                <h2 class="text-lg font-semibold text-ink mb-4">
                    <i class="fas <?= $editFaq ? 'fa-edit' : 'fa-plus-circle' ?> mr-2 text-primary-500"></i>
                    <?= $editFaq ? 'Edit FAQ' : 'Add New FAQ' ?>
                </h2>
                <form method="POST">
                    <input type="hidden" name="action" value="<?= $editFaq ? 'update_faq' : 'create_faq' ?>">
                    <?php if ($editFaq): ?>
                        <input type="hidden" name="id" value="<?= $editFaq['id'] ?>">
                    <?php endif; ?>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-ink-muted mb-1">Question *</label>
                            <input type="text" name="question" required value="<?= htmlspecialchars($editFaq['question'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" placeholder="e.g. How do I apply for an internship?" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Category</label>
                            <select name="category" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                <?php foreach ($categories as $cat): ?>
                                <option value="<?= $cat ?>" <?= ($editFaq['category'] ?? 'General') === $cat ? 'selected' : '' ?>><?= $cat ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-ink-muted mb-1">Answer * <span class="text-ink-muted text-xs">(Plain text, line breaks supported)</span></label>
                        <textarea name="answer" required rows="5" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"><?= htmlspecialchars($editFaq['answer'] ?? '', ENT_QUOTES, 'UTF-8', false) ?></textarea>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Sort Order</label>
                            <input type="number" name="sort_order" value="<?= intval($editFaq['sort_order'] ?? 0) ?>" min="0" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <?php if ($editFaq): ?>
                        <div class="flex items-center gap-2 pt-6">
                            <input type="checkbox" name="is_active" id="is_active" value="1" <?= ($editFaq['is_active'] ?? 1) ? 'checked' : '' ?> class="rounded border-hairline bg-surface-2 text-ink text-primary-600 focus:ring-primary-500">
                            <label for="is_active" class="text-sm font-medium text-ink-muted">Active (visible to users)</label>
                        </div>
                        <?php endif; ?>
                    </div>

                    <div class="flex items-center gap-3">
                        <button type="submit" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
                            <i class="fas <?= $editFaq ? 'fa-save' : 'fa-plus' ?> mr-1"></i>
                            <?= $editFaq ? 'Update FAQ' : 'Add FAQ' ?>
                        </button>
                        <?php if ($editFaq): ?>
                            <a href="<?= BASE_PATH ?>/admin/faq.php" class="border border-hairline bg-surface-2 text-ink hover:bg-surface-2 text-ink-muted px-6 py-2.5 rounded-lg text-sm font-medium transition">Cancel</a>
                        <?php endif; ?>
                    </div>
                </form>
            </div>

            <!-- FAQs List -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline overflow-hidden">
                <div class="px-6 py-4 border-b border-hairline">
                    <h2 class="text-lg font-semibold text-ink"><i class="fas fa-list mr-2 text-primary-500"></i>All FAQs (<?= count($faqs) ?>)</h2>
                </div>

                <?php if (empty($faqs)): ?>
                <div class="p-10 text-center">
                    <i class="fas fa-question-circle text-4xl text-ink-muted opacity-50 mb-3"></i>
                    <p class="text-ink-muted">No FAQs found. Use the form above to add your first FAQ.</p>
                </div>
                <?php else: ?>
                <div class="divide-y divide-hairline">
                    <?php foreach ($faqs as $faq): ?>
                    <div class="px-6 py-4 hover:bg-surface-2 transition">
                        <div class="flex items-start justify-between gap-4">
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"><?= htmlspecialchars($faq['category'], ENT_QUOTES, 'UTF-8', false) ?></span>
                                    <span class="text-xs text-ink-muted">Order: <?= $faq['sort_order'] ?></span>
                                    <?php if ($faq['is_active']): ?>
                                        <span class="text-xs text-green-600"><i class="fas fa-check-circle"></i> Active</span>
                                    <?php else: ?>
                                        <span class="text-xs text-ink-muted"><i class="fas fa-eye-slash"></i> Hidden</span>
                                    <?php endif; ?>
                                </div>
                                <h3 class="text-sm font-semibold text-ink"><?= htmlspecialchars($faq['question'], ENT_QUOTES, 'UTF-8', false) ?></h3>
                                <p class="text-sm text-ink-muted mt-1 line-clamp-2"><?= htmlspecialchars(strip_tags($faq['answer']), ENT_QUOTES, 'UTF-8', false) ?></p>
                            </div>
                            <div class="flex items-center gap-1 flex-shrink-0">
                                <form method="POST" class="inline">
                                    <input type="hidden" name="action" value="toggle_faq">
                                    <input type="hidden" name="id" value="<?= $faq['id'] ?>">
                                    <button type="submit" title="Toggle active" class="<?= $faq['is_active'] ? 'text-green-600 hover:text-green-800' : 'text-ink-muted hover:text-ink-muted' ?> text-sm px-2 py-1.5 rounded-lg hover:bg-surface-2 transition">
                                        <i class="fas <?= $faq['is_active'] ? 'fa-toggle-on' : 'fa-toggle-off' ?>"></i>
                                    </button>
                                </form>
                                <a href="<?= BASE_PATH ?>/admin/faq.php?edit=<?= $faq['id'] ?>" class="text-primary-600 hover:text-primary-800 text-sm px-2 py-1.5 rounded-lg hover:bg-primary-50 transition">
                                    <i class="fas fa-edit"></i>
                                </a>
                                <form method="POST" onsubmit="return confirm('Delete this FAQ?')" class="inline">
                                    <input type="hidden" name="action" value="delete_faq">
                                    <input type="hidden" name="id" value="<?= $faq['id'] ?>">
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

<?php require_once __DIR__ . '/../includes/footer.php'; ?>







