const request = require("supertest");
const app = require("../index");
const { getAuthToken } = require("./helpers");

async function createUserWithProject(username) {
    const password = "Test1234";

    const registerResponse =
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

    const token = getAuthToken(loginResponse);

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
        userId: registerResponse.body.user.id,
        token,
        projectId:
            projectResponse.body.project.id
    };
}
async function addMemberWithRole(
    ownerToken,
    projectId,
    memberUserId,
    role
) {
    return request(app)
        .post(
            `/projects/${projectId}/members`
        )
        .set(
            "Authorization",
            `Bearer ${ownerToken}`
        )
        .send({
            userId: memberUserId,
            role
        });
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
                status: "todo",
                priority: "high"
            });

        expect(response.statusCode).toBe(201);

        expect(response.body.task.title)
            .toBe("Write tests");

        expect(response.body.task.status)
            .toBe("todo");
        expect(response.body.task.priority)
            .toBe("high");

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
                status: "todo",
                priority: "medium"
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

    test("viewer should be able to view project tasks", async () => {
    const owner =
        await createUserWithProject(
            "viewerowner"
        );

    const viewer =
        await createUserWithProject(
            "viewermember"
        );

    await request(app)
        .post(
            `/projects/${owner.projectId}/tasks`
        )
        .set(
            "Authorization",
            `Bearer ${owner.token}`
        )
        .send({
            title: "Shared Task",
            status: "todo",
            priority: "medium"
        });

    await addMemberWithRole(
        owner.token,
        owner.projectId,
        viewer.userId,
        "viewer"
    );

    const response = await request(app)
        .get(
            `/projects/${owner.projectId}/tasks`
        )
        .set(
            "Authorization",
            `Bearer ${viewer.token}`
        );

    expect(response.statusCode).toBe(200);

    expect(response.body.length)
        .toBe(1);

    expect(response.body[0].title)
        .toBe("Shared Task");
});

test("viewer should not be able to create tasks", async () => {
    const owner =
        await createUserWithProject(
            "viewercreateowner"
        );

    const viewer =
        await createUserWithProject(
            "viewercreatemember"
        );

    await addMemberWithRole(
        owner.token,
        owner.projectId,
        viewer.userId,
        "viewer"
    );

    const response = await request(app)
        .post(
            `/projects/${owner.projectId}/tasks`
        )
        .set(
            "Authorization",
            `Bearer ${viewer.token}`
        )
        .send({
            title: "Blocked Task",
            status: "todo",
            priority: "medium"
        });

    expect(response.statusCode).toBe(404);
});

test("editor should be able to create tasks", async () => {
    const owner =
        await createUserWithProject(
            "editorcreateowner"
        );

    const editor =
        await createUserWithProject(
            "editorcreatemember"
        );

    await addMemberWithRole(
        owner.token,
        owner.projectId,
        editor.userId,
        "editor"
    );

    const response = await request(app)
        .post(
            `/projects/${owner.projectId}/tasks`
        )
        .set(
            "Authorization",
            `Bearer ${editor.token}`
        )
        .send({
            title: "Editor Task",
            status: "todo",
            priority: "high"
        });

    expect(response.statusCode).toBe(201);

    expect(response.body.task.title)
        .toBe("Editor Task");
});

test("editor should be able to update tasks", async () => {
    const owner =
        await createUserWithProject(
            "editorupdateowner"
        );

    const editor =
        await createUserWithProject(
            "editorupdatemember"
        );

    const createResponse = await request(app)
        .post(
            `/projects/${owner.projectId}/tasks`
        )
        .set(
            "Authorization",
            `Bearer ${owner.token}`
        )
        .send({
            title: "Original Task",
            status: "todo",
            priority: "medium"
        });

    const taskId =
        createResponse.body.task.id;

    await addMemberWithRole(
        owner.token,
        owner.projectId,
        editor.userId,
        "editor"
    );

    const response = await request(app)
        .patch(`/tasks/${taskId}`)
        .set(
            "Authorization",
            `Bearer ${editor.token}`
        )
        .send({
            title: "Edited By Member",
            status: "in-progress",
            priority: "high"
        });

    expect(response.statusCode).toBe(200);

    expect(response.body.task.title)
        .toBe("Edited By Member");

    expect(response.body.task.status)
        .toBe("in-progress");

    expect(response.body.task.priority)
        .toBe("high");
});

