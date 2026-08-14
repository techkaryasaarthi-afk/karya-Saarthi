<?php
$pageTitle = 'Testimonials Manager';
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

// Auto-create testimonials table
$pdo->exec("CREATE TABLE IF NOT EXISTS testimonials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    designation VARCHAR(200),
    quote TEXT NOT NULL,
    photo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// Ensure columns exist (migration for older schema)
try { $pdo->exec("ALTER TABLE testimonials ADD COLUMN designation VARCHAR(200) NULL"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE testimonials ADD COLUMN photo_url VARCHAR(500) NULL"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE testimonials ADD COLUMN sort_order INT DEFAULT 0"); } catch (Exception $e) {}

$testimonialIdColumn = 'id';
try {
    $testimonialColumns = $pdo->query("SHOW COLUMNS FROM testimonials")->fetchAll(PDO::FETCH_COLUMN);
    if (in_array('testimonial_id', $testimonialColumns, true)) {
        $testimonialIdColumn = 'testimonial_id';
    }
} catch (Exception $e) {}

// Handle POST actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    try {
        switch ($action) {
            case 'create_testimonial':
                $name = sanitize($_POST['name'] ?? '');
                $designation = sanitize($_POST['designation'] ?? '');
                $quote = sanitize($_POST['quote'] ?? '');
                $photoUrl = sanitize($_POST['photo_url'] ?? '');
                $sortOrder = intval($_POST['sort_order'] ?? 0);

                if (empty($name) || empty($quote)) {
                    $message = 'Name and quote are required.';
                    $messageType = 'error';
                } else {
                    $stmt = $pdo->prepare("INSERT INTO testimonials (name, designation, quote, photo_url, sort_order) VALUES (?, ?, ?, ?, ?)");
                    $stmt->execute([$name, $designation, $quote, $photoUrl, $sortOrder]);
                    $message = 'Testimonial added successfully!';
                    $messageType = 'success';
                    logActivity($_SESSION['user_id'], 'testimonial_created', "Added testimonial from: $name");
                }
                break;

            case 'update_testimonial':
                $testimonialId = intval($_POST['id'] ?? 0);
                $name = sanitize($_POST['name'] ?? '');
                $designation = sanitize($_POST['designation'] ?? '');
                $quote = sanitize($_POST['quote'] ?? '');
                $photoUrl = sanitize($_POST['photo_url'] ?? '');
                $sortOrder = intval($_POST['sort_order'] ?? 0);
                $isActive = isset($_POST['is_active']) ? 1 : 0;

                if (!$testimonialId || empty($name) || empty($quote)) {
                    $message = 'Name and quote are required.';
                    $messageType = 'error';
                } else {
                    $stmt = $pdo->prepare("UPDATE testimonials SET name=?, designation=?, quote=?, photo_url=?, sort_order=?, is_active=? WHERE {$testimonialIdColumn}=?");
                    $stmt->execute([$name, $designation, $quote, $photoUrl, $sortOrder, $isActive, $testimonialId]);
                    $message = 'Testimonial updated successfully!';
                    $messageType = 'success';
                    logActivity($_SESSION['user_id'], 'testimonial_updated', "Updated testimonial #$testimonialId");
                }
                break;

            case 'delete_testimonial':
                $testimonialId = intval($_POST['id'] ?? 0);
                if ($testimonialId) {
                    $stmt = $pdo->prepare("SELECT name FROM testimonials WHERE {$testimonialIdColumn} = ?");
                    $stmt->execute([$testimonialId]);
                    $test = $stmt->fetch();
                    $pdo->prepare("DELETE FROM testimonials WHERE {$testimonialIdColumn} = ?")->execute([$testimonialId]);
                    $message = 'Testimonial from "' . htmlspecialchars($test['name'] ?? '', ENT_QUOTES, 'UTF-8', false) . '" deleted!';
                    $messageType = 'success';
                    logActivity($_SESSION['user_id'], 'testimonial_deleted', "Deleted testimonial #$testimonialId");
                }
                break;

            case 'toggle_testimonial':
                $testimonialId = intval($_POST['id'] ?? 0);
                if ($testimonialId) {
                    $pdo->prepare("UPDATE testimonials SET is_active = NOT is_active WHERE {$testimonialIdColumn} = ?")->execute([$testimonialId]);
                    $message = 'Testimonial visibility toggled!';
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

// Fetch all testimonials
$testimonials = $pdo->query("SELECT {$testimonialIdColumn} AS id, name, designation, quote, photo_url, is_active, sort_order, created_at FROM testimonials ORDER BY sort_order ASC, created_at DESC")->fetchAll();

// Check if editing
$editTest = null;
if (isset($_GET['edit'])) {
    $stmt = $pdo->prepare("SELECT {$testimonialIdColumn} AS id, name, designation, quote, photo_url, is_active, sort_order, created_at FROM testimonials WHERE {$testimonialIdColumn} = ?");
    $stmt->execute([intval($_GET['edit'])]);
    $editTest = $stmt->fetch();
}

// Helper: get initials from name
function getInitials($name) {
    $parts = explode(' ', trim($name));
    $initials = '';
    foreach ($parts as $part) {
        if (!empty($part)) $initials .= strtoupper($part[0]);
    }
    return substr($initials, 0, 2);
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
                    <h1 class="text-2xl font-bold text-ink"><i class="fas fa-quote-left text-primary-500 mr-2"></i>Testimonials Manager</h1>
                    <p class="text-sm text-ink-muted mt-1">Manage employee testimonials displayed on the Life at KS page.</p>
                </div>
                <div class="mt-3 sm:mt-0">
                    <span class="text-sm text-ink-muted"><?= count($testimonials) ?> testimonials total</span>
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
                    <i class="fas <?= $editTest ? 'fa-edit' : 'fa-plus-circle' ?> mr-2 text-primary-500"></i>
                    <?= $editTest ? 'Edit Testimonial' : 'Add Testimonial' ?>
                </h2>
                <form method="POST">
                    <input type="hidden" name="action" value="<?= $editTest ? 'update_testimonial' : 'create_testimonial' ?>">
                    <?php if ($editTest): ?>
                        <input type="hidden" name="id" value="<?= $editTest['id'] ?>">
                    <?php endif; ?>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Name *</label>
                            <input type="text" name="name" required value="<?= htmlspecialchars($editTest['name'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" placeholder="e.g. Priya Sharma" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Designation <span class="text-ink-muted text-xs">(optional)</span></label>
                            <input type="text" name="designation" value="<?= htmlspecialchars($editTest['designation'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" placeholder="e.g. Senior Teaching Expert, Delhi" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-ink-muted mb-1">Quote *</label>
                        <textarea name="quote" required rows="4" placeholder="What the employee said about working at Karya Saarthi..." class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"><?= htmlspecialchars($editTest['quote'] ?? '', ENT_QUOTES, 'UTF-8', false) ?></textarea>
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-ink-muted mb-1">Photo URL <span class="text-ink-muted text-xs">(optional — if empty, initials will be shown)</span></label>
                        <input type="url" name="photo_url" value="<?= htmlspecialchars($editTest['photo_url'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" placeholder="https://example.com/photos/priya.jpg" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Sort Order</label>
                            <input type="number" name="sort_order" value="<?= intval($editTest['sort_order'] ?? 0) ?>" min="0" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <?php if ($editTest): ?>
                        <div class="flex items-center gap-2 pt-6">
                            <input type="checkbox" name="is_active" id="is_active" value="1" <?= ($editTest['is_active'] ?? 1) ? 'checked' : '' ?> class="rounded border-hairline bg-surface-2 text-ink text-primary-600 focus:ring-primary-500">
                            <label for="is_active" class="text-sm font-medium text-ink-muted">Active (visible on site)</label>
                        </div>
                        <?php endif; ?>
                    </div>

                    <div class="flex items-center gap-3">
                        <button type="submit" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
                            <i class="fas <?= $editTest ? 'fa-save' : 'fa-plus' ?> mr-1"></i>
                            <?= $editTest ? 'Update Testimonial' : 'Add Testimonial' ?>
                        </button>
                        <?php if ($editTest): ?>
                            <a href="<?= BASE_PATH ?>/admin/testimonials.php" class="border border-hairline bg-surface-2 text-ink hover:bg-surface-2 text-ink-muted px-6 py-2.5 rounded-lg text-sm font-medium transition">Cancel</a>
                        <?php endif; ?>
                    </div>
                </form>
            </div>

            <!-- Testimonials List -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline overflow-hidden">
                <div class="px-6 py-4 border-b border-hairline">
                    <h2 class="text-lg font-semibold text-ink"><i class="fas fa-comments mr-2 text-primary-500"></i>All Testimonials (<?= count($testimonials) ?>)</h2>
                </div>

                <?php if (empty($testimonials)): ?>
                <div class="p-10 text-center">
                    <i class="fas fa-quote-left text-4xl text-ink-muted opacity-50 mb-3"></i>
                    <p class="text-ink-muted">No testimonials yet. Add your first one using the form above.</p>
                </div>
                <?php else: ?>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                    <?php foreach ($testimonials as $test): ?>
                    <div class="border border-hairline rounded-xl p-5 hover:shadow-md transition <?= !$test['is_active'] ? 'opacity-60' : '' ?>">
                        <div class="flex items-start gap-4">
                            <!-- Avatar -->
                            <?php if (!empty($test['photo_url'])): ?>
                            <img src="<?= htmlspecialchars($test['photo_url'], ENT_QUOTES, 'UTF-8', false) ?>" alt="<?= htmlspecialchars($test['name'], ENT_QUOTES, 'UTF-8', false) ?>" class="w-12 h-12 rounded-full object-cover flex-shrink-0" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
                            <div class="w-12 h-12 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm items-center justify-center flex-shrink-0 hidden">
                                <?= getInitials($test['name']) ?>
                            </div>
                            <?php else: ?>
                            <div class="w-12 h-12 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm flex items-center justify-center flex-shrink-0">
                                <?= getInitials($test['name']) ?>
                            </div>
                            <?php endif; ?>
                            <!-- Content -->
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-1">
                                    <?php if ($test['is_active']): ?>
                                        <span class="text-xs text-green-600"><i class="fas fa-check-circle"></i> Active</span>
                                    <?php else: ?>
                                        <span class="text-xs text-ink-muted"><i class="fas fa-eye-slash"></i> Hidden</span>
                                    <?php endif; ?>
                                    <span class="text-xs text-ink-muted">Order: <?= $test['sort_order'] ?></span>
                                </div>
                                <h3 class="text-sm font-semibold text-ink"><?= htmlspecialchars($test['name'], ENT_QUOTES, 'UTF-8', false) ?></h3>
                                <?php if (!empty($test['designation'])): ?>
                                <p class="text-xs text-ink-muted"><?= htmlspecialchars($test['designation'], ENT_QUOTES, 'UTF-8', false) ?></p>
                                <?php endif; ?>
                                <p class="text-sm text-ink-muted mt-2 line-clamp-3 italic">"<?= htmlspecialchars($test['quote'], ENT_QUOTES, 'UTF-8', false) ?>"</p>
                            </div>
                        </div>
                        <!-- Actions -->
                        <div class="flex items-center gap-1 mt-4 pt-3 border-t border-hairline">
                            <form method="POST" class="inline">
                                <input type="hidden" name="action" value="toggle_testimonial">
                                <input type="hidden" name="id" value="<?= $test['id'] ?>">
                                <button type="submit" title="Toggle active" class="<?= $test['is_active'] ? 'text-green-600 hover:text-green-800' : 'text-ink-muted hover:text-ink-muted' ?> text-sm px-2 py-1.5 rounded-lg hover:bg-surface-2 transition">
                                    <i class="fas <?= $test['is_active'] ? 'fa-toggle-on' : 'fa-toggle-off' ?>"></i>
                                </button>
                            </form>
                            <a href="<?= BASE_PATH ?>/admin/testimonials.php?edit=<?= $test['id'] ?>" class="text-primary-600 hover:text-primary-800 text-sm px-2 py-1.5 rounded-lg hover:bg-primary-50 transition">
                                <i class="fas fa-edit"></i>
                            </a>
                            <form method="POST" onsubmit="return confirm('Delete this testimonial?')" class="inline">
                                <input type="hidden" name="action" value="delete_testimonial">
                                <input type="hidden" name="id" value="<?= $test['id'] ?>">
                                <button type="submit" class="text-red-600 hover:text-red-400 text-sm px-2 py-1.5 rounded-lg hover:bg-red-500/10 transition">
                                    <i class="fas fa-trash"></i>
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






