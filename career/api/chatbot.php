<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';
if (session_status() === PHP_SESSION_NONE) secure_session_start();
header('Content-Type: application/json');
date_default_timezone_set('Asia/Kolkata');

$action = $_POST['action'] ?? $_GET['action'] ?? '';

try {
    $pdo = getDBConnection();
} catch (Exception $e) {
    echo json_encode(['success' => false]);
    exit;
}

// Create chat_logs table if not exists
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS `chat_logs` (
        `chat_id` INT NOT NULL AUTO_INCREMENT,
        `session_id` VARCHAR(100) NOT NULL,
        `visitor_name` VARCHAR(100) DEFAULT NULL,
        `visitor_phone` VARCHAR(20) DEFAULT NULL,
        `visitor_email` VARCHAR(100) DEFAULT NULL,
        `message` TEXT NOT NULL,
        `sender` ENUM('user','bot') NOT NULL DEFAULT 'user',
        `page_url` VARCHAR(500) DEFAULT NULL,
        `ip_address` VARCHAR(45) DEFAULT NULL,
        `device` VARCHAR(255) DEFAULT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`chat_id`),
        KEY `idx_session` (`session_id`),
        KEY `idx_created` (`created_at`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
} catch (Exception $e) {
    // Table might already exist
}

switch ($action) {
    case 'log':
        // Log a chat message
        $sessionId = $_POST['session_id'] ?? session_id();
        $message = trim($_POST['message'] ?? '');
        $sender = $_POST['sender'] ?? 'user';
        $pageUrl = $_POST['page_url'] ?? '';

        if (empty($message)) {
            echo json_encode(['success' => false, 'message' => 'Empty message']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO chat_logs (session_id, message, sender, page_url, ip_address, device) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $sessionId,
            $message,
            $sender === 'bot' ? 'bot' : 'user',
            $pageUrl,
            $_SERVER['REMOTE_ADDR'] ?? '',
            substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255)
        ]);

        echo json_encode(['success' => true]);
        break;

    case 'save_contact':
        // Save visitor contact info
        $sessionId = $_POST['session_id'] ?? session_id();
        $name = trim($_POST['name'] ?? '');
        $phone = trim($_POST['phone'] ?? '');
        $email = trim($_POST['email'] ?? '');

        if (!empty($name) || !empty($phone) || !empty($email)) {
            $stmt = $pdo->prepare("UPDATE chat_logs SET visitor_name = COALESCE(?, visitor_name), visitor_phone = COALESCE(?, visitor_phone), visitor_email = COALESCE(?, visitor_email) WHERE session_id = ?");
            $stmt->execute([
                $name ?: null,
                $phone ?: null,
                $email ?: null,
                $sessionId
            ]);
        }

        echo json_encode(['success' => true]);
        break;

    case 'history':
        // Get chat history (admin only)
        if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') {
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }

        $days = intval($_GET['days'] ?? 7);
        $stmt = $pdo->prepare("SELECT session_id,
            MAX(visitor_name) as name,
            MAX(visitor_phone) as phone,
            MAX(visitor_email) as email,
            COUNT(*) as msg_count,
            MIN(created_at) as first_msg,
            MAX(created_at) as last_msg,
            MAX(ip_address) as ip
            FROM chat_logs
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY session_id
            ORDER BY last_msg DESC
            LIMIT 100");
        $stmt->execute([$days]);
        $chats = $stmt->fetchAll();

        echo json_encode(['success' => true, 'chats' => $chats]);
        break;

    case 'messages':
        // Get messages for a session (admin only)
        if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') {
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }

        $sessionId = $_GET['session_id'] ?? '';
        $stmt = $pdo->prepare("SELECT * FROM chat_logs WHERE session_id = ? ORDER BY created_at ASC");
        $stmt->execute([$sessionId]);
        $messages = $stmt->fetchAll();

        echo json_encode(['success' => true, 'messages' => $messages]);
        break;

    case 'cleanup':
        // Delete old chats (admin only, older than 30 days)
        if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') {
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM chat_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)");
        $stmt->execute();
        $deleted = $stmt->rowCount();

        echo json_encode(['success' => true, 'deleted' => $deleted]);
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}





