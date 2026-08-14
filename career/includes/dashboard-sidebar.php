<?php
$userType = $_SESSION['user_type'] ?? '';
$currentPage = basename($_SERVER['PHP_SELF'], '.php');

$menuItems = [];
switch ($userType) {
    case 'admin':
        $menuItems = [
            ['icon' => 'fa-th-large', 'label' => 'Dashboard', 'url' => '/admin/', 'page' => 'index'],
            ['icon' => 'fa-user-circle', 'label' => 'My Profile', 'url' => '/user-panel/profile.php', 'page' => 'profile'],
            ['icon' => 'fa-briefcase', 'label' => 'Recruitment', 'url' => '/admin/recruitment.php', 'page' => 'recruitment'],
            ['icon' => 'fa-users', 'label' => 'Users', 'url' => '/admin/users.php', 'page' => 'users'],
            ['icon' => 'fa-clock', 'label' => 'Attendance', 'url' => '/admin/attendance.php', 'page' => 'attendance'],
            ['icon' => 'fa-calendar-minus', 'label' => 'Leave', 'url' => '/admin/leave.php', 'page' => 'leave'],
            ['icon' => 'fa-tasks', 'label' => 'Tasks', 'url' => '/admin/tasks.php', 'page' => 'tasks'],
            ['icon' => 'fa-star', 'label' => 'Appraisals', 'url' => '/admin/appraisals.php', 'page' => 'appraisals'],
            ['icon' => 'fa-trophy', 'label' => 'Leaderboard', 'url' => '/admin/leaderboard.php', 'page' => 'leaderboard'],
            ['icon' => 'fa-credit-card', 'label' => 'Payments', 'url' => '/admin/payments.php', 'page' => 'payments'],
            ['icon' => 'fa-file-alt', 'label' => 'Policies', 'url' => '/admin/policies.php', 'page' => 'policies'],
            ['icon' => 'fa-question-circle', 'label' => 'FAQs', 'url' => '/admin/faq.php', 'page' => 'faq'],
            ['icon' => 'fa-bullhorn', 'label' => 'Announcements', 'url' => '/admin/announcements.php', 'page' => 'announcements'],
            ['icon' => 'fa-calendar-alt', 'label' => 'Events', 'url' => '/admin/events.php', 'page' => 'events'],
            ['icon' => 'fa-shield-alt', 'label' => 'Complaints', 'url' => '/admin/complaints.php', 'page' => 'complaints'],
            ['icon' => 'fa-file-signature', 'label' => 'Offer Letters', 'url' => '/admin/offer-letter.php', 'page' => 'offer-letter'],
            ['icon' => 'fa-images', 'label' => 'Gallery', 'url' => '/admin/gallery.php', 'page' => 'gallery'],
            ['icon' => 'fa-heart', 'label' => 'Life at KS', 'url' => '/admin/life.php', 'page' => 'life'],
            ['icon' => 'fa-quote-left', 'label' => 'Testimonials', 'url' => '/admin/testimonials.php', 'page' => 'testimonials'],
            ['icon' => 'fa-chart-bar', 'label' => 'Reports', 'url' => '/admin/reports.php', 'page' => 'reports'],
            ['icon' => 'fa-cog', 'label' => 'Settings', 'url' => '/admin/settings.php', 'page' => 'settings'],
        ];
        break;
    case 'campus_saarthi':
        $menuItems = [
            ['icon' => 'fa-th-large', 'label' => 'Dashboard', 'url' => '/user-panel/campus-saarthi.php', 'page' => 'campus-saarthi'],
            ['icon' => 'fa-user-circle', 'label' => 'My Profile', 'url' => '/user-panel/profile.php', 'page' => 'profile'],
            ['icon' => 'fa-plus-circle', 'label' => 'Add Lead', 'url' => '/user-panel/add-lead.php', 'page' => 'add-lead'],
            ['icon' => 'fa-list', 'label' => 'My Leads', 'url' => '/user-panel/my-leads.php', 'page' => 'my-leads'],
            ['icon' => 'fa-clock', 'label' => 'Attendance', 'url' => '/user-panel/attendance.php', 'page' => 'attendance'],
            ['icon' => 'fa-calendar-minus', 'label' => 'Leave', 'url' => '/user-panel/leave.php', 'page' => 'leave'],
            ['icon' => 'fa-tasks', 'label' => 'My Tasks', 'url' => '/user-panel/tasks.php', 'page' => 'tasks'],
            ['icon' => 'fa-wallet', 'label' => 'Earnings', 'url' => '/user-panel/earnings.php', 'page' => 'earnings'],
            ['icon' => 'fa-trophy', 'label' => 'Leaderboard', 'url' => '/user-panel/leaderboard.php', 'page' => 'leaderboard'],
            ['icon' => 'fa-star', 'label' => 'Appraisal', 'url' => '/user-panel/appraisal.php', 'page' => 'appraisal'],
            ['icon' => 'fa-shield-alt', 'label' => 'Complaint Box', 'url' => '/user-panel/complaint.php', 'page' => 'complaint'],
            ['icon' => 'fa-question-circle', 'label' => 'Support', 'url' => '/user-panel/support.php', 'page' => 'support'],
        ];
        break;

    case 'employee':
        $menuItems = [
            ['icon' => 'fa-th-large', 'label' => 'Dashboard', 'url' => '/user-panel/employee.php', 'page' => 'employee'],
            ['icon' => 'fa-user-circle', 'label' => 'My Profile', 'url' => '/user-panel/profile.php', 'page' => 'profile'],
            ['icon' => 'fa-clock', 'label' => 'Attendance', 'url' => '/user-panel/attendance.php', 'page' => 'attendance'],
            ['icon' => 'fa-calendar-minus', 'label' => 'Leave', 'url' => '/user-panel/leave.php', 'page' => 'leave'],
            ['icon' => 'fa-tasks', 'label' => 'My Tasks', 'url' => '/user-panel/tasks.php', 'page' => 'tasks'],
            ['icon' => 'fa-wallet', 'label' => 'Salary', 'url' => '/user-panel/salary.php', 'page' => 'salary'],
            ['icon' => 'fa-trophy', 'label' => 'Leaderboard', 'url' => '/user-panel/leaderboard.php', 'page' => 'leaderboard'],
            ['icon' => 'fa-star', 'label' => 'Appraisal', 'url' => '/user-panel/appraisal.php', 'page' => 'appraisal'],
            ['icon' => 'fa-shield-alt', 'label' => 'Complaint Box', 'url' => '/user-panel/complaint.php', 'page' => 'complaint'],
        ];
        break;
    case 'intern':
        $menuItems = [
            ['icon' => 'fa-th-large', 'label' => 'Dashboard', 'url' => '/user-panel/intern.php', 'page' => 'intern'],
            ['icon' => 'fa-user-circle', 'label' => 'My Profile', 'url' => '/user-panel/profile.php', 'page' => 'profile'],
            ['icon' => 'fa-clock', 'label' => 'Attendance', 'url' => '/user-panel/attendance.php', 'page' => 'attendance'],
            ['icon' => 'fa-calendar-minus', 'label' => 'Leave', 'url' => '/user-panel/leave.php', 'page' => 'leave'],
            ['icon' => 'fa-tasks', 'label' => 'My Tasks', 'url' => '/user-panel/tasks.php', 'page' => 'tasks'],
            ['icon' => 'fa-book', 'label' => 'Assignments', 'url' => '/user-panel/assignments.php', 'page' => 'assignments'],
            ['icon' => 'fa-chart-line', 'label' => 'Progress', 'url' => '/user-panel/progress.php', 'page' => 'progress'],
            ['icon' => 'fa-certificate', 'label' => 'Certificate', 'url' => '/user-panel/certificate.php', 'page' => 'certificate'],
            ['icon' => 'fa-trophy', 'label' => 'Leaderboard', 'url' => '/user-panel/leaderboard.php', 'page' => 'leaderboard'],
            ['icon' => 'fa-star', 'label' => 'Appraisal', 'url' => '/user-panel/appraisal.php', 'page' => 'appraisal'],
            ['icon' => 'fa-shield-alt', 'label' => 'Complaint Box', 'url' => '/user-panel/complaint.php', 'page' => 'complaint'],
        ];
        break;

    case 'pillar_post':
        $menuItems = [
            ['icon' => 'fa-th-large', 'label' => 'Dashboard', 'url' => '/user-panel/employee.php', 'page' => 'employee'],
            ['icon' => 'fa-user-circle', 'label' => 'My Profile', 'url' => '/user-panel/profile.php', 'page' => 'profile'],
            ['icon' => 'fa-clock', 'label' => 'Attendance', 'url' => '/user-panel/attendance.php', 'page' => 'attendance'],
            ['icon' => 'fa-calendar-minus', 'label' => 'Leave', 'url' => '/user-panel/leave.php', 'page' => 'leave'],
            ['icon' => 'fa-tasks', 'label' => 'My Tasks', 'url' => '/user-panel/tasks.php', 'page' => 'tasks'],
            ['icon' => 'fa-wallet', 'label' => 'Salary', 'url' => '/user-panel/salary.php', 'page' => 'salary'],
            ['icon' => 'fa-trophy', 'label' => 'Leaderboard', 'url' => '/user-panel/leaderboard.php', 'page' => 'leaderboard'],
            ['icon' => 'fa-star', 'label' => 'Appraisal', 'url' => '/user-panel/appraisal.php', 'page' => 'appraisal'],
            ['icon' => 'fa-shield-alt', 'label' => 'Complaint Box', 'url' => '/user-panel/complaint.php', 'page' => 'complaint'],
            ['icon' => 'fa-question-circle', 'label' => 'Support', 'url' => '/user-panel/support.php', 'page' => 'support'],
        ];
        break;
    case 'part_time':
        $menuItems = [
            ['icon' => 'fa-th-large', 'label' => 'Dashboard', 'url' => '/user-panel/dashboard.php', 'page' => 'dashboard'],
            ['icon' => 'fa-user-circle', 'label' => 'My Profile', 'url' => '/user-panel/profile.php', 'page' => 'profile'],
            ['icon' => 'fa-clock', 'label' => 'Attendance', 'url' => '/user-panel/attendance.php', 'page' => 'attendance'],
            ['icon' => 'fa-calendar-minus', 'label' => 'Leave', 'url' => '/user-panel/leave.php', 'page' => 'leave'],
            ['icon' => 'fa-tasks', 'label' => 'My Tasks', 'url' => '/user-panel/tasks.php', 'page' => 'tasks'],
            ['icon' => 'fa-project-diagram', 'label' => 'Projects', 'url' => '/user-panel/projects.php', 'page' => 'projects'],
            ['icon' => 'fa-wallet', 'label' => 'Earnings', 'url' => '/user-panel/earnings.php', 'page' => 'earnings'],
            ['icon' => 'fa-trophy', 'label' => 'Leaderboard', 'url' => '/user-panel/leaderboard.php', 'page' => 'leaderboard'],
            ['icon' => 'fa-star', 'label' => 'Appraisal', 'url' => '/user-panel/appraisal.php', 'page' => 'appraisal'],
            ['icon' => 'fa-shield-alt', 'label' => 'Complaint Box', 'url' => '/user-panel/complaint.php', 'page' => 'complaint'],
            ['icon' => 'fa-question-circle', 'label' => 'Support', 'url' => '/user-panel/support.php', 'page' => 'support'],
        ];
        break;
    case 'teaching_expert':
        $menuItems = [
            ['icon' => 'fa-th-large', 'label' => 'Dashboard', 'url' => '/user-panel/teaching-expert.php', 'page' => 'teaching-expert'],
            ['icon' => 'fa-user-circle', 'label' => 'My Profile', 'url' => '/user-panel/profile.php', 'page' => 'profile'],
            ['icon' => 'fa-clock', 'label' => 'Attendance', 'url' => '/user-panel/attendance.php', 'page' => 'attendance'],
            ['icon' => 'fa-calendar-minus', 'label' => 'Leave', 'url' => '/user-panel/leave.php', 'page' => 'leave'],
            ['icon' => 'fa-tasks', 'label' => 'My Tasks', 'url' => '/user-panel/tasks.php', 'page' => 'tasks'],
            ['icon' => 'fa-project-diagram', 'label' => 'Sessions', 'url' => '/user-panel/projects.php', 'page' => 'projects'],
            ['icon' => 'fa-star', 'label' => 'Appraisal', 'url' => '/user-panel/appraisal.php', 'page' => 'appraisal'],
            ['icon' => 'fa-wallet', 'label' => 'Earnings', 'url' => '/user-panel/earnings.php', 'page' => 'earnings'],
            ['icon' => 'fa-certificate', 'label' => 'Certificate', 'url' => '/user-panel/certificate.php', 'page' => 'certificate'],
            ['icon' => 'fa-trophy', 'label' => 'Leaderboard', 'url' => '/user-panel/leaderboard.php', 'page' => 'leaderboard'],
            ['icon' => 'fa-shield-alt', 'label' => 'Complaint Box', 'url' => '/user-panel/complaint.php', 'page' => 'complaint'],
            ['icon' => 'fa-question-circle', 'label' => 'Support', 'url' => '/user-panel/support.php', 'page' => 'support'],
        ];
        break;
    default:
        $menuItems = [
            ['icon' => 'fa-th-large', 'label' => 'Dashboard', 'url' => '/user-panel/', 'page' => 'index'],
            ['icon' => 'fa-user-circle', 'label' => 'My Profile', 'url' => '/user-panel/profile.php', 'page' => 'profile'],
            ['icon' => 'fa-question-circle', 'label' => 'Support', 'url' => '/user-panel/support.php', 'page' => 'support'],
        ];
        break;
}

