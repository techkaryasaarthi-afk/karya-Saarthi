<?php
$pageTitle = 'Company Policies';
$pageDescription = 'Read Karya Saarthi\'s comprehensive HR policies covering leave, remote work, code of conduct, anti-harassment, confidentiality, vendor engagement, internship, data privacy, grievance redressal, IT usage, and exit procedures.';
require_once __DIR__ . '/config/database.php';

// Create table if not exists
$pdo = getDBConnection();
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

// Fetch active policies
$policies = $pdo->query("SELECT * FROM policies WHERE (is_active = 1 OR is_active IS NULL) ORDER BY sort_order ASC, created_at ASC")->fetchAll();

require_once __DIR__ . '/includes/header.php';
?>

<!-- Hero Section -->
<section class="gradient-bg text-white py-14">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="inline-flex items-center bg-surface-1/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <i class="fas fa-shield-alt mr-2"></i> HR Policies & Guidelines
        </span>
        <h1 class="text-3xl sm:text-4xl font-bold mb-3">Company Policies</h1>
        <p class="text-lg text-indigo-100 max-w-2xl mx-auto">Transparency, fairness, and mutual respect form the foundation of every policy at Karya Saarthi. Please review our guidelines carefully.</p>
    </div>
</section>

<!-- Breadcrumb -->
<nav class="bg-surface-1 border-b border-hairline" aria-label="Breadcrumb">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <ol class="flex items-center space-x-2 text-sm text-ink-muted">
            <li><a href="<?= BASE_PATH ?>/" class="hover:text-primary-600 transition"><i class="fas fa-home mr-1"></i> Home</a></li>
            <li><i class="fas fa-chevron-right text-xs text-ink-muted mx-1"></i></li>
            <li class="text-primary-600 font-medium">Company Policies</li>
        </ol>
    </div>
</nav>

<?php if (empty($policies)): ?>
<!-- No policies yet -->
<section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
    <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-50 mb-6">
        <i class="fas fa-file-alt text-3xl text-primary-300"></i>
    </div>
    <h2 class="text-xl font-semibold text-ink-muted mb-2">Policies Coming Soon</h2>
    <p class="text-ink-muted max-w-md mx-auto mb-6">Our HR team is preparing comprehensive company policies. Please check back soon or contact us for any questions.</p>
    <a href="<?= BASE_PATH ?>/contact.php" class="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition">
        <i class="fas fa-envelope mr-2"></i> Contact HR
    </a>
</section>

<?php else: ?>

<!-- Quick Navigation -->
<section class="bg-surface-1 border-b border-hairline">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p class="text-sm font-semibold text-ink-muted mb-3"><i class="fas fa-compass mr-1 text-primary-600"></i> Quick Navigation</p>
        <div class="flex flex-wrap gap-2">
            <?php foreach ($policies as $pol): ?>
                <a href="#policy-<?= $pol['id'] ?>" class="inline-flex items-center text-xs bg-surface-1 border border-hairline hover:border-primary-300 hover:text-primary-600 text-ink-muted px-3 py-1.5 rounded-full transition">
                    <i class="fas <?= htmlspecialchars($pol['icon'], ENT_QUOTES, 'UTF-8', false) ?> mr-1.5 <?= htmlspecialchars($pol['icon_color'], ENT_QUOTES, 'UTF-8', false) ?>"></i><?= htmlspecialchars($pol['title'], ENT_QUOTES, 'UTF-8', false) ?>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- Policies Accordion -->
<section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div class="space-y-4">
        <?php foreach ($policies as $i => $pol): ?>
        <div id="policy-<?= $pol['id'] ?>" class="bg-surface-1 rounded-xl border border-hairline shadow-none overflow-hidden scroll-mt-24">
            <button onclick="togglePolicy(<?= $pol['id'] ?>)" class="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-surface-2 transition" aria-expanded="false" id="policy-btn-<?= $pol['id'] ?>">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0">
                        <i class="fas <?= htmlspecialchars($pol['icon'], ENT_QUOTES, 'UTF-8', false) ?> <?= htmlspecialchars($pol['icon_color'], ENT_QUOTES, 'UTF-8', false) ?>"></i>
                    </div>
                    <div>
                        <h3 class="text-base font-bold text-ink"><?= ($i + 1) ?>. <?= htmlspecialchars($pol['title'], ENT_QUOTES, 'UTF-8', false) ?></h3>
                        <p class="text-xs text-ink-muted mt-0.5">Applies to: <?= htmlspecialchars($pol['applies_to'], ENT_QUOTES, 'UTF-8', false) ?></p>
                    </div>
                </div>
                <i class="fas fa-chevron-down text-ink-muted transition-transform duration-200" id="policy-chevron-<?= $pol['id'] ?>"></i>
            </button>
            <div class="hidden px-6 pb-6 pt-2" id="policy-content-<?= $pol['id'] ?>">
                <div class="prose prose-sm max-w-none text-ink-muted leading-relaxed">
                    <?= nl2br(htmlspecialchars($pol['content'], ENT_QUOTES, 'UTF-8', false)) ?>
                </div>
                <p class="text-xs text-ink-muted mt-4 pt-3 border-t border-hairline">
                    Last updated: <?= date('d M Y', strtotime($pol['updated_at'])) ?>
                </p>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</section>

<!-- Contact CTA -->
<section class="bg-surface-1 py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-xl font-bold text-ink mb-2">Have Questions About Our Policies?</h2>
        <p class="text-ink-muted mb-6">Reach out to our HR team for clarification on any policy.</p>
        <div class="flex flex-wrap justify-center gap-3">
            <a href="mailto:hr@karyasaarthi.com" class="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
                <i class="fas fa-envelope mr-2"></i> Email HR
            </a>
            <a href="https://wa.me/918595275753?text=Hi%20Karya%20Saarthi!%20I%20have%20a%20question%20about%20your%20HR%20policies." target="_blank" rel="noopener noreferrer" class="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
                <i class="fab fa-whatsapp mr-2"></i> WhatsApp
            </a>
        </div>
    </div>
</section>

<script>
function togglePolicy(id) {
    const content = document.getElementById('policy-content-' + id);
    const chevron = document.getElementById('policy-chevron-' + id);
    const isHidden = content.classList.contains('hidden');

    // Close all others
    document.querySelectorAll('[id^="policy-content-"]').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('[id^="policy-chevron-"]').forEach(el => el.style.transform = 'rotate(0deg)');

    if (isHidden) {
        content.classList.remove('hidden');
        chevron.style.transform = 'rotate(180deg)';
    }
}

// Auto-open if hash in URL
if (window.location.hash) {
    const el = document.querySelector(window.location.hash);
    if (el) {
        const id = el.id.replace('policy-', '');
        togglePolicy(id);
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
}
</script>

<?php endif; ?>

<?php require_once __DIR__ . '/includes/footer.php'; ?>






