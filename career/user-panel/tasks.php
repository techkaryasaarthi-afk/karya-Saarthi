<?php
$pageTitle = 'My Tasks';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireRole(['employee', 'pillar_post', 'intern', 'part_time', 'campus_saarthi', 'teaching_expert']);

$pdo = getDBConnection();
$userId = $_SESSION['user_id'];
$userType = $_SESSION['user_type'];
$successMsg = '';
$errorMsg = '';

// Ensure updated_at column exists
try { $pdo->exec("ALTER TABLE tasks ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"); } catch (Exception $e) {}

// Handle status update
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'update_status') {
    $taskId = $_POST['task_id'] ?? '';
    $newStatus = $_POST['new_status'] ?? '';
    $validTransitions = [
        'pending' => 'in_progress',
        'in_progress' => 'completed'
    ];

    // Verify task belongs to user
    $stmt = $pdo->prepare("SELECT task_id, title, status FROM tasks WHERE task_id = ? AND assigned_to = ?");
    $stmt->execute([$taskId, $userId]);
    $task = $stmt->fetch();

    if ($task && isset($validTransitions[$task['status']]) && $validTransitions[$task['status']] === $newStatus) {
        if ($newStatus === 'completed') {
            $stmt = $pdo->prepare("UPDATE tasks SET status = ?, completed_at = NOW(), updated_at = NOW() WHERE task_id = ?");
        } else {
            $stmt = $pdo->prepare("UPDATE tasks SET status = ?, updated_at = NOW() WHERE task_id = ?");
        }
        $stmt->execute([$newStatus, $taskId]);
        logActivity($userId, 'task_status_updated', json_encode([
            'task_id' => $taskId,
            'task_title' => $task['title'],
            'old_status' => $task['status'],
            'new_status' => $newStatus
        ]));
        $successMsg = 'Task "' . htmlspecialchars($task['title'], ENT_QUOTES, 'UTF-8', false) . '" updated to ' . ucfirst(str_replace('_', ' ', $newStatus)) . '.';
    } else {
        $errorMsg = 'Invalid status update.';
    }
}

// Filter
$statusFilter = $_GET['status'] ?? 'all';
$validStatuses = ['all', 'pending', 'in_progress', 'completed'];
if (!in_array($statusFilter, $validStatuses)) $statusFilter = 'all';