// Add Team Chat to ALL roles
$menuItems[] = ['icon' => 'fa-comments', 'label' => 'Team Chat', 'url' => '/user-panel/group-chat.php', 'page' => 'group-chat'];

// Add Recruitment panel for HR Interns
if ($userType !== 'admin') {
    try {
        $pdo_sidebar = getDBConnection();
        try { $pdo_sidebar->exec("ALTER TABLE users ADD COLUMN is_hr_intern BOOLEAN DEFAULT FALSE"); } catch (Exception $e) {}
        $hrStmt = $pdo_sidebar->prepare("SELECT is_hr_intern FROM users WHERE user_id = ?");
        $hrStmt->execute([$_SESSION['user_id'] ?? '']);
        if ($hrStmt->fetchColumn()) {
            $menuItems[] = ['icon' => 'fa-briefcase', 'label' => 'Recruitment', 'url' => '/user-panel/recruitment.php', 'page' => 'recruitment'];
        }
    } catch (Exception $e) {}
}
?>
<!-- Mobile Sidebar Toggle Button — fixed but with better positioning so it doesn't overlap clock in/out buttons -->
<button onclick="toggleSidebar()" class="lg:hidden fixed top-[68px] left-3 z-30 bg-surface-1 border border-hairline text-ink-muted w-9 h-9 rounded-full shadow-lg flex items-center justify-center hover:text-ink transition" title="Toggle menu">
    <i class="fas fa-bars text-sm"></i>
