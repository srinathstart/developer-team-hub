const express = require("express");
const http =require("http");
const cors = require("cors");
require("dotenv").config();
const taskRouter = require("./routes/tasks");

const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const projectEvents = require("./events/projectEvents");
const {
    createProjectWebSocketServer
} = require("./websocket");
const authRouter = require("./routes/auth");
const memberRouter = require("./routes/members");
const activityRouter = require("./routes/activity");
const dashboardRouter = require("./routes/dashboard");


const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL
}));


const server = http.createServer(app);

createProjectWebSocketServer(server, projectEvents);

const {
    router: projectRouter
} = require("./routes/projects");

app.use(express.json());
app.use(logger);
app.use("/auth", authRouter);


app.get("/", (req, res) => {
    res.send("Developer Team Hub");
});

app.get("/health", (req, res) => {
    res.json({
        status: "ok"
    });
});

app.use("/", memberRouter);
app.use("/projects", projectRouter);
app.use("/", taskRouter);
app.use("/", activityRouter);
app.use("/dashboard", dashboardRouter);

app.use(errorHandler);

async function startServer() {
    const configuredPort = process.env.PORT || "3000";
    const port = Number(configuredPort);

    if (
        !Number.isInteger(port) ||
        port < 1 ||
        port > 65535
    ) {
        throw new Error("PORT must be a number between 1 and 65535");
    }

    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

function shutdown() {
    console.log("Shutting down server...");

    server.close(() => {
        console.log("Server closed");
        process.exit(0);
    });
}

if (require.main === module) {
    startServer();

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}

module.exports = app;
