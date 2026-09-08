function formatActivityTime(createdAt) {
    return new Date(createdAt).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}

function ActivityList({ activities, loading, error }) {
    return (
        <section className="activity-section" aria-busy={loading}>
            <h4 className="panel-heading">Activity</h4>

            {loading && (
                <p className="no-items" role="status">Loading activity...</p>
            )}

            {!loading && error && (
                <p className="activity-error" role="alert">
                    {error}
                </p>
            )}

            {!loading && !error && activities.length === 0 && (
                <p className="no-items">No activity yet</p>
            )}

            {!loading && !error && activities.length > 0 && (
                <div className="activity-list">
                    {activities.map((activity) => (
                        <div className="activity-row" key={activity.id}>
                            <p className="activity-message">
                                <strong>{activity.username || "Unknown user"}</strong>{" "}
                                {activity.action}
                            </p>

                            <time className="activity-time" dateTime={activity.created_at}>
                                {formatActivityTime(activity.created_at)}
                            </time>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default ActivityList;
