<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';
if (session_status() === PHP_SESSION_NONE) secure_session_start();
if (!headers_sent()) set_security_headers();
$currentUser = null;
if (isset($_SESSION['user_id'])) {
    $currentUser = [
        'user_id' => $_SESSION['user_id'],
        'name' => $_SESSION['user_name'],
        'email' => $_SESSION['user_email'],
        'user_type' => $_SESSION['user_type'],
        'profile_photo' => $_SESSION['profile_photo'] ?? null
    ];
}
$pageTitle = $pageTitle ?? 'Karya Saarthi Careers — Join Our Team';
$pageDescription = $pageDescription ?? 'Join India\'s fastest growing project solutions company. Explore career opportunities at Karya Saarthi — internships, vendor partnerships, campus ambassador roles & full-time positions. Hum Hai Aapke Saarthi!';
$pageKeywords = $pageKeywords ?? 'Karya Saarthi careers, jobs at Karya Saarthi, internship India, campus ambassador, vendor partner, freelancer jobs, part-time remote work, 5 pillar jobs, hiring India, career opportunities';
$canonicalUrl = $canonicalUrl ?? 'https://career.karyasaarthi.com' . $_SERVER['REQUEST_URI'];
$ogImage = $ogImage ?? 'https://career.karyasaarthi.com/images/karya-saarthi-og.png';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8', false) ?> | Karya Saarthi</title>
    <meta name="description" content="<?= htmlspecialchars($pageDescription, ENT_QUOTES, 'UTF-8', false) ?>">
    <meta name="keywords" content="<?= htmlspecialchars($pageKeywords, ENT_QUOTES, 'UTF-8', false) ?>">
    <meta name="author" content="Karya Saarthi">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="<?= htmlspecialchars($canonicalUrl, ENT_QUOTES, 'UTF-8', false) ?>">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="<?= htmlspecialchars($canonicalUrl, ENT_QUOTES, 'UTF-8', false) ?>">
    <meta property="og:title" content="<?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8', false) ?> | Karya Saarthi">
    <meta property="og:description" content="<?= htmlspecialchars($pageDescription, ENT_QUOTES, 'UTF-8', false) ?>">
    <meta property="og:image" content="<?= htmlspecialchars($ogImage, ENT_QUOTES, 'UTF-8', false) ?>">
    <meta property="og:site_name" content="Karya Saarthi">
    <meta property="og:locale" content="en_IN">

    <!-- Twitter / X -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@karyasaarthi">
    <meta name="twitter:title" content="<?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8', false) ?> | Karya Saarthi">
    <meta name="twitter:description" content="<?= htmlspecialchars($pageDescription, ENT_QUOTES, 'UTF-8', false) ?>">
    <meta name="twitter:image" content="<?= htmlspecialchars($ogImage, ENT_QUOTES, 'UTF-8', false) ?>">

    <!-- Favicons -->
    <link rel="icon" type="image/png" href="<?= BASE_PATH ?>/images/karyasaarthi.png">
    <link rel="shortcut icon" type="image/png" href="<?= BASE_PATH ?>/images/karyasaarthi.png">
    <link rel="apple-touch-icon" href="<?= BASE_PATH ?>/images/karyasaarthi.png">
    <meta name="theme-color" content="#090909">
    <meta name="msapplication-TileColor" content="#090909">

    <!-- Geo & Contact Meta -->
    <meta name="geo.region" content="IN">
    <meta name="geo.placename" content="India">
    <meta name="contact" content="hr@karyasaarthi.com">
    <meta name="reply-to" content="hr@karyasaarthi.com">

    <!-- PWA -->
    <link rel="manifest" href="<?= BASE_PATH ?>/manifest.json">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

    <!-- Self-hosted CSS — no external CDN dependencies -->
    <link rel="stylesheet" href="<?= BASE_PATH ?>/assets/css/style.css">
    <link rel="stylesheet" href="<?= BASE_PATH ?>/assets/vendor/fontawesome/css/all.min.css">
    <!-- Lottie for animated icons -->
    <script src="https://unpkg.com/@lottiefiles/lottie-player@2.0.8/dist/lottie-player.js"></script>

    <!-- Organization Schema Markup -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Karya Saarthi",
        "alternateName": "Karya Saarthi",
        "url": "https://www.karyasaarthi.com",
        "logo": "https://career.karyasaarthi.com/images/karya-saarthi-logo.png",
        "description": "Karya Saarthi Careers — Join India's fastest growing project solutions company. Explore internships, vendor partnerships, campus ambassador roles, 5 pillar posts & full-time positions.",
        "telephone": ["+91-8595275753", "+91-6238521530"],
        "email": "hr@karyasaarthi.com",
        "foundingLocation": "India",
        "slogan": "Hum Hai Aapke Saarthi",
        "sameAs": [
            "https://www.instagram.com/karyasaarthi/",
            "https://www.facebook.com/profile.php?id=61576877739779",
            "https://www.linkedin.com/in/karya-saarthi%F0%9F%A4%9D-693a01369/",
            "https://x.com/karyasaarthi",
            "https://www.threads.com/@karyasaarthi",
            "https://www.youtube.com/@KaryaSaarthi",
            "https://t.me/karyasaarthi",
            "https://whatsapp.com/channel/0029Vb66k5vADTO79QKvGx0L",
            "https://www.snapchat.com/add/karya_saarthi",
            "https://pin.it/2g5GSYmX4",
            "https://www.reddit.com/u/karyasaarthi/",
            "https://www.quora.com/profile/Karya-Saarthi",
            "https://www.tumblr.com/karyasaarthi",
            "https://www.twitch.tv/karyasaarthi",
            "https://bsky.app/profile/karyasaarthi.bsky.social"
        ],
        "contactPoint": [
            {
                "@type": "ContactPoint",
                "telephone": "+91-8595275753",
                "contactType": "customer service",
                "availableLanguage": ["English", "Hindi"],
                "areaServed": "IN"
            },
            {
                "@type": "ContactPoint",
                "telephone": "+91-6238521530",
                "contactType": "sales",
                "availableLanguage": ["English", "Hindi"],
                "areaServed": "IN"
            }
        ],
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "IN"
        }
    }
    </script>

    <!-- LocalBusiness Schema -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Karya Saarthi",
        "image": "https://career.karyasaarthi.com/images/karya-saarthi-logo.png",
        "description": "Karya Saarthi Careers — Build your career with India's trusted project solutions company. 8 hiring categories, 50+ team members. Hum Hai Aapke Saarthi!",
        "telephone": "+91-8595275753",
        "email": "hr@karyasaarthi.com",
        "url": "https://www.karyasaarthi.com",
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "India"
        },
        "priceRange": "$",
        "openingHours": "Mo-Sa 09:00-18:00",
        "paymentAccepted": "Cash, UPI, Bank Transfer"
    }
    </script>
