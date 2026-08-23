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

    res.statusCode = 404;
    res.end("Not Found");
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});