<?php
/**
 * Centralized Group Chat API
 * 
 * GET  ?action=messages&after_id=X  — Fetch messages (polling)
 * GET  ?action=users                — Fetch all active users for @mention
 * POST action=send                  — Send a message (parses @mentions & /assign)
 */

// Catch all errors and return as JSON
set_error_handler(function($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});
set_exception_handler(function($e) {
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(500);
    }
    echo json_encode(['error' => $e->getMessage(), 'file' => basename($e->getFile()), 'line' => $e->getLine()]);
    exit;
});
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        if (!headers_sent()) {
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(500);
        }
        echo json_encode(['error' => $error['message'], 'file' => basename($error['file']), 'line' => $error['line']]);
    }
});

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/auth.php';

// Require login for all chat actions
if (!isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$pdo = getDBConnection();
$currentUserId = $_SESSION['user_id'];
$currentUserName = $_SESSION['user_name'];
$currentUserType = $_SESSION['user_type'];

function parseTaskAssignmentCommand($message) {
    if (!preg_match('/^\/assign\s+@(\S+)\s+(.+)$/is', $message, $assignMatch)) {
        return null;
    }

    $assignTarget = $assignMatch[1];
    $rawPayload = trim($assignMatch[2]);
    $taskData = [
        'target' => $assignTarget,
        'title' => '',
        'description' => '',
        'priority' => 'medium',
        'deadline' => null,
    ];

    if (strpos($rawPayload, '|') !== false || preg_match('/\b(title|priority|deadline|description)\s*:/i', $rawPayload)) {
        $segments = preg_split('/\s*\|\s*/', $rawPayload);
        foreach ($segments as $segment) {
            $segment = trim($segment);
            if ($segment === '') {
                continue;
            }

            if (preg_match('/^(title|priority|deadline|description)\s*:\s*(.+)$/i', $segment, $parts)) {
                $key = strtolower($parts[1]);
                $value = trim($parts[2]);
                if ($key === 'title') {
                    $taskData['title'] = $value;
                } elseif ($key === 'description') {
                    $taskData['description'] = $value;
                } elseif ($key === 'priority') {
                    $priority = strtolower($value);
                    if (in_array($priority, ['low', 'medium', 'high', 'urgent'], true)) {
                        $taskData['priority'] = $priority;
                    }
                } elseif ($key === 'deadline') {
                    $timestamp = strtotime($value);
                    if ($timestamp !== false) {
                        $taskData['deadline'] = date('Y-m-d', $timestamp);
                    }
                }
            } elseif ($taskData['title'] === '') {
                $taskData['title'] = $segment;
            } else {
                $taskData['description'] .= ($taskData['description'] === '' ? '' : "\n") . $segment;
            }
        }
    } else {
        $taskData['title'] = $rawPayload;
    }

    if ($taskData['title'] === '') {
        $taskData['title'] = $rawPayload;
    }

    return $taskData;
}

// Ensure tables exist
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS group_chat_messages (
        message_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL,
        message TEXT NOT NULL,
        has_mention BOOLEAN DEFAULT FALSE,
        has_task_assignment BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $pdo->exec("CREATE TABLE IF NOT EXISTS group_chat_mentions (
        mention_id INT AUTO_INCREMENT PRIMARY KEY,
        message_id INT NOT NULL,
        mentioned_user_id VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL,
        FOREIGN KEY (message_id) REFERENCES group_chat_messages(message_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
} catch (Exception $e) {
    // Tables likely already exist
}

// Fix collation if tables already exist with wrong collation
restore_error_handler(); // Temporarily restore default handler so ALTER warnings don't throw
try {
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_SILENT);
    $pdo->exec("ALTER TABLE group_chat_messages CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("ALTER TABLE group_chat_mentions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
}
// Re-enable custom error handler
set_error_handler(function($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = $_GET['action'] ?? '';

    if ($action === 'messages') {
        // Fetch messages, optionally after a given ID (for polling)
        $afterId = (int)($_GET['after_id'] ?? 0);
        $limit = min((int)($_GET['limit'] ?? 100), 200);

        if ($afterId > 0) {
            $stmt = $pdo->prepare("
                SELECT m.message_id, m.user_id, m.message, m.has_mention, m.has_task_assignment, m.created_at,
                       u.name AS sender_name, u.user_type AS sender_role, u.profile_photo
                FROM group_chat_messages m
                JOIN users u ON m.user_id COLLATE utf8mb4_unicode_ci = u.user_id
                WHERE m.message_id > ?
                ORDER BY m.message_id ASC
                LIMIT ?
            ");
            $stmt->execute([$afterId, $limit]);
        } else {
            // Initial load: get last N messages
            $stmt = $pdo->prepare("
                SELECT m.message_id, m.user_id, m.message, m.has_mention, m.has_task_assignment, m.created_at,
                       u.name AS sender_name, u.user_type AS sender_role, u.profile_photo
                FROM group_chat_messages m
                JOIN users u ON m.user_id COLLATE utf8mb4_unicode_ci = u.user_id
                ORDER BY m.message_id DESC
                LIMIT ?
            ");
            $stmt->execute([$limit]);
        }

        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // If initial load (DESC order), reverse to get chronological order
        if ($afterId <= 0) {
            $messages = array_reverse($messages);
        }

        // Fetch mentions for these messages
        if (!empty($messages)) {
            $messageIds = array_column($messages, 'message_id');
            $placeholders = implode(',', array_fill(0, count($messageIds), '?'));
            $mentionStmt = $pdo->prepare("
                SELECT gm.message_id, gm.mentioned_user_id, u.name AS mentioned_name
                FROM group_chat_mentions gm
                JOIN users u ON gm.mentioned_user_id COLLATE utf8mb4_unicode_ci = u.user_id
                WHERE gm.message_id IN ($placeholders)
            ");
            $mentionStmt->execute($messageIds);
            $mentions = $mentionStmt->fetchAll(PDO::FETCH_ASSOC);

            // Group mentions by message_id
            $mentionMap = [];
            foreach ($mentions as $mention) {
                $mentionMap[$mention['message_id']][] = $mention;
            }

            // Attach mentions to messages
            foreach ($messages as &$msg) {
                $msg['mentions'] = $mentionMap[$msg['message_id']] ?? [];
            }
            unset($msg);
        }

        echo json_encode(['success' => true, 'messages' => $messages]);
        exit;
    }

    if ($action === 'users') {
        // Fetch all active users for @mention autocomplete
        $stmt = $pdo->prepare("
            SELECT user_id, name, user_type, profile_photo
            FROM users
            WHERE status = 'active'
            ORDER BY name ASC
        ");
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'users' => $users]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['error' => 'Invalid action']);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        // Fallback to form data
        $input = $_POST;
    }

    $action = $input['action'] ?? '';

    if ($action === 'send') {
        $message = trim($input['message'] ?? '');
        $mentionedUserIds = $input['mentioned_user_ids'] ?? [];

        if (empty($message)) {
            http_response_code(400);
            echo json_encode(['error' => 'Message cannot be empty']);
            exit;
        }

        // Limit message length
        if (mb_strlen($message) > 2000) {
            $message = mb_substr($message, 0, 2000);
        }

        $hasMention = !empty($mentionedUserIds);
        $hasTaskAssignment = false;
        $taskCreated = null;

        $assignment = parseTaskAssignmentCommand($message);
        if ($assignment) {
            $assignTarget = $assignment['target'];
            $taskTitle = trim($assignment['title']);
            $taskPriority = $assignment['priority'];
            $taskDeadline = $assignment['deadline'];
            $extraDescription = trim($assignment['description']);

            // Find the target user by user_id or name
            $targetUser = null;

            // Try by user_id first
            $stmt = $pdo->prepare("SELECT user_id, name, user_type FROM users WHERE user_id = ? AND status = 'active' LIMIT 1");
            $stmt->execute([$assignTarget]);
            $targetUser = $stmt->fetch(PDO::FETCH_ASSOC);

            // If not found by user_id, try by name
            if (!$targetUser) {
                $stmt = $pdo->prepare("SELECT user_id, name, user_type FROM users WHERE REPLACE(LOWER(name), ' ', '_') = LOWER(?) AND status = 'active' LIMIT 1");
                $stmt->execute([str_replace(' ', '_', $assignTarget)]);
                $targetUser = $stmt->fetch(PDO::FETCH_ASSOC);
            }

            // Also try exact name match
            if (!$targetUser) {
                $stmt = $pdo->prepare("SELECT user_id, name, user_type FROM users WHERE LOWER(name) = LOWER(REPLACE(?, '_', ' ')) AND status = 'active' LIMIT 1");
                $stmt->execute([$assignTarget]);
                $targetUser = $stmt->fetch(PDO::FETCH_ASSOC);
            }

            if ($targetUser && !empty($taskTitle)) {
                // Create task in tasks table
                try {
                    $taskStmt = $pdo->prepare("
                        INSERT INTO tasks (assigned_to, assigned_by, title, description, priority, status, deadline, created_at)
                        VALUES (?, ?, ?, ?, ?, 'pending', ?, NOW())
                    ");
                    $taskDescription = "Task assigned via Team Chat by " . $currentUserName;
                    if ($extraDescription !== '') {
                        $taskDescription .= "\n" . $extraDescription;
                    }
                    $taskStmt->execute([
                        $targetUser['user_id'],
                        $currentUserId,
                        $taskTitle,
                        $taskDescription
                        ,
                        $taskPriority,
                        $taskDeadline
                    ]);
                    $hasTaskAssignment = true;
                    $taskCreated = [
                        'task_id' => $pdo->lastInsertId(),
                        'title' => $taskTitle,
                        'assigned_to' => $targetUser['name'],
                        'assigned_to_id' => $targetUser['user_id'],
                        'priority' => $taskPriority,
                        'deadline' => $taskDeadline,
                    ];

                    // Add target user to mentions if not already there
                    if (!in_array($targetUser['user_id'], $mentionedUserIds)) {
                        $mentionedUserIds[] = $targetUser['user_id'];
                        $hasMention = true;
                    }

                    logActivity($currentUserId, 'chat_task_assign', json_encode([
                        'task_title' => $taskTitle,
                        'assigned_to' => $targetUser['user_id'],
                        'priority' => $taskPriority,
                        'deadline' => $taskDeadline,
                    ]));
                } catch (Exception $e) {
                    // Task creation failed, still send the message
                    error_log("Chat task assignment failed: " . $e->getMessage());
                }
            }
        }

        // Insert message
        try {
            $stmt = $pdo->prepare("
                INSERT INTO group_chat_messages (user_id, message, has_mention, has_task_assignment, created_at)
                VALUES (?, ?, ?, ?, NOW())
            ");
            $stmt->execute([$currentUserId, $message, $hasMention ? 1 : 0, $hasTaskAssignment ? 1 : 0]);
            $messageId = $pdo->lastInsertId();

            // Insert mentions
            if (!empty($mentionedUserIds)) {
                $mentionStmt = $pdo->prepare("INSERT INTO group_chat_mentions (message_id, mentioned_user_id) VALUES (?, ?)");
                foreach ($mentionedUserIds as $mentionedUserId) {
                    try {
                        $mentionStmt->execute([$messageId, $mentionedUserId]);
                    } catch (Exception $e) {
                        // Skip invalid user IDs
                    }
                }
            }

            logActivity($currentUserId, 'chat_message', 'Sent message in team chat');

            $response = [
                'success' => true,
                'message_id' => (int)$messageId,
            ];
            if ($taskCreated) {
                $response['task_created'] = $taskCreated;
            }

            echo json_encode($response);
        } catch (Exception $e) {
            error_log("Chat message insert failed: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save message: ' . $e->getMessage()]);
        }
        exit;
    }

    http_response_code(400);
    echo json_encode(['error' => 'Invalid action']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
