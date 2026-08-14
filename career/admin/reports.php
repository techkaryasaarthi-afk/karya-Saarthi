<?php
$pageTitle = 'Reports & Analytics';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireAdmin();

$pdo = getDBConnection();
$activeTab = $_GET['tab'] ?? 'recruitment';

// ========== Recruitment Stats ==========
$stmtTotalJobs = $pdo->query("SELECT COUNT(*) FROM job_postings");
$totalJobs = $stmtTotalJobs->fetchColumn();

$stmtActiveJobs = $pdo->query("SELECT COUNT(*) FROM job_postings WHERE status = 'active'");
$activeJobs = $stmtActiveJobs->fetchColumn();

$stmtTotalApps = $pdo->query("SELECT COUNT(*) FROM applications");
$totalApps = $stmtTotalApps->fetchColumn();

$stmtAppsMonth = $pdo->query("SELECT COUNT(*) FROM applications WHERE MONTH(applied_date) = MONTH(CURDATE()) AND YEAR(applied_date) = YEAR(CURDATE())");
$appsThisMonth = $stmtAppsMonth->fetchColumn();

$stmtAppsByStatus = $pdo->query("SELECT status, COUNT(*) as cnt FROM applications GROUP BY status ORDER BY cnt DESC");
$appsByStatus = $stmtAppsByStatus->fetchAll();

$stmtAppsByJob = $pdo->query("SELECT j.title, COUNT(a.application_id) as cnt FROM applications a LEFT JOIN job_postings j ON a.job_id = j.job_id GROUP BY a.job_id ORDER BY cnt DESC LIMIT 10");
$appsByJob = $stmtAppsByJob->fetchAll();

// ========== Attendance Stats ==========
$stmtAttMonth = $pdo->query("SELECT COUNT(DISTINCT user_id) FROM attendance WHERE MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())");
$activeUsersMonth = $stmtAttMonth->fetchColumn();

$stmtAvgDaily = $pdo->query("SELECT ROUND(AVG(daily_count), 1) as avg_daily FROM (SELECT date, COUNT(*) as daily_count FROM attendance WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY date) sub");
$avgDailyAttendance = $stmtAvgDaily->fetchColumn() ?? 0;

$stmtTotalHoursMonth = $pdo->query("SELECT COALESCE(SUM(duration_minutes), 0) FROM attendance WHERE MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())");
$totalHoursMonth = round($stmtTotalHoursMonth->fetchColumn() / 60, 1);

$stmtTopAttendees = $pdo->query("SELECT u.name, u.user_type, COUNT(a.attendance_id) as days, SUM(a.duration_minutes) as total_min FROM attendance a LEFT JOIN users u ON a.user_id = u.user_id WHERE MONTH(a.date) = MONTH(CURDATE()) AND YEAR(a.date) = YEAR(CURDATE()) GROUP BY a.user_id ORDER BY days DESC LIMIT 10");
$topAttendees = $stmtTopAttendees->fetchAll();

// ========== Saarthi Stats ==========
$stmtTotalCS = $pdo->query("SELECT COUNT(*) FROM users WHERE user_type = 'campus_saarthi' AND status = 'active'");
$totalCS = $stmtTotalCS->fetchColumn();

$stmtTotalLeads = $pdo->query("SELECT COUNT(*) FROM leads");
$totalLeads = $stmtTotalLeads->fetchColumn();

$stmtWonLeads = $pdo->query("SELECT COUNT(*) FROM leads WHERE status = 'won'");
$wonLeads = $stmtWonLeads->fetchColumn();

$stmtTotalCommission = $pdo->query("SELECT COALESCE(SUM(commission_amount), 0) FROM leads WHERE status = 'won'");
$totalCommission = $stmtTotalCommission->fetchColumn();

$stmtCSPerformance = $pdo->query("SELECT u.name, u.user_id, COUNT(l.lead_id) as total_leads, SUM(CASE WHEN l.status = 'won' THEN 1 ELSE 0 END) as won_leads, COALESCE(SUM(l.project_value), 0) as total_value, COALESCE(SUM(l.commission_amount), 0) as total_commission FROM users u LEFT JOIN leads l ON u.user_id = l.campus_saarthi_id WHERE u.user_type = 'campus_saarthi' GROUP BY u.user_id ORDER BY total_leads DESC LIMIT 10");
$csPerformance = $stmtCSPerformance->fetchAll();

