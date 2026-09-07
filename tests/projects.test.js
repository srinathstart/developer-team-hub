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
        status: "planned",
        due_date: "2026-10-15"
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

        expect(response.body.project.due_date)
            .toBe("2026-10-15");

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

    test("POST /projects should reject invalid due date", async () => {
    const token =
        await registerAndLogin("invaliddateuser");

    const response = await request(app)
        .post("/projects")
        .set(
            "Authorization",
            `Bearer ${token}`
        )
        .send({
            name: "Invalid Date Project",
            description: "Testing due date validation",
            status: "planned",
            due_date: "12/01/2026"
        });

    expect(response.statusCode).toBe(400);

    expect(response.body.error)
        .toBe("Invalid due date");
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

    test("project member should see shared project", async () => {
    const ownerToken =
        await registerAndLogin("sharedowner");

    const memberToken =
        await registerAndLogin("sharedmember");

    const createResponse = await request(app)
        .post("/projects")
        .set(
            "Authorization",
            `Bearer ${ownerToken}`
        )
        .send(projectData("Shared Project"));

    const projectId =
        createResponse.body.project.id;

    const memberResult = await pool.query(
        `SELECT id FROM users
         WHERE username = $1`,
        ["sharedmember"]
    );

    const memberId =
        memberResult.rows[0].id;

    await pool.query(
        `INSERT INTO project_members
         (project_id, user_id)
         VALUES ($1, $2)`,
        [projectId, memberId]
    );

    const listResponse = await request(app)
        .get("/projects")
        .set(
            "Authorization",
            `Bearer ${memberToken}`
        );

    expect(listResponse.statusCode).toBe(200);

    expect(
        listResponse.body.some(
            project => project.id === projectId
        )
    ).toBe(true);

    const singleResponse = await request(app)
        .get(`/projects/${projectId}`)
        .set(
            "Authorization",
            `Bearer ${memberToken}`
        );

    expect(singleResponse.statusCode).toBe(200);

    expect(singleResponse.body.name)
        .toBe("Shared Project");
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
                status: "in-progress",
                due_date: "2026-12-01"
            });

        expect(response.statusCode).toBe(200);

        expect(response.body.project.name)
            .toBe("Updated Project");

        expect(response.body.project.due_date)
            .toBe("2026-12-01");

        expect(response.body.project.description)
            .toBe("Updated description");

        expect(response.body.project.status)
            .toBe("in-progress");
    });

    test("DELETE /projects/:id should allow the project owner", async () => {
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

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Project deleted");
    });

    test("DELETE /projects/:id should reject another user", async () => {
        const ownerToken =
            await registerAndLogin("deleteowner");
        const otherToken =
            await registerAndLogin("deleteoutsider");

        const createResponse = await request(app)
            .post("/projects")
            .set(
                "Authorization",
                `Bearer ${ownerToken}`
            )
            .send(projectData("Owner Project"));

        const response = await request(app)
            .delete(`/projects/${createResponse.body.project.id}`)
            .set(
                "Authorization",
                `Bearer ${otherToken}`
            );

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("Project not found");
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
    test("GET /projects should filter by status", async () => {
    const token =
        await registerAndLogin("filteruser");

    await request(app)
        .post("/projects")
        .set(
            "Authorization",
            `Bearer ${token}`
        )
        .send({
            name: "Planned Project",
            description: "Planned",
            status: "planned"
        });

    await request(app)
        .post("/projects")
        .set(
            "Authorization",
            `Bearer ${token}`
        )
        .send({
            name: "Completed Project",
            description: "Completed",
            status: "completed"
        });

    const response = await request(app)
        .get("/projects?status=planned")
        .set(
            "Authorization",
            `Bearer ${token}`
        );

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);

    expect(response.body[0].name)
        .toBe("Planned Project");
});

test("GET /projects should reject invalid status filter", async () => {
    const token =
        await registerAndLogin("badfilteruser");

    const response = await request(app)
        .get("/projects?status=wrong")
        .set(
            "Authorization",
            `Bearer ${token}`
        );

    expect(response.statusCode).toBe(400);

    expect(response.body.error)
        .toBe("Invalid project status filter");
});

test("GET /projects should sort oldest first", async () => {
    const token =
        await registerAndLogin("sortuser");

    await request(app)
        .post("/projects")
        .set(
            "Authorization",
            `Bearer ${token}`
        )
        .send({
            name: "First Project",
            description: "Created first",
            status: "planned"
        });

    await new Promise(resolve =>
        setTimeout(resolve, 20)
    );

    await request(app)
        .post("/projects")
        .set(
            "Authorization",
            `Bearer ${token}`
        )
        .send({
            name: "Second Project",
            description: "Created second",
            status: "planned"
        });

    const response = await request(app)
        .get("/projects?sort=oldest")
        .set(
            "Authorization",
            `Bearer ${token}`
        );

    expect(response.statusCode).toBe(200);

    expect(response.body[0].name)
        .toBe("First Project");

    expect(response.body[1].name)
        .toBe("Second Project");
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
