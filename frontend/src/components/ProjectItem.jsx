function ProjectItem({
    project,
    editingId,
    editName,
    setEditName,
    startEditing,
    handleEditProject,
    handleDeleteProject,
    cancelEditing
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

                    <button
                        onClick={() => handleEditProject(project.id)}
                    >
                        Save
                    </button>

                    <button onClick={cancelEditing}>
                        Cancel
                    </button>
                </>
            ) : (
                <>
                    <span>{project.name}</span>

                    <button onClick={() => startEditing(project)}>
                        Edit
                    </button>

                    <button
                        onClick={() => handleDeleteProject(project.id)}
                    >
                        Delete
                    </button>
                </>
            )}
        </div>
    );
}

export default ProjectItem;