function MemberList({
    members,
    handleRemoveMember
}) {
    return (
        <div>
            <h4>Members</h4>

            {members.map((member) => (
                <div key={member.id}>
                    <p>{member.username}</p>

                    <button
                        onClick={() =>
                            handleRemoveMember(member.id)
                        }
                    >
                        Remove
                    </button>
                </div>
            ))}
        </div>
    );
}

export default MemberList;