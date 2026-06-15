# Security Checklist — Before Going Live

## Critical (do these before launch)

- [ ] **Change the admin password.**
  Generate: `php -r "echo password_hash('StrongPassword!', PASSWORD_DEFAULT);"`
  Update: `UPDATE admins SET password_hash = '...' WHERE username = 'admin';`

- [ ] **Set a strong `APP_SECRET`** in `config.php` — minimum 32 random characters.
  Generate: `php -r "echo bin2hex(random_bytes(32));"`

- [ ] **Lock down `ALLOWED_ORIGINS`** — only list your actual Vercel domain.
  Do NOT use `['*']`.

- [ ] **Store `config.php` securely** — it must not be publicly accessible.
  Confirm `.gitignore` includes `config.php` before any git push.

- [ ] **Enable HTTPS** on the PHP backend (Let's Encrypt via cPanel).
  Never serve the API over plain HTTP in production.

- [ ] **Protect the `logs/` directory** — `.htaccess` already denies access,
  but verify by hitting `https://api.yourdomain.com/logs/` (should get 403).

## High priority

- [ ] **Rotate the Meta Access Token** regularly — treat it like a password.
  Store it only in the `settings` DB row, never in code or `.env` files committed to git.

- [ ] **Add rate limiting** on the login endpoint (`/api/admin/login`) — cPanel
  hosts typically allow this via `.htaccess` + `mod_evasive`, or use Cloudflare.

- [ ] **Validate file uploads** — the current API accepts `image_url` as a string only
  (no file upload). If you later add image upload, validate MIME type and scan for malicious content.

- [ ] **Disable PHP error display** in production (`display_errors = Off` in `php.ini`).
  Log errors to a file instead.

## What is already handled

- All SQL uses PDO prepared statements — no raw string interpolation → SQL injection mitigated.
- Passwords verified with `password_verify()` (constant-time) — timing attacks mitigated.
- Admin token is 64 random bytes (cryptographically secure) → not guessable.
- Session tokens expire in 24 hours and are lazily purged.
- CORS restricts cross-origin requests to configured origins only.
- `.htaccess` blocks direct access to all PHP files except `index.php`.
- Meta CAPI hashes PII (email, phone) with SHA-256 before sending to Facebook.
- Client-supplied prices are ignored — totals are always computed from the DB.
- `event_id` deduplication prevents double-counting browser + server Pixel events.
