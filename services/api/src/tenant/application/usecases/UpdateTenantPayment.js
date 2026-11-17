
export default class UpdateTenantPayment {
    constructor(tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    async execute(id, paymentData) {

        const tenant = await this.tenantRepository.findById(id);

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        const { amount, paymentDate, newDueDate } = paymentData;

        if (!Number.isFinite(amount) || amount <= 0) {
            throw new Error("Payment amount must be greater than zero");
        }

        if (!paymentDate || isNaN(Date.parse(paymentDate))) {
            throw new Error("Invalid payment date");
        }

        if (!newDueDate || isNaN(Date.parse(newDueDate))) {
            throw new Error("Invalid subscription due date");
        }

        if (
            tenant.subscriptionDue &&
            new Date(newDueDate) <= new Date(tenant.subscriptionDue)
        ) {
            throw new Error(
                "New due date must be later than the current due date"
            );
        }

        return await this.tenantRepository.updatePayment(
            id,
            paymentData
        );
    }
}

