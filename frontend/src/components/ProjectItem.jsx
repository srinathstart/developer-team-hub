import { useEffect, useRef } from "react";
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
    isSaving,
    editError,
    isDeleting,
    deleteError,
    startEditing,
    handleEditProject,
    handleDeleteProject,
    cancelEditing,
    handleViewTasks,
    tasksOpen,
    isLoadingTasks,
    isTasksRequestActive,
    taskLoadError,
    handleViewMembers,
    membersOpen,
    isLoadingMembers,
    isMembersRequestActive,
    memberLoadError,
    handleViewActivity,
    activityOpen
}) {
    const isEditing = editingId === project.id;
    const editButtonRef = useRef(null);
    const wasEditing = useRef(false);
    const isOwner = Number(project.user_id) === Number(currentUserId);
    const isAdmin = currentUserRole === "admin";

    useEffect(() => {
        if (wasEditing.current && !isEditing) {
            editButtonRef.current?.focus();
        }

        wasEditing.current = isEditing;
    }, [isEditing]);

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
        <article
            className="project-card"
            aria-label={isEditing ? `Editing ${project.name}` : undefined}
            aria-labelledby={!isEditing ? `project-title-${project.id}` : undefined}
        >
            {isEditing ? (
                <>
                    <input
                        className="text-input"
                        type="text"
                        aria-label="Project name"
                        autoFocus
                        value={editName}
                        disabled={isSaving}
                        onChange={(e) =>
                            setEditName(e.target.value)
                        }
                    />

                    <textarea
                        className="textarea-input"
                        aria-label="Project description"
                        value={editDescription}
                        disabled={isSaving}
                        onChange={(e) =>
                            setEditDescription(e.target.value)
                        }
                    />

                    <select
                        className="select-input"
                        aria-label="Project status"
                        value={editStatus}
                        disabled={isSaving}
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
                            disabled={isSaving}
                            onChange={(e) =>
                                setEditDueDate(e.target.value)
                            }
                        />
                    </div>

                    {editError && (
                        <p className="project-edit-error" role="alert">
                            {editError}
                        </p>
                    )}

                    <div className="panel-actions">
                        <button
                            className="btn-secondary"
                            type="button"
                            onClick={cancelEditing}
                            disabled={isSaving}
                        >
                            Cancel
                        </button>

                        <button
                            className="btn-primary"
                            type="button"
                            disabled={isSaving}
                            onClick={() =>
                                handleEditProject(project.id)
                            }
                        >
                            {isSaving ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div className="card-top">
                        <h3 className="card-title" id={`project-title-${project.id}`}>
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

                    {deleteError && (
                        <p className="project-delete-error" role="alert">
                            {deleteError}
                        </p>
                    )}

                    <div className="card-actions">
                        <button
                            className="icon-btn"
                            type="button"
                            disabled={isTasksRequestActive}
                            aria-expanded={tasksOpen}
                            onClick={() =>
                                handleViewTasks(project.id)
                            }
                        >
                            <ListChecks size={14} />
                            {isLoadingTasks ? "Loading..." : "View Tasks"}
                        </button>

                        <button
                            className="icon-btn"
                            type="button"
                            disabled={isMembersRequestActive}
                            aria-expanded={membersOpen}
                            onClick={() =>
                                handleViewMembers(project.id)
                            }
                        >
                            <Users size={14} />
                            {isLoadingMembers ? "Loading..." : "View Members"}
                        </button>

                        <button
                            className="icon-btn"
                            type="button"
                            aria-expanded={activityOpen}
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
                                type="button"
                                ref={editButtonRef}
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
                                type="button"
                                disabled={isDeleting}
                                onClick={() =>
                                    handleDeleteProject(project.id)
                                }
                            >
                                <Trash2 size={14} />
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        )}
                    </div>

                    {taskLoadError && (
                        <p className="project-task-load-error" role="alert">
                            {taskLoadError}
                        </p>
                    )}

                    {memberLoadError && (
                        <p className="project-member-load-error" role="alert">
                            {memberLoadError}
                        </p>
                    )}
                </>
            )}
        </article>
    );
}

export default ProjectItem;
