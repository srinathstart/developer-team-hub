import { Trash2, User } from "lucide-react";

function MemberList({
    members,
    handleRemoveMember,
    removingMemberId,
    memberRemoveError,
    updatingMemberId,
    memberRoleError,
    handleUpdateMemberRole,
    canManage
}) {
    return (
        <div className="member-section">
            <h4 className="panel-heading">
                Members
            </h4>

            {members.length === 0 && (
                <p className="no-items">
                    No members yet
                </p>
            )}

            <div className="member-list" role="list">
                {members.map((member) => {
                    const isRemoving = removingMemberId === member.id;
                    const isUpdating = updatingMemberId === member.id;

                    return (
                    <div
                        className="member-row"
                        key={member.id}
                        role="listitem"
                    >
                        <div className="member-info">
                            <div className="member-avatar">
                                <User size={13} />
                            </div>

                            <span className="member-name">
                                {member.username}
                            </span>
                        </div>

                        <div className="member-row-actions">
                            {canManage ? (
                                <select
                                    className="member-role-select"
                                    aria-label={`Role for ${member.username}`}
                                    value={member.role}
                                    disabled={isRemoving || isUpdating}
                                    onChange={(e) =>
                                        handleUpdateMemberRole(
                                            member.id,
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="viewer">Viewer</option>
                                    <option value="editor">Editor</option>
                                </select>
                            ) : (
                                <span className={`member-role ${member.role}`}>
                                    {member.role}
                                </span>
                            )}

                            {isUpdating && (
                                <span className="member-saving" role="status">
                                    Saving...
                                </span>
                            )}

                            {memberRoleError?.memberId === member.id && (
                                <span className="member-role-error" role="alert">
                                    {memberRoleError.message}
                                </span>
                            )}

                            {memberRemoveError?.memberId === member.id && (
                                <span className="member-remove-error" role="alert">
                                    {memberRemoveError.message}
                                </span>
                            )}

                            {canManage && (
                                <button
                                    className="mini-btn danger"
                                    type="button"
                                    disabled={isRemoving || isUpdating}
                                    onClick={() =>
                                        handleRemoveMember(member.id)
                                    }
                                    title={isRemoving ? "Removing member" : "Remove member"}
                                    aria-label={
                                        isRemoving
                                            ? `Removing ${member.username}`
                                            : `Remove ${member.username}`
                                    }
                                >
                                    {isRemoving ? "Removing..." : <Trash2 size={13} />}
                                </button>
                            )}
                        </div>
                    </div>
                    );
                })}
            </div>
        </div>
    );
}

export default MemberList;
