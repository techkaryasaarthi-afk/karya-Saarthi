<?php
$pageTitle = 'Terms & Conditions';
$pageDescription = 'Read the Terms & Conditions for Karya Saarthi career portal. Understand your rights, obligations, payment terms, confidentiality clauses, and dispute resolution policies.';
$pageKeywords = 'Karya Saarthi terms, terms and conditions, career portal terms, vendor terms, intern terms, campus saarthi terms, payment terms, confidentiality, dispute resolution';
require_once __DIR__ . '/includes/header.php';
?>

<!-- Hero Section -->
<section class="gradient-bg text-white py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-3xl sm:text-4xl font-bold mb-3">Terms & Conditions</h1>
        <p class="text-lg text-indigo-100 max-w-2xl mx-auto">Please read these terms carefully before using the Karya Saarthi career portal.</p>
    </div>
</section>

<!-- Breadcrumb -->
<nav class="bg-surface-1 border-b border-hairline" aria-label="Breadcrumb">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <ol class="flex items-center space-x-2 text-sm text-ink-muted">
            <li><a href="<?= BASE_PATH ?>/" class="hover:text-primary-600 transition"><i class="fas fa-home mr-1"></i> Home</a></li>
            <li><i class="fas fa-chevron-right text-xs text-ink-muted mx-1"></i></li>
            <li class="text-primary-600 font-medium">Terms & Conditions</li>
        </ol>
    </div>
</nav>

