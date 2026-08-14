<?php
$pageTitle = 'Announcements';
$pageDescription = 'Stay updated with the latest news, updates, and announcements from Karya Saarthi.';
$pageKeywords = 'Karya Saarthi announcements, latest news, updates, company news';
require_once __DIR__ . '/config/database.php';

$announcements = [];
try {
    $pdo = getDBConnection();
    // Only show active announcements scheduled for now or the past, targeting 'all'
    $stmt = $pdo->query("
        SELECT * FROM announcements 
        WHERE (is_active = 1 OR is_active IS NULL) 
          AND target_audience = 'all' 
          AND (scheduled_at IS NULL OR scheduled_at <= NOW())
        ORDER BY COALESCE(scheduled_at, created_at) DESC
    ");
    $announcements = $stmt->fetchAll();
} catch (Exception $e) {}

require_once __DIR__ . '/includes/header.php';
?>

<style>
    .animate-on-scroll { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .animate-on-scroll.visible { opacity: 1; transform: translateY(0); }
    .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
    .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.1); }
</style>

<div class="bg-surface-2 min-h-screen pt-20 pb-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="text-center mb-12 animate-on-scroll">
            <h1 class="text-3xl sm:text-4xl font-extrabold text-ink mb-4">Latest Announcements</h1>
            <p class="text-lg text-ink-muted max-w-2xl mx-auto">Stay up to date with the newest updates, events, and important notices from Karya Saarthi.</p>
        </div>

        <!-- Announcements List -->
        <?php if (empty($announcements)): ?>
            <div class="bg-surface-1 rounded-2xl shadow-none border border-hairline p-10 text-center animate-on-scroll">
                <div class="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-4 text-ink-muted text-2xl">
                    <i class="fas fa-bullhorn"></i>
                </div>
                <h3 class="text-lg font-bold text-ink mb-2">No Announcements Yet</h3>
                <p class="text-ink-muted">Check back later for updates and news.</p>
            </div>
        <?php else: ?>
            <div class="space-y-6">
                <?php foreach ($announcements as $index => $ann): 
                    $date = $ann['scheduled_at'] ? strtotime($ann['scheduled_at']) : strtotime($ann['created_at']);
                ?>
                <div class="bg-surface-1 rounded-2xl shadow-none border border-hairline p-6 hover-lift animate-on-scroll" style="transition-delay: <?= min($index * 100, 500) ?>ms">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-bullhorn"></i>
                        </div>
                        <div>
                            <h2 class="text-lg font-bold text-ink"><?= htmlspecialchars($ann['title'], ENT_QUOTES, 'UTF-8', false) ?></h2>
                            <p class="text-xs text-ink-muted"><i class="far fa-clock mr-1"></i> <?= date('F j, Y', $date) ?></p>
                        </div>
                    </div>
                    <div class="text-ink prose prose-sm max-w-none">
                        <?= nl2br(htmlspecialchars($ann['content'], ENT_QUOTES, 'UTF-8', false)) ?>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

    document.querySelectorAll('.animate-on-scroll').forEach(function(el) {
        observer.observe(el);
    });
});
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
