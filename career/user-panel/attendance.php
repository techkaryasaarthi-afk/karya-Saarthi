<?php
$pageTitle = 'Attendance';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
date_default_timezone_set('Asia/Kolkata');

$pdo = getDBConnection();
$userId = $_SESSION['user_id'];
$userType = $_SESSION['user_type'];
$today = date('Y-m-d');

if ($userType === 'admin') {
    header('Location: ' . BASE_PATH . '/admin/attendance.php');
    exit;
}

// Today's attendance sessions
$stmt = $pdo->prepare("SELECT * FROM attendance WHERE user_id = ? AND date = ? ORDER BY start_time ASC");
$stmt->execute([$userId, $today]);
$todaySessions = $stmt->fetchAll();

$todayTotalMinutes = 0;
$todayAttendance = null;
$isPaused = false;

foreach ($todaySessions as $session) {
    $todayTotalMinutes += $session['duration_minutes'];
    if ($session['status'] === 'working' || $session['status'] === 'paused') {
        $todayAttendance = $session;
        $isPaused = ($session['status'] === 'paused');
    }
}

// Recent attendance (last 30 days)
$stmt = $pdo->prepare("SELECT * FROM attendance WHERE user_id = ? ORDER BY date DESC LIMIT 30");
$stmt->execute([$userId]);
$attendanceHistory = $stmt->fetchAll();

// This month stats
$stmt = $pdo->prepare("SELECT
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as present_days,
    COUNT(CASE WHEN status = 'working' THEN 1 END) as working_days,
    COALESCE(SUM(duration_minutes), 0) as total_minutes,
    COALESCE(AVG(CASE WHEN duration_minutes > 0 THEN duration_minutes END), 0) as avg_minutes
    FROM attendance WHERE user_id = ? AND MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())");
$stmt->execute([$userId]);
$monthStats = $stmt->fetch();

