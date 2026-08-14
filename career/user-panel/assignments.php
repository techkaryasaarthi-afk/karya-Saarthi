<?php
$pageTitle = 'My Assignments';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireRole(['intern']);

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
        logActivity($userId, 'assignment_status_updated', json_encode([
            'task_id' => $taskId,
            'task_title' => $task['title'],
            'old_status' => $task['status'],
            'new_status' => $newStatus
        ]));
        $successMsg = 'Assignment "' . htmlspecialchars($task['title'], ENT_QUOTES, 'UTF-8', false) . '" updated to ' . ucfirst(str_replace('_', ' ', $newStatus)) . '.';
    } else {
        $errorMsg = 'Invalid status update.';
    }
}

// Task stats
$stmt = $pdo->prepare("SELECT
    COUNT(*) as total,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
    FROM tasks WHERE assigned_to = ?");
$stmt->execute([$userId]);
$stats = $stmt->fetch();

// Fetch assignments with mentor info
$stmt = $pdo->prepare("SELECT t.*, u.name as mentor_name FROM tasks t
    LEFT JOIN users u ON t.assigned_by = u.user_id
    WHERE t.assigned_to = ?
    ORDER BY FIELD(t.status, 'in_progress', 'pending', 'completed', 'cancelled'),
    FIELD(t.priority, 'urgent', 'high', 'medium', 'low'), t.deadline ASC");
$stmt->execute([$userId]);
$assignments = $stmt->fetchAll();

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex min-h-screen bg-surface-2">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1">
        <div class="p-4 sm:p-6 lg:p-8">
            <!-- Page Header -->
            <div class="mb-6">
                <h1 class="text-2xl font-bold text-ink"><i class="fas fa-book mr-2 text-primary-600"></i>My Assignments</h1>
                <p class="text-ink-muted mt-1">View and manage your internship assignments.</p>
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

            <!-- Stats -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs text-ink-muted uppercase tracking-wider">Total</p>
                            <p class="text-2xl font-bold text-ink mt-1"><?= $stats['total'] ?? 0 ?></p>
                        </div>
                        <div class="w-10 h-10 bg-surface-2 rounded-lg flex items-center justify-center">
                            <i class="fas fa-book text-ink-muted"></i>
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

            <!-- Assignments List -->
            <?php if (empty($assignments)): ?>
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-12 text-center">
                    <div class="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-clipboard text-ink-muted text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-ink mb-1">No assignments yet</h3>
                    <p class="text-sm text-ink-muted">Your mentor hasn't assigned any tasks yet. Check back soon!</p>
                </div>
            <?php else: ?>
                <div class="space-y-4">
                    <?php
                    $priorityColors = ['urgent' => 'border-red-500', 'high' => 'border-orange-500', 'medium' => 'border-blue-500', 'low' => 'border-hairline bg-surface-2 text-ink'];
                    $priorityBg = ['urgent' => 'bg-red-100 text-red-700', 'high' => 'bg-orange-100 text-orange-700', 'medium' => 'bg-blue-100 text-blue-700', 'low' => 'bg-surface-2 text-ink-muted'];
                    $statusColors = ['pending' => 'bg-amber-100 text-amber-700', 'in_progress' => 'bg-blue-100 text-blue-700', 'completed' => 'bg-green-100 text-green-700', 'cancelled' => 'bg-surface-2 text-ink-muted'];

                    foreach ($assignments as $task):
                        $isOverdue = $task['deadline'] && strtotime($task['deadline']) < time() && $task['status'] !== 'completed';
                        $daysLeft = $task['deadline'] ? max(0, floor((strtotime($task['deadline']) - time()) / 86400)) : null;
                    ?>
                    <div class="bg-surface-1 rounded-xl shadow-none border-l-4 <?= $priorityColors[$task['priority']] ?? 'border-hairline bg-surface-2 text-ink' ?> border border-hairline hover:shadow-md transition">
                        <div class="p-5">
                            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div class="flex-1">
                                    <div class="flex flex-wrap items-center gap-2 mb-2">
                                        <h3 class="text-base font-semibold text-ink"><?= htmlspecialchars($task['title'], ENT_QUOTES, 'UTF-8', false) ?></h3>
                                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium <?= $statusColors[$task['status']] ?? 'bg-surface-2 text-ink-muted' ?>">
                                            <?= ucfirst(str_replace('_', ' ', $task['status'])) ?>
                                        </span>
                                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium <?= $priorityBg[$task['priority']] ?? 'bg-surface-2 text-ink-muted' ?>">
                                            <?= ucfirst($task['priority']) ?>
                                        </span>
                                    </div>

                                    <?php if ($task['description']): ?>
                                        <p class="text-sm text-ink-muted mb-3"><?= htmlspecialchars($task['description'], ENT_QUOTES, 'UTF-8', false) ?></p>
                                    <?php endif; ?>

                                    <div class="flex flex-wrap items-center gap-4 text-xs text-ink-muted">
                                        <?php if ($task['mentor_name']): ?>
                                            <span class="inline-flex items-center">
                                                <div class="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center mr-1">
                                                    <i class="fas fa-user text-primary-600" style="font-size: 8px;"></i>
                                                </div>
                                                Mentor: <strong class="ml-1 text-ink-muted"><?= htmlspecialchars($task['mentor_name'], ENT_QUOTES, 'UTF-8', false) ?></strong>
                                            </span>
                                        <?php endif; ?>

                                        <?php if ($task['deadline']): ?>
                                            <span class="inline-flex items-center <?= $isOverdue ? 'text-red-600 font-medium' : '' ?>">
                                                <i class="fas fa-calendar-alt mr-1"></i>
                                                Due: <?= date('d M Y', strtotime($task['deadline'])) ?>
                                            </span>
                                        <?php endif; ?>

                                        <?php if ($task['deadline'] && $task['status'] !== 'completed'): ?>
                                            <?php if ($isOverdue): ?>
                                                <span class="inline-flex items-center px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                                                    <i class="fas fa-exclamation-triangle mr-1"></i>Overdue
                                                </span>
                                            <?php elseif ($daysLeft !== null && $daysLeft <= 3): ?>
                                                <span class="inline-flex items-center px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                                                    <i class="fas fa-clock mr-1"></i><?= $daysLeft ?> day<?= $daysLeft !== 1 ? 's' : '' ?> left
                                                </span>
                                            <?php elseif ($daysLeft !== null): ?>
                                                <span class="inline-flex items-center text-ink-muted">
                                                    <i class="fas fa-clock mr-1"></i><?= $daysLeft ?> days left
                                                </span>
                                            <?php endif; ?>
                                        <?php endif; ?>
                                    </div>
                                </div>

                                <!-- Status Update -->
                                <div class="flex-shrink-0">
                                    <?php if ($task['status'] === 'pending'): ?>
                                        <form method="POST" class="inline">
                                            <input type="hidden" name="action" value="update_status">
                                            <input type="hidden" name="task_id" value="<?= $task['task_id'] ?>">
                                            <input type="hidden" name="new_status" value="in_progress">
                                            <button type="submit" class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition">
                                                <i class="fas fa-play mr-1"></i>Start Working
                                            </button>
                                        </form>
                                    <?php elseif ($task['status'] === 'in_progress'): ?>
                                        <form method="POST" class="inline">
                                            <input type="hidden" name="action" value="update_status">
                                            <input type="hidden" name="task_id" value="<?= $task['task_id'] ?>">
                                            <input type="hidden" name="new_status" value="completed">
                                            <button type="submit" class="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition">
                                                <i class="fas fa-check mr-1"></i>Mark Complete
                                            </button>
                                        </form>
                                    <?php elseif ($task['status'] === 'completed'): ?>
                                        <span class="inline-flex items-center px-4 py-2 bg-green-500/10 text-green-700 text-sm font-medium rounded-lg">
                                            <i class="fas fa-check-double mr-1"></i>Completed
                                        </span>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>

                        <!-- Deadline progress bar -->
                        <?php if ($task['deadline'] && $task['status'] !== 'completed' && $task['created_at']):
                            $totalDays = max(1, floor((strtotime($task['deadline']) - strtotime($task['created_at'])) / 86400));
                            $elapsedDays = floor((time() - strtotime($task['created_at'])) / 86400);
                            $progressPct = min(100, max(0, ($elapsedDays / $totalDays) * 100));
                            $barColor = $progressPct > 90 ? 'bg-red-500' : ($progressPct > 70 ? 'bg-amber-500' : 'bg-primary-500');
                        ?>
                        <div class="px-5 pb-3">
                            <div class="flex items-center justify-between text-xs text-ink-muted mb-1">
                                <span>Time elapsed</span>
                                <span><?= round($progressPct) ?>%</span>
                            </div>
                            <div class="w-full bg-surface-2 rounded-full h-1.5">
                                <div class="<?= $barColor ?> h-1.5 rounded-full transition-all" style="width: <?= $progressPct ?>%"></div>
                            </div>
                        </div>
                        <?php endif; ?>
                    </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>







