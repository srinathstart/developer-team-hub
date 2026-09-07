const express = require("express");
const pool = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

router.get("/projects/:projectId/activity", async (req, res) => {
    const { projectId } = req.params;

    try {
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
            [projectId, req.user.id]
        );

        if (accessResult.rows.length === 0) {
            return res.status(404).json({
                error: "Project not found"
            });
        }

        const activityResult = await pool.query(
            `SELECT
                activity_logs.id,
                activity_logs.action,
                activity_logs.created_at,
                users.username
             FROM activity_logs
             LEFT JOIN users
             ON activity_logs.user_id = users.id
             WHERE activity_logs.project_id = $1
             ORDER BY activity_logs.created_at DESC`,
            [projectId]
        );

        res.json(activityResult.rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to load activity"
        });
    }
});

module.exports = router;