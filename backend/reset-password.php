<?php
// ONE-TIME PASSWORD RESET TOOL
// DELETE THIS FILE immediately after use!

define('APP_RUNNING', true);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers/db.php';

$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['new_password'])) {
    $hash = password_hash($_POST['new_password'], PASSWORD_DEFAULT);
    $db   = get_db();
    $stmt = $db->prepare("UPDATE admins SET password_hash = ? WHERE username = 'admin'");
    $stmt->execute([$hash]);
    $message = $stmt->rowCount() > 0
        ? '✅ Password updated successfully! Delete this file now.'
        : '❌ Admin user not found.';
}
?>
<!DOCTYPE html>
<html>
<head><title>Reset Admin Password</title>
<style>body{font-family:sans-serif;max-width:400px;margin:80px auto;padding:20px}
input{width:100%;padding:10px;margin:10px 0;box-sizing:border-box;font-size:16px}
button{width:100%;padding:12px;background:#2563eb;color:#fff;border:none;font-size:16px;cursor:pointer;border-radius:6px}
.ok{color:green;font-weight:bold}.err{color:red;font-weight:bold}
.warn{background:#fef3c7;border:1px solid #f59e0b;padding:10px;border-radius:6px;margin-bottom:16px}</style>
</head>
<body>
<h2>Reset Admin Password</h2>
<div class="warn">⚠️ Delete this file from your server immediately after use!</div>
<?php if ($message): ?>
  <p class="<?= str_starts_with($message, '✅') ? 'ok' : 'err' ?>"><?= $message ?></p>
<?php endif; ?>
<form method="POST">
  <label>New password for <strong>admin</strong>:</label>
  <input type="password" name="new_password" placeholder="Enter new password" required minlength="8" />
  <button type="submit">Update Password</button>
</form>
</body>
</html>
