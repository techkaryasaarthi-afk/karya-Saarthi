<?php
$pageTitle = 'Events Manager';
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireAdmin();
$pdo = getDBConnection();
$message = '';
$messageType = '';
if (isset($_GET['msg']) && $_GET['msg'] === 'success') {
    $message = 'Operation completed successfully!';
    $messageType = 'success';
}

$eventTypes = ['hackathon', 'seminar', 'webinar', 'workshop'];
$statusOptions = ['upcoming', 'live', 'past'];

try { $pdo->exec("ALTER TABLE events ADD COLUMN theme VARCHAR(200) NULL"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE events ADD COLUMN calendar_link VARCHAR(500) NULL"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE events ADD COLUMN created_by VARCHAR(50) NULL"); } catch (Exception $e) {}

$eventIdColumn = 'id';
try {
    $eventColumns = $pdo->query("SHOW COLUMNS FROM events")->fetchAll(PDO::FETCH_COLUMN);
    if (in_array('event_id', $eventColumns, true)) {
        $eventIdColumn = 'event_id';
    }
} catch (Exception $e) {}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    try {
        switch ($action) {
            case 'create_event':
                $type = $_POST['event_type'] ?? 'seminar';
                $title = sanitize($_POST['title'] ?? '');
                $theme = sanitize($_POST['theme'] ?? '');
                $desc = $_POST['description'] ?? '';
                $speaker = sanitize($_POST['speaker_name'] ?? '');
                $prize = sanitize($_POST['prize_pool'] ?? '');
                $date = $_POST['event_date'] ?? '';
                $regLink = $_POST['registration_link'] ?? '';
                $calLink = $_POST['calendar_link'] ?? '';
                $status = $_POST['status'] ?? 'upcoming';

                if (empty($title) || empty($date)) {
                    $message = 'Title and Event Date are required.';
                    $messageType = 'error';
                } else {
                    $stmt = $pdo->prepare("INSERT INTO events (event_type, title, theme, description, speaker_name, prize_pool, date_start, registration_link, calendar_link, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([$type, $title, $theme, $desc, $speaker, $prize, $date, $regLink, $calLink, $status, $_SESSION['user_id']]);
                    $message = 'Event created successfully!';
                    $messageType = 'success';
                }
                break;

            case 'update_event':
                $eventId = intval($_POST['id'] ?? 0);
                $type = $_POST['event_type'] ?? 'seminar';
                $title = sanitize($_POST['title'] ?? '');
                $theme = sanitize($_POST['theme'] ?? '');
                $desc = $_POST['description'] ?? '';
                $speaker = sanitize($_POST['speaker_name'] ?? '');
                $prize = sanitize($_POST['prize_pool'] ?? '');
                $date = $_POST['event_date'] ?? '';
                $regLink = $_POST['registration_link'] ?? '';
                $calLink = $_POST['calendar_link'] ?? '';
                $status = $_POST['status'] ?? 'upcoming';

                if (!$eventId || empty($title) || empty($date)) {
                    $message = 'Title and Event Date are required.';
                    $messageType = 'error';
                } else {
                    $stmt = $pdo->prepare("UPDATE events SET event_type=?, title=?, theme=?, description=?, speaker_name=?, prize_pool=?, date_start=?, registration_link=?, calendar_link=?, status=? WHERE {$eventIdColumn}=?");
                    $stmt->execute([$type, $title, $theme, $desc, $speaker, $prize, $date, $regLink, $calLink, $status, $eventId]);
                    $message = 'Event updated successfully!';
                    $messageType = 'success';
                }
                break;

            case 'delete_event':
                $eventId = intval($_POST['id'] ?? 0);
                if ($eventId) {
                    $pdo->prepare("DELETE FROM events WHERE {$eventIdColumn} = ?")->execute([$eventId]);
                    $message = 'Event deleted!';
                    $messageType = 'success';
                }
                break;
        }
        if ($messageType === 'success') {
            header('Location: ' . $_SERVER['PHP_SELF'] . '?msg=success');
            exit;
        }
    } catch (Exception $e) {
        $message = 'Error: ' . $e->getMessage();
        $messageType = 'error';
    }
}

