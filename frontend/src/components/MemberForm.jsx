import { useState } from "react";

function MemberForm({ onAddMember }) {
    const [userId, setUserId] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        await onAddMember(userId);

        setUserId("");
    }

    return (
    <form className="inline-form" onSubmit={handleSubmit}>
        <input
            className="text-input"
            id="member-user-id"
            type="number"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="User ID"
        />

        <button className="btn-primary" type="submit">
            Add Member
        </button>
    </form>
);
}

export default MemberForm;