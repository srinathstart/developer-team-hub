import { useState } from "react";
import apiFetch from "../api";

function useProjectDeletion({ onClearPageError, onProjectDeleted }) {
    const [deletingProjectId, setDeletingProjectId] = useState(null);
    const [projectDeleteError, setProjectDeleteError] = useState(null);

    async function handleDeleteProject(id) {
        if (deletingProjectId === id) {
            return;
        }

        onClearPageError();
        setProjectDeleteError(null);
        setDeletingProjectId(id);

        try {
            const response = await apiFetch(
                `${import.meta.env.VITE_API_URL}/projects/${id}`,
                { method: "DELETE" }
            );

            const data = await response.json();

            if (!response.ok) {
                setProjectDeleteError({
                    projectId: id,
                    message: data.error || "Something went wrong"
                });
            } else {
                onProjectDeleted();
            }
        } finally {
            setDeletingProjectId(null);
        }
    }

    return {
        deletingProjectId,
        projectDeleteError,
        handleDeleteProject
    };
}

export default useProjectDeletion;
