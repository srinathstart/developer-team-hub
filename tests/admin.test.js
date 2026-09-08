const request = require("supertest");
const app = require("../index");
const pool = require("../db");

async function register(username) {
    const response = await request(app)
        .post("/auth/register")
        .send({ username, password: "Test1234" });

    return response.body.user;
}

async function login(username) {
    const response = await request(app)
        .post("/auth/login")
        .send({ username, password: "Test1234" });

    return response.body.token;
}

async function createAdmin(username) {
    const user = await register(username);
    await pool.query(
        `UPDATE users SET role = 'admin' WHERE id = $1`,
        [user.id]
    );

    return { user, token: await login(username) };
}

describe("Admin user management", () => {
    test("rejects a normal user", async () => {
        await register("normaladminpageuser");
        const token = await login("normaladminpageuser");

        const response = await request(app)
            .get("/admin/users")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(403);
        expect(response.body.error).toBe("Admin access required");
    });

    test("allows an admin to list users", async () => {
        const admin = await createAdmin("listusersadmin");
        await register("listednormaluser");

        const response = await request(app)
            .get("/admin/users")
            .set("Authorization", `Bearer ${admin.token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.map((user) => user.username))
            .toEqual(["listednormaluser", "listusersadmin"]);
    });

    test("updates a role and records an audit entry", async () => {
        const admin = await createAdmin("rolechangeadmin");
        const target = await register("rolechangetarget");

        const response = await request(app)
            .patch(`/admin/users/${target.id}/role`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send({ role: "admin" });

        expect(response.statusCode).toBe(200);
        expect(response.body.user.role).toBe("admin");

        const auditResponse = await request(app)
            .get("/admin/audit")
            .set("Authorization", `Bearer ${admin.token}`);

        expect(auditResponse.statusCode).toBe(200);
        expect(auditResponse.body[0]).toMatchObject({
            actor_username: "rolechangeadmin",
            target_username: "rolechangetarget",
            previous_role: "user",
            new_role: "admin"
        });
    });

    test("prevents an admin from demoting themselves", async () => {
        const admin = await createAdmin("selfdemotionadmin");

        const response = await request(app)
            .patch(`/admin/users/${admin.user.id}/role`)
            .set("Authorization", `Bearer ${admin.token}`)
            .send({ role: "user" });

        expect(response.statusCode).toBe(400);
        expect(response.body.error)
            .toBe("You cannot remove your own admin role");
    });
});
