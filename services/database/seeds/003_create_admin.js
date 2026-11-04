import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  try {
    const query = `
      INSERT INTO users (
        id,
        email,
        password_hash,
        account_type,
        status,
        last_login_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING;
    `;

    const values = [
      "admin1",
      "ahsan@example.com",
      "$2a$10$wIY2ILjb4glE8ZbPkGy1WeaSdy7M1yWFmVE3MZO1lEq8beGPDPvL2",
      "platform_admin",
      "active",
      null
    ];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      console.log("Admin already exists.");
    } else {
      console.log("Admin seed completed.");
    }

  } catch (error) {
    console.error("Admin seed failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();
