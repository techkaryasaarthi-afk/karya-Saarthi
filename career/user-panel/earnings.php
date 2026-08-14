<?php
$pageTitle = 'Earnings';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireRole(['campus_saarthi', 'vendor']);

$pdo = getDBConnection();
$userId = $_SESSION['user_id'];
$userType = $_SESSION['user_type'];

// Month selector
$selectedMonth = isset($_GET['month']) ? intval($_GET['month']) : intval(date('m'));
$selectedYear = isset($_GET['year']) ? intval($_GET['year']) : intval(date('Y'));

if ($userType === 'campus_saarthi') {
    // Saarthi: lead-based commissions
    $stmt = $pdo->prepare("SELECT
        COALESCE(SUM(commission_amount), 0) as total_earnings,
        COALESCE(SUM(CASE WHEN commission_status = 'paid' THEN commission_amount ELSE 0 END), 0) as paid,
        COALESCE(SUM(CASE WHEN commission_status = 'pending' THEN commission_amount ELSE 0 END), 0) as pending,
        COALESCE(SUM(CASE WHEN commission_status = 'approved' THEN commission_amount ELSE 0 END), 0) as processing
        FROM leads WHERE campus_saarthi_id = ? AND MONTH(submitted_date) = ? AND YEAR(submitted_date) = ?");
    $stmt->execute([$userId, $selectedMonth, $selectedYear]);
    $summary = $stmt->fetch();

    // Detailed earnings
    $stmt = $pdo->prepare("SELECT lead_id, customer_name, service_required, project_value, commission_amount, commission_status, status as lead_status, submitted_date
        FROM leads WHERE campus_saarthi_id = ? AND MONTH(submitted_date) = ? AND YEAR(submitted_date) = ? AND commission_amount > 0
        ORDER BY submitted_date DESC");
    $stmt->execute([$userId, $selectedMonth, $selectedYear]);
    $earningsDetails = $stmt->fetchAll();
} else {
    // Vendor: project-based payments
    $stmt = $pdo->prepare("SELECT
        COALESCE(SUM(amount), 0) as total_earnings,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paid,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending,
        COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) as processing
        FROM payments WHERE user_id = ? AND MONTH(created_at) = ? AND YEAR(created_at) = ?");
    $stmt->execute([$userId, $selectedMonth, $selectedYear]);
    $summary = $stmt->fetch();

    // Detailed payments
    $stmt = $pdo->prepare("SELECT payment_id, amount, payment_type, description, status, payment_date, payment_method, transaction_id, created_at
        FROM payments WHERE user_id = ? AND MONTH(created_at) = ? AND YEAR(created_at) = ?
        ORDER BY created_at DESC");
    $stmt->execute([$userId, $selectedMonth, $selectedYear]);
    $earningsDetails = $stmt->fetchAll();
}

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex min-h-[calc(100vh-56px)]">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 dashboard-content-area p-6">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-2xl font-bold text-ink">Earnings</h1>
                <p class="text-ink-muted mt-1">
                    <?= $userType === 'campus_saarthi' ? 'Track your lead commissions and payouts.' : 'Track your project payments and earnings.' ?>
                </p>
            </div>

            <!-- Month Selector -->
            <form method="GET" class="flex items-center space-x-2">
                <select name="month" onchange="this.form.submit()" class="px-3 py-2 border border-hairline bg-surface-2 text-ink rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    <?php for ($m = 1; $m <= 12; $m++): ?>
                        <option value="<?= $m ?>" <?= $m === $selectedMonth ? 'selected' : '' ?>><?= date('F', mktime(0, 0, 0, $m, 1)) ?></option>
                    <?php endfor; ?>
                </select>
                <select name="year" onchange="this.form.submit()" class="px-3 py-2 border border-hairline bg-surface-2 text-ink rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    <?php for ($y = date('Y'); $y >= date('Y') - 2; $y--): ?>
                        <option value="<?= $y ?>" <?= $y === $selectedYear ? 'selected' : '' ?>><?= $y ?></option>
                    <?php endfor; ?>
                </select>
            </form>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-ink-muted">Total Earnings</p>
                        <p class="text-2xl font-bold text-ink">₹<?= number_format($summary['total_earnings'], 0) ?></p>
                    </div>
                    <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-rupee-sign text-primary-600 text-xl"></i>
                    </div>
                </div>
            </div>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-ink-muted">Paid</p>
                        <p class="text-2xl font-bold text-green-600">₹<?= number_format($summary['paid'], 0) ?></p>
                    </div>
                    <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-check-circle text-green-600 text-xl"></i>
                    </div>
                </div>
            </div>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-ink-muted">Pending</p>
                        <p class="text-2xl font-bold text-amber-600">₹<?= number_format($summary['pending'], 0) ?></p>
                    </div>
                    <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-clock text-amber-600 text-xl"></i>
                    </div>
                </div>
            </div>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-ink-muted">Processing</p>
                        <p class="text-2xl font-bold text-blue-600">₹<?= number_format($summary['processing'], 0) ?></p>
                    </div>
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-sync-alt text-blue-600 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Earnings Details Table -->
        <div class="bg-surface-1 rounded-xl shadow-none border border-hairline">
            <div class="p-5 border-b border-hairline">
                <h2 class="text-lg font-semibold text-ink">
                    <i class="fas fa-list-alt mr-2 text-primary-600"></i>
                    <?= date('F Y', mktime(0, 0, 0, $selectedMonth, 1, $selectedYear)) ?> - Earnings Details
                </h2>
            </div>
            <div class="overflow-x-auto">
                <?php if ($userType === 'campus_saarthi'): ?>
                    <table class="w-full text-sm">
                        <thead class="bg-surface-2">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Lead ID</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Customer</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Service</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Project Value</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Commission</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Status</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-hairline">
                            <?php if (empty($earningsDetails)): ?>
                                <tr>
                                    <td colspan="7" class="px-4 py-12 text-center text-ink-muted">
                                        <i class="fas fa-receipt text-4xl mb-3 block"></i>
                                        <p>No earnings for this month.</p>
                                    </td>
                                </tr>
                            <?php else: ?>
                                <?php foreach ($earningsDetails as $item):
                                    $csColors = ['pending' => 'bg-amber-100 text-amber-700', 'approved' => 'bg-blue-100 text-blue-700', 'paid' => 'bg-green-100 text-green-700', 'rejected' => 'bg-red-100 text-red-700'];
                                    $csBadge = $csColors[$item['commission_status']] ?? 'bg-surface-2 text-ink-muted';
                                ?>
                                <tr class="hover:bg-surface-2">
                                    <td class="px-4 py-3 font-mono text-xs text-primary-600"><?= htmlspecialchars($item['lead_id'], ENT_QUOTES, 'UTF-8', false) ?></td>
                                    <td class="px-4 py-3 font-medium text-ink"><?= htmlspecialchars($item['customer_name'], ENT_QUOTES, 'UTF-8', false) ?></td>
                                    <td class="px-4 py-3 text-ink-muted"><?= htmlspecialchars($item['service_required'], ENT_QUOTES, 'UTF-8', false) ?></td>
                                    <td class="px-4 py-3 text-ink-muted">₹<?= number_format($item['project_value'], 0) ?></td>
                                    <td class="px-4 py-3 font-bold text-green-600">₹<?= number_format($item['commission_amount'], 0) ?></td>
                                    <td class="px-4 py-3">
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium <?= $csBadge ?>">
                                            <?= ucfirst($item['commission_status']) ?>
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 text-ink-muted"><?= date('d M Y', strtotime($item['submitted_date'])) ?></td>
                                </tr>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>
                <?php else: ?>
                    <table class="w-full text-sm">
                        <thead class="bg-surface-2">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">ID</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Type</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Description</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Amount</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Status</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Payment Method</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-hairline">
                            <?php if (empty($earningsDetails)): ?>
                                <tr>
                                    <td colspan="7" class="px-4 py-12 text-center text-ink-muted">
                                        <i class="fas fa-receipt text-4xl mb-3 block"></i>
                                        <p>No payments for this month.</p>
                                    </td>
                                </tr>
                            <?php else: ?>
                                <?php foreach ($earningsDetails as $item):
                                    $payColors = ['pending' => 'bg-amber-100 text-amber-700', 'approved' => 'bg-blue-100 text-blue-700', 'paid' => 'bg-green-100 text-green-700', 'rejected' => 'bg-red-100 text-red-700'];
                                    $payBadge = $payColors[$item['status']] ?? 'bg-surface-2 text-ink-muted';
                                ?>
                                <tr class="hover:bg-surface-2">
                                    <td class="px-4 py-3 font-mono text-xs text-ink-muted">#<?= $item['payment_id'] ?></td>
                                    <td class="px-4 py-3">
                                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-700">
                                            <?= ucfirst($item['payment_type']) ?>
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 text-ink-muted"><?= htmlspecialchars($item['description'] ?? '-', ENT_QUOTES, 'UTF-8', false) ?></td>
                                    <td class="px-4 py-3 font-bold text-green-600">₹<?= number_format($item['amount'], 0) ?></td>
                                    <td class="px-4 py-3">
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium <?= $payBadge ?>">
                                            <?= ucfirst($item['status']) ?>
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 text-ink-muted"><?= htmlspecialchars($item['payment_method'] ?? '-', ENT_QUOTES, 'UTF-8', false) ?></td>
                                    <td class="px-4 py-3 text-ink-muted"><?= date('d M Y', strtotime($item['created_at'])) ?></td>
                                </tr>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>






