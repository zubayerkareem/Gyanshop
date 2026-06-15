<?php
defined('APP_RUNNING') or die('Direct access forbidden');

if (strtoupper($_SERVER['REQUEST_METHOD']) !== 'POST') {
    json_error('Method not allowed', 405);
}

$body = json_decode(file_get_contents('php://input'), true);

if (empty($body['username']) || empty($body['password'])) {
    json_error('Username and password are required');
}

$db   = get_db();
$stmt = $db->prepare('SELECT id, password_hash FROM admins WHERE username = ? LIMIT 1');
$stmt->execute([$body['username']]);
$admin = $stmt->fetch();

// Always run password_verify even on miss to prevent timing attacks
$hash   = $admin['password_hash'] ?? '$2y$12$invalidhashpadding000000000000000000000000000000000000';
$valid  = password_verify($body['password'], $hash);

if (!$admin || !$valid) {
    json_error('Invalid credentials', 401);
}

$token      = create_session((int) $admin['id']);
$expires_at = date('Y-m-d\TH:i:s\Z', time() + SESSION_TTL);

json_response([
    'token'      => $token,
    'expires_at' => $expires_at,
]);
