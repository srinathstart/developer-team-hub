import { useEffect, useRef } from "react";
import {
    Pencil,
    Trash2,
    Check,
    X
} from "lucide-react";

function TaskList({
    tasks,
    editingTaskId,
    editTaskTitle,
    setEditTaskTitle,
    editTaskStatus,
    setEditTaskStatus,
    editTaskPriority,
    setEditTaskPriority,
    editTaskAssignee,
    setEditTaskAssignee,
    editTaskDueDate,
    setEditTaskDueDate,
    savingTaskId,
    editError,
    deletingTaskId,
    deleteError,
    members,
    startEditingTask,
    handleEditTask,
    cancelEditingTask,
    handleDeleteTask,
    canEdit
}) {
    const editButtonRefs = useRef(new Map());
    const previousEditingTaskId = useRef(null);

    useEffect(() => {
        if (previousEditingTaskId.current !== null && editingTaskId === null) {
            editButtonRefs.current.get(previousEditingTaskId.current)?.focus();
        }

        previousEditingTaskId.current = editingTaskId;
    }, [editingTaskId]);

    function getTaskStatusClass(status) {
        if (status === "done") {
            return "task-status done";
        }

        if (status === "in-progress") {
            return "task-status in-progress";
        }

        return "task-status todo";
    }

    function getTaskPriorityClass(priority) {
        if (priority === "high") {
            return "task-priority high";
        }

        if (priority === "low") {
            return "task-priority low";
        }

        return "task-priority medium";
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

    function isTaskOverdue(task) {
        if (!task.due_date || task.status === "done") {
            return false;
        }

        const today = new Date();
        const localToday = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            String(today.getDate()).padStart(2, "0")
        ].join("-");

        return task.due_date < localToday;
    }

    return (
        <div className="task-section">
            <h4 className="panel-heading">
                Tasks
            </h4>

            {tasks.length === 0 && (
                <p className="no-items">
                    No tasks yet
                </p>
            )}

            <div className="task-list" role="list">
                {tasks.map((task) => {
                    const isEditing =
                        editingTaskId === task.id;
                    const isSaving =
                        savingTaskId === task.id;
                    const isDeleting =
                        deletingTaskId === task.id;
                    const taskDeleteMessage =
                        deleteError?.taskId === task.id
                            ? deleteError.message
                            : "";

                    return (
                        <div
                            className={`task-row${isEditing ? " editing" : ""}${taskDeleteMessage ? " has-error" : ""}`}
                            key={task.id}
                            role="listitem"
                        >
                            {isEditing ? (
                                <>
                                    <input
                                        className="text-input"
                                        type="text"
                                        aria-label="Task title"
                                        autoFocus
                                        value={editTaskTitle}
                                        disabled={isSaving}
                                        onChange={(e) =>
                                            setEditTaskTitle(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <select
                                        className="select-input"
                                        aria-label="Task status"
                                        value={editTaskStatus}
                                        disabled={isSaving}
                                        onChange={(e) =>
                                            setEditTaskStatus(
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="todo">
                                            Todo
                                        </option>

                                        <option value="in-progress">
                                            In Progress
                                        </option>

                                        <option value="done">
                                            Done
                                        </option>
                                    </select>

                                    <input
                                        className="text-input task-date-input"
                                        type="date"
                                        aria-label="Task due date"
                                        value={editTaskDueDate}
                                        disabled={isSaving}
                                        onChange={(e) =>
                                            setEditTaskDueDate(e.target.value)
                                        }
                                    />

                                    <select
                                        className="select-input"
                                        aria-label="Task assignee"
                                        value={editTaskAssignee}
                                        disabled={isSaving}
                                        onChange={(e) =>
                                            setEditTaskAssignee(e.target.value)
                                        }
                                    >
                                        <option value="">Unassigned</option>
                                        {members.map((member) => (
                                            <option key={member.id} value={member.username}>
                                                {member.username}{member.role === "owner" ? " (Owner)" : ""}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        className="select-input"
                                        aria-label="Task priority"
                                        value={editTaskPriority}
                                        disabled={isSaving}
                                        onChange={(e) =>
                                            setEditTaskPriority(
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>

                                    {editError && (
                                        <p className="task-edit-error" role="alert">
                                            {editError}
                                        </p>
                                    )}

                                    {canEdit && (
                                    <div className="task-row-actions">
                                        <button
                                            className="mini-btn"
                                            type="button"
                                            disabled={isSaving || isDeleting}
                                            onClick={() =>
                                                handleEditTask(
                                                    task.id
                                                )
                                            }
                                            title={isSaving ? "Saving" : "Save"}
                                            aria-label={
                                                isSaving
                                                    ? `Saving ${task.title}`
                                                    : `Save changes to ${task.title}`
                                            }
                                        >
                                            {isSaving ? "Saving..." : <Check size={13} />}
                                        </button>

                                        <button
                                            className="mini-btn"
                                            type="button"
                                            disabled={isSaving}
                                            onClick={cancelEditingTask}
                                            title="Cancel"
                                            aria-label={`Cancel editing ${task.title}`}
                                        >
                                            <X size={13} />
                                        </button>

                                        <button
                                            className="mini-btn danger"
                                            type="button"
                                            disabled={isSaving}
                                            onClick={() =>
                                                handleDeleteTask(
                                                    task.id
                                                )
                                            }
                                            title={isDeleting ? "Deleting" : "Delete"}
                                            aria-label={
                                                isDeleting
                                                    ? `Deleting ${task.title}`
                                                    : `Delete ${task.title}`
                                            }
                                        >
                                            {isDeleting ? "Deleting..." : <Trash2 size={13} />}
                                        </button>
                                    </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="task-row-left">
                                        <span className="task-title">
                                            {task.title}
                                        </span>

                                        <span
                                            className={getTaskStatusClass(
                                                task.status
                                            )}
                                        >
                                            {task.status}
                                        </span>

                                        <span
                                            className={getTaskPriorityClass(
                                                task.priority
                                            )}
                                        >
                                            {task.priority || "medium"}
                                        </span>

                                        <span className="task-assignee">
                                            {task.assignee_username
                                                ? `Assigned to ${task.assignee_username}`
                                                : "Unassigned"}
                                        </span>

                                        <span className={isTaskOverdue(task) ? "task-due overdue" : "task-due"}>
                                            {task.due_date
                                                ? `${isTaskOverdue(task) ? "Overdue" : "Due"} ${formatDueDate(task.due_date)}`
                                                : "No due date"}
                                        </span>
                                    </div>

                                    {canEdit && (
                                    <div className="task-row-actions">
                                        <button
                                            className="mini-btn"
                                            type="button"
                                            ref={(button) => {
                                                if (button) {
                                                    editButtonRefs.current.set(task.id, button);
                                                }
                                            }}
                                            onClick={() =>
                                                startEditingTask(
                                                    task
                                                )
                                            }
                                            title="Edit"
                                            aria-label={`Edit ${task.title}`}
                                        >
                                            <Pencil size={13} />
                                        </button>

                                        <button
                                            className="mini-btn danger"
                                            type="button"
                                            disabled={isDeleting}
                                            onClick={() =>
                                                handleDeleteTask(
                                                    task.id
                                                )
                                            }
                                            title={isDeleting ? "Deleting" : "Delete"}
                                            aria-label={
                                                isDeleting
                                                    ? `Deleting ${task.title}`
                                                    : `Delete ${task.title}`
                                            }
                                        >
                                            {isDeleting ? "Deleting..." : <Trash2 size={13} />}
                                        </button>
                                    </div>
                                    )}
                                </>
                            )}

                            {taskDeleteMessage && (
                                <p className="task-delete-error" role="alert">
                                    {taskDeleteMessage}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default TaskList;