</button>

<!-- Mobile Overlay -->
<div id="sidebar-overlay" class="sidebar-overlay lg:hidden" onclick="toggleSidebar()"></div>

<!-- Sidebar -->
<aside id="sidebar-drawer" class="sidebar-drawer fixed lg:static top-0 left-0 z-50 w-64 bg-surface-1 border-r border-hairline min-h-screen lg:transform-none lg:block shadow-xl lg:shadow-none">
    <div class="p-4 border-b border-hairline">
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span class="text-primary-600 font-bold text-sm"><?= strtoupper(substr($_SESSION['user_name'] ?? 'U', 0, 2)) ?></span>
                </div>
                <div>
                    <p class="text-sm font-semibold text-ink"><?= htmlspecialchars($_SESSION['user_name'] ?? 'User', ENT_QUOTES, 'UTF-8', false) ?></p>
                    <p class="text-xs text-ink-muted"><?= htmlspecialchars(ucfirst(str_replace('_', ' ', $_SESSION['user_type'] ?? ''))) ?></p>
                </div>
            </div>
            <button onclick="toggleSidebar()" class="lg:hidden text-ink-muted hover:text-ink p-1">
                <i class="fas fa-times"></i>
            </button>
        </div>
    </div>
    <nav class="p-4 space-y-1">
        <?php foreach ($menuItems as $item): ?>
            <a href="<?= BASE_PATH ?><?= $item['url'] ?>" class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition <?= $currentPage === $item['page'] ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' : 'text-ink-muted hover:bg-surface-2 hover:text-ink' ?>">
                <i class="fas <?= $item['icon'] ?> w-5 text-center"></i>
                <span><?= $item['label'] ?></span>
            </a>
        <?php endforeach; ?>
        <hr class="my-3 border-hairline">
        <a href="<?= BASE_PATH ?>/user-panel/change-password.php" class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink-muted hover:bg-surface-2 hover:text-ink transition">
            <i class="fas fa-key w-5 text-center"></i>
            <span>Change Password</span>
        </a>
        <a href="<?= BASE_PATH ?>/" class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink-muted hover:bg-surface-2 hover:text-ink transition">
            <i class="fas fa-home w-5 text-center"></i>
            <span>Back to Site</span>
        </a>
        <a href="<?= BASE_PATH ?>/logout.php" class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-500/10 transition">
            <i class="fas fa-sign-out-alt w-5 text-center"></i>
            <span>Logout</span>
        </a>
    </nav>
</aside>

<script>
function toggleSidebar() {
    document.getElementById('sidebar-drawer').classList.toggle('active');
    document.getElementById('sidebar-overlay').classList.toggle('active');
}
</script>





