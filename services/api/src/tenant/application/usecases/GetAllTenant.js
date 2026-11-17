export default class GetAllTenants{
    constructor(repository){
        this.tenantRepository = repository;
    }

    async execute(){
        const tenant = this.tenantRepository.findAll()

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        return tenant;
    }
}