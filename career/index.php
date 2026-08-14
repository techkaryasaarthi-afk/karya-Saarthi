<?php
$pageTitle = 'Karya Saarthi Careers — Join Our Team';
$pageDescription = 'Join India\'s fastest growing project solutions company. Explore career opportunities at Karya Saarthi — internships, vendor partnerships, campus ambassador roles, 5 pillar posts & full-time positions across 7 hiring categories.';
$pageKeywords = 'Karya Saarthi careers, jobs India, internship, campus ambassador, vendor partner, freelancer, part-time remote, 5 pillar jobs, hiring, career opportunities';
$canonicalUrl = 'https://career.karyasaarthi.com/';

require_once __DIR__ . '/config/database.php';

// ── Data defaults ──
$jobCounts = ['vendor' => 0, 'intern' => 0, 'campus_saarthi' => 0, 'employee' => 0, 'pillar_post' => 0, 'freelancer' => 0, 'part_time' => 0, 'remote' => 0, 'teaching_expert' => 0];
$totalOpenPositions = 0;
$totalTeamMembers = 50;
$totalCampusSaarthis = 100;
$totalVendors = 500;
$totalTeachingExperts = 0;
$totalProjectsCompleted = 120;
$featuredJob = null;
$latestJob = null;
$nextHackathon = null;
$nextSeminar = null;
$testimonials = [];

