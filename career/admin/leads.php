<?php
$pageTitle = 'Lead Management';
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
            case 'update_status':
                $newStatus = $_POST['status'];
                $leadId = $_POST['lead_id'];

                if ($newStatus === 'won') {
                    // Mark as won with project value and commission calculation
                    $projectValue = (float)$_POST['project_value'];
                    $commission = $projectValue * CAMPUS_SAARTHI_COMMISSION;

                    $stmt = $pdo->prepare("UPDATE leads SET status = 'won', project_value = ?, commission_amount = ?, commission_status = 'pending', admin_notes = CONCAT(IFNULL(admin_notes,''), '\n[', NOW(), '] Marked as WON. Project value: ', ?, ', Commission: ', ?) WHERE lead_id = ?");
                    $stmt->execute([$projectValue, $commission, $projectValue, $commission, $leadId]);

                    // Create payment record for commission
                    $stmtLead = $pdo->prepare("SELECT campus_saarthi_id FROM leads WHERE lead_id = ?");
                    $stmtLead->execute([$leadId]);
                    $lead = $stmtLead->fetch();

                    if ($lead) {
                        $stmtPay = $pdo->prepare("INSERT INTO payments (user_id, amount, payment_type, reference_id, description, status) VALUES (?, ?, 'commission', ?, ?, 'pending')");
                        $stmtPay->execute([
                            $lead['campus_saarthi_id'],
                            $commission,
                            $leadId,
                            'Commission for lead ' . $leadId . ' (Project value: Rs.' . number_format($projectValue, 2) . ')'
                        ]);
                    }

                    $message = "Lead marked as Won! Commission of Rs." . number_format($commission, 2) . " created.";
                    $messageType = 'success';
                    logActivity($_SESSION['user_id'], 'Lead won', $leadId . ' - Value: ' . $projectValue);
                } else {
                    $stmt = $pdo->prepare("UPDATE leads SET status = ?, admin_notes = CONCAT(IFNULL(admin_notes,''), '\n[', NOW(), '] Status changed to ', ?) WHERE lead_id = ?");
                    $stmt->execute([$newStatus, $newStatus, $leadId]);
                    $message = 'Lead status updated to ' . ucfirst($newStatus) . '!';
                    $messageType = 'success';
                    logActivity($_SESSION['user_id'], 'Updated lead status', $leadId . ' -> ' . $newStatus);
                }
                break;

            case 'add_notes':
                $stmt = $pdo->prepare("UPDATE leads SET admin_notes = CONCAT(IFNULL(admin_notes,''), '\n[', NOW(), '] ', ?) WHERE lead_id = ?");
                $stmt->execute([sanitize($_POST['notes']), $_POST['lead_id']]);
                $message = 'Notes added successfully!';
                $messageType = 'success';
                break;

            case 'delete_lead':
                $leadId = $_POST['lead_id'] ?? '';
                if ($leadId) {
                    // Delete related payments first
                    $pdo->prepare("DELETE FROM payments WHERE reference_id = ?")->execute([$leadId]);
                    $pdo->prepare("DELETE FROM leads WHERE lead_id = ?")->execute([$leadId]);
                    $message = "Lead $leadId deleted permanently!";
                    $messageType = 'success';
                    logActivity($_SESSION['user_id'], 'delete_lead', "Deleted lead $leadId");
                }
                break;
        }
    } catch (Exception $e) {
        $message = 'Error: ' . $e->getMessage();
        $messageType = 'error';
    }
}

// Overview stats
$stmtToday = $pdo->query("SELECT COUNT(*) FROM leads WHERE DATE(submitted_date) = CURDATE()");
$leadsToday = $stmtToday->fetchColumn();

$stmtWeek = $pdo->query("SELECT COUNT(*) FROM leads WHERE submitted_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)");
$leadsWeek = $stmtWeek->fetchColumn();

