<?php
defined('APP_RUNNING') or die('Direct access forbidden');

$db     = get_db();
$method = strtoupper($_SERVER['REQUEST_METHOD']);

if ($method !== 'GET') {
    json_error('Method not allowed', 405);
}

$id = isset($_GET['id']) ? (int) $_GET['id'] : null;

if ($id !== null) {
    // Single product
    $stmt = $db->prepare('SELECT * FROM products WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $product = $stmt->fetch();

    if (!$product) {
        json_error('Product not found', 404);
    }

    json_response($product);
}

// All products
$stmt = $db->query('SELECT * FROM products ORDER BY created_at DESC');
json_response($stmt->fetchAll());