try {
    $pdo = getDBConnection();

    // Auto-fix: ensure category column supports new types
    try { $pdo->exec("ALTER TABLE job_postings MODIFY category VARCHAR(50) NOT NULL"); } catch (Throwable $ignore) {}

    // Job counts by category
    $stmt = $pdo->query("SELECT category, COUNT(*) as cnt FROM job_postings WHERE status='active' GROUP BY category");
    $totalOpenPositions = 0;
    if ($stmt) {
        while ($row = $stmt->fetch()) {
            $jobCounts[$row['category']] = (int)$row['cnt'];
            $totalOpenPositions += (int)$row['cnt'];
        }
    }

    // Dynamic Saarthi Job Count: Include any job with 'saarthi' in title or legacy category
    $stmtSaarthiJob = $pdo->query("SELECT COUNT(*) FROM job_postings WHERE status='active' AND (category IN ('pillar_post', 'campus_saarthi') OR title LIKE '%saarthi%')");
    if ($stmtSaarthiJob) {
        $jobCounts['pillar_post'] = (int)$stmtSaarthiJob->fetchColumn();
    }

    // Team member count
    $stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE status='active' AND user_type NOT IN ('admin')");
    if ($stmt) {
        $totalTeamMembers = (int)$stmt->fetchColumn();
    }

    // Saarthi count
    $stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE status='active' AND user_type='campus_saarthi'");
    if ($stmt) {
        $totalCampusSaarthis = (int)$stmt->fetchColumn();
    }

    // Vendor count
    try {
        $stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE status='active' AND user_type IN ('vendor','freelancer')");
        if ($stmt) $totalVendors = (int)$stmt->fetchColumn();
    } catch (Throwable $ignore) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE status='active' AND user_type='vendor'");
            if ($stmt) $totalVendors = (int)$stmt->fetchColumn();
        } catch (Throwable $ig) {}
    }

    // Teaching expert count
    try {
        $stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE status='active' AND user_type='teaching_expert'");
        if ($stmt) $totalTeachingExperts = (int)$stmt->fetchColumn();
    } catch (Throwable $ignore) {
        $totalTeachingExperts = 0;
    }

    // Featured job (is_featured column may not exist)
    try {
        $stmt = $pdo->query("SELECT * FROM job_postings WHERE status='active' AND is_featured=1 ORDER BY created_at DESC LIMIT 1");
        if ($stmt) $featuredJob = $stmt->fetch() ?: null;
    } catch (Throwable $ignore) {
        $featuredJob = null;
    }

    // Latest job fallback
    try {
        $stmt = $pdo->query("SELECT * FROM job_postings WHERE status='active' ORDER BY created_at DESC LIMIT 1");
        if ($stmt) $latestJob = $stmt->fetch() ?: null;
    } catch (Throwable $ignore) {
        $latestJob = null;
    }

    // ── Events table (auto-create) ──
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS events (
            event_id INT AUTO_INCREMENT PRIMARY KEY,
            event_type ENUM('hackathon','seminar','webinar','workshop') NOT NULL DEFAULT 'seminar',
            title VARCHAR(255) NOT NULL,
            theme VARCHAR(255) DEFAULT NULL,
            description TEXT,
            speaker_name VARCHAR(128) DEFAULT NULL,
            prize_pool VARCHAR(64) DEFAULT NULL,
            event_date DATETIME NOT NULL,
            registration_link VARCHAR(512) DEFAULT NULL,
            calendar_link VARCHAR(512) DEFAULT NULL,
            status ENUM('upcoming','live','past') NOT NULL DEFAULT 'upcoming',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (Throwable $ignore) {}

    // Next hackathon
    try {
        $stmt = $pdo->query("SELECT * FROM events WHERE event_type='hackathon' AND status IN ('upcoming','live') ORDER BY event_date ASC LIMIT 1");
        if ($stmt) $nextHackathon = $stmt->fetch() ?: null;
    } catch (Throwable $ignore) {}

    // Next seminar/webinar
    try {
        $stmt = $pdo->query("SELECT * FROM events WHERE event_type IN ('seminar','webinar') AND status IN ('upcoming','live') ORDER BY event_date ASC LIMIT 1");
        if ($stmt) $nextSeminar = $stmt->fetch() ?: null;
    } catch (Throwable $ignore) {}

    // ── Project enquiries table (auto-create) ──
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS project_enquiries (
            enquiry_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(128) NOT NULL,
            service VARCHAR(128) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            status ENUM('new','contacted','closed') NOT NULL DEFAULT 'new',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (Throwable $ignore) {}

    // ── Testimonials ──
    try {
        $stmt = $pdo->query("SELECT * FROM testimonials WHERE is_active=1 ORDER BY sort_order ASC LIMIT 4");
        if ($stmt) {
            $dbTestimonials = $stmt->fetchAll() ?: [];
            // Map DB columns to frontend template keys
            foreach ($dbTestimonials as $t) {
                $tName = $t['name'] ?? 'User';
                $words = explode(' ', trim($tName));
                $initials = strtoupper(substr($words[0] ?? 'U', 0, 1) . (isset($words[1]) ? substr($words[1], 0, 1) : ''));
                $testimonials[] = [
                    'name' => $tName,
                    'role' => $t['designation'] ?? '',
                    'quote' => $t['quote'] ?? '',
                    'avatar_initials' => $initials,
                ];
            }
        }
    } catch (Throwable $ignore) {}

    // Projects completed
    try {
        $stmt = $pdo->query("SELECT COUNT(*) FROM projects WHERE status='completed'");
        if ($stmt) $totalProjectsCompleted = (int)$stmt->fetchColumn();
    } catch (Throwable $ignore) {
        $totalProjectsCompleted = 0;
    }

} catch (Throwable $e) {
    // DB error fallback
    if ($totalOpenPositions == 0) $totalOpenPositions = 0;
}

// Fallback testimonials
if (empty($testimonials)) {
    $testimonials = [
        ['name' => 'Rahul Patel', 'role' => 'Vendor Partner', 'quote' => 'Joining Karya Saarthi as a vendor was the best decision for my business. The support system is incredible, and I grew my client base by 3x in just 6 months.', 'avatar_initials' => 'RP'],
        ['name' => 'Ananya Sharma', 'role' => 'Campus Saarthi', 'quote' => 'As a Campus Saarthi, I developed leadership skills I never knew I had. I managed events, built a network of students, and earned while studying.', 'avatar_initials' => 'AS'],
        ['name' => 'Vikram Kumar', 'role' => 'Team Member', 'quote' => 'I joined as a fresher and within a year I was leading a team. Karya Saarthi does not just offer a job, it offers a career path with real growth.', 'avatar_initials' => 'VK'],
        ['name' => 'Priya Singh', 'role' => 'Teaching Expert', 'quote' => 'The freedom to design my own curriculum while getting full institutional support is rare. Karya Saarthi truly values educators and their craft.', 'avatar_initials' => 'PS'],
    ];
}

// Use featured job or fallback to latest
$jobOfWeek = $featuredJob ?: $latestJob;

// 6 category definitions (Removed Campus Saarthi as requested)
$categories = [
    ['key' => 'employee',        'label' => 'Internal Member',     'badge' => 'Full-time',  'title' => 'Core Team Roles',          'icon' => 'fas fa-user-tie',     'color' => 'amber',  'who' => 'Experienced professionals seeking PM, Ops, Marketing, HR or Tech roles', 'link' => '/careers.php?category=employee'],
    ['key' => 'pillar_post',     'label' => 'Our Saarthi Post',       'badge' => 'Pillar',     'title' => 'Saarthi Leadership',       'icon' => 'fas fa-landmark',     'color' => 'purple', 'who' => 'Campus, Digital, Calling, Govt & Market Saarthi leadership positions', 'link' => '/careers.php?category=pillar_post'],
    ['key' => 'vendor',          'label' => 'Vendor / Freelancer', 'badge' => 'External',   'title' => 'Project Expert',           'icon' => 'fas fa-briefcase',    'color' => 'blue',   'who' => 'Skilled professionals for client projects as external vendor partners', 'link' => '/careers.php?category=vendor'],
    ['key' => 'intern',          'label' => 'Intern',              'badge' => 'Internship', 'title' => 'Internship Program',       'icon' => 'fas fa-book-reader',  'color' => 'cyan',   'who' => 'Students & freshers looking for 1-6 month hands-on experience', 'link' => '/careers.php?category=intern'],
    ['key' => 'part_time',       'label' => 'Part-Time / Remote',  'badge' => 'Flexible',   'title' => 'Flexible Roles',           'icon' => 'fas fa-clock',        'color' => 'pink',   'who' => 'Content writers, designers, calling agents looking for WFH work', 'link' => '/careers.php?category=part_time'],
    ['key' => 'teaching_expert', 'label' => 'Teaching Expert',     'badge' => 'Educator',   'title' => 'Training & Mentorship',    'icon' => 'fas fa-chalkboard-teacher','color' => 'rose','who' => 'Educators and trainers who want to mentor the next generation', 'link' => '/careers.php?category=teaching_expert'],
];

require_once __DIR__ . '/includes/header.php';
?>

<!-- ============================================================
     CUSTOM STYLES
     ============================================================ -->
<style>
/* Animations */
@keyframes fadeUp   { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
@keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
@keyframes countUp  { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }

/* Scroll reveal */
.scroll-reveal { opacity:0; transform:translateY(30px); transition:opacity 0.7s ease, transform 0.7s ease; }
.scroll-reveal.revealed { opacity:1; transform:translateY(0); }
.stagger-children .scroll-reveal:nth-child(1){transition-delay:0.05s}
.stagger-children .scroll-reveal:nth-child(2){transition-delay:0.1s}
.stagger-children .scroll-reveal:nth-child(3){transition-delay:0.15s}
.stagger-children .scroll-reveal:nth-child(4){transition-delay:0.2s}
.stagger-children .scroll-reveal:nth-child(5){transition-delay:0.25s}

/* Hover lift */
.hover-lift { transition: all 0.35s cubic-bezier(.4,0,.2,1); }
.hover-lift:hover { transform: translateY(-8px); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }

/* Hero animations */
.hero-slide-up { animation: fadeUp 0.8s ease-out forwards; opacity:0; }
.hero-slide-up-d1 { animation-delay:0.1s }
.hero-slide-up-d2 { animation-delay:0.2s }
.hero-slide-up-d3 { animation-delay:0.3s }
.hero-slide-up-d4 { animation-delay:0.4s }

/* Toast */
.toast-success { position:fixed; bottom:2rem; right:2rem; z-index:9999; padding:1rem 1.5rem; background:#1c1c1c; border:1px solid #262626; color:#fff; border-radius:10px; box-shadow:0 10px 25px rgba(0,0,0,0.5); font-weight:500; font-size:14px; transform:translateY(120%); transition:transform 0.4s ease; }
.toast-success.show { transform:translateY(0); }
</style>


<!-- ============================================================
     1. HERO SECTION
     ============================================================ -->
<section class="relative overflow-hidden text-ink bg-canvas">
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-28 w-full">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <!-- Left Side -->
            <div class="order-1">
                <!-- Main heading -->
                <div class="mb-5 hero-slide-up hero-slide-up-d1">
                    <h1 class="text-[36px] sm:text-5xl md:text-[72px] lg:text-[85px] font-display tracking-display-xl leading-tight md:leading-[0.95]">
                        Build your career<br>
                        with Karya Saarthi.
                    </h1>
                </div>

                <!-- Subtitle -->
                <div class="mb-5 hero-slide-up hero-slide-up-d2 max-w-2xl">
                    <p class="text-[16px] sm:text-[20px] md:text-[22px] tracking-[-0.01px] leading-[1.40] text-ink-muted">
                        Discover meaningful opportunities, work on live projects, and accelerate your professional growth. Whether you're a student, educator, or industry expert, we have a role for you.
                    </p>
                </div>

                <!-- CTA Buttons -->
                <div class="flex flex-row gap-3 mb-8 hero-slide-up hero-slide-up-d3">
                    <a href="<?= BASE_PATH ?>/register.php" class="button-primary text-center">
                        Get started for free
                    </a>
                    <a href="<?= BASE_PATH ?>/careers.php" class="button-secondary text-center">
                        Explore Jobs
                    </a>
                </div>
            </div>
            
            <!-- Right Side Video — shown on all screen sizes -->
            <div class="order-2 relative hero-slide-up hero-slide-up-d4">
                <div class="relative w-full max-w-[560px] mx-auto aspect-video">
                    <div class="absolute inset-0 bg-gradient-to-tr from-accent-blue/30 via-gradient-magenta/20 to-gradient-coral/30 rounded-[2rem] blur-[60px] animate-pulse"></div>
                    <video autoplay loop muted playsinline class="relative z-10 w-full h-full object-cover rounded-2xl lg:rounded-3xl shadow-[0_0_50px_rgba(0,153,255,0.2)] border border-hairline" poster="<?= BASE_PATH ?>/images/karyasaarthi.png">
                        <source src="<?= BASE_PATH ?>/images/karyasaarthi.mp4" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>
        </div>
    </div>
</section>


<!-- ============================================================
     2. SEVEN HIRING CATEGORY TILES
     ============================================================ -->
<section id="categories" class="scroll-reveal py-[96px] bg-canvas">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-14 max-w-3xl">
            <h2 class="text-[62px] font-display tracking-display-lg leading-[1.00] text-ink mb-6">Our Hiring Categories</h2>
            <p class="text-[24px] tracking-[-0.01px] leading-[1.30] text-ink-muted">Whether you're a student, professional, educator, or freelancer — we have a place for you.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 stagger-children">
            <?php foreach ($categories as $cat): $count = (int)($jobCounts[$cat['key']] ?? 0); ?>
            <a href="<?= $cat['link'] ?>" class="scroll-reveal hover-lift bg-surface-1 rounded-xl p-[24px] flex flex-col group border border-hairline transition-all">
                <span class="inline-block text-[13px] font-medium text-ink-muted mb-4"><?= $cat['badge'] ?></span>
                <h3 class="text-[32px] font-display tracking-display-md text-ink mb-2 leading-[1.13]"><?= $cat['label'] ?></h3>
                <p class="text-[15px] tracking-[-0.15px] leading-[1.30] text-ink-muted mb-6 line-clamp-2"><?= $cat['who'] ?></p>
                
                <div class="mt-auto">
                    <p class="text-[22px] font-bold tracking-headline text-ink mb-1"><?= $count ?></p>
                    <p class="text-[13px] font-medium text-ink-muted mb-6">Open <?= $count === 1 ? 'Job' : 'Jobs' ?></p>
                    <span class="button-translucent w-full transition-colors duration-200 group-hover:bg-surface-2 group-hover:border-hairline">View Jobs &rarr;</span>
                </div>
            </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>


<!-- ============================================================
     3. HOMEPAGE BOXES (7 boxes)
     ============================================================ -->
<section class="scroll-reveal py-[96px] bg-canvas">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-14 max-w-3xl">
            <h2 class="text-[85px] font-display tracking-display-xl leading-[0.95] text-ink mb-6">What's Happening</h2>
            <p class="text-[24px] tracking-[-0.01px] leading-[1.30] text-ink-muted">Events, stats, featured roles, and more — all at a glance.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 stagger-children">
            <!-- Hackathon Gradient Spotlight -->
            <div class="scroll-reveal hover-lift spotlight-violet rounded-xxl p-[32px] flex flex-col relative overflow-hidden text-ink">
                <h3 class="text-[24px] font-normal tracking-[-0.01px] mb-2">Next Hackathon</h3>
                <?php if ($nextHackathon): ?>
                    <p class="text-[32px] font-display tracking-display-md mb-4"><?= htmlspecialchars($nextHackathon['title'], ENT_QUOTES, 'UTF-8', false) ?></p>
                    <div class="flex items-center gap-2 text-[14px] font-medium opacity-80 mb-6">
                        <span><?= date('d M Y, h:i A', strtotime($nextHackathon['event_date'])) ?></span>
                    </div>
                    <?php if (!empty($nextHackathon['registration_link'])): ?>
                        <a href="<?= htmlspecialchars($nextHackathon['registration_link'], ENT_QUOTES, 'UTF-8', false) ?>" target="_blank" class="button-translucent mt-auto self-start bg-black/20 hover:bg-black/40 border-none !text-ink">Register Now</a>
                    <?php endif; ?>
                <?php else: ?>
                    <p class="text-[32px] font-display tracking-display-md opacity-70 mb-4">Coming Soon</p>
                <?php endif; ?>
            </div>

            <!-- Stats Grid within Surface-1 -->
            <div class="scroll-reveal hover-lift bg-surface-1 rounded-xl p-[32px] border border-hairline flex flex-col">
                <h3 class="text-[24px] font-normal tracking-[-0.01px] text-ink-muted mb-6">Platform Scale</h3>
                <div class="grid grid-cols-2 gap-4 mt-auto">
                    <div class="p-4 bg-canvas rounded-lg border border-hairline">
                        <p class="text-[32px] font-display tracking-display-md text-ink mb-1"><span class="counter-animate" data-target="<?= $totalOpenPositions ?>">0</span></p>
                        <p class="text-[13px] font-medium text-ink-muted">Open Positions</p>
                    </div>
                    <div class="p-4 bg-canvas rounded-lg border border-hairline">
                        <p class="text-[32px] font-display tracking-display-md text-ink mb-1"><span class="counter-animate" data-target="<?= $totalTeamMembers ?>">0</span></p>
                        <p class="text-[13px] font-medium text-ink-muted">Team Members</p>
                    </div>
                    <div class="p-4 bg-canvas rounded-lg border border-hairline">
                        <p class="text-[32px] font-display tracking-display-md text-ink mb-1"><span class="counter-animate" data-target="<?= $totalCampusSaarthis ?>">0</span></p>
                        <p class="text-[13px] font-medium text-ink-muted">Campus Saarthis</p>
                    </div>
                    <div class="p-4 bg-canvas rounded-lg border border-hairline">
                        <p class="text-[32px] font-display tracking-display-md text-ink mb-1"><span class="counter-animate" data-target="<?= $totalVendors ?>">0</span></p>
                        <p class="text-[13px] font-medium text-ink-muted">Vendors</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
            <!-- Job of the week -->
            <div class="scroll-reveal hover-lift bg-surface-2 rounded-xl p-[24px] border border-hairline flex flex-col">
                <div class="mb-6"><span class="inline-block px-3 py-1 bg-surface-1 rounded-full text-[13px] font-medium text-ink">Job of the Week</span></div>
                <?php if ($jobOfWeek): ?>
                    <h3 class="text-[22px] font-bold tracking-headline text-ink mb-2"><?= htmlspecialchars($jobOfWeek['title'], ENT_QUOTES, 'UTF-8', false) ?></h3>
                    <p class="text-[15px] tracking-[-0.15px] leading-[1.30] text-ink-muted mb-6"><?= htmlspecialchars($jobOfWeek['department'] ?? 'General', ENT_QUOTES, 'UTF-8', false) ?></p>
                    <div class="mt-auto flex gap-2">
                        <a href="<?= BASE_PATH ?>/job-detail.php?id=<?= $jobOfWeek['job_id'] ?>" class="button-secondary flex-1 border-hairline-soft">Details</a>
                        <a href="<?= BASE_PATH ?>/register.php?job=<?= $jobOfWeek['job_id'] ?>" class="button-primary flex-1">Apply</a>
                    </div>
                <?php else: ?>
                    <h3 class="text-[22px] font-bold tracking-headline text-ink-muted mb-2 opacity-50">No featured job</h3>
                <?php endif; ?>
            </div>

            <!-- Project Enquiry -->
            <div class="scroll-reveal hover-lift bg-surface-1 rounded-xl p-[24px] border border-hairline flex flex-col md:col-span-2">
                <h3 class="text-[22px] font-bold tracking-headline text-ink mb-2">Project Enquiry</h3>
                <p class="text-[15px] tracking-[-0.15px] leading-[1.30] text-ink-muted mb-6">Need a project solution? Tell us what you need.</p>
                <form id="enquiryForm" class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto" onsubmit="return submitEnquiry(event)">
                    <input type="text" name="name" placeholder="Your Name" required class="text-input">
                    <select name="service" required class="text-input" style="color: #ffffff; background-color: #141414;">
                        <option value="">Select Service</option>
                        <option value="Web Development">Web Development</option>
                        <option value="App Development">App Development</option>
                        <option value="Digital Marketing">Digital Marketing</option>
                        <option value="Other">Other</option>
                    </select>
                    <input type="tel" name="phone" placeholder="Phone Number" required pattern="[0-9]{10}" class="text-input">
                    <button type="submit" id="enquiryBtn" class="button-primary w-full">Send Enquiry</button>
                </form>
            </div>
        </div>
    </div>
</section>


<!-- ============================================================
     4. HOW IT WORKS — 5-Step Process
     ============================================================ -->
<section class="scroll-reveal py-20 bg-canvas border-t border-hairline">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-14">
            <span class="inline-block px-4 py-1.5 bg-accent-blue/10 text-accent-blue text-sm font-semibold rounded-full mb-4">How It Works</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-ink mb-4">5-Step Application Process</h2>
            <p class="text-lg text-ink-muted max-w-2xl mx-auto">From discovery to onboarding — your journey with us in 5 simple steps.</p>
        </div>

        <?php
        $steps = [
            ['icon' => 'fas fa-search',         'color' => 'blue',   'title' => 'Browse Jobs',     'desc' => 'Explore openings across 7 categories. Filter by type, location, and department.'],
            ['icon' => 'fas fa-file-alt',        'color' => 'orange', 'title' => 'Apply Online',    'desc' => 'Complete our simple 3-step form with your info, preferred role, and resume.'],
            ['icon' => 'fas fa-user-check',      'color' => 'purple', 'title' => 'HR Review',       'desc' => 'Our HR team reviews your profile and shortlists candidates within 48 hours.'],
            ['icon' => 'fas fa-comments',        'color' => 'pink',   'title' => 'Interview',       'desc' => 'A quick video or phone interview with our team via Google Meet.'],
            ['icon' => 'fas fa-check-circle',    'color' => 'green',  'title' => 'Get Hired',       'desc' => 'Receive your digital offer letter, complete onboarding, and start your journey.'],
        ];
        $stepColors = [
            'blue'   => ['bg' => 'bg-accent-blue/10',   'text' => 'text-accent-blue',   'border' => 'border-hairline hover:border-accent-blue',   'num' => 'bg-accent-blue'],
            'orange' => ['bg' => 'bg-gradient-orange/10', 'text' => 'text-gradient-orange', 'border' => 'border-hairline hover:border-gradient-orange', 'num' => 'bg-gradient-orange'],
            'purple' => ['bg' => 'bg-gradient-violet/10', 'text' => 'text-gradient-violet', 'border' => 'border-hairline hover:border-gradient-violet', 'num' => 'bg-gradient-violet'],
            'pink'   => ['bg' => 'bg-gradient-magenta/10',   'text' => 'text-gradient-magenta',   'border' => 'border-hairline hover:border-gradient-magenta',   'num' => 'bg-gradient-magenta'],
            'green'  => ['bg' => 'bg-semantic-success/10',  'text' => 'text-semantic-success',  'border' => 'border-hairline hover:border-semantic-success',  'num' => 'bg-semantic-success'],
        ];
        ?>

        <!-- Desktop -->
        <div class="hidden md:block relative">
            <div class="absolute top-16 left-[10%] right-[10%] h-0.5 border-t-[3px] border-dashed border-hairline"></div>
            <div class="grid grid-cols-5 gap-6 relative stagger-children">
                <?php foreach ($steps as $i => $step):
                    $sc = $stepColors[$step['color']];
                ?>
                <div class="scroll-reveal text-center process-dot">
                    <div class="relative z-10 w-28 h-28 mx-auto bg-surface-1 rounded-2xl shadow-lg border-2 <?= $sc['border'] ?> flex flex-col items-center justify-center mb-5 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all">
                        <i class="<?= $step['icon'] ?> <?= $sc['text'] ?> text-xl mb-1"></i>
                        <span class="text-[10px] font-bold <?= $sc['text'] ?> uppercase">Step <?= $i + 1 ?></span>
                    </div>
                    <h3 class="text-sm font-bold text-ink mb-1"><?= $step['title'] ?></h3>
                    <p class="text-xs text-ink-muted leading-relaxed"><?= $step['desc'] ?></p>
                </div>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Mobile -->
        <div class="md:hidden space-y-5 stagger-children">
            <?php foreach ($steps as $i => $step):
                $sc = $stepColors[$step['color']];
            ?>
            <div class="scroll-reveal flex items-start gap-4 p-4 bg-surface-1 rounded-xl border border-hairline">
                <div class="flex-shrink-0 w-11 h-11 <?= $sc['bg'] ?> <?= $sc['text'] ?> rounded-xl flex items-center justify-center font-bold text-sm"><?= $i + 1 ?></div>
                <div>
                    <h3 class="font-bold text-ink text-sm"><?= $step['title'] ?></h3>
                    <p class="text-xs text-ink-muted mt-1"><?= $step['desc'] ?></p>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>


<!-- ============================================================
     5. WHY JOIN KARYA SAARTHI
     ============================================================ -->
<section class="scroll-reveal py-20 bg-surface-1 border-t border-hairline">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-14">
            <span class="inline-block px-4 py-1.5 bg-semantic-success/10 text-semantic-success text-sm font-semibold rounded-full mb-4">Benefits</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-ink mb-4">Why Join Karya Saarthi?</h2>
            <p class="text-lg text-ink-muted max-w-2xl mx-auto">We believe in empowering our team with the tools, mentorship, and flexibility they need to thrive.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
            <?php
            $benefits = [
                ['icon' => 'fas fa-project-diagram', 'color' => 'blue',    'title' => 'Real Projects',         'desc' => 'Work on live client projects from day one. Build a portfolio that sets you apart in your career.'],
                ['icon' => 'fas fa-home',             'color' => 'green',   'title' => 'Flexible Work',         'desc' => 'Work from anywhere with flexible hours. We value output over hours, giving you freedom to manage your time.'],
                ['icon' => 'fas fa-chart-line',       'color' => 'purple',  'title' => 'Growth Culture',        'desc' => 'Performance-based promotions and clear career ladders. Your hard work gets recognized and rewarded.'],
                ['icon' => 'fas fa-certificate',      'color' => 'amber',   'title' => 'Certificate & LOR',     'desc' => 'Interns get completion certificates, top performers get awards and letters of recommendation.'],
                ['icon' => 'fas fa-wallet',           'color' => 'pink',    'title' => 'Commission Earnings',   'desc' => 'Earn commissions on referrals and projects. Campus Saarthis earn up to 10% per successful onboarding.'],
                ['icon' => 'fas fa-user-graduate',    'color' => 'cyan',    'title' => 'Expert Mentorship',     'desc' => 'Learn directly from industry professionals. Get guidance, feedback, and mentorship that accelerates your growth.'],
            ];
            $bColors = [
                'blue'   => ['bg' => 'bg-accent-blue/10',   'text' => 'text-accent-blue'],
                'green'  => ['bg' => 'bg-semantic-success/10',  'text' => 'text-semantic-success'],
                'purple' => ['bg' => 'bg-gradient-violet/10', 'text' => 'text-gradient-violet'],
                'amber'  => ['bg' => 'bg-gradient-orange/10',  'text' => 'text-gradient-orange'],
                'pink'   => ['bg' => 'bg-gradient-magenta/10',   'text' => 'text-gradient-magenta'],
                'cyan'   => ['bg' => 'bg-cyan-500/10',   'text' => 'text-cyan-500'],
            ];
            foreach ($benefits as $b):
                $bc = $bColors[$b['color']];
            ?>
            <div class="scroll-reveal hover-lift bg-canvas rounded-2xl p-8 shadow-none border border-hairline">
                <div class="w-14 h-14 <?= $bc['bg'] ?> <?= $bc['text'] ?> rounded-xl flex items-center justify-center mb-5">
                    <i class="<?= $b['icon'] ?> text-2xl"></i>
                </div>
                <h3 class="text-xl font-bold text-ink mb-2"><?= $b['title'] ?></h3>
                <p class="text-ink-muted leading-relaxed"><?= $b['desc'] ?></p>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>


<!-- ============================================================
     6. TESTIMONIALS
     ============================================================ -->
<section class="scroll-reveal py-20 bg-canvas border-t border-hairline">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-14">
            <span class="inline-block px-4 py-1.5 bg-gradient-orange/10 text-gradient-orange text-sm font-semibold rounded-full mb-4">Testimonials</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-ink mb-4">Success Stories</h2>
            <p class="text-lg text-ink-muted max-w-2xl mx-auto">Hear from the people who have built their careers with Karya Saarthi.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            <?php
            $tColors = ['orange', 'emerald', 'indigo', 'cyan'];
            foreach ($testimonials as $i => $t):
                $tc = $tColors[$i % count($tColors)];
                $tName = $t['name'] ?? 'User';
                $initials = $t['avatar_initials'] ?? strtoupper(substr($tName, 0, 1));
            ?>
            <div class="scroll-reveal hover-lift bg-surface-1 rounded-2xl p-7 border border-hairline relative">
                <div class="absolute top-5 right-5 text-<?= $tc ?>-500/20"><i class="fas fa-quote-right text-3xl"></i></div>
                <div class="flex items-center mb-5 relative z-10">
                    <div class="w-12 h-12 bg-<?= $tc ?>-500/20 rounded-full flex items-center justify-center text-<?= $tc ?>-400 font-bold text-lg border border-<?= $tc ?>-500/30"><?= htmlspecialchars($initials, ENT_QUOTES, 'UTF-8', false) ?></div>
                    <div class="ml-3">
                        <h4 class="font-bold text-ink text-sm"><?= htmlspecialchars($t['name'], ENT_QUOTES, 'UTF-8', false) ?></h4>
                        <p class="text-xs text-<?= $tc ?>-400 font-medium"><?= htmlspecialchars($t['role'], ENT_QUOTES, 'UTF-8', false) ?></p>
                    </div>
                </div>
                <p class="text-sm text-ink-muted leading-relaxed mb-4 relative z-10">"<?= htmlspecialchars($t['quote'], ENT_QUOTES, 'UTF-8', false) ?>"</p>
                <div class="flex text-yellow-500 text-xs relative z-10"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>


<!-- ============================================================
     7. CTA SECTION
     ============================================================ -->
<section class="scroll-reveal py-[96px] bg-canvas border-t border-hairline">
    <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-[62px] font-display tracking-display-lg leading-[1.00] text-ink mb-6">Ready to Start?</h2>
        <p class="text-[24px] tracking-[-0.01px] leading-[1.30] text-ink-muted mb-10 max-w-2xl mx-auto">Join thousands of professionals who chose Karya Saarthi as their career partner. Your next opportunity is just a click away.</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="<?= BASE_PATH ?>/register.php" class="button-primary px-8 py-3 text-[16px]">
                Apply Now <i class="fas fa-arrow-right ml-2"></i>
            </a>
            <a href="<?= BASE_PATH ?>/contact.php" class="button-secondary px-8 py-3 text-[16px]">
                <i class="fas fa-envelope mr-2"></i> Contact Us
            </a>
        </div>
    </div>
</section>


<!-- ============================================================
     JAVASCRIPT — Counters, Scroll Reveal, Enquiry AJAX, Countdown
     ============================================================ -->
<script>
// ── Scroll Reveal ──
(function(){
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('revealed'); observer.unobserve(e.target); }});
    }, {threshold: 0.1, rootMargin: '0px 0px -40px 0px'});
    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
})();

