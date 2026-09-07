const request = require("supertest");
const app = require("../index");
const pool = require("../db");

async function registerAndLogin(username) {
    const password = "Test1234";

    const registerResponse =
        await request(app)
            .post("/auth/register")
            .send({
                username,
                password
            });

    const loginResponse =
        await request(app)
            .post("/auth/login")
            .send({
                username,
                password
            });

    return {
        user: registerResponse.body.user,
        token: loginResponse.body.token
    };
}

async function createProject(token) {
    const response = await request(app)
        .post("/projects")
        .set(
            "Authorization",
            `Bearer ${token}`
        )
        .send({
            name: "Members Project",
            description: "Testing collaboration",
            status: "planned"
        });

    return response.body.project;
}

describe("Member routes", () => {
    test("owner should add a member", async () => {
        const owner =
            await registerAndLogin(
                "memberowner"
            );

        const teammate =
            await registerAndLogin(
                "teammate"
            );

        const project =
            await createProject(owner.token);

        const response = await request(app)
            .post(
                `/projects/${project.id}/members`
            )
            .set(
                "Authorization",
                `Bearer ${owner.token}`
            )
            .send({
                userId: teammate.user.id,
                role: "viewer"
            });

        expect(response.statusCode).toBe(201);

        expect(response.body.member.role)
            .toBe("viewer");
    });

    test("owner should add a member by username", async () => {
        const owner =
            await registerAndLogin("usernameowner");

        await registerAndLogin("usernamemember");

        const project =
            await createProject(owner.token);

        const response = await request(app)
            .post(`/projects/${project.id}/members`)
            .set(
                "Authorization",
                `Bearer ${owner.token}`
            )
            .send({
                username: "usernamemember",
                role: "editor"
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.member.username)
            .toBe("usernamemember");
        expect(response.body.member.role)
            .toBe("editor");
    });

    test("unknown member username should return 404", async () => {
        const owner =
            await registerAndLogin("unknownnameowner");

        const project =
            await createProject(owner.token);

        const response = await request(app)
            .post(`/projects/${project.id}/members`)
            .set(
                "Authorization",
                `Bearer ${owner.token}`
            )
            .send({
                username: "missingmember",
                role: "viewer"
            });

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("User not found");
    });

    test("empty member username should return 400", async () => {
        const owner =
            await registerAndLogin("emptynameowner");

        const project =
            await createProject(owner.token);

        const response = await request(app)
            .post(`/projects/${project.id}/members`)
            .set(
                "Authorization",
                `Bearer ${owner.token}`
            )
            .send({
                username: "   ",
                role: "viewer"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error)
            .toBe("Member username is required");
    });

    test("owner should not add themselves as a member", async () => {
        const owner =
            await registerAndLogin("selfmemberowner");

        const project =
            await createProject(owner.token);

        const response = await request(app)
            .post(`/projects/${project.id}/members`)
            .set(
                "Authorization",
                `Bearer ${owner.token}`
            )
            .send({
                username: "selfmemberowner",
                role: "viewer"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error)
            .toBe("You cannot add yourself as a project member");
    });

    test("owner should list members", async () => {
        const owner =
            await registerAndLogin(
                "listowner"
            );

        const teammate =
            await registerAndLogin(
                "listmember"
            );

        const project =
            await createProject(owner.token);

        await request(app)
            .post(
                `/projects/${project.id}/members`
            )
            .set(
                "Authorization",
                `Bearer ${owner.token}`
            )
            .send({
                userId: teammate.user.id,
                role: "viewer"
            });

        const response = await request(app)
            .get(
                `/projects/${project.id}/members`
            )
            .set(
                "Authorization",
                `Bearer ${owner.token}`
            );

        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);

        expect(response.body[0].username)
            .toBe("listmember");

        expect(response.body[0].role)
            .toBe("viewer");
    });

    test("member should be able to view project members", async () => {
        const owner =
            await registerAndLogin(
                "viewowner"
            );

        const teammate =
            await registerAndLogin(
                "viewmember"
            );

        const project =
            await createProject(owner.token);

        await request(app)
            .post(
                `/projects/${project.id}/members`
            )
            .set(
                "Authorization",
                `Bearer ${owner.token}`
            )
            .send({
                userId: teammate.user.id,
                role: "viewer"
            });

        const response = await request(app)
            .get(
                `/projects/${project.id}/members`
            )
            .set(
                "Authorization",
                `Bearer ${teammate.token}`
            );

        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);

        expect(response.body[0].role)
            .toBe("viewer");
    });

    test("duplicate member should return 409", async () => {
        const owner =
            await registerAndLogin(
                "duplicateowner"
            );

        const teammate =
            await registerAndLogin(
                "duplicatemember"
            );

        const project =
            await createProject(owner.token);

        await request(app)
            .post(
                `/projects/${project.id}/members`
            )
            .set(
                "Authorization",
                `Bearer ${owner.token}`
            )
            .send({
                userId: teammate.user.id,
                role: "viewer"
            });

        const response = await request(app)
            .post(
                `/projects/${project.id}/members`
            )
            .set(
                "Authorization",
                `Bearer ${owner.token}`
            )
            .send({
                userId: teammate.user.id,
                role: "viewer"
            });

        expect(response.statusCode).toBe(409);

        expect(response.body.error)
            .toBe(
                "User is already a project member"
            );
    });

    test("owner should update member role", async () => {
        const owner =
            await registerAndLogin(
                "roleowner"
            );

        const teammate =
            await registerAndLogin(
                "rolemember"
            );

        const project =
            await createProject(owner.token);

        await request(app)
            .post(
                `/projects/${project.id}/members`
            )
            .set(
                "Authorization",
                `Bearer ${owner.token}`
            )
            .send({
                userId: teammate.user.id,
                role: "viewer"
            });

        const response = await request(app)
            .patch(
                `/projects/${project.id}/members/${teammate.user.id}`
            )
            .set(
                "Authorization",
                `Bearer ${owner.token}`
            )
            .send({
                role: "editor"
            });

        expect(response.statusCode).toBe(200);

        expect(response.body.message)
            .toBe("Member role updated");

        expect(response.body.member.role)
            .toBe("editor");
    });

    test("owner should remove member", async () => {
        const owner =
            await registerAndLogin(
                "removeowner"
            );

        const teammate =
            await registerAndLogin(
                "removemember"
            );

        const project =
            await createProject(owner.token);

        await request(app)
            .post(
                `/projects/${project.id}/members`
            )
            .set(
                "Authorization",
                `Bearer ${owner.token}`
            )
            .send({
                userId: teammate.user.id,
                role: "viewer"
            });

        const response = await request(app)
            .delete(
                `/projects/${project.id}/members/${teammate.user.id}`
            )
            .set(
                "Authorization",
                `Bearer ${owner.token}`
            );

        expect(response.statusCode).toBe(200);

        expect(response.body.message)
            .toBe("Member removed");
    });

    test("removing a member should unassign their project tasks", async () => {
        const owner =
            await registerAndLogin("unassignowner");

        const teammate =
            await registerAndLogin("unassignmember");

        const project =
            await createProject(owner.token);

        await request(app)
            .post(`/projects/${project.id}/members`)
            .set("Authorization", `Bearer ${owner.token}`)
            .send({
                userId: teammate.user.id,
                role: "editor"
            });

        const taskResult = await pool.query(
            `INSERT INTO tasks
                (title, status, priority, project_id, assigned_to)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [
                "Assigned task",
                "todo",
                "medium",
                project.id,
                teammate.user.id
            ]
        );

        const response = await request(app)
            .delete(
                `/projects/${project.id}/members/${teammate.user.id}`
            )
            .set("Authorization", `Bearer ${owner.token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.unassignedTaskCount).toBe(1);

        const updatedTaskResult = await pool.query(
            `SELECT assigned_to
             FROM tasks
             WHERE id = $1`,
            [taskResult.rows[0].id]
        );

        expect(updatedTaskResult.rows[0].assigned_to).toBeNull();
    });
});