// This week stats
$stmt = $pdo->prepare("SELECT
    COALESCE(SUM(duration_minutes), 0) as week_minutes
    FROM attendance WHERE user_id = ? AND YEARWEEK(date, 1) = YEARWEEK(CURDATE(), 1)");
$stmt->execute([$userId]);
$weekStats = $stmt->fetch();

require_once __DIR__ . '/../includes/header.php';
?>
<div class="flex min-h-[calc(100vh-56px)]">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 dashboard-content-area p-4 md:p-6 max-w-5xl pl-12 sm:pl-4 md:pl-6">
        <div class="mb-6">
            <h1 class="text-xl md:text-2xl font-bold text-ink"><i class="fas fa-clock mr-2 text-primary-600"></i>Attendance</h1>
            <p class="text-ink-muted mt-1 text-sm">Clock In/Out with real-time location tracking</p>
        </div>

        <!-- Today's Status Widget -->
        <div class="bg-surface-1 rounded-2xl shadow-none border border-hairline p-4 md:p-6 mb-6">
            <div class="flex items-center justify-between mb-2">
                <h2 class="text-base md:text-lg font-semibold text-ink">Today — <?= date('l, d M Y') ?></h2>
                <span class="text-sm text-ink-muted font-mono" id="live-clock"></span>
            </div>

            <?php if (!$todayAttendance): ?>
            <!-- NOT STARTED OR READY FOR NEXT SESSION — Show CLOCK IN button -->
            <div class="text-center py-6 md:py-10">
                <div class="w-20 h-20 md:w-28 md:h-28 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-5 border-4 border-green-200">
                    <i class="fas fa-play text-green-400 text-2xl md:text-4xl"></i>
                </div>
                <?php if (count($todaySessions) > 0): ?>
                    <p class="text-ink-muted mb-1 text-base md:text-lg font-medium">Ready for another session?</p>
                    <p class="text-primary-600 font-bold mb-3">Logged <?= floor($todayTotalMinutes / 60) ?>h <?= $todayTotalMinutes % 60 ?>m today across <?= count($todaySessions) ?> session(s)</p>
                    <div class="inline-flex flex-wrap items-center justify-center gap-2 mb-5">
                        <?php foreach ($todaySessions as $idx => $s): ?>
                        <span class="text-xs bg-surface-2 border border-hairline px-3 py-1.5 rounded-lg text-ink-muted">
                            <i class="fas fa-history mr-1 text-primary-500"></i>Session <?= $idx + 1 ?>: <?= date('h:i A', strtotime($s['start_time'])) ?> - <?= $s['end_time'] ? date('h:i A', strtotime($s['end_time'])) : 'In Progress' ?> (<?= floor($s['duration_minutes'] / 60) ?>h <?= $s['duration_minutes'] % 60 ?>m)
                        </span>
                        <?php endforeach; ?>
                    </div>
                <?php else: ?>
                    <p class="text-ink-muted mb-2 text-base md:text-lg font-medium">Ready to start work?</p>
                    <p class="text-ink-muted text-xs md:text-sm mb-4 md:mb-6">Your device time & location will be recorded</p>
                <?php endif; ?>
                <div id="location-status" class="text-xs text-ink-muted mb-3 hidden">
                    <i class="fas fa-map-marker-alt text-accent-500 mr-1"></i>
                    <span id="location-text">Getting location...</span>
                </div>
                <button onclick="handleClock('start')" id="btn-start"
                        class="inline-flex items-center px-8 md:px-14 py-4 md:py-5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all text-xl md:text-2xl">
                    <i class="fas fa-play-circle mr-3"></i> CLOCK IN
                </button>
            </div>

            <?php elseif ($todayAttendance['status'] === 'working' || $todayAttendance['status'] === 'paused'): ?>
            <!-- WORKING or PAUSED — Show timer + buttons -->
            <div class="text-center py-4 md:py-6">
                <div class="flex items-center justify-center mb-4">
                    <?php if ($isPaused): ?>
                    <span class="inline-flex items-center px-4 md:px-5 py-2 rounded-full text-sm font-bold bg-amber-100 text-amber-700 shadow-none">
                        <span class="w-3 h-3 bg-amber-500 rounded-full mr-2 animate-pulse"></span> PAUSED — Break
                    </span>
                    <?php else: ?>
                    <span class="inline-flex items-center px-4 md:px-5 py-2 rounded-full text-sm font-bold bg-green-100 text-green-700 shadow-none">
                        <span class="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span> WORKING
                    </span>
                    <?php endif; ?>
                </div>
                <p class="text-sm text-ink-muted mb-1">Clocked in at</p>
                <p class="text-lg md:text-xl font-bold text-ink mb-3 md:mb-5"><?= date('h:i:s A', strtotime($todayAttendance['start_time'])) ?></p>

                <?php if ($todayAttendance['clock_in_lat']): ?>
                <p class="text-xs text-ink-muted mb-3">
                    <i class="fas fa-map-marker-alt text-accent-500 mr-1"></i>
                    <?= htmlspecialchars($todayAttendance['clock_in_address'] ?? 'Location recorded', ENT_QUOTES, 'UTF-8', false) ?>
                </p>
                <?php endif; ?>

                <?php if (!$isPaused): ?>
                <div class="text-4xl md:text-6xl font-mono font-bold text-primary-600 my-4 md:my-6 tracking-wider" id="work-timer"
                     data-start="<?= htmlspecialchars($todayAttendance['start_time'], ENT_QUOTES, 'UTF-8', false) ?>"
                     data-paused="<?= (int)($todayAttendance['total_paused_minutes'] ?? 0) ?>">
                    00:00:00
                </div>
                <p class="text-xs text-ink-muted mb-4">Timer running... (Breaks: <?= ($todayAttendance['total_paused_minutes'] ?? 0) ?>m deducted)</p>
                <?php else: ?>
                <div class="text-4xl md:text-6xl font-mono font-bold text-amber-500 my-4 md:my-6 tracking-wider animate-pulse" id="break-timer"
                     data-pause-start="<?= htmlspecialchars($todayAttendance['pause_time'] ?? date('Y-m-d H:i:s'), ENT_QUOTES, 'UTF-8', false) ?>">
                    ⏸ 00:00:00
                </div>
                <p class="text-xs text-ink-muted mb-4">Break started at <?= date('h:i A', strtotime($todayAttendance['pause_time'])) ?> (Total past breaks: <?= ($todayAttendance['total_paused_minutes'] ?? 0) ?>m)</p>
                <?php endif; ?>

                <div id="location-status" class="text-xs text-ink-muted mb-3 hidden">
                    <i class="fas fa-map-marker-alt text-accent-500 mr-1"></i>
                    <span id="location-text">Getting location...</span>
                </div>

                <div class="flex flex-wrap items-center justify-center gap-3">
                    <?php if ($isPaused): ?>
                    <button onclick="handleClock('resume')" id="btn-resume"
                            class="inline-flex items-center px-8 md:px-12 py-4 md:py-5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all text-xl md:text-2xl">
                        <i class="fas fa-play-circle mr-3"></i> RESUME
                    </button>
                    <button onclick="showWorkSummaryModal()" id="btn-stop"
                            class="inline-flex items-center px-6 md:px-10 py-4 md:py-5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg md:text-xl">
                        <i class="fas fa-stop-circle mr-3"></i> CLOCK OUT
                    </button>
                    <?php else: ?>
                    <button onclick="handleClock('pause')" id="btn-pause"
                            class="inline-flex items-center px-6 md:px-10 py-4 md:py-5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg md:text-xl">
                        <i class="fas fa-pause-circle mr-3"></i> PAUSE
                    </button>
                    <button onclick="showWorkSummaryModal()" id="btn-stop"
                            class="inline-flex items-center px-6 md:px-10 py-4 md:py-5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg md:text-xl">
                        <i class="fas fa-stop-circle mr-3"></i> CLOCK OUT
                    </button>
                    <?php endif; ?>
                </div>
                <p class="text-xs text-ink-muted mt-3"><?= $isPaused ? 'Click Resume to continue working or Clock Out to end your day' : 'Pause for breaks • Clock Out to end your day' ?></p>
            </div>

            <?php endif; ?>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-3 md:p-4">
                <div class="flex items-center gap-2 md:gap-3">
                    <div class="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-lg flex items-center justify-center"><i class="fas fa-calendar-check text-green-600 text-sm md:text-base"></i></div>
                    <div><p class="text-xs text-ink-muted">This Month</p><p class="text-lg md:text-xl font-bold text-ink"><?= ($monthStats['present_days'] ?? 0) + ($monthStats['working_days'] ?? 0) ?> days</p></div>
                </div>
            </div>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-3 md:p-4">
                <div class="flex items-center gap-2 md:gap-3">
                    <div class="w-8 h-8 md:w-10 md:h-10 bg-primary-100 rounded-lg flex items-center justify-center"><i class="fas fa-hourglass-half text-primary-600 text-sm md:text-base"></i></div>
                    <div><p class="text-xs text-ink-muted">Total Hours</p><p class="text-lg md:text-xl font-bold text-primary-600"><?= floor(($monthStats['total_minutes'] ?? 0) / 60) ?>h <?= ($monthStats['total_minutes'] ?? 0) % 60 ?>m</p></div>
                </div>
            </div>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-3 md:p-4">
                <div class="flex items-center gap-2 md:gap-3">
                    <div class="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center"><i class="fas fa-chart-bar text-blue-600 text-sm md:text-base"></i></div>
                    <div><p class="text-xs text-ink-muted">Avg/Day</p><p class="text-lg md:text-xl font-bold text-blue-600"><?= ($monthStats['avg_minutes'] ?? 0) > 0 ? round($monthStats['avg_minutes'] / 60, 1) : '0' ?>h</p></div>
                </div>
            </div>
            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-3 md:p-4">
                <div class="flex items-center gap-2 md:gap-3">
                    <div class="w-8 h-8 md:w-10 md:h-10 bg-accent-100 rounded-lg flex items-center justify-center"><i class="fas fa-fire text-accent-600 text-sm md:text-base"></i></div>
                    <div><p class="text-xs text-ink-muted">This Week</p><p class="text-lg md:text-xl font-bold text-accent-600"><?= floor(($weekStats['week_minutes'] ?? 0) / 60) ?>h <?= ($weekStats['week_minutes'] ?? 0) % 60 ?>m</p></div>
                </div>
            </div>
        </div>

        <!-- Attendance History -->
        <div class="bg-surface-1 rounded-2xl shadow-none border border-hairline">
            <div class="p-4 md:p-5 border-b border-hairline flex justify-between items-center">
                <h2 class="text-base md:text-lg font-semibold text-ink"><i class="fas fa-history mr-2 text-primary-600"></i>Attendance Log</h2>
                <span class="text-xs text-ink-muted">Last 30 days</span>
            </div>

            <!-- Mobile Card View -->
            <div class="md:hidden divide-y divide-hairline">
                <?php if (empty($attendanceHistory)): ?>
                    <div class="px-4 py-10 text-center text-ink-muted">
                        <i class="fas fa-calendar-times text-4xl mb-3 block"></i>No records yet.
                    </div>
                <?php else: ?>
                    <?php foreach ($attendanceHistory as $att):
                        $sc = ['completed'=>['bg-green-100 text-green-700','fa-check-circle','Completed'],'working'=>['bg-blue-100 text-blue-700','fa-spinner fa-spin','Working'],'paused'=>['bg-amber-100 text-amber-700','fa-pause-circle','Paused'],'absent'=>['bg-red-100 text-red-700','fa-times-circle','Absent']];
                        $s = $sc[$att['status']] ?? ['bg-surface-2 text-ink-muted','fa-question','Unknown'];
                        $isToday = ($att['date'] === $today);
                    ?>
                    <div class="p-4 <?= $isToday ? 'bg-primary-50/30' : '' ?>">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <p class="font-medium text-ink text-sm"><?= date('d M Y', strtotime($att['date'])) ?> <?php if($isToday):?><span class="text-xs text-primary-600">(Today)</span><?php endif;?></p>
                                <p class="text-xs text-ink-muted"><?= date('l', strtotime($att['date'])) ?></p>
                            </div>
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold <?= $s[0] ?>"><i class="fas <?= $s[1] ?> mr-1"></i><?= $s[2] ?></span>
                        </div>
                        <div class="flex gap-4 text-xs text-ink-muted">
                            <span><i class="fas fa-sign-in-alt text-green-400 mr-1"></i><?= $att['start_time'] ? date('h:i A', strtotime($att['start_time'])) : '-' ?></span>
                            <span><i class="fas fa-sign-out-alt text-red-400 mr-1"></i><?= $att['end_time'] ? date('h:i A', strtotime($att['end_time'])) : '-' ?></span>
                            <span class="font-semibold">
                                <?php if($att['duration_minutes']>0): echo floor($att['duration_minutes']/60).'h '.($att['duration_minutes']%60).'m';
                                elseif($att['status']==='working'): ?><span class="text-blue-600">In progress</span><?php else: echo '-'; endif; ?>
                            </span>
                        </div>
                        <?php if ($att['clock_in_lat']): ?>
                        <p class="text-xs text-ink-muted mt-1"><i class="fas fa-map-marker-alt text-accent-500"></i> Location recorded</p>
                        <?php endif; ?>
                        <?php if (!empty($att['work_summary'])): ?>
                        <div class="mt-2 bg-indigo-50 rounded-lg p-2">
                            <p class="text-xs text-indigo-700"><i class="fas fa-clipboard-check mr-1"></i> <?= htmlspecialchars(mb_substr($att['work_summary'], 0, 100)) ?><?= mb_strlen($att['work_summary']) > 100 ? '...' : '' ?></p>
                        </div>
                        <?php endif; ?>
                    </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>

            <!-- Desktop Table View -->
            <div class="hidden md:block overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-surface-2">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase">Date</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase">Day</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase">Clock In</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase">Clock Out</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase">Duration</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase">Location</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase">Work Done</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-hairline">
                        <?php if (empty($attendanceHistory)): ?>
                            <tr><td colspan="7" class="px-4 py-10 text-center text-ink-muted">
                                <i class="fas fa-calendar-times text-4xl mb-3 block"></i>No records yet.
                            </td></tr>
                        <?php else: ?>
                            <?php foreach ($attendanceHistory as $att):
                                $sc = ['completed'=>['bg-green-100 text-green-700','fa-check-circle','Completed'],'working'=>['bg-blue-100 text-blue-700','fa-spinner fa-spin','Working'],'paused'=>['bg-amber-100 text-amber-700','fa-pause-circle','Paused'],'absent'=>['bg-red-100 text-red-700','fa-times-circle','Absent']];
                                $s = $sc[$att['status']] ?? ['bg-surface-2 text-ink-muted','fa-question','Unknown'];
                                $isToday = ($att['date'] === $today);
                            ?>
                            <tr class="hover:bg-surface-2 <?= $isToday ? 'bg-primary-50/30' : '' ?>">
                                <td class="px-4 py-3 font-medium text-ink"><?= date('d M Y', strtotime($att['date'])) ?><?php if($isToday):?><span class="text-xs text-primary-600 ml-1">(Today)</span><?php endif;?></td>
                                <td class="px-4 py-3 text-ink-muted"><?= date('l', strtotime($att['date'])) ?></td>
                                <td class="px-4 py-3 text-ink-muted font-medium"><?= $att['start_time'] ? date('h:i:s A', strtotime($att['start_time'])) : '-' ?></td>
                                <td class="px-4 py-3 text-ink-muted font-medium"><?= $att['end_time'] ? date('h:i:s A', strtotime($att['end_time'])) : '-' ?></td>
                                <td class="px-4 py-3 font-semibold <?= ($att['duration_minutes']??0)>=480?'text-green-600':'text-ink-muted' ?>">
                                    <?php if($att['duration_minutes']>0): echo floor($att['duration_minutes']/60).'h '.($att['duration_minutes']%60).'m';
                                    elseif($att['status']==='working'): ?><span class="text-blue-600">In progress...</span><?php else: echo '-'; endif; ?>
                                </td>
                                <td class="px-4 py-3 text-xs text-ink-muted">
                                    <?php if ($att['clock_in_lat'] ?? null): ?>
                                        <a href="https://maps.google.com/?q=<?= $att['clock_in_lat'] ?>,<?= $att['clock_in_lng'] ?>" target="_blank" class="text-accent-600 hover:text-accent-700">
                                            <i class="fas fa-map-marker-alt mr-1"></i>View
                                        </a>
                                    <?php else: ?>
                                        -
                                    <?php endif; ?>
                                </td>
                                <td class="px-4 py-3 text-xs text-ink-muted max-w-xs">
                                    <?php if (!empty($att['work_summary'])): ?>
                                        <span class="cursor-pointer hover:text-primary-600" title="<?= htmlspecialchars($att['work_summary'], ENT_QUOTES, 'UTF-8', false) ?>"><?= htmlspecialchars(mb_substr($att['work_summary'], 0, 50)) ?><?= mb_strlen($att['work_summary']) > 50 ? '...' : '' ?></span>
                                    <?php else: ?>
                                        <span class="text-ink-muted opacity-50">-</span>
                                    <?php endif; ?>
                                </td>
                                <td class="px-4 py-3"><span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold <?= $s[0] ?>"><i class="fas <?= $s[1] ?> mr-1"></i><?= $s[2] ?></span></td>
                            </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<!-- Work Summary Modal (shown on Clock Out) -->
<div id="workSummaryModal" class="fixed inset-0 z-[9999] hidden">
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
    <div class="relative flex items-center justify-center min-h-screen p-4">
        <div class="bg-surface-1 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <!-- Header -->
            <div class="bg-gradient-to-r from-red-600 to-orange-500 px-6 py-5 text-white">
                <h2 class="text-lg font-bold"><i class="fas fa-clipboard-check mr-2"></i>Work Summary — Before Clock Out</h2>
                <p class="text-sm text-red-100 mt-1">Please describe what you worked on today. This is mandatory.</p>
            </div>
            <!-- Body -->
            <div class="px-6 py-5">
                <div class="mb-4">
                    <label class="block text-sm font-semibold text-ink-muted mb-2">What tasks did you complete today? *</label>
                    <textarea id="workSummaryText" rows="4" maxlength="2000" required
                        class="w-full border border-hairline bg-surface-2 text-ink rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                        placeholder="Example:&#10;- Completed 3 client project deliverables&#10;- Attended team meeting and took notes&#10;- Updated the marketing dashboard&#10;- Responded to 15 support emails"></textarea>
                    <div class="flex justify-between mt-1">
                        <p id="summaryError" class="text-xs text-red-400 hidden"><i class="fas fa-exclamation-circle mr-1"></i>Please write at least 20 characters</p>
                        <p class="text-xs text-ink-muted text-right"><span id="charCount">0</span>/2000</p>
                    </div>
                </div>

                <div class="mb-4">
                    <label class="block text-sm font-semibold text-ink-muted mb-2">Quick Tags <span class="text-ink-muted font-normal">(click to add)</span></label>
                    <div class="flex flex-wrap gap-2" id="quickTags">
                        <?php
                        $tags = ['Client Delivery','Meeting','Report Writing','Research','Design Work','Code/Development','Data Entry','Marketing','Content Writing','Calling','Social Media','Training','Admin Work','Support/Tickets'];
                        foreach ($tags as $tag): ?>
                        <button type="button" onclick="addTag('<?= $tag ?>')" class="px-3 py-1.5 bg-surface-2 hover:bg-primary-100 hover:text-primary-700 text-ink-muted rounded-full text-xs font-medium transition"><?= $tag ?></button>
                        <?php endforeach; ?>
                    </div>
                </div>

                <div class="flex gap-3">
                    <button onclick="submitClockOut()" id="btn-submit-clockout"
                        class="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition">
                        <i class="fas fa-stop-circle mr-2"></i>Submit & Clock Out
                    </button>
                    <button onclick="closeWorkSummaryModal()" class="px-4 py-3 border border-hairline bg-surface-2 text-ink hover:bg-surface-2 text-ink-muted rounded-xl text-sm font-medium transition">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// Export PHP BASE_PATH to JavaScript
const BASE_PATH = <?= json_encode(BASE_PATH) ?>;

// Live clock
setInterval(()=>{const e=document.getElementById('live-clock');if(e)e.textContent=new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true})},1000);

