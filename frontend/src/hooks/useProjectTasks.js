import { useState } from "react";
import apiFetch from "../api";

function useProjectTasks({ projects, currentUser, onClearPageError, onTasksChanged }) {
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loadingTasksProjectId, setLoadingTasksProjectId] = useState(null);
    const [taskLoadError, setTaskLoadError] = useState(null);
    const [taskAssignees, setTaskAssignees] = useState([]);
    const [taskPriorityFilter, setTaskPriorityFilter] = useState("all");
    const [taskStatusFilter, setTaskStatusFilter] = useState("all");
    const [taskFilterLoading, setTaskFilterLoading] = useState(false);
    const [taskFilterError, setTaskFilterError] = useState("");
    const [projectTaskRoles, setProjectTaskRoles] = useState({});

    async function handleViewTasks(projectId) {
        if (selectedProjectId === projectId) {
            setSelectedProjectId(null);
            setTasks([]);
            setTaskLoadError(null);
            setTaskAssignees([]);
            setTaskPriorityFilter("all");
            setTaskStatusFilter("all");
            setTaskFilterError("");
            return;
        }

        if (loadingTasksProjectId !== null) {
            return;
        }

        onClearPageError();
        setTaskLoadError(null);
        setLoadingTasksProjectId(projectId);

        try {
            const response = await apiFetch(
                `${import.meta.env.VITE_API_URL}/projects/${projectId}/tasks`
            );
            const data = await response.json();

            if (!response.ok) {
                setTaskLoadError({
                    projectId,
                    message: data.error || "Failed to load tasks"
                });
                return;
            }

            setSelectedProjectId(projectId);
            setTasks(data);
            setTaskPriorityFilter("all");
            setTaskStatusFilter("all");
            setTaskFilterError("");

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
        } finally {
            setLoadingTasksProjectId(null);
        }
    }

    async function handleTaskFilterChange(priority, status) {
        if (taskFilterLoading) {
            return;
        }

        const previousPriority = taskPriorityFilter;
        const previousStatus = taskStatusFilter;
        const params = new URLSearchParams();

        if (priority !== "all") params.set("priority", priority);
        if (status !== "all") params.set("status", status);

        setTaskPriorityFilter(priority);
        setTaskStatusFilter(status);
        onClearPageError();
        setTaskFilterError("");
        setTaskFilterLoading(true);

        try {
            const query = params.toString();
            const response = await apiFetch(
                `${import.meta.env.VITE_API_URL}/projects/${selectedProjectId}/tasks${query ? `?${query}` : ""}`
            );
            const data = await response.json();

            if (response.ok) {
                setTasks(data);
            } else {
                setTaskPriorityFilter(previousPriority);
                setTaskStatusFilter(previousStatus);
                setTaskFilterError(data.error || "Failed to filter tasks");
            }
        } catch {
            setTaskPriorityFilter(previousPriority);
            setTaskStatusFilter(previousStatus);
            setTaskFilterError("Failed to filter tasks");
        } finally {
            setTaskFilterLoading(false);
        }
    }

    async function handleCreateTask(taskData) {
        onClearPageError();

        const response = await apiFetch(
            `${import.meta.env.VITE_API_URL}/projects/${selectedProjectId}/tasks`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(taskData)
            }
        );
        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || "Failed to create task"
            };
        }

        const matchesPriority =
            taskPriorityFilter === "all" ||
            data.task.priority === taskPriorityFilter;
        const matchesStatus =
            taskStatusFilter === "all" ||
            data.task.status === taskStatusFilter;

        if (matchesPriority && matchesStatus) {
            setTasks((currentTasks) => [data.task, ...currentTasks]);
        }

        onTasksChanged();
        return { success: true, error: "" };
    }

    function applyUpdatedTask(updatedTask) {
        setTasks((currentTasks) =>
            currentTasks.map((task) =>
                task.id === updatedTask.id ? updatedTask : task
            ).filter((task) =>
                (taskPriorityFilter === "all" ||
                    task.priority === taskPriorityFilter) &&
                (taskStatusFilter === "all" ||
                    task.status === taskStatusFilter)
            )
        );
        onTasksChanged();
    }

    function removeDeletedTask(deletedTaskId) {
        setTasks((currentTasks) =>
            currentTasks.filter((task) => task.id !== deletedTaskId)
        );
        onTasksChanged();
    }

    return {
        selectedProjectId,
        tasks,
        loadingTasksProjectId,
        taskLoadError,
        taskAssignees,
        taskPriorityFilter,
        taskStatusFilter,
        taskFilterLoading,
        taskFilterError,
        projectTaskRoles,
        handleViewTasks,
        handleTaskFilterChange,
        handleCreateTask,
        applyUpdatedTask,
        removeDeletedTask
    };
}

export default useProjectTasks;
