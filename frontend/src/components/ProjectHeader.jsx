import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";

function getInitials(username = "") {
    return username
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((name) => name[0])
        .join("")
        .toUpperCase();
}

function ProjectHeader({ currentUser, onLogout }) {
    return (
        <header className="hub-header">
            <div className="brand">
                <div className="brand-mark">DH</div>
                <span className="brand-name">Developer Team Hub</span>
            </div>

            <div className="header-actions">
                {currentUser && (
                    <div
                        className="user-identity"
                        aria-label={`Signed in as ${currentUser.username}`}
                    >
                        <span className="user-avatar" aria-hidden="true">
                            {getInitials(currentUser.username)}
                        </span>
                        <span className="user-name">{currentUser.username}</span>
                    </div>
                )}

                {currentUser?.role === "admin" && (
                    <Link className="admin-nav-link" to="/admin">
                        Admin
                    </Link>
                )}

                <button
                    className="logout-btn"
                    type="button"
                    onClick={onLogout}
                >
                    <LogOut size={14} />
                    Log out
                </button>
            </div>
        </header>
    );
}

export default ProjectHeader;
