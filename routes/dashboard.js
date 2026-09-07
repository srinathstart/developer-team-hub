const express = require("express");
const pool = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

router.get("/stats", async (req, res) => {
    try {
        const result = await pool.query(
            `WITH accessible_projects AS (
                SELECT DISTINCT
                    projects.id,
                    projects.status,
                    projects.user_id
                FROM projects
                LEFT JOIN project_members
                ON projects.id = project_members.project_id
                WHERE $2 = 'admin'
                   OR projects.user_id = $1
                   OR project_members.user_id = $1
            ),
            project_stats AS (
                SELECT
                    COUNT(*)::integer AS total_projects,
                    COUNT(*) FILTER (WHERE status = 'planned')::integer AS planned_projects,
                    COUNT(*) FILTER (WHERE status = 'in-progress')::integer AS in_progress_projects,
                    COUNT(*) FILTER (WHERE status = 'completed')::integer AS completed_projects,
                    COUNT(*) FILTER (WHERE user_id <> $1)::integer AS shared_projects
                FROM accessible_projects
            ),
            task_stats AS (
                SELECT
                    COUNT(tasks.id)::integer AS total_tasks,
                    COUNT(tasks.id) FILTER (WHERE tasks.status = 'done')::integer AS completed_tasks,
                    COUNT(tasks.id) FILTER (
                        WHERE tasks.due_date < CURRENT_DATE
                        AND tasks.status <> 'done'
                    )::integer AS overdue_tasks
                FROM tasks
                JOIN accessible_projects
                ON tasks.project_id = accessible_projects.id
            )
            SELECT *
            FROM project_stats
            CROSS JOIN task_stats`,
            [req.user.id, req.user.role]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to load dashboard statistics"
        });
    }
});

module.exports = router;
