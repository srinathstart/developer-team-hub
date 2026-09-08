import { useState } from "react";
import apiFetch from "../api";

function useTaskEditing({ onClearPageError, onTaskUpdated }) {
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editTaskTitle, setEditTaskTitle] = useState("");
    const [editTaskStatus, setEditTaskStatus] = useState("todo");
    const [editTaskPriority, setEditTaskPriority] = useState("medium");
    const [editTaskAssignee, setEditTaskAssignee] = useState("");
    const [editTaskDueDate, setEditTaskDueDate] = useState("");
    const [savingTaskId, setSavingTaskId] = useState(null);
    const [taskEditError, setTaskEditError] = useState("");

    function resetEditingTask() {
        setEditingTaskId(null);
        setEditTaskTitle("");
        setEditTaskStatus("todo");
        setEditTaskPriority("medium");
        setEditTaskAssignee("");
        setEditTaskDueDate("");
    }

    function startEditingTask(task) {
        setTaskEditError("");
        setEditingTaskId(task.id);
        setEditTaskTitle(task.title);
        setEditTaskStatus(task.status);
        setEditTaskPriority(task.priority || "medium");
        setEditTaskAssignee(task.assignee_username || "");
        setEditTaskDueDate(task.due_date || "");
    }

    function cancelEditingTask() {
        setTaskEditError("");
        resetEditingTask();
    }

    async function handleEditTask(id) {
        if (savingTaskId === id) {
            return;
        }

        onClearPageError();
        setTaskEditError("");
        setSavingTaskId(id);

        try {
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
                onTaskUpdated(data.task);
                resetEditingTask();
            } else {
                setTaskEditError(data.error || "Failed to update task");
            }
        } finally {
            setSavingTaskId(null);
        }
    }

    return {
        editingTaskId,
        editTaskTitle,
        setEditTaskTitle,
        editTaskStatus,
        setEditTaskStatus,
        editTaskPriority,
        setEditTaskPriority,
        editTaskAssignee,
        setEditTaskAssignee,
        editTaskDueDate,
        setEditTaskDueDate,
        savingTaskId,
        taskEditError,
        startEditingTask,
        cancelEditingTask,
        handleEditTask
    };
}

export default useTaskEditing;
