<?php
// Copy this file to config.php and fill in your values.
// config.php is gitignored — never commit it.

// ── Database ──────────────────────────────────────────────
define('DB_HOST', 'localhost');
define('DB_NAME', 'bengalse_shopuser');
define('DB_USER', 'bengalse_789023ghjks');
define('DB_PASS', 'HS)(q=ay=z$tU!6m');
define('DB_CHARSET', 'utf8mb4');

// ── Session secret ───────────────────────────────────────
// A long random string used to sign nothing here (sessions stored in DB).
// Used as a pepper for extra security — keep it private.
define('APP_SECRET', 'change-this-to-a-long-random-string-minimum-32-chars');

// ── CORS ─────────────────────────────────────────────────
// List every origin that may call this API.
// Example: ['https://mystore.vercel.app', 'http://localhost:5173']
define('ALLOWED_ORIGINS', [
    'https://your-store.vercel.app',
]);

// ── Site URL (used in Meta CAPI event_source_url) ────────
define('SITE_URL', 'https://your-store.vercel.app');

// ── Token TTL (seconds) ──────────────────────────────────
define('SESSION_TTL', 86400); // 24 hours

// ── Error log for Meta CAPI failures ─────────────────────
define('CAPI_LOG_FILE', __DIR__ . '/logs/capi_errors.log');
