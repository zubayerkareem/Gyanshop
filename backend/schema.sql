-- ============================================================
-- Ecommerce Schema
-- Import via cPanel > phpMyAdmin > Import, or:
--   mysql -u USER -p DBNAME < schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255)    NOT NULL,
    description TEXT,
    price       DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    image_url   VARCHAR(500),
    stock       INT             NOT NULL DEFAULT 0,
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    customer_name   VARCHAR(255)    NOT NULL,
    customer_phone  VARCHAR(50)     NOT NULL,
    customer_email  VARCHAR(255),
    address         TEXT            NOT NULL,
    total           DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    status          VARCHAR(50)     NOT NULL DEFAULT 'pending',
    event_id        VARCHAR(100)    UNIQUE,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_items (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    order_id        INT             NOT NULL,
    product_id      INT             NOT NULL,
    product_name    VARCHAR(255)    NOT NULL,
    quantity        INT             NOT NULL DEFAULT 1,
    price           DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS settings (
    setting_key     VARCHAR(100)    PRIMARY KEY,
    setting_value   TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Meta CAPI settings (edit via admin panel)
INSERT IGNORE INTO settings (setting_key, setting_value) VALUES
    ('meta_pixel_id',         ''),
    ('meta_access_token',     ''),
    ('meta_test_event_code',  ''),
    ('meta_capi_enabled',     '0');

CREATE TABLE IF NOT EXISTS admins (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default admin: username=admin, password=Admin1234!
-- CHANGE THIS PASSWORD IMMEDIATELY after first login.
-- Generate a new hash: php -r "echo password_hash('YourNewPassword', PASSWORD_DEFAULT);"
INSERT IGNORE INTO admins (username, password_hash) VALUES
    ('admin', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

CREATE TABLE IF NOT EXISTS sessions (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    token       VARCHAR(128)    NOT NULL UNIQUE,
    admin_id    INT             NOT NULL,
    expires_at  DATETIME        NOT NULL,
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
