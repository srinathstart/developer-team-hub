const express = require("express");
const http =require("http");
const WebSocket =require("ws");
require("dotenv").config();

const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const projectListeners = require("./events/projectListeners");
const projectEvents = require("./events/projectEvents");
const authRouter = require("./routes/auth");


const app = express();

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });   

function broadcast(data) {
    const message = JSON.stringify(data);

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

projectEvents.on("projectCreated", (project) => {
    broadcast({
        type: "projectCreated",
        project
    });
});

projectEvents.on("projectUpdated", (project) => {
    broadcast({
        type: "projectUpdated",
        project
    });
});

projectEvents.on("projectDeleted", (project) => {
    broadcast({
        type: "projectDeleted",
        project
    });
});


wss.on("connection", (socket) => {
    console.log("WebSocket client connected");
});

const {
    router: projectRouter,
    loadProjects
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

app.use("/projects", projectRouter);

app.use(errorHandler);

async function startServer() {
    await loadProjects();

    server.listen(3000, () => {
        console.log("Server is running on port 3000");
    });
}

startServer();