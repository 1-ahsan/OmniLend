
export class ITenantRepository {

    // Create a new tenant
    async create(tenant) {
        throw new Error("Method 'create()' must be implemented");
    }

    // Find a tenant by its ID
    async findById(id) {
        throw new Error("Method 'findById()' must be implemented");
    }

    // Retrieve all tenants
    async findAll() {
        throw new Error("Method 'findAll()' must be implemented");
    }

    // Update tenant information
    async update(id, tenantData) {
        throw new Error("Method 'update()' must be implemented");
    }

    // Delete a tenant
    // async delete(id) {
    //     throw new Error("Method 'delete()' must be implemented");
    // }
    async softDelete(id) {
    throw new Error("Method 'softDelete()' must be implemented");
}

    // Suspend an active tenant
    async suspend(id) {
        throw new Error("Method 'suspend()' must be implemented");
    }

    // Activate a suspended tenant
    async activate(id) {
        throw new Error("Method 'activate()' must be implemented");
    }

    // Update tenant subscription payment and due date
    async updatePayment(id, paymentData) {
        throw new Error("Method 'updatePayment()' must be implemented");
    }

    async findByEmail(email) {
        throw new Error("Method 'findByEmail()' must be implemented");
    }

    async findByCnic(cnic) {
        throw new Error("Method 'findByCnic()' must be implemented");
    }

    async suspend(id, reason) {
        throw new Error("Method 'suspend()' must be implemented"); 
    }
}

