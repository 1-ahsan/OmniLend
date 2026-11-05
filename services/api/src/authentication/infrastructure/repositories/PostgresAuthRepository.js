import { pool } from "../../../config/database.js";
import { User } from "../../domain/entities/User.js";

export class PostgresAuthRepository {

  async findByEmail(email) {
    const query = `
      SELECT
        id,
        tenant_id,
        employee_id,
        email,
        password_hash,
        account_type,
        status,
        last_login_at
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `;

    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return null;
    }

    return new User(result.rows[0]);
  }

  async updateLastLogin(userId) {
    const query = `
      UPDATE users
      SET
        last_login_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
    `;

    await pool.query(query, [userId]);
  }
}