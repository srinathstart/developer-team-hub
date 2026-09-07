const request = require("supertest");
const app = require("../index");
const pool = require("../db");

async function registerAndLogin(username) {
    const password = "Test1234";

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

describe("Activity routes", () => {
    test("owner should see project activity", async () => {
        const token =
            await registerAndLogin(
                "activityowner"
            );

        const createResponse = await request(app)
            .post("/projects")
            .set(
                "Authorization",
                `Bearer ${token}`
            )
            .send({
                name: "Activity Project",
                description: "Testing activity",
                status: "planned"
            });

        const projectId =
            createResponse.body.project.id;
            

        const response = await request(app)
            .get(
                `/projects/${projectId}/activity`
            )
            .set(
                "Authorization",
                `Bearer ${token}`
            );

        expect(response.statusCode).toBe(200);

        expect(response.body.length)
            .toBeGreaterThan(0);

        expect(response.body[0].action)
            .toBe('Created project "Activity Project"');

        expect(response.body[0].username)
            .toBe("activityowner");
    });
    test("project member should see project activity", async () => {
    const ownerToken =
        await registerAndLogin(
            "activityowner2"
        );

    await request(app)
        .post("/auth/register")
        .send({
            username: "activitymember",
            password: "Test1234"
        });

    const memberLogin = await request(app)
        .post("/auth/login")
        .send({
            username: "activitymember",
            password: "Test1234"
        });

    const memberToken =
        memberLogin.body.token;

    const createResponse = await request(app)
        .post("/projects")
        .set(
            "Authorization",
            `Bearer ${ownerToken}`
        )
        .send({
            name: "Shared Activity Project",
            description: "Testing member activity access",
            status: "planned"
        });

    const projectId =
        createResponse.body.project.id;

    const memberResult = await pool.query(
        `SELECT id
         FROM users
         WHERE username = $1`,
        ["activitymember"]
    );

    const memberId =
        memberResult.rows[0].id;

    await request(app)
        .post(
            `/projects/${projectId}/members`
        )
        .set(
            "Authorization",
            `Bearer ${ownerToken}`
        )
        .send({
            userId: memberId,
            role: "viewer"
        });

    const response = await request(app)
        .get(
            `/projects/${projectId}/activity`
        )
        .set(
            "Authorization",
            `Bearer ${memberToken}`
        );

    expect(response.statusCode).toBe(200);

    expect(response.body.length)
        .toBeGreaterThan(0);
});
});
