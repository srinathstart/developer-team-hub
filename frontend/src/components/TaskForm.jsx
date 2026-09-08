import { useState } from "react";

function TaskForm({ onCreateTask, members }) {
    const [title, setTitle] = useState("");
    const [status, setStatus] = useState("todo");
    const [priority, setPriority] = useState("medium");
    const [assigneeUsername, setAssigneeUsername] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [createError, setCreateError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        if (submitting) {
            return;
        }

        setCreateError("");
        setSubmitting(true);

        try {
            const result = await onCreateTask({
                title,
                status,
                priority,
                assigneeUsername: assigneeUsername || null,
                due_date: dueDate || null
            });

            if (!result.success) {
                setCreateError(result.error);
                return;
            }

            setTitle("");
            setStatus("todo");
            setPriority("medium");
            setAssigneeUsername("");
            setDueDate("");
        } finally {
            setSubmitting(false);
        }
    }

    return (
    <form className="inline-form" aria-busy={submitting} onSubmit={handleSubmit}>
        <input
            className="text-input"
            id="task-title"
            type="text"
            aria-label="Task title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New task title"
        />

        <select
            className="select-input"
            id="task-status"
            aria-label="Task status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
        >
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
        </select>

        <select
            className="select-input"
            id="task-priority"
            aria-label="Task priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
        >
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
        </select>

        <select
            className="select-input"
            aria-label="Task assignee"
            value={assigneeUsername}
            onChange={(e) => setAssigneeUsername(e.target.value)}
        >
            <option value="">Unassigned</option>
            {members.map((member) => (
                <option key={member.id} value={member.username}>
                    {member.username}
                </option>
            ))}
        </select>

        <input
            className="text-input task-date-input"
            type="date"
            aria-label="Task due date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
        />

        <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "Add Task"}
        </button>

        {createError && (
            <p className="inline-form-error" role="alert">
                {createError}
            </p>
        )}
    </form>
);
}

export default TaskForm;
