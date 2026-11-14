import { PgInventoryItemRepository } from "./infrastructure/pg-inventory-item.repository.js";
import { PgStockMovementRepository } from "./infrastructure/pg-stock-movement.repository.js";

import { CreateInventoryItemUseCase } from "./application/create-inventory-items.use-case.js";
import { UpdateInventoryItemUseCase } from "./application/update-inventory-item.use-case.js";
import { ListInventoryItemsUseCase } from "./application/list-inventory-items.use-case.js";
import { AdjustStockUseCase } from "./application/adjust-stock.use-case.js";
import { GetLowStockItemsUseCase } from "./application/get-low-stock-items.use-case.js";
import { GetStockMovementsUseCase } from "./application/get-stock-movements.use-case.js";

import { createInventoryController } from "./presentation/inventory.controller.js";
import { createInventoryRoutes } from "./presentation/inventory.routes.js";

// Infrastructure
const inventoryItemRepository = new PgInventoryItemRepository();
const stockMovementRepository = new PgStockMovementRepository();

// Application
const createInventoryItem = new CreateInventoryItemUseCase({ inventoryItemRepository });
const updateInventoryItem = new UpdateInventoryItemUseCase({ inventoryItemRepository });
const listInventoryItems = new ListInventoryItemsUseCase({ inventoryItemRepository });
const adjustStock = new AdjustStockUseCase({ inventoryItemRepository });
const getLowStockItems = new GetLowStockItemsUseCase({ inventoryItemRepository });
const getStockMovements = new GetStockMovementsUseCase({
  inventoryItemRepository,
  stockMovementRepository,
});

// Presentation
const controller = createInventoryController({
  createInventoryItem,
  updateInventoryItem,
  listInventoryItems,
  adjustStock,
  getLowStockItems,
  getStockMovements,
});

export const inventoryRoutes = createInventoryRoutes(controller);