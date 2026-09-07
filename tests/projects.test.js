const request = require("supertest");
const app = require("../index");
const pool = require("../db");

async function registerAndLogin(
    username,
    password = "Test1234"
) {
    await request(app)
        .post("/auth/register")
        .send({
            username,
            password
        });

    const loginResponse = await request(app)
        .post("/auth/login")
        .send({
            username,
            password
        });

    return loginResponse.body.token;
}

function projectData(name = "Test Project") {
    return {
        name,
        description: "Test project description",
        status: "planned"
    };
}

describe("Project routes", () => {
    test("POST /projects should create a project", async () => {
        const token =
            await registerAndLogin("creator");

        const response = await request(app)
            .post("/projects")
            .set(
                "Authorization",
                `Bearer ${token}`
            )
            .send(projectData());

        expect(response.statusCode).toBe(201);

        expect(response.body.project.name)
            .toBe("Test Project");

        expect(response.body.project.description)
            .toBe("Test project description");

        expect(response.body.project.status)
            .toBe("planned");

        expect(response.body.project.id)
            .toBeDefined();
    });

    test("POST /projects should reject invalid status", async () => {
        const token =
            await registerAndLogin("invalidstatususer");

        const response = await request(app)
            .post("/projects")
            .set(
                "Authorization",
                `Bearer ${token}`
            )
            .send({
                name: "Invalid Project",
                description: "Testing validation",
                status: "wrong-status"
            });

        expect(response.statusCode).toBe(400);

        expect(response.body.error)
            .toBe("Invalid project status");
    });

    test("GET /projects should return only user's projects", async () => {
        const userOneToken =
            await registerAndLogin("userone");

        const userTwoToken =
            await registerAndLogin("usertwo");

        await request(app)
            .post("/projects")
            .set(
                "Authorization",
                `Bearer ${userOneToken}`
            )
            .send(projectData("User One Project"));

        await request(app)
            .post("/projects")
            .set(
                "Authorization",
                `Bearer ${userTwoToken}`
            )
            .send(projectData("User Two Project"));

        const response = await request(app)
            .get("/projects")
            .set(
                "Authorization",
                `Bearer ${userOneToken}`
            );

        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);

        expect(response.body[0].name)
            .toBe("User One Project");
    });

    test("PATCH /projects/:id should update own project", async () => {
        const token =
            await registerAndLogin("editor");

        const createResponse = await request(app)
            .post("/projects")
            .set(
                "Authorization",
                `Bearer ${token}`
            )
            .send(projectData());

        const projectId =
            createResponse.body.project.id;

        const response = await request(app)
            .patch(`/projects/${projectId}`)
            .set(
                "Authorization",
                `Bearer ${token}`
            )
            .send({
                name: "Updated Project",
                description: "Updated description",
                status: "in-progress"
            });

        expect(response.statusCode).toBe(200);

        expect(response.body.project.name)
            .toBe("Updated Project");

        expect(response.body.project.description)
            .toBe("Updated description");

        expect(response.body.project.status)
            .toBe("in-progress");
    });

    test("DELETE /projects/:id should return 403 for normal user", async () => {
        const token =
            await registerAndLogin("normaluser");

        const createResponse = await request(app)
            .post("/projects")
            .set(
                "Authorization",
                `Bearer ${token}`
            )
            .send(
                projectData("Protected Project")
            );

        const projectId =
            createResponse.body.project.id;

        const response = await request(app)
            .delete(`/projects/${projectId}`)
            .set(
                "Authorization",
                `Bearer ${token}`
            );

        expect(response.statusCode).toBe(403);

        expect(response.body.error)
            .toBe("Admin access required");
    });

    test("DELETE /projects/:id should work for admin", async () => {
        await request(app)
            .post("/auth/register")
            .send({
                username: "adminuser",
                password: "Admin1234"
            });

        await pool.query(
            `UPDATE users
             SET role = 'admin'
             WHERE username = $1`,
            ["adminuser"]
        );

        const loginResponse = await request(app)
            .post("/auth/login")
            .send({
                username: "adminuser",
                password: "Admin1234"
            });

        const adminToken =
            loginResponse.body.token;

        const createResponse = await request(app)
            .post("/projects")
            .set(
                "Authorization",
                `Bearer ${adminToken}`
            )
            .send(
                projectData("Admin Project")
            );

        const projectId =
            createResponse.body.project.id;

        const response = await request(app)
            .delete(`/projects/${projectId}`)
            .set(
                "Authorization",
                `Bearer ${adminToken}`
            );

        expect(response.statusCode).toBe(200);

        expect(response.body.message)
            .toBe("Project deleted");

        expect(response.body.project.id)
            .toBe(projectId);
    });

    test("admin should see all projects", async () => {
        const normalToken =
            await registerAndLogin("normalowner");

        await request(app)
            .post("/projects")
            .set(
                "Authorization",
                `Bearer ${normalToken}`
            )
            .send(
                projectData("Normal Project")
            );

        await request(app)
            .post("/auth/register")
            .send({
                username: "adminviewer",
                password: "Admin1234"
            });

        await pool.query(
            `UPDATE users
             SET role = 'admin'
             WHERE username = $1`,
            ["adminviewer"]
        );

        const adminLogin = await request(app)
            .post("/auth/login")
            .send({
                username: "adminviewer",
                password: "Admin1234"
            });

        const adminToken =
            adminLogin.body.token;

        await request(app)
            .post("/projects")
            .set(
                "Authorization",
                `Bearer ${adminToken}`
            )
            .send(
                projectData("Admin Project")
            );

        const response = await request(app)
            .get("/projects")
            .set(
                "Authorization",
                `Bearer ${adminToken}`
            );

        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(2);
    });
});