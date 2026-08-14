<?php
$pageTitle = 'Self Appraisal';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
$pdo = getDBConnection();
$userId = $_SESSION['user_id'];

// Auto-create appraisals table if not exists
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS appraisals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(20) NOT NULL,
        quarter VARCHAR(10) NOT NULL,
        year INT NOT NULL,
        achievements TEXT,
        challenges TEXT,
        training_needed TEXT,
        goals_next_quarter TEXT,
        self_rating_quality TINYINT DEFAULT 0,
        self_rating_punctuality TINYINT DEFAULT 0,
        self_rating_teamwork TINYINT DEFAULT 0,
        self_rating_output TINYINT DEFAULT 0,
        manager_rating_quality TINYINT DEFAULT NULL,
        manager_rating_punctuality TINYINT DEFAULT NULL,
        manager_rating_teamwork TINYINT DEFAULT NULL,
        manager_rating_output TINYINT DEFAULT NULL,
        peer_rating_quality TINYINT DEFAULT NULL,
        peer_rating_punctuality TINYINT DEFAULT NULL,
        peer_rating_teamwork TINYINT DEFAULT NULL,
        peer_rating_output TINYINT DEFAULT NULL,
        manager_comments TEXT,
        peer_comments TEXT,
        status ENUM('draft','submitted','reviewed','closed') DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_quarter (user_id, quarter, year)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
} catch (Exception $e) {
    error_log("Appraisals table creation: " . $e->getMessage());
}

// Current quarter
$currentMonth = (int)date('n');
if ($currentMonth <= 3) { $currentQuarter = 'Q4'; $quarterYear = (int)date('Y') - 1; }
elseif ($currentMonth <= 6) { $currentQuarter = 'Q1'; $quarterYear = (int)date('Y'); }
elseif ($currentMonth <= 9) { $currentQuarter = 'Q2'; $quarterYear = (int)date('Y'); }
else { $currentQuarter = 'Q3'; $quarterYear = (int)date('Y'); }

$quarterLabels = ['Q1' => 'Apr - Jun', 'Q2' => 'Jul - Sep', 'Q3' => 'Oct - Dec', 'Q4' => 'Jan - Mar'];

// Handle form submission
$successMsg = '';
$errorMsg = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $achievements = sanitize($_POST['achievements'] ?? '');
        $challenges = sanitize($_POST['challenges'] ?? '');
        $training = sanitize($_POST['training_needed'] ?? '');
        $goals = sanitize($_POST['goals_next_quarter'] ?? '');
        $rQuality = max(1, min(5, (int)($_POST['rating_quality'] ?? 0)));
        $rPunctuality = max(1, min(5, (int)($_POST['rating_punctuality'] ?? 0)));
        $rTeamwork = max(1, min(5, (int)($_POST['rating_teamwork'] ?? 0)));
        $rOutput = max(1, min(5, (int)($_POST['rating_output'] ?? 0)));

        if (empty($achievements) || $rQuality < 1 || $rPunctuality < 1 || $rTeamwork < 1 || $rOutput < 1) {
            $errorMsg = 'Please fill all required fields and provide all ratings.';
        } else {
            // Check if appraisal already exists for this quarter
            $stmt = $pdo->prepare("SELECT id FROM appraisals WHERE user_id = ? AND quarter = ? AND year = ?");
            $stmt->execute([$userId, $currentQuarter, $quarterYear]);
            $existing = $stmt->fetch();

            if ($existing) {
                $stmt = $pdo->prepare("UPDATE appraisals SET achievements = ?, challenges = ?, training_needed = ?, goals_next_quarter = ?,
                    self_rating_quality = ?, self_rating_punctuality = ?, self_rating_teamwork = ?, self_rating_output = ?, status = 'submitted'
                    WHERE id = ?");
                $stmt->execute([$achievements, $challenges, $training, $goals, $rQuality, $rPunctuality, $rTeamwork, $rOutput, $existing['id']]);
            } else {
                $stmt = $pdo->prepare("INSERT INTO appraisals (user_id, quarter, year, achievements, challenges, training_needed, goals_next_quarter,
                    self_rating_quality, self_rating_punctuality, self_rating_teamwork, self_rating_output, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted')");
                $stmt->execute([$userId, $currentQuarter, $quarterYear, $achievements, $challenges, $training, $goals, $rQuality, $rPunctuality, $rTeamwork, $rOutput]);
            }
            $successMsg = 'Your self-appraisal has been submitted successfully!';
        }
    } catch (Exception $e) {
        error_log("Appraisal save error: " . $e->getMessage());
        $errorMsg = 'Something went wrong. Please try again.';
    }
}

