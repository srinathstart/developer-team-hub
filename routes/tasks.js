const express = require("express");
const pool = require("../db");
const auth = require("../middleware/auth");
const logActivity = require("../utils/activityLogger");

const router = express.Router();
const allowedStatuses = [
    "todo",
    "in-progress",
    "done"
];

const allowedPriorities = [
    "low",
    "medium",
    "high"
];

function isValidDueDate(value) {
    if (value === undefined || value === null || value === "") {
        return true;
    }

    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    return !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value;
}

async function resolveAssignee(projectId, assigneeUsername) {
    if (
        assigneeUsername === undefined ||
        assigneeUsername === null ||
        assigneeUsername === ""
    ) {
        return { assignedTo: null, username: null };
    }

    if (typeof assigneeUsername !== "string") {
        return {
            error: "Assignee username must be a string",
            status: 400
        };
    }

    const normalizedUsername = assigneeUsername.trim();

    if (normalizedUsername === "") {
        return { assignedTo: null, username: null };
    }

    const userResult = await pool.query(
        `SELECT id, username
         FROM users
         WHERE username = $1`,
        [normalizedUsername]
    );

    if (userResult.rows.length === 0) {
        return { error: "Assignee not found", status: 404 };
    }

    const assignee = userResult.rows[0];
    const accessResult = await pool.query(
        `SELECT projects.id
         FROM projects
         LEFT JOIN project_members
         ON projects.id = project_members.project_id
         WHERE projects.id = $1
         AND (
             projects.user_id = $2
             OR project_members.user_id = $2
         )
         LIMIT 1`,
        [projectId, assignee.id]
    );

    if (accessResult.rows.length === 0) {
        return {
            error: "Assignee must be the project owner or a project member",
            status: 400
        };
    }

    return {
        assignedTo: assignee.id,
        username: assignee.username
    };
}


router.use(auth);

