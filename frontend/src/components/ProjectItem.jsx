function ProjectItem({
    project,
    editingId,
    editName,
    setEditName,
    editDescription,
    setEditDescription,
    editStatus,
    setEditStatus,
    startEditing,
    handleEditProject,
    handleDeleteProject,
    cancelEditing,
    handleViewTasks,
}) {
    const isEditing = editingId === project.id;

    return (
        <div className="project-item">
            {isEditing ? (
                <>
                    <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                    />

                    <textarea
                        value={editDescription}
                        onChange={(e) =>
                            setEditDescription(e.target.value)
                        }
                    />

                    <select
                        value={editStatus}
                        onChange={(e) =>
                            setEditStatus(e.target.value)
                        }
                    >
                        <option value="planned">
                            Planned
                        </option>

                        <option value="in-progress">
                            In Progress
                        </option>

                        <option value="completed">
                            Completed
                        </option>
                    </select>

                    <button
                        onClick={() =>
                            handleEditProject(project.id)
                        }
                    >
                        Save
                    </button>

                    <button onClick={cancelEditing}>
                        Cancel
                    </button>
                </>
            ) : (
                <>
                    <h3>{project.name}</h3>

                    <p>
                        {project.description}
                    </p>

                    <p>
                        Status: {project.status}
                    </p>
                    <button onClick={() => handleViewTasks(project.id)}>
    View Tasks
</button>

                    <button
                        onClick={() =>
                            startEditing(project)
                        }
                    >
                        Edit
                    </button>

                    <button
                        onClick={() =>
                            handleDeleteProject(project.id)
                        }
                    >
                        Delete
                    </button>
                </>
            )}
        </div>
    );
}

export default ProjectItem;