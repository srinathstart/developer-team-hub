const { Pool, types } = require("pg");

// Set the date type to parse dates as JavaScript Date objects
types.setTypeParser(1082, (value) => value);

const isTestEnvironment = process.env.NODE_ENV === "test";
const databaseUrl = isTestEnvironment
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL;

const connectionConfig = databaseUrl
    ? { connectionString: databaseUrl }
    : {
        host: "localhost",
        port: 5432,
        database: isTestEnvironment
            ? "developer_team_hub_test"
            : "developer_team_hub"
    };

const pool = new Pool(connectionConfig);

module.exports = pool;
