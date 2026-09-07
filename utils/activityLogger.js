const pool = require("../db");

async function logActivity(
    projectId,
    userId,
    action,
    queryable = pool
) {
    await queryable.query(
        `INSERT INTO activity_logs
         (project_id, user_id, action)
         VALUES ($1, $2, $3)`,
        [projectId, userId, action]
    );
}

module.exports = logActivity;
