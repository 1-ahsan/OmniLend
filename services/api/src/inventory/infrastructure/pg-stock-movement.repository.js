import { pool } from "../../config/database.js";
import { StockMovementRepository } from "../domain/stock-movement.repository.js";
import { StockMovement } from "../domain/stock-movement.entity.js";

const toEntity = (row) =>
  new StockMovement({
    id: row.id,
    tenantId: row.tenant_id,
    branchId: row.branch_id,
    itemId: row.inventory_id, // DB column inventory_id → code field itemId
    type: row.movement_type,
    quantityChange: row.quantity_change,
    quantityBefore: row.quantity_before,
    quantityAfter: row.quantity_after,
    note: row.note,
    createdBy: row.created_by,
    createdAt: row.created_at,
  });

export class PgStockMovementRepository extends StockMovementRepository {
  async findByItemId({ itemId, tenantId, branchId, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;

    const [countResult, dataResult] = await Promise.all([
      pool.query(
        `SELECT COUNT(*)::int AS total FROM stock_movements
          WHERE inventory_id = $1 AND tenant_id = $2 AND branch_id = $3`,
        [itemId, tenantId, branchId]
      ),
      pool.query(
        `SELECT * FROM stock_movements
          WHERE inventory_id = $1 AND tenant_id = $2 AND branch_id = $3
          ORDER BY created_at DESC, id DESC
          LIMIT $4 OFFSET $5`,
        [itemId, tenantId, branchId, limit, offset]
      ),
    ]);

    return {
      movements: dataResult.rows.map(toEntity),
      total: countResult.rows[0].total,
    };
  }
}