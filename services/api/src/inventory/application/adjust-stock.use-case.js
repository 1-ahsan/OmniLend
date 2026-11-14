import { DomainError } from "../domain/inventory-item.entity.js";
import { StockMovement } from "../domain/stock-movement.entity.js";

export class AdjustStockUseCase {
  constructor({ inventoryItemRepository }) {
    this.inventoryItemRepository = inventoryItemRepository;
  }

  /**
   * `quantity` is the amount moved for received/sold/transferred_out/damaged/lost,
   * or the counted quantity on the shelf for count_correction.
   */
  async execute({ id, tenantId, branchId, employeeId, type, quantity, note }) {
    const item = await this.inventoryItemRepository.findById({ id, tenantId, branchId });
    if (!item) throw new DomainError("Inventory item not found.", 404);

    // Validates the type and quantity, and blocks negative stock.
    const { change, before, after } = item.applyMovement(type, quantity);

    const movement = new StockMovement({
      tenantId,
      branchId,
      itemId: item.id,
      type,
      quantityChange: change,
      quantityBefore: before,
      quantityAfter: after,
      note,
      createdBy: employeeId,
    });

    const savedMovement = await this.inventoryItemRepository.saveAdjustment(item, movement);

    return { item, movement: savedMovement };
  }
}