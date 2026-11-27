export default class SoftDeleteTenant {
    constructor(tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    async execute(id) {

        const tenant = await this.tenantRepository.findById(id);

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        return await this.tenantRepository.softDelete(id);
    }
}

