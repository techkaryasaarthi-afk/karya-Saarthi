<?php
$pageTitle = 'Task Management';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireAdmin();

$pdo = getDBConnection();
$message = '';
$messageType = '';

// Ensure updated_at column exists
try { $pdo->exec("ALTER TABLE tasks ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"); } catch (Exception $e) {}

// Handle POST Actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    try {
        if ($action === 'create_task') {
            $assignedTo = sanitize($_POST['assigned_to']);
            $title = sanitize($_POST['title']);
            $description = sanitize($_POST['description'] ?? '');
            $priority = sanitize($_POST['priority']);
            $deadline = trim($_POST['deadline'] ?? '');
            $deadline = !empty($deadline) ? $deadline : null;
            
            $stmt = $pdo->prepare("INSERT INTO tasks (assigned_to, assigned_by, title, description, priority, deadline) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$assignedTo, $_SESSION['user_id'], $title, $description, $priority, $deadline]);
            
            $message = 'Task assigned successfully!';
            $messageType = 'success';
            logActivity($_SESSION['user_id'], 'create_task', "Assigned task: $title to $assignedTo");
        } elseif ($action === 'update_status') {
            $taskId = (int)$_POST['task_id'];
            $status = sanitize($_POST['status']);
            
            $stmt = $pdo->prepare("UPDATE tasks SET status = ?, updated_at = NOW() WHERE task_id = ?");
            if ($status === 'completed') {
                $stmt = $pdo->prepare("UPDATE tasks SET status = ?, completed_at = NOW(), updated_at = NOW() WHERE task_id = ?");
            }
            $stmt->execute([$status, $taskId]);
            
            $message = 'Task status updated.';
            $messageType = 'success';
            logActivity($_SESSION['user_id'], 'update_task', "Updated task #$taskId status to $status");
        } elseif ($action === 'delete_task') {
            $taskId = (int)$_POST['task_id'];
            $stmt = $pdo->prepare("DELETE FROM tasks WHERE task_id = ?");
            $stmt->execute([$taskId]);
            
            $message = 'Task deleted successfully.';
            $messageType = 'success';
            logActivity($_SESSION['user_id'], 'delete_task', "Deleted task #$taskId");
        }
    } catch (Exception $e) {
        $message = 'Error: ' . $e->getMessage();
        $messageType = 'error';
    }
}

// Fetch Users for Assignment Dropdown
$stmt = $pdo->prepare("SELECT user_id, name, user_type FROM users WHERE status = 'active' AND user_type != 'admin' ORDER BY name ASC");
$stmt->execute();
$users = $stmt->fetchAll();

// Fetch Tasks
$filterStatus = $_GET['status'] ?? 'all';
$sql = "SELECT t.*, u.name as assignee_name, u.user_type, ab.name as assigner_name 
        FROM tasks t 
        LEFT JOIN users u ON t.assigned_to = u.user_id
        LEFT JOIN users ab ON t.assigned_by = ab.user_id";

$params = [];
if ($filterStatus !== 'all') {
    $sql .= " WHERE t.status = ?";
    $params[] = $filterStatus;
}
$sql .= " ORDER BY t.created_at DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$tasks = $stmt->fetchAll();

$statusColors = [
    'pending' => 'bg-amber-100 text-amber-700',
    'in_progress' => 'bg-blue-100 text-blue-700',
    'completed' => 'bg-green-100 text-green-700',
    'cancelled' => 'bg-surface-2 text-ink-muted'
];

