<?php
defined('APP_RUNNING') or die('Direct access forbidden');

$method = strtoupper($_SERVER['REQUEST_METHOD']);

if ($method !== 'POST') {
    json_error('Method not allowed', 405);
}

$body = json_decode(file_get_contents('php://input'), true);

if (!$body) {
    json_error('Invalid JSON body');
}

// ── Validate required fields ──────────────────────────────
$required = ['customer_name', 'customer_phone', 'address', 'items'];
foreach ($required as $field) {
    if (empty($body[$field])) {
        json_error("Missing required field: {$field}");
    }
}

$items = $body['items'];
if (!is_array($items) || count($items) === 0) {
    json_error('Order must contain at least one item');
}

foreach ($items as $item) {
    if (empty($item['product_id']) || empty($item['quantity']) || (int) $item['quantity'] < 1) {
        json_error('Each item must have product_id and quantity >= 1');
    }
}

$db = get_db();

// ── Fetch prices from DB (never trust the client) ─────────
$product_ids   = array_map(fn($i) => (int) $i['product_id'], $items);
$placeholders  = implode(',', array_fill(0, count($product_ids), '?'));
$stmt          = $db->prepare("SELECT id, name, price, stock FROM products WHERE id IN ({$placeholders})");
$stmt->execute($product_ids);
$products_map  = [];
foreach ($stmt->fetchAll() as $p) {
    $products_map[$p['id']] = $p;
}

// ── Validate products exist and build order items ─────────
$order_items = [];
$total       = 0.00;

foreach ($items as $item) {
    $pid = (int) $item['product_id'];
    $qty = (int) $item['quantity'];

    if (!isset($products_map[$pid])) {
        json_error("Product ID {$pid} not found");
    }

    $product      = $products_map[$pid];
    $line_total   = (float) $product['price'] * $qty;
    $total       += $line_total;

    $order_items[] = [
        'product_id'   => $pid,
        'product_name' => $product['name'],
        'quantity'     => $qty,
        'price'        => (float) $product['price'],
    ];
}

// ── Generate UUID v4 for event_id ─────────────────────────
$event_id = sprintf(
    '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
    random_int(0, 0xffff), random_int(0, 0xffff),
    random_int(0, 0xffff),
    random_int(0, 0x0fff) | 0x4000,
    random_int(0, 0x3fff) | 0x8000,
    random_int(0, 0xffff), random_int(0, 0xffff), random_int(0, 0xffff)
);

// ── Insert order in a transaction ────────────────────────
$db->beginTransaction();
try {
    $stmt = $db->prepare(
        'INSERT INTO orders (customer_name, customer_phone, customer_email, address, total, event_id)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $body['customer_name'],
        $body['customer_phone'],
        $body['customer_email'] ?? null,
        $body['address'],
        round($total, 2),
        $event_id,
    ]);
    $order_id = (int) $db->lastInsertId();

    $item_stmt = $db->prepare(
        'INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
         VALUES (?, ?, ?, ?, ?)'
    );
    foreach ($order_items as $oi) {
        $item_stmt->execute([
            $order_id,
            $oi['product_id'],
            $oi['product_name'],
            $oi['quantity'],
            $oi['price'],
        ]);
    }

    $db->commit();
} catch (Throwable $e) {
    $db->rollBack();
    json_error('Failed to create order', 500);
}

// ── Fire Meta CAPI (never blocks the response) ───────────
$order_for_capi = [
    'event_id'       => $event_id,
    'total'          => round($total, 2),
    'customer_email' => $body['customer_email'] ?? '',
    'customer_phone' => $body['customer_phone'],
];
send_capi_purchase_event($order_for_capi, $order_items);

json_response([
    'order_id' => $order_id,
    'event_id' => $event_id,
    'total'    => round($total, 2),
], 201);
