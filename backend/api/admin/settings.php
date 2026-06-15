<?php
defined('APP_RUNNING') or die('Direct access forbidden');

require_auth();

$db     = get_db();
$method = strtoupper($_SERVER['REQUEST_METHOD']);

$allowed_keys = ['meta_pixel_id', 'meta_access_token', 'meta_test_event_code', 'meta_capi_enabled'];

if ($method === 'GET') {
    $placeholders = implode(',', array_fill(0, count($allowed_keys), '?'));
    $stmt = $db->prepare("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ({$placeholders})");
    $stmt->execute($allowed_keys);
    $rows = $stmt->fetchAll();

    $result = [];
    foreach ($rows as $row) {
        $result[$row['setting_key']] = $row['setting_value'];
    }

    json_response($result);
}

if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);

    if (!$body) {
        json_error('Invalid JSON body');
    }

    $stmt = $db->prepare(
        'INSERT INTO settings (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)'
    );

    foreach ($allowed_keys as $key) {
        if (array_key_exists($key, $body)) {
            $stmt->execute([$key, (string) $body[$key]]);
        }
    }

    json_response(['success' => true]);
}

json_error('Method not allowed', 405);
