<?php
/**
 * Karya Saarthi - Central Security Module
 * Implements OWASP Top 10 mitigations:
 *   A01 - CSRF protection
 *   A04 - Rate limiting (file-based, no Redis required)
 *   A07 - Secure session configuration
 *   A02 - Secure cookie flags
 *   A05 - Security response headers
 */

// ─── Secure Session Start ───────────────────────────────────────────────────
if (!function_exists('ks_runtime_log')) {
    function ks_runtime_log($message) {
        $logFile = __DIR__ . '/../uploads/runtime-error.log';
        $line = '[' . date('Y-m-d H:i:s') . '] ' . $message . PHP_EOL;
        @error_log($line, 3, $logFile);
    }
}

if (!function_exists('ks_register_runtime_handlers')) {
    function ks_register_runtime_handlers() {
        static $registered = false;
        if ($registered) {
            return;
        }
        $registered = true;

        set_exception_handler(function ($exception) {
            ks_runtime_log('Uncaught exception: ' . $exception->getMessage() . ' in ' . $exception->getFile() . ':' . $exception->getLine());
            if (!headers_sent()) {
                http_response_code(500);
            }
            exit('Something went wrong. Please try again later.');
        });

        register_shutdown_function(function () {
            $error = error_get_last();
            if (!$error) {
                return;
            }

            $fatalTypes = array(E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR);
            if (in_array($error['type'], $fatalTypes, true)) {
                ks_runtime_log('Fatal error: ' . $error['message'] . ' in ' . $error['file'] . ':' . $error['line']);
                if (!headers_sent()) {
                    http_response_code(500);
                }
            }
        });
    }
}

ks_register_runtime_handlers();

