<?php
/**
 * KaryaSaarthi Career Portal — Mobile App Bridge API
 * Stateless, server-to-server authenticated endpoint.
 * Auth: X-Mobile-Secret header (shared secret between Next.js and this PHP server)
 * Identity: X-User-Email header (user's email, resolved to career user_id)
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/mailer.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Mobile-Secret, X-User-Email');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

date_default_timezone_set('Asia/Kolkata');

// ── Auth ──────────────────────────────────────────────────────────────────────
$MOBILE_SECRET = getenv('MOBILE_BRIDGE_SECRET') ?: 'ks-mobile-bridge-2025-secret';
$receivedSecret = $_SERVER['HTTP_X_MOBILE_SECRET'] ?? '';
if (!hash_equals($MOBILE_SECRET, $receivedSecret)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']); exit;
}

$userEmail = trim($_SERVER['HTTP_X_USER_EMAIL'] ?? '');
if (empty($userEmail)) {
    echo json_encode(['success' => false, 'message' => 'X-User-Email header required']); exit;
}

try { $pdo = getDBConnection(); } catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'DB connection failed']); exit;
}

// ── Resolve user from email ───────────────────────────────────────────────────
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
$stmt->execute([$userEmail]);
$careerUser = $stmt->fetch();

if (!$careerUser) {
    echo json_encode(['success' => false, 'message' => 'User not found in career system. Please register at career.karyasaarthi.com', 'not_registered' => true]); exit;
}

$userId   = $careerUser['user_id'];
$userType = $careerUser['user_type'];
$module   = $_GET['module'] ?? $_POST['module'] ?? '';
$action   = $_GET['action'] ?? $_POST['action'] ?? '';
$today    = date('Y-m-d');
$now      = date('Y-m-d H:i:s');

// ── Auto-migrate attendance columns ──────────────────────────────────────────
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS attendance (
        attendance_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        start_time DATETIME,
        end_time DATETIME,
        duration_minutes INT DEFAULT 0,
        status ENUM('working','paused','completed','absent','half_day','late') DEFAULT 'working',
        pause_time DATETIME NULL,
        total_paused_minutes INT DEFAULT 0,
        clock_in_lat DECIMAL(10,8) NULL,
        clock_in_lng DECIMAL(11,8) NULL,
        clock_out_lat DECIMAL(10,8) NULL,
        clock_out_lng DECIMAL(11,8) NULL,
        work_summary TEXT,
        device_time DATETIME NULL,
        ip_address VARCHAR(45),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )");
} catch (Exception $ignore) {}

// ── Auto-fix stuck sessions from previous days ────────────────────────────────
try {
    $stuck = $pdo->prepare("SELECT * FROM attendance WHERE user_id=? AND date<? AND status IN ('working','paused')");
    $stuck->execute([$userId, $today]);
    foreach ($stuck->fetchAll() as $s) {
        $mins = max(0, (int)(strtotime($s['date'].' 23:59:59') - strtotime($s['start_time'])) / 60 - (int)($s['total_paused_minutes'] ?? 0));
        $pdo->prepare("UPDATE attendance SET status='completed',end_time=?,duration_minutes=?,pause_time=NULL WHERE attendance_id=?")
            ->execute([$s['date'].' 23:59:59', $mins, $s['attendance_id']]);
    }
} catch (Exception $ignore) {}

// ── Helper: sync leave_balances used_days ────────────────────────────────────
function syncLeaveBalance(PDO $pdo, string $userId, string $type, int $days, int $year): void {
    try {
        $pdo->prepare("INSERT INTO leave_balances (user_id,leave_type,year,total_days,used_days) VALUES (?,?,?,12,?) ON DUPLICATE KEY UPDATE used_days=used_days+?")->execute([$userId,$type,$year,$days,$days]);
    } catch (Exception $ignore) {}
}

// ════════════════════════════════════════════════════════════════════════════
switch ($module) {

// ── ATTENDANCE ────────────────────────────────────────────────────────────────
case 'attendance':
    switch ($action) {

        case 'status':
            $stmt = $pdo->prepare("SELECT * FROM attendance WHERE user_id=? AND date=? ORDER BY FIELD(status,'working','paused','completed') ASC, start_time DESC LIMIT 1");
            $stmt->execute([$userId, $today]);
            $record = $stmt->fetch();

            $tot = $pdo->prepare("SELECT COALESCE(SUM(duration_minutes),0) as total_mins, COUNT(*) as sessions FROM attendance WHERE user_id=? AND date=? AND status='completed'");
            $tot->execute([$userId, $today]);
            $totals = $tot->fetch();

            $month = $pdo->prepare("SELECT COUNT(CASE WHEN status='completed' THEN 1 END) as present_days, COALESCE(SUM(duration_minutes),0) as total_minutes, COALESCE(AVG(CASE WHEN duration_minutes>0 THEN duration_minutes END),0) as avg_minutes FROM attendance WHERE user_id=? AND MONTH(date)=MONTH(CURDATE()) AND YEAR(date)=YEAR(CURDATE())");
            $month->execute([$userId]);
            $monthStats = $month->fetch();

            $week = $pdo->prepare("SELECT COALESCE(SUM(duration_minutes),0) as week_minutes FROM attendance WHERE user_id=? AND YEARWEEK(date,1)=YEARWEEK(CURDATE(),1)");
            $week->execute([$userId]);
            $weekStats = $week->fetch();

            echo json_encode([
                'success' => true,
                'record' => $record ?: null,
                'status' => $record ? $record['status'] : 'not_started',
                'today_total_minutes' => (int)($totals['total_mins'] ?? 0),
                'today_sessions' => (int)($totals['sessions'] ?? 0),
                'month' => $monthStats,
                'week_minutes' => (int)($weekStats['week_minutes'] ?? 0),
            ]);
            break;

        case 'start':
            $existing = $pdo->prepare("SELECT * FROM attendance WHERE user_id=? AND date=? AND status IN ('working','paused') LIMIT 1");
            $existing->execute([$userId, $today]);
            $ex = $existing->fetch();
            if ($ex && $ex['status'] === 'working') { echo json_encode(['success'=>false,'message'=>'Already clocked in!']); break; }
            if ($ex && $ex['status'] === 'paused')  { echo json_encode(['success'=>false,'message'=>'You have a paused session. Please resume it.']); break; }

            $lat = $_POST['latitude'] ?? null; $lng = $_POST['longitude'] ?? null;
            $pdo->prepare("INSERT INTO attendance (user_id,date,start_time,status,clock_in_lat,clock_in_lng,device_time,ip_address) VALUES (?,?,?,'working',?,?,?,?)")
                ->execute([$userId,$today,$now,$lat,$lng,$_POST['device_time']??null,$_SERVER['REMOTE_ADDR']??'']);
            echo json_encode(['success'=>true,'message'=>'Clocked in!','start_time'=>$now]);
            break;

        case 'stop':
            $summary = trim($_POST['work_summary'] ?? '');
            if (strlen($summary) < 20) { echo json_encode(['success'=>false,'message'=>'Work summary required (min 20 chars)','require_summary'=>true]); break; }

            $stmt = $pdo->prepare("SELECT * FROM attendance WHERE user_id=? AND date=? AND status IN ('working','paused') ORDER BY start_time DESC LIMIT 1");
            $stmt->execute([$userId, $today]); $rec = $stmt->fetch();
            if (!$rec) { echo json_encode(['success'=>false,'message'=>'No active session found']); break; }

            $elapsed = (int)max(0,(strtotime($now)-strtotime($rec['start_time']))/60);
            $paused  = (int)($rec['total_paused_minutes'] ?? 0);
            if ($rec['status']==='paused' && $rec['pause_time']) {
                $paused += (int)max(0,(strtotime($now)-strtotime($rec['pause_time']))/60);
            }
            $duration = max(0, $elapsed - $paused);
            $lat = $_POST['latitude'] ?? null; $lng = $_POST['longitude'] ?? null;

            $pdo->prepare("UPDATE attendance SET end_time=?,duration_minutes=?,status='completed',pause_time=NULL,total_paused_minutes=?,clock_out_lat=?,clock_out_lng=?,work_summary=? WHERE attendance_id=?")
                ->execute([$now,$duration,$paused,$lat,$lng,$summary,$rec['attendance_id']]);

            echo json_encode(['success'=>true,'message'=>"Clocked out! ".floor($duration/60)."h ".($duration%60)."m",'duration_minutes'=>$duration]);
            break;

        case 'pause':
            $stmt = $pdo->prepare("SELECT * FROM attendance WHERE user_id=? AND status='working' ORDER BY start_time DESC LIMIT 1");
            $stmt->execute([$userId]); $rec = $stmt->fetch();
            if (!$rec) { echo json_encode(['success'=>false,'message'=>'No active session']); break; }
            $pdo->prepare("UPDATE attendance SET pause_time=?,status='paused' WHERE attendance_id=?")->execute([$now,$rec['attendance_id']]);
            echo json_encode(['success'=>true,'message'=>'Session paused']);
            break;

        case 'resume':
            $stmt = $pdo->prepare("SELECT * FROM attendance WHERE user_id=? AND status='paused' ORDER BY start_time DESC LIMIT 1");
            $stmt->execute([$userId]); $rec = $stmt->fetch();
            if (!$rec || !$rec['pause_time']) { echo json_encode(['success'=>false,'message'=>'No paused session']); break; }
            $breakMins = (int)max(0,(strtotime($now)-strtotime($rec['pause_time']))/60);
            $total = ($rec['total_paused_minutes']??0) + $breakMins;
            $pdo->prepare("UPDATE attendance SET pause_time=NULL,total_paused_minutes=?,status='working' WHERE attendance_id=?")->execute([$total,$rec['attendance_id']]);
            echo json_encode(['success'=>true,'message'=>"Resumed! Break was {$breakMins}m",'break_minutes'=>$breakMins]);
            break;

        case 'history':
            $stmt = $pdo->prepare("SELECT * FROM attendance WHERE user_id=? ORDER BY date DESC,start_time DESC LIMIT 30");
            $stmt->execute([$userId]);
            echo json_encode(['success'=>true,'records'=>$stmt->fetchAll()]);
            break;

        case 'all_users':
            if ($userType !== 'admin') { echo json_encode(['success'=>false,'message'=>'Admin only']); break; }
            $date = $_GET['date'] ?? $today;
            $stmt = $pdo->prepare("SELECT a.*,u.name,u.user_type,u.department FROM attendance a JOIN users u ON a.user_id=u.user_id WHERE a.date=? ORDER BY a.start_time DESC");
            $stmt->execute([$date]);
            echo json_encode(['success'=>true,'records'=>$stmt->fetchAll(),'date'=>$date]);
            break;

        default:
            echo json_encode(['success'=>false,'message'=>"Unknown attendance action: $action"]);
    }
    break;

// ── LEAVE ─────────────────────────────────────────────────────────────────────
case 'leave':
    // Ensure leave_balances table exists
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS leave_balances (balance_id INT AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(50), leave_type VARCHAR(50), year INT, total_days INT DEFAULT 12, used_days INT DEFAULT 0, UNIQUE KEY uq (user_id,leave_type,year))");
        $pdo->exec("ALTER TABLE leave_requests MODIFY COLUMN status ENUM('pending','approved','rejected','cancelled') DEFAULT 'pending'");
    } catch (Exception $ignore) {}

    switch ($action) {

        case 'status':
            $year = date('Y');
            $balStmt = $pdo->prepare("SELECT leave_type, total_days, used_days, (total_days-used_days) AS remaining FROM leave_balances WHERE user_id=? AND year=?");
            $balStmt->execute([$userId,$year]); $balances = $balStmt->fetchAll();

            $pendStmt = $pdo->prepare("SELECT * FROM leave_requests WHERE user_id=? AND status='pending' ORDER BY created_at DESC");
            $pendStmt->execute([$userId]); $pending = $pendStmt->fetchAll();

            echo json_encode(['success'=>true,'balances'=>$balances,'pending'=>$pending,'year'=>$year]);
            break;

        case 'history':
            $target = ($userType==='admin' && !empty($_GET['user_id'])) ? $_GET['user_id'] : $userId;
            $stmt = $pdo->prepare("SELECT * FROM leave_requests WHERE user_id=? ORDER BY created_at DESC LIMIT 50");
            $stmt->execute([$target]);
            echo json_encode(['success'=>true,'records'=>$stmt->fetchAll()]);
            break;

        case 'all_pending':
            if ($userType !== 'admin') { echo json_encode(['success'=>false,'message'=>'Admin only']); break; }
            $stmt = $pdo->query("SELECT lr.*,u.name,u.user_type FROM leave_requests lr JOIN users u ON lr.user_id=u.user_id WHERE lr.status='pending' ORDER BY lr.created_at DESC");
            echo json_encode(['success'=>true,'records'=>$stmt->fetchAll()]);
            break;

        case 'all':
            if ($userType !== 'admin') { echo json_encode(['success'=>false,'message'=>'Admin only']); break; }
            $filter = $_GET['status'] ?? '';
            if ($filter) {
                $stmt = $pdo->prepare("SELECT lr.*,u.name,u.user_type FROM leave_requests lr JOIN users u ON lr.user_id=u.user_id WHERE lr.status=? ORDER BY lr.created_at DESC LIMIT 100");
                $stmt->execute([$filter]);
            } else {
                $stmt = $pdo->query("SELECT lr.*,u.name,u.user_type FROM leave_requests lr JOIN users u ON lr.user_id=u.user_id ORDER BY lr.created_at DESC LIMIT 100");
            }
            echo json_encode(['success'=>true,'records'=>$stmt->fetchAll()]);
            break;

        case 'today_absent':
            if ($userType !== 'admin') { echo json_encode(['success'=>false,'message'=>'Admin only']); break; }
            $stmt = $pdo->prepare("SELECT lr.*,u.name,u.user_type FROM leave_requests lr JOIN users u ON lr.user_id=u.user_id WHERE lr.status='approved' AND ? BETWEEN lr.start_date AND lr.end_date");
            $stmt->execute([$today]);
            echo json_encode(['success'=>true,'records'=>$stmt->fetchAll()]);
            break;

        case 'request':
            $type=$_POST['leave_type']??''; $start=$_POST['start_date']??''; $end=$_POST['end_date']??''; $reason=trim($_POST['reason']??'');
            if (!$type||!$start||!$end||!$reason) { echo json_encode(['success'=>false,'message'=>'All fields required']); break; }
            if ($end < $start) { echo json_encode(['success'=>false,'message'=>'End date before start date']); break; }
            $days = (int)(strtotime($end)-strtotime($start))/86400 + 1;
            $pdo->prepare("INSERT INTO leave_requests (user_id,leave_type,start_date,end_date,reason,status,total_days,created_at,updated_at) VALUES (?,?,?,?,?,'pending',?,?,?)")
                ->execute([$userId,$type,$start,$end,$reason,$days,$now,$now]);
            echo json_encode(['success'=>true,'message'=>"Leave request submitted for {$days} day(s)"]);
            break;

        case 'cancel':
            $lid=(int)($_POST['leave_id']??0);
            $lr=$pdo->prepare("SELECT * FROM leave_requests WHERE leave_id=?"); $lr->execute([$lid]); $lrec=$lr->fetch();
            if (!$lrec||$lrec['user_id']!==$userId||$lrec['status']!=='pending') { echo json_encode(['success'=>false,'message'=>'Cannot cancel this request']); break; }
            $pdo->prepare("UPDATE leave_requests SET status='cancelled',updated_at=? WHERE leave_id=?")->execute([$now,$lid]);
            echo json_encode(['success'=>true,'message'=>'Leave request cancelled']);
            break;

        case 'approve':
            if ($userType!=='admin') { echo json_encode(['success'=>false,'message'=>'Admin only']); break; }
            $lid=(int)($_POST['leave_id']??0); $remarks=trim($_POST['admin_remarks']??'');
            $lr=$pdo->prepare("SELECT * FROM leave_requests WHERE leave_id=? AND status='pending'"); $lr->execute([$lid]); $lrec=$lr->fetch();
            if (!$lrec) { echo json_encode(['success'=>false,'message'=>'Request not found or not pending']); break; }
            $pdo->prepare("UPDATE leave_requests SET status='approved',approved_by=?,admin_remarks=?,updated_at=? WHERE leave_id=?")->execute([$userId,$remarks,$now,$lid]);
            syncLeaveBalance($pdo,$lrec['user_id'],$lrec['leave_type'],(int)$lrec['total_days'],date('Y',strtotime($lrec['start_date'])));
            echo json_encode(['success'=>true,'message'=>'Leave approved']);
            break;

        case 'reject':
            if ($userType!=='admin') { echo json_encode(['success'=>false,'message'=>'Admin only']); break; }
            $lid=(int)($_POST['leave_id']??0); $remarks=trim($_POST['admin_remarks']??'');
            $pdo->prepare("UPDATE leave_requests SET status='rejected',approved_by=?,admin_remarks=?,updated_at=? WHERE leave_id=? AND status='pending'")->execute([$userId,$remarks,$now,$lid]);
            echo json_encode(['success'=>true,'message'=>'Leave rejected']);
            break;

        case 'grant':
            if ($userType!=='admin') { echo json_encode(['success'=>false,'message'=>'Admin only']); break; }
            $target=$_POST['target_user_id']??''; $type=$_POST['leave_type']??'';
            $start=$_POST['start_date']??''; $end=$_POST['end_date']??'';
            $remarks=trim($_POST['admin_remarks']??'Granted by Admin');
            if (!$target||!$type||!$start||!$end) { echo json_encode(['success'=>false,'message'=>'target_user_id,leave_type,start_date,end_date required']); break; }
            $days=(int)(strtotime($end)-strtotime($start))/86400+1;
            $pdo->prepare("INSERT INTO leave_requests (user_id,leave_type,start_date,end_date,reason,status,approved_by,admin_remarks,total_days,created_at,updated_at) VALUES (?,?,?,?,'Granted by Admin','approved',?,?,?,?,?)")
                ->execute([$target,$type,$start,$end,$userId,$remarks,$days,$now,$now]);
            syncLeaveBalance($pdo,$target,$type,$days,date('Y',strtotime($start)));
            echo json_encode(['success'=>true,'message'=>"Granted {$days} day(s) leave"]);
            break;

        default:
            echo json_encode(['success'=>false,'message'=>"Unknown leave action: $action"]);
    }
    break;

// ── PROFILE ───────────────────────────────────────────────────────────────────
case 'profile':
    switch ($action) {
        case 'get':
            // Task stats
            $tasks=['total'=>0,'pending'=>0,'in_progress'=>0,'completed'=>0];
            try {
                $ts=$pdo->prepare("SELECT COUNT(*) as t,SUM(status='pending') as p,SUM(status='in_progress') as ip,SUM(status='completed') as c FROM tasks WHERE assigned_to=?");
                $ts->execute([$userId]); $tr=$ts->fetch();
                $tasks=['total'=>(int)$tr['t'],'pending'=>(int)$tr['p'],'in_progress'=>(int)$tr['ip'],'completed'=>(int)$tr['c']];
            } catch(Exception $ignore){}

            // Attendance stats this month
            $att=['days_worked'=>0,'total_hours'=>0];
            try {
                $as=$pdo->prepare("SELECT COUNT(*) as dw,COALESCE(SUM(duration_minutes),0) as tm FROM attendance WHERE user_id=? AND MONTH(date)=MONTH(CURDATE()) AND YEAR(date)=YEAR(CURDATE()) AND status='completed'");
                $as->execute([$userId]); $ar=$as->fetch();
                $att=['days_worked'=>(int)$ar['dw'],'total_hours'=>round((int)$ar['tm']/60,1)];
            } catch(Exception $ignore){}

            // Leave balances
            $balStmt=$pdo->prepare("SELECT leave_type,total_days,used_days,(total_days-used_days) AS remaining FROM leave_balances WHERE user_id=? AND year=?");
            $balStmt->execute([$userId,date('Y')]); $balances=$balStmt->fetchAll();

            // Recent leaves
            $ls=$pdo->prepare("SELECT * FROM leave_requests WHERE user_id=? ORDER BY created_at DESC LIMIT 5");
            $ls->execute([$userId]); $recentLeaves=$ls->fetchAll();

            echo json_encode([
                'success' => true,
                'user' => $careerUser,
                'task_stats' => $tasks,
                'attendance' => $att,
                'leave_balances' => $balances,
                'recent_leaves' => $recentLeaves,
            ]);
            break;

        default:
            echo json_encode(['success'=>false,'message'=>"Unknown profile action: $action"]);
    }
    break;

// ── RECRUITMENT (admin only) ──────────────────────────────────────────────────
case 'recruitment':
    if ($userType !== 'admin') { echo json_encode(['success'=>false,'message'=>'Admin only']); break; }

    switch ($action) {
        case 'jobs':
            $stmt=$pdo->query("SELECT * FROM job_postings ORDER BY created_at DESC LIMIT 50");
            echo json_encode(['success'=>true,'jobs'=>$stmt->fetchAll()]);
            break;

        case 'applications':
            $sql="SELECT a.*,j.title as job_title FROM applications a LEFT JOIN job_postings j ON a.job_id=j.job_id WHERE 1=1";
            $params=[];
            if (!empty($_GET['job_id'])) { $sql.=" AND a.job_id=?"; $params[]=(int)$_GET['job_id']; }
            if (!empty($_GET['status'])) { $sql.=" AND a.status=?"; $params[]=$_GET['status']; }
            $sql.=" ORDER BY a.applied_date DESC LIMIT 50";
            $stmt=$pdo->prepare($sql); $stmt->execute($params);
            echo json_encode(['success'=>true,'applications'=>$stmt->fetchAll()]);
            break;

        case 'interviews':
            $stmt=$pdo->query("SELECT i.*,a.applicant_name,a.email as applicant_email,j.title as job_title FROM interviews i LEFT JOIN applications a ON i.application_id=a.application_id LEFT JOIN job_postings j ON a.job_id=j.job_id ORDER BY i.interview_date DESC LIMIT 50");
            echo json_encode(['success'=>true,'interviews'=>$stmt->fetchAll()]);
            break;

        case 'create_job':
            $stmt=$pdo->prepare("INSERT INTO job_postings (title,category,department,pillar,location,work_type,job_type,description,requirements,responsibilities,skills,experience_required,compensation_type,salary_range,positions,deadline,status,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
            $stmt->execute([
                $_POST['title'],$_POST['category']??'',$_POST['department']??'',$_POST['pillar']??null,
                $_POST['location']??'',$_POST['work_type']??'remote',$_POST['job_type']??'full_time',
                $_POST['description']??'',$_POST['requirements']??'',$_POST['responsibilities']??'',
                $_POST['skills']??'',$_POST['experience_required']??'',$_POST['compensation_type']??'fixed',
                $_POST['salary_range']??'',(int)($_POST['positions']??1),$_POST['deadline']??null,
                $_POST['status']??'draft',$userId
            ]);
            echo json_encode(['success'=>true,'message'=>'Job posting created','job_id'=>$pdo->lastInsertId()]);
            break;

        case 'update_job_status':
            $pdo->prepare("UPDATE job_postings SET status=? WHERE job_id=?")->execute([$_POST['status'],(int)$_POST['job_id']]);
            echo json_encode(['success'=>true,'message'=>'Job status updated']);
            break;

        case 'delete_job':
            $pdo->prepare("DELETE FROM job_postings WHERE job_id=?")->execute([(int)$_POST['job_id']]);
            echo json_encode(['success'=>true,'message'=>'Job deleted']);
            break;

        case 'update_application_status':
            $appId=(int)$_POST['application_id']; $newStatus=$_POST['status'];
            $pdo->prepare("UPDATE applications SET status=? WHERE application_id=?")->execute([$newStatus,$appId]);

            // Send email notification
            $appInfo=$pdo->prepare("SELECT a.applicant_name,a.email,j.title as job_title FROM applications a LEFT JOIN job_postings j ON a.job_id=j.job_id WHERE a.application_id=?");
            $appInfo->execute([$appId]); $app=$appInfo->fetch();
            if ($app && !empty($app['email']) && $newStatus !== 'new') {
                $statusLabels=['shortlisted'=>'You\'ve Been Shortlisted!','selected'=>'Congratulations! You\'re Selected!','rejected'=>'Application Update','joined'=>'Welcome to Karya Saarthi!'];
                $subject=$statusLabels[$newStatus]??'Application Status Update';
                $body="<p>Dear {$app['applicant_name']},</p><p>Your application for <strong>{$app['job_title']}</strong> has been updated to: <strong>".ucfirst(str_replace('_',' ',$newStatus))."</strong>.</p><p>Best regards,<br>Karya Saarthi HR Team</p>";
                sendEmail($app['email'],"$subject | Karya Saarthi",$body,'hr@karyasaarthi.com');
                echo json_encode(['success'=>true,'message'=>"Status updated & email sent to {$app['email']}"]);
            } else {
                echo json_encode(['success'=>true,'message'=>'Application status updated']);
            }
            break;

        case 'schedule_interview':
            $dt=$_POST['interview_date'].' '.$_POST['interview_time'];
            $pdo->prepare("INSERT INTO interviews (application_id,interview_type,interview_date,interviewer_id,meeting_link,feedback) VALUES (?,?,?,?,?,?)")
                ->execute([(int)$_POST['application_id'],$_POST['interview_type'],$dt,$_POST['interviewer_id']??null,$_POST['meeting_link']??'',$_POST['notes']??'']);
            $pdo->prepare("UPDATE applications SET status='interview_scheduled' WHERE application_id=?")->execute([(int)$_POST['application_id']]);
            echo json_encode(['success'=>true,'message'=>'Interview scheduled']);
            break;

        case 'delete_interview':
            $pdo->prepare("DELETE FROM interviews WHERE interview_id=?")->execute([(int)$_POST['interview_id']]);
            echo json_encode(['success'=>true,'message'=>'Interview deleted']);
            break;

        default:
            echo json_encode(['success'=>false,'message'=>"Unknown recruitment action: $action"]);
    }
    break;

default:
    echo json_encode(['success'=>false,'message'=>"Unknown module: $module. Use: attendance, leave, profile, recruitment"]);
}
