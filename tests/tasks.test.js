const request = require("supertest");
const app = require("../index");

async function createUserWithProject(username) {
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

    const token = loginResponse.body.token;

    const projectResponse = await request(app)
        .post("/projects")
        .set(
            "Authorization",
            `Bearer ${token}`
        )
        .send({
            name: `${username} Project`,
            description: "Task test project",
            status: "planned"
        });

    return {
        token,
        projectId:
            projectResponse.body.project.id
    };
}

describe("Task routes", () => {
    test("POST should create a task", async () => {
        const { token, projectId } =
            await createUserWithProject(
                "taskcreator"
            );

        const response = await request(app)
            .post(
                `/projects/${projectId}/tasks`
            )
            .set(
                "Authorization",
                `Bearer ${token}`
            )
            .send({
                title: "Write tests",
                status: "todo"
            });

        expect(response.statusCode).toBe(201);

        expect(response.body.task.title)
            .toBe("Write tests");

        expect(response.body.task.status)
            .toBe("todo");

        expect(response.body.task.project_id)
            .toBe(projectId);
    });

    test("GET should return project tasks", async () => {
        const { token, projectId } =
            await createUserWithProject(
                "taskviewer"
            );

        await request(app)
            .post(
                `/projects/${projectId}/tasks`
            )
            .set(
                "Authorization",
                `Bearer ${token}`
            )
            .send({
                title: "Task One",
                status: "todo"
            });

        const response = await request(app)
            .get(
                `/projects/${projectId}/tasks`
            )
            .set(
                "Authorization",
                `Bearer ${token}`
            );

        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);

        expect(response.body[0].title)
            .toBe("Task One");
    });

    test("PATCH should update a task", async () => {
        const { token, projectId } =
            await createUserWithProject(
                "taskeditor"
            );

        const createResponse =
            await request(app)
                .post(
                    `/projects/${projectId}/tasks`
                )
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    title: "Old Task",
                    status: "todo"
                });

        const taskId =
            createResponse.body.task.id;

        const response = await request(app)
            .patch(`/tasks/${taskId}`)
            .set(
                "Authorization",
                `Bearer ${token}`
            )
            .send({
                title: "Updated Task",
                status: "in-progress"
            });

        expect(response.statusCode).toBe(200);

        expect(response.body.task.title)
            .toBe("Updated Task");

        expect(response.body.task.status)
            .toBe("in-progress");
    });

    test("DELETE should delete a task", async () => {
        const { token, projectId } =
            await createUserWithProject(
                "taskdeleter"
            );

        const createResponse =
            await request(app)
                .post(
                    `/projects/${projectId}/tasks`
                )
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    title: "Delete Me",
                    status: "todo"
                });

        const taskId =
            createResponse.body.task.id;

        const response = await request(app)
            .delete(`/tasks/${taskId}`)
            .set(
                "Authorization",
                `Bearer ${token}`
            );

        expect(response.statusCode).toBe(200);
    });

    test("another user should not access project tasks", async () => {
        const owner =
            await createUserWithProject(
                "taskowner"
            );

        const other =
            await createUserWithProject(
                "taskoutsider"
            );

        const response = await request(app)
            .get(
                `/projects/${owner.projectId}/tasks`
            )
            .set(
                "Authorization",
                `Bearer ${other.token}`
            );

        expect(response.statusCode).toBe(404);
    });
});