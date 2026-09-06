const { Pool } = require("pg");

const pool = new Pool({
    host: "localhost",
    port: 5432,
    database:
        process.env.NODE_ENV === "test"
            ? "developer_team_hub_test"
            : "developer_team_hub",
});

module.exports = pool;