// Work timer
const timerEl = document.getElementById('work-timer');
if (timerEl) {
    // Append IST offset so browser parses as correct timezone regardless of local settings
    const startTimeStr = (timerEl.dataset.start || '').replace(' ', 'T') + '+05:30';
    const startTime = new Date(startTimeStr).getTime();
    const pausedMins = parseInt(timerEl.dataset.paused || '0');
    setInterval(()=>{
        const diff = Math.max(0, Math.floor((Date.now()-startTime)/1000) - (pausedMins * 60));
        timerEl.textContent = String(Math.floor(diff/3600)).padStart(2,'0')+':'+String(Math.floor((diff%3600)/60)).padStart(2,'0')+':'+String(diff%60).padStart(2,'0');
    }, 1000);
}

// Break timer
const breakEl = document.getElementById('break-timer');
if (breakEl) {
    // Append IST offset so browser parses as correct timezone
    const pauseTimeStr = (breakEl.dataset.pauseStart || '').replace(' ', 'T') + '+05:30';
    const pauseTime = new Date(pauseTimeStr).getTime();
    setInterval(()=>{
        const diff = Math.max(0, Math.floor((Date.now() - pauseTime)/1000));
        breakEl.textContent = '⏸ ' + String(Math.floor(diff/3600)).padStart(2,'0')+':'+String(Math.floor((diff%3600)/60)).padStart(2,'0')+':'+String(diff%60).padStart(2,'0');
    }, 1000);
}

