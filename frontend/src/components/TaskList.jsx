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
    return (
        <div>
            <h4>Tasks</h4>

            {tasks.map((task) => {
                const isEditing = editingTaskId === task.id;

                return (
                    <div key={task.id}>
                        {isEditing ? (
                            <>
                                <input
                                    type="text"
                                    value={editTaskTitle}
                                    onChange={(e) =>
                                        setEditTaskTitle(e.target.value)
                                    }
                                />

                                <select
                                    value={editTaskStatus}
                                    onChange={(e) =>
                                        setEditTaskStatus(e.target.value)
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

                                <button
                                    onClick={() =>
                                        handleEditTask(task.id)
                                    }
                                >
                                    Save
                                </button>
                                <button onClick={() => handleDeleteTask(task.id)}>
    Delete
</button>

                                <button onClick={cancelEditingTask}>
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <p>
                                    {task.title} - {task.status}
                                </p>

                                <button
                                    onClick={() =>
                                        startEditingTask(task)
                                    }
                                >
                                    Edit
                                </button>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default TaskList;