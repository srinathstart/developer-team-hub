import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";

function ProjectHeader({ currentUserRole, onLogout }) {
    return (
        <header className="hub-header">
            <div className="brand">
                <div className="brand-mark">DH</div>
                <span className="brand-name">Developer Team Hub</span>
            </div>

            <div className="header-actions">
                {currentUserRole === "admin" && (
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
