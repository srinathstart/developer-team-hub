import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiFetch from "../api";
import ProjectForm from "./ProjectForm";
import ProjectItem from "./ProjectItem";
import TaskList from "./TaskList";
import TaskForm from "./TaskForm";
import TaskFilters from "./TaskFilters";
import MemberList from "./MemberList";
import MemberForm from "./MemberForm";
import ActivityList from "./ActivityList";
import DashboardStats from "./DashboardStats";
import {
    Search,
    LogOut,
    Plus,
    ChevronDown
} from "lucide-react";

function Projects() {
    const [projects, setProjects] = useState([]);

    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editStatus, setEditStatus] = useState("planned");
    const [editDueDate, setEditDueDate] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [taskAssignees, setTaskAssignees] = useState([]);
    const [taskPriorityFilter, setTaskPriorityFilter] = useState("all");
    const [taskStatusFilter, setTaskStatusFilter] = useState("all");
    const [projectTaskRoles, setProjectTaskRoles] = useState({});
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editTaskTitle, setEditTaskTitle] = useState("");
    const [editTaskStatus, setEditTaskStatus] = useState("todo");
    const [editTaskPriority, setEditTaskPriority] = useState("medium");
    const [editTaskAssignee, setEditTaskAssignee] = useState("");
    const [editTaskDueDate, setEditTaskDueDate] = useState("");
    const [selectedMembersProjectId, setSelectedMembersProjectId] = useState(null);
    const [members, setMembers] = useState([]);
    const [selectedActivityProjectId, setSelectedActivityProjectId] = useState(null);
    const [activities, setActivities] = useState([]);
    const [activityLoading, setActivityLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("newest");
    const [showNewProject, setShowNewProject] = useState(false);
    const [statsRefreshKey, setStatsRefreshKey] = useState(0);

    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        async function loadCurrentUser() {
            try {
                const response = await apiFetch(
                    `${import.meta.env.VITE_API_URL}/auth/me`
                );

                if (!response.ok) {
                    navigate("/login");
                    return;
                }

                const data = await response.json();
                setCurrentUser(data.user);
            } catch {
                navigate("/login");
            }
        }

        loadCurrentUser();
    }, [navigate]);

    useEffect(() => {
        async function getProjects() {
            const params = new URLSearchParams({ sort: sortOrder });

            if (statusFilter !== "all") {
                params.set("status", statusFilter);
            }

            setError("");
            setLoading(true);

            try {
                const response = await apiFetch(
                    `${import.meta.env.VITE_API_URL}/projects?${params.toString()}`
                );

                const data = await response.json();

                if (response.ok) {
                    setProjects(data);
                } else if (response.status === 401) {
                    navigate("/login");
                } else {
                    setError(data.error || "Failed to load projects");
                }
            } catch {
                setError("Failed to load projects");
            } finally {
                setLoading(false);
            }
        }

        getProjects();
    }, [navigate, sortOrder, statusFilter]);

    useEffect(() => {
        if (!currentUser) {
            return undefined;
        }

        const socket = new WebSocket(import.meta.env.VITE_WS_URL);

        socket.onopen = () => {
            console.log("WebSocket connected");
        };

        socket.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type === "projectCreated") {
        setStatsRefreshKey((current) => current + 1);
        const isVisibleToUser =
            currentUser?.role === "admin" ||
            Number(message.project.user_id) === Number(currentUser?.id);
        const matchesStatus =
            statusFilter === "all" ||
            message.project.status === statusFilter;

        if (isVisibleToUser && matchesStatus) {
            setProjects((currentProjects) =>
                sortOrder === "oldest"
                    ? [...currentProjects, message.project]
                    : [message.project, ...currentProjects]
            );
        }
    }

    if (message.type === "projectUpdated") {
        setStatsRefreshKey((current) => current + 1);
        setProjects((currentProjects) =>
            currentProjects
                .map((project) =>
                    project.id === message.project.id
                        ? message.project
                        : project
                )
                .filter((project) =>
                    statusFilter === "all" ||
                    project.status === statusFilter
                )
        );
    }

    if (message.type === "projectDeleted") {
        setStatsRefreshKey((current) => current + 1);
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
    }, [currentUser, sortOrder, statusFilter]);

    async function handleLogout() {
        await apiFetch(
            `${import.meta.env.VITE_API_URL}/auth/logout`,
            { method: "POST" }
        );
        navigate("/login");
    }

    async function handleCreateProject(projectData) {
    setError("");

    const response = await apiFetch(`${import.meta.env.VITE_API_URL}/projects`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(projectData)
    });

    const data = await response.json();

    if (response.ok) {
    setShowNewProject(false);
    setStatsRefreshKey((current) => current + 1);
} else {
    setError(data.error || "Something went wrong");
}
}

    function startEditing(project) {
        setEditingId(project.id);
        setEditName(project.name);
        setEditDescription(project.description || "");
        setEditStatus(project.status || "planned");
        setEditDueDate(project.due_date || "");
    }

    function startEditingTask(task) {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
    setEditTaskStatus(task.status);
    setEditTaskPriority(task.priority || "medium");
    setEditTaskAssignee(task.assignee_username || "");
    setEditTaskDueDate(task.due_date || "");
}