</head>
<body class="bg-canvas text-ink font-body min-h-screen flex flex-col" <?php if ($currentUser): ?>data-user-type="<?= htmlspecialchars($currentUser['user_type'], ENT_QUOTES, 'UTF-8', false) ?>"<?php endif; ?> <?php if (!empty($_COOKIE['remember_email'])): ?>data-remember-me="true"<?php endif; ?>>
<!-- WhatsApp Float -->
<?php
$waPage = basename($_SERVER['REQUEST_URI'] ?? 'homepage');
$waMsg = 'Hi Karya Saarthi! I\'m interested in career opportunities.';
if (strpos($waPage, 'careers') !== false) {
    $waMsg = 'Hi! I\'m browsing career opportunities at Karya Saarthi.';
} elseif (strpos($waPage, 'apply') !== false) {
    $waMsg = 'Hi! I have a question about applying for a job at Karya Saarthi.';
} elseif (strpos($waPage, 'campus') !== false) {
    $waMsg = 'Hi! I want to know more about the Saarthi program.';
} elseif (strpos($waPage, 'contact') !== false) {
    $waMsg = 'Hi! I need help with something at Karya Saarthi.';
}
?>
<a href="https://wa.me/918595275753?text=<?= urlencode($waMsg) ?>" target="_blank" rel="noopener noreferrer" style="position:fixed;bottom:100px;right:28px;z-index:99998;width:56px;height:56px;background:#25d366;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(37,211,102,0.4);transition:transform 0.3s;text-decoration:none;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'" title="Chat on WhatsApp" aria-label="WhatsApp">
    <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
