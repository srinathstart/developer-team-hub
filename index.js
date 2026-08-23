const http = require("http");

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

    if (req.method === "POST" && req.url === "/projects") {
    let body = "";
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 201;


    req.on("data", (chunk) => {
        body += chunk;
    });

    req.on("end", () => {
    try {
        const project = JSON.parse(body);

        res.statusCode = 201;

        res.end(JSON.stringify({
            message: "Project created",
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

    res.statusCode = 404;
    res.end("Not Found");
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});