import { useState } from "react";
import apiFetch from "../api";

function useProjectEditing({ onClearPageError, onProjectUpdated }) {
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editStatus, setEditStatus] = useState("planned");
    const [editDueDate, setEditDueDate] = useState("");
    const [savingProjectId, setSavingProjectId] = useState(null);
    const [projectEditError, setProjectEditError] = useState("");

    function resetEditing() {
        setEditingId(null);
        setEditName("");
        setEditDescription("");
        setEditStatus("planned");
        setEditDueDate("");
    }

    function startEditing(project) {
        setProjectEditError("");
        setEditingId(project.id);
        setEditName(project.name);
        setEditDescription(project.description || "");
        setEditStatus(project.status || "planned");
        setEditDueDate(project.due_date || "");
    }

    function cancelEditing() {
        setProjectEditError("");
        resetEditing();
    }

    async function handleEditProject(id) {
        if (savingProjectId === id) {
            return;
        }

        onClearPageError();
        setProjectEditError("");
        setSavingProjectId(id);

        try {
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
                resetEditing();
                onProjectUpdated();
            } else {
                setProjectEditError(data.error || "Something went wrong");
            }
        } finally {
            setSavingProjectId(null);
        }
    }

    return {
        editingId,
        editName,
        setEditName,
        editDescription,
        setEditDescription,
        editStatus,
        setEditStatus,
        editDueDate,
        setEditDueDate,
        savingProjectId,
        projectEditError,
        startEditing,
        cancelEditing,
        handleEditProject
    };
}

export default useProjectEditing;
