import { useState } from "react";

function ProjectForm({ onCreate }) {
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
        <form onSubmit={handleSubmit}>
            <label htmlFor="project-name">
                Project name
            </label>

            <input
                id="project-name"
                type="text"
                placeholder="Project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <label htmlFor="project-description">
                Description
            </label>

            <textarea
                id="project-description"
                placeholder="Project description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <label htmlFor="project-status">
                Status
            </label>

            <select
                id="project-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
            >
                <option value="planned">Planned</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
            </select>

            <button type="submit">
                Create Project
            </button>
        </form>
    );
}

export default ProjectForm;