function cancelEditingTask() {
    setEditingTaskId(null);
    setEditTaskTitle("");
    setEditTaskStatus("todo");
    setEditTaskPriority("medium");
    setEditTaskAssignee("");
    setEditTaskDueDate("");
}

    function cancelEditing() {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
    setEditStatus("planned");
    setEditDueDate("");
}

    async function handleEditProject(id) {
        setError("");

        const response = await apiFetch(
            `${import.meta.env.VITE_API_URL}/projects/${id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: editName,
                    description: editDescription,
                    status: editStatus,
                    due_date: editDueDate || null
                })
            }
        );

        const data = await response.json();

        if (response.ok) {
            setEditingId(null);
            setEditName("");
            setEditDescription("");
            setEditStatus("planned");
            setEditDueDate("");
            setStatsRefreshKey((current) => current + 1);
        } else {
            setError(data.error || "Something went wrong");
        }
    }

    async function handleDeleteProject(id) {
        setError("");
        const response = await apiFetch(
            `${import.meta.env.VITE_API_URL}/projects/${id}`,
            {
                method: "DELETE",

            }
        );

        const data = await response.json();

        if (!response.ok) {
            setError(data.error || "Something went wrong");
        } else {
            setStatsRefreshKey((current) => current + 1);
        }
    }
    
async function handleViewTasks(projectId) {
    if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
        setTasks([]);
        setTaskAssignees([]);
        setTaskPriorityFilter("all");
        setTaskStatusFilter("all");
        return;
    }
    setError("");

    const response = await apiFetch(
        `${import.meta.env.VITE_API_URL}/projects/${projectId}/tasks`
    );

    const data = await response.json();

    if (response.ok) {
        setSelectedProjectId(projectId);
        setTasks(data);
        setTaskPriorityFilter("all");
        setTaskStatusFilter("all");

        const project = projects.find(
            (currentProject) => currentProject.id === projectId
        );

        const membersResponse = await apiFetch(
            `${import.meta.env.VITE_API_URL}/projects/${projectId}/members`
        );

        const projectMembers = membersResponse.ok
            ? await membersResponse.json()
            : [];

        setTaskAssignees(projectMembers);

        if (Number(project?.user_id) === Number(currentUser?.id)) {
            setProjectTaskRoles((currentRoles) => ({
                ...currentRoles,
                [projectId]: "owner"
            }));
        } else if (membersResponse.ok) {
            const currentMembership = projectMembers.find(
                (member) => Number(member.id) === Number(currentUser?.id)
            );

            setProjectTaskRoles((currentRoles) => ({
                ...currentRoles,
                [projectId]: currentMembership?.role || "viewer"
            }));
        } else {
            setProjectTaskRoles((currentRoles) => ({
                ...currentRoles,
                [projectId]: "viewer"
            }));
        }
    } else {
        setError(data.error || "Failed to load tasks");
    }
}

async function handleTaskFilterChange(priority, status) {
    const params = new URLSearchParams();

    if (priority !== "all") {
        params.set("priority", priority);
    }

    if (status !== "all") {
        params.set("status", status);
    }

    setTaskPriorityFilter(priority);
    setTaskStatusFilter(status);
    setError("");

    try {
        const query = params.toString();
        const response = await apiFetch(
            `${import.meta.env.VITE_API_URL}/projects/${selectedProjectId}/tasks${query ? `?${query}` : ""}`
        );

        const data = await response.json();

        if (response.ok) {
            setTasks(data);
        } else {
            setError(data.error || "Failed to filter tasks");
        }
    } catch {
        setError("Failed to filter tasks");
    }
}

async function handleCreateTask(taskData) {
    setError("");

    const response = await apiFetch(
        `${import.meta.env.VITE_API_URL}/projects/${selectedProjectId}/tasks`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(taskData)
        }
    );

    const data = await response.json();

    if (response.ok) {
        const matchesPriority =
            taskPriorityFilter === "all" ||
            data.task.priority === taskPriorityFilter;
        const matchesStatus =
            taskStatusFilter === "all" ||
            data.task.status === taskStatusFilter;

        if (matchesPriority && matchesStatus) {
            setTasks((currentTasks) => [
                data.task,
                ...currentTasks
            ]);
        }
        setStatsRefreshKey((current) => current + 1);
    } else {
        setError(data.error || "Failed to create task");
    }
}

async function handleEditTask(id) {
    setError("");

    const response = await apiFetch(
        `${import.meta.env.VITE_API_URL}/tasks/${id}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: editTaskTitle,
                status: editTaskStatus,
                priority: editTaskPriority,
                assigneeUsername: editTaskAssignee || null,
                due_date: editTaskDueDate || null
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
            ).filter((task) =>
                (taskPriorityFilter === "all" ||
                    task.priority === taskPriorityFilter) &&
                (taskStatusFilter === "all" ||
                    task.status === taskStatusFilter)
            )
        );

        cancelEditingTask();
        setStatsRefreshKey((current) => current + 1);
    } else {
        setError(data.error || "Failed to update task");
    }
}

