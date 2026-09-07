import {
    ListChecks,
    Users,
    History,
    Pencil,
    Trash2
} from "lucide-react";

function ProjectItem({
    project,
    currentUserId,
    currentUserRole,
    editingId,
    editName,
    setEditName,
    editDescription,
    setEditDescription,
    editStatus,
    setEditStatus,
    editDueDate,
    setEditDueDate,
    startEditing,
    handleEditProject,
    handleDeleteProject,
    cancelEditing,
    handleViewTasks,
    handleViewMembers,
    handleViewActivity
}) {
    const isEditing = editingId === project.id;
    const isOwner = Number(project.user_id) === Number(currentUserId);
    const isAdmin = currentUserRole === "admin";

    function getStatusClass(status) {
        if (status === "completed") {
            return "status-badge completed";
        }

        if (status === "in-progress") {
            return "status-badge in-progress";
        }

        return "status-badge planned";
    }

    function formatDueDate(date) {
        const [year, month, day] = date.split("-").map(Number);

        return new Date(year, month - 1, day).toLocaleDateString(
            undefined,
            {
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        );
    }

    function isOverdue() {
        if (!project.due_date || project.status === "completed") {
            return false;
        }

        const today = new Date();
        const localToday = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            String(today.getDate()).padStart(2, "0")
        ].join("-");

        return project.due_date < localToday;
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

                    <div className="field">
                        <label className="field-label" htmlFor={`edit-due-date-${project.id}`}>
                            Due date
                        </label>

                        <input
                            className="text-input"
                            id={`edit-due-date-${project.id}`}
                            type="date"
                            value={editDueDate}
                            onChange={(e) =>
                                setEditDueDate(e.target.value)
                            }
                        />
                    </div>

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

                    <span className={isOwner ? "ownership-tag owned" : "ownership-tag shared"}>
                        {isOwner ? "Owned by you" : "Shared project"}
                    </span>

                    <p className="card-desc">
                        {project.description}
                    </p>

                    <p className={isOverdue() ? "card-due overdue" : "card-due"}>
                        {project.due_date
                            ? `${isOverdue() ? "Overdue" : "Due"} ${formatDueDate(project.due_date)}`
                            : "No due date"}
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
                                handleViewActivity(project.id)
                            }
                        >
                            <History size={14} />
                            Activity
                        </button>

                        {isOwner && (
                            <button
                                className="icon-btn"
                                onClick={() =>
                                    startEditing(project)
                                }
                            >
                                <Pencil size={14} />
                                Edit
                            </button>
                        )}

                        {(isOwner || isAdmin) && (
                            <button
                                className="icon-btn danger"
                                onClick={() =>
                                    handleDeleteProject(project.id)
                                }
                            >
                                <Trash2 size={14} />
                                Delete
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default ProjectItem;
