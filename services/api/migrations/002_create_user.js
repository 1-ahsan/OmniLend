
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      -- NULL for platform administrators
      tenant_id UUID,

      -- NULL for platform administrators
      employee_id UUID,

      email VARCHAR(255) NOT NULL,
      password_hash TEXT NOT NULL,

      account_type VARCHAR(30) NOT NULL
        CHECK (account_type IN (
          'platform_admin',
          'tenant_user'
        )),

      status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN (
          'active',
          'inactive',
          'locked'
        )),

      last_login_at TIMESTAMPTZ,

      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      -- Link tenant users to their employee records
      CONSTRAINT fk_users_employee
        FOREIGN KEY (tenant_id, employee_id)
        REFERENCES employees(tenant_id, id)
        ON DELETE RESTRICT,

      -- Platform admins have no tenant or employee.
      -- Tenant users must have both.
      CONSTRAINT chk_users_account_type
        CHECK (
          (
            account_type = 'platform_admin'
            AND tenant_id IS NULL
            AND employee_id IS NULL
          )
          OR
          (
            account_type = 'tenant_user'
            AND tenant_id IS NOT NULL
            AND employee_id IS NOT NULL
          )
        )
    );

    -- Email must be unique, ignoring uppercase/lowercase.
    CREATE UNIQUE INDEX uq_users_email
      ON users (LOWER(email));

    -- One employee can have only one login account.
    CREATE UNIQUE INDEX uq_users_employee
      ON users (tenant_id, employee_id)
      WHERE employee_id IS NOT NULL;

    -- Useful for retrieving tenant users.
    CREATE INDEX idx_users_tenant
      ON users(tenant_id);

    -- Useful for authentication and account management.
    CREATE INDEX idx_users_status
      ON users(status);

  `);
};


exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS users;
  `);
};
