<?php
define('APP_RUNNING', true);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers/cors.php';
require_once __DIR__ . '/helpers/db.php';
require_once __DIR__ . '/helpers/auth.php';
require_once __DIR__ . '/helpers/meta_capi.php';

// Apply CORS and handle preflight for every request
handle_preflight();

$uri    = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$uri    = '/' . trim($uri, '/');
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

// ── Public routes ────────────────────────────────────────
if ($uri === '/api/products' || strpos($uri, '/api/products') === 0) {
    require __DIR__ . '/api/products.php';
}

if ($uri === '/api/orders') {
    require __DIR__ . '/api/orders.php';
}

if ($uri === '/api/public/pixel') {
    require __DIR__ . '/api/public/pixel.php';
}

// ── Admin routes ─────────────────────────────────────────
if ($uri === '/api/admin/login') {
    require __DIR__ . '/api/admin/login.php';
}

if ($uri === '/api/admin/orders') {
    require __DIR__ . '/api/admin/orders.php';
}

if ($uri === '/api/admin/products') {
    require __DIR__ . '/api/admin/products.php';
}

if ($uri === '/api/admin/settings') {
    require __DIR__ . '/api/admin/settings.php';
}

if ($uri === '/api/admin/upload') {
    require __DIR__ . '/api/admin/upload.php';
}

json_error('Not found', 404);
