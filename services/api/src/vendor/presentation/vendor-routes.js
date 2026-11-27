import { Router } from "express";

export function createVendorRoutes(controller) {
  const router = Router();

  router.post("/", controller.create);
  router.get("/", controller.search);

  return router;
}