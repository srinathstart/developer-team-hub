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
    members,
    startEditingTask,
    handleEditTask,
    cancelEditingTask,
    handleDeleteTask,
    canEdit
}) {
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

            <div className="task-list">
                {tasks.map((task) => {
                    const isEditing =
                        editingTaskId === task.id;

                    return (
                        <div
                            className={`task-row${isEditing ? " editing" : ""}`}
                            key={task.id}
                        >
                            {isEditing ? (
                                <>
                                    <input
                                        className="text-input"
                                        type="text"
                                        value={editTaskTitle}
                                        onChange={(e) =>
                                            setEditTaskTitle(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <select
                                        className="select-input"
                                        value={editTaskStatus}
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
                                        onChange={(e) =>
                                            setEditTaskDueDate(e.target.value)
                                        }
                                    />

                                    <select
                                        className="select-input"
                                        aria-label="Task assignee"
                                        value={editTaskAssignee}
                                        onChange={(e) =>
                                            setEditTaskAssignee(e.target.value)
                                        }
                                    >
                                        <option value="">Unassigned</option>
                                        {members.map((member) => (
                                            <option key={member.id} value={member.username}>
                                                {member.username}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        className="select-input"
                                        aria-label="Task priority"
                                        value={editTaskPriority}
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

                                    {canEdit && (
                                    <div className="task-row-actions">
                                        <button
                                            className="mini-btn"
                                            type="button"
                                            onClick={() =>
                                                handleEditTask(
                                                    task.id
                                                )
                                            }
                                            title="Save"
                                        >
                                            <Check size={13} />
                                        </button>

                                        <button
                                            className="mini-btn"
                                            type="button"
                                            onClick={cancelEditingTask}
                                            title="Cancel"
                                        >
                                            <X size={13} />
                                        </button>

                                        <button
                                            className="mini-btn danger"
                                            type="button"
                                            onClick={() =>
                                                handleDeleteTask(
                                                    task.id
                                                )
                                            }
                                            title="Delete"
                                        >
                                            <Trash2 size={13} />
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
                                            onClick={() =>
                                                startEditingTask(
                                                    task
                                                )
                                            }
                                            title="Edit"
                                        >
                                            <Pencil size={13} />
                                        </button>

                                        <button
                                            className="mini-btn danger"
                                            type="button"
                                            onClick={() =>
                                                handleDeleteTask(
                                                    task.id
                                                )
                                            }
                                            title="Delete"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default TaskList;
