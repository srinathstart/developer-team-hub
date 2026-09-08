import { useState } from "react";

function ProjectForm({ onCreate, onCancel }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("planned");
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
            const result = await onCreate({
                name,
                description,
                status,
                due_date: dueDate || null
            });

            if (!result.success) {
                setCreateError(result.error);
                return;
            }

            setName("");
            setDescription("");
            setStatus("planned");
            setDueDate("");
        } finally {
            setSubmitting(false);
        }
    }

    return (
    <form
        className="new-project-panel"
        id="new-project-form"
        aria-busy={submitting}
        onSubmit={handleSubmit}
    >
        <div className="row">
            <div className="field">
                <label className="field-label" htmlFor="project-name">
                    Project name
                </label>

                <input
                    className="text-input"
                    id="project-name"
                    type="text"
                    placeholder="e.g. Notification Service"
                    required
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className="field">
                <label className="field-label" htmlFor="project-status">
                    Status
                </label>

                <select
                    className="select-input"
                    id="project-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="planned">Planned</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            <div className="field">
                <label className="field-label" htmlFor="project-due-date">
                    Due date
                </label>

                <input
                    className="text-input"
                    id="project-due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                />
            </div>
        </div>

        <div className="field">
            <label className="field-label" htmlFor="project-description">
                Description
            </label>

            <textarea
                className="textarea-input"
                id="project-description"
                placeholder="What is this project about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
        </div>

        {createError && (
            <p className="project-create-error" role="alert">
                {createError}
            </p>
        )}

        <div className="panel-actions">
    <button
        className="btn-secondary"
        type="button"
        onClick={onCancel}
        disabled={submitting}
    >
        Cancel
    </button>

    <button
        className="btn-primary"
        type="submit"
        disabled={submitting}
    >
        {submitting ? "Creating..." : "Create project"}
    </button>
</div>
    </form>
);
}

export default ProjectForm;
