<?php
defined('APP_RUNNING') or die('Direct access forbidden');

require_auth();

$db     = get_db();
$method = strtoupper($_SERVER['REQUEST_METHOD']);

if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);

    $required = ['name', 'price'];
    foreach ($required as $field) {
        if (!isset($body[$field]) || $body[$field] === '') {
            json_error("Missing required field: {$field}");
        }
    }

    $price = (float) $body['price'];
    if ($price < 0) {
        json_error('Price must be non-negative');
    }

    $stock = isset($body['stock']) ? max(0, (int) $body['stock']) : 0;

    $stmt = $db->prepare(
        'INSERT INTO products (name, description, price, image_url, stock)
         VALUES (?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $body['name'],
        $body['description'] ?? null,
        $price,
        $body['image_url'] ?? null,
        $stock,
    ]);

    json_response(['id' => (int) $db->lastInsertId()], 201);
}

if ($method === 'PUT') {
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if ($id < 1) {
        json_error('Invalid product ID');
    }

    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body) {
        json_error('Invalid JSON body');
    }

    $allowed = ['name', 'description', 'price', 'image_url', 'stock'];
    $sets    = [];
    $values  = [];

    foreach ($allowed as $field) {
        if (array_key_exists($field, $body)) {
            $sets[]   = "{$field} = ?";
            $values[] = match($field) {
                'price' => (float) $body[$field],
                'stock' => max(0, (int) $body[$field]),
                default => $body[$field],
            };
        }
    }

    if (empty($sets)) {
        json_error('No fields to update');
    }

    $values[] = $id;
    $stmt     = $db->prepare('UPDATE products SET ' . implode(', ', $sets) . ' WHERE id = ?');
    $stmt->execute($values);

    json_response(['success' => true]);
}

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if ($id < 1) {
        json_error('Invalid product ID');
    }

    $stmt = $db->prepare('DELETE FROM products WHERE id = ?');
    $stmt->execute([$id]);

    if ($stmt->rowCount() === 0) {
        json_error('Product not found', 404);
    }

    json_response(['success' => true]);
}

json_error('Method not allowed', 405);
