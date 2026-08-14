<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json');
date_default_timezone_set('Asia/Kolkata');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated. Please login.']);
    exit;
}

$userId = $_SESSION['user_id'];
$action = $_POST['action'] ?? $_GET['action'] ?? '';

try {
    $pdo = getDBConnection();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}

$today = date('Y-m-d');
$now = date('Y-m-d H:i:s');

// Auto-create table if missing and auto-add missing columns
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS attendance (
        attendance_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        start_time DATETIME,
        end_time DATETIME,
        duration_minutes INT DEFAULT 0,
        status ENUM('working', 'paused', 'completed', 'absent', 'half_day', 'late') DEFAULT 'working',
        work_mode ENUM('office', 'wfh', 'hybrid') DEFAULT 'office',
        is_late BOOLEAN DEFAULT FALSE,
        overtime_minutes INT DEFAULT 0,
        ip_address VARCHAR(45),
        device VARCHAR(255),
        device_time DATETIME NULL,
        clock_in_lat DECIMAL(10,8) NULL,
        clock_in_lng DECIMAL(11,8) NULL,
        clock_in_address TEXT NULL,
        clock_out_lat DECIMAL(10,8) NULL,
        clock_out_lng DECIMAL(11,8) NULL,
        clock_out_address TEXT NULL,
        location_accuracy VARCHAR(100) NULL,
        pause_time DATETIME NULL,
        total_paused_minutes INT DEFAULT 0,
        notes TEXT,
        work_summary TEXT,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )");

    // Add missing columns for older schemas
    $columnsToAdd = [
        "device_time DATETIME NULL",
        "clock_in_lat DECIMAL(10,8) NULL",
        "clock_in_lng DECIMAL(11,8) NULL",
        "clock_in_address TEXT NULL",
        "clock_out_lat DECIMAL(10,8) NULL",
        "clock_out_lng DECIMAL(11,8) NULL",
        "clock_out_address TEXT NULL",
        "location_accuracy VARCHAR(100) NULL",
        "work_summary TEXT NULL",
        "pause_time DATETIME NULL",
        "total_paused_minutes INT DEFAULT 0"
    ];
    
    foreach ($columnsToAdd as $col) {
        try {
            $colName = explode(' ', $col)[0];
            $pdo->exec("ALTER TABLE attendance ADD COLUMN $col");
        } catch (Exception $e) {}
    }
    
    // Ensure ENUM column status supports 'paused'
    try {
        $pdo->exec("ALTER TABLE attendance MODIFY COLUMN status ENUM('working', 'paused', 'completed', 'absent', 'half_day', 'late') DEFAULT 'working'");
    } catch (Exception $e) {}

    // Dynamically drop any unique indexes (except PRIMARY) to allow multiple sessions per day
    try {
        $stmt = $pdo->query("SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'attendance' AND NON_UNIQUE = 0 AND INDEX_NAME != 'PRIMARY'");
        if ($stmt) {
            $indexes = $stmt->fetchAll(PDO::FETCH_COLUMN);
            foreach ($indexes as $idx) {
                try {
                    $pdo->exec("ALTER TABLE attendance DROP INDEX `$idx`");
                } catch (Exception $e) {}
            }
        }
    } catch (Exception $ignore) {}
} catch (Exception $ignore) {}

