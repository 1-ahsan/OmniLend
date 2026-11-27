export default class SearchByCnic{
    constructor(repository){
        this.tenantRepository = repository;
    }

    async execute(id){
        const tenant = this.tenantRepository.findByCnic(id)

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        return tenant;
    }
}