import { useState } from "react";
import apiFetch from "../api";

function useProjectActivity(onClearPageError) {
    const [selectedActivityProjectId, setSelectedActivityProjectId] = useState(null);
    const [activities, setActivities] = useState([]);
    const [activityLoading, setActivityLoading] = useState(false);
    const [activityError, setActivityError] = useState("");

    async function handleViewActivity(projectId) {
        if (selectedActivityProjectId === projectId) {
            setSelectedActivityProjectId(null);
            setActivities([]);
            setActivityError("");
            return;
        }

        onClearPageError();
        setActivityError("");
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
                setActivityError(data.error || "Failed to load activity");
            }
        } catch {
            setActivityError("Failed to load activity");
        } finally {
            setActivityLoading(false);
        }
    }

    return {
        selectedActivityProjectId,
        activities,
        activityLoading,
        activityError,
        handleViewActivity
    };
}

export default useProjectActivity;
