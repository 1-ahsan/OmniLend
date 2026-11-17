import { Router } from "express";
import { loginValidator } from "../validators/loginValidator.js";

export function createAuthRoutes(authController) {
  const router = Router();

  router.post(
    "/login",
    loginValidator,
    authController.login
  );

  return router;
}