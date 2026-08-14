<?php
$pageTitle = 'Payments & Commissions';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireAdmin();

$pdo = getDBConnection();
$message = '';
$messageType = '';

// Handle POST actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    try {
        switch ($action) {
            case 'approve':
                $stmt = $pdo->prepare("UPDATE payments SET status = 'approved', payment_date = CURDATE() WHERE payment_id = ?");
                $stmt->execute([(int)$_POST['payment_id']]);
                $message = 'Payment approved successfully!';
                $messageType = 'success';
                logActivity($_SESSION['user_id'], 'Approved payment', 'Payment #' . $_POST['payment_id']);
                break;

            case 'reject':
                $stmt = $pdo->prepare("UPDATE payments SET status = 'rejected' WHERE payment_id = ?");
                $stmt->execute([(int)$_POST['payment_id']]);
                $message = 'Payment rejected.';
                $messageType = 'success';
                logActivity($_SESSION['user_id'], 'Rejected payment', 'Payment #' . $_POST['payment_id']);
                break;

            case 'delete_payment':
                $payId = intval($_POST['payment_id'] ?? 0);
                if ($payId) {
                    $pdo->prepare("DELETE FROM payments WHERE payment_id = ?")->execute([$payId]);
                    $message = "Payment #$payId deleted permanently!";
                    $messageType = 'success';
                    logActivity($_SESSION['user_id'], 'delete_payment', "Deleted payment #$payId");
                }
                break;

            case 'mark_paid':
                $stmt = $pdo->prepare("UPDATE payments SET status = 'paid', payment_date = CURDATE(), payment_method = ?, transaction_id = ? WHERE payment_id = ?");
                $stmt->execute([
                    sanitize($_POST['payment_method']),
                    sanitize($_POST['transaction_id']),
                    (int)$_POST['payment_id']
                ]);

                // Also update commission_status in leads if this is a commission payment
                $stmtRef = $pdo->prepare("SELECT reference_id, user_id FROM payments WHERE payment_id = ?");
                $stmtRef->execute([(int)$_POST['payment_id']]);
                $payRef = $stmtRef->fetch();
                if ($payRef && $payRef['reference_id']) {
                    $stmtLead = $pdo->prepare("UPDATE leads SET commission_status = 'paid' WHERE lead_id = ?");
                    $stmtLead->execute([$payRef['reference_id']]);
                }

                $message = 'Payment marked as paid!';
                $messageType = 'success';
                logActivity($_SESSION['user_id'], 'Marked payment as paid', 'Payment #' . $_POST['payment_id']);
                break;
                
            case 'add_payment':
                $userId = sanitize($_POST['user_id']);
                $amount = (float)$_POST['amount'];
                $paymentType = sanitize($_POST['payment_type']);
                $description = sanitize($_POST['description'] ?? '');
                
                $stmt = $pdo->prepare("INSERT INTO payments (user_id, amount, payment_type, description, status) VALUES (?, ?, ?, ?, 'approved')");
                $stmt->execute([$userId, $amount, $paymentType, $description]);
                
                $message = 'Earning added successfully!';
                $messageType = 'success';
                logActivity($_SESSION['user_id'], 'add_payment', "Added $paymentType of Rs.$amount to user $userId");
                break;
        }
    } catch (Exception $e) {
        $message = 'Error: ' . $e->getMessage();
        $messageType = 'error';
    }
}

// Summary stats
$stmtPending = $pdo->query("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status IN ('pending', 'approved')");
$totalPending = $stmtPending->fetchColumn();

$stmtPaidMonth = $pdo->query("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'paid' AND MONTH(payment_date) = MONTH(CURDATE()) AND YEAR(payment_date) = YEAR(CURDATE())");
$totalPaidMonth = $stmtPaidMonth->fetchColumn();

$stmtPendingCount = $pdo->query("SELECT COUNT(*) FROM payments WHERE status = 'pending'");
$pendingCount = $stmtPendingCount->fetchColumn();

$stmtApprovedCount = $pdo->query("SELECT COUNT(*) FROM payments WHERE status = 'approved'");
$approvedCount = $stmtApprovedCount->fetchColumn();

