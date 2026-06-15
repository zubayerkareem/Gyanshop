<?php
defined('APP_RUNNING') or die('Direct access forbidden');

require_auth();

$db     = get_db();
$method = strtoupper($_SERVER['REQUEST_METHOD']);

if ($method === 'GET') {
    $stmt   = $db->query('SELECT * FROM orders ORDER BY created_at DESC');
    $orders = $stmt->fetchAll();

    // Attach items to each order
    if (count($orders) > 0) {
        $order_ids    = array_column($orders, 'id');
        $placeholders = implode(',', array_fill(0, count($order_ids), '?'));
        $stmt         = $db->prepare(
            "SELECT * FROM order_items WHERE order_id IN ({$placeholders}) ORDER BY id"
        );
        $stmt->execute($order_ids);
        $all_items = $stmt->fetchAll();

        // Group items by order_id
        $items_map = [];
        foreach ($all_items as $item) {
            $items_map[$item['order_id']][] = $item;
        }

        foreach ($orders as &$order) {
            $order['items'] = $items_map[$order['id']] ?? [];
        }
        unset($order);
    }

    json_response($orders);
}

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if ($id < 1) {
        json_error('Invalid order ID');
    }

    $stmt = $db->prepare('DELETE FROM orders WHERE id = ?');
    $stmt->execute([$id]);

    if ($stmt->rowCount() === 0) {
        json_error('Order not found', 404);
    }

    json_response(['success' => true]);
}

json_error('Method not allowed', 405);
