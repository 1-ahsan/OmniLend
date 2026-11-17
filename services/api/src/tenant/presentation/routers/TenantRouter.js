import { Router } from "express";

import {authenticate} from "../../../security/authentication/index.js"
import {authorize} from "../../../security/authorization/index.js"

export function createTenantRoutes(controller) {
  const router = Router();

  router.use(authenticate)

  router.post("/",authorize("tenant:create"), controller.create);
  router.get("/",authorize("tenant:view"),controller.getAll);
  router.get("/:id",authorize("tenant:view"), controller.getById);
  router.put("/:id",authorize("tenant:update"),controller.update);
  router.delete("/:id",authorize("tenant:delete"),controller.delete);
  router.patch("/:id/suspend",authorize("tenant:update"),controller.suspend);
  router.patch("/:id/activate",authorize("tenant:activate"),controller.activate);
  router.patch("/:id/payment",authorize("tenant:payment"),controller.payment)


  return router;
}