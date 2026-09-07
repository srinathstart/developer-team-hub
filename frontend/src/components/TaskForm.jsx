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
    <form className="inline-form" onSubmit={handleSubmit}>
        <input
            className="text-input"
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New task title"
        />

        <select
            className="select-input"
            id="task-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
        >
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
        </select>

        <button className="btn-primary" type="submit">
            Add Task
        </button>
    </form>
);
}

export default TaskForm;