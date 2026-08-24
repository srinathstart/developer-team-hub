const fs = require("fs").promises;
const path = require("path");

const logFile =
    process.env.NODE_ENV === "test"
        ? path.join(__dirname, "../logs/activity.test.log")
        : path.join(__dirname, "../logs/activity.log");
        

async function logActivity(message) {
    const timestamp = new Date().toISOString();

    await fs.appendFile(
        logFile,
        `${timestamp} ${message}\n`
    );
}

module.exports = logActivity;