// Pending payments (pending + approved)
$stmtPendingPayments = $pdo->query("SELECT p.*, u.name AS user_name, u.user_type FROM payments p LEFT JOIN users u ON p.user_id = u.user_id WHERE p.status IN ('pending', 'approved') ORDER BY p.created_at DESC LIMIT 20");
$pendingPayments = $stmtPendingPayments->fetchAll();

// Payment history with filters
$historyWhere = "WHERE p.status IN ('paid', 'rejected')";
$historyParams = [];

if (!empty($_GET['filter_type'])) {
    $historyWhere .= ' AND p.payment_type = ?';
    $historyParams[] = $_GET['filter_type'];
}
if (!empty($_GET['filter_status'])) {
    $historyWhere .= ' AND p.status = ?';
    $historyParams[] = $_GET['filter_status'];
}
if (!empty($_GET['date_from'])) {
    $historyWhere .= ' AND p.payment_date >= ?';
    $historyParams[] = $_GET['date_from'];
}
if (!empty($_GET['date_to'])) {
    $historyWhere .= ' AND p.payment_date <= ?';
    $historyParams[] = $_GET['date_to'];
}

$stmtHistory = $pdo->prepare("SELECT p.*, u.name AS user_name, u.user_type FROM payments p LEFT JOIN users u ON p.user_id = u.user_id $historyWhere ORDER BY p.payment_date DESC, p.created_at DESC LIMIT 20");
$stmtHistory->execute($historyParams);
$paymentHistory = $stmtHistory->fetchAll();

$payStatusColors = [
    'pending' => 'bg-yellow-100 text-yellow-700',
    'approved' => 'bg-blue-100 text-blue-700',
    'paid' => 'bg-green-100 text-green-700',
    'rejected' => 'bg-red-100 text-red-700'
];

