const http = require("http");

const projects = [];
let nextProjectId = 1;

const server = http.createServer((req, res) => {
    if (req.method === "GET" && req.url === "/") {
        return res.end("Developer Team Hub");
    }

    if (req.method === "GET" && req.url === "/health") {
        res.setHeader("Content-Type", "application/json");

        return res.end(JSON.stringify({
            status: "ok"
        }));
    }

    if (req.method === "GET" && req.url === "/projects") {
        res.setHeader("Content-Type", "application/json");

        return res.end(JSON.stringify(projects));
    }

    if (req.method === "GET" && req.url.startsWith("/projects/")) {
        const parts = req.url.split("/");
        const id = Number(parts[2]);

        const project = projects.find(
            (project) => project.id === id
        );

        res.setHeader("Content-Type", "application/json");

        if (!project) {
            res.statusCode = 404;

            return res.end(JSON.stringify({
                error: "Project not found"
            }));
        }

        return res.end(JSON.stringify(project));
    }

    if (req.method === "POST" && req.url === "/projects") {
        let body = "";

        res.setHeader("Content-Type", "application/json");

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", () => {
            try {
                const project = JSON.parse(body);

                if (!project.name || project.name.trim() === "") {
                    res.statusCode = 400;

                    return res.end(JSON.stringify({
                        error: "Project name is required"
                    }));
                }

                const newProject = {
                    id: nextProjectId,
                    name: project.name
                };

                nextProjectId++;

                projects.push(newProject);

                res.statusCode = 201;

                res.end(JSON.stringify({
                    message: "Project created",
                    project: newProject
                }));
            } catch (error) {
                res.statusCode = 400;

                res.end(JSON.stringify({
                    error: "Invalid JSON"
                }));
            }
        });

        return;
    }

    if (req.method === "PATCH" && req.url.startsWith("/projects/")) {
        const parts = req.url.split("/");
        const id = Number(parts[2]);

        const project = projects.find(
            (project) => project.id === id
        );

        res.setHeader("Content-Type", "application/json");

        if (!project) {
            res.statusCode = 404;

            return res.end(JSON.stringify({
                error: "Project not found"
            }));
        }

        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", () => {
            try {
                const updates = JSON.parse(body);

                if (!updates.name || updates.name.trim() === "") {
                    res.statusCode = 400;

                    return res.end(JSON.stringify({
                        error: "Project name is required"
                    }));
                }

                project.name = updates.name;

                res.statusCode = 200;

                res.end(JSON.stringify({
                    message: "Project updated",
                    project
                }));
            } catch (error) {
                res.statusCode = 400;

                res.end(JSON.stringify({
                    error: "Invalid JSON"
                }));
            }
        });

        return;
    }

    if (req.method === "DELETE" && req.url.startsWith("/projects/")) {
        const parts = req.url.split("/");
        const id = Number(parts[2]);

        const projectIndex = projects.findIndex(
            (project) => project.id === id
        );

        res.setHeader("Content-Type", "application/json");

        if (projectIndex === -1) {
            res.statusCode = 404;

            return res.end(JSON.stringify({
                error: "Project not found"
            }));
        }

        const deletedProject = projects.splice(projectIndex, 1)[0];

        res.statusCode = 200;

        return res.end(JSON.stringify({
            message: "Project deleted",
            project: deletedProject
        }));
    }

    res.statusCode = 404;
    res.end("Not Found");
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});