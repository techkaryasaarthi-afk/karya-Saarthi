<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../config/auth.php';

header('Content-Type: application/json');

$action = $_POST['action'] ?? $_GET['action'] ?? '';

// Public enquiry endpoint — no auth required
if ($action === 'enquiry') {
    // Skip auth check — handled in switch below
} elseif (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$userId = $_SESSION['user_id'] ?? '';
$userType = $_SESSION['user_type'] ?? '';
$pdo = getDBConnection();

switch ($action) {
    case 'create':
        if (!in_array($userType, ['campus_saarthi', 'admin'])) {
            echo json_encode(['success' => false, 'message' => 'Permission denied']);
            exit;
        }

        $requiredFields = ['customer_name', 'customer_phone', 'service_required'];
        foreach ($requiredFields as $field) {
            if (empty($_POST[$field])) {
                echo json_encode(['success' => false, 'message' => "Field '{$field}' is required"]);
                exit;
            }
        }

        try {
            $leadId = generateLeadId($userId);

            $stmt = $pdo->prepare("INSERT INTO leads (lead_id, campus_saarthi_id, customer_name, customer_phone, customer_whatsapp, customer_email, college, course_year, service_required, project_details, budget_min, budget_max, urgency, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $leadId,
                $userId,
                sanitize($_POST['customer_name']),
                $_POST['customer_phone'],
                $_POST['customer_whatsapp'] ?? $_POST['customer_phone'],
                $_POST['customer_email'] ?? '',
                sanitize($_POST['college'] ?? ''),
                sanitize($_POST['course_year'] ?? ''),
                sanitize($_POST['service_required']),
                sanitize($_POST['project_details'] ?? ''),
                floatval($_POST['budget_min'] ?? 0),
                floatval($_POST['budget_max'] ?? 0),
                $_POST['urgency'] ?? 'normal',
                $_POST['source'] ?? 'campus_saarthi'
            ]);

            logActivity($userId, 'lead_created', "Created lead {$leadId}");
            echo json_encode(['success' => true, 'message' => 'Lead created successfully', 'lead_id' => $leadId]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to create lead: ' . $e->getMessage()]);
        }
        break;

    case 'update_status':
        if ($userType !== 'admin') {
            echo json_encode(['success' => false, 'message' => 'Permission denied.']);
            exit;
        }

        $leadId = $_POST['lead_id'] ?? '';
        $newStatus = $_POST['status'] ?? '';
        $validStatuses = ['new', 'contacted', 'discussion', 'won', 'lost'];

        if (empty($leadId) || empty($newStatus) || !in_array($newStatus, $validStatuses)) {
            echo json_encode(['success' => false, 'message' => 'Valid lead ID and status required']);
            exit;
        }

        try {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare("SELECT * FROM leads WHERE lead_id = ?");
            $stmt->execute([$leadId]);
            $lead = $stmt->fetch();
            if (!$lead) { $pdo->rollBack(); echo json_encode(['success' => false, 'message' => 'Lead not found']); exit; }

            $updateFields = "status = ?";
            $updateParams = [$newStatus];

            // Calculate commission when lead is won
            if ($newStatus === 'won' && $lead['status'] !== 'won') {
                $projectValue = floatval($_POST['project_value'] ?? $lead['project_value'] ?? 0);
                $commissionAmount = $projectValue * CAMPUS_SAARTHI_COMMISSION;

                $updateFields .= ", project_value = ?, commission_amount = ?, commission_status = 'pending'";
                $updateParams[] = $projectValue;
                $updateParams[] = $commissionAmount;

                // Create payment record
                $pdo->prepare("INSERT INTO payments (user_id, amount, payment_type, reference_id, description, status) VALUES (?, ?, 'commission', ?, ?, 'pending')")
                    ->execute([$lead['campus_saarthi_id'], $commissionAmount, $leadId, "Commission for lead {$leadId}"]);
            }

            if (!empty($_POST['admin_notes'])) {
                $updateFields .= ", admin_notes = ?";
                $updateParams[] = sanitize($_POST['admin_notes']);
            }

            $updateParams[] = $leadId;
            $pdo->prepare("UPDATE leads SET {$updateFields} WHERE lead_id = ?")->execute($updateParams);

            $pdo->commit();
            logActivity($userId, 'lead_status_updated', "Updated lead {$leadId} to {$newStatus}");

            $response = ['success' => true, 'message' => "Lead status updated to {$newStatus}"];
            if ($newStatus === 'won') $response['commission_amount'] = $commissionAmount ?? 0;
            echo json_encode($response);
        } catch (PDOException $e) {
            $pdo->rollBack();
            echo json_encode(['success' => false, 'message' => 'Failed to update lead']);
        }
        break;

    case 'add_notes':
        if ($userType !== 'admin') {
            echo json_encode(['success' => false, 'message' => 'Permission denied.']);
            exit;
        }
        $leadId = $_POST['lead_id'] ?? '';
        $notes = sanitize($_POST['admin_notes'] ?? '');
        if (empty($leadId) || empty($notes)) {
            echo json_encode(['success' => false, 'message' => 'Lead ID and notes required']);
            exit;
        }
        try {
            $pdo->prepare("UPDATE leads SET admin_notes = CONCAT(IFNULL(admin_notes,''), '\n[', NOW(), '] ', ?) WHERE lead_id = ?")->execute([$notes, $leadId]);
            echo json_encode(['success' => true, 'message' => 'Notes added']);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to add notes']);
        }
        break;

    case 'list':
        try {
            $where = "WHERE 1=1";
            $params = [];

            if ($userType === 'campus_saarthi') {
                $where .= " AND l.campus_saarthi_id = ?";
                $params[] = $userId;
            }
            if (!empty($_GET['status'])) { $where .= " AND l.status = ?"; $params[] = $_GET['status']; }

            $stmt = $pdo->prepare("SELECT l.*, u.name AS saarthi_name FROM leads l LEFT JOIN users u ON l.campus_saarthi_id = u.user_id {$where} ORDER BY l.submitted_date DESC");
            $stmt->execute($params);
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to fetch leads']);
        }
        break;

    case 'stats':
        try {
            $where = "WHERE 1=1";
            $params = [];
            if ($userType === 'campus_saarthi') { $where .= " AND campus_saarthi_id = ?"; $params[] = $userId; }

            $stmt = $pdo->prepare("SELECT status, COUNT(*) AS count FROM leads {$where} GROUP BY status");
            $stmt->execute($params);
            $statusCounts = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

            $stmt = $pdo->prepare("SELECT COALESCE(SUM(project_value), 0) AS total_value, COALESCE(SUM(commission_amount), 0) AS total_commission FROM leads {$where}");
            $stmt->execute($params);
            $financials = $stmt->fetch();

            echo json_encode(['success' => true, 'data' => [
                'by_status' => $statusCounts,
                'total_leads' => array_sum($statusCounts),
                'total_project_value' => floatval($financials['total_value']),
                'total_commission' => floatval($financials['total_commission'])
            ]]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to fetch stats']);
        }
        break;

    case 'enquiry':
        // Public project enquiry from homepage — no login required
        $name = trim($_POST['name'] ?? '');
        $phone = trim($_POST['phone'] ?? '');
        $service = trim($_POST['service'] ?? '');

        if (empty($name) || empty($phone) || empty($service)) {
            echo json_encode(['success' => false, 'message' => 'Name, phone, and service are required']);
            exit;
        }

        try {
            // Auto-create table
            $pdo->exec("CREATE TABLE IF NOT EXISTS project_enquiries (
                enquiry_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                phone VARCHAR(15) NOT NULL,
                service_required VARCHAR(200) NOT NULL,
                message TEXT,
                status ENUM('new','contacted','converted','closed') DEFAULT 'new',
                assigned_to VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            $stmt = $pdo->prepare("INSERT INTO project_enquiries (name, phone, service_required, message) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
                $phone,
                htmlspecialchars($service, ENT_QUOTES, 'UTF-8'),
                htmlspecialchars(trim($_POST['message'] ?? ''), ENT_QUOTES, 'UTF-8', false)
            ]);

            echo json_encode(['success' => true, 'message' => 'Thank you! Our team will contact you within 24 hours.']);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Something went wrong. Please try again.']);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}





