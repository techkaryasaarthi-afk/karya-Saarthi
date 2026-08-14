<?php
$pageTitle = 'Leaderboard Overview';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireAdmin();

$pdo = getDBConnection();
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

$daysInMonth = (int)date('t');
$daysPassed = (int)date('j');
$daysRemaining = $daysInMonth - $daysPassed;

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex h-screen bg-surface-2 overflow-hidden">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    
    <div class="flex-1 dashboard-content-area flex flex-col min-w-0 overflow-y-auto">
        <main class="flex-1 p-4 sm:p-6 lg:p-8">
            <div class="mb-6">
                <h1 class="text-2xl font-bold text-ink"><i class="fas fa-trophy mr-2 text-amber-500"></i>Company Leaderboard</h1>
                <p class="text-ink-muted mt-1">Real-time performance rankings for <strong class="text-primary-600"><?= $monthName ?></strong>.</p>
            </div>

            <!-- Monthly Reset Indicator -->
            <div class="mb-6 bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl p-5 text-white shadow-md">
                <div class="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 class="text-xl font-bold"><i class="fas fa-calendar-alt mr-2"></i><?= $monthName ?> Leaderboard Active</h2>
                        <p class="text-blue-100 text-sm mt-1">Scores reset automatically on the 1st of every month. <?= $daysRemaining ?> day<?= $daysRemaining !== 1 ? 's' : '' ?> remaining in the current cycle.</p>
                    </div>
                    <div class="bg-surface-1/20 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
                        <p class="text-xs text-blue-100">Total Ranked Users</p>
                        <p class="text-3xl font-bold"><?= count($allEntries) ?></p>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div class="lg:col-span-2">
                    <!-- Full Leaderboard Table -->
                    <div class="bg-surface-1 rounded-xl shadow-none border border-hairline overflow-hidden">
                        <div class="p-5 border-b border-hairline flex items-center justify-between bg-surface-2">
                            <h2 class="text-lg font-semibold text-ink"><i class="fas fa-list-ol mr-2 text-primary-600"></i>Current Rankings</h2>
                        </div>
                        <div class="overflow-x-auto max-h-[600px] overflow-y-auto">
                            <table class="w-full text-sm relative">
                                <thead class="bg-surface-2 sticky top-0 z-10 shadow-none">
                                    <tr>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Rank</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Name</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Role</th>
                                        <th class="px-4 py-3 text-center text-xs font-medium text-ink-muted uppercase">Score</th>
                                        <th class="px-4 py-3 text-center text-xs font-medium text-ink-muted uppercase">Badge</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-hairline">
                                    <?php if (empty($allEntries)): ?>
                                        <tr>
                                            <td colspan="5" class="px-4 py-12 text-center text-ink-muted">
                                                <i class="fas fa-trophy text-4xl mb-3 block opacity-20"></i>
                                                <p>No leaderboard data for this month yet.</p>
                                            </td>
                                        </tr>
                                    <?php else: ?>
                                        <?php foreach ($allEntries as $entry):
                                            $rankBg = '';
                                            if ($entry['rank'] === 1) $rankBg = 'bg-yellow-100 text-yellow-700';
                                            elseif ($entry['rank'] === 2) $rankBg = 'bg-surface-2 text-ink-muted border border-hairline';
                                            elseif ($entry['rank'] === 3) $rankBg = 'bg-orange-100 text-orange-700';
                                        ?>
                                        <tr class="hover:bg-surface-2 transition">
                                            <td class="px-4 py-3">
                                                <?php if ($rankBg): ?>
                                                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold <?= $rankBg ?>">
                                                        <?= $entry['rank'] ?>
                                                    </span>
                                                <?php else: ?>
                                                    <span class="text-sm font-medium text-ink-muted pl-2"><?= $entry['rank'] ?></span>
                                                <?php endif; ?>
                                            </td>
                                            <td class="px-4 py-3 font-medium text-ink"><?= htmlspecialchars($entry['name'], ENT_QUOTES, 'UTF-8', false) ?></td>
                                            <td class="px-4 py-3 text-ink-muted text-xs"><?= ucfirst(str_replace('_', ' ', $entry['user_type'])) ?></td>
                                            <td class="px-4 py-3 text-center">
                                                <span class="text-sm font-bold text-primary-700"><?= $entry['score'] ?></span>
                                            </td>
                                            <td class="px-4 py-3 text-center">
                                                <?php if ($entry['badge']): ?>
                                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border <?= $entry['badge_class'] ?>">
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
                </div>

                <div class="lg:col-span-1 space-y-6">
                    <!-- Scoring Info -->
                    <div class="bg-surface-1 rounded-xl shadow-none border border-hairline">
                        <div class="p-5 border-b border-hairline bg-surface-2">
                            <h2 class="text-lg font-semibold text-ink"><i class="fas fa-info-circle mr-2 text-blue-500"></i>Scoring Logic</h2>
                        </div>
                        <div class="p-5 space-y-4 text-sm">
                            <div class="bg-purple-50 rounded-lg p-4 border border-purple-100">
                                <h3 class="font-bold text-purple-800 mb-2">Campus Saarthi</h3>
                                <ul class="space-y-1.5 text-purple-700">
                                    <li><i class="fas fa-plus text-xs mr-2 opacity-50"></i>2 points per lead submitted</li>
                                    <li><i class="fas fa-plus text-xs mr-2 opacity-50"></i>5 points per conversion (won)</li>
                                </ul>
                            </div>
                            <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                <h3 class="font-bold text-blue-800 mb-2">All Other Roles</h3>
                                <ul class="space-y-1.5 text-blue-700">
                                    <li><i class="fas fa-plus text-xs mr-2 opacity-50"></i>2 points per attendance day</li>
                                    <li><i class="fas fa-plus text-xs mr-2 opacity-50"></i>3 points per task completed</li>
                                </ul>
                            </div>
                            <p class="text-xs text-ink-muted text-center pt-2">Leaderboard data is generated automatically based on user activity.</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
