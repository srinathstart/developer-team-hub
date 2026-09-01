import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Projects() {
    const [projects, setProjects] = useState([]);
    const [name, setName] = useState("");

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

    function handleLogout() {
        localStorage.removeItem("token");
        navigate("/login");
    }

    async function handleCreateProject(e) {
        e.preventDefault();

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

        if (response.ok) {
            setProjects([...projects, data.project]);
            setName("");
        } else {
            console.log(data);
        }
    }

    function startEditing(project) {
        setEditingId(project.id);
        setEditName(project.name);
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
            setProjects(
                projects.map((project) =>
                    project.id === id
                        ? data.project
                        : project
                )
            );

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

        if (response.ok) {
            setProjects(
                projects.filter((project) => project.id !== id)
            );
        } else {
            console.log(data);
        }
    }

    return (
        <div>
            <h2>Projects</h2>

            <button onClick={handleLogout}>
                Logout
            </button>

            <form onSubmit={handleCreateProject}>
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

            {projects.map((project) => (
                <div key={project.id}>
                    {editingId === project.id ? (
                        <>
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) =>
                                    setEditName(e.target.value)
                                }
                            />

                            <button
                                onClick={() =>
                                    handleEditProject(project.id)
                                }
                            >
                                Save
                            </button>

                            <button
                                onClick={() => {
                                    setEditingId(null);
                                    setEditName("");
                                }}
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <span>{project.name}</span>

                            <button
                                onClick={() => startEditing(project)}
                            >
                                Edit
                            </button>

                            <button
                                onClick={() =>
                                    handleDeleteProject(project.id)
                                }
                            >
                                Delete
                            </button>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}

export default Projects;