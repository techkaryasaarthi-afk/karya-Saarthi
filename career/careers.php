<?php
$pageTitle = 'All Jobs — Explore Career Opportunities';
require_once __DIR__ . '/config/database.php';

$category = $_GET['category'] ?? '';
$location = $_GET['location'] ?? '';
$workType = $_GET['work_type'] ?? '';
$search = trim($_GET['search'] ?? '');
$department = $_GET['department'] ?? '';
$pillar = $_GET['pillar'] ?? '';
$page = max(1, intval($_GET['page'] ?? 1));
$perPage = 12;
$offset = ($page - 1) * $perPage;

$jobs = [];
$totalJobs = 0;
$locations = [];
$departments = [];

try {
    $pdo = getDBConnection();

    // Auto-fix: ensure category column supports new types (run once)
    try {
        $pdo->exec("ALTER TABLE job_postings MODIFY category VARCHAR(50) NOT NULL");
    } catch (Exception $ignore) {}

    // Check if is_featured column exists
    $hasFeatured = false;
    try {
        $pdo->query("SELECT is_featured FROM job_postings LIMIT 1");
        $hasFeatured = true;
    } catch (Exception $ignore) {}

    // Check if pillar column exists
    $hasPillar = false;
    try {
        $pdo->query("SELECT pillar FROM job_postings LIMIT 1");
        $hasPillar = true;
    } catch (Exception $ignore) {}

    // Check if experience_required column exists
    $hasExperience = false;
    try {
        $pdo->query("SELECT experience_required FROM job_postings LIMIT 1");
        $hasExperience = true;
    } catch (Exception $ignore) {}

    // Build query
    $where = ["status = 'active'"];
    $params = [];

    if ($category) { $where[] = "category = ?"; $params[] = $category; }
    if ($location) { $where[] = "location LIKE ?"; $params[] = "%$location%"; }
    if ($workType) { $where[] = "work_type = ?"; $params[] = $workType; }
    if ($department) { $where[] = "department LIKE ?"; $params[] = "%$department%"; }
    if ($pillar && $hasPillar) { $where[] = "pillar = ?"; $params[] = $pillar; }
    if ($search) { $where[] = "(title LIKE ? OR description LIKE ? OR department LIKE ?)"; $params[] = "%$search%"; $params[] = "%$search%"; $params[] = "%$search%"; }

    $whereClause = implode(' AND ', $where);

    // Count total
    $countSql = "SELECT COUNT(*) FROM job_postings WHERE $whereClause";
    $stmt = $pdo->prepare($countSql);
    $stmt->execute($params);
    $totalJobs = $stmt->fetchColumn();

    // Fetch paginated — safe ORDER BY
    $orderBy = $hasFeatured ? "is_featured DESC, created_at DESC" : "created_at DESC";
    $sql = "SELECT * FROM job_postings WHERE $whereClause ORDER BY $orderBy LIMIT $perPage OFFSET $offset";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $jobs = $stmt->fetchAll();

    // Get filter options
    $stmt = $pdo->query("SELECT DISTINCT TRIM(location) AS location FROM job_postings WHERE status='active' AND location IS NOT NULL AND TRIM(location) != '' ORDER BY location");
    $locations = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $stmt = $pdo->query("SELECT DISTINCT TRIM(department) AS department FROM job_postings WHERE status='active' AND department IS NOT NULL AND TRIM(department) != '' ORDER BY department");
    $departments = $stmt->fetchAll(PDO::FETCH_COLUMN);
} catch (Exception $e) {
    // Silently fail
}

$totalPages = ceil($totalJobs / $perPage);

function timeAgo($datetime) {
    $now = new DateTime();
    $ago = new DateTime($datetime);
    $diff = $now->diff($ago);
    if ($diff->d > 0) return $diff->d . ' day' . ($diff->d > 1 ? 's' : '') . ' ago';
    if ($diff->h > 0) return $diff->h . ' hour' . ($diff->h > 1 ? 's' : '') . ' ago';
    return 'Just now';
}

function categoryBadgeClasses($category) {
    $map = [
        'vendor' => 'bg-blue-500/10 text-blue-400',
        'intern' => 'bg-cyan-500/10 text-cyan-400',
        'campus_saarthi' => 'bg-green-500/10 text-green-400',
        'employee' => 'bg-amber-500/10 text-amber-400',
        'pillar_post' => 'bg-purple-500/10 text-purple-400',
        'freelancer' => 'bg-indigo-500/10 text-indigo-400',
        'part_time' => 'bg-pink-500/10 text-pink-400',
        'remote' => 'bg-teal-500/10 text-teal-400',
        'teaching_expert' => 'bg-green-500/10 text-green-400',
    ];
    return $map[$category] ?? 'bg-surface-2 text-ink';
}

