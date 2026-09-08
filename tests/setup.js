const pool = require("../db");

beforeEach(async () => {
    await pool.query("DELETE FROM admin_audit_logs");
    await pool.query("DELETE FROM projects");
    await pool.query("DELETE FROM users");
});

afterAll(async () => {
    await pool.end();
});
