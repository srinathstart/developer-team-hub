import { useState } from "react";

function ProjectForm({ onCreate, onCancel }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("planned");

    async function handleSubmit(e) {
        e.preventDefault();

        await onCreate({
            name,
            description,
            status
        });

        setName("");
        setDescription("");
        setStatus("planned");
    }

    return (
    <form className="new-project-panel" onSubmit={handleSubmit}>
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

        <div className="panel-actions">
    <button
        className="btn-secondary"
        type="button"
        onClick={onCancel}
    >
        Cancel
    </button>

    <button
        className="btn-primary"
        type="submit"
    >
        Create project
    </button>
</div>
    </form>
);
}

export default ProjectForm;