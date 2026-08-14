<?php
$pageTitle = 'My Leads';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireRole('campus_saarthi');

$pdo = getDBConnection();
$userId = $_SESSION['user_id'];

// Fetch all leads
$stmt = $pdo->prepare("SELECT * FROM leads WHERE campus_saarthi_id = ? ORDER BY submitted_date DESC");
$stmt->execute([$userId]);
$leads = $stmt->fetchAll();

// Stats
$stmt = $pdo->prepare("SELECT
    COUNT(*) as total,
    SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_count,
    SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) as contacted_count,
    SUM(CASE WHEN status = 'discussion' THEN 1 ELSE 0 END) as discussion_count,
    SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as won_count,
    SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) as lost_count,
    COALESCE(SUM(commission_amount), 0) as total_commission
    FROM leads WHERE campus_saarthi_id = ?");
$stmt->execute([$userId]);
$stats = $stmt->fetch();

$statusColors = [
    'new' => 'bg-blue-100 text-blue-700',
    'contacted' => 'bg-yellow-100 text-yellow-700',
    'discussion' => 'bg-orange-100 text-orange-700',
    'won' => 'bg-green-100 text-green-700',
    'lost' => 'bg-red-100 text-red-700'
];

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex min-h-[calc(100vh-56px)]">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 dashboard-content-area p-6">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-2xl font-bold text-ink">My Leads</h1>
                <p class="text-ink-muted mt-1">Track all your submitted leads and their status.</p>
            </div>
            <a href="<?= BASE_PATH ?>/user-panel/add-lead.php" class="inline-flex items-center px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-none transition text-sm">
                <i class="fas fa-plus mr-2"></i> Add New Lead
            </a>
        </div>

        <!-- Status Summary -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <div class="bg-surface-1 rounded-lg border border-hairline p-3 text-center">
                <p class="text-2xl font-bold text-ink"><?= $stats['total'] ?? 0 ?></p>
                <p class="text-xs text-ink-muted">Total</p>
            </div>
            <div class="bg-blue-50 rounded-lg border border-blue-200 p-3 text-center">
                <p class="text-2xl font-bold text-blue-700"><?= $stats['new_count'] ?? 0 ?></p>
                <p class="text-xs text-blue-600">New</p>
            </div>
            <div class="bg-yellow-50 rounded-lg border border-yellow-200 p-3 text-center">
                <p class="text-2xl font-bold text-yellow-700"><?= $stats['contacted_count'] ?? 0 ?></p>
                <p class="text-xs text-yellow-600">Contacted</p>
            </div>
            <div class="bg-orange-50 rounded-lg border border-orange-200 p-3 text-center">
                <p class="text-2xl font-bold text-orange-700"><?= $stats['discussion_count'] ?? 0 ?></p>
                <p class="text-xs text-orange-600">Discussion</p>
            </div>
            <div class="bg-green-500/10 rounded-lg border border-green-200 p-3 text-center">
                <p class="text-2xl font-bold text-green-700"><?= $stats['won_count'] ?? 0 ?></p>
                <p class="text-xs text-green-600">Won</p>
            </div>
            <div class="bg-red-500/10 rounded-lg border border-red-500/20 p-3 text-center">
                <p class="text-2xl font-bold text-red-700"><?= $stats['lost_count'] ?? 0 ?></p>
                <p class="text-xs text-red-600">Lost</p>
            </div>
        </div>

        <!-- Leads Table -->
        <div class="bg-surface-1 rounded-xl shadow-none border border-hairline">
            <div class="p-5 border-b border-hairline">
                <h2 class="text-lg font-semibold text-ink">All Leads</h2>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-surface-2">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Lead ID</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Customer Name</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Service</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Status</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Project Value</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Commission</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Date</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase"></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-hairline">
                        <?php if (empty($leads)): ?>
                            <tr>
                                <td colspan="8" class="px-4 py-12 text-center text-ink-muted">
                                    <i class="fas fa-inbox text-4xl mb-3 block"></i>
                                    <p class="text-lg">No leads yet</p>
                                    <p class="text-sm mt-1">Start by submitting your first lead!</p>
                                    <a href="<?= BASE_PATH ?>/user-panel/add-lead.php" class="inline-flex items-center mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition">
                                        <i class="fas fa-plus mr-2"></i> Add Lead
                                    </a>
                                </td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($leads as $lead):
                                $badgeClass = $statusColors[$lead['status']] ?? 'bg-surface-2 text-ink-muted';
                            ?>
                            <tr class="hover:bg-surface-2 cursor-pointer lead-row" data-lead-id="<?= htmlspecialchars($lead['lead_id'], ENT_QUOTES, 'UTF-8', false) ?>">
                                <td class="px-4 py-3 font-mono text-xs text-primary-600 font-medium"><?= htmlspecialchars($lead['lead_id'], ENT_QUOTES, 'UTF-8', false) ?></td>
                                <td class="px-4 py-3 font-medium text-ink"><?= htmlspecialchars($lead['customer_name'], ENT_QUOTES, 'UTF-8', false) ?></td>
                                <td class="px-4 py-3 text-ink-muted"><?= htmlspecialchars($lead['service_required'], ENT_QUOTES, 'UTF-8', false) ?></td>
                                <td class="px-4 py-3">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium <?= $badgeClass ?>">
                                        <?= ucfirst($lead['status']) ?>
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-ink-muted"><?= $lead['project_value'] ? '₹' . number_format($lead['project_value'], 0) : '-' ?></td>
                                <td class="px-4 py-3 font-medium <?= $lead['commission_amount'] ? 'text-green-600' : 'text-ink-muted' ?>">
                                    <?= $lead['commission_amount'] ? '₹' . number_format($lead['commission_amount'], 0) : '-' ?>
                                </td>
                                <td class="px-4 py-3 text-ink-muted"><?= date('d M Y', strtotime($lead['submitted_date'])) ?></td>
                                <td class="px-4 py-3">
                                    <button onclick="toggleDetails('<?= htmlspecialchars($lead['lead_id'], ENT_QUOTES, 'UTF-8', false) ?>')" class="text-ink-muted hover:text-primary-600 transition">
                                        <i class="fas fa-chevron-down text-xs"></i>
                                    </button>
                                </td>
                            </tr>
                            <!-- Expandable Details Row -->
                            <tr id="details-<?= htmlspecialchars($lead['lead_id'], ENT_QUOTES, 'UTF-8', false) ?>" class="hidden">
                                <td colspan="8" class="px-4 py-4 bg-surface-2">
                                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p class="text-xs text-ink-muted mb-1">Phone</p>
                                            <p class="font-medium"><?= htmlspecialchars($lead['customer_phone'] ?? '-', ENT_QUOTES, 'UTF-8', false) ?></p>
                                        </div>
                                        <div>
                                            <p class="text-xs text-ink-muted mb-1">WhatsApp</p>
                                            <p class="font-medium"><?= htmlspecialchars($lead['customer_whatsapp'] ?? '-', ENT_QUOTES, 'UTF-8', false) ?></p>
                                        </div>
                                        <div>
                                            <p class="text-xs text-ink-muted mb-1">Email</p>
                                            <p class="font-medium"><?= htmlspecialchars($lead['customer_email'] ?? '-', ENT_QUOTES, 'UTF-8', false) ?></p>
                                        </div>
                                        <div>
                                            <p class="text-xs text-ink-muted mb-1">College</p>
                                            <p class="font-medium"><?= htmlspecialchars($lead['college'] ?? '-', ENT_QUOTES, 'UTF-8', false) ?></p>
                                        </div>
                                        <div>
                                            <p class="text-xs text-ink-muted mb-1">Budget Range</p>
                                            <p class="font-medium">
                                                <?= $lead['budget_min'] || $lead['budget_max']
                                                    ? '₹' . number_format($lead['budget_min'], 0) . ' - ₹' . number_format($lead['budget_max'], 0)
                                                    : '-' ?>
                                            </p>
                                        </div>
                                        <div>
                                            <p class="text-xs text-ink-muted mb-1">Urgency</p>
                                            <p class="font-medium"><?= ucfirst($lead['urgency'] ?? '-') ?></p>
                                        </div>
                                        <?php if ($lead['project_details']): ?>
                                        <div class="sm:col-span-3">
                                            <p class="text-xs text-ink-muted mb-1">Project Details</p>
                                            <p class="font-medium text-ink-muted"><?= nl2br(htmlspecialchars($lead['project_details'], ENT_QUOTES, 'UTF-8', false)) ?></p>
                                        </div>
                                        <?php endif; ?>
                                        <?php if ($lead['commission_status']): ?>
                                        <div>
                                            <p class="text-xs text-ink-muted mb-1">Commission Status</p>
                                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                                <?php
                                                    $csColors = ['pending' => 'bg-amber-100 text-amber-700', 'approved' => 'bg-blue-100 text-blue-700', 'paid' => 'bg-green-100 text-green-700', 'rejected' => 'bg-red-100 text-red-700'];
                                                    echo $csColors[$lead['commission_status']] ?? 'bg-surface-2 text-ink-muted';
                                                ?>">
                                                <?= ucfirst($lead['commission_status']) ?>
                                            </span>
                                        </div>
                                        <?php endif; ?>
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

<script>
function toggleDetails(leadId) {
    const row = document.getElementById('details-' + leadId);
    if (row) {
        row.classList.toggle('hidden');
    }
}
</script>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>






