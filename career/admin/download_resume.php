<?php
require_once __DIR__ . '/../config/auth.php';
requireLogin();
requireAdmin();

if (empty($_GET['file'])) {
    die("No file specified.");
}

// Extract just the filename to prevent directory traversal
$fileName = basename($_GET['file']);

// Validate extension
$ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
if (!in_array($ext, ['pdf', 'doc', 'docx'])) {
    die("Invalid file type.");
}

// Construct absolute path
$filePath = __DIR__ . '/../uploads/resumes/' . $fileName;

if (!file_exists($filePath)) {
    // Return a 404 header so the browser knows it's missing
    header("HTTP/1.0 404 Not Found");
    die("Error 404: The requested resume could not be found on the server. If this was applied on a different environment (e.g. local vs live), the file will not be present here.");
}

// Determine MIME type
$mimeTypes = [
    'pdf' => 'application/pdf',
    'doc' => 'application/msword',
    'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
$mime = $mimeTypes[$ext] ?? 'application/octet-stream';

// Output headers to stream the file securely
header('Content-Type: ' . $mime);
header('Content-Disposition: inline; filename="' . $fileName . '"');
header('Content-Transfer-Encoding: binary');
header('Accept-Ranges: bytes');
header('Content-Length: ' . filesize($filePath));

// Clear output buffer to prevent corruption
if (ob_get_length()) {
    ob_end_clean();
}

// Stream the file
readfile($filePath);
exit;
