const express = require("express");
const pool = require("../db");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

const router = express.Router();
const allowedRoles = ["user", "admin"];

router.use(auth, adminOnly);

router.get("/users", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, username, role
             FROM users
             ORDER BY username`
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to load users" });
    }
});

router.patch("/users/:id/role", async (req, res) => {
    const targetUserId = Number(req.params.id);
    const { role } = req.body || {};

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid user role" });
    }

    if (targetUserId === Number(req.user.id) && role !== "admin") {
        return res.status(400).json({
            error: "You cannot remove your own admin role"
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        const existingResult = await client.query(
            `SELECT id, username, role
             FROM users
             WHERE id = $1
             FOR UPDATE`,
            [targetUserId]
        );
        const existingUser = existingResult.rows[0];

        if (!existingUser) {
            await client.query("ROLLBACK");
            return res.status(404).json({ error: "User not found" });
        }

        const updatedResult = await client.query(
            `UPDATE users
             SET role = $1
             WHERE id = $2
             RETURNING id, username, role`,
            [role, targetUserId]
        );

        if (existingUser.role !== role) {
            await client.query(
                `INSERT INTO admin_audit_logs
                    (actor_user_id, target_user_id, previous_role, new_role)
                 VALUES ($1, $2, $3, $4)`,
                [req.user.id, targetUserId, existingUser.role, role]
            );
        }

        await client.query("COMMIT");
        res.json({
            message: existingUser.role === role
                ? "User role unchanged"
                : "User role updated",
            user: updatedResult.rows[0]
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error(error);
        res.status(500).json({ error: "Failed to update user role" });
    } finally {
        client.release();
    }
});

router.get("/audit", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                admin_audit_logs.id,
                actor.username AS actor_username,
                target.username AS target_username,
                admin_audit_logs.previous_role,
                admin_audit_logs.new_role,
                admin_audit_logs.created_at
             FROM admin_audit_logs
             LEFT JOIN users actor
             ON actor.id = admin_audit_logs.actor_user_id
             LEFT JOIN users target
             ON target.id = admin_audit_logs.target_user_id
             ORDER BY admin_audit_logs.created_at DESC`
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to load admin audit history" });
    }
});

module.exports = router;
