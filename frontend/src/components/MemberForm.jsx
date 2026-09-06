import { useState } from "react";

function MemberForm({ onAddMember }) {
    const [userId, setUserId] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        await onAddMember(userId);

        setUserId("");
    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="member-user-id">
                User ID
            </label>

            <input
                id="member-user-id"
                type="number"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="User ID"
            />

            <button type="submit">
                Add Member
            </button>
        </form>
    );
}

export default MemberForm;