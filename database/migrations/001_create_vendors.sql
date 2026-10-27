CREATE TABLE IF NOT EXISTS vendors (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendors_name
    ON vendors (name);

CREATE INDEX IF NOT EXISTS idx_vendors_phone
    ON vendors (phone);