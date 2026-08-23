const express = require("express");

const router = express.Router();

const projects = [];
let nextProjectId = 1;

router.get("/", (req, res) => {
    res.json(projects);
});

router.get("/:id", (req, res) => {
    const id = Number(req.params.id);

    const project = projects.find(
        (project) => project.id === id
    );

    if (!project) {
        return res.status(404).json({
            error: "Project not found"
        });
    }

    res.json(project);
});

router.post("/", (req, res) => {
    const project = req.body;

    if (!project.name || project.name.trim() === "") {
        return res.status(400).json({
            error: "Project name is required"
        });
    }

    const newProject = {
        id: nextProjectId,
        name: project.name
    };

    nextProjectId++;
    projects.push(newProject);

    res.status(201).json({
        message: "Project created",
        project: newProject
    });
});

router.patch("/:id", (req, res) => {
    const id = Number(req.params.id);

    const project = projects.find(
        (project) => project.id === id
    );

    if (!project) {
        return res.status(404).json({
            error: "Project not found"
        });
    }

    const { name } = req.body;

    if (!name || name.trim() === "") {
        return res.status(400).json({
            error: "Project name is required"
        });
    }

    project.name = name;

    res.json({
        message: "Project updated",
        project
    });
});

router.delete("/:id", (req, res) => {
    const id = Number(req.params.id);

    const projectIndex = projects.findIndex(
        (project) => project.id === id
    );

    if (projectIndex === -1) {
        return res.status(404).json({
            error: "Project not found"
        });
    }

    const deletedProject = projects.splice(projectIndex, 1)[0];

    res.json({
        message: "Project deleted",
        project: deletedProject
    });
});

module.exports = router;