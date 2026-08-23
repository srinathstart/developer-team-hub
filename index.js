const express = require("express");
const projectRouter = require("./routes/projects");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Developer Team Hub");
});

app.get("/health", (req, res) => {
    res.json({
        status: "ok"
    });
});

app.use("/projects", projectRouter);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});