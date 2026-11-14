import { pool } from "../../../config/database.js";

export class PostgresAccessContextRepository {
  // Loads everything a request needs: who the user is, which branch and role
  // their employee record has, and whether the account/tenant is still allowed in.
  async findByUserId(userId) {
    const result = await pool.query(
      `SELECT
         u.id            AS user_id,
         u.tenant_id,
         u.employee_id,
         u.account_type,
         u.status        AS user_status,
         e.branch_id,
         e.role,
         e.employment_status,
         t.status        AS tenant_status
       FROM users u
       JOIN employees e
         ON e.tenant_id = u.tenant_id AND e.id = u.employee_id
       JOIN tenants t
         ON t.id = u.tenant_id
       WHERE u.id = $1
       LIMIT 1`,
      [userId]
    );

    return result.rows[0] ?? null;
  }
}