// Auto-fix stuck sessions from PREVIOUS days (not today)
// These are sessions still 'working'/'paused' from a past date — they block new clock-ins
try {
    $stuckStmt = $pdo->prepare("SELECT * FROM attendance WHERE user_id = ? AND date < ? AND status IN ('working', 'paused')");
    $stuckStmt->execute([$userId, $today]);
    $stuckSessions = $stuckStmt->fetchAll();
    foreach ($stuckSessions as $stuck) {
        // Calculate duration from start to end of that day (max 24h, no GPS for clock-out)
        $stuckStart = new DateTime($stuck['start_time']);
        $stuckEnd = new DateTime($stuck['date'] . ' 23:59:59');
        $stuckDiff = $stuckStart->diff($stuckEnd);
        $stuckMins = ($stuckDiff->days * 24 * 60) + ($stuckDiff->h * 60) + $stuckDiff->i;
        $totalPausedStuck = (int)($stuck['total_paused_minutes'] ?? 0);
        if ($stuck['status'] === 'paused' && !empty($stuck['pause_time'])) {
            $pauseStartDt = new DateTime($stuck['pause_time']);
            $pauseDiff = $pauseStartDt->diff($stuckEnd);
            $totalPausedStuck += ($pauseDiff->days * 24 * 60) + ($pauseDiff->h * 60) + $pauseDiff->i;
        }
        $stuckDuration = max(0, $stuckMins - $totalPausedStuck);
        $pdo->prepare("UPDATE attendance SET status='completed', end_time=?, duration_minutes=?, pause_time=NULL, work_summary=COALESCE(work_summary,'Auto-completed: session not properly closed') WHERE attendance_id=?")->execute([
            $stuck['date'] . ' 23:59:59',
            $stuckDuration,
            $stuck['attendance_id']
        ]);
    }
} catch (Exception $ignore) {}

