<?php
$pageTitle = 'Job Details';
require_once __DIR__ . '/config/database.php';

$jobId = intval($_GET['id'] ?? 0);
$job = null;
$similarJobs = [];

if ($jobId > 0) {
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("SELECT * FROM job_postings WHERE job_id = ? AND status = 'active'");
        $stmt->execute([$jobId]);
        $job = $stmt->fetch();

        // Fetch similar jobs
        if ($job) {
            $stmt = $pdo->prepare("SELECT * FROM job_postings WHERE status = 'active' AND job_id != ? AND category = ? ORDER BY created_at DESC LIMIT 3");
            $stmt->execute([$jobId, $job['category']]);
            $similarJobs = $stmt->fetchAll();
        }
    } catch (Exception $e) {}
}

if ($job) {
    $pageTitle = $job['title'] . ' — Karya Saarthi Careers';
    $pageDescription = 'Apply for ' . $job['title'] . ' at Karya Saarthi. ' . ($job['location'] ? $job['location'] . '. ' : '') . ($job['salary_range'] ? 'CTC: ' . $job['salary_range'] . '. ' : '') . 'Join India\'s fastest growing project solutions company.';
}

function categoryBadgeClasses($category) {
    $map = [
        'vendor' => 'bg-blue-500/10 text-blue-400', 'intern' => 'bg-cyan-500/10 text-cyan-400',
        'campus_saarthi' => 'bg-green-500/10 text-green-400', 'employee' => 'bg-amber-500/10 text-amber-400',
        'pillar_post' => 'bg-purple-500/10 text-purple-400', 'freelancer' => 'bg-indigo-500/10 text-indigo-400',
        'part_time' => 'bg-pink-500/10 text-pink-400', 'remote' => 'bg-teal-500/10 text-teal-400',
        'teaching_expert' => 'bg-green-500/10 text-green-400',
    ];
    return $map[$category] ?? 'bg-surface-2 text-ink';
}

function categoryLabel($category) {
    $map = [
        'vendor' => 'Vendor', 'intern' => 'Internship', 'campus_saarthi' => 'Campus Saarthi',
        'employee' => 'Full-Time', 'pillar_post' => '5 Pillar Post', 'freelancer' => 'Freelancer',
        'part_time' => 'Part-Time', 'remote' => 'Remote', 'teaching_expert' => 'Teaching Expert',
    ];
    return $map[$category] ?? ucfirst(str_replace('_', ' ', $category));
}

require_once __DIR__ . '/includes/header.php';
?>

<?php if (!$job): ?>
<!-- 404 Not Found -->
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[96px] text-center bg-canvas flex-1">
    <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-surface-1 border border-hairline mb-6">
        <i class="fas fa-exclamation-triangle text-3xl text-red-400"></i>
    </div>
    <h1 class="text-[32px] font-display tracking-display-md text-ink mb-3">Job Not Found</h1>
    <p class="text-[16px] text-ink-muted max-w-md mx-auto mb-8">The position you are looking for does not exist, has been filled, or is no longer accepting applications.</p>
    <a href="<?= BASE_PATH ?>/careers.php" class="button-secondary">
        <i class="fas fa-arrow-left mr-2"></i> Browse All Openings
    </a>
</section>

<?php else: ?>
<!-- Breadcrumb -->
<section class="bg-surface-1 border-b border-hairline sticky top-[56px] z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav class="flex items-center text-[13px] text-ink-muted space-x-2">
            <a href="<?= BASE_PATH ?>/" class="hover:text-ink font-bold transition-colors">Home</a>
            <i class="fas fa-chevron-right text-[9px] opacity-40"></i>
            <a href="<?= BASE_PATH ?>/careers.php" class="hover:text-ink font-bold transition-colors">All Jobs</a>
            <i class="fas fa-chevron-right text-[9px] opacity-40"></i>
            <a href="<?= BASE_PATH ?>/careers.php?category=<?= urlencode($job['category']) ?>" class="hover:text-ink font-bold transition-colors"><?= categoryLabel($job['category']) ?></a>
            <i class="fas fa-chevron-right text-[9px] opacity-40"></i>
            <span class="text-ink font-bold truncate max-w-xs"><?= htmlspecialchars($job['title'], ENT_QUOTES, 'UTF-8', false) ?></span>
        </nav>
    </div>
