function formatActivityTime(createdAt) {
    return new Date(createdAt).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}

function ActivityList({ activities, loading }) {
    return (
        <section className="activity-section">
            <h4 className="panel-heading">Activity</h4>

            {loading && (
                <p className="no-items">Loading activity...</p>
            )}

            {!loading && activities.length === 0 && (
                <p className="no-items">No activity yet</p>
            )}

            {!loading && activities.length > 0 && (
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
