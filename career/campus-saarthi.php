<?php
$pageTitle = 'Saarthi';
require_once __DIR__ . '/includes/header.php';
?>

<!-- Hero Section -->
<section class="gradient-bg text-white py-20 relative overflow-hidden">
    <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 left-10 w-40 h-40 border-2 border-white rounded-full"></div>
        <div class="absolute bottom-10 right-20 w-64 h-64 border-2 border-white rounded-full"></div>
        <div class="absolute top-1/2 left-1/2 w-28 h-28 border-2 border-white rounded-full"></div>
    </div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <span class="inline-flex items-center bg-surface-1/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <i class="fas fa-graduation-cap mr-2"></i> Student Ambassador Program
        </span>
        <h1 class="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">Become the Face of Karya Saarthi<br>in Your College!</h1>
        <p class="text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto mb-8">Represent us on campus, help fellow students find opportunities, and earn a 10% commission on every successful referral.</p>
        <a href="<?= BASE_PATH ?>/register.php?type=campus_saarthi" class="button-primary inline-flex items-center px-8 py-3.5 rounded-xl text-base transition shadow-lg">
            <i class="fas fa-rocket mr-2"></i> Register Now
        </a>
    </div>
</section>

<!-- What is Saarthi? -->
<section class="py-16 bg-canvas">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto text-center">
            <h2 class="text-3xl font-bold text-ink mb-4">What is Saarthi?</h2>
            <div class="w-16 h-1 bg-primary-600 rounded mx-auto mb-6"></div>
            <p class="text-ink-muted text-lg leading-relaxed">
                Saarthi is our student ambassador program that empowers college students to become the bridge between Karya Saarthi and their campus community. As a Saarthi, you receive a unique referral code and earn <span class="font-semibold text-white">10% commission</span> every time someone from your campus signs up and completes a project through your referral. It's a win-win: your peers discover great opportunities, and you earn real income while still in college.
            </p>
        </div>
    </div>
</section>

<!-- How It Works -->
<section class="py-16 bg-surface-1">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-ink mb-3">How It Works</h2>
            <p class="text-ink-muted">Four simple steps to start earning</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <!-- Step 1 -->
            <div class="text-center relative">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 mb-5">
                    <i class="fas fa-user-plus text-2xl"></i>
                </div>
                <div class="absolute top-8 left-3/4 w-1/2 border-t-2 border-dashed border-primary-200 hidden lg:block"></div>
                <h3 class="text-lg font-bold text-ink mb-2">1. Register</h3>
                <p class="text-sm text-ink-muted">Sign up as a Saarthi with your college details and ID proof.</p>
            </div>
            <!-- Step 2 -->
            <div class="text-center relative">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 text-green-600 mb-5">
                    <i class="fas fa-key text-2xl"></i>
                </div>
                <div class="absolute top-8 left-3/4 w-1/2 border-t-2 border-dashed border-green-200 hidden lg:block"></div>
                <h3 class="text-lg font-bold text-ink mb-2">2. Get Referral Code</h3>
                <p class="text-sm text-ink-muted">Receive your unique referral code once your profile is verified.</p>
            </div>
            <!-- Step 3 -->
            <div class="text-center relative">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 mb-5">
                    <i class="fas fa-bullhorn text-2xl"></i>
                </div>
                <div class="absolute top-8 left-3/4 w-1/2 border-t-2 border-dashed border-purple-200 hidden lg:block"></div>
                <h3 class="text-lg font-bold text-ink mb-2">3. Promote</h3>
                <p class="text-sm text-ink-muted">Share opportunities with classmates using your referral code.</p>
            </div>
            <!-- Step 4 -->
            <div class="text-center">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 mb-5">
                    <i class="fas fa-wallet text-2xl"></i>
                </div>
                <h3 class="text-lg font-bold text-ink mb-2">4. Earn 10%</h3>
                <p class="text-sm text-ink-muted">Earn 10% commission on every successful project completed via your referral.</p>
            </div>
        </div>
    </div>
</section>

