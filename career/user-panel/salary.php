<?php
$pageTitle = 'Salary & Payments';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireRole(['employee', 'pillar_post']);

$pdo = getDBConnection();
$userId = $_SESSION['user_id'];
$userType = $_SESSION['user_type'];

// Filter by month/year
$filterMonth = $_GET['month'] ?? date('m');
$filterYear = $_GET['year'] ?? date('Y');
$filterMonth = intval($filterMonth);
$filterYear = intval($filterYear);

if ($filterMonth < 1 || $filterMonth > 12) $filterMonth = date('m');
if ($filterYear < 2020 || $filterYear > 2030) $filterYear = date('Y');

// This month's total
$stmt = $pdo->prepare("SELECT
    COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as month_paid,
    COALESCE(SUM(CASE WHEN status IN ('pending', 'approved') THEN amount ELSE 0 END), 0) as month_pending,
    COALESCE(SUM(amount), 0) as month_total
    FROM payments WHERE user_id = ? AND MONTH(created_at) = ? AND YEAR(created_at) = ?");
$stmt->execute([$userId, $filterMonth, $filterYear]);
$monthData = $stmt->fetch();

// This year's total
$stmt = $pdo->prepare("SELECT
    COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as year_paid,
    COALESCE(SUM(amount), 0) as year_total
    FROM payments WHERE user_id = ? AND YEAR(created_at) = ?");
$stmt->execute([$userId, $filterYear]);
$yearData = $stmt->fetch();

// Total salary earned
$stmt = $pdo->prepare("SELECT
    COALESCE(SUM(CASE WHEN payment_type = 'salary' AND status = 'paid' THEN amount ELSE 0 END), 0) as total_salary,
    COALESCE(SUM(CASE WHEN payment_type = 'bonus' AND status = 'paid' THEN amount ELSE 0 END), 0) as total_bonus
    FROM payments WHERE user_id = ? AND YEAR(created_at) = ?");
$stmt->execute([$userId, $filterYear]);
$typeData = $stmt->fetch();

// Payment history for selected month
$stmt = $pdo->prepare("SELECT * FROM payments WHERE user_id = ? AND MONTH(created_at) = ? AND YEAR(created_at) = ? ORDER BY created_at DESC");
$stmt->execute([$userId, $filterMonth, $filterYear]);
$payments = $stmt->fetchAll();

// Monthly breakdown for chart
$stmt = $pdo->prepare("SELECT
    MONTH(created_at) as month,
    COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as amount
    FROM payments WHERE user_id = ? AND YEAR(created_at) = ?
    GROUP BY MONTH(created_at) ORDER BY month");
$stmt->execute([$userId, $filterYear]);
$monthlyBreakdown = $stmt->fetchAll();
$chartData = array_fill(0, 12, 0);
foreach ($monthlyBreakdown as $row) {
    $chartData[$row['month'] - 1] = floatval($row['amount']);
}

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex min-h-screen bg-surface-2">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1">
        <div class="p-4 sm:p-6 lg:p-8">
            <!-- Page Header -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-ink"><i class="fas fa-wallet mr-2 text-primary-600"></i>Salary & Payments</h1>
                    <p class="text-ink-muted mt-1">Track your salary and bonus payments.</p>
                </div>
                <!-- Month/Year Filter -->
                <form method="GET" class="mt-3 sm:mt-0 flex items-center space-x-2">
                    <select name="month" class="px-3 py-2 border border-hairline bg-surface-2 text-ink rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
                        <?php
                        $months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
                        for ($m = 1; $m <= 12; $m++):
                        ?>
                            <option value="<?= $m ?>" <?= $filterMonth == $m ? 'selected' : '' ?>><?= $months[$m-1] ?></option>
                        <?php endfor; ?>
                    </select>
                    <select name="year" class="px-3 py-2 border border-hairline bg-surface-2 text-ink rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
                        <?php for ($y = date('Y'); $y >= 2023; $y--): ?>
                            <option value="<?= $y ?>" <?= $filterYear == $y ? 'selected' : '' ?>><?= $y ?></option>
                        <?php endfor; ?>
                    </select>
                    <button type="submit" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition">
                        <i class="fas fa-filter mr-1"></i>Filter
                    </button>
                </form>
            </div>

            <!-- Summary Cards -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs text-ink-muted uppercase tracking-wider">Month Paid</p>
                            <p class="text-xl font-bold text-green-600 mt-1">₹<?= number_format($monthData['month_paid'], 0) ?></p>
                        </div>
                        <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-check-circle text-green-600"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs text-ink-muted uppercase tracking-wider">Month Pending</p>
                            <p class="text-xl font-bold text-amber-600 mt-1">₹<?= number_format($monthData['month_pending'], 0) ?></p>
                        </div>
                        <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-hourglass-half text-amber-600"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs text-ink-muted uppercase tracking-wider">Year Salary</p>
                            <p class="text-xl font-bold text-primary-600 mt-1">₹<?= number_format($typeData['total_salary'], 0) ?></p>
                        </div>
                        <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-money-bill-wave text-primary-600"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs text-ink-muted uppercase tracking-wider">Year Bonus</p>
                            <p class="text-xl font-bold text-purple-600 mt-1">₹<?= number_format($typeData['total_bonus'], 0) ?></p>
                        </div>
                        <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-gift text-purple-600"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Payment History -->
                <div class="lg:col-span-2">
                    <div class="bg-surface-1 rounded-xl shadow-none border border-hairline">
                        <div class="p-5 border-b border-hairline">
                            <h2 class="text-lg font-semibold text-ink">
                                <i class="fas fa-history mr-2 text-primary-600"></i>
                                Payment History - <?= $months[$filterMonth - 1] ?> <?= $filterYear ?>
                            </h2>
                        </div>
                        <?php if (empty($payments)): ?>
                            <div class="p-8 text-center">
                                <div class="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i class="fas fa-receipt text-ink-muted text-2xl"></i>
                                </div>
                                <h3 class="text-lg font-semibold text-ink mb-1">No payments found</h3>
                                <p class="text-sm text-ink-muted">No payment records for <?= $months[$filterMonth - 1] ?> <?= $filterYear ?>.</p>
                            </div>
                        <?php else: ?>
                            <div class="overflow-x-auto">
                                <table class="w-full">
                                    <thead class="bg-surface-2">
                                        <tr>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Date</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Type</th>
                                            <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Description</th>
                                            <th class="px-4 py-3 text-right text-xs font-medium text-ink-muted uppercase">Amount</th>
                                            <th class="px-4 py-3 text-center text-xs font-medium text-ink-muted uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-hairline">
                                        <?php
                                        $statusBadges = [
                                            'paid' => 'bg-green-100 text-green-700',
                                            'pending' => 'bg-amber-100 text-amber-700',
                                            'approved' => 'bg-blue-100 text-blue-700',
                                            'rejected' => 'bg-red-100 text-red-700',
                                        ];
                                        $typeBadges = [
                                            'salary' => 'bg-primary-100 text-primary-700',
                                            'bonus' => 'bg-purple-100 text-purple-700',
                                            'commission' => 'bg-green-100 text-green-700',
                                            'reimbursement' => 'bg-amber-100 text-amber-700',
                                        ];
                                        foreach ($payments as $payment):
                                        ?>
                                        <tr class="hover:bg-surface-2">
                                            <td class="px-4 py-3 text-sm text-ink"><?= date('d M Y', strtotime($payment['created_at'])) ?></td>
                                            <td class="px-4 py-3">
                                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium <?= $typeBadges[$payment['payment_type']] ?? 'bg-surface-2 text-ink-muted' ?>">
                                                    <?= ucfirst($payment['payment_type']) ?>
                                                </span>
                                            </td>
                                            <td class="px-4 py-3 text-sm text-ink-muted"><?= htmlspecialchars($payment['description'] ?? '-', ENT_QUOTES, 'UTF-8', false) ?></td>
                                            <td class="px-4 py-3 text-sm font-bold text-ink text-right">₹<?= number_format($payment['amount'], 0) ?></td>
                                            <td class="px-4 py-3 text-center">
                                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium <?= $statusBadges[$payment['status']] ?? 'bg-surface-2 text-ink-muted' ?>">
                                                    <?= ucfirst($payment['status']) ?>
                                                </span>
                                            </td>
                                        </tr>
                                        <?php endforeach; ?>
                                    </tbody>
                                    <tfoot class="bg-surface-2">
                                        <tr>
                                            <td colspan="3" class="px-4 py-3 text-sm font-semibold text-ink">Total</td>
                                            <td class="px-4 py-3 text-sm font-bold text-primary-600 text-right">₹<?= number_format($monthData['month_total'], 0) ?></td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>

                <!-- Right Column -->
                <div class="space-y-6">
                    <!-- Yearly Earnings Chart -->
                    <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5">
                        <h3 class="font-semibold text-ink mb-4"><i class="fas fa-chart-bar mr-2 text-primary-600"></i>Monthly Earnings (<?= $filterYear ?>)</h3>
                        <div class="space-y-2">
                            <?php
                            $maxAmount = max(array_merge($chartData, [1]));
                            $shortMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                            for ($m = 0; $m < 12; $m++):
                                $pct = $maxAmount > 0 ? ($chartData[$m] / $maxAmount * 100) : 0;
                                $isCurrent = ($m + 1) == $filterMonth;
                            ?>
                            <div class="flex items-center space-x-2">
                                <span class="text-xs text-ink-muted w-8 <?= $isCurrent ? 'font-bold text-primary-600' : '' ?>"><?= $shortMonths[$m] ?></span>
                                <div class="flex-1 bg-surface-2 rounded-full h-4 overflow-hidden">
                                    <div class="h-full rounded-full <?= $isCurrent ? 'bg-primary-600' : 'bg-primary-300' ?> transition-all" style="width: <?= $pct ?>%"></div>
                                </div>
                                <span class="text-xs font-medium text-ink-muted w-16 text-right"><?= $chartData[$m] > 0 ? '₹' . number_format($chartData[$m], 0) : '-' ?></span>
                            </div>
                            <?php endfor; ?>
                        </div>
                    </div>

                    <!-- Year Summary -->
                    <div class="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl shadow-none p-5 text-white">
                        <h3 class="font-semibold mb-3"><i class="fas fa-chart-pie mr-2"></i>Year Total (<?= $filterYear ?>)</h3>
                        <p class="text-3xl font-bold mb-1">₹<?= number_format($yearData['year_paid'], 0) ?></p>
                        <p class="text-sm text-primary-200">Total paid this year</p>
                        <div class="mt-3 pt-3 border-t border-white/20 grid grid-cols-2 gap-3">
                            <div>
                                <p class="text-xs text-primary-200">Salary</p>
                                <p class="text-sm font-bold">₹<?= number_format($typeData['total_salary'], 0) ?></p>
                            </div>
                            <div>
                                <p class="text-xs text-primary-200">Bonus</p>
                                <p class="text-sm font-bold">₹<?= number_format($typeData['total_bonus'], 0) ?></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>







