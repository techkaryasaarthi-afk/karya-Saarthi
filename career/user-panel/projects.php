<?php
$pageTitle = 'My Projects';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireRole(['vendor', 'freelancer']);

$pdo = getDBConnection();
$userId = $_SESSION['user_id'];
$userType = $_SESSION['user_type'];

// Filter by status
$statusFilter = $_GET['status'] ?? 'all';
$validStatuses = ['all', 'pending', 'in_progress', 'completed', 'cancelled'];
if (!in_array($statusFilter, $validStatuses)) $statusFilter = 'all';

// Fetch task stats
$stmt = $pdo->prepare("SELECT
    COUNT(*) as total,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
    FROM tasks WHERE assigned_to = ?");
$stmt->execute([$userId]);
$stats = $stmt->fetch();

// Fetch tasks with filter
$sql = "SELECT t.*, u.name as assigned_by_name FROM tasks t
    LEFT JOIN users u ON t.assigned_by = u.user_id
    WHERE t.assigned_to = ?";
$params = [$userId];

if ($statusFilter !== 'all') {
    $sql .= " AND t.status = ?";
    $params[] = $statusFilter;
}

$sql .= " ORDER BY FIELD(t.priority, 'urgent', 'high', 'medium', 'low'), t.deadline ASC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$tasks = $stmt->fetchAll();

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex min-h-screen bg-surface-2">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1">
        <div class="p-4 sm:p-6 lg:p-8">
            <!-- Page Header -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-ink"><i class="fas fa-project-diagram mr-2 text-primary-600"></i>My Projects</h1>
                    <p class="text-ink-muted mt-1">View and track your assigned projects and tasks.</p>
                </div>
                <a href="<?= BASE_PATH ?>/user-panel/submit-work.php" class="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg text-sm transition">
                    <i class="fas fa-upload mr-2"></i>Submit Work
                </a>
            </div>

            <!-- Stats Cards -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs text-ink-muted uppercase tracking-wider">Total</p>
                            <p class="text-2xl font-bold text-ink mt-1"><?= $stats['total'] ?? 0 ?></p>
                        </div>
                        <div class="w-10 h-10 bg-surface-2 rounded-lg flex items-center justify-center">
                            <i class="fas fa-folder text-ink-muted"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs text-ink-muted uppercase tracking-wider">Pending</p>
                            <p class="text-2xl font-bold text-amber-600 mt-1"><?= $stats['pending'] ?? 0 ?></p>
                        </div>
                        <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-hourglass-half text-amber-600"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs text-ink-muted uppercase tracking-wider">In Progress</p>
                            <p class="text-2xl font-bold text-blue-600 mt-1"><?= $stats['in_progress'] ?? 0 ?></p>
                        </div>
                        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-spinner text-blue-600"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs text-ink-muted uppercase tracking-wider">Completed</p>
                            <p class="text-2xl font-bold text-green-600 mt-1"><?= $stats['completed'] ?? 0 ?></p>
                        </div>
                        <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-check-circle text-green-600"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Filter Tabs -->
            <div class="flex flex-wrap gap-2 mb-6">
                <?php
                $filters = [
                    'all' => ['label' => 'All Projects', 'icon' => 'fa-th-large'],
                    'pending' => ['label' => 'Pending', 'icon' => 'fa-hourglass-half'],
                    'in_progress' => ['label' => 'In Progress', 'icon' => 'fa-spinner'],
                    'completed' => ['label' => 'Completed', 'icon' => 'fa-check-circle'],
                ];
                foreach ($filters as $key => $filter):
                    $active = $statusFilter === $key;
                ?>
                <a href="?status=<?= $key ?>" class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition <?= $active ? 'bg-primary-600 text-white' : 'bg-surface-1 text-ink-muted border border-hairline hover:bg-surface-2' ?>">
                    <i class="fas <?= $filter['icon'] ?> mr-2 text-xs"></i><?= $filter['label'] ?>
                </a>
                <?php endforeach; ?>
            </div>

            <!-- Projects Grid -->
            <?php if (empty($tasks)): ?>
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-12 text-center">
                    <div class="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-folder-open text-ink-muted text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-ink mb-1">No projects found</h3>
                    <p class="text-sm text-ink-muted"><?= $statusFilter !== 'all' ? 'No projects with status "' . str_replace('_', ' ', $statusFilter) . '".' : 'You have no assigned projects yet.' ?></p>
                </div>
            <?php else: ?>
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <?php
                    $priorityColors = ['urgent' => 'border-red-500 bg-red-500/10', 'high' => 'border-orange-500 bg-orange-50', 'medium' => 'border-blue-500 bg-blue-50', 'low' => 'border-hairline bg-surface-2 text-ink bg-surface-2'];
                    $priorityText = ['urgent' => 'text-red-700 bg-red-100', 'high' => 'text-orange-700 bg-orange-100', 'medium' => 'text-blue-700 bg-blue-100', 'low' => 'text-ink-muted bg-surface-2'];
                    $statusColors = ['pending' => 'bg-amber-100 text-amber-700', 'in_progress' => 'bg-blue-100 text-blue-700', 'completed' => 'bg-green-100 text-green-700', 'cancelled' => 'bg-surface-2 text-ink-muted'];

                    foreach ($tasks as $task):
                        $isOverdue = $task['deadline'] && strtotime($task['deadline']) < time() && $task['status'] !== 'completed';
                    ?>
                    <div class="bg-surface-1 rounded-xl shadow-none border-l-4 <?= $priorityColors[$task['priority']] ?? 'border-hairline bg-surface-2 text-ink bg-surface-1' ?> border border-hairline hover:shadow-md transition">
                        <div class="p-5">
                            <div class="flex items-start justify-between mb-3">
                                <h3 class="text-sm font-semibold text-ink flex-1 pr-2"><?= htmlspecialchars($task['title'], ENT_QUOTES, 'UTF-8', false) ?></h3>
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium <?= $statusColors[$task['status']] ?? 'bg-surface-2 text-ink-muted' ?> whitespace-nowrap">
                                    <?= ucfirst(str_replace('_', ' ', $task['status'])) ?>
                                </span>
                            </div>

                            <?php if ($task['description']): ?>
                                <p class="text-xs text-ink-muted mb-3 line-clamp-2"><?= htmlspecialchars($task['description'], ENT_QUOTES, 'UTF-8', false) ?></p>
                            <?php endif; ?>

                            <div class="space-y-2">
                                <div class="flex items-center justify-between text-xs">
                                    <span class="text-ink-muted"><i class="fas fa-flag mr-1"></i>Priority</span>
                                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium <?= $priorityText[$task['priority']] ?? 'text-ink-muted bg-surface-2' ?>">
                                        <?= ucfirst($task['priority']) ?>
                                    </span>
                                </div>

                                <?php if ($task['deadline']): ?>
                                <div class="flex items-center justify-between text-xs">
                                    <span class="text-ink-muted"><i class="fas fa-calendar-alt mr-1"></i>Deadline</span>
                                    <span class="font-medium <?= $isOverdue ? 'text-red-600' : 'text-ink' ?>">
                                        <?= date('d M Y', strtotime($task['deadline'])) ?>
                                        <?php if ($isOverdue): ?>
                                            <span class="text-red-400 ml-1">(Overdue)</span>
                                        <?php endif; ?>
                                    </span>
                                </div>
                                <?php endif; ?>

                                <?php if ($task['assigned_by_name']): ?>
                                <div class="flex items-center justify-between text-xs">
                                    <span class="text-ink-muted"><i class="fas fa-user mr-1"></i>Assigned By</span>
                                    <span class="font-medium text-ink"><?= htmlspecialchars($task['assigned_by_name'], ENT_QUOTES, 'UTF-8', false) ?></span>
                                </div>
                                <?php endif; ?>
                            </div>

                            <?php if ($task['status'] !== 'completed' && $task['status'] !== 'cancelled'): ?>
                            <div class="mt-4 pt-3 border-t border-hairline">
                                <a href="<?= BASE_PATH ?>/user-panel/submit-work.php?task_id=<?= $task['task_id'] ?>" class="inline-flex items-center text-xs font-medium text-primary-600 hover:text-primary-700 transition">
                                    <i class="fas fa-upload mr-1"></i>Submit Work
                                </a>
                            </div>
                            <?php endif; ?>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>







