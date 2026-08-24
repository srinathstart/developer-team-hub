const request = require("supertest");
const app = require("../index");

describe("Auth routes", () => {
    test("POST /auth/register should register a user", async () => {
        const response = await request(app)
            .post("/auth/register")
            .send({
                username: "testuser",
                password: "test123"
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.user.username).toBe("testuser");
        expect(response.body.user.password).toBeUndefined();
    });
    test("POST /auth/login should return a token", async () => {
    await request(app)
        .post("/auth/register")
        .send({
            username: "loginuser",
            password: "test123"
        });

    const response = await request(app)
        .post("/auth/login")
        .send({
            username: "loginuser",
            password: "test123"
        });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
  });
});