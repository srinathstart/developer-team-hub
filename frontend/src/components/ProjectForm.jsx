import { useState } from "react";

function ProjectForm({ onCreate }) {
    const [name, setName] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        await onCreate(name);

        setName("");
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <button type="submit">
                Create Project
            </button>
        </form>
    );
}

export default ProjectForm;