switch ($action) {
    case 'start':
        // Collect GPS and device time data
        $deviceTime = !empty($_POST['device_time']) ? $_POST['device_time'] : null;
        $latitude = !empty($_POST['latitude']) ? $_POST['latitude'] : null;
        $longitude = !empty($_POST['longitude']) ? $_POST['longitude'] : null;
        $accuracy = !empty($_POST['accuracy']) ? $_POST['accuracy'] : null;
        $clockInAddress = !empty($_POST['address']) ? $_POST['address'] : null;

        // Check if already working or paused today
        $stmt = $pdo->prepare("SELECT * FROM attendance WHERE user_id = ? AND date = ? AND status IN ('working', 'paused') ORDER BY start_time DESC LIMIT 1");
        $stmt->execute([$userId, $today]);
        $existing = $stmt->fetch();

        if ($existing && $existing['status'] === 'working') {
            echo json_encode(['success' => false, 'message' => 'You are already clocked in!']);
            exit;
        }
        if ($existing && $existing['status'] === 'paused') {
            echo json_encode(['success' => false, 'message' => 'You have a paused session. Please resume it instead of clocking in again.']);
            exit;
        }

        // Multiple sessions per day are allowed! Create a new session.
        try {
            $stmt = $pdo->prepare("INSERT INTO attendance (user_id, date, start_time, status, ip_address, device, device_time, clock_in_lat, clock_in_lng, clock_in_address, location_accuracy) VALUES (?, ?, ?, 'working', ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $userId,
                $today,
                $now,
                $_SERVER['REMOTE_ADDR'] ?? '',
                $_SERVER['HTTP_USER_AGENT'] ?? '',
                $deviceTime,
                $latitude,
                $longitude,
                $clockInAddress,
                $accuracy
            ]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Database error on clock in: ' . $e->getMessage()]);
            exit;
        }

        logActivity($userId, 'clock_in', 'Clocked in at ' . date('h:i:s A') . ($latitude ? " (GPS: {$latitude}, {$longitude})" : ''));

        echo json_encode([
            'success' => true,
            'message' => 'Clocked in successfully!',
            'start_time' => $now,
            'start_display' => date('h:i:s A'),
            'location' => [
                'latitude' => $latitude,
                'longitude' => $longitude,
                'accuracy' => $accuracy
            ]
        ]);
        break;

    case 'stop':
        // Collect GPS and device time data
        $deviceTime = !empty($_POST['device_time']) ? $_POST['device_time'] : null;
        $latitude = !empty($_POST['latitude']) ? $_POST['latitude'] : null;
        $longitude = !empty($_POST['longitude']) ? $_POST['longitude'] : null;
        $accuracy = !empty($_POST['accuracy']) ? $_POST['accuracy'] : null;
        $clockOutAddress = !empty($_POST['address']) ? $_POST['address'] : null;
        $workSummary = trim($_POST['work_summary'] ?? '');

        // Work summary is mandatory
        if (empty($workSummary)) {
            echo json_encode(['success' => false, 'message' => 'Work summary is required. Please describe what you worked on today before clocking out.', 'require_summary' => true]);
            exit;
        }
        if (strlen($workSummary) < 20) {
            echo json_encode(['success' => false, 'message' => 'Please provide a more detailed work summary (at least 20 characters).', 'require_summary' => true]);
            exit;
        }

        // First, try to find TODAY's active session (working or paused)
        // This prevents old stuck sessions from interfering
        $stmt = $pdo->prepare("SELECT * FROM attendance WHERE user_id = ? AND date = ? AND status IN ('working', 'paused') ORDER BY start_time DESC LIMIT 1");
        $stmt->execute([$userId, $today]);
        $record = $stmt->fetch();

        // Fallback: if no today session found, look for any open session (handles midnight crossover)
        if (!$record) {
            $stmt = $pdo->prepare("SELECT * FROM attendance WHERE user_id = ? AND status IN ('working', 'paused') ORDER BY start_time DESC LIMIT 1");
            $stmt->execute([$userId]);
            $record = $stmt->fetch();
        }

        if (!$record) {
            echo json_encode(['success' => false, 'message' => 'No active clock-in found. Please clock in first.']);
            exit;
        }

        $start = new DateTime($record['start_time']);
        $end = new DateTime($now);
        $diff = $start->diff($end);
        $totalElapsed = ($diff->days * 24 * 60) + ($diff->h * 60) + $diff->i;

        // If currently paused, add the current pause duration to total_paused_minutes
        $totalPaused = (int)($record['total_paused_minutes'] ?? 0);
        if ($record['status'] === 'paused' && !empty($record['pause_time'])) {
            $pauseStart = new DateTime($record['pause_time']);
            $pauseDiff = $pauseStart->diff($end);
            $totalPaused += ($pauseDiff->days * 24 * 60) + ($pauseDiff->h * 60) + $pauseDiff->i;
        }
        $durationMinutes = max(0, $totalElapsed - $totalPaused);

        try {
            $stmt = $pdo->prepare("UPDATE attendance SET end_time = ?, duration_minutes = ?, status = 'completed', pause_time = NULL, total_paused_minutes = ?, device_time = ?, clock_out_lat = ?, clock_out_lng = ?, clock_out_address = ?, location_accuracy = ?, work_summary = ? WHERE attendance_id = ?");
            $stmt->execute([
                $now,
                $durationMinutes,
                $totalPaused,
                $deviceTime,
                $latitude,
                $longitude,
                $clockOutAddress,
                $accuracy,
                $workSummary,
                $record['attendance_id']
            ]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Database error on clock out: ' . $e->getMessage()]);
            exit;
        }

        $hrs = floor($durationMinutes / 60);
        $mins = $durationMinutes % 60;

        logActivity($userId, 'clock_out', "Clocked out. Duration: {$hrs}h {$mins}m. Work: " . substr($workSummary, 0, 100));

        echo json_encode([
            'success' => true,
            'message' => "Clocked out! You worked {$hrs}h {$mins}m today.",
            'end_time' => $now,
            'end_display' => date('h:i:s A'),
            'duration_minutes' => $durationMinutes,
            'duration_display' => "{$hrs}h {$mins}m",
            'location' => [
                'latitude' => $latitude,
                'longitude' => $longitude,
                'accuracy' => $accuracy
            ]
        ]);
        break;

    case 'status':
        // Fetch active session (working/paused first) or the latest session
        $stmt = $pdo->prepare("SELECT * FROM attendance WHERE user_id = ? AND date = ? ORDER BY FIELD(status, 'working', 'paused', 'completed', 'absent') ASC, start_time DESC LIMIT 1");
        $stmt->execute([$userId, $today]);
        $record = $stmt->fetch();

        // Calculate today's total stats across all sessions
        $stmtTot = $pdo->prepare("SELECT COALESCE(SUM(duration_minutes), 0) as total_mins, COUNT(*) as session_count FROM attendance WHERE user_id = ? AND date = ? AND status = 'completed'");
        $stmtTot->execute([$userId, $today]);
        $totStats = $stmtTot->fetch();

        if (!$record) {
            echo json_encode([
                'success' => true,
                'status' => 'not_started',
                'today_total_minutes' => (int)($totStats['total_mins'] ?? 0),
                'today_total_sessions' => (int)($totStats['session_count'] ?? 0)
            ]);
        } else {
            $response = [
                'success' => true,
                'status' => $record['status'],
                'start_time' => $record['start_time'],
                'end_time' => $record['end_time'],
                'duration_minutes' => $record['duration_minutes'],
                'today_total_minutes' => (int)($totStats['total_mins'] ?? 0),
                'today_total_sessions' => (int)($totStats['session_count'] ?? 0),
                'device_time' => $record['device_time'],
                'clock_in_location' => [
                    'latitude' => $record['clock_in_lat'],
                    'longitude' => $record['clock_in_lng'],
                    'address' => $record['clock_in_address']
                ],
                'clock_out_location' => [
                    'latitude' => $record['clock_out_lat'],
                    'longitude' => $record['clock_out_lng'],
                    'address' => $record['clock_out_address']
                ],
                'location_accuracy' => $record['location_accuracy'],
                'pause_time' => $record['pause_time'] ?? null,
                'total_paused_minutes' => $record['total_paused_minutes'] ?? 0
            ];

            // If working, calculate live duration minus break time
            if ($record['status'] === 'working' && $record['start_time']) {
                $start = new DateTime($record['start_time']);
                $end = new DateTime($now);
                $diff = $start->diff($end);
                $totalElapsed = ($diff->days * 24 * 60) + ($diff->h * 60) + $diff->i;
                $liveMins = max(0, $totalElapsed - (int)($record['total_paused_minutes'] ?? 0));
                $response['live_duration_minutes'] = $liveMins;
                $response['live_display'] = floor($liveMins / 60) . 'h ' . ($liveMins % 60) . 'm';
            }

            echo json_encode($response);
        }
        break;

    case 'pause':
        // Pause the current working session
        $stmt = $pdo->prepare("SELECT * FROM attendance WHERE user_id = ? AND status = 'working' ORDER BY start_time DESC LIMIT 1");
        $stmt->execute([$userId]);
        $record = $stmt->fetch();

        if (!$record) {
            echo json_encode(['success' => false, 'message' => 'No active session to pause.']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE attendance SET pause_time = ?, status = 'paused' WHERE attendance_id = ?");
        $stmt->execute([$now, $record['attendance_id']]);

        logActivity($userId, 'clock_pause', 'Paused session at ' . date('h:i:s A'));
        echo json_encode(['success' => true, 'message' => 'Session paused. Take your break!']);
        break;

    case 'resume':
        // Resume a paused session
        $stmt = $pdo->prepare("SELECT * FROM attendance WHERE user_id = ? AND status = 'paused' ORDER BY start_time DESC LIMIT 1");
        $stmt->execute([$userId]);
        $record = $stmt->fetch();

        if (!$record || !$record['pause_time']) {
            echo json_encode(['success' => false, 'message' => 'No paused session found.']);
            exit;
        }

        $pauseStart = new DateTime($record['pause_time']);
        $pauseEnd = new DateTime($now);
        $pauseDiff = $pauseStart->diff($pauseEnd);
        $pauseMinutes = ($pauseDiff->days * 24 * 60) + ($pauseDiff->h * 60) + $pauseDiff->i;
        $totalPaused = ($record['total_paused_minutes'] ?? 0) + $pauseMinutes;

        $stmt = $pdo->prepare("UPDATE attendance SET pause_time = NULL, total_paused_minutes = ?, status = 'working' WHERE attendance_id = ?");
        $stmt->execute([$totalPaused, $record['attendance_id']]);

        logActivity($userId, 'clock_resume', "Resumed after {$pauseMinutes}m break");
        echo json_encode(['success' => true, 'message' => "Resumed! Break was {$pauseMinutes} minutes.", 'break_minutes' => $pauseMinutes, 'total_paused' => $totalPaused]);
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action. Use: start, stop, pause, resume, or status.']);
}





