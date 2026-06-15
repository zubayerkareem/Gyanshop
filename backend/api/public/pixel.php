<?php
defined('APP_RUNNING') or die('Direct access forbidden');

if (strtoupper($_SERVER['REQUEST_METHOD']) !== 'GET') {
    json_error('Method not allowed', 405);
}

$db   = get_db();
$stmt = $db->prepare("SELECT setting_value FROM settings WHERE setting_key = 'meta_pixel_id' LIMIT 1");
$stmt->execute();
$row  = $stmt->fetch();

json_response(['pixel_id' => $row['setting_value'] ?? '']);
