const express = require("express");
const pool = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

router.post("/projects/:projectId/members", async (req, res) => {
    const { projectId } = req.params;
    const { userId } = req.body;

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

        const userResult = await pool.query(
            `SELECT id, username
             FROM users
             WHERE id = $1`,
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const memberResult = await pool.query(
            `INSERT INTO project_members (project_id, user_id)
             VALUES ($1, $2)
             RETURNING *`,
            [projectId, userId]
        );

        res.status(201).json({
            message: "Member added",
            member: memberResult.rows[0]
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                error: "User is already a project member"
            });
        }

        console.error(error);

        res.status(500).json({
            error: "Failed to add project member"
        });
    }
});

router.get("/projects/:projectId/members", async (req, res) => {
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

        const membersResult = await pool.query(
            `SELECT users.id, users.username
             FROM project_members
             JOIN users
             ON project_members.user_id = users.id
             WHERE project_members.project_id = $1
             ORDER BY users.username`,
            [projectId]
        );

        res.json(membersResult.rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to get project members"
        });
    }
});

router.delete("/projects/:projectId/members/:userId", async (req, res) => {
    const { projectId, userId } = req.params;

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

        const deletedMemberResult = await pool.query(
            `DELETE FROM project_members
             WHERE project_id = $1
             AND user_id = $2
             RETURNING *`,
            [projectId, userId]
        );

        if (deletedMemberResult.rows.length === 0) {
            return res.status(404).json({
                error: "Project member not found"
            });
        }

        res.json({
            message: "Member removed",
            member: deletedMemberResult.rows[0]
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to remove project member"
        });
    }
});

module.exports = router;