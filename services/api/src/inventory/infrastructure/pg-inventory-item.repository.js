import { pool } from "../../config/database.js";
import { InventoryItemRepository } from "../domain/inventory-item.repository.js";
import { InventoryItem, DomainError } from "../domain/inventory-item.entity.js";

// An "item" = branch_inventory row + its product details.
const SELECT_ITEM = `
  SELECT bi.id, bi.tenant_id, bi.branch_id, bi.product_id,
         bi.quantity, bi.reorder_level, bi.updated_at,
         p.name, p.category, p.sku, p.vendor_id, p.created_at
    FROM branch_inventory bi
    JOIN products p
      ON p.tenant_id = bi.tenant_id AND p.id = bi.product_id
`;

const toEntity = (row) =>
  row &&
  new InventoryItem({
    id: row.id,
    productId: row.product_id,
    tenantId: row.tenant_id,
    branchId: row.branch_id,
    vendorId: row.vendor_id,
    name: row.name,
    category: row.category,
    sku: row.sku,
    quantity: row.quantity,
    reorderLevel: row.reorder_level,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });

const UNIQUE_VIOLATION = "23505";
const FK_VIOLATION = "23503";

function mapDbError(error) {
  if (error.code === UNIQUE_VIOLATION) {
    return new DomainError("An item with this SKU already exists.", 409);
  }
  if (error.code === FK_VIOLATION) {
    return new DomainError("The selected vendor does not exist.", 400);
  }
  return error;
}

const INSERT_MOVEMENT_SQL = `
  INSERT INTO stock_movements
    (tenant_id, branch_id, inventory_id, movement_type,
     quantity_change, quantity_before, quantity_after, note, created_by)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  RETURNING id, created_at
`;

const movementParams = (m, inventoryId) => [
  m.tenantId,
  m.branchId,
  inventoryId,
  m.type,
  m.quantityChange,
  m.quantityBefore,
  m.quantityAfter,
  m.note,
  m.createdBy,
];

export class PgInventoryItemRepository extends InventoryItemRepository {
  async create(item, openingMovement) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Reuse the product if this SKU already exists in the tenant
      // (e.g. stocked by another branch); otherwise create it.
      const existing = await client.query(
        `SELECT id FROM products WHERE tenant_id = $1 AND sku = $2`,
        [item.tenantId, item.sku]
      );

      let productId = existing.rows[0]?.id;
      if (!productId) {
        const product = await client.query(
          `INSERT INTO products (tenant_id, name, category, sku, vendor_id)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [item.tenantId, item.name, item.category, item.sku, item.vendorId]
        );
        productId = product.rows[0].id;
      }

      const inventory = await client.query(
        `INSERT INTO branch_inventory
           (tenant_id, branch_id, product_id, quantity, reorder_level)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [item.tenantId, item.branchId, productId, item.quantity, item.reorderLevel]
      );
      const inventoryId = inventory.rows[0].id;

      if (openingMovement && item.quantity > 0) {
        await client.query(INSERT_MOVEMENT_SQL, movementParams(openingMovement, inventoryId));
      }

      await client.query("COMMIT");
      return this.findById({ id: inventoryId, tenantId: item.tenantId, branchId: item.branchId });
    } catch (error) {
      await client.query("ROLLBACK");
      if (error.code === UNIQUE_VIOLATION && error.constraint === "branch_inventory_branch_id_product_id_key") {
        throw new DomainError("This item is already stocked in this branch.", 409);
      }
      throw mapDbError(error);
    } finally {
      client.release();
    }
  }

  async update(item) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Name, category, SKU and vendor belong to the product (shared by the tenant).
      await client.query(
        `UPDATE products
            SET name = $1, category = $2, sku = $3, vendor_id = $4
          WHERE id = $5 AND tenant_id = $6`,
        [item.name, item.category, item.sku, item.vendorId, item.productId, item.tenantId]
      );

      // Reorder level is per branch.
      await client.query(
        `UPDATE branch_inventory
            SET reorder_level = $1, updated_at = NOW()
          WHERE id = $2 AND tenant_id = $3 AND branch_id = $4`,
        [item.reorderLevel, item.id, item.tenantId, item.branchId]
      );

      await client.query("COMMIT");
      return this.findById({ id: item.id, tenantId: item.tenantId, branchId: item.branchId });
    } catch (error) {
      await client.query("ROLLBACK");
      throw mapDbError(error);
    } finally {
      client.release();
    }
  }

  async findById({ id, tenantId, branchId }) {
    const { rows } = await pool.query(
      `${SELECT_ITEM} WHERE bi.id = $1 AND bi.tenant_id = $2 AND bi.branch_id = $3`,
      [id, tenantId, branchId]
    );
    return toEntity(rows[0]) ?? null;
  }

  async findBySku({ sku, tenantId, branchId }) {
    const { rows } = await pool.query(
      `${SELECT_ITEM} WHERE p.sku = $1 AND bi.tenant_id = $2 AND bi.branch_id = $3`,
      [sku, tenantId, branchId]
    );
    return toEntity(rows[0]) ?? null;
  }

  async list({ tenantId, branchId, search, category, page = 1, limit = 20 }) {
    const conditions = ["bi.tenant_id = $1", "bi.branch_id = $2"];
    const params = [tenantId, branchId];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length})`);
    }
    if (category) {
      params.push(category);
      conditions.push(`p.category = $${params.length}`);
    }

    const where = conditions.join(" AND ");
    const offset = (page - 1) * limit;

    const [countResult, dataResult] = await Promise.all([
      pool.query(
        `SELECT COUNT(*)::int AS total
           FROM branch_inventory bi
           JOIN products p ON p.tenant_id = bi.tenant_id AND p.id = bi.product_id
          WHERE ${where}`,
        params
      ),
      pool.query(
        `${SELECT_ITEM}
          WHERE ${where}
          ORDER BY p.name ASC
          LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      ),
    ]);

    return {
      items: dataResult.rows.map(toEntity),
      total: countResult.rows[0].total,
    };
  }

  async findLowStock({ tenantId, branchId }) {
    const { rows } = await pool.query(
      `${SELECT_ITEM}
        WHERE bi.tenant_id = $1 AND bi.branch_id = $2
          AND bi.quantity < bi.reorder_level
        ORDER BY (bi.reorder_level - bi.quantity) DESC, p.name ASC`,
      [tenantId, branchId]
    );
    return rows.map(toEntity);
  }

  // `item` already has the NEW quantity applied; movement.quantityBefore is the old one.
  async saveAdjustment(item, movement) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const { rowCount } = await client.query(
        `UPDATE branch_inventory
            SET quantity = $1, updated_at = NOW()
          WHERE id = $2 AND tenant_id = $3 AND branch_id = $4
            AND quantity = $5`,
        [item.quantity, item.id, item.tenantId, item.branchId, movement.quantityBefore]
      );

      if (rowCount === 0) {
        throw new DomainError(
          "Stock was changed by someone else. Please refresh and try again.",
          409
        );
      }

      const { rows } = await client.query(INSERT_MOVEMENT_SQL, movementParams(movement, item.id));

      await client.query("COMMIT");
      return { ...movement, id: rows[0].id, createdAt: rows[0].created_at };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}