<!-- Terms Content -->
<section class="py-10 sm:py-14">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <!-- Last Updated Badge -->
        <div class="flex items-center justify-between mb-8 flex-wrap gap-3">
            <div class="flex items-center space-x-2">
                <span class="inline-flex items-center bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                    <i class="fas fa-calendar-alt mr-1.5"></i> Last Updated: April 2026
                </span>
            </div>
            <a href="#table-of-contents" class="text-sm text-primary-600 hover:text-primary-700 font-medium transition">
                <i class="fas fa-list mr-1"></i> Table of Contents
            </a>
        </div>

        <!-- Introduction -->
        <div class="bg-surface-1 rounded-xl shadow-xl border border-hairline p-6 sm:p-8 mb-8">
            <p class="text-ink-muted leading-relaxed">
                Welcome to the Karya Saarthi career portal (<strong>career.karyasaarthi.com</strong>). These Terms & Conditions ("Terms") constitute a legally binding agreement between you ("User", "You") and <strong>Karya Saarthi</strong> ("Company", "We", "Us", "Our"). By accessing, registering on, or using this portal in any capacity &mdash; whether as an applicant, employee, intern, vendor, freelancer, or campus ambassador &mdash; you acknowledge that you have read, understood, and agree to be bound by these Terms in their entirety.
            </p>
        </div>

        <!-- Table of Contents -->
        <div id="table-of-contents" class="bg-primary-50 rounded-xl border border-primary-100 p-6 sm:p-8 mb-10">
            <h2 class="text-lg font-bold text-primary-800 mb-4"><i class="fas fa-list-ol mr-2 text-accent-500"></i> Table of Contents</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a href="#clause-1" class="flex items-center text-sm text-primary-700 hover:text-accent-600 transition py-1">
                    <span class="w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">1</span>
                    Acceptance of Terms
                </a>
                <a href="#clause-2" class="flex items-center text-sm text-primary-700 hover:text-accent-600 transition py-1">
                    <span class="w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">2</span>
                    Eligibility
                </a>
                <a href="#clause-3" class="flex items-center text-sm text-primary-700 hover:text-accent-600 transition py-1">
                    <span class="w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">3</span>
                    Application Accuracy
                </a>
                <a href="#clause-4" class="flex items-center text-sm text-primary-700 hover:text-accent-600 transition py-1">
                    <span class="w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">4</span>
                    Intellectual Property
                </a>
                <a href="#clause-5" class="flex items-center text-sm text-primary-700 hover:text-accent-600 transition py-1">
                    <span class="w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">5</span>
                    Confidentiality Obligation
                </a>
                <a href="#clause-6" class="flex items-center text-sm text-primary-700 hover:text-accent-600 transition py-1">
                    <span class="w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">6</span>
                    Payment Terms &mdash; Vendors
                </a>
                <a href="#clause-7" class="flex items-center text-sm text-primary-700 hover:text-accent-600 transition py-1">
                    <span class="w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">7</span>
                    Commission Terms &mdash; Campus
                </a>
                <a href="#clause-8" class="flex items-center text-sm text-primary-700 hover:text-accent-600 transition py-1">
                    <span class="w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">8</span>
                    Stipend Terms &mdash; Interns
                </a>
                <a href="#clause-9" class="flex items-center text-sm text-primary-700 hover:text-accent-600 transition py-1">
                    <span class="w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">9</span>
                    Termination Clause
                </a>
                <a href="#clause-10" class="flex items-center text-sm text-primary-700 hover:text-accent-600 transition py-1">
                    <span class="w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">10</span>
                    Non-Compete
                </a>
                <a href="#clause-11" class="flex items-center text-sm text-primary-700 hover:text-accent-600 transition py-1">
                    <span class="w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">11</span>
                    Dispute Resolution
                </a>
                <a href="#clause-12" class="flex items-center text-sm text-primary-700 hover:text-accent-600 transition py-1">
                    <span class="w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">12</span>
                    Website Usage Terms
                </a>
                <a href="#clause-13" class="flex items-center text-sm text-primary-700 hover:text-accent-600 transition py-1">
                    <span class="w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">13</span>
                    Cookies & Tracking
                </a>
                <a href="#clause-14" class="flex items-center text-sm text-primary-700 hover:text-accent-600 transition py-1">
                    <span class="w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">14</span>
                    Amendment Rights
                </a>
            </div>
        </div>

        <!-- Clauses -->
        <div class="space-y-8">

            <!-- Clause 1: Acceptance of Terms -->
            <div id="clause-1" class="bg-surface-1 rounded-xl shadow-xl border border-hairline p-6 sm:p-8 scroll-mt-24">
                <div class="flex items-start space-x-4 mb-4">
                    <span class="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0">1</span>
                    <h2 class="text-xl font-bold text-ink pt-1">Acceptance of Terms</h2>
                </div>
                <div class="text-ink-muted leading-relaxed space-y-3 pl-14">
                    <p>By accessing or using the Karya Saarthi career portal, you agree to comply with and be legally bound by these Terms & Conditions. If you do not agree with any part of these Terms, you must immediately discontinue use of this portal.</p>
                    <p>Your continued use of this website &mdash; including browsing, registering, applying for jobs, submitting leads, or accessing the dashboard &mdash; constitutes your irrevocable acceptance of these Terms and any future amendments.</p>
                    <p>These Terms apply to all users of the portal, including but not limited to: job applicants, employees, interns, vendors, freelancers, Saarthi ambassadors, and site visitors.</p>
                </div>
            </div>

            <!-- Clause 2: Eligibility -->
            <div id="clause-2" class="bg-surface-1 rounded-xl shadow-xl border border-hairline p-6 sm:p-8 scroll-mt-24">
                <div class="flex items-start space-x-4 mb-4">
                    <span class="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0">2</span>
                    <h2 class="text-xl font-bold text-ink pt-1">Eligibility</h2>
                </div>
                <div class="text-ink-muted leading-relaxed space-y-3 pl-14">
                    <p>To use this portal and engage with Karya Saarthi in any capacity, you must meet the following eligibility criteria:</p>
                    <ul class="list-disc list-inside space-y-2 ml-2">
                        <li><strong>Age Requirement:</strong> You must be at least <span class="font-semibold text-primary-700">18 years of age</span> or older to register on this portal, apply for positions, or enter into any agreement with Karya Saarthi.</li>
                        <li><strong>Intern Eligibility:</strong> If you are applying as an intern, you must be a currently enrolled student at a recognized educational institution. You must have obtained appropriate permission from your college or university before commencing any internship with Karya Saarthi. Proof of enrolment and college approval may be requested at any time.</li>
                        <li><strong>Vendor/Freelancer Eligibility:</strong> If you are registering as a vendor or freelancer, you must be a registered business entity or an individual professional with valid identification. Vendors must possess the requisite skills, licences, and legal authority to provide the services they offer through this platform.</li>
                        <li><strong>Saarthi Eligibility:</strong> Campus ambassadors must be currently enrolled students with a good academic standing and must comply with their institution's policies regarding part-time or freelance work.</li>
                    </ul>
                    <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-3">
                        <p class="text-sm text-amber-800"><i class="fas fa-exclamation-triangle mr-2 text-amber-500"></i> Karya Saarthi reserves the right to verify your eligibility at any time. Providing false information regarding your eligibility shall result in immediate termination of your account and any associated agreements.</p>
                    </div>
                </div>
            </div>

            <!-- Clause 3: Application Accuracy -->
            <div id="clause-3" class="bg-surface-1 rounded-xl shadow-xl border border-hairline p-6 sm:p-8 scroll-mt-24">
                <div class="flex items-start space-x-4 mb-4">
                    <span class="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0">3</span>
                    <h2 class="text-xl font-bold text-ink pt-1">Application Accuracy</h2>
                </div>
                <div class="text-ink-muted leading-relaxed space-y-3 pl-14">
                    <p>All information you submit through this portal &mdash; including but not limited to your name, contact details, educational qualifications, work experience, skills, portfolio, and references &mdash; must be <strong>truthful, accurate, complete, and up to date</strong>.</p>
                    <p>You are solely responsible for the accuracy of your application. Any misrepresentation, fabrication, or omission of material facts may result in:</p>
                    <ul class="list-disc list-inside space-y-1 ml-2">
                        <li>Immediate rejection of your application</li>
                        <li>Revocation of any offer or engagement already extended</li>
                        <li>Termination of your account without notice</li>
                        <li>Legal action, if deemed necessary by the Company</li>
                    </ul>
                    <p>You agree to promptly update your profile information whenever there is a material change in your qualifications, contact details, or professional status.</p>
                </div>
            </div>

            <!-- Clause 4: Intellectual Property -->
            <div id="clause-4" class="bg-surface-1 rounded-xl shadow-xl border border-hairline p-6 sm:p-8 scroll-mt-24">
                <div class="flex items-start space-x-4 mb-4">
                    <span class="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0">4</span>
                    <h2 class="text-xl font-bold text-ink pt-1">Intellectual Property</h2>
                </div>
                <div class="text-ink-muted leading-relaxed space-y-3 pl-14">
                    <p>All content on this portal &mdash; including but not limited to text, graphics, logos, icons, images, software, code, designs, and the overall look and feel of the website &mdash; is the exclusive intellectual property of Karya Saarthi or its licensors, and is protected under applicable Indian copyright, trademark, and intellectual property laws.</p>
                    <p><strong>Work Product:</strong> Any work, deliverables, documents, code, designs, reports, or materials created by you during the course of your engagement with Karya Saarthi (whether as an employee, intern, vendor, or freelancer) shall be considered <strong>"work made for hire"</strong> and shall be the exclusive property of Karya Saarthi. You hereby irrevocably assign all rights, title, and interest in such work product to the Company.</p>
                    <p><strong>Restrictions:</strong> You may not reproduce, distribute, modify, create derivative works from, publicly display, or commercially exploit any content from this portal without prior written consent from Karya Saarthi.</p>
                </div>
            </div>

            <!-- Clause 5: Confidentiality Obligation -->
            <div id="clause-5" class="bg-surface-1 rounded-xl shadow-xl border border-hairline p-6 sm:p-8 scroll-mt-24">
                <div class="flex items-start space-x-4 mb-4">
                    <span class="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0">5</span>
                    <h2 class="text-xl font-bold text-ink pt-1">Confidentiality Obligation</h2>
                </div>
                <div class="text-ink-muted leading-relaxed space-y-3 pl-14">
                    <p>During and after your engagement with Karya Saarthi, you agree to maintain strict confidentiality regarding all proprietary, sensitive, and non-public information you may access, including but not limited to:</p>
                    <ul class="list-disc list-inside space-y-1 ml-2">
                        <li>Client data, project details, and deliverables</li>
                        <li>Business strategies, pricing models, and financial information</li>
                        <li>Internal processes, tools, methodologies, and systems</li>
                        <li>Employee, vendor, and partner information</li>
                        <li>Lead data, customer databases, and marketing strategies</li>
                        <li>Any information explicitly marked as confidential</li>
                    </ul>
                    <p>You shall not disclose, share, publish, or use any confidential information for personal gain or for the benefit of any third party. This obligation survives the termination of your engagement with Karya Saarthi and remains in effect indefinitely.</p>
                    <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mt-3">
                        <p class="text-sm text-red-400"><i class="fas fa-shield-alt mr-2 text-red-400"></i> <strong>Breach of Confidentiality:</strong> Any breach of this clause may result in immediate termination, forfeiture of pending payments, and legal proceedings under the Indian Information Technology Act, 2000 and the Indian Contract Act, 1872.</p>
                    </div>
                </div>
            </div>

            <!-- Clause 6: Payment Terms — Vendors -->
            <div id="clause-6" class="bg-surface-1 rounded-xl shadow-xl border border-hairline p-6 sm:p-8 scroll-mt-24">
                <div class="flex items-start space-x-4 mb-4">
                    <span class="w-10 h-10 bg-accent-500 text-white rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0">6</span>
                    <h2 class="text-xl font-bold text-ink pt-1">Payment Terms &mdash; Vendors</h2>
                </div>
                <div class="text-ink-muted leading-relaxed space-y-3 pl-14">
                    <p>The following payment terms apply specifically to vendors and freelancers engaged through the Karya Saarthi portal:</p>
                    <ul class="list-disc list-inside space-y-2 ml-2">
                        <li><strong>Payment Cycle:</strong> Vendor payments shall be processed within <span class="font-semibold text-primary-700">7 (seven) working days</span> from the date of verified project completion and client approval.</li>
                        <li><strong>Verification:</strong> All deliverables must pass Karya Saarthi's internal quality review before payment is released. Incomplete or substandard work may be returned for revision without triggering the payment timeline.</li>
                        <li><strong>Payment Method:</strong> Payments will be made via bank transfer (NEFT/IMPS/UPI) to the bank account details provided by the vendor at the time of registration. It is the vendor's responsibility to ensure accurate banking details.</li>
                        <li><strong>Invoice Requirement:</strong> Vendors must submit a valid invoice/bill for each completed project. Payments will not be processed without proper documentation.</li>
                        <li><strong>Tax Compliance:</strong> All applicable taxes (including GST and TDS, if applicable) shall be deducted at source as per prevailing Indian tax laws. Vendors are responsible for their own tax filings and compliance.</li>
                    </ul>
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
                        <p class="text-sm text-blue-800"><i class="fas fa-info-circle mr-2 text-blue-500"></i> Karya Saarthi shall not be liable for payment delays caused by incomplete documentation, banking errors on the vendor's part, or force majeure events.</p>
                    </div>
                </div>
            </div>

            <!-- Clause 7: Commission Terms — Campus -->
            <div id="clause-7" class="bg-surface-1 rounded-xl shadow-xl border border-hairline p-6 sm:p-8 scroll-mt-24">
                <div class="flex items-start space-x-4 mb-4">
                    <span class="w-10 h-10 bg-accent-500 text-white rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0">7</span>
                    <h2 class="text-xl font-bold text-ink pt-1">Commission Terms &mdash; Saarthi</h2>
                </div>
                <div class="text-ink-muted leading-relaxed space-y-3 pl-14">
                    <p>The following commission terms apply to all Saarthi ambassadors:</p>
                    <ul class="list-disc list-inside space-y-2 ml-2">
                        <li><strong>Commission Payout Date:</strong> All earned commissions shall be disbursed on or before the <span class="font-semibold text-primary-700">5th of every month</span> for the leads and conversions recorded in the preceding calendar month.</li>
                        <li><strong>Commission Structure:</strong> Commission rates are determined by the type of lead, project value, and conversion status. The applicable commission structure will be communicated to each Saarthi ambassador upon onboarding and may be updated from time to time.</li>
                        <li><strong>Lead Validation:</strong> Only verified and converted leads qualify for commission payment. A lead is considered "converted" when the referred client makes a confirmed order and completes payment to Karya Saarthi.</li>
                        <li><strong>Minimum Payout Threshold:</strong> Commissions below the minimum payout threshold (as communicated during onboarding) will be carried forward to the next payment cycle.</li>
                        <li><strong>Fraudulent Leads:</strong> Submitting fake, duplicate, or self-referral leads is strictly prohibited and will result in forfeiture of all pending commissions and immediate termination from the Saarthi programme.</li>
                    </ul>
                </div>
            </div>

            <!-- Clause 8: Stipend Terms — Interns -->
            <div id="clause-8" class="bg-surface-1 rounded-xl shadow-xl border border-hairline p-6 sm:p-8 scroll-mt-24">
                <div class="flex items-start space-x-4 mb-4">
                    <span class="w-10 h-10 bg-accent-500 text-white rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0">8</span>
                    <h2 class="text-xl font-bold text-ink pt-1">Stipend Terms &mdash; Interns</h2>
                </div>
                <div class="text-ink-muted leading-relaxed space-y-3 pl-14">
                    <p>The following stipend terms apply to all interns engaged through the Karya Saarthi portal:</p>
                    <ul class="list-disc list-inside space-y-2 ml-2">
                        <li><strong>Stipend Amount:</strong> The stipend amount (if applicable) will be clearly mentioned in your offer letter or internship agreement. Not all internship positions carry a monetary stipend; some may be unpaid with other benefits such as certification, mentorship, and experience.</li>
                        <li><strong>Performance-Based:</strong> Stipend disbursement is contingent upon satisfactory performance, regular attendance, task completion, and adherence to all company policies.</li>
                        <li><strong>Payout Schedule:</strong> Stipends are paid on a monthly basis, typically by the 10th of the following month, subject to attendance and performance verification.</li>
                        <li><strong>Certification:</strong> Interns who successfully complete their internship tenure shall receive an internship completion certificate. A letter of recommendation may be issued at the sole discretion of the reporting manager.</li>
                        <li><strong>No Employment Guarantee:</strong> Completion of an internship does not guarantee full-time employment or any future engagement with Karya Saarthi.</li>
                    </ul>
                </div>
            </div>

            <!-- Clause 9: Termination Clause -->
            <div id="clause-9" class="bg-surface-1 rounded-xl shadow-xl border border-hairline p-6 sm:p-8 scroll-mt-24">
                <div class="flex items-start space-x-4 mb-4">
                    <span class="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0">9</span>
                    <h2 class="text-xl font-bold text-ink pt-1">Termination Clause</h2>
                </div>
                <div class="text-ink-muted leading-relaxed space-y-3 pl-14">
                    <p>Karya Saarthi reserves the right to terminate your account, engagement, or access to this portal at any time, with or without cause, and with or without prior notice. Grounds for termination include, but are not limited to:</p>
                    <ul class="list-disc list-inside space-y-1 ml-2">
                        <li>Violation of any clause in these Terms & Conditions</li>
                        <li>Breach of confidentiality or non-compete obligations</li>
                        <li>Submission of fraudulent or misleading information</li>
                        <li>Failure to perform assigned tasks or meet agreed deadlines</li>
                        <li>Misconduct, harassment, or any behaviour detrimental to the Company's reputation</li>
                        <li>Prolonged inactivity or non-responsiveness without prior notice</li>
                    </ul>
                    <p><strong>Effect of Termination:</strong> Upon termination, you must immediately cease all activities on behalf of Karya Saarthi, return or destroy any confidential materials in your possession, and forfeit access to the portal dashboard. Payments for duly completed and approved work prior to termination will be honoured as per the applicable payment terms.</p>
                    <p><strong>Voluntary Exit:</strong> If you wish to terminate your engagement voluntarily, you must provide at least 7 days' written notice via email to <a href="mailto:hr@karyasaarthi.com" class="text-primary-600 hover:underline">hr@karyasaarthi.com</a>.</p>
                </div>
            </div>

            <!-- Clause 10: Non-Compete -->
            <div id="clause-10" class="bg-surface-1 rounded-xl shadow-xl border border-hairline p-6 sm:p-8 scroll-mt-24">
                <div class="flex items-start space-x-4 mb-4">
                    <span class="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0">10</span>
                    <h2 class="text-xl font-bold text-ink pt-1">Non-Compete</h2>
                </div>
                <div class="text-ink-muted leading-relaxed space-y-3 pl-14">
                    <p>During the period of your engagement with Karya Saarthi, and for a period of <strong>6 (six) months</strong> following the termination of such engagement, you agree that you shall not:</p>
                    <ul class="list-disc list-inside space-y-2 ml-2">
                        <li>Directly or indirectly engage with, work for, or provide services to any business that directly competes with Karya Saarthi's core services (including but not limited to academic project assistance, research writing, website/app development, and digital marketing) within the same geographic and digital markets.</li>
                        <li>Solicit, poach, or attempt to recruit any current employee, intern, vendor, freelancer, or Saarthi ambassador of Karya Saarthi for any competing venture.</li>
                        <li>Divert, redirect, or attempt to service any existing client or lead of Karya Saarthi for personal benefit or on behalf of a competitor.</li>
                    </ul>
                    <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-3">
                        <p class="text-sm text-amber-800"><i class="fas fa-gavel mr-2 text-amber-500"></i> Violation of this non-compete clause may result in legal action for damages, injunctive relief, and recovery of any losses incurred by Karya Saarthi due to such breach.</p>
                    </div>
                </div>
            </div>

            <!-- Clause 11: Dispute Resolution -->
            <div id="clause-11" class="bg-surface-1 rounded-xl shadow-xl border border-hairline p-6 sm:p-8 scroll-mt-24">
                <div class="flex items-start space-x-4 mb-4">
                    <span class="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0">11</span>
                    <h2 class="text-xl font-bold text-ink pt-1">Dispute Resolution</h2>
                </div>
                <div class="text-ink-muted leading-relaxed space-y-3 pl-14">
                    <p>These Terms & Conditions shall be governed by and construed in accordance with the <strong>laws of India</strong>.</p>
                    <p><strong>Amicable Resolution:</strong> In the event of any dispute, controversy, or claim arising out of or relating to these Terms or the breach thereof, the parties shall first attempt to resolve the matter amicably through good-faith negotiation within 30 days of written notice of the dispute.</p>
                    <p><strong>Jurisdiction:</strong> If the dispute cannot be resolved amicably, it shall be subject to the <strong>exclusive jurisdiction of the courts located in Delhi, India</strong>. You hereby irrevocably consent to the personal jurisdiction of such courts and waive any objection to venue.</p>
                    <p><strong>Arbitration:</strong> At Karya Saarthi's sole discretion, disputes may be referred to binding arbitration under the Arbitration and Conciliation Act, 1996, with the seat of arbitration in Delhi, India. The language of arbitration shall be English.</p>
                </div>
            </div>

            <!-- Clause 12: Website Usage Terms -->
            <div id="clause-12" class="bg-surface-1 rounded-xl shadow-xl border border-hairline p-6 sm:p-8 scroll-mt-24">
                <div class="flex items-start space-x-4 mb-4">
                    <span class="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0">12</span>
                    <h2 class="text-xl font-bold text-ink pt-1">Website Usage Terms</h2>
                </div>
                <div class="text-ink-muted leading-relaxed space-y-3 pl-14">
                    <p>By using this website, you agree to the following usage terms:</p>
                    <ul class="list-disc list-inside space-y-2 ml-2">
                        <li><strong>Lawful Use Only:</strong> You shall use this portal only for lawful purposes and in a manner consistent with these Terms. You shall not use the portal to engage in any illegal, fraudulent, or harmful activity.</li>
                        <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your login credentials. Any activity conducted under your account is your responsibility. Notify us immediately at <a href="mailto:hr@karyasaarthi.com" class="text-primary-600 hover:underline">hr@karyasaarthi.com</a> if you suspect unauthorized access to your account.</li>
                        <li><strong>Prohibited Activities:</strong> You may not: attempt to gain unauthorized access to any part of the portal or its systems; use automated bots, scrapers, or crawlers; upload malicious code, viruses, or harmful files; impersonate any person or entity; or interfere with the portal's normal operation.</li>
                        <li><strong>Availability:</strong> Karya Saarthi does not guarantee uninterrupted or error-free access to the portal. The website may be temporarily unavailable due to maintenance, updates, or technical issues.</li>
                        <li><strong>Third-Party Links:</strong> This portal may contain links to third-party websites. Karya Saarthi is not responsible for the content, privacy practices, or availability of such external sites.</li>
                    </ul>
                </div>
            </div>

            <!-- Clause 13: Cookies & Tracking -->
            <div id="clause-13" class="bg-surface-1 rounded-xl shadow-xl border border-hairline p-6 sm:p-8 scroll-mt-24">
                <div class="flex items-start space-x-4 mb-4">
                    <span class="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0">13</span>
                    <h2 class="text-xl font-bold text-ink pt-1">Cookies & Tracking</h2>
                </div>
                <div class="text-ink-muted leading-relaxed space-y-3 pl-14">
                    <p>The Karya Saarthi career portal uses cookies and similar tracking technologies to enhance your browsing experience. By using this portal, you consent to the use of cookies as described below:</p>
                    <ul class="list-disc list-inside space-y-2 ml-2">
                        <li><strong>Essential Cookies:</strong> These are necessary for the portal to function correctly, including session management, authentication, and security. These cookies cannot be disabled.</li>
                        <li><strong>Analytics Cookies:</strong> We use analytics tools (such as Google Analytics) to understand user behaviour, page views, traffic sources, and portal performance. This data is collected in an anonymized and aggregated form.</li>
                        <li><strong>Functional Cookies:</strong> These cookies remember your preferences (such as language, region, and display settings) to provide a personalised experience.</li>
                        <li><strong>Marketing/Tracking Cookies:</strong> We may use third-party tracking pixels and cookies for remarketing and advertising purposes to show relevant opportunities to returning visitors.</li>
                    </ul>
                    <p>You may control cookie preferences through your browser settings. However, disabling certain cookies may impair your ability to use specific features of the portal.</p>
                    <p>For more details on how we handle your personal data, please refer to our <a href="<?= BASE_PATH ?>/privacy.php" class="text-primary-600 hover:underline font-medium">Privacy Policy</a>.</p>
                </div>
            </div>

            <!-- Clause 14: Amendment Rights -->
            <div id="clause-14" class="bg-surface-1 rounded-xl shadow-xl border border-hairline p-6 sm:p-8 scroll-mt-24">
                <div class="flex items-start space-x-4 mb-4">
                    <span class="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0">14</span>
                    <h2 class="text-xl font-bold text-ink pt-1">Amendment Rights</h2>
                </div>
                <div class="text-ink-muted leading-relaxed space-y-3 pl-14">
                    <p>Karya Saarthi reserves the right to <strong>modify, update, or replace</strong> any part of these Terms & Conditions at any time, at its sole discretion, without prior individual notice.</p>
                    <p>Any amendments will take effect immediately upon being published on this page. The "Last Updated" date at the top of this document will reflect the most recent revision.</p>
                    <p>It is your responsibility to review these Terms periodically. Your continued use of the portal after any amendments constitutes your acceptance of the revised Terms.</p>
                    <p>For significant changes that materially affect your rights or obligations, Karya Saarthi will make reasonable efforts to provide notice via email or a prominent notification on the portal. However, the absence of such notice does not invalidate the amended Terms.</p>
                </div>
            </div>

        </div>

        <!-- Contact Section -->
        <div class="mt-12 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border border-primary-100 p-6 sm:p-8 text-center">
            <h3 class="text-lg font-bold text-ink mb-2">Have Questions About These Terms?</h3>
            <p class="text-ink-muted text-sm mb-4">If you have any questions, concerns, or require clarification regarding these Terms & Conditions, please do not hesitate to reach out.</p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href="mailto:hr@karyasaarthi.com" class="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition">
                    <i class="fas fa-envelope mr-2"></i> Email Us
                </a>
                <a href="https://wa.me/918595275753?text=Hi%20Karya%20Saarthi!%20I%20have%20a%20question%20about%20your%20Terms%20%26%20Conditions." target="_blank" rel="noopener noreferrer" class="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition">
                    <i class="fab fa-whatsapp mr-2"></i> WhatsApp
                </a>
                <a href="<?= BASE_PATH ?>/contact.php" class="inline-flex items-center bg-surface-2 hover:bg-surface-1 text-ink border border-hairline bg-surface-2 text-ink px-5 py-2.5 rounded-lg text-sm font-medium transition">
                    <i class="fas fa-headset mr-2"></i> Contact Page
                </a>
            </div>
        </div>

        <!-- Back to Top -->
        <div class="mt-8 text-center">
            <a href="#" class="inline-flex items-center text-sm text-ink-muted hover:text-primary-600 transition">
                <i class="fas fa-arrow-up mr-2"></i> Back to Top
            </a>
        </div>

    </div>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>






