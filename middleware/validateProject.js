function validateProject(req, res, next) {
    const { name, description, status, due_date } = req.body;

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
    if (
    due_date !== undefined &&
    due_date !== null &&
    !/^\d{4}-\d{2}-\d{2}$/.test(due_date)
) {
    return res.status(400).json({
        error: "Invalid due date"
    });
}

    next();
}

module.exports = validateProject;