/**
 * Inventory module: extends products and branch_inventory,
 * adds stock_movements for stock history.
 */

exports.up = (pgm) => {
  pgm.sql(`

    -- 1. PRODUCTS: category, SKU and default vendor
    ALTER TABLE products
      ADD COLUMN category VARCHAR(100),
      ADD COLUMN sku VARCHAR(60),
      ADD COLUMN vendor_id UUID,

      ADD CONSTRAINT fk_products_vendor
        FOREIGN KEY (tenant_id, vendor_id)
        REFERENCES vendors(tenant_id, id) ON DELETE RESTRICT,

      -- SKU is unique per tenant (NULLs allowed for older rows)
      ADD CONSTRAINT uq_products_tenant_sku
        UNIQUE (tenant_id, sku);

    -- 2. BRANCH INVENTORY: per-branch reorder level
    ALTER TABLE branch_inventory
      ADD COLUMN reorder_level INTEGER NOT NULL DEFAULT 0
        CHECK (reorder_level >= 0),

      -- Needed so stock_movements can use a composite foreign key
      ADD CONSTRAINT uq_branch_inventory_tenant_id
        UNIQUE (tenant_id, id);

    -- 3. STOCK MOVEMENTS
    CREATE TABLE stock_movements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      branch_id UUID NOT NULL,
      inventory_id UUID NOT NULL,

      movement_type VARCHAR(30) NOT NULL
        CHECK (movement_type IN (
          'opening', 'received', 'sold', 'transferred_out',
          'damaged', 'lost', 'count_correction'
        )),

      quantity_change INTEGER NOT NULL,
      quantity_before INTEGER NOT NULL CHECK (quantity_before >= 0),
      quantity_after INTEGER NOT NULL CHECK (quantity_after >= 0),
      note TEXT,
      created_by UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      CONSTRAINT chk_stock_movements_math
        CHECK (quantity_after = quantity_before + quantity_change),

      FOREIGN KEY (tenant_id, branch_id)
        REFERENCES branches(tenant_id, id) ON DELETE RESTRICT,

      FOREIGN KEY (tenant_id, inventory_id)
        REFERENCES branch_inventory(tenant_id, id) ON DELETE RESTRICT,

      FOREIGN KEY (tenant_id, created_by)
        REFERENCES employees(tenant_id, id) ON DELETE RESTRICT
    );

    CREATE INDEX idx_stock_movements_inventory
      ON stock_movements(tenant_id, inventory_id, created_at DESC);

    CREATE INDEX idx_products_category
      ON products(tenant_id, category);

  `);
};


exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS stock_movements;

    DROP INDEX IF EXISTS idx_products_category;

    ALTER TABLE branch_inventory
      DROP CONSTRAINT IF EXISTS uq_branch_inventory_tenant_id,
      DROP COLUMN IF EXISTS reorder_level;

    ALTER TABLE products
      DROP CONSTRAINT IF EXISTS uq_products_tenant_sku,
      DROP CONSTRAINT IF EXISTS fk_products_vendor,
      DROP COLUMN IF EXISTS vendor_id,
      DROP COLUMN IF EXISTS sku,
      DROP COLUMN IF EXISTS category;
  `);
};