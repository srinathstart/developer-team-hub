import { useState } from "react";

function MemberForm({ onAddMember }) {
    const [username, setUsername] = useState("");
    const [role, setRole] = useState("viewer");

    async function handleSubmit(e) {
        e.preventDefault();

        await onAddMember(username, role);

        setUsername("");
        setRole("viewer");
    }

    return (
    <form className="inline-form" onSubmit={handleSubmit}>
        <input
            className="text-input"
            id="member-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            aria-label="Member username"
            autoComplete="off"
            required
        />

        <select
            className="select-input"
            aria-label="Member role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
        >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
        </select>

        <button className="btn-primary" type="submit">
            Add Member
        </button>
    </form>
);
}

export default MemberForm;