$priorityColors = [
    'urgent' => 'text-red-600',
    'high' => 'text-orange-600',
    'medium' => 'text-blue-600',
    'low' => 'text-ink-muted'
];

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex min-h-[calc(100vh-56px)] bg-surface-2">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    
    <div class="flex-1 flex flex-col min-w-0 overflow-y-auto dashboard-content-area">
        <main class="flex-1 p-4 sm:p-6 lg:p-8">
            <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 class="text-2xl font-bold text-ink"><i class="fas fa-tasks mr-2 text-primary-600"></i>Task Management</h1>
                    <p class="text-ink-muted mt-1">Assign and monitor user tasks across the platform.</p>
                </div>
                <button onclick="document.getElementById('task-modal').classList.remove('hidden')" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-none transition">
                    <i class="fas fa-plus mr-2"></i> Assign Task
                </button>
            </div>

            <?php if ($message): ?>
            <div class="mb-6 p-4 rounded-lg <?= $messageType === 'success' ? 'bg-green-500/10 text-green-700 border border-green-200' : 'bg-red-500/10 text-red-700 border border-red-500/20' ?>">
                <i class="fas <?= $messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle' ?> mr-2"></i>
                <?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8', false) ?>
            </div>
            <?php endif; ?>

            <!-- Stats Summary -->
            <?php
            $counts = ['all' => count($tasks), 'pending' => 0, 'in_progress' => 0, 'completed' => 0, 'cancelled' => 0];
            foreach ($tasks as $t) { if (isset($counts[$t['status']])) $counts[$t['status']]++; }
            ?>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <a href="?status=all" class="bg-surface-1 border <?= $filterStatus === 'all' ? 'border-primary-500' : 'border-hairline' ?> rounded-xl p-4 text-center hover:border-primary-500 transition">
                    <p class="text-2xl font-bold text-ink"><?= $counts['all'] ?></p>
                    <p class="text-xs text-ink-muted mt-1">All Tasks</p>
                </a>
                <a href="?status=pending" class="bg-surface-1 border <?= $filterStatus === 'pending' ? 'border-amber-500' : 'border-hairline' ?> rounded-xl p-4 text-center hover:border-amber-500 transition">
                    <p class="text-2xl font-bold text-amber-500"><?= $counts['pending'] ?></p>
                    <p class="text-xs text-ink-muted mt-1">Pending</p>
                </a>
                <a href="?status=in_progress" class="bg-surface-1 border <?= $filterStatus === 'in_progress' ? 'border-blue-500' : 'border-hairline' ?> rounded-xl p-4 text-center hover:border-blue-500 transition">
                    <p class="text-2xl font-bold text-blue-500"><?= $counts['in_progress'] ?></p>
                    <p class="text-xs text-ink-muted mt-1">In Progress</p>
                </a>
                <a href="?status=completed" class="bg-surface-1 border <?= $filterStatus === 'completed' ? 'border-green-500' : 'border-hairline' ?> rounded-xl p-4 text-center hover:border-green-500 transition">
                    <p class="text-2xl font-bold text-green-500"><?= $counts['completed'] ?></p>
                    <p class="text-xs text-ink-muted mt-1">Completed</p>
                </a>
            </div>

            <!-- Filter Tabs -->
            <div class="flex flex-wrap gap-2 mb-5">
                <a href="?status=all" class="px-3 py-1.5 rounded-lg text-sm font-medium <?= $filterStatus === 'all' ? 'bg-primary-600 text-white' : 'bg-surface-1 text-ink-muted border border-hairline hover:bg-surface-2' ?>">All</a>
                <a href="?status=pending" class="px-3 py-1.5 rounded-lg text-sm font-medium <?= $filterStatus === 'pending' ? 'bg-amber-500 text-white' : 'bg-surface-1 text-ink-muted border border-hairline hover:bg-surface-2' ?>">Pending</a>
                <a href="?status=in_progress" class="px-3 py-1.5 rounded-lg text-sm font-medium <?= $filterStatus === 'in_progress' ? 'bg-blue-500 text-white' : 'bg-surface-1 text-ink-muted border border-hairline hover:bg-surface-2' ?>">In Progress</a>
                <a href="?status=completed" class="px-3 py-1.5 rounded-lg text-sm font-medium <?= $filterStatus === 'completed' ? 'bg-green-500 text-white' : 'bg-surface-1 text-ink-muted border border-hairline hover:bg-surface-2' ?>">Completed</a>
                <a href="?status=cancelled" class="px-3 py-1.5 rounded-lg text-sm font-medium <?= $filterStatus === 'cancelled' ? 'bg-surface-2 text-ink' : 'bg-surface-1 text-ink-muted border border-hairline hover:bg-surface-2' ?>">Cancelled</a>
            </div>

            <!-- Task Cards -->
            <?php if (empty($tasks)): ?>
            <div class="bg-surface-1 rounded-xl border border-hairline p-12 text-center">
                <i class="fas fa-clipboard-list text-4xl text-ink-muted mb-4 block opacity-30"></i>
                <p class="text-ink-muted font-medium">No tasks found.</p>
                <p class="text-sm text-ink-muted mt-1 opacity-70">Click "Assign Task" to create the first task.</p>
            </div>
            <?php else: ?>
            <div class="space-y-4">
                <?php foreach ($tasks as $task):
                    $priorityLabel = ucfirst($task['priority'] ?? 'medium');
                    $priorityBg = [
                        'urgent' => 'bg-red-500/10 text-red-500 border-red-500/20',
                        'high'   => 'bg-orange-500/10 text-orange-500 border-orange-500/20',
                        'medium' => 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                        'low'    => 'bg-surface-2 text-ink-muted border-hairline',
                    ][$task['priority']] ?? 'bg-surface-2 text-ink-muted border-hairline';
                    $isOverdue = $task['deadline'] && $task['status'] !== 'completed' && strtotime($task['deadline']) < time();
                ?>
                <div class="bg-surface-1 border border-hairline rounded-xl overflow-hidden hover:border-primary-500/40 transition-colors">
                    <!-- Card Header -->
                    <div class="px-5 py-4 border-b border-hairline flex flex-wrap gap-3 justify-between items-start">
                        <div class="flex items-start gap-3 flex-1 min-w-0">
                            <!-- Priority indicator strip -->
                            <div class="flex-shrink-0 mt-1">
                                <?php
                                $flagColor = ['urgent'=>'text-red-500','high'=>'text-orange-500','medium'=>'text-blue-500','low'=>'text-ink-muted'][$task['priority']] ?? 'text-ink-muted';
                                ?>
                                <i class="fas fa-flag <?= $flagColor ?> text-sm"></i>
                            </div>
                            <div class="min-w-0">
                                <h3 class="font-bold text-ink text-base leading-snug"><?= htmlspecialchars($task['title'], ENT_QUOTES, 'UTF-8', false) ?></h3>
                                <div class="flex flex-wrap gap-2 mt-2">
                                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border <?= $priorityBg ?>">
                                        <?= $priorityLabel ?> Priority
                                    </span>
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium <?= $statusColors[$task['status']] ?? 'bg-surface-2 text-ink-muted' ?>">
                                        <?= ucfirst(str_replace('_', ' ', $task['status'])) ?>
                                    </span>
                                    <?php if ($isOverdue): ?>
                                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                                        <i class="fas fa-exclamation-circle mr-1 text-[10px]"></i>Overdue
                                    </span>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                        <!-- Actions -->
                        <div class="flex items-center gap-2 flex-shrink-0">
                            <form method="POST" action="" class="inline">
                                <input type="hidden" name="action" value="update_status">
                                <input type="hidden" name="task_id" value="<?= $task['task_id'] ?>">
                                <select name="status" onchange="this.form.submit()" class="text-xs border border-hairline rounded-lg px-2 py-1.5 bg-surface-2 text-ink cursor-pointer hover:border-primary-500 transition">
                                    <option value="pending" <?= $task['status'] == 'pending' ? 'selected' : '' ?>>Pending</option>
                                    <option value="in_progress" <?= $task['status'] == 'in_progress' ? 'selected' : '' ?>>In Progress</option>
                                    <option value="completed" <?= $task['status'] == 'completed' ? 'selected' : '' ?>>Completed</option>
                                    <option value="cancelled" <?= $task['status'] == 'cancelled' ? 'selected' : '' ?>>Cancelled</option>
                                </select>
                            </form>
                            <form method="POST" action="" class="inline" onsubmit="return confirm('Delete this task?');">
                                <input type="hidden" name="action" value="delete_task">
                                <input type="hidden" name="task_id" value="<?= $task['task_id'] ?>">
                                <button type="submit" class="text-red-400 hover:text-red-600 hover:bg-red-500/10 w-8 h-8 rounded-lg flex items-center justify-center transition" title="Delete task">
                                    <i class="fas fa-trash text-xs"></i>
                                </button>
                            </form>
                        </div>
                    </div>

                    <!-- Card Body: Full Description -->
                    <?php if (!empty($task['description'])): ?>
                    <div class="px-5 py-4 border-b border-hairline bg-surface-2/50">
                        <p class="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">Description</p>
                        <div class="text-sm text-ink leading-relaxed whitespace-pre-wrap"><?= htmlspecialchars($task['description'], ENT_QUOTES, 'UTF-8', false) ?></div>
                    </div>
                    <?php endif; ?>

                    <!-- Card Footer: Meta info -->
                    <div class="px-5 py-3 flex flex-wrap gap-4 text-xs text-ink-muted">
                        <!-- Assignee -->
                        <div class="flex items-center gap-1.5">
                            <div class="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 text-[10px] font-bold flex-shrink-0">
                                <?= strtoupper(substr($task['assignee_name'] ?? 'U', 0, 1)) ?>
                            </div>
                            <span class="font-medium text-ink"><?= htmlspecialchars($task['assignee_name'] ?? 'Unknown', ENT_QUOTES, 'UTF-8', false) ?></span>
                            <span class="text-ink-muted">(<?= ucfirst(str_replace('_', ' ', $task['user_type'] ?? '')) ?>)</span>
                        </div>
                        <!-- Deadline -->
                        <?php if ($task['deadline']): ?>
                        <div class="flex items-center gap-1.5 <?= $isOverdue ? 'text-red-500' : '' ?>">
                            <i class="fas fa-calendar-alt <?= $isOverdue ? 'text-red-500' : 'text-ink-muted' ?>"></i>
                            <span>Due: <?= date('d M Y', strtotime($task['deadline'])) ?></span>
                        </div>
                        <?php endif; ?>
                        <!-- Assigned by -->
                        <?php if (!empty($task['assigner_name'])): ?>
                        <div class="flex items-center gap-1.5">
                            <i class="fas fa-user-check text-ink-muted"></i>
                            <span>Assigned by: <?= htmlspecialchars($task['assigner_name'], ENT_QUOTES, 'UTF-8', false) ?></span>
                        </div>
                        <?php endif; ?>
                        <!-- Created date -->
                        <div class="flex items-center gap-1.5 ml-auto">
                            <i class="fas fa-clock text-ink-muted"></i>
                            <span>Created <?= date('d M Y', strtotime($task['created_at'])) ?></span>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>

        </main>
    </div>
