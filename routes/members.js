const express = require("express");
const pool = require("../db");
const auth = require("../middleware/auth");
const logActivity = require("../utils/activityLogger");

const router = express.Router();
const allowedMemberRoles = ["viewer", "editor"];

router.use(auth);

router.post("/projects/:projectId/members", async (req, res) => {
    const { projectId } = req.params;
    const { userId, username, role } = req.body;
    const normalizedUsername =
        typeof username === "string" ? username.trim() : "";

    if (!allowedMemberRoles.includes(role)) {
        return res.status(400).json({
            error: "Invalid member role"
        });
    }

    if (
        username !== undefined &&
        normalizedUsername === ""
    ) {
        return res.status(400).json({
            error: "Member username is required"
        });
    }

    if (
        username === undefined &&
        (!Number.isInteger(userId) || userId <= 0)
    ) {
        return res.status(400).json({
            error: "Member username or user ID is required"
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

        const userResult = normalizedUsername
            ? await pool.query(
                `SELECT id, username
                 FROM users
                 WHERE username = $1`,
                [normalizedUsername]
            )
            : await pool.query(
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

        const memberUser = userResult.rows[0];

        if (Number(memberUser.id) === Number(req.user.id)) {
            return res.status(400).json({
                error: "You cannot add yourself as a project member"
            });
        }

        const memberResult = await pool.query(
            `INSERT INTO project_members (project_id, user_id, role)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [projectId, memberUser.id, role]
        );
        await logActivity(
    projectId,
    req.user.id,
    `Added ${memberUser.username} as ${role}`
);

        res.status(201).json({
            message: "Member added",
            member: {
                ...memberResult.rows[0],
                username: memberUser.username
            }
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
            `SELECT
                users.id,
                users.username,
                project_members.role
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

router.patch("/projects/:projectId/members/:userId", async (req, res) => {
    const { projectId, userId } = req.params;
    const { role } = req.body;

    if (!allowedMemberRoles.includes(role)) {
        return res.status(400).json({
            error: "Invalid member role"
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

        const existingMemberResult = await pool.query(
            `SELECT users.username, project_members.role
             FROM project_members
             JOIN users ON project_members.user_id = users.id
             WHERE project_members.project_id = $1
             AND project_members.user_id = $2`,
            [projectId, userId]
        );

        if (existingMemberResult.rows.length === 0) {
            return res.status(404).json({
                error: "Project member not found"
            });
        }

        const existingMember = existingMemberResult.rows[0];

        const updatedMemberResult = await pool.query(
            `UPDATE project_members
             SET role = $1
             WHERE project_id = $2
             AND user_id = $3
             RETURNING *`,
            [role, projectId, userId]
        );

        if (updatedMemberResult.rows.length === 0) {
            return res.status(404).json({
                error: "Project member not found"
            });
        }
        await logActivity(
    projectId,
    req.user.id,
    existingMember.role === role
        ? `Kept ${existingMember.username} as ${role}`
        : `Changed ${existingMember.username}'s role from ${existingMember.role} to ${role}`
);

        res.json({
            message: "Member role updated",
            member: updatedMemberResult.rows[0]
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to update member role"
        });
    }
});

router.delete("/projects/:projectId/members/:userId", async (req, res) => {
    const { projectId, userId } = req.params;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const projectResult = await client.query(
            `SELECT * FROM projects
             WHERE id = $1
             AND user_id = $2
             FOR UPDATE`,
            [projectId, req.user.id]
        );

        if (projectResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                error: "Project not found"
            });
        }

        const memberResult = await client.query(
            `SELECT
                project_members.*,
                users.username
             FROM project_members
             JOIN users
             ON users.id = project_members.user_id
             WHERE project_members.project_id = $1
             AND project_members.user_id = $2
             FOR UPDATE`,
            [projectId, userId]
        );

        if (memberResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                error: "Project member not found"
            });
        }

        const member = memberResult.rows[0];

        const unassignedTasksResult = await client.query(
            `UPDATE tasks
             SET assigned_to = NULL
             WHERE project_id = $1
             AND assigned_to = $2
             RETURNING id`,
            [projectId, userId]
        );

        const deletedMemberResult = await client.query(
            `DELETE FROM project_members
             WHERE project_id = $1
             AND user_id = $2
             RETURNING *`,
            [projectId, userId]
        );

        await logActivity(
            projectId,
            req.user.id,
            `Removed ${member.username} from the project and unassigned ${unassignedTasksResult.rowCount} task(s)`,
            client
        );

        await client.query("COMMIT");

        res.json({
            message: "Member removed",
            member: deletedMemberResult.rows[0],
            unassignedTaskCount: unassignedTasksResult.rowCount
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error(error);

        res.status(500).json({
            error: "Failed to remove project member"
        });
    } finally {
        client.release();
    }
});

module.exports = router;
