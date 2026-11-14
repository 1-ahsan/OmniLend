import { DomainError } from "../domain/inventory-item.entity.js";

const clamp = (value, min, max, fallback) => {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
};

export class GetStockMovementsUseCase {
  constructor({ inventoryItemRepository, stockMovementRepository }) {
    this.inventoryItemRepository = inventoryItemRepository;
    this.stockMovementRepository = stockMovementRepository;
  }

  async execute({ id, tenantId, branchId, page, limit }) {
    const item = await this.inventoryItemRepository.findById({ id, tenantId, branchId });
    if (!item) throw new DomainError("Inventory item not found.", 404);

    const safePage = clamp(page, 1, Number.MAX_SAFE_INTEGER, 1);
    const safeLimit = clamp(limit, 1, 100, 20);

    const { movements, total } = await this.stockMovementRepository.findByItemId({
      itemId: item.id,
      tenantId,
      branchId,
      page: safePage,
      limit: safeLimit,
    });

    return {
      item,
      movements,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }
}