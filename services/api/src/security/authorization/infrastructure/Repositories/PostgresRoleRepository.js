import { pool } from "../../../config/database.js";
import { IRoleRepository } from "../../domain/Repositories/IRoleRepository.js";

export class PostgresRoleRepository extends IRoleRepository {

    async findPermissionsByUserId(userId) {

        const query = `
            SELECT p.code

            FROM users u

            JOIN roles r
                ON u.role_id = r.id

            JOIN role_permissions rp
                ON r.id = rp.role_id

            JOIN permissions p
                ON rp.permission_id = p.id

            WHERE u.id = $1
        `;

        const result = await pool.query(query, [userId]);

        return result.rows.map(row => row.code);
    }
}