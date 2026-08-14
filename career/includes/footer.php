</main>
<?php
$_requestUri = $_SERVER['REQUEST_URI'] ?? '';
$_isDashboardPage = (
    strpos($_requestUri, '/admin/') !== false ||
    strpos($_requestUri, '/user-panel/') !== false
);
if ($_isDashboardPage): ?>
<!-- Minimal dashboard footer -->
<footer class="bg-canvas border-t border-hairline text-[12px] text-ink-muted py-3 px-4 flex items-center justify-between lg:hidden" role="contentinfo">
    <span>&copy; <?= date('Y') ?> Karyanex Pvt. Ltd.</span>
    <a href="<?= BASE_PATH ?>/" class="hover:text-ink transition">karyasaarthi.com</a>
</footer>
<?php else: ?>
<footer class="bg-canvas text-ink-muted mt-auto border-t border-hairline text-[13px]" role="contentinfo">
    <!-- Main Footer Body -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[64px] pb-10">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

            <!-- Brand + Social -->
            <div class="md:col-span-2 lg:col-span-1">
                <div class="flex items-center space-x-2.5 mb-4">
                    <img src="<?= BASE_PATH ?>/images/karyasaarthi.png" alt="Karya Saarthi Logo" class="w-9 h-9 rounded-lg object-cover border border-hairline">
                    <span class="text-[15px] font-bold text-ink">Karya Saarthi</span>
                </div>
                <p class="text-[13px] text-ink-muted leading-relaxed mb-5">Your digital growth partner — expert academic, technical &amp; business services for students and companies across India.</p>
                <!-- Contact Info -->
                <ul class="space-y-2.5 text-[13px] mb-6">
                    <li>
                        <a href="https://wa.me/918595025753" class="flex items-center gap-2.5 hover:text-ink transition group">
                            <span class="w-7 h-7 rounded-md bg-surface-2 flex items-center justify-center flex-shrink-0 group-hover:bg-green-900/40 transition">
                                <i class="fab fa-whatsapp text-[12px] text-green-400"></i>
                            </span>
                            +91 85950 25753
                        </a>
                    </li>
                    <li>
                        <a href="mailto:support@karyasaarthi.com" class="flex items-center gap-2.5 hover:text-ink transition group">
                            <span class="w-7 h-7 rounded-md bg-surface-2 flex items-center justify-center flex-shrink-0 group-hover:bg-zinc-700/50 transition">
                                <i class="fas fa-envelope text-[11px] text-ink-muted"></i>
                            </span>
                            support@karyasaarthi.com
                        </a>
                    </li>
                    <li class="flex items-center gap-2.5">
                        <span class="w-7 h-7 rounded-md bg-surface-2 flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-clock text-[11px] text-ink-muted"></i>
                        </span>
                        Mon–Sat: 9:00 AM – 6:00 PM
                    </li>
                </ul>
                <!-- Social Icons -->
                <div class="flex flex-wrap gap-2">
                    <a href="https://www.instagram.com/karyasaarthi/" target="_blank" rel="noopener noreferrer" class="w-8 h-8 bg-surface-2 hover:bg-pink-600/80 border border-hairline rounded-lg flex items-center justify-center text-ink-muted hover:text-white transition" aria-label="Instagram"><i class="fab fa-instagram text-[12px]"></i></a>
                    <a href="https://www.linkedin.com/in/karya-saarthi%F0%9F%A4%9D-693a01369/" target="_blank" rel="noopener noreferrer" class="w-8 h-8 bg-surface-2 hover:bg-blue-700/80 border border-hairline rounded-lg flex items-center justify-center text-ink-muted hover:text-white transition" aria-label="LinkedIn"><i class="fab fa-linkedin-in text-[12px]"></i></a>
                    <a href="https://www.youtube.com/@KaryaSaarthi" target="_blank" rel="noopener noreferrer" class="w-8 h-8 bg-surface-2 hover:bg-red-600/80 border border-hairline rounded-lg flex items-center justify-center text-ink-muted hover:text-white transition" aria-label="YouTube"><i class="fab fa-youtube text-[12px]"></i></a>
                    <a href="https://x.com/karyasaarthi" target="_blank" rel="noopener noreferrer" class="w-8 h-8 bg-surface-2 hover:bg-zinc-600/80 border border-hairline rounded-lg flex items-center justify-center text-ink-muted hover:text-white transition" aria-label="X Twitter"><i class="fab fa-x-twitter text-[12px]"></i></a>
                    <a href="https://t.me/karyasaarthi" target="_blank" rel="noopener noreferrer" class="w-8 h-8 bg-surface-2 hover:bg-sky-600/80 border border-hairline rounded-lg flex items-center justify-center text-ink-muted hover:text-white transition" aria-label="Telegram"><i class="fab fa-telegram-plane text-[12px]"></i></a>
                    <a href="https://www.facebook.com/profile.php?id=61576877739779" target="_blank" rel="noopener noreferrer" class="w-8 h-8 bg-surface-2 hover:bg-blue-600/80 border border-hairline rounded-lg flex items-center justify-center text-ink-muted hover:text-white transition" aria-label="Facebook"><i class="fab fa-facebook-f text-[12px]"></i></a>
                    <a href="https://whatsapp.com/channel/0029Vb66k5vADTO79QKvGx0L" target="_blank" rel="noopener noreferrer" class="w-8 h-8 bg-surface-2 hover:bg-green-600/80 border border-hairline rounded-lg flex items-center justify-center text-ink-muted hover:text-white transition" aria-label="WhatsApp"><i class="fab fa-whatsapp text-[12px]"></i></a>
                    <a href="https://www.threads.com/@karyasaarthi" target="_blank" rel="noopener noreferrer" class="w-8 h-8 bg-surface-2 hover:bg-zinc-700/80 border border-hairline rounded-lg flex items-center justify-center text-ink-muted hover:text-white transition" aria-label="Threads"><i class="fab fa-threads text-[12px]"></i></a>
                </div>
            </div>

            <!-- Quick Links -->
            <div>
                <h3 class="text-ink font-semibold mb-4 text-[13px] uppercase tracking-wider">Quick Links</h3>
                <ul class="space-y-3 text-[13px]">
                    <li><a href="<?= BASE_PATH ?>/" class="hover:text-ink transition flex items-center gap-1.5"><i class="fas fa-chevron-right text-[9px] opacity-40"></i>Home</a></li>
                    <li><a href="<?= BASE_PATH ?>/careers.php" class="hover:text-ink transition flex items-center gap-1.5"><i class="fas fa-chevron-right text-[9px] opacity-40"></i>All Jobs</a></li>
                    <li><a href="<?= BASE_PATH ?>/campus-saarthi.php" class="hover:text-ink transition flex items-center gap-1.5"><i class="fas fa-chevron-right text-[9px] opacity-40"></i>Saarthi Program</a></li>
                    <li><a href="<?= BASE_PATH ?>/life-at-ks.php" class="hover:text-ink transition flex items-center gap-1.5"><i class="fas fa-chevron-right text-[9px] opacity-40"></i>Life at KS</a></li>
                    <li><a href="<?= BASE_PATH ?>/faq.php" class="hover:text-ink transition flex items-center gap-1.5"><i class="fas fa-chevron-right text-[9px] opacity-40"></i>FAQ</a></li>
                    <li><a href="<?= BASE_PATH ?>/contact.php" class="hover:text-ink transition flex items-center gap-1.5"><i class="fas fa-chevron-right text-[9px] opacity-40"></i>Contact Us</a></li>
                </ul>
            </div>

            <!-- Opportunities -->
            <div>
                <h3 class="text-ink font-semibold mb-4 text-[13px] uppercase tracking-wider">Opportunities</h3>
                <ul class="space-y-3 text-[13px]">
                    <li><a href="<?= BASE_PATH ?>/careers.php?category=employee" class="hover:text-ink transition flex items-center gap-1.5"><i class="fas fa-chevron-right text-[9px] opacity-40"></i>Internal Member</a></li>
                    <li><a href="<?= BASE_PATH ?>/careers.php?category=pillar_post" class="hover:text-ink transition flex items-center gap-1.5"><i class="fas fa-chevron-right text-[9px] opacity-40"></i>Saarthi</a></li>
                    <li><a href="<?= BASE_PATH ?>/careers.php?category=vendor" class="hover:text-ink transition flex items-center gap-1.5"><i class="fas fa-chevron-right text-[9px] opacity-40"></i>Vendor / Freelancer</a></li>
                    <li><a href="<?= BASE_PATH ?>/careers.php?category=intern" class="hover:text-ink transition flex items-center gap-1.5"><i class="fas fa-chevron-right text-[9px] opacity-40"></i>Internships</a></li>
                    <li><a href="<?= BASE_PATH ?>/careers.php?category=part_time" class="hover:text-ink transition flex items-center gap-1.5"><i class="fas fa-chevron-right text-[9px] opacity-40"></i>Part-Time / Remote</a></li>
                    <li><a href="<?= BASE_PATH ?>/careers.php?category=teaching_expert" class="hover:text-ink transition flex items-center gap-1.5"><i class="fas fa-chevron-right text-[9px] opacity-40"></i>Teaching Expert</a></li>
                </ul>
            </div>

            <!-- Legal & Company -->
            <div>
                <h3 class="text-ink font-semibold mb-4 text-[13px] uppercase tracking-wider">Legal</h3>
                <ul class="space-y-3 text-[13px] mb-5">
                    <li><a href="<?= BASE_PATH ?>/policy.php" class="hover:text-ink transition flex items-center gap-1.5"><i class="fas fa-chevron-right text-[9px] opacity-40"></i>HR Policy</a></li>
                    <li><a href="<?= BASE_PATH ?>/terms.php" class="hover:text-ink transition flex items-center gap-1.5"><i class="fas fa-chevron-right text-[9px] opacity-40"></i>Terms of Service</a></li>
                    <li><a href="<?= BASE_PATH ?>/privacy.php" class="hover:text-ink transition flex items-center gap-1.5"><i class="fas fa-chevron-right text-[9px] opacity-40"></i>Privacy Policy</a></li>
                </ul>
                <!-- Compliance Badges -->
                <div class="flex flex-col gap-2">
                    <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-hairline bg-surface-2 w-fit">
                        <span class="w-4 h-4 rounded-sm bg-green-600 flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-check text-[8px] text-white"></i>
                        </span>
                        <span class="text-[11px] font-semibold text-ink-muted">MCA Registered</span>
                    </div>
                    <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-hairline bg-surface-2 w-fit">
                        <span class="w-4 h-4 rounded-sm bg-blue-700 flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-check text-[8px] text-white"></i>
                        </span>
                        <span class="text-[11px] font-semibold text-ink-muted">GST Compliant</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Legal / Company Info Strip -->
    <div class="border-t border-hairline">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                <!-- Company Details -->
                <div class="space-y-2">
                    <p class="text-[13px] text-ink leading-snug">
                        <span class="font-semibold">Karya Saarthi</span>
                        <span class="text-ink-muted"> — A brand of Karyanex Private Limited</span>
                    </p>
                    <p class="text-[12px] text-ink-muted">
                        <span class="font-medium">Registered company name:</span> Karyanex Private Limited
                    </p>
                    <p class="text-[12px] text-ink-muted flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span><span class="font-medium">CIN:</span> U85500BR2026PTC085054</span>
                        <span class="w-px h-3 bg-hairline hidden sm:block"></span>
                        <span><span class="font-medium">GST number:</span> 10AAMCK8870B1ZN</span>
                    </p>
                    <p class="text-[12px] text-ink-muted max-w-xl leading-relaxed">
                        Karya Saarthi is the trade name operated by Karyanex Private Limited, a company incorporated under the Companies Act, 2013. All transactions, contracts, and legal obligations are governed under the name Karyanex Private Limited.
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Bottom Bar -->
    <div class="border-t border-hairline bg-surface-1">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
                <p class="text-[12px] text-ink-muted opacity-70">
                    &copy; <?= date('Y') ?> Karyanex Private Limited. All rights reserved.
                </p>
                <div class="flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-ink-muted">
                    <a href="<?= BASE_PATH ?>/policy.php" class="hover:text-ink transition">HR Policy</a>
                    <a href="<?= BASE_PATH ?>/terms.php" class="hover:text-ink transition">Terms</a>
                    <a href="<?= BASE_PATH ?>/privacy.php" class="hover:text-ink transition">Privacy</a>
                    <a href="<?= BASE_PATH ?>/faq.php" class="hover:text-ink transition">FAQ</a>
                    <a href="<?= BASE_PATH ?>/contact.php" class="hover:text-ink transition">Contact</a>
                </div>
            </div>
        </div>
    </div>
</footer>
<?php endif; ?>
<script src="<?= BASE_PATH ?>/assets/js/app.js"></script>
<script src="<?= BASE_PATH ?>/assets/js/animations.js"></script>
<?php if ($currentUser): ?>
<script src="<?= BASE_PATH ?>/assets/js/auto-logout.js"></script>
<?php endif; ?>
<script src="<?= BASE_PATH ?>/assets/js/chatbot.js"></script>
<?php if (file_exists(__DIR__ . '/../sw.js')): ?>
<script>if('serviceWorker' in navigator){navigator.serviceWorker.register('<?= BASE_PATH ?>/sw.js?v=4').catch(()=>{});}</script>
<?php endif; ?>
</body>
</html>
