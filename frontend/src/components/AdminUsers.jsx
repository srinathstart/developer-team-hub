import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Search, ShieldCheck } from "lucide-react";
import apiFetch from "../api";

function AdminUsers() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState({});
    const [auditEntries, setAuditEntries] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [updatingUserId, setUpdatingUserId] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    async function loadAudit() {
        const response = await apiFetch(
            `${import.meta.env.VITE_API_URL}/admin/audit`
        );

        if (response.ok) {
            setAuditEntries(await response.json());
        }
    }

    useEffect(() => {
        async function loadAdminPage() {
            try {
                const meResponse = await apiFetch(
                    `${import.meta.env.VITE_API_URL}/auth/me`
                );

                if (!meResponse.ok) {
                    navigate("/login");
                    return;
                }

                const meData = await meResponse.json();

                if (meData.user.role !== "admin") {
                    navigate("/projects");
                    return;
                }

                setCurrentUser(meData.user);

                const [usersResponse, auditResponse] = await Promise.all([
                    apiFetch(`${import.meta.env.VITE_API_URL}/admin/users`),
                    apiFetch(`${import.meta.env.VITE_API_URL}/admin/audit`)
                ]);

                if (!usersResponse.ok || !auditResponse.ok) {
                    throw new Error("Admin data could not be loaded");
                }

                const userData = await usersResponse.json();
                setUsers(userData);
                setSelectedRoles(Object.fromEntries(
                    userData.map((user) => [user.id, user.role])
                ));
                setAuditEntries(await auditResponse.json());
            } catch (loadError) {
                setError(loadError.message || "Failed to load admin page");
            } finally {
                setLoading(false);
            }
        }

        loadAdminPage();
    }, [navigate]);

    const filteredUsers = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();
        return users.filter((user) =>
            user.username.toLowerCase().includes(search)
        );
    }, [searchTerm, users]);

    async function handleRoleUpdate(user) {
        const newRole = selectedRoles[user.id];

        if (newRole === user.role) return;

        const confirmed = window.confirm(
            `Change ${user.username} from ${user.role} to ${newRole}?`
        );
        if (!confirmed) return;

        setError("");
        setMessage("");
        setUpdatingUserId(user.id);

        try {
            const response = await apiFetch(
                `${import.meta.env.VITE_API_URL}/admin/users/${user.id}/role`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ role: newRole })
                }
            );
            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to update role");
                return;
            }

            setUsers((currentUsers) => currentUsers.map((current) =>
                current.id === data.user.id ? data.user : current
            ));
            setMessage(`${data.user.username} is now ${data.user.role}`);
            await loadAudit();
        } catch {
            setError("Failed to connect to the server");
        } finally {
            setUpdatingUserId(null);
        }
    }

    async function handleLogout() {
        await apiFetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
            method: "POST"
        });
        sessionStorage.removeItem("token");
        navigate("/login");
    }

    if (loading) return <p className="admin-loading" role="status">Loading admin page...</p>;

    return (
        <div className="projects-page">
            <a className="skip-link" href="#main-content">Skip to main content</a>
            <header className="hub-header">
                <div className="brand">
                    <div className="brand-mark">DH</div>
                    <span className="brand-name">Developer Team Hub</span>
                </div>
                <nav className="hub-nav" aria-label="Main navigation">
                    <Link to="/projects">Projects</Link>
                    <Link className="active" to="/admin" aria-current="page">Admin</Link>
                </nav>
                <div className="header-actions">
                    <span className="admin-identity">
                        <ShieldCheck size={15} />
                        {currentUser?.username}
                    </span>
                    <button className="logout-btn" type="button" onClick={handleLogout}>
                        <LogOut size={14} /> Log out
                    </button>
                </div>
            </header>

            <main className="hub-body admin-body" id="main-content" tabIndex="-1">
                <div className="admin-title-row">
                    <div>
                        <h1>User management</h1>
                        <p>Manage account roles and review administrator changes.</p>
                    </div>
                </div>

                <div className="search-wrap admin-search">
                    <Search size={15} />
                    <input className="search-input" type="search"
                        placeholder="Search users by username"
                        aria-label="Search users by username"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)} />
                </div>

                {error && <p className="admin-feedback error" role="alert">{error}</p>}
                {message && <p className="admin-feedback success" role="status">{message}</p>}

                <section className="admin-card admin-users-card" aria-labelledby="user-management-table-heading">
                    <h2 className="sr-only" id="user-management-table-heading">User roles</h2>
                    <div className="admin-table-header admin-user-grid" aria-hidden="true">
                        <span>User</span><span>Current role</span>
                        <span>Change role</span><span>Action</span>
                    </div>
                    {filteredUsers.map((user) => {
                        const isCurrentUser = Number(user.id) === Number(currentUser?.id);
                        const hasChange = selectedRoles[user.id] !== user.role;

                        return (
                            <div className="admin-user-grid admin-user-row" key={user.id}>
                                <div>
                                    <strong>{user.username}</strong>
                                    {isCurrentUser && <small>Your account</small>}
                                </div>
                                <span className={`admin-role-badge ${user.role}`}>
                                    {user.role}
                                </span>
                                <select className="admin-role-select"
                                    aria-label={`New role for ${user.username}`}
                                    value={selectedRoles[user.id]}
                                    disabled={isCurrentUser}
                                    onChange={(event) => setSelectedRoles((roles) => ({
                                        ...roles,
                                        [user.id]: event.target.value
                                    }))}>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <button className="btn-primary admin-update-button"
                                    type="button"
                                    disabled={isCurrentUser || !hasChange || updatingUserId === user.id}
                                    onClick={() => handleRoleUpdate(user)}>
                                    {isCurrentUser ? "Your account" :
                                        updatingUserId === user.id ? "Updating..." :
                                            hasChange ? "Update role" : "No changes"}
                                </button>
                            </div>
                        );
                    })}
                    {filteredUsers.length === 0 && (
                        <p className="admin-empty">No users found.</p>
                    )}
                </section>

                <section className="admin-card admin-audit-card">
                    <h2>Admin activity</h2>
                    {auditEntries.map((entry) => (
                        <div className="audit-entry" key={entry.id}>
                            <ShieldCheck size={17} />
                            <div>
                                <p><strong>{entry.actor_username || "Deleted user"}</strong>{" "}
                                    changed <strong>{entry.target_username || "Deleted user"}</strong>{" "}
                                    from {entry.previous_role} to {entry.new_role}</p>
                                <time dateTime={entry.created_at}>
                                    {new Date(entry.created_at).toLocaleString()}
                                </time>
                            </div>
                        </div>
                    ))}
                    {auditEntries.length === 0 && (
                        <p className="admin-empty">No administrator changes yet.</p>
                    )}
                </section>
            </main>
        </div>
    );
}

export default AdminUsers;