</a>
<!-- Navbar -->
<?php
$requestUri = $_SERVER['REQUEST_URI'] ?? '';
$isDashboardPage = (
    strpos($requestUri, '/admin/') !== false ||
    strpos($requestUri, '/user-panel/') !== false
);
?>
<nav class="bg-canvas border-b border-hairline sticky top-0 z-50 h-[56px] flex items-center" role="navigation" aria-label="Main navigation">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div class="flex justify-between h-full items-center">
            <div class="flex items-center">
                <a href="<?= BASE_PATH ?>/" class="flex items-center space-x-2" aria-label="Karya Saarthi Home">
                    <img src="<?= BASE_PATH ?>/images/karyasaarthi.png" alt="Karya Saarthi Logo" class="w-8 h-8 rounded-lg object-cover">
                    <span class="text-sm font-bold text-ink">Karya Saarthi</span>
                </a>
            </div>
            
            <!-- Desktop Links -->
            <div class="hidden lg:flex items-center space-x-6 text-[14px] font-medium text-ink-muted">
                <a href="<?= BASE_PATH ?>/" class="hover:text-ink transition">Home</a>
                <a href="<?= BASE_PATH ?>/careers.php" class="hover:text-ink transition">All Jobs</a>
                <div class="relative group h-full flex items-center">
                    <button class="hover:text-ink transition inline-flex items-center cursor-pointer">
                        Categories <i class="fas fa-chevron-down text-[10px] ml-1.5 opacity-70"></i>
                    </button>
                    <div class="absolute left-1/2 -translate-x-1/2 top-full mt-4 w-56 bg-surface-1 rounded-xl shadow-2xl border border-hairline py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <a href="<?= BASE_PATH ?>/careers.php?category=employee" class="block px-4 py-2 text-sm text-ink-muted hover:text-ink hover:bg-surface-2">Internal Member</a>
                        <a href="<?= BASE_PATH ?>/careers.php?category=pillar_post" class="block px-4 py-2 text-sm text-ink-muted hover:text-ink hover:bg-surface-2">Saarthi</a>
                        <a href="<?= BASE_PATH ?>/careers.php?category=vendor" class="block px-4 py-2 text-sm text-ink-muted hover:text-ink hover:bg-surface-2">Vendor / Freelancer</a>
                        <a href="<?= BASE_PATH ?>/careers.php?category=intern" class="block px-4 py-2 text-sm text-ink-muted hover:text-ink hover:bg-surface-2">Internship</a>
                        <a href="<?= BASE_PATH ?>/careers.php?category=part_time" class="block px-4 py-2 text-sm text-ink-muted hover:text-ink hover:bg-surface-2">Part-Time / Remote</a>
                        <a href="<?= BASE_PATH ?>/careers.php?category=teaching_expert" class="block px-4 py-2 text-sm text-ink-muted hover:text-ink hover:bg-surface-2">Teaching Expert</a>
                    </div>
                </div>
                <a href="<?= BASE_PATH ?>/campus-saarthi.php" class="hover:text-ink transition">Saarthi</a>
                <a href="<?= BASE_PATH ?>/life-at-ks.php" class="hover:text-ink transition">Life</a>
                <a href="<?= BASE_PATH ?>/faq.php" class="hover:text-ink transition">FAQ</a>
            </div>

            <!-- Desktop Actions -->
            <div class="hidden lg:flex items-center space-x-3">
                <?php if ($currentUser): ?>
                    <a href="<?= BASE_PATH ?>/user-panel/" class="text-ink-muted hover:text-ink text-[14px] font-medium mr-2">Dashboard</a>
                    <div class="w-8 h-8 bg-surface-1 rounded-full flex items-center justify-center border border-hairline">
                        <span class="text-ink font-semibold text-xs"><?= strtoupper(substr($currentUser['name'] ?? 'User', 0, 2)) ?></span>
                    </div>
                    <a href="<?= BASE_PATH ?>/logout.php" class="button-icon-circular border border-hairline hover:bg-surface-2 transition" aria-label="Logout"><i class="fas fa-sign-out-alt"></i></a>
                <?php else: ?>
                    <a href="<?= BASE_PATH ?>/login.php" class="button-secondary">Sign in</a>
                    <a href="<?= BASE_PATH ?>/register.php" class="button-primary">Get started for free</a>
                <?php endif; ?>
            </div>
            
            <!-- Mobile menu button — hidden on dashboard/admin pages since sidebar handles navigation -->
            <?php if (!$isDashboardPage): ?>
            <div class="lg:hidden flex items-center">
                <button onclick="toggleMobileMenu()" class="text-ink-muted hover:text-ink p-2" aria-label="Toggle menu" id="mobile-menu-btn">
                    <i class="fas fa-bars text-lg" id="mobile-menu-icon"></i>
                </button>
            </div>
            <?php else: ?>
            <!-- On dashboard pages mobile: show compact user info + logout -->
            <div class="lg:hidden flex items-center gap-2">
                <?php if ($currentUser): ?>
                <span class="text-xs text-ink-muted"><?= htmlspecialchars(explode(' ', $currentUser['name'])[0]) ?></span>
                <a href="<?= BASE_PATH ?>/logout.php" class="text-xs text-red-400 hover:text-red-300 px-2 py-1 border border-hairline rounded-lg transition"><i class="fas fa-sign-out-alt"></i></a>
                <?php endif; ?>
            </div>
            <?php endif; ?>
        </div>
    </div>
