import { useRef, useState } from "react";
import apiFetch from "../api";

function useProjectCreation({ onClearPageError, onProjectCreated }) {
    const newProjectButtonRef = useRef(null);
    const [showNewProject, setShowNewProject] = useState(false);

    function toggleNewProject() {
        setShowNewProject((current) => !current);
    }

    function closeNewProject() {
        setShowNewProject(false);
        newProjectButtonRef.current?.focus();
    }

    async function handleCreateProject(projectData) {
        onClearPageError();

        const response = await apiFetch(
            `${import.meta.env.VITE_API_URL}/projects`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(projectData)
            }
        );

        const data = await response.json();

        if (response.ok) {
            closeNewProject();
            onProjectCreated();
            return { success: true, error: "" };
        }

        return {
            success: false,
            error: data.error || "Something went wrong"
        };
    }

    return {
        newProjectButtonRef,
        showNewProject,
        toggleNewProject,
        closeNewProject,
        handleCreateProject
    };
}

export default useProjectCreation;
