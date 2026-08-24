const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const router = express.Router();

const dataFile = path.join(__dirname, "../data/projects.json");

let projects = [];
let nextProjectId = 1;

async function loadProjects() {
    const fileData = await fs.readFile(dataFile, "utf-8");

    projects = JSON.parse(fileData);

    nextProjectId =
        projects.length > 0
            ? Math.max(...projects.map((project) => project.id)) + 1
            : 1;
}


const validateProject = require("../middleware/validateProject");


async function saveProjects() {
    await fs.writeFile(
        dataFile,
        JSON.stringify(projects, null, 2)
    );
}



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

router.post("/", validateProject, async (req, res) => {
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
    await saveProjects();

    res.status(201).json({
        message: "Project created",
        project: newProject
    });
});

router.patch("/:id", validateProject, async (req, res) => {
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
    await saveProjects();

    res.json({
        message: "Project updated",
        project
    });
});

router.delete("/:id", async (req, res) => {
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
    await saveProjects();

    res.json({
        message: "Project deleted",
        project: deletedProject
    });
});

module.exports = {
    router,
    loadProjects
};