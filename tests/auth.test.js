const request = require("supertest");
const app = require("../index");

describe("Auth routes", () => {
    test("POST /auth/register should register a user", async () => {
        const response = await request(app)
            .post("/auth/register")
            .send({
                username: "testuser",
                password: "Test1234"
            });

        expect(response.statusCode).toBe(201);

        expect(response.body.user.username)
            .toBe("testuser");

        expect(response.body.user.role)
            .toBe("user");

        expect(response.body.user.password)
            .toBeUndefined();
    });

    test("POST /auth/register should reject duplicate username", async () => {
        await request(app)
            .post("/auth/register")
            .send({
                username: "duplicateuser",
                password: "Test1234"
            });

        const response = await request(app)
            .post("/auth/register")
            .send({
                username: "duplicateuser",
                password: "Test1234"
            });

        expect(response.statusCode).toBe(409);

        expect(response.body.error)
            .toBe("Username already exists");
    });

    test("POST /auth/login should return a token", async () => {
        await request(app)
            .post("/auth/register")
            .send({
                username: "loginuser",
                password: "Test1234"
            });

        const response = await request(app)
            .post("/auth/login")
            .send({
                username: "loginuser",
                password: "Test1234"
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.token).toBeDefined();
    });

    test("POST /auth/login should reject wrong password", async () => {
        await request(app)
            .post("/auth/register")
            .send({
                username: "wrongpassworduser",
                password: "Test1234"
            });

        const response = await request(app)
            .post("/auth/login")
            .send({
                username: "wrongpassworduser",
                password: "Wrong1234"
            });

        expect(response.statusCode).toBe(401);

        expect(response.body.error)
            .toBe("Invalid username or password");
    });
});