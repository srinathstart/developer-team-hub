import { useEffect, useRef, useState } from "react";
import apiFetch from "../api";

function useProjectsData({ currentUser, navigate, onError, onProjectsChanged }) {
    const [projects, setProjects] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("newest");
    const [loading, setLoading] = useState(true);
    const onErrorRef = useRef(onError);
    const onProjectsChangedRef = useRef(onProjectsChanged);

    useEffect(() => {
        onErrorRef.current = onError;
        onProjectsChangedRef.current = onProjectsChanged;
    }, [onError, onProjectsChanged]);

    useEffect(() => {
        async function getProjects() {
            const params = new URLSearchParams({ sort: sortOrder });

            if (statusFilter !== "all") {
                params.set("status", statusFilter);
            }

            onErrorRef.current("");
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
                    onErrorRef.current(data.error || "Failed to load projects");
                }
            } catch {
                onErrorRef.current("Failed to load projects");
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
                onProjectsChangedRef.current();
                const isVisibleToUser =
                    currentUser.role === "admin" ||
                    Number(message.project.user_id) === Number(currentUser.id);
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
                onProjectsChangedRef.current();
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
                onProjectsChangedRef.current();
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

    return {
        projects,
        statusFilter,
        setStatusFilter,
        sortOrder,
        setSortOrder,
        loading
    };
}

export default useProjectsData;
