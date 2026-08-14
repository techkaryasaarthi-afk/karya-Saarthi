<?php
/**
 * Announcements Banner — shown on all dashboards
 * Include this inside the main content area of any dashboard page.
 * Requires $pdo to be set and announcements table to exist.
 */
$_ks_announcements = [];
try {
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

    $_ks_user_type = $_SESSION['user_type'] ?? 'all';
    // Match both singular (user_type) and plural (admin stores 'employees', 'interns', 'vendors')
    $_ks_audience_map = [
        'employee' => 'employees',
        'intern' => 'interns',
        'vendor' => 'vendors',
        'freelancer' => 'vendors',
        'campus_saarthi' => 'campus_saarthi',
        'teaching_expert' => 'teaching_expert',
        'pillar_post' => 'employees',
        'part_time' => 'vendors',
        'admin' => 'all',
    ];
    $_ks_audience = $_ks_audience_map[$_ks_user_type] ?? $_ks_user_type;
    $stmt = $pdo->prepare("SELECT * FROM announcements
        WHERE (is_active = 1 OR is_active IS NULL)
        AND (target_audience = 'all' OR target_audience = ? OR target_audience = ?)
        AND (scheduled_at IS NULL OR scheduled_at <= NOW())
        ORDER BY created_at DESC LIMIT 5");
    $stmt->execute([$_ks_user_type, $_ks_audience]);
    $_ks_announcements = $stmt->fetchAll() ?: [];
} catch (Throwable $e) {
    // Table may not exist yet — silently skip
}

if (!empty($_ks_announcements)):
?>
<div class="mb-6 space-y-3">
    <?php foreach ($_ks_announcements as $_ann): ?>
    <div class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 hover-lift">
        <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-bullhorn text-amber-600"></i>
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                    <h3 class="text-sm font-bold text-amber-900"><?= htmlspecialchars($_ann['title'] ?? '', ENT_QUOTES, 'UTF-8', false) ?></h3>
                    <?php if (($_ann['target_audience'] ?? 'all') !== 'all'): ?>
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-200 text-amber-800">
                            <?= ucfirst(str_replace('_', ' ', $_ann['target_audience'] ?? '')) ?>
                        </span>
                    <?php endif; ?>
                </div>
                <p class="text-sm text-amber-800 leading-relaxed"><?= nl2br(htmlspecialchars($_ann['content'] ?? '', ENT_QUOTES, 'UTF-8', false)) ?></p>
                <p class="text-xs text-amber-500 mt-2">
                    <i class="far fa-clock mr-1"></i>
                    <?= !empty($_ann['created_at']) ? date('d M Y, h:i A', strtotime($_ann['created_at'])) : '' ?>
                </p>
            </div>
            <button onclick="this.closest('.bg-gradient-to-r').remove()" class="flex-shrink-0 text-amber-400 hover:text-amber-600 p-1" title="Dismiss">
                <i class="fas fa-times text-xs"></i>
            </button>
        </div>
    </div>
    <?php endforeach; ?>
</div>
<?php endif; ?>





