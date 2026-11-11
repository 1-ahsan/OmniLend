import { PostgresRoleRepository } from "./infrastructure/Repositories/PostgresRoleRepository.js";

import { AuthorizationService } from "./application/Services/AuthorizationService.js";

const roleRepository = new PostgresRoleRepository();

export const authorizationService =
    new AuthorizationService(roleRepository);