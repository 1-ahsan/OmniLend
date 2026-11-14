import { InventoryItem, DomainError } from "../domain/inventory-item.entity.js";
import { StockMovement } from "../domain/stock-movement.entity.js";
import { MOVEMENT_TYPES } from "../domain/movement-types.js";

export class CreateInventoryItemUseCase {
  constructor({ inventoryItemRepository }) {
    this.inventoryItemRepository = inventoryItemRepository;
  }

  async execute({
    tenantId,
    branchId,
    employeeId,
    name,
    category,
    sku,
    openingQuantity,
    reorderLevel,
    vendorId = null,
  }) {
    // Entity validates all fields.
    const item = new InventoryItem({
      tenantId,
      branchId,
      name,
      category,
      sku,
      quantity: openingQuantity,
      reorderLevel,
      vendorId,
    });

    const existing = await this.inventoryItemRepository.findBySku({
      sku: item.sku,
      tenantId,
      branchId,
    });
    if (existing) {
      throw new DomainError("An item with this SKU already exists in this branch.", 409);
    }

    const openingMovement = new StockMovement({
      tenantId,
      branchId,
      type: MOVEMENT_TYPES.OPENING,
      quantityChange: item.quantity,
      quantityBefore: 0,
      quantityAfter: item.quantity,
      note: "Opening stock",
      createdBy: employeeId,
    });

    return this.inventoryItemRepository.create(item, openingMovement);
  }
}