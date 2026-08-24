const projectEvents = require("./projectEvents");
const logActivity = require("../utils/activityLogger");

projectEvents.on("projectCreated", async (project) => {
    await logActivity(
        `PROJECT_CREATED id=${project.id} name="${project.name}"`
    );
});

projectEvents.on("projectUpdated", async (project) => {
    await logActivity(
        `PROJECT_UPDATED id=${project.id} name="${project.name}"`
    );
});

projectEvents.on("projectDeleted", async (project) => {
    await logActivity(
        `PROJECT_DELETED id=${project.id} name="${project.name}"`
    );
});



