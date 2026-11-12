export class InventoryItemRepository {
  async create(item) { throw new Error("Not implemented"); }
  async update(item) { throw new Error("Not implemented"); }
  async findById({ id, tenantId, branchId }) { throw new Error("Not implemented"); }
  async findBySku({ sku, tenantId, branchId }) { throw new Error("Not implemented"); }
  async list({ tenantId, branchId, search, category, page, limit }) { throw new Error("Not implemented"); }
  async findLowStock({ tenantId, branchId }) { throw new Error("Not implemented"); }
  // Atomically updates item quantity AND inserts the movement in one transaction.
  async saveAdjustment(item, movement) { throw new Error("Not implemented"); }
}