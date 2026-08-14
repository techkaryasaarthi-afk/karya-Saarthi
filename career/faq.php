<?php
$pageTitle = 'Frequently Asked Questions';
$pageDescription = 'Find answers to common questions about careers, internships, vendor registration, and more at Karya Saarthi. Hum Hai Aapke Saarthi!';
$pageKeywords = 'Karya Saarthi FAQ, career questions, internship FAQ, vendor FAQ, campus saarthi questions, application help';
require_once __DIR__ . '/config/database.php';

// Auto-create FAQs table if it does not exist
$faqs = [];
try {
    $pdo = getDBConnection();
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

    $stmt = $pdo->query("SELECT id, question, answer, category, sort_order FROM faqs WHERE is_active = 1 OR is_active IS NULL ORDER BY sort_order ASC, id ASC");
    $faqs = $stmt->fetchAll();
} catch (Exception $e) {
    error_log("FAQ Error: " . $e->getMessage());
    // Silently fail for users, but log it for us
}

// Fallback hardcoded FAQs if database is empty or unavailable
if (empty($faqs)) {
    $faqs = [
        ['id' => 1, 'question' => 'How do I apply for a position at Karya Saarthi?', 'answer' => 'Visit our Careers page, browse the available positions, and click "Apply Now" on any job that interests you. You will need to fill out our application form with your details and upload your resume.', 'category' => 'Application', 'sort_order' => 0],
        ['id' => 2, 'question' => 'What internship programs does Karya Saarthi offer?', 'answer' => 'We offer 1-6 month internship programs across departments including Marketing, Operations, HR, Tech, and Content. Interns get real project experience, mentorship, certificates, and stipends based on performance.', 'category' => 'Intern', 'sort_order' => 1],
        ['id' => 3, 'question' => 'What is the Campus Saarthi program?', 'answer' => 'Campus Saarthi is our student ambassador program. As a Campus Saarthi, you represent Karya Saarthi at your college, organize events, refer students, and earn commissions. It is a great way to develop leadership skills while still studying.', 'category' => 'Campus Saarthi', 'sort_order' => 2],
        ['id' => 4, 'question' => 'How does the Vendor/Freelancer partnership work?', 'answer' => 'Vendors and freelancers can register on our platform to receive project assignments. We match your skills with client requirements, handle payments, and provide ongoing project support. Payments are transparent and processed on time.', 'category' => 'Vendor', 'sort_order' => 3],
        ['id' => 5, 'question' => 'What are the Teaching Expert roles?', 'answer' => 'Teaching Experts are experienced professionals and educators who conduct live training sessions, workshops, and mentorship programs. You get the freedom to design your own curriculum while receiving institutional support from Karya Saarthi.', 'category' => 'Teaching Expert', 'sort_order' => 4],
        ['id' => 6, 'question' => 'Is remote work available at Karya Saarthi?', 'answer' => 'Yes! Many of our roles including Part-Time, Content Writing, Digital Marketing, and Calling roles support work-from-home arrangements. We value output over hours and provide flexible schedules.', 'category' => 'General', 'sort_order' => 5],
        ['id' => 7, 'question' => 'How long does the hiring process take?', 'answer' => 'Our HR team reviews applications within 48 hours. Shortlisted candidates are contacted for a brief interview (video or phone call). The entire process from application to offer letter typically takes 3-7 business days.', 'category' => 'Application', 'sort_order' => 6],
        ['id' => 8, 'question' => 'Do interns receive certificates?', 'answer' => 'Yes, all interns who successfully complete their internship tenure receive an official completion certificate. Top performers also receive Letters of Recommendation (LOR) and performance awards.', 'category' => 'Intern', 'sort_order' => 7],
    ];
}

// Extract unique categories
$categories = array_unique(array_column($faqs, 'category'));
sort($categories);

require_once __DIR__ . '/includes/header.php';
?>

