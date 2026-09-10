import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiFetch from "../api";
import ProjectForm from "./ProjectForm";
import DashboardStats from "./DashboardStats";
import ProjectToolbar from "./ProjectToolbar";
import ProjectHeader from "./ProjectHeader";
import ProjectWorkspace from "./ProjectWorkspace";
import useProjectActivity from "../hooks/useProjectActivity";
import useProjectMembers from "../hooks/useProjectMembers";
import useProjectEditing from "../hooks/useProjectEditing";
import useProjectDeletion from "../hooks/useProjectDeletion";
import useProjectCreation from "../hooks/useProjectCreation";
import useTaskEditing from "../hooks/useTaskEditing";
import useTaskDeletion from "../hooks/useTaskDeletion";
import useProjectTasks from "../hooks/useProjectTasks";
import useProjectsData from "../hooks/useProjectsData";

function Projects() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statsRefreshKey, setStatsRefreshKey] = useState(0);

    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const {
        projects,
        statusFilter,
        setStatusFilter,
        sortOrder,
        setSortOrder,
        loading
    } = useProjectsData({
        currentUser,
        navigate,
        onError: setError,
        onProjectsChanged: () =>
            setStatsRefreshKey((current) => current + 1)
    });
    const activityWorkspace = useProjectActivity(() => setError(""));
    const memberWorkspace = useProjectMembers(
        (message = "") => setError(message)
    );
    const projectEditing = useProjectEditing({
        onClearPageError: () => setError(""),
        onProjectUpdated: () =>
            setStatsRefreshKey((current) => current + 1)
    });
    const projectDeletion = useProjectDeletion({
        onClearPageError: () => setError(""),
        onProjectDeleted: () =>
            setStatsRefreshKey((current) => current + 1)
    });
    const {
        newProjectButtonRef,
        showNewProject,
        toggleNewProject,
        closeNewProject,
        handleCreateProject
    } = useProjectCreation({
        onClearPageError: () => setError(""),
        onProjectCreated: () =>
            setStatsRefreshKey((current) => current + 1)
    });
    const taskWorkspace = useProjectTasks({
        projects,
        currentUser,
        onClearPageError: () => setError(""),
        onTasksChanged: () =>
            setStatsRefreshKey((current) => current + 1)
    });
    const taskEditing = useTaskEditing({
        onClearPageError: () => setError(""),
        onTaskUpdated: taskWorkspace.applyUpdatedTask
    });
    const taskDeletion = useTaskDeletion({
        onClearPageError: () => setError(""),
        onTaskDeleted: taskWorkspace.removeDeletedTask
    });

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

    async function handleLogout() {
        await apiFetch(
            `${import.meta.env.VITE_API_URL}/auth/logout`,
            { method: "POST" }
        );
        sessionStorage.removeItem("token");
        navigate("/login");
    }

const filteredProjects = projects.filter((project) => {
    return project.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
});


    if (loading) {
    return <p role="status">Loading projects...</p>;
}


    return (
    <div className="projects-page">
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <ProjectHeader
            currentUser={currentUser}
            onLogout={handleLogout}
        />

        <main className="hub-body" id="main-content" tabIndex="-1">
            <h1 className="sr-only">Projects dashboard</h1>
            <DashboardStats refreshKey={statsRefreshKey} />
            
            <ProjectToolbar
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
                showNewProject={showNewProject}
                onToggleNewProject={toggleNewProject}
                newProjectButtonRef={newProjectButtonRef}
            />

            {error && <p role="alert">{error}</p>}

            {showNewProject && (
    <ProjectForm
    onCreate={handleCreateProject}
    onCancel={closeNewProject}
/>
)}

            {filteredProjects.length === 0 && (
    <p>No projects found</p>
)}
            <div className="project-grid">
                {filteredProjects.map((project) => (
                    <ProjectWorkspace
                        key={project.id}
                        project={project}
                        currentUser={currentUser}
                        projectEditing={projectEditing}
                        projectDeletion={projectDeletion}
                        taskWorkspace={taskWorkspace}
                        taskEditing={taskEditing}
                        taskDeletion={taskDeletion}
                        memberWorkspace={memberWorkspace}
                        activityWorkspace={activityWorkspace}
                    />
                ))}
            </div>
            </main>
    </div>
);

}

export default Projects;
