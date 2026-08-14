<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../config/auth.php';

header('Content-Type: application/json');

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$pdo = getDBConnection();

switch ($action) {
    case 'create':
        if (!isset($_SESSION['user_id']) || ($_SESSION['user_type'] ?? '') !== 'admin') {
            echo json_encode(['success' => false, 'message' => 'Permission denied. Admin access required.']);
            exit;
        }

        $requiredFields = ['title', 'category'];
        foreach ($requiredFields as $field) {
            if (empty($_POST[$field])) {
                echo json_encode(['success' => false, 'message' => "Field '{$field}' is required"]);
                exit;
            }
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO job_postings (title, category, department, pillar, location, work_type, job_type, description, requirements, responsibilities, skills, experience_required, compensation_type, salary_range, positions, is_featured, status, deadline, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                sanitize($_POST['title']),
                $_POST['category'],
                sanitize($_POST['department'] ?? ''),
                $_POST['pillar'] ?? null,
                sanitize($_POST['location'] ?? ''),
                $_POST['work_type'] ?? 'remote',
                $_POST['job_type'] ?? 'full_time',
                $_POST['description'] ?? '',
                $_POST['requirements'] ?? '',
                $_POST['responsibilities'] ?? '',
                $_POST['skills'] ?? '',
                sanitize($_POST['experience_required'] ?? ''),
                $_POST['compensation_type'] ?? 'fixed',
                sanitize($_POST['salary_range'] ?? ''),
                intval($_POST['positions'] ?? 1),
                intval($_POST['is_featured'] ?? 0),
                $_POST['status'] ?? 'draft',
                $_POST['deadline'] ?? null,
                $_SESSION['user_id']
            ]);

            $jobId = $pdo->lastInsertId();
            logActivity($_SESSION['user_id'], 'job_created', "Created job posting: {$_POST['title']}");
            echo json_encode(['success' => true, 'message' => 'Job posting created successfully', 'job_id' => $jobId]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to create job posting: ' . $e->getMessage()]);
        }
        break;

    case 'update':
        if (!isset($_SESSION['user_id']) || ($_SESSION['user_type'] ?? '') !== 'admin') {
            echo json_encode(['success' => false, 'message' => 'Permission denied.']);
            exit;
        }

        $jobId = intval($_POST['job_id'] ?? 0);
        if (!$jobId) {
            echo json_encode(['success' => false, 'message' => 'Job ID is required']);
            exit;
        }

        try {
            $updateFields = [];
            $updateParams = [];
            $allowedFields = ['title', 'category', 'department', 'pillar', 'location', 'work_type', 'job_type', 'description', 'requirements', 'responsibilities', 'skills', 'experience_required', 'compensation_type', 'salary_range', 'positions', 'is_featured', 'status', 'deadline'];

            foreach ($allowedFields as $field) {
                if (isset($_POST[$field])) {
                    $updateFields[] = "{$field} = ?";
                    $updateParams[] = $_POST[$field];
                }
            }

            if (empty($updateFields)) {
                echo json_encode(['success' => false, 'message' => 'No fields to update']);
                exit;
            }

            $updateParams[] = $jobId;
            $sql = "UPDATE job_postings SET " . implode(', ', $updateFields) . " WHERE job_id = ?";
            $pdo->prepare($sql)->execute($updateParams);

            logActivity($_SESSION['user_id'], 'job_updated', "Updated job posting #{$jobId}");
            echo json_encode(['success' => true, 'message' => 'Job posting updated']);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to update job posting']);
        }
        break;

    case 'delete':
        if (!isset($_SESSION['user_id']) || ($_SESSION['user_type'] ?? '') !== 'admin') {
            echo json_encode(['success' => false, 'message' => 'Permission denied.']);
            exit;
        }

        $jobId = intval($_POST['job_id'] ?? 0);
        if (!$jobId) {
            echo json_encode(['success' => false, 'message' => 'Job ID is required']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("UPDATE job_postings SET status = 'closed' WHERE job_id = ?");
            $stmt->execute([$jobId]);
            logActivity($_SESSION['user_id'], 'job_closed', "Closed job posting #{$jobId}");
            echo json_encode(['success' => true, 'message' => 'Job posting closed']);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to close job posting']);
        }
        break;

    case 'list':
        try {
            $page = max(1, intval($_GET['page'] ?? 1));
            $limit = min(50, max(1, intval($_GET['limit'] ?? 20)));
            $offset = ($page - 1) * $limit;

            $where = "WHERE status = 'active'";
            $params = [];

            if (!empty($_GET['category'])) { $where .= " AND category = ?"; $params[] = $_GET['category']; }
            if (!empty($_GET['department'])) { $where .= " AND department = ?"; $params[] = $_GET['department']; }
            if (!empty($_GET['location'])) { $where .= " AND location LIKE ?"; $params[] = '%' . $_GET['location'] . '%'; }
            if (!empty($_GET['work_type'])) { $where .= " AND work_type = ?"; $params[] = $_GET['work_type']; }
            if (!empty($_GET['search'])) {
                $s = '%' . $_GET['search'] . '%';
                $where .= " AND (title LIKE ? OR description LIKE ? OR skills LIKE ?)";
                $params[] = $s; $params[] = $s; $params[] = $s;
            }

            $countStmt = $pdo->prepare("SELECT COUNT(*) FROM job_postings {$where}");
            $countStmt->execute($params);
            $total = $countStmt->fetchColumn();

            $params[] = $limit;
            $params[] = $offset;
            $stmt = $pdo->prepare("SELECT * FROM job_postings {$where} ORDER BY is_featured DESC, created_at DESC LIMIT ? OFFSET ?");
            $stmt->execute($params);
            $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['success' => true, 'data' => $jobs, 'pagination' => ['total' => (int)$total, 'page' => $page, 'limit' => $limit, 'total_pages' => ceil($total / $limit)]]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to fetch jobs']);
        }
        break;

    case 'detail':
        $jobId = intval($_GET['job_id'] ?? 0);
        if (!$jobId) { echo json_encode(['success' => false, 'message' => 'Job ID required']); exit; }

        try {
            $stmt = $pdo->prepare("SELECT * FROM job_postings WHERE job_id = ?");
            $stmt->execute([$jobId]);
            $job = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$job) { echo json_encode(['success' => false, 'message' => 'Job not found']); exit; }

            $stmt = $pdo->prepare("SELECT COUNT(*) FROM applications WHERE job_id = ?");
            $stmt->execute([$jobId]);
            $job['application_count'] = (int)$stmt->fetchColumn();

            echo json_encode(['success' => true, 'data' => $job]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to fetch job']);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}





