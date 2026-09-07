const request = require("supertest");
const app = require("../index");

async function registerAndLogin(username) {
    const password = "Test1234";

    await request(app)
        .post("/auth/register")
        .send({ username, password });

    const loginResponse = await request(app)
        .post("/auth/login")
        .send({ username, password });

    return loginResponse.body.token;
}

describe("Dashboard statistics", () => {
    test("returns statistics for accessible projects and tasks", async () => {
        const token = await registerAndLogin("dashboardowner");

        const projectResponse = await request(app)
            .post("/projects")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Dashboard Project",
                description: "Statistics test",
                status: "in-progress"
            });

        const projectId = projectResponse.body.project.id;

        await request(app)
            .post(`/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Overdue Dashboard Task",
                status: "todo",
                priority: "high",
                due_date: "2020-01-01"
            });

        await request(app)
            .post(`/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Completed Dashboard Task",
                status: "done",
                priority: "medium"
            });

        const response = await request(app)
            .get("/dashboard/stats")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            total_projects: 1,
            planned_projects: 0,
            in_progress_projects: 1,
            completed_projects: 0,
            shared_projects: 0,
            total_tasks: 2,
            completed_tasks: 1,
            overdue_tasks: 1
        });
    });

    test("requires authentication", async () => {
        const response = await request(app)
            .get("/dashboard/stats");

        expect(response.statusCode).toBe(401);
    });
});