$events = $pdo->query("SELECT {$eventIdColumn} AS id, event_type, title, theme, description, speaker_name, prize_pool, date_start AS event_date, registration_link, calendar_link, status, created_at, updated_at FROM events ORDER BY date_start DESC")->fetchAll();

$editEvent = null;
if (isset($_GET['edit'])) {
    $stmt = $pdo->prepare("SELECT {$eventIdColumn} AS id, event_type, title, theme, description, speaker_name, prize_pool, date_start AS event_date, registration_link, calendar_link, status, created_at, updated_at FROM events WHERE {$eventIdColumn} = ?");
    $stmt->execute([intval($_GET['edit'])]);
    $editEvent = $stmt->fetch();
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="flex min-h-[calc(100vh-56px)] bg-surface-2">
    <?php require_once __DIR__ . '/../includes/dashboard-sidebar.php'; ?>
    <div class="flex-1 dashboard-content-area">
        <div class="p-4 sm:p-6 lg:p-8">

            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-ink"><i class="fas fa-calendar-alt text-primary-500 mr-2"></i>Events Manager</h1>
                    <p class="text-sm text-ink-muted mt-1">Manage hackathons, seminars, webinars, and workshops.</p>
                </div>
                <div class="mt-3 sm:mt-0">
                    <span class="text-sm text-ink-muted"><?= count($events) ?> events total</span>
                </div>
            </div>

            <?php if ($message): ?>
            <div class="mb-6 p-4 rounded-xl border <?= $messageType === 'success' ? 'bg-green-500/10 border-green-200 text-green-800' : 'bg-red-500/10 border-red-500/20 text-red-400' ?>">
                <i class="fas <?= $messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle' ?> mr-2"></i>
                <?= $message ?>
            </div>
            <?php endif; ?>

            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline p-6 mb-6">
                <h2 class="text-lg font-semibold text-ink mb-4">
                    <i class="fas <?= $editEvent ? 'fa-edit' : 'fa-plus-circle' ?> mr-2 text-primary-500"></i>
                    <?= $editEvent ? 'Edit Event' : 'Create Event' ?>
                </h2>
                <form method="POST">
                    <input type="hidden" name="action" value="<?= $editEvent ? 'update_event' : 'create_event' ?>">
                    <?php if ($editEvent): ?>
                        <input type="hidden" name="id" value="<?= $editEvent['id'] ?>">
                    <?php endif; ?>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Title *</label>
                            <input type="text" name="title" required value="<?= htmlspecialchars($editEvent['title'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Event Type</label>
                            <select name="event_type" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                <?php foreach ($eventTypes as $type): ?>
                                <option value="<?= $type ?>" <?= ($editEvent['event_type'] ?? '') === $type ? 'selected' : '' ?>><?= ucfirst($type) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Theme (optional)</label>
                            <input type="text" name="theme" value="<?= htmlspecialchars($editEvent['theme'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Event Date & Time *</label>
                            <input type="datetime-local" name="event_date" required value="<?= $editEvent ? date('Y-m-d\TH:i', strtotime($editEvent['event_date'])) : '' ?>" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Speaker Name (optional)</label>
                            <input type="text" name="speaker_name" value="<?= htmlspecialchars($editEvent['speaker_name'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Prize Pool (optional)</label>
                            <input type="text" name="prize_pool" value="<?= htmlspecialchars($editEvent['prize_pool'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-ink-muted mb-1">Description <span class="text-ink-muted text-xs">(Plain text, line breaks supported)</span></label>
                        <textarea name="description" rows="4" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"><?= htmlspecialchars($editEvent['description'] ?? '', ENT_QUOTES, 'UTF-8', false) ?></textarea>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Registration Link (optional)</label>
                            <input type="url" name="registration_link" value="<?= htmlspecialchars($editEvent['registration_link'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Calendar Link (optional)</label>
                            <input type="url" name="calendar_link" value="<?= htmlspecialchars($editEvent['calendar_link'] ?? '', ENT_QUOTES, 'UTF-8', false) ?>" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-ink-muted mb-1">Status</label>
                            <select name="status" class="w-full border border-hairline bg-surface-2 text-ink rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                <?php foreach ($statusOptions as $st): ?>
                                <option value="<?= $st ?>" <?= ($editEvent['status'] ?? 'upcoming') === $st ? 'selected' : '' ?>><?= ucfirst($st) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>

                    <div class="flex items-center gap-3 mt-6">
                        <button type="submit" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition">
                            <i class="fas <?= $editEvent ? 'fa-save' : 'fa-plus' ?> mr-1"></i>
                            <?= $editEvent ? 'Update Event' : 'Create Event' ?>
                        </button>
                        <?php if ($editEvent): ?>
                            <a href="<?= BASE_PATH ?>/admin/events.php" class="border border-hairline bg-surface-2 text-ink hover:bg-surface-2 text-ink-muted px-6 py-2.5 rounded-lg text-sm font-medium transition">Cancel</a>
                        <?php endif; ?>
                    </div>
                </form>
            </div>

            <div class="bg-surface-1 rounded-xl shadow-none border border-hairline overflow-hidden">
                <div class="px-6 py-4 border-b border-hairline">
                    <h2 class="text-lg font-semibold text-ink"><i class="fas fa-list mr-2 text-primary-500"></i>All Events</h2>
                </div>

                <?php if (empty($events)): ?>
                <div class="p-10 text-center">
                    <i class="fas fa-calendar-alt text-4xl text-ink-muted opacity-50 mb-3"></i>
                    <p class="text-ink-muted">No events yet.</p>
                </div>
                <?php else: ?>
                <div class="divide-y divide-hairline">
                    <?php foreach ($events as $ev): ?>
                    <div class="px-6 py-4 hover:bg-surface-2 transition">
                        <div class="flex items-start justify-between gap-4">
                            <div class="flex-1 dashboard-content-area min-w-0">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"><?= ucfirst($ev['event_type']) ?></span>
                                    <span class="text-xs text-ink-muted"><?= date('d M Y, h:i A', strtotime($ev['event_date'])) ?></span>
                                    <span class="text-xs px-2 py-0.5 rounded-full <?= $ev['status'] === 'live' ? 'bg-green-100 text-green-700' : ($ev['status'] === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-surface-2 text-ink') ?>"><?= ucfirst($ev['status']) ?></span>
                                </div>
                                <h3 class="text-sm font-semibold text-ink"><?= htmlspecialchars($ev['title'], ENT_QUOTES, 'UTF-8', false) ?></h3>
                                <p class="text-sm text-ink-muted mt-1 line-clamp-2"><?= nl2br(htmlspecialchars($ev['description'], ENT_QUOTES, 'UTF-8', false)) ?></p>
                            </div>
                            <div class="flex items-center gap-1 flex-shrink-0">
                                <a href="<?= BASE_PATH ?>/admin/events.php?edit=<?= $ev['id'] ?>" class="text-primary-600 hover:text-primary-800 text-sm px-2 py-1.5 rounded-lg hover:bg-primary-50 transition">
                                    <i class="fas fa-edit"></i>
                                </a>
                                <form method="POST" onsubmit="return confirm('Delete this event?')" class="inline">
                                    <input type="hidden" name="action" value="delete_event">
                                    <input type="hidden" name="id" value="<?= $ev['id'] ?>">
                                    <button type="submit" class="text-red-600 hover:text-red-400 text-sm px-2 py-1.5 rounded-lg hover:bg-red-500/10 transition">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>
            </div>

        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
