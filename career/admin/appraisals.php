<?php
$pageTitle = 'Appraisal Management';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireAdmin();

$pdo = getDBConnection();
$message = '';
$messageType = '';
if (isset($_GET['msg']) && $_GET['msg'] === 'success') {
    $message = 'Operation completed successfully!';
    $messageType = 'success';
}

// Auto-create appraisals table
try { $pdo->exec("CREATE TABLE IF NOT EXISTS appraisals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    quarter VARCHAR(10) NOT NULL,
    year INT NOT NULL,
    self_rating_quality TINYINT DEFAULT 0,
    self_rating_punctuality TINYINT DEFAULT 0,
    self_rating_teamwork TINYINT DEFAULT 0,
    self_rating_output TINYINT DEFAULT 0,
    achievements TEXT NULL,
    challenges TEXT NULL,
    manager_rating_quality TINYINT DEFAULT 0,
    manager_rating_punctuality TINYINT DEFAULT 0,
    manager_rating_teamwork TINYINT DEFAULT 0,
    manager_rating_output TINYINT DEFAULT 0,
    manager_comments TEXT NULL,
    status ENUM('draft','submitted','reviewed','closed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"); } catch(Exception $e){}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    // Admin creates appraisal directly for a user
    if ($action === 'admin_create') {
        try {
            $uid  = sanitize($_POST['user_id'] ?? '');
            $qtr  = sanitize($_POST['quarter'] ?? 'Q1');
            $yr   = (int)($_POST['year'] ?? date('Y'));
            $ach  = sanitize($_POST['achievements'] ?? '');
            $chal = sanitize($_POST['challenges'] ?? '');
            $mQ   = max(1,min(5,(int)($_POST['manager_rating_quality']??1)));
            $mP   = max(1,min(5,(int)($_POST['manager_rating_punctuality']??1)));
            $mT   = max(1,min(5,(int)($_POST['manager_rating_teamwork']??1)));
            $mO   = max(1,min(5,(int)($_POST['manager_rating_output']??1)));
            $mc   = sanitize($_POST['manager_comments'] ?? '');
            if (empty($uid)) throw new Exception('Select a user.');
            $pdo->prepare("INSERT INTO appraisals (user_id,quarter,year,achievements,challenges,manager_rating_quality,manager_rating_punctuality,manager_rating_teamwork,manager_rating_output,manager_comments,status) VALUES (?,?,?,?,?,?,?,?,?,?,'reviewed')")
                ->execute([$uid,$qtr,$yr,$ach,$chal,$mQ,$mP,$mT,$mO,$mc]);
            logActivity($_SESSION['user_id'],'appraisal_create',"Created appraisal for $uid");
            header('Location: '.$_SERVER['PHP_SELF'].'?msg=success&status=reviewed'); exit;
        } catch(Exception $e){ $message='Error: '.$e->getMessage(); $messageType='error'; }
    }

    if ($action === 'submit_review') {
        try {
            $appraisalId = (int)$_POST['id'];
            $mQ = max(1,min(5,(int)($_POST['manager_rating_quality']??0)));
            $mP = max(1,min(5,(int)($_POST['manager_rating_punctuality']??0)));
            $mT = max(1,min(5,(int)($_POST['manager_rating_teamwork']??0)));
            $mO = max(1,min(5,(int)($_POST['manager_rating_output']??0)));
            $mc = sanitize($_POST['manager_comments']??'');
            if ($mQ<1||$mP<1||$mT<1||$mO<1) throw new Exception('Provide all 4 ratings.');
            $pdo->prepare("UPDATE appraisals SET manager_rating_quality=?,manager_rating_punctuality=?,manager_rating_teamwork=?,manager_rating_output=?,manager_comments=?,status='reviewed',updated_at=NOW() WHERE id=?")
                ->execute([$mQ,$mP,$mT,$mO,$mc,$appraisalId]);
            logActivity($_SESSION['user_id'],'appraisal_review',"Reviewed appraisal #$appraisalId");
            header('Location: '.$_SERVER['PHP_SELF'].'?msg=success&status=reviewed'); exit;
        } catch(Exception $e){ $message='Error: '.$e->getMessage(); $messageType='error'; }
    }

    if ($action === 'delete_appraisal') {
        $aid = (int)($_POST['appraisal_id']??0);
        if ($aid>0) { $pdo->prepare("DELETE FROM appraisals WHERE id=?")->execute([$aid]); }
        header('Location: '.$_SERVER['PHP_SELF'].'?msg=success'); exit;
    }
}

$filterStatus = $_GET['status'] ?? 'all';
$sql = "SELECT a.*, u.name as user_name, u.user_type FROM appraisals a LEFT JOIN users u ON a.user_id=u.user_id";
$params = [];
if ($filterStatus !== 'all') { $sql .= " WHERE a.status=?"; $params[]=$filterStatus; }
$sql .= " ORDER BY a.year DESC, a.quarter DESC, a.updated_at DESC";
$stmt=$pdo->prepare($sql); $stmt->execute($params);
$appraisals=$stmt->fetchAll();

// Tab counts
$tabCounts=['all'=>0,'submitted'=>0,'reviewed'=>0,'closed'=>0,'draft'=>0];
try {
    foreach($pdo->query("SELECT status,COUNT(*) as c FROM appraisals GROUP BY status")->fetchAll() as $r){
        if(isset($tabCounts[$r['status']])) $tabCounts[$r['status']]=(int)$r['c'];
        $tabCounts['all']+=(int)$r['c'];
    }
} catch(Exception $e){}

// Users for create form
$activeUsers=[];
try { $activeUsers=$pdo->query("SELECT user_id,name,user_type FROM users WHERE status='active' AND user_type!='admin' ORDER BY name")->fetchAll(); } catch(Exception $e){}

$ratingCategories = [
    'quality' => 'Quality of Work',
    'punctuality' => 'Punctuality',
    'teamwork' => 'Teamwork',
    'output' => 'Output / Productivity'
];

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex h-screen bg-surface-2 overflow-hidden">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    
    <div class="flex-1 dashboard-content-area flex flex-col min-w-0 overflow-y-auto">
        <main class="flex-1 p-4 sm:p-6 lg:p-8">
            <div class="mb-6 flex flex-wrap justify-between items-center gap-3">
                <div>
                    <h1 class="text-2xl font-bold text-ink"><i class="fas fa-star mr-2 text-primary-600"></i>Appraisal Management</h1>
                    <p class="text-ink-muted mt-1">Create and review appraisals for all users.</p>
                </div>
                <button onclick="document.getElementById('create-appraisal-modal').classList.remove('hidden')" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition">
                    <i class="fas fa-plus mr-2"></i>Create Appraisal
                </button>
            </div>

            <?php if ($message): ?>
            <div class="mb-6 p-4 rounded-lg <?= $messageType === 'success' ? 'bg-green-500/10 text-green-700 border border-green-200' : 'bg-red-500/10 text-red-700 border border-red-500/20' ?>">
                <i class="fas <?= $messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle' ?> mr-2"></i>
                <?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8', false) ?>
            </div>
            <?php endif; ?>

            <!-- Status Tabs -->
            <div class="flex flex-wrap gap-2 mb-6">
                <a href="?status=all" class="px-4 py-2 rounded-lg text-sm font-medium transition <?= $filterStatus==='all' ? 'bg-primary-600 text-white' : 'bg-surface-1 border border-hairline text-ink-muted hover:bg-surface-2' ?>">All (<?= $tabCounts['all'] ?>)</a>
                <a href="?status=submitted" class="px-4 py-2 rounded-lg text-sm font-medium transition <?= $filterStatus==='submitted' ? 'bg-amber-500 text-white' : 'bg-surface-1 border border-hairline text-ink-muted hover:bg-surface-2' ?>">Needs Review (<?= $tabCounts['submitted'] ?>)</a>
                <a href="?status=reviewed" class="px-4 py-2 rounded-lg text-sm font-medium transition <?= $filterStatus==='reviewed' ? 'bg-green-600 text-white' : 'bg-surface-1 border border-hairline text-ink-muted hover:bg-surface-2' ?>">Reviewed (<?= $tabCounts['reviewed'] ?>)</a>
                <a href="?status=closed" class="px-4 py-2 rounded-lg text-sm font-medium transition <?= $filterStatus==='closed' ? 'bg-surface-2 text-ink' : 'bg-surface-1 border border-hairline text-ink-muted hover:bg-surface-2' ?>">Closed (<?= $tabCounts['closed'] ?>)</a>
            </div>

            <?php if (empty($appraisals)): ?>
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-12 text-center">
                    <i class="fas fa-folder-open text-4xl text-ink-muted mb-3 opacity-50 block"></i>
                    <p class="text-ink-muted font-medium">No appraisals found.</p>
                    <p class="text-sm text-ink-muted mt-1 opacity-70">Click <strong>Create Appraisal</strong> to add one for any user.</p>
                    <button onclick="document.getElementById('create-appraisal-modal').classList.remove('hidden')" class="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium">
                        <i class="fas fa-plus mr-1"></i> Create First Appraisal
                    </button>
                </div>
            <?php else: ?>
                <div class="space-y-6">
                    <?php foreach ($appraisals as $appraisal): ?>
                        <div class="bg-surface-1 rounded-xl shadow-none border border-hairline overflow-hidden">
                            <div class="p-5 border-b border-hairline bg-surface-2 flex justify-between items-center flex-wrap gap-4">
                                <div>
                                    <h2 class="text-lg font-bold text-ink"><?= htmlspecialchars($appraisal['user_name'] ?? 'Unknown', ENT_QUOTES, 'UTF-8', false) ?> <span class="text-sm font-normal text-ink-muted">(<?= ucfirst(str_replace('_', ' ', $appraisal['user_type'] ?? '')) ?>)</span></h2>
                                    <p class="text-sm text-primary-600 font-medium"><?= $appraisal['quarter'] ?> <?= $appraisal['year'] ?></p>
                                </div>
                                <div class="flex items-center gap-2">
                                    <?php
                                    $badgeMap = ['submitted'=>'bg-blue-100 text-blue-700','reviewed'=>'bg-green-100 text-green-700','closed'=>'bg-surface-2 text-ink-muted','draft'=>'bg-amber-100 text-amber-700'];
                                    $badgeCls = $badgeMap[$appraisal['status']] ?? 'bg-surface-2 text-ink-muted';
                                    ?>
                                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium <?= $badgeCls ?>"><?= ucfirst($appraisal['status']) ?></span>
                                    <form method="POST" onsubmit="return confirm('Delete this appraisal?')" class="inline">
                                        <input type="hidden" name="action" value="delete_appraisal">
                                        <input type="hidden" name="appraisal_id" value="<?= $appraisal['id'] ?>">
                                        <button type="submit" class="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition" title="Delete appraisal"><i class="fas fa-trash text-xs"></i></button>
                                    </form>
                                </div>
                            </div>
                            
                            <div class="p-5 grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <!-- Self Appraisal Section -->
                                <div class="space-y-4">
                                    <h3 class="font-bold text-ink border-b border-hairline pb-2"><i class="fas fa-user text-ink-muted mr-2"></i>Self Appraisal</h3>
                                    
                                    <div class="grid grid-cols-2 gap-4 mb-4">
                                        <?php foreach ($ratingCategories as $key => $label): ?>
                                            <div class="bg-surface-2 p-3 rounded-lg">
                                                <p class="text-xs text-ink-muted mb-1"><?= $label ?></p>
                                                <div class="flex space-x-1">
                                                    <?php for($i=1; $i<=5; $i++): ?>
                                                        <i class="fas fa-star text-sm <?= $i <= ($appraisal["self_rating_$key"] ?? 0) ? 'text-amber-400' : 'text-ink-muted opacity-50' ?>"></i>
                                                    <?php endfor; ?>
                                                </div>
                                            </div>
                                        <?php endforeach; ?>
                                    </div>

                                    <div>
                                        <p class="text-xs font-bold text-ink-muted uppercase tracking-wider mb-1">Achievements</p>
                                        <p class="text-sm text-ink bg-surface-2 p-3 rounded-lg"><?= nl2br(htmlspecialchars($appraisal['achievements'] ?? 'None provided', ENT_QUOTES, 'UTF-8', false)) ?></p>
                                    </div>
                                    <div>
                                        <p class="text-xs font-bold text-ink-muted uppercase tracking-wider mb-1">Challenges</p>
                                        <p class="text-sm text-ink bg-surface-2 p-3 rounded-lg"><?= nl2br(htmlspecialchars($appraisal['challenges'] ?? 'None provided', ENT_QUOTES, 'UTF-8', false)) ?></p>
                                    </div>
                                </div>

                                <!-- Manager Review Section -->
                                <div>
                                    <h3 class="font-bold text-ink border-b border-hairline pb-2"><i class="fas fa-user-tie text-primary-600 mr-2"></i>Manager Review</h3>
                                    
                                    <?php if ($appraisal['status'] === 'submitted'): ?>
                                        <form method="POST" action="" class="mt-4 space-y-5">
                                            <input type="hidden" name="action" value="submit_review">
                                            <input type="hidden" name="id" value="<?= $appraisal['id'] ?>">
                                            
                                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <?php foreach ($ratingCategories as $key => $label): ?>
                                                    <div>
                                                        <label class="block text-xs font-medium text-ink-muted mb-1"><?= $label ?> *</label>
                                                        <select name="manager_rating_<?= $key ?>" required class="w-full border border-hairline bg-surface-1 text-ink rounded-lg px-3 py-2 text-sm focus:ring-primary-500">
                                                            <option value="">Select...</option>
                                                            <option value="5">5 - Excellent</option>
                                                            <option value="4">4 - Good</option>
                                                            <option value="3">3 - Average</option>
                                                            <option value="2">2 - Below Average</option>
                                                            <option value="1">1 - Poor</option>
                                                        </select>
                                                    </div>
                                                <?php endforeach; ?>
                                            </div>
                                            
                                            <div>
                                                <label class="block text-xs font-medium text-ink-muted mb-1">Manager Comments</label>
                                                <textarea name="manager_comments" rows="3" class="w-full border border-hairline bg-surface-1 text-ink rounded-lg px-3 py-2 text-sm focus:ring-primary-500" placeholder="Provide feedback and areas of improvement..."></textarea>
                                            </div>

                                            <button type="submit" class="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition">
                                                <i class="fas fa-check-circle mr-2"></i> Submit Manager Review
                                            </button>
                                        </form>
                                    <?php else: ?>
                                        <div class="mt-4 space-y-4">
                                            <div class="grid grid-cols-2 gap-4">
                                                <?php foreach ($ratingCategories as $key => $label): ?>
                                                    <div class="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                                                        <p class="text-xs text-blue-800 mb-1"><?= $label ?></p>
                                                        <div class="flex space-x-1">
                                                            <?php for($i=1; $i<=5; $i++): ?>
                                                                <i class="fas fa-star text-sm <?= $i <= ($appraisal["manager_rating_$key"] ?? 0) ? 'text-green-400' : 'text-ink-muted opacity-50' ?>"></i>
                                                            <?php endfor; ?>
                                                        </div>
                                                    </div>
                                                <?php endforeach; ?>
                                            </div>
                                            <div>
                                                <p class="text-xs font-bold text-ink-muted uppercase tracking-wider mb-1">Manager Comments</p>
                                                <p class="text-sm text-ink bg-surface-2 p-3 rounded-lg"><?= nl2br(htmlspecialchars($appraisal['manager_comments'] ?? 'No comments provided', ENT_QUOTES, 'UTF-8', false)) ?></p>
                                            </div>
                                        </div>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </main>
    </div>
</div>

<!-- Create Appraisal Modal -->
<div id="create-appraisal-modal" class="hidden fixed inset-0 z-[9999] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="this.parentElement.classList.add('hidden')"></div>
    <div class="relative bg-surface-1 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-hairline bg-gradient-to-r from-primary-600/10 to-purple-600/5">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center"><i class="fas fa-star text-primary-500"></i></div>
                <div><h3 class="text-base font-bold text-ink">Create Appraisal</h3><p class="text-xs text-ink-muted">Admin-created appraisal for any user</p></div>
            </div>
            <button onclick="document.getElementById('create-appraisal-modal').classList.add('hidden')" class="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-2 transition"><i class="fas fa-times"></i></button>
        </div>
        <div class="flex-1 overflow-y-auto px-6 py-5">
            <form method="POST" action="">
                <input type="hidden" name="action" value="admin_create">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div class="sm:col-span-1">
                        <label class="block text-xs font-medium text-ink-muted mb-1">User *</label>
                        <select name="user_id" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500">
                            <option value="">Select user...</option>
                            <?php foreach($activeUsers as $u): ?>
                            <option value="<?= $u['user_id'] ?>"><?= htmlspecialchars($u['name'],ENT_QUOTES,'UTF-8',false) ?> (<?= ucfirst(str_replace('_',' ',$u['user_type'])) ?>)</option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-ink-muted mb-1">Quarter</label>
                        <select name="quarter" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                            <option value="Q1">Q1 (Jan-Mar)</option>
                            <option value="Q2">Q2 (Apr-Jun)</option>
                            <option value="Q3" selected>Q3 (Jul-Sep)</option>
                            <option value="Q4">Q4 (Oct-Dec)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-ink-muted mb-1">Year</label>
                        <input type="number" name="year" value="<?= date('Y') ?>" min="2020" max="2030" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                    </div>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <?php foreach($ratingCategories as $key=>$label): ?>
                    <div>
                        <label class="block text-xs font-medium text-ink-muted mb-1"><?= $label ?> *</label>
                        <select name="manager_rating_<?= $key ?>" required class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm">
                            <option value="">Rate...</option>
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Good</option>
                            <option value="3">3 - Average</option>
                            <option value="2">2 - Below Avg</option>
                            <option value="1">1 - Poor</option>
                        </select>
                    </div>
                    <?php endforeach; ?>
                </div>
                <div class="mb-4">
                    <label class="block text-xs font-medium text-ink-muted mb-1">Achievements</label>
                    <textarea name="achievements" rows="2" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm" placeholder="Key achievements this quarter..."></textarea>
                </div>
                <div class="mb-4">
                    <label class="block text-xs font-medium text-ink-muted mb-1">Challenges</label>
                    <textarea name="challenges" rows="2" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm" placeholder="Challenges faced..."></textarea>
                </div>
                <div class="mb-5">
                    <label class="block text-xs font-medium text-ink-muted mb-1">Manager Comments</label>
                    <textarea name="manager_comments" rows="2" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm" placeholder="Feedback and areas of improvement..."></textarea>
                </div>
                <div class="flex justify-end gap-3">
                    <button type="button" onclick="document.getElementById('create-appraisal-modal').classList.add('hidden')" class="px-4 py-2 border border-hairline bg-surface-2 text-ink-muted rounded-lg text-sm">Cancel</button>
                    <button type="submit" class="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition"><i class="fas fa-save mr-1"></i> Save Appraisal</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
document.addEventListener('keydown', e => { if(e.key==='Escape') document.getElementById('create-appraisal-modal').classList.add('hidden'); });
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