<style>
    .animate-on-scroll { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .animate-on-scroll.visible { opacity: 1; transform: translateY(0); }
    .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
    .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.1); }
    .faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.4s ease, padding 0.3s ease; }
    .faq-answer.open { max-height: 500px; }
    .faq-chevron { transition: transform 0.3s ease; }
    .faq-chevron.rotated { transform: rotate(180deg); }
    .category-tab { transition: all 0.2s ease; }
    .category-tab.active { background-color: #2563eb; color: white; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }
</style>

<!-- Hero Section -->
<section class="relative overflow-hidden">
    <div class="absolute inset-0 gradient-bg opacity-95"></div>
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 animate-on-scroll">Frequently Asked Questions</h1>
        <p class="text-lg text-indigo-100 max-w-2xl mx-auto mb-8 animate-on-scroll">Find quick answers to common questions about careers, internships, vendor partnerships, and more.</p>
        <!-- Search Bar -->
        <div class="max-w-xl mx-auto animate-on-scroll">
            <div class="relative">
                <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted opacity-80"></i>
                <input type="text" id="faq-search" placeholder="Search your question..." class="w-full pl-12 pr-10 py-4 rounded-2xl text-ink font-semibold text-sm focus:ring-4 focus:ring-white/30 focus:outline-none shadow-lg border-0" autocomplete="off">
                <button id="faq-search-clear" class="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted opacity-80 hover:text-ink-muted hidden" title="Clear search">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    </div>
</section>

<!-- Category Tabs + FAQ List -->
<section class="py-12 bg-surface-2">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Category Tabs -->
        <div class="mb-8 animate-on-scroll">
            <div class="flex flex-wrap gap-2 justify-center" id="category-tabs">
                <button class="category-tab active px-4 py-2 rounded-full text-sm font-medium bg-surface-2 text-ink" data-category="all">
                    <i class="fas fa-th-large mr-1"></i> All
                </button>
                <?php
                $catIcons = [
                    'General' => 'fa-circle-question',
                    'Teaching Expert' => 'fa-chalkboard-teacher',
                    'Intern' => 'fa-book-reader',
                    'Campus Saarthi' => 'fa-graduation-cap',
                    'Vendor' => 'fa-briefcase',
                    'Application' => 'fa-file-alt',
                ];
                foreach ($categories as $cat):
                    $icon = $catIcons[$cat] ?? 'fa-tag';
                ?>
                <button class="category-tab px-4 py-2 rounded-full text-sm font-medium bg-surface-2 text-ink" data-category="<?= htmlspecialchars(strtolower(str_replace(' ', '-', $cat))) ?>">
                    <i class="fas <?= $icon ?> mr-1"></i> <?= htmlspecialchars($cat, ENT_QUOTES, 'UTF-8', false) ?>
                </button>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- FAQ Results Count -->
        <p id="faq-results-count" class="text-sm text-ink-muted mb-4 text-center animate-on-scroll">Showing <span id="visible-count"><?= count($faqs) ?></span> of <?= count($faqs) ?> questions</p>

        <!-- FAQ Accordion -->
        <div id="faq-list" class="space-y-3 animate-on-scroll">
            <?php foreach ($faqs as $i => $faq): ?>
            <div class="faq-item bg-surface-1 rounded-xl border border-hairline overflow-hidden hover-lift"
                 data-category="<?= htmlspecialchars(strtolower(str_replace(' ', '-', $faq['category']))) ?>"
                 data-question="<?= htmlspecialchars(strtolower($faq['question']), ENT_QUOTES, 'UTF-8', false) ?>"
                 data-answer="<?= htmlspecialchars(strtolower($faq['answer']), ENT_QUOTES, 'UTF-8', false) ?>">
                <button class="faq-toggle w-full text-left px-5 py-4 flex items-center gap-3" aria-expanded="false">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <?php
                            $badgeColors = [
                                'General' => 'bg-surface-2 text-ink-muted',
                                'Teaching Expert' => 'bg-green-100 text-green-700',
                                'Intern' => 'bg-orange-100 text-orange-700',
                                'Campus Saarthi' => 'bg-purple-100 text-purple-700',
                                'Vendor' => 'bg-blue-100 text-blue-700',
                                'Application' => 'bg-cyan-100 text-cyan-700',
                            ];
                            $badge = $badgeColors[$faq['category']] ?? 'bg-surface-2 text-ink-muted';
                            ?>
                            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full <?= $badge ?>"><?= htmlspecialchars($faq['category'], ENT_QUOTES, 'UTF-8', false) ?></span>
                        </div>
                        <h3 class="text-sm sm:text-base font-semibold text-ink font-bold leading-snug"><?= htmlspecialchars($faq['question'], ENT_QUOTES, 'UTF-8', false) ?></h3>
                    </div>
                    <i class="fas fa-chevron-down faq-chevron text-ink-muted opacity-80 text-sm flex-shrink-0"></i>
                </button>
                <div class="faq-answer px-5">
                    <div class="pb-5 pt-1 text-sm text-ink-muted leading-relaxed border-t border-hairline-soft">
                        <?= nl2br(htmlspecialchars($faq['answer'], ENT_QUOTES, 'UTF-8', false)) ?>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>

        <!-- No Results State -->
        <div id="faq-no-results" class="hidden text-center py-16">
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-surface-2 mb-5">
                <i class="fas fa-search text-3xl text-ink-muted opacity-50"></i>
            </div>
            <h3 class="text-lg font-semibold text-ink mb-2">No matching questions found</h3>
            <p class="text-sm text-ink-muted mb-4">Try a different search term or browse by category.</p>
            <button onclick="document.getElementById('faq-search').value=''; filterFAQs();" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
                <i class="fas fa-redo mr-1"></i> Reset Search
            </button>
        </div>
    </div>
</section>

<!-- CTA Section -->
<section class="py-16 animate-on-scroll">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-surface-1 rounded-3xl border border-hairline shadow-none p-10 text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mb-5">
                <i class="fas fa-headset text-2xl"></i>
            </div>
            <h2 class="text-2xl sm:text-3xl font-bold text-ink font-bold mb-3">Still Have Questions?</h2>
            <p class="text-ink-muted mb-6 max-w-lg mx-auto">Can not find what you are looking for? Our team is here to help. Reach out and we will get back to you within 24 hours.</p>
            <div class="flex flex-col sm:flex-row justify-center gap-3">
                <a href="<?= BASE_PATH ?>/contact.php" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition shadow-md">
                    <i class="fas fa-envelope mr-2"></i> Contact Us
                </a>
                <a href="https://wa.me/918595275753?text=Hi!%20I%20have%20a%20question%20about%20Karya%20Saarthi." target="_blank" rel="noopener noreferrer" class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl text-sm font-semibold transition shadow-md">
                    <i class="fab fa-whatsapp mr-2"></i> WhatsApp Us
                </a>
            </div>
        </div>
    </div>
</section>

<!-- FAQ Schema Markup -->
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        <?php foreach ($faqs as $i => $faq): ?>
        {
            "@type": "Question",
            "name": <?= json_encode($faq['question']) ?>,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": <?= json_encode($faq['answer']) ?>
            }
        }<?= $i < count($faqs) - 1 ? ',' : '' ?>
        <?php endforeach; ?>
    ]
}
</script>