// Task stats
$stmt = $pdo->prepare("SELECT
    COUNT(*) as total,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
    FROM tasks WHERE assigned_to = ?");
$stmt->execute([$userId]);
$stats = $stmt->fetch();

// Fetch tasks
$sql = "SELECT t.*, u.name as assigned_by_name FROM tasks t
    LEFT JOIN users u ON t.assigned_by = u.user_id
    WHERE t.assigned_to = ?";
$params = [$userId];

if ($statusFilter !== 'all') {
    $sql .= " AND t.status = ?";
    $params[] = $statusFilter;
}

$sql .= " ORDER BY FIELD(t.status, 'in_progress', 'pending', 'completed', 'cancelled'),
    FIELD(t.priority, 'urgent', 'high', 'medium', 'low'), t.deadline ASC";

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
            <div class="mb-6">
                <h1 class="text-2xl font-bold text-ink"><i class="fas fa-tasks mr-2 text-primary-600"></i>My Tasks</h1>
                <p class="text-ink-muted mt-1">Manage and track your assigned tasks.</p>
            </div>

            <?php if ($successMsg): ?>
                <div class="mb-6 p-4 bg-green-500/10 border border-green-200 rounded-xl text-green-700 text-sm">
                    <i class="fas fa-check-circle mr-2"></i><?= $successMsg ?>
                </div>
            <?php endif; ?>
            <?php if ($errorMsg): ?>
                <div class="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-700 text-sm">
                    <i class="fas fa-exclamation-circle mr-2"></i><?= $errorMsg ?>
                </div>
            <?php endif; ?>

            <!-- Stats Cards -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs text-ink-muted uppercase tracking-wider">Total Tasks</p>
                            <p class="text-2xl font-bold text-ink mt-1"><?= $stats['total'] ?? 0 ?></p>
                        </div>
                        <div class="w-10 h-10 bg-surface-2 rounded-lg flex items-center justify-center">
                            <i class="fas fa-clipboard-list text-ink-muted"></i>
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
                    'all' => ['label' => 'All Tasks', 'count' => $stats['total'] ?? 0],
                    'pending' => ['label' => 'Pending', 'count' => $stats['pending'] ?? 0],
                    'in_progress' => ['label' => 'In Progress', 'count' => $stats['in_progress'] ?? 0],
                    'completed' => ['label' => 'Completed', 'count' => $stats['completed'] ?? 0],
                ];
                foreach ($filters as $key => $filter):
                    $active = $statusFilter === $key;
                ?>
                <a href="?status=<?= $key ?>" class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition <?= $active ? 'bg-primary-600 text-white' : 'bg-surface-1 text-ink-muted border border-hairline hover:bg-surface-2' ?>">
                    <?= $filter['label'] ?>
                    <span class="ml-2 px-1.5 py-0.5 rounded-full text-xs <?= $active ? 'bg-surface-1/20' : 'bg-surface-2' ?>"><?= $filter['count'] ?></span>
                </a>
                <?php endforeach; ?>
            </div>

            <!-- Tasks List -->
            <?php if (empty($tasks)): ?>
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-12 text-center">
                    <div class="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-clipboard-check text-ink-muted text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-ink mb-1">No tasks found</h3>
                    <p class="text-sm text-ink-muted"><?= $statusFilter !== 'all' ? 'No tasks with status "' . str_replace('_', ' ', $statusFilter) . '".' : 'You have no assigned tasks yet.' ?></p>
                </div>
            <?php else: ?>
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline overflow-hidden">
                    <div class="divide-y divide-hairline">
                        <?php
                        $priorityColors = ['urgent' => 'text-red-600', 'high' => 'text-orange-600', 'medium' => 'text-blue-600', 'low' => 'text-ink-muted'];
                        $priorityBg = ['urgent' => 'bg-red-100 text-red-700', 'high' => 'bg-orange-100 text-orange-700', 'medium' => 'bg-blue-100 text-blue-700', 'low' => 'bg-surface-2 text-ink-muted'];
                        $statusColors = ['pending' => 'bg-amber-100 text-amber-700', 'in_progress' => 'bg-blue-100 text-blue-700', 'completed' => 'bg-green-100 text-green-700', 'cancelled' => 'bg-surface-2 text-ink-muted'];

                        foreach ($tasks as $task):
                            $isOverdue = $task['deadline'] && strtotime($task['deadline']) < time() && $task['status'] !== 'completed';
                        ?>
                        <div class="p-4 sm:p-5 hover:bg-surface-2 transition">
                            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div class="flex-1">
                                    <div class="flex flex-wrap items-center gap-2 mb-1">
                                        <i class="fas fa-flag <?= $priorityColors[$task['priority']] ?? 'text-ink-muted' ?> text-xs"></i>
                                        <h3 class="text-sm font-semibold text-ink"><?= htmlspecialchars($task['title'], ENT_QUOTES, 'UTF-8', false) ?></h3>
                                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium <?= $statusColors[$task['status']] ?? 'bg-surface-2 text-ink-muted' ?>">
                                            <?= ucfirst(str_replace('_', ' ', $task['status'])) ?>
                                        </span>
                                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium <?= $priorityBg[$task['priority']] ?? 'bg-surface-2 text-ink-muted' ?>">
                                            <?= ucfirst($task['priority']) ?>
                                        </span>
                                    </div>

                                    <?php if ($task['description']): ?>
                                        <p class="text-xs text-ink-muted mt-1 line-clamp-2"><?= htmlspecialchars($task['description'], ENT_QUOTES, 'UTF-8', false) ?></p>
                                    <?php endif; ?>

                                    <div class="flex flex-wrap items-center gap-4 mt-2 text-xs text-ink-muted">
                                        <?php if ($task['deadline']): ?>
                                            <span class="<?= $isOverdue ? 'text-red-600 font-medium' : '' ?>">
                                                <i class="fas fa-calendar-alt mr-1"></i>
                                                <?= date('d M Y', strtotime($task['deadline'])) ?>
                                                <?= $isOverdue ? '(Overdue)' : '' ?>
                                            </span>
                                        <?php endif; ?>
                                        <?php if ($task['assigned_by_name']): ?>
                                            <span><i class="fas fa-user mr-1"></i>Assigned by: <?= htmlspecialchars($task['assigned_by_name'], ENT_QUOTES, 'UTF-8', false) ?></span>
                                        <?php endif; ?>
                                    </div>
                                </div>

                                <!-- Status Update -->
                                <div class="flex-shrink-0">
                                    <?php if ($task['status'] === 'pending'): ?>
                                        <form method="POST" action="" class="inline">
                                            <input type="hidden" name="action" value="update_status">
                                            <input type="hidden" name="task_id" value="<?= $task['task_id'] ?>">
                                            <input type="hidden" name="new_status" value="in_progress">
                                            <button type="submit" class="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition">
                                                <i class="fas fa-play mr-1"></i>Start
                                            </button>
                                        </form>
                                    <?php elseif ($task['status'] === 'in_progress'): ?>
                                        <form method="POST" action="" class="inline">
                                            <input type="hidden" name="action" value="update_status">
                                            <input type="hidden" name="task_id" value="<?= $task['task_id'] ?>">
                                            <input type="hidden" name="new_status" value="completed">
                                            <button type="submit" class="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition">
                                                <i class="fas fa-check mr-1"></i>Complete
                                            </button>
                                        </form>
                                    <?php elseif ($task['status'] === 'completed'): ?>
                                        <span class="inline-flex items-center text-xs text-green-600 font-medium">
                                            <i class="fas fa-check-double mr-1"></i>Done
                                        </span>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>







