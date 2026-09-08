const jwt = require("jsonwebtoken");
const WebSocket = require("ws");
const { parseCookies } = require("./utils/cookies");

function getTokenFromRequest(request) {
    const url = new URL(
        request.url,
        `http://${request.headers.host || "localhost"}`
    );

    return (
        parseCookies(request.headers.cookie).token ||
        url.searchParams.get("token")
    );
}

function authenticateRequest(request) {
    const token = getTokenFromRequest(request);

    if (!token) {
        throw new Error("Authentication required");
    }

    return jwt.verify(token, process.env.JWT_SECRET);
}

function canReceiveProjectEvent(user, recipientUserIds) {
    return (
        user.role === "admin" ||
        recipientUserIds.includes(Number(user.id))
    );
}

function createProjectWebSocketServer(server, projectEvents) {
    const wss = new WebSocket.Server({ noServer: true });

    server.on("upgrade", (request, socket, head) => {
        try {
            const user = authenticateRequest(request);

            wss.handleUpgrade(request, socket, head, (webSocket) => {
                webSocket.user = user;
                wss.emit("connection", webSocket, request);
            });
        } catch (error) {
            socket.write(
                "HTTP/1.1 401 Unauthorized\r\n" +
                "Connection: close\r\n" +
                "\r\n"
            );
            socket.destroy();
        }
    });

    function broadcast(type, project, recipientUserIds) {
        const message = JSON.stringify({ type, project });

        wss.clients.forEach((client) => {
            if (
                client.readyState === WebSocket.OPEN &&
                canReceiveProjectEvent(
                    client.user,
                    recipientUserIds
                )
            ) {
                client.send(message);
            }
        });
    }

    projectEvents.on(
        "projectCreated",
        (project, recipientUserIds) => {
            broadcast(
                "projectCreated",
                project,
                recipientUserIds
            );
        }
    );

    projectEvents.on(
        "projectUpdated",
        (project, recipientUserIds) => {
            broadcast(
                "projectUpdated",
                project,
                recipientUserIds
            );
        }
    );

    projectEvents.on(
        "projectDeleted",
        (project, recipientUserIds) => {
            broadcast(
                "projectDeleted",
                project,
                recipientUserIds
            );
        }
    );

    wss.on("connection", (socket) => {
        console.log(
            `WebSocket client connected: ${socket.user.username}`
        );
    });

    return wss;
}

module.exports = {
    authenticateRequest,
    canReceiveProjectEvent,
    createProjectWebSocketServer
};
