function TaskFilters({ priority, status, onChange, loading, error }) {
    return (
        <div className="task-filters" aria-busy={loading}>
            <select
                className="select-input"
                aria-label="Filter tasks by priority"
                value={priority}
                disabled={loading}
                onChange={(e) =>
                    onChange(e.target.value, status)
                }
            >
                <option value="all">All priorities</option>
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
            </select>

            <select
                className="select-input"
                aria-label="Filter tasks by status"
                value={status}
                disabled={loading}
                onChange={(e) =>
                    onChange(priority, e.target.value)
                }
            >
                <option value="all">All statuses</option>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
            </select>

            {loading && (
                <span className="task-filter-loading" role="status">
                    Filtering...
                </span>
            )}

            {error && (
                <p className="task-filter-error" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

export default TaskFilters;
