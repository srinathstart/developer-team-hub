const request = require("supertest");
const app = require("../index");

describe("Project routes", () => {
    test("POST /projects should create a project with valid token", async () => {
        await request(app)
            .post("/auth/register")
            .send({
                username: "creator",
                password: "test123"
            });

        const loginResponse = await request(app)
            .post("/auth/login")
            .send({
                username: "creator",
                password: "test123"
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
                password: "test123"
            });

        const loginResponse = await request(app)
            .post("/auth/login")
            .send({
                username: "normaluser",
                password: "test123"
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
                password: "admin123"
            });

        const loginResponse = await request(app)
            .post("/auth/login")
            .send({
                username: "admin",
                password: "admin123"
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
});