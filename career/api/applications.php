<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../config/auth.php';

header('Content-Type: application/json');

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$pdo = getDBConnection();

switch ($action) {
    case 'apply':
        $requiredFields = ['job_id', 'applicant_name', 'email', 'phone'];
        foreach ($requiredFields as $field) {
            if (empty($_POST[$field])) {
                echo json_encode(['success' => false, 'message' => "Field '{$field}' is required"]);
                exit;
            }
        }

        if (!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'message' => 'Invalid email address']);
            exit;
        }

        $jobId = intval($_POST['job_id']);
        $stmt = $pdo->prepare("SELECT * FROM job_postings WHERE job_id = ? AND status = 'active'");
        $stmt->execute([$jobId]);
        if (!$stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Job not found or no longer active']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT application_id FROM applications WHERE job_id = ? AND email = ?");
        $stmt->execute([$jobId, $_POST['email']]);
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'You have already applied for this position']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO applications (job_id, user_id, applicant_name, email, phone, whatsapp, resume_url, portfolio_url, cover_letter, experience, skills, education, college, notice_period, ctc_expectation, preferred_pillar, availability, hours_per_week) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $jobId,
                $_SESSION['user_id'] ?? null,
                sanitize($_POST['applicant_name']),
                $_POST['email'],
                $_POST['phone'],
                $_POST['whatsapp'] ?? $_POST['phone'],
                $_POST['resume_url'] ?? '',
                $_POST['portfolio_url'] ?? '',
                sanitize($_POST['cover_letter'] ?? ''),
                sanitize($_POST['experience'] ?? ''),
                sanitize($_POST['skills'] ?? ''),
                sanitize($_POST['education'] ?? ''),
                sanitize($_POST['college'] ?? ''),
                sanitize($_POST['notice_period'] ?? ''),
                sanitize($_POST['ctc_expectation'] ?? ''),
                $_POST['preferred_pillar'] ?? null,
                sanitize($_POST['availability'] ?? ''),
                intval($_POST['hours_per_week'] ?? 0) ?: null
            ]);

            $applicationId = $pdo->lastInsertId();
            $pdo->prepare("UPDATE job_postings SET application_count = application_count + 1 WHERE job_id = ?")->execute([$jobId]);

            echo json_encode(['success' => true, 'message' => 'Application submitted successfully', 'application_id' => $applicationId]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to submit application']);
        }
        break;

    case 'update_status':
        if (!isset($_SESSION['user_id']) || ($_SESSION['user_type'] ?? '') !== 'admin') {
            echo json_encode(['success' => false, 'message' => 'Permission denied.']);
            exit;
        }

        $applicationId = intval($_POST['application_id'] ?? 0);
        $newStatus = $_POST['status'] ?? '';
        $validStatuses = ['new', 'shortlisted', 'interview_scheduled', 'selected', 'offer_sent', 'joined', 'rejected'];

        if (!$applicationId || !$newStatus || !in_array($newStatus, $validStatuses)) {
            echo json_encode(['success' => false, 'message' => 'Valid application ID and status are required']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("UPDATE applications SET status = ? WHERE application_id = ?");
            $stmt->execute([$newStatus, $applicationId]);
            logActivity($_SESSION['user_id'], 'application_status_updated', "Updated application #{$applicationId} to {$newStatus}");
            echo json_encode(['success' => true, 'message' => "Status updated to {$newStatus}"]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to update status']);
        }
        break;

    case 'list':
        if (!isset($_SESSION['user_id']) || ($_SESSION['user_type'] ?? '') !== 'admin') {
            echo json_encode(['success' => false, 'message' => 'Permission denied.']);
            exit;
        }

        try {
            $page = max(1, intval($_GET['page'] ?? 1));
            $limit = min(50, max(1, intval($_GET['limit'] ?? 20)));
            $offset = ($page - 1) * $limit;

            $where = "WHERE 1=1";
            $params = [];
            if (!empty($_GET['job_id'])) { $where .= " AND a.job_id = ?"; $params[] = intval($_GET['job_id']); }
            if (!empty($_GET['status'])) { $where .= " AND a.status = ?"; $params[] = $_GET['status']; }
            if (!empty($_GET['search'])) {
                $s = '%' . $_GET['search'] . '%';
                $where .= " AND (a.applicant_name LIKE ? OR a.email LIKE ?)";
                $params[] = $s; $params[] = $s;
            }

            $countStmt = $pdo->prepare("SELECT COUNT(*) FROM applications a {$where}");
            $countStmt->execute($params);
            $total = $countStmt->fetchColumn();

            $params[] = $limit;
            $params[] = $offset;
            $stmt = $pdo->prepare("SELECT a.*, j.title AS job_title, j.department FROM applications a LEFT JOIN job_postings j ON a.job_id = j.job_id {$where} ORDER BY a.applied_date DESC LIMIT ? OFFSET ?");
            $stmt->execute($params);

            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC), 'pagination' => ['total' => (int)$total, 'page' => $page, 'limit' => $limit, 'total_pages' => ceil($total / $limit)]]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to fetch applications']);
        }
        break;

    case 'my_applications':
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(['success' => false, 'message' => 'Not authenticated']);
            exit;
        }
        try {
            $stmt = $pdo->prepare("SELECT a.*, j.title AS job_title, j.category, j.location, j.work_type FROM applications a LEFT JOIN job_postings j ON a.job_id = j.job_id WHERE a.email = (SELECT email FROM users WHERE user_id = ?) ORDER BY a.applied_date DESC");
            $stmt->execute([$_SESSION['user_id']]);
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to fetch applications']);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}





