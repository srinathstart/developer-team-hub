import { useEffect, useState } from "react";
import apiFetch from "../api";

const statItems = [
    ["total_projects", "Total projects"],
    ["planned_projects", "Planned"],
    ["in_progress_projects", "In progress"],
    ["completed_projects", "Completed projects"],
    ["shared_projects", "Shared with you"],
    ["total_tasks", "Total tasks"],
    ["completed_tasks", "Completed tasks"],
    ["overdue_tasks", "Overdue tasks"]
];

function DashboardStats({ refreshKey }) {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadStats() {
            try {
                const response = await apiFetch(
                    `${import.meta.env.VITE_API_URL}/dashboard/stats`
                );
                const data = await response.json();

                if (!active) {
                    return;
                }

                if (response.ok) {
                    setStats(data);
                    setError("");
                } else {
                    setError(data.error || "Failed to load statistics");
                }
            } catch {
                if (active) {
                    setError("Failed to load statistics");
                }
            }
        }

        loadStats();

        return () => {
            active = false;
        };
    }, [refreshKey]);

    if (error) {
        return <p className="stats-error">{error}</p>;
    }

    if (!stats) {
        return <p className="stats-loading">Loading summary...</p>;
    }

    return (
        <section className="stats-grid" aria-label="Dashboard summary">
            {statItems.map(([key, label]) => (
                <article
                    className={`stat-card${key === "overdue_tasks" ? " overdue" : ""}`}
                    key={key}
                >
                    <span className="stat-value">{stats[key]}</span>
                    <span className="stat-label">{label}</span>
                </article>
            ))}
        </section>
    );
}

export default DashboardStats;
