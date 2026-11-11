import { PostgresAuthRepository } from "./infrastructure/repositories/PostgresAuthRepository.js";

import { PasswordService } from "./infrastructure/security/PasswordService.js";

import { TokenService } from "./infrastructure/security/TokenService.js";

import { LoginUser } from "./application/use-cases/LoginUser.js";

import { AuthController } from "./presentation/controllers/AuthController.js";

import { createAuthRoutes } from "./presentation/routes/authRoutes.js";

import { authenticateToken } from "./presentation/middlewares/TokenVerification.js"


// Infrastructure
const authRepository = new PostgresAuthRepository();

const passwordService = new PasswordService();

const tokenService = new TokenService();


// Application
const loginUser = new LoginUser({
  authRepository,
  passwordService,
  tokenService,
});


// Presentation
const authController = new AuthController(loginUser);


// Export routes
export const authRoutes = createAuthRoutes(authController);

// Expoet middlewares
export const authenticate = authenticateToken(TokenService);