$typeBadgeColors = [
    'vendor' => 'bg-blue-100 text-blue-700',
    'employee' => 'bg-amber-100 text-amber-700',
    'intern' => 'bg-green-100 text-green-700',
    'campus_saarthi' => 'bg-purple-100 text-purple-700'
];

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 dashboard-content-area p-6">
        <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold text-ink">Payments & Commissions</h1>
                <p class="text-sm text-ink-muted mt-1">Manage payments, commissions, and payouts.</p>
            </div>
            <button onclick="document.getElementById('payment-modal').classList.remove('hidden')" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-none transition">
                <i class="fas fa-plus mr-2"></i> Add Earning
            </button>
        </div>

        <?php if ($message): ?>
        <div class="mb-6 p-4 rounded-lg <?= $messageType === 'success' ? 'bg-green-500/10 text-green-700 border border-green-200' : 'bg-red-500/10 text-red-700 border border-red-500/20' ?>">
            <i class="fas <?= $messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle' ?> mr-2"></i>
            <?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8', false) ?>
        </div>
        <?php endif; ?>

        <!-- Summary Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-ink-muted">Total Pending</p>
                        <p class="text-2xl font-bold text-amber-600">Rs.<?= number_format($totalPending, 0) ?></p>
                    </div>
                    <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-hourglass-half text-amber-600"></i>
                    </div>
                </div>
                <p class="text-xs text-ink-muted mt-1"><?= $pendingCount ?> pending, <?= $approvedCount ?> approved</p>
            </div>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-ink-muted">Paid This Month</p>
                        <p class="text-2xl font-bold text-green-600">Rs.<?= number_format($totalPaidMonth, 0) ?></p>
                    </div>
                    <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-check-double text-green-600"></i>
                    </div>
                </div>
                <p class="text-xs text-ink-muted mt-1"><?= date('F Y') ?></p>
            </div>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-ink-muted">Awaiting Approval</p>
                        <p class="text-2xl font-bold text-yellow-600"><?= $pendingCount ?></p>
                    </div>
                    <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-clock text-yellow-600"></i>
                    </div>
                </div>
            </div>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-ink-muted">Ready to Pay</p>
                        <p class="text-2xl font-bold text-blue-600"><?= $approvedCount ?></p>
                    </div>
                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-wallet text-blue-600"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Pending Payments -->
        <div class="bg-surface-1 rounded-xl shadow-none border border-hairline overflow-hidden mb-8">
            <div class="px-6 py-4 border-b border-hairline">
                <h3 class="text-lg font-semibold text-ink"><i class="fas fa-hourglass-half text-amber-500 mr-2"></i>Pending Payments</h3>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-surface-2">
                        <tr>
                            <th class="px-4 py-3 text-left font-medium text-ink-muted">#</th>
                            <th class="px-4 py-3 text-left font-medium text-ink-muted">User</th>
                            <th class="px-4 py-3 text-left font-medium text-ink-muted">Type</th>
                            <th class="px-4 py-3 text-left font-medium text-ink-muted">Amount</th>
                            <th class="px-4 py-3 text-left font-medium text-ink-muted">For</th>
                            <th class="px-4 py-3 text-left font-medium text-ink-muted">Status</th>
                            <th class="px-4 py-3 text-left font-medium text-ink-muted">Created</th>
                            <th class="px-4 py-3 text-left font-medium text-ink-muted">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-hairline">
                        <?php if (empty($pendingPayments)): ?>
                        <tr><td colspan="8" class="px-4 py-8 text-center text-ink-muted">No pending payments.</td></tr>
                        <?php else: ?>
                        <?php foreach ($pendingPayments as $pay): ?>
                        <tr class="hover:bg-surface-2">
                            <td class="px-4 py-3 text-ink-muted"><?= $pay['payment_id'] ?></td>
                            <td class="px-4 py-3">
                                <p class="font-medium text-ink"><?= htmlspecialchars($pay['user_name'] ?? 'Unknown', ENT_QUOTES, 'UTF-8', false) ?></p>
                                <span class="px-1.5 py-0.5 rounded-full text-xs font-medium <?= $typeBadgeColors[$pay['user_type']] ?? 'bg-surface-2 text-ink-muted' ?>"><?= ucfirst(str_replace('_', ' ', $pay['user_type'] ?? 'N/A')) ?></span>
                            </td>
                            <td class="px-4 py-3 text-ink-muted"><?= ucfirst($pay['payment_type']) ?></td>
                            <td class="px-4 py-3 font-semibold text-ink">Rs.<?= number_format($pay['amount'], 2) ?></td>
                            <td class="px-4 py-3 text-ink-muted text-xs"><?= htmlspecialchars($pay['description'] ?? $pay['reference_id'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></td>
                            <td class="px-4 py-3">
                                <span class="px-2 py-1 rounded-full text-xs font-medium <?= $payStatusColors[$pay['status']] ?>"><?= ucfirst($pay['status']) ?></span>
                            </td>
                            <td class="px-4 py-3 text-ink-muted"><?= date('M d, Y', strtotime($pay['created_at'])) ?></td>
                            <td class="px-4 py-3">
                                <?php if ($pay['status'] === 'pending'): ?>
                                <div class="flex space-x-2">
                                    <form method="POST" class="inline">
                                        <input type="hidden" name="action" value="approve">
                                        <input type="hidden" name="payment_id" value="<?= $pay['payment_id'] ?>">
                                        <button type="submit" class="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-medium transition"><i class="fas fa-check mr-1"></i>Approve</button>
                                    </form>
                                    <form method="POST" class="inline" onsubmit="return confirm('Reject this payment?')">
                                        <input type="hidden" name="action" value="reject">
                                        <input type="hidden" name="payment_id" value="<?= $pay['payment_id'] ?>">
                                        <button type="submit" class="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition"><i class="fas fa-times mr-1"></i>Reject</button>
                                    </form>
                                    <form method="POST" class="inline" onsubmit="return confirm('Delete this payment permanently?')">
                                        <input type="hidden" name="action" value="delete_payment">
                                        <input type="hidden" name="payment_id" value="<?= $pay['payment_id'] ?>">
                                        <button type="submit" class="px-2 py-1 bg-surface-20 hover:bg-gray-600 text-white rounded text-xs font-medium transition"><i class="fas fa-trash mr-1"></i></button>
                                    </form>
                                </div>
                                <?php elseif ($pay['status'] === 'approved'): ?>
                                <div class="flex space-x-2">
                                    <button onclick="document.getElementById('payForm<?= $pay['payment_id'] ?>').classList.toggle('hidden')" class="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition"><i class="fas fa-money-bill mr-1"></i>Mark Paid</button>
                                    <form method="POST" class="inline" onsubmit="return confirm('Delete this payment permanently?')">
                                        <input type="hidden" name="action" value="delete_payment">
                                        <input type="hidden" name="payment_id" value="<?= $pay['payment_id'] ?>">
                                        <button type="submit" class="px-2 py-1 bg-surface-20 hover:bg-gray-600 text-white rounded text-xs font-medium transition"><i class="fas fa-trash mr-1"></i></button>
                                    </form>
                                </div>
                                <?php endif; ?>
                            </td>
                        </tr>
                        <?php if ($pay['status'] === 'approved'): ?>
                        <!-- Mark as Paid Form -->
                        <tr id="payForm<?= $pay['payment_id'] ?>" class="hidden">
                            <td colspan="8" class="px-4 py-4 bg-blue-50">
                                <form method="POST" class="flex flex-wrap items-end gap-3">
                                    <input type="hidden" name="action" value="mark_paid">
                                    <input type="hidden" name="payment_id" value="<?= $pay['payment_id'] ?>">
                                    <div>
                                        <label class="block text-xs font-medium text-ink-muted mb-1">Payment Method *</label>
                                        <select name="payment_method" required class="border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="upi">UPI</option>
                                            <option value="cash">Cash</option>
                                            <option value="cheque">Cheque</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-xs font-medium text-ink-muted mb-1">Transaction ID *</label>
                                        <input type="text" name="transaction_id" required class="border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                                    </div>
                                    <button type="submit" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"><i class="fas fa-check-double mr-1"></i>Confirm Payment</button>
                                </form>
                            </td>
                        </tr>
                        <?php endif; ?>
                        <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Payment History -->
        <div class="bg-surface-1 rounded-xl shadow-none border border-hairline overflow-hidden">
            <div class="px-6 py-4 border-b border-hairline">
                <h3 class="text-lg font-semibold text-ink"><i class="fas fa-history text-primary-500 mr-2"></i>Payment History</h3>
            </div>

            <!-- Filters -->
            <div class="px-6 py-3 border-b border-hairline bg-surface-2">
                <form method="GET" class="flex flex-wrap items-end gap-4">
                    <div>
                        <label class="block text-xs font-medium text-ink-muted mb-1">Payment Type</label>
                        <select name="filter_type" class="border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                            <option value="">All Types</option>
                            <option value="salary" <?= ($_GET['filter_type'] ?? '') === 'salary' ? 'selected' : '' ?>>Salary</option>
                            <option value="commission" <?= ($_GET['filter_type'] ?? '') === 'commission' ? 'selected' : '' ?>>Commission</option>
                            <option value="bonus" <?= ($_GET['filter_type'] ?? '') === 'bonus' ? 'selected' : '' ?>>Bonus</option>
                            <option value="stipend" <?= ($_GET['filter_type'] ?? '') === 'stipend' ? 'selected' : '' ?>>Stipend</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-ink-muted mb-1">Status</label>
                        <select name="filter_status" class="border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                            <option value="">All</option>
                            <option value="paid" <?= ($_GET['filter_status'] ?? '') === 'paid' ? 'selected' : '' ?>>Paid</option>
                            <option value="rejected" <?= ($_GET['filter_status'] ?? '') === 'rejected' ? 'selected' : '' ?>>Rejected</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-ink-muted mb-1">From</label>
                        <input type="date" name="date_from" value="<?= $_GET['date_from'] ?? '' ?>" class="border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-ink-muted mb-1">To</label>
                        <input type="date" name="date_to" value="<?= $_GET['date_to'] ?? '' ?>" class="border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                    </div>
                    <button type="submit" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">Filter</button>
                    <a href="<?= BASE_PATH ?>/admin/payments.php" class="text-ink-muted hover:text-ink-muted text-sm">Clear</a>
                </form>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-surface-2">
                        <tr>
                            <th class="px-4 py-3 text-left font-medium text-ink-muted">#</th>
                            <th class="px-4 py-3 text-left font-medium text-ink-muted">User</th>
                            <th class="px-4 py-3 text-left font-medium text-ink-muted">Type</th>
                            <th class="px-4 py-3 text-left font-medium text-ink-muted">Amount</th>
                            <th class="px-4 py-3 text-left font-medium text-ink-muted">Method</th>
                            <th class="px-4 py-3 text-left font-medium text-ink-muted">Transaction ID</th>
                            <th class="px-4 py-3 text-left font-medium text-ink-muted">Status</th>
                            <th class="px-4 py-3 text-left font-medium text-ink-muted">Date</th>
                            <th class="px-4 py-3 text-center font-medium text-ink-muted">Delete</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-hairline">
                        <?php if (empty($paymentHistory)): ?>
                        <tr><td colspan="9" class="px-4 py-8 text-center text-ink-muted">No payment history found.</td></tr>
                        <?php else: ?>
                        <?php foreach ($paymentHistory as $ph): ?>
                        <tr class="hover:bg-surface-2">
                            <td class="px-4 py-3 text-ink-muted"><?= $ph['payment_id'] ?></td>
                            <td class="px-4 py-3 font-medium text-ink"><?= htmlspecialchars($ph['user_name'] ?? 'Unknown', ENT_QUOTES, 'UTF-8', false) ?></td>
                            <td class="px-4 py-3 text-ink-muted"><?= ucfirst($ph['payment_type']) ?></td>
                            <td class="px-4 py-3 font-semibold text-ink">Rs.<?= number_format($ph['amount'], 2) ?></td>
                            <td class="px-4 py-3 text-ink-muted"><?= ucfirst(str_replace('_', ' ', $ph['payment_method'] ?? 'N/A')) ?></td>
                            <td class="px-4 py-3 font-mono text-xs text-ink-muted"><?= htmlspecialchars($ph['transaction_id'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></td>
                            <td class="px-4 py-3">
                                <span class="px-2 py-1 rounded-full text-xs font-medium <?= $payStatusColors[$ph['status']] ?? 'bg-surface-2 text-ink-muted' ?>"><?= ucfirst($ph['status']) ?></span>
                            </td>
                            <td class="px-4 py-3 text-ink-muted"><?= $ph['payment_date'] ? date('M d, Y', strtotime($ph['payment_date'])) : 'N/A' ?></td>
                            <td class="px-4 py-3 text-center">
                                <form method="POST" class="inline" onsubmit="return confirm('Delete this payment record permanently?')">
                                    <input type="hidden" name="action" value="delete_payment">
                                    <input type="hidden" name="payment_id" value="<?= $ph['payment_id'] ?>">
                                    <button type="submit" class="text-red-400 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-500/10"><i class="fas fa-trash"></i></button>
                                </form>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<?php 
// Fetch active users for the dropdown
$stmtUsers = $pdo->query("SELECT user_id, name, user_type FROM users WHERE status = 'active' ORDER BY name ASC");
$activeUsers = $stmtUsers->fetchAll();
?>

<!-- Add Payment Modal -->
<div id="payment-modal" class="hidden fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
            <div class="absolute inset-0 bg-ink opacity-50" onclick="document.getElementById('payment-modal').classList.add('hidden')"></div>
        </div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-surface-1 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
            <div class="px-6 py-5 border-b border-hairline flex justify-between items-center">
                <h3 class="text-lg font-bold text-ink">Add Earning</h3>
                <button type="button" onclick="document.getElementById('payment-modal').classList.add('hidden')" class="text-ink-muted hover:text-ink">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form method="POST" action="">
                <input type="hidden" name="action" value="add_payment">
                <div class="px-6 py-5 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-ink mb-1">Select User *</label>
                        <select name="user_id" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <option value="">Select User...</option>
                            <?php foreach($activeUsers as $u): ?>
                                <option value="<?= $u['user_id'] ?>"><?= htmlspecialchars($u['name'], ENT_QUOTES, 'UTF-8', false) ?> (<?= ucfirst(str_replace('_', ' ', $u['user_type'])) ?>)</option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-ink mb-1">Amount (Rs) *</label>
                            <input type="number" step="0.01" name="amount" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink mb-1">Type *</label>
                            <select name="payment_type" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                                <option value="salary">Salary</option>
                                <option value="commission">Commission</option>
                                <option value="bonus">Bonus</option>
                                <option value="stipend">Stipend</option>
                                <option value="task_payout">Task Payout</option>
                                <option value="referral_bonus">Referral Bonus</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink mb-1">Description</label>
                        <textarea name="description" rows="2" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g. Bonus for great work"></textarea>
                    </div>
                </div>
                <div class="px-6 py-4 bg-surface-2 border-t border-hairline flex justify-end space-x-3">
                    <button type="button" onclick="document.getElementById('payment-modal').classList.add('hidden')" class="px-4 py-2 border border-hairline text-ink rounded-lg hover:bg-surface-3 transition">Cancel</button>
                    <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">Add Earning</button>
                </div>
            </form>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>






