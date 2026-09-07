function TaskFilters({ priority, status, onChange }) {
    return (
        <div className="task-filters">
            <select
                className="select-input"
                aria-label="Filter tasks by priority"
                value={priority}
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
                onChange={(e) =>
                    onChange(priority, e.target.value)
                }
            >
                <option value="all">All statuses</option>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
            </select>
        </div>
    );
}

export default TaskFilters;
