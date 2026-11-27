import Tenant from "../../domain/entiteis/Tenant.js";
import {TenantValidator} from "../validators/TenantValidator.js";

export default class CreateTenant {
    constructor(tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    async execute(data) {

        // Validate input
        const validation = TenantValidator.validateCreateTenant(data);

        console.log(data)

        if (!validation.isValid) {
            throw new Error(JSON.stringify(validation.errors));
        }

        // Check duplicate email
        const existingEmail = await this.tenantRepository.findByEmail(data.email);

        if (existingEmail) {
            throw new Error("A tenant with this email already exists");
        }

        // Check duplicate CNIC
        const existingCnic = await this.tenantRepository.findByCnic(data.ownerCnic);

        if (existingCnic) {
            throw new Error("A tenant with this CNIC already exists");
        }

        const tenant = new Tenant(data);

        return await this.tenantRepository.create(tenant);
    }
}

