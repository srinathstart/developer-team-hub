function validateProject(req, res, next) {
    const { name, description, status } = req.body;

    if (typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({
            error: "Project name is required"
        });
    }

    if (
        description !== undefined &&
        typeof description !== "string"
    ) {
        return res.status(400).json({
            error: "Description must be a string"
        });
    }

    const allowedStatuses = [
        "planned",
        "in-progress",
        "completed"
    ];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            error: "Invalid project status"
        });
    }

    next();
}

module.exports = validateProject;