
export class TenantValidator {

    static validateCreateTenant(data) {
        const errors = {};

        // Required fields
        const requiredFields = [
            "businessName",
            "ownerName",
            "ownerPhone",
            "email",
            "ownerCnic",
            "headOfficeAddress",
            "packageType",
            "subscriptionDue"
        ];

        requiredFields.forEach((field) => {
            if (
                data[field] === undefined ||
                data[field] === null ||
                String(data[field]).trim() === ""
            ) {
                errors[field] = `${field} is required`;
            }
        });

        // Business name
        if (
            data.businessName &&
            data.businessName.trim().length < 2
        ) {
            errors.businessName =
                "Business name must be at least 2 characters";
        }

        // Owner name
        if (
            data.ownerName &&
            data.ownerName.trim().length < 3
        ) {
            errors.ownerName =
                "Owner name must be at least 3 characters";
        }

        // Email validation
        if (
            data.email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
        ) {
            errors.email = "Invalid email address";
        }

        // Phone number validation
        if (
            data.ownerPhone &&
            !/^\+?[0-9]{10,15}$/.test(data.ownerPhone)
        ) {
            errors.ownerPhone = "Invalid phone number";
        }

        // Pakistani CNIC validation (XXXXX-XXXXXXX-X)
        if (
            data.ownerCnic &&
            !/^\d{5}-\d{7}-\d{1}$/.test(data.ownerCnic)
        ) {
            errors.ownerCnic =
                "CNIC must follow XXXXX-XXXXXXX-X format";
        }

        // Package type
        if (
            data.packageType &&
            !["BASIC", "STANDARD", "PREMIUM"].includes(
                data.packageType.toUpperCase()
            )
        ) {
            errors.packageType = "Invalid package type";
        }

        // Status
        if (
            data.status &&
            !["active", "suspended", "inactive"].includes(
                data.status.toLowerCase()
            )
        ) {
            errors.status = "Invalid tenant status";
        }

        // Subscription due date
        if (
            data.subscriptionDue &&
            isNaN(Date.parse(data.subscriptionDue))
        ) {
            errors.subscriptionDue =
                "Invalid subscription due date";
        }

        // Addon modules
        if (
            data.addonModules !== undefined &&
            (
                !Array.isArray(data.addonModules) ||
                !data.addonModules.every(
                    (module) => typeof module === "string" &&
                    module.trim().length > 0
                )
            )
        ) {
            errors.addonModules =
                "Addon modules must be an array of valid strings";
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
}

