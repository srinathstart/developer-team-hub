import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProjectForm from "./ProjectForm";
import ProjectItem from "./ProjectItem";

function Projects() {
    const [projects, setProjects] = useState([]);

    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        async function getProjects() {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await fetch("http://localhost:3000/projects", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setProjects(data);
            } else {
                localStorage.removeItem("token");
                navigate("/login");
            }
        }

        getProjects();
    }, [navigate]);

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:3000");

        socket.onopen = () => {
            console.log("WebSocket connected");
        };

        socket.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type === "projectCreated") {
        setProjects((currentProjects) => [
            ...currentProjects,
            message.project
        ]);
    }

    if (message.type === "projectUpdated") {
        setProjects((currentProjects) =>
            currentProjects.map((project) =>
                project.id === message.project.id
                    ? message.project
                    : project
            )
        );
    }

    if (message.type === "projectDeleted") {
        setProjects((currentProjects) =>
            currentProjects.filter(
                (project) => project.id !== message.project.id
            )
        );
    }
};

        socket.onclose = () => {
            console.log("WebSocket disconnected");
        };

        return () => {
            socket.close();
        };
    }, []);

    function handleLogout() {
        localStorage.removeItem("token");
        navigate("/login");
    }

    async function handleCreateProject(name) {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:3000/projects", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            name
        })
    });

    const data = await response.json();

    if (!response.ok) {
        console.log(data);
    }
}

    function startEditing(project) {
        setEditingId(project.id);
        setEditName(project.name);
    }
    function cancelEditing() {
    setEditingId(null);
    setEditName("");
}

    async function handleEditProject(id) {
        const token = localStorage.getItem("token");

        const response = await fetch(
            `http://localhost:3000/projects/${id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: editName
                })
            }
        );

        const data = await response.json();

        if (response.ok) {
            setEditingId(null);
            setEditName("");
        } else {
            console.log(data);
        }
    }

    async function handleDeleteProject(id) {
        const token = localStorage.getItem("token");

        const response = await fetch(
            `http://localhost:3000/projects/${id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.log(data);
        }
    }

    return (
        <div>
            <h2>Projects</h2>

            <button onClick={handleLogout}>
                Logout
            </button>

            <ProjectForm onCreate={handleCreateProject} />

            {projects.map((project) => (
    <ProjectItem
        key={project.id}
        project={project}
        editingId={editingId}
        editName={editName}
        setEditName={setEditName}
        startEditing={startEditing}
        handleEditProject={handleEditProject}
        handleDeleteProject={handleDeleteProject}
        cancelEditing={cancelEditing}
    />
))}
        </div>
    );
}

export default Projects;