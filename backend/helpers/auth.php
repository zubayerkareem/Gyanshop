<?php
defined('APP_RUNNING') or die('Direct access forbidden');

function generate_token(): string {
    return bin2hex(random_bytes(64)); // 128-char hex string
}

function create_session(int $admin_id): string {
    $token      = generate_token();
    $expires_at = date('Y-m-d H:i:s', time() + SESSION_TTL);
    $db         = get_db();

    $stmt = $db->prepare(
        'INSERT INTO sessions (token, admin_id, expires_at) VALUES (?, ?, ?)'
    );
    $stmt->execute([$token, $admin_id, $expires_at]);

    return $token;
}

function require_auth(): array {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    if (!preg_match('/^Bearer\s+(.+)$/i', $header, $matches)) {
        json_error('Unauthorized', 401);
    }

    $token = $matches[1];
    $db    = get_db();

    $stmt = $db->prepare(
        'SELECT s.admin_id, a.username
         FROM sessions s
         JOIN admins a ON a.id = s.admin_id
         WHERE s.token = ? AND s.expires_at > NOW()'
    );
    $stmt->execute([$token]);
    $row = $stmt->fetch();

    if (!$row) {
        json_error('Unauthorized', 401);
    }

    // Purge expired sessions lazily (1-in-100 chance to avoid overhead)
    if (random_int(1, 100) === 1) {
        $db->exec('DELETE FROM sessions WHERE expires_at <= NOW()');
    }

    return $row;
}