router.post("/projects/:projectId/tasks", async (req, res) => {
    const { projectId } = req.params;
    const {
        title,
        status,
        priority,
        assigneeUsername,
        due_date
    } = req.body;

    if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({
            error: "Task title is required"
        });
    }

if (!allowedPriorities.includes(priority)) {
    return res.status(400).json({
        error: "Invalid task priority"
    });
}


    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            error: "Invalid task status"
        });
    }

    if (!isValidDueDate(due_date)) {
        return res.status(400).json({
            error: "Invalid task due date"
        });
    }

    try {
        const projectResult = await pool.query(
            `SELECT projects.id
FROM projects
LEFT JOIN project_members
ON projects.id = project_members.project_id
WHERE projects.id = $1
AND (
    projects.user_id = $2
    OR (
        project_members.user_id = $2
        AND project_members.role = 'editor'
    )
)
LIMIT 1`,
            [projectId, req.user.id]
        );

        if (projectResult.rows.length === 0) {
            return res.status(404).json({
                error: "Project not found"
            });
        }

        const assignee = await resolveAssignee(
            projectId,
            assigneeUsername
        );

        if (assignee.error) {
            return res.status(assignee.status).json({
                error: assignee.error
            });
        }

        const taskResult = await pool.query(
            `INSERT INTO tasks
                (title, status, priority, project_id, assigned_to, due_date)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
                title,
                status,
                priority,
                projectId,
                assignee.assignedTo,
                due_date || null
            ]
        );

        const newTask = {
            ...taskResult.rows[0],
            assignee_username: assignee.username
        };
        await logActivity(
    projectId,
    req.user.id,
    `Created task "${newTask.title}"${
        newTask.assignee_username
            ? ` and assigned it to ${newTask.assignee_username}`
            : ""
    }${newTask.due_date ? `, due ${newTask.due_date}` : ""}`
);

        res.status(201).json({
            message: "Task created",
            task: newTask
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to create task"
        });
    }
});

router.get("/projects/:projectId/tasks", async (req, res) => {
    const { projectId } = req.params;

    const { priority, status } = req.query;


if (
    priority !== undefined &&
    !allowedPriorities.includes(priority)
) {
    return res.status(400).json({
        error: "Invalid task priority filter"
    });
}

if (
    status !== undefined &&
    !allowedStatuses.includes(status)
) {
    return res.status(400).json({
        error: "Invalid task status filter"
    });
}

    try {
        const projectResult = await pool.query(
            `SELECT projects.id
             FROM projects
             LEFT JOIN project_members
             ON projects.id = project_members.project_id
             WHERE projects.id = $1
             AND (
                 projects.user_id = $2
                 OR project_members.user_id = $2
            )
            LIMIT 1`,
            [projectId, req.user.id]
        );

        if (projectResult.rows.length === 0) {
            return res.status(404).json({
                error: "Project not found"
            });
        }

        const values = [projectId];
const conditions = ["tasks.project_id = $1"];

if (priority) {
    values.push(priority);
    conditions.push(
        `tasks.priority = $${values.length}`
    );
}

if (status) {
    values.push(status);
    conditions.push(
        `tasks.status = $${values.length}`
    );
}

const taskResult = await pool.query(
    `SELECT tasks.*, users.username AS assignee_username
     FROM tasks
     LEFT JOIN users
     ON tasks.assigned_to = users.id
     WHERE ${conditions.join(" AND ")}
     ORDER BY tasks.created_at DESC`,
    values
);


        res.json(taskResult.rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to get tasks"
        });
    }
});

router.patch("/tasks/:id", async (req, res) => {
    const { id } = req.params;
    const {
        title,
        status,
        priority,
        assigneeUsername,
        due_date
    } = req.body;

    if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({
            error: "Task title is required"
        });
    }


if (!allowedPriorities.includes(priority)) {
    return res.status(400).json({
        error: "Invalid task priority"
    });
}

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            error: "Invalid task status"
        });
    }

    if (!isValidDueDate(due_date)) {
        return res.status(400).json({
            error: "Invalid task due date"
        });
    }

    try {
        const taskResult = await pool.query(
            `SELECT tasks.*
FROM tasks
JOIN projects
ON tasks.project_id = projects.id
LEFT JOIN project_members
ON projects.id = project_members.project_id
WHERE tasks.id = $1
AND (
    projects.user_id = $2
    OR (
        project_members.user_id = $2
        AND project_members.role = 'editor'
    )
)
LIMIT 1`,
            [id, req.user.id]
        );

        if (taskResult.rows.length === 0) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        const existingTask = taskResult.rows[0];
        let assignedTo = existingTask.assigned_to;
        let assigneeName;
        let oldAssigneeName = null;

        if (existingTask.assigned_to !== null) {
            const oldAssigneeResult = await pool.query(
                `SELECT username FROM users WHERE id = $1`,
                [existingTask.assigned_to]
            );
            oldAssigneeName = oldAssigneeResult.rows[0]?.username || null;
        }
        const taskDueDate = Object.prototype.hasOwnProperty.call(
            req.body,
            "due_date"
        )
            ? due_date || null
            : existingTask.due_date;

        if (Object.prototype.hasOwnProperty.call(req.body, "assigneeUsername")) {
            const assignee = await resolveAssignee(
                existingTask.project_id,
                assigneeUsername
            );

            if (assignee.error) {
                return res.status(assignee.status).json({
                    error: assignee.error
                });
            }

            assignedTo = assignee.assignedTo;
            assigneeName = assignee.username;
        }

        const updatedTaskResult = await pool.query(
            `UPDATE tasks
             SET title = $1,
                 status = $2,
                 priority = $3,
                 assigned_to = $4,
                 due_date = $5
             WHERE id = $6
             RETURNING *`,
            [title, status, priority, assignedTo, taskDueDate, id]
        );

        if (assigneeName === undefined && assignedTo !== null) {
            const assigneeResult = await pool.query(
                `SELECT username FROM users WHERE id = $1`,
                [assignedTo]
            );
            assigneeName = assigneeResult.rows[0]?.username || null;
        }

        const updatedTask = {
            ...updatedTaskResult.rows[0],
            assignee_username: assigneeName || null
        };
        const changes = [];

        if (existingTask.title !== updatedTask.title) {
            changes.push(`renamed it from "${existingTask.title}" to "${updatedTask.title}"`);
        }

        if (existingTask.status !== updatedTask.status) {
            changes.push(`changed status from ${existingTask.status} to ${updatedTask.status}`);
        }

        if (existingTask.priority !== updatedTask.priority) {
            changes.push(`changed priority from ${existingTask.priority} to ${updatedTask.priority}`);
        }

        if (oldAssigneeName !== updatedTask.assignee_username) {
            changes.push(
                `changed assignee from ${oldAssigneeName || "unassigned"} to ${updatedTask.assignee_username || "unassigned"}`
            );
        }

        if ((existingTask.due_date || null) !== (updatedTask.due_date || null)) {
            changes.push(
                `changed due date from ${existingTask.due_date || "none"} to ${updatedTask.due_date || "none"}`
            );
        }
        await logActivity(
    updatedTask.project_id,
    req.user.id,
    changes.length > 0
        ? `Updated task "${updatedTask.title}": ${changes.join(", ")}`
        : `Updated task "${updatedTask.title}"`
);

        res.json({
            message: "Task updated",
            task: updatedTask
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to update task"
        });
    }
});

router.delete("/tasks/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const taskResult = await pool.query(
            `SELECT tasks.*
FROM tasks
JOIN projects
ON tasks.project_id = projects.id
LEFT JOIN project_members
ON projects.id = project_members.project_id
WHERE tasks.id = $1
AND (
    projects.user_id = $2
    OR (
        project_members.user_id = $2
        AND project_members.role = 'editor'
    )
)
LIMIT 1`,
            [id, req.user.id]
        );

        if (taskResult.rows.length === 0) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        const deletedTaskResult = await pool.query(
            `DELETE FROM tasks
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        const deletedTask = deletedTaskResult.rows[0];
        await logActivity(
    deletedTask.project_id,
    req.user.id,
    `Deleted task "${deletedTask.title}"`
);

        res.json({
            message: "Task deleted",
            task: deletedTask
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to delete task"
        });
    }
});

module.exports = router;
