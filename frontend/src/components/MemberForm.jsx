import { useState } from "react";

function MemberForm({ onAddMember }) {
    const [username, setUsername] = useState("");
    const [role, setRole] = useState("viewer");
    const [submitting, setSubmitting] = useState(false);
    const [addError, setAddError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        if (submitting) {
            return;
        }

        setAddError("");
        setSubmitting(true);

        try {
            const result = await onAddMember(username, role);

            if (result.success) {
                setUsername("");
                setRole("viewer");
            } else {
                setAddError(result.error);
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
    <form className="inline-form" aria-busy={submitting} onSubmit={handleSubmit}>
        <input
            className="text-input"
            id="member-username"
            type="text"
            value={username}
            disabled={submitting}
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
            disabled={submitting}
            onChange={(e) => setRole(e.target.value)}
        >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
        </select>

        <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "Add Member"}
        </button>

        {addError && (
            <p className="inline-form-error" role="alert">
                {addError}
            </p>
        )}
    </form>
);
}

export default MemberForm;