// ========== Financial Stats ==========
$stmtTotalPaid = $pdo->query("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'paid'");
$totalPaidAll = $stmtTotalPaid->fetchColumn();

$stmtPaidMonth = $pdo->query("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'paid' AND MONTH(payment_date) = MONTH(CURDATE()) AND YEAR(payment_date) = YEAR(CURDATE())");
$paidThisMonth = $stmtPaidMonth->fetchColumn();

$stmtPendingPay = $pdo->query("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status IN ('pending', 'approved')");
$pendingPayments = $stmtPendingPay->fetchColumn();

$stmtByType = $pdo->query("SELECT payment_type, SUM(amount) as total, COUNT(*) as cnt FROM payments WHERE status = 'paid' GROUP BY payment_type ORDER BY total DESC");
$paymentsByType = $stmtByType->fetchAll();

$stmtMonthlyTrend = $pdo->query("SELECT DATE_FORMAT(payment_date, '%Y-%m') as month, SUM(amount) as total FROM payments WHERE status = 'paid' AND payment_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) GROUP BY month ORDER BY month");
$monthlyTrend = $stmtMonthlyTrend->fetchAll();

$statusColors = [
    'new' => 'bg-blue-100 text-blue-700',
    'shortlisted' => 'bg-yellow-100 text-yellow-700',
    'interview_scheduled' => 'bg-purple-100 text-purple-700',
    'selected' => 'bg-green-100 text-green-700',
    'offer_sent' => 'bg-indigo-100 text-indigo-700',
    'joined' => 'bg-emerald-100 text-emerald-700',
    'rejected' => 'bg-red-100 text-red-700'
];

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 dashboard-content-area p-6">
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-2xl font-bold text-ink">Reports & Analytics</h1>
                <p class="text-sm text-ink-muted mt-1">Comprehensive insights and reports.</p>
            </div>
            <div class="flex gap-2">
                <a href="?tab=<?= $activeTab ?>&export=pdf" class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition"><i class="fas fa-file-pdf mr-1"></i>Export PDF</a>
                <a href="?tab=<?= $activeTab ?>&export=excel" class="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition"><i class="fas fa-file-excel mr-1"></i>Export Excel</a>
            </div>
        </div>

        <!-- Tab Navigation -->
        <div class="border-b border-hairline mb-6">
            <nav class="flex space-x-8">
                <a href="?tab=recruitment" class="pb-3 px-1 text-sm font-medium border-b-2 <?= $activeTab === 'recruitment' ? 'border-primary-500 text-primary-600' : 'border-transparent text-ink-muted hover:text-ink-muted hover:border-hairline bg-surface-2 text-ink' ?>">
                    <i class="fas fa-briefcase mr-1"></i> Recruitment
                </a>
                <a href="?tab=attendance" class="pb-3 px-1 text-sm font-medium border-b-2 <?= $activeTab === 'attendance' ? 'border-primary-500 text-primary-600' : 'border-transparent text-ink-muted hover:text-ink-muted hover:border-hairline bg-surface-2 text-ink' ?>">
                    <i class="fas fa-clock mr-1"></i> Attendance
                </a>
                <a href="?tab=campus_saarthi" class="pb-3 px-1 text-sm font-medium border-b-2 <?= $activeTab === 'campus_saarthi' ? 'border-primary-500 text-primary-600' : 'border-transparent text-ink-muted hover:text-ink-muted hover:border-hairline bg-surface-2 text-ink' ?>">
                    <i class="fas fa-graduation-cap mr-1"></i> Saarthi
                </a>
                <a href="?tab=financial" class="pb-3 px-1 text-sm font-medium border-b-2 <?= $activeTab === 'financial' ? 'border-primary-500 text-primary-600' : 'border-transparent text-ink-muted hover:text-ink-muted hover:border-hairline bg-surface-2 text-ink' ?>">
                    <i class="fas fa-rupee-sign mr-1"></i> Financial
                </a>
            </nav>
        </div>

        <!-- Recruitment Tab -->
        <?php if ($activeTab === 'recruitment'): ?>
        <div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4 text-center">
                    <p class="text-2xl font-bold text-primary-600"><?= $totalJobs ?></p>
                    <p class="text-xs text-ink-muted">Total Job Postings</p>
                </div>
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4 text-center">
                    <p class="text-2xl font-bold text-green-600"><?= $activeJobs ?></p>
                    <p class="text-xs text-ink-muted">Active Jobs</p>
                </div>
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4 text-center">
                    <p class="text-2xl font-bold text-blue-600"><?= $totalApps ?></p>
                    <p class="text-xs text-ink-muted">Total Applications</p>
                </div>
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4 text-center">
                    <p class="text-2xl font-bold text-amber-600"><?= $appsThisMonth ?></p>
                    <p class="text-xs text-ink-muted">Applications This Month</p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Applications by Status -->
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6">
                    <h3 class="text-lg font-semibold text-ink mb-4">Applications by Status</h3>
                    <!-- Chart.js placeholder -->
                    <div class="bg-surface-2 rounded-lg p-4 mb-4 text-center text-sm text-ink-muted border border-dashed border-hairline bg-surface-2 text-ink">
                        <i class="fas fa-chart-pie text-2xl mb-2"></i>
                        <p>Chart.js Pie Chart - Applications by Status</p>
                        <p class="text-xs">Integrate with: &lt;script src="https://cdn.jsdelivr.net/npm/chart.js"&gt;&lt;/script&gt;</p>
                    </div>
                    <div class="space-y-2">
                        <?php foreach ($appsByStatus as $as): ?>
                        <div class="flex justify-between items-center">
                            <span class="px-2 py-1 rounded-full text-xs font-medium <?= $statusColors[$as['status']] ?? 'bg-surface-2 text-ink-muted' ?>"><?= ucfirst(str_replace('_', ' ', $as['status'])) ?></span>
                            <span class="text-sm font-bold text-ink"><?= $as['cnt'] ?></span>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Applications by Job -->
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6">
                    <h3 class="text-lg font-semibold text-ink mb-4">Top Jobs by Applications</h3>
                    <div class="bg-surface-2 rounded-lg p-4 mb-4 text-center text-sm text-ink-muted border border-dashed border-hairline bg-surface-2 text-ink">
                        <i class="fas fa-chart-bar text-2xl mb-2"></i>
                        <p>Chart.js Bar Chart - Applications per Job</p>
                    </div>
                    <div class="space-y-2">
                        <?php foreach ($appsByJob as $aj): ?>
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-ink-muted truncate max-w-xs"><?= htmlspecialchars($aj['title'] ?? 'Unknown', ENT_QUOTES, 'UTF-8', false) ?></span>
                            <span class="text-sm font-bold text-ink"><?= $aj['cnt'] ?></span>
                        </div>
                        <?php endforeach; ?>
                        <?php if (empty($appsByJob)): ?>
                        <p class="text-sm text-ink-muted">No data available.</p>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
        <?php endif; ?>

        <!-- Attendance Tab -->
        <?php if ($activeTab === 'attendance'): ?>
        <div>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4 text-center">
                    <p class="text-2xl font-bold text-primary-600"><?= $activeUsersMonth ?></p>
                    <p class="text-xs text-ink-muted">Active Users This Month</p>
                </div>
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4 text-center">
                    <p class="text-2xl font-bold text-green-600"><?= $avgDailyAttendance ?></p>
                    <p class="text-xs text-ink-muted">Avg Daily Attendance</p>
                </div>
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4 text-center">
                    <p class="text-2xl font-bold text-amber-600"><?= $totalHoursMonth ?></p>
                    <p class="text-xs text-ink-muted">Total Hours This Month</p>
                </div>
            </div>

            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6 mb-6">
                <h3 class="text-lg font-semibold text-ink mb-4">Attendance Trend (Last 30 Days)</h3>
                <div class="bg-surface-2 rounded-lg p-8 text-center text-sm text-ink-muted border border-dashed border-hairline bg-surface-2 text-ink">
                    <i class="fas fa-chart-line text-3xl mb-2"></i>
                    <p>Chart.js Line Chart - Daily Attendance Count</p>
                    <p class="text-xs">Integrate with Chart.js for interactive charts</p>
                </div>
            </div>

            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline overflow-hidden">
                <div class="px-6 py-4 border-b border-hairline">
                    <h3 class="font-semibold text-ink">Top Attendees This Month</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-surface-2">
                            <tr>
                                <th class="px-4 py-3 text-left font-medium text-ink-muted">#</th>
                                <th class="px-4 py-3 text-left font-medium text-ink-muted">Name</th>
                                <th class="px-4 py-3 text-left font-medium text-ink-muted">Type</th>
                                <th class="px-4 py-3 text-left font-medium text-ink-muted">Days Present</th>
                                <th class="px-4 py-3 text-left font-medium text-ink-muted">Total Hours</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-hairline">
                            <?php if (empty($topAttendees)): ?>
                            <tr><td colspan="5" class="px-4 py-8 text-center text-ink-muted">No attendance data this month.</td></tr>
                            <?php else: ?>
                            <?php foreach ($topAttendees as $i => $ta): ?>
                            <tr class="hover:bg-surface-2">
                                <td class="px-4 py-3 text-ink-muted"><?= $i + 1 ?></td>
                                <td class="px-4 py-3 font-medium text-ink"><?= htmlspecialchars($ta['name'] ?? 'Unknown', ENT_QUOTES, 'UTF-8', false) ?></td>
                                <td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs font-medium bg-surface-2 text-ink-muted"><?= ucfirst(str_replace('_', ' ', $ta['user_type'] ?? 'N/A')) ?></span></td>
                                <td class="px-4 py-3 text-ink-muted"><?= $ta['days'] ?></td>
                                <td class="px-4 py-3 text-ink-muted"><?= round(($ta['total_min'] ?? 0) / 60, 1) ?> hrs</td>
                            </tr>
                            <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <?php endif; ?>

        <!-- Saarthi Tab -->
        <?php if ($activeTab === 'campus_saarthi'): ?>
        <div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4 text-center">
                    <p class="text-2xl font-bold text-purple-600"><?= $totalCS ?></p>
                    <p class="text-xs text-ink-muted">Active Saarthis</p>
                </div>
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4 text-center">
                    <p class="text-2xl font-bold text-blue-600"><?= $totalLeads ?></p>
                    <p class="text-xs text-ink-muted">Total Leads</p>
                </div>
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4 text-center">
                    <p class="text-2xl font-bold text-green-600"><?= $wonLeads ?></p>
                    <p class="text-xs text-ink-muted">Won Leads</p>
                </div>
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4 text-center">
                    <p class="text-2xl font-bold text-amber-600">Rs.<?= number_format($totalCommission, 0) ?></p>
                    <p class="text-xs text-ink-muted">Total Commission</p>
                </div>
            </div>

            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6 mb-6">
                <h3 class="text-lg font-semibold text-ink mb-4">Lead Conversion Funnel</h3>
                <div class="bg-surface-2 rounded-lg p-8 text-center text-sm text-ink-muted border border-dashed border-hairline bg-surface-2 text-ink">
                    <i class="fas fa-filter text-3xl mb-2"></i>
                    <p>Chart.js Funnel/Bar Chart - Lead Status Distribution</p>
                </div>
            </div>

            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline overflow-hidden">
                <div class="px-6 py-4 border-b border-hairline">
                    <h3 class="font-semibold text-ink">Saarthi Performance</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-surface-2">
                            <tr>
                                <th class="px-4 py-3 text-left font-medium text-ink-muted">#</th>
                                <th class="px-4 py-3 text-left font-medium text-ink-muted">Name</th>
                                <th class="px-4 py-3 text-left font-medium text-ink-muted">Total Leads</th>
                                <th class="px-4 py-3 text-left font-medium text-ink-muted">Won Leads</th>
                                <th class="px-4 py-3 text-left font-medium text-ink-muted">Conversion %</th>
                                <th class="px-4 py-3 text-left font-medium text-ink-muted">Total Value</th>
                                <th class="px-4 py-3 text-left font-medium text-ink-muted">Commission Earned</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-hairline">
                            <?php if (empty($csPerformance)): ?>
                            <tr><td colspan="7" class="px-4 py-8 text-center text-ink-muted">No Saarthi data available.</td></tr>
                            <?php else: ?>
                            <?php foreach ($csPerformance as $i => $cs): ?>
                            <tr class="hover:bg-surface-2">
                                <td class="px-4 py-3 text-ink-muted"><?= $i + 1 ?></td>
                                <td class="px-4 py-3 font-medium text-ink"><?= htmlspecialchars($cs['name'] ?? 'Unknown', ENT_QUOTES, 'UTF-8', false) ?></td>
                                <td class="px-4 py-3 text-ink-muted"><?= $cs['total_leads'] ?></td>
                                <td class="px-4 py-3 text-green-600 font-medium"><?= $cs['won_leads'] ?></td>
                                <td class="px-4 py-3 text-ink-muted"><?= $cs['total_leads'] > 0 ? round(($cs['won_leads'] / $cs['total_leads']) * 100, 1) : 0 ?>%</td>
                                <td class="px-4 py-3 text-ink-muted">Rs.<?= number_format($cs['total_value'], 0) ?></td>
                                <td class="px-4 py-3 font-medium text-amber-600">Rs.<?= number_format($cs['total_commission'], 0) ?></td>
                            </tr>
                            <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <?php endif; ?>

        <!-- Financial Tab -->
        <?php if ($activeTab === 'financial'): ?>
        <div>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4 text-center">
                    <p class="text-2xl font-bold text-green-600">Rs.<?= number_format($totalPaidAll, 0) ?></p>
                    <p class="text-xs text-ink-muted">Total Paid (All Time)</p>
                </div>
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4 text-center">
                    <p class="text-2xl font-bold text-primary-600">Rs.<?= number_format($paidThisMonth, 0) ?></p>
                    <p class="text-xs text-ink-muted">Paid This Month</p>
                </div>
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4 text-center">
                    <p class="text-2xl font-bold text-amber-600">Rs.<?= number_format($pendingPayments, 0) ?></p>
                    <p class="text-xs text-ink-muted">Pending Payments</p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6">
                    <h3 class="text-lg font-semibold text-ink mb-4">Monthly Payment Trend</h3>
                    <div class="bg-surface-2 rounded-lg p-8 text-center text-sm text-ink-muted border border-dashed border-hairline bg-surface-2 text-ink">
                        <i class="fas fa-chart-area text-3xl mb-2"></i>
                        <p>Chart.js Area Chart - Monthly Payment Totals</p>
                    </div>
                    <div class="mt-4 space-y-2">
                        <?php foreach ($monthlyTrend as $mt): ?>
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-ink-muted"><?= date('M Y', strtotime($mt['month'] . '-01')) ?></span>
                            <span class="text-sm font-bold text-ink">Rs.<?= number_format($mt['total'], 0) ?></span>
                        </div>
                        <?php endforeach; ?>
                        <?php if (empty($monthlyTrend)): ?>
                        <p class="text-sm text-ink-muted">No payment data available.</p>
                        <?php endif; ?>
                    </div>
                </div>

                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6">
                    <h3 class="text-lg font-semibold text-ink mb-4">Payments by Type</h3>
                    <div class="bg-surface-2 rounded-lg p-8 text-center text-sm text-ink-muted border border-dashed border-hairline bg-surface-2 text-ink">
                        <i class="fas fa-chart-doughnut text-3xl mb-2"></i>
                        <p>Chart.js Doughnut Chart - Payment Type Distribution</p>
                    </div>
                    <div class="mt-4 space-y-2">
                        <?php foreach ($paymentsByType as $pt): ?>
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-ink-muted"><?= ucfirst($pt['payment_type']) ?> (<?= $pt['cnt'] ?>)</span>
                            <span class="text-sm font-bold text-ink">Rs.<?= number_format($pt['total'], 0) ?></span>
                        </div>
                        <?php endforeach; ?>
                        <?php if (empty($paymentsByType)): ?>
                        <p class="text-sm text-ink-muted">No payment data available.</p>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
        <?php endif; ?>
    </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>