function secure_session_start() {
    if (session_status() === PHP_SESSION_ACTIVE) return;

    $secure   = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (strtolower($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    $lifetime = (int)(defined('SESSION_LIFETIME') ? SESSION_LIFETIME : 3600);

    if (PHP_VERSION_ID >= 70300) {
        session_set_cookie_params([
            'lifetime' => $lifetime,
            'path'     => '/',
            'domain'   => '',           // current domain only
            'secure'   => $secure,      // HTTPS-only in production
            'httponly' => true,         // no JS access
            'samesite' => 'Lax',        // Lax to preserve session cookies across redirects
        ]);
    } else {
        session_set_cookie_params($lifetime, '/; samesite=Lax', '', $secure, true);
    }

    ini_set('session.use_strict_mode',   '1');
    ini_set('session.use_only_cookies',  '1');
    ini_set('session.cookie_httponly',   '1');
    ini_set('session.cookie_samesite',   'Lax');
    ini_set('session.gc_maxlifetime',    (string)$lifetime);

    session_start();

    // Regenerate session ID periodically to prevent fixation (A07)
    if (!isset($_SESSION['_last_regen'])) {
        $_SESSION['_last_regen'] = time();
    } elseif (time() - $_SESSION['_last_regen'] > 900) { // every 15 min
        session_regenerate_id(true);
        $_SESSION['_last_regen'] = time();
    }
}

// ─── CSRF Protection (A01 / A08) ────────────────────────────────────────────
function csrf_token() {
    if (session_status() !== PHP_SESSION_ACTIVE) {
        secure_session_start();
    }
    if (empty($_SESSION['_csrf_token'])) {
        $_SESSION['_csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['_csrf_token'];
}

function csrf_field() {
    return '<input type="hidden" name="_csrf_token" value="' . htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8', false) . '">';
}

function csrf_validate() {
    if (session_status() !== PHP_SESSION_ACTIVE) {
        secure_session_start();
    }
    $token = $_POST['_csrf_token'] ?? '';
    if (empty($token) || empty($_SESSION['_csrf_token'])) {
        return false;
    }
    // Constant-time comparison to prevent timing attacks
    return hash_equals($_SESSION['_csrf_token'], $token);
}

// ─── Rate Limiter (A04 / A07) ────────────────────────────────────────────────
// File-based — works on any shared hosting without Redis/Memcached.
function rate_limit($key, $max_attempts = 5, $window_seconds = 900) {
    // Returns TRUE if allowed, FALSE if blocked.
    $dir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'ks_ratelimit';
    if (!is_dir($dir) && !@mkdir($dir, 0700, true)) {
        return true; // Fail open if directory creation fails
    }

    $file = $dir . DIRECTORY_SEPARATOR . 'rl_' . md5($key) . '.json';
    $now  = time();
    $data = ['count' => 0, 'window_start' => $now];

    if (file_exists($file)) {
        $raw = @file_get_contents($file);
        if ($raw) {
            $data = json_decode($raw, true) ?? $data;
        }
    }

    // Reset window if expired
    if ($now - ($data['window_start'] ?? 0) >= $window_seconds) {
        $data = ['count' => 0, 'window_start' => $now];
    }

    if (($data['count'] ?? 0) >= $max_attempts) {
        return false; // Blocked
    }

    $data['count'] = ($data['count'] ?? 0) + 1;
    @file_put_contents($file, json_encode($data), LOCK_EX);
    return true; // Allowed
}

function rate_limit_reset($key) {
    $dir  = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'ks_ratelimit';
    $file = $dir . DIRECTORY_SEPARATOR . 'rl_' . md5($key) . '.json';
    @unlink($file);
}

function rate_limit_remaining($key, $max_attempts = 5, $window_seconds = 900) {
    $dir  = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'ks_ratelimit';
    $file = $dir . DIRECTORY_SEPARATOR . 'rl_' . md5($key) . '.json';
    if (!file_exists($file)) return $max_attempts;

    $data = json_decode(@file_get_contents($file), true);
    if (!$data || (time() - $data['window_start']) >= $window_seconds) return $max_attempts;

    return max(0, $max_attempts - ($data['count'] ?? 0));
}

// ─── Secure Cookie Setter ────────────────────────────────────────────────────
function set_secure_cookie($name, $value, $expires = 0, $path = '/') {
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (strtolower($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    if (PHP_VERSION_ID >= 70300) {
        setcookie($name, $value, [
            'expires'  => $expires,
            'path'     => $path,
            'domain'   => '',
            'secure'   => $secure,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    } else {
        setcookie($name, $value, $expires, $path . '; samesite=Lax', '', $secure, true);
    }
}

// ─── Security Response Headers (A05) ─────────────────────────────────────────
function set_security_headers() {
    if (headers_sent()) return;

    // Prevent clickjacking
    header('X-Frame-Options: SAMEORIGIN');

    // Prevent MIME sniffing
    header('X-Content-Type-Options: nosniff');

    // Referrer control
    header('Referrer-Policy: strict-origin-when-cross-origin');

    // Permissions policy – disable unused browser features
    header('Permissions-Policy: camera=(), microphone=(), geolocation=(self), payment=(), usb=()');

    // HSTS – only send in production (HTTPS)
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
    }

    // Content-Security-Policy
    // Self-hosted CSS/fonts — only external dependency is unpkg (Lottie)
    $csp = implode('; ', [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://unpkg.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self'",
        "frame-ancestors 'self'",
        "base-uri 'self'",
        "form-action 'self'",
    ]);
    header("Content-Security-Policy: $csp");
}

// ─── Input Sanitization Helpers ──────────────────────────────────────────────
function sanitize_string($input, $max_length = 255) {
    $s = trim($input);
    $s = function_exists('mb_substr') ? mb_substr($s, 0, $max_length) : substr($s, 0, $max_length);
    return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

if (!function_exists('sanitize')) {
    function sanitize($data) {
        if ($data === null) return '';
        return htmlspecialchars(trim((string)$data), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }
}

function sanitize_email($input) {
    $email = function_exists('mb_substr') ? mb_substr($input, 0, 255) : substr($input, 0, 255);
    return filter_var(trim($email), FILTER_SANITIZE_EMAIL);
}

// ─── IP Helper ───────────────────────────────────────────────────────────────
function client_ip() {
    if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
        return filter_var($_SERVER['HTTP_CF_CONNECTING_IP'], FILTER_VALIDATE_IP) ?: '0.0.0.0';
    }
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        $firstIp = trim($ips[0]);
        if (filter_var($firstIp, FILTER_VALIDATE_IP)) {
            return $firstIp;
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}
