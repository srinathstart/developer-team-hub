const request = require("supertest");
const app = require("../index");
const pool = require("../db");

describe("Project routes", () => {
    test("POST /projects should create a project with valid token", async () => {
        await request(app)
            .post("/auth/register")
            .send({
                username: "creator",
                password: "Test1234"
            });

        const loginResponse = await request(app)
            .post("/auth/login")
            .send({
                username: "creator",
                password: "Test1234"
            });

        const token = loginResponse.body.token;

        const response = await request(app)
            .post("/projects")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Test Project"
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.project.name).toBe("Test Project");
        expect(response.body.project.id).toBeDefined();
    });

    test("DELETE /projects/:id should return 403 for normal user", async () => {
        await request(app)
            .post("/auth/register")
            .send({
                username: "normaluser",
                password: "Test1234"
            });

        const loginResponse = await request(app)
            .post("/auth/login")
            .send({
                username: "normaluser",
                password: "Test1234"
            });

        const token = loginResponse.body.token;

        const createResponse = await request(app)
            .post("/projects")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Protected Project"
            });

        const projectId = createResponse.body.project.id;

        const response = await request(app)
            .delete(`/projects/${projectId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(403);
        expect(response.body.error).toBe("Admin access required");
    });

    test("DELETE /projects/:id should work for admin", async () => {
        await request(app)
            .post("/auth/register")
            .send({
                username: "admin",
                password: "Admin1234"
            });

        await pool.query(
            "UPDATE users SET role = 'admin' WHERE username = $1",
            ["admin"]
        );

        const loginResponse = await request(app)
            .post("/auth/login")
            .send({
                username: "admin",
                password: "Admin1234"
            });

        const adminToken = loginResponse.body.token;

        const createResponse = await request(app)
            .post("/projects")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                name: "Admin Project"
            });

        const projectId = createResponse.body.project.id;

        const response = await request(app)
            .delete(`/projects/${projectId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Project deleted");
        expect(response.body.project.id).toBe(projectId);
    });

    test("admin should see all projects while normal user sees only own projects", async () => {
    await request(app)
        .post("/auth/register")
        .send({
            username: "userone",
            password: "Test1234"
        });

    const userLogin = await request(app)
        .post("/auth/login")
        .send({
            username: "userone",
            password: "Test1234"
        });

    const userToken = userLogin.body.token;

    await request(app)
        .post("/projects")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
            name: "User One Project"
        });

    await request(app)
        .post("/auth/register")
        .send({
            username: "adminview",
            password: "Admin1234"
        });

    await pool.query(
        "UPDATE users SET role = 'admin' WHERE username = $1",
        ["adminview"]
    );

    const adminLogin = await request(app)
        .post("/auth/login")
        .send({
            username: "adminview",
            password: "Admin1234"
        });

    const adminToken = adminLogin.body.token;

    await request(app)
        .post("/projects")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
            name: "Admin Project"
        });

    const normalUserResponse = await request(app)
        .get("/projects")
        .set("Authorization", `Bearer ${userToken}`);

    const adminResponse = await request(app)
        .get("/projects")
        .set("Authorization", `Bearer ${adminToken}`);

    expect(normalUserResponse.body.length).toBe(1);
    expect(normalUserResponse.body[0].name).toBe("User One Project");

    expect(adminResponse.body.length).toBe(2);
});

});