</section>

<!-- Job Detail Content -->
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[64px] bg-canvas flex-1">
    <div class="flex flex-col lg:flex-row gap-8">

        <!-- Left: Main Content -->
        <div class="flex-1 min-w-0">
            <!-- Header -->
            <div class="bg-surface-1 rounded-xl border border-hairline p-6 sm:p-8 mb-6">
                <div class="flex flex-wrap items-center gap-3 mb-6">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider <?= categoryBadgeClasses($job['category']) ?>">
                        <?= categoryLabel($job['category']) ?>
                    </span>
                    <?php if (!empty($job['work_type'])): ?>
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-surface-2 text-ink-muted">
                            <i class="fas fa-<?= $job['work_type'] === 'remote' ? 'laptop-house' : ($job['work_type'] === 'hybrid' ? 'arrows-alt-h' : 'building') ?> mr-1.5"></i>
                            <?= htmlspecialchars($job['work_type'], ENT_QUOTES, 'UTF-8', false) ?>
                        </span>
                    <?php endif; ?>
                    <?php if (!empty($job['is_featured'])): ?>
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-accent-blue/10 text-accent-blue"><i class="fas fa-star mr-1.5"></i>Featured</span>
                    <?php endif; ?>
                </div>
                <h1 class="text-[32px] sm:text-[40px] font-display tracking-display-md text-ink leading-[1.1] mb-6"><?= htmlspecialchars($job['title'], ENT_QUOTES, 'UTF-8', false) ?></h1>
                <div class="flex flex-wrap items-center gap-x-6 gap-y-3 text-[14px] text-ink-muted">
                    <?php if (!empty($job['department'])): ?>
                        <span class="flex items-center"><i class="fas fa-building mr-2 opacity-60"></i> <?= htmlspecialchars($job['department'], ENT_QUOTES, 'UTF-8', false) ?></span>
                    <?php endif; ?>
                    <?php if (!empty($job['location'])): ?>
                        <span class="flex items-center"><i class="fas fa-map-marker-alt mr-2 opacity-60"></i> <?= htmlspecialchars($job['location'], ENT_QUOTES, 'UTF-8', false) ?></span>
                    <?php endif; ?>
                    <?php if (!empty($job['experience_required'])): ?>
                        <span class="flex items-center"><i class="fas fa-user-clock mr-2 opacity-60"></i> <?= htmlspecialchars($job['experience_required'], ENT_QUOTES, 'UTF-8', false) ?></span>
                    <?php endif; ?>
                    <?php if (!empty($job['created_at'])): ?>
                        <span class="flex items-center"><i class="far fa-calendar-alt mr-2 opacity-60"></i> Posted <?= date('d M Y', strtotime($job['created_at'])) ?></span>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Description -->
            <?php if (!empty($job['description'])): ?>
            <div class="bg-surface-1 rounded-xl border border-hairline p-6 sm:p-8 mb-6">
                <h2 class="text-[20px] font-bold tracking-headline text-ink mb-4 flex items-center">
                    <i class="fas fa-file-alt mr-3 text-accent-blue"></i> Job Description
                </h2>
                <div class="prose prose-invert prose-sm max-w-none text-ink-muted leading-relaxed whitespace-pre-line"><?= nl2br(htmlspecialchars($job['description'], ENT_QUOTES, 'UTF-8', false)) ?></div>
            </div>
            <?php endif; ?>

            <!-- Responsibilities -->
            <?php if (!empty($job['responsibilities'])): ?>
            <div class="bg-surface-1 rounded-xl border border-hairline p-6 sm:p-8 mb-6">
                <h2 class="text-[20px] font-bold tracking-headline text-ink mb-4 flex items-center">
                    <i class="fas fa-tasks mr-3 text-accent-blue"></i> Responsibilities
                </h2>
                <div class="prose prose-invert prose-sm max-w-none text-ink-muted leading-relaxed whitespace-pre-line"><?= nl2br(htmlspecialchars($job['responsibilities'], ENT_QUOTES, 'UTF-8', false)) ?></div>
            </div>
            <?php endif; ?>

            <!-- Requirements / Skills -->
            <?php if (!empty($job['requirements'])): ?>
            <div class="bg-surface-1 rounded-xl border border-hairline p-6 sm:p-8 mb-6">
                <h2 class="text-[20px] font-bold tracking-headline text-ink mb-4 flex items-center">
                    <i class="fas fa-clipboard-check mr-3 text-accent-blue"></i> Skills & Eligibility
                </h2>
                <div class="prose prose-invert prose-sm max-w-none text-ink-muted leading-relaxed whitespace-pre-line"><?= nl2br(htmlspecialchars($job['requirements'], ENT_QUOTES, 'UTF-8', false)) ?></div>
            </div>
            <?php endif; ?>

            <!-- Eligibility Criteria -->
            <?php if (!empty($job['eligibility_criteria'])): ?>
            <div class="bg-surface-1 rounded-xl border border-hairline p-6 sm:p-8 mb-6">
                <h2 class="text-[20px] font-bold tracking-headline text-ink mb-4 flex items-center">
                    <i class="fas fa-user-check mr-3 text-green-400"></i> Eligibility Criteria
                </h2>
                <div class="prose prose-invert prose-sm max-w-none text-ink-muted leading-relaxed whitespace-pre-line"><?= nl2br(htmlspecialchars($job['eligibility_criteria'], ENT_QUOTES, 'UTF-8', false)) ?></div>
            </div>
            <?php endif; ?>

            <!-- Benefits & Perks -->
            <?php if (!empty($job['benefits_perks'])): ?>
            <div class="bg-surface-2 rounded-xl border border-hairline p-6 sm:p-8 mb-6">
                <h2 class="text-[20px] font-bold tracking-headline text-ink mb-4 flex items-center">
                    <i class="fas fa-gift mr-3 text-green-400"></i> Benefits & Perks
                </h2>
                <div class="prose prose-invert prose-sm max-w-none text-ink-muted leading-relaxed whitespace-pre-line"><?= nl2br(htmlspecialchars($job['benefits_perks'], ENT_QUOTES, 'UTF-8', false)) ?></div>
            </div>
            <?php endif; ?>

            <!-- Interview Process -->
            <?php if (!empty($job['interview_process'])): ?>
            <div class="bg-surface-1 rounded-xl border border-hairline p-6 sm:p-8 mb-6">
                <h2 class="text-[20px] font-bold tracking-headline text-ink mb-4 flex items-center">
                    <i class="fas fa-route mr-3 text-purple-400"></i> Interview Process
                </h2>
                <div class="prose prose-invert prose-sm max-w-none text-ink-muted leading-relaxed whitespace-pre-line"><?= nl2br(htmlspecialchars($job['interview_process'], ENT_QUOTES, 'UTF-8', false)) ?></div>
            </div>
            <?php endif; ?>

            <!-- About Karya Saarthi -->
            <div class="bg-surface-2 rounded-xl border border-hairline p-6 sm:p-8 mb-6">
                <h2 class="text-[20px] font-bold tracking-headline text-ink mb-3 flex items-center">
                    <i class="fas fa-info-circle mr-3 text-accent-blue"></i> About Karya Saarthi
                </h2>
                <p class="text-[14px] text-ink-muted leading-relaxed">Karya Saarthi is India's trusted project solutions company helping students and businesses succeed. We offer research papers, thesis writing, website development, app development, and digital marketing services. With 500+ projects delivered, 50+ team members, and 100+ campus ambassadors across India, we are rapidly growing and always looking for talented individuals to join our mission. <strong class="text-ink">Hum Hai Aapke Saarthi!</strong></p>
            </div>

            <!-- Similar Jobs -->
            <?php if (!empty($similarJobs)): ?>
            <div class="mb-6">
                <h2 class="text-[20px] font-bold tracking-headline text-ink mb-4"><i class="fas fa-layer-group mr-3 text-accent-blue"></i> Similar Jobs</h2>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <?php foreach ($similarJobs as $sJob): ?>
                    <a href="<?= BASE_PATH ?>/job-detail.php?id=<?= $sJob['job_id'] ?>" class="bg-surface-1 rounded-xl border border-hairline p-5 hover:border-hairline-soft transition-colors block group hover-lift">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider <?= categoryBadgeClasses($sJob['category']) ?> mb-3"><?= categoryLabel($sJob['category']) ?></span>
                        <h3 class="text-[15px] font-bold tracking-headline text-ink mb-2 leading-tight group-hover:text-accent-blue transition-colors"><?= htmlspecialchars($sJob['title'], ENT_QUOTES, 'UTF-8', false) ?></h3>
                        <?php if ($sJob['location']): ?><p class="text-[12px] text-ink-muted mb-1"><i class="fas fa-map-marker-alt mr-2 opacity-60"></i><?= htmlspecialchars($sJob['location'], ENT_QUOTES, 'UTF-8', false) ?></p><?php endif; ?>
                        <?php if ($sJob['salary_range']): ?><p class="text-[12px] text-ink"><i class="fas fa-rupee-sign mr-2 opacity-60"></i><?= htmlspecialchars($sJob['salary_range'], ENT_QUOTES, 'UTF-8', false) ?></p><?php endif; ?>
                    </a>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>

            <div class="mt-8">
                <a href="<?= BASE_PATH ?>/careers.php" class="inline-flex items-center text-ink-muted hover:text-ink font-bold text-[14px] transition-colors">
                    <i class="fas fa-arrow-left mr-2"></i> Back to All Openings
                </a>
            </div>
        </div>

        <!-- Right: Sidebar -->
        <div class="w-full lg:w-80 flex-shrink-0">
            <div class="lg:sticky lg:top-[120px] space-y-6">

                <!-- Key Details Card -->
                <div class="bg-surface-1 rounded-xl border border-hairline p-6">
                    <h3 class="text-[16px] font-bold tracking-headline text-ink mb-5">Job Overview</h3>
                    <div class="space-y-4">
                        <?php if (!empty($job['location'])): ?>
                        <div class="flex items-start gap-4">
                            <div class="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0"><i class="fas fa-map-marker-alt text-ink-muted text-[14px]"></i></div>
                            <div><p class="text-[11px] text-ink-muted font-bold uppercase tracking-wider mb-0.5">Location</p><p class="text-[14px] text-ink font-medium"><?= htmlspecialchars($job['location'], ENT_QUOTES, 'UTF-8', false) ?></p></div>
                        </div>
                        <?php endif; ?>

                        <?php if (!empty($job['work_type'])): ?>
                        <div class="flex items-start gap-4">
                            <div class="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0"><i class="fas fa-briefcase text-ink-muted text-[14px]"></i></div>
                            <div><p class="text-[11px] text-ink-muted font-bold uppercase tracking-wider mb-0.5">Work Type</p><p class="text-[14px] text-ink font-medium capitalize"><?= htmlspecialchars($job['work_type'], ENT_QUOTES, 'UTF-8', false) ?></p></div>
                        </div>
                        <?php endif; ?>

                        <?php if (!empty($job['salary_range'])): ?>
                        <div class="flex items-start gap-4">
                            <div class="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0"><i class="fas fa-rupee-sign text-green-400 text-[14px]"></i></div>
                            <div><p class="text-[11px] text-ink-muted font-bold uppercase tracking-wider mb-0.5">CTC / Stipend Range</p><p class="text-[14px] text-ink font-medium"><?= htmlspecialchars($job['salary_range'], ENT_QUOTES, 'UTF-8', false) ?></p></div>
                        </div>
                        <?php endif; ?>

                        <?php if (!empty($job['experience_required'])): ?>
                        <div class="flex items-start gap-4">
                            <div class="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0"><i class="fas fa-user-clock text-cyan-400 text-[14px]"></i></div>
                            <div><p class="text-[11px] text-ink-muted font-bold uppercase tracking-wider mb-0.5">Experience</p><p class="text-[14px] text-ink font-medium"><?= htmlspecialchars($job['experience_required'], ENT_QUOTES, 'UTF-8', false) ?></p></div>
                        </div>
                        <?php endif; ?>

                        <?php if (!empty($job['age_limit'])): ?>
                        <div class="flex items-start gap-4">
                            <div class="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0"><i class="fas fa-birthday-cake text-pink-400 text-[14px]"></i></div>
                            <div><p class="text-[11px] text-ink-muted font-bold uppercase tracking-wider mb-0.5">Age Limit</p><p class="text-[14px] text-ink font-medium"><?= htmlspecialchars($job['age_limit'], ENT_QUOTES, 'UTF-8', false) ?></p></div>
                        </div>
                        <?php endif; ?>

                        <?php if (!empty($job['positions'])): ?>
                        <div class="flex items-start gap-4">
                            <div class="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0"><i class="fas fa-users text-amber-400 text-[14px]"></i></div>
                            <div><p class="text-[11px] text-ink-muted font-bold uppercase tracking-wider mb-0.5">Open Positions</p><p class="text-[14px] text-ink font-medium"><?= intval($job['positions']) ?></p></div>
                        </div>
                        <?php endif; ?>

                        <?php if (!empty($job['deadline'])): ?>
                        <div class="flex items-start gap-4">
                            <div class="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0"><i class="fas fa-hourglass-half text-red-400 text-[14px]"></i></div>
                            <div>
                                <p class="text-[11px] text-ink-muted font-bold uppercase tracking-wider mb-0.5">Application Deadline</p>
                                <p class="text-[14px] text-ink font-medium"><?= date('d M Y', strtotime($job['deadline'])) ?></p>
                                <?php
                                    $daysLeft = (int) ((strtotime($job['deadline']) - time()) / 86400);
                                    if ($daysLeft > 0): ?>
                                    <p class="text-[12px] text-red-400 mt-1 font-bold"><?= $daysLeft ?> day<?= $daysLeft > 1 ? 's' : '' ?> left</p>
                                <?php elseif ($daysLeft === 0): ?>
                                    <p class="text-[12px] text-red-400 font-bold mt-1">Last day to apply!</p>
                                <?php endif; ?>
                            </div>
                        </div>
                        <?php endif; ?>
                    </div>

                    <!-- Apply Button -->
                    <div class="mt-8 pt-6 border-t border-hairline">
                        <a href="<?= BASE_PATH ?>/apply.php?job_id=<?= $job['job_id'] ?>" class="button-primary w-full text-center">
                            Apply Now
                        </a>
                    </div>
                </div>

                <!-- Share Card -->
                <div class="bg-surface-1 rounded-xl border border-hairline p-6">
                    <h3 class="text-[16px] font-bold tracking-headline text-ink mb-4">Share This Job</h3>
                    <div class="flex items-center gap-3">
                        <button onclick="navigator.clipboard.writeText(window.location.href); this.innerHTML='<i class=\'fas fa-check mr-2\'></i> Copied!'; setTimeout(() => this.innerHTML='<i class=\'fas fa-link mr-2\'></i> Copy Link', 2000)" class="button-secondary flex-1 px-0 h-[42px]">
                            <i class="fas fa-link mr-2"></i> Copy Link
                        </button>
                        <a href="https://wa.me/?text=<?= urlencode($job['title'] . ' at Karya Saarthi — Apply now! ' . SITE_URL . '/job-detail.php?id=' . $job['job_id']) ?>" target="_blank" class="w-[42px] h-[42px] flex items-center justify-center bg-surface-2 hover:bg-surface-1 border border-hairline hover:border-hairline-soft text-ink-muted hover:text-[#25D366] rounded-lg transition-colors" title="Share on WhatsApp">
                            <i class="fab fa-whatsapp text-[18px]"></i>
                        </a>
                        <a href="https://www.linkedin.com/sharing/share-offsite/?url=<?= urlencode(SITE_URL . '/job-detail.php?id=' . $job['job_id']) ?>" target="_blank" class="w-[42px] h-[42px] flex items-center justify-center bg-surface-2 hover:bg-surface-1 border border-hairline hover:border-hairline-soft text-ink-muted hover:text-[#0077b5] rounded-lg transition-colors" title="Share on LinkedIn">
                            <i class="fab fa-linkedin-in text-[18px]"></i>
                        </a>
                    </div>
                </div>

            </div>
        </div>

    </div>
</section>
<?php endif; ?>

<?php require_once __DIR__ . '/includes/footer.php'; ?>