function categoryLabel($category) {
    $map = [
        'vendor' => 'Vendor',
        'intern' => 'Internship',
        'campus_saarthi' => 'Saarthi',
        'employee' => 'Full-Time',
        'pillar_post' => 'Saarthi',
        'freelancer' => 'Freelancer',
        'part_time' => 'Part-Time',
        'remote' => 'Remote',
        'teaching_expert' => 'Expert',
    ];
    return $map[$category] ?? ucfirst(str_replace('_', ' ', $category));
}

require_once __DIR__ . '/includes/header.php';
?>

<!-- Hero Section -->
<section class="bg-canvas text-ink pt-[96px] pb-[64px] border-b border-hairline relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h1 class="text-[48px] sm:text-[62px] font-display tracking-display-lg leading-[1.00] mb-6">Explore Careers</h1>
        <p class="text-[20px] text-ink-muted max-w-2xl mx-auto tracking-[-0.01px] leading-[1.30]">Find the perfect role that matches your skills and aspirations across <?= $totalJobs ?> open positions.</p>
    </div>
</section>

<!-- Search & Filter Bar -->
<section class="bg-surface-1 border-b border-hairline shadow-none sticky top-[56px] z-40 py-4">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <form method="GET" action="careers.php" class="space-y-4">
            <!-- Search bar -->
            <div class="relative">
                <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"></i>
                <input type="text" name="search" value="<?= htmlspecialchars($search, ENT_QUOTES, 'UTF-8', false) ?>" placeholder="Search jobs..." class="w-full bg-canvas text-ink border border-hairline rounded-xl pl-11 pr-4 py-3 text-sm focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none transition-colors">
            </div>
            <!-- Filters row -->
            <div class="flex flex-col sm:flex-row gap-3 items-end">
                <!-- Category -->
                <div class="w-full sm:w-auto sm:flex-1">
                    <label class="block text-xs font-medium text-ink-muted mb-1.5">Category</label>
                    <select name="category" class="text-input text-sm">
                        <option value="">All Categories</option>
                        <option value="employee" <?= $category === 'employee' ? 'selected' : '' ?>>Internal Member</option>
                        <option value="pillar_post" <?= $category === 'pillar_post' ? 'selected' : '' ?>>Saarthi</option>
                        <option value="vendor" <?= $category === 'vendor' ? 'selected' : '' ?>>Vendor / Freelancer</option>
                        <option value="intern" <?= $category === 'intern' ? 'selected' : '' ?>>Internship</option>
                        <option value="freelancer" <?= $category === 'freelancer' ? 'selected' : '' ?>>Freelancer</option>
                        <option value="part_time" <?= $category === 'part_time' ? 'selected' : '' ?>>Part-Time / Remote</option>
                        <option value="teaching_expert" <?= $category === 'teaching_expert' ? 'selected' : '' ?>>Teaching Expert</option>
                        <option value="remote" <?= $category === 'remote' ? 'selected' : '' ?>>Remote</option>
                    </select>
                </div>
                <!-- Department -->
                <div class="w-full sm:w-auto sm:flex-1">
                    <label class="block text-xs font-medium text-ink-muted mb-1.5">Department</label>
                    <select name="department" class="text-input text-sm">
                        <option value="">All Departments</option>
                        <?php foreach ($departments as $dept): ?>
                            <option value="<?= htmlspecialchars($dept, ENT_QUOTES, 'UTF-8', false) ?>" <?= $department === $dept ? 'selected' : '' ?>><?= htmlspecialchars($dept, ENT_QUOTES, 'UTF-8', false) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <!-- Location -->
                <div class="w-full sm:w-auto sm:flex-1">
                    <label class="block text-xs font-medium text-ink-muted mb-1.5">Location</label>
                    <select name="location" class="text-input text-sm">
                        <option value="">All Locations</option>
                        <?php foreach ($locations as $loc): ?>
                            <option value="<?= htmlspecialchars($loc, ENT_QUOTES, 'UTF-8', false) ?>" <?= $location === $loc ? 'selected' : '' ?>><?= htmlspecialchars($loc, ENT_QUOTES, 'UTF-8', false) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <!-- Work Type -->
                <div class="w-full sm:w-auto sm:flex-1">
                    <label class="block text-xs font-medium text-ink-muted mb-1.5">Work Type</label>
                    <select name="work_type" class="text-input text-sm">
                        <option value="">All Types</option>
                        <option value="remote" <?= $workType === 'remote' ? 'selected' : '' ?>>Remote</option>
                        <option value="onsite" <?= $workType === 'onsite' ? 'selected' : '' ?>>Onsite</option>
                        <option value="hybrid" <?= $workType === 'hybrid' ? 'selected' : '' ?>>Hybrid</option>
                    </select>
                </div>
                <!-- Pillar filter -->
                <div class="w-full sm:w-auto sm:flex-1">
                    <label class="block text-xs font-medium text-ink-muted mb-1.5">Pillar</label>
                    <select name="pillar" class="text-input text-sm">
                        <option value="">All Pillars</option>
                        <option value="campus_saarthi" <?= $pillar === 'campus_saarthi' ? 'selected' : '' ?>>Saarthi</option>
                        <option value="digital_saarthi" <?= $pillar === 'digital_saarthi' ? 'selected' : '' ?>>Digital Saarthi</option>
                        <option value="calling_saarthi" <?= $pillar === 'calling_saarthi' ? 'selected' : '' ?>>Calling Saarthi</option>
                        <option value="government_saarthi" <?= $pillar === 'government_saarthi' ? 'selected' : '' ?>>Government Saarthi</option>
                        <option value="market_saarthi" <?= $pillar === 'market_saarthi' ? 'selected' : '' ?>>Market Saarthi</option>
                    </select>
                </div>
                <!-- Buttons -->
                <div class="flex gap-2 w-full sm:w-auto">
                    <button type="submit" class="button-primary flex-1 sm:flex-none h-[42px] px-6">
                        <i class="fas fa-search mr-2"></i> Search
                    </button>
                    <a href="careers.php" class="button-secondary flex-1 sm:flex-none h-[42px] px-6">Clear</a>
                </div>
            </div>
        </form>
    </div>
