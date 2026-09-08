import { useState } from "react";
import apiFetch from "../api";

function useTaskDeletion({ onClearPageError, onTaskDeleted }) {
    const [deletingTaskId, setDeletingTaskId] = useState(null);
    const [taskDeleteError, setTaskDeleteError] = useState(null);

    async function handleDeleteTask(id) {
        if (deletingTaskId === id) {
            return;
        }

        onClearPageError();
        setTaskDeleteError(null);
        setDeletingTaskId(id);

        try {
            const response = await apiFetch(
                `${import.meta.env.VITE_API_URL}/tasks/${id}`,
                { method: "DELETE" }
            );

            const data = await response.json();

            if (response.ok) {
                onTaskDeleted(id);
            } else {
                setTaskDeleteError({
                    taskId: id,
                    message: data.error || "Failed to delete task"
                });
            }
        } finally {
            setDeletingTaskId(null);
        }
    }

    return {
        deletingTaskId,
        taskDeleteError,
        handleDeleteTask
    };
}

export default useTaskDeletion;
