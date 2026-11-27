export default class SearchByEmail{
    constructor(repository){
        this.tenantRepository = repository;
    }

    async execute(mail){
        const tenant = this.tenantRepository.findByEmail(mail)

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        return tenant;
    }
}