import { DomainError } from "../domain/inventory-item.entity.js";

export class UpdateInventoryItemUseCase {
  constructor({ inventoryItemRepository }) {
    this.inventoryItemRepository = inventoryItemRepository;
  }

  async execute({ id, tenantId, branchId, name, category, sku, reorderLevel, vendorId }) {
    const item = await this.inventoryItemRepository.findById({ id, tenantId, branchId });
    if (!item) throw new DomainError("Inventory item not found.", 404);

    // Quantity cannot be changed here; use AdjustStock for that.
    item.updateDetails({ name, category, sku, reorderLevel, vendorId });

    return this.inventoryItemRepository.update(item);
  }
}