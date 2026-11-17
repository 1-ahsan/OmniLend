
export class TenantController {

    constructor({
        createTenant,
        getTenant,
        getAllTenants,
        searchByEmail,
        updateTenant,
        deleteTenant,
        suspendTenant,
        activateTenant,
        updatePayment
    }) {
        this.createTenant = createTenant;
        this.getTenant = getTenant;
        this.getAllTenants = getAllTenants;
        this.searchByEmail = searchByEmail;
        this.updateTenant = updateTenant;
        this.deleteTenant = deleteTenant;
        this.suspendTenant = suspendTenant;
        this.activateTenant = activateTenant;
        this.updatePayment = updatePayment;
    }

    // CREATE TENANT
    create = async (req, res, next) => {
        try {
            const tenant = await this.createTenant.execute(req.body);

            return res.status(201).json({
                success: true,
                message: "Tenant created successfully",
                data: tenant
            });

        } catch (error) {
            next(error);
        }
    };


    // GET ALL TENANTS
    getAll = async (req, res, next) => {
        try {
            const tenants = await this.getAllTenants.execute();

            return res.status(200).json({
                success: true,
                message: "Tenants retrieved successfully",
                data: tenants
            });

        } catch (error) {
            next(error);
        }
    };


    // GET TENANT BY ID
    getById = async (req, res, next) => {
        try {
            const tenant = await this.getTenant.execute(req.params.id);

            return res.status(200).json({
                success: true,
                message: "Tenant retrieved successfully",
                data: tenant
            });

        } catch (error) {
            next(error);
        }
    };


    // SEARCH TENANT BY EMAIL
    searchByEmail = async (req, res, next) => {
        try {
            const { email } = req.query;

            const tenant = await this.searchByEmail.execute(email);

            return res.status(200).json({
                success: true,
                message: "Tenant retrieved successfully",
                data: tenant
            });

        } catch (error) {
            next(error);
        }
    };


    // UPDATE TENANT
    update = async (req, res, next) => {
        try {
            const tenant = await this.updateTenant.execute(
                req.params.id,
                req.body
            );

            return res.status(200).json({
                success: true,
                message: "Tenant updated successfully",
                data: tenant
            });

        } catch (error) {
            next(error);
        }
    };


    // SOFT DELETE TENANT
    delete = async (req, res, next) => {
        try {
            await this.deleteTenant.execute(req.params.id);

            return res.status(200).json({
                success: true,
                message: "Tenant deleted successfully"
            });

        } catch (error) {
            next(error);
        }
    };


    // SUSPEND TENANT
    suspend = async (req, res, next) => {
        try {
            const { reason } = req.body;

            const tenant = await this.suspendTenant.execute(
                req.params.id,
                reason
            );

            return res.status(200).json({
                success: true,
                message: "Tenant suspended successfully",
                data: tenant
            });

        } catch (error) {
            next(error);
        }
    };


    // ACTIVATE TENANT
    activate = async (req, res, next) => {
        try {
            const tenant = await this.activateTenant.execute(
                req.params.id
            );

            return res.status(200).json({
                success: true,
                message: "Tenant activated successfully",
                data: tenant
            });

        } catch (error) {
            next(error);
        }
    };


    // UPDATE TENANT PAYMENT
    payment = async (req, res, next) => {
        try {
            const payment = await this.updatePayment.execute(
                req.params.id,
                req.body
            );

            return res.status(200).json({
                success: true,
                message: "Tenant payment updated successfully",
                data: payment
            });

        } catch (error) {
            next(error);
        }
    };

}