// Character counter for work summary
const summaryInput = document.getElementById('workSummaryText');
if (summaryInput) {
    summaryInput.addEventListener('input', function() {
        document.getElementById('charCount').textContent = this.value.length;
        document.getElementById('summaryError').classList.toggle('hidden', this.value.trim().length >= 20 || this.value.trim().length === 0);
    });
}

// Add quick tag to summary
function addTag(tag) {
    const ta = document.getElementById('workSummaryText');
    if (!ta) return;
    const prefix = ta.value.trim() ? '\n- ' : '- ';
    ta.value += prefix + tag;
    ta.dispatchEvent(new Event('input'));
    ta.focus();
}

// Show work summary modal (on Clock Out click)
function showWorkSummaryModal() {
    document.getElementById('workSummaryModal').classList.remove('hidden');
    document.getElementById('workSummaryText').focus();
}
function closeWorkSummaryModal() {
    document.getElementById('workSummaryModal').classList.add('hidden');
}

// Submit clock out with work summary
function submitClockOut() {
    const summary = document.getElementById('workSummaryText').value.trim();
    if (summary.length < 20) {
        document.getElementById('summaryError').classList.remove('hidden');
        document.getElementById('workSummaryText').focus();
        return;
    }
    // Disable submit button to prevent double-submit
    const submitBtn = document.getElementById('btn-submit-clockout');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
    }
    // Store summary and proceed to GPS + clock out
    window._workSummary = summary;
    closeWorkSummaryModal();
    handleClock('stop');
}

