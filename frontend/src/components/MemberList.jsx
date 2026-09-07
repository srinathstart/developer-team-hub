import { Trash2, User } from "lucide-react";

function MemberList({
    members,
    handleRemoveMember,
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

            <div className="member-list">
                {members.map((member) => (
                    <div
                        className="member-row"
                        key={member.id}
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

                            {canManage && (
                                <button
                                    className="mini-btn danger"
                                    onClick={() =>
                                        handleRemoveMember(member.id)
                                    }
                                    title="Remove member"
                                >
                                    <Trash2 size={13} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MemberList;
