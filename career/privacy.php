<?php
$pageTitle = 'Privacy Policy';
$pageDescription = 'Privacy Policy for Karya Saarthi Career Portal (career.karyasaarthi.com). Learn how we collect, use, store, and protect your personal data. GDPR and Indian IT Act compliant.';
$pageKeywords = 'Karya Saarthi privacy policy, data protection, GDPR, Indian IT Act, personal data, career portal privacy';
$canonicalUrl = 'https://career.karyasaarthi.com/privacy.php';
require_once __DIR__ . '/includes/header.php';
?>

<!-- Hero / Breadcrumb -->
<section class="gradient-bg text-white py-14 relative overflow-hidden">
    <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 left-10 w-40 h-40 border-2 border-white rounded-full"></div>
        <div class="absolute bottom-10 right-20 w-64 h-64 border-2 border-white rounded-full"></div>
    </div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <!-- Breadcrumb -->
        <nav class="text-sm text-indigo-200 mb-4" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-2">
                <li><a href="<?= BASE_PATH ?>/" class="hover:text-white transition"><i class="fas fa-home mr-1"></i>Home</a></li>
                <li><span class="mx-1">/</span></li>
                <li class="text-white font-medium">Privacy Policy</li>
            </ol>
        </nav>
        <h1 class="text-3xl sm:text-4xl font-extrabold mb-2">Privacy Policy</h1>
        <p class="text-indigo-100 text-base sm:text-lg max-w-2xl">How we collect, use, and protect your personal information at Karya Saarthi.</p>
        <div class="mt-4 inline-flex items-center bg-surface-1/15 text-white text-sm font-medium px-4 py-1.5 rounded-full">
            <i class="fas fa-calendar-alt mr-2"></i> Last Updated: April 2026
        </div>
    </div>
</section>

