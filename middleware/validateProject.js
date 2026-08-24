function validateProject(req, res, next) {
    const { name } = req.body;

    if (typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({
            error: "Project name is required"
        });
    }

    next();
}

module.exports = validateProject;