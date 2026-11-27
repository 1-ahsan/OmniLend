import { pool } from "../config/database.js";

import { PostgresTenantRepository } from "./infrastructure/repositories/PostgresTenantRepository.js";

import CreateTenant from "./application/usecases/CreateTenant.js";
import SearchById from "./application/usecases/SearchTenantById.js";
import GetAllTenants from "./application/usecases/GetAllTenant.js";
import SearchByEmail from "./application/usecases/SearchTenantByEmail.js";
import UpdateTenant from "./application/usecases/UpdateTenant.js";
import SoftDeleteTenant from "./application/usecases/softDeleteTenant.js";
import SuspendTenant from "./application/usecases/SuspendTenant.js";
import ActivateTenant from "./application/usecases/ActivateTenant.js";
import UpdateTenantPayment from "./application/usecases/UpdateTenantPayment.js";

import { TenantController } from './presentation/controllers/TenantController.js'
import { createTenantRoutes } from "./presentation/routers/TenantRouter.js"


// Repository instance
const tenantRepository = new PostgresTenantRepository(pool);

// Use case instances
const createTenant = new CreateTenant(tenantRepository);
const getTenantById = new SearchById(tenantRepository);
const getAllTenants = new GetAllTenants(tenantRepository);
const searchTenantByEmail = new SearchByEmail(tenantRepository);
const updateTenant = new UpdateTenant(tenantRepository);
const deleteTenant = new SoftDeleteTenant(tenantRepository);
const suspendTenant = new SuspendTenant(tenantRepository);
const activateTenant = new ActivateTenant(tenantRepository);
const updatePayment = new UpdateTenantPayment(tenantRepository);

// Controller instance
const tenantController = new TenantController({
    createTenant,
    getTenantById,
    getAllTenants,
    searchTenantByEmail,
    updateTenant,
    deleteTenant,
    suspendTenant,
    activateTenant,
    updatePayment,
});

// Router

export const tenant = createTenantRoutes(tenantController);


