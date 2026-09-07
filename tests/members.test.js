const request = require("supertest");
const app = require("../index");

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
            description:
                "Testing collaboration",
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
                userId: teammate.user.id
            });

        expect(response.statusCode).toBe(201);
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
                userId: teammate.user.id
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
                userId: teammate.user.id
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
                userId: teammate.user.id
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
                userId: teammate.user.id
            });

        expect(response.statusCode).toBe(409);

        expect(response.body.error)
            .toBe(
                "User is already a project member"
            );
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
                userId: teammate.user.id
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
});