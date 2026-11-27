import { PostgresRoleRepository } from "./infrastructure/Repositories/PostgresRoleRepository.js";

import { AuthorizationService } from "./application/Service/AuthorizationService.js";
import { requirePermission } from "./presentation/Middlewares/RequirePermission.js";

const roleRepository = new PostgresRoleRepository();

 const authorizationService =
    new AuthorizationService(roleRepository);


export function authorize(permission){
    return requirePermission(authorizationService,permission)
}
