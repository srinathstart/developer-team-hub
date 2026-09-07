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
    startEditingTask,
    handleEditTask,
    cancelEditingTask,
    handleDeleteTask
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
                            className="task-row"
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

                                    <div className="task-row-actions">
                                        <button
                                            className="mini-btn"
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
                                            onClick={cancelEditingTask}
                                            title="Cancel"
                                        >
                                            <X size={13} />
                                        </button>

                                        <button
                                            className="mini-btn danger"
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
                                    </div>

                                    <div className="task-row-actions">
                                        <button
                                            className="mini-btn"
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