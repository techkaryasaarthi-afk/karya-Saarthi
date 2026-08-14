<?php
// Karya Saarthi Career Portal - Database Configuration

define('DB_HOST', 'localhost');
define('DB_NAME', 'u541656631_career');
define('DB_USER', 'u541656631_career');
define('DB_PASS', 'Career@9868');
define('DB_CHARSET', 'utf8mb4');


// Site Configuration
define('SITE_NAME', 'Karya Saarthi Career');
define('SITE_URL', 'https://career.karyasaarthi.com');
define('SITE_EMAIL', 'hr@karyasaarthi.com');

// Auto-detect Base Path securely
if (!defined('BASE_PATH')) {
    $scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? ''));
    $base = preg_replace('#/(admin|user-panel|api|config|includes)$#i', '', $scriptDir);
    define('BASE_PATH', ($base === '/' || $base === '\\') ? '' : rtrim($base, '/'));
}

// Session Configuration
define('SESSION_LIFETIME', 3600); // 1 hour

// Commission Rate
define('CAMPUS_SAARTHI_COMMISSION', 0.10); // 10%

// Database Connection
function getDBConnection()
{
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            if (function_exists('ks_runtime_log')) {
                ks_runtime_log("Database connection failed: " . $e->getMessage());
            }
            error_log("Database connection failed: " . $e->getMessage());
            die("Database connection failed. Please try again later.");
        }
    }
    return $pdo;
}

// Security Functions
if (!function_exists('sanitize')) {
    function sanitize($input)
    {
        return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
    }
}

function generateToken($length = 32)
{
    return bin2hex(random_bytes($length));
}

// Job Categories (7 on website)
define('JOB_CATEGORIES', [
    'employee' => ['label' => 'Internal Member', 'icon' => 'fa-user-tie', 'color' => 'amber', 'badge' => 'Full-time', 'title' => 'Core Team Member � Operations, Marketing, HR, Accounts, Tech', 'who' => 'Full-time professionals for all internal departments', 'certificate' => false],
    'pillar_post' => ['label' => '5 Pillar Post', 'icon' => 'fa-landmark', 'color' => 'teal', 'badge' => 'Pillar', 'title' => 'Pillar Executive � Campus / Digital / Calling / Government / Market Saarthi', 'who' => 'Role-specific candidates for each of the 5 growth pillars', 'certificate' => true],
    'campus_saarthi' => ['label' => 'Campus Saarthi', 'icon' => 'fa-graduation-cap', 'color' => 'purple', 'badge' => 'Student', 'title' => 'Campus Brand Ambassador � Student Leader', 'who' => 'College students who want to lead, earn, and grow', 'certificate' => true],
    'vendor' => ['label' => 'Vendor / Freelancer', 'icon' => 'fa-briefcase', 'color' => 'blue', 'badge' => 'Freelance', 'title' => 'Expert Vendor Partner � Project Delivery Specialist', 'who' => 'Freelancers and professionals who deliver client projects', 'certificate' => false],
    'intern' => ['label' => 'Intern', 'icon' => 'fa-book-reader', 'color' => 'orange', 'badge' => 'Internship', 'title' => 'Professional Intern � Department-Specific', 'who' => 'Students or freshers for 1�6 month stipend-based internship', 'certificate' => true],
    'part_time' => ['label' => 'Part-Time / Remote', 'icon' => 'fa-clock', 'color' => 'pink', 'badge' => 'Flexible', 'title' => 'Remote Associate � Part-time Contributor', 'who' => 'Work-from-home professionals for content, calling, design roles', 'certificate' => false],
    'teaching_expert' => ['label' => 'Teaching Expert', 'icon' => 'fa-chalkboard-teacher', 'color' => 'green', 'badge' => 'Expert', 'title' => 'Expert Trainer & Live Project Instructor', 'who' => 'Professors, PhD scholars, and professionals with 5+ years expertise', 'certificate' => true],
]);

// Pillar Types
define('PILLAR_TYPES', [
    'campus_saarthi' => 'Saarthi',
    'digital_saarthi' => 'Digital Saarthi',
    'calling_saarthi' => 'Calling Saarthi',
    'government_saarthi' => 'Government Saarthi',
    'market_saarthi' => 'Market Saarthi',
]);

function generateUserId($type)
{
    $prefixes = [
        'vendor' => 'VND',
        'employee' => 'EMP',
        'intern' => 'INT',
        'campus_saarthi' => 'CSA',
        'admin' => 'ADM',
        'freelancer' => 'FRL',
        'pillar_post' => 'PLR',
        'part_time' => 'PRT',
        'teaching_expert' => 'TRN'
    ];
    $prefix = $prefixes[$type] ?? 'USR';
    $pdo = getDBConnection();
    $stmt = $pdo->prepare("SELECT user_id FROM users WHERE user_id LIKE ? ORDER BY user_id DESC LIMIT 1");
    $stmt->execute([$prefix . '-%']);
    $last = $stmt->fetchColumn();
    if ($last) {
        $num = intval(substr($last, strlen($prefix) + 1)) + 1;
    } else {
        $num = 1;
    }
    return $prefix . '-' . str_pad($num, 3, '0', STR_PAD_LEFT);
}

function generateReferralCode($college, $year)
{
    $collegeStr = (string)($college ?? 'COL');
    $collegeCode = strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $collegeStr) ?: 'COL', 0, 3));
    return 'CS-' . $collegeCode . '-' . ($year ?? date('Y')) . '-' . str_pad((string)mt_rand(1, 999), 3, '0', STR_PAD_LEFT);
}

function generateLeadId($csId)
{
    return 'LD-' . ($csId ?? '0') . '-' . date('Y') . '-' . str_pad((string)mt_rand(1, 999), 3, '0', STR_PAD_LEFT);
}
