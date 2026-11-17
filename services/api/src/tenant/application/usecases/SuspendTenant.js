export default class SuspendTenant {
    constructor(tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    async execute(id, reason) {

        if (!reason || reason.trim().length < 3) {
            throw new Error("A valid suspension reason is required");
        }

        const tenant = await this.tenantRepository.findById(id);

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        if (tenant.status !== "ACTIVE") {
            throw new Error("Only active tenants can be suspended");
        }

        return await this.tenantRepository.suspend(
            id,
            reason.trim()
        );
    }
}

