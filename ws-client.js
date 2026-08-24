const WebSocket = require("ws");

const socket = new WebSocket("ws://localhost:3000");

socket.on("open", () => {
    console.log("Connected to WebSocket server");
});

socket.on("message", (message) => {
    console.log("Message from server:", message.toString());
});