test("editor should be able to delete tasks", async () => {
    const owner =
        await createUserWithProject(
            "editordeleteowner"
        );

    const editor =
        await createUserWithProject(
            "editordeletemember"
        );

    const createResponse = await request(app)
        .post(
            `/projects/${owner.projectId}/tasks`
        )
        .set(
            "Authorization",
            `Bearer ${owner.token}`
        )
        .send({
            title: "Delete By Editor",
            status: "todo",
            priority: "medium"
        });

    const taskId =
        createResponse.body.task.id;

    await addMemberWithRole(
        owner.token,
        owner.projectId,
        editor.userId,
        "editor"
    );

    const response = await request(app)
        .delete(`/tasks/${taskId}`)
        .set(
            "Authorization",
            `Bearer ${editor.token}`
        );

    expect(response.statusCode).toBe(200);

    expect(response.body.message)
        .toBe("Task deleted");
});

test("GET should filter tasks by priority", async () => {
    const { token, projectId } =
        await createUserWithProject(
            "priorityfilteruser"
        );

    await request(app)
        .post(`/projects/${projectId}/tasks`)
        .set(
            "Authorization",
            `Bearer ${token}`
        )
        .send({
            title: "High Priority Task",
            status: "todo",
            priority: "high"
        });

    await request(app)
        .post(`/projects/${projectId}/tasks`)
        .set(
            "Authorization",
            `Bearer ${token}`
        )
        .send({
            title: "Low Priority Task",
            status: "todo",
            priority: "low"
        });

    const response = await request(app)
        .get(
            `/projects/${projectId}/tasks?priority=high`
        )
        .set(
            "Authorization",
            `Bearer ${token}`
        );

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);

    expect(response.body[0].title)
        .toBe("High Priority Task");
});

test("GET should reject invalid task priority filter", async () => {
    const { token, projectId } =
        await createUserWithProject(
            "badpriorityfilteruser"
        );

    const response = await request(app)
        .get(
            `/projects/${projectId}/tasks?priority=urgent`
        )
        .set(
            "Authorization",
            `Bearer ${token}`
        );

    expect(response.statusCode).toBe(400);

    expect(response.body.error)
        .toBe("Invalid task priority filter");
});

test("GET should filter tasks by status", async () => {
    const { token, projectId } =
        await createUserWithProject(
            "statusfilteruser"
        );

    await request(app)
        .post(`/projects/${projectId}/tasks`)
        .set(
            "Authorization",
            `Bearer ${token}`
        )
        .send({
            title: "Todo Task",
            status: "todo",
            priority: "medium"
        });

    await request(app)
        .post(`/projects/${projectId}/tasks`)
        .set(
            "Authorization",
            `Bearer ${token}`
        )
        .send({
            title: "Done Task",
            status: "done",
            priority: "medium"
        });

    const response = await request(app)
        .get(
            `/projects/${projectId}/tasks?status=done`
        )
        .set(
            "Authorization",
            `Bearer ${token}`
        );

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);

    expect(response.body[0].title)
        .toBe("Done Task");
});

