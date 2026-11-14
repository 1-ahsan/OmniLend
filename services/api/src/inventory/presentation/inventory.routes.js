import { Router } from "express";
import {
  authenticate,
  requireRole,
} from "../../authentication/presentation/middleware/authMiddleware.js";

// Only the Data Operator (employees.role = 'operator') may use inventory.
// Later, a read-only view for managers/owners can be added as separate GET routes
// with their own role list.
const INVENTORY_ROLES = ["operator"];

export function createInventoryRoutes(controller) {
  const router = Router();

  router.use(authenticate, requireRole(...INVENTORY_ROLES));

  router.post("/", controller.create);
  router.get("/", controller.list);

  // Must come before "/:id/..." routes.
  router.get("/low-stock", controller.lowStock);

  router.patch("/:id", controller.update);
  router.post("/:id/adjustments", controller.adjust);
  router.get("/:id/movements", controller.movements);

  return router;
}