<?php
defined('APP_RUNNING') or die('Direct access forbidden');

function apply_cors_headers(): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    $allowed = defined('ALLOWED_ORIGINS') ? ALLOWED_ORIGINS : [];

    if (in_array($origin, $allowed, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
    } else {
        // Fallback: echo first configured origin (safe default)
        header('Access-Control-Allow-Origin: ' . ($allowed[0] ?? ''));
    }

    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400');
    header('Vary: Origin');
}

function handle_preflight(): void {
    apply_cors_headers();
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

function json_response(mixed $data, int $code = 200): never {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function json_error(string $message, int $code = 400): never {
    json_response(['error' => $message], $code);
}