$stmtMonth = $pdo->query("SELECT COUNT(*) FROM leads WHERE MONTH(submitted_date) = MONTH(CURDATE()) AND YEAR(submitted_date) = YEAR(CURDATE())");
$leadsMonth = $stmtMonth->fetchColumn();

$stmtWon = $pdo->query("SELECT COUNT(*) FROM leads WHERE status = 'won' AND MONTH(submitted_date) = MONTH(CURDATE()) AND YEAR(submitted_date) = YEAR(CURDATE())");
$wonMonth = $stmtWon->fetchColumn();
$conversionRate = $leadsMonth > 0 ? round(($wonMonth / $leadsMonth) * 100, 1) : 0;

$stmtAvgValue = $pdo->query("SELECT COALESCE(AVG(project_value), 0) FROM leads WHERE status = 'won' AND project_value > 0");
$avgProjectValue = $stmtAvgValue->fetchColumn();

$stmtTopCS = $pdo->query("SELECT u.name, COUNT(l.lead_id) as lead_count FROM leads l LEFT JOIN users u ON l.campus_saarthi_id = u.user_id WHERE MONTH(l.submitted_date) = MONTH(CURDATE()) AND YEAR(l.submitted_date) = YEAR(CURDATE()) GROUP BY l.campus_saarthi_id ORDER BY lead_count DESC LIMIT 1");
$topCS = $stmtTopCS->fetch();

// Build filter query for leads list
$where = 'WHERE 1=1';
$params = [];

if (!empty($_GET['filter_status'])) {
    $where .= ' AND l.status = ?';
    $params[] = $_GET['filter_status'];
}
if (!empty($_GET['filter_cs'])) {
    $where .= ' AND l.campus_saarthi_id = ?';
    $params[] = $_GET['filter_cs'];
}
if (!empty($_GET['date_from'])) {
    $where .= ' AND l.submitted_date >= ?';
    $params[] = $_GET['date_from'];
}
if (!empty($_GET['date_to'])) {
    $where .= ' AND l.submitted_date <= ?';
    $params[] = $_GET['date_to'] . ' 23:59:59';
}

$stmtLeads = $pdo->prepare("SELECT l.*, u.name AS cs_name FROM leads l LEFT JOIN users u ON l.campus_saarthi_id = u.user_id $where ORDER BY l.submitted_date DESC LIMIT 20");
$stmtLeads->execute($params);
$leads = $stmtLeads->fetchAll();

// Saarthi users for filter
$stmtCSUsers = $pdo->query("SELECT user_id, name FROM users WHERE user_type = 'campus_saarthi' AND status = 'active' ORDER BY name");
$csUsers = $stmtCSUsers->fetchAll();