</nav>

<!-- Mobile menu — only shown on non-dashboard pages -->
<?php if (!$isDashboardPage): ?>
<div id="mobile-menu" class="hidden lg:hidden border-b border-hairline bg-surface-1 w-full z-40 shadow-xl">
    <div class="px-4 py-4 space-y-1">
        <a href="<?= BASE_PATH ?>/" class="block text-ink-muted hover:text-ink py-2 text-sm font-medium">Home</a>
        <a href="<?= BASE_PATH ?>/careers.php" class="block text-ink-muted hover:text-ink py-2 text-sm font-medium">All Jobs</a>
        <!-- Categories sub-list on mobile -->
        <div class="pl-3 border-l border-hairline space-y-1">
            <a href="<?= BASE_PATH ?>/careers.php?category=employee" class="block text-ink-muted hover:text-ink py-1.5 text-sm">Internal Member</a>
            <a href="<?= BASE_PATH ?>/careers.php?category=pillar_post" class="block text-ink-muted hover:text-ink py-1.5 text-sm">Saarthi</a>
            <a href="<?= BASE_PATH ?>/careers.php?category=intern" class="block text-ink-muted hover:text-ink py-1.5 text-sm">Internship</a>
            <a href="<?= BASE_PATH ?>/careers.php?category=part_time" class="block text-ink-muted hover:text-ink py-1.5 text-sm">Part-Time / Remote</a>
            <a href="<?= BASE_PATH ?>/careers.php?category=teaching_expert" class="block text-ink-muted hover:text-ink py-1.5 text-sm">Teaching Expert</a>
        </div>
        <a href="<?= BASE_PATH ?>/campus-saarthi.php" class="block text-ink-muted hover:text-ink py-2 text-sm font-medium">Saarthi</a>
        <a href="<?= BASE_PATH ?>/life-at-ks.php" class="block text-ink-muted hover:text-ink py-2 text-sm font-medium">Life</a>
        <a href="<?= BASE_PATH ?>/faq.php" class="block text-ink-muted hover:text-ink py-2 text-sm font-medium">FAQ</a>
        <?php if ($currentUser): ?>
            <div class="border-t border-hairline my-2 pt-2"></div>
            <a href="<?= BASE_PATH ?>/user-panel/" class="block text-ink-muted hover:text-ink py-2 text-sm font-medium">Dashboard</a>
            <?php if ($currentUser['user_type'] === 'admin'): ?>
                <a href="<?= BASE_PATH ?>/admin/" class="block text-ink-muted hover:text-ink py-2 text-sm font-medium">Admin Panel</a>
            <?php endif; ?>
            <a href="<?= BASE_PATH ?>/logout.php" class="block text-red-400 py-2 text-sm font-medium">Logout</a>
        <?php else: ?>
            <div class="border-t border-hairline my-3 pt-3 flex flex-col gap-2">
                <a href="<?= BASE_PATH ?>/login.php" class="button-secondary w-full justify-center">Sign in</a>
                <a href="<?= BASE_PATH ?>/register.php" class="button-primary w-full justify-center mt-2">Get started for free</a>
            </div>
        <?php endif; ?>
    </div>
</div>
<script>
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.toggle('hidden');
}
</script>
<?php endif; ?>

<main class="flex-1">





