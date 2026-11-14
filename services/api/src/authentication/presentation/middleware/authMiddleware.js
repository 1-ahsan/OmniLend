import { TokenService } from "../../infrastructure/security/TokenService.js";
import { PostgresAccessContextRepository } from "../../infrastructure/repositories/PostgresAccessContextRepository.js";

const tokenService = new TokenService();
const accessContextRepository = new PostgresAccessContextRepository();

const httpError = (statusCode, message) =>
  Object.assign(new Error(message), { statusCode });

const ALLOWED_TENANT_STATUSES = ["active", "trial"];

/**
 * Verifies the Bearer token and fills req.user with:
 * { userId, tenantId, employeeId, branchId, role }
 */
export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization ?? "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw httpError(401, "Authentication required.");
    }

    let payload;
    try {
      payload = tokenService.verifyAccessToken(token);
    } catch {
      throw httpError(401, "Invalid or expired token.");
    }

    const context = await accessContextRepository.findByUserId(payload.id);

    if (!context || context.account_type !== "tenant_user") {
      throw httpError(403, "This account cannot access this resource.");
    }
    if (context.user_status !== "active" || context.employment_status !== "active") {
      throw httpError(403, "This account is not active.");
    }
    if (!ALLOWED_TENANT_STATUSES.includes(context.tenant_status)) {
      throw httpError(403, "This organization's access is restricted.");
    }

    req.user = {
      userId: context.user_id,
      tenantId: context.tenant_id,
      employeeId: context.employee_id,
      branchId: context.branch_id,
      role: context.role,
    };

    return next();
  } catch (error) {
    return next(error);
  }
}

/** Allows the request only if the logged-in employee has one of the given roles. */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(httpError(403, "You do not have permission to do this."));
    }
    return next();
  };
}