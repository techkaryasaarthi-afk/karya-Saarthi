<?php
$pageTitle = 'Gallery Manager';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireAdmin();
$pdo = getDBConnection();
$message = '';
$messageType = '';

// Auto-create gallery table
$pdo->exec("CREATE TABLE IF NOT EXISTS gallery (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    category ENUM('team','events','office','celebrations','awards') DEFAULT 'team',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    uploaded_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$categories = [
    'team' => 'Team',
    'events' => 'Events',
    'office' => 'Office',
    'celebrations' => 'Celebrations',
    'awards' => 'Awards',
];

// Ensure upload directory exists
$uploadDir = __DIR__ . '/../uploads/gallery/';
if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0755, true);
}

// Handle file upload helper
function handleGalleryUpload($fileInput, $uploadDir) {
    if (!isset($_FILES[$fileInput]) || $_FILES[$fileInput]['error'] === UPLOAD_ERR_NO_FILE) {
        return null; // no file uploaded
    }
    $file = $_FILES[$fileInput];
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['error' => 'Upload failed (error code: ' . $file['error'] . ')'];
    }
    // Validate type
    $allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    if (!in_array($mime, $allowed)) {
        return ['error' => 'Invalid file type. Allowed: JPG, PNG, GIF, WebP, SVG'];
    }
    // Validate size (max 5MB)
    if ($file['size'] > 5 * 1024 * 1024) {
        return ['error' => 'File too large. Maximum 5MB allowed.'];
    }
    // Generate unique filename
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION) ?: 'jpg';
    $filename = 'gallery_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . strtolower($ext);
    $dest = $uploadDir . $filename;
    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        return ['error' => 'Failed to save uploaded file.'];
    }
    return ['url' => '/uploads/gallery/' . $filename, 'path' => $dest];
}

// Handle POST actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    try {
        switch ($action) {
            case 'create_image':
                $title = sanitize($_POST['title'] ?? '');
                $description = sanitize($_POST['description'] ?? '');
                $category = sanitize($_POST['category'] ?? 'team');
                $sortOrder = intval($_POST['sort_order'] ?? 0);

                // Try file upload first, then URL
                $imageUrl = '';
                $uploadResult = handleGalleryUpload('image_file', $uploadDir);
                if ($uploadResult && isset($uploadResult['error'])) {
                    $message = $uploadResult['error'];
                    $messageType = 'error';
                    break;
                } elseif ($uploadResult && isset($uploadResult['url'])) {
                    $imageUrl = $uploadResult['url'];
                } else {
                    $imageUrl = trim($_POST['image_url'] ?? '');
                }

                if (empty($title) || empty($imageUrl)) {
                    $message = 'Title and image (upload or URL) are required.';
                    $messageType = 'error';
                } else {
                    $stmt = $pdo->prepare("INSERT INTO gallery (title, image_url, description, category, sort_order, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)");
                    $stmt->execute([$title, $imageUrl, $description, $category, $sortOrder, $_SESSION['user_id']]);
                    $message = 'Image added to gallery successfully!';
                    $messageType = 'success';
                    logActivity($_SESSION['user_id'], 'gallery_image_created', "Added gallery image: $title");
                }
                break;

            case 'update_image':
                $imageId = intval($_POST['image_id'] ?? 0);
                $title = sanitize($_POST['title'] ?? '');
                $description = sanitize($_POST['description'] ?? '');
                $category = sanitize($_POST['category'] ?? 'team');
                $sortOrder = intval($_POST['sort_order'] ?? 0);
                $isActive = isset($_POST['is_active']) ? 1 : 0;

                // Check for new file upload
                $imageUrl = '';
                $uploadResult = handleGalleryUpload('image_file', $uploadDir);
                if ($uploadResult && isset($uploadResult['error'])) {
                    $message = $uploadResult['error'];
                    $messageType = 'error';
                    break;
                } elseif ($uploadResult && isset($uploadResult['url'])) {
                    $imageUrl = $uploadResult['url'];
                    // Delete old file if it was a local upload
                    $stmt = $pdo->prepare("SELECT image_url FROM gallery WHERE image_id = ?");
                    $stmt->execute([$imageId]);
                    $old = $stmt->fetchColumn();
                    if ($old && strpos($old, '/uploads/gallery/') === 0) {
                        @unlink(__DIR__ . '/..' . $old);
                    }
                } else {
                    $imageUrl = trim($_POST['image_url'] ?? '');
                }

                if (!$imageId || empty($title) || empty($imageUrl)) {
                    $message = 'Title and image are required.';
                    $messageType = 'error';
                } else {
                    $stmt = $pdo->prepare("UPDATE gallery SET title=?, image_url=?, description=?, category=?, sort_order=?, is_active=? WHERE image_id=?");
                    $stmt->execute([$title, $imageUrl, $description, $category, $sortOrder, $isActive, $imageId]);
                    $message = 'Gallery image updated successfully!';
                    $messageType = 'success';
                    logActivity($_SESSION['user_id'], 'gallery_image_updated', "Updated gallery image #$imageId");
                }
                break;

            case 'delete_image':
                $imageId = intval($_POST['image_id'] ?? 0);
                if ($imageId) {
                    $stmt = $pdo->prepare("SELECT title, image_url FROM gallery WHERE image_id = ?");
                    $stmt->execute([$imageId]);
                    $img = $stmt->fetch();
                    // Delete file if local
                    if ($img && strpos($img['image_url'], '/uploads/gallery/') === 0) {
                        @unlink(__DIR__ . '/..' . $img['image_url']);
                    }
                    $pdo->prepare("DELETE FROM gallery WHERE image_id = ?")->execute([$imageId]);
                    $message = 'Image "' . htmlspecialchars($img['title'] ?? '', ENT_QUOTES, 'UTF-8', false) . '" deleted (file removed)!';
                    $messageType = 'success';
                    logActivity($_SESSION['user_id'], 'gallery_image_deleted', "Deleted gallery image #$imageId");
                }
                break;

            case 'toggle_image':
                $imageId = intval($_POST['image_id'] ?? 0);
                if ($imageId) {
                    $pdo->prepare("UPDATE gallery SET is_active = NOT is_active WHERE image_id = ?")->execute([$imageId]);
                    $message = 'Image visibility toggled!';
                    $messageType = 'success';
                }
                break;
        }
    } catch (Exception $e) {
        $message = 'Error: ' . $e->getMessage();
        $messageType = 'error';
    }
}

