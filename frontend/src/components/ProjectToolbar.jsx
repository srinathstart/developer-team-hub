import { ChevronDown, Plus, Search } from "lucide-react";

function ProjectToolbar({
    searchTerm,
    onSearchTermChange,
    statusFilter,
    onStatusFilterChange,
    sortOrder,
    onSortOrderChange,
    showNewProject,
    onToggleNewProject,
    newProjectButtonRef
}) {
    return (
        <div className="toolbar">
            <button
                className="btn-primary"
                ref={newProjectButtonRef}
                type="button"
                aria-expanded={showNewProject}
                aria-controls="new-project-form"
                onClick={onToggleNewProject}
            >
                <Plus size={15} />
                New project
            </button>

            <div className="search-wrap">
                <Search size={15} />

                <input
                    className="search-input"
                    type="text"
                    placeholder="Search projects by name"
                    aria-label="Search projects by name"
                    value={searchTerm}
                    onChange={(event) =>
                        onSearchTermChange(event.target.value)
                    }
                />
            </div>

            <div className="select-wrap">
                <select
                    className="select-input"
                    aria-label="Filter projects by status"
                    value={statusFilter}
                    onChange={(event) =>
                        onStatusFilterChange(event.target.value)
                    }
                >
                    <option value="all">All</option>
                    <option value="planned">Planned</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>

                <ChevronDown size={14} />
            </div>

            <div className="select-wrap">
                <select
                    className="select-input"
                    aria-label="Sort projects"
                    value={sortOrder}
                    onChange={(event) =>
                        onSortOrderChange(event.target.value)
                    }
                >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                </select>

                <ChevronDown size={14} />
            </div>
        </div>
    );
}

export default ProjectToolbar;