<!-- Earnings Calculator -->
<section class="py-16 bg-canvas">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10">
            <h2 class="text-3xl font-bold text-ink mb-3">Earnings Calculator</h2>
            <p class="text-ink-muted">See how much you can earn as a Saarthi</p>
        </div>
        <div class="max-w-xl mx-auto bg-surface-1 rounded-2xl border border-hairline p-8">
            <label for="project-value" class="block text-sm font-medium text-ink-muted mb-2">Average Project Value (&#8377;)</label>
            <div class="flex gap-3 mb-6">
                <input type="number" id="project-value" placeholder="e.g. 15000" min="0"
                       class="flex-1 border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                       oninput="calculateCommission()">
                <button onclick="calculateCommission()" class="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition">
                    Calculate
                </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="bg-surface-1 rounded-xl border border-hairline p-5 text-center">
                    <p class="text-xs text-ink-muted mb-1 uppercase tracking-wide">Per Project (10%)</p>
                    <p id="commission-result" class="text-2xl font-bold text-primary-600">&#8377;0</p>
                </div>
                <div class="bg-surface-1 rounded-xl border border-hairline p-5 text-center">
                    <p class="text-xs text-ink-muted mb-1 uppercase tracking-wide">5 Projects/Month</p>
                    <p id="monthly-5" class="text-2xl font-bold text-green-600">&#8377;0</p>
                </div>
                <div class="bg-surface-1 rounded-xl border border-hairline p-5 text-center">
                    <p class="text-xs text-ink-muted mb-1 uppercase tracking-wide">10 Projects/Month</p>
                    <p id="monthly-10" class="text-2xl font-bold text-purple-600">&#8377;0</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Benefits -->
<section class="py-16 bg-surface-1">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-ink mb-3">Why Become a Saarthi?</h2>
            <p class="text-ink-muted">Perks that go beyond just earning</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Benefit 1 -->
            <div class="bg-surface-1 rounded-xl border border-hairline p-6 hover:shadow-md transition-shadow">
                <div class="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 text-green-600 mb-4">
                    <i class="fas fa-money-bill-wave text-xl"></i>
                </div>
                <h3 class="text-lg font-bold text-ink mb-2">Earn While Studying</h3>
                <p class="text-sm text-ink-muted">Generate real income through referral commissions without affecting your academic schedule.</p>
            </div>
            <!-- Benefit 2 -->
            <div class="bg-surface-1 rounded-xl border border-hairline p-6 hover:shadow-md transition-shadow">
                <div class="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-600 mb-4">
                    <i class="fas fa-clock text-xl"></i>
                </div>
                <h3 class="text-lg font-bold text-ink mb-2">Flexible Work</h3>
                <p class="text-sm text-ink-muted">Work on your own time. Promote opportunities when it suits you — no rigid schedules.</p>
            </div>
            <!-- Benefit 3 -->
            <div class="bg-surface-1 rounded-xl border border-hairline p-6 hover:shadow-md transition-shadow">
                <div class="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 text-purple-600 mb-4">
                    <i class="fas fa-hands-helping text-xl"></i>
                </div>
                <h3 class="text-lg font-bold text-ink mb-2">Help Fellow Students</h3>
                <p class="text-sm text-ink-muted">Be the one who connects your classmates with meaningful career opportunities.</p>
            </div>
            <!-- Benefit 4 -->
            <div class="bg-surface-1 rounded-xl border border-hairline p-6 hover:shadow-md transition-shadow">
                <div class="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-amber-100 text-amber-600 mb-4">
                    <i class="fas fa-certificate text-xl"></i>
                </div>
                <h3 class="text-lg font-bold text-ink mb-2">Get Certified</h3>
                <p class="text-sm text-ink-muted">Receive an official Saarthi certificate that boosts your resume and credibility.</p>
            </div>
            <!-- Benefit 5 -->
            <div class="bg-surface-1 rounded-xl border border-hairline p-6 hover:shadow-md transition-shadow">
                <div class="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-red-100 text-red-600 mb-4">
                    <i class="fas fa-network-wired text-xl"></i>
                </div>
                <h3 class="text-lg font-bold text-ink mb-2">Build Your Network</h3>
                <p class="text-sm text-ink-muted">Connect with industry professionals, recruiters, and a community of student ambassadors.</p>
            </div>
        </div>
    </div>
</section>

<!-- CTA Section -->
<section class="py-20 gradient-bg text-white">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl sm:text-4xl font-extrabold mb-4">Ready to Be a Saarthi?</h2>
        <p class="text-indigo-100 text-lg mb-8">Register now, get your referral code, and start earning while helping your peers find amazing opportunities.</p>
        <a href="<?= BASE_PATH ?>/register.php?type=campus_saarthi" class="button-primary inline-flex items-center px-10 py-4 rounded-xl text-lg transition shadow-lg">
            <i class="fas fa-user-plus mr-2"></i> Register as Saarthi Now
        </a>
    </div>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>






