const fs = require("fs");
const path = require("path");
const pool = require("../db");

async function initializeDatabase() {
    try {
        const result = await pool.query(
            "SELECT to_regclass('public.users') AS users_table"
        );

        if (result.rows[0].users_table) {
            console.log("Database schema already exists");
            return;
        }

        const schemaPath = path.join(__dirname, "..", "schema.sql");
        const schema = fs.readFileSync(schemaPath, "utf8");

        await pool.query(schema);
        console.log("Database schema initialized");
    } catch (error) {
        console.error("Failed to initialize database schema", error);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

initializeDatabase();
