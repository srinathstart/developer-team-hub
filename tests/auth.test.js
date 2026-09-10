const request = require("supertest");
const app = require("../index");

function hasAuthenticationCookie(response) {
    return (response.headers["set-cookie"] || []).some((cookie) =>
        cookie.startsWith("token=") && cookie.includes("HttpOnly")
    );
}

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

    test("POST /auth/login should return a token and set an HttpOnly cookie", async () => {
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
        expect(hasAuthenticationCookie(response)).toBe(true);
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

    test("POST /auth/register should reject missing credentials", async () => {
        const response = await request(app)
            .post("/auth/register")
            .send({ username: "missingpassword" });

        expect(response.statusCode).toBe(400);
        expect(response.body.error)
            .toBe("Username and password are required");
    });

    test("POST /auth/register should reject non-string credentials", async () => {
        const response = await request(app)
            .post("/auth/register")
            .send({
                username: 123,
                password: ["Test1234"]
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error)
            .toBe("Username and password must be strings");
    });

    test("POST /auth/register should reject a whitespace-only username", async () => {
        const response = await request(app)
            .post("/auth/register")
            .send({
                username: "   ",
                password: "Test1234"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Username is required");
    });

    test("POST /auth/register should trim the username", async () => {
        const response = await request(app)
            .post("/auth/register")
            .send({
                username: "  trimmeduser  ",
                password: "Test1234"
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.user.username).toBe("trimmeduser");
    });

    test("POST /auth/login should reject missing credentials", async () => {
        const response = await request(app)
            .post("/auth/login")
            .send({ password: "Test1234" });

        expect(response.statusCode).toBe(400);
        expect(response.body.error)
            .toBe("Username and password are required");
    });

    test("POST /auth/login should reject non-string credentials", async () => {
        const response = await request(app)
            .post("/auth/login")
            .send({ username: ["loginuser"], password: 12345678 });

        expect(response.statusCode).toBe(400);
        expect(response.body.error)
            .toBe("Username and password must be strings");
    });

    test("POST /auth/login should reject a whitespace-only username", async () => {
        const response = await request(app)
            .post("/auth/login")
            .send({ username: "   ", password: "Test1234" });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Username is required");
    });

    test("POST /auth/login should trim the username", async () => {
        await request(app)
            .post("/auth/register")
            .send({
                username: "spacedlogin",
                password: "Test1234"
            });

        const response = await request(app)
            .post("/auth/login")
            .send({
                username: "  spacedlogin  ",
                password: "Test1234"
            });

        expect(response.statusCode).toBe(200);
        expect(hasAuthenticationCookie(response)).toBe(true);
        expect(response.body.token).toBeDefined();
    });
});
