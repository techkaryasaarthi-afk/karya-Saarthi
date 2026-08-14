<?php
$pageTitle = 'Contact Us';
$pageDescription = 'Get in touch with Karya Saarthi HR team. Submit your queries, find answers to FAQs, or reach us via phone, email & WhatsApp. Hum Hai Aapke Saarthi!';
$pageKeywords = 'contact Karya Saarthi, Karya Saarthi help, Karya Saarthi phone number, Karya Saarthi email, career support, HR contact India';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/mailer.php';

// Handle form submission
$formSuccess = false;
$formError = '';
$formData = ['name' => '', 'email' => '', 'phone' => '', 'subject' => '', 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $formData = [
        'name'    => trim($_POST['name'] ?? ''),
        'email'   => trim($_POST['email'] ?? ''),
        'phone'   => trim($_POST['phone'] ?? ''),
        'subject' => trim($_POST['subject'] ?? ''),
        'message' => trim($_POST['message'] ?? ''),
    ];

    // Validation
    if (empty($formData['name'])) {
        $formError = 'Please enter your full name.';
    } elseif (empty($formData['email']) || !filter_var($formData['email'], FILTER_VALIDATE_EMAIL)) {
        $formError = 'Please enter a valid email address.';
    } elseif (empty($formData['phone']) || !preg_match('/^[+]?[\d\s\-]{7,15}$/', $formData['phone'])) {
        $formError = 'Please enter a valid phone number.';
    } elseif (empty($formData['subject'])) {
        $formError = 'Please select a subject.';
    } elseif (empty($formData['message']) || strlen($formData['message']) < 10) {
        $formError = 'Please enter a message (at least 10 characters).';
    } else {
        // Save to database
        try {
            $pdo = getDBConnection();
            $stmt = $pdo->prepare("INSERT INTO contact_queries (name, email, phone, subject, message, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
            $stmt->execute([
                $formData['name'],
                $formData['email'],
                $formData['phone'],
                $formData['subject'],
                $formData['message'],
            ]);

            // Send email to Info@karyasaarthi.com
            $emailTo = 'Info@karyasaarthi.com';
            $emailSubject = 'New Query: ' . $formData['subject'] . ' — from ' . $formData['name'];
            $emailBody = "
<html><body style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;'>
<div style='background:linear-gradient(135deg,#1e40af,#2563eb,#f97316);color:white;padding:25px;text-align:center;border-radius:12px 12px 0 0;'>
    <h1 style='margin:0;font-size:22px;'>Karya Saarthi Careers</h1>
    <p style='color:#fdba74;margin:5px 0 0;font-size:13px;'>New Contact Query Received</p>
</div>
<div style='padding:25px;background:#f9fafb;border:1px solid #e5e7eb;'>
    <table style='width:100%;border-collapse:collapse;'>
        <tr><td style='padding:8px 0;color:#6b7280;width:120px;'>Name:</td><td style='padding:8px 0;font-weight:bold;color:#1f2937;'>" . htmlspecialchars($formData['name'], ENT_QUOTES, 'UTF-8', false) . "</td></tr>
        <tr><td style='padding:8px 0;color:#6b7280;'>Email:</td><td style='padding:8px 0;'><a href='mailto:" . htmlspecialchars($formData['email'], ENT_QUOTES, 'UTF-8', false) . "'>" . htmlspecialchars($formData['email'], ENT_QUOTES, 'UTF-8', false) . "</a></td></tr>
        <tr><td style='padding:8px 0;color:#6b7280;'>Phone:</td><td style='padding:8px 0;'><a href='tel:" . htmlspecialchars($formData['phone'], ENT_QUOTES, 'UTF-8', false) . "'>" . htmlspecialchars($formData['phone'], ENT_QUOTES, 'UTF-8', false) . "</a></td></tr>
        <tr><td style='padding:8px 0;color:#6b7280;'>Subject:</td><td style='padding:8px 0;font-weight:bold;'>" . htmlspecialchars($formData['subject'], ENT_QUOTES, 'UTF-8', false) . "</td></tr>
    </table>
    <div style='margin-top:15px;padding:15px;background:white;border:1px solid #e5e7eb;border-radius:8px;'>
        <strong style='color:#6b7280;'>Message:</strong>
        <p style='color:#374151;margin-top:8px;'>" . nl2br(htmlspecialchars($formData['message'], ENT_QUOTES, 'UTF-8', false)) . "</p>
    </div>
    <p style='margin-top:15px;color:#9ca3af;font-size:12px;'>Received on: " . date('d M Y, h:i A') . "</p>
</div>
<div style='padding:15px;text-align:center;color:#9ca3af;font-size:12px;border-top:1px solid #e5e7eb;'>
    Karya Saarthi Careers | career.karyasaarthi.com
</div>
</body></html>";

            sendEmail($emailTo, $emailSubject, $emailBody, $formData['email']);

            $formSuccess = true;
            $formData = ['name' => '', 'email' => '', 'phone' => '', 'subject' => '', 'message' => ''];
        } catch (Exception $e) {
            $formError = 'Something went wrong. Please try again later or contact us directly via phone/email.';
        }
    }
}

require_once __DIR__ . '/includes/header.php';
?>

<!-- Hero Section -->
<section class="gradient-bg text-white py-14 relative overflow-hidden">
    <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 left-10 w-40 h-40 border-2 border-white rounded-full"></div>
        <div class="absolute bottom-10 right-20 w-64 h-64 border-2 border-white rounded-full"></div>
    </div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <span class="inline-flex items-center bg-surface-1/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <i class="fas fa-headset mr-2"></i> We're Here to Help
        </span>
        <h1 class="text-3xl sm:text-4xl font-extrabold mb-3">Contact Us</h1>
        <p class="text-lg text-indigo-100 max-w-2xl mx-auto">Have a question, need help, or want to connect with our HR team? We'd love to hear from you. Hum Hai Aapke Saarthi!</p>
    </div>
</section>

<!-- Breadcrumb -->
<div class="bg-surface-1 border-b border-hairline">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav class="flex text-sm text-ink-muted" aria-label="Breadcrumb">
            <a href="<?= BASE_PATH ?>/" class="hover:text-ink transition">Home</a>
            <span class="mx-2">/</span>
            <span class="text-ink font-medium">Contact Us</span>
        </nav>
    </div>
</div>

<!-- HR Contact Details Cards -->
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="text-center mb-10">
        <h2 class="text-2xl sm:text-3xl font-bold text-ink mb-3">Get in Touch</h2>
        <p class="text-ink-muted max-w-xl mx-auto">Reach out to our HR team through any of the channels below. We typically respond within 24 hours on working days.</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <!-- Email Card -->
        <div class="bg-surface-1 rounded-xl border border-hairline p-6 hover:shadow-md transition-shadow text-center">
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 mb-4">
                <i class="fas fa-envelope text-2xl"></i>
            </div>
            <h3 class="text-lg font-bold text-ink mb-3">Email Us</h3>
            <a href="mailto:hr@karyasaarthi.com" class="block text-sm text-blue-600 hover:underline mb-1">hr@karyasaarthi.com</a>
            <a href="mailto:Info@karyasaarthi.com" class="block text-sm text-blue-600 hover:underline">Info@karyasaarthi.com</a>
        </div>

        <!-- Phone Card -->
        <div class="bg-surface-1 rounded-xl border border-hairline p-6 hover:shadow-md transition-shadow text-center">
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-100 text-green-600 mb-4">
                <i class="fas fa-phone-alt text-2xl"></i>
            </div>
            <h3 class="text-lg font-bold text-ink mb-3">Call Us</h3>
            <a href="https://wa.me/918595275753" class="block text-sm text-ink-muted hover:text-ink mb-1"><i class="fab fa-whatsapp text-green-400 mr-1"></i> +91 85952 75753</a>
            <a href="https://wa.me/916238521530" class="block text-sm text-ink-muted hover:text-ink"><i class="fab fa-whatsapp text-green-400 mr-1"></i> +91 62385 21530</a>
        </div>

        <!-- WhatsApp Card -->
        <div class="bg-surface-1 rounded-xl border border-hairline p-6 hover:shadow-md transition-shadow text-center">
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 mb-4">
                <i class="fab fa-whatsapp text-2xl"></i>
            </div>
            <h3 class="text-lg font-bold text-ink mb-3">WhatsApp</h3>
            <p class="text-sm text-ink-muted mb-3">Chat with us instantly for quick queries and support.</p>
            <a href="https://wa.me/918595275753?text=Hi%20Karya%20Saarthi!%20I%20need%20help." target="_blank" rel="noopener noreferrer"
               class="inline-flex items-center bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                <i class="fab fa-whatsapp mr-2"></i> Start Chat
            </a>
        </div>

        <!-- Hours Card -->
        <div class="bg-surface-1 rounded-xl border border-hairline p-6 hover:shadow-md transition-shadow text-center">
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 mb-4">
                <i class="fas fa-clock text-2xl"></i>
            </div>
            <h3 class="text-lg font-bold text-ink mb-3">Working Hours</h3>
            <p class="text-sm text-ink-muted font-medium mb-1">Monday - Saturday</p>
            <p class="text-sm text-ink-muted">9:00 AM - 6:00 PM</p>
            <p class="text-xs text-ink-muted mt-2">Sunday & Public Holidays: Closed</p>
        </div>
    </div>
</section>

<!-- Contact Form + Map/Info Section -->
<section class="bg-surface-1 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">

            <!-- Contact Form (3 cols) -->
            <div class="lg:col-span-3">
                <div class="bg-surface-1 rounded-xl border border-hairline shadow-2xl p-6 sm:p-8">
                    <h2 class="text-2xl font-bold text-ink mb-2">Send Us a Query</h2>
                    <p class="text-sm text-ink-muted mb-6">Fill out the form below and our team will get back to you as soon as possible.</p>

                    <?php if ($formSuccess): ?>
                        <div class="bg-green-500/10 border border-green-200 text-green-700 rounded-lg p-4 mb-6 flex items-start">
                            <i class="fas fa-check-circle mt-0.5 mr-3 text-green-400"></i>
                            <div>
                                <p class="font-semibold">Query Submitted Successfully!</p>
                                <p class="text-sm mt-1">Thank you for reaching out. Our HR team will review your query and respond within 24-48 working hours.</p>
                            </div>
                        </div>
                    <?php endif; ?>

                    <?php if ($formError): ?>
                        <div class="bg-red-500/10 border border-red-500/20 text-red-700 rounded-lg p-4 mb-6 flex items-start">
                            <i class="fas fa-exclamation-circle mt-0.5 mr-3 text-red-400"></i>
                            <p class="text-sm"><?= htmlspecialchars($formError, ENT_QUOTES, 'UTF-8', false) ?></p>
                        </div>
                    <?php endif; ?>

                    <form method="POST" action="contact.php" class="space-y-5" novalidate>
                        <!-- Name & Email Row -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label for="name" class="block text-sm font-medium text-ink-muted mb-1">Full Name <span class="text-red-400">*</span></label>
                                <input type="text" id="name" name="name" required placeholder="Enter your full name"
                                       value="<?= htmlspecialchars($formData['name'], ENT_QUOTES, 'UTF-8', false) ?>"
                                       class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            </div>
                            <div>
                                <label for="email" class="block text-sm font-medium text-ink-muted mb-1">Email Address <span class="text-red-400">*</span></label>
                                <input type="email" id="email" name="email" required placeholder="you@example.com"
                                       value="<?= htmlspecialchars($formData['email'], ENT_QUOTES, 'UTF-8', false) ?>"
                                       class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            </div>
                        </div>

                        <!-- Phone & Subject Row -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label for="phone" class="block text-sm font-medium text-ink-muted mb-1">Phone Number <span class="text-red-400">*</span></label>
                                <input type="tel" id="phone" name="phone" required placeholder="+91 XXXXX XXXXX"
                                       value="<?= htmlspecialchars($formData['phone'], ENT_QUOTES, 'UTF-8', false) ?>"
                                       class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            </div>
                            <div>
                                <label for="subject" class="block text-sm font-medium text-ink-muted mb-1">Subject <span class="text-red-400">*</span></label>
                                <select id="subject" name="subject" required
                                        class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-surface-1">
                                    <option value="">Select a subject</option>
                                    <option value="Job Application Query" <?= $formData['subject'] === 'Job Application Query' ? 'selected' : '' ?>>Job Application Query</option>
                                    <option value="Saarthi Program" <?= $formData['subject'] === 'Saarthi Program' ? 'selected' : '' ?>>Saarthi Program</option>
                                    <option value="Internship Inquiry" <?= $formData['subject'] === 'Internship Inquiry' ? 'selected' : '' ?>>Internship Inquiry</option>
                                    <option value="Vendor / Freelancer Query" <?= $formData['subject'] === 'Vendor / Freelancer Query' ? 'selected' : '' ?>>Vendor / Freelancer Query</option>
                                    <option value="Payment / Earnings Issue" <?= $formData['subject'] === 'Payment / Earnings Issue' ? 'selected' : '' ?>>Payment / Earnings Issue</option>
                                    <option value="Technical Issue" <?= $formData['subject'] === 'Technical Issue' ? 'selected' : '' ?>>Technical Issue</option>
                                    <option value="Interview / Selection Process" <?= $formData['subject'] === 'Interview / Selection Process' ? 'selected' : '' ?>>Interview / Selection Process</option>
                                    <option value="Feedback / Suggestion" <?= $formData['subject'] === 'Feedback / Suggestion' ? 'selected' : '' ?>>Feedback / Suggestion</option>
                                    <option value="Other" <?= $formData['subject'] === 'Other' ? 'selected' : '' ?>>Other</option>
                                </select>
                            </div>
                        </div>

                        <!-- Message -->
                        <div>
                            <label for="message" class="block text-sm font-medium text-ink-muted mb-1">Message <span class="text-red-400">*</span></label>
                            <textarea id="message" name="message" rows="5" required placeholder="Describe your query in detail..."
                                      class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"><?= htmlspecialchars($formData['message'], ENT_QUOTES, 'UTF-8', false) ?></textarea>
                        </div>

                        <!-- Submit Button -->
                        <button type="submit"
                                class="button-primary w-full sm:w-auto px-8 py-3 inline-flex items-center justify-center">
                            <i class="fas fa-paper-plane mr-2"></i> Submit Query
                        </button>
                    </form>
                </div>
            </div>

            <!-- Quick Info Sidebar (2 cols) -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Response Time -->
                <div class="bg-surface-1 rounded-xl border border-hairline p-6">
                    <h3 class="text-lg font-bold text-ink mb-4"><i class="fas fa-bolt text-amber-500 mr-2"></i>Quick Response</h3>
                    <div class="space-y-3">
                        <div class="flex items-start">
                            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mr-3 mt-0.5">
                                <i class="fas fa-envelope text-blue-600 text-xs"></i>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-ink">Email Response</p>
                                <p class="text-xs text-ink-muted">Within 24-48 working hours</p>
                            </div>
                        </div>
                        <div class="flex items-start">
                            <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mr-3 mt-0.5">
                                <i class="fab fa-whatsapp text-green-600 text-xs"></i>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-ink">WhatsApp Response</p>
                                <p class="text-xs text-ink-muted">Within 2-4 hours during working hours</p>
                            </div>
                        </div>
                        <div class="flex items-start">
                            <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mr-3 mt-0.5">
                                <i class="fas fa-phone text-purple-600 text-xs"></i>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-ink">Phone Support</p>
                                <p class="text-xs text-ink-muted">Mon-Sat, 9:00 AM - 6:00 PM IST</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Direct Contact -->
                <div class="bg-surface-1 rounded-xl border border-hairline p-6">
                    <h3 class="text-lg font-bold text-ink mb-4"><i class="fas fa-address-book text-blue-500 mr-2"></i>Direct Contact</h3>
                    <div class="space-y-3">
                        <a href="https://wa.me/918595275753" class="flex items-center text-sm text-ink-muted hover:text-ink transition">
                            <i class="fab fa-whatsapp w-5 mr-2 text-green-400"></i> +91 85952 75753
                        </a>
                        <a href="https://wa.me/916238521530" class="flex items-center text-sm text-ink-muted hover:text-ink transition">
                            <i class="fab fa-whatsapp w-5 mr-2 text-green-400"></i> +91 62385 21530
                        </a>
                        <a href="mailto:Info@karyasaarthi.com" class="flex items-center text-sm text-ink-muted hover:text-ink transition">
                            <i class="fas fa-envelope w-5 mr-2 text-accent-500"></i> Info@karyasaarthi.com
                        </a>
                        <a href="mailto:hr@karyasaarthi.com" class="flex items-center text-sm text-ink-muted hover:text-ink transition">
                            <i class="fas fa-envelope w-5 mr-2 text-accent-500"></i> hr@karyasaarthi.com
                        </a>
                    </div>
                </div>

                <!-- Quick Links -->
                <div class="bg-blue-50 rounded-xl border border-blue-100 p-6">
                    <h3 class="text-lg font-bold text-ink mb-4"><i class="fas fa-link text-blue-500 mr-2"></i>Helpful Links</h3>
                    <div class="space-y-2">
                        <a href="<?= BASE_PATH ?>/careers.php" class="flex items-center text-sm text-blue-700 hover:text-blue-800 font-medium transition">
                            <i class="fas fa-chevron-right text-xs mr-2"></i> Browse All Jobs
                        </a>
                        <a href="<?= BASE_PATH ?>/campus-saarthi.php" class="flex items-center text-sm text-blue-700 hover:text-blue-800 font-medium transition">
                            <i class="fas fa-chevron-right text-xs mr-2"></i> Saarthi Program
                        </a>
                        <a href="<?= BASE_PATH ?>/register.php" class="flex items-center text-sm text-blue-700 hover:text-blue-800 font-medium transition">
                            <i class="fas fa-chevron-right text-xs mr-2"></i> Register / Apply Now
                        </a>
                        <a href="<?= BASE_PATH ?>/policy.php" class="flex items-center text-sm text-blue-700 hover:text-blue-800 font-medium transition">
                            <i class="fas fa-chevron-right text-xs mr-2"></i> HR Policy
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- FAQ Accordion Section -->
<section class="py-12 bg-canvas">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10">
            <h2 class="text-2xl sm:text-3xl font-bold text-ink mb-3">Frequently Asked Questions</h2>
            <p class="text-ink-muted">Quick answers to the most common questions about working with Karya Saarthi.</p>
        </div>

        <div class="space-y-3" id="faq-accordion">
            <!-- FAQ 1 -->
            <div class="bg-surface-1 rounded-xl border border-hairline overflow-hidden faq-item">
                <button onclick="toggleFaq(this)" class="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-surface-2 transition" aria-expanded="false">
                    <span class="text-sm sm:text-base font-semibold text-ink pr-4"><i class="fas fa-briefcase text-blue-500 mr-2"></i>How do I apply for a job at Karya Saarthi?</span>
                    <i class="fas fa-chevron-down text-ink-muted transition-transform duration-300 faq-icon flex-shrink-0"></i>
                </button>
                <div class="faq-content hidden px-6 pb-5">
                    <p class="text-sm text-ink-muted leading-relaxed">
                        Applying is simple! Visit our <a href="<?= BASE_PATH ?>/careers.php" class="text-ink hover:underline font-medium">Careers page</a>, browse through available openings, and click "Apply Now" on the role that interests you. You will need to create an account (or log in if you already have one), fill out the application form with your details, upload your resume, and submit. You will receive a confirmation email once your application is submitted successfully.
                    </p>
                </div>
            </div>

            <!-- FAQ 2 -->
            <div class="bg-surface-1 rounded-xl border border-hairline overflow-hidden faq-item">
                <button onclick="toggleFaq(this)" class="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-surface-2 transition" aria-expanded="false">
                    <span class="text-sm sm:text-base font-semibold text-ink pr-4"><i class="fas fa-graduation-cap text-green-400 mr-2"></i>What is Saarthi?</span>
                    <i class="fas fa-chevron-down text-ink-muted transition-transform duration-300 faq-icon flex-shrink-0"></i>
                </button>
                <div class="faq-content hidden px-6 pb-5">
                    <p class="text-sm text-ink-muted leading-relaxed">
                        Saarthi is our student ambassador program designed for college students. As a Saarthi, you represent Karya Saarthi on your campus, share career opportunities with fellow students using your unique referral code, and earn a <strong>10% commission</strong> on every successful project completed through your referral. It is a flexible, zero-investment opportunity that lets you earn while studying. Learn more on our <a href="<?= BASE_PATH ?>/campus-saarthi.php" class="text-ink hover:underline font-medium">Saarthi page</a>.
                    </p>
                </div>
            </div>

            <!-- FAQ 3 -->
            <div class="bg-surface-1 rounded-xl border border-hairline overflow-hidden faq-item">
                <button onclick="toggleFaq(this)" class="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-surface-2 transition" aria-expanded="false">
                    <span class="text-sm sm:text-base font-semibold text-ink pr-4"><i class="fas fa-search text-purple-500 mr-2"></i>How do I track my application status?</span>
                    <i class="fas fa-chevron-down text-ink-muted transition-transform duration-300 faq-icon flex-shrink-0"></i>
                </button>
                <div class="faq-content hidden px-6 pb-5">
                    <p class="text-sm text-ink-muted leading-relaxed">
                        Once you have submitted an application, you can track its status by logging into your <a href="<?= BASE_PATH ?>/user-panel/" class="text-ink hover:underline font-medium">Dashboard</a>. Your dashboard shows all your submitted applications along with their current status (Submitted, Under Review, Shortlisted, Interview Scheduled, Selected, or Rejected). You will also receive email notifications when your application status changes.
                    </p>
                </div>
            </div>

            <!-- FAQ 4 -->
            <div class="bg-surface-1 rounded-xl border border-hairline overflow-hidden faq-item">
                <button onclick="toggleFaq(this)" class="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-surface-2 transition" aria-expanded="false">
                    <span class="text-sm sm:text-base font-semibold text-ink pr-4"><i class="fas fa-file-alt text-amber-500 mr-2"></i>What documents are needed to apply?</span>
                    <i class="fas fa-chevron-down text-ink-muted transition-transform duration-300 faq-icon flex-shrink-0"></i>
                </button>
                <div class="faq-content hidden px-6 pb-5">
                    <p class="text-sm text-ink-muted leading-relaxed">
                        The required documents may vary by role, but generally you will need:
                    </p>
                    <ul class="text-sm text-ink-muted mt-2 space-y-1 list-disc list-inside text-ink-muted">
                        <li>Updated Resume / CV (PDF format preferred)</li>
                        <li>Valid Government ID (Aadhaar, PAN, Passport, etc.)</li>
                        <li>Passport-size photograph</li>
                        <li>Educational certificates / marksheets (for interns and freshers)</li>
                        <li>College ID card (for Saarthi applicants)</li>
                        <li>Portfolio or work samples (for vendor/freelancer roles)</li>
                    </ul>
                    <p class="text-sm text-ink-muted mt-2">Specific requirements will be mentioned in the job listing.</p>
                </div>
            </div>

            <!-- FAQ 5 -->
            <div class="bg-surface-1 rounded-xl border border-hairline overflow-hidden faq-item">
                <button onclick="toggleFaq(this)" class="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-surface-2 transition" aria-expanded="false">
                    <span class="text-sm sm:text-base font-semibold text-ink pr-4"><i class="fas fa-hourglass-half text-red-400 mr-2"></i>When will I hear back after applying?</span>
                    <i class="fas fa-chevron-down text-ink-muted transition-transform duration-300 faq-icon flex-shrink-0"></i>
                </button>
                <div class="faq-content hidden px-6 pb-5">
                    <p class="text-sm text-ink-muted leading-relaxed">
                        Our HR team reviews applications on a rolling basis. Typically, you can expect an initial response within <strong>3-7 working days</strong> of submitting your application. If you are shortlisted, you will receive an email or phone call to schedule the next steps. If you have not heard back within 10 working days, feel free to follow up by contacting us via email at <a href="mailto:hr@karyasaarthi.com" class="text-ink hover:underline font-medium">hr@karyasaarthi.com</a> or through WhatsApp.
                    </p>
                </div>
            </div>

            <!-- FAQ 6 -->
            <div class="bg-surface-1 rounded-xl border border-hairline overflow-hidden faq-item">
                <button onclick="toggleFaq(this)" class="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-surface-2 transition" aria-expanded="false">
                    <span class="text-sm sm:text-base font-semibold text-ink pr-4"><i class="fas fa-user-check text-cyan-500 mr-2"></i>How does the interview process work?</span>
                    <i class="fas fa-chevron-down text-ink-muted transition-transform duration-300 faq-icon flex-shrink-0"></i>
                </button>
                <div class="faq-content hidden px-6 pb-5">
                    <p class="text-sm text-ink-muted leading-relaxed">
                        Our interview process is designed to be transparent and candidate-friendly. It typically involves:
                    </p>
                    <ol class="text-sm text-ink-muted mt-2 space-y-1 list-decimal list-inside text-ink-muted">
                        <li><strong>Application Screening</strong> — Our HR team reviews your profile and resume.</li>
                        <li><strong>Telephonic / WhatsApp Round</strong> — A brief call to discuss your background and expectations.</li>
                        <li><strong>Task / Assessment</strong> — For some roles, a small task or assignment may be given to evaluate skills.</li>
                        <li><strong>Final Interview</strong> — A detailed video or in-person interview with the team lead or department head.</li>
                        <li><strong>Offer & Onboarding</strong> — Selected candidates receive an offer letter and onboarding instructions.</li>
                    </ol>
                    <p class="text-sm text-ink-muted mt-2">The exact steps may vary depending on the role and category.</p>
                </div>
            </div>

            <!-- FAQ 7 -->
            <div class="bg-surface-1 rounded-xl border border-hairline overflow-hidden faq-item">
                <button onclick="toggleFaq(this)" class="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-surface-2 transition" aria-expanded="false">
                    <span class="text-sm sm:text-base font-semibold text-ink pr-4"><i class="fas fa-landmark text-indigo-500 mr-2"></i>What is the Saarthi structure?</span>
                    <i class="fas fa-chevron-down text-ink-muted transition-transform duration-300 faq-icon flex-shrink-0"></i>
                </button>
                <div class="faq-content hidden px-6 pb-5">
                    <p class="text-sm text-ink-muted leading-relaxed">
                        The Saarthi structure is the foundation of Karya Saarthi's organizational model. It represents five core functional pillars that drive our operations:
                    </p>
                    <ul class="text-sm text-ink-muted mt-2 space-y-1 list-disc list-inside text-ink-muted">
                        <li><strong>Academic Pillar</strong> — Research papers, thesis, dissertations & academic writing</li>
                        <li><strong>Technology Pillar</strong> — Website development, app development & software solutions</li>
                        <li><strong>Marketing Pillar</strong> — Digital marketing, SEO, social media management & branding</li>
                        <li><strong>Design Pillar</strong> — Graphic design, UI/UX, video editing & creative content</li>
                        <li><strong>Business Pillar</strong> — Business development, sales, client relations & strategy</li>
                    </ul>
                    <p class="text-sm text-ink-muted mt-2">Each pillar has dedicated roles across employee, vendor, intern, and part-time categories. Browse Saarthi roles on our <a href="<?= BASE_PATH ?>/careers.php?category=pillar_post" class="text-ink hover:underline font-medium">Careers page</a>.</p>
                </div>
            </div>

            <!-- FAQ 8 -->
            <div class="bg-surface-1 rounded-xl border border-hairline overflow-hidden faq-item">
                <button onclick="toggleFaq(this)" class="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-surface-2 transition" aria-expanded="false">
                    <span class="text-sm sm:text-base font-semibold text-ink pr-4"><i class="fas fa-wallet text-teal-500 mr-2"></i>How are vendors/freelancers paid?</span>
                    <i class="fas fa-chevron-down text-ink-muted transition-transform duration-300 faq-icon flex-shrink-0"></i>
                </button>
                <div class="faq-content hidden px-6 pb-5">
                    <p class="text-sm text-ink-muted leading-relaxed">
                        Vendors and freelancers at Karya Saarthi are paid on a <strong>project-completion basis</strong>. Here is how it works:
                    </p>
                    <ul class="text-sm text-ink-muted mt-2 space-y-1 list-disc list-inside text-ink-muted">
                        <li>Payment is released after the project is completed and approved by the client.</li>
                        <li>Payments are processed via <strong>bank transfer (NEFT/IMPS)</strong> or <strong>UPI</strong>.</li>
                        <li>Standard payment cycle is <strong>7-15 working days</strong> after project approval.</li>
                        <li>You can track your earnings and payment history from your <a href="<?= BASE_PATH ?>/user-panel/earnings.php" class="text-ink hover:underline font-medium">Dashboard</a>.</li>
                        <li>For high-value projects, milestone-based partial payments may be arranged.</li>
                    </ul>
                    <p class="text-sm text-ink-muted mt-2">For payment-related queries, contact us at <a href="mailto:hr@karyasaarthi.com" class="text-ink hover:underline font-medium">hr@karyasaarthi.com</a>.</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- CTA Section -->
<section class="py-16 gradient-bg text-white">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl sm:text-4xl font-extrabold mb-4">Still Have Questions?</h2>
        <p class="text-indigo-100 text-lg mb-8">Our HR team is always happy to assist you. Reach out on WhatsApp for the fastest response, or explore open positions to start your journey.</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://wa.me/918595275753?text=Hi%20Karya%20Saarthi!%20I%20have%20a%20question." target="_blank" rel="noopener noreferrer"
               class="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3.5 rounded-xl text-base transition shadow-lg">
                <i class="fab fa-whatsapp mr-2 text-xl"></i> Chat on WhatsApp
            </a>
            <a href="<?= BASE_PATH ?>/careers.php"
               class="inline-flex items-center justify-center bg-surface-1 text-blue-700 hover:bg-indigo-50 font-bold px-8 py-3.5 rounded-xl text-base transition shadow-lg">
                <i class="fas fa-briefcase mr-2"></i> Explore Careers
            </a>
        </div>
    </div>
</section>

<!-- FAQ Accordion Script -->
<script>
function toggleFaq(button) {
    const content = button.nextElementSibling;
    const icon = button.querySelector('.faq-icon');
    const isOpen = !content.classList.contains('hidden');

    // Close all other FAQs
    document.querySelectorAll('.faq-item').forEach(item => {
        const otherContent = item.querySelector('.faq-content');
        const otherIcon = item.querySelector('.faq-icon');
        const otherButton = item.querySelector('button');
        if (otherContent !== content) {
            otherContent.classList.add('hidden');
            otherIcon.style.transform = 'rotate(0deg)';
            otherButton.setAttribute('aria-expanded', 'false');
        }
    });

    // Toggle current
    if (isOpen) {
        content.classList.add('hidden');
        icon.style.transform = 'rotate(0deg)';
        button.setAttribute('aria-expanded', 'false');
    } else {
        content.classList.remove('hidden');
        icon.style.transform = 'rotate(180deg)';
        button.setAttribute('aria-expanded', 'true');
    }
}
</script>

<!-- ContactPage Schema Markup -->
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Karya Saarthi",
    "description": "Get in touch with Karya Saarthi HR team for career queries, support, and assistance.",
    "url": "https://career.karyasaarthi.com/contact.php",
    "mainEntity": {
        "@type": "Organization",
        "name": "Karya Saarthi",
        "telephone": ["+91-8595275753", "+91-6238521530"],
        "email": ["hr@karyasaarthi.com", "Info@karyasaarthi.com"],
        "contactPoint": [
            {
                "@type": "ContactPoint",
                "telephone": "+91-8595275753",
                "contactType": "customer service",
                "availableLanguage": ["English", "Hindi"],
                "hoursAvailable": {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                    "opens": "09:00",
                    "closes": "18:00"
                }
            }
        ]
    }
}
</script>

