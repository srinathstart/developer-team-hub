import { useEffect, useState } from "react";

function Projects() {
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        async function getProjects() {
            const token = localStorage.getItem("token");

            const response = await fetch("http://localhost:3000/projects", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
    setProjects(data);
} else {
    console.log("Error:", data);
}
        }

        getProjects();
    }, []);

    return (
        <div>
            <h2>Projects</h2>

            {projects.map((project) => (
                <p key={project.id}>
                    {project.name}
                </p>
            ))}
        </div>
    );
}

export default Projects;