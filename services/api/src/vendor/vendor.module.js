import { pool } from "../config/database.js";

import { createVendor } from "./application/create-vendor.js";
import { searchVendors } from "./application/search-vendors.js";

import { createPostgresVendorRepository } from
  "./infrastructure/postgres-vendor-repository.js";

import { createVendorController } from
  "./presentation/vendor-controller.js";

import { createVendorRoutes } from
  "./presentation/vendor-routes.js";

const repository = createPostgresVendorRepository(pool);

const createVendorUseCase = createVendor(repository);
const searchVendorsUseCase = searchVendors(repository);

const controller = createVendorController({
  createVendor: createVendorUseCase,
  searchVendors: searchVendorsUseCase,
});

export const vendorRoutes = createVendorRoutes(controller);