// ── Counter Animation ──
(function(){
    const counters = document.querySelectorAll('.counter-animate');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting){
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-target')) || 0;
                if(target === 0){ el.textContent = '0'; return; }
                let current = 0;
                const duration = 2000;
                const step = Math.max(1, Math.floor(target / (duration / 16)));
                const timer = setInterval(() => {
                    current += step;
                    if(current >= target){ current = target; clearInterval(timer); }
                    el.textContent = current.toLocaleString();
                }, 16);
                observer.unobserve(el);
            }
        });
    }, {threshold: 0.3});
    counters.forEach(c => observer.observe(c));
})();

// ── Project Enquiry AJAX ──
function submitEnquiry(e){
    e.preventDefault();
    const form = document.getElementById('enquiryForm');
    const btn = document.getElementById('enquiryBtn');
    const fd = new FormData(form);
    const data = {name: fd.get('name'), service: fd.get('service'), phone: fd.get('phone')};

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    fetch('/api/leads.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({...data, source: 'homepage_enquiry', type: 'project_enquiry'})
    })
    .then(r => r.json())
    .then(res => {
        if(res.success || res.status === 'success'){
            form.reset();
            showToast('Enquiry sent successfully! We will contact you soon.');
        } else {
            showToast(res.message || 'Something went wrong. Please try again.', true);
        }
    })
    .catch(() => {
        showToast('Network error. Please try again.', true);
    })
    .finally(() => {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Enquiry';
    });

    return false;
}

