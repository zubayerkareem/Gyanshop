# Ecommerce Backend

Plain PHP REST API (no framework). Designed for cPanel shared hosting with MySQL.

## Default admin credentials

| Username | Password   |
|----------|------------|
| admin    | Admin1234! |

**Change these immediately after first deploy** — see the Security section below.

---

## Setup on cPanel

### 1. Create the database

1. cPanel → **MySQL Databases**
2. Create a new database (e.g. `myuser_shop`)
3. Create a database user with a strong password
4. Add the user to the database with **All Privileges**

### 2. Import the schema

1. cPanel → **phpMyAdmin** → select your database
2. Click **Import** → choose `schema.sql` → click **Go**

This creates all tables and seeds:
- Meta CAPI settings (edit via admin panel)
- Default admin: `admin` / `Admin1234!`

### 3. Configure `config.php`

```bash
cp config.sample.php config.php
```

Edit `config.php` with your real values:
```php
define('DB_HOST',   'localhost');
define('DB_NAME',   'myuser_shop');
define('DB_USER',   'myuser_shopuser');
define('DB_PASS',   'your-strong-password');
define('APP_SECRET','a-long-random-secret-at-least-32-chars');
define('ALLOWED_ORIGINS', ['https://mystore.vercel.app']);
define('SITE_URL',  'https://mystore.vercel.app');
```

### 4. Upload files

Upload the entire `/backend` folder to your hosting. Two common setups:

**Option A — Subdomain (recommended)**
- Create subdomain `api.yourdomain.com` → points to `public_html/api/`
- Upload backend files to `public_html/api/`
- Set `VITE_API_BASE_URL=https://api.yourdomain.com` in Vercel

**Option B — Subdirectory**
- Upload to `public_html/backend/`
- Set `VITE_API_BASE_URL=https://yourdomain.com/backend`

### 5. Enable HTTPS

On cPanel: **SSL/TLS** → **Let's Encrypt** → issue a certificate for your domain/subdomain.
The `.htaccess` does not force HTTPS automatically — add this if you need it:
```apache
RewriteCond %{HTTPS} off
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### 6. Verify `.htaccess` is active

Ensure **mod_rewrite** is enabled (it is on virtually all cPanel hosts). If you get 404 on all routes, check:
- `AllowOverride All` is set in the server's Apache config (ask your host)
- The `.htaccess` file was uploaded correctly

---

## Changing the admin password

Generate a new bcrypt hash (PHP ≥ 7.4):
```bash
php -r "echo password_hash('YourNewPassword!', PASSWORD_DEFAULT);"
```

Then update the DB:
```sql
UPDATE admins SET password_hash = '$2y$...' WHERE username = 'admin';
```

---

## API reference

### Public

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products?id={id}` | Single product |
| POST | `/api/orders` | Create order → fires Meta CAPI |
| GET | `/api/public/pixel` | Returns `{pixel_id}` for browser Pixel |

### Admin (requires `Authorization: Bearer <token>`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/admin/login` | Get bearer token |
| GET | `/api/admin/orders` | All orders + items |
| DELETE | `/api/admin/orders?id={id}` | Delete order |
| POST | `/api/admin/products` | Add product |
| DELETE | `/api/admin/products?id={id}` | Delete product |
| GET | `/api/admin/settings` | Get Meta CAPI settings |
| POST | `/api/admin/settings` | Update Meta CAPI settings |

### Auth token

- Tokens are 128-char hex strings stored in the `sessions` table.
- TTL: 24 hours (configurable via `SESSION_TTL` in `config.php`).
- Expired sessions are lazily purged (1-in-100 requests) to avoid scheduled jobs.

---

## Meta CAPI

The CAPI integration:
- Reads `meta_pixel_id`, `meta_access_token`, `meta_test_event_code`, `meta_capi_enabled` from the `settings` table at runtime.
- Fires a `Purchase` event via cURL after every successful order.
- Uses SHA-256 hashed `em` (email) and `ph` (phone) — lowercased and trimmed.
- Uses the same `event_id` as the browser Pixel event for deduplication.
- Any cURL error is logged to `logs/capi_errors.log` — the order is **never** blocked.

---

## File structure

```
backend/
├── index.php            # Router — all requests enter here
├── config.php           # Your secrets (gitignored)
├── config.sample.php    # Template to copy
├── schema.sql           # DB schema + seed data
├── .htaccess            # URL rewriting
├── helpers/
│   ├── cors.php         # CORS headers + json_response helpers
│   ├── db.php           # PDO singleton
│   ├── auth.php         # Token generation + require_auth()
│   └── meta_capi.php    # Meta CAPI purchase event
├── api/
│   ├── products.php
│   ├── orders.php
│   ├── public/
│   │   └── pixel.php
│   └── admin/
│       ├── login.php
│       ├── orders.php
│       ├── products.php
│       └── settings.php
└── logs/                # CAPI error logs (gitignored)
```