test("GET should reject invalid task status filter", async () => {
    const { token, projectId } =
        await createUserWithProject(
            "badstatusfilteruser"
        );

    const response = await request(app)
        .get(
            `/projects/${projectId}/tasks?status=wrong`
        )
        .set(
            "Authorization",
            `Bearer ${token}`
        );

    expect(response.statusCode).toBe(400);

    expect(response.body.error)
        .toBe("Invalid task status filter");
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
                    status: "todo",
                    priority: "medium"
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
                status: "in-progress",
                priority: "low"
            });

        expect(response.statusCode).toBe(200);

        expect(response.body.task.title)
            .toBe("Updated Task");

        expect(response.body.task.status)
            .toBe("in-progress");

        expect(response.body.task.priority)
            .toBe("low");
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
                    status: "todo",
                    priority: "medium"
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
    test("POST should reject invalid task priority", async () => {
    const { token, projectId } =
        await createUserWithProject(
            "invalidpriorityuser"
        );

    const response = await request(app)
        .post(`/projects/${projectId}/tasks`)
        .set(
            "Authorization",
            `Bearer ${token}`
        )
        .send({
            title: "Invalid Priority Task",
            status: "todo",
            priority: "urgent"
        });

    expect(response.statusCode).toBe(400);

        expect(response.body.error)
            .toBe("Invalid task priority");
    });

    test("POST should assign a task by member username", async () => {
        const owner =
            await createUserWithProject("assignmentowner");
        const member =
            await createUserWithProject("assignmentmember");

        await addMemberWithRole(
            owner.token,
            owner.projectId,
            member.userId,
            "editor"
        );

        const response = await request(app)
            .post(`/projects/${owner.projectId}/tasks`)
            .set(
                "Authorization",
                `Bearer ${owner.token}`
            )
            .send({
                title: "Assigned Task",
                status: "todo",
                priority: "high",
                assigneeUsername: "assignmentmember"
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.task.assigned_to)
            .toBe(member.userId);
        expect(response.body.task.assignee_username)
            .toBe("assignmentmember");
    });

    test("GET should return the task assignee username", async () => {
        const owner =
            await createUserWithProject("assignmentlistowner");
        const member =
            await createUserWithProject("assignmentlistmember");

        await addMemberWithRole(
            owner.token,
            owner.projectId,
            member.userId,
            "viewer"
        );

        await request(app)
            .post(`/projects/${owner.projectId}/tasks`)
            .set(
                "Authorization",
                `Bearer ${owner.token}`
            )
            .send({
                title: "Listed Assignment",
                status: "todo",
                priority: "medium",
                assigneeUsername: "assignmentlistmember"
            });

        const response = await request(app)
            .get(`/projects/${owner.projectId}/tasks`)
            .set(
                "Authorization",
                `Bearer ${owner.token}`
            );

        expect(response.statusCode).toBe(200);
        expect(response.body[0].assignee_username)
            .toBe("assignmentlistmember");
    });

    test("POST should reject an assignee outside the project", async () => {
        const owner =
            await createUserWithProject("outsideowner");

        await createUserWithProject("outsidemember");

        const response = await request(app)
            .post(`/projects/${owner.projectId}/tasks`)
            .set(
                "Authorization",
                `Bearer ${owner.token}`
            )
            .send({
                title: "Invalid Assignment",
                status: "todo",
                priority: "medium",
                assigneeUsername: "outsidemember"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "Assignee must be the project owner or a project member"
        );
    });

    test("POST should create a task with a due date", async () => {
        const { token, projectId } =
            await createUserWithProject("taskduedatecreator");

        const response = await request(app)
            .post(`/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Deadline Task",
                status: "todo",
                priority: "high",
                due_date: "2026-12-15"
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.task.due_date).toBe("2026-12-15");
    });

    test("POST should reject an invalid task due date", async () => {
        const { token, projectId } =
            await createUserWithProject("invalidtaskdate");

        const response = await request(app)
            .post(`/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Invalid Deadline",
                status: "todo",
                priority: "medium",
                due_date: "2026-02-30"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Invalid task due date");
    });

    test("PATCH should update and clear a task due date", async () => {
        const { token, projectId } =
            await createUserWithProject("updatetaskdate");

        const createResponse = await request(app)
            .post(`/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Changing Deadline",
                status: "todo",
                priority: "medium"
            });

        const taskId = createResponse.body.task.id;
        const updateResponse = await request(app)
            .patch(`/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Changing Deadline",
                status: "in-progress",
                priority: "medium",
                due_date: "2026-11-20"
            });

        expect(updateResponse.statusCode).toBe(200);
        expect(updateResponse.body.task.due_date).toBe("2026-11-20");

        const clearResponse = await request(app)
            .patch(`/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Changing Deadline",
                status: "in-progress",
                priority: "medium",
                due_date: null
            });

        expect(clearResponse.statusCode).toBe(200);
        expect(clearResponse.body.task.due_date).toBeNull();
    });
});