// ── Referral Form (placeholder) ──
function submitReferral(e){
    e.preventDefault();
    showToast('Referral submitted! We will reach out to your friend.');
    document.getElementById('referralForm').reset();
    return false;
}

// ── Toast ──
function showToast(msg, isError){
    let existing = document.querySelector('.toast-success');
    if(existing) existing.remove();
    const t = document.createElement('div');
    t.className = 'toast-success' + (isError ? ' !bg-red-600' : '');
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => { t.classList.add('show'); });
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 4000);
}

// ── Hackathon Countdown ──
(function(){
    const el = document.getElementById('hackathon-countdown');
    if(!el) return;
    const target = new Date(el.getAttribute('data-target-date')).getTime();
    if(isNaN(target)) return;
    function update(){
        const now = Date.now();
        const diff = target - now;
        if(diff <= 0){
            el.innerHTML = '<span class="text-sm font-bold text-green-600">Event is Live!</span>';
            return;
        }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        document.getElementById('hk-days').textContent = String(d).padStart(2,'0');
        document.getElementById('hk-hours').textContent = String(h).padStart(2,'0');
        document.getElementById('hk-mins').textContent = String(m).padStart(2,'0');
        document.getElementById('hk-secs').textContent = String(s).padStart(2,'0');
        requestAnimationFrame(update);
    }
    update();
    setInterval(update, 1000);
})();

// ── Tilt 3D on category cards ──
document.querySelectorAll('.tilt-3d').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xPct = (x / rect.width - 0.5) * 2;
        const yPct = (y / rect.height - 0.5) * 2;
        card.style.transform = `translateY(-8px) rotateX(${-yPct * 4}deg) rotateY(${xPct * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});
</script>

<!-- Toast container -->
<div id="toast-container"></div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>