// Helper to get button element by action
function getBtnByAction(action) {
    const btnMap = {start:'btn-start', stop:'btn-stop', pause:'btn-pause', resume:'btn-resume'};
    return document.getElementById(btnMap[action]);
}

// Reset button styling on error/cancel
function resetButton(action) {
    const btn = getBtnByAction(action);
    if (!btn) return;
    btn.disabled = false;
    const labels = {
        start: '<i class="fas fa-play-circle mr-3"></i> CLOCK IN',
        stop: '<i class="fas fa-stop-circle mr-3"></i> CLOCK OUT',
        pause: '<i class="fas fa-pause-circle mr-3"></i> PAUSE',
        resume: '<i class="fas fa-play-circle mr-3"></i> RESUME'
    };
    btn.innerHTML = labels[action] || 'Submit';
}

// Clock In / Clock Out / Pause / Resume with GPS + Device Time
function handleClock(action) {
    const btn = getBtnByAction(action);
    if (!btn) return;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-3"></i> Processing...';

    const statusEl = document.getElementById('location-status');
    const textEl = document.getElementById('location-text');
    if (statusEl) statusEl.classList.remove('hidden');

    const deviceTime = new Date().toISOString();

    if (action === 'pause' || action === 'resume') {
        // No GPS needed for pause/resume
        sendClockRequest(action, deviceTime, null, null, null);
    } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                if (textEl) textEl.textContent = 'Location found! Submitting...';
                sendClockRequest(action, deviceTime, pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
            },
            (err) => {
                if (textEl) textEl.textContent = 'Location unavailable — submitting without GPS...';
                sendClockRequest(action, deviceTime, null, null, null);
            },
            { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
        );
    } else {
        if (textEl) textEl.textContent = 'GPS not supported';
        sendClockRequest(action, deviceTime, null, null, null);
    }
}

