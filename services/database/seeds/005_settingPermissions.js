import pg from "pg";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
    path: path.resolve(process.cwd(), '../api/.env')
});

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const PERMISSIONS = [
  {
    name: "tenant:view",
    description: "View tenant details and list",
  },
  {
    name: "tenant:update",
    description: "Update tenant information",
  },
  {
    name: "tenant:delete",
    description: "Delete a tenant",
  },
  {
    name: "tenant:activate",
    description: "Activate a tenant",
  },
  {
    name: "tenant:suspend",
    description: "Suspend a tenant",
  },
  {
    name: "tenant:payment",
    description: "Manage tenant billing and payments",
  },
];

async function seed() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Find SUPER_ADMIN role
    const roleResult = await client.query(
      `SELECT id FROM roles WHERE name = $1 LIMIT 1`,
      ["SUPER_ADMIN"]
    );

    if (roleResult.rowCount === 0) {
      throw new Error('Role "SUPER_ADMIN" not found.');
    }

    const superAdminRoleId = roleResult.rows[0].id;

    let insertedPermissionsCount = 0;
    let assignedPermissionsCount = 0;

    // 2. Insert permissions and assign them
    for (const perm of PERMISSIONS) {
      const permissionResult = await client.query(
        `
          INSERT INTO permissions (code, description)
          VALUES ($1, $2)
          ON CONFLICT (code)
          DO UPDATE SET description = EXCLUDED.description
          RETURNING id, (xmax = 0) AS inserted;
        `,
        [perm.name, perm.description]
      );

      const permissionId = permissionResult.rows[0].id;

      if (permissionResult.rows[0].inserted) {
        insertedPermissionsCount++;
      }

      // 3. Assign permission to SUPER_ADMIN
      const rolePermResult = await client.query(
        `
          INSERT INTO role_permissions (role_id, permission_id)
          VALUES ($1, $2)
          ON CONFLICT (role_id, permission_id) DO NOTHING
          RETURNING role_id;
        `,
        [superAdminRoleId, permissionId]
      );

      assignedPermissionsCount += rolePermResult.rowCount;
    }

    await client.query("COMMIT");

    console.log(
      `SUPER_ADMIN permissions seeded successfully.
New permissions: ${insertedPermissionsCount}
New role assignments: ${assignedPermissionsCount}`
    );

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("SUPER_ADMIN permissions seed failed:", error);
    process.exitCode = 1;

  } finally {
    client.release();
    await pool.end();
  }
}

seed();
