export class GetLowStockItemsUseCase {
  constructor({ inventoryItemRepository }) {
    this.inventoryItemRepository = inventoryItemRepository;
  }

  async execute({ tenantId, branchId }) {
    return this.inventoryItemRepository.findLowStock({ tenantId, branchId });
  }
}