<?php
$pageTitle = 'Leaderboard';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
$pdo = getDBConnection();

$userId = $_SESSION['user_id'];
$userType = $_SESSION['user_type'] ?? '';
$currentMonth = date('n');
$currentYear = date('Y');
$monthName = date('F Y');

// Build leaderboard data
$leaderboardData = [];

// Campus Saarthi leaderboard: ranked by lead count and conversions
try {
    $stmt = $pdo->prepare("SELECT
        u.user_id, u.name, u.user_type,
        COUNT(l.id) as total_leads,
        SUM(CASE WHEN l.status = 'won' THEN 1 ELSE 0 END) as conversions,
        (COUNT(l.id) * 2 + SUM(CASE WHEN l.status = 'won' THEN 5 ELSE 0 END)) as score
        FROM users u
        LEFT JOIN leads l ON l.campus_saarthi_id = u.user_id
            AND MONTH(l.submitted_date) = ? AND YEAR(l.submitted_date) = ?
        WHERE u.user_type = 'campus_saarthi' AND u.status = 'active'
        GROUP BY u.user_id, u.name, u.user_type
        HAVING score > 0
        ORDER BY score DESC
        LIMIT 50");
    $stmt->execute([$currentMonth, $currentYear]);
    $csLeaderboard = $stmt->fetchAll();
} catch (Exception $e) {
    $csLeaderboard = [];
}

// Other user types: ranked by attendance + task completion
try {
    $stmt = $pdo->prepare("SELECT
        u.user_id, u.name, u.user_type,
        COALESCE(att.attendance_days, 0) as attendance_days,
        COALESCE(tsk.tasks_completed, 0) as tasks_completed,
        (COALESCE(att.attendance_days, 0) * 2 + COALESCE(tsk.tasks_completed, 0) * 3) as score
        FROM users u
        LEFT JOIN (
            SELECT user_id, COUNT(*) as attendance_days
            FROM attendance
            WHERE MONTH(date) = ? AND YEAR(date) = ? AND status = 'completed'
            GROUP BY user_id
        ) att ON att.user_id = u.user_id
        LEFT JOIN (
            SELECT assigned_to, COUNT(*) as tasks_completed
            FROM tasks
            WHERE status = 'completed' AND MONTH(updated_at) = ? AND YEAR(updated_at) = ?
            GROUP BY assigned_to
        ) tsk ON tsk.assigned_to = u.user_id
        WHERE u.user_type != 'campus_saarthi' AND u.user_type != 'admin' AND u.status = 'active'
        HAVING score > 0
        ORDER BY score DESC
        LIMIT 50");
    $stmt->execute([$currentMonth, $currentYear, $currentMonth, $currentYear]);
    $otherLeaderboard = $stmt->fetchAll();
} catch (Exception $e) {
    $otherLeaderboard = [];
}

// Combine and assign ranks
$allEntries = array_merge($csLeaderboard, $otherLeaderboard);
usort($allEntries, function($a, $b) { return $b['score'] - $a['score']; });

// Assign ranks
$rank = 0;
$prevScore = null;
foreach ($allEntries as &$entry) {
    $rank++;
    if ($prevScore !== null && $entry['score'] == $prevScore) {
        $entry['rank'] = $allEntries[$rank - 2]['rank'];
    } else {
        $entry['rank'] = $rank;
    }
    $prevScore = $entry['score'];

    // Badge assignment
    if ($entry['rank'] <= 3) {
        $entry['badge'] = 'Gold';
        $entry['badge_class'] = 'bg-yellow-100 text-yellow-700 border-yellow-300';
        $entry['badge_icon'] = 'fa-trophy text-yellow-500';
    } elseif ($entry['rank'] <= 10) {
        $entry['badge'] = 'Silver';
        $entry['badge_class'] = 'bg-surface-2 text-ink-muted border-hairline bg-surface-2 text-ink';
        $entry['badge_icon'] = 'fa-medal text-ink-muted';
    } elseif ($entry['rank'] <= 25) {
        $entry['badge'] = 'Bronze';
        $entry['badge_class'] = 'bg-orange-50 text-orange-700 border-orange-200';
        $entry['badge_icon'] = 'fa-award text-orange-400';
    } else {
        $entry['badge'] = '';
        $entry['badge_class'] = '';
        $entry['badge_icon'] = '';
    }
}
unset($entry);

// Find current user's rank
$myRank = null;
$myEntry = null;
foreach ($allEntries as $entry) {
    if ($entry['user_id'] === $userId) {
        $myRank = $entry['rank'];
        $myEntry = $entry;
        break;
    }
}

// Days remaining in month
$daysInMonth = (int)date('t');
$daysPassed = (int)date('j');
$daysRemaining = $daysInMonth - $daysPassed;

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex min-h-[calc(100vh-56px)]">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 dashboard-content-area p-6">

        <div class="mb-6">
            <h1 class="text-2xl font-bold text-ink"><i class="fas fa-trophy mr-2 text-amber-500"></i>Leaderboard</h1>
            <p class="text-ink-muted mt-1">Monthly performance rankings for <strong class="text-primary-600"><?= $monthName ?></strong></p>
        </div>

        <!-- Monthly Reset Indicator -->
        <div class="mb-6 bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl p-5 text-white animate-on-scroll">
            <div class="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 class="text-lg font-bold"><i class="fas fa-calendar-alt mr-2"></i><?= $monthName ?> Leaderboard</h2>
                    <p class="text-blue-100 text-sm mt-1">Resets on 1st of every month. <?= $daysRemaining ?> day<?= $daysRemaining !== 1 ? 's' : '' ?> remaining.</p>
                </div>
                <?php if ($myRank): ?>
                <div class="bg-surface-1/20 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
                    <p class="text-xs text-blue-100">Your Rank</p>
                    <p class="text-3xl font-bold">#<?= $myRank ?></p>
                    <?php if ($myEntry['badge']): ?>
                        <span class="text-xs font-semibold"><?= $myEntry['badge'] ?></span>
                    <?php endif; ?>
                </div>
                <?php else: ?>
                <div class="bg-surface-1/20 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
                    <p class="text-xs text-blue-100">Your Rank</p>
                    <p class="text-lg font-bold">Not Ranked</p>
                    <p class="text-xs text-blue-200">Start earning points!</p>
                </div>
                <?php endif; ?>
            </div>
        </div>

        <!-- Badge Legend -->
        <div class="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-on-scroll">
            <div class="flex items-center space-x-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
                <i class="fas fa-trophy text-yellow-500 text-xl"></i>
                <div>
                    <p class="text-sm font-bold text-yellow-800">Gold Badge</p>
                    <p class="text-xs text-yellow-600">Top 3 Performers</p>
                </div>
            </div>
            <div class="flex items-center space-x-3 bg-surface-2 border border-hairline rounded-xl px-4 py-3">
                <i class="fas fa-medal text-ink-muted text-xl"></i>
                <div>
                    <p class="text-sm font-bold text-ink-muted">Silver Badge</p>
                    <p class="text-xs text-ink-muted">Top 4-10 Performers</p>
                </div>
            </div>
            <div class="flex items-center space-x-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                <i class="fas fa-award text-orange-400 text-xl"></i>
                <div>
                    <p class="text-sm font-bold text-orange-700">Bronze Badge</p>
                    <p class="text-xs text-orange-500">Top 11-25 Performers</p>
                </div>
            </div>
        </div>

        <!-- Top 3 Podium -->
        <?php if (count($allEntries) >= 3): ?>
        <div class="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-on-scroll">
            <?php
            $podiumOrder = [1, 0, 2]; // Silver, Gold, Bronze (center = Gold)
            $podiumColors = [
                0 => ['bg' => 'bg-yellow-50', 'border' => 'border-yellow-300', 'text' => 'text-yellow-700', 'ring' => 'ring-yellow-400', 'height' => 'pt-4', 'icon' => 'fa-crown text-yellow-500'],
                1 => ['bg' => 'bg-surface-2', 'border' => 'border-hairline bg-surface-2 text-ink', 'text' => 'text-ink-muted', 'ring' => 'ring-gray-300', 'height' => 'pt-8', 'icon' => 'fa-medal text-ink-muted'],
                2 => ['bg' => 'bg-orange-50', 'border' => 'border-orange-200', 'text' => 'text-orange-700', 'ring' => 'ring-orange-300', 'height' => 'pt-8', 'icon' => 'fa-award text-orange-400'],
            ];
            foreach ($podiumOrder as $idx):
                if (!isset($allEntries[$idx])) continue;
                $p = $allEntries[$idx];
                $c = $podiumColors[$idx];
                $userTypeLabel = ucfirst(str_replace('_', ' ', $p['user_type']));
            ?>
            <div class="<?= $c['bg'] ?> border-2 <?= $c['border'] ?> rounded-2xl p-5 text-center <?= $c['height'] ?> <?= $idx === 0 ? 'sm:order-2' : ($idx === 1 ? 'sm:order-1' : 'sm:order-3') ?>">
                <div class="relative inline-block mb-3">
                    <div class="w-16 h-16 bg-surface-1 rounded-full flex items-center justify-center ring-4 <?= $c['ring'] ?> mx-auto">
                        <span class="text-xl font-bold <?= $c['text'] ?>"><?= strtoupper(substr($p['name'], 0, 2)) ?></span>
                    </div>
                    <i class="fas <?= $c['icon'] ?> absolute -top-2 -right-2 text-lg"></i>
                </div>
                <p class="text-sm font-bold text-ink"><?= htmlspecialchars($p['name'], ENT_QUOTES, 'UTF-8', false) ?></p>
                <p class="text-xs text-ink-muted mb-2"><?= $userTypeLabel ?></p>
                <p class="text-2xl font-bold <?= $c['text'] ?>">#<?= $p['rank'] ?></p>
                <p class="text-xs text-ink-muted mt-1"><?= $p['score'] ?> points</p>
            </div>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>

        <!-- Full Leaderboard Table -->
        <div class="bg-surface-1 rounded-xl shadow-none border border-hairline animate-on-scroll">
            <div class="p-5 border-b border-hairline flex items-center justify-between">
                <h2 class="text-lg font-semibold text-ink"><i class="fas fa-list-ol mr-2 text-primary-600"></i>Full Rankings</h2>
                <span class="text-xs text-ink-muted"><?= count($allEntries) ?> participants</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-surface-2">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Rank</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Name</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">User Type</th>
                            <th class="px-4 py-3 text-center text-xs font-medium text-ink-muted uppercase">Score</th>
                            <th class="px-4 py-3 text-center text-xs font-medium text-ink-muted uppercase">Badge</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-hairline">
                        <?php if (empty($allEntries)): ?>
                            <tr>
                                <td colspan="5" class="px-4 py-8 text-center text-ink-muted">
                                    <i class="fas fa-trophy text-3xl mb-2 block"></i>
                                    No leaderboard data for this month yet. Start completing tasks to earn points!
                                </td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($allEntries as $entry):
                                $isCurrentUser = ($entry['user_id'] === $userId);
                                $rowBg = $isCurrentUser ? 'bg-primary-50 border-l-4 border-primary-500' : 'hover:bg-surface-2';
                                $rankBg = '';
                                if ($entry['rank'] === 1) $rankBg = 'bg-yellow-100 text-yellow-700';
                                elseif ($entry['rank'] === 2) $rankBg = 'bg-surface-2 text-ink-muted';
                                elseif ($entry['rank'] === 3) $rankBg = 'bg-orange-100 text-orange-700';
                                $userTypeLabel = ucfirst(str_replace('_', ' ', $entry['user_type']));
                            ?>
                            <tr class="<?= $rowBg ?> transition">
                                <td class="px-4 py-3">
                                    <?php if ($rankBg): ?>
                                        <span class="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold <?= $rankBg ?>">
                                            <?= $entry['rank'] ?>
                                        </span>
                                    <?php else: ?>
                                        <span class="text-sm font-medium text-ink-muted pl-2"><?= $entry['rank'] ?></span>
                                    <?php endif; ?>
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex items-center space-x-2">
                                        <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span class="text-primary-600 font-bold text-xs"><?= strtoupper(substr($entry['name'], 0, 2)) ?></span>
                                        </div>
                                        <span class="font-medium text-ink"><?= htmlspecialchars($entry['name'], ENT_QUOTES, 'UTF-8', false) ?></span>
                                        <?php if ($isCurrentUser): ?>
                                            <span class="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">You</span>
                                        <?php endif; ?>
                                    </div>
                                </td>
                                <td class="px-4 py-3 text-ink-muted"><?= $userTypeLabel ?></td>
                                <td class="px-4 py-3 text-center">
                                    <span class="text-sm font-bold text-ink"><?= $entry['score'] ?></span>
                                </td>
                                <td class="px-4 py-3 text-center">
                                    <?php if ($entry['badge']): ?>
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border <?= $entry['badge_class'] ?>">
                                            <i class="fas <?= $entry['badge_icon'] ?> mr-1"></i> <?= $entry['badge'] ?>
                                        </span>
                                    <?php else: ?>
                                        <span class="text-xs text-ink-muted">-</span>
                                    <?php endif; ?>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Scoring Info -->
        <div class="mt-6 bg-surface-1 rounded-xl shadow-none border border-hairline animate-on-scroll">
            <div class="p-5 border-b border-hairline">
                <h2 class="text-lg font-semibold text-ink"><i class="fas fa-info-circle mr-2 text-blue-500"></i>How Points Are Calculated</h2>
            </div>
            <div class="p-5">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div class="bg-purple-50 rounded-lg p-4">
                        <h3 class="font-semibold text-purple-800 mb-2"><i class="fas fa-graduation-cap mr-1"></i> Campus Saarthi</h3>
                        <ul class="space-y-1 text-purple-700">
                            <li><i class="fas fa-check text-xs mr-1"></i> +2 points per lead submitted</li>
                            <li><i class="fas fa-check text-xs mr-1"></i> +5 points per conversion (won)</li>
                        </ul>
                    </div>
                    <div class="bg-blue-50 rounded-lg p-4">
                        <h3 class="font-semibold text-blue-800 mb-2"><i class="fas fa-users mr-1"></i> All Other Roles</h3>
                        <ul class="space-y-1 text-blue-700">
                            <li><i class="fas fa-check text-xs mr-1"></i> +2 points per attendance day</li>
                            <li><i class="fas fa-check text-xs mr-1"></i> +3 points per task completed</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

    </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>