// Fetch current quarter appraisal
try {
    $stmt = $pdo->prepare("SELECT * FROM appraisals WHERE user_id = ? AND quarter = ? AND year = ?");
    $stmt->execute([$userId, $currentQuarter, $quarterYear]);
    $currentAppraisal = $stmt->fetch();
} catch (Exception $e) {
    $currentAppraisal = null;
}

// Fetch past appraisals
try {
    $stmt = $pdo->prepare("SELECT * FROM appraisals WHERE user_id = ? ORDER BY year DESC, quarter DESC LIMIT 8");
    $stmt->execute([$userId]);
    $pastAppraisals = $stmt->fetchAll();
} catch (Exception $e) {
    $pastAppraisals = [];
}

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex min-h-[calc(100vh-56px)]">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 dashboard-content-area p-6">

        <div class="mb-6">
            <h1 class="text-2xl font-bold text-ink">Self Appraisal</h1>
            <p class="text-ink-muted mt-1">Current Quarter: <strong class="text-primary-600"><?= $currentQuarter ?> <?= $quarterYear ?></strong> (<?= $quarterLabels[$currentQuarter] ?>)</p>
        </div>

        <!-- Success / Error Messages -->
        <?php if ($successMsg): ?>
            <div class="mb-6 bg-green-500/10 border border-green-200 rounded-xl p-4 animate-on-scroll">
                <div class="flex items-center">
                    <i class="fas fa-check-circle text-green-400 mr-3"></i>
                    <p class="text-sm font-medium text-green-800"><?= $successMsg ?></p>
                </div>
            </div>
        <?php endif; ?>
        <?php if ($errorMsg): ?>
            <div class="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-on-scroll">
                <div class="flex items-center">
                    <i class="fas fa-exclamation-circle text-red-400 mr-3"></i>
                    <p class="text-sm font-medium text-red-400"><?= $errorMsg ?></p>
                </div>
            </div>
        <?php endif; ?>

        <!-- Current Quarter Status -->
        <?php if ($currentAppraisal && $currentAppraisal['status'] === 'submitted'): ?>
            <div class="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 animate-on-scroll">
                <div class="flex items-center">
                    <i class="fas fa-info-circle text-blue-500 mr-3"></i>
                    <p class="text-sm text-blue-800">Your appraisal for <strong><?= $currentQuarter ?> <?= $quarterYear ?></strong> has been submitted. You can update it until it is reviewed.</p>
                </div>
            </div>
        <?php endif; ?>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Appraisal Form -->
            <div class="lg:col-span-2">
                <?php
                $isReadOnly = ($currentAppraisal && in_array($currentAppraisal['status'], ['reviewed', 'closed']));
                ?>
                <form method="POST" class="bg-surface-1 rounded-xl shadow-none border border-hairline animate-on-scroll">
                    <div class="p-5 border-b border-hairline">
                        <h2 class="text-lg font-semibold text-ink"><i class="fas fa-edit mr-2 text-primary-600"></i>Self-Appraisal Form</h2>
                        <p class="text-xs text-ink-muted mt-1"><?= $currentQuarter ?> <?= $quarterYear ?> (<?= $quarterLabels[$currentQuarter] ?>)</p>
                    </div>
                    <div class="p-5 space-y-5">
                        <!-- Achievements -->
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Achievements This Quarter <span class="text-red-400">*</span></label>
                            <textarea name="achievements" rows="4" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="Describe your key achievements..." <?= $isReadOnly ? 'readonly' : '' ?>><?= htmlspecialchars($currentAppraisal['achievements'] ?? '', ENT_QUOTES, 'UTF-8', false) ?></textarea>
                        </div>

                        <!-- Challenges -->
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Challenges Faced</label>
                            <textarea name="challenges" rows="3" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="Describe challenges you encountered..." <?= $isReadOnly ? 'readonly' : '' ?>><?= htmlspecialchars($currentAppraisal['challenges'] ?? '', ENT_QUOTES, 'UTF-8', false) ?></textarea>
                        </div>

                        <!-- Training Needed -->
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Training Needed</label>
                            <textarea name="training_needed" rows="3" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="Any training or skills you'd like to develop..." <?= $isReadOnly ? 'readonly' : '' ?>><?= htmlspecialchars($currentAppraisal['training_needed'] ?? '', ENT_QUOTES, 'UTF-8', false) ?></textarea>
                        </div>

                        <!-- Goals -->
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Goals for Next Quarter</label>
                            <textarea name="goals_next_quarter" rows="3" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="What do you aim to achieve next quarter..." <?= $isReadOnly ? 'readonly' : '' ?>><?= htmlspecialchars($currentAppraisal['goals_next_quarter'] ?? '', ENT_QUOTES, 'UTF-8', false) ?></textarea>
                        </div>

                        <!-- Star Ratings -->
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-3">Self Rating <span class="text-red-400">*</span></label>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <?php
                                $ratingCategories = [
                                    'quality' => ['label' => 'Quality of Work', 'icon' => 'fa-gem'],
                                    'punctuality' => ['label' => 'Punctuality', 'icon' => 'fa-clock'],
                                    'teamwork' => ['label' => 'Teamwork', 'icon' => 'fa-users'],
                                    'output' => ['label' => 'Output / Productivity', 'icon' => 'fa-chart-line'],
                                ];
                                foreach ($ratingCategories as $key => $cat):
                                    $currentVal = $currentAppraisal['self_rating_' . $key] ?? 0;
                                ?>
                                <div class="bg-surface-2 rounded-lg p-3">
                                    <p class="text-xs font-medium text-ink-muted mb-2"><i class="fas <?= $cat['icon'] ?> mr-1 text-primary-500"></i> <?= $cat['label'] ?></p>
                                    <div class="star-rating flex space-x-1" data-field="rating_<?= $key ?>">
                                        <?php for ($i = 1; $i <= 5; $i++): ?>
                                            <button type="button" class="star-btn text-2xl transition <?= $i <= $currentVal ? 'text-amber-400' : 'text-ink-muted opacity-50' ?> hover:text-amber-400" data-value="<?= $i ?>" <?= $isReadOnly ? 'disabled' : '' ?>>
                                                <i class="fas fa-star"></i>
                                            </button>
                                        <?php endfor; ?>
                                        <input type="hidden" name="rating_<?= $key ?>" value="<?= $currentVal ?>">
                                    </div>
                                </div>
                                <?php endforeach; ?>
                            </div>
                        </div>

                        <?php if (!$isReadOnly): ?>
                            <div class="pt-3">
                                <button type="submit" class="w-full sm:w-auto px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-none transition">
                                    <i class="fas fa-paper-plane mr-2"></i> Submit Appraisal
                                </button>
                            </div>
                        <?php else: ?>
                            <div class="pt-3 p-3 bg-surface-2 rounded-lg text-sm text-ink-muted">
                                <i class="fas fa-lock mr-1"></i> This appraisal has been reviewed and is now read-only.
                            </div>
                        <?php endif; ?>
                    </div>
                </form>

                <!-- Manager & Peer Rating (read-only) -->
                <?php if ($currentAppraisal && ($currentAppraisal['manager_rating_quality'] || $currentAppraisal['peer_rating_quality'])): ?>
                <div class="mt-6 bg-surface-1 rounded-xl shadow-none border border-hairline animate-on-scroll">
                    <div class="p-5 border-b border-hairline">
                        <h2 class="text-lg font-semibold text-ink"><i class="fas fa-user-check mr-2 text-green-600"></i>Manager & Peer Feedback</h2>
                    </div>
                    <div class="p-5">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <?php if ($currentAppraisal['manager_rating_quality']): ?>
                            <div>
                                <h3 class="text-sm font-semibold text-ink-muted mb-3"><i class="fas fa-user-tie mr-1"></i> Manager Rating</h3>
                                <?php foreach ($ratingCategories as $key => $cat): ?>
                                <div class="flex items-center justify-between mb-2">
                                    <span class="text-xs text-ink-muted"><?= $cat['label'] ?></span>
                                    <div class="flex space-x-0.5">
                                        <?php for ($i = 1; $i <= 5; $i++): ?>
                                            <i class="fas fa-star text-sm <?= $i <= ($currentAppraisal['manager_rating_' . $key] ?? 0) ? 'text-green-400' : 'text-gray-200' ?>"></i>
                                        <?php endfor; ?>
                                    </div>
                                </div>
                                <?php endforeach; ?>
                                <?php if ($currentAppraisal['manager_comments']): ?>
                                    <p class="text-xs text-ink-muted mt-2 bg-surface-2 p-2 rounded"><?= htmlspecialchars($currentAppraisal['manager_comments'], ENT_QUOTES, 'UTF-8', false) ?></p>
                                <?php endif; ?>
                            </div>
                            <?php endif; ?>

                            <?php if ($currentAppraisal['peer_rating_quality']): ?>
                            <div>
                                <h3 class="text-sm font-semibold text-ink-muted mb-3"><i class="fas fa-users mr-1"></i> Peer Rating</h3>
                                <?php foreach ($ratingCategories as $key => $cat): ?>
                                <div class="flex items-center justify-between mb-2">
                                    <span class="text-xs text-ink-muted"><?= $cat['label'] ?></span>
                                    <div class="flex space-x-0.5">
                                        <?php for ($i = 1; $i <= 5; $i++): ?>
                                            <i class="fas fa-star text-sm <?= $i <= ($currentAppraisal['peer_rating_' . $key] ?? 0) ? 'text-blue-400' : 'text-gray-200' ?>"></i>
                                        <?php endfor; ?>
                                    </div>
                                </div>
                                <?php endforeach; ?>
                                <?php if ($currentAppraisal['peer_comments']): ?>
                                    <p class="text-xs text-ink-muted mt-2 bg-surface-2 p-2 rounded"><?= htmlspecialchars($currentAppraisal['peer_comments'], ENT_QUOTES, 'UTF-8', false) ?></p>
                                <?php endif; ?>
                            </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
                <?php endif; ?>
            </div>

            <!-- Right Column -->
            <div class="space-y-6">
                <!-- Performance Score -->
                <?php if ($currentAppraisal): ?>
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline animate-on-scroll">
                    <div class="p-5 border-b border-hairline">
                        <h2 class="text-lg font-semibold text-ink"><i class="fas fa-chart-bar mr-2 text-primary-600"></i>Performance Score</h2>
                    </div>
                    <div class="p-5 space-y-4">
                        <?php
                        foreach ($ratingCategories as $key => $cat):
                            $selfVal = $currentAppraisal['self_rating_' . $key] ?? 0;
                            $percent = ($selfVal / 5) * 100;
                            $barColor = $percent >= 80 ? 'bg-green-500' : ($percent >= 60 ? 'bg-blue-500' : ($percent >= 40 ? 'bg-amber-500' : 'bg-red-500'));
                        ?>
                        <div>
                            <div class="flex justify-between text-xs mb-1">
                                <span class="font-medium text-ink-muted"><?= $cat['label'] ?></span>
                                <span class="text-ink-muted"><?= $selfVal ?>/5</span>
                            </div>
                            <div class="w-full bg-surface-2 rounded-full h-2.5">
                                <div class="<?= $barColor ?> h-2.5 rounded-full transition-all" style="width: <?= $percent ?>%"></div>
                            </div>
                        </div>
                        <?php endforeach; ?>

                        <?php
                        $totalSelf = ($currentAppraisal['self_rating_quality'] ?? 0) + ($currentAppraisal['self_rating_punctuality'] ?? 0) + ($currentAppraisal['self_rating_teamwork'] ?? 0) + ($currentAppraisal['self_rating_output'] ?? 0);
                        $avgSelf = round($totalSelf / 4, 1);
                        $overallPercent = ($avgSelf / 5) * 100;
                        ?>
                        <hr class="border-hairline">
                        <div class="text-center">
                            <p class="text-xs text-ink-muted mb-1">Overall Self Score</p>
                            <p class="text-3xl font-bold text-primary-600"><?= $avgSelf ?><span class="text-sm text-ink-muted">/5</span></p>
                            <div class="w-full bg-surface-2 rounded-full h-3 mt-2">
                                <div class="bg-primary-500 h-3 rounded-full transition-all" style="width: <?= $overallPercent ?>%"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <?php endif; ?>

                <!-- Past Appraisals -->
                <div class="bg-surface-1 rounded-xl shadow-none border border-hairline animate-on-scroll">
                    <div class="p-5 border-b border-hairline">
                        <h2 class="text-lg font-semibold text-ink"><i class="fas fa-history mr-2 text-primary-600"></i>Past Appraisals</h2>
                    </div>
                    <div class="divide-y divide-hairline">
                        <?php if (empty($pastAppraisals)): ?>
                            <div class="p-5 text-center text-ink-muted text-sm">
                                <i class="fas fa-folder-open text-2xl mb-2 block"></i>
                                No past appraisals found.
                            </div>
                        <?php else: ?>
                            <?php foreach ($pastAppraisals as $pa):
                                $paStatusColors = ['draft' => 'bg-surface-2 text-ink-muted', 'submitted' => 'bg-blue-100 text-blue-700', 'reviewed' => 'bg-green-100 text-green-700', 'closed' => 'bg-purple-100 text-purple-700'];
                                $paAvg = round((($pa['self_rating_quality'] ?? 0) + ($pa['self_rating_punctuality'] ?? 0) + ($pa['self_rating_teamwork'] ?? 0) + ($pa['self_rating_output'] ?? 0)) / 4, 1);
                            ?>
                            <div class="p-4 hover:bg-surface-2 transition">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-sm font-semibold text-ink"><?= $pa['quarter'] ?> <?= $pa['year'] ?></p>
                                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium <?= $paStatusColors[$pa['status']] ?? 'bg-surface-2 text-ink-muted' ?> mt-1">
                                            <?= ucfirst($pa['status']) ?>
                                        </span>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-lg font-bold text-primary-600"><?= $paAvg ?></p>
                                        <p class="text-xs text-ink-muted">Self Score</p>
                                    </div>
                                </div>
                            </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// Star Rating Click Handler
document.querySelectorAll('.star-rating').forEach(function(container) {
    const buttons = container.querySelectorAll('.star-btn');
    const hiddenInput = container.querySelector('input[type="hidden"]');

    buttons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const value = parseInt(this.dataset.value);
            hiddenInput.value = value;
            buttons.forEach(function(b, idx) {
                if (idx < value) {
                    b.classList.remove('text-ink-muted opacity-50');
                    b.classList.add('text-amber-400');
                } else {
                    b.classList.remove('text-amber-400');
                    b.classList.add('text-ink-muted opacity-50');
                }
            });
        });
    });
});
</script>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>






