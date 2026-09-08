import ActivityList from "./ActivityList";
import MemberForm from "./MemberForm";
import MemberList from "./MemberList";
import ProjectItem from "./ProjectItem";
import TaskFilters from "./TaskFilters";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";

function ProjectWorkspace({
    project,
    currentUser,
    projectEditing,
    projectDeletion,
    taskWorkspace,
    taskEditing,
    taskDeletion,
    memberWorkspace,
    activityWorkspace
}) {
    const taskRole = taskWorkspace.projectTaskRoles[project.id];
    const canEditTasks = taskRole === "owner" || taskRole === "editor";
    const isOwner = Number(project.user_id) === Number(currentUser?.id);

    return (
        <div className="project-wrapper">
            <ProjectItem
                project={project}
                currentUserId={currentUser?.id}
                currentUserRole={currentUser?.role}
                editingId={projectEditing.editingId}
                editName={projectEditing.editName}
                setEditName={projectEditing.setEditName}
                editDescription={projectEditing.editDescription}
                setEditDescription={projectEditing.setEditDescription}
                editStatus={projectEditing.editStatus}
                setEditStatus={projectEditing.setEditStatus}
                editDueDate={projectEditing.editDueDate}
                setEditDueDate={projectEditing.setEditDueDate}
                isSaving={projectEditing.savingProjectId === project.id}
                editError={projectEditing.projectEditError}
                isDeleting={projectDeletion.deletingProjectId === project.id}
                deleteError={
                    projectDeletion.projectDeleteError?.projectId === project.id
                        ? projectDeletion.projectDeleteError.message
                        : ""
                }
                startEditing={projectEditing.startEditing}
                handleEditProject={projectEditing.handleEditProject}
                handleDeleteProject={projectDeletion.handleDeleteProject}
                cancelEditing={projectEditing.cancelEditing}
                handleViewTasks={taskWorkspace.handleViewTasks}
                tasksOpen={taskWorkspace.selectedProjectId === project.id}
                isLoadingTasks={taskWorkspace.loadingTasksProjectId === project.id}
                isTasksRequestActive={taskWorkspace.loadingTasksProjectId !== null}
                taskLoadError={
                    taskWorkspace.taskLoadError?.projectId === project.id
                        ? taskWorkspace.taskLoadError.message
                        : ""
                }
                handleViewMembers={memberWorkspace.handleViewMembers}
                membersOpen={memberWorkspace.selectedMembersProjectId === project.id}
                isLoadingMembers={memberWorkspace.loadingMembersProjectId === project.id}
                isMembersRequestActive={memberWorkspace.loadingMembersProjectId !== null}
                memberLoadError={
                    memberWorkspace.memberLoadError?.projectId === project.id
                        ? memberWorkspace.memberLoadError.message
                        : ""
                }
                handleViewActivity={activityWorkspace.handleViewActivity}
                activityOpen={activityWorkspace.selectedActivityProjectId === project.id}
            />

            {taskWorkspace.selectedProjectId === project.id && (
                <>
                    {canEditTasks ? (
                        <TaskForm
                            onCreateTask={taskWorkspace.handleCreateTask}
                            members={taskWorkspace.taskAssignees}
                        />
                    ) : (
                        <p className="permission-note">
                            View-only access — viewers cannot add, edit, or delete tasks.
                        </p>
                    )}

                    <TaskFilters
                        priority={taskWorkspace.taskPriorityFilter}
                        status={taskWorkspace.taskStatusFilter}
                        onChange={taskWorkspace.handleTaskFilterChange}
                        loading={taskWorkspace.taskFilterLoading}
                        error={taskWorkspace.taskFilterError}
                    />

                    <TaskList
                        tasks={taskWorkspace.tasks}
                        editingTaskId={taskEditing.editingTaskId}
                        editTaskTitle={taskEditing.editTaskTitle}
                        setEditTaskTitle={taskEditing.setEditTaskTitle}
                        editTaskStatus={taskEditing.editTaskStatus}
                        setEditTaskStatus={taskEditing.setEditTaskStatus}
                        editTaskPriority={taskEditing.editTaskPriority}
                        setEditTaskPriority={taskEditing.setEditTaskPriority}
                        editTaskAssignee={taskEditing.editTaskAssignee}
                        setEditTaskAssignee={taskEditing.setEditTaskAssignee}
                        editTaskDueDate={taskEditing.editTaskDueDate}
                        setEditTaskDueDate={taskEditing.setEditTaskDueDate}
                        savingTaskId={taskEditing.savingTaskId}
                        editError={taskEditing.taskEditError}
                        deletingTaskId={taskDeletion.deletingTaskId}
                        deleteError={taskDeletion.taskDeleteError}
                        members={taskWorkspace.taskAssignees}
                        startEditingTask={taskEditing.startEditingTask}
                        handleEditTask={taskEditing.handleEditTask}
                        cancelEditingTask={taskEditing.cancelEditingTask}
                        handleDeleteTask={taskDeletion.handleDeleteTask}
                        canEdit={canEditTasks}
                    />
                </>
            )}

            {memberWorkspace.selectedMembersProjectId === project.id && (
                <>
                    {isOwner && (
                        <MemberForm onAddMember={memberWorkspace.handleAddMember} />
                    )}

                    <MemberList
                        members={memberWorkspace.members}
                        handleRemoveMember={memberWorkspace.handleRemoveMember}
                        removingMemberId={memberWorkspace.removingMemberId}
                        memberRemoveError={memberWorkspace.memberRemoveError}
                        updatingMemberId={memberWorkspace.updatingMemberId}
                        memberRoleError={memberWorkspace.memberRoleError}
                        handleUpdateMemberRole={memberWorkspace.handleUpdateMemberRole}
                        canManage={isOwner}
                    />
                </>
            )}

            {activityWorkspace.selectedActivityProjectId === project.id && (
                <ActivityList
                    activities={activityWorkspace.activities}
                    loading={activityWorkspace.activityLoading}
                    error={activityWorkspace.activityError}
                />
            )}
        </div>
    );
}

export default ProjectWorkspace;