</section>

<!-- Job Listings -->
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[64px] bg-canvas flex-1">
    <!-- Results count -->
    <div class="mb-8 flex items-center justify-between">
        <p class="text-[14px] text-ink-muted">
            Showing <span class="font-bold text-ink"><?= count($jobs) ?></span> of <span class="font-bold text-ink"><?= $totalJobs ?></span> position<?= $totalJobs !== 1 ? 's' : '' ?>
            <?php if ($search): ?> for "<span class="text-accent-blue"><?= htmlspecialchars($search, ENT_QUOTES, 'UTF-8', false) ?></span>"<?php endif; ?>
        </p>
    </div>

    <?php if (count($jobs) > 0): ?>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <?php foreach ($jobs as $job): ?>
                <div class="bg-surface-1 rounded-xl border border-hairline hover:border-hairline-soft transition-colors flex flex-col <?= !empty($job['is_featured']) ? 'ring-1 ring-accent-blue' : '' ?> group hover-lift">
                    <div class="p-6 flex-1 flex flex-col">
                        <!-- Featured badge -->
                        <?php if (!empty($job['is_featured'])): ?>
                            <div class="mb-3"><span class="inline-flex items-center text-[10px] font-bold text-accent-blue bg-accent-blue/10 px-2.5 py-0.5 rounded-full"><i class="fas fa-star mr-1.5"></i>Featured</span></div>
                        <?php endif; ?>
                        <!-- Top row: category badge + work type -->
                        <div class="flex items-center justify-between mb-4">
                            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider <?= categoryBadgeClasses($job['category']) ?>">
                                <?= categoryLabel($job['category']) ?>
                            </span>
                            <?php if (!empty($job['work_type'])): ?>
                                <span class="text-[11px] font-bold uppercase tracking-wider text-ink-muted bg-surface-2 px-2.5 py-1 rounded-full">
                                    <i class="fas fa-<?= $job['work_type'] === 'remote' ? 'laptop-house' : ($job['work_type'] === 'hybrid' ? 'arrows-alt-h' : 'building') ?> mr-1.5"></i>
                                    <?= htmlspecialchars($job['work_type'], ENT_QUOTES, 'UTF-8', false) ?>
                                </span>
                            <?php endif; ?>
                        </div>

                        <!-- Title -->
                        <h3 class="text-[20px] font-bold tracking-headline text-ink mb-3 leading-[1.2]"><?= htmlspecialchars($job['title'], ENT_QUOTES, 'UTF-8', false) ?></h3>

                        <div class="space-y-2 mb-4">
                            <!-- Department -->
                            <?php if (!empty($job['department'])): ?>
                                <p class="text-[13px] text-ink-muted">
                                    <i class="fas fa-building mr-2 opacity-60"></i><?= htmlspecialchars($job['department'], ENT_QUOTES, 'UTF-8', false) ?>
                                </p>
                            <?php endif; ?>

                            <!-- Location -->
                            <?php if (!empty($job['location'])): ?>
                                <p class="text-[13px] text-ink-muted">
                                    <i class="fas fa-map-marker-alt mr-2 opacity-60"></i><?= htmlspecialchars($job['location'], ENT_QUOTES, 'UTF-8', false) ?>
                                </p>
                            <?php endif; ?>

                            <!-- Salary -->
                            <?php if (!empty($job['salary_range'])): ?>
                                <p class="text-[13px] text-ink">
                                    <i class="fas fa-rupee-sign mr-2 opacity-60"></i><?= htmlspecialchars($job['salary_range'], ENT_QUOTES, 'UTF-8', false) ?>
                                    <?php if (!empty($job['compensation_type'])): ?>
                                        <span class="text-ink-muted">/ <?= htmlspecialchars($job['compensation_type'], ENT_QUOTES, 'UTF-8', false) ?></span>
                                    <?php endif; ?>
                                </p>
                            <?php endif; ?>

                            <!-- Experience -->
                            <?php if (!empty($job['experience_required'])): ?>
                                <p class="text-[13px] text-ink-muted">
                                    <i class="fas fa-user-clock mr-2 opacity-60"></i><?= htmlspecialchars($job['experience_required'], ENT_QUOTES, 'UTF-8', false) ?>
                                </p>
                            <?php endif; ?>
                        </div>

                        <div class="flex-1"></div>

                        <!-- Footer -->
                        <div class="flex items-center justify-between text-[12px] text-ink-muted mt-4 pt-4 border-t border-hairline">
                            <span><i class="far fa-clock mr-1.5 opacity-60"></i><?= timeAgo($job['created_at']) ?></span>
                            <?php if (!empty($job['deadline'])): ?>
                                <?php $daysLeft = (int)((strtotime($job['deadline']) - time()) / 86400); ?>
                                <span class="<?= $daysLeft <= 3 ? 'text-red-400 font-bold' : 'opacity-80' ?>">
                                    <i class="fas fa-hourglass-half mr-1.5"></i>
                                    <?php if ($daysLeft <= 0): ?>Last day!<?php else: ?><?= $daysLeft ?> day<?= $daysLeft > 1 ? 's' : '' ?> left<?php endif; ?>
                                </span>
                            <?php endif; ?>
                        </div>
                    </div>

                    <!-- Buttons -->
                    <div class="px-6 pb-6 flex gap-3">
                        <a href="<?= BASE_PATH ?>/job-detail.php?id=<?= $job['job_id'] ?>" class="button-secondary flex-1 border-hairline-soft w-full text-center">
                            Details
                        </a>
                        <?php if (empty($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin'): ?>
                        <a href="<?= BASE_PATH ?>/apply.php?job_id=<?= $job['job_id'] ?>" class="button-primary flex-1 w-full text-center">
                            Apply
                        </a>
                        <?php else: ?>
                        <a href="<?= BASE_PATH ?>/admin/recruitment.php" class="button-secondary flex-1 w-full text-center">
                            Manage
                        </a>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <!-- Pagination -->
        <?php if ($totalPages > 1): ?>
        <div class="mt-12 flex items-center justify-center gap-2">
            <?php
            $queryParams = $_GET;
            unset($queryParams['page']);
            $baseUrl = 'careers.php?' . http_build_query($queryParams);
            ?>
            <?php if ($page > 1): ?>
                <a href="<?= $baseUrl ?>&page=<?= $page - 1 ?>" class="px-4 py-2 bg-surface-1 border border-hairline rounded-lg text-sm text-ink hover:bg-surface-2 transition"><i class="fas fa-chevron-left mr-1"></i> Prev</a>
            <?php endif; ?>

            <?php for ($i = max(1, $page - 2); $i <= min($totalPages, $page + 2); $i++): ?>
                <a href="<?= $baseUrl ?>&page=<?= $i ?>" class="px-4 py-2 rounded-lg text-sm font-medium transition <?= $i === $page ? 'bg-ink text-canvas' : 'bg-surface-1 border border-hairline text-ink hover:bg-surface-2' ?>"><?= $i ?></a>
            <?php endfor; ?>

            <?php if ($page < $totalPages): ?>
                <a href="<?= $baseUrl ?>&page=<?= $page + 1 ?>" class="px-4 py-2 bg-surface-1 border border-hairline rounded-lg text-sm text-ink hover:bg-surface-2 transition">Next <i class="fas fa-chevron-right ml-1"></i></a>
            <?php endif; ?>
        </div>
        <?php endif; ?>

    <?php else: ?>
        <!-- Empty State -->
        <div class="text-center py-[96px] bg-surface-1 rounded-xl border border-hairline">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-2 mb-6">
                <i class="fas fa-briefcase text-2xl text-ink-muted"></i>
            </div>
            <h3 class="text-[24px] font-normal tracking-[-0.01px] text-ink mb-3">No open positions found</h3>
            <p class="text-[15px] text-ink-muted mb-8 max-w-md mx-auto">We don't have any matching openings right now. Try adjusting your filters or check back soon.</p>
            <a href="careers.php" class="button-secondary">
                <i class="fas fa-redo mr-2"></i> Reset Filters
            </a>
        </div>
    <?php endif; ?>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>






