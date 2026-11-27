export default class ActivateTenant {
    constructor(tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    async execute(id) {

        const tenant = await this.tenantRepository.findById(id);

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        if (tenant.status !== "SUSPENDED") {
            throw new Error("Only suspended tenants can be activated");
        }

        return await this.tenantRepository.activate(id);
    }
}