async function handleDeleteTask(id) {
    setError("");

    const response = await apiFetch(
        `${import.meta.env.VITE_API_URL}/tasks/${id}`,
        {
            method: "DELETE",

        }
    );

    const data = await response.json();

    if (response.ok) {
        setTasks((currentTasks) =>
            currentTasks.filter((task) => task.id !== id)
        );
        setStatsRefreshKey((current) => current + 1);
    } else {
        setError(data.error || "Failed to delete task");
    }
}

async function loadMembers(projectId) {
    setError("");

    const response = await apiFetch(
        `${import.meta.env.VITE_API_URL}/projects/${projectId}/members`
    );

    const data = await response.json();

    if (response.ok) {
        setSelectedMembersProjectId(projectId);
        setMembers(data);
    } else {
        setError(data.error || "Failed to load members");
    }
}

async function handleViewMembers(projectId) {
    if (selectedMembersProjectId === projectId) {
        setSelectedMembersProjectId(null);
        setMembers([]);
        return;
    }

    await loadMembers(projectId);
}

async function handleAddMember(username, role) {
    setError("");

    const response = await apiFetch(
        `${import.meta.env.VITE_API_URL}/projects/${selectedMembersProjectId}/members`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                role
            })
        }
    );

    const data = await response.json();

    if (response.ok) {
        await loadMembers(selectedMembersProjectId);
    } else {
        setError(data.error || "Failed to add member");
    }
}

async function handleRemoveMember(userId) {
    setError("");

    const response = await apiFetch(
        `${import.meta.env.VITE_API_URL}/projects/${selectedMembersProjectId}/members/${userId}`,
        {
            method: "DELETE",

        }
    );

    const data = await response.json();

    if (response.ok) {
        await loadMembers(selectedMembersProjectId);
    } else {
        setError(data.error || "Failed to remove member");
    }
}

