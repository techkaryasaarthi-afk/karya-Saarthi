<?php
$pageTitle = 'Submit Work';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireRole(['vendor', 'freelancer']);

$pdo = getDBConnection();
$userId = $_SESSION['user_id'];
$userType = $_SESSION['user_type'];
$successMsg = '';
$errorMsg = '';

// Ensure updated_at column exists
try { $pdo->exec("ALTER TABLE tasks ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"); } catch (Exception $e) {}

// Fetch assigned tasks that are not completed/cancelled
$stmt = $pdo->prepare("SELECT task_id, title, deadline, status FROM tasks WHERE assigned_to = ? AND status IN ('pending', 'in_progress') ORDER BY deadline ASC");
$stmt->execute([$userId]);
$assignedTasks = $stmt->fetchAll();

// Pre-select task from URL
$preSelectedTask = $_GET['task_id'] ?? '';

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'submit_work') {
    $taskId = $_POST['task_id'] ?? '';
    $notes = sanitize($_POST['notes'] ?? '');

    if (empty($taskId)) {
        $errorMsg = 'Please select a task.';
    } else {
        // Verify task belongs to user
        $stmt = $pdo->prepare("SELECT task_id, title FROM tasks WHERE task_id = ? AND assigned_to = ? AND status IN ('pending', 'in_progress')");
        $stmt->execute([$taskId, $userId]);
        $task = $stmt->fetch();

        if (!$task) {
            $errorMsg = 'Invalid task selected or task is already completed.';
        } else {
            $filePath = null;
            $fileName = null;

            // Handle file upload
            if (isset($_FILES['work_file']) && $_FILES['work_file']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = __DIR__ . '/../uploads/work/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }

                $fileExt = strtolower(pathinfo($_FILES['work_file']['name'], PATHINFO_EXTENSION));
                $allowedExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'psd', 'ai', 'fig', 'txt', 'csv'];

                if (!in_array($fileExt, $allowedExts)) {
                    $errorMsg = 'File type not allowed. Allowed types: ' . implode(', ', $allowedExts);
                } elseif ($_FILES['work_file']['size'] > 50 * 1024 * 1024) {
                    $errorMsg = 'File size must be under 50MB.';
                } else {
                    $fileName = $_FILES['work_file']['name'];
                    $safeFileName = $userId . '_task' . $taskId . '_' . time() . '.' . $fileExt;
                    $filePath = 'uploads/work/' . $safeFileName;

                    if (!move_uploaded_file($_FILES['work_file']['tmp_name'], $uploadDir . $safeFileName)) {
                        $errorMsg = 'Failed to upload file. Please try again.';
                        $filePath = null;
                    }
                }
            }

            if (empty($errorMsg)) {
                try {
                    $pdo->beginTransaction();

                    // Save to user_documents
                    if ($filePath) {
                        $stmt = $pdo->prepare("INSERT INTO user_documents (user_id, doc_type, file_name, file_path, uploaded_at) VALUES (?, 'other', ?, ?, NOW())");
                        $stmt->execute([$userId, $fileName, $filePath]);
                    }

                    // Update task status to completed
                    $stmt = $pdo->prepare("UPDATE tasks SET status = 'completed', updated_at = NOW() WHERE task_id = ?");
                    $stmt->execute([$taskId]);

                    // Log activity
                    logActivity($userId, 'work_submitted', json_encode([
                        'task_id' => $taskId,
                        'task_title' => $task['title'],
                        'notes' => $notes,
                        'file' => $fileName
                    ]));

                    $pdo->commit();
                    $successMsg = 'Work submitted successfully! Task "' . htmlspecialchars($task['title'], ENT_QUOTES, 'UTF-8', false) . '" marked as completed.';

                    // Refresh task list
                    $stmt = $pdo->prepare("SELECT task_id, title, deadline, status FROM tasks WHERE assigned_to = ? AND status IN ('pending', 'in_progress') ORDER BY deadline ASC");
                    $stmt->execute([$userId]);
                    $assignedTasks = $stmt->fetchAll();
                } catch (Exception $e) {
                    $pdo->rollBack();
                    $errorMsg = 'Failed to submit work. Please try again.';
                    error_log("Submit work error: " . $e->getMessage());
                }
            }
        }
    }
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
                    <h1 class="text-2xl font-bold text-ink"><i class="fas fa-upload mr-2 text-primary-600"></i>Submit Work</h1>
                    <p class="text-ink-muted mt-1">Submit your completed work for review.</p>
                </div>
                <a href="<?= BASE_PATH ?>/user-panel/projects.php" class="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 bg-surface-2 hover:bg-surface-2 text-ink-muted font-medium rounded-lg text-sm transition">
                    <i class="fas fa-arrow-left mr-2"></i>Back to Projects
                </a>
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

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Submit Form -->
                <div class="lg:col-span-2">
                    <div class="bg-surface-1 rounded-xl shadow-none border border-hairline">
                        <div class="p-5 border-b border-hairline">
                            <h2 class="text-lg font-semibold text-ink"><i class="fas fa-file-upload mr-2 text-primary-600"></i>Work Submission Form</h2>
                        </div>
                        <?php if (empty($assignedTasks)): ?>
                            <div class="p-8 text-center">
                                <div class="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i class="fas fa-clipboard-check text-ink-muted text-2xl"></i>
                                </div>
                                <h3 class="text-lg font-semibold text-ink mb-1">No pending tasks</h3>
                                <p class="text-sm text-ink-muted">All your assigned tasks have been completed. Great work!</p>
                            </div>
                        <?php else: ?>
                            <form method="POST" enctype="multipart/form-data" class="p-5 space-y-5">
                                <input type="hidden" name="action" value="submit_work">

                                <div>
                                    <label class="block text-sm font-medium text-ink-muted mb-1">Select Task <span class="text-red-400">*</span></label>
                                    <select name="task_id" required class="w-full px-4 py-2.5 border border-hairline bg-surface-2 text-ink rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                        <option value="">Choose a task...</option>
                                        <?php foreach ($assignedTasks as $task): ?>
                                            <option value="<?= $task['task_id'] ?>" <?= $preSelectedTask == $task['task_id'] ? 'selected' : '' ?>>
                                                <?= htmlspecialchars($task['title'], ENT_QUOTES, 'UTF-8', false) ?>
                                                <?= $task['deadline'] ? ' (Due: ' . date('d M Y', strtotime($task['deadline'])) . ')' : '' ?>
                                                - <?= ucfirst(str_replace('_', ' ', $task['status'])) ?>
                                            </option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-ink-muted mb-1">Notes / Description</label>
                                    <textarea name="notes" rows="5" placeholder="Describe the work you've completed, any issues encountered, or additional notes..." class="w-full px-4 py-2.5 border border-hairline bg-surface-2 text-ink rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"></textarea>
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-ink-muted mb-1">Upload File</label>
                                    <div class="border-2 border-dashed border-hairline bg-surface-2 text-ink rounded-lg p-6 text-center hover:border-primary-400 transition" id="drop-zone">
                                        <div class="mb-3">
                                            <i class="fas fa-cloud-upload-alt text-3xl text-ink-muted"></i>
                                        </div>
                                        <p class="text-sm text-ink-muted mb-1">Drag & drop your file here, or</p>
                                        <label class="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium cursor-pointer hover:bg-primary-100 transition">
                                            <i class="fas fa-folder-open mr-2"></i>Browse Files
                                            <input type="file" name="work_file" class="hidden" id="file-input" onchange="updateFileName(this)">
                                        </label>
                                        <p class="text-xs text-ink-muted mt-2">Max 50MB. Allowed: PDF, DOC, XLS, PPT, ZIP, Images, PSD, AI</p>
                                        <p class="text-sm text-primary-600 font-medium mt-2 hidden" id="file-name"></p>
                                    </div>
                                </div>

                                <div class="flex items-center justify-end space-x-3 pt-2">
                                    <a href="<?= BASE_PATH ?>/user-panel/projects.php" class="px-4 py-2.5 text-ink-muted bg-surface-2 hover:bg-surface-2 rounded-lg text-sm font-medium transition">Cancel</a>
                                    <button type="submit" class="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg text-sm transition">
                                        <i class="fas fa-paper-plane mr-2"></i>Submit Work
                                    </button>
                                </div>
                            </form>
                        <?php endif; ?>
                    </div>
                </div>

                <!-- Right Info -->
                <div class="space-y-6">
                    <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5">
                        <h3 class="font-semibold text-ink mb-3"><i class="fas fa-info-circle mr-2 text-primary-600"></i>Submission Guidelines</h3>
                        <ul class="space-y-2 text-sm text-ink-muted">
                            <li class="flex items-start space-x-2">
                                <i class="fas fa-check text-green-400 mt-0.5 text-xs"></i>
                                <span>Ensure all deliverables are complete before submitting.</span>
                            </li>
                            <li class="flex items-start space-x-2">
                                <i class="fas fa-check text-green-400 mt-0.5 text-xs"></i>
                                <span>Compress multiple files into a single ZIP archive.</span>
                            </li>
                            <li class="flex items-start space-x-2">
                                <i class="fas fa-check text-green-400 mt-0.5 text-xs"></i>
                                <span>Add clear notes describing what was done.</span>
                            </li>
                            <li class="flex items-start space-x-2">
                                <i class="fas fa-check text-green-400 mt-0.5 text-xs"></i>
                                <span>Task will be marked as completed after submission.</span>
                            </li>
                            <li class="flex items-start space-x-2">
                                <i class="fas fa-exclamation-triangle text-amber-500 mt-0.5 text-xs"></i>
                                <span>Submissions are final. Contact HR for revisions.</span>
                            </li>
                        </ul>
                    </div>

                    <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-5">
                        <h3 class="font-semibold text-ink mb-3"><i class="fas fa-tasks mr-2 text-primary-600"></i>Pending Tasks</h3>
                        <?php if (empty($assignedTasks)): ?>
                            <p class="text-sm text-ink-muted">No pending tasks.</p>
                        <?php else: ?>
                            <div class="space-y-2">
                                <?php foreach ($assignedTasks as $task): ?>
                                    <div class="flex items-center justify-between p-2 bg-surface-2 rounded-lg">
                                        <span class="text-sm text-ink-muted truncate flex-1"><?= htmlspecialchars($task['title'], ENT_QUOTES, 'UTF-8', false) ?></span>
                                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-2 <?= $task['status'] === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700' ?>">
                                            <?= ucfirst(str_replace('_', ' ', $task['status'])) ?>
                                        </span>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
function updateFileName(input) {
    const nameEl = document.getElementById('file-name');
    if (input.files.length > 0) {
        nameEl.textContent = input.files[0].name;
        nameEl.classList.remove('hidden');
    } else {
        nameEl.classList.add('hidden');
    }
}

// Drag and drop
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
if (dropZone && fileInput) {
    ['dragenter', 'dragover'].forEach(evt => {
        dropZone.addEventListener(evt, e => { e.preventDefault(); dropZone.classList.add('border-primary-400', 'bg-primary-50'); });
    });
    ['dragleave', 'drop'].forEach(evt => {
        dropZone.addEventListener(evt, e => { e.preventDefault(); dropZone.classList.remove('border-primary-400', 'bg-primary-50'); });
    });
    dropZone.addEventListener('drop', e => {
        fileInput.files = e.dataTransfer.files;
        updateFileName(fileInput);
    });
}
</script>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>