<!-- FAQPage Schema Markup -->
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "How do I apply for a job at Karya Saarthi?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Visit our Careers page, browse available openings, and click Apply Now on the role that interests you. Create an account or log in, fill out the application form, upload your resume, and submit. You will receive a confirmation email once your application is submitted."
            }
        },
        {
            "@type": "Question",
            "name": "What is Saarthi?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Saarthi is our student ambassador program for college students. You represent Karya Saarthi on your campus, share opportunities using your unique referral code, and earn a 10% commission on every successful project completed through your referral."
            }
        },
        {
            "@type": "Question",
            "name": "How do I track my application status?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Log into your Dashboard to track all submitted applications and their current status (Submitted, Under Review, Shortlisted, Interview Scheduled, Selected, or Rejected). You also receive email notifications when your status changes."
            }
        },
        {
            "@type": "Question",
            "name": "What documents are needed to apply?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Generally you need: updated Resume/CV, valid Government ID (Aadhaar, PAN, Passport), passport-size photo, educational certificates (for freshers/interns), college ID (for Saarthi), and portfolio/work samples (for vendor/freelancer roles)."
            }
        },
        {
            "@type": "Question",
            "name": "When will I hear back after applying?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Our HR team reviews applications on a rolling basis. Expect an initial response within 3-7 working days. If shortlisted, you will receive an email or call. If you haven't heard back within 10 working days, contact us at hr@karyasaarthi.com."
            }
        },
        {
            "@type": "Question",
            "name": "How does the interview process work?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "The process involves: Application Screening, Telephonic/WhatsApp Round, Task/Assessment (for some roles), Final Interview with team lead, and Offer & Onboarding for selected candidates. Steps may vary by role."
            }
        },
        {
            "@type": "Question",
            "name": "What is the Saarthi structure?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "The Saarthi structure represents Karya Saarthi's five core functional pillars: Academic (research & writing), Technology (development & software), Marketing (digital marketing & SEO), Design (graphic design & UI/UX), and Business (development & strategy)."
            }
        },
        {
            "@type": "Question",
            "name": "How are vendors/freelancers paid?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Vendors and freelancers are paid on a project-completion basis via bank transfer (NEFT/IMPS) or UPI. The standard payment cycle is 7-15 working days after project approval. Earnings can be tracked from the Dashboard."
            }
        }
    ]
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>