async function handleUpdateMemberRole(userId, role) {
    setError("");

    const response = await apiFetch(
        `${import.meta.env.VITE_API_URL}/projects/${selectedMembersProjectId}/members/${userId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ role })
        }
    );

    const data = await response.json();

    if (response.ok) {
        await loadMembers(selectedMembersProjectId);
    } else {
        setError(data.error || "Failed to update member role");
    }
}

async function handleViewActivity(projectId) {
    if (selectedActivityProjectId === projectId) {
        setSelectedActivityProjectId(null);
        setActivities([]);
        return;
    }
    setError("");
    setSelectedActivityProjectId(projectId);
    setActivities([]);
    setActivityLoading(true);

    try {
        const response = await apiFetch(
            `${import.meta.env.VITE_API_URL}/projects/${projectId}/activity`
        );

        const data = await response.json();

        if (response.ok) {
            setActivities(data);
        } else {
            setError(data.error || "Failed to load activity");
        }
    } catch {
        setError("Failed to load activity");
    } finally {
        setActivityLoading(false);
    }
}
const filteredProjects = projects.filter((project) => {
    return project.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
});


    if (loading) {
    return <p>Loading...</p>;
}


    return (
    <div className="projects-page">
        <header className="hub-header">
            <div className="brand">
                <div className="brand-mark">
                    DH
                </div>

                <span className="brand-name">
                    Developer Team Hub
                </span>
            </div>

            <div className="header-actions">
                {currentUser?.role === "admin" && (
                    <Link className="admin-nav-link" to="/admin">Admin</Link>
                )}
                <button
                    className="logout-btn"
                    onClick={handleLogout}
                >
                    <LogOut size={14} />
                    Log out
                </button>
            </div>
        </header>

        <main className="hub-body">
            <DashboardStats refreshKey={statsRefreshKey} />
            
            <div className="toolbar">
    <button
    className="btn-primary"
    onClick={() => setShowNewProject((current) => !current)}
>
    <Plus size={15} />
    New project
</button>

    <div className="search-wrap">
        <Search size={15} />

        <input
            className="search-input"
            type="text"
            placeholder="Search projects by name"
            value={searchTerm}
            onChange={(e) =>
                setSearchTerm(e.target.value)
            }
        />
    </div>

    <div className="select-wrap">
        <select
            className="select-input"
            value={statusFilter}
            onChange={(e) =>
                setStatusFilter(e.target.value)
            }
        >
            <option value="all">All</option>
            <option value="planned">Planned</option>
            <option value="in-progress">
                In Progress
            </option>
            <option value="completed">
                Completed
            </option>
        </select>

        <ChevronDown size={14} />
    </div>

    <div className="select-wrap">
        <select
            className="select-input"
            aria-label="Sort projects"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
        >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
        </select>

        <ChevronDown size={14} />
    </div>
</div>

            {error && <p>{error}</p>}

            {showNewProject && (
    <ProjectForm
    onCreate={handleCreateProject}
    onCancel={() => setShowNewProject(false)}
/>
)}

            {filteredProjects.length === 0 && (
    <p>No projects found</p>
)}
            <div className="project-grid">
    {filteredProjects.map((project) => {
        const taskRole = projectTaskRoles[project.id];
        const canEditTasks =
            taskRole === "owner" || taskRole === "editor";

        return (
     <div className="project-wrapper" key={project.id}>
        <ProjectItem
            project={project}
            currentUserId={currentUser?.id}
            currentUserRole={currentUser?.role}
            editingId={editingId}
            editName={editName}
            setEditName={setEditName}
            editDescription={editDescription}
            setEditDescription={setEditDescription}
            editStatus={editStatus}
            setEditStatus={setEditStatus}
            editDueDate={editDueDate}
            setEditDueDate={setEditDueDate}
            startEditing={startEditing}
            handleEditProject={handleEditProject}
            handleDeleteProject={handleDeleteProject}
            cancelEditing={cancelEditing}
            handleViewTasks={handleViewTasks}
            handleViewMembers={handleViewMembers}
            handleViewActivity={handleViewActivity}
        />

        {selectedProjectId === project.id && (
    <>
        {canEditTasks ? (
            <TaskForm
                onCreateTask={handleCreateTask}
                members={taskAssignees}
            />
        ) : (
            <p className="permission-note">
                View-only access — viewers cannot add, edit, or delete tasks.
            </p>
        )}
        <TaskFilters
            priority={taskPriorityFilter}
            status={taskStatusFilter}
            onChange={handleTaskFilterChange}
        />
        <TaskList
    tasks={tasks}
    editingTaskId={editingTaskId}
    editTaskTitle={editTaskTitle}
    setEditTaskTitle={setEditTaskTitle}
    editTaskStatus={editTaskStatus}
    setEditTaskStatus={setEditTaskStatus}
    editTaskPriority={editTaskPriority}
    setEditTaskPriority={setEditTaskPriority}
    editTaskAssignee={editTaskAssignee}
    setEditTaskAssignee={setEditTaskAssignee}
    editTaskDueDate={editTaskDueDate}
    setEditTaskDueDate={setEditTaskDueDate}
    members={taskAssignees}
    startEditingTask={startEditingTask}
    handleEditTask={handleEditTask}
    cancelEditingTask={cancelEditingTask}
    handleDeleteTask={handleDeleteTask}
    canEdit={canEditTasks}
/>
    </>
)}
{selectedMembersProjectId === project.id && (
    <>
        {Number(project.user_id) === Number(currentUser?.id) && (
            <MemberForm onAddMember={handleAddMember} />
        )}
        <MemberList
    members={members}
    handleRemoveMember={handleRemoveMember}
    handleUpdateMemberRole={handleUpdateMemberRole}
    canManage={Number(project.user_id) === Number(currentUser?.id)}
/>
    </>
)}
{selectedActivityProjectId === project.id && (
    <ActivityList
        activities={activities}
        loading={activityLoading}
    />
)}
    </div>
        );
    })}
            </div>
            </main>
    </div>
);

}

export default Projects;