$leadStatusColors = [
    'new' => 'bg-blue-100 text-blue-700',
    'contacted' => 'bg-yellow-100 text-yellow-700',
    'discussion' => 'bg-purple-100 text-purple-700',
    'won' => 'bg-green-100 text-green-700',
    'lost' => 'bg-red-100 text-red-700'
];

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 dashboard-content-area p-6">
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-ink">Lead Management</h1>
            <p class="text-sm text-ink-muted mt-1">Track and manage Saarthi leads.</p>
        </div>

        <?php if ($message): ?>
        <div class="mb-6 p-4 rounded-lg <?= $messageType === 'success' ? 'bg-green-500/10 text-green-700 border border-green-200' : 'bg-red-500/10 text-red-700 border border-red-500/20' ?>">
            <i class="fas <?= $messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle' ?> mr-2"></i>
            <?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8', false) ?>
        </div>
        <?php endif; ?>

        <!-- Overview Stats -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4 text-center">
                <p class="text-2xl font-bold text-blue-600"><?= $leadsToday ?></p>
                <p class="text-xs text-ink-muted">Today's Leads</p>
            </div>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4 text-center">
                <p class="text-2xl font-bold text-primary-600"><?= $leadsWeek ?></p>
                <p class="text-xs text-ink-muted">This Week</p>
            </div>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4 text-center">
                <p class="text-2xl font-bold text-purple-600"><?= $leadsMonth ?></p>
                <p class="text-xs text-ink-muted">This Month</p>
            </div>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4 text-center">
                <p class="text-2xl font-bold text-green-600"><?= $conversionRate ?>%</p>
                <p class="text-xs text-ink-muted">Conversion Rate</p>
            </div>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4 text-center">
                <p class="text-2xl font-bold text-amber-600">Rs.<?= number_format($avgProjectValue, 0) ?></p>
                <p class="text-xs text-ink-muted">Avg Project Value</p>
            </div>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4 text-center">
                <p class="text-lg font-bold text-ink"><?= htmlspecialchars($topCS['name'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></p>
                <p class="text-xs text-ink-muted">Top Saarthi</p>
                <?php if ($topCS): ?><p class="text-xs text-primary-600"><?= $topCS['lead_count'] ?> leads</p><?php endif; ?>
            </div>
        </div>

        <!-- Filters -->
        <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4 mb-6">
            <form method="GET" class="flex flex-wrap items-end gap-4">
                <div>
                    <label class="block text-xs font-medium text-ink-muted mb-1">Status</label>
                    <select name="filter_status" class="border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                        <option value="">All Statuses</option>
                        <?php foreach (['new', 'contacted', 'discussion', 'won', 'lost'] as $s): ?>
                        <option value="<?= $s ?>" <?= ($_GET['filter_status'] ?? '') === $s ? 'selected' : '' ?>><?= ucfirst($s) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-ink-muted mb-1">Saarthi</label>
                    <select name="filter_cs" class="border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                        <option value="">All</option>
                        <?php foreach ($csUsers as $cs): ?>
                        <option value="<?= $cs['user_id'] ?>" <?= ($_GET['filter_cs'] ?? '') === $cs['user_id'] ? 'selected' : '' ?>><?= htmlspecialchars($cs['name'], ENT_QUOTES, 'UTF-8', false) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-ink-muted mb-1">Date From</label>
                    <input type="date" name="date_from" value="<?= $_GET['date_from'] ?? '' ?>" class="border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                </div>
                <div>
                    <label class="block text-xs font-medium text-ink-muted mb-1">Date To</label>
                    <input type="date" name="date_to" value="<?= $_GET['date_to'] ?? '' ?>" class="border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                </div>
                <button type="submit" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">Filter</button>
                <a href="<?= BASE_PATH ?>/admin/leads.php" class="text-ink-muted hover:text-ink-muted text-sm">Clear</a>
            </form>
        </div>

        <!-- Leads Table -->
        <div class="bg-surface-1 rounded-xl shadow-none border border-hairline overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-surface-2">
                        <tr>
                            <th class="px-4 py-3 text-left font-medium text-ink-muted">Lead ID</th>
                            <th class="px-4 py-3 text-left font-medium text-ink-muted">Saarthi</th>
                            <th class="px-4 py-3 text-left font-medium text-ink-muted">Customer</th>
                            <th class="px-4 py-3 text-left font-medium text-ink-muted">Service</th>
                            <th class="px-4 py-3 text-left font-medium text-ink-muted">Status</th>
                            <th class="px-4 py-3 text-left font-medium text-ink-muted">Budget</th>
                            <th class="px-4 py-3 text-left font-medium text-ink-muted">Date</th>
                            <th class="px-4 py-3 text-left font-medium text-ink-muted">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-hairline">
                        <?php if (empty($leads)): ?>
                        <tr><td colspan="8" class="px-4 py-8 text-center text-ink-muted">No leads found.</td></tr>
                        <?php else: ?>
                        <?php foreach ($leads as $lead): ?>
                        <tr class="hover:bg-surface-2">
                            <td class="px-4 py-3 font-mono text-xs text-ink-muted"><?= htmlspecialchars($lead['lead_id'], ENT_QUOTES, 'UTF-8', false) ?></td>
                            <td class="px-4 py-3 font-medium text-ink"><?= htmlspecialchars($lead['cs_name'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></td>
                            <td class="px-4 py-3 text-ink-muted">
                                <?= htmlspecialchars($lead['customer_name'], ENT_QUOTES, 'UTF-8', false) ?>
                                <br><span class="text-xs text-ink-muted"><?= htmlspecialchars($lead['customer_phone'] ?? '', ENT_QUOTES, 'UTF-8', false) ?></span>
                            </td>
                            <td class="px-4 py-3 text-ink-muted"><?= htmlspecialchars($lead['service_required'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></td>
                            <td class="px-4 py-3">
                                <span class="px-2 py-1 rounded-full text-xs font-medium <?= $leadStatusColors[$lead['status']] ?? 'bg-surface-2 text-ink-muted' ?>"><?= ucfirst($lead['status']) ?></span>
                            </td>
                            <td class="px-4 py-3 text-ink-muted">
                                <?php if ($lead['budget_min'] || $lead['budget_max']): ?>
                                Rs.<?= number_format($lead['budget_min'] ?? 0, 0) ?> - <?= number_format($lead['budget_max'] ?? 0, 0) ?>
                                <?php else: ?>
                                N/A
                                <?php endif; ?>
                            </td>
                            <td class="px-4 py-3 text-ink-muted"><?= date('M d, Y', strtotime($lead['submitted_date'])) ?></td>
                            <td class="px-4 py-3">
                                <button onclick="document.getElementById('leadActions<?= $lead['lead_id'] ?>').classList.toggle('hidden')" class="text-primary-600 hover:text-primary-800 text-xs font-medium">
                                    <i class="fas fa-ellipsis-v"></i> Manage
                                </button>
                            </td>
                        </tr>
                        <!-- Lead Actions Row -->
                        <tr id="leadActions<?= $lead['lead_id'] ?>" class="hidden">
                            <td colspan="8" class="px-4 py-4 bg-surface-2">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <!-- Lead Details -->
                                    <div class="text-sm space-y-1">
                                        <p><strong>Customer Email:</strong> <?= htmlspecialchars($lead['customer_email'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></p>
                                        <p><strong>WhatsApp:</strong> <?= htmlspecialchars($lead['customer_whatsapp'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></p>
                                        <p><strong>College:</strong> <?= htmlspecialchars($lead['college'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></p>
                                        <p><strong>Urgency:</strong> <?= ucfirst($lead['urgency'] ?? 'normal') ?></p>
                                        <p><strong>Project Details:</strong> <?= htmlspecialchars($lead['project_details'] ?? 'N/A', ENT_QUOTES, 'UTF-8', false) ?></p>
                                        <?php if ($lead['project_value']): ?>
                                        <p><strong>Project Value:</strong> Rs.<?= number_format($lead['project_value'], 2) ?></p>
                                        <p><strong>Commission:</strong> Rs.<?= number_format($lead['commission_amount'], 2) ?> (<?= $lead['commission_status'] ?>)</p>
                                        <?php endif; ?>
                                        <?php if ($lead['admin_notes']): ?>
                                        <div class="mt-2">
                                            <strong>Admin Notes:</strong>
                                            <pre class="text-xs text-ink-muted whitespace-pre-wrap bg-surface-1 p-2 rounded border mt-1"><?= htmlspecialchars($lead['admin_notes'], ENT_QUOTES, 'UTF-8', false) ?></pre>
                                        </div>
                                        <?php endif; ?>
                                    </div>

                                    <!-- Status Workflow Buttons -->
                                    <div class="space-y-3">
                                        <p class="font-medium text-sm text-ink">Update Status:</p>
                                        <div class="flex flex-wrap gap-2">
                                            <?php if ($lead['status'] !== 'contacted'): ?>
                                            <form method="POST" class="inline">
                                                <input type="hidden" name="action" value="update_status">
                                                <input type="hidden" name="lead_id" value="<?= $lead['lead_id'] ?>">
                                                <input type="hidden" name="status" value="contacted">
                                                <button type="submit" class="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-xs font-medium transition"><i class="fas fa-phone mr-1"></i>Contact Customer</button>
                                            </form>
                                            <?php endif; ?>

                                            <?php if ($lead['status'] !== 'discussion'): ?>
                                            <form method="POST" class="inline">
                                                <input type="hidden" name="action" value="update_status">
                                                <input type="hidden" name="lead_id" value="<?= $lead['lead_id'] ?>">
                                                <input type="hidden" name="status" value="discussion">
                                                <button type="submit" class="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-medium transition"><i class="fas fa-users mr-1"></i>Assign to Team</button>
                                            </form>
                                            <?php endif; ?>

                                            <?php if ($lead['status'] !== 'won'): ?>
                                            <button onclick="document.getElementById('wonForm<?= $lead['lead_id'] ?>').classList.toggle('hidden')" class="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition"><i class="fas fa-trophy mr-1"></i>Mark as Won</button>
                                            <?php endif; ?>

                                            <?php if ($lead['status'] !== 'lost'): ?>
                                            <form method="POST" class="inline" onsubmit="return confirm('Mark this lead as lost?')">
                                                <input type="hidden" name="action" value="update_status">
                                                <input type="hidden" name="lead_id" value="<?= $lead['lead_id'] ?>">
                                                <input type="hidden" name="status" value="lost">
                                                <button type="submit" class="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition"><i class="fas fa-times mr-1"></i>Mark as Lost</button>
                                            </form>
                                            <?php endif; ?>
                                        </div>

                                        <!-- Won Form (hidden by default) -->
                                        <div id="wonForm<?= $lead['lead_id'] ?>" class="hidden bg-surface-1 p-3 rounded-lg border border-hairline mt-2">
                                            <form method="POST" class="space-y-2">
                                                <input type="hidden" name="action" value="update_status">
                                                <input type="hidden" name="lead_id" value="<?= $lead['lead_id'] ?>">
                                                <input type="hidden" name="status" value="won">
                                                <div>
                                                    <label class="block text-xs font-medium text-ink-muted mb-1">Project Value (Rs.) *</label>
                                                    <input type="number" name="project_value" required step="0.01" min="0" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm" oninput="document.getElementById('commission<?= $lead['lead_id'] ?>').textContent = 'Commission (10%): Rs.' + (this.value * 0.1).toFixed(2)">
                                                </div>
                                                <p id="commission<?= $lead['lead_id'] ?>" class="text-xs text-green-600 font-medium">Commission (10%): Rs.0.00</p>
                                                <button type="submit" class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition">Confirm Won</button>
                                            </form>
                                        </div>

                                        <!-- Add Notes -->
                                        <form method="POST" class="mt-3">
                                            <input type="hidden" name="action" value="add_notes">
                                            <input type="hidden" name="lead_id" value="<?= $lead['lead_id'] ?>">
                                            <div class="flex gap-2">
                                                <input type="text" name="notes" placeholder="Add a note..." required class="flex-1 border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-1.5 text-sm">
                                                <button type="submit" class="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-xs font-medium transition"><i class="fas fa-sticky-note mr-1"></i>Add Notes</button>
                                            </div>
                                        </form>

                                        <!-- Delete Lead -->
                                        <form method="POST" class="mt-3 pt-3 border-t border-hairline" onsubmit="return confirm('PERMANENTLY DELETE this lead and related payments? This cannot be undone!')">
                                            <input type="hidden" name="action" value="delete_lead">
                                            <input type="hidden" name="lead_id" value="<?= $lead['lead_id'] ?>">
                                            <button type="submit" class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition"><i class="fas fa-trash mr-1"></i>Delete Lead Permanently</button>
                                        </form>
                                    </div>
                                </div>
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
<?php require_once __DIR__ . '/../includes/footer.php'; ?>






