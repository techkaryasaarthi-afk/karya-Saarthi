<?php
$pageTitle = 'Saarthi Dashboard';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireRole('campus_saarthi');

$pdo = getDBConnection();
$userId = $_SESSION['user_id'];

// Fetch user details
$stmt = $pdo->prepare("SELECT * FROM users WHERE user_id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch();

// Lead stats
$stmt = $pdo->prepare("SELECT
    COUNT(*) as total_leads,
    SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as converted,
    SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_leads,
    SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) as contacted,
    SUM(CASE WHEN status = 'discussion' THEN 1 ELSE 0 END) as in_discussion
    FROM leads WHERE campus_saarthi_id = ?");
$stmt->execute([$userId]);
$leadStats = $stmt->fetch();

// Monthly earnings
$stmt = $pdo->prepare("SELECT
    COALESCE(SUM(CASE WHEN commission_status = 'paid' THEN commission_amount ELSE 0 END), 0) as total_earned,
    COALESCE(SUM(CASE WHEN commission_status = 'pending' THEN commission_amount ELSE 0 END), 0) as pending_payment,
    COALESCE(SUM(CASE WHEN commission_status = 'approved' THEN commission_amount ELSE 0 END), 0) as approved_payment
    FROM leads WHERE campus_saarthi_id = ? AND MONTH(submitted_date) = MONTH(CURRENT_DATE()) AND YEAR(submitted_date) = YEAR(CURRENT_DATE())");
$stmt->execute([$userId]);
$earnings = $stmt->fetch();

// Recent leads (last 5)
$stmt = $pdo->prepare("SELECT * FROM leads WHERE campus_saarthi_id = ? ORDER BY submitted_date DESC LIMIT 5");
$stmt->execute([$userId]);
$recentLeads = $stmt->fetchAll();

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex min-h-[calc(100vh-56px)]">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 dashboard-content-area p-6">
        <!-- Announcements -->
        <?php require_once __DIR__ . '/../includes/announcements-banner.php'; ?>
        <!-- Welcome Section -->
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-ink">Welcome back, <?= htmlspecialchars($user['name'], ENT_QUOTES, 'UTF-8', false) ?>!</h1>
            <p class="text-ink-muted mt-1">
                <span class="inline-flex items-center"><i class="fas fa-university mr-1"></i> <?= htmlspecialchars($user['college'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></span>
                <span class="mx-3 text-ink-muted opacity-50">|</span>
                <span class="inline-flex items-center"><i class="fas fa-tag mr-1"></i> Referral Code: <strong class="ml-1 text-primary-600"><?= htmlspecialchars($user['referral_code'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></strong></span>
            </p>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-ink-muted">Total Leads</p>
                        <p class="text-2xl font-bold text-ink"><?= $leadStats['total_leads'] ?? 0 ?></p>
                    </div>
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-bullhorn text-blue-600 text-xl"></i>
                    </div>
                </div>
            </div>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-ink-muted">Converted</p>
                        <p class="text-2xl font-bold text-green-600"><?= $leadStats['converted'] ?? 0 ?></p>
                    </div>
                    <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-check-circle text-green-600 text-xl"></i>
                    </div>
                </div>
            </div>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-ink-muted">This Month Earnings</p>
                        <p class="text-2xl font-bold text-primary-600">₹<?= number_format($earnings['total_earned'], 0) ?></p>
                    </div>
                    <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-wallet text-primary-600 text-xl"></i>
                    </div>
                </div>
            </div>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-ink-muted">Pending Payment</p>
                        <p class="text-2xl font-bold text-amber-600">₹<?= number_format($earnings['pending_payment'], 0) ?></p>
                    </div>
                    <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-clock text-amber-600 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add New Lead Button -->
        <div class="mb-6">
            <a href="<?= BASE_PATH ?>/user-panel/add-lead.php" class="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-none transition text-lg">
                <i class="fas fa-plus-circle mr-2"></i> Add New Lead
            </a>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Recent Leads Table -->
            <div class="lg:col-span-2 bg-surface-1 rounded-xl shadow-none border border-hairline">
                <div class="p-5 border-b border-hairline flex items-center justify-between">
                    <h2 class="text-lg font-semibold text-ink">Recent Leads</h2>
                    <a href="<?= BASE_PATH ?>/user-panel/my-leads.php" class="text-sm text-primary-600 hover:underline">View All</a>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-surface-2">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Lead ID</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Customer</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Service</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Status</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-hairline">
                            <?php if (empty($recentLeads)): ?>
                                <tr>
                                    <td colspan="5" class="px-4 py-8 text-center text-ink-muted">
                                        <i class="fas fa-inbox text-3xl mb-2 block"></i>
                                        No leads submitted yet. Start by adding your first lead!
                                    </td>
                                </tr>
                            <?php else: ?>
                                <?php foreach ($recentLeads as $lead):
                                    $statusColors = [
                                        'new' => 'bg-blue-100 text-blue-700',
                                        'contacted' => 'bg-yellow-100 text-yellow-700',
                                        'discussion' => 'bg-orange-100 text-orange-700',
                                        'won' => 'bg-green-100 text-green-700',
                                        'lost' => 'bg-red-100 text-red-700'
                                    ];
                                    $badgeClass = $statusColors[$lead['status']] ?? 'bg-surface-2 text-ink-muted';
                                ?>
                                <tr class="hover:bg-surface-2">
                                    <td class="px-4 py-3 font-mono text-xs"><?= htmlspecialchars($lead['lead_id'], ENT_QUOTES, 'UTF-8', false) ?></td>
                                    <td class="px-4 py-3 font-medium text-ink"><?= htmlspecialchars($lead['customer_name'], ENT_QUOTES, 'UTF-8', false) ?></td>
                                    <td class="px-4 py-3 text-ink-muted"><?= htmlspecialchars($lead['service_required'], ENT_QUOTES, 'UTF-8', false) ?></td>
                                    <td class="px-4 py-3">
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium <?= $badgeClass ?>">
                                            <?= ucfirst($lead['status']) ?>
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 text-ink-muted"><?= date('d M Y', strtotime($lead['submitted_date'])) ?></td>
                                </tr>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Earnings Summary Card -->
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline">
                <div class="p-5 border-b border-hairline">
                    <h2 class="text-lg font-semibold text-ink">Earnings Summary</h2>
                    <p class="text-xs text-ink-muted mt-1">This month</p>
                </div>
                <div class="p-5 space-y-4">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-ink-muted">Total Earned</span>
                        <span class="text-lg font-bold text-green-600">₹<?= number_format($earnings['total_earned'], 0) ?></span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-ink-muted">Approved (Processing)</span>
                        <span class="text-lg font-bold text-blue-600">₹<?= number_format($earnings['approved_payment'], 0) ?></span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-ink-muted">Pending Approval</span>
                        <span class="text-lg font-bold text-amber-600">₹<?= number_format($earnings['pending_payment'], 0) ?></span>
                    </div>
                    <hr class="border-hairline">
                    <div class="text-center">
                        <p class="text-xs text-ink-muted mb-1">Commission Rate</p>
                        <p class="text-2xl font-bold text-primary-600"><?= (CAMPUS_SAARTHI_COMMISSION * 100) ?>%</p>
                        <p class="text-xs text-ink-muted mt-1">of project value</p>
                    </div>
                    <a href="<?= BASE_PATH ?>/user-panel/earnings.php" class="block w-full text-center px-4 py-2 bg-surface-2 hover:bg-surface-2 text-ink-muted rounded-lg text-sm font-medium transition">
                        View Full Earnings <i class="fas fa-arrow-right ml-1"></i>
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>






