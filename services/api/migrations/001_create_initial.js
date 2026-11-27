
/**
 * Initial database migration for FYP
 * PostgreSQL + Node.js + node-pg-migrate
 */

exports.up = (pgm) => {
  pgm.sql(`

    -- 1. TENANTS
    CREATE TABLE tenants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      business_name VARCHAR(180) NOT NULL,
      owner_name VARCHAR(150) NOT NULL,
      owner_phone VARCHAR(30),
      email VARCHAR(255),
      owner_cnic VARCHAR(30),
      head_office_address TEXT,
      package_type VARCHAR(50),
      status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'suspended', 'cancelled', 'trial')),
      subscription_due DATE,
      addon_modules JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- 2. BRANCHES
    CREATE TABLE branches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      branch_name VARCHAR(150) NOT NULL,
      code VARCHAR(30) NOT NULL,
      branch_phone VARCHAR(30),
      branch_address TEXT,
      region VARCHAR(100),
      opening_date DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      FOREIGN KEY (tenant_id)
        REFERENCES tenants(id) ON DELETE RESTRICT,

      UNIQUE (tenant_id, code),
      UNIQUE (tenant_id, id)
    );

    -- 3. EMPLOYEES
    CREATE TABLE employees (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      branch_id UUID NOT NULL,
      name VARCHAR(150) NOT NULL,
      phone VARCHAR(30),
      cnic VARCHAR(30),
      email VARCHAR(255),
      role VARCHAR(30) NOT NULL DEFAULT 'operator'
        CHECK (role IN ('owner', 'manager', 'operator', 'agent', 'other')),
      salary NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (salary >= 0),
      bonus NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (bonus >= 0),
      employment_status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (employment_status IN ('active', 'inactive', 'terminated')),
      joining_date DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      FOREIGN KEY (tenant_id, branch_id)
        REFERENCES branches(tenant_id, id) ON DELETE RESTRICT,

      UNIQUE (tenant_id, id),
      UNIQUE (tenant_id, cnic)
    );

    -- 4. VENDORS
    CREATE TABLE vendors (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      name VARCHAR(150) NOT NULL,
      contact VARCHAR(30),
      email VARCHAR(255),
      location TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      FOREIGN KEY (tenant_id)
        REFERENCES tenants(id) ON DELETE RESTRICT,

      UNIQUE (tenant_id, id)
    );

    -- 5. CUSTOMERS
    CREATE TABLE customers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      name VARCHAR(150) NOT NULL,
      father_name VARCHAR(150),
      cnic VARCHAR(30),
      phone VARCHAR(30),
      email VARCHAR(255),
      address TEXT,
      income NUMERIC(12,2) CHECK (income IS NULL OR income >= 0),
      occupation VARCHAR(100),
      living_situation VARCHAR(100),
      education_level VARCHAR(100),
      marital_status VARCHAR(30),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      FOREIGN KEY (tenant_id)
        REFERENCES tenants(id) ON DELETE RESTRICT,

      UNIQUE (tenant_id, id),
      UNIQUE (tenant_id, cnic)
    );

    -- 6. PRODUCTS
    CREATE TABLE products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      name VARCHAR(180) NOT NULL,
      company VARCHAR(120),
      model VARCHAR(120),
      description TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      FOREIGN KEY (tenant_id)
        REFERENCES tenants(id) ON DELETE RESTRICT,

      UNIQUE (tenant_id, id)
    );

    -- 7. INSTALLMENT PLANS
    CREATE TABLE installment_plans (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      product_id UUID NOT NULL,
      name VARCHAR(150) NOT NULL,
      base_amount NUMERIC(12,2) NOT NULL CHECK (base_amount >= 0),
      monthly_installment NUMERIC(12,2) NOT NULL
        CHECK (monthly_installment >= 0),
      no_of_installments INTEGER NOT NULL
        CHECK (no_of_installments > 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      FOREIGN KEY (tenant_id, product_id)
        REFERENCES products(tenant_id, id) ON DELETE RESTRICT,

      UNIQUE (tenant_id, product_id, id)
    );

    -- 8. PURCHASES
    CREATE TABLE purchases (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      branch_id UUID NOT NULL,
      vendor_id UUID NOT NULL,
      operator_id UUID NOT NULL,
      manager_id UUID,
      purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
      total_amount NUMERIC(14,2) NOT NULL DEFAULT 0
        CHECK (total_amount >= 0),
      status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN (
          'draft', 'pending_approval', 'approved',
          'rejected', 'received', 'cancelled'
        )),
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      FOREIGN KEY (tenant_id, branch_id)
        REFERENCES branches(tenant_id, id) ON DELETE RESTRICT,

      FOREIGN KEY (tenant_id, vendor_id)
        REFERENCES vendors(tenant_id, id) ON DELETE RESTRICT,

      FOREIGN KEY (tenant_id, operator_id)
        REFERENCES employees(tenant_id, id) ON DELETE RESTRICT,

      FOREIGN KEY (tenant_id, manager_id)
        REFERENCES employees(tenant_id, id) ON DELETE RESTRICT,

      UNIQUE (tenant_id, id)
    );

    -- 9. PURCHASE ITEMS
    CREATE TABLE purchase_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      purchase_id UUID NOT NULL,
      product_id UUID NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      unit_cost NUMERIC(12,2) NOT NULL CHECK (unit_cost >= 0),

      subtotal NUMERIC(14,2)
        GENERATED ALWAYS AS (quantity * unit_cost) STORED,

      FOREIGN KEY (tenant_id, purchase_id)
        REFERENCES purchases(tenant_id, id) ON DELETE CASCADE,

      FOREIGN KEY (tenant_id, product_id)
        REFERENCES products(tenant_id, id) ON DELETE RESTRICT,

      UNIQUE (tenant_id, id)
    );

    -- 10. VENDOR PAYMENTS
    CREATE TABLE vendor_payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      vendor_id UUID NOT NULL,
      purchase_id UUID,
      branch_id UUID NOT NULL,
      received_by UUID NOT NULL,
      amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
      payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      payment_method VARCHAR(24) NOT NULL DEFAULT 'cash'
        CHECK (payment_method IN (
          'cash', 'bank_transfer', 'card', 'cheque', 'other'
        )),
      reference VARCHAR(150),
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      FOREIGN KEY (tenant_id, vendor_id)
        REFERENCES vendors(tenant_id, id) ON DELETE RESTRICT,

      FOREIGN KEY (tenant_id, purchase_id)
        REFERENCES purchases(tenant_id, id) ON DELETE RESTRICT,

      FOREIGN KEY (tenant_id, branch_id)
        REFERENCES branches(tenant_id, id) ON DELETE RESTRICT,

      FOREIGN KEY (tenant_id, received_by)
        REFERENCES employees(tenant_id, id) ON DELETE RESTRICT
    );

    -- 11. SALES
    CREATE TABLE sales (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      branch_id UUID NOT NULL,
      customer_id UUID NOT NULL,
      operator_id UUID NOT NULL,
      manager_id UUID,
      agent_id UUID,
      sale_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      total_amount NUMERIC(14,2) NOT NULL DEFAULT 0
        CHECK (total_amount >= 0),
      status VARCHAR(24) NOT NULL DEFAULT 'draft'
        CHECK (status IN (
          'draft', 'pending_approval', 'approved',
          'rejected', 'completed', 'cancelled'
        )),
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      FOREIGN KEY (tenant_id, branch_id)
        REFERENCES branches(tenant_id, id) ON DELETE RESTRICT,

      FOREIGN KEY (tenant_id, customer_id)
        REFERENCES customers(tenant_id, id) ON DELETE RESTRICT,

      FOREIGN KEY (tenant_id, operator_id)
        REFERENCES employees(tenant_id, id) ON DELETE RESTRICT,

      FOREIGN KEY (tenant_id, manager_id)
        REFERENCES employees(tenant_id, id) ON DELETE RESTRICT,

      FOREIGN KEY (tenant_id, agent_id)
        REFERENCES employees(tenant_id, id) ON DELETE RESTRICT,

      UNIQUE (tenant_id, id)
    );

    -- 12. SALE ITEMS
    CREATE TABLE sale_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      sale_id UUID NOT NULL,
      product_id UUID NOT NULL,
      installment_plan_id UUID,
      quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
      unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),

      subtotal NUMERIC(14,2)
        GENERATED ALWAYS AS (quantity * unit_price) STORED,

      FOREIGN KEY (tenant_id, sale_id)
        REFERENCES sales(tenant_id, id) ON DELETE CASCADE,

      FOREIGN KEY (tenant_id, product_id)
        REFERENCES products(tenant_id, id) ON DELETE RESTRICT,

      FOREIGN KEY (tenant_id, product_id, installment_plan_id)
        REFERENCES installment_plans(tenant_id, product_id, id)
        ON DELETE RESTRICT,

      UNIQUE (tenant_id, id)
    );

    -- 13. SALE INSTALLMENTS
    CREATE TABLE sale_installments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      sale_id UUID NOT NULL,
      installment_no INTEGER NOT NULL CHECK (installment_no > 0),
      due_date DATE NOT NULL,
      amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
      status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN (
          'pending', 'partial', 'paid', 'overdue', 'cancelled'
        )),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      FOREIGN KEY (tenant_id, sale_id)
        REFERENCES sales(tenant_id, id) ON DELETE CASCADE,

      UNIQUE (tenant_id, id),
      UNIQUE (sale_id, installment_no),
      UNIQUE (sale_id, id)
    );

    -- 14. PAYMENTS
    CREATE TABLE payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      sale_id UUID NOT NULL,
      installment_id UUID,
      received_by UUID NOT NULL,
      amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
      payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      payment_method VARCHAR(24) NOT NULL DEFAULT 'cash'
        CHECK (payment_method IN (
          'cash', 'bank_transfer', 'card', 'cheque', 'other'
        )),
      reference VARCHAR(150),
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      FOREIGN KEY (tenant_id, sale_id)
        REFERENCES sales(tenant_id, id) ON DELETE RESTRICT,

      FOREIGN KEY (sale_id, installment_id)
        REFERENCES sale_installments(sale_id, id) ON DELETE RESTRICT,

      FOREIGN KEY (tenant_id, received_by)
        REFERENCES employees(tenant_id, id) ON DELETE RESTRICT
    );

    -- 15. BRANCH INVENTORY
    CREATE TABLE branch_inventory (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      branch_id UUID NOT NULL,
      product_id UUID NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      FOREIGN KEY (tenant_id, branch_id)
        REFERENCES branches(tenant_id, id) ON DELETE RESTRICT,

      FOREIGN KEY (tenant_id, product_id)
        REFERENCES products(tenant_id, id) ON DELETE RESTRICT,

      UNIQUE (branch_id, product_id)
    );

    -- INDEXES
    CREATE INDEX idx_branches_tenant
      ON branches(tenant_id);

    CREATE INDEX idx_employees_branch
      ON employees(tenant_id, branch_id);

    CREATE INDEX idx_vendors_name
      ON vendors(tenant_id, name);

    CREATE INDEX idx_customers_name
      ON customers(tenant_id, name);

    CREATE INDEX idx_products_name
      ON products(tenant_id, name);

    CREATE INDEX idx_installment_plans_product
      ON installment_plans(tenant_id, product_id);

    CREATE INDEX idx_purchases_date
      ON purchases(tenant_id, purchase_date);

    CREATE INDEX idx_purchase_items_purchase
      ON purchase_items(tenant_id, purchase_id);

    CREATE INDEX idx_vendor_payments_vendor
      ON vendor_payments(tenant_id, vendor_id, payment_date);

    CREATE INDEX idx_sales_date
      ON sales(tenant_id, sale_date);

    CREATE INDEX idx_sales_customer
      ON sales(tenant_id, customer_id);

    CREATE INDEX idx_sale_items_sale
      ON sale_items(tenant_id, sale_id);

    CREATE INDEX idx_installments_due
      ON sale_installments(tenant_id, due_date, status);

    CREATE INDEX idx_payments_sale
      ON payments(tenant_id, sale_id, payment_date);

    CREATE INDEX idx_inventory_product
      ON branch_inventory(tenant_id, product_id);

  `);
};


exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS payments;
    DROP TABLE IF EXISTS sale_installments;
    DROP TABLE IF EXISTS sale_items;
    DROP TABLE IF EXISTS sales;
    DROP TABLE IF EXISTS vendor_payments;
    DROP TABLE IF EXISTS purchase_items;
    DROP TABLE IF EXISTS purchases;
    DROP TABLE IF EXISTS branch_inventory;
    DROP TABLE IF EXISTS installment_plans;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS customers;
    DROP TABLE IF EXISTS vendors;
    DROP TABLE IF EXISTS employees;
    DROP TABLE IF EXISTS branches;
    DROP TABLE IF EXISTS tenants;
  `);
};