<!-- FAQ Interaction Script -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Scroll animations
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.animate-on-scroll').forEach(function(el) { observer.observe(el); });

    // Accordion toggle
    document.querySelectorAll('.faq-toggle').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const chevron = this.querySelector('.faq-chevron');
            const isOpen = answer.classList.contains('open');

            // Close all others
            document.querySelectorAll('.faq-answer.open').forEach(function(a) {
                a.classList.remove('open');
                a.previousElementSibling.querySelector('.faq-chevron').classList.remove('rotated');
                a.previousElementSibling.setAttribute('aria-expanded', 'false');
            });

            if (!isOpen) {
                answer.classList.add('open');
                chevron.classList.add('rotated');
                this.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // Category tabs
    document.querySelectorAll('.category-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.category-tab').forEach(function(t) { t.classList.remove('active'); });
            this.classList.add('active');
            filterFAQs();
        });
    });

    // Search input
    var searchInput = document.getElementById('faq-search');
    var clearBtn = document.getElementById('faq-search-clear');
    var debounceTimer;
    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        clearBtn.classList.toggle('hidden', !this.value);
        debounceTimer = setTimeout(filterFAQs, 200);
    });
    clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        clearBtn.classList.add('hidden');
        filterFAQs();
        searchInput.focus();
    });
});

function filterFAQs() {
    var search = document.getElementById('faq-search').value.toLowerCase().trim();
    var activeTab = document.querySelector('.category-tab.active');
    var category = activeTab ? activeTab.getAttribute('data-category') : 'all';
    var items = document.querySelectorAll('.faq-item');
    var visibleCount = 0;

    items.forEach(function(item) {
        var matchesCategory = category === 'all' || item.getAttribute('data-category') === category;
        var matchesSearch = !search ||
            item.getAttribute('data-question').indexOf(search) !== -1 ||
            item.getAttribute('data-answer').indexOf(search) !== -1;

        if (matchesCategory && matchesSearch) {
            item.style.display = '';
            visibleCount++;
        } else {
            item.style.display = 'none';
            // Close if hidden
            var answer = item.querySelector('.faq-answer');
            if (answer) { answer.classList.remove('open'); }
            var chevron = item.querySelector('.faq-chevron');
            if (chevron) { chevron.classList.remove('rotated'); }
        }
    });

    document.getElementById('visible-count').textContent = visibleCount;
    document.getElementById('faq-no-results').classList.toggle('hidden', visibleCount > 0);
    document.getElementById('faq-list').classList.toggle('hidden', visibleCount === 0);
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>






