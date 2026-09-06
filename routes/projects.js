const express = require("express");
const adminOnly = require("../middleware/adminOnly");
const pool = require("../db");


const router = express.Router();
        
const projectEvents = require("../events/projectEvents");
const auth = require("../middleware/auth");
router.use(auth);

const validateProject = require("../middleware/validateProject");

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM projects ORDER BY id"
        );

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
            "SELECT * FROM projects WHERE id = $1",
            [id]
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
    const { name } = req.body;
    const userId = req.user.id;

    try {
        const result = await pool.query(
            `INSERT INTO projects (name, user_id)
             VALUES ($1, $2)
             RETURNING *`,
            [name, userId]
        );

        const newProject = result.rows[0];

        projectEvents.emit("projectCreated", newProject);

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
    const id = Number(req.params.id);
    const { name } = req.body;

    try {
        const result = await pool.query(
            `UPDATE projects
             SET name = $1
             WHERE id = $2
             RETURNING *`,
            [name, id]
        );

        const project = result.rows[0];

        if (!project) {
            return res.status(404).json({
                error: "Project not found"
            });
        }

        projectEvents.emit("projectUpdated", project);

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

router.delete("/:id", adminOnly, async (req, res) => {
    const id = Number(req.params.id);

    try {
        const result = await pool.query(
            `DELETE FROM projects
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        const deletedProject = result.rows[0];

        if (!deletedProject) {
            return res.status(404).json({
                error: "Project not found"
            });
        }

        projectEvents.emit("projectDeleted", deletedProject);

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