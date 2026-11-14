const clamp = (value, min, max, fallback) => {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
};

export class ListInventoryItemsUseCase {
  constructor({ inventoryItemRepository }) {
    this.inventoryItemRepository = inventoryItemRepository;
  }

  async execute({ tenantId, branchId, search, category, page, limit }) {
    const safePage = clamp(page, 1, Number.MAX_SAFE_INTEGER, 1);
    const safeLimit = clamp(limit, 1, 100, 20);

    const { items, total } = await this.inventoryItemRepository.list({
      tenantId,
      branchId,
      search: search?.trim() || undefined,
      category: category?.trim() || undefined,
      page: safePage,
      limit: safeLimit,
    });

    return {
      items,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }
}