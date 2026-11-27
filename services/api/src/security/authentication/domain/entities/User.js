export class User {
  constructor({
    id,
    tenant_id,
    employee_id,
    email,
    password_hash,
    account_type,
    status,
    last_login_at,}) {
    this.id = id;
    this.tenantId = tenant_id;
    this.employeeId = employee_id;
    this.email = email;
    this.passwordHash = password_hash;
    this.accountType = account_type;
    this.status = status;
    this.lastLoginAt = last_login_at;
  }

  isActive() {
    return this.status === "active";
  }

  isPlatformAdmin() {
    return this.accountType === "platform_admin";
  }

  isTenantUser() {
    return this.accountType === "tenant_user";
  }
}