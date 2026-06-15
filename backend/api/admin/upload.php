<?php
defined('APP_RUNNING') or die('Direct access forbidden');

require_auth();

if (strtoupper($_SERVER['REQUEST_METHOD']) !== 'POST') {
    json_error('Method not allowed', 405);
}

if (empty($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    json_error('No file uploaded or upload error');
}

$file          = $_FILES['image'];
$allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$max_size      = 5 * 1024 * 1024; // 5 MB

if (!in_array($file['type'], $allowed_types, true)) {
    json_error('Invalid file type. Allowed: JPEG, PNG, WebP, GIF.');
}

if ($file['size'] > $max_size) {
    json_error('File too large. Maximum size is 5 MB.');
}

$ext         = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$filename    = uniqid('img_', true) . '.' . $ext;
$upload_dir  = __DIR__ . '/../../uploads/';

if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

if (!move_uploaded_file($file['tmp_name'], $upload_dir . $filename)) {
    json_error('Failed to save file.', 500);
}

$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$base_url  = $protocol . '://' . $_SERVER['HTTP_HOST'];

json_response(['url' => $base_url . '/uploads/' . $filename]);