function sendClockRequest(action, deviceTime, lat, lng, accuracy) {
    const btn = getBtnByAction(action);
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-3"></i> Submitting...';
    }

    const params = {
        action: action,
        device_time: deviceTime,
        latitude: lat ?? '',
        longitude: lng ?? '',
        accuracy: accuracy ?? ''
    };
    // Attach work summary for clock out
    if (action === 'stop' && window._workSummary) {
        params.work_summary = window._workSummary;
    }

    const apiPath = BASE_PATH + '/api/attendance.php';

    fetch(apiPath, {
        method: 'POST',
        headers: {'Content-Type':'application/x-www-form-urlencoded'},
        body: new URLSearchParams(params).toString()
    })
    .then(r => {
        if (!r.ok) throw new Error('Server error: ' + r.status);
        return r.text();
    })
    .then(text => {
        let data;
        try {
            data = JSON.parse(text);
        } catch(e) {
            console.error('Invalid JSON response:', text);
            alert('Server error: Unexpected response. Check console for details.');
            resetButton(action);
            return;
        }
        if(data.success) {
            window._workSummary = null;
            window.location.reload();
        } else if (data.require_summary) {
            resetButton(action);
            // Re-enable the modal submit button too
            const submitBtn = document.getElementById('btn-submit-clockout');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-stop-circle mr-2"></i>Submit & Clock Out';
            }
            showWorkSummaryModal();
        } else {
            alert('Error: ' + (data.message || 'Unknown error occurred.'));
            resetButton(action);
        }
    })
    .catch((err)=>{
        console.error('Clock request failed:', err);
        alert('Network error: ' + err.message + '. Please check your connection and try again.');
        resetButton(action);
        // Re-enable modal submit button on error
        const submitBtn = document.getElementById('btn-submit-clockout');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-stop-circle mr-2"></i>Submit & Clock Out';
        }
    });
}
</script>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>






