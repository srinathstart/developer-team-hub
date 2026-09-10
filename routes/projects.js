const express = require("express");
const pool = require("../db");
const logActivity = require("../utils/activityLogger");


const router = express.Router();

const projectEvents = require("../events/projectEvents");
const auth = require("../middleware/auth");
router.use(auth);

const validateProject = require("../middleware/validateProject");

async function getProjectRecipientUserIds(projectId) {
    const result = await pool.query(
        `SELECT user_id
         FROM projects
         WHERE id = $1
         UNION
         SELECT user_id
         FROM project_members
         WHERE project_id = $1`,
        [projectId]
    );

    return result.rows.map((row) => Number(row.user_id));
}

router.get("/", async (req, res) => {
    const { status, sort } = req.query;
    const allowedStatuses = [
        "planned",
        "in-progress",
        "completed"
    ];

    if (
        status !== undefined &&
        !allowedStatuses.includes(status)
    ) {
        return res.status(400).json({
            error: "Invalid project status filter"
        });
    }

    if (
        sort !== undefined &&
        !["newest", "oldest"].includes(sort)
    ) {
        return res.status(400).json({
            error: "Invalid project sort"
        });
    }
    try {
        let result;
        const sortOrder =
    sort === "oldest" ? "ASC" : "DESC";

if (req.user.role === "admin") {
    const values = [];
let whereClause = "";

if (status) {
    values.push(status);
    whereClause = `WHERE status = $1`;
}

result = await pool.query(
    `SELECT projects.*, owner.username AS owner_username
     FROM projects
     JOIN users AS owner
     ON owner.id = projects.user_id
     ${whereClause}
     ORDER BY created_at ${sortOrder}`,
    values
);
} else {
    const values = [req.user.id];
    let statusClause = "";

    if (status) {
        values.push(status);
        statusClause = `AND projects.status = $2`;
    }

    result = await pool.query(
        `SELECT DISTINCT projects.*, owner.username AS owner_username
         FROM projects
         JOIN users AS owner
         ON owner.id = projects.user_id
         LEFT JOIN project_members
         ON projects.id = project_members.project_id
         WHERE (
             projects.user_id = $1
             OR project_members.user_id = $1
         )
         ${statusClause}
         ORDER BY projects.created_at ${sortOrder}`,
        values
    );
}

        res.json(result.rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to load projects"
        });
    }
});

router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
        const result = await pool.query(
    `SELECT DISTINCT projects.*, owner.username AS owner_username
     FROM projects
     JOIN users AS owner
     ON owner.id = projects.user_id
     LEFT JOIN project_members
     ON projects.id = project_members.project_id
     WHERE projects.id = $1
     AND (
        projects.user_id = $2
        OR project_members.user_id = $2
    )`,
    [id, req.user.id]
);

        const project = result.rows[0];

        if (!project) {
            return res.status(404).json({
                error: "Project not found"
            });
        }

        res.json(project);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to load project"
        });
    }
});

router.post("/", validateProject, async (req, res) => {
    const { name, description, status, due_date } = req.body;
    const userId = req.user.id;

    try {
        const result = await pool.query(
    `INSERT INTO projects (name, description, status, due_date, user_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, description, status, due_date || null, userId]
);

        const newProject = {
            ...result.rows[0],
            owner_username: req.user.username
        };
        await logActivity(
    newProject.id,
    req.user.id,
    `Created project "${newProject.name}"`
);

        projectEvents.emit(
            "projectCreated",
            newProject,
            [Number(userId)]
        );

        res.status(201).json({
            message: "Project created",
            project: newProject
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to create project"
        });
    }
});

router.patch("/:id", validateProject, async (req, res) => {
    const { id } = req.params;
    const { name, description, status, due_date } = req.body;

    try {
        const existingResult = await pool.query(
            `SELECT * FROM projects
             WHERE id = $1 AND user_id = $2`,
            [id, req.user.id]
        );

        if (existingResult.rows.length === 0) {
            return res.status(404).json({
                error: "Project not found"
            });
        }

        const existingProject = existingResult.rows[0];
        const result = await pool.query(
    `UPDATE projects
     SET name = $1,
         description = $2,
         status = $3,
         due_date = $4
     WHERE id = $5
     AND user_id = $6
     RETURNING *`,
    [name, description, status, due_date || null, id, req.user.id]
);

        const project = {
            ...result.rows[0],
            owner_username: req.user.username
        };

        const changes = [];

        if (existingProject.name !== project.name) {
            changes.push(`renamed "${existingProject.name}" to "${project.name}"`);
        }

        if (existingProject.status !== project.status) {
            changes.push(`changed status from ${existingProject.status} to ${project.status}`);
        }

        if ((existingProject.due_date || null) !== (project.due_date || null)) {
            changes.push(
                `changed due date from ${existingProject.due_date || "none"} to ${project.due_date || "none"}`
            );
        }

        if (
            existingProject.description !== project.description &&
            changes.length === 0
        ) {
            changes.push("changed the description");
        }

        await logActivity(
    project.id,
    req.user.id,
    changes.length > 0
        ? `Updated project "${project.name}": ${changes.join(", ")}`
        : `Updated project "${project.name}"`
);

        const recipientUserIds =
            await getProjectRecipientUserIds(project.id);

        projectEvents.emit(
            "projectUpdated",
            project,
            recipientUserIds
        );

        res.json({
            message: "Project updated",
            project
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to update project"
        });
    }
});

router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
        const recipientUserIds =
            await getProjectRecipientUserIds(id);

        const result = await pool.query(
            `DELETE FROM projects
             WHERE id = $1
             AND (
                 $2 = 'admin'
                 OR user_id = $3
             )
             RETURNING *`,
            [id, req.user.role, req.user.id]
        );

        const deletedProject = result.rows[0];

        if (!deletedProject) {
            return res.status(404).json({
                error: "Project not found"
            });
        }

        projectEvents.emit(
            "projectDeleted",
            deletedProject,
            recipientUserIds
        );

        res.json({
            message: "Project deleted",
            project: deletedProject
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to delete project"
        });
    }
});

module.exports = {
    router
};
