const express = require("express");
const {
    router: projectRouter,
    loadProjects
} = require("./routes/projects");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const projectListeners = require("./events/projectListeners");

const app = express();

app.use(express.json());
app.use(logger);


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

    app.listen(3000, () => {
        console.log("Server is running on port 3000");
    });
}

startServer();