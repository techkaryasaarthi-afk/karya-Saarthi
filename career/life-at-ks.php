<?php
$pageTitle = 'Life at Karya Saarthi — Our Culture & Values';
$pageDescription = 'Discover life at Karya Saarthi — our culture, values, team events, perks and what makes us a great place to work. Hum Hai Aapke Saarthi!';
$pageKeywords = 'Karya Saarthi culture, life at Karya Saarthi, company values, team events, employee benefits, work culture India';
require_once __DIR__ . '/config/database.php';

// Load gallery from DB
$galleryImages = [];
try {
    $pdo = getDBConnection();
    $pdo->exec("CREATE TABLE IF NOT EXISTS gallery (
        image_id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(200) NOT NULL, description TEXT,
        image_url VARCHAR(500) NOT NULL, category ENUM('team','events','office','celebrations','awards') DEFAULT 'team',
        is_active BOOLEAN DEFAULT TRUE, sort_order INT DEFAULT 0, uploaded_by VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    $galleryImages = $pdo->query("SELECT * FROM gallery WHERE (is_active = 1 OR is_active IS NULL) ORDER BY sort_order ASC, created_at DESC")->fetchAll();
} catch (Exception $e) {}

// Load testimonials from DB
$dbTestimonials = [];
try {
    $pdo = $pdo ?? getDBConnection();
    $pdo->exec("CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, designation VARCHAR(200),
        quote TEXT NOT NULL, photo_url VARCHAR(500), is_active BOOLEAN DEFAULT TRUE, sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    $dbTestimonials = $pdo->query("SELECT * FROM testimonials WHERE (is_active = 1 OR is_active IS NULL) ORDER BY sort_order ASC, created_at DESC")->fetchAll();
} catch (Exception $e) {}

$upcomingEvents = [];
$pastEvents = [];
$eom = null;
$lifeVideos = [];

try {
    $pdo = $pdo ?? getDBConnection();
    
    // Fetch events
    $upcomingEvents = $pdo->query("SELECT event_id, event_type, title, description, date_start AS event_date, status, speaker_name, prize_pool, registration_link FROM events WHERE status IN ('upcoming', 'live') ORDER BY date_start ASC LIMIT 4")->fetchAll();
    $pastEvents = $pdo->query("SELECT event_id, event_type, title, description, date_start AS event_date, status, speaker_name, prize_pool, registration_link FROM events WHERE status = 'past' ORDER BY date_start DESC LIMIT 4")->fetchAll();

    // Fetch EOM
    $eoms = $pdo->query("SELECT * FROM employee_of_month WHERE (is_active = 1 OR is_active IS NULL) ORDER BY eom_id DESC LIMIT 1")->fetchAll();
    $eom = !empty($eoms) ? $eoms[0] : null;

    // Fetch videos
    $lifeVideos = $pdo->query("SELECT * FROM life_videos WHERE (is_active = 1 OR is_active IS NULL) ORDER BY sort_order ASC, video_id DESC LIMIT 6")->fetchAll();
} catch (Exception $e) {}

require_once __DIR__ . '/includes/header.php';
?>

<style>
    .animate-on-scroll { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .animate-on-scroll.visible { opacity: 1; transform: translateY(0); }
    .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
    .hover-lift:hover { transform: translateY(-6px); box-shadow: 0 12px 30px rgba(0,0,0,0.12); }
    .tilt-3d { perspective: 800px; }
    .tilt-3d:hover { transform: rotateY(3deg) rotateX(2deg) translateY(-6px); }
    .perks-strip { display: flex; gap: 1.5rem; overflow-x: auto; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
    .perks-strip::-webkit-scrollbar { display: none; }
    .gallery-masonry { column-count: 3; column-gap: 1rem; }
    @media (max-width: 768px) { .gallery-masonry { column-count: 2; } }
    @media (max-width: 480px) { .gallery-masonry { column-count: 1; } }
    .quote-card::before { content: '\201C'; font-size: 4rem; line-height: 1; color: #dbeafe; position: absolute; top: -0.25rem; left: 1rem; font-family: Georgia, serif; }
</style>

<!-- 1. Hero Section -->
<section class="relative overflow-hidden">
    <div class="absolute inset-0 gradient-bg opacity-95"></div>
    <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-5 animate-on-scroll">Life at Karya Saarthi</h1>
        <p class="text-lg sm:text-xl text-indigo-100 max-w-3xl mx-auto mb-8 animate-on-scroll">Discover what makes us different — our culture, our people, our values</p>
        <div class="flex justify-center gap-4 animate-on-scroll">
            <a href="<?= BASE_PATH ?>/careers.php" class="button-primary px-6 py-3 rounded-xl text-sm font-semibold transition shadow-lg">View Open Roles</a>
            <a href="#values" class="button-secondary px-6 py-3 rounded-xl text-sm font-semibold transition">Our Values</a>
        </div>
    </div>
</section>

<!-- 2. Company Values -->
<section id="values" class="py-16 bg-canvas">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12 animate-on-scroll">
            <span class="inline-block bg-primary-100 text-primary-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">Our Core Values</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-ink mb-3">The 5T Framework</h2>
            <p class="text-ink-muted max-w-2xl mx-auto">Everything we do is guided by five principles that shape our culture and drive our growth.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <?php
            $values = [
                ['icon' => 'fa-chalkboard-teacher', 'color' => 'blue', 'title' => 'Teach', 'desc' => 'We believe in sharing knowledge freely. Every team member is both a learner and a mentor.'],
                ['icon' => 'fa-handshake', 'color' => 'green', 'title' => 'Trust', 'desc' => 'Transparency and honesty are non-negotiable. We build trust through consistent actions.'],
                ['icon' => 'fa-users', 'color' => 'purple', 'title' => 'Team', 'desc' => 'Collaboration over competition. Together we achieve what no individual can alone.'],
                ['icon' => 'fa-rocket', 'color' => 'orange', 'title' => 'Transform', 'desc' => 'We embrace change and innovation. Every challenge is an opportunity to evolve.'],
                ['icon' => 'fa-seedling', 'color' => 'teal', 'title' => 'Thrive', 'desc' => 'We create an environment where people grow, succeed, and find purpose in their work.'],
            ];
            foreach ($values as $i => $v):
                $bgColors = ['blue' => 'bg-blue-50 text-blue-600', 'green' => 'bg-green-500/10 text-green-600', 'purple' => 'bg-purple-50 text-purple-600', 'orange' => 'bg-orange-50 text-orange-600', 'teal' => 'bg-teal-50 text-teal-600'];
                $borderColors = ['blue' => 'border-blue-200', 'green' => 'border-green-200', 'purple' => 'border-purple-200', 'orange' => 'border-orange-200', 'teal' => 'border-teal-200'];
            ?>
            <div class="tilt-3d hover-lift animate-on-scroll bg-surface-1 rounded-2xl border border-hairline p-6 text-center" style="transition-delay: <?= $i * 100 ?>ms">
                <div class="inline-flex items-center justify-center w-14 h-14 <?= $bgColors[$v['color']] ?> rounded-2xl mb-4">
                    <i class="fas <?= $v['icon'] ?> text-xl"></i>
                </div>
                <h3 class="text-lg font-bold text-ink mb-2"><?= $v['title'] ?></h3>
                <p class="text-sm text-ink-muted leading-relaxed"><?= $v['desc'] ?></p>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- 3. Photo Gallery -->
<section class="py-16 bg-surface-1">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12 animate-on-scroll">
            <span class="inline-block bg-accent-100 text-accent-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">Gallery</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-ink mb-3">Moments That Matter</h2>
            <p class="text-ink-muted max-w-2xl mx-auto">A glimpse into our daily life, team outings, and celebrations.</p>
        </div>
        <?php if (!empty($galleryImages)): ?>
        <div class="gallery-masonry animate-on-scroll">
            <?php foreach ($galleryImages as $img):
                $catColors = ['team'=>'blue','events'=>'purple','office'=>'green','celebrations'=>'orange','awards'=>'amber'];
                $color = $catColors[$img['category']] ?? 'gray';
            ?>
            <div class="rounded-2xl mb-4 overflow-hidden break-inside-avoid hover-lift cursor-pointer group relative">
                <img src="<?= htmlspecialchars($img['image_url'], ENT_QUOTES, 'UTF-8', false) ?>" alt="<?= htmlspecialchars($img['title'], ENT_QUOTES, 'UTF-8', false) ?>" class="w-full h-auto object-cover rounded-2xl" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
                <div class="bg-gradient-to-br from-<?= $color ?>-400 to-<?= $color ?>-600 h-48 rounded-2xl flex-col items-center justify-center text-white hidden">
                    <i class="fas fa-image text-4xl mb-3 opacity-80"></i>
                    <span class="text-sm font-semibold opacity-90"><?= htmlspecialchars($img['title'], ENT_QUOTES, 'UTF-8', false) ?></span>
                </div>
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-2xl opacity-0 group-hover:opacity-100 transition">
                    <p class="text-white text-sm font-semibold"><?= htmlspecialchars($img['title'], ENT_QUOTES, 'UTF-8', false) ?></p>
                    <span class="text-xs text-white/70 capitalize"><?= htmlspecialchars($img['category'], ENT_QUOTES, 'UTF-8', false) ?></span>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
        <?php else: ?>
        <!-- Placeholder gallery until HR uploads photos -->
        <div class="gallery-masonry animate-on-scroll">
            <?php
            $placeholders = [
                ['h'=>'h-48','bg'=>'from-blue-400 to-blue-600','icon'=>'fa-users','label'=>'Team Huddle'],
                ['h'=>'h-64','bg'=>'from-purple-400 to-purple-600','icon'=>'fa-laptop-code','label'=>'Work Sessions'],
                ['h'=>'h-52','bg'=>'from-green-400 to-green-600','icon'=>'fa-birthday-cake','label'=>'Celebrations'],
                ['h'=>'h-56','bg'=>'from-orange-400 to-orange-600','icon'=>'fa-trophy','label'=>'Award Ceremony'],
                ['h'=>'h-48','bg'=>'from-pink-400 to-pink-600','icon'=>'fa-gamepad','label'=>'Fun Friday'],
                ['h'=>'h-60','bg'=>'from-teal-400 to-teal-600','icon'=>'fa-hands-helping','label'=>'Volunteering'],
            ];
            foreach ($placeholders as $item): ?>
            <div class="bg-gradient-to-br <?= $item['bg'] ?> <?= $item['h'] ?> rounded-2xl mb-4 flex flex-col items-center justify-center text-white break-inside-avoid hover-lift cursor-pointer">
                <i class="fas <?= $item['icon'] ?> text-4xl mb-3 opacity-80"></i>
                <span class="text-sm font-semibold opacity-90"><?= $item['label'] ?></span>
            </div>
            <?php endforeach; ?>
        </div>
        <p class="text-center text-xs text-ink-muted opacity-80 mt-6 animate-on-scroll"><i class="fas fa-info-circle mr-1"></i> HR can upload real photos via Admin Panel → Gallery Manager</p>
        <?php endif; ?>
    </div>
</section>

<!-- 4. Employee Quotes / Testimonials -->
<section class="py-16 bg-canvas">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12 animate-on-scroll">
            <span class="inline-block bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">Voices</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-ink mb-3">What Our Team Says</h2>
            <p class="text-ink-muted max-w-2xl mx-auto">Real stories from real people who chose Karya Saarthi.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <?php
            // Use DB testimonials if available, otherwise fallback
            if (!empty($dbTestimonials)) {
                $testimonials = [];
                $colors = ['blue','purple','green','orange','teal','pink'];
                foreach ($dbTestimonials as $i => $t) {
                    $words = explode(' ', trim($t['name']));
                    $initials = strtoupper(substr($words[0],0,1) . (isset($words[1]) ? substr($words[1],0,1) : ''));
                    $testimonials[] = [
                        'initials' => $initials,
                        'name' => $t['name'],
                        'role' => $t['designation'] ?? '',
                        'quote' => $t['quote'],
                        'color' => $colors[$i % count($colors)],
                        'photo_url' => $t['photo_url'] ?? '',
                    ];
                }
            } else {
                $testimonials = [
                    ['initials' => 'RK', 'name' => 'Rahul Kumar', 'role' => 'Marketing Intern', 'quote' => 'Karya Saarthi gave me real-world exposure that no classroom ever could. The mentorship here is genuine and the learning curve is incredible.', 'color' => 'blue', 'photo_url' => ''],
                    ['initials' => 'PS', 'name' => 'Priya Sharma', 'role' => 'Campus Saarthi', 'quote' => 'Being a Campus Saarthi helped me develop leadership skills while still in college. The support from the team made it an amazing experience.', 'color' => 'purple', 'photo_url' => ''],
                    ['initials' => 'AV', 'name' => 'Aman Verma', 'role' => 'Vendor Partner', 'quote' => 'Transparent processes and on-time payments — that is what sets Karya Saarthi apart. They truly treat vendors as partners, not just service providers.', 'color' => 'green', 'photo_url' => ''],
                    ['initials' => 'NS', 'name' => 'Neha Singh', 'role' => 'Teaching Expert', 'quote' => 'I love how Karya Saarthi values expertise and gives trainers the freedom to design their own curriculum. It is a platform that respects educators.', 'color' => 'orange', 'photo_url' => ''],
                ];
            }
            foreach ($testimonials as $i => $t):
                $avatarBg = ['blue' => 'bg-blue-100 text-blue-600', 'purple' => 'bg-purple-100 text-purple-600', 'green' => 'bg-green-100 text-green-600', 'orange' => 'bg-orange-100 text-orange-600', 'teal' => 'bg-teal-100 text-teal-600', 'pink' => 'bg-pink-100 text-pink-600'];
            ?>
            <div class="animate-on-scroll relative bg-surface-1 rounded-2xl p-6 hover-lift border border-hairline quote-card" style="transition-delay: <?= $i * 120 ?>ms">
                <p class="text-ink-muted leading-relaxed mb-5 pl-8 italic"><?= htmlspecialchars($t['quote'], ENT_QUOTES, 'UTF-8', false) ?></p>
                <div class="flex items-center gap-3">
                    <?php if (!empty($t['photo_url'])): ?>
                        <img src="<?= htmlspecialchars($t['photo_url'], ENT_QUOTES, 'UTF-8', false) ?>" alt="<?= htmlspecialchars($t['name'], ENT_QUOTES, 'UTF-8', false) ?>" class="w-11 h-11 rounded-full object-cover flex-shrink-0" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
                        <div class="w-11 h-11 <?= $avatarBg[$t['color']] ?? 'bg-surface-2 text-ink-muted' ?> rounded-full items-center justify-center font-bold text-sm flex-shrink-0 hidden"><?= htmlspecialchars($t['initials'], ENT_QUOTES, 'UTF-8', false) ?></div>
                    <?php else: ?>
                        <div class="w-11 h-11 <?= $avatarBg[$t['color']] ?? 'bg-surface-2 text-ink-muted' ?> rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"><?= htmlspecialchars($t['initials'], ENT_QUOTES, 'UTF-8', false) ?></div>
                    <?php endif; ?>
                    <div>
                        <p class="font-semibold text-ink text-sm"><?= $t['name'] ?></p>
                        <p class="text-xs text-ink-muted"><?= $t['role'] ?></p>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- 5. Perks & Benefits Strip -->
<section class="py-16 bg-surface-1">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10 animate-on-scroll">
            <span class="inline-block bg-primary-100 text-primary-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">Perks</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-ink mb-3">Why You Will Love Working Here</h2>
        </div>
        <div class="perks-strip pb-4 animate-on-scroll">
            <?php
            $perks = [
                ['icon' => 'fa-home', 'label' => 'Work From Home', 'color' => 'blue'],
                ['icon' => 'fa-clock', 'label' => 'Flexible Hours', 'color' => 'purple'],
                ['icon' => 'fa-chart-line', 'label' => 'Performance Growth', 'color' => 'green'],
                ['icon' => 'fa-project-diagram', 'label' => 'Real Experience', 'color' => 'orange'],
                ['icon' => 'fa-book-open', 'label' => 'Learning Culture', 'color' => 'teal'],
                ['icon' => 'fa-certificate', 'label' => 'Certificate', 'color' => 'pink'],
                ['icon' => 'fa-rupee-sign', 'label' => 'Stipend', 'color' => 'amber'],
            ];
            foreach ($perks as $p):
                $colors = ['blue' => 'bg-blue-100 text-blue-600 border-blue-200', 'purple' => 'bg-purple-100 text-purple-600 border-purple-200', 'green' => 'bg-green-100 text-green-600 border-green-200', 'orange' => 'bg-orange-100 text-orange-600 border-orange-200', 'teal' => 'bg-teal-100 text-teal-600 border-teal-200', 'pink' => 'bg-pink-100 text-pink-600 border-pink-200', 'amber' => 'bg-amber-100 text-amber-600 border-amber-200'];
            ?>
            <div class="flex-shrink-0 w-36 bg-surface-1 rounded-2xl border border-hairline p-5 text-center hover-lift">
                <div class="inline-flex items-center justify-center w-12 h-12 <?= implode(' ', array_slice(explode(' ', $colors[$p['color']]), 0, 2)) ?> rounded-xl mb-3">
                    <i class="fas <?= $p['icon'] ?> text-lg"></i>
                </div>
                <p class="text-xs font-semibold text-ink-muted"><?= $p['label'] ?></p>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- 6. Team Events Section -->
<section class="py-16 bg-canvas">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12 animate-on-scroll">
            <span class="inline-block bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">Events</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-ink mb-3">Team Events &amp; Celebrations</h2>
            <p class="text-ink-muted max-w-2xl mx-auto">Work hard, celebrate harder. Here is what we have been up to.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <!-- Past Events -->
            <div class="animate-on-scroll">
                <h3 class="text-lg font-bold text-ink mb-5 flex items-center"><i class="fas fa-history text-primary-500 mr-2"></i> Past Events</h3>
                <div class="space-y-4">
                    <?php
                    if (empty($pastEvents)) {
                        $pastEvents = [
                            ['event_date' => '2024-03-15 10:00:00', 'title' => 'Team Workshop', 'description' => 'Full-day skills workshop covering communication, project management, and leadership fundamentals.', 'event_type' => 'workshop', 'color' => 'blue'],
                            ['event_date' => '2024-02-20 09:00:00', 'title' => 'Hackathon 2024', 'description' => '24-hour hackathon where teams built innovative solutions for real client challenges.', 'event_type' => 'hackathon', 'color' => 'green'],
                        ];
                    }
                    foreach ($pastEvents as $i => $e):
                        $colors = ['blue', 'green', 'orange', 'purple', 'teal'];
                        $color = $e['color'] ?? $colors[$i % count($colors)];
                        $cardColors = ['blue' => 'border-l-blue-500 bg-surface-2', 'green' => 'border-l-green-500 bg-surface-2', 'orange' => 'border-l-orange-500 bg-surface-2', 'purple' => 'border-l-purple-500 bg-surface-2', 'teal' => 'border-l-teal-500 bg-surface-2'];
                        
                        $iconMap = ['hackathon' => 'fa-code', 'seminar' => 'fa-microphone', 'webinar' => 'fa-laptop', 'workshop' => 'fa-tools'];
                        $icon = $iconMap[$e['event_type'] ?? ''] ?? 'fa-calendar-check';
                    ?>
                    <div class="border-l-4 <?= $cardColors[$color] ?> rounded-r-xl p-4 hover-lift">
                        <div class="flex items-center gap-2 mb-1">
                            <i class="fas <?= $icon ?> text-ink-muted text-sm"></i>
                            <span class="text-xs text-ink-muted font-medium"><?= date('M d, Y', strtotime($e['event_date'])) ?></span>
                        </div>
                        <h4 class="font-bold text-ink text-sm mb-1"><?= htmlspecialchars($e['title'], ENT_QUOTES, 'UTF-8', false) ?></h4>
                        <p class="text-xs text-ink-muted leading-relaxed line-clamp-2"><?= htmlspecialchars(strip_tags($e['description'] ?? ''), ENT_QUOTES, 'UTF-8', false) ?></p>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- Upcoming Events -->
            <div class="animate-on-scroll" style="transition-delay: 150ms">
                <h3 class="text-lg font-bold text-ink mb-5 flex items-center"><i class="fas fa-calendar-alt text-accent-500 mr-2"></i> Upcoming Events</h3>
                <div class="space-y-4">
                    <?php
                    if (empty($upcomingEvents)) {
                        $upcomingEvents = [
                            ['event_date' => '2024-05-15 10:00:00', 'title' => 'Annual Meetup', 'description' => 'Our biggest event of the year — networking, awards, and team bonding activities.', 'event_type' => 'seminar', 'color' => 'purple'],
                            ['event_date' => '2024-06-20 09:00:00', 'title' => 'Intern Orientation', 'description' => 'Welcome session for the new batch of interns with department introductions and onboarding.', 'event_type' => 'webinar', 'color' => 'teal'],
                        ];
                    }
                    foreach ($upcomingEvents as $i => $e):
                        $colors = ['purple', 'teal', 'pink', 'blue', 'orange'];
                        $color = $e['color'] ?? $colors[$i % count($colors)];
                        $cardColors = ['purple' => 'border-l-purple-500 bg-surface-2', 'teal' => 'border-l-teal-500 bg-surface-2', 'pink' => 'border-l-pink-500 bg-surface-2', 'blue' => 'border-l-blue-500 bg-surface-2', 'orange' => 'border-l-orange-500 bg-surface-2'];
                        
                        $iconMap = ['hackathon' => 'fa-code', 'seminar' => 'fa-microphone', 'webinar' => 'fa-laptop', 'workshop' => 'fa-tools'];
                        $icon = $iconMap[$e['event_type'] ?? ''] ?? 'fa-calendar-alt';
                    ?>
                    <div class="border-l-4 <?= $cardColors[$color] ?> rounded-r-xl p-4 hover-lift">
                        <div class="flex items-center gap-2 mb-1">
                            <i class="fas <?= $icon ?> text-ink-muted text-sm"></i>
                            <span class="text-xs text-ink-muted font-medium"><?= date('M Y', strtotime($e['event_date'])) ?></span>
                            <span class="ml-auto text-[10px] bg-surface-3 text-ink px-2 py-0.5 rounded-full font-bold uppercase">Upcoming</span>
                        </div>
                        <h4 class="font-bold text-ink text-sm mb-1"><?= htmlspecialchars($e['title'], ENT_QUOTES, 'UTF-8', false) ?></h4>
                        <p class="text-xs text-ink-muted leading-relaxed line-clamp-2"><?= htmlspecialchars(strip_tags($e['description'] ?? ''), ENT_QUOTES, 'UTF-8', false) ?></p>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- 7. Awards & Recognition -->
<section class="py-16 bg-surface-1">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12 animate-on-scroll">
            <span class="inline-block bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">Recognition</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-ink mb-3">Awards &amp; Recognition</h2>
            <p class="text-ink-muted max-w-2xl mx-auto">We celebrate excellence and acknowledge the people who make Karya Saarthi great.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Company Achievements -->
            <div class="animate-on-scroll bg-surface-1 rounded-2xl border border-hairline p-8 hover-lift">
                <div class="flex items-center gap-3 mb-6">
                    <div class="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                        <i class="fas fa-trophy text-xl"></i>
                    </div>
                    <h3 class="text-lg font-bold text-ink">Company Achievements</h3>
                </div>
                <div class="space-y-4">
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"><i class="fas fa-star text-sm"></i></div>
                        <div>
                            <p class="font-semibold text-ink text-sm">50+ Team Members</p>
                            <p class="text-xs text-ink-muted">Growing team across multiple departments and cities</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"><i class="fas fa-project-diagram text-sm"></i></div>
                        <div>
                            <p class="font-semibold text-ink text-sm">100+ Projects Delivered</p>
                            <p class="text-xs text-ink-muted">Successfully completed projects across diverse industries</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"><i class="fas fa-graduation-cap text-sm"></i></div>
                        <div>
                            <p class="font-semibold text-ink text-sm">200+ Interns Trained</p>
                            <p class="text-xs text-ink-muted">Providing real-world experience and career launchpad</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Employee of the Month -->
            <div class="animate-on-scroll bg-surface-1 rounded-2xl border border-hairline p-8 hover-lift" style="transition-delay: 150ms">
                <div class="flex items-center gap-3 mb-6">
                    <div class="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center">
                        <i class="fas fa-medal text-xl"></i>
                    </div>
                    <h3 class="text-lg font-bold text-ink">Employee of the Month</h3>
                </div>
                <div class="text-center py-6">
                    <?php if ($eom): ?>
                        <?php if (!empty($eom['photo_url'])): ?>
                            <img src="<?= htmlspecialchars($eom['photo_url'], ENT_QUOTES, 'UTF-8', false) ?>" alt="<?= htmlspecialchars($eom['name'], ENT_QUOTES, 'UTF-8', false) ?>" class="w-24 h-24 rounded-full mx-auto mb-4 object-cover shadow-lg border-2 border-primary-500">
                        <?php else: ?>
                            <div class="w-24 h-24 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg text-white text-3xl font-bold">
                                <?= strtoupper(substr(explode(' ', trim($eom['name']))[0], 0, 1) . (isset(explode(' ', trim($eom['name']))[1]) ? substr(explode(' ', trim($eom['name']))[1], 0, 1) : '')) ?>
                            </div>
                        <?php endif; ?>
                        <p class="text-lg font-bold text-ink mb-1"><?= htmlspecialchars($eom['name'], ENT_QUOTES, 'UTF-8', false) ?></p>
                        <p class="text-sm font-medium text-primary-600 mb-2"><?= htmlspecialchars($eom['designation'], ENT_QUOTES, 'UTF-8', false) ?> <span class="text-ink-muted ml-1">&middot; <?= htmlspecialchars($eom['month_year'], ENT_QUOTES, 'UTF-8', false) ?></span></p>
                        <p class="text-sm text-ink-muted mb-4 line-clamp-3"><?= htmlspecialchars($eom['description'], ENT_QUOTES, 'UTF-8', false) ?></p>
                    <?php else: ?>
                        <div class="w-24 h-24 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                            <i class="fas fa-user text-3xl text-white"></i>
                        </div>
                        <p class="text-lg font-bold text-ink mb-1">Spotlight Coming Soon</p>
                        <p class="text-sm text-ink-muted mb-4">Our monthly recognition program highlights outstanding contributors.</p>
                    <?php endif; ?>
                    <div class="flex justify-center gap-2">
                        <span class="inline-flex items-center text-xs bg-primary-50 text-primary-600 px-3 py-1 rounded-full"><i class="fas fa-award mr-1"></i> Performance</span>
                        <span class="inline-flex items-center text-xs bg-green-500/10 text-green-600 px-3 py-1 rounded-full"><i class="fas fa-heart mr-1"></i> Team Spirit</span>
                        <span class="inline-flex items-center text-xs bg-purple-50 text-purple-600 px-3 py-1 rounded-full"><i class="fas fa-lightbulb mr-1"></i> Innovation</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- 8. Day-in-the-Life Videos -->
<section class="py-16 bg-surface-1">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12 animate-on-scroll">
            <span class="inline-block bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">Videos</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-ink mb-3">A Day in the Life</h2>
            <p class="text-ink-muted max-w-2xl mx-auto">See what a typical day looks like for our team members across different roles.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-on-scroll">
            <?php
            if (empty($lifeVideos)) {
                $lifeVideos = [
                    ['title' => 'Life as an Intern', 'role' => 'Internship Experience', 'video_url' => ''],
                    ['title' => 'Campus Saarthi Journey', 'role' => 'Ambassador Program', 'video_url' => ''],
                    ['title' => 'Vendor Partner Story', 'role' => 'Freelancer Spotlight', 'video_url' => ''],
                ];
            }
            foreach ($lifeVideos as $v):
                $isRealVideo = !empty($v['video_url']);
            ?>
            <a <?= $isRealVideo ? 'href="'.htmlspecialchars($v['video_url'], ENT_QUOTES, 'UTF-8', false).'" target="_blank"' : '' ?> class="relative bg-surface-2 rounded-2xl overflow-hidden group hover-lift block">
                <div class="aspect-video bg-surface-1 flex flex-col items-center justify-center relative">
                    <?php if ($isRealVideo): ?>
                        <div class="absolute inset-0 bg-black/10 z-0"></div>
                    <?php endif; ?>
                    <div class="relative z-10 flex flex-col items-center">
                        <div class="w-16 h-16 bg-surface-1/90 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                            <i class="fas fa-play text-2xl <?= $isRealVideo ? 'text-red-600' : 'text-primary-600' ?> ml-1"></i>
                        </div>
                        <p class="text-sm font-semibold <?= $isRealVideo ? 'text-ink drop-shadow-none' : 'text-ink' ?> text-center px-4"><?= htmlspecialchars($v['title'], ENT_QUOTES, 'UTF-8', false) ?></p>
                        <p class="text-xs <?= $isRealVideo ? 'text-ink-muted drop-shadow-none' : 'text-ink-muted' ?>"><?= htmlspecialchars($v['role'], ENT_QUOTES, 'UTF-8', false) ?></p>
                    </div>
                </div>
                <?php if (!$isRealVideo): ?>
                <div class="absolute top-3 right-3">
                    <span class="text-[10px] bg-gray-900/70 text-white px-2 py-1 rounded-full font-semibold">Coming Soon</span>
                </div>
                <?php endif; ?>
            </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- 9. CTA Section -->
<section class="py-16 animate-on-scroll">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="gradient-bg rounded-3xl p-10 md:p-14 text-center text-white relative overflow-hidden">
            <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
            <div class="relative">
                <h2 class="text-3xl sm:text-4xl font-extrabold mb-4">Ready to Join Our Team?</h2>
                <p class="text-lg text-indigo-100 mb-8 max-w-xl mx-auto">Be part of a team that values growth, innovation, and people. Your next chapter starts here.</p>
                <div class="flex flex-col sm:flex-row justify-center gap-4">
                    <a href="<?= BASE_PATH ?>/careers.php" class="button-primary px-8 py-3 rounded-xl text-sm font-bold transition shadow-lg">
                        <i class="fas fa-briefcase mr-2"></i> View Open Positions
                    </a>
                    <a href="<?= BASE_PATH ?>/register.php" class="button-secondary px-8 py-3 rounded-xl text-sm font-bold transition">
                        <i class="fas fa-paper-plane mr-2"></i> Apply Now
                    </a>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Scroll Animation Script -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.animate-on-scroll').forEach(function(el) {
        observer.observe(el);
    });
});
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>





