
export default class Tenant {
    constructor({
        id,
        businessName,
        ownerName,
        ownerPhone,
        email,
        ownerCnic,
        headOfficeAddress,
        packageType,
        status = "ACTIVE",
        subscriptionDue,
        addonModules = [],
        createdAt = new Date(),
        updatedAt = new Date()
    }) {
        this.id = id;
        this.businessName = businessName;
        this.ownerName = ownerName;
        this.ownerPhone = ownerPhone;
        this.email = email;
        this.ownerCnic = ownerCnic;
        this.headOfficeAddress = headOfficeAddress;
        this.packageType = packageType;
        this.status = status;
        this.subscriptionDue = subscriptionDue;
        this.addonModules = addonModules;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

