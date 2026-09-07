import {
    ListChecks,
    Users,
    Pencil,
    Trash2
} from "lucide-react";

function ProjectItem({
    project,
    editingId,
    editName,
    setEditName,
    editDescription,
    setEditDescription,
    editStatus,
    setEditStatus,
    startEditing,
    handleEditProject,
    handleDeleteProject,
    cancelEditing,
    handleViewTasks,
    handleViewMembers
}) {
    const isEditing = editingId === project.id;

    function getStatusClass(status) {
        if (status === "completed") {
            return "status-badge completed";
        }

        if (status === "in-progress") {
            return "status-badge in-progress";
        }

        return "status-badge planned";
    }

    return (
        <div className="project-card">
            {isEditing ? (
                <>
                    <input
                        className="text-input"
                        type="text"
                        value={editName}
                        onChange={(e) =>
                            setEditName(e.target.value)
                        }
                    />

                    <textarea
                        className="textarea-input"
                        value={editDescription}
                        onChange={(e) =>
                            setEditDescription(e.target.value)
                        }
                    />

                    <select
                        className="select-input"
                        value={editStatus}
                        onChange={(e) =>
                            setEditStatus(e.target.value)
                        }
                    >
                        <option value="planned">
                            Planned
                        </option>

                        <option value="in-progress">
                            In Progress
                        </option>

                        <option value="completed">
                            Completed
                        </option>
                    </select>

                    <div className="panel-actions">
                        <button
                            className="btn-secondary"
                            onClick={cancelEditing}
                        >
                            Cancel
                        </button>

                        <button
                            className="btn-primary"
                            onClick={() =>
                                handleEditProject(project.id)
                            }
                        >
                            Save changes
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div className="card-top">
                        <h3 className="card-title">
                            {project.name}
                        </h3>

                        <span className={getStatusClass(project.status)}>
                            {project.status}
                        </span>
                    </div>

                    <p className="card-desc">
                        {project.description}
                    </p>

                    <div className="card-actions">
                        <button
                            className="icon-btn"
                            onClick={() =>
                                handleViewTasks(project.id)
                            }
                        >
                            <ListChecks size={14} />
                            View Tasks
                        </button>

                        <button
                            className="icon-btn"
                            onClick={() =>
                                handleViewMembers(project.id)
                            }
                        >
                            <Users size={14} />
                            View Members
                        </button>

                        <button
                            className="icon-btn"
                            onClick={() =>
                                startEditing(project)
                            }
                        >
                            <Pencil size={14} />
                            Edit
                        </button>

                        <button
                            className="icon-btn danger"
                            onClick={() =>
                                handleDeleteProject(project.id)
                            }
                        >
                            <Trash2 size={14} />
                            Delete
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default ProjectItem;