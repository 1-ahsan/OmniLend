import {
  validateId,
  validateCreateItemBody,
  validateUpdateItemBody,
  validateAdjustStockBody,
  validateListQuery,
  validatePageQuery,
} from "./inventory.validator.js";

export function createInventoryController({
  createInventoryItem,
  updateInventoryItem,
  listInventoryItems,
  adjustStock,
  getLowStockItems,
  getStockMovements,
}) {
  // Tenant and branch always come from the logged-in user, never from the request body.
  const scopeOf = (req) => ({
    tenantId: req.user.tenantId,
    branchId: req.user.branchId,
  });

  return {
    async create(req, res, next) {
      try {
        const body = validateCreateItemBody(req.body);

        const item = await createInventoryItem.execute({
          ...scopeOf(req),
          employeeId: req.user.employeeId,
          ...body,
        });

        return res.status(201).json({
          message: "Inventory item created successfully.",
          data: item,
        });
      } catch (error) {
        return next(error);
      }
    },

    async update(req, res, next) {
      try {
        const id = validateId(req.params.id);
        const body = validateUpdateItemBody(req.body);

        const item = await updateInventoryItem.execute({
          id,
          ...scopeOf(req),
          ...body,
        });

        return res.status(200).json({
          message: "Inventory item updated successfully.",
          data: item,
        });
      } catch (error) {
        return next(error);
      }
    },

    async list(req, res, next) {
      try {
        const result = await listInventoryItems.execute({
          ...scopeOf(req),
          ...validateListQuery(req.query),
        });

        return res.status(200).json({ data: result });
      } catch (error) {
        return next(error);
      }
    },

    async lowStock(req, res, next) {
      try {
        const items = await getLowStockItems.execute(scopeOf(req));

        return res.status(200).json({ data: items });
      } catch (error) {
        return next(error);
      }
    },

    async adjust(req, res, next) {
      try {
        const id = validateId(req.params.id);
        const body = validateAdjustStockBody(req.body);

        const result = await adjustStock.execute({
          id,
          ...scopeOf(req),
          employeeId: req.user.employeeId,
          ...body,
        });

        return res.status(201).json({
          message: "Stock adjusted successfully.",
          data: result,
        });
      } catch (error) {
        return next(error);
      }
    },

    async movements(req, res, next) {
      try {
        const id = validateId(req.params.id);

        const result = await getStockMovements.execute({
          id,
          ...scopeOf(req),
          ...validatePageQuery(req.query),
        });

        return res.status(200).json({ data: result });
      } catch (error) {
        return next(error);
      }
    },
  };
}