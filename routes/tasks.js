const express = require("express");
const pool = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

router.post("/projects/:projectId/tasks", async (req, res) => {
    const { projectId } = req.params;
    const { title, status } = req.body;

    if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({
            error: "Task title is required"
        });
    }

    const allowedStatuses = [
        "todo",
        "in-progress",
        "done"
    ];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            error: "Invalid task status"
        });
    }

    try {
        const projectResult = await pool.query(
            `SELECT * FROM projects
             WHERE id = $1
             AND user_id = $2`,
            [projectId, req.user.id]
        );

        if (projectResult.rows.length === 0) {
            return res.status(404).json({
                error: "Project not found"
            });
        }

        const taskResult = await pool.query(
            `INSERT INTO tasks (title, status, project_id)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [title, status, projectId]
        );

        const newTask = taskResult.rows[0];

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

    try {
        const projectResult = await pool.query(
            `SELECT * FROM projects
             WHERE id = $1
             AND user_id = $2`,
            [projectId, req.user.id]
        );

        if (projectResult.rows.length === 0) {
            return res.status(404).json({
                error: "Project not found"
            });
        }

        const taskResult = await pool.query(
            `SELECT * FROM tasks
             WHERE project_id = $1
             ORDER BY created_at DESC`,
            [projectId]
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
    const { title, status } = req.body;

    if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({
            error: "Task title is required"
        });
    }

    const allowedStatuses = [
        "todo",
        "in-progress",
        "done"
    ];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            error: "Invalid task status"
        });
    }

    try {
        const taskResult = await pool.query(
            `SELECT tasks.*
             FROM tasks
             JOIN projects
             ON tasks.project_id = projects.id
             WHERE tasks.id = $1
             AND projects.user_id = $2`,
            [id, req.user.id]
        );

        if (taskResult.rows.length === 0) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        const updatedTaskResult = await pool.query(
            `UPDATE tasks
             SET title = $1,
                 status = $2
             WHERE id = $3
             RETURNING *`,
            [title, status, id]
        );

        const updatedTask = updatedTaskResult.rows[0];

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
             WHERE tasks.id = $1
             AND projects.user_id = $2`,
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