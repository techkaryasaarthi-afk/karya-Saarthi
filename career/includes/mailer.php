<?php
/**
 * Karya Saarthi - SMTP Email Helper
 * Uses direct SMTP connection to Hostinger mail server
 * Much more reliable than PHP mail()
 */

// ==================== SMTP CONFIG ====================
// Update these with your Hostinger email credentials
if (!defined('SMTP_HOST'))
    define('SMTP_HOST', 'smtp.hostinger.com');
if (!defined('SMTP_PORT'))
    define('SMTP_PORT', 465);
if (!defined('SMTP_USER'))
    define('SMTP_USER', 'support@karyasaarthi.com');       // Your Hostinger email
if (!defined('SMTP_PASS'))
    define('SMTP_PASS', 'Rajesh@#9878');       // Your email password - UPDATE THIS!
if (!defined('SMTP_FROM_NAME'))
    define('SMTP_FROM_NAME', 'Karya Saarthi');
if (!defined('SMTP_SECURE'))
    define('SMTP_SECURE', 'ssl');                       // ssl for port 465
// =====================================================

function sendEmail($to, $subject, $htmlBody, $replyTo = '')
{
    $result = false;

    // If SMTP password is not configured, skip SMTP and use mail() directly
    if (SMTP_PASS === 'YourEmailPasswordHere' || empty(SMTP_PASS)) {
        $result = fallbackMail($to, $subject, $htmlBody, $replyTo);
    } else {
        // Try SMTP first, fallback to mail()
        $result = sendViaSMTP($to, $subject, $htmlBody, $replyTo);
    }

    // Log result
    $status = $result ? 'SENT' : 'FAILED';
    $logMsg = date('Y-m-d H:i:s') . " | To: $to | Subject: $subject | $status\n";
    @file_put_contents(__DIR__ . '/../uploads/email-log.txt', $logMsg, FILE_APPEND);

    return $result;
}

function sendViaSMTP($to, $subject, $htmlBody, $replyTo = '')
{
    $from = SMTP_USER;
    $fromName = SMTP_FROM_NAME;

    // Build email message
    $boundary = md5(uniqid(time()));
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: $fromName <$from>\r\n";
    $headers .= "To: $to\r\n";
    if ($replyTo) {
        $headers .= "Reply-To: $replyTo\r\n";
    }
    $headers .= "Subject: $subject\r\n";
    $headers .= "X-Mailer: KaryaSaarthi/1.0\r\n";
    $headers .= "Date: " . date('r') . "\r\n";

    $message = $headers . "\r\n" . $htmlBody;

    try {
        // Open SSL connection to SMTP server
        $context = stream_context_create([
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            ]
        ]);

        $socket = stream_socket_client(
            'ssl://' . SMTP_HOST . ':' . SMTP_PORT,
            $errno,
            $errstr,
            30,
            STREAM_CLIENT_CONNECT,
            $context
        );

        if (!$socket) {
            logSmtpError("Connection failed: $errstr ($errno)");
            return fallbackMail($to, $subject, $htmlBody, $replyTo);
        }

        // Set timeout
        stream_set_timeout($socket, 30);

        // Read greeting
        $response = smtpRead($socket);
        if (strpos($response, '220') !== 0) {
            logSmtpError("Bad greeting: $response");
            fclose($socket);
            return fallbackMail($to, $subject, $htmlBody, $replyTo);
        }

        // EHLO
        smtpSend($socket, "EHLO " . gethostname());
        $response = smtpRead($socket);

        // AUTH LOGIN
        smtpSend($socket, "AUTH LOGIN");
        $response = smtpRead($socket);
        if (strpos($response, '334') !== 0) {
            logSmtpError("AUTH not accepted: $response");
            fclose($socket);
            return fallbackMail($to, $subject, $htmlBody, $replyTo);
        }

        // Send username (base64)
        smtpSend($socket, base64_encode(SMTP_USER));
        $response = smtpRead($socket);

        // Send password (base64)
        smtpSend($socket, base64_encode(SMTP_PASS));
        $response = smtpRead($socket);
        if (strpos($response, '235') !== 0) {
            logSmtpError("AUTH failed: $response (Check SMTP_PASS in mailer.php)");
            fclose($socket);
            return fallbackMail($to, $subject, $htmlBody, $replyTo);
        }

        // MAIL FROM
        smtpSend($socket, "MAIL FROM:<$from>");
        $response = smtpRead($socket);
        if (strpos($response, '250') !== 0) {
            logSmtpError("MAIL FROM failed: $response");
            fclose($socket);
            return false;
        }

        // RCPT TO
        smtpSend($socket, "RCPT TO:<$to>");
        $response = smtpRead($socket);
        if (strpos($response, '250') !== 0) {
            logSmtpError("RCPT TO failed: $response");
            fclose($socket);
            return false;
        }

        // DATA
        smtpSend($socket, "DATA");
        $response = smtpRead($socket);
        if (strpos($response, '354') !== 0) {
            logSmtpError("DATA failed: $response");
            fclose($socket);
            return false;
        }

        // Send the email content
        fwrite($socket, $message . "\r\n.\r\n");
        $response = smtpRead($socket);
        if (strpos($response, '250') !== 0) {
            logSmtpError("Message send failed: $response");
            fclose($socket);
            return false;
        }

        // QUIT
        smtpSend($socket, "QUIT");
        fclose($socket);

        return true;

    } catch (Exception $e) {
        logSmtpError("Exception: " . $e->getMessage());
        return fallbackMail($to, $subject, $htmlBody, $replyTo);
    }
}

function smtpSend($socket, $data)
{
    fwrite($socket, $data . "\r\n");
}

function smtpRead($socket)
{
    $response = '';
    while ($line = fgets($socket, 515)) {
        $response .= $line;
        // If 4th char is space, it's the last line of response
        if (isset($line[3]) && $line[3] === ' ')
            break;
    }
    return trim($response);
}

function logSmtpError($msg)
{
    $logMsg = date('Y-m-d H:i:s') . " | SMTP ERROR: $msg\n";
    @file_put_contents(__DIR__ . '/../uploads/email-log.txt', $logMsg, FILE_APPEND);
}

// Fallback to PHP mail() if SMTP fails
function fallbackMail($to, $subject, $htmlBody, $replyTo = '')
{
    $from = SMTP_USER;
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= "From: " . SMTP_FROM_NAME . " <$from>\r\n";
    if ($replyTo) {
        $headers .= "Reply-To: $replyTo\r\n";
    }

    $result = @mail($to, $subject, $htmlBody, $headers);
    if (!$result) {
        logSmtpError("Fallback mail() also FAILED for: $to");
    } else {
        $logMsg = date('Y-m-d H:i:s') . " | FALLBACK mail() SENT to: $to\n";
        @file_put_contents(__DIR__ . '/../uploads/email-log.txt', $logMsg, FILE_APPEND);
    }
    return $result;
}





