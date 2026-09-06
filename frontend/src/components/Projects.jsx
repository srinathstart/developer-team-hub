import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProjectForm from "./ProjectForm";
import ProjectItem from "./ProjectItem";
import TaskList from "./TaskList";
import TaskForm from "./TaskForm";
import MemberList from "./MemberList";
import MemberForm from "./MemberForm";


function Projects() {
    const [projects, setProjects] = useState([]);

    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editStatus, setEditStatus] = useState("planned");
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editTaskTitle, setEditTaskTitle] = useState("");
    const [editTaskStatus, setEditTaskStatus] = useState("todo");
    const [selectedMembersProjectId, setSelectedMembersProjectId] = useState(null);
    const [members, setMembers] = useState([]);

    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function getProjects() {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }


            setError("");
            const response = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
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
            setLoading(false);
        }

        getProjects();
    }, [navigate]);

    useEffect(() => {
        const socket = new WebSocket(import.meta.env.VITE_WS_URL);

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

    async function handleCreateProject(projectData) {
    const token = localStorage.getItem("token");
    setError("");

    const response = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(projectData)
    });

    const data = await response.json();

    if (!response.ok) {
        setError(data.error || "Something went wrong");
    }
}

    function startEditing(project) {
        setEditingId(project.id);
        setEditName(project.name);
        setEditDescription(project.description || "");
        setEditStatus(project.status || "planned");
    }

    function startEditingTask(task) {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
    setEditTaskStatus(task.status);
}

function cancelEditingTask() {
    setEditingTaskId(null);
    setEditTaskTitle("");
    setEditTaskStatus("todo");
}

    function cancelEditing() {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
    setEditStatus("planned");
}

    async function handleEditProject(id) {
        const token = localStorage.getItem("token");
        setError("");

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/projects/${id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: editName,
                    description: editDescription,
                    status: editStatus
                })
            }
        );

        const data = await response.json();

        if (response.ok) {
            setEditingId(null);
            setEditName("");
        } else {
            setError(data.error || "Something went wrong");
        }
    }

    async function handleDeleteProject(id) {
        const token = localStorage.getItem("token");
        setError("");
        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/projects/${id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            setError(data.error || "Something went wrong");
        }
    }
    async function handleViewTasks(projectId) {
    const token = localStorage.getItem("token");
    setError("");

    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/projects/${projectId}/tasks`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (response.ok) {
        setSelectedProjectId(projectId);
        setTasks(data);
    } else {
        setError(data.error || "Failed to load tasks");
    }
}

async function handleCreateTask(taskData) {
    const token = localStorage.getItem("token");
    setError("");

    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/projects/${selectedProjectId}/tasks`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(taskData)
        }
    );

    const data = await response.json();

    if (response.ok) {
        setTasks((currentTasks) => [
            data.task,
            ...currentTasks
        ]);
    } else {
        setError(data.error || "Failed to create task");
    }
}

async function handleEditTask(id) {
    const token = localStorage.getItem("token");
    setError("");

    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/tasks/${id}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                title: editTaskTitle,
                status: editTaskStatus
            })
        }
    );

    const data = await response.json();

    if (response.ok) {
        setTasks((currentTasks) =>
            currentTasks.map((task) =>
                task.id === data.task.id
                    ? data.task
                    : task
            )
        );

        cancelEditingTask();
    } else {
        setError(data.error || "Failed to update task");
    }
}

async function handleDeleteTask(id) {
    const token = localStorage.getItem("token");
    setError("");

    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/tasks/${id}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (response.ok) {
        setTasks((currentTasks) =>
            currentTasks.filter((task) => task.id !== id)
        );
    } else {
        setError(data.error || "Failed to delete task");
    }
}

async function handleViewMembers(projectId) {
    const token = localStorage.getItem("token");
    setError("");

    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/projects/${projectId}/members`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (response.ok) {
        setSelectedMembersProjectId(projectId);
        setMembers(data);
    } else {
        setError(data.error || "Failed to load members");
    }
}

async function handleAddMember(userId) {
    const token = localStorage.getItem("token");
    setError("");

    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/projects/${selectedMembersProjectId}/members`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                userId: Number(userId)
            })
        }
    );

    const data = await response.json();

    if (response.ok) {
        await handleViewMembers(selectedMembersProjectId);
    } else {
        setError(data.error || "Failed to add member");
    }
}

async function handleRemoveMember(userId) {
    const token = localStorage.getItem("token");
    setError("");

    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/projects/${selectedMembersProjectId}/members/${userId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (response.ok) {
        await handleViewMembers(selectedMembersProjectId);
    } else {
        setError(data.error || "Failed to remove member");
    }
}

    if (loading) {
    return <p>Loading...</p>;
}

    return (
    <div className="projects-page">
        <div className="projects-card">
            <div className="projects-header">
                <h1>Developer Team Hub</h1>

                <button onClick={handleLogout}>
                    Logout
                </button>
            </div>
           
            
            <h2>Projects</h2>
            {error && <p>{error}</p>}

            <ProjectForm onCreate={handleCreateProject} />

            {projects.map((project) => (
    <div key={project.id}>
        <ProjectItem
            project={project}
            editingId={editingId}
            editName={editName}
            setEditName={setEditName}
            editDescription={editDescription}
            setEditDescription={setEditDescription}
            editStatus={editStatus}
            setEditStatus={setEditStatus}
            startEditing={startEditing}
            handleEditProject={handleEditProject}
            handleDeleteProject={handleDeleteProject}
            cancelEditing={cancelEditing}
            handleViewTasks={handleViewTasks}
            handleViewMembers={handleViewMembers}
        />

        {selectedProjectId === project.id && (
    <>
        <TaskForm onCreateTask={handleCreateTask} />
        <TaskList
    tasks={tasks}
    editingTaskId={editingTaskId}
    editTaskTitle={editTaskTitle}
    setEditTaskTitle={setEditTaskTitle}
    editTaskStatus={editTaskStatus}
    setEditTaskStatus={setEditTaskStatus}
    startEditingTask={startEditingTask}
    handleEditTask={handleEditTask}
    cancelEditingTask={cancelEditingTask}
    handleDeleteTask={handleDeleteTask}
/>
    </>
)}
{selectedMembersProjectId === project.id && (
    <>
        <MemberForm onAddMember={handleAddMember} />
        <MemberList
    members={members}
    handleRemoveMember={handleRemoveMember}
/>
    </>
)}
    </div>
            ))}
        </div>
    </div>
);

}

export default Projects;