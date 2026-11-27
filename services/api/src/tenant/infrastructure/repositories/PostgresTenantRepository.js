import {ITenantRepository} from "../../domain/repositories/ITenantRepository.js";

import Tenant from "../../domain/entiteis/Tenant.js";

export class PostgresTenantRepository extends ITenantRepository {

    constructor(pool) {
        super();
        this.pool = pool;
    }

    // Convert PostgreSQL column names into Tenant entity properties
    _mapToEntity(row) {
        if (!row) return null;

        return new Tenant({
            id: row.id,
            businessName: row.business_name,
            ownerName: row.owner_name,
            ownerPhone: row.owner_phone,
            email: row.email,
            ownerCnic: row.owner_cnic,
            headOfficeAddress: row.head_office_address,
            packageType: row.package_type,
            status: row.status,
            subscriptionDue: row.subscription_due,
            addonModules: row.addon_modules,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }

    // CREATE TENANT
    async create(tenant) {
        const query = `
            INSERT INTO tenants (
                business_name,
                owner_name,
                owner_phone,
                email,
                owner_cnic,
                head_office_address,
                package_type,
                status,
                subscription_due,
                addon_modules
            )
            VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9, $10
            )
            RETURNING *;
        `;

//         const q = ` SELECT
//     table_schema,
//     table_name,
//     column_name
// FROM information_schema.columns
// WHERE table_name = 'tenants'
// ORDER BY table_schema, ordinal_position; `;

        const values = [
            tenant.businessName,
            tenant.ownerName,
            tenant.ownerPhone,
            tenant.email,
            tenant.ownerCnic,
            tenant.headOfficeAddress,
            tenant.packageType,
            tenant.status || "ACTIVE",
            tenant.subscriptionDue,
            JSON.stringify(tenant.addonModules || [])
        ];

        // const a = await this.pool.query(q);
        // console.log(a)
        const result = await this.pool.query(query, values);

        return this._mapToEntity(result.rows[0]);
    }

    // FIND TENANT BY ID
    async findById(id) {
        const query = `
            SELECT * FROM tenants
            WHERE id = $1;
        `;

        const result = await this.pool.query(query, [id]);

        return this._mapToEntity(result.rows[0]);
    }

    // FIND ALL TENANTS
    async findAll() {
        const query = `
            SELECT * FROM tenants
            ORDER BY created_at DESC;
        `;

        const result = await this.pool.query(query);

        return result.rows.map(row => this._mapToEntity(row));
    }

    // UPDATE TENANT INFORMATION
    async update(id, tenantData) {

        const allowedFields = {
            businessName: "business_name",
            ownerName: "owner_name",
            ownerPhone: "owner_phone",
            email: "email",
            ownerCnic: "owner_cnic",
            headOfficeAddress: "head_office_address",
            packageType: "package_type",
            addonModules: "addon_modules"
        };

        const updates = [];
        const values = [];
        let index = 1;

        for (const [property, column] of Object.entries(allowedFields)) {
            if (tenantData[property] !== undefined) {

                updates.push(`${column} = $${index}`);

                const value = property === "addonModules"
                    ? JSON.stringify(tenantData[property])
                    : tenantData[property];

                values.push(value);
                index++;
            }
        }

        if (updates.length === 0) {
            throw new Error("No valid fields provided for update");
        }

        updates.push("updated_at = NOW()");

        values.push(id);

        const query = `
            UPDATE tenants
            SET ${updates.join(", ")}
            WHERE id = $${index}
            RETURNING *;
        `;

        const result = await this.pool.query(query, values);

        return this._mapToEntity(result.rows[0]);
    }

    // DELETE TENANT
    // async delete(id) {
    //     const query = `
    //         DELETE FROM tenants
    //         WHERE id = $1
    //         RETURNING id;
    //     `;

    //     const result = await this.pool.query(query, [id]);

    //     return result.rowCount > 0;
    // }

    async softDelete(id){
        const query = `
            UPDATE tenants
            SET deleted_at = NOW(),
                updated_at = NOW()
            WHERE id = $1
            AND deleted_at IS NULL
            RETURNING *;
        `;

        const result = await this.pool.query(query,[id])
    }

    // SUSPEND TENANT
    async suspend(id,reason) {
        const query = `
            UPDATE tenants
            SET status = 'SUSPENDED',
                suspension_reason = $2,
                updated_at = NOW()
            WHERE id = $1
              AND status = 'active'
            RETURNING *;
        `;

        const result = await this.pool.query(query, [id,reason]);

        return this._mapToEntity(result.rows[0]);
    }

    // ACTIVATE TENANT
    async activate(id) {
        const query = `
            UPDATE tenants
            SET status = 'ACTIVE',
                suspension_reason = NULL,
                updated_at = NOW()
            WHERE id = $1
              AND status = 'suspend'
            RETURNING *;
        `;

        const result = await this.pool.query(query, [id]);

        return this._mapToEntity(result.rows[0]);
    }

    // UPDATE SUBSCRIPTION PAYMENT / DUE DATE
    async updatePayment(id, paymentData) {

        const query = `
            UPDATE tenants
            SET subscription_due = $1,
                updated_at = NOW()
            WHERE id = $2
            RETURNING *;
        `;

        const result = await this.pool.query(query, [
            paymentData.newDueDate,
            id
        ]);

        return this._mapToEntity(result.rows[0]);
    }

    async findByEmail(email){
        const query = `
            SELECT * FROM tenants
            WHERE email = $1;
        `;

        const result = await this.pool.query(query, [email]);

        return this._mapToEntity(result.rows[0]);
    }

    async findByCnic(cnic){
        const query = `
            SELECT * FROM tenants
            WHERE owner_cnic = $1;
        `;

        const result = await this.pool.query(query, [cnic]);

        return this._mapToEntity(result.rows[0]);
    }
}
