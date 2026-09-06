import { useState } from "react";

function TaskForm({ onCreateTask }) {
    const [title, setTitle] = useState("");
    const [status, setStatus] = useState("todo");

    async function handleSubmit(e) {
        e.preventDefault();

        await onCreateTask({
            title,
            status
        });

        setTitle("");
        setStatus("todo");
    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="task-title">
                Task title
            </label>

            <input
                id="task-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
            />

            <label htmlFor="task-status">
                Status
            </label>

            <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
            >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
            </select>

            <button type="submit">
                Add Task
            </button>
        </form>
    );
}

export default TaskForm;