<!-- Privacy Policy Content -->
<section class="py-12 sm:py-16 bg-surface-1">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <!-- Intro -->
        <div class="bg-surface-1 rounded-2xl shadow-none border border-hairline p-6 sm:p-8 mb-8">
            <p class="text-ink-muted leading-relaxed">
                Karya Saarthi ("<strong>we</strong>", "<strong>us</strong>", or "<strong>our</strong>") operates the career portal at
                <a href="https://career.karyasaarthi.com" class="text-primary-600 hover:underline font-medium">career.karyasaarthi.com</a>.
                This Privacy Policy explains what personal data we collect, why we collect it, how we use and protect it, and what rights you have regarding your information.
            </p>
            <p class="text-ink-muted leading-relaxed mt-3">
                This policy is compliant with the <strong>General Data Protection Regulation (GDPR)</strong>, the <strong>Information Technology Act, 2000</strong> (India), and the <strong>Digital Personal Data Protection Act, 2023</strong> (India). By using our portal, you consent to the practices described herein.
            </p>
        </div>

        <!-- Section 1: Data We Collect -->
        <div class="bg-surface-1 rounded-2xl shadow-none border border-hairline p-6 sm:p-8 mb-6">
            <div class="flex items-start space-x-4 mb-4">
                <div class="flex-shrink-0 w-10 h-10 bg-blue-100 text-primary-600 rounded-xl flex items-center justify-center">
                    <i class="fas fa-database text-lg"></i>
                </div>
                <div>
                    <h2 class="text-xl font-bold text-ink">1. Data We Collect</h2>
                </div>
            </div>
            <p class="text-ink-muted leading-relaxed mb-4">We collect the following categories of personal data when you register, apply for positions, or interact with our portal:</p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="flex items-center space-x-3 bg-surface-1 rounded-lg p-3">
                    <i class="fas fa-user text-primary-500 w-5 text-center"></i>
                    <span class="text-ink-muted text-sm">Full name</span>
                </div>
                <div class="flex items-center space-x-3 bg-surface-1 rounded-lg p-3">
                    <i class="fas fa-envelope text-primary-500 w-5 text-center"></i>
                    <span class="text-ink-muted text-sm">Email address</span>
                </div>
                <div class="flex items-center space-x-3 bg-surface-1 rounded-lg p-3">
                    <i class="fas fa-phone text-primary-500 w-5 text-center"></i>
                    <span class="text-ink-muted text-sm">Phone / WhatsApp number</span>
                </div>
                <div class="flex items-center space-x-3 bg-surface-1 rounded-lg p-3">
                    <i class="fas fa-file-alt text-primary-500 w-5 text-center"></i>
                    <span class="text-ink-muted text-sm">Resume / CV uploads</span>
                </div>
                <div class="flex items-center space-x-3 bg-surface-1 rounded-lg p-3">
                    <i class="fas fa-graduation-cap text-primary-500 w-5 text-center"></i>
                    <span class="text-ink-muted text-sm">College / University name</span>
                </div>
                <div class="flex items-center space-x-3 bg-surface-1 rounded-lg p-3">
                    <i class="fas fa-map-marker-alt text-primary-500 w-5 text-center"></i>
                    <span class="text-ink-muted text-sm">City / Location</span>
                </div>
                <div class="flex items-center space-x-3 bg-surface-1 rounded-lg p-3">
                    <i class="fas fa-globe text-primary-500 w-5 text-center"></i>
                    <span class="text-ink-muted text-sm">IP address</span>
                </div>
                <div class="flex items-center space-x-3 bg-surface-1 rounded-lg p-3">
                    <i class="fas fa-laptop text-primary-500 w-5 text-center"></i>
                    <span class="text-ink-muted text-sm">Device &amp; browser information</span>
                </div>
            </div>
        </div>

        <!-- Section 2: Why We Collect It -->
        <div class="bg-surface-1 rounded-2xl shadow-none border border-hairline p-6 sm:p-8 mb-6">
            <div class="flex items-start space-x-4 mb-4">
                <div class="flex-shrink-0 w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                    <i class="fas fa-bullseye text-lg"></i>
                </div>
                <div>
                    <h2 class="text-xl font-bold text-ink">2. Why We Collect It</h2>
                </div>
            </div>
            <p class="text-ink-muted leading-relaxed mb-4">Your personal data is collected for the following lawful purposes:</p>
            <ul class="space-y-3">
                <li class="flex items-start space-x-3">
                    <i class="fas fa-check-circle text-green-400 mt-1 flex-shrink-0"></i>
                    <span class="text-ink-muted"><strong>Job Applications:</strong> To process and evaluate your applications for internships, vendor partnerships, campus ambassador roles, freelancer positions, and full-time employment.</span>
                </li>
                <li class="flex items-start space-x-3">
                    <i class="fas fa-check-circle text-green-400 mt-1 flex-shrink-0"></i>
                    <span class="text-ink-muted"><strong>Communication:</strong> To contact you regarding application status updates, interview scheduling, offer letters, and general correspondence.</span>
                </li>
                <li class="flex items-start space-x-3">
                    <i class="fas fa-check-circle text-green-400 mt-1 flex-shrink-0"></i>
                    <span class="text-ink-muted"><strong>Attendance &amp; Work Management:</strong> To track attendance, project assignments, and performance for onboarded candidates.</span>
                </li>
                <li class="flex items-start space-x-3">
                    <i class="fas fa-check-circle text-green-400 mt-1 flex-shrink-0"></i>
                    <span class="text-ink-muted"><strong>Payroll &amp; Payments:</strong> To process stipends, salaries, commissions, and vendor payments through authorised payment partners.</span>
                </li>
            </ul>
        </div>

        <!-- Section 3: How We Use Your Data -->
        <div class="bg-surface-1 rounded-2xl shadow-none border border-hairline p-6 sm:p-8 mb-6">
            <div class="flex items-start space-x-4 mb-4">
                <div class="flex-shrink-0 w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                    <i class="fas fa-cogs text-lg"></i>
                </div>
                <div>
                    <h2 class="text-xl font-bold text-ink">3. How We Use Your Data</h2>
                </div>
            </div>
            <p class="text-ink-muted leading-relaxed mb-4">We are committed to responsible data use:</p>
            <div class="bg-green-500/10 border border-green-200 rounded-xl p-4 mb-4">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-shield-alt text-green-600 text-xl"></i>
                    <p class="text-green-800 font-semibold">Your data is never sold to, rented to, or shared with third parties for marketing purposes.</p>
                </div>
            </div>
            <ul class="space-y-2 text-ink-muted">
                <li class="flex items-start space-x-3">
                    <i class="fas fa-angle-right text-primary-500 mt-1 flex-shrink-0"></i>
                    <span>Data is used strictly for recruitment, onboarding, and internal HR operations.</span>
                </li>
                <li class="flex items-start space-x-3">
                    <i class="fas fa-angle-right text-primary-500 mt-1 flex-shrink-0"></i>
                    <span>We may use anonymised, aggregated data for internal analytics to improve our hiring processes.</span>
                </li>
                <li class="flex items-start space-x-3">
                    <i class="fas fa-angle-right text-primary-500 mt-1 flex-shrink-0"></i>
                    <span>Data may be shared with authorised third-party service providers solely to fulfil the purposes stated in Section 2 (e.g., payment processing, email delivery).</span>
                </li>
            </ul>
        </div>

        <!-- Section 4: Data Storage & Security -->
        <div class="bg-surface-1 rounded-2xl shadow-none border border-hairline p-6 sm:p-8 mb-6">
            <div class="flex items-start space-x-4 mb-4">
                <div class="flex-shrink-0 w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                    <i class="fas fa-lock text-lg"></i>
                </div>
                <div>
                    <h2 class="text-xl font-bold text-ink">4. Data Storage &amp; Security</h2>
                </div>
            </div>
            <p class="text-ink-muted leading-relaxed mb-4">We take the security of your personal data seriously and implement industry-standard safeguards:</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="bg-surface-2 rounded-xl p-4">
                    <div class="flex items-center space-x-3 mb-2">
                        <i class="fas fa-server text-primary-500"></i>
                        <h3 class="font-semibold text-ink">Encrypted Servers</h3>
                    </div>
                    <p class="text-ink-muted text-sm">All data is stored on encrypted servers with SSL/TLS encryption for data in transit and AES-256 encryption for data at rest.</p>
                </div>
                <div class="bg-surface-2 rounded-xl p-4">
                    <div class="flex items-center space-x-3 mb-2">
                        <i class="fas fa-user-shield text-primary-500"></i>
                        <h3 class="font-semibold text-ink">Role-Based Access</h3>
                    </div>
                    <p class="text-ink-muted text-sm">Access to personal data is restricted through role-based access control (RBAC). Only authorised personnel can view or process your information.</p>
                </div>
                <div class="bg-surface-2 rounded-xl p-4">
                    <div class="flex items-center space-x-3 mb-2">
                        <i class="fas fa-sync-alt text-primary-500"></i>
                        <h3 class="font-semibold text-ink">Regular Backups</h3>
                    </div>
                    <p class="text-ink-muted text-sm">Automated, encrypted backups ensure your data is recoverable in the event of system failure or security incidents.</p>
                </div>
                <div class="bg-surface-2 rounded-xl p-4">
                    <div class="flex items-center space-x-3 mb-2">
                        <i class="fas fa-bug text-primary-500"></i>
                        <h3 class="font-semibold text-ink">Security Audits</h3>
                    </div>
                    <p class="text-ink-muted text-sm">We conduct periodic security reviews and vulnerability assessments to maintain the integrity of our systems.</p>
                </div>
            </div>
        </div>

        <!-- Section 5: Data Retention Period -->
        <div class="bg-surface-1 rounded-2xl shadow-none border border-hairline p-6 sm:p-8 mb-6">
            <div class="flex items-start space-x-4 mb-4">
                <div class="flex-shrink-0 w-10 h-10 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center">
                    <i class="fas fa-clock text-lg"></i>
                </div>
                <div>
                    <h2 class="text-xl font-bold text-ink">5. Data Retention Period</h2>
                </div>
            </div>
            <p class="text-ink-muted leading-relaxed mb-4">We retain your personal data only for as long as necessary to fulfil the purposes outlined in this policy:</p>
            <div class="space-y-3">
                <div class="flex items-start space-x-3 bg-blue-50 rounded-xl p-4">
                    <i class="fas fa-briefcase text-primary-600 mt-1 flex-shrink-0"></i>
                    <div>
                        <h3 class="font-semibold text-ink">Active Employees / Vendors / Interns</h3>
                        <p class="text-ink-muted text-sm mt-1">Data is retained for the duration of your engagement with Karya Saarthi, plus any period required by applicable tax and labour laws.</p>
                    </div>
                </div>
                <div class="flex items-start space-x-3 bg-red-500/10 rounded-xl p-4">
                    <i class="fas fa-times-circle text-red-400 mt-1 flex-shrink-0"></i>
                    <div>
                        <h3 class="font-semibold text-ink">Rejected / Withdrawn Applications</h3>
                        <p class="text-ink-muted text-sm mt-1">Personal data of candidates whose applications are rejected or withdrawn is <strong>permanently deleted within 6 months</strong> of the final decision, unless you consent to being considered for future roles.</p>
                    </div>
                </div>
                <div class="flex items-start space-x-3 bg-surface-2 rounded-xl p-4">
                    <i class="fas fa-user-slash text-ink-muted mt-1 flex-shrink-0"></i>
                    <div>
                        <h3 class="font-semibold text-ink">Account Deletion Requests</h3>
                        <p class="text-ink-muted text-sm mt-1">If you request deletion of your account, all associated personal data will be removed within 30 days, except where retention is legally mandated.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Section 6: Cookies Policy -->
        <div class="bg-surface-1 rounded-2xl shadow-none border border-hairline p-6 sm:p-8 mb-6">
            <div class="flex items-start space-x-4 mb-4">
                <div class="flex-shrink-0 w-10 h-10 bg-orange-100 text-accent-600 rounded-xl flex items-center justify-center">
                    <i class="fas fa-cookie-bite text-lg"></i>
                </div>
                <div>
                    <h2 class="text-xl font-bold text-ink">6. Cookies Policy</h2>
                </div>
            </div>
            <p class="text-ink-muted leading-relaxed mb-4">Our portal uses cookies to enhance your browsing experience and gather analytical data:</p>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="bg-surface-1">
                            <th class="text-left p-3 rounded-tl-lg font-semibold text-ink">Cookie Type</th>
                            <th class="text-left p-3 font-semibold text-ink">Purpose</th>
                            <th class="text-left p-3 rounded-tr-lg font-semibold text-ink">Consent</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-hairline">
                        <tr>
                            <td class="p-3 text-ink-muted font-medium"><i class="fas fa-cog text-ink-muted mr-2"></i>Functional</td>
                            <td class="p-3 text-ink-muted">Session management, login state, form preferences</td>
                            <td class="p-3"><span class="inline-flex items-center bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">Essential</span></td>
                        </tr>
                        <tr>
                            <td class="p-3 text-ink-muted font-medium"><i class="fas fa-chart-bar text-ink-muted mr-2"></i>Analytics</td>
                            <td class="p-3 text-ink-muted">Page views, traffic sources, user behaviour (via GA4)</td>
                            <td class="p-3"><span class="inline-flex items-center bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">Implied</span></td>
                        </tr>
                        <tr>
                            <td class="p-3 text-ink-muted font-medium"><i class="fas fa-bullhorn text-ink-muted mr-2"></i>Marketing</td>
                            <td class="p-3 text-ink-muted">Targeted campaigns, retargeting pixels</td>
                            <td class="p-3"><span class="inline-flex items-center bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-1 rounded-full">Explicit Only</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p class="text-ink-muted text-sm mt-4"><i class="fas fa-info-circle text-primary-500 mr-1"></i> Marketing cookies are loaded <strong>only after you provide explicit consent</strong> through our cookie banner. You may withdraw consent at any time through your browser settings.</p>
        </div>

        <!-- Section 7: Third-Party Services -->
        <div class="bg-surface-1 rounded-2xl shadow-none border border-hairline p-6 sm:p-8 mb-6">
            <div class="flex items-start space-x-4 mb-4">
                <div class="flex-shrink-0 w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                    <i class="fas fa-plug text-lg"></i>
                </div>
                <div>
                    <h2 class="text-xl font-bold text-ink">7. Third-Party Services</h2>
                </div>
            </div>
            <p class="text-ink-muted leading-relaxed mb-4">We integrate with the following trusted third-party services to operate our platform. Each provider is bound by their own privacy policy and data processing agreements:</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="border border-hairline rounded-xl p-4 hover:shadow-md transition">
                    <div class="flex items-center space-x-3 mb-2">
                        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">R</div>
                        <h3 class="font-semibold text-ink">Razorpay</h3>
                    </div>
                    <p class="text-ink-muted text-sm">Payment processing for stipends, commissions, and vendor payouts. Razorpay is PCI-DSS Level 1 compliant.</p>
                </div>
                <div class="border border-hairline rounded-xl p-4 hover:shadow-md transition">
                    <div class="flex items-center space-x-3 mb-2">
                        <div class="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-xs font-bold"><i class="fas fa-chart-line text-xs"></i></div>
                        <h3 class="font-semibold text-ink">Google Analytics 4 (GA4)</h3>
                    </div>
                    <p class="text-ink-muted text-sm">Website traffic analysis and user behaviour insights. Data is anonymised and no personally identifiable information is shared.</p>
                </div>
                <div class="border border-hairline rounded-xl p-4 hover:shadow-md transition">
                    <div class="flex items-center space-x-3 mb-2">
                        <div class="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white text-xs font-bold"><i class="fas fa-paper-plane text-xs"></i></div>
                        <h3 class="font-semibold text-ink">SendGrid (Twilio)</h3>
                    </div>
                    <p class="text-ink-muted text-sm">Transactional email delivery for application confirmations, status updates, offer letters, and account notifications.</p>
                </div>
                <div class="border border-hairline rounded-xl p-4 hover:shadow-md transition">
                    <div class="flex items-center space-x-3 mb-2">
                        <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-xs font-bold"><i class="fab fa-whatsapp text-xs"></i></div>
                        <h3 class="font-semibold text-ink">Meta WhatsApp Business API</h3>
                    </div>
                    <p class="text-ink-muted text-sm">Automated WhatsApp notifications for interview scheduling, onboarding updates, and critical alerts via the official Meta Business Platform.</p>
                </div>
            </div>
        </div>

        <!-- Section 8: Your Rights -->
        <div class="bg-surface-1 rounded-2xl shadow-none border border-hairline p-6 sm:p-8 mb-6">
            <div class="flex items-start space-x-4 mb-4">
                <div class="flex-shrink-0 w-10 h-10 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center">
                    <i class="fas fa-hand-paper text-lg"></i>
                </div>
                <div>
                    <h2 class="text-xl font-bold text-ink">8. Your Rights</h2>
                </div>
            </div>
            <p class="text-ink-muted leading-relaxed mb-4">Under applicable data protection laws (including the GDPR and the Digital Personal Data Protection Act, 2023), you have the following rights:</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div class="flex items-start space-x-3 bg-teal-50 rounded-xl p-4">
                    <i class="fas fa-eye text-teal-600 mt-0.5 flex-shrink-0"></i>
                    <div>
                        <h3 class="font-semibold text-ink text-sm">Right to Access</h3>
                        <p class="text-ink-muted text-xs mt-1">Request a copy of all personal data we hold about you.</p>
                    </div>
                </div>
                <div class="flex items-start space-x-3 bg-teal-50 rounded-xl p-4">
                    <i class="fas fa-edit text-teal-600 mt-0.5 flex-shrink-0"></i>
                    <div>
                        <h3 class="font-semibold text-ink text-sm">Right to Correction</h3>
                        <p class="text-ink-muted text-xs mt-1">Request correction of any inaccurate or incomplete data.</p>
                    </div>
                </div>
                <div class="flex items-start space-x-3 bg-teal-50 rounded-xl p-4">
                    <i class="fas fa-file-export text-teal-600 mt-0.5 flex-shrink-0"></i>
                    <div>
                        <h3 class="font-semibold text-ink text-sm">Right to Export</h3>
                        <p class="text-ink-muted text-xs mt-1">Request your data in a portable, machine-readable format (CSV/JSON).</p>
                    </div>
                </div>
                <div class="flex items-start space-x-3 bg-teal-50 rounded-xl p-4">
                    <i class="fas fa-trash-alt text-teal-600 mt-0.5 flex-shrink-0"></i>
                    <div>
                        <h3 class="font-semibold text-ink text-sm">Right to Deletion</h3>
                        <p class="text-ink-muted text-xs mt-1">Request permanent erasure of your personal data, subject to legal obligations.</p>
                    </div>
                </div>
            </div>
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p class="text-ink-muted text-sm">
                    <i class="fas fa-envelope text-primary-500 mr-2"></i>
                    To exercise any of these rights, send an email to
                    <a href="mailto:hr@karyasaarthi.com" class="text-primary-600 font-semibold hover:underline">hr@karyasaarthi.com</a>
                    with the subject line "<strong>Data Rights Request</strong>". We will respond to your request within <strong>30 calendar days</strong>.
                </p>
            </div>
        </div>

        <!-- Section 9: Data of Minors -->
        <div class="bg-surface-1 rounded-2xl shadow-none border border-hairline p-6 sm:p-8 mb-6">
            <div class="flex items-start space-x-4 mb-4">
                <div class="flex-shrink-0 w-10 h-10 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center">
                    <i class="fas fa-child text-lg"></i>
                </div>
                <div>
                    <h2 class="text-xl font-bold text-ink">9. Data of Minors</h2>
                </div>
            </div>
            <div class="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div class="flex items-start space-x-3">
                    <i class="fas fa-exclamation-triangle text-red-400 mt-0.5 flex-shrink-0"></i>
                    <div>
                        <p class="text-ink-muted leading-relaxed">
                            Our career portal is intended for individuals who are <strong>18 years of age or older</strong>. We do not knowingly collect, process, or store personal data from anyone under the age of 18.
                        </p>
                        <p class="text-ink-muted leading-relaxed mt-2">
                            If we become aware that we have inadvertently collected personal data from a minor, we will take immediate steps to delete such data from our systems. If you believe a minor has submitted data through our portal, please contact us at
                            <a href="mailto:privacy@karyasaarthi.com" class="text-primary-600 font-medium hover:underline">privacy@karyasaarthi.com</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Section 10: Policy Updates -->
        <div class="bg-surface-1 rounded-2xl shadow-none border border-hairline p-6 sm:p-8 mb-6">
            <div class="flex items-start space-x-4 mb-4">
                <div class="flex-shrink-0 w-10 h-10 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center">
                    <i class="fas fa-bell text-lg"></i>
                </div>
                <div>
                    <h2 class="text-xl font-bold text-ink">10. Policy Updates</h2>
                </div>
            </div>
            <p class="text-ink-muted leading-relaxed mb-3">
                We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, legal requirements, or other factors. When we make material changes:
            </p>
            <ul class="space-y-2">
                <li class="flex items-start space-x-3">
                    <i class="fas fa-check text-cyan-500 mt-1 flex-shrink-0"></i>
                    <span class="text-ink-muted">We will notify you by email at the address registered with your account.</span>
                </li>
                <li class="flex items-start space-x-3">
                    <i class="fas fa-check text-cyan-500 mt-1 flex-shrink-0"></i>
                    <span class="text-ink-muted">A prominent notice will be displayed on this page with the updated effective date.</span>
                </li>
                <li class="flex items-start space-x-3">
                    <i class="fas fa-check text-cyan-500 mt-1 flex-shrink-0"></i>
                    <span class="text-ink-muted">Continued use of the portal after the effective date constitutes acceptance of the revised policy.</span>
                </li>
            </ul>
        </div>

        <!-- Section 11: Contact DPO -->
        <div class="bg-surface-1 rounded-2xl shadow-none border border-hairline p-6 sm:p-8 mb-6">
            <div class="flex items-start space-x-4 mb-4">
                <div class="flex-shrink-0 w-10 h-10 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center">
                    <i class="fas fa-headset text-lg"></i>
                </div>
                <div>
                    <h2 class="text-xl font-bold text-ink">11. Contact the Data Protection Officer</h2>
                </div>
            </div>
            <p class="text-ink-muted leading-relaxed mb-4">
                If you have any questions, concerns, or complaints about this Privacy Policy or how we handle your personal data, please contact our Data Protection Officer:
            </p>
            <div class="bg-gradient-to-br from-primary-50 to-indigo-50 rounded-xl p-5 border border-primary-100">
                <div class="space-y-3">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-building text-primary-600 w-5 text-center"></i>
                        <span class="text-ink font-semibold">Karya Saarthi</span>
                    </div>
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-envelope text-primary-600 w-5 text-center"></i>
                        <a href="mailto:privacy@karyasaarthi.com" class="text-primary-600 hover:underline font-medium">privacy@karyasaarthi.com</a>
                    </div>
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-map-marker-alt text-primary-600 w-5 text-center"></i>
                        <span class="text-ink-muted">New Delhi, India</span>
                    </div>
                </div>
            </div>
            <p class="text-ink-muted text-sm mt-4">
                We aim to resolve all privacy-related inquiries within <strong>30 calendar days</strong>. If you are not satisfied with our response, you have the right to lodge a complaint with the relevant supervisory authority under applicable data protection legislation.
            </p>
        </div>

        <!-- Closing Statement -->
        <div class="bg-gradient-to-r from-primary-600 to-accent-500 rounded-2xl p-6 sm:p-8 text-white text-center">
            <i class="fas fa-shield-alt text-3xl mb-3 opacity-80"></i>
            <h3 class="text-xl font-bold mb-2">Your Privacy Matters to Us</h3>
            <p class="text-white/90 text-sm max-w-lg mx-auto">At Karya Saarthi, protecting your personal data is not just a legal obligation -- it is a core value. We are committed to transparency, security, and respect for your rights. <em>Hum Hai Aapke Saarthi!</em></p>
        </div>

    </div>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>






