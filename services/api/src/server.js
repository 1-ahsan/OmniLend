import "dotenv/config";
import app from "./app.js";
import { pool } from "./config/database.js";

const port = Number(process.env.PORT) || 3000;

async function startServer() {
  try {
    // Check whether PostgreSQL is reachable.
    await pool.query("SELECT 1");

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error.message);
    process.exitCode = 1;
    await pool.end();
  }
}

startServer();