<?php
defined('APP_RUNNING') or die('Direct access forbidden');

function get_capi_settings(): array {
    $db   = get_db();
    $stmt = $db->query(
        "SELECT setting_key, setting_value FROM settings
         WHERE setting_key IN ('meta_pixel_id','meta_access_token','meta_test_event_code','meta_capi_enabled')"
    );
    $rows = $stmt->fetchAll();

    $cfg = [];
    foreach ($rows as $row) {
        $cfg[$row['setting_key']] = $row['setting_value'];
    }
    return $cfg;
}

function hash_user_data(string $value): string {
    return hash('sha256', strtolower(trim($value)));
}

function send_capi_purchase_event(array $order, array $items): void {
    try {
        $cfg = get_capi_settings();

        if (($cfg['meta_capi_enabled'] ?? '0') !== '1') {
            return;
        }

        $pixel_id     = $cfg['meta_pixel_id'] ?? '';
        $access_token = $cfg['meta_access_token'] ?? '';

        if ($pixel_id === '' || $access_token === '') {
            return;
        }

        $user_data = [
            'client_ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
            'client_user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
        ];

        if (!empty($order['customer_email'])) {
            $user_data['em'] = [hash_user_data($order['customer_email'])];
        }
        if (!empty($order['customer_phone'])) {
            $user_data['ph'] = [hash_user_data($order['customer_phone'])];
        }

        $contents = array_map(fn($it) => [
            'id'         => (string) $it['product_id'],
            'quantity'   => (int)    $it['quantity'],
            'item_price' => (float)  $it['price'],
        ], $items);

        $event = [
            'event_name'       => 'Purchase',
            'event_time'       => time(),
            'event_id'         => $order['event_id'],
            'action_source'    => 'website',
            'event_source_url' => SITE_URL,
            'user_data'        => $user_data,
            'custom_data'      => [
                'currency'     => 'BDT',
                'value'        => (float) $order['total'],
                'contents'     => $contents,
                'content_type' => 'product',
            ],
        ];

        $payload = ['data' => [$event]];

        if (!empty($cfg['meta_test_event_code'])) {
            $payload['test_event_code'] = $cfg['meta_test_event_code'];
        }

        $url = sprintf(
            'https://graph.facebook.com/v19.0/%s/events?access_token=%s',
            urlencode($pixel_id),
            urlencode($access_token)
        );

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 5,
        ]);
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($http_code < 200 || $http_code >= 300) {
            throw new RuntimeException("CAPI HTTP {$http_code}: {$response}");
        }
    } catch (Throwable $e) {
        $log_file = defined('CAPI_LOG_FILE') ? CAPI_LOG_FILE : __DIR__ . '/../logs/capi_errors.log';
        $dir = dirname($log_file);
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
        @file_put_contents(
            $log_file,
            '[' . date('Y-m-d H:i:s') . '] ' . $e->getMessage() . PHP_EOL,
            FILE_APPEND | LOCK_EX
        );
    }
}