</div>

<!-- Assign Task Modal -->
<div id="task-modal" class="hidden fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
            <div class="absolute inset-0 bg-ink opacity-50" onclick="document.getElementById('task-modal').classList.add('hidden')"></div>
        </div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-surface-1 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
            <div class="px-6 py-5 border-b border-hairline flex justify-between items-center">
                <h3 class="text-lg font-bold text-ink">Assign New Task</h3>
                <button type="button" onclick="document.getElementById('task-modal').classList.add('hidden')" class="text-ink-muted hover:text-ink">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form method="POST" action="">
                <input type="hidden" name="action" value="create_task">
                <div class="px-6 py-5 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-ink mb-1">Assign To *</label>
                        <select name="assigned_to" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <option value="">Select User...</option>
                            <?php foreach($users as $u): ?>
                                <option value="<?= $u['user_id'] ?>"><?= htmlspecialchars($u['name'], ENT_QUOTES, 'UTF-8', false) ?> (<?= ucfirst(str_replace('_', ' ', $u['user_type'])) ?>)</option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink mb-1">Task Title *</label>
                        <input type="text" name="title" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-ink mb-1">Description</label>
                        <textarea name="description" rows="3" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"></textarea>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-ink mb-1">Priority</label>
                            <select name="priority" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                                <option value="low">Low</option>
                                <option value="medium" selected>Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink mb-1">Deadline</label>
                            <input type="date" name="deadline" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                        </div>
                    </div>
                </div>
                <div class="px-6 py-4 bg-surface-2 border-t border-hairline flex justify-end space-x-3">
                    <button type="button" onclick="document.getElementById('task-modal').classList.add('hidden')" class="px-4 py-2 border border-hairline text-ink rounded-lg hover:bg-surface-3 transition">Cancel</button>
                    <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">Assign Task</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Task Description Modal -->
<div id="task-desc-modal" class="hidden fixed inset-0 z-[9999] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="closeTaskDesc()"></div>
    <div class="relative bg-surface-1 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        <div class="px-6 py-4 border-b border-hairline flex justify-between items-center">
            <h3 id="task-desc-title" class="text-base font-bold text-ink"></h3>
            <button onclick="closeTaskDesc()" class="text-ink-muted hover:text-ink"><i class="fas fa-times"></i></button>
        </div>
        <div class="px-6 py-5">
            <p id="task-desc-body" class="text-sm text-ink-muted whitespace-pre-wrap"></p>
        </div>
    </div>
</div>
<script>
function showTaskDesc(title, desc) {
    document.getElementById('task-desc-title').textContent = title;
    document.getElementById('task-desc-body').textContent = desc;
    document.getElementById('task-desc-modal').classList.remove('hidden');
}
function closeTaskDesc() {
    document.getElementById('task-desc-modal').classList.add('hidden');
}
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
