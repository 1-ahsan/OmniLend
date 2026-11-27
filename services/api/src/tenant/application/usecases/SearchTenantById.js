export default class SearchById{
    constructor(repository){
        this.tenantRepository = repository;
    }

    async execute(id){
        const tenant = this.tenantRepository.findById(id)

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        return tenant;
    }
}