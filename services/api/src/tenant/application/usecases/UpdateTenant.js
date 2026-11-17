export default class UpdateTenant {
    constructor(tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    async execute(id, data) {

        const tenant = await this.tenantRepository.findById(id);

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        // if trying to update email that is owned by someone else
        if (data.email && data.email !== tenant.email) {
            const existing = await this.tenantRepository.findByEmail(data.email);

            if (existing) {
                throw new Error("Email is already associated with another tenant");
            }
        }

        // same as email
        if (data.ownerCnic && data.ownerCnic !== tenant.ownerCnic) {
            const existing = await this.tenantRepository.findByCnic(data.ownerCnic);

            if (existing) {
                throw new Error("CNIC is already associated with another tenant");
            }
        }

        return await this.tenantRepository.update(id, data);
    }
}

