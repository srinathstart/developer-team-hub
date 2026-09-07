require("dotenv").config();
const jwt = require("jsonwebtoken");
const {
    authenticateRequest,
    canReceiveProjectEvent
} = require("../websocket");

describe("WebSocket security", () => {
    test("authenticates a connection with a valid token", () => {
        const token = jwt.sign(
            { id: 7, username: "socketuser", role: "user" },
            process.env.JWT_SECRET
        );

        const user = authenticateRequest({
            url: `/?token=${encodeURIComponent(token)}`,
            headers: { host: "localhost:3000" }
        });

        expect(user.id).toBe(7);
        expect(user.username).toBe("socketuser");
    });

    test("rejects a connection without a token", () => {
        expect(() => authenticateRequest({
            url: "/",
            headers: { host: "localhost:3000" }
        })).toThrow("Authentication required");
    });

    test("rejects an invalid token", () => {
        expect(() => authenticateRequest({
            url: "/?token=invalid-token",
            headers: { host: "localhost:3000" }
        })).toThrow();
    });

    test("allows only project recipients and admins", () => {
        const recipientIds = [2, 4];

        expect(canReceiveProjectEvent(
            { id: 2, role: "user" },
            recipientIds
        )).toBe(true);

        expect(canReceiveProjectEvent(
            { id: 3, role: "user" },
            recipientIds
        )).toBe(false);

        expect(canReceiveProjectEvent(
            { id: 3, role: "admin" },
            recipientIds
        )).toBe(true);
    });
});