// Filter by category
$filterCategory = $_GET['category'] ?? '';

// Fetch images
if ($filterCategory && array_key_exists($filterCategory, $categories)) {
    $stmt = $pdo->prepare("SELECT * FROM gallery WHERE category = ? ORDER BY sort_order ASC, created_at DESC");
    $stmt->execute([$filterCategory]);
    $images = $stmt->fetchAll();
} else {
    $images = $pdo->query("SELECT * FROM gallery ORDER BY sort_order ASC, created_at DESC")->fetchAll();
}

// Category counts
$categoryCounts = [];
$countStmt = $pdo->query("SELECT category, COUNT(*) as cnt FROM gallery GROUP BY category");
while ($row = $countStmt->fetch()) {
    $categoryCounts[$row['category']] = $row['cnt'];
}

// Check if editing
$editImage = null;
if (isset($_GET['edit'])) {
    $stmt = $pdo->prepare("SELECT * FROM gallery WHERE image_id = ?");
    $stmt->execute([intval($_GET['edit'])]);
    $editImage = $stmt->fetch();
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
                    <h1 class="text-2xl font-bold text-ink"><i class="fas fa-images text-primary-500 mr-2"></i>Gallery Manager</h1>
                    <p class="text-sm text-ink-muted mt-1">Manage photos displayed on the Life at KS page.</p>
                </div>
                <div class="mt-3 sm:mt-0">
                    <span class="text-sm text-ink-muted"><?= count($images) ?> images <?= $filterCategory ? 'in "' . ($categories[$filterCategory] ?? $filterCategory) . '"' : 'total' ?></span>
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
                <a href="<?= BASE_PATH ?>/admin/gallery.php" class="px-4 py-2 rounded-lg text-sm font-medium transition <?= !$filterCategory ? 'bg-primary-600 text-white' : 'bg-surface-1 text-ink-muted border border-hairline hover:bg-surface-2' ?>">
                    All (<?= array_sum($categoryCounts) ?>)
                </a>
                <?php foreach ($categories as $catKey => $catLabel): ?>
                <a href="<?= BASE_PATH ?>/admin/gallery.php?category=<?= urlencode($catKey) ?>" class="px-4 py-2 rounded-lg text-sm font-medium transition <?= $filterCategory === $catKey ? 'bg-primary-600 text-white' : 'bg-surface-1 text-ink-muted border border-hairline hover:bg-surface-2' ?>">
                    <?= $catLabel ?> (<?= $categoryCounts[$catKey] ?? 0 ?>)
                </a>
                <?php endforeach; ?>
            </div>

            <!-- Create / Edit Form -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6 mb-6">
                <h2 class="text-lg font-semibold text-ink mb-4">
                    <i class="fas <?= $editImage ? 'fa-edit' : 'fa-plus-circle' ?> mr-2 text-primary-500"></i>
                    <?= $editImage ? 'Edit Image' : 'Add Image' ?>
                </h2>
                <form method="POST" enctype="multipart/form-data">
                    <input type="hidden" name="action" value="<?= $editImage ? 'update_image' : 'create_image' ?>">
                    <?php if ($editImage): ?>
                        <input type="hidden" name="image_id" value="<?= $editImage['image_id'] ?>">
                    <?php endif; ?>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-ink-muted mb-1">Title *</label>
                            <input type="text" name="title" required value="<?= htmlspecialchars($editImage['title'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" placeholder="e.g. Team Outing 2026" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Category</label>
                            <select name="category" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                <?php foreach ($categories as $catKey => $catLabel): ?>
                                <option value="<?= $catKey ?>" <?= ($editImage['category'] ?? 'team') === $catKey ? 'selected' : '' ?>><?= $catLabel ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>

                    <!-- Upload Photo OR Paste URL -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-ink-muted mb-2">Photo * <span class="text-ink-muted text-xs">(upload from your device OR paste URL)</span></label>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- File Upload -->
                            <div>
                                <label class="block text-xs font-semibold text-primary-600 mb-1"><i class="fas fa-upload mr-1"></i> Upload Photo</label>
                                <div class="relative">
                                    <input type="file" name="image_file" id="galleryFileInput" accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 focus:ring-2 focus:ring-primary-500">
                                    <p class="text-xs text-ink-muted mt-1">JPG, PNG, GIF, WebP, SVG — Max 5MB</p>
                                </div>
                                <!-- Preview -->
                                <div id="uploadPreview" class="hidden mt-2 rounded-lg overflow-hidden border border-hairline max-w-[200px]">
                                    <img id="previewImg" src="" alt="Preview" class="w-full h-auto">
                                </div>
                            </div>
                            <!-- OR URL -->
                            <div>
                                <label class="block text-xs font-semibold text-ink-muted mb-1"><i class="fas fa-link mr-1"></i> Or Paste Image URL</label>
                                <input type="url" name="image_url" id="galleryUrlInput" value="<?= htmlspecialchars($editImage['image_url'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" placeholder="https://example.com/photo.jpg" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                <p class="text-xs text-ink-muted mt-1">From Google Drive, Imgur, or any image host</p>
                            </div>
                        </div>
                        <?php if ($editImage): ?>
                        <div class="mt-3 flex items-center gap-3">
                            <span class="text-xs text-ink-muted">Current image:</span>
                            <img src="<?= htmlspecialchars($editImage['image_url'], ENT_QUOTES, 'UTF-8', false) ?>" alt="Current" class="h-16 rounded-lg border border-hairline" onerror="this.style.display='none'">
                            <span class="text-xs text-ink-muted truncate max-w-xs"><?= htmlspecialchars($editImage['image_url'], ENT_QUOTES, 'UTF-8', false) ?></span>
                        </div>
                        <?php endif; ?>
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-ink-muted mb-1">Description <span class="text-ink-muted text-xs">(optional)</span></label>
                        <textarea name="description" rows="3" placeholder="Brief description of the photo..." class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"><?= htmlspecialchars($editImage['description'] ?? '', ENT_QUOTES, 'UTF-8', false) ?></textarea>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Sort Order</label>
                            <input type="number" name="sort_order" value="<?= intval($editImage['sort_order'] ?? 0) ?>" min="0" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <?php if ($editImage): ?>
                        <div class="flex items-center gap-2 pt-6">
                            <input type="checkbox" name="is_active" id="is_active" value="1" <?= ($editImage['is_active'] ?? 1) ? 'checked' : '' ?> class="rounded border-hairline bg-surface-2 text-ink text-primary-600 focus:ring-primary-500">
                            <label for="is_active" class="text-sm font-medium text-ink-muted">Active (visible on site)</label>
                        </div>
                        <?php endif; ?>
                    </div>

                    <div class="flex items-center gap-3">
                        <button type="submit" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
                            <i class="fas <?= $editImage ? 'fa-save' : 'fa-plus' ?> mr-1"></i>
                            <?= $editImage ? 'Update Image' : 'Add Image' ?>
                        </button>
                        <?php if ($editImage): ?>
                            <a href="<?= BASE_PATH ?>/admin/gallery.php" class="border border-hairline bg-surface-2 text-ink hover:bg-surface-2 text-ink-muted px-6 py-2.5 rounded-lg text-sm font-medium transition">Cancel</a>
                        <?php endif; ?>
                    </div>
                </form>
            </div>

            <!-- Gallery Grid -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline overflow-hidden">
                <div class="px-6 py-4 border-b border-hairline">
                    <h2 class="text-lg font-semibold text-ink"><i class="fas fa-th mr-2 text-primary-500"></i>All Images (<?= count($images) ?>)</h2>
                </div>

                <?php if (empty($images)): ?>
                <div class="p-10 text-center">
                    <i class="fas fa-images text-4xl text-ink-muted opacity-50 mb-3"></i>
                    <p class="text-ink-muted">No images found. Use the form above to add your first gallery image.</p>
                </div>
                <?php else: ?>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                    <?php foreach ($images as $img): ?>
                    <div class="border border-hairline rounded-xl overflow-hidden hover:shadow-md transition group">
                        <!-- Thumbnail -->
                        <div class="relative aspect-video bg-surface-2 overflow-hidden">
                            <img src="<?= htmlspecialchars($img['image_url'], ENT_QUOTES, 'UTF-8', false) ?>" alt="<?= htmlspecialchars($img['title'], ENT_QUOTES, 'UTF-8', false) ?>" class="w-full h-full object-cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
                            <div class="w-full h-full items-center justify-center text-ink-muted hidden absolute inset-0 bg-surface-2">
                                <i class="fas fa-image text-3xl"></i>
                            </div>
                            <?php if (!$img['is_active']): ?>
                            <div class="absolute top-2 left-2 bg-gray-800/70 text-white text-xs px-2 py-1 rounded-full">
                                <i class="fas fa-eye-slash mr-1"></i>Hidden
                            </div>
                            <?php endif; ?>
                        </div>
                        <!-- Info -->
                        <div class="p-4">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"><?= $categories[$img['category']] ?? ucfirst($img['category']) ?></span>
                                <span class="text-xs text-ink-muted">Order: <?= $img['sort_order'] ?></span>
                                <?php if ($img['is_active']): ?>
                                    <span class="text-xs text-green-600"><i class="fas fa-check-circle"></i></span>
                                <?php endif; ?>
                            </div>
                            <h3 class="text-sm font-semibold text-ink truncate"><?= htmlspecialchars($img['title'], ENT_QUOTES, 'UTF-8', false) ?></h3>
                            <?php if (!empty($img['description'])): ?>
                            <p class="text-xs text-ink-muted mt-1 line-clamp-2"><?= htmlspecialchars($img['description'], ENT_QUOTES, 'UTF-8', false) ?></p>
                            <?php endif; ?>
                            <div class="flex items-center gap-1 mt-3 pt-3 border-t border-hairline">
                                <form method="POST" class="inline">
                                    <input type="hidden" name="action" value="toggle_image">
                                    <input type="hidden" name="image_id" value="<?= $img['image_id'] ?>">
                                    <button type="submit" title="Toggle active" class="<?= $img['is_active'] ? 'text-green-600 hover:text-green-800' : 'text-ink-muted hover:text-ink-muted' ?> text-sm px-2 py-1.5 rounded-lg hover:bg-surface-2 transition">
                                        <i class="fas <?= $img['is_active'] ? 'fa-toggle-on' : 'fa-toggle-off' ?>"></i>
                                    </button>
                                </form>
                                <a href="<?= BASE_PATH ?>/admin/gallery.php?edit=<?= $img['image_id'] ?>" class="text-primary-600 hover:text-primary-800 text-sm px-2 py-1.5 rounded-lg hover:bg-primary-50 transition">
                                    <i class="fas fa-edit"></i>
                                </a>
                                <form method="POST" onsubmit="return confirm('Delete this image?')" class="inline">
                                    <input type="hidden" name="action" value="delete_image">
                                    <input type="hidden" name="image_id" value="<?= $img['image_id'] ?>">
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

<script>
// File upload preview
document.getElementById('galleryFileInput')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('uploadPreview');
    const previewImg = document.getElementById('previewImg');
    const urlInput = document.getElementById('galleryUrlInput');
    if (file) {
        const reader = new FileReader();
        reader.onload = function(ev) {
            previewImg.src = ev.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
        // Clear URL input when file is selected
        if (urlInput) urlInput.value = '';
    } else {
        preview.classList.add('hidden');
    }
});
// Clear file input when URL is typed
document.getElementById('galleryUrlInput')?.addEventListener('input', function() {
    if (this.value) {
        const fileInput = document.getElementById('galleryFileInput');
        if (fileInput) fileInput.value = '';
        document.getElementById('uploadPreview')?.classList.add('hidden');
    }
});
</script>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>







