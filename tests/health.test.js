const request = require("supertest");
const app = require("../index");

describe("GET /health", () => {
    test("should return server health", async () => {
        const response = await request(app).get("/health");

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            status: "ok"